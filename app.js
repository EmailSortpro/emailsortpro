// app.js - Application EmailSortPro avec authentification dual provider v4.3 - CHARGEMENT OPTIMISÉ

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null; // 'microsoft' ou 'google'
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.modulesReady = {
            categoryManager: false,
            taskManager: false,
            pageManager: false,
            dashboardModule: false
        };
        
        console.log('[App] Constructor - EmailSortPro v4.3 starting with dual provider support...');
    }

    async init() {
        console.log('[App] Initializing dual provider application v4.3...');
        
        if (this.initializationPromise) {
            console.log('[App] Already initializing, waiting...');
            return this.initializationPromise;
        }
        
        if (this.isInitializing) {
            console.log('[App] Already initializing, skipping...');
            return;
        }
        
        this.initializationPromise = this._doInit();
        return this.initializationPromise;
    }

    async _doInit() {
        this.isInitializing = true;
        this.initializationAttempts++;
        
        try {
            if (!this.checkPrerequisites()) {
                return;
            }

            console.log('[App] Initializing auth services...');
            
            // Initialiser les services d'authentification en parallèle
            await this.initializeAuthServices();
            
            // INITIALISER LES MODULES CRITIQUES
            await this.initializeCriticalModules();
            
            // Vérifier l'authentification
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // =====================================
    // INITIALISATION DES SERVICES D'AUTH
    // =====================================
    async initializeAuthServices() {
        const initTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth initialization timeout')), 30000)
        );
        
        const authPromises = [];
        
        if (window.authService) {
            authPromises.push(
                window.authService.initialize()
                    .then(() => {
                        console.log('[App] ✅ Microsoft auth service initialized');
                        return 'microsoft';
                    })
                    .catch(error => {
                        console.warn('[App] ⚠️ Microsoft auth service failed:', error.message);
                        return null;
                    })
            );
        }
        
        if (window.googleAuthService) {
            authPromises.push(
                window.googleAuthService.initialize()
                    .then(() => {
                        console.log('[App] ✅ Google auth service initialized');
                        return 'google';
                    })
                    .catch(error => {
                        console.warn('[App] ⚠️ Google auth service failed:', error.message);
                        return null;
                    })
            );
        }
        
        try {
            const results = await Promise.race([
                Promise.allSettled(authPromises),
                initTimeout
            ]);
            
            console.log('[App] Auth services initialization results:', results);
            
            const availableProviders = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);
            
            if (availableProviders.length === 0) {
                throw new Error('No authentication providers available');
            }
            
            console.log('[App] Available auth providers:', availableProviders);
            
        } catch (error) {
            if (error.message.includes('timeout')) {
                console.error('[App] Auth services initialization timeout');
            }
            throw error;
        }
    }

    // =====================================
    // INITIALISATION DES MODULES CRITIQUES OPTIMISÉE
    // =====================================
    async initializeCriticalModules() {
        console.log('[App] Initializing critical modules v4.3...');
        
        // Attendre CategoryManager spécifiquement d'abord (critique)
        try {
            await this.waitForCategoryManager();
            this.modulesReady.categoryManager = true;
            console.log('[App] ✅ CategoryManager ready');
        } catch (error) {
            console.warn('[App] ⚠️ CategoryManager not available:', error.message);
            // Continuer sans CategoryManager en mode dégradé
            this.modulesReady.categoryManager = false;
        }
        
        // Puis initialiser les autres modules en parallèle
        const otherModulePromises = [
            this.waitForModule('taskManager', 3000),
            this.waitForModule('pageManager', 3000),
            this.waitForModule('dashboardModule', 3000)
        ];
        
        const results = await Promise.allSettled(otherModulePromises);
        
        results.forEach((result, index) => {
            const moduleName = ['taskManager', 'pageManager', 'dashboardModule'][index];
            if (result.status === 'fulfilled') {
                this.modulesReady[moduleName] = true;
                console.log(`[App] ✅ ${moduleName} ready`);
            } else {
                console.warn(`[App] ⚠️ ${moduleName} not ready:`, result.reason);
                this.modulesReady[moduleName] = false;
            }
        });
        
        // Bind methods pour les modules disponibles
        this.bindModuleMethods();
        
        // Initialiser la gestion du scroll
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialization complete');
    }

    // =====================================
    // ATTENTE SPÉCIALE POUR CATEGORYMANAGER
    // =====================================
    async waitForCategoryManager() {
        const maxWaitTime = 10000; // 10 secondes max
        const checkInterval = 100;
        const startTime = Date.now();
        
        console.log('[App] Waiting for CategoryManager...');
        
        // Vérifier si déjà disponible
        if (window.categoryManager && window.categoryManager.isInitialized) {
            return true;
        }
        
        // Si la classe CategoryManager existe, créer l'instance
        if (typeof CategoryManager !== 'undefined' && !window.categoryManager) {
            console.log('[App] CategoryManager class found, creating instance...');
            try {
                window.categoryManager = new CategoryManager();
                // Attendre un peu pour l'initialisation
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.categoryManager.isInitialized) {
                    return true;
                }
            } catch (error) {
                console.error('[App] Failed to create CategoryManager:', error);
            }
        }
        
        // Attente active avec vérification périodique
        return new Promise((resolve, reject) => {
            const checkCategoryManager = () => {
                // Vérifier si disponible
                if (window.categoryManager && window.categoryManager.isInitialized) {
                    resolve(true);
                    return;
                }
                
                // Vérifier si la classe existe pour créer l'instance
                if (typeof CategoryManager !== 'undefined' && !window.categoryManager) {
                    try {
                        window.categoryManager = new CategoryManager();
                        console.log('[App] CategoryManager instance created during wait');
                    } catch (error) {
                        console.warn('[App] Failed to create CategoryManager during wait:', error);
                    }
                }
                
                // Vérifier le timeout
                if (Date.now() - startTime >= maxWaitTime) {
                    reject(new Error('CategoryManager not ready after ' + maxWaitTime + 'ms'));
                    return;
                }
                
                // Continuer à vérifier
                setTimeout(checkCategoryManager, checkInterval);
            };
            
            checkCategoryManager();
        });
    }

    // =====================================
    // ATTENTE DE MODULE AVEC TIMEOUT
    // =====================================
    async waitForModule(moduleName, timeout = 5000) {
        const startTime = Date.now();
        
        // Vérification rapide si déjà disponible
        if (this.isModuleReady(moduleName)) {
            return true;
        }
        
        // Attente active avec vérification périodique
        while (Date.now() - startTime < timeout) {
            if (this.isModuleReady(moduleName)) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`${moduleName} not ready after ${timeout}ms`);
    }

    isModuleReady(moduleName) {
        switch (moduleName) {
            case 'categoryManager':
                return window.categoryManager && window.categoryManager.isInitialized;
            case 'taskManager':
                return window.taskManager && window.taskManager.initialized;
            case 'pageManager':
                return !!window.pageManager;
            case 'dashboardModule':
                return !!window.dashboardModule;
            case 'tasksView':
                return !!window.tasksView;
            default:
                return false;
        }
    }

    // =====================================
    // GESTION INTELLIGENTE DU SCROLL
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        let lastContentHeight = 0;
        let lastViewportHeight = 0;
        
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) return;
            
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const currentPage = this.currentPage || 'dashboard';
                    
                    const dimensionsChanged = 
                        Math.abs(contentHeight - lastContentHeight) > 10 || 
                        Math.abs(viewportHeight - lastViewportHeight) > 10;
                    
                    lastContentHeight = contentHeight;
                    lastViewportHeight = viewportHeight;
                    
                    // Dashboard: JAMAIS de scroll
                    if (currentPage === 'dashboard') {
                        const newState = 'dashboard-no-scroll';
                        if (lastScrollState !== newState) {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                            lastScrollState = newState;
                        }
                        scrollCheckInProgress = false;
                        return;
                    }
                    
                    // Autres pages: scroll si nécessaire
                    const threshold = 100;
                    const needsScroll = contentHeight > viewportHeight + threshold;
                    const newState = needsScroll ? 'scroll-enabled' : 'scroll-disabled';
                    
                    if (lastScrollState !== newState || dimensionsChanged) {
                        if (needsScroll) {
                            body.classList.add('needs-scroll');
                            body.style.overflow = '';
                            body.style.overflowY = '';
                            body.style.overflowX = '';
                        } else {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                        }
                        lastScrollState = newState;
                    }
                    
                } catch (error) {
                    console.error('[SCROLL_MANAGER] Error:', error);
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150);
        };

        // Fonction pour définir le mode de page
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) return;
            
            const body = document.body;
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode'
            );
            
            body.classList.add(`page-${pageName}`);
            
            lastScrollState = null;
            lastContentHeight = 0;
            lastViewportHeight = 0;
            
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
                body.style.overflowY = 'hidden';
                body.style.overflowX = 'hidden';
                lastScrollState = 'dashboard-no-scroll';
                return;
            }
            
            setTimeout(() => {
                if (this.currentPage === pageName) {
                    this.checkScrollNeeded();
                }
            }, 300);
        };

        // Observer pour les changements de contenu
        if (window.MutationObserver) {
            let observerTimeout;
            let pendingMutations = false;
            
            const contentObserver = new MutationObserver((mutations) => {
                if (this.currentPage === 'dashboard') return;
                
                const significantChanges = mutations.some(mutation => {
                    if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        const target = mutation.target;
                        
                        if (attrName === 'style' && target === document.body) return false;
                        if (attrName === 'class' && target === document.body) return false;
                    }
                    
                    if (mutation.type === 'childList') {
                        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
                    }
                    
                    return false;
                });
                
                if (significantChanges && !pendingMutations) {
                    pendingMutations = true;
                    clearTimeout(observerTimeout);
                    
                    observerTimeout = setTimeout(() => {
                        if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                            this.checkScrollNeeded();
                        }
                        pendingMutations = false;
                    }, 250);
                }
            });

            contentObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
                attributeOldValue: false
            });
        }

        // Gestionnaire de redimensionnement
        let resizeTimeout;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        window.addEventListener('resize', () => {
            const currentSize = { width: window.innerWidth, height: window.innerHeight };
            
            const sizeChanged = 
                Math.abs(currentSize.width - lastWindowSize.width) > 10 ||
                Math.abs(currentSize.height - lastWindowSize.height) > 10;
            
            if (!sizeChanged || this.currentPage === 'dashboard') return;
            
            lastWindowSize = currentSize;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                    this.checkScrollNeeded();
                }
            }, 300);
        });

        console.log('[App] ✅ Scroll manager initialized');
    }

    // =====================================
    // MÉTHODES DE BINDING
    // =====================================
    bindModuleMethods() {
        const modulesToBind = ['categoryManager', 'taskManager', 'pageManager'];
        
        modulesToBind.forEach(moduleName => {
            if (window[moduleName] && this.modulesReady[moduleName]) {
                try {
                    const module = window[moduleName];
                    Object.getOwnPropertyNames(Object.getPrototypeOf(module)).forEach(name => {
                        if (name !== 'constructor' && typeof module[name] === 'function') {
                            module[name] = module[name].bind(module);
                        }
                    });
                    console.log(`[App] ✅ ${moduleName} methods bound`);
                } catch (error) {
                    console.warn(`[App] Error binding ${moduleName} methods:`, error);
                }
            }
        });
    }

    // =====================================
    // VÉRIFICATION PRÉREQUIS
    // =====================================
    checkPrerequisites() {
        if (typeof msal === 'undefined') {
            console.error('[App] MSAL library not loaded');
            this.showError('MSAL library not loaded. Please refresh the page.');
            return false;
        }

        if (!window.AppConfig) {
            console.error('[App] Configuration not loaded');
            this.showError('Configuration not loaded. Please refresh the page.');
            return false;
        }

        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.error('[App] Configuration invalid:', validation.issues);
            this.showConfigurationError(validation.issues);
            return false;
        }

        if (!window.authService && !window.googleAuthService) {
            console.error('[App] No authentication service available');
            this.showError('Authentication service not available. Please refresh the page.');
            return false;
        }

        return true;
    }

    // =====================================
    // VÉRIFICATION DE L'AUTHENTIFICATION
    // =====================================
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status...');
        
        // Vérifier d'abord s'il y a un callback Google à traiter
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            this.showAppWithTransition();
            return;
        }
        
        // Vérifier Microsoft
        if (window.authService && window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] Microsoft authentication found');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.user.provider = 'microsoft';
                    this.isAuthenticated = true;
                    this.activeProvider = 'microsoft';
                    console.log('[App] ✅ Microsoft user authenticated:', this.user.displayName || this.user.mail);
                    this.showAppWithTransition();
                    return;
                } catch (error) {
                    console.error('[App] Error getting Microsoft user info:', error);
                    await window.authService.reset();
                }
            }
        }
        
        // Vérifier Google
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                console.log('[App] Google authentication found');
                try {
                    this.user = await window.googleAuthService.getUserInfo();
                    this.user.provider = 'google';
                    this.isAuthenticated = true;
                    this.activeProvider = 'google';
                    console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                    this.showAppWithTransition();
                    return;
                } catch (error) {
                    console.error('[App] Error getting Google user info:', error);
                    await window.googleAuthService.reset();
                }
            }
        }
        
        // Aucune authentification trouvée
        console.log('[App] No valid authentication found');
        this.showLogin();
    }

    // =====================================
    // GESTION DU CALLBACK GOOGLE OAuth2
    // =====================================
    async handleGoogleCallback() {
        console.log('[App] Checking for Google OAuth2 callback...');
        
        try {
            const callbackDataStr = sessionStorage.getItem('google_callback_data');
            if (!callbackDataStr) {
                return false;
            }
            
            const callbackData = JSON.parse(callbackDataStr);
            console.log('[App] Found Google callback data');
            
            sessionStorage.removeItem('google_callback_data');
            
            const urlParams = new URLSearchParams();
            urlParams.set('code', callbackData.code);
            urlParams.set('state', callbackData.state);
            
            const success = await window.googleAuthService.handleOAuthCallback(urlParams);
            
            if (success) {
                console.log('[App] ✅ Google callback handled successfully');
                
                this.user = await window.googleAuthService.getUserInfo();
                this.user.provider = 'google';
                this.isAuthenticated = true;
                this.activeProvider = 'google';
                
                console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                return true;
            } else {
                throw new Error('Google callback processing failed');
            }
            
        } catch (error) {
            console.error('[App] ❌ Error handling Google callback:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur de traitement Google: ' + error.message,
                    'error',
                    8000
                );
            }
            
            return false;
        }
    }

    // =====================================
    // GESTION DES ERREURS D'INITIALISATION
    // =====================================
    async handleInitializationError(error) {
        console.error('[App] Initialization error:', error);
        
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError([
                'Configuration Azure incorrecte',
                'Vérifiez votre Client ID dans la configuration',
                'Consultez la documentation Azure App Registration'
            ]);
            return;
        }
        
        if (error.message.includes('CategoryManager')) {
            // Pour CategoryManager, on peut continuer sans lui en mode dégradé
            console.warn('[App] CategoryManager not available, continuing in degraded mode');
            this.showLogin();
            return;
        }
        
        if (this.initializationAttempts < this.maxInitAttempts && 
            (error.message.includes('timeout') || error.message.includes('network'))) {
            console.log(`[App] Retrying initialization (${this.initializationAttempts}/${this.maxInitAttempts})...`);
            this.isInitializing = false;
            this.initializationPromise = null;
            setTimeout(() => this.init(), 3000);
            return;
        }
        
        this.showError('Failed to initialize the application. Please check the configuration and refresh the page.');
    }

    // =====================================
    // CONFIGURATION DES ÉVÉNEMENTS
    // =====================================
    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    this.currentPage = page;
                    
                    if (window.setPageMode) {
                        window.setPageMode(page);
                    }
                    
                    window.pageManager.loadPage(page);
                }
            });
        });

        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            if (event.error && event.error.message) {
                const message = event.error.message;
                if (message.includes('unauthorized_client')) {
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur de configuration Azure. Vérifiez votre Client ID.',
                            'error',
                            10000
                        );
                    }
                }
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });
    }

    // =====================================
    // MÉTHODES DE CONNEXION
    // =====================================
    async login() {
        console.log('[App] Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    async loginMicrosoft() {
        console.log('[App] Microsoft login attempted...');
        
        try {
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                console.log('[App] Microsoft AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Microsoft login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Microsoft. Veuillez réessayer.';
            
            if (error.errorCode) {
                const errorCode = error.errorCode;
                if (window.AppConfig.errors && window.AppConfig.errors[errorCode]) {
                    errorMessage = window.AppConfig.errors[errorCode];
                } else {
                    switch (errorCode) {
                        case 'popup_window_error':
                            errorMessage = 'Popup bloqué. Autorisez les popups pour Outlook et réessayez.';
                            break;
                        case 'user_cancelled':
                            errorMessage = 'Connexion Outlook annulée.';
                            break;
                        case 'network_error':
                            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                            break;
                        case 'unauthorized_client':
                            errorMessage = 'Configuration incorrecte. Vérifiez votre Azure Client ID.';
                            break;
                        default:
                            errorMessage = `Erreur Microsoft: ${errorCode}`;
                    }
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async loginGoogle() {
        console.log('[App] Google login attempted...');
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService.isInitialized) {
                console.log('[App] Google AuthService not initialized, initializing...');
                await window.googleAuthService.initialize();
            }
            
            await window.googleAuthService.login();
            
        } catch (error) {
            console.error('[App] Google login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Gmail. Veuillez réessayer.';
            
            if (error.message) {
                if (error.message.includes('cookies')) {
                    errorMessage = 'Cookies tiers bloqués. Autorisez les cookies pour accounts.google.com et réessayez.';
                } else if (error.message.includes('domain') || error.message.includes('origin')) {
                    errorMessage = 'Erreur de domaine Gmail. Vérifiez la configuration Google Console.';
                } else if (error.message.includes('client')) {
                    errorMessage = 'Configuration Google incorrecte. Vérifiez votre Client ID.';
                } else {
                    errorMessage = `Erreur Gmail: ${error.message}`;
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            if (this.activeProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else {
                if (window.authService) {
                    try { await window.authService.logout(); } catch (e) {}
                }
                if (window.googleAuthService) {
                    try { await window.googleAuthService.logout(); } catch (e) {}
                }
                this.forceCleanup();
            }
            
        } catch (error) {
            console.error('[App] Logout error:', error);
            this.hideModernLoading();
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de déconnexion. Nettoyage forcé...', 'warning');
            }
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] Force cleanup...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        const keysToKeep = ['emailsort_categories', 'emailsort_tasks', 'emailsortpro_client_id'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('[App] Error removing key:', key);
                }
            }
        });
        
        try {
            sessionStorage.removeItem('google_callback_data');
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('direct_token_data');
        } catch (e) {
            console.warn('[App] Error cleaning sessionStorage:', e);
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // =====================================
    // AFFICHAGE DE L'APPLICATION
    // =====================================
    showLogin() {
        console.log('[App] Showing login page');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    showAppWithTransition() {
        console.log('[App] Showing application - Provider:', this.activeProvider);
        
        this.hideModernLoading();
        
        // Passer en mode app
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active');
        
        // Afficher les éléments
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
        }
        
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
        }
        
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
        }
        
        // Mettre à jour l'interface utilisateur
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        if (window.updateUserDisplay) {
            window.updateUserDisplay(this.user);
        }
        
        // Charger le dashboard
        this.loadDashboard();
        
        // Forcer l'affichage avec CSS
        this.forceAppDisplay();
        
        console.log(`[App] ✅ Application displayed with ${this.activeProvider} provider`);
    }

    loadDashboard() {
        console.log('[App] Loading dashboard...');
        
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        
        // Essayer plusieurs méthodes pour charger le dashboard
        const loadMethods = [
            // Méthode 1: DashboardModule
            () => {
                if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
                    console.log('[App] Loading dashboard via dashboardModule.render()');
                    window.dashboardModule.render();
                    return true;
                }
                return false;
            },
            // Méthode 2: PageManager
            () => {
                if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                    console.log('[App] Loading dashboard via pageManager.loadPage()');
                    window.pageManager.loadPage('dashboard');
                    return true;
                }
                return false;
            },
            // Méthode 3: Direct load
            () => {
                console.log('[App] Loading dashboard directly');
                const pageContent = document.getElementById('pageContent');
                if (pageContent) {
                    pageContent.innerHTML = '<div class="loading-placeholder">Chargement du dashboard...</div>';
                    
                    // Réessayer après un délai
                    setTimeout(() => {
                        if (window.dashboardModule) {
                            window.dashboardModule.render();
                        } else if (window.pageManager) {
                            window.pageManager.loadPage('dashboard');
                        }
                    }, 500);
                    return true;
                }
                return false;
            }
        ];
        
        // Essayer chaque méthode
        for (const method of loadMethods) {
            if (method()) {
                console.log('[App] Dashboard load initiated');
                return;
            }
        }
        
        console.error('[App] Failed to load dashboard');
    }

    forceAppDisplay() {
        const forceDisplayStyle = document.createElement('style');
        forceDisplayStyle.id = 'force-app-display';
        forceDisplayStyle.textContent = `
            body.app-active #loginPage {
                display: none !important;
            }
            body.app-active .app-header {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            body.app-active .app-nav {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            body.app-active #pageContent {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        
        const oldStyle = document.getElementById('force-app-display');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(forceDisplayStyle);
    }

    // =====================================
    // AFFICHAGE DES MESSAGES
    // =====================================
    showModernLoading(message = 'Chargement...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('.login-loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div>${message}</div>
                    <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">Authentification en cours</div>
                `;
            }
            loadingOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModernLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Erreur d'application</h1>
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Actualiser la page
                            </button>
                            <button onclick="window.app.forceCleanup()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
    }

    showConfigurationError(issues) {
        console.error('[App] Configuration error:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">Configuration requise</h1>
                        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(251, 191, 36, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px;">Pour résoudre :</h4>
                                <ol style="margin-left: 20px;">
                                    <li>Cliquez sur "Configurer l'application"</li>
                                    <li>Suivez l'assistant de configuration</li>
                                    <li>Entrez vos Client IDs Azure et Google</li>
                                </ol>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="setup.html" class="login-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    // =====================================
    // DIAGNOSTIC
    // =====================================
    getDiagnosticInfo() {
        return {
            isAuthenticated: this.isAuthenticated,
            activeProvider: this.activeProvider,
            user: this.user ? {
                name: this.user.displayName || this.user.name,
                email: this.user.mail || this.user.email,
                provider: this.user.provider
            } : null,
            currentPage: this.currentPage,
            isInitialized: !this.isInitializing,
            modulesReady: this.modulesReady,
            microsoftAuthService: window.authService ? {
                isInitialized: window.authService.isInitialized,
                isAuthenticated: window.authService.isAuthenticated()
            } : null,
            googleAuthService: window.googleAuthService ? {
                isInitialized: window.googleAuthService.isInitialized,
                isAuthenticated: window.googleAuthService.isAuthenticated()
            } : null,
            categoryManager: window.categoryManager ? {
                isInitialized: window.categoryManager.isInitialized,
                categoriesCount: Object.keys(window.categoryManager.getCategories()).length
            } : null,
            version: 'v4.3-optimized'
        };
    }
}

// =====================================
// FONCTIONS GLOBALES
// =====================================
window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered');
    
    const keysToKeep = ['emailsort_categories', 'emailsort_tasks', 'emailsortpro_client_id'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('[Emergency] Error removing key:', key);
            }
        }
    });
    
    try {
        sessionStorage.clear();
    } catch (e) {
        console.warn('[Emergency] Error clearing sessionStorage:', e);
    }
    
    window.location.reload();
};

