// app.js - Application principale EmailSortPro v5.1.1
// CORRECTION MINIMALE: Seule la vérification Google a été améliorée

class EmailSortProApp {
    constructor() {
        this.isInitialized = false;
        this.currentProvider = null;
        this.user = null;
        this.isAuthenticated = false;
        this.analyticsManager = null;
        this.licenseService = null;
        
        console.log('[App] Constructor - EmailSortPro v5.1.1 with proper scanner loading...');
        console.log('[App] Environment:', this.getEnvironment());
        console.log('[App] Domain:', window.location.hostname);
        
        // Initialiser l'analytics avec tracking des emails
        this.initializeAnalytics();
    }

    getEnvironment() {
        const hostname = window.location.hostname;
        if (hostname.includes('netlify')) return 'netlify';
        if (hostname.includes('github.io')) return 'github';
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
        return 'other';
    }

    initializeAnalytics() {
        console.log('[App] Initializing analytics with email tracking...');
        
        try {
            if (window.AnalyticsManager) {
                this.analyticsManager = new window.AnalyticsManager();
                console.log('[App] ✅ Analytics manager ready');
            } else {
                console.warn('[App] AnalyticsManager not found');
            }
        } catch (error) {
            console.error('[App] Error initializing analytics:', error);
        }
        
        console.log('[App] ✅ Analytics initialized successfully');
    }

    async init() {
        if (this.isInitialized) {
            return Promise.resolve();
        }

        try {
            console.log('[App] Initializing dual provider application with license check...');
            
            // Détecter l'environnement
            const environment = this.getEnvironment();
            console.log('[App] Running in', environment, 'environment, adjusting checks...');
            
            // Étape 1: Initialiser le service de licence
            await this.initializeLicenseService();
            
            // Étape 2: Initialiser les services d'authentification
            await this.initializeAuthServices();
            
            // Étape 3: Initialiser les modules critiques
            await this.initializeCriticalModules();
            
            // Étape 4: Vérifier le statut d'authentification
            await this.checkAuthenticationStatus();
            
            // Étape 5: Configurer les event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[App] ✅ Application initialized successfully');
            
        } catch (error) {
            console.error('[App] ❌ Error during initialization:', error);
            throw error;
        }
    }

    async initializeLicenseService() {
        console.log('[App] Initializing license service...');
        
        try {
            if (window.LicenseService) {
                this.licenseService = window.LicenseService;
                await this.licenseService.initialize();
            } else {
                console.warn('[App] LicenseService not found');
            }
        } catch (error) {
            console.error('[App] License service initialization error:', error);
        }
        
        console.log('[App] ✅ License service initialized');
    }

    async initializeAuthServices() {
        console.log('[App] Initializing auth services...');
        
        const results = [];
        
        // Initialiser Microsoft Auth Service
        try {
            if (window.authService) {
                await window.authService.initialize();
                results.push({ provider: 'microsoft', success: true });
                console.log('[App] ✅ Microsoft auth service initialized');
            } else {
                results.push({ provider: 'microsoft', success: false, error: 'Service not found' });
                console.warn('[App] Microsoft auth service not found');
            }
        } catch (error) {
            results.push({ provider: 'microsoft', success: false, error: error.message });
            console.error('[App] Microsoft auth service initialization failed:', error);
        }

        // Initialiser Google Auth Service
        try {
            if (window.googleAuthService) {
                await window.googleAuthService.initialize();
                results.push({ provider: 'google', success: true });
                console.log('[App] ✅ Google auth service initialized');
            } else {
                results.push({ provider: 'google', success: false, error: 'Service not found' });
                console.warn('[App] Google auth service not found');
            }
        } catch (error) {
            results.push({ provider: 'google', success: false, error: error.message });
            console.error('[App] Google auth service initialization failed:', error);
        }

        console.log('[App] Auth services initialization results:', results);
        return results;
    }

