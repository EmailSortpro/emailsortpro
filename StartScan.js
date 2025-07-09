// startscan.js - Module de scan automatique v3.0
// Support complet double authentification Outlook/Gmail

(function() {
    'use strict';
    
    console.log('[StartScan] 🚀 Module v3.0 loading - Double auth support');
    
    class StartScanModule {
        constructor() {
            this.isInitialized = false;
            this.scanAttempts = 0;
            this.maxScanAttempts = 3;
            this.observerTimeout = null;
            this.pageObserver = null;
            
            console.log('[StartScan] Module instance created');
        }
        
        // Initialisation du module
        init() {
            if (this.isInitialized) {
                console.log('[StartScan] Already initialized');
                return;
            }
            
            console.log('[StartScan] Initializing module...');
            
            this.isInitialized = true;
            this.setupNavigationHandlers();
            this.checkCurrentPage();
            
            console.log('[StartScan] ✅ Module initialized');
        }
        
        // Vérifier la page actuelle
        checkCurrentPage() {
            console.log('[StartScan] Checking current page...');
            
            // Obtenir la page actuelle depuis n'importe quel PageManager
            const currentPage = this.getCurrentPage();
            
            console.log('[StartScan] Current page:', currentPage);
            
            if (currentPage === 'scanner') {
                console.log('[StartScan] Already on scanner page, preparing auto-scan...');
                setTimeout(() => this.autoStartScan(), 1000);
            }
        }
        
        // Obtenir la page actuelle
        getCurrentPage() {
            // Vérifier tous les PageManagers possibles
            if (window.pageManagerGmail && window.pageManagerGmail.currentPage) {
                return window.pageManagerGmail.currentPage;
            }
            
            if (window.pageManager && window.pageManager.currentPage) {
                return window.pageManager.currentPage;
            }
            
            // Vérifier l'app
            if (window.app && window.app.currentPage) {
                return window.app.currentPage;
            }
            
            return null;
        }
        
        // Obtenir le provider actif
        getActiveProvider() {
            console.log('[StartScan] Detecting active provider...');
            
            // 1. Vérifier Google
            if (window.googleAuthService && typeof window.googleAuthService.isAuthenticated === 'function') {
                try {
                    if (window.googleAuthService.isAuthenticated()) {
                        console.log('[StartScan] Google provider detected');
                        return 'google';
                    }
                } catch (e) {
                    console.warn('[StartScan] Error checking Google auth:', e);
                }
            }
            
            // 2. Vérifier Microsoft
            if (window.authService && typeof window.authService.isAuthenticated === 'function') {
                try {
                    if (window.authService.isAuthenticated()) {
                        console.log('[StartScan] Microsoft provider detected');
                        return 'microsoft';
                    }
                } catch (e) {
                    console.warn('[StartScan] Error checking Microsoft auth:', e);
                }
            }
            
            // 3. Vérifier sessionStorage
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            if (lastProvider) {
                console.log('[StartScan] Provider from session:', lastProvider);
                return lastProvider;
            }
            
            // 4. Vérifier l'app
            if (window.app && window.app.activeProvider) {
                console.log('[StartScan] Provider from app:', window.app.activeProvider);
                return window.app.activeProvider;
            }
            
            console.log('[StartScan] No active provider found');
            return null;
        }
        
        // Configuration des gestionnaires de navigation
        setupNavigationHandlers() {
            console.log('[StartScan] Setting up navigation handlers...');
            
            // Handler pour PageManager standard
            if (window.pageManager) {
                this.wrapLoadPage(window.pageManager, 'PageManager');
            }
            
            // Handler pour PageManagerGmail
            if (window.pageManagerGmail) {
                this.wrapLoadPage(window.pageManagerGmail, 'PageManagerGmail');
            }
            
            // Observer pour les PageManagers qui arrivent plus tard
            this.observePageManagers();
            
            console.log('[StartScan] Navigation handlers configured');
        }
        
        // Wrapper pour la méthode loadPage
        wrapLoadPage(pageManager, managerName) {
            console.log(`[StartScan] Wrapping loadPage for ${managerName}`);
            
            const originalLoadPage = pageManager.loadPage;
            const self = this;
            
            pageManager.loadPage = function(pageName) {
                console.log(`[StartScan] ${managerName} navigation to:`, pageName);
                
                // Appeler la méthode originale
                const result = originalLoadPage.call(this, pageName);
                
                // Si navigation vers scanner, préparer le scan auto
                if (pageName === 'scanner') {
                    console.log('[StartScan] Navigation to scanner detected');
                    setTimeout(() => {
                        self.autoStartScan();
                    }, 1500);
                }
                
                return result;
            };
        }
        
        // Observer pour détecter les PageManagers tardifs
        observePageManagers() {
            let checkCount = 0;
            const maxChecks = 20;
            
            const checkManagers = () => {
                checkCount++;
                
                // Vérifier PageManager
                if (window.pageManager && !window.pageManager._startScanWrapped) {
                    this.wrapLoadPage(window.pageManager, 'PageManager');
                    window.pageManager._startScanWrapped = true;
                }
                
                // Vérifier PageManagerGmail
                if (window.pageManagerGmail && !window.pageManagerGmail._startScanWrapped) {
                    this.wrapLoadPage(window.pageManagerGmail, 'PageManagerGmail');
                    window.pageManagerGmail._startScanWrapped = true;
                }
                
                // Continuer à vérifier jusqu'à la limite
                if (checkCount < maxChecks) {
                    setTimeout(checkManagers, 500);
                }
            };
            
            // Démarrer la vérification
            checkManagers();
        }
        
        // Démarrage automatique du scan
        async autoStartScan() {
            console.log('[StartScan] 🎯 Auto-start scan initiated...');
            
            this.scanAttempts++;
            
            if (this.scanAttempts > this.maxScanAttempts) {
                console.warn('[StartScan] Max scan attempts reached');
                return;
            }
            
            try {
                // 1. Attendre que minimalScanModule soit prêt
                const scanModule = await this.waitForScanModule();
                if (!scanModule) {
                    console.error('[StartScan] Scan module not available');
                    return;
                }
                
                // 2. Vérifier l'authentification
                const isAuthenticated = await this.checkAuthentication(scanModule);
                if (!isAuthenticated) {
                    console.log('[StartScan] User not authenticated, cannot start scan');
                    return;
                }
                
                // 3. Attendre que l'interface soit prête
                const interfaceReady = await this.waitForInterface();
                if (!interfaceReady) {
                    console.warn('[StartScan] Interface not ready, retrying...');
                    setTimeout(() => this.autoStartScan(), 2000);
                    return;
                }
                
                // 4. Obtenir le provider actif
                const provider = this.getActiveProvider();
                console.log('[StartScan] Active provider:', provider);
                
                // 5. Démarrer le scan
                console.log('[StartScan] 🚀 Starting automatic scan...');
                
                // Petit délai pour s'assurer que tout est stable
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Démarrer le scan
                if (typeof scanModule.startScan === 'function') {
                    scanModule.startScan();
                    console.log('[StartScan] ✅ Scan started successfully');
                    this.scanAttempts = 0; // Reset attempts on success
                } else {
                    console.error('[StartScan] startScan method not found');
                }
                
            } catch (error) {
                console.error('[StartScan] Error in auto-start:', error);
                
                // Réessayer après un délai
                if (this.scanAttempts < this.maxScanAttempts) {
                    setTimeout(() => this.autoStartScan(), 3000);
                }
            }
        }
        
        // Attendre que le module de scan soit disponible
        async waitForScanModule() {
            console.log('[StartScan] Waiting for scan module...');
            
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
                if (window.minimalScanModule) {
                    console.log('[StartScan] ✅ Scan module found');
                    return window.minimalScanModule;
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            console.error('[StartScan] Scan module timeout');
            return null;
        }
        
        // Vérifier l'authentification
        async checkAuthentication(scanModule) {
            console.log('[StartScan] Checking authentication...');
            
            // Si le module a sa propre méthode
            if (typeof scanModule.checkAuthentication === 'function') {
                const isAuth = await scanModule.checkAuthentication();
                console.log('[StartScan] Module auth check:', isAuth);
                return isAuth;
            }
            
            // Sinon, vérifier manuellement
            const provider = this.getActiveProvider();
            return provider !== null;
        }
        
        // Attendre que l'interface soit prête
        async waitForInterface() {
            console.log('[StartScan] Waiting for interface...');
            
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 50;
                
                const checkInterface = () => {
                    attempts++;
                    
                    // Vérifier si le bouton de scan existe
                    const scanBtn = document.getElementById('minimalScanBtn');
                    if (scanBtn && !scanBtn.disabled) {
                        console.log('[StartScan] ✅ Scan button ready');
                        resolve(true);
                        return;
                    }
                    
                    // Vérifier si on a atteint la limite
                    if (attempts >= maxAttempts) {
                        console.warn('[StartScan] Interface timeout');
                        resolve(false);
                        return;
                    }
                    
                    // Réessayer
                    setTimeout(checkInterface, 100);
                };
                
                checkInterface();
            });
        }
        
        // Observer DOM pour détecter le bouton de scan
        observeScanButton() {
            console.log('[StartScan] Setting up scan button observer...');
            
            if (this.pageObserver) {
                this.pageObserver.disconnect();
            }
            
            this.pageObserver = new MutationObserver((mutations, observer) => {
                const scanBtn = document.getElementById('minimalScanBtn');
                if (scanBtn) {
                    console.log('[StartScan] Scan button detected via observer');
                    observer.disconnect();
                    this.pageObserver = null;
                    
                    // Démarrer le scan
                    setTimeout(() => {
                        if (!scanBtn.disabled && typeof window.minimalScanModule?.startScan === 'function') {
                            window.minimalScanModule.startScan();
                            console.log('[StartScan] ✅ Scan started via observer');
                        }
                    }, 500);
                }
            });
            
            this.pageObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout de sécurité
            if (this.observerTimeout) {
                clearTimeout(this.observerTimeout);
            }
            
            this.observerTimeout = setTimeout(() => {
                if (this.pageObserver) {
                    this.pageObserver.disconnect();
                    this.pageObserver = null;
                    console.log('[StartScan] Observer timeout');
                }
            }, 10000);
        }
        
        // Nettoyage
        cleanup() {
            if (this.pageObserver) {
                this.pageObserver.disconnect();
                this.pageObserver = null;
            }
            
            if (this.observerTimeout) {
                clearTimeout(this.observerTimeout);
                this.observerTimeout = null;
            }
            
            this.scanAttempts = 0;
        }
    }
    
    // Créer et initialiser le module
    const startScanModule = new StartScanModule();
    
    // Exposer globalement
    window.startScanModule = startScanModule;
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[StartScan] DOM ready, initializing module...');
            startScanModule.init();
        });
    } else {
        console.log('[StartScan] DOM already loaded, initializing module...');
        // Petit délai pour s'assurer que les autres modules sont chargés
        setTimeout(() => {
            startScanModule.init();
        }, 100);
    }
    
    console.log('[StartScan] ✅ Module v3.0 loaded - Auto-scan ready for double auth');
})();
