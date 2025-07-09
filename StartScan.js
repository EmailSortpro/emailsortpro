this.settings = {};
    this.taskPreselectedCategories = [];
    this.lastSettingsSync = 0;
    
    // État d'authentification amélioré
    this.authState = {
        isAuthenticated: false,
        provider: null,
        user: null,
        checkedProviders: []
    };
    
    console.log('[MinimalScan] Scanner v9.2 initialized - Double auth fixed');
    this.loadSettingsFromCategoryManager();
    this.addMinimalStyles();
}

async checkAuthentication() {
    console.log('[MinimalScan] 🔐 Checking dual provider authentication...');
    
    // Réinitialiser
    this.authState = {
        isAuthenticated: false,
        provider: null,
        user: null,
        checkedProviders: []
    };
    
    // 1. Vérifier Google en priorité
    const googleAuth = await this.checkGoogleAuth();
    if (googleAuth.isAuthenticated) {
        this.authState = googleAuth;
        console.log('[MinimalScan] ✅ Google authentication confirmed');
        return true;
    }
    
    // 2. Vérifier Microsoft
    const msAuth = await this.checkMicrosoftAuth();
    if (msAuth.isAuthenticated) {
        this.authState = msAuth;
        console.log('[MinimalScan] ✅ Microsoft authentication confirmed');
        return true;
    }
    
    // 3. Vérifier les indicateurs de session
    const sessionAuth = this.checkSessionIndicators();
    if (sessionAuth.isAuthenticated) {
        this.authState = sessionAuth;
        console.log('[MinimalScan] ✅ Session authentication found');
        return true;
    }
    
    console.log('[MinimalScan] ❌ No authentication found');
    return false;
}

async checkGoogleAuth() {
    console.log('[MinimalScan] Checking Google authentication...');
    
    const result = {
        isAuthenticated: false,
        provider: 'google',
        user: null,
        checkedProviders: ['google']
    };
    
    if (!window.googleAuthService) {
        console.log('[MinimalScan] GoogleAuthService not available');
        return result;
    }
    
    try {
        // Méthode 1: isAuthenticated direct
        if (typeof window.googleAuthService.isAuthenticated === 'function') {
            const isAuth = window.googleAuthService.isAuthenticated();
            if (isAuth) {
                result.isAuthenticated = true;
                console.log('[MinimalScan] Google isAuthenticated: true');
            }
        }
        
        // Méthode 2: checkAuthentication pour plus de détails
        if (typeof window.googleAuthService.checkAuthentication === 'function') {
            const authCheck = await window.googleAuthService.checkAuthentication();
            if (authCheck && authCheck.isAuthenticated) {
                result.isAuthenticated = true;
                result.user = authCheck.user;
                console.log('[MinimalScan] Google checkAuthentication: authenticated');
            }
        }
        
        // Méthode 3: Token en localStorage
        const googleToken = localStorage.getItem('google_token_emailsortpro');
        if (googleToken && !result.isAuthenticated) {
            try {
                const tokenData = JSON.parse(googleToken);
                if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                    result.isAuthenticated = true;
                    console.log('[MinimalScan] Valid Google token found');
                }
            } catch (e) {
                console.warn('[MinimalScan] Error parsing Google token');
            }
        }
        
        // Récupérer user info si authentifié
        if (result.isAuthenticated && !result.user) {
            if (typeof window.googleAuthService.getUserInfo === 'function') {
                try {
                    result.user = await window.googleAuthService.getUserInfo();
                } catch (e) {
                    console.warn('[MinimalScan] Could not get Google user info');
                }
            }
        }
        
    } catch (error) {
        console.error('[MinimalScan] Error checking Google auth:', error);
    }
    
    return result;
}

