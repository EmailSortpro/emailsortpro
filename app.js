// app.js - Application principale CORRIGÉE v2.2 avec gestion ScanStart et messages d'erreur améliorés

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
    }

    async init() {
        console.log('[App] Initializing...');
        
        // Éviter l'initialisation multiple
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
            // Vérifications préliminaires
            if (!this.checkPrerequisites()) {
                return;
            }

            console.log('[App] Initializing auth service...');
            
            // Initialize auth service avec timeout
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 20000)
            );
            
            const initPromise = window.authService.initialize();
            await Promise.race([initPromise, initTimeout]);
            
            console.log('[App] Auth service initialized');
            
            // Check authentication
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
            
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    checkPrerequisites() {
        // Vérifier si MSAL est chargé
        if (typeof msal === 'undefined') {
            console.error('[App] MSAL library not loaded');
            this.showError('MSAL library not loaded. Please refresh the page.');
            return false;
        }

        // Vérifier si la configuration est chargée
        if (!window.AppConfig) {
            console.error('[App] Configuration not loaded');
            this.showError('Configuration not loaded. Please refresh the page.');
            return false;
        }

        // Vérifier la validité de la configuration
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.error('[App] Configuration invalid:', validation.issues);
            this.showConfigurationError(validation.issues);
            return false;
        }

        // Vérifier si authService existe
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
                    console.log('[App] User authenticated:', this.user.displayName);
                    this.showApp();
                } catch (userInfoError) {
                    console.error('[App] Error getting user info:', userInfoError);
                    // Si on a un compte mais pas d'info utilisateur, essayer de se reconnecter
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
        
        // Gestion d'erreurs spécifiques
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError([
                'Configuration Azure incorrecte',
                'Vérifiez votre Client ID dans config.js',
                'Consultez la documentation Azure App Registration'
            ]);
            return;
        }
        
        if (error.message.includes('Configuration invalid')) {
            this.showConfigurationError(['Configuration invalide - vérifiez config.js']);
            return;
        }
        
        // Réessayer l'initialisation si c'est un problème temporaire
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
                <div class="login-card">
                    <div class="login-icon" style="color: #f59e0b;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 style="color: #f59e0b;">Configuration Error</h1>
                    <div style="text-align: left; margin: 20px 0;">
                        <h3>Issues detected:</h3>
                        <ul>
                            ${issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                        <h4>Steps to fix:</h4>
                        <ol>
                            <li>Click on "Configure the application" below</li>
                            <li>Follow the setup wizard</li>
                            <li>Enter your Azure Client ID</li>
                        </ol>
                    </div>
                    <a href="setup.html" class="btn btn-primary">
                        <i class="fas fa-cog"></i>
                        Configure the application
                    </a>
                    <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 10px;">
                        <i class="fas fa-refresh"></i>
                        Refresh Page
                    </button>
                    <button class="btn btn-secondary" onclick="window.diagnoseMSAL()" style="margin-top: 10px;">
                        <i class="fas fa-bug"></i>
                        Run Diagnostics
                    </button>
                </div>
            `;
            loginPage.style.display = 'block';
        }
        
        this.hideOtherUIElements();
    }

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            // Supprimer l'ancien listener s'il existe
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            
            newLoginBtn.addEventListener('click', () => this.login());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            // Supprimer les anciens listeners
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    window.pageManager.loadPage(page);
                }
            });
        });

        // Gestion des erreurs globales améliorée avec gestion ScanStart
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            // Gestion spécifique des erreurs ScanStart.js
            if (event.error && event.error.message && 
                event.error.message.includes('ScanStart.js') && 
                event.error.message.includes('Unexpected token')) {
                console.warn('[App] ScanStart.js syntax error detected - module should be handled inline');
                // L'erreur est gérée par le module inline dans index.html
                return;
            }
            
            // Gestion spécifique des erreurs MSAL
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
            
            // Gestion des rejets de promesse MSAL
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
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            }
            
            if (window.uiManager) {
                window.uiManager.showLoading('Connecting to Microsoft...');
            }
            
            // Vérifier si authService est prêt
            if (!window.authService.isInitialized) {
                console.log('[App] AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            // La page va se rediriger après login
            
        } catch (error) {
            console.error('[App] Login error:', error);
            
            if (window.uiManager) {
                window.uiManager.hideLoading();
                
                // Messages d'erreur plus spécifiques basés sur les codes d'erreur MSAL
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.errorCode) {
                    const errorCode = error.errorCode;
                    if (window.AppConfig.errors[errorCode]) {
                        errorMessage = window.AppConfig.errors[errorCode];
                    } else {
                        switch (errorCode) {
                            case 'popup_window_error':
                                errorMessage = 'Popup blocked. Please allow popups and try again.';
                                break;
                            case 'user_cancelled':
                                errorMessage = 'Login cancelled by user.';
                                break;
                            case 'network_error':
                                errorMessage = 'Network error. Please check your connection and try again.';
                                break;
                            case 'unauthorized_client':
                                errorMessage = 'Configuration error. Please check your Azure app registration.';
                                break;
                            default:
                                errorMessage = `Login error: ${errorCode}`;
                        }
                    }
                } else if (error.message.includes('unauthorized_client')) {
                    errorMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
                }
                
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            // Restaurer le bouton
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fab fa-microsoft"></i> Se connecter avec Microsoft';
            }
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        try {
            const confirmed = confirm('Are you sure you want to log out?');
            if (!confirmed) return;
            
            if (window.uiManager) {
                window.uiManager.showLoading('Logging out...');
            }
            
            if (window.authService) {
                await window.authService.logout();
            } else {
                this.forceCleanup();
            }
            
        } catch (error) {
            console.error('[App] Logout error:', error);
            if (window.uiManager) {
                window.uiManager.hideLoading();
                window.uiManager.showToast('Logout failed. Forcing cleanup...', 'warning');
            }
            
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] Force cleanup...');
        
        // Reset internal state
        this.user = null;
        this.isAuthenticated = false;
        this.isInitializing = false;
        this.initializationPromise = null;
        
        // Reset auth service
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        // Clear relevant localStorage
        const keysToKeep = ['emailsort_categories', 'emailsort_tasks'];
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
        
        // Reload page
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLogin() {
        console.log('[App] Showing login page');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'block';
        }
        
        this.hideOtherUIElements();
        
        // Update auth status
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
            window.uiManager.hideLoading();
        }
    }

    showApp() {
        console.log('[App] Showing application');
        
        const loginPage = document.getElementById('loginPage');
        const mainNav = document.getElementById('mainNav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        if (mainNav) {
            mainNav.style.display = 'flex';
        }
        if (pageContent) {
            pageContent.style.display = 'block';
        }
        
        // Update auth status
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
            window.uiManager.hideLoading();
        }
        
        // Load dashboard
        if (window.pageManager) {
            setTimeout(() => {
                window.pageManager.loadPage('dashboard');
            }, 100);
        }
        
        // Check onboarding après un délai (mais pas automatique)
        setTimeout(() => {
            if (window.onboardingManager && window.onboardingManager.isFirstTime()) {
                console.log('[App] First-time user detected, onboarding available');
                // L'onboarding sera disponible mais pas automatique
            }
        }, 500);
    }

    hideOtherUIElements() {
        const mainNav = document.getElementById('mainNav');
        const pageContent = document.getElementById('pageContent');
        
        if (mainNav) mainNav.style.display = 'none';
        if (pageContent) pageContent.style.display = 'none';
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-card">
                    <div class="login-icon" style="color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 style="color: #ef4444;">Application Error</h1>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Refresh Page
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.forceCleanup()" style="margin-top: 10px;">
                        <i class="fas fa-undo"></i>
                        Reset and Refresh
                    </button>
                    <button class="btn btn-secondary" onclick="window.diagnoseMSAL()" style="margin-top: 10px;">
                        <i class="fas fa-bug"></i>
                        Run Diagnostics
                    </button>
                </div>
            `;
            loginPage.style.display = 'block';
        }
        
        this.hideOtherUIElements();
        
        if (window.uiManager) {
            window.uiManager.hideLoading();
        }
    }

    // Diagnostic pour les erreurs ScanStart
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

