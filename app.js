// app.js - Application EmailSortPro Dual Provider Optimisée v2.0
// Support Outlook et Gmail avec architecture simplifiée

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null; // 'outlook' ou 'gmail'
        this.isInitializing = false;
        this.currentPage = 'dashboard';
        
        console.log('[App] ✅ EmailSortPro v2.0 - Dual Provider Optimisé');
    }

    async init() {
        console.log('[App] Initialisation de l\'application...');
        
        if (this.isInitializing) {
            console.log('[App] Initialisation déjà en cours');
            return;
        }
        
        this.isInitializing = true;
        
        try {
            // 1. Vérifier les prérequis
            if (!this.checkPrerequisites()) {
                throw new Error('Prérequis manquants');
            }

            // 2. Initialiser les services d'authentification
            await this.initializeAuthServices();
            
            // 3. Initialiser les modules critiques
            await this.initializeCriticalModules();
            
            // 4. Vérifier l'authentification
            await this.checkAuthenticationStatus();
            
            // 5. Configurer les événements
            this.setupEventListeners();
            
            // 6. Initialiser la gestion du scroll
            this.initializeScrollManager();
            
            console.log('[App] ✅ Initialisation terminée');
            
        } catch (error) {
            console.error('[App] ❌ Erreur d\'initialisation:', error);
            this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
        }
    }

    // ===== VÉRIFICATION DES PRÉREQUIS =====
    checkPrerequisites() {
        console.log('[App] Vérification des prérequis...');
        
        // Vérifier MSAL pour Outlook
        if (!window.msal) {
            this.showError('Bibliothèque MSAL non chargée');
            return false;
        }

        // Vérifier la configuration
        if (!window.AppConfig) {
            this.showError('Configuration non chargée');
            return false;
        }

        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            this.showConfigurationError(validation.issues);
            return false;
        }

        // Vérifier au moins un service d'auth
        if (!window.authService && !window.googleAuthService) {
            this.showError('Aucun service d\'authentification disponible');
            return false;
        }

        console.log('[App] ✅ Prérequis validés');
        return true;
    }

    // ===== INITIALISATION DES SERVICES D'AUTHENTIFICATION =====
    async initializeAuthServices() {
        console.log('[App] Initialisation des services d\'authentification...');
        
        const promises = [];
        
        // Initialiser Outlook si disponible
        if (window.authService) {
            promises.push(
                window.authService.initialize()
                    .then(() => {
                        console.log('[App] ✅ Service Outlook initialisé');
                        return 'outlook';
                    })
                    .catch(error => {
                        console.warn('[App] ⚠️ Service Outlook non disponible:', error.message);
                        return null;
                    })
            );
        }
        
        // Initialiser Gmail si disponible
        if (window.googleAuthService) {
            promises.push(
                window.googleAuthService.initialize()
                    .then(() => {
                        console.log('[App] ✅ Service Gmail initialisé');
                        return 'gmail';
                    })
                    .catch(error => {
                        console.warn('[App] ⚠️ Service Gmail non disponible:', error.message);
                        return null;
                    })
            );
        }
        
        const results = await Promise.allSettled(promises);
        const availableProviders = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);
        
        if (availableProviders.length === 0) {
            throw new Error('Aucun service d\'authentification disponible');
        }
        
        console.log('[App] ✅ Services disponibles:', availableProviders);
    }

    // ===== INITIALISATION DES MODULES CRITIQUES =====
    async initializeCriticalModules() {
        console.log('[App] Initialisation des modules critiques...');
        
        // Modules requis
        await this.waitForModule('taskManager', 'TaskManager', true);
        await this.waitForModule('categoryManager', 'CategoryManager', true);
        await this.waitForModule('dashboardModule', 'DashboardModule', true);
        
        // PageManager dynamique selon le provider
        // Sera chargé après l'authentification
        
        // Modules optionnels
        await this.waitForModule('tasksView', 'TasksView', false);
        await this.waitForModule('uiManager', 'UIManager', false);
        
        console.log('[App] ✅ Modules critiques initialisés');
    }

    async waitForModule(moduleName, displayName, required = true) {
        console.log(`[App] Attente du module ${displayName}...`);
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window[moduleName] && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window[moduleName]) {
            if (required) {
                throw new Error(`Module ${displayName} non disponible`);
            } else {
                console.warn(`[App] Module ${displayName} non disponible - continuer sans`);
            }
        } else {
            console.log(`[App] ✅ Module ${displayName} prêt`);
        }
    }

    // ===== VÉRIFICATION DE L'AUTHENTIFICATION =====
    async checkAuthenticationStatus() {
        console.log('[App] Vérification de l\'authentification...');
        
        // Vérifier d'abord un callback Google OAuth
        if (await this.handleGoogleCallback()) {
            return;
        }
        
        // Vérifier Outlook
        if (window.authService && window.authService.isAuthenticated()) {
            try {
                const account = window.authService.getAccount();
                if (account) {
                    this.user = await window.authService.getUserInfo();
                    this.user.provider = 'outlook';
                    this.isAuthenticated = true;
                    this.activeProvider = 'outlook';
                    console.log('[App] ✅ Utilisateur Outlook authentifié:', this.user.displayName);
                    await this.showApp();
                    return;
                }
            } catch (error) {
                console.error('[App] Erreur Outlook:', error);
                await window.authService.reset();
            }
        }
        
        // Vérifier Gmail
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            try {
                const account = window.googleAuthService.getAccount();
                if (account) {
                    this.user = await window.googleAuthService.getUserInfo();
                    this.user.provider = 'gmail';
                    this.isAuthenticated = true;
                    this.activeProvider = 'gmail';
                    console.log('[App] ✅ Utilisateur Gmail authentifié:', this.user.displayName);
                    await this.showApp();
                    return;
                }
            } catch (error) {
                console.error('[App] Erreur Gmail:', error);
                await window.googleAuthService.reset();
            }
        }
        
        // Aucune authentification
        console.log('[App] Aucune authentification trouvée');
        this.showLogin();
    }

    // ===== GESTION DU CALLBACK GOOGLE =====
    async handleGoogleCallback() {
        // Vérifier si on revient d'un callback Google
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) {
            return false;
        }
        
        try {
            console.log('[App] Traitement du callback Google OAuth...');
            
            if (!window.googleAuthService) {
                throw new Error('Service Google non disponible');
            }
            
            const success = await window.googleAuthService.handleOAuthCallback(hash);
            
            if (success) {
                this.user = await window.googleAuthService.getUserInfo();
                this.user.provider = 'gmail';
                this.isAuthenticated = true;
                this.activeProvider = 'gmail';
                
                // Nettoyer l'URL
                window.history.replaceState(null, null, window.location.pathname);
                
                console.log('[App] ✅ Authentification Gmail réussie via callback');
                await this.showApp();
                return true;
            }
        } catch (error) {
            console.error('[App] Erreur callback Google:', error);
            window.uiManager?.showToast('Erreur d\'authentification Gmail', 'error');
        }
        
        return false;
    }

    // ===== MÉTHODES DE CONNEXION =====
    async loginOutlook() {
        console.log('[App] Connexion Outlook...');
        
        try {
            this.showLoading('Connexion à Outlook...');
            
            if (!window.authService) {
                throw new Error('Service Outlook non disponible');
            }
            
            await window.authService.login();
            
            // Recharger l'état après connexion
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            console.error('[App] Erreur connexion Outlook:', error);
            this.hideLoading();
            
            let message = 'Échec de la connexion Outlook';
            if (error.errorCode === 'popup_window_error') {
                message = 'Popup bloqué. Autorisez les popups et réessayez.';
            } else if (error.errorCode === 'user_cancelled') {
                message = 'Connexion annulée';
            }
            
            window.uiManager?.showToast(message, 'error');
        }
    }

    async loginGmail() {
        console.log('[App] Connexion Gmail...');
        
        try {
            this.showLoading('Redirection vers Gmail...');
            
            if (!window.googleAuthService) {
                throw new Error('Service Gmail non disponible');
            }
            
            // Gmail redirige automatiquement
            await window.googleAuthService.login();
            
        } catch (error) {
            console.error('[App] Erreur connexion Gmail:', error);
            this.hideLoading();
            window.uiManager?.showToast('Échec de la connexion Gmail', 'error');
        }
    }

    async logout() {
        console.log('[App] Déconnexion...');
        
        const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
        if (!confirmed) return;
        
        try {
            this.showLoading('Déconnexion...');
            
            if (this.activeProvider === 'outlook' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'gmail' && window.googleAuthService) {
                await window.googleAuthService.logout();
            }
            
        } catch (error) {
            console.error('[App] Erreur déconnexion:', error);
            this.forceCleanup();
        }
    }

    // ===== AFFICHAGE DE L'APPLICATION =====
    async showApp() {
        console.log('[App] Affichage de l\'application -', this.activeProvider);
        
        // Charger le PageManager approprié
        await this.loadPageManager();
        
        // Charger le scanner approprié
        await this.loadEmailScanner();
        
        this.hideLoading();
        
        // Basculer en mode app
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active', `provider-${this.activeProvider}`);
        
        // Masquer login et afficher app
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        // Afficher les éléments de l'app
        ['app-header', 'app-nav', 'pageContent'].forEach(className => {
            const element = document.querySelector(`.${className}`) || document.getElementById(className);
            if (element) {
                element.style.display = 'block';
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            }
        });
        
        // Mettre à jour l'UI
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Afficher le badge provider
        this.showProviderBadge();
        
        // Charger le dashboard
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        if (window.dashboardModule) {
            setTimeout(() => {
                window.dashboardModule.render();
                console.log('[App] ✅ Dashboard chargé');
            }, 100);
        }
        
        console.log('[App] ✅ Application affichée -', this.activeProvider);
    }

    async loadPageManager() {
        // PageManager est déjà chargé (version Outlook)
        if (window.pageManager) {
            console.log('[App] PageManager déjà chargé');
            return;
        }
        
        console.log('[App] Chargement PageManager...');
        
        // Pour cette version, on utilise le PageManagerOutlook pour les deux
        // Dans une version complète, on pourrait charger dynamiquement selon le provider
        
        await this.waitForModule('pageManager', 'PageManager', true);
    }

    async loadEmailScanner() {
        console.log('[App] Configuration du scanner pour', this.activeProvider);
        
        if (this.activeProvider === 'gmail') {
            // Si Gmail, créer une instance du scanner Gmail
            if (!window.emailScanner && window.EmailScannerGmail) {
                window.emailScanner = new window.EmailScannerGmail();
                console.log('[App] ✅ Scanner Gmail créé');
            }
        }
        // Pour Outlook, emailScanner est déjà configuré
    }

    showProviderBadge() {
        const userInfo = document.querySelector('.user-info');
        if (!userInfo) return;
        
        const existingBadge = userInfo.querySelector('.provider-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        const badge = document.createElement('span');
        badge.className = 'provider-badge';
        badge.style.cssText = `
            background: ${this.activeProvider === 'outlook' ? '#0078d4' : '#ea4335'};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-left: 8px;
            font-weight: 600;
        `;
        badge.textContent = this.activeProvider === 'outlook' ? 'Outlook' : 'Gmail';
        
        userInfo.appendChild(badge);
    }

    showLogin() {
        console.log('[App] Affichage page de connexion');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active', 'provider-outlook', 'provider-gmail');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        this.hideLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    // ===== GESTION DU SCROLL =====
    initializeScrollManager() {
        console.log('[App] Initialisation du gestionnaire de scroll...');
        
        let scrollCheckInProgress = false;
        
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) return;
            
            const body = document.body;
            this.currentPage = pageName;
            
            // Nettoyer les classes
            body.className = body.className.replace(/page-\w+/g, '');
            body.classList.add(`page-${pageName}`);
            
            // Dashboard = pas de scroll
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
                setTimeout(() => this.checkScrollNeeded(), 300);
            }
        };
        
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress || this.currentPage === 'dashboard') return;
            
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    
                    if (this.currentPage !== 'dashboard') {
                        const needsScroll = contentHeight > viewportHeight + 100;
                        body.style.overflow = needsScroll ? '' : 'hidden';
                    }
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150);
        };
        
        // Observer pour changements de taille
        if (window.ResizeObserver) {
            new ResizeObserver(() => {
                if (this.currentPage !== 'dashboard') {
                    this.checkScrollNeeded();
                }
            }).observe(document.body);
        }
        
        window.addEventListener('resize', () => {
            if (this.currentPage !== 'dashboard') {
                this.checkScrollNeeded();
            }
        });
    }

    // ===== GESTION DES ÉVÉNEMENTS =====
    setupEventListeners() {
        console.log('[App] Configuration des événements...');
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
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
        
        // Gestion des erreurs
        window.addEventListener('error', (event) => {
            console.error('[App] Erreur globale:', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Promise rejetée:', event.reason);
        });
    }

    // ===== GESTION DES ERREURS =====
    handleInitializationError(error) {
        console.error('[App] Erreur d\'initialisation:', error);
        
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError([
                'Configuration incorrecte',
                'Vérifiez vos Client IDs dans la configuration'
            ]);
        } else {
            this.showError(error.message || 'Erreur d\'initialisation');
        }
    }

    showError(message) {
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                        <div style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 style="margin-bottom: 20px;">Erreur</h1>
                        <p style="font-size: 18px; margin-bottom: 30px;">${message}</p>
                        <button onclick="location.reload()" class="login-button">
                            <i class="fas fa-refresh"></i> Actualiser
                        </button>
                    </div>
                </div>
            `;
            loginPage.style.display = 'flex';
        }
        this.hideLoading();
    }

    showConfigurationError(issues) {
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                        <div style="font-size: 48px; color: #f59e0b; margin-bottom: 20px;">
                            <i class="fas fa-cog"></i>
                        </div>
                        <h1 style="margin-bottom: 20px;">Configuration requise</h1>
                        <ul style="text-align: left; margin: 20px 0;">
                            ${issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                        <a href="setup.html" class="login-button" style="background: #f59e0b;">
                            <i class="fas fa-cog"></i> Configurer
                        </a>
                    </div>
                </div>
            `;
        }
        this.hideLoading();
    }

    // ===== UTILITAIRES =====
    showLoading(message = 'Chargement...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const text = overlay.querySelector('.login-loading-text');
            if (text) text.textContent = message;
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    forceCleanup() {
        console.log('[App] Nettoyage forcé...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        
        // Nettoyer les services
        if (window.authService) {
            window.authService.forceCleanup();
        }
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        // Nettoyer le stockage
        const keysToKeep = ['emailsort_categories', 'emailsort_tasks', 'emailsortpro_client_id'];
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        sessionStorage.clear();
        
        setTimeout(() => window.location.reload(), 1000);
    }

    // ===== DIAGNOSTIC =====
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
            services: {
                outlook: window.authService ? {
                    isInitialized: window.authService.isInitialized,
                    isAuthenticated: window.authService.isAuthenticated()
                } : null,
                gmail: window.googleAuthService ? {
                    isInitialized: window.googleAuthService.isInitialized,
                    isAuthenticated: window.googleAuthService.isAuthenticated(),
                    scanLimits: window.googleAuthService.getScanLimits?.()
                } : null
            },
            modules: {
                taskManager: !!window.taskManager,
                pageManager: !!window.pageManager,
                categoryManager: !!window.categoryManager,
                dashboardModule: !!window.dashboardModule,
                emailScanner: !!window.emailScanner
            }
        };
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM chargé, création de l\'instance...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    // Attendre les services
    const checkServices = () => {
        const required = ['uiManager'];
        const authServices = ['authService', 'googleAuthService'];
        
        const hasRequiredServices = required.every(s => window[s]);
        const hasAuthService = authServices.some(s => window[s]);
        
        if (hasRequiredServices && hasAuthService) {
            console.log('[App] Services prêts, initialisation...');
            setTimeout(() => window.app.init(), 100);
        } else {
            console.log('[App] En attente des services...');
            setTimeout(checkServices, 100);
        }
    };
    
    checkServices();
});

// ===== FONCTIONS GLOBALES =====
window.emergencyReset = () => {
    console.log('[App] Réinitialisation d\'urgence');
    if (window.app) {
        window.app.forceCleanup();
    }
};

window.diagnoseApp = () => {
    console.group('🔍 DIAGNOSTIC APPLICATION');
    try {
        if (window.app) {
            const diag = window.app.getDiagnosticInfo();
            console.log('📱 État:', diag);
            return diag;
        }
        return { error: 'App non disponible' };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ App v2.0 - Dual Provider Optimisé');
