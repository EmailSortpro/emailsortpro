// app.js - Application CORRIGÉE avec Header Unifié

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        
        console.log('[App] Constructor - Application starting with unified header...');
    }

    async init() {
        console.log('[App] Initializing with unified header...');
        
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
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupUnifiedHeaderListeners();
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
                    this.showAppWithUnifiedHeader();
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
                <div class="config-error-page">
                    <div class="config-error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="config-error-title">Configuration requise</h1>
                    <div class="config-error-content">
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
                    <div class="config-error-actions">
                        <a href="setup.html" class="config-error-button">
                            <i class="fas fa-cog"></i>
                            Configurer l'application
                        </a>
                        <button onclick="location.reload()" class="config-error-button secondary">
                            <i class="fas fa-refresh"></i>
                            Actualiser
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    // NOUVELLE MÉTHODE - Configuration des event listeners pour header unifié
    setupUnifiedHeaderListeners() {
        console.log('[App] Setting up unified header listeners...');
        
        // Navigation unifiée
        document.querySelectorAll('.nav-item').forEach(item => {
            // Cloner pour éviter les doublons d'event listeners
            const newItem = item.cloneNode(true);
            if (item.parentNode) {
                item.parentNode.replaceChild(newItem, item);
            }
            
            newItem.addEventListener('click', (e) => {
                // Retirer la classe active de tous les éléments
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                
                // Ajouter la classe active à l'élément cliqué
                newItem.classList.add('active');
                
                // Charger la page
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    window.pageManager.loadPage(page);
                }
            });
        });

        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Bouton notifications
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                console.log('[App] Notifications clicked');
                if (window.uiManager) {
                    window.uiManager.showToast('Notifications non implémentées', 'info');
                }
            });
        }

        // Gestionnaires d'erreur globaux
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
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });

        console.log('[App] Unified header listeners configured');
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
        
        // S'assurer que la page de login est visible
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        // S'assurer que l'app n'est pas en mode actif
        document.body.classList.remove('app-active');
        
        // Masquer le header unifié
        const unifiedHeader = document.querySelector('.unified-header');
        if (unifiedHeader) {
            unifiedHeader.style.display = 'none';
        }
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    // MÉTHODE CORRIGÉE - Affichage avec header unifié
    showAppWithUnifiedHeader() {
        console.log('[App] Showing application with unified header');
        
        this.hideModernLoading();
        
        // ÉTAPE 1: Activer immédiatement le mode app
        document.body.classList.add('app-active');
        console.log('[App] App mode activated');
        
        // ÉTAPE 2: Forcer l'affichage des éléments
        const loginPage = document.getElementById('loginPage');
        const unifiedHeader = document.querySelector('.unified-header');
        const pageContent = document.getElementById('pageContent');
        
        // Masquer la page de login
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        // Afficher le header unifié
        if (unifiedHeader) {
            unifiedHeader.style.display = 'block';
            unifiedHeader.style.opacity = '1';
            unifiedHeader.style.visibility = 'visible';
            console.log('[App] Unified header displayed');
        }
        
        // Afficher le contenu
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        }
        
        // ÉTAPE 3: Mettre à jour l'interface utilisateur
        this.updateUserInfoInHeader();
        
        // ÉTAPE 4: Charger le dashboard immédiatement
        console.log('[App] Loading dashboard...');
        if (window.pageManager) {
            setTimeout(() => {
                window.pageManager.loadPage('dashboard');
                console.log('[App] Dashboard loading requested');
            }, 100);
        } else {
            console.warn('[App] PageManager not available, dashboard will show default content');
        }
        
        // ÉTAPE 5: Vérifier l'onboarding
        setTimeout(() => {
            if (window.onboardingManager && window.onboardingManager.isFirstTime()) {
                console.log('[App] Premier utilisateur détecté');
            }
        }, 500);
        
        // ÉTAPE 6: Forcer l'affichage avec CSS (sécurité)
        this.forceUnifiedHeaderDisplay();
        
        console.log('[App] ✅ Application with unified header fully displayed');
    }

    // NOUVELLE MÉTHODE - Mise à jour des infos utilisateur dans le header unifié
    updateUserInfoInHeader() {
        if (!this.user) return;

        const userAvatar = document.getElementById('userAvatar');
        const userDetails = document.getElementById('userDetails');
        
        if (userAvatar && userDetails) {
            // Mise à jour de l'avatar avec initiales
            const initials = this.getInitials(this.user.displayName || this.user.mail);
            userAvatar.innerHTML = initials;
            
            // Mise à jour des détails utilisateur
            userDetails.innerHTML = `
                <div class="user-name">${this.user.displayName || 'Utilisateur'}</div>
                <div class="user-email">${this.user.mail || ''}</div>
            `;
            
            console.log('[App] User info updated in unified header:', this.user.displayName || this.user.mail);
        }

        // Mettre à jour aussi via UIManager si disponible
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
    }

    // Méthode pour obtenir les initiales
    getInitials(name) {
        if (!name) return 'U';
        
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // NOUVELLE MÉTHODE - Forcer l'affichage via CSS pour header unifié
    forceUnifiedHeaderDisplay() {
        // Injecter du CSS pour forcer l'affichage du header unifié
        const forceDisplayStyle = document.createElement('style');
        forceDisplayStyle.id = 'force-unified-display';
        forceDisplayStyle.textContent = `
            body.app-active #loginPage {
                display: none !important;
            }
            body.app-active .unified-header {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            body.app-active #pageContent {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            /* Masquer les anciens éléments header/nav au cas où */
            .app-header,
            .app-nav {
                display: none !important;
            }
        `;
        
        // Supprimer l'ancien style s'il existe
        const oldStyle = document.getElementById('force-unified-display');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(forceDisplayStyle);
        console.log('[App] Force unified header display CSS injected');
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
            document.body.style.overflow = 'auto';
        }
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="config-error-page">
                    <div class="config-error-icon">
                        <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                    </div>
                    <h1 class="config-error-title">Erreur d'application</h1>
                    <div class="config-error-content">
                        <p style="font-size: 1.2rem; line-height: 1.6;">${message}</p>
                    </div>
                    <div class="config-error-actions">
                        <button onclick="location.reload()" class="config-error-button">
                            <i class="fas fa-refresh"></i>
                            Actualiser la page
                        </button>
                        <button onclick="window.app.forceCleanup()" class="config-error-button secondary">
                            <i class="fas fa-undo"></i>
                            Réinitialiser
                        </button>
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

// Fonction globale pour le reset d'urgence
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

// Fonction pour forcer l'affichage (accessible globalement) - Version header unifié
window.forceShowApp = function() {
    console.log('[Global] Force show app with unified header triggered');
    if (window.app && typeof window.app.showAppWithUnifiedHeader === 'function') {
        window.app.showAppWithUnifiedHeader();
    } else {
        // Fallback si l'app n'est pas prête
        document.body.classList.add('app-active');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        const unifiedHeader = document.querySelector('.unified-header');
        if (unifiedHeader) unifiedHeader.style.display = 'block';
    }
};

// Fonction pour mettre à jour la navigation active (version unifiée)
window.updateActiveNavigation = function(activePage) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === activePage) {
            item.classList.add('active');
        }
    });
};

