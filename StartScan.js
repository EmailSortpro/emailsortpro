// startscan.js - Module de démarrage automatique du scan v4.0 COMPLET
// Support double authentification Microsoft/Google avec détection intelligente

(function() {
    console.log('[StartScan] 🚀 Module v4.0 COMPLET loading - Double auth support');
    
    // Instance globale du module
    let instance = null;
    
    class StartScanModule {
        constructor() {
            if (instance) {
                return instance;
            }
            
            this.initialized = false;
            this.scanInProgress = false;
            this.activeProvider = null; // 'microsoft' ou 'google'
            this.currentPageManager = null; // PageManager ou PageManagerGmail
            this.autoStartAttempts = 0;
            this.maxAutoStartAttempts = 5;
            
            console.log('[StartScan] Module instance created');
            instance = this;
        }
        
        async initialize() {
            if (this.initialized) {
                console.log('[StartScan] Already initialized');
                return;
            }
            
            console.log('[StartScan] Initializing module...');
            
            try {
                // Attendre que les modules critiques soient prêts
                await this.waitForCriticalModules();
                
                // Configurer les gestionnaires d'événements
                this.setupNavigationHandlers();
                
                // Vérifier la page actuelle
                this.checkCurrentPage();
                
                // Observer les changements DOM
                this.setupDOMObservers();
                
                this.initialized = true;
                console.log('[StartScan] ✅ Module fully initialized');
                
            } catch (error) {
                console.error('[StartScan] Initialization error:', error);
                this.initialized = false;
            }
        }
        
        async waitForCriticalModules() {
            console.log('[StartScan] Waiting for critical modules...');
            
            const requiredModules = [
                { name: 'app', check: () => window.app },
                { name: 'authService', check: () => window.authService },
                { name: 'googleAuthService', check: () => window.googleAuthService },
                { name: 'pageManager', check: () => window.pageManager },
                { name: 'pageManagerGmail', check: () => window.pageManagerGmail },
                { name: 'minimalScanModule', check: () => window.minimalScanModule }
            ];
            
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                const missingModules = requiredModules.filter(m => !m.check());
                
                if (missingModules.length === 0) {
                    console.log('[StartScan] ✅ All critical modules ready');
                    break;
                }
                
                if (attempts % 10 === 0) {
                    console.log('[StartScan] Waiting for:', missingModules.map(m => m.name).join(', '));
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('[StartScan] Timeout waiting for modules');
            }
        }
        
        checkCurrentPage() {
            console.log('[StartScan] Checking current page...');
            
            // Vérifier la page actuelle via l'URL ou le DOM
            const currentPage = window.location.hash || this.getCurrentPageFromDOM();
            console.log('[StartScan] Current page:', currentPage);
            
            if (currentPage.includes('scanner')) {
                // Délai pour s'assurer que tout est chargé
                setTimeout(() => {
                    this.attemptAutoStart();
                }, 1000);
            }
        }
        
        getCurrentPageFromDOM() {
            // Vérifier quel bouton de navigation est actif
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) {
                return activeNav.dataset.page || '';
            }
            
            // Vérifier le contenu de la page
            const pageContent = document.getElementById('pageContent');
            if (pageContent && pageContent.innerHTML.includes('scanner')) {
                return 'scanner';
            }
            
            return '';
        }
        
        detectActiveProvider() {
            console.log('[StartScan] Detecting active provider...');
            
            // Méthode 1: Vérifier via l'app
            if (window.app && window.app.activeProvider) {
                console.log('[StartScan] Provider from app:', window.app.activeProvider);
                return window.app.activeProvider;
            }
            
            // Méthode 2: Vérifier l'authentification Google
            if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                console.log('[StartScan] Google authentication detected');
                return 'google';
            }
            
            // Méthode 3: Vérifier l'authentification Microsoft
            if (window.authService && window.authService.isAuthenticated()) {
                console.log('[StartScan] Microsoft authentication detected');
                return 'microsoft';
            }
            
            // Méthode 4: Vérifier le localStorage/sessionStorage
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            if (lastProvider) {
                console.log('[StartScan] Provider from session:', lastProvider);
                return lastProvider;
            }
            
            // Méthode 5: Vérifier les tokens
            const googleToken = localStorage.getItem('google_token_emailsortpro');
            if (googleToken) {
                try {
                    const tokenData = JSON.parse(googleToken);
                    if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                        console.log('[StartScan] Valid Google token found');
                        return 'google';
                    }
                } catch (e) {
                    // Ignorer les erreurs de parsing
                }
            }
            
            // Méthode 6: Vérifier l'interface utilisateur
            const authStatus = document.getElementById('authStatus');
            if (authStatus) {
                const authText = authStatus.innerText.toLowerCase();
                if (authText.includes('gmail')) {
                    console.log('[StartScan] Gmail detected in UI');
                    return 'google';
                } else if (authText.includes('outlook')) {
                    console.log('[StartScan] Outlook detected in UI');
                    return 'microsoft';
                }
            }
            
            console.warn('[StartScan] No active provider detected');
            return null;
        }
        
        getPageManagerForProvider(provider) {
            if (provider === 'google') {
                console.log('[StartScan] Using PageManagerGmail for Google provider');
                return window.pageManagerGmail;
            } else {
                console.log('[StartScan] Using standard PageManager for Microsoft provider');
                return window.pageManager;
            }
        }
        
        setupNavigationHandlers() {
            console.log('[StartScan] Setting up navigation handlers...');
            
            // Wrapper pour intercepter les navigations vers scanner
            this.wrapPageManagerMethods();
            
            // Observer les clics sur les boutons de navigation
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem && navItem.dataset.page === 'scanner') {
                    console.log('[StartScan] Scanner navigation clicked');
                    setTimeout(() => {
                        this.attemptAutoStart();
                    }, 500);
                }
            });
            
            console.log('[StartScan] Navigation handlers configured');
        }
        
        wrapPageManagerMethods() {
            // Wrapper pour PageManager standard
            if (window.pageManager && window.pageManager.loadPage) {
                const originalLoadPage = window.pageManager.loadPage.bind(window.pageManager);
                
                window.pageManager.loadPage = (page, ...args) => {
                    console.log('[StartScan] PageManager navigation to:', page);
                    
                    const result = originalLoadPage(page, ...args);
                    
                    if (page === 'scanner') {
                        console.log('[StartScan] Scanner page loaded via PageManager');
                        setTimeout(() => {
                            this.attemptAutoStart();
                        }, 500);
                    }
                    
                    return result;
                };
                
                console.log('[StartScan] ✅ PageManager.loadPage wrapped');
            }
            
            // Wrapper pour PageManagerGmail
            if (window.pageManagerGmail && window.pageManagerGmail.loadPage) {
                const originalLoadPageGmail = window.pageManagerGmail.loadPage.bind(window.pageManagerGmail);
                
                window.pageManagerGmail.loadPage = (page, ...args) => {
                    console.log('[StartScan] PageManagerGmail navigation to:', page);
                    
                    const result = originalLoadPageGmail(page, ...args);
                    
                    if (page === 'scanner') {
                        console.log('[StartScan] Scanner page loaded via PageManagerGmail');
                        setTimeout(() => {
                            this.attemptAutoStart();
                        }, 500);
                    }
                    
                    return result;
                };
                
                console.log('[StartScan] ✅ PageManagerGmail.loadPage wrapped');
            }
        }
        
        setupDOMObservers() {
            // Observer pour détecter quand le PageManager change le contenu
            const pageContentObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        const content = document.getElementById('pageContent');
                        if (content && content.innerHTML.includes('scanner-container')) {
                            console.log('[StartScan] Scanner content detected');
                            setTimeout(() => {
                                this.attemptAutoStart();
                            }, 300);
                            break;
                        }
                    }
                }
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContentObserver.observe(pageContent, {
                    childList: true,
                    subtree: true
                });
            }
            
            // Timeout pour l'observer
            setTimeout(() => {
                pageContentObserver.disconnect();
            }, 30000);
            
            console.log('[StartScan] DOM observers configured');
        }
        
        async attemptAutoStart() {
            console.log('[StartScan] 🎯 Auto-start scan initiated...');
            
            if (this.scanInProgress) {
                console.log('[StartScan] Scan already in progress, skipping');
                return;
            }
            
            if (this.autoStartAttempts >= this.maxAutoStartAttempts) {
                console.log('[StartScan] Max auto-start attempts reached');
                return;
            }
            
            this.autoStartAttempts++;
            
            try {
                // Détecter le provider actif
                this.activeProvider = this.detectActiveProvider();
                console.log('[StartScan] Active provider for scan:', this.activeProvider);
                
                if (!this.activeProvider) {
                    console.warn('[StartScan] No active provider detected, aborting');
                    return;
                }
                
                // Obtenir le bon PageManager selon le provider
                this.currentPageManager = this.getPageManagerForProvider(this.activeProvider);
                
                if (!this.currentPageManager) {
                    console.error('[StartScan] PageManager not available for provider:', this.activeProvider);
                    return;
                }
                
                // Vérifier l'authentification via le bon service
                const isAuthenticated = await this.checkAuthentication();
                
                if (!isAuthenticated) {
                    console.log('[StartScan] User not authenticated, showing auth message');
                    this.showAuthenticationRequired();
                    return;
                }
                
                // Chercher et cliquer sur le bouton de scan
                await this.findAndClickScanButton();
                
            } catch (error) {
                console.error('[StartScan] Error during auto-start:', error);
            }
        }
        
        async checkAuthentication() {
            console.log('[StartScan] Checking authentication...');
            
            // Vérifier via l'app
            if (window.app && window.app.isAuthenticated) {
                console.log('[StartScan] App authentication:', window.app.isAuthenticated);
                return window.app.isAuthenticated;
            }
            
            // Vérifier selon le provider
            if (this.activeProvider === 'google') {
                const isGoogleAuth = window.googleAuthService && window.googleAuthService.isAuthenticated();
                console.log('[StartScan] Google authentication:', isGoogleAuth);
                return isGoogleAuth;
            } else {
                const isMicrosoftAuth = window.authService && window.authService.isAuthenticated();
                console.log('[StartScan] Microsoft authentication:', isMicrosoftAuth);
                return isMicrosoftAuth;
            }
        }
        
        showAuthenticationRequired() {
            const pageContent = document.getElementById('pageContent');
            if (!pageContent) return;
            
            // Ne pas remplacer le contenu si c'est déjà un message d'authentification
            if (pageContent.innerHTML.includes('Authentification requise')) {
                return;
            }
            
            console.log('[StartScan] Showing authentication required message');
            
            const providerName = this.activeProvider === 'google' ? 'Gmail' : 'Outlook';
            
            pageContent.innerHTML = `
                <div class="scanner-container">
                    <div class="auth-required-message">
                        <div class="auth-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h2>Authentification requise</h2>
                        <p>Vous devez être connecté à ${providerName} pour accéder au scanner d'emails.</p>
                        <div class="auth-actions">
                            <button onclick="window.app.login${this.activeProvider === 'google' ? 'Google' : 'Microsoft'}()" class="btn btn-primary">
                                <i class="fab fa-${this.activeProvider === 'google' ? 'google' : 'microsoft'}"></i>
                                Se connecter à ${providerName}
                            </button>
                            <button onclick="window.pageManager.loadPage('dashboard')" class="btn btn-secondary">
                                <i class="fas fa-home"></i>
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        async findAndClickScanButton() {
            console.log('[StartScan] Waiting for scan button...');
            
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkButton = async () => {
                // Chercher le bouton selon différents sélecteurs possibles
                const selectors = [
                    '#startScanBtn',
                    '.scan-button',
                    'button[onclick*="startScan"]',
                    'button[onclick*="scanEmails"]',
                    '.start-scan-btn',
                    '#scanButton'
                ];
                
                let scanButton = null;
                for (const selector of selectors) {
                    scanButton = document.querySelector(selector);
                    if (scanButton) {
                        console.log('[StartScan] Scan button found with selector:', selector);
                        break;
                    }
                }
                
                if (scanButton && !scanButton.disabled) {
                    console.log('[StartScan] ✅ Clicking scan button...');
                    
                    // Simuler un vrai clic utilisateur
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    
                    scanButton.dispatchEvent(event);
                    
                    // Marquer le scan comme en cours
                    this.scanInProgress = true;
                    
                    // Réinitialiser après un délai
                    setTimeout(() => {
                        this.scanInProgress = false;
                    }, 5000);
                    
                    console.log('[StartScan] ✅ Scan started automatically');
                    return true;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkButton, 250);
                } else {
                    console.log('[StartScan] Scan button timeout');
                    this.setupButtonObserver();
                }
            };
            
            await checkButton();
        }
        
        setupButtonObserver() {
            console.log('[StartScan] Scan button not found, setting up observer');
            
            const buttonObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        const scanButton = document.querySelector('#startScanBtn, .scan-button, button[onclick*="startScan"]');
                        if (scanButton && !scanButton.disabled) {
                            console.log('[StartScan] Scan button appeared');
                            buttonObserver.disconnect();
                            scanButton.click();
                            break;
                        }
                    }
                }
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                buttonObserver.observe(pageContent, {
                    childList: true,
                    subtree: true
                });
                
                // Timeout pour l'observer
                setTimeout(() => {
                    buttonObserver.disconnect();
                }, 10000);
            }
        }
        
        // Méthode publique pour forcer le démarrage
        forceStart() {
            console.log('[StartScan] Force start requested');
            this.scanInProgress = false;
            this.autoStartAttempts = 0;
            this.attemptAutoStart();
        }
        
        // Méthode pour réinitialiser le module
        reset() {
            console.log('[StartScan] Module reset');
            this.scanInProgress = false;
            this.autoStartAttempts = 0;
            this.activeProvider = null;
            this.currentPageManager = null;
        }
    }
    
    // Créer et initialiser l'instance
    window.startScanModule = new StartScanModule();
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[StartScan] DOM ready, starting initialization...');
            window.startScanModule.initialize();
        });
    } else {
        console.log('[StartScan] DOM already ready, starting initialization...');
        window.startScanModule.initialize();
    }
    
    console.log('[StartScan] ✅ Module v4.0 COMPLET loaded - Auto-scan ready for double auth');
})();