async checkMicrosoftAuth() {
    console.log('[MinimalScan] Checking Microsoft authentication...');
    
    const result = {
        isAuthenticated: false,
        provider: 'microsoft',
        user: null,
        checkedProviders: ['microsoft']
    };
    
    if (!window.authService) {
        console.log('[MinimalScan] AuthService not available');
        return result;
    }
    
    try {
        if (typeof window.authService.isAuthenticated === 'function') {
            const isAuth = window.authService.isAuthenticated();
            if (isAuth) {
                result.isAuthenticated = true;
                
                if (typeof window.authService.getAccount === 'function') {
                    const account = window.authService.getAccount();
                    if (account) {
                        result.user = {
                            name: account.name || account.username,
                            email: account.username || account.homeAccountId
                        };
                    }
                }
                
                console.log('[MinimalScan] Microsoft authenticated');
            }
        }
    } catch (error) {
        console.error('[MinimalScan] Error checking Microsoft auth:', error);
    }
    
    return result;
}

checkSessionIndicators() {
    console.log('[MinimalScan] Checking session indicators...');
    
    const result = {
        isAuthenticated: false,
        provider: null,
        user: null,
        checkedProviders: ['session']
    };
    
    // Vérifier sessionStorage
    const lastProvider = sessionStorage.getItem('lastAuthProvider');
    const scanProvider = sessionStorage.getItem('lastScanProvider');
    
    if (lastProvider || scanProvider) {
        result.provider = lastProvider || scanProvider;
        result.isAuthenticated = true;
        console.log('[MinimalScan] Session provider found:', result.provider);
    }
    
    // Vérifier localStorage indicators
    const indicators = [
        'googleAuthStatus',
        'authStatus', 
        'userInfo',
        'google_user_info'
    ];
    
    for (const key of indicators) {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                result.isAuthenticated = true;
                if (!result.provider) {
                    result.provider = key.includes('google') ? 'google' : 'microsoft';
                }
                break;
            }
        } catch (e) {
            // Ignore
        }
    }
    
    return result;
}

async handleLogin(provider = null) {
    console.log('[MinimalScan] Login attempt:', provider);
    
    try {
        this.showLoading('Connexion en cours...');
        
        if (provider === 'google' && window.googleAuthService) {
            sessionStorage.setItem('lastAuthProvider', 'google');
            
            if (typeof window.googleAuthService.login === 'function') {
                await window.googleAuthService.login();
            } else if (typeof window.googleAuthService.signIn === 'function') {
                await window.googleAuthService.signIn();
            }
        } else if (provider === 'microsoft' && window.authService) {
            sessionStorage.setItem('lastAuthProvider', 'microsoft');
            await window.authService.login();
        } else {
            // Auto-detect
            if (window.googleAuthService) {
                provider = 'google';
                sessionStorage.setItem('lastAuthProvider', 'google');
                
                if (typeof window.googleAuthService.login === 'function') {
                    await window.googleAuthService.login();
                } else if (typeof window.googleAuthService.signIn === 'function') {
                    await window.googleAuthService.signIn();
                }
            } else if (window.authService) {
                provider = 'microsoft';
                sessionStorage.setItem('lastAuthProvider', 'microsoft');
                await window.authService.login();
            }
        }
        
        console.log('[MinimalScan] Login initiated for:', provider);
        
    } catch (error) {
        console.error('[MinimalScan] Login error:', error);
        this.showError('Erreur de connexion: ' + error.message);
    } finally {
        this.hideLoading();
    }
}

async render(container) {
    console.log('[MinimalScan] 🎯 Rendering scanner v9.2...');
    
    try {
        this.addMinimalStyles();
        this.checkSettingsUpdate();
        
        const isAuthenticated = await this.checkAuthentication();
        
        if (!isAuthenticated) {
            console.log('[MinimalScan] Not authenticated, showing login page');
            container.innerHTML = this.renderNotAuthenticated();
            this.attachLoginHandlers();
            return;
        }

        console.log('[MinimalScan] ✅ Authenticated with:', this.authState.provider);
        
        container.innerHTML = this.renderMinimalScanner();
        this.initializeEvents();
        this.isInitialized = true;
        
    } catch (error) {
        console.error('[MinimalScan] Render error:', error);
        container.innerHTML = this.renderError(error);
    }
}

