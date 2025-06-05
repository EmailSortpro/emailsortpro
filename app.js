// app.js - Application CORRIGÉE pour emailsortpro.netlify.app v3.1

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        
        console.log('[App] Constructor - Application starting for emailsortpro.netlify.app...');
        this.verifyDomain();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        
        console.log('[App] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain
        });
        
        if (!isCorrectDomain && !currentDomain.includes('localhost') && !currentDomain.includes('127.0.0.1')) {
            console.warn('[App] ⚠️ Domain mismatch detected!');
            console.warn('[App] This may cause authentication issues with Azure');
            
            // Afficher un avertissement
            if (window.uiManager) {
                window.uiManager.showToast(
                    `Domaine incorrect: ${currentDomain}. Attendu: ${this.expectedDomain}`,
                    'warning',
                    10000
                );
            }
        }
    }

    async init() {
        console.log('[App] Initializing for emailsortpro.netlify.app...');
        
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

            console.log('[App] Initializing auth service for emailsortpro.netlify.app...');
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 20000)
            );
            
            const initPromise = window.authService.initialize();
            await Promise.race([initPromise, initTimeout]);
            
            console.log('[App] Auth service initialized for new domain');
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
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
            console.error('[App] Configuration invalid for emailsortpro.netlify.app:', validation.issues);
            this.showConfigurationError(validation.issues);
            return false;
        }

        // Vérification spécifique pour le nouveau domaine
        if (window.AppConfig.msal.redirectUri && 
            !window.AppConfig.msal.redirectUri.includes(this.expectedDomain)) {
            console.error('[App] Redirect URI does not match expected domain');
            this.showConfigurationError([
                `URI de redirection incorrecte pour ${this.expectedDomain}`,
                `Attendue: https://${this.expectedDomain}/auth-callback.html`,
                `Actuelle: ${window.AppConfig.msal.redirectUri}`
            ]);
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
                console.log('[App] Getting user info for emailsortpro.netlify.app...');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.isAuthenticated = true;
                    console.log('[App] User authenticated on new domain:', this.user.displayName || this.user.mail);
                    this.showAppWithTransition();
                } catch (userInfoError) {
                    console.error('[App] Error getting user info on new domain:', userInfoError);
                    if (userInfoError.message.includes('401') || userInfoError.message.includes('403')) {
                        console.log('[App] Token seems invalid, clearing auth and showing login');
                        await window.authService.reset();
                        this.showLogin();
                    } else {
                        this.showLogin();
                    }
                }
            } else {
                console.log('[App] No active account found on new domain');
                this.showLogin();
            }
        } else {
            console.log('[App] User not authenticated on emailsortpro.netlify.app');
            this.showLogin();
        }
    }

    async handleInitializationError(error) {
        console.error('[App] Initialization error for emailsortpro.netlify.app:', error);
        
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError([
                'Configuration Azure incorrecte pour emailsortpro.netlify.app',
                'Vérifiez votre Client ID et les URI de redirection',
                'URI de redirection attendue: https://emailsortpro.netlify.app/auth-callback.html',
                'Consultez la documentation Azure App Registration'
            ]);
            return;
        }
        
        if (error.message.includes('invalid_request') || error.message.includes('redirect_uri')) {
            this.showConfigurationError([
                'URI de redirection invalide pour emailsortpro.netlify.app',
                'Dans Azure Portal, configurez:',
                'URI de redirection: https://emailsortpro.netlify.app/auth-callback.html',
                'URI de déconnexion: https://emailsortpro.netlify.app/'
            ]);
            return;
        }
        
        if (error.message.includes('Configuration invalid')) {
            this.showConfigurationError(['Configuration invalide - vérifiez la configuration pour le nouveau domaine']);
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
        
        this.showError('Failed to initialize the application for emailsortpro.netlify.app. Please check the configuration and refresh the page.');
    }

    showConfigurationError(issues) {
        console.error('[App] Configuration error for emailsortpro.netlify.app:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="hero-container">
                    <div style="max-width: 700px; margin: 0 auto; text-align: center; color: white;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Configuration requise pour emailsortpro.netlify.app</h1>
                        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px; color: #10b981;">Configuration Azure requise :</h4>
                                <div style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 10px 0;">
                                    <div>🔗 <strong>Redirect URI:</strong></div>
                                    <div style="color: #10b981; margin: 5px 0;">https://emailsortpro.netlify.app/auth-callback.html</div>
                                    <div>🚪 <strong>Logout URI:</strong></div>
                                    <div style="color: #10b981; margin: 5px 0;">https://emailsortpro.netlify.app/</div>
                                </div>
                                <ol style="margin-left: 20px; margin-top: 15px;">
                                    <li>Connectez-vous à Azure Portal</li>
                                    <li>Allez dans votre App Registration</li>
                                    <li>Section "Authentication" → Mettez à jour les URI</li>
                                    <li>Cliquez sur "Configurer l'application" ci-dessous</li>
                                </ol>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="/setup.html" class="cta-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="cta-button" style="background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                            <button onclick="window.app.checkDomainConfiguration()" class="cta-button" style="background: rgba(59, 130, 246, 0.8); color: white; border: 1px solid rgba(59, 130, 246, 0.3);">
                                <i class="fas fa-info-circle"></i>
                                Diagnostic
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    // Nouvelle méthode de diagnostic spécifique au domaine
    checkDomainConfiguration() {
        console.group('🔍 DIAGNOSTIC DOMAINE emailsortpro.netlify.app');
        
        const currentDomain = window.location.hostname;
        const expectedDomain = this.expectedDomain;
        const currentUrl = window.location.href;
        
        console.log('🌐 Domaine actuel:', currentDomain);
        console.log('🎯 Domaine attendu:', expectedDomain);
        console.log('✅ Correspondance:', currentDomain === expectedDomain);
        console.log('🔗 URL actuelle:', currentUrl);
        
        if (window.AppConfig) {
            console.log('⚙️ Configuration:');
            console.log('  - Client ID:', window.AppConfig.msal.clientId?.substring(0, 8) + '...');
            console.log('  - Redirect URI:', window.AppConfig.msal.redirectUri);
            console.log('  - Post Logout URI:', window.AppConfig.msal.postLogoutRedirectUri);
            console.log('  - Domaine config:', window.AppConfig.app?.domain);
            
            const validation = window.AppConfig.validate();
            console.log('  - Validation:', validation);
        } else {
            console.log('❌ Configuration non disponible');
        }
        
        console.log('🔧 Actions recommandées:');
        console.log('1. Vérifiez que vous êtes sur https://emailsortpro.netlify.app');
        console.log('2. Dans Azure Portal, configurez les URI:');
        console.log('   - Redirect: https://emailsortpro.netlify.app/auth-callback.html');
        console.log('   - Logout: https://emailsortpro.netlify.app/');
        console.log('3. Allez sur /setup.html pour reconfigurer');
        
        console.groupEnd();
        
        if (window.uiManager) {
            window.uiManager.showToast(
                'Diagnostic terminé - Consultez la console pour les détails',
                'info',
                5000
            );
        }
    }

    setupEventListeners() {
        console.log('[App] Setting up event listeners for emailsortpro.netlify.app...');
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            
            newLoginBtn.addEventListener('click', () => this.login());
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    window.pageManager.loadPage(page);
                }
            });
        });

        window.addEventListener('error', (event) => {
            console.error('[App] Global error on emailsortpro.netlify.app:', event.error);
            
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
                            'Erreur de configuration Azure pour emailsortpro.netlify.app. Vérifiez votre Client ID.',
                            'error',
                            10000
                        );
                    }
                } else if (message.includes('invalid_request') || message.includes('redirect_uri')) {
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'URI de redirection invalide. Configurez: https://emailsortpro.netlify.app/auth-callback.html',
                            'error',
                            15000
                        );
                    }
                }
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection on emailsortpro.netlify.app:', event.reason);
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
                
                if (event.reason.errorCode === 'invalid_request') {
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Configuration Azure requise pour emailsortpro.netlify.app',
                            'error',
                            10000
                        );
                    }
                }
            }
        });
    }

    async login() {
        console.log('[App] Login attempted for emailsortpro.netlify.app...');
        
        try {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';
            }
            
            this.showModernLoading('Connexion à Outlook sur emailsortpro.netlify.app...');
            
            if (!window.authService.isInitialized) {
                console.log('[App] AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Login error on emailsortpro.netlify.app:', error);
            
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
                            errorMessage = 'Configuration incorrecte pour emailsortpro.netlify.app. Vérifiez votre Azure Client ID.';
                            break;
                        case 'invalid_request':
                            errorMessage = 'URI de redirection invalide. Configurez: https://emailsortpro.netlify.app/auth-callback.html dans Azure Portal.';
                            break;
                        default:
                            errorMessage = `Erreur: ${errorCode}`;
                    }
                }
            } else if (error.message.includes('unauthorized_client')) {
                errorMessage = 'Configuration Azure incorrecte pour emailsortpro.netlify.app. Vérifiez votre Client ID.';
            } else if (error.message.includes('redirect_uri') || error.message.includes('invalid_request')) {
                errorMessage = 'URI de redirection invalide. Reconfigurez votre application Azure pour emailsortpro.netlify.app.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 12000);
            }
            
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fab fa-microsoft"></i> Se connecter à Outlook';
            }
        }
    }

    async logout() {
        console.log('[App] Logout attempted from emailsortpro.netlify.app...');
        
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
            console.error('[App] Logout error on emailsortpro.netlify.app:', error);
            this.hideModernLoading();
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de déconnexion. Nettoyage forcé...', 'warning');
            }
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] Force cleanup for emailsortpro.netlify.app...');
        
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
        console.log('[App] Showing login page for emailsortpro.netlify.app');
        
        // S'assurer que la page de login est visible
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        // S'assurer que l'app n'est pas en mode actif
        document.body.classList.remove('app-active');
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    // MÉTHODE CORRIGÉE - Affichage forcé de l'application
    showAppWithTransition() {
        console.log('[App] Showing application with FORCED transition for emailsortpro.netlify.app');
        
        this.hideModernLoading();
        
        // ÉTAPE 1: Activer immédiatement le mode app
        document.body.classList.add('app-active');
        console.log('[App] App mode activated for new domain');
        
        // ÉTAPE 2: Forcer l'affichage des éléments
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        // Masquer la page de login
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        // Afficher le header
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
            console.log('[App] Header displayed');
        }
        
        // Afficher la navigation
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
            console.log('[App] Navigation displayed');
        }
        
        // Afficher le contenu
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        }
        
        // ÉTAPE 3: Mettre à jour l'interface utilisateur
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // ÉTAPE 4: Charger le dashboard immédiatement
        console.log('[App] Loading dashboard for emailsortpro.netlify.app...');
        if (window.pageManager) {
            // Petit délai pour s'assurer que tout est prêt
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
                console.log('[App] Premier utilisateur détecté sur emailsortpro.netlify.app');
            }
        }, 500);
        
        // ÉTAPE 6: Forcer l'affichage avec CSS (sécurité)
        this.forceAppDisplay();
        
        console.log('[App] ✅ Application fully displayed for emailsortpro.netlify.app');
    }

    // Nouvelle méthode pour forcer l'affichage via CSS
    forceAppDisplay() {
        // Injecter du CSS pour forcer l'affichage
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
        
        // Supprimer l'ancien style s'il existe
        const oldStyle = document.getElementById('force-app-display');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(forceDisplayStyle);
        console.log('[App] Force display CSS injected for emailsortpro.netlify.app');
    }

    showModernLoading(message = 'Chargement...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('.login-loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div>${message}</div>
                    <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">emailsortpro.netlify.app</div>
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
        console.error('[App] Showing error for emailsortpro.netlify.app:', message);
        
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
                            <div style="margin-top: 15px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; font-size: 0.9rem;">
                                <strong>Domaine:</strong> emailsortpro.netlify.app<br>
                                <strong>Statut:</strong> ${window.location.hostname === this.expectedDomain ? '✅ Correct' : '❌ Incorrect'}
                            </div>
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
                            <a href="/setup.html" class="cta-button" style="background: rgba(59, 130, 246, 0.8); color: white; text-decoration: none;">
                                <i class="fas fa-cog"></i>
                                Configuration
                            </a>
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

// Fonction globale pour le reset d'urgence
window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered for emailsortpro.netlify.app');
    
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

// Fonction pour forcer l'affichage (accessible globalement)
window.forceShowApp = function() {
    console.log('[Global] Force show app triggered for emailsortpro.netlify.app');
    if (window.app && typeof window.app.showAppWithTransition === 'function') {
        window.app.showAppWithTransition();
    } else {
        // Fallback si l'app n'est pas prête
        document.body.classList.add('app-active');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
    }
};

// Fonction de diagnostic domaine (accessible globalement)
window.checkDomain = function() {
    console.log('=== DIAGNOSTIC DOMAINE ===');
    console.log('Domaine actuel:', window.location.hostname);
    console.log('Domaine attendu: emailsortpro.netlify.app');
    console.log('URL complète:', window.location.href);
    console.log('Correspondance:', window.location.hostname === 'emailsortpro.netlify.app');
    
    if (window.AppConfig) {
        console.log('Configuration redirect URI:', window.AppConfig.msal?.redirectUri);
        console.log('Configuration logout URI:', window.AppConfig.msal?.postLogoutRedirectUri);
    }
    
    if (window.app) {
        window.app.checkDomainConfiguration();
    }
};

function checkServicesReady() {
    const requiredServices = ['authService', 'mailService', 'uiManager'];
    const missingServices = requiredServices.filter(service => !window[service]);
    
    if (missingServices.length > 0) {
        console.warn('[App] Missing services for emailsortpro.netlify.app:', missingServices);
        
        if (missingServices.includes('mailService')) {
            console.error('[App] MailService not loaded - Check if MailService.js exists and filename case is correct');
            console.error('[App] Note: File names are case-sensitive on live servers');
        }
        
        return false;
    }
    
    if (!window.AppConfig) {
        console.warn('[App] Missing AppConfig for emailsortpro.netlify.app');
        return false;
    }
    
    if (!window.scanStartModule) {
        console.warn('[App] ScanStart module not available - will use fallback');
    }
    
    return true;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded for emailsortpro.netlify.app, creating app instance...');
    
    window.app = new App();
    
    const waitForServices = () => {
        if (checkServicesReady()) {
            console.log('[App] All services ready for emailsortpro.netlify.app, initializing...');
            
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
            console.error('[App] App instance not created for emailsortpro.netlify.app, creating fallback...');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] Fallback initialization check for emailsortpro.netlify.app...');
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
            }
        }
    }, 5000);
});

console.log('✅ App loaded for emailsortpro.netlify.app with enhanced domain verification v3.1');
