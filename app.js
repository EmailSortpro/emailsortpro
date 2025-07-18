// app.js - Application principale EmailSortPro v4.0.2
// VERSION CORRIGÉE: Dashboard chargé par défaut pour Gmail ET Outlook

class EmailSortProApp {
    constructor() {
        this.version = '4.0.2';
        this.isInitialized = false;
        this.initPromise = null;
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.user = null;
        this.currentPage = null;
        this.pageManagers = new Map();
        this.initializationComplete = false;
        
        console.log(`[App] EmailSortPro v${this.version} starting...`);
        
        // Configuration des pages disponibles
        this.availablePages = {
            dashboard: { 
                module: 'dashboardModule', 
                method: 'render',
                supportsBothProviders: true,
                isDefault: true
            },
            scanner: { 
                module: 'unifiedScanModule', 
                method: 'render',
                needsContainer: true,
                supportsBothProviders: true 
            },
            emails: { 
                module: null,
                usePageManager: true,
                supportsBothProviders: true 
            },
            tasks: { 
                module: 'tasksView', 
                method: 'render',
                needsContainer: true,
                supportsBothProviders: true 
            },
            ranger: { 
                module: 'modernDomainOrganizer', 
                method: 'render',
                needsContainer: true,
                supportsBothProviders: true 
            },
            settings: { 
                module: 'categoriesPage', 
                method: 'render',
                needsContainer: true,
                supportsBothProviders: true 
            }
        };
        
        // AJOUT MINIMAL: Détecter la langue du navigateur pour Google Translate
        const browserLang = navigator.language || navigator.userLanguage;
        window.detectedLanguage = browserLang.split('-')[0];
        console.log(`[App] Browser language detected: ${browserLang}`);
        
        // Écouter les événements d'authentification
        this.setupAuthListeners();
        
        // Lancer l'initialisation
        this.init();
    }
    