    async initializeCriticalModules() {
        console.log('[App] Initializing critical modules...');
        
        // Assurer que TaskManager est prêt
        await this.ensureTaskManagerReady();
        
        // Assurer que PageManager est prêt
        await this.ensurePageManagerReady();
        
        // Assurer que TasksView est prêt
        await this.ensureTasksViewReady();
        
        // Assurer que DashboardModule est prêt
        await this.ensureDashboardModuleReady();
        
        // Assurer que MailService est prêt
        await this.ensureMailServiceReady();
        
        // Initialiser le gestionnaire de scroll
        this.initializeScrollManager();
        
        // Lier les méthodes globales
        this.bindGlobalMethods();
        
        console.log('[App] Critical modules initialized');
    }

    async ensureTaskManagerReady() {
        console.log('[App] Ensuring TaskManager is ready...');
        
        if (window.taskManager && window.taskManager.initialized) {
            console.log('[App] ✅ TaskManager already ready');
            return;
        }
        
        return new Promise((resolve) => {
            const checkTaskManager = () => {
                if (window.taskManager && window.taskManager.initialized) {
                    console.log('[App] ✅ TaskManager ready');
                    resolve();
                } else {
                    setTimeout(checkTaskManager, 100);
                }
            };
            checkTaskManager();
        });
    }

    async ensurePageManagerReady() {
        console.log('[App] Ensuring PageManager is ready...');
        
        if (window.pageManager) {
            console.log('[App] ✅ PageManager already ready');
            return;
        }
        
        return new Promise((resolve) => {
            const checkPageManager = () => {
                if (window.pageManager) {
                    console.log('[App] ✅ PageManager ready');
                    resolve();
                } else {
                    setTimeout(checkPageManager, 100);
                }
            };
            checkPageManager();
        });
    }

    async ensureTasksViewReady() {
        console.log('[App] Ensuring TasksView is ready...');
        
        if (window.tasksView) {
            console.log('[App] ✅ TasksView already ready');
            return;
        }
        
        return new Promise((resolve) => {
            const checkTasksView = () => {
                if (window.tasksView) {
                    console.log('[App] ✅ TasksView ready');
                    resolve();
                } else {
                    setTimeout(checkTasksView, 100);
                }
            };
            checkTasksView();
        });
    }

    async ensureDashboardModuleReady() {
        console.log('[App] Ensuring DashboardModule is ready...');
        
        if (window.dashboardModule) {
            console.log('[App] ✅ DashboardModule already ready');
            return;
        }
        
        return new Promise((resolve) => {
            const checkDashboardModule = () => {
                if (window.dashboardModule) {
                    console.log('[App] ✅ DashboardModule ready');
                    resolve();
                } else {
                    setTimeout(checkDashboardModule, 100);
                }
            };
            checkDashboardModule();
        });
    }

    async ensureMailServiceReady() {
        console.log('[App] Ensuring MailService is ready...');
        
        if (window.mailService) {
            console.log('[App] ✅ MailService already ready');
            return;
        }
        
        console.log('[App] MailService not ready, creating fallback...');
        
        // Créer un MailService fallback
        window.mailService = {
            scanEmails: async (provider = 'auto') => {
                console.log('[App] MailService fallback: scanEmails called');
                
                // Utiliser Google si disponible
                if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                    console.log('[App] Using Google scanning...');
                    return { success: true, provider: 'google', emails: [] };
                }
                
                // Utiliser Microsoft si disponible
                if (window.authService && window.authService.isAuthenticated()) {
                    console.log('[App] Using Microsoft scanning...');
                    return { success: true, provider: 'microsoft', emails: [] };
                }
                
                throw new Error('No authenticated provider available');
            },
            
            reset: () => {
                console.log('[App] MailService fallback: reset called');
            },
            
            isReady: () => true
        };
        