// Fonction globale pour le reset d'urgence
window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered');
    
    // Nettoyer tout le localStorage
    const keysToKeep = ['emailsort_categories', 'emailsort_tasks'];
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
    
    // Recharger
    window.location.reload();
};

// Fonction pour vérifier que tous les services sont chargés
function checkServicesReady() {
    const requiredServices = ['authService', 'mailService', 'uiManager'];
    const missingServices = requiredServices.filter(service => !window[service]);
    
    if (missingServices.length > 0) {
        console.warn('[App] Missing services:', missingServices);
        
        // Message d'erreur plus explicite pour MailService
        if (missingServices.includes('mailService')) {
            console.error('[App] MailService not loaded - Check if MailService.js exists and filename case is correct');
            console.error('[App] Note: File names are case-sensitive on GitHub Pages (Linux servers)');
        }
        
        return false;
    }
    
    // Vérifier aussi la configuration
    if (!window.AppConfig) {
        console.warn('[App] Missing AppConfig');
        return false;
    }
    
    // Vérifier ScanStart (non critique)
    if (!window.scanStartModule) {
        console.warn('[App] ScanStart module not available - will use fallback');
    }
    
    return true;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating app instance...');
    
    // Créer l'instance de l'app
    window.app = new App();
    
    // Attendre que tous les services soient chargés
    const waitForServices = () => {
        if (checkServicesReady()) {
            console.log('[App] All services ready, initializing...');
            
            // Vérifier ScanStart et afficher le statut
            const scanStartStatus = window.app.checkScanStartModule();
            console.log('[App] ScanStart status:', scanStartStatus);
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else {
            console.log('[App] Waiting for services...');
            setTimeout(waitForServices, 100);
        }
    };
    
    waitForServices();
});

// Fallback si l'initialisation échoue
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) {
            console.error('[App] App instance not created, creating fallback...');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] Fallback initialization check...');
            
            const loginPage = document.getElementById('loginPage');
            
            // S'assurer qu'au moins la page de login est visible
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'block';
            }
        }
    }, 5000);
});

console.log('✅ App loaded with enhanced MSAL error handling and improved error messages');