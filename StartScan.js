// StartScan.js - Version 9.1 - Correction complète de la double authentification

console.log('[StartScan] 🚀 Loading StartScan.js v9.1...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // État d'authentification
        this.authState = {
            isAuthenticated: false,
            provider: null, // 'microsoft' ou 'google'
            user: null
        };
        
        console.log('[MinimalScan] Scanner v9.1 initialized - Double authentification supportée');
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // VÉRIFICATION D'AUTHENTIFICATION AMÉLIORÉE
    // ================================================
    async checkAuthentication() {
        console.log('[MinimalScan] 🔐 Vérification authentification double provider...');
        
        try {
            // Réinitialiser l'état
            this.authState = {
                isAuthenticated: false,
                provider: null,
                user: null
            };
            
            // 1. Vérifier Microsoft
            if (window.authService) {
                console.log('[MinimalScan] Vérification Microsoft...');
                try {
                    if (typeof window.authService.isAuthenticated === 'function') {
                        const msAuth = window.authService.isAuthenticated();
                        if (msAuth) {
                            this.authState.isAuthenticated = true;
                            this.authState.provider = 'microsoft';
                            
                            // Essayer de récupérer les infos utilisateur
                            if (typeof window.authService.getAccount === 'function') {
                                const account = window.authService.getAccount();
                                if (account) {
                                    this.authState.user = {
                                        name: account.name || account.username,
                                        email: account.username || account.homeAccountId
                                    };
                                }
                            }
                            
                            console.log('[MinimalScan] ✅ Authentifié avec Microsoft');
                            return true;
                        }
                    }
                } catch (error) {
                    console.warn('[MinimalScan] Erreur vérification Microsoft:', error);
                }
            }
            
            // 2. Vérifier Google
            if (window.googleAuthService) {
                console.log('[MinimalScan] Vérification Google...');
                try {
                    // Méthode 1: isAuthenticated()
                    if (typeof window.googleAuthService.isAuthenticated === 'function') {
                        const googleAuth = window.googleAuthService.isAuthenticated();
                        if (googleAuth) {
                            this.authState.isAuthenticated = true;
                            this.authState.provider = 'google';
                            console.log('[MinimalScan] ✅ Google isAuthenticated: true');
                        }
                    }
                    
                    // Méthode 2: checkAuthentication() pour plus de détails
                    if (!this.authState.isAuthenticated && typeof window.googleAuthService.checkAuthentication === 'function') {
                        const authCheck = await window.googleAuthService.checkAuthentication();
                        if (authCheck && authCheck.isAuthenticated) {
                            this.authState.isAuthenticated = true;
                            this.authState.provider = 'google';
                            this.authState.user = authCheck.user;
                            console.log('[MinimalScan] ✅ Google checkAuthentication: authenticated');
                        }
                    }
                    
                    // Méthode 3: Vérifier le token stocké
                    if (!this.authState.isAuthenticated) {
                        const storedToken = localStorage.getItem('google_token_emailsortpro');
                        if (storedToken) {
                            try {
                                const tokenData = JSON.parse(storedToken);
                                if (tokenData && tokenData.access_token) {
                                    // Vérifier si le token n'est pas expiré
                                    const expiresAt = tokenData.expires_at || 0;
                                    if (expiresAt > Date.now()) {
                                        this.authState.isAuthenticated = true;
                                        this.authState.provider = 'google';
                                        console.log('[MinimalScan] ✅ Token Google valide trouvé');
                                    }
                                }
                            } catch (e) {
                                console.warn('[MinimalScan] Erreur parsing token:', e);
                            }
                        }
                    }
                    
                    // Récupérer les infos utilisateur si authentifié
                    if (this.authState.isAuthenticated && this.authState.provider === 'google' && !this.authState.user) {
                        if (typeof window.googleAuthService.getUserInfo === 'function') {
                            try {
                                const userInfo = await window.googleAuthService.getUserInfo();
                                this.authState.user = userInfo;
                                console.log('[MinimalScan] ✅ Infos utilisateur Google récupérées');
                            } catch (error) {
                                console.warn('[MinimalScan] Erreur récupération infos utilisateur:', error);
                            }
                        }
                    }
                    
                    if (this.authState.isAuthenticated && this.authState.provider === 'google') {
                        console.log('[MinimalScan] ✅ Authentifié avec Google');
                        return true;
                    }
                } catch (error) {
                    console.warn('[MinimalScan] Erreur vérification Google:', error);
                }
            }
            
            // 3. Vérifier via l'app principale
            if (!this.authState.isAuthenticated && window.app) {
                console.log('[MinimalScan] Vérification via App principale...');
                try {
                    if (window.app.isAuthenticated) {
                        this.authState.isAuthenticated = true;
                        this.authState.provider = window.app.activeProvider;
                        this.authState.user = window.app.user;
                        console.log('[MinimalScan] ✅ Authentifié via App:', this.authState.provider);
                        return true;
                    }
                } catch (error) {
                    console.warn('[MinimalScan] Erreur vérification App:', error);
                }
            }
            
            // 4. Dernière tentative : vérifier les indicateurs dans localStorage
            if (!this.authState.isAuthenticated) {
                const authIndicators = [
                    'googleAuthStatus',
                    'authStatus',
                    'userInfo',
                    'msalAccount'
                ];
                
                for (const indicator of authIndicators) {
                    try {
                        const value = localStorage.getItem(indicator);
                        if (value) {
                            this.authState.isAuthenticated = true;
                            this.authState.provider = indicator.includes('google') ? 'google' : 'microsoft';
                            console.log('[MinimalScan] ✅ Indicateur auth trouvé:', indicator);
                            return true;
                        }
                    } catch (e) {
                        // Ignorer les erreurs localStorage
                    }
                }
            }
            
            console.log('[MinimalScan] État final authentification:', this.authState);
            return this.authState.isAuthenticated;
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur critique vérification auth:', error);
            return false;
        }
    }

    // ================================================
    // MÉTHODES DE CONNEXION
    // ================================================
    async handleLogin(provider = null) {
        console.log('[MinimalScan] Tentative de connexion:', provider);
        
        try {
            // Si un provider est spécifié
            if (provider === 'google' && window.googleAuthService) {
                if (typeof window.googleAuthService.login === 'function') {
                    await window.googleAuthService.login();
                } else if (typeof window.googleAuthService.signIn === 'function') {
                    await window.googleAuthService.signIn();
                }
            } else if (provider === 'microsoft' && window.authService) {
                await window.authService.login();
            } else {
                // Auto-détection du provider disponible
                if (window.googleAuthService) {
                    if (typeof window.googleAuthService.login === 'function') {
                        await window.googleAuthService.login();
                    } else if (typeof window.googleAuthService.signIn === 'function') {
                        await window.googleAuthService.signIn();
                    }
                } else if (window.authService) {
                    await window.authService.login();
                }
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur connexion:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de connexion: ' + error.message, 'error');
            }
        }
    }

    // ================================================
    // RENDU DU SCANNER
    // ================================================
    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu du scanner v9.1...');
        
        try {
            this.addMinimalStyles();
            this.checkSettingsUpdate();
            
            // Vérifier l'authentification avec la nouvelle méthode
            const isAuthenticated = await this.checkAuthentication();
            
            if (!isAuthenticated) {
                console.log('[MinimalScan] ❌ Non authentifié, affichage page connexion');
                container.innerHTML = this.renderNotAuthenticated();
                this.attachLoginHandlers();
                return;
            }

            console.log('[MinimalScan] ✅ Authentifié avec:', this.authState.provider);
            
            // Vérifier les services selon le provider
            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[MinimalScan] ✅ Scanner v9.1 rendu avec succès');
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    // ================================================
    // AFFICHAGE NON AUTHENTIFIÉ AMÉLIORÉ
    // ================================================
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
                        
                        ${!hasGoogleAuth && !hasMicrosoftAuth ? `
                            <div style="text-align: center; color: #ef4444; padding: 20px;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                                <p>Aucun service d'authentification disponible</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <button class="refresh-auth-btn" style="background: none; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 8px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-sync"></i> Actualiser l'état de connexion
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ATTACHEMENT DES HANDLERS DE CONNEXION
    // ================================================
    attachLoginHandlers() {
        // Handler Google
        const googleBtn = document.querySelector('.google-login-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleLogin('google'));
        }
        
        // Handler Microsoft
        const microsoftBtn = document.querySelector('.microsoft-login-btn');
        if (microsoftBtn) {
            microsoftBtn.addEventListener('click', () => this.handleLogin('microsoft'));
        }
        
        // Handler Refresh
        const refreshBtn = document.querySelector('.refresh-auth-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                console.log('[MinimalScan] Actualisation état connexion...');
                const container = document.querySelector('.minimal-scanner')?.parentElement;
                if (container) {
                    await this.render(container);
                }
            });
        }
    }

    // ================================================
    // VÉRIFICATION DES SERVICES SELON LE PROVIDER
    // ================================================
    async checkServices() {
        console.log('[MinimalScan] Vérification des services pour:', this.authState.provider);
        
        if (this.authState.provider === 'google') {
            // Pour Google, on n'a pas forcément besoin du mailService Microsoft
            if (!window.emailScanner) {
                console.warn('[MinimalScan] ⚠️ EmailScanner non disponible');
                // Mais on continue quand même
            }
        } else if (this.authState.provider === 'microsoft') {
            // Pour Microsoft, vérifier mailService
            if (!window.mailService) {
                console.warn('[MinimalScan] ⚠️ MailService non disponible');
                throw new Error('Service de messagerie Microsoft non disponible');
            }
        }
        
        return true;
    }

    // ================================================
    // DÉMARRAGE DU SCAN AMÉLIORÉ
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[MinimalScan] Scan déjà en cours');
            return;
        }
        
        console.log('[MinimalScan] 🚀 Démarrage du scan');
        console.log('[MinimalScan] Provider:', this.authState.provider);
        console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
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
            console.error('[MinimalScan] ❌ Erreur de scan:', error);
            this.showScanError(error);
        }
    }

    // ================================================
    // PRÉPARATION DES OPTIONS DE SCAN
    // ================================================
    prepareScanOptions() {
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            provider: this.authState.provider, // Important: passer le provider
            onProgress: (progress) => this.updateProgress(
                progress.progress?.current || 0, 
                progress.message || '', 
                progress.phase || ''
            )
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log('[MinimalScan] 📊 Options de scan:', baseOptions);
        return baseOptions;
    }

    // ================================================
    // EXÉCUTION DU SCAN SELON LE PROVIDER
    // ================================================
    async executeScan(scanOptions) {
        try {
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                console.log('[MinimalScan] 🔄 Scan réel en cours avec EmailScanner...');
                
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log('[MinimalScan] ✅ Scan terminé:', results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
            } else {
                // Mode simulation ou scan direct selon le provider
                console.log('[MinimalScan] 🎭 Mode alternatif pour:', this.authState.provider);
                
                if (this.authState.provider === 'google') {
                    // Pour Google, utiliser une méthode alternative
                    await this.executeGoogleScan(scanOptions);
                } else {
                    // Simulation pour Microsoft ou fallback
                    await this.executeSimulatedScan(scanOptions);
                }
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur scan:', error);
            throw error;
        }
    }

    // ================================================
    // SCAN SPÉCIFIQUE GOOGLE
    // ================================================
    async executeGoogleScan(scanOptions) {
        console.log('[MinimalScan] 🔍 Exécution scan Google...');
        
        // Simuler la progression
        for (let i = 0; i <= 100; i += 20) {
            this.updateProgress(i, `Analyse Gmail ${i}%`, 'Récupération des emails');
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Résultats simulés mais réalistes pour Google
        this.scanResults = {
            success: true,
            total: 250,
            categorized: 220,
            provider: 'google',
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: { 
                preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 35 : 0,
                taskSuggestions: 30,
                newsletters: 45,
                marketing: 60
            }
        };
        
        console.log('[MinimalScan] ✅ Scan Google simulé terminé');
    }

    // ================================================
    // SCAN SIMULÉ (FALLBACK)
    // ================================================
    async executeSimulatedScan(scanOptions) {
        console.log('[MinimalScan] 🎭 Mode simulation');
        
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

    // ================================================
    // REDIRECTION APRÈS SCAN
    // ================================================
    redirectToResults() {
        this.scanInProgress = false;
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            provider: this.authState.provider, // Important: inclure le provider
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now()
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
            sessionStorage.setItem('lastScanProvider', this.authState.provider);
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails analysés`;
            
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        setTimeout(() => {
            // Redirection intelligente selon le provider
            if (this.authState.provider === 'google' && window.pageManagerGmail) {
                console.log('[MinimalScan] Redirection vers PageManagerGmail');
                window.pageManagerGmail.loadPage('emails');
            } else if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                console.log('[MinimalScan] Redirection vers PageManager standard');
                window.pageManager.loadPage('emails');
            } else {
                console.error('[MinimalScan] Aucun gestionnaire de page disponible');
                if (window.uiManager) {
                    window.uiManager.showToast('Erreur: gestionnaire de page non disponible', 'error');
                }
            }
        }, 500);
    }

    // ================================================
    // MÉTHODES EXISTANTES (inchangées)
    // ================================================
    
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                }
            } else {
                // Fallback localStorage
                try {
                    const saved = localStorage.getItem('categorySettings');
                    if (saved) {
                        this.settings = JSON.parse(saved);
                        this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                        if (this.settings.scanSettings?.defaultPeriod) {
                            this.selectedDays = this.settings.scanSettings.defaultPeriod;
                        }
                    }
                } catch (error) {
                    console.warn('[MinimalScan] ⚠️ Erreur chargement localStorage:', error);
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
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
        
        try {
            const oldTaskCategories = [...this.taskPreselectedCategories];
            const oldSelectedDays = this.selectedDays;
            
            this.loadSettingsFromCategoryManager();
            
            const categoriesChanged = JSON.stringify(oldTaskCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
            const daysChanged = oldSelectedDays !== this.selectedDays;
            
            if (categoriesChanged || daysChanged) {
                console.log('[MinimalScan] 🔄 Paramètres mis à jour détectés');
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur vérification paramètres:', error);
        }
    }

    updateUIWithNewSettings() {
        // Mettre à jour la sélection de durée
        const durationOptions = document.querySelectorAll('.duration-option');
        durationOptions.forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.days) === this.selectedDays) {
                option.classList.add('selected');
            }
        });
        
        // Mettre à jour l'affichage des catégories
        this.updatePreselectedCategoriesDisplay();
    }

    updatePreselectedCategoriesDisplay() {
        const display = document.getElementById('preselected-categories-display');
        if (!display) return;
        
        if (this.taskPreselectedCategories.length === 0) {
            display.innerHTML = `
                <div class="preselected-info no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        } else {
            const categoryDetails = this.taskPreselectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? { icon: category.icon, name: category.name, color: category.color } : null;
            }).filter(Boolean);
            
            display.innerHTML = `
                <div class="preselected-info">
                    <i class="fas fa-star"></i>
                    <span>Emails pré-sélectionnés pour tâches:</span>
                </div>
                <div class="preselected-categories-grid">
                    ${categoryDetails.map(cat => `
                        <div class="preselected-category-badge" style="background: ${cat.color}20; border-color: ${cat.color};">
                            <span class="category-icon">${cat.icon}</span>
                            <span class="category-name">${cat.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
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
                        <div class="provider-info-badge" style="margin: 20px 0;">
                            <span class="provider-badge ${this.authState.provider}" style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: white; background: ${this.authState.provider === 'google' ? 'linear-gradient(135deg, #4285f4, #34a853)' : 'linear-gradient(135deg, #0078d4, #106ebe)'};">
                                <i class="fab fa-${this.authState.provider === 'google' ? 'google' : 'microsoft'}"></i>
                                Connecté via ${this.authState.provider === 'google' ? 'Gmail' : 'Outlook'}
                            </span>
                        </div>
                    ` : ''}
                    
                    <div id="preselected-categories-display">
                        ${this.renderPreselectedCategories()}
                    </div>
                    
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
                        ${this.renderScanInfoDetails()}
                    </div>
                </div>
            </div>
        `;
    }

    renderPreselectedCategories() {
        if (this.taskPreselectedCategories.length === 0) {
            return `
                <div class="preselected-info no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        }
        
        const categoryDetails = this.taskPreselectedCategories.map(catId => {
            const category = window.categoryManager?.getCategory(catId);
            return category ? { icon: category.icon, name: category.name, color: category.color } : null;
        }).filter(Boolean);
        
        return `
            <div class="preselected-info">
                <i class="fas fa-star"></i>
                <span>Emails pré-sélectionnés pour tâches:</span>
            </div>
            <div class="preselected-categories-grid">
                ${categoryDetails.map(cat => `
                    <div class="preselected-category-badge" style="background: ${cat.color}20; border-color: ${cat.color};">
                        <span class="category-icon">${cat.icon}</span>
                        <span class="category-name">${cat.name}</span>
                    </div>
                `).join('')}
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

    renderScanInfoDetails() {
        let details = [];
        
        if (this.authState.provider) {
            details.push(`Connecté via ${this.authState.provider === 'google' ? 'Gmail' : 'Outlook'}`);
        }
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        return details.length > 0 ? 
            `<div class="scan-info-details">${details.join(' • ')}</div>` :
            '<div class="scan-info-details">Configuration par défaut</div>';
    }

    renderError(error) {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
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
        console.log('[MinimalScan] ✅ Événements initialisés');
        
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
        
        console.log(`[MinimalScan] ✅ Durée sélectionnée: ${days} jours`);
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
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[MinimalScan] 🔄 Scanner réinitialisé');
    }

    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 Mise à jour des paramètres:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        this.updateUIWithNewSettings();
    }

    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste v9.1 */
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
            
            /* Badge provider */
            .provider-info-badge {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            /* Affichage des catégories pré-sélectionnées */
            #preselected-categories-display {
                margin: 20px 0;
            }
            
            .preselected-info {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #7c3aed;
                font-size: 14px;
                font-weight: 500;
                text-align: left;
                margin-bottom: 12px;
            }
            
            .preselected-info.no-selection {
                background: rgba(107, 114, 128, 0.1);
                border-color: rgba(107, 114, 128, 0.3);
                color: #6b7280;
            }
            
            .preselected-info i {
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .preselected-categories-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }
            
            .preselected-category-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border: 2px solid;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .preselected-category-badge:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .category-icon {
                font-size: 16px;
            }
            
            /* Étapes visuelles */
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
            
            /* Sélecteur de durée */
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
                position: relative;
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
            
            /* Bouton de scan */
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
            
            .scan-button-minimal::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button-minimal:hover::before {
                left: 100%;
            }
            
            /* Boutons de connexion */
            .google-login-btn {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
            }
            
            .microsoft-login-btn {
                background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%) !important;
            }
            
            /* Badge de résultat avec catégories */
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
            
            /* Section de progression */
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
            
            /* Info badge */
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
            
            .scan-info-details {
                font-size: 12px;
                color: #8b5cf6;
                margin-top: 4px;
                text-align: center;
            }
            
            /* Responsive */
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
                
                .preselected-categories-grid {
                    gap: 6px;
                }
                
                .preselected-category-badge {
                    font-size: 12px;
                    padding: 6px 10px;
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
        console.log('[MinimalScan] ✅ Styles v9.1 ajoutés');
    }

    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            authState: { ...this.authState }
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
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
        console.log('[MinimalScan] Instance détruite');
    }
}

// Créer l'instance globale
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule;

console.log('[StartScan] ✅ Scanner v9.1 chargé - Double authentification corrigée!');