// Fonction pour mettre à jour les infos utilisateur (accessible globalement)
window.updateUserInfo = function(user) {
    if (window.app && typeof window.app.updateUserInfoInHeader === 'function') {
        window.app.user = user;
        window.app.updateUserInfoInHeader();
    }
};

function checkServicesReady() {
    const requiredServices = ['authService', 'mailService', 'uiManager'];
    const missingServices = requiredServices.filter(service => !window[service]);
    
    if (missingServices.length > 0) {
        console.warn('[App] Missing services:', missingServices);
        
        if (missingServices.includes('mailService')) {
            console.error('[App] MailService not loaded - Check if MailService.js exists and filename case is correct');
            console.error('[App] Note: File names are case-sensitive on GitHub Pages (Linux servers)');
        }
        
        return false;
    }
    
    if (!window.AppConfig) {
        console.warn('[App] Missing AppConfig');
        return false;
    }
    
    if (!window.scanStartModule) {
        console.warn('[App] ScanStart module not available - will use fallback');
    }
    
    return true;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating app instance with unified header...');
    
    window.app = new App();
    
    const waitForServices = () => {
        if (checkServicesReady()) {
            console.log('[App] All services ready, initializing with unified header...');
            
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
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
            }
        }
    }, 5000);
});

// Amélioration du UIManager pour le header unifié
if (window.uiManager) {
    // Overrider la méthode updateAuthStatus pour le header unifié
    const originalUpdateAuthStatus = window.uiManager.updateAuthStatus;
    window.uiManager.updateAuthStatus = function(user) {
        // Appeler la méthode originale
        if (originalUpdateAuthStatus) {
            originalUpdateAuthStatus.call(this, user);
        }
        
        // Mettre à jour le header unifié
        if (user && window.updateUserInfo) {
            window.updateUserInfo(user);
        }
    };
}

console.log('✅ App loaded with UNIFIED HEADER and guaranteed visibility');