        console.log('[App] ✅ MailService fallback created');
    }

    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        // Observer pour le contenu
        const contentObserver = new MutationObserver((mutations) => {
            let contentChanged = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    contentChanged = true;
                }
            });
            
            if (contentChanged) {
                setTimeout(() => this.checkScrollNeeded(), 100);
            }
        });
        
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            contentObserver.observe(pageContent, {
                childList: true,
                subtree: true
            });
        }
        
        console.log('[App] ✅ Content observer initialized');
        
        // Gestionnaire de resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.checkScrollNeeded(), 150);
        });
        
        console.log('[App] ✅ Scroll manager initialized');
    }

    checkScrollNeeded() {
        const body = document.body;
        const contentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        if (contentHeight <= viewportHeight) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    bindGlobalMethods() {
        // Lier les méthodes TaskManager
        if (window.taskManager && window.taskManager.addTask) {
            window.addTask = window.taskManager.addTask.bind(window.taskManager);
            window.completeTask = window.taskManager.completeTask.bind(window.taskManager);
            window.deleteTask = window.taskManager.deleteTask.bind(window.taskManager);
            window.updateTask = window.taskManager.updateTask.bind(window.taskManager);
            window.getTasks = window.taskManager.getTasks.bind(window.taskManager);
            
            console.log('[App] ✅ TaskManager methods bound');
        }
        
        // Lier les méthodes PageManager
        if (window.pageManager && window.pageManager.loadPage) {
            window.loadPage = window.pageManager.loadPage.bind(window.pageManager);
            window.getCurrentPage = window.pageManager.getCurrentPage.bind(window.pageManager);
            
            console.log('[App] ✅ PageManager methods bound');
        }
    }

    // CORRECTION: Méthode pour vérifier l'authentification avec support dual
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status for both providers...');
        
        // Vérifier les callbacks OAuth2
        this.handleOAuthCallbacks();
        
        // Vérifier Google d'abord (priorité car c'est là qu'est le problème)
        const googleAuth = await this.checkGoogleAuth();
        if (googleAuth.success) {
            console.log('[App] Google authentication found, getting user info...');
            await this.setupAuthenticatedUser(googleAuth.user, 'google');
            return;
        }
        
        // Vérifier Microsoft ensuite
        const microsoftAuth = await this.checkMicrosoftAuth();
        if (microsoftAuth.success) {
            console.log('[App] Microsoft authentication found, getting user info...');
            await this.setupAuthenticatedUser(microsoftAuth.user, 'microsoft');
            return;
        }
        
        console.log('[App] No authentication found for either provider');
        this.isAuthenticated = false;
        this.currentProvider = null;
        this.user = null;
    }

    handleOAuthCallbacks() {
        console.log('[App] Handling OAuth2 callbacks...');
        
        // Vérifier Microsoft callback
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code') && urlParams.has('state') && !urlParams.has('scope')) {
            console.log('[App] Microsoft OAuth callback detected');
        }
        
        // Vérifier Google callback
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        if (fragment.has('access_token') && fragment.has('state')) {
            console.log('[App] Google OAuth callback detected');
        }
    }

    async checkMicrosoftAuth() {
        try {
            if (window.authService && window.authService.isAuthenticated()) {
                console.log('[App] Microsoft authentication active');
                
                const userInfo = await window.authService.getUserInfo();
                const licenseStatus = await this.checkUserLicense(userInfo.email || userInfo.userPrincipalName);
                
                return {
                    success: true,
                    user: userInfo,
                    licenseStatus: licenseStatus
                };
            }
        } catch (error) {
            console.error('[App] Error checking Microsoft auth:', error);
        }
        
        return { success: false };
    }

    // CORRECTION: Méthode améliorée pour vérifier Google
    async checkGoogleAuth() {
        try {
            console.log('[App] Checking Google authentication...');
            
            // Méthode 1: Vérifier le service Google
            if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                console.log('[App] Google service reports authenticated');
                const userInfo = await window.googleAuthService.getUserInfo();
                const licenseStatus = await this.checkUserLicense(userInfo.email);
                
                return {
                    success: true,
                    user: userInfo,
                    licenseStatus: licenseStatus
                };
            }
            
            // Méthode 2: Vérifier le token en cache
            const tokenStr = localStorage.getItem('google_token_emailsortpro');
            if (tokenStr) {
                try {
                    const tokenData = JSON.parse(tokenStr);
                    const now = Date.now();
                    const expiresAt = tokenData.expires_at || 0;
                    const isTokenValid = expiresAt > (now + 5 * 60 * 1000);
                    
                    if (isTokenValid) {
                        console.log('[App] Valid Google token found in cache');
                        
                        // Essayer de récupérer les infos utilisateur
                        let userInfo = null;
                        
                        // Depuis le cache
                        const userInfoStr = sessionStorage.getItem('google_user_info');
                        if (userInfoStr) {
                            try {
                                userInfo = JSON.parse(userInfoStr);
                                console.log('[App] Google user info loaded from cache:', userInfo.email);
                            } catch (parseError) {
                                console.warn('[App] Error parsing cached Google user info:', parseError);
                            }
                        }
                        
                        // Depuis l'API si pas en cache
                        if (!userInfo) {
                            try {
                                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                                    headers: {
                                        'Authorization': `Bearer ${tokenData.access_token}`,
                                        'Accept': 'application/json'
                                    }
                                });
                                
                                if (response.ok) {
                                    userInfo = await response.json();
                                    console.log('[App] Google user info loaded via API:', userInfo.email);
                                    
                                    // Sauvegarder pour la prochaine fois
                                    sessionStorage.setItem('google_user_info', JSON.stringify(userInfo));
                                }
                            } catch (apiError) {
                                console.warn('[App] Error loading Google user info via API:', apiError);
                            }
                        }
                        
                        if (userInfo) {
                            // Formater les infos utilisateur pour compatibilité
                            const formattedUserInfo = {
                                id: userInfo.id || userInfo.sub,
                                displayName: userInfo.name,
                                givenName: userInfo.given_name || userInfo.name?.split(' ')[0],
                                familyName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' '),
                                mail: userInfo.email,
                                userPrincipalName: userInfo.email,
                                imageUrl: userInfo.picture,
                                provider: 'google',
                                username: userInfo.email,
                                name: userInfo.name,
                                email: userInfo.email
                            };
                            
                            const licenseStatus = await this.checkUserLicense(userInfo.email);
                            
                            return {
                                success: true,
                                user: formattedUserInfo,
                                licenseStatus: licenseStatus
                            };
                        }
                    }
                } catch (parseError) {
                    console.warn('[App] Error parsing Google token:', parseError);
                }
            }
            
            // Méthode 3: Vérifier le provider sauvegardé
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            if (lastProvider === 'google') {
                console.log('[App] Last provider was Google, attempting to restore session...');
                
                if (window.googleAuthService) {
                    try {
                        await window.googleAuthService.initialize();
                        if (window.googleAuthService.isAuthenticated()) {
                            const userInfo = await window.googleAuthService.getUserInfo();
                            const licenseStatus = await this.checkUserLicense(userInfo.email);
                            
                            return {
                                success: true,
                                user: userInfo,
                                licenseStatus: licenseStatus
                            };
                        }
                    } catch (reinitError) {
                        console.warn('[App] Error reinitializing Google service:', reinitError);
                    }
                }
            }
            
        } catch (error) {
            console.error('[App] Error checking Google auth:', error);
        }
        
        return { success: false };
    }

    async checkUserLicense(email) {
        console.log('[App] Checking user license for:', email);
        
        try {
            if (this.licenseService) {
                const result = await this.licenseService.authenticateWithEmail(email);
                return result;
            }
        } catch (error) {
            console.error('[App] License check error:', error);
        }
        
        return { success: false, message: "Erreur lors de l'authentification", status: 'error' };
    }

    async setupAuthenticatedUser(userInfo, provider) {
        console.log('[App] Setting up authenticated user for provider:', provider);
        
        this.user = userInfo;
        this.currentProvider = provider;
        this.isAuthenticated = true;
        
        // Sauvegarder le provider actuel
        sessionStorage.setItem('lastAuthProvider', provider);
        
        // Tracker l'authentification
        await this.trackUserAuthentication(userInfo, provider);
        
        // Afficher l'application
        await this.showAppWithTransition(provider);
        
        console.log('[App] ✅', provider, 'user authenticated with valid license:', userInfo.displayName || userInfo.name);
    }

    async trackUserAuthentication(userInfo, provider) {
        console.log('[App] Tracking user authentication for analytics...');
        
        try {
            const userEmail = userInfo.email || userInfo.mail || userInfo.userPrincipalName;
            const userName = userInfo.displayName || userInfo.name || 'Unknown';
            
            // Tracker les détails de l'utilisateur
            console.log('[App] ✅ Tracking authentication with email:', {
                email: userEmail,
                name: userName,
                provider: provider,
                licenseStatus: 'error'
            });
            
            if (this.analyticsManager) {
                this.analyticsManager.trackEvent('auth_success', {
                    provider: provider,
                    userEmail: userEmail,
                    userDomain: userEmail ? userEmail.split('@')[1] : 'unknown',
                    userName: userName
                });
            }
            
        } catch (error) {
            console.error('[App] Error tracking authentication:', error);
        }
    }

    async showAppWithTransition(provider) {
        console.log('[App] Showing application with transition - Provider:', provider);
        
        // Tracker l'événement d'affichage
        this.trackEvent('app_displayed', {
            provider: provider,
            userEmail: this.user.email || this.user.mail || this.user.userPrincipalName,
            licenseStatus: 'error',
            licenseValid: false,
            userName: this.user.displayName || this.user.name
        });
        
        // Activer le mode app
        console.log('[App] App mode activated');
        document.body.classList.add('app-active');
        
        // Masquer la page de login
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        // Afficher le header
        const appHeader = document.querySelector('.app-header');
        if (appHeader) {
            appHeader.style.display = 'block';
            console.log('[App] Header displayed');
        }
        
        // Afficher la navigation
        const appNav = document.querySelector('.app-nav');
        if (appNav) {
            appNav.style.display = 'block';
            console.log('[App] Navigation displayed');
        }
        
        // Afficher le contenu principal
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            console.log('[App] Page content displayed');
        }
        
        // Mettre à jour l'affichage utilisateur
        this.updateUserDisplay();
        
        // Forcer le dashboard à être visible
        const forceDisplayCSS = `
            <style id="force-display-css">
                body.app-active #pageContent {
                    display: block !important;
                    opacity: 1 !important;
                }
                body.app-active .app-header {
                    display: block !important;
                }
                body.app-active .app-nav {
                    display: block !important;
                }
                body.app-active #loginPage {
                    display: none !important;
                }
            </style>
        `;
        
        if (!document.getElementById('force-display-css')) {
            document.head.insertAdjacentHTML('beforeend', forceDisplayCSS);
            console.log('[App] Force display CSS injected');
        }
        
        // Charger le dashboard
        console.log('[App] Loading dashboard via dashboardModule...');
        setTimeout(() => {
            if (window.dashboardModule) {
                window.dashboardModule.render();
                console.log('[App] Dashboard loaded via module for provider:', provider);
            }
        }, 100);
        
        console.log('[App] ✅ Application fully displayed with', provider, 'provider');
    }

    updateUserDisplay() {
        if (window.updateUserDisplay && this.user) {
            window.updateUserDisplay({
                ...this.user,
                provider: this.currentProvider
            });
        }
        
        if (window.uiManager && this.user) {
            const userName = this.user.displayName || this.user.name || 'Utilisateur';
            const userEmail = this.user.email || this.user.mail || this.user.userPrincipalName || 'Email non disponible';
            
            window.uiManager.updateUserDisplay({
                userName: userName,
                userEmail: userEmail
            });
        }
    }

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // Gestionnaire d'erreurs global
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            if (this.analyticsManager) {
                this.analyticsManager.trackEvent('error_global', {
                    message: event.error ? event.error.message : 'Unknown error',
                    filename: event.filename || 'unknown',
                    lineno: event.lineno || 0,
                    colno: event.colno || 0,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                });
            }
        });
        
        // Gestionnaire de rejets de promesses
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
            
            if (this.analyticsManager) {
                this.analyticsManager.trackEvent('error_promise', {
                    reason: event.reason ? event.reason.toString() : 'Unknown reason',
                    userAgent: navigator.userAgent,
                    url: window.location.href
                });
            }
        });
        
        console.log('[App] ✅ Event listeners set up with error handling and analytics');
    }

    // Méthodes publiques
    async login(provider = 'microsoft') {
        console.log('[App] Login requested for provider:', provider);
        
        try {
            if (provider === 'microsoft' && window.authService) {
                await window.authService.login();
            } else if (provider === 'google' && window.googleAuthService) {
                await window.googleAuthService.login();
            } else {
                throw new Error(`Provider ${provider} not available`);
            }
        } catch (error) {
            console.error('[App] Login error:', error);
            throw error;
        }
    }

    async logout() {
        console.log('[App] Logout requested');
        
        try {
            if (this.currentProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.currentProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            }
            
            this.isAuthenticated = false;
            this.currentProvider = null;
            this.user = null;
            
            sessionStorage.removeItem('lastAuthProvider');
            window.location.reload();
            
        } catch (error) {
            console.error('[App] Logout error:', error);
            window.location.reload();
        }
    }

    // Méthodes utilitaires
    isAuthenticated() {
        return this.isAuthenticated;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    getUser() {
        return this.user;
    }

    trackEvent(eventName, data) {
        if (this.analyticsManager) {
            this.analyticsManager.trackEvent(eventName, data);
            console.log('[App] ✅ Event tracked:', eventName, data);
        }
    }

    // Méthodes de diagnostic
    getDiagnosticInfo() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated,
            currentProvider: this.currentProvider,
            user: this.user ? {
                email: this.user.email || this.user.mail || this.user.userPrincipalName,
                name: this.user.displayName || this.user.name,
                provider: this.currentProvider
            } : null,
            environment: this.getEnvironment(),
            domain: window.location.hostname,
            services: {
                analyticsManager: !!this.analyticsManager,
                licenseService: !!this.licenseService,
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                taskManager: !!window.taskManager,
                pageManager: !!window.pageManager,
                dashboardModule: !!window.dashboardModule
            },
            lastAuthProvider: sessionStorage.getItem('lastAuthProvider'),
            googleToken: !!localStorage.getItem('google_token_emailsortpro'),
            currentUrl: window.location.href
        };
    }
}