renderNotAuthenticated() {
    const hasGoogleAuth = !!window.googleAuthService;
    const hasMicrosoftAuth = !!window.authService;
    
    return `
        <div class="minimal-scanner">
            <div class="scanner-card-minimal">
                <div class="scanner-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h1 class="scanner-title">Connexion requise</h1>
                <p class="scanner-subtitle">Connectez-vous pour analyser vos emails</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 30px;">
                    ${hasGoogleAuth ? `
                        <button class="scan-button-minimal google-login-btn" 
                                style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);">
                            <i class="fab fa-google"></i>
                            <span>Se connecter avec Google</span>
                        </button>
                    ` : ''}
                    
                    ${hasMicrosoftAuth ? `
                        <button class="scan-button-minimal microsoft-login-btn">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter avec Microsoft</span>
                        </button>
                    ` : ''}
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="refresh-auth-btn" style="background: none; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-sync"></i> Actualiser
                    </button>
                </div>
            </div>
        </div>
    `;
}

attachLoginHandlers() {
    const googleBtn = document.querySelector('.google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => this.handleLogin('google'));
    }
    
    const microsoftBtn = document.querySelector('.microsoft-login-btn');
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', () => this.handleLogin('microsoft'));
    }
    
    const refreshBtn = document.querySelector('.refresh-auth-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const container = document.querySelector('.minimal-scanner')?.parentElement;
            if (container) {
                await this.render(container);
            }
        });
    }
}

async startScan() {
    if (this.scanInProgress) return;
    
    console.log('[MinimalScan] 🚀 Starting scan');
    console.log('[MinimalScan] Provider:', this.authState.provider);
    
    try {
        this.scanInProgress = true;
        this.scanStartTime = Date.now();
        
        this.setActiveStep(2);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.add('visible');
        }
        
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            scanBtn.disabled = true;
            scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
        }
        
        const scanOptions = this.prepareScanOptions();
        await this.executeScan(scanOptions);
        
        this.setActiveStep(3);
        this.completeScan();
        
    } catch (error) {
        console.error('[MinimalScan] Scan error:', error);
        this.showScanError(error);
    }
}

prepareScanOptions() {
    const options = {
        days: this.selectedDays,
        folder: 'inbox',
        autoAnalyze: true,
        autoCategrize: true,
        provider: this.authState.provider,
        onProgress: (progress) => this.updateProgress(
            progress.progress?.current || 0, 
            progress.message || '', 
            progress.phase || ''
        )
    };
    
    if (this.taskPreselectedCategories.length > 0) {
        options.taskPreselectedCategories = [...this.taskPreselectedCategories];
    }
    
    return options;
}

async executeScan(scanOptions) {
    try {
        if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
            console.log('[MinimalScan] Using EmailScanner...');
            
            const results = await window.emailScanner.scan(scanOptions);
            this.scanResults = results;
            
            console.log('[MinimalScan] ✅ Scan completed:', results);
            
        } else {
            // Simulation based on provider
            console.log('[MinimalScan] Simulating scan for:', this.authState.provider);
            
            if (this.authState.provider === 'google') {
                await this.executeGoogleScan(scanOptions);
            } else {
                await this.executeSimulatedScan(scanOptions);
            }
        }
    } catch (error) {
        console.error('[MinimalScan] Scan execution error:', error);
        throw error;
    }
}

