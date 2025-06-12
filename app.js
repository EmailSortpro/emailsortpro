// app.js - Application avec gestion intelligente du scroll et navigation dashboard via module

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard'; // Suivre la page actuelle
        
        console.log('[App] Constructor - Application starting...');
    }

    async init() {
        console.log('[App] Initializing...');
        
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

            console.log('[App] Initializing auth service...');
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 20000)
            );
            
            const initPromise = window.authService.initialize();
            await Promise.race([initPromise, initTimeout]);
            
            console.log('[App] Auth service initialized');
            
            // INITIALISER LES MODULES CRITIQUES
            await this.initializeCriticalModules();
            
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // =====================================
    // INITIALISATION DES MODULES CRITIQUES
    // =====================================
    async initializeCriticalModules() {
        console.log('[App] Initializing critical modules...');
        
        // 1. Vérifier TaskManager
        await this.ensureTaskManagerReady();
        
        // 2. Vérifier PageManager
        await this.ensurePageManagerReady();
        
        // 3. Vérifier TasksView
        await this.ensureTasksViewReady();
        
        // 4. Vérifier DashboardModule
        await this.ensureDashboardModuleReady();
        
        // 5. Bind methods
        this.bindModuleMethods();
        
        // 6. Initialiser la gestion du scroll
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialized');
    }

    // =====================================
    // GESTION INTELLIGENTE DU SCROLL CORRIGÉE
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        // Variables pour éviter les boucles infinies
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        let lastContentHeight = 0;
        let lastViewportHeight = 0;
        
        // Fonction pour vérifier si le scroll est nécessaire - AVEC PROTECTION CONTRE LES BOUCLES
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) {
                console.log('[SCROLL_MANAGER] Check already in progress, skipping...');
                return;
            }
            
            scrollCheckInProgress = true;
            
            // Délai pour permettre aux modifications DOM de se stabiliser
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
                    
                    console.log('[SCROLL_MANAGER]', {
                        currentPage,
                        contentHeight,
                        viewportHeight,
                        dimensionsChanged,
                        needsScroll: contentHeight > viewportHeight + 100
                    });
                    
                    // Dashboard: JAMAIS de scroll
                    if (currentPage === 'dashboard') {
                        const newState = 'dashboard-no-scroll';
                        if (lastScrollState !== newState) {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                            lastScrollState = newState;
                            console.log('[SCROLL_MANAGER] Dashboard - scroll disabled');
                        }
                        scrollCheckInProgress = false;
                        return;
                    }
                    
                    // Autres pages: scroll seulement si vraiment nécessaire
                    const threshold = 100;
                    const needsScroll = contentHeight > viewportHeight + threshold;
                    const newState = needsScroll ? 'scroll-enabled' : 'scroll-disabled';
                    
                    // Ne modifier le DOM que si l'état change réellement
                    if (lastScrollState !== newState || dimensionsChanged) {
                        if (needsScroll) {
                            body.classList.add('needs-scroll');
                            body.style.overflow = '';
                            body.style.overflowY = '';
                            body.style.overflowX = '';
                            console.log('[SCROLL_MANAGER] Scroll enabled for', currentPage);
                        } else {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                            console.log('[SCROLL_MANAGER] Scroll disabled for', currentPage);
                        }
                        lastScrollState = newState;
                    } else {
                        console.log('[SCROLL_MANAGER] No state change needed for', currentPage);
                    }
                    
                } catch (error) {
                    console.error('[SCROLL_MANAGER] Error checking scroll:', error);
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150); // Délai augmenté pour plus de stabilité
        };

        // Fonction pour définir le mode de page - OPTIMISÉE
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) {
                console.log('[PAGE_MODE] Same page or invalid page name, skipping...');
                return;
            }
            
            const body = document.body;
            
            // Mettre à jour la page actuelle
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            console.log(`[PAGE_MODE] Switching from ${previousPage} to ${pageName}`);
            
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
                console.log('[PAGE_MODE] Dashboard - scroll immediately disabled');
                return;
            }
            
            // Autres pages: vérifier après stabilisation du contenu
            setTimeout(() => {
                if (this.currentPage === pageName) { // Vérifier qu'on est toujours sur la même page
                    this.checkScrollNeeded();
                }
            }, 300);
        };

        // Observer optimisé pour les changements de contenu
        if (window.MutationObserver) {
            let observerTimeout;
            let pendingMutations = false;
            
            const contentObserver = new MutationObserver((mutations) => {
                // Ignorer pour le dashboard
                if (this.currentPage === 'dashboard') {
                    return;
                }
                
                // Filtrer les mutations importantes
                const significantChanges = mutations.some(mutation => {
                    // Ignorer les changements de style/classe liés au scroll
                    if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        const target = mutation.target;
                        
                        if (attrName === 'style' && target === document.body) {
                            return false; // Ignorer les changements de style sur body
                        }
                        if (attrName === 'class' && target === document.body) {
                            return false; // Ignorer les changements de classe sur body
                        }
                    }
                    
                    // Considérer les ajouts/suppressions d'éléments
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
                            console.log('[SCROLL_MANAGER] Significant content change detected');
                            this.checkScrollNeeded();
                        }
                        pendingMutations = false;
                    }, 250);
                }
            });

            // Observer avec configuration optimisée
            contentObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
                attributeOldValue: false
            });

            console.log('[SCROLL_MANAGER] Optimized content observer initialized');
        }

        // Gestionnaire de redimensionnement optimisé
        let resizeTimeout;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        window.addEventListener('resize', () => {
            const currentSize = { width: window.innerWidth, height: window.innerHeight };
            
            // Vérifier si la taille a réellement changé de manière significative
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
                    console.log('[SCROLL_MANAGER] Window resized significantly');
                    this.checkScrollNeeded();
                }
            }, 300);
        });

        console.log('[App] ✅ Optimized scroll manager initialized');
    }

    async ensureTaskManagerReady() {
        console.log('[App] Ensuring TaskManager is ready...');
        
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
            console.error('[App] TaskManager not ready after 5 seconds');
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
        
        // Bind PageManager methods
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
        
        // Bind TasksView methods
        if (window.tasksView) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.tasksView)).forEach(name => {
                    if (name !== 'constructor' && typeof window.tasksView[name] === 'function') {
                        window.tasksView[name] = window.tasksView[name].bind(window.tasksView);
                    }
                });
                console.log('[App] ✅ TasksView methods bound');
            } catch (error) {
                console.warn('[App] Error binding TasksView methods:', error);
            }
        }

        // Bind DashboardModule methods
        if (window.dashboardModule) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.dashboardModule)).forEach(name => {
                    if (name !== 'constructor' && typeof window.dashboardModule[name] === 'function') {
                        window.dashboardModule[name] = window.dashboardModule[name].bind(window.dashboardModule);
                    }
                });
                console.log('[App] ✅ DashboardModule methods bound');
            } catch (error) {
                console.warn('[App] Error binding DashboardModule methods:', error);
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

        if (!window.authService) {
            console.error('[App] AuthService not available');
            this.showError('Authentication service not available. Please refresh the page.');
            return false;
        }

        return true;
    }

    async checkAuthenticationStatus() {
        if (window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] Getting user info...');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.isAuthenticated = true;
                    console.log('[App] User authenticated:', this.user.displayName || this.user.mail);
                    this.showAppWithTransition();
                } catch (userInfoError) {
                    console.error('[App] Error getting user info:', userInfoError);
                    if (userInfoError.message.includes('401') || userInfoError.message.includes('403')) {
                        console.log('[App] Token seems invalid, clearing auth and showing login');
                        await window.authService.reset();
                        this.showLogin();
                    } else {
                        this.showLogin();
                    }
                }
            } else {
                console.log('[App] No active account found');
                this.showLogin();
            }
        } else {
            console.log('[App] User not authenticated');
            this.showLogin();
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

    showConfigurationError(issues) {
        console.error('[App] Configuration error:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="hero-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: white;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Configuration requise</h1>
                        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px;">Pour résoudre :</h4>
                                <ol style="margin-left: 20px;">
                                    <li>Cliquez sur "Configurer l'application"</li>
                                    <li>Suivez l'assistant de configuration</li>
                                    <li>Entrez votre Azure Client ID</li>
                                </ol>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="setup.html" class="cta-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="cta-button" style="background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3);">
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

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            
            newLoginBtn.addEventListener('click', () => this.login());
        }

        // NAVIGATION CORRIGÉE - UTILISER LE DASHBOARD MODULE
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    // Mettre à jour la page actuelle AVANT de charger
                    this.currentPage = page;
                    
                    // Définir le mode de page avant de charger
                    if (window.setPageMode) {
                        window.setPageMode(page);
                    }
                    
                    // Utiliser PageManager pour toutes les pages, y compris dashboard
                    window.pageManager.loadPage(page);
                }
            });
        });

        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            if (event.error && event.error.message && 
                event.error.message.includes('ScanStart.js') && 
                event.error.message.includes('Unexpected token')) {
                console.warn('[App] ScanStart.js syntax error detected - handled inline');
                return;
            }
            
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

    async login() {
        console.log('[App] Login attempted...');
        
        try {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';
            }
            
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                console.log('[App] AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion. Veuillez réessayer.';
            
            if (error.errorCode) {
                const errorCode = error.errorCode;
                if (window.AppConfig.errors && window.AppConfig.errors[errorCode]) {
                    errorMessage = window.AppConfig.errors[errorCode];
                } else {
                    switch (errorCode) {
                        case 'popup_window_error':
                            errorMessage = 'Popup bloqué. Autorisez les popups et réessayez.';
                            break;
                        case 'user_cancelled':
                            errorMessage = 'Connexion annulée.';
                            break;
                        case 'network_error':
                            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                            break;
                        case 'unauthorized_client':
                            errorMessage = 'Configuration incorrecte. Vérifiez votre Azure Client ID.';
                            break;
                        default:
                            errorMessage = `Erreur: ${errorCode}`;
                    }
                }
            } else if (error.message.includes('unauthorized_client')) {
                errorMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fab fa-microsoft"></i> Se connecter à Outlook';
            }
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            if (window.authService) {
                await window.authService.logout();
            } else {
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
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        
        if (window.authService) {
            window.authService.forceCleanup();
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
        console.log('[App] Showing application with transition');
        
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
        
        // Mettre à jour l'interface utilisateur
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
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
                console.log('[App] Dashboard loaded via module');
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
        
        console.log('[App] ✅ Application fully displayed with dashboard module');
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
                <div class="hero-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: white;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Erreur d'application</h1>
                        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="cta-button">
                                <i class="fas fa-refresh"></i>
                                Actualiser la page
                            </button>
                            <button onclick="window.app.forceCleanup()" class="cta-button" style="background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3);">
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

    checkScanStartModule() {
        console.log('[App] Checking ScanStart module...');
        
        if (!window.scanStartModule) {
            console.warn('[App] ScanStart module not available');
            return {
                available: false,
                error: 'Module not loaded'
            };
        }
        
        if (typeof window.scanStartModule.render !== 'function') {
            console.warn('[App] ScanStart module incomplete');
            return {
                available: false,
                error: 'Module incomplete - missing render method'
            };
        }
        
        console.log('[App] ScanStart module OK');
        return {
            available: true,
            methods: Object.keys(window.scanStartModule)
        };
    }
}

// =====================================
// FONCTIONS GLOBALES D'URGENCE
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
// VÉRIFICATION DES SERVICES
// =====================================
function checkServicesReady() {
    const requiredServices = ['authService', 'uiManager'];
    const optionalServices = ['mailService', 'emailScanner', 'categoryManager', 'dashboardModule'];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    if (missingRequired.length > 0) {
        console.error('[App] Missing REQUIRED services:', missingRequired);
        return false;
    }
    
    if (missingOptional.length > 0) {
        console.warn('[App] Missing optional services:', missingOptional);
    }
    
    if (!window.AppConfig) {
        console.error('[App] Missing AppConfig');
        return false;
    }
    
    return true;
}

// =====================================
// INITIALISATION PRINCIPALE
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating app instance...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        const maxAttempts = 50;
        
        if (checkServicesReady()) {
            console.log('[App] All required services ready, initializing...');
            
            const scanStartStatus = window.app.checkScanStartModule();
            console.log('[App] ScanStart status:', scanStartStatus);
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else if (attempts < maxAttempts) {
            console.log(`[App] Waiting for services... (${attempts + 1}/${maxAttempts})`);
            setTimeout(() => waitForServices(attempts + 1), 100);
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

console.log('✅ App loaded - DASHBOARD VIA MODULE dashboard.js');
