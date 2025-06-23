// app.js - Application EmailSortPro avec authentification dual provider (Microsoft + Google) v4.1

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
        
        // Système de gestion des dépendances
        this.moduleInitPromises = new Map();
        this.moduleInitialized = new Set();
        this.moduleQueue = [];
        
        console.log('[App] Constructor - EmailSortPro v4.1 starting with robust dependency management...');
    }

    async init() {
        console.log('[App] Initializing dual provider application...');
        
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
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 30000)
            );
            
            // Initialiser les deux services d'authentification en parallèle
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
            
            console.log('[App] Auth services initialization results:', initResults);
            
            // INITIALISER LES MODULES CRITIQUES AVEC GESTION ROBUSTE DES DÉPENDANCES
            await this.initializeCriticalModulesWithDependencies();
            
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // =====================================
    // INITIALISATION ROBUSTE DES MODULES CRITIQUES
    // =====================================
    async initializeCriticalModulesWithDependencies() {
        console.log('[App] Initializing critical modules with dependency management...');
        
        // 1. CategoryManager en PREMIER (dépendance critique pour tous les autres)
        await this.ensureCategoryManagerReady();
        
        // 2. TaskManager (dépend de CategoryManager)
        await this.ensureTaskManagerReady();
        
        // 3. PageManager
        await this.ensurePageManagerReady();
        
        // 4. EmailScanner (dépend de CategoryManager et TaskManager)
        await this.ensureEmailScannerReady();
        
        // 5. TasksView
        await this.ensureTasksViewReady();
        
        // 6. DashboardModule
        await this.ensureDashboardModuleReady();
        
        // 7. Bind methods et configuration finale
        this.bindModuleMethods();
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialized with dependencies resolved');
    }

    async ensureCategoryManagerReady() {
        console.log('[App] Ensuring CategoryManager is ready (CRITICAL DEPENDENCY)...');
        
        // Si déjà prêt, retourner immédiatement
        if (window.categoryManager && window.categoryManager.isInitialized) {
            console.log('[App] ✅ CategoryManager already ready');
            this.moduleInitialized.add('CategoryManager');
            return true;
        }
        
        // Attendre que CategoryManager soit disponible
        let attempts = 0;
        const maxAttempts = 100; // Plus de tentatives pour module critique
        
        while (!window.categoryManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
            
            if (attempts % 20 === 0) {
                console.log(`[App] ⏳ Waiting for CategoryManager... (${attempts}/${maxAttempts})`);
            }
        }
        
        if (!window.categoryManager) {
            // CRÉER CategoryManager s'il n'existe pas
            console.log('[App] 🔧 Creating CategoryManager manually...');
            try {
                if (window.CategoryManager) {
                    window.categoryManager = new window.CategoryManager();
                    await new Promise(resolve => setTimeout(resolve, 500)); // Laisser temps d'initialiser
                } else {
                    throw new Error('CategoryManager class not available');
                }
            } catch (error) {
                console.error('[App] ❌ Failed to create CategoryManager:', error);
                return false;
            }
        }
        
        // Attendre que CategoryManager soit initialisé
        attempts = 0;
        while ((!window.categoryManager.isInitialized) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        if (!window.categoryManager.isInitialized) {
            console.error('[App] ❌ CategoryManager failed to initialize after creation');
            return false;
        }
        
        // Vérifier les méthodes essentielles
        const essentialMethods = [
            'getCategories', 'analyzeEmail', 'getTaskPreselectedCategories',
            'getSettings', 'updateTaskPreselectedCategories'
        ];
        
        for (const method of essentialMethods) {
            if (typeof window.categoryManager[method] !== 'function') {
                console.error(`[App] ❌ CategoryManager missing essential method: ${method}`);
                return false;
            }
        }
        
        console.log('[App] ✅ CategoryManager ready and verified');
        this.moduleInitialized.add('CategoryManager');
        
        // Signaler aux modules en attente que CategoryManager est prêt
        this.notifyModuleDependencyReady('CategoryManager');
        
        return true;
    }

    async ensureEmailScannerReady() {
        console.log('[App] Ensuring EmailScanner is ready...');
        
        // Attendre que CategoryManager soit prêt d'abord
        if (!this.moduleInitialized.has('CategoryManager')) {
            console.log('[App] ⏳ Waiting for CategoryManager before initializing EmailScanner...');
            await this.ensureCategoryManagerReady();
        }
        
        if (window.emailScanner && window.emailScanner.isInitialized) {
            console.log('[App] ✅ EmailScanner already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.emailScanner && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.emailScanner) {
            console.warn('[App] EmailScanner not available yet');
            return false;
        }
        
        // Vérifier que EmailScanner a accès à CategoryManager
        if (!window.emailScanner.categoryManager && window.categoryManager) {
            console.log('[App] 🔗 Linking CategoryManager to EmailScanner...');
            window.emailScanner.categoryManager = window.categoryManager;
        }
        
        console.log('[App] ✅ EmailScanner ready');
        return true;
    }

    async ensureTaskManagerReady() {
        console.log('[App] Ensuring TaskManager is ready...');
        
        // Attendre que CategoryManager soit prêt d'abord
        if (!this.moduleInitialized.has('CategoryManager')) {
            console.log('[App] ⏳ Waiting for CategoryManager before initializing TaskManager...');
            await this.ensureCategoryManagerReady();
        }
        
        if (window.taskManager && window.taskManager.initialized) {
            console.log('[App] ✅ TaskManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while ((!window.taskManager || !window.taskManager.initialized) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.taskManager || !window.taskManager.initialized) {
            console.error('[App] TaskManager not ready after waiting');
            return false;
        }
        
        const essentialMethods = ['createTaskFromEmail', 'createTask', 'updateTask', 'deleteTask', 'getStats'];
        for (const method of essentialMethods) {
            if (typeof window.taskManager[method] !== 'function') {
                console.error(`[App] TaskManager missing essential method: ${method}`);
                return false;
            }
        }
        
        console.log('[App] ✅ TaskManager ready with', window.taskManager.getAllTasks().length, 'tasks');
        return true;
    }

    async ensurePageManagerReady() {
        console.log('[App] Ensuring PageManager is ready...');
        
        if (window.pageManager) {
            console.log('[App] ✅ PageManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.pageManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.pageManager) {
            console.error('[App] PageManager not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ PageManager ready');
        return true;
    }

    async ensureTasksViewReady() {
        console.log('[App] Ensuring TasksView is ready...');
        
        if (window.tasksView) {
            console.log('[App] ✅ TasksView already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.tasksView && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.tasksView) {
            console.warn('[App] TasksView not ready after 3 seconds - will work without it');
            return false;
        }
        
        console.log('[App] ✅ TasksView ready');
        return true;
    }

    async ensureDashboardModuleReady() {
        console.log('[App] Ensuring DashboardModule is ready...');
        
        if (window.dashboardModule) {
            console.log('[App] ✅ DashboardModule already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.dashboardModule && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.dashboardModule) {
            console.error('[App] DashboardModule not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ DashboardModule ready');
        return true;
    }

    // Méthode pour notifier les modules que leurs dépendances sont prêtes
    notifyModuleDependencyReady(moduleName) {
        console.log(`[App] 📢 Notifying modules that ${moduleName} is ready`);
        
        // Dispatcher un événement global
        try {
            window.dispatchEvent(new CustomEvent('moduleReady', {
                detail: {
                    moduleName: moduleName,
                    timestamp: Date.now(),
                    source: 'App'
                }
            }));
        } catch (error) {
            console.error('[App] Error dispatching moduleReady event:', error);
        }
        
        // Traiter la queue des modules en attente
        this.processModuleQueue();
    }

    processModuleQueue() {
        console.log('[App] Processing module queue...');
        
        while (this.moduleQueue.length > 0) {
            const queuedModule = this.moduleQueue.shift();
            console.log(`[App] Processing queued module: ${queuedModule.name}`);
            
            try {
                queuedModule.initFunction();
            } catch (error) {
                console.error(`[App] Error initializing queued module ${queuedModule.name}:`, error);
            }
        }
    }

    // =====================================
    // GESTION INTELLIGENTE DU SCROLL (inchangée)
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        // Variables pour éviter les boucles infinies
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        let lastContentHeight = 0;
        let lastViewportHeight = 0;
        
        // Fonction pour vérifier si le scroll est nécessaire
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) {
                return;
            }
            
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const currentPage = this.currentPage || 'dashboard';
                    
                    // Vérifier si les dimensions ont réellement changé
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
                    
                    // Autres pages: scroll seulement si vraiment nécessaire
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
                    console.error('[SCROLL_MANAGER] Error checking scroll:', error);
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150);
        };

        // Fonction pour définir le mode de page
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) {
                return;
            }
            
            const body = document.body;
            
            // Mettre à jour la page actuelle
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            // Nettoyer les anciennes classes de page
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode'
            );
            
            // Ajouter la nouvelle classe de page
            body.classList.add(`page-${pageName}`);
            
            // Réinitialiser l'état du scroll
            lastScrollState = null;
            lastContentHeight = 0;
            lastViewportHeight = 0;
            
            // Dashboard: configuration immédiate
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
                body.style.overflowY = 'hidden';
                body.style.overflowX = 'hidden';
                lastScrollState = 'dashboard-no-scroll';
                return;
            }
            
            // Autres pages: vérifier après stabilisation du contenu
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
                if (this.currentPage === 'dashboard') {
                    return;
                }
                
                const significantChanges = mutations.some(mutation => {
                    if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        const target = mutation.target;
                        
                        if (attrName === 'style' && target === document.body) {
                            return false;
                        }
                        if (attrName === 'class' && target === document.body) {
                            return false;
                        }
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
            
            if (!sizeChanged || this.currentPage === 'dashboard') {
                return;
            }
            
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

    bindModuleMethods() {
        // Bind TaskManager methods
        if (window.taskManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.taskManager)).forEach(name => {
                    if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
                        window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
                    }
                });
                console.log('[App] ✅ TaskManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding TaskManager methods:', error);
            }
        }
        
        // Bind autres modules...
        if (window.pageManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.pageManager)).forEach(name => {
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
    // VÉRIFICATION DE L'AUTHENTIFICATION DUAL PROVIDER (inchangée)
    // =====================================
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status for both providers...');
        
        // Vérifier d'abord s'il y a un callback Google à traiter
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            this.showAppWithTransition();
            return;
        }
        
        // Vérifier Microsoft d'abord
        if (window.authService && window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] Microsoft authentication found, getting user info...');
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
                        console.log('[App] Microsoft token seems invalid, clearing auth');
                        await window.authService.reset();
                    }
                }
            }
        }
        
        // Vérifier Google ensuite
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                console.log('[App] Google authentication found, getting user info...');
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
        console.log('[App] No valid authentication found');
        this.showLogin();
    }

    // =====================================
    // GESTION DU CALLBACK GOOGLE OAuth2 (inchangée)
    // =====================================
    async handleGoogleCallback() {
        console.log('[App] Handling Google OAuth2 callback...');
        
        try {
            // Vérifier s'il y a des données de callback Google
            const callbackDataStr = sessionStorage.getItem('google_callback_data');
            if (!callbackDataStr) {
                console.log('[App] No Google callback data found');
                return false;
            }
            
            const callbackData = JSON.parse(callbackDataStr);
            console.log('[App] Found Google callback data:', callbackData);
            
            // Nettoyer les données de callback
            sessionStorage.removeItem('google_callback_data');
            
            // Traiter le callback avec le service Google
            const urlParams = new URLSearchParams();
            urlParams.set('code', callbackData.code);
            urlParams.set('state', callbackData.state);
            
            const success = await window.googleAuthService.handleOAuthCallback(urlParams);
            
            if (success) {
                console.log('[App] ✅ Google callback handled successfully');
                
                // Obtenir les informations utilisateur
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
        
        if (error.message.includes('Configuration invalid')) {
            this.showConfigurationError(['Configuration invalide - vérifiez la configuration']);
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

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // NAVIGATION CORRIGÉE
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
            
            if (event.reason && event.reason.message && 
                event.reason.message.includes('Cannot read properties of undefined')) {
                
                if (event.reason.message.includes('createTaskFromEmail')) {
                    console.error('[App] TaskManager createTaskFromEmail error detected');
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur du gestionnaire de tâches. Veuillez actualiser la page.',
                            'warning'
                        );
                    }
                }
            }
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });
    }

    // =====================================
    // MÉTHODES DE CONNEXION DUAL PROVIDER (inchangées)
    // =====================================

    // Méthode de connexion unifiée (backward compatibility)
    async login() {
        console.log('[App] Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    // Connexion Microsoft spécifique
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
            } else if (error.message.includes('unauthorized_client')) {
                errorMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    // Connexion Google spécifique - SANS IFRAME
    async loginGoogle() {
        console.log('[App] Google login attempted...');
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService.isInitialized) {
                console.log('[App] Google AuthService not initialized, initializing...');
                await window.googleAuthService.initialize();
            }
            
            // Le service Google redirige automatiquement, pas besoin d'attendre
            await window.googleAuthService.login();
            
            // Cette ligne ne sera jamais atteinte car login() redirige
            console.log('[App] This should not be reached due to redirect');
            
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
            console.error('[App] Logout error:', error);
            this.hideModernLoading();
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de déconnexion. Nettoyage forcé...', 'warning');
            }
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] Force cleanup dual provider...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        
        // Réinitialiser système de dépendances
        this.moduleInitPromises.clear();
        this.moduleInitialized.clear();
        this.moduleQueue = [];
        
        // Nettoyer les deux services d'authentification
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        // Nettoyer le localStorage sélectivement
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
        
        // Nettoyer sessionStorage aussi
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
        console.log('[App] Showing application with transition - Provider:', this.activeProvider);
        
        this.hideModernLoading();
        
        // Retirer le mode login et activer le mode app
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active');
        console.log('[App] App mode activated');
        
        // Afficher les éléments
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
            console.log('[App] Header displayed');
        }
        
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
            console.log('[App] Navigation displayed');
        }
        
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        }
        
        // Mettre à jour l'interface utilisateur avec le provider
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Mettre à jour l'affichage utilisateur avec badge provider
        if (window.updateUserDisplay) {
            window.updateUserDisplay(this.user);
        }
        
        // INITIALISATION DASHBOARD VIA MODULE
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        // Forcer immédiatement pas de scroll pour le dashboard
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        console.log('[App] Dashboard scroll forcé à hidden');
        
        // CHARGER LE DASHBOARD VIA LE MODULE
        if (window.dashboardModule) {
            console.log('[App] Loading dashboard via dashboardModule...');
            setTimeout(() => {
                window.dashboardModule.render();
                console.log('[App] Dashboard loaded via module for provider:', this.activeProvider);
            }, 100);
        } else {
            console.warn('[App] Dashboard module not available, will retry...');
            setTimeout(() => {
                if (window.dashboardModule) {
                    window.dashboardModule.render();
                }
            }, 500);
        }
        
        // Forcer l'affichage avec CSS
        this.forceAppDisplay();
        
        console.log(`[App] ✅ Application fully displayed with ${this.activeProvider} provider`);
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
        console.log('[App] Force display CSS injected');
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
    // DIAGNOSTIC ET INFORMATIONS DUAL PROVIDER
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
            moduleInitialized: Array.from(this.moduleInitialized),
            moduleQueueLength: this.moduleQueue.length,
            microsoftAuthService: window.authService ? {
                isInitialized: window.authService.isInitialized,
                isAuthenticated: window.authService.isAuthenticated()
            } : null,
            googleAuthService: window.googleAuthService ? {
                isInitialized: window.googleAuthService.isInitialized,
                isAuthenticated: window.googleAuthService.isAuthenticated(),
                method: 'Direct OAuth2 (sans iframe)',
                avoidsiFrameError: true
            } : null,
            services: window.checkServices ? window.checkServices() : null,
            googleCallbackData: sessionStorage.getItem('google_callback_data'),
            sessionData: {
                googleCallback: !!sessionStorage.getItem('google_callback_data'),
                googleToken: !!localStorage.getItem('google_token_emailsortpro'),
                directToken: !!sessionStorage.getItem('direct_token_data')
            },
            moduleAvailability: {
                CategoryManager: !!window.categoryManager,
                TaskManager: !!window.taskManager,
                EmailScanner: !!window.emailScanner,
                PageManager: !!window.pageManager,
                DashboardModule: !!window.dashboardModule
            }
        };
    }
}