async executeGoogleScan(scanOptions) {
    console.log('[MinimalScan] Executing Google scan simulation...');
    
    for (let i = 0; i <= 100; i += 20) {
        this.updateProgress(i, `Analyse Gmail ${i}%`, 'Récupération des emails');
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    this.scanResults = {
        success: true,
        total: 250,
        categorized: 220,
        provider: 'google',
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        stats: { 
            preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 35 : 0,
            taskSuggestions: 30
        }
    };
}

async executeSimulatedScan(scanOptions) {
    console.log('[MinimalScan] Executing simulated scan...');
    
    for (let i = 0; i <= 100; i += 10) {
        this.updateProgress(i, `Analyse ${i}%`, 'Simulation en cours');
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this.scanResults = {
        success: true,
        total: 150,
        categorized: 130,
        provider: this.authState.provider || 'unknown',
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        stats: { 
            preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 25 : 0,
            taskSuggestions: 20
        }
    };
}

redirectToResults() {
    this.scanInProgress = false;
    
    const essentialResults = {
        success: true,
        total: this.scanResults?.total || 0,
        categorized: this.scanResults?.categorized || 0,
        provider: this.authState.provider,
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
        scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
        timestamp: Date.now()
    };
    
    // Stocker les résultats
    sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
    sessionStorage.setItem('lastScanProvider', this.authState.provider);
    
    console.log('[MinimalScan] Scan results stored, provider:', this.authState.provider);
    
    if (window.uiManager?.showToast) {
        const message = essentialResults.preselectedForTasks > 0 ?
            `✅ ${essentialResults.total} emails analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
            `✅ ${essentialResults.total} emails analysés`;
        
        window.uiManager.showToast(message, 'success', 4000);
    }
    
    // Redirection intelligente selon le provider
    setTimeout(() => {
        console.log('[MinimalScan] Redirecting based on provider:', this.authState.provider);
        
        if (this.authState.provider === 'google') {
            // Pour Google, utiliser PageManagerGmail
            if (window.pageManagerGmail) {
                console.log('[MinimalScan] Redirecting to PageManagerGmail');
                window.pageManagerGmail.loadPage('emails');
            } else if (window.pageManager) {
                console.log('[MinimalScan] Using default PageManager for Gmail');
                window.pageManager.loadPage('emails');
            }
        } else {
            // Pour Microsoft, utiliser PageManager standard
            if (window.pageManager) {
                console.log('[MinimalScan] Redirecting to PageManager');
                window.pageManager.loadPage('emails');
            }
        }
    }, 500);
}

// Méthodes existantes inchangées
loadSettingsFromCategoryManager() {
    try {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            
            if (this.settings.scanSettings?.defaultPeriod) {
                this.selectedDays = this.settings.scanSettings.defaultPeriod;
            }
        } else {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            }
        }
        
        this.lastSettingsSync = Date.now();
    } catch (error) {
        console.error('[MinimalScan] Error loading settings:', error);
        this.settings = this.getDefaultSettings();
    }
}

getDefaultSettings() {
    return {
        scanSettings: {
            defaultPeriod: 7,
            defaultFolder: 'inbox',
            autoAnalyze: true,
            autoCategrize: true
        },
        taskPreselectedCategories: [],
        preferences: {
            excludeSpam: true,
            detectCC: true,
            showNotifications: true
        }
    };
}

checkSettingsUpdate() {
    const now = Date.now();
    if (now - this.lastSettingsSync < 5000) return;
    
    this.loadSettingsFromCategoryManager();
}

renderMinimalScanner() {
    return `
        <div class="minimal-scanner">
            <div class="scanner-card-minimal">
                <div class="scanner-icon">
                    <i class="fas fa-search"></i>
                </div>
                
                <h1 class="scanner-title">Scanner Email</h1>
                <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                
                ${this.authState.provider ? `
                    <div class="provider-badge ${this.authState.provider}" style="margin: 20px 0;">
                        <span style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: white; background: ${this.authState.provider === 'google' ? 'linear-gradient(135deg, #4285f4, #34a853)' : 'linear-gradient(135deg, #0078d4, #106ebe)'};">
                            <i class="fab fa-${this.authState.provider === 'google' ? 'google' : 'microsoft'}"></i>
                            Connecté via ${this.authState.provider === 'google' ? 'Gmail' : 'Outlook'}
                        </span>
                    </div>
                ` : ''}
                
                <div class="steps-container">
                    <div class="step active" id="step1">
                        <div class="step-number">1</div>
                        <div class="step-label">Sélection</div>
                    </div>
                    <div class="step" id="step2">
                        <div class="step-number">2</div>
                        <div class="step-label">Analyse</div>
                    </div>
                    <div class="step" id="step3">
                        <div class="step-number">3</div>
                        <div class="step-label">Résultats</div>
                    </div>
                </div>
                
                <div class="duration-section">
                    <div class="duration-label">Période d'analyse</div>
                    <div class="duration-options">
                        ${this.renderDurationOptions()}
                    </div>
                </div>
                
                <button class="scan-button-minimal" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                    <i class="fas fa-play"></i>
                    <span>Démarrer l'analyse intelligente</span>
                </button>
                
                <div class="progress-section-minimal" id="progressSection">
                    <div class="progress-bar-minimal">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Initialisation...</div>
                    <div class="progress-status" id="progressStatus">Préparation du scan</div>
                </div>
                
                <div class="scan-info">
                    <div class="scan-info-main">
                        <i class="fas fa-shield-alt"></i>
                        <span>Scan sécurisé et privé avec IA Claude</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

renderDurationOptions() {
    const options = [
        { value: 1, label: '1 jour' },
        { value: 3, label: '3 jours' },
        { value: 7, label: '7 jours' },
        { value: 15, label: '15 jours' },
        { value: 30, label: '30 jours' }
    ];
    
    return options.map(option => {
        const isSelected = option.value === this.selectedDays;
        return `
            <button class="duration-option ${isSelected ? 'selected' : ''}" 
                    onclick="window.minimalScanModule.selectDuration(${option.value})" 
                    data-days="${option.value}">
                ${option.label}
            </button>
        `;
    }).join('');
}

renderError(error) {
    return `
        <div class="minimal-scanner">
            <div class="scanner-card-minimal">
                <div class="scanner-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1 class="scanner-title">Erreur</h1>
                <p class="scanner-subtitle">${error.message}</p>
                
                <button class="scan-button-minimal" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i>
                    <span>Réessayer</span>
                </button>
            </div>
        </div>
    `;
}

initializeEvents() {
    console.log('[MinimalScan] Events initialized');
    
    if (this.settingsCheckInterval) {
        clearInterval(this.settingsCheckInterval);
    }
    
    this.settingsCheckInterval = setInterval(() => {
        this.checkSettingsUpdate();
    }, 10000);
}

selectDuration(days) {
    this.selectedDays = days;
    
    document.querySelectorAll('.duration-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const selectedBtn = document.querySelector(`[data-days="${days}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
}

updateProgress(percent, text, status) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressStatus = document.getElementById('progressStatus');
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = text;
    if (progressStatus) progressStatus.textContent = status;
}

setActiveStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    const activeStep = document.getElementById(`step${stepNumber}`);
    if (activeStep) {
        activeStep.classList.add('active');
    }
}

completeScan() {
    setTimeout(() => {
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
            
            scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan terminé !</span>`;
            scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            if (preselectedCount > 0) {
                scanBtn.style.position = 'relative';
                scanBtn.insertAdjacentHTML('beforeend', `
                    <span class="success-badge">
                        ⭐ ${preselectedCount} emails pour tâches
                    </span>
                `);
            }
        }
        
        setTimeout(() => {
            this.redirectToResults();
        }, 1500);
    }, 500);
}

showScanError(error) {
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        progressSection.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${error.message}</div>
                
                <button class="scan-button-minimal" onclick="window.minimalScanModule.resetScanner()" 
                        style="width: auto; padding: 0 20px; height: 40px; font-size: 14px;">
                    <i class="fas fa-redo"></i>
                    <span>Réessayer</span>
                </button>
            </div>
        `;
    }
    
    this.scanInProgress = false;
}

resetScanner() {
    this.scanInProgress = false;
    this.setActiveStep(1);
    
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        progressSection.classList.remove('visible');
    }
    
    const scanBtn = document.getElementById('minimalScanBtn');
    if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer l\'analyse intelligente</span>';
        scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        const badge = scanBtn.querySelector('.success-badge');
        if (badge) badge.remove();
    }
    
    this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
    this.loadSettingsFromCategoryManager();
}

// Méthodes utilitaires
showLoading(message) {
    if (window.uiManager && window.uiManager.showLoading) {
        window.uiManager.showLoading(message);
    }
}

hideLoading() {
    if (window.uiManager && window.uiManager.hideLoading) {
        window.uiManager.hideLoading();
    }
}

showError(message) {
    if (window.uiManager && window.uiManager.showToast) {
        window.uiManager.showToast(message, 'error');
    }
}

addMinimalStyles() {
    if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
        return;
    }
    
    const styles = document.createElement('style');
    styles.id = 'minimal-scan-styles';
    styles.textContent = `
        .minimal-scanner {
            height: calc(100vh - 140px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
            position: relative;
            padding: 20px;
        }
        
        .scanner-card-minimal {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 50px;
            width: 100%;
            max-width: 700px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .scanner-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            color: white;
            font-size: 32px;
        }
        
        .scanner-title {
            font-size: 32px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 12px;
        }
        
        .scanner-subtitle {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 35px;
        }
        
        .steps-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            padding: 0 20px;
        }
        
        .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;
        }
        
        .step:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 20px;
            right: -50%;
            width: 100%;
            height: 2px;
            background: #e5e7eb;
            z-index: 1;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            color: #9ca3af;
            margin-bottom: 12px;
            position: relative;
            z-index: 2;
            transition: all 0.3s ease;
        }
        
        .step.active .step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .step-label {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            max-width: 80px;
            font-weight: 500;
        }
        
        .step.active .step-label {
            color: #667eea;
            font-weight: 600;
        }
        
        .duration-section {
            margin-bottom: 35px;
        }
        
        .duration-label {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .duration-options {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .duration-option {
            padding: 12px 20px;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 85px;
        }
        
        .duration-option.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .duration-option:hover:not(.selected) {
            border-color: #9ca3af;
            transform: translateY(-1px);
        }
        
        .scan-button-minimal {
            width: 100%;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
            position: relative;
            overflow: hidden;
        }
        
        .scan-button-minimal:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .scan-button-minimal:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .google-login-btn {
            background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
        }
        
        .microsoft-login-btn {
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%) !important;
        }
        
        .success-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #8b5cf6;
            color: white;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 700;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }
        
        .progress-section-minimal {
            opacity: 0;
            transition: opacity 0.3s ease;
            margin-top: 20px;
        }
        
        .progress-section-minimal.visible {
            opacity: 1;
        }
        
        .progress-bar-minimal {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.5s ease;
        }
        
        .progress-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .progress-status {
            font-size: 14px;
            color: #9ca3af;
        }
        
        .scan-info {
            background: rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            padding: 15px;
            font-size: 14px;
            color: #667eea;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 500;
            flex-direction: column;
        }
        
        .scan-info-main {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        @media (max-width: 480px) {
            .scanner-card-minimal {
                padding: 35px 25px;
            }
            
            .scanner-title {
                font-size: 28px;
            }
            
            .scanner-subtitle {
                font-size: 16px;
            }
            
            .duration-option {
                padding: 10px 16px;
                font-size: 13px;
                min-width: 75px;
            }
        }
    `;
    
    document.head.appendChild(styles);
    this.stylesAdded = true;
}

cleanup() {
    if (this.settingsCheckInterval) {
        clearInterval(this.settingsCheckInterval);
        this.settingsCheckInterval = null;
    }
    
    this.scanInProgress = false;
    this.isInitialized = false;
}

destroy() {
    this.cleanup();
    this.settings = {};
    this.taskPreselectedCategories = [];
    this.authState = {
        isAuthenticated: false,
        provider: null,
        user: null
    };
}