window.forceShowApp = function() {
    console.log('[Global] Force show app triggered');
    if (window.app && typeof window.app.showAppWithTransition === 'function') {
        window.app.showAppWithTransition();
    } else {
        document.body.classList.add('app-active');
        document.body.classList.remove('login-mode');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        if (window.dashboardModule) {
            window.dashboardModule.render();
        }
    }
};

// ================================================
// INITIALISATION PRINCIPALE
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, initializing EmailSortPro v4.3...');
    
    document.body.classList.add('login-mode');
    
    // Créer l'app immédiatement
    window.app = new App();
    
    // Lancer l'initialisation après un court délai pour laisser les modules se charger
    setTimeout(() => {
        window.app.init().catch(error => {
            console.error('[App] Initialization failed:', error);
            window.app.showError('Failed to initialize the application. Please refresh the page.');
        });
    }, 100);
});

// Vérification de sécurité après chargement complet
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) {
            console.error('[App] App instance not created, creating fallback...');
            document.body.classList.add('login-mode');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] Fallback initialization check...');
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
                document.body.classList.add('login-mode');
            }
        }
    }, 5000);
});

// =====================================
// DIAGNOSTIC GLOBAL
// =====================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION v4.3');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            console.log('📱 App Status:', appDiag);
            
            console.group('🛠️ Modules Status');
            Object.entries(appDiag.modulesReady).forEach(([module, ready]) => {
                console.log(`${module}: ${ready ? '✅' : '❌'}`);
            });
            console.groupEnd();
            
            if (appDiag.microsoftAuthService) {
                console.log('🔵 Microsoft Auth:', appDiag.microsoftAuthService);
            }
            
            if (appDiag.googleAuthService) {
                console.log('🔴 Google Auth:', appDiag.googleAuthService);
            }
            
            if (appDiag.categoryManager) {
                console.log('📂 CategoryManager:', appDiag.categoryManager);
            }
            
            return appDiag;
        } else {
            console.log('❌ App instance not available');
            return { error: 'App instance not available' };
        }
    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ App v4.3 loaded - Optimized loading with improved module handling');