// =====================================
// FONCTIONS GLOBALES D'URGENCE DUAL PROVIDER
// =====================================

window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered for dual provider');
    
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
    
    // Nettoyer sessionStorage
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

// =====================================
// VÉRIFICATION DES SERVICES DUAL PROVIDER AMÉLIORÉE
// =====================================
function checkServicesReady() {
    const requiredServices = ['uiManager'];
    const authServices = ['authService', 'googleAuthService'];
    const criticalModules = ['CategoryManager']; // CategoryManager est critique
    const optionalServices = ['mailService', 'emailScanner', 'dashboardModule'];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const availableAuthServices = authServices.filter(service => window[service]);
    const missingCritical = criticalModules.filter(module => !window[module.toLowerCase()]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    if (missingRequired.length > 0) {
        console.error('[App] Missing REQUIRED services:', missingRequired);
        return false;
    }
    
    if (availableAuthServices.length === 0) {
        console.error('[App] No authentication services available:', authServices);
        return false;
    }
    
    if (missingCritical.length > 0) {
        console.warn('[App] Missing CRITICAL modules (will try to create):', missingCritical);
        // Ne pas retourner false, mais noter qu'il faut créer ces modules
    }
    
    if (missingOptional.length > 0) {
        console.warn('[App] Missing optional services:', missingOptional);
    }
    
    if (!window.AppConfig) {
        console.error('[App] Missing AppConfig');
        return false;
    }
    
    console.log('[App] Available auth services:', availableAuthServices);
    console.log('[App] Critical modules status:', criticalModules.map(m => ({
        module: m,
        available: !!window[m.toLowerCase()]
    })));
    
    return true;
}

// =====================================
// INITIALISATION PRINCIPALE DUAL PROVIDER ROBUSTE
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating dual provider app instance...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        const maxAttempts = 100; // Plus de tentatives pour système robuste
        
        if (checkServicesReady()) {
            console.log('[App] All required services ready, initializing dual provider app...');
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else if (attempts < maxAttempts) {
            if (attempts % 25 === 0) { // Log moins fréquent
                console.log(`[App] Waiting for services... (${attempts + 1}/${maxAttempts})`);
            }
            setTimeout(() => waitForServices(attempts + 1), 50); // Check plus fréquent
        } else {
            console.error('[App] Timeout waiting for services, initializing anyway...');
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
// DIAGNOSTIC GLOBAL DUAL PROVIDER
// =====================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION DUAL PROVIDER v4.1 - EmailSortPro');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            console.log('📱 App Status:', appDiag);
            
            // Services
            if (appDiag.services) {
                console.log('🛠️ Services:', appDiag.services);
            }
            
            // Microsoft
            if (appDiag.microsoftAuthService) {
                console.log('🔵 Microsoft Auth:', appDiag.microsoftAuthService);
            }
            
            // Google
            if (appDiag.googleAuthService) {
                console.log('🔴 Google Auth:', appDiag.googleAuthService);
            }
            
            // Session Data
            if (appDiag.sessionData) {
                console.log('💾 Session Data:', appDiag.sessionData);
            }
            
            // Module Availability
            console.log('🧩 Module Availability:', appDiag.moduleAvailability);
            console.log('✅ Modules Initialized:', appDiag.moduleInitialized);
            console.log('⏳ Module Queue Length:', appDiag.moduleQueueLength);
            
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
    console.group('🧪 TEST CategoryManager v4.1 - Robust Dependency');
    
    const provider = window.app?.detectProvider?.() || 'unknown';
    console.log('Provider détecté:', provider);
    
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
        } else {
            console.warn('testEmail method not available');
        }
    });
    
    const stats = window.categoryManager.getCategoryStats?.() || {};
    console.log('Stats:', stats);
    
    console.groupEnd();
    return { success: true, testsRun: tests.length, provider: provider, stats: stats };
};

console.log('✅ App v4.1 loaded - DUAL PROVIDER with ROBUST DEPENDENCY MANAGEMENT');
