// app.js - Version ultra-simplifiée ANTI CHARGEMENT MULTIPLE

// PROTECTION GLOBALE CONTRE LES INSTANCES MULTIPLES
if (window.App && window.app) {
    // Si App existe déjà, ne rien faire
    console.log('App already exists, skipping reload');
} else {

class App {
    constructor() {
        // Protection singleton
        if (window.app) return window.app;
        
        this.user = null;
        this.isAuthenticated = false;
        this.isInitializing = false;
        this.initialized = false;
    }

    async init() {
        // Protection contre initialisation multiple
        if (this.isInitializing || this.initialized) return;
        this.isInitializing = true;
        
        try {
            if (!this.checkPrerequisites()) return;
            
            await window.authService.initialize();
            await this.initializeCriticalModules();
            await this.checkAuthenticationStatus();
            
            this.initialized = true;
        } catch (error) {
            this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    async initializeCriticalModules() {
        // Attente simplifiée
        await this.waitForModule('taskManager');
        await this.waitForModule('pageManager');
    }

    async waitForModule(moduleName) {
        let attempts = 0;
        while (!window[moduleName] && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return !!window[moduleName];
    }

    checkPrerequisites() {
        return (typeof msal !== 'undefined' && 
                window.AppConfig && 
                window.AppConfig.validate().valid && 
                window.authService);
    }

    async checkAuthenticationStatus() {
        if (window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                try {
                    this.user = await window.authService.getUserInfo();
                    this.isAuthenticated = true;
                    this.showAppWithTransition();
                } catch (error) {
                    if (error.message.includes('401') || error.message.includes('403')) {
                        await window.authService.reset();
                    }
                    this.showLogin();
                }
            } else {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    handleInitializationError(error) {
        if (error.message.includes('unauthorized_client')) {
            this.showConfigurationError(['Configuration Azure incorrecte']);
            return;
        }
        this.showError('Failed to initialize the application.');
    }

    setupEventListeners() {
        // Protection contre les listeners multiples
        if (this.listenersSetup) return;
        this.listenersSetup = true;
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && !loginBtn.hasAttribute('data-listener-added')) {
            loginBtn.setAttribute('data-listener-added', 'true');
            loginBtn.addEventListener('click', () => this.login());
        }

        // Navigation simple SANS duplication
        document.querySelectorAll('.nav-item:not([data-listener-added])').forEach(item => {
            item.setAttribute('data-listener-added', 'true');
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && window.pageManager) {
                    window.pageManager.loadPage(page);
                }
            });
        });
    }

    async login() {
        try {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            }
            
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion.';
            if (error.errorCode === 'popup_window_error') {
                errorMessage = 'Popup bloqué. Autorisez les popups.';
            } else if (error.errorCode === 'user_cancelled') {
                errorMessage = 'Connexion annulée.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error');
            }
            
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fab fa-microsoft"></i> Se connecter à Outlook';
            }
        }
    }

    showLogin() {
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'flex';
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    showAppWithTransition() {
        this.hideModernLoading();
        
        // Transition ultra-simple
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active');
        
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) loginPage.style.display = 'none';
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
        }
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
        }
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
        }
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Forcer dashboard sans scroll
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        
        if (window.pageManager) {
            setTimeout(() => {
                window.pageManager.loadPage('dashboard');
            }, 100);
        }
        
        this.forceAppDisplay();
    }

    forceAppDisplay() {
        // Style unique pour éviter la duplication
        if (document.getElementById('app-force-style')) return;
        
        const style = document.createElement('style');
        style.id = 'app-force-style';
        style.textContent = `
            body.app-active #loginPage { display: none !important; }
            body.app-active .app-header { display: block !important; opacity: 1 !important; }
            body.app-active .app-nav { display: block !important; opacity: 1 !important; }
            body.app-active #pageContent { display: block !important; opacity: 1 !important; }
        `;
        document.head.appendChild(style);
    }

    showModernLoading(message = 'Chargement...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('.login-loading-text');
            if (loadingText) {
                loadingText.innerHTML = `<div>${message}</div>`;
            }
            loadingOverlay.classList.add('active');
        }
    }

    hideModernLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    showError(message) {
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto; text-align: center; color: white; padding: 50px;">
                    <h1>Erreur</h1>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">Actualiser</button>
                </div>
            `;
            loginPage.style.display = 'flex';
        }
        this.hideModernLoading();
    }

    showConfigurationError(issues) {
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto; text-align: center; color: white; padding: 50px;">
                    <h1>Configuration requise</h1>
                    <ul>${issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                    <a href="setup.html" style="margin-top: 20px; padding: 10px 20px; display: inline-block; background: #fbbf24; color: white; text-decoration: none;">Configurer</a>
                </div>
            `;
        }
        this.hideModernLoading();
    }
}

// Fonctions globales ULTRA-SIMPLES
window.emergencyReset = function() {
    const keysToKeep = ['emailsort_categories', 'emailsort_tasks', 'emailsortpro_client_id'];
    Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
            try { localStorage.removeItem(key); } catch (e) {}
        }
    });
    window.location.reload();
};

window.forceShowApp = function() {
    if (window.app && window.app.showAppWithTransition) {
        window.app.showAppWithTransition();
    } else {
        document.body.classList.add('app-active');
        document.body.classList.remove('login-mode');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
    }
};

// Vérification services ULTRA-SIMPLE
function checkServicesReady() {
    return window.authService && window.AppConfig;
}

// INITIALISATION UNIQUE ET PROTÉGÉE
let appInstanceCreated = false;

function createAppInstance() {
    if (appInstanceCreated || window.app) return;
    appInstanceCreated = true;
    
    document.body.classList.add('login-mode');
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        if (checkServicesReady() || attempts >= 30) {
            setTimeout(() => window.app.init(), 100);
        } else {
            setTimeout(() => waitForServices(attempts + 1), 100);
        }
    };
    
    waitForServices();
}

// DOM Ready PROTECTION
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAppInstance, { once: true });
} else {
    createAppInstance();
}

// Fallback UNIQUE
let fallbackExecuted = false;
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app && !fallbackExecuted) {
            fallbackExecuted = true;
            createAppInstance();
        }
    }, 2000);
}, { once: true });

} // Fin de la protection contre instance multiple
