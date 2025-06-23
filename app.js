// app.js - Application EmailSortPro v5.0 - Complètement corrigé et optimisé

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
        
        // Système de gestion des dépendances simplifié
        this.moduleInitialized = new Set();
        this.criticalModulesReady = false;
        
        console.log('[App] 🚀 Constructor - EmailSortPro v5.0 starting...');
    }

    async init() {
        console.log('[App] 📋 Initializing application...');
        
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
            console.log('[App] 🔍 Checking prerequisites...');
            if (!this.checkPrerequisites()) {
                return;
            }

            console.log('[App] 🔐 Initializing auth services...');
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 30000)
            );
            
            // Initialiser les services d'authentification en parallèle
            const authPromises = [];
            
            if (window.authService) {
                authPromises.push(
                    window.authService.initialize().then(() => {
                        console.log('[App] ✅ Microsoft auth service initialized');
                        return 'microsoft';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Microsoft auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            if (window.googleAuthService) {
                authPromises.push(
                    window.googleAuthService.initialize().then(() => {
                        console.log('[App] ✅ Google auth service initialized');
                        return 'google';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Google auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            // Attendre au moins un service d'auth
            const initResults = await Promise.race([
                Promise.allSettled(authPromises),
                initTimeout
            ]);
            
            console.log('[App] 🔐 Auth services initialization results:', initResults);
            
            // Initialiser les modules critiques avec gestion simplifiée
            await this.initializeCriticalModules();
            
            // Vérifier l'état d'authentification
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // ================================================
    // INITIALISATION MODULES CRITIQUES SIMPLIFIÉE
    // ================================================
    async initializeCriticalModules() {
        console.log('[App] 🧩 Initializing critical modules...');
        
        try {
            // 1. S'assurer que CategoryManager est disponible et initialisé
            await this.ensureCategoryManagerReady();
            
            // 2. Attendre que les autres modules soient prêts
            await this.waitForOtherModules();
            
            // 3. Configuration finale
            this.bindModuleMethods();
            this.initializeScrollManager();
            
            this.criticalModulesReady = true;
            console.log('[App] ✅ Critical modules initialized successfully');
            
        } catch (error) {
            console.error('[App] ❌ Error initializing critical modules:', error);
            // Continuer sans bloquer l'application
            this.criticalModulesReady = false;
        }
    }

    async ensureCategoryManagerReady() {
        console.log('[App] 🔍 Ensuring CategoryManager is ready...');
        
        // Si CategoryManager est déjà prêt
        if (window.categoryManager?.isInitialized) {
            console.log('[App] ✅ CategoryManager already ready');
            this.moduleInitialized.add('CategoryManager');
            return true;
        }
        
        // Si CategoryManager existe mais n'est pas initialisé
        if (window.categoryManager && !window.categoryManager.isInitialized) {
            console.log('[App] ⏳ Waiting for CategoryManager initialization...');
            
            let attempts = 0;
            const maxAttempts = 50;
            
            while (!window.categoryManager.isInitialized && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (window.categoryManager.isInitialized) {
                console.log('[App] ✅ CategoryManager initialized successfully');
                this.moduleInitialized.add('CategoryManager');
                return true;
            } else {
                console.error('[App] ❌ CategoryManager failed to initialize');
                return false;
            }
        }
        
        // Si CategoryManager n'existe pas du tout
        if (!window.categoryManager) {
            console.log('[App] 🔧 CategoryManager not found, waiting...');
            
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!window.categoryManager && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
                
                if (attempts % 20 === 0) {
                    console.log(`[App] ⏳ Still waiting for CategoryManager... (${attempts}/${maxAttempts})`);
                }
            }
            
            if (window.categoryManager) {
                console.log('[App] 📦 CategoryManager found, waiting for initialization...');
                
                attempts = 0;
                while (!window.categoryManager.isInitialized && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    attempts++;
                }
                
                if (window.categoryManager.isInitialized) {
                    console.log('[App] ✅ CategoryManager ready');
                    this.moduleInitialized.add('CategoryManager');
                    return true;
                } else {
                    console.error('[App] ❌ CategoryManager found but not initialized');
                    return false;
                }
            } else {
                console.error('[App] ❌ CategoryManager not found after waiting');
                return false;
            }
        }
        
        return false;
    }

    async waitForOtherModules() {
        console.log('[App] ⏳ Waiting for other modules...');
        
        const moduleChecks = [
            {
                name: 'TaskManager',
                check: () => window.taskManager?.initialized,
                required: false
            },
            {
                name: 'PageManager',
                check: () => window.pageManager,
                required: false
            },
            {
                name: 'EmailScanner',
                check: () => window.emailScanner?.isInitialized,
                required: false
            },
            {
                name: 'MinimalScanModule',
                check: () => window.minimalScanModule?.isInitialized,
                required: false
            },
            {
                name: 'DashboardModule',
                check: () => window.dashboardModule,
                required: false
            }
        ];
        
        for (const module of moduleChecks) {
            try {
                let attempts = 0;
                const maxAttempts = 30; // 3 secondes max par module
                
                while (!module.check() && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (module.check()) {
                    console.log(`[App] ✅ ${module.name} ready`);
                    this.moduleInitialized.add(module.name);
                } else {
                    console.warn(`[App] ⚠️ ${module.name} not ready after waiting`);
                    if (module.required) {
                        throw new Error(`Required module ${module.name} not available`);
                    }
                }
            } catch (error) {
                console.error(`[App] ❌ Error checking ${module.name}:`, error);
                if (module.required) {
                    throw error;
                }
            }
        }
        
        console.log('[App] 📊 Modules status:', Array.from(this.moduleInitialized));
    }

    bindModuleMethods() {
        console.log('[App] 🔗 Binding module methods...');
        
        // Bind TaskManager methods
        if (window.taskManager) {
            try {
                const proto = Object.getPrototypeOf(window.taskManager);
                Object.getOwnPropertyNames(proto).forEach(name => {
                    if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
                        window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
                    }
                });
                console.log('[App] ✅ TaskManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding TaskManager methods:', error);
            }
        }
        
        // Bind PageManager methods
        if (window.pageManager) {
            try {
                const proto = Object.getPrototypeOf(window.pageManager);
                Object.getOwnPropertyNames(proto).forEach(name => {
                    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
                        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
                    }
                });
                console.log('[App] ✅ PageManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding PageManager methods:', error);
            }
        }
    }

    // ================================================
    // GESTION INTELLIGENTE DU SCROLL (simplifiée)
    // ================================================
    initializeScrollManager() {
        console.log('[App] 📜 Initializing scroll manager...');
        
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) return;
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const currentPage = this.currentPage || 'dashboard';
                    
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
                    
                    if (lastScrollState !== newState) {
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
                    console.error('[App] Error checking scroll:', error);
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
            
            // Nettoyer les anciennes classes
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode'
            );
            
            // Ajouter la nouvelle classe
            body.classList.add(`page-${pageName}`);
            
            // Réinitialiser l'état du scroll
            lastScrollState = null;
            
            // Dashboard: configuration immédiate
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
                body.style.overflowY = 'hidden';
                body.style.overflowX = 'hidden';
                lastScrollState = 'dashboard-no-scroll';
                return;
            }
            
            // Autres pages: vérifier après stabilisation
            setTimeout(() => {
                if (this.currentPage === pageName) {
                    this.checkScrollNeeded();
                }
            }, 300);
        };

        // Observer pour les changements de contenu
        if (window.MutationObserver) {
            let observerTimeout;
            
            const contentObserver = new MutationObserver((mutations) => {
                if (this.currentPage === 'dashboard') return;
                
                const significantChanges = mutations.some(mutation => {
                    if (mutation.type === 'childList') {
                        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
                    }
                    return false;
                });
                
                if (significantChanges) {
                    clearTimeout(observerTimeout);
                    observerTimeout = setTimeout(() => {
                        if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                            this.checkScrollNeeded();
                        }
                    }, 250);
                }
            });

            contentObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Gestionnaire de redimensionnement
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (this.currentPage === 'dashboard') return;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                    this.checkScrollNeeded();
                }
            }, 300);
        });

        console.log('[App] ✅ Scroll manager initialized');
    }

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

    // ================================================
    // VÉRIFICATION AUTHENTIFICATION DUAL PROVIDER
    // ================================================
    async checkAuthenticationStatus() {
        console.log('[App] 🔍 Checking authentication status...');
        
        // Vérifier callback Google d'abord
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            this.showAppWithTransition();
            return;
        }
        
        // Vérifier Microsoft
        if (window.authService?.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] 🔵 Microsoft authentication found');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.user.provider = 'microsoft';
                    this.isAuthenticated = true;
                    this.activeProvider = 'microsoft';
                    console.log('[App] ✅ Microsoft user authenticated:', this.user.displayName || this.user.mail);
                    this.showAppWithTransition();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Microsoft user info:', userInfoError);
                    if (userInfoError.message.includes('401') || userInfoError.message.includes('403')) {
                        await window.authService.reset();
                    }
                }
            }
        }
        
        // Vérifier Google
        if (window.googleAuthService?.isAuthenticated()) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                console.log('[App] 🔴 Google authentication found');
                try {
                    this.user = await window.googleAuthService.getUserInfo();
                    this.user.provider = 'google';
                    this.isAuthenticated = true;
                    this.activeProvider = 'google';
                    console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                    this.showAppWithTransition();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Google user info:', userInfoError);
                    await window.googleAuthService.reset();
                }
            }
        }
        
        // Aucune authentification trouvée
        console.log('[App] 🔒 No valid authentication found');
        this.showLogin();
    }

    async handleGoogleCallback() {
        console.log('[App] 🔄 Handling Google OAuth2 callback...');
        
        try {
            const callbackDataStr = sessionStorage.getItem('google_callback_data');
            if (!callbackDataStr) {
                return false;
            }
            
            const callbackData = JSON.parse(callbackDataStr);
            console.log('[App] 📨 Found Google callback data');
            
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

    async handleInitializationError(error) {
        console.error('[App] ❌ Initialization error:', error);
        
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError([
                'Configuration Azure incorrecte',
                'Vérifiez votre Client ID dans la configuration'
            ]);
            return;
        }
        
        if (error.message.includes('Configuration invalid')) {
            this.showConfigurationError(['Configuration invalide']);
            return;
        }
        
        if (this.initializationAttempts < this.maxInitAttempts && 
            (error.message.includes('timeout') || error.message.includes('network'))) {
            console.log(`[App] 🔄 Retrying initialization (${this.initializationAttempts}/${this.maxInitAttempts})...`);
            this.isInitializing = false;
            this.initializationPromise = null;
            setTimeout(() => this.init(), 3000);
            return;
        }
        
        this.showError('Failed to initialize the application. Please check the configuration and refresh the page.');
    }

    setupEventListeners() {
        console.log('[App] 👂 Setting up event listeners...');
        
        // Navigation corrigée
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

        // Gestionnaires d'erreurs globaux
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            if (event.error?.message?.includes('unauthorized_client')) {
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Erreur de configuration Azure. Vérifiez votre Client ID.',
                        'error',
                        10000
                    );
                }
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
            
            if (event.reason?.message?.includes('createTaskFromEmail')) {
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Erreur du gestionnaire de tâches. Veuillez actualiser la page.',
                        'warning'
                    );
                }
            }
        });
    }

    // ================================================
    // MÉTHODES DE CONNEXION
    // ================================================
    async login() {
        console.log('[App] 🔑 Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    async loginMicrosoft() {
        console.log('[App] 🔵 Microsoft login attempted...');
        
        try {
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] ❌ Microsoft login error:', error);
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Microsoft. Veuillez réessayer.';
            
            if (error.errorCode) {
                switch (error.errorCode) {
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
                        errorMessage = `Erreur Microsoft: ${error.errorCode}`;
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async loginGoogle() {
        console.log('[App] 🔴 Google login attempted...');
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService.isInitialized) {
                await window.googleAuthService.initialize();
            }
            
            await window.googleAuthService.login();
            
        } catch (error) {
            console.error('[App] ❌ Google login error:', error);
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Gmail. Veuillez réessayer.';
            
            if (error.message) {
                if (error.message.includes('cookies')) {
                    errorMessage = 'Cookies tiers bloqués. Autorisez les cookies pour accounts.google.com.';
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
        console.log('[App] 🚪 Logout attempted...');
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            // Déconnexion selon le provider actif
            if (this.activeProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else {
                // Fallback: essayer les deux
                if (window.authService) {
                    try { await window.authService.logout(); } catch (e) {}
                }
                if (window.googleAuthService) {
                    try { await window.googleAuthService.logout(); } catch (e) {}
                }
                this.forceCleanup();
            }
            
        } catch (error) {
            console.error('[App] ❌ Logout error:', error);
            this.hideModernLoading();
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de déconnexion. Nettoyage forcé...', 'warning');
            }
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] 🧹 Force cleanup...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.moduleInitialized.clear();
        this.criticalModulesReady = false;
        
        // Nettoyer les services d'authentification
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        // Nettoyer localStorage sélectivement
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
        
        // Nettoyer sessionStorage
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

    // ================================================
    // AFFICHAGE DE L'APPLICATION
    // ================================================
    showLogin() {
        console.log('[App] 🔐 Showing login page');
        
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
        console.log('[App] 🎨 Showing application - Provider:', this.activeProvider);
        
        this.hideModernLoading();
        
        // Retirer le mode login et activer le mode app
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
        
        // Initialiser le dashboard
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        // Forcer pas de scroll pour le dashboard
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        
        // Charger le dashboard
        if (window.dashboardModule) {
            setTimeout(() => {
                window.dashboardModule.render();
            }, 100);
        }
        
        this.forceAppDisplay();
        
        console.log(`[App] ✅ Application displayed with ${this.activeProvider} provider`);
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
        console.error('[App] 🚨 Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Erreur d'application</h1>
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Actualiser la page
                            </button>
                            <button onclick="window.app.forceCleanup()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151;">
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
        console.error('[App] ⚙️ Configuration error:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Configuration requise</h1>
                        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="setup.html" class="login-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151;">
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

    // ================================================
    // DIAGNOSTIC
    // ================================================
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
            criticalModulesReady: this.criticalModulesReady,
            moduleInitialized: Array.from(this.moduleInitialized),
            microsoftAuthService: window.authService ? {
                isInitialized: window.authService.isInitialized,
                isAuthenticated: window.authService.isAuthenticated()
            } : null,
            googleAuthService: window.googleAuthService ? {
                isInitialized: window.googleAuthService.isInitialized,
                isAuthenticated: window.googleAuthService.isAuthenticated()
            } : null,
            moduleAvailability: {
                CategoryManager: !!window.categoryManager,
                TaskManager: !!window.taskManager,
                EmailScanner: !!window.emailScanner,
                PageManager: !!window.pageManager,
                DashboardModule: !!window.dashboardModule,
                MinimalScanModule: !!window.minimalScanModule
            },
            version: '5.0'
        };
    }
}

// ================================================
// FONCTIONS GLOBALES D'URGENCE
// ================================================
window.emergencyReset = function() {
    console.log('[App] 🚨 Emergency reset triggered');
    
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
    console.log('[Global] 🎨 Force show app triggered');
    if (window.app?.showAppWithTransition) {
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
// VÉRIFICATION DES SERVICES
// ================================================
function checkServicesReady() {
    const requiredServices = ['uiManager'];
    const authServices = ['authService', 'googleAuthService'];
    const optionalServices = ['mailService', 'emailScanner', 'dashboardModule'];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const availableAuthServices = authServices.filter(service => window[service]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    if (missingRequired.length > 0) {
        console.error('[App] ❌ Missing REQUIRED services:', missingRequired);
        return false;
    }
    
    if (availableAuthServices.length === 0) {
        console.error('[App] ❌ No authentication services available');
        return false;
    }
    
    if (missingOptional.length > 0) {
        console.warn('[App] ⚠️ Missing optional services:', missingOptional);
    }
    
    if (!window.AppConfig) {
        console.error('[App] ❌ Missing AppConfig');
        return false;
    }
    
    console.log('[App] ✅ Available auth services:', availableAuthServices);
    console.log('[App] ✅ Services check passed');
    
    return true;
}

// ================================================
// INITIALISATION PRINCIPALE
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] 📄 DOM loaded, creating app instance...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        const maxAttempts = 100;
        
        if (checkServicesReady()) {
            console.log('[App] ✅ All required services ready, initializing app...');
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else if (attempts < maxAttempts) {
            if (attempts % 25 === 0) {
                console.log(`[App] ⏳ Waiting for services... (${attempts + 1}/${maxAttempts})`);
            }
            setTimeout(() => waitForServices(attempts + 1), 50);
        } else {
            console.error('[App] ❌ Timeout waiting for services, initializing anyway...');
            setTimeout(() => {
                window.app.init();
            }, 100);
        }
    };
    
    waitForServices();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) {
            console.error('[App] ❌ App instance not created, creating fallback...');
            document.body.classList.add('login-mode');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] 🔄 Fallback initialization check...');
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
                document.body.classList.add('login-mode');
            }
        }
    }, 5000);
});

// ================================================
// DIAGNOSTIC GLOBAL
// ================================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION v5.0 - EmailSortPro');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            console.log('📱 App Status:', appDiag);
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

window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v5.0');
    
    const provider = window.app?.activeProvider || 'unknown';
    console.log('Provider actif:', provider);
    
    if (!window.categoryManager) {
        console.error('❌ CategoryManager not available');
        return { error: 'CategoryManager not available', provider: provider };
    }
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" }
    ];
    
    tests.forEach(test => {
        if (window.categoryManager.testEmail) {
            window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
        }
    });
    
    const stats = window.categoryManager.getCategoryStats?.() || {};
    console.log('Stats:', stats);
    
    console.groupEnd();
    return { success: true, testsRun: tests.length, provider: provider, stats: stats };
};

console.log('✅ App v5.0 loaded - Dual provider with optimized dependency management');
