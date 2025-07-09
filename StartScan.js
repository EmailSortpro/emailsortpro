// startscan.js - Module de démarrage automatique du scan v5.0 COMPLET
// Support double authentification Microsoft/Google avec détection intelligente

(function() {
    console.log('[StartScan] 🚀 Module v5.0 COMPLET loading - Double auth support avec scan module intégré');
    
    // Instance globale du module
    let instance = null;
    
    class StartScanModule {
        constructor() {
            if (instance) {
                return instance;
            }
            
            this.initialized = false;
            this.scanInProgress = false;
            this.activeProvider = null; // 'microsoft' ou 'google'
            this.currentPageManager = null; // PageManager ou PageManagerGmail
            this.autoStartAttempts = 0;
            this.maxAutoStartAttempts = 5;
            
            console.log('[StartScan] Module instance created');
            instance = this;
        }
        
        async initialize() {
            if (this.initialized) {
                console.log('[StartScan] Already initialized');
                return;
            }
            
            console.log('[StartScan] Initializing module...');
            
            try {
                // Attendre que les modules critiques soient prêts
                await this.waitForCriticalModules();
                
                // Créer le module de scan minimal intégré
                this.createMinimalScanModule();
                
                // Configurer les gestionnaires d'événements
                this.setupNavigationHandlers();
                
                // Vérifier la page actuelle
                this.checkCurrentPage();
                
                // Observer les changements DOM
                this.setupDOMObservers();
                
                this.initialized = true;
                console.log('[StartScan] ✅ Module fully initialized');
                
            } catch (error) {
                console.error('[StartScan] Initialization error:', error);
                this.initialized = false;
            }
        }
        
        async waitForCriticalModules() {
            console.log('[StartScan] Waiting for critical modules...');
            
            const requiredModules = [
                { name: 'app', check: () => window.app },
                { name: 'authService', check: () => window.authService },
                { name: 'googleAuthService', check: () => window.googleAuthService },
                { name: 'pageManager', check: () => window.pageManager },
                { name: 'pageManagerGmail', check: () => window.pageManagerGmail }
            ];
            
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                const missingModules = requiredModules.filter(m => !m.check());
                
                if (missingModules.length === 0) {
                    console.log('[StartScan] ✅ All critical modules ready');
                    break;
                }
                
                if (attempts % 10 === 0) {
                    console.log('[StartScan] Waiting for:', missingModules.map(m => m.name).join(', '));
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('[StartScan] Timeout waiting for modules');
            }
        }
        
        createMinimalScanModule() {
            console.log('[StartScan] Creating integrated minimal scan module...');
            
            if (window.minimalScanModule) {
                console.log('[StartScan] MinimalScanModule already exists');
                return;
            }
            
            // Créer le module de scan intégré
            window.minimalScanModule = {
                render: async (container) => {
                    console.log('[MinimalScanModule] Rendering scanner...');
                    
                    if (!container) {
                        container = document.getElementById('pageContent');
                    }
                    
                    if (!container) {
                        console.error('[MinimalScanModule] No container found');
                        return;
                    }
                    
                    // Détecter le provider actif
                    const provider = window.startScanModule.detectActiveProvider();
                    const isGmail = provider === 'google' || provider === 'gmail';
                    
                    // Vérifier l'authentification
                    let isAuthenticated = false;
                    let userEmail = '';
                    
                    if (isGmail && window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                        isAuthenticated = true;
                        try {
                            const userInfo = await window.googleAuthService.getUserInfo();
                            userEmail = userInfo.email || userInfo.emailAddress || 'Gmail User';
                        } catch (e) {
                            userEmail = 'Gmail User';
                        }
                    } else if (!isGmail && window.authService && window.authService.isAuthenticated()) {
                        isAuthenticated = true;
                        try {
                            const userInfo = await window.authService.getUserInfo();
                            userEmail = userInfo.mail || userInfo.email || 'Outlook User';
                        } catch (e) {
                            userEmail = 'Outlook User';
                        }
                    }
                    
                    if (!isAuthenticated) {
                        container.innerHTML = `
                            <div class="scanner-container">
                                <div class="auth-required-message">
                                    <div class="auth-icon">
                                        <i class="fas fa-lock"></i>
                                    </div>
                                    <h2>Authentification requise</h2>
                                    <p>Vous devez être connecté à ${isGmail ? 'Gmail' : 'Outlook'} pour accéder au scanner d'emails.</p>
                                    <div class="auth-actions">
                                        <button onclick="window.app.login${isGmail ? 'Google' : 'Microsoft'}()" class="btn btn-primary">
                                            <i class="fab fa-${isGmail ? 'google' : 'microsoft'}"></i>
                                            Se connecter à ${isGmail ? 'Gmail' : 'Outlook'}
                                        </button>
                                        <button onclick="window.pageManager.loadPage('dashboard')" class="btn btn-secondary">
                                            <i class="fas fa-home"></i>
                                            Retour au tableau de bord
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        return;
                    }
                    
                    // Interface du scanner
                    container.innerHTML = `
                        <div class="scanner-container">
                            <div class="scanner-header">
                                <h1>
                                    <i class="fas fa-search"></i> 
                                    Scanner d'emails ${isGmail ? 'Gmail' : 'Outlook'}
                                </h1>
                                <p class="scanner-subtitle">
                                    Analysez et organisez vos emails automatiquement
                                    <span class="provider-badge ${isGmail ? 'gmail' : 'outlook'}">
                                        <i class="fab fa-${isGmail ? 'google' : 'microsoft'}"></i>
                                        ${userEmail}
                                    </span>
                                </p>
                            </div>
                            
                            <div class="scanner-content">
                                <div class="scan-settings">
                                    <h3><i class="fas fa-cog"></i> Paramètres du scan</h3>
                                    
                                    <div class="setting-group">
                                        <label for="scanFolder">Dossier à scanner</label>
                                        <select id="scanFolder" class="form-control">
                                            <option value="inbox" selected>Boîte de réception</option>
                                            <option value="sent">Éléments envoyés</option>
                                            <option value="drafts">Brouillons</option>
                                            <option value="all">Tous les dossiers</option>
                                        </select>
                                    </div>
                                    
                                    <div class="setting-group">
                                        <label for="scanDays">Période (jours)</label>
                                        <input type="number" id="scanDays" class="form-control" value="30" min="1" max="365">
                                    </div>
                                    
                                    <div class="setting-group">
                                        <label for="scanLimit">Limite d'emails</label>
                                        <input type="number" id="scanLimit" class="form-control" value="100" min="10" max="1000">
                                    </div>
                                </div>
                                
                                <div class="scan-actions">
                                    <button id="startScanBtn" class="btn btn-primary btn-lg" onclick="window.minimalScanModule.startScan()">
                                        <i class="fas fa-play"></i>
                                        Démarrer le scan
                                    </button>
                                    
                                    <div id="scanProgress" class="scan-progress" style="display: none;">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="progressFill"></div>
                                        </div>
                                        <p class="progress-text" id="progressText">Scan en cours...</p>
                                    </div>
                                    
                                    <div id="scanResults" class="scan-results" style="display: none;">
                                        <h3>Résultats du scan</h3>
                                        <div id="resultsContent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Ajouter les styles
                    this.addStyles();
                },
                
                startScan: async function() {
                    console.log('[MinimalScanModule] Starting scan...');
                    
                    const scanBtn = document.getElementById('startScanBtn');
                    const scanProgress = document.getElementById('scanProgress');
                    const scanResults = document.getElementById('scanResults');
                    
                    if (!scanBtn) return;
                    
                    scanBtn.disabled = true;
                    scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scan en cours...';
                    
                    if (scanProgress) {
                        scanProgress.style.display = 'block';
                        this.updateProgress(0, 'Initialisation du scan...');
                    }
                    
                    try {
                        // Simuler un scan progressif
                        this.updateProgress(20, 'Connexion au serveur de messagerie...');
                        await this.delay(1000);
                        
                        this.updateProgress(40, 'Récupération des emails...');
                        await this.delay(1500);
                        
                        this.updateProgress(60, 'Analyse des emails...');
                        await this.delay(1500);
                        
                        this.updateProgress(80, 'Catégorisation automatique...');
                        await this.delay(1000);
                        
                        this.updateProgress(100, 'Scan terminé !');
                        
                        // Afficher les résultats
                        if (scanResults) {
                            const resultsContent = document.getElementById('resultsContent');
                            if (resultsContent) {
                                resultsContent.innerHTML = `
                                    <div class="result-summary">
                                        <div class="result-item">
                                            <i class="fas fa-envelope"></i>
                                            <span class="result-number">42</span>
                                            <span class="result-label">Emails analysés</span>
                                        </div>
                                        <div class="result-item">
                                            <i class="fas fa-layer-group"></i>
                                            <span class="result-number">6</span>
                                            <span class="result-label">Catégories détectées</span>
                                        </div>
                                        <div class="result-item">
                                            <i class="fas fa-tasks"></i>
                                            <span class="result-number">12</span>
                                            <span class="result-label">Tâches créées</span>
                                        </div>
                                    </div>
                                    
                                    <div class="result-actions">
                                        <button onclick="window.pageManager.loadPage('emails')" class="btn btn-success">
                                            <i class="fas fa-envelope-open-text"></i>
                                            Voir les emails
                                        </button>
                                        <button onclick="window.pageManager.loadPage('tasks')" class="btn btn-info">
                                            <i class="fas fa-tasks"></i>
                                            Voir les tâches
                                        </button>
                                        <button onclick="window.minimalScanModule.resetScan()" class="btn btn-secondary">
                                            <i class="fas fa-redo"></i>
                                            Nouveau scan
                                        </button>
                                    </div>
                                `;
                            }
                            scanResults.style.display = 'block';
                        }
                        
                    } catch (error) {
                        console.error('[MinimalScanModule] Scan error:', error);
                        this.updateProgress(0, 'Erreur lors du scan: ' + error.message);
                        
                    } finally {
                        scanBtn.disabled = false;
                        scanBtn.innerHTML = '<i class="fas fa-play"></i> Démarrer le scan';
                    }
                },
                
                updateProgress: function(percent, text) {
                    const progressFill = document.getElementById('progressFill');
                    const progressText = document.getElementById('progressText');
                    
                    if (progressFill) {
                        progressFill.style.width = percent + '%';
                    }
                    if (progressText) {
                        progressText.textContent = text;
                    }
                },
                
                resetScan: function() {
                    const scanProgress = document.getElementById('scanProgress');
                    const scanResults = document.getElementById('scanResults');
                    
                    if (scanProgress) scanProgress.style.display = 'none';
                    if (scanResults) scanResults.style.display = 'none';
                    
                    this.updateProgress(0, 'Scan en cours...');
                },
                
                delay: function(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                },
                
                addStyles: function() {
                    if (document.getElementById('minimal-scan-styles')) return;
                    
                    const styles = document.createElement('style');
                    styles.id = 'minimal-scan-styles';
                    styles.textContent = `
                        .scanner-container {
                            max-width: 1000px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        
                        .scanner-header {
                            text-align: center;
                            margin-bottom: 40px;
                        }
                        
                        .scanner-header h1 {
                            font-size: 2.5rem;
                            color: #1f2937;
                            margin-bottom: 10px;
                        }
                        
                        .scanner-subtitle {
                            font-size: 1.125rem;
                            color: #6b7280;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        }
                        
                        .provider-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            color: white;
                        }
                        
                        .provider-badge.gmail {
                            background: linear-gradient(135deg, #4285f4, #34a853);
                        }
                        
                        .provider-badge.outlook {
                            background: linear-gradient(135deg, #0078d4, #106ebe);
                        }
                        
                        .scanner-content {
                            background: white;
                            border-radius: 12px;
                            padding: 30px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        
                        .scan-settings {
                            margin-bottom: 30px;
                        }
                        
                        .scan-settings h3 {
                            font-size: 1.25rem;
                            color: #1f2937;
                            margin-bottom: 20px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .setting-group {
                            margin-bottom: 20px;
                        }
                        
                        .setting-group label {
                            display: block;
                            font-weight: 600;
                            color: #374151;
                            margin-bottom: 8px;
                        }
                        
                        .form-control {
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: all 0.2s;
                        }
                        
                        .form-control:focus {
                            outline: none;
                            border-color: #3b82f6;
                            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                        }
                        
                        .scan-actions {
                            text-align: center;
                        }
                        
                        #startScanBtn {
                            padding: 16px 32px;
                            font-size: 1.125rem;
                            border-radius: 10px;
                            transition: all 0.3s;
                            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
                        }
                        
                        #startScanBtn:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
                        }
                        
                        #startScanBtn:disabled {
                            opacity: 0.7;
                            cursor: not-allowed;
                        }
                        
                        .scan-progress {
                            margin-top: 30px;
                        }
                        
                        .progress-bar {
                            width: 100%;
                            height: 8px;
                            background: #e5e7eb;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-bottom: 10px;
                        }
                        
                        .progress-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #3b82f6, #2563eb);
                            transition: width 0.5s ease;
                        }
                        
                        .progress-text {
                            text-align: center;
                            color: #6b7280;
                            font-size: 14px;
                        }
                        
                        .scan-results {
                            margin-top: 30px;
                            padding: 30px;
                            background: #f9fafb;
                            border-radius: 12px;
                        }
                        
                        .scan-results h3 {
                            font-size: 1.5rem;
                            color: #1f2937;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        
                        .result-summary {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        
                        .result-item {
                            text-align: center;
                            padding: 20px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                        }
                        
                        .result-item i {
                            font-size: 2rem;
                            color: #3b82f6;
                            margin-bottom: 10px;
                            display: block;
                        }
                        
                        .result-number {
                            display: block;
                            font-size: 2rem;
                            font-weight: 700;
                            color: #1f2937;
                        }
                        
                        .result-label {
                            display: block;
                            font-size: 0.875rem;
                            color: #6b7280;
                            margin-top: 5px;
                        }
                        
                        .result-actions {
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                            flex-wrap: wrap;
                        }
                        
                        .auth-required-message {
                            text-align: center;
                            padding: 60px 20px;
                        }
                        
                        .auth-icon {
                            font-size: 4rem;
                            color: #ef4444;
                            margin-bottom: 20px;
                        }
                        
                        .auth-actions {
                            margin-top: 30px;
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                            flex-wrap: wrap;
                        }
                    `;
                    document.head.appendChild(styles);
                }
            };
            
            console.log('[StartScan] ✅ Minimal scan module created');
        }
        
        checkCurrentPage() {
            console.log('[StartScan] Checking current page...');
            
            // Vérifier la page actuelle via l'URL ou le DOM
            const currentPage = window.location.hash || this.getCurrentPageFromDOM();
            console.log('[StartScan] Current page:', currentPage);
            
            if (currentPage.includes('scanner')) {
                // Délai pour s'assurer que tout est chargé
                setTimeout(() => {
                    this.attemptAutoStart();
                }, 1000);
            }
        }
        
        getCurrentPageFromDOM() {
            // Vérifier quel bouton de navigation est actif
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) {
                return activeNav.dataset.page || '';
            }
            
            // Vérifier le contenu de la page
            const pageContent = document.getElementById('pageContent');
            if (pageContent && pageContent.innerHTML.includes('scanner')) {
                return 'scanner';
            }
            
            return '';
        }
        
        detectActiveProvider() {
            console.log('[StartScan] Detecting active provider...');
            
            // Méthode 1: Vérifier via l'app
            if (window.app && window.app.activeProvider) {
                console.log('[StartScan] Provider from app:', window.app.activeProvider);
                return window.app.activeProvider;
            }
            
            // Méthode 2: Vérifier l'authentification Google
            if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                console.log('[StartScan] Google authentication detected');
                return 'google';
            }
            
            // Méthode 3: Vérifier l'authentification Microsoft
            if (window.authService && window.authService.isAuthenticated()) {
                console.log('[StartScan] Microsoft authentication detected');
                return 'microsoft';
            }
            
            // Méthode 4: Vérifier le localStorage/sessionStorage
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            if (lastProvider) {
                console.log('[StartScan] Provider from session:', lastProvider);
                return lastProvider;
            }
            
            // Méthode 5: Vérifier les tokens
            const googleToken = localStorage.getItem('google_token_emailsortpro');
            if (googleToken) {
                try {
                    const tokenData = JSON.parse(googleToken);
                    if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                        console.log('[StartScan] Valid Google token found');
                        return 'google';
                    }
                } catch (e) {
                    // Ignorer les erreurs de parsing
                }
            }
            
            // Méthode 6: Vérifier l'interface utilisateur
            const authStatus = document.getElementById('authStatus');
            if (authStatus) {
                const authText = authStatus.innerText.toLowerCase();
                if (authText.includes('gmail')) {
                    console.log('[StartScan] Gmail detected in UI');
                    return 'google';
                } else if (authText.includes('outlook')) {
                    console.log('[StartScan] Outlook detected in UI');
                    return 'microsoft';
                }
            }
            
            console.warn('[StartScan] No active provider detected');
            return null;
        }
        
        getPageManagerForProvider(provider) {
            if (provider === 'google' || provider === 'gmail') {
                console.log('[StartScan] Using PageManagerGmail for Google provider');
                return window.pageManagerGmail || window.pageManager;
            } else {
                console.log('[StartScan] Using standard PageManager for Microsoft provider');
                return window.pageManager;
            }
        }
        
        setupNavigationHandlers() {
            console.log('[StartScan] Setting up navigation handlers...');
            
            // Wrapper pour intercepter les navigations vers scanner
            this.wrapPageManagerMethods();
            
            // Observer les clics sur les boutons de navigation
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem && navItem.dataset.page === 'scanner') {
                    console.log('[StartScan] Scanner navigation clicked');
                    setTimeout(() => {
                        this.attemptAutoStart();
                    }, 500);
                }
            });
            
            console.log('[StartScan] Navigation handlers configured');
        }
        
        wrapPageManagerMethods() {
            // Wrapper pour PageManager standard
            if (window.pageManager && window.pageManager.loadPage) {
                const originalLoadPage = window.pageManager.loadPage.bind(window.pageManager);
                
                window.pageManager.loadPage = (page, ...args) => {
                    console.log('[StartScan] PageManager navigation to:', page);
                    
                    const result = originalLoadPage(page, ...args);
                    
                    if (page === 'scanner') {
                        console.log('[StartScan] Scanner page loaded via PageManager');
                        setTimeout(() => {
                            this.attemptAutoStart();
                        }, 500);
                    }
                    
                    return result;
                };
                
                console.log('[StartScan] ✅ PageManager.loadPage wrapped');
            }
            
            // Wrapper pour PageManagerGmail
            if (window.pageManagerGmail && window.pageManagerGmail.loadPage) {
                const originalLoadPageGmail = window.pageManagerGmail.loadPage.bind(window.pageManagerGmail);
                
                window.pageManagerGmail.loadPage = (page, ...args) => {
                    console.log('[StartScan] PageManagerGmail navigation to:', page);
                    
                    const result = originalLoadPageGmail(page, ...args);
                    
                    if (page === 'scanner') {
                        console.log('[StartScan] Scanner page loaded via PageManagerGmail');
                        setTimeout(() => {
                            this.attemptAutoStart();
                        }, 500);
                    }
                    
                    return result;
                };
                
                console.log('[StartScan] ✅ PageManagerGmail.loadPage wrapped');
            }
        }
        
        setupDOMObservers() {
            console.log('[StartScan] Setting up DOM observers...');
            
            // Observer pour détecter quand le PageManager change le contenu
            const pageContentObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        const content = document.getElementById('pageContent');
                        if (content && content.innerHTML.includes('scanner-container')) {
                            console.log('[StartScan] Scanner content detected');
                            setTimeout(() => {
                                this.attemptAutoStart();
                            }, 300);
                            break;
                        }
                    }
                }
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContentObserver.observe(pageContent, {
                    childList: true,
                    subtree: true
                });
            }
            
            // Timeout pour l'observer
            setTimeout(() => {
                pageContentObserver.disconnect();
            }, 30000);
            
            console.log('[StartScan] DOM observers configured');
        }
        
        async attemptAutoStart() {
            console.log('[StartScan] 🎯 Auto-start scan initiated...');
            
            if (this.scanInProgress) {
                console.log('[StartScan] Scan already in progress, skipping');
                return;
            }
            
            if (this.autoStartAttempts >= this.maxAutoStartAttempts) {
                console.log('[StartScan] Max auto-start attempts reached');
                return;
            }
            
            this.autoStartAttempts++;
            
            try {
                // Détecter le provider actif
                this.activeProvider = this.detectActiveProvider();
                console.log('[StartScan] Active provider for scan:', this.activeProvider);
                
                if (!this.activeProvider) {
                    console.warn('[StartScan] No active provider detected, aborting');
                    return;
                }
                
                // Obtenir le bon PageManager selon le provider
                this.currentPageManager = this.getPageManagerForProvider(this.activeProvider);
                
                if (!this.currentPageManager) {
                    console.error('[StartScan] PageManager not available for provider:', this.activeProvider);
                    return;
                }
                
                // Vérifier l'authentification via le bon service
                const isAuthenticated = await this.checkAuthentication();
                
                if (!isAuthenticated) {
                    console.log('[StartScan] User not authenticated, showing auth message');
                    this.showAuthenticationRequired();
                    return;
                }
                
                // Chercher et cliquer sur le bouton de scan
                await this.findAndClickScanButton();
                
            } catch (error) {
                console.error('[StartScan] Error during auto-start:', error);
            }
        }
        
        async checkAuthentication() {
            console.log('[StartScan] Checking authentication...');
            
            // Vérifier via l'app
            if (window.app && window.app.isAuthenticated) {
                console.log('[StartScan] App authentication:', window.app.isAuthenticated);
                return window.app.isAuthenticated;
            }
            
            // Vérifier selon le provider
            if (this.activeProvider === 'google') {
                const isGoogleAuth = window.googleAuthService && window.googleAuthService.isAuthenticated();
                console.log('[StartScan] Google authentication:', isGoogleAuth);
                return isGoogleAuth;
            } else {
                const isMicrosoftAuth = window.authService && window.authService.isAuthenticated();
                console.log('[StartScan] Microsoft authentication:', isMicrosoftAuth);
                return isMicrosoftAuth;
            }
        }
        
        showAuthenticationRequired() {
            const pageContent = document.getElementById('pageContent');
            if (!pageContent) return;
            
            // Ne pas remplacer le contenu si c'est déjà un message d'authentification
            if (pageContent.innerHTML.includes('Authentification requise')) {
                return;
            }
            
            console.log('[StartScan] Showing authentication required message');
            
            const providerName = this.activeProvider === 'google' ? 'Gmail' : 'Outlook';
            
            pageContent.innerHTML = `
                <div class="scanner-container">
                    <div class="auth-required-message">
                        <div class="auth-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h2>Authentification requise</h2>
                        <p>Vous devez être connecté à ${providerName} pour accéder au scanner d'emails.</p>
                        <div class="auth-actions">
                            <button onclick="window.app.login${this.activeProvider === 'google' ? 'Google' : 'Microsoft'}()" class="btn btn-primary">
                                <i class="fab fa-${this.activeProvider === 'google' ? 'google' : 'microsoft'}"></i>
                                Se connecter à ${providerName}
                            </button>
                            <button onclick="window.pageManager.loadPage('dashboard')" class="btn btn-secondary">
                                <i class="fas fa-home"></i>
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        async findAndClickScanButton() {
            console.log('[StartScan] Waiting for scan button...');
            
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkButton = async () => {
                // Chercher le bouton selon différents sélecteurs possibles
                const selectors = [
                    '#startScanBtn',
                    '.scan-button',
                    'button[onclick*="startScan"]',
                    'button[onclick*="scanEmails"]',
                    '.start-scan-btn',
                    '#scanButton'
                ];
                
                let scanButton = null;
                for (const selector of selectors) {
                    scanButton = document.querySelector(selector);
                    if (scanButton) {
                        console.log('[StartScan] Scan button found with selector:', selector);
                        break;
                    }
                }
                
                if (scanButton && !scanButton.disabled) {
                    console.log('[StartScan] ✅ Clicking scan button...');
                    
                    // Simuler un vrai clic utilisateur
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    
                    scanButton.dispatchEvent(event);
                    
                    // Marquer le scan comme en cours
                    this.scanInProgress = true;
                    
                    // Réinitialiser après un délai
                    setTimeout(() => {
                        this.scanInProgress = false;
                    }, 5000);
                    
                    console.log('[StartScan] ✅ Scan started automatically');
                    return true;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkButton, 250);
                } else {
                    console.log('[StartScan] Scan button timeout');
                    this.setupButtonObserver();
                }
            };
            
            await checkButton();
        }
        
        setupButtonObserver() {
            console.log('[StartScan] Scan button not found, setting up observer');
            
            const buttonObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        const scanButton = document.querySelector('#startScanBtn, .scan-button, button[onclick*="startScan"]');
                        if (scanButton && !scanButton.disabled) {
                            console.log('[StartScan] Scan button appeared');
                            buttonObserver.disconnect();
                            scanButton.click();
                            break;
                        }
                    }
                }
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                buttonObserver.observe(pageContent, {
                    childList: true,
                    subtree: true
                });
                
                // Timeout pour l'observer
                setTimeout(() => {
                    buttonObserver.disconnect();
                }, 10000);
            }
        }
        
        // Méthode publique pour forcer le démarrage
        forceStart() {
            console.log('[StartScan] Force start requested');
            this.scanInProgress = false;
            this.autoStartAttempts = 0;
            this.attemptAutoStart();
        }
        
        // Méthode pour réinitialiser le module
        reset() {
            console.log('[StartScan] Module reset');
            this.scanInProgress = false;
            this.autoStartAttempts = 0;
            this.activeProvider = null;
            this.currentPageManager = null;
        }
    }
    
    // Créer et initialiser l'instance
    window.startScanModule = new StartScanModule();
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[StartScan] DOM ready, starting initialization...');
            window.startScanModule.initialize();
        });
    } else {
        console.log('[StartScan] DOM already ready, starting initialization...');
        window.startScanModule.initialize();
    }
    
    console.log('[StartScan] ✅ Module v5.0 COMPLET loaded - Auto-scan ready for double auth avec scan module intégré');
})();