    setupAuthListeners() {
        // Écouter quand GoogleAuthService est prêt
        window.addEventListener('googleAuthReady', (event) => {
            console.log('[App] Google Auth Ready event:', event.detail);
            if (event.detail.authenticated && !this.currentProvider) {
                this.currentProvider = 'google';
                this.isAuthenticated = true;
                this.user = event.detail.user;
                this.handleAuthReady();
            }
        });
        
        // Écouter le succès de l'authentification Google
        window.addEventListener('googleAuthSuccess', (event) => {
            console.log('[App] Google Auth Success event:', event.detail);
            this.currentProvider = 'google';
            this.isAuthenticated = true;
            this.user = event.detail.user;
            window.location.reload();
        });
        
        // Écouter les changements de provider
        window.addEventListener('providerChanged', (event) => {
            console.log('[App] Provider changed:', event.detail);
            this.handleProviderChange(event.detail.provider);
        });
    }
    
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._doInit();
        return this.initPromise;
    }
    
    async _doInit() {
        console.log('[App] Starting initialization...');
        
        try {
            // 1. Attendre que le DOM soit prêt
            await this.waitForDOM();
            
            // 2. Masquer tout contenu visible par défaut
            this.hideAllInitialContent();
            
            // 3. Vérifier immédiatement l'authentification stockée
            const quickAuthCheck = this.quickAuthCheck();
            if (quickAuthCheck.authenticated) {
                console.log('[App] ✅ Quick auth check passed:', quickAuthCheck.provider);
                this.currentProvider = quickAuthCheck.provider;
                this.isAuthenticated = true;
                
                // Sauvegarder le provider actuel
                sessionStorage.setItem('lastAuthProvider', this.currentProvider);
                
                // Afficher l'interface immédiatement
                this.showAppInterface();
                
                // Continuer l'initialisation en arrière-plan
                this.backgroundInit();
                return;
            }
            
            // 4. Attendre que les services soient chargés
            await this.waitForServices();
            
            // 5. Initialiser les services
            await this.initializeAuthServices();
            
            // 6. Vérifier l'authentification complète
            const isAuthenticated = await this.checkAuthentication();
            
            if (isAuthenticated) {
                console.log('[App] ✅ User authenticated with', this.currentProvider);
                sessionStorage.setItem('lastAuthProvider', this.currentProvider);
                this.showAppInterface();
                await this.initializeAppComponents();
                await this.updateUserDisplay();
                await this.initializePageManagers();
                
                // IMPORTANT: Attendre un peu plus pour Outlook
                if (this.currentProvider === 'microsoft' || this.currentProvider === 'outlook') {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                // Charger le dashboard après l'initialisation
                this.ensureDashboardLoaded();
            } else {
                console.log('[App] User not authenticated');
                this.showLoginPage();
            }
            
            // 7. Configurer les événements
            this.setupEventHandlers();
            
            // 8. Initialiser les modules de pages
            this.initializePageModules();
            
            this.isInitialized = true;
            this.initializationComplete = true;
            console.log('[App] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[App] ❌ Initialization error:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
        }
    }
    
    hideAllInitialContent() {
        // Masquer tous les contenus de page qui pourraient être visibles
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            // Masquer tous les enfants directs
            const children = pageContent.children;
            for (let child of children) {
                child.style.display = 'none';
            }
            
            // Masquer spécifiquement les pages connues
            const pagesToHide = [
                '.dashboard-container',
                '.categories-page',
                '.scanner-container',
                '.emails-page-modern',
                '.tasks-page',
                '.ranger-page',
                '.settings-page'
            ];
            
            pagesToHide.forEach(selector => {
                const elements = pageContent.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none';
                });
            });
        }
    }
    
    quickAuthCheck() {
        try {
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            
            // Vérifier token Google
            const googleToken = localStorage.getItem('google_token_emailsortpro');
            if (googleToken) {
                try {
                    const tokenData = JSON.parse(googleToken);
                    if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                        return { authenticated: true, provider: 'google' };
                    }
                } catch (e) {}
            }
            
            // Vérifier MSAL
            const msalKeys = localStorage.getItem('msal.account.keys');
            if (msalKeys && lastProvider === 'microsoft') {
                return { authenticated: true, provider: 'microsoft' };
            }
            
        } catch (error) {
            console.warn('[App] Quick auth check error:', error);
        }
        
        return { authenticated: false, provider: null };
    }
    
    async backgroundInit() {
        try {
            await this.waitForServices();
            await this.initializeAuthServices();
            await this.initializeAppComponents();
            await this.updateUserDisplay();
            await this.initializePageManagers();
            
            // Attendre un peu plus pour s'assurer que tout est prêt
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Charger le dashboard
            this.ensureDashboardLoaded();
            
            this.setupEventHandlers();
            this.initializePageModules();
            this.isInitialized = true;
            this.initializationComplete = true;
        } catch (error) {
            console.error('[App] Background init error:', error);
        }
    }
    
    handleAuthReady() {
        if (!document.body.classList.contains('app-active')) {
            console.log('[App] Auth ready, showing app interface');
            this.showAppInterface();
            this.backgroundInit();
        }
    }
    
    async waitForDOM() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
    }
    
    async waitForServices() {
        console.log('[App] Waiting for services...');
        
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const servicesReady = 
                window.authService && 
                window.googleAuthService && 
                window.mailService && 
                window.uiManager;
            
            if (servicesReady) {
                console.log('[App] ✅ Services loaded');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn('[App] Some services missing after timeout');
    }
    
    async initializeAuthServices() {
        console.log('[App] Initializing auth services...');
        
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        
        // Initialiser Google en premier si c'était le dernier provider
        if (lastProvider === 'google' && window.googleAuthService) {
            try {
                await window.googleAuthService.initialize();
                console.log('[App] ✅ Google auth initialized');
            } catch (error) {
                console.warn('[App] Google auth init warning:', error);
            }
        }
        
        // Initialiser Microsoft
        if (window.authService) {
            try {
                await window.authService.initialize();
                console.log('[App] ✅ Microsoft auth initialized');
            } catch (error) {
                console.warn('[App] Microsoft auth init warning:', error);
            }
        }
        
        // Initialiser Google si pas déjà fait
        if (lastProvider !== 'google' && window.googleAuthService) {
            try {
                await window.googleAuthService.initialize();
                console.log('[App] ✅ Google auth initialized');
            } catch (error) {
                console.warn('[App] Google auth init warning:', error);
            }
        }
    }
    
    async checkAuthentication() {
        console.log('[App] Checking authentication...');
        
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        console.log('[App] Last provider:', lastProvider);
        
        // Vérifier Google d'abord si c'était le dernier
        if (lastProvider === 'google' && window.googleAuthService) {
            if (window.googleAuthService.isAuthenticated()) {
                this.currentProvider = 'google';
                this.isAuthenticated = true;
                this.user = window.googleAuthService.getAccount();
                console.log('[App] ✅ Authenticated with Google');
                return true;
            }
        }
        
        // Vérifier Microsoft
        if (window.authService && window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            this.isAuthenticated = true;
            this.user = window.authService.getAccount();
            console.log('[App] ✅ Authenticated with Microsoft');
            return true;
        }
        
        // Re-vérifier Google
        if (lastProvider !== 'google' && window.googleAuthService) {
            if (window.googleAuthService.isAuthenticated()) {
                this.currentProvider = 'google';
                this.isAuthenticated = true;
                this.user = window.googleAuthService.getAccount();
                console.log('[App] ✅ Authenticated with Google');
                return true;
            }
        }
        
        console.log('[App] ❌ Not authenticated');
        this.isAuthenticated = false;
        return false;
    }
    
    async updateUserDisplay() {
        console.log('[App] Updating user display...');
        
        try {
            let user = null;
            
            if (this.currentProvider === 'google' && window.googleAuthService) {
                const account = window.googleAuthService.getAccount();
                if (account) {
                    user = {
                        displayName: account.displayName || account.name,
                        mail: account.email,
                        email: account.email,
                        provider: 'google'
                    };
                }
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                const account = window.authService.getAccount();
                if (account) {
                    user = {
                        displayName: account.name,
                        mail: account.username,
                        email: account.username,
                        provider: 'microsoft'
                    };
                }
            }
            
            if (user && window.uiManager) {
                window.uiManager.updateAuthStatus(user);
                console.log('[App] ✅ User display updated:', user.email);
            }
            
            // Exposer globalement pour les autres modules
            window.updateUserDisplay = (userData) => {
                if (window.uiManager) {
                    window.uiManager.updateAuthStatus(userData);
                }
            };
            
        } catch (error) {
            console.error('[App] Error updating user display:', error);
        }
    }
    
    showAppInterface() {
        console.log('[App] Showing app interface...');
        
        // Masquer immédiatement tout contenu potentiellement visible
        this.hideAllInitialContent();
        
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        
        // S'assurer que le container est visible mais vide
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = ''; // Vider le contenu
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
        }
        
        // Appeler onAuthSuccess si défini
        if (window.onAuthSuccess) {
            window.onAuthSuccess();
        }
    }
    
    showLoginPage() {
        console.log('[App] Showing login page...');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
    }
    
    async initializeAppComponents() {
        console.log('[App] Initializing app components...');
        
        // Initialiser MailService
        if (window.mailService) {
            try {
                await window.mailService.initialize();
                console.log('[App] ✅ Mail service initialized');
            } catch (error) {
                console.warn('[App] Mail service init warning:', error);
            }
        }
        
        // Initialiser TaskManager
        if (window.taskManager && !window.taskManager.initialized) {
            try {
                await window.taskManager.initialize();
                console.log('[App] ✅ Task manager initialized');
            } catch (error) {
                console.warn('[App] Task manager init warning:', error);
            }
        }
        
        // Initialiser CategoryManager
        if (window.categoryManager && typeof window.categoryManager.initialize === 'function') {
            try {
                await window.categoryManager.initialize();
                console.log('[App] ✅ Category manager initialized');
            } catch (error) {
                console.warn('[App] Category manager init warning:', error);
            }
        }
    }
    
    async initializePageManagers() {
        console.log('[App] Initializing page managers...');
        
        // Initialiser PageManager pour Microsoft/Outlook
        if (window.pageManager) {
            this.pageManagers.set('microsoft', window.pageManager);
            this.pageManagers.set('outlook', window.pageManager);
            console.log('[App] ✅ PageManager (Outlook) registered');
        }
        
        // Initialiser PageManagerGmail pour Google
        if (window.pageManagerGmail) {
            this.pageManagers.set('google', window.pageManagerGmail);
            this.pageManagers.set('gmail', window.pageManagerGmail);
            
            // Étendre PageManagerGmail avec toutes les pages
            this.extendPageManagerGmail();
            
            console.log('[App] ✅ PageManagerGmail registered and extended');
        }
    }
    
    extendPageManagerGmail() {
        if (!window.pageManagerGmail) return;
        
        console.log('[App] Extending PageManagerGmail with all pages...');
        
        // S'assurer que l'objet pages existe
        if (!window.pageManagerGmail.pages) {
            window.pageManagerGmail.pages = {};
        }
        
        // Dashboard
        if (!window.pageManagerGmail.pages.dashboard) {
            window.pageManagerGmail.pages.dashboard = (container) => {
                console.log('[PageManagerGmail] Loading dashboard');
                if (window.dashboardModule) {
                    window.dashboardModule.render();
                }
            };
        }
        
        // Scanner
        if (!window.pageManagerGmail.pages.scanner) {
            window.pageManagerGmail.pages.scanner = (container) => {
                console.log('[PageManagerGmail] Loading scanner');
                if (window.unifiedScanModule) {
                    window.unifiedScanModule.render(container);
                }
            };
        }
        
        // Settings
        if (!window.pageManagerGmail.pages.settings) {
            window.pageManagerGmail.pages.settings = (container) => {
                console.log('[PageManagerGmail] Loading settings');
                if (window.categoriesPage) {
                    window.categoriesPage.render(container);
                }
            };
        }
        
        // Tasks
        if (!window.pageManagerGmail.pages.tasks) {
            window.pageManagerGmail.pages.tasks = (container) => {
                console.log('[PageManagerGmail] Loading tasks');
                if (window.tasksView) {
                    window.tasksView.render(container);
                }
            };
        }
        
        // Ranger
        if (!window.pageManagerGmail.pages.ranger) {
            window.pageManagerGmail.pages.ranger = (container) => {
                console.log('[PageManagerGmail] Loading ranger');
                if (window.modernDomainOrganizer) {
                    window.modernDomainOrganizer.render(container);
                }
            };
        }
        
        console.log('[App] PageManagerGmail extended with pages:', Object.keys(window.pageManagerGmail.pages));
    }
    
    initializePageModules() {
        console.log('[App] Initializing page modules...');
        
        // Initialiser les modules qui en ont besoin
        const modulesToInit = [
            { name: 'dashboardModule', module: window.dashboardModule },
            { name: 'unifiedScanModule', module: window.unifiedScanModule },
            { name: 'tasksView', module: window.tasksView },
            { name: 'modernDomainOrganizer', module: window.modernDomainOrganizer },
            { name: 'categoriesPage', module: window.categoriesPage }
        ];
        
        modulesToInit.forEach(({ name, module }) => {
            if (module && typeof module.initialize === 'function' && !module.initialized) {
                try {
                    module.initialize();
                    console.log(`[App] ✅ ${name} initialized`);
                } catch (error) {
                    console.warn(`[App] Failed to initialize ${name}:`, error);
                }
            }
        });
    }
    
    ensureDashboardLoaded() {
        console.log('[App] Ensuring dashboard is loaded...');
        
        // Vérifier si on est déjà sur le dashboard
        if (this.currentPage === 'dashboard') {
            console.log('[App] Dashboard already current page');
            return;
        }
        
        // Attendre que les services nécessaires soient prêts
        const checkAndLoad = () => {
            // Vérifier que le dashboardModule est disponible
            if (!window.dashboardModule) {
                console.log('[App] Waiting for dashboardModule...');
                setTimeout(checkAndLoad, 100);
                return;
            }
            
            // Vérifier le provider et le PageManager si nécessaire
            if (this.currentProvider === 'microsoft' || this.currentProvider === 'outlook') {
                // Pour Outlook, vérifier que PageManager est prêt
                if (!window.pageManager) {
                    console.log('[App] Waiting for pageManager (Outlook)...');
                    setTimeout(checkAndLoad, 100);
                    return;
                }
            }
            
            // Masquer tout contenu existant
            this.hideAllInitialContent();
            
            // S'assurer que le container est visible
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.style.opacity = '1';
            }
            
            // Forcer le chargement du dashboard
            console.log('[App] Loading dashboard now...');
            this.loadPage('dashboard', true);
        };
        
        // Lancer la vérification
        checkAndLoad();
    }
    
    setupEventHandlers() {
        console.log('[App] Setting up event handlers...');
        
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Vérifier callback Google au chargement
        if (window.location.hash.includes('access_token')) {
            this.handleGoogleCallback();
        }
        
        // Écouter les changements de hash pour la navigation
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash && this.availablePages[hash]) {
                this.loadPage(hash);
            }
        });
    }
    
    handleNavigation(event) {
        event.preventDefault();
        
        const page = event.currentTarget.dataset.page;
        if (!page) return;
        
        console.log('[App] Navigating to:', page);
        
        // Mettre à jour l'URL
        window.location.hash = page;
        
        // Charger la page
        this.loadPage(page);
    }
    
    async loadPage(pageName, forceReload = false) {
        console.log(`[App] Loading page: ${pageName} (provider: ${this.currentProvider})`);
        
        // Vérifier si la page existe
        const pageConfig = this.availablePages[pageName];
        if (!pageConfig) {
            console.error(`[App] Unknown page: ${pageName}`);
            return;
        }
        
        // Ne pas recharger si c'est déjà la page courante (sauf si forcé)
        if (this.currentPage === pageName && !forceReload) {
            console.log(`[App] Page ${pageName} already loaded`);
            return;
        }
        
        // Mettre à jour la navigation
        this.updateNavigation(pageName);
        
        // Sauvegarder la page courante
        this.currentPage = pageName;
        
        // Obtenir le container
        const container = document.getElementById('pageContent');
        if (!container) {
            console.error('[App] Page content container not found');
            return;
        }
        
        try {
            // Masquer tout contenu existant
            this.hideAllInitialContent();
            
            // Effacer le contenu précédent
            container.innerHTML = '';
            container.style.display = 'block';
            container.style.opacity = '1';
            
            // Charger la page selon sa configuration
            if (pageConfig.usePageManager) {
                // Utiliser le PageManager approprié
                await this.loadPageWithPageManager(pageName, container);
            } else if (pageConfig.module) {
                // Utiliser le module directement
                await this.loadPageWithModule(pageName, pageConfig, container);
            } else {
                console.error(`[App] No loader configured for page: ${pageName}`);
            }
            
            // Mettre à jour le mode d'affichage
            if (window.setPageMode) {
                window.setPageMode(pageName);
            }
            
            // Vérifier le scroll
            this.checkScrollNeeded();
            
            console.log(`[App] ✅ Page ${pageName} loaded successfully`);
            
        } catch (error) {
            console.error(`[App] Error loading page ${pageName}:`, error);
            this.showError(`Erreur lors du chargement de la page ${pageName}`);
        }
    }
    
    async loadPageWithPageManager(pageName, container) {
        const pageManager = this.getCurrentPageManager();
        
        if (!pageManager) {
            console.error('[App] No PageManager available for current provider');
            
            // Si c'est la page emails, afficher un état vide approprié
            if (pageName === 'emails') {
                container.innerHTML = `
                    <div class="emails-page-modern">
                        <div class="empty-state" style="margin-top: 40px;">
                            <div class="empty-state-icon">
                                <i class="fas fa-inbox"></i>
                            </div>
                            <h3 class="empty-state-title">Aucun email trouvé</h3>
                            <p class="empty-state-text">
                                Utilisez le scanner pour récupérer et analyser vos emails.
                            </p>
                            <div class="empty-state-actions">
                                <button class="btn btn-primary" onclick="window.app.loadPage('scanner')">
                                    <i class="fas fa-search"></i>
                                    <span>Scanner des emails</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            throw new Error('PageManager not available');
        }
        
        console.log(`[App] Loading ${pageName} with PageManager`);
        
        // S'assurer que le PageManager a la méthode loadPage
        if (typeof pageManager.loadPage === 'function') {
            await pageManager.loadPage(pageName);
        } else {
            console.error('[App] PageManager does not have loadPage method');
            throw new Error('Invalid PageManager');
        }
    }
    
    async loadPageWithModule(pageName, pageConfig, container) {
        const module = window[pageConfig.module];
        
        if (!module) {
            console.error(`[App] Module ${pageConfig.module} not found`);
            throw new Error(`Module ${pageConfig.module} not available`);
        }
        
        const method = pageConfig.method || 'render';
        
        if (typeof module[method] !== 'function') {
            console.error(`[App] Method ${method} not found in module ${pageConfig.module}`);
            throw new Error(`Invalid method ${method}`);
        }
        
        console.log(`[App] Loading ${pageName} with module ${pageConfig.module}`);
        
        // Appeler la méthode du module
        if (pageConfig.needsContainer) {
            await module[method](container);
        } else {
            await module[method]();
        }
    }
    
    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    getCurrentPageManager() {
        if (!this.currentProvider) {
            console.warn('[App] No current provider set');
            return null;
        }
        
        const pageManager = this.pageManagers.get(this.currentProvider);
        
        if (!pageManager) {
            console.warn(`[App] No PageManager found for provider: ${this.currentProvider}`);
            
            // Fallback: essayer de trouver un PageManager compatible
            if (this.currentProvider === 'google' || this.currentProvider === 'gmail') {
                return window.pageManagerGmail || window.pageManager;
            } else if (this.currentProvider === 'microsoft' || this.currentProvider === 'outlook') {
                return window.pageManager || window.pageManagerOutlook;
            }
        }
        
        return pageManager;
    }
    
    handleProviderChange(newProvider) {
        console.log(`[App] Provider changed from ${this.currentProvider} to ${newProvider}`);
        
        this.currentProvider = newProvider;
        sessionStorage.setItem('lastAuthProvider', newProvider);
        
        // Recharger la page courante avec le nouveau provider
        if (this.currentPage) {
            this.loadPage(this.currentPage, true);
        }
        
        // Mettre à jour l'affichage utilisateur
        this.updateUserDisplay();
    }
    
    async handleGoogleCallback() {
        console.log('[App] Processing Google callback...');
        
        try {
            if (window.googleAuthService && window.googleAuthService.handleOAuthCallback) {
                const fragment = window.location.hash;
                await window.googleAuthService.handleOAuthCallback(fragment);
                
                // Nettoyer l'URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('[App] Error handling Google callback:', error);
            this.showError('Erreur d\'authentification Google: ' + error.message);
        }
    }
    
    checkScrollNeeded() {
        const contentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        if (contentHeight > viewportHeight) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
    
    showError(message) {
        console.error('[App]', message);
        
        if (window.uiManager) {
            window.uiManager.showToast(message, 'error', 8000);
        }
    }
    
    // Méthode publique pour le login Microsoft
    async login() {
        console.log('[App] Microsoft login requested');
        
        if (window.authService) {
            try {
                await window.authService.login();
            } catch (error) {
                console.error('[App] Microsoft login error:', error);
                throw error;
            }
        }
    }
    
    // Méthode publique pour le login Google
    async loginGoogle() {
        console.log('[App] Google login requested');
        
        if (window.googleAuthService) {
            try {
                await window.googleAuthService.login();
            } catch (error) {
                console.error('[App] Google login error:', error);
                throw error;
            }
        }
    }
    
    // Méthode publique pour le logout
    async logout() {
        console.log('[App] Logout requested');
        
        try {
            if (this.currentProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            }
            
            this.currentProvider = null;
            this.isAuthenticated = false;
            this.user = null;
            this.currentPage = null;
            
            // Nettoyer les PageManagers
            this.pageManagers.clear();
            
            // Nettoyer le sessionStorage
            sessionStorage.removeItem('lastAuthProvider');
            
            window.location.reload();
        } catch (error) {
            console.error('[App] Logout error:', error);
            window.location.reload();
        }
    }
    
    // Méthode pour recharger la page courante
    refreshCurrentPage() {
        if (this.currentPage) {
            console.log(`[App] Refreshing current page: ${this.currentPage}`);
            this.loadPage(this.currentPage, true);
        }
    }
    
    // Méthode pour obtenir des infos de debug
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            initializationComplete: this.initializationComplete,
            currentProvider: this.currentProvider,
            currentPage: this.currentPage,
            isAuthenticated: this.isAuthenticated,
            user: this.user?.email || null,
            authentication: {
                microsoft: window.authService?.isAuthenticated() || false,
                google: window.googleAuthService?.isAuthenticated() || false,
                lastProvider: sessionStorage.getItem('lastAuthProvider')
            },
            pageManagers: {
                count: this.pageManagers.size,
                providers: Array.from(this.pageManagers.keys()),
                current: this.getCurrentPageManager() ? 'Available' : 'Not available'
            },
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                uiManager: !!window.uiManager,
                pageManager: !!window.pageManager,
                pageManagerGmail: !!window.pageManagerGmail,
                taskManager: !!window.taskManager,
                categoriesPage: !!window.categoriesPage,
                dashboardModule: !!window.dashboardModule,
                unifiedScanModule: !!window.unifiedScanModule,
                tasksView: !!window.tasksView,
                modernDomainOrganizer: !!window.modernDomainOrganizer
            },
            availablePages: Object.keys(this.availablePages)
        };
    }
    
    // Méthode pour vérifier si une page est disponible
    isPageAvailable(pageName) {
        const pageConfig = this.availablePages[pageName];
        if (!pageConfig) return false;
        
        if (pageConfig.module) {
            return !!window[pageConfig.module];
        }
        
        if (pageConfig.usePageManager) {
            const pageManager = this.getCurrentPageManager();
            return pageManager && typeof pageManager.loadPage === 'function';
        }
        
        return false;
    }
}

// Créer l'instance
window.app = new EmailSortProApp();

// Exposer des méthodes globales pour la compatibilité
window.checkScrollNeeded = () => window.app.checkScrollNeeded();
window.refreshCurrentPage = () => window.app.refreshCurrentPage();
window.loadPage = (pageName) => window.app.loadPage(pageName);

// Fonctions de debug
window.debugApp = function() {
    const info = window.app.getDebugInfo();
    console.group('🔍 App Debug Info');
    console.log('App State:', info);
    console.log('Current Provider:', info.currentProvider);
    console.log('Current Page:', info.currentPage);
    console.log('Authenticated:', info.isAuthenticated);
    console.log('Services:', info.services);
    console.log('Page Managers:', info.pageManagers);
    console.groupEnd();
    return info;
};

window.testNavigation = async function() {
    console.group('🧪 Testing Navigation');
    
    const pages = ['dashboard', 'scanner', 'emails', 'tasks', 'ranger', 'settings'];
    
    for (const page of pages) {
        const available = window.app.isPageAvailable(page);
        console.log(`${page}: ${available ? '✅ Available' : '❌ Not available'}`);
    }
    
    console.groupEnd();
};

console.log('[App] ✅ EmailSortPro v4.0.2 loaded - Dashboard par défaut (Gmail + Outlook)');