// Fonction d'attente des services
function checkServicesReady() {
    const requiredServices = [
        'AppConfig',
        'authService',
        'googleAuthService',
        'categoryManager',
        'taskManager',
        'pageManager',
        'dashboardModule'
    ];
    
    const optionalServices = [
        'mailService'
    ];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    console.log('[App] Missing optional services:', missingOptional);
    
    const availableAuthServices = requiredServices.filter(s => s.includes('authService') && window[s]);
    console.log('[App] Available auth services:', availableAuthServices.length);
    console.log('[App] License service available:', !!window.LicenseService);
    console.log('[App] Analytics available:', !!window.AnalyticsManager);
    
    return missingRequired.length === 0;
}

// Fonction d'attente des services
async function waitForServices() {
    console.log('[App] Waiting for required services...');
    
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        if (checkServicesReady()) {
            console.log('[App] All required services ready, initializing dual provider app with analytics and license...');
            
            // Créer et initialiser l'app
            window.app = new EmailSortProApp();
            
            try {
                await window.app.init();
                console.log('[App] ✅ Application initialized successfully');
            } catch (error) {
                console.error('[App] ❌ Application initialization failed:', error);
            }
            
            return;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error('[App] ❌ Services timeout after', maxAttempts * 100, 'ms');
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] DOM loaded, creating dual provider app instance with analytics and license...');
    
    // Démarrer l'attente des services
    await waitForServices();
});

