// app.js - Application principale EmailSortPro v3.8.0
// CORRECTION COMPLÈTE: Navigation fluide Gmail/Outlook avec gestion correcte des pages

class EmailSortProApp {
    constructor() {
        this.version = '3.8.0';
        this.isInitialized = false;
        this.initPromise = null;
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.user = null;
        this.currentPage = 'dashboard';
        this.pageManagers = new Map(); // Stockage des PageManagers par provider
        
        console.log(`[App] EmailSortPro v${this.version} starting...`);
        
        // Bind des méthodes
        this.init = this.init.bind(this);
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.loadPage = this.loadPage.bind(this);
        
        // Configuration des pages disponibles
        this.availablePages = {
            dashboard: { 
                module: 'dashboardModule', 
                method: 'render',
                supportsBothProviders: true 
            },
            scanner: { 
                module: 'unifiedScanModule', 
                method: 'render',
                needsContainer: true,
                supportsBothProviders: true 
            },
            emails: { 
                module: null, // Géré par PageManager
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
            window.location.reload(); // Recharger pour appliquer l'auth
        });
        
        // Écouter quand GoogleAuthService est initialisé
        window.addEventListener('googleAuthServiceReady', (event) => {
            console.log('[App] Google Auth Service Ready:', event.detail);
            if (event.detail.authenticated && !this.currentProvider) {
                this.currentProvider = 'google';
                this.isAuthenticated = true;
                this.user = event.detail.user;
                this.handleAuthReady();
            }
        });
        
        // Écouter les changements de provider
        window.addEventListener('providerChanged', (event) => {
            console.log('[App] Provider changed:', event.detail);
            this.handleProviderChange(event.detail.provider);
        });
        
        // Écouter quand les emails sont prêts
        window.addEventListener('emailScannerReady', (event) => {
            console.log('[App] EmailScanner ready:', event.detail);
            if (this.currentPage === 'emails') {
                this.loadPage('emails', true); // Forcer le rechargement
            }
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
            
            // 2. Vérifier immédiatement l'authentification stockée
            const quickAuthCheck = this.quickAuthCheck();
            if (quickAuthCheck.authenticated) {
                console.log('[App] ✅ Quick auth check passed:', quickAuthCheck.provider);
                this.currentProvider = quickAuthCheck.provider;
                this.isAuthenticated = true;
                
                // Sauvegarder le provider actuel
                sessionStorage.setItem('lastAuthProvider', this.currentProvider);
                
                // Afficher l'interface immédiatement
                this.showAppInterface();
                
                // IMPORTANT: Charger le dashboard immédiatement
                setTimeout(() => {
                    this.loadDashboard();
                }, 100);
                
                // Continuer l'initialisation en arrière-plan
                this.backgroundInit();
                return;
            }
            
            // 3. Attendre que les services soient chargés
            await this.waitForServices();
            
            // 4. Initialiser les services
            await this.initializeAuthServices();
            
            // 5. Vérifier l'authentification complète
            const isAuthenticated = await this.checkAuthentication();
            
            if (isAuthenticated) {
                console.log('[App] ✅ User authenticated with', this.currentProvider);
                sessionStorage.setItem('lastAuthProvider', this.currentProvider);
                this.showAppInterface();
                await this.initializeAppComponents();
                await this.updateUserDisplay();
                await this.initializePageManagers();
                
                // IMPORTANT: Charger le dashboard après initialisation
                setTimeout(() => {
                    this.loadDashboard();
                }, 100);
            } else {
                console.log('[App] User not authenticated');
                this.showLoginPage();
            }
            
            // 6. Configurer les événements
            this.setupEventHandlers();
            
            // 7. Initialiser les modules de pages
            this.initializePageModules();
            
            this.isInitialized = true;
            console.log('[App] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[App] ❌ Initialization error:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
        }
    }
    
    quickAuthCheck() {
        // Vérification rapide des tokens stockés
        try {
            // Vérifier le provider actif
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
        // Initialisation en arrière-plan après affichage rapide
        try {
            await this.waitForServices();
            await this.initializeAuthServices();
            await this.initializeAppComponents();
            await this.updateUserDisplay();
            await this.initializePageManagers();
            
            // IMPORTANT: Charger le dashboard si pas déjà fait
            if (!this.currentPage) {
                setTimeout(() => {
                    this.loadDashboard();
                }, 100);
            }
            
            this.setupEventHandlers();
            this.initializePageModules();
            this.isInitialized = true;
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
        
        // Initialiser Google en premier si c'était le dernier provider
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        
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
        
        // IMPORTANT: S'assurer que le container est visible
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
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
        
        // Initialiser PageManagerOutlook si disponible
        if (window.pageManagerOutlook) {
            this.pageManagers.set('microsoft-alt', window.pageManagerOutlook);
            console.log('[App] ✅ PageManagerOutlook registered');
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
    
    loadDashboard() {
        console.log('[App] Loading dashboard...');
        
        // S'assurer que le container est visible
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
        }
        
        // Charger le dashboard
        this.loadPage('dashboard');
        
        // Mettre à jour la navigation pour marquer dashboard comme actif
        const dashboardBtn = document.querySelector('.nav-item[data-page="dashboard"]');
        if (dashboardBtn) {
            dashboardBtn.classList.add('active');
        }
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
                
                // Ajouter les styles si nécessaire
                if (!document.getElementById('empty-state-styles')) {
                    const styles = document.createElement('style');
                    styles.id = 'empty-state-styles';
                    styles.textContent = `
                        .emails-page-modern {
                            padding: 20px;
                            min-height: calc(100vh - 120px);
                        }
                        
                        .empty-state {
                            text-align: center;
                            padding: 60px 30px;
                            background: white;
                            border-radius: 12px;
                            border: 1px solid #e5e7eb;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                            max-width: 500px;
                            margin: 0 auto;
                        }
                        
                        .empty-state-icon {
                            font-size: 48px;
                            margin-bottom: 20px;
                            color: #6b7280;
                        }
                        
                        .empty-state-title {
                            font-size: 22px;
                            font-weight: 700;
                            color: #374151;
                            margin-bottom: 12px;
                        }
                        
                        .empty-state-text {
                            font-size: 15px;
                            margin-bottom: 24px;
                            max-width: 400px;
                            line-height: 1.6;
                            color: #6b7280;
                            font-weight: 500;
                            margin-left: auto;
                            margin-right: auto;
                        }
                        
                        .empty-state-actions {
                            display: flex;
                            gap: 12px;
                            flex-wrap: wrap;
                            justify-content: center;
                        }
                        
                        .btn {
                            height: 44px;
                            background: white;
                            color: #374151;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 0 16px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                        }
                        
                        .btn-primary {
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            color: white;
                            border-color: transparent;
                            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                        }
                        
                        .btn-primary:hover {
                            background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                            transform: translateY(-2px);
                            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
                        }
                    `;
                    document.head.appendChild(styles);
                }
                
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
                
                // L'événement googleAuthSuccess déclenchera le rechargement
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
                pageManagerOutlook: !!window.pageManagerOutlook,
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
    
    // Méthode pour forcer le changement de provider (utile pour les tests)
    forceProviderChange(provider) {
        console.log(`[App] Forcing provider change to: ${provider}`);
        this.handleProviderChange(provider);
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

window.switchProvider = function(provider) {
    if (!['google', 'microsoft', 'gmail', 'outlook'].includes(provider)) {
        console.error('Invalid provider. Use: google, microsoft, gmail, or outlook');
        return;
    }
    
    window.app.forceProviderChange(provider);
    console.log(`✅ Switched to ${provider}`);
};

console.log('[App] ✅ EmailSortPro v3.8.0 loaded - Navigation améliorée');
