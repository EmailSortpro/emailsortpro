// app.js - Application principale EmailSortPro v3.5
// CORRECTION: Meilleure gestion de l'authentification Gmail

class EmailSortProApp {
    constructor() {
        this.version = '3.5';
        this.isInitialized = false;
        this.initPromise = null;
        this.currentProvider = null; // 'microsoft' ou 'google'
        
        console.log(`[App] EmailSortPro v${this.version} starting...`);
        
        // Bind des méthodes
        this.init = this.init.bind(this);
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        
        // Lancer l'initialisation
        this.init();
    }
    
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._doInit();
        return this.initPromise;
    }
    
    async _doInit() {
        console.log('[App] Initializing application...');
        
        try {
            // 1. Attendre que le DOM soit prêt
            await this.waitForDOM();
            
            // 2. Attendre que les services soient chargés
            await this.waitForServices();
            
            // 3. Initialiser les services d'authentification
            await this.initializeAuthServices();
            
            // 4. Vérifier l'authentification
            const isAuthenticated = await this.checkAuthentication();
            
            if (isAuthenticated) {
                console.log('[App] ✅ User authenticated with', this.currentProvider);
                
                // Afficher l'interface de l'app
                if (window.showApp) {
                    window.showApp();
                } else {
                    this.showAppInterface();
                }
                
                // Initialiser les composants de l'app
                await this.initializeAppComponents();
                
                // Mettre à jour l'affichage utilisateur
                await this.updateUserDisplay();
                
                // Charger le dashboard par défaut
                this.loadDashboard();
            } else {
                console.log('[App] User not authenticated, showing login page');
                this.showLoginPage();
            }
            
            // Configurer les gestionnaires d'événements
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('[App] ✅ Application initialized successfully');
            
        } catch (error) {
            console.error('[App] ❌ Initialization error:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
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
        
        const maxAttempts = 50; // 5 secondes
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const servicesReady = 
                window.authService && 
                window.googleAuthService && 
                window.mailService && 
                window.uiManager;
            
            if (servicesReady) {
                console.log('[App] ✅ All services loaded');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Vérifier quels services manquent
        const missing = [];
        if (!window.authService) missing.push('authService');
        if (!window.googleAuthService) missing.push('googleAuthService');
        if (!window.mailService) missing.push('mailService');
        if (!window.uiManager) missing.push('uiManager');
        
        console.warn('[App] Missing services after timeout:', missing);
    }
    
    async initializeAuthServices() {
        console.log('[App] Initializing auth services...');
        
        // Initialiser Microsoft Auth Service
        if (window.authService) {
            try {
                await window.authService.initialize();
                console.log('[App] ✅ Microsoft auth service initialized');
            } catch (error) {
                console.warn('[App] Microsoft auth init warning:', error);
            }
        }
        
        // Initialiser Google Auth Service
        if (window.googleAuthService) {
            try {
                await window.googleAuthService.initialize();
                console.log('[App] ✅ Google auth service initialized');
            } catch (error) {
                console.warn('[App] Google auth init warning:', error);
            }
        }
    }
    
    async checkAuthentication() {
        console.log('[App] Checking authentication...');
        
        // Récupérer le dernier provider utilisé
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        console.log('[App] Last auth provider:', lastProvider);
        
        // Vérifier Google en premier si c'était le dernier provider
        if (lastProvider === 'google' && window.googleAuthService) {
            if (window.googleAuthService.isAuthenticated()) {
                this.currentProvider = 'google';
                console.log('[App] ✅ Authenticated with Google');
                return true;
            }
        }
        
        // Vérifier Microsoft
        if (window.authService && window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            console.log('[App] ✅ Authenticated with Microsoft');
            return true;
        }
        
        // Re-vérifier Google si ce n'était pas le dernier provider
        if (lastProvider !== 'google' && window.googleAuthService) {
            if (window.googleAuthService.isAuthenticated()) {
                this.currentProvider = 'google';
                console.log('[App] ✅ Authenticated with Google');
                return true;
            }
        }
        
        console.log('[App] ❌ Not authenticated');
        return false;
    }
    
    async updateUserDisplay() {
        console.log('[App] Updating user display...');
        
        try {
            let user = null;
            
            if (this.currentProvider === 'google' && window.googleAuthService) {
                user = await window.googleAuthService.getUserInfo();
                user.provider = 'google';
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
            
            if (user && window.updateUserDisplay) {
                window.updateUserDisplay(user);
                console.log('[App] ✅ User display updated:', user.email);
            }
            
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
        
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
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
        
        // Initialiser d'autres composants selon le besoin
        if (window.taskManager && !window.taskManager.initialized) {
            try {
                await window.taskManager.initialize();
                console.log('[App] ✅ Task manager initialized');
            } catch (error) {
                console.warn('[App] Task manager init warning:', error);
            }
        }
        
        // Initialiser PageManager
        if (window.pageManager && window.pageManager.init) {
            try {
                await window.pageManager.init();
                console.log('[App] ✅ Page manager initialized');
            } catch (error) {
                console.warn('[App] Page manager init warning:', error);
            }
        }
    }
    
    loadDashboard() {
        console.log('[App] Loading dashboard...');
        
        if (window.dashboardModule) {
            window.dashboardModule.render();
        } else if (window.pageManager) {
            window.pageManager.loadPage('dashboard');
        } else {
            console.warn('[App] No dashboard loader available');
        }
    }
    
    setupEventHandlers() {
        console.log('[App] Setting up event handlers...');
        
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation);
        });
        
        // Vérification du callback Google au retour
        window.addEventListener('hashchange', () => {
            if (window.location.hash.includes('access_token')) {
                console.log('[App] Google OAuth callback detected');
                this.handleGoogleCallback();
            }
        });
        
        // Gestion du scroll
        window.addEventListener('resize', () => this.checkScrollNeeded());
        
        // Vérifier immédiatement si on revient d'un callback Google
        if (window.location.hash.includes('access_token')) {
            this.handleGoogleCallback();
        }
    }
    
    handleNavigation(event) {
        event.preventDefault();
        
        const page = event.currentTarget.dataset.page;
        if (!page) return;
        
        console.log('[App] Navigating to:', page);
        
        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // Charger la page
        if (page === 'dashboard' && window.dashboardModule) {
            window.dashboardModule.render();
        } else if (window.pageManager) {
            window.pageManager.loadPage(page);
        }
        
        // Mettre à jour le mode de page
        if (window.setPageMode) {
            window.setPageMode(page);
        }
    }
    
    async handleGoogleCallback() {
        console.log('[App] Processing Google callback...');
        
        try {
            if (window.googleAuthService && window.googleAuthService.handleOAuthCallback) {
                const fragment = window.location.hash;
                const success = await window.googleAuthService.handleOAuthCallback(fragment);
                
                if (success) {
                    console.log('[App] ✅ Google authentication successful');
                    
                    // Nettoyer l'URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // Recharger l'app avec l'utilisateur authentifié
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('[App] Error handling Google callback:', error);
            this.showError('Erreur d\'authentification Google: ' + error.message);
        }
    }
    
    checkScrollNeeded() {
        if (!document.body.classList.contains('app-active')) {
            return;
        }
        
        const contentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        if (contentHeight > viewportHeight) {
            document.body.style.overflow = 'auto';
            document.body.style.overflowY = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
            document.body.style.overflowY = 'hidden';
        }
    }
    
    showError(message) {
        console.error('[App] Error:', message);
        
        if (window.uiManager) {
            window.uiManager.showToast(message, 'error', 8000);
        } else {
            alert('Erreur: ' + message);
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
        } else {
            throw new Error('Microsoft auth service not available');
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
        } else {
            throw new Error('Google auth service not available');
        }
    }
    
    // Méthode de diagnostic
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            currentProvider: this.currentProvider,
            authentication: {
                microsoft: window.authService ? window.authService.isAuthenticated() : false,
                google: window.googleAuthService ? window.googleAuthService.isAuthenticated() : false,
                lastProvider: sessionStorage.getItem('lastAuthProvider')
            },
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                uiManager: !!window.uiManager,
                pageManager: !!window.pageManager,
                dashboardModule: !!window.dashboardModule
            },
            ui: {
                isAppActive: document.body.classList.contains('app-active'),
                isLoginMode: document.body.classList.contains('login-mode')
            }
        };
    }
}

// Créer l'instance de l'application
console.log('[App] Creating EmailSortPro application instance...');
window.app = new EmailSortProApp();

// Exposer des méthodes globales pour la compatibilité
window.checkScrollNeeded = () => window.app.checkScrollNeeded();

// Fonction de diagnostic
window.appDebug = function() {
    console.group('=== APP DEBUG ===');
    const debug = window.app.getDebugInfo();
    console.log('App Info:', debug);
    
    if (window.googleAuthService) {
        console.log('Google Auth:', window.googleAuthService.getDiagnosticInfo());
    }
    
    if (window.authService) {
        console.log('Microsoft Auth:', window.authService.getDiagnosticInfo());
    }
    
    if (window.mailService) {
        console.log('Mail Service:', window.mailService.getDebugInfo());
    }
    
    console.groupEnd();
};

console.log('[App] ✅ EmailSortPro v3.5 loaded');
console.log('[App] Use appDebug() for diagnostic information');