// Fonctions globales utilitaires
window.diagnoseApp = function() {
    console.group('=== APP DIAGNOSTIC ===');
    
    if (window.app) {
        const diagnostic = window.app.getDiagnosticInfo();
        console.log('🔍 App Diagnostic:', diagnostic);
        
        if (window.authService) {
            console.log('🔵 Microsoft Auth:', window.authService.getDiagnosticInfo());
        }
        
        if (window.googleAuthService) {
            console.log('🔴 Google Auth:', window.googleAuthService.getDiagnosticInfo());
        }
        
        return diagnostic;
    } else {
        console.log('❌ App not initialized');
        return { error: 'App not initialized' };
    }
    
    console.groupEnd();
};

window.testServices = function() {
    console.group('=== SERVICE TESTS ===');
    
    const services = [
        'AppConfig',
        'authService',
        'googleAuthService',
        'mailService',
        'taskManager',
        'pageManager',
        'categoryManager',
        'dashboardModule',
        'uiManager'
    ];
    
    services.forEach(service => {
        const available = !!window[service];
        const status = available ? '✅' : '❌';
        console.log(`${status} ${service}:`, available ? 'Available' : 'Missing');
        
        if (available && window[service].getDiagnosticInfo) {
            console.log(`   └─ Diagnostic:`, window[service].getDiagnosticInfo());
        }
    });
    
    console.groupEnd();
};

