// app.js - Application principale EmailSortPro v3.7.2
// CORRECTION: Support complet Gmail ET Outlook avec détection automatique du PageManager

class EmailSortProApp {
    constructor() {
        this.version = '3.7.2';
        this.isInitialized = false;
        this.initPromise = null;
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.user = null;
        
        console.log(`[App] EmailSortPro v${this.version} starting...`);
        
        // Bind des méthodes
        this.init = this.init.bind(this);
        this.checkAuthentication = this.checkAuthentication.bind(this);
        
        // Écouter les événements d'authentification Google
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
                
                // Afficher l'interface immédiatement
                this.showAppInterface();
                
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
                this.showAppInterface();
                await this.initializeAppComponents();
                await this.updateUserDisplay();
                this.loadDashboard();
            } else {
                console.log('[App] User not authenticated');
                this.showLoginPage();
            }
            
            // 6. Configurer les événements
            this.setupEventHandlers();
            
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
            this.loadDashboard();
            this.setupEventHandlers();
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
    }
    
    loadDashboard() {
        console.log('[App] Loading dashboard...');
        
        // Utiliser le bon PageManager selon le provider
        const pageManager = this.getPageManager();
        
        if (window.dashboardModule) {
            window.dashboardModule.render();
        } else if (pageManager) {
            pageManager.loadPage('dashboard');
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
    }
    
    // MÉTHODE CLÉ: Obtenir le bon PageManager selon le provider
    getPageManager() {
        if (this.currentProvider === 'google' && window.pageManagerGmail) {
            console.log('[App] Using PageManagerGmail for Google provider');
            return window.pageManagerGmail;
        } else if (window.pageManager) {
            console.log('[App] Using PageManager for Microsoft provider');
            return window.pageManager;
        }
        
        console.warn('[App] No suitable PageManager found');
        return null;
    }
    
    handleNavigation(event) {
        event.preventDefault();
        
        const page = event.currentTarget.dataset.page;
        if (!page) return;
        
        console.log('[App] Navigating to:', page);
        
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // CORRECTION: Utiliser le bon PageManager selon le provider
        const pageManager = this.getPageManager();
        if (pageManager) {
            // Vérifier que la page existe dans le PageManager
            if (pageManager.pages && pageManager.pages[page]) {
                pageManager.loadPage(page);
            } else {
                console.warn(`[App] Page "${page}" not found in PageManager`);
                // Fallback: charger les pages directement si PageManager ne les a pas
                if (page === 'settings' && window.categoriesPage) {
                    const container = document.getElementById('pageContent');
                    if (container) {
                        console.log('[App] Loading CategoriesPage directly');
                        window.categoriesPage.render(container);
                    }
                } else if (page === 'tasks' && window.tasksView) {
                    const container = document.getElementById('pageContent');
                    if (container) {
                        console.log('[App] Loading TasksView directly');
                        window.tasksView.render(container);
                    }
                } else if (page === 'scanner' && window.unifiedScan) {
                    const container = document.getElementById('pageContent');
                    if (container) {
                        console.log('[App] Loading Scanner directly');
                        window.unifiedScan.render();
                    }
                } else if (page === 'dashboard' && window.dashboardModule) {
                    console.log('[App] Loading Dashboard directly');
                    window.dashboardModule.render();
                } else if (page === 'ranger' && window.modernDomainOrganizer) {
                    const container = document.getElementById('pageContent');
                    if (container) {
                        console.log('[App] Loading Domain Organizer directly');
                        window.modernDomainOrganizer.render(container);
                    }
                }
            }
        } else {
            console.error('[App] No PageManager available for navigation');
        }
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
            
            window.location.reload();
        } catch (error) {
            console.error('[App] Logout error:', error);
            window.location.reload();
        }
    }
    
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            currentProvider: this.currentProvider,
            isAuthenticated: this.isAuthenticated,
            user: this.user?.email || null,
            authentication: {
                microsoft: window.authService?.isAuthenticated() || false,
                google: window.googleAuthService?.isAuthenticated() || false,
                lastProvider: sessionStorage.getItem('lastAuthProvider')
            },
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                uiManager: !!window.uiManager,
                pageManager: !!window.pageManager,
                pageManagerGmail: !!window.pageManagerGmail,
                taskManager: !!window.taskManager,
                categoriesPage: !!window.categoriesPage
            }
        };
    }
}

// Créer l'instance
window.app = new EmailSortProApp();

// Exposer des méthodes globales
window.checkScrollNeeded = () => window.app.checkScrollNeeded();

// Hook pour intégrer les pages manquantes dans PageManagerGmail
document.addEventListener('DOMContentLoaded', () => {
    if (window.pageManagerGmail) {
        console.log('[App] Extending PageManagerGmail with missing pages...');
        
        // S'assurer que l'objet pages existe
        if (!window.pageManagerGmail.pages) {
            window.pageManagerGmail.pages = {};
        }
        
        // Ajouter toutes les pages nécessaires
        // Dashboard
        if (!window.pageManagerGmail.pages.dashboard && window.dashboardModule) {
            window.pageManagerGmail.pages.dashboard = (container) => {
                console.log('[App/PageManagerGmail] Loading dashboard page');
                window.dashboardModule.render();
            };
        }
        
        // Scanner
        if (!window.pageManagerGmail.pages.scanner && window.unifiedScan) {
            window.pageManagerGmail.pages.scanner = (container) => {
                console.log('[App/PageManagerGmail] Loading scanner page');
                window.unifiedScan.render();
            };
        }
        
        // Settings (paramètres/catégories)
        if (!window.pageManagerGmail.pages.settings && window.categoriesPage) {
            window.pageManagerGmail.pages.settings = (container) => {
                console.log('[App/PageManagerGmail] Loading settings page');
                window.categoriesPage.render(container);
            };
        }
        
        // Tasks
        if (!window.pageManagerGmail.pages.tasks && window.tasksView) {
            window.pageManagerGmail.pages.tasks = (container) => {
                console.log('[App/PageManagerGmail] Loading tasks page');
                window.tasksView.render(container);
            };
        }
        
        // Ranger (domain organizer)
        if (!window.pageManagerGmail.pages.ranger && window.modernDomainOrganizer) {
            window.pageManagerGmail.pages.ranger = (container) => {
                console.log('[App/PageManagerGmail] Loading ranger page');
                window.modernDomainOrganizer.render(container);
            };
        }
        
        console.log('[App] PageManagerGmail extended with pages:', Object.keys(window.pageManagerGmail.pages));
    }
});

console.log('[App] ✅ EmailSortPro v3.7.2 loaded - Gmail & Outlook support');