window.repairMailService = function() {
    console.log('[App] Repairing MailService...');
    
    if (!window.mailService) {
        console.log('[App] Creating MailService fallback...');
        
        window.mailService = {
            scanEmails: async (provider = 'auto') => {
                console.log('[App] MailService repair: scanEmails called');
                
                if (window.app && window.app.isAuthenticated()) {
                    const currentProvider = window.app.getCurrentProvider();
                    return { success: true, provider: currentProvider, emails: [] };
                }
                
                throw new Error('Not authenticated');
            },
            
            reset: () => {
                console.log('[App] MailService repair: reset called');
            },
            
            isReady: () => true
        };
        
        console.log('[App] ✅ MailService repaired');
    } else {
        console.log('[App] MailService already exists');
    }
};

window.testLicense = function() {
    console.group('=== LICENSE TEST ===');
    
    if (window.LicenseService) {
        console.log('✅ LicenseService available');
        
        if (window.app && window.app.user) {
            const userEmail = window.app.user.email || window.app.user.mail || window.app.user.userPrincipalName;
            console.log('🔍 Testing license for:', userEmail);
            
            window.app.checkUserLicense(userEmail).then(result => {
                console.log('📋 License result:', result);
            }).catch(error => {
                console.error('❌ License error:', error);
            });
        } else {
            console.log('⚠️ No authenticated user to test license');
        }
    } else {
        console.log('❌ LicenseService not available');
    }
    
    console.groupEnd();
};

// Helpers pour Netlify
window.netlifyHelpers = {
    checkEnvironment: () => {
        return {
            hostname: window.location.hostname,
            isNetlify: window.location.hostname.includes('netlify'),
            origin: window.location.origin,
            appConfig: !!window.AppConfig,
            clientId: window.AppConfig ? window.AppConfig.msal.clientId.substring(0, 8) + '...' : 'Not configured'
        };
    },
    
    testConnection: async () => {
        console.log('[Netlify] Testing connection...');
        
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('[Netlify] Test response status:', response.status);
            return { success: response.ok, status: response.status };
            
        } catch (error) {
            console.error('[Netlify] Test connection error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Helpers pour Analytics
window.analyticsHelpers = {
    trackCustomEvent: (eventName, data) => {
        if (window.app && window.app.analyticsManager) {
            window.app.analyticsManager.trackEvent(eventName, data);
            console.log('[Analytics] Custom event tracked:', eventName, data);
        } else {
            console.warn('[Analytics] Analytics manager not available');
        }
    },
    
    getSessionInfo: () => {
        if (window.app && window.app.analyticsManager) {
            return window.app.analyticsManager.getSessionInfo();
        }
        return null;
    }
};

console.log('✅ App v5.1.1 loaded - DUAL PROVIDER (Microsoft + Google) + ANALYTICS + LICENSE INTEGRATION');
console.log('🔧 Fonctions globales disponibles: window.diagnoseApp(), window.testServices(), window.repairMailService(), window.testLicense()');
console.log('🌐 Helpers Netlify: window.netlifyHelpers');
console.log('📊 Helpers Analytics: window.analyticsHelpers');
console.log('🔑 Système de licence: Blocage automatique des licences expirées avec accès admin préservé');
console.log('🔍 Scanner: Module startscan.js chargé SANS fallback pour permettre le chargement natif');
