// startscan.js - Module de scan automatique v4.0 COMPLET
// Support total double authentification Outlook/Gmail avec toutes les fonctionnalités

(function() {
    'use strict';
    
    console.log('[StartScan] 🚀 Module v4.0 COMPLET loading - Double auth support');
    
    class StartScanModule {
        constructor() {
            this.isInitialized = false;
            this.scanAttempts = 0;
            this.maxScanAttempts = 3;
            this.observerTimeout = null;
            this.pageObserver = null;
            this.moduleCheckInterval = null;
            this.navigationWrapped = false;
            this.pendingScan = false;
            this.lastProvider = null;
            
            // Configuration des délais
            this.delays = {
                moduleCheck: 100,
                scanStart: 1500,
                interfaceWait: 500,
                retryInterval: 2000,
                observerTimeout: 10000
            };
            
            console.log('[StartScan] Module instance created');
        }
        
        // ========================================
        // INITIALISATION PRINCIPALE
        // ========================================
        init() {
            if (this.isInitialized) {
                console.log('[StartScan] Already initialized');
                return;
            }
            
            console.log('[StartScan] Initializing module...');
            
            this.isInitialized = true;
            
            // Attendre que les modules critiques soient chargés
            this.waitForCriticalModules().then(() => {
                console.log('[StartScan] ✅ Critical modules ready');
                
                // Configurer les handlers de navigation
                this.setupNavigationHandlers();
                
                // Vérifier la page actuelle
                this.checkCurrentPage();
                
                // Configurer les observers
                this.setupObservers();
                
                console.log('[StartScan] ✅ Module fully initialized');
            }).catch(error => {
                console.error('[StartScan] ❌ Failed to initialize:', error);
                
                // Réessayer après un délai
                setTimeout(() => this.init(), 5000);
            });
        }
        
        // ========================================
        // ATTENTE DES MODULES CRITIQUES
        // ========================================
        async waitForCriticalModules() {
            console.log('[StartScan] Waiting for critical modules...');
            
            const requiredModules = [
                { name: 'minimalScanModule', check: () => window.minimalScanModule },
                { name: 'pageManager', check: () => window.pageManager || window.pageManagerGmail },
                { name: 'uiManager', check: () => window.uiManager }
            ];
            
            const maxWaitTime = 30000; // 30 secondes
            const startTime = Date.now();
            
            while (Date.now() - startTime < maxWaitTime) {
                const allReady = requiredModules.every(module => {
                    const isReady = module.check();
                    if (!isReady) {
                        console.log(`[StartScan] Waiting for ${module.name}...`);
                    }
                    return isReady;
                });
                
                if (allReady) {
                    console.log('[StartScan] ✅ All critical modules ready');
                    return true;
                }
                
                await new Promise(resolve => setTimeout(resolve, this.delays.moduleCheck));
            }
            
            throw new Error('Timeout waiting for critical modules');
        }
        
        // ========================================
        // VÉRIFICATION DE LA PAGE ACTUELLE
        // ========================================
        checkCurrentPage() {
            console.log('[StartScan] Checking current page...');
            
            const currentPage = this.getCurrentPage();
            console.log('[StartScan] Current page:', currentPage);
            
            if (currentPage === 'scanner') {
                console.log('[StartScan] Already on scanner page, preparing auto-scan...');
                this.pendingScan = true;
                setTimeout(() => this.autoStartScan(), this.delays.scanStart);
            }
        }
        
        // ========================================
        // OBTENIR LA PAGE ACTUELLE
        // ========================================
        getCurrentPage() {
            // Vérifier tous les PageManagers possibles
            const managers = [
                window.pageManagerGmail,
                window.pageManager,
                window.app
            ];
            
            for (const manager of managers) {
                if (manager && manager.currentPage) {
                    return manager.currentPage;
                }
            }
            
            // Vérifier l'URL
            const path = window.location.pathname;
            if (path.includes('scanner')) {
                return 'scanner';
            }
            
            // Vérifier la navigation active
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) {
                return activeNav.dataset.page;
            }
            
            return null;
        }
        
        // ========================================
        // DÉTECTION DU PROVIDER ACTIF
        // ========================================
        getActiveProvider() {
            console.log('[StartScan] Detecting active provider...');
            
            // 1. Vérifier via l'app
            if (window.app && window.app.activeProvider) {
                console.log('[StartScan] Provider from app:', window.app.activeProvider);
                this.lastProvider = window.app.activeProvider;
                return window.app.activeProvider;
            }
            
            // 2. Vérifier Google
            if (window.googleAuthService) {
                try {
                    if (typeof window.googleAuthService.isAuthenticated === 'function' && 
                        window.googleAuthService.isAuthenticated()) {
                        console.log('[StartScan] Google provider detected');
                        this.lastProvider = 'google';
                        return 'google';
                    }
                } catch (e) {
                    console.warn('[StartScan] Error checking Google auth:', e);
                }
            }
            
            // 3. Vérifier Microsoft
            if (window.authService) {
                try {
                    if (typeof window.authService.isAuthenticated === 'function' && 
                        window.authService.isAuthenticated()) {
                        console.log('[StartScan] Microsoft provider detected');
                        this.lastProvider = 'microsoft';
                        return 'microsoft';
                    }
                } catch (e) {
                    console.warn('[StartScan] Error checking Microsoft auth:', e);
                }
            }
            
            // 4. Vérifier sessionStorage
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            if (lastProvider) {
                console.log('[StartScan] Provider from session:', lastProvider);
                this.lastProvider = lastProvider;
                return lastProvider;
            }
            
            // 5. Utiliser le dernier provider connu
            if (this.lastProvider) {
                console.log('[StartScan] Using last known provider:', this.lastProvider);
                return this.lastProvider;
            }
            
            console.log('[StartScan] No active provider found');
            return null;
        }
        
        // ========================================
        // CONFIGURATION DES HANDLERS DE NAVIGATION
        // ========================================
        setupNavigationHandlers() {
            console.log('[StartScan] Setting up navigation handlers...');
            
            // Wrapper pour les PageManagers existants
            this.wrapExistingPageManagers();
            
            // Observer pour les PageManagers qui arrivent plus tard
            this.observePageManagers();
            
            console.log('[StartScan] Navigation handlers configured');
        }
        
        // ========================================
        // WRAPPER POUR LES PAGEMANAGERS EXISTANTS
        // ========================================
        wrapExistingPageManagers() {
            // PageManager standard
            if (window.pageManager && !window.pageManager._startScanWrapped) {
                this.wrapLoadPage(window.pageManager, 'PageManager');
                window.pageManager._startScanWrapped = true;
            }
            
            // PageManagerGmail
            if (window.pageManagerGmail && !window.pageManagerGmail._startScanWrapped) {
                this.wrapLoadPage(window.pageManagerGmail, 'PageManagerGmail');
                window.pageManagerGmail._startScanWrapped = true;
            }
        }
        
        // ========================================
        // WRAPPER POUR LA MÉTHODE loadPage
        // ========================================
        wrapLoadPage(pageManager, managerName) {
            console.log(`[StartScan] Wrapping loadPage for ${managerName}`);
            
            const originalLoadPage = pageManager.loadPage;
            const self = this;
            
            pageManager.loadPage = function(pageName, ...args) {
                console.log(`[StartScan] ${managerName} navigation to:`, pageName);
                
                // Appeler la méthode originale
                const result = originalLoadPage.call(this, pageName, ...args);
                
                // Si navigation vers scanner, préparer le scan auto
                if (pageName === 'scanner') {
                    console.log('[StartScan] Navigation to scanner detected');
                    self.pendingScan = true;
                    
                    // Attendre que la page soit chargée
                    Promise.resolve(result).then(() => {
                        setTimeout(() => {
                            self.autoStartScan();
                        }, self.delays.scanStart);
                    }).catch(error => {
                        console.error('[StartScan] Error during page load:', error);
                    });
                }
                
                return result;
            };
            
            console.log(`[StartScan] ✅ ${managerName}.loadPage wrapped`);
        }
        
        // ========================================
        // OBSERVER POUR PAGEMANAGERS TARDIFS
        // ========================================
        observePageManagers() {
            console.log('[StartScan] Setting up PageManager observer...');
            
            let checkCount = 0;
            const maxChecks = 30; // 15 secondes
            
            const checkManagers = () => {
                checkCount++;
                
                // Vérifier et wrapper les nouveaux PageManagers
                this.wrapExistingPageManagers();
                
                // Continuer à vérifier
                if (checkCount < maxChecks) {
                    setTimeout(checkManagers, 500);
                } else {
                    console.log('[StartScan] PageManager observer timeout');
                }
            };
            
            // Démarrer la vérification
            checkManagers();
        }
        
        // ========================================
        // CONFIGURATION DES OBSERVERS DOM
        // ========================================
        setupObservers() {
            console.log('[StartScan] Setting up DOM observers...');
            
            // Observer pour détecter les changements de navigation
            this.setupNavigationObserver();
            
            // Observer pour détecter l'apparition du bouton de scan
            this.setupScanButtonObserver();
        }
        
        // ========================================
        // OBSERVER POUR LA NAVIGATION
        // ========================================
        setupNavigationObserver() {
            // Observer les clics sur la navigation
            document.addEventListener('click', (event) => {
                const navItem = event.target.closest('.nav-item');
                if (navItem && navItem.dataset.page === 'scanner') {
                    console.log('[StartScan] Scanner navigation clicked');
                    this.pendingScan = true;
                }
            });
        }
        
        // ========================================
        // OBSERVER POUR LE BOUTON DE SCAN
        // ========================================
        setupScanButtonObserver() {
            if (this.pageObserver) {
                this.pageObserver.disconnect();
            }
            
            this.pageObserver = new MutationObserver((mutations, observer) => {
                // Vérifier si on est sur la page scanner
                if (this.getCurrentPage() !== 'scanner') {
                    return;
                }
                
                // Chercher le bouton de scan
                const scanBtn = document.getElementById('minimalScanBtn');
                if (scanBtn && !scanBtn.disabled && this.pendingScan) {
                    console.log('[StartScan] Scan button detected via observer');
                    observer.disconnect();
                    this.pageObserver = null;
                    
                    // Réinitialiser le flag
                    this.pendingScan = false;
                    
                    // Démarrer le scan
                    setTimeout(() => {
                        this.triggerScan(scanBtn);
                    }, this.delays.interfaceWait);
                }
            });
            
            // Observer le body pour détecter l'ajout du bouton
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
                    console.log('[StartScan] Button observer timeout');
                }
            }, this.delays.observerTimeout);
        }
        
        // ========================================
        // DÉMARRAGE AUTOMATIQUE DU SCAN
        // ========================================
        async autoStartScan() {
            console.log('[StartScan] 🎯 Auto-start scan initiated...');
            
            // Vérifier qu'on est toujours sur la page scanner
            if (this.getCurrentPage() !== 'scanner') {
                console.log('[StartScan] Not on scanner page anymore, aborting');
                this.pendingScan = false;
                return;
            }
            
            this.scanAttempts++;
            
            if (this.scanAttempts > this.maxScanAttempts) {
                console.warn('[StartScan] Max scan attempts reached');
                this.scanAttempts = 0;
                this.pendingScan = false;
                return;
            }
            
            try {
                // 1. Vérifier que le module de scan est prêt
                if (!window.minimalScanModule) {
                    console.warn('[StartScan] Scan module not ready, waiting...');
                    this.setupScanButtonObserver();
                    return;
                }
                
                // 2. Vérifier l'authentification
                const isAuthenticated = await this.checkAuthentication();
                if (!isAuthenticated) {
                    console.log('[StartScan] User not authenticated, cannot start scan');
                    this.pendingScan = false;
                    this.scanAttempts = 0;
                    return;
                }
                
                // 3. Obtenir le provider actif
                const provider = this.getActiveProvider();
                console.log('[StartScan] Active provider for scan:', provider);
                
                // 4. Attendre que l'interface soit prête
                const scanBtn = await this.waitForScanButton();
                if (!scanBtn) {
                    console.warn('[StartScan] Scan button not found, setting up observer');
                    this.setupScanButtonObserver();
                    return;
                }
                
                // 5. Vérifier que le bouton n'est pas désactivé
                if (scanBtn.disabled) {
                    console.log('[StartScan] Scan button is disabled, waiting...');
                    setTimeout(() => this.autoStartScan(), this.delays.retryInterval);
                    return;
                }
                
                // 6. Démarrer le scan
                console.log('[StartScan] 🚀 Starting automatic scan...');
                this.triggerScan(scanBtn);
                
                // Réinitialiser les compteurs
                this.scanAttempts = 0;
                this.pendingScan = false;
                
            } catch (error) {
                console.error('[StartScan] Error in auto-start:', error);
                
                // Réessayer après un délai
                if (this.scanAttempts < this.maxScanAttempts) {
                    setTimeout(() => this.autoStartScan(), this.delays.retryInterval);
                } else {
                    this.scanAttempts = 0;
                    this.pendingScan = false;
                }
            }
        }
        
        // ========================================
        // VÉRIFICATION DE L'AUTHENTIFICATION
        // ========================================
        async checkAuthentication() {
            console.log('[StartScan] Checking authentication...');
            
            // 1. Vérifier via minimalScanModule
            if (window.minimalScanModule && typeof window.minimalScanModule.checkAuthentication === 'function') {
                try {
                    const isAuth = await window.minimalScanModule.checkAuthentication();
                    console.log('[StartScan] MinimalScanModule auth check:', isAuth);
                    return isAuth;
                } catch (error) {
                    console.warn('[StartScan] Error checking auth via minimalScanModule:', error);
                }
            }
            
            // 2. Vérifier via l'app
            if (window.app && window.app.isAuthenticated) {
                console.log('[StartScan] App authentication:', true);
                return true;
            }
            
            // 3. Vérifier manuellement
            const provider = this.getActiveProvider();
            const isAuth = provider !== null;
            console.log('[StartScan] Manual auth check:', isAuth);
            return isAuth;
        }
        
        // ========================================
        // ATTENDRE LE BOUTON DE SCAN
        // ========================================
        async waitForScanButton() {
            console.log('[StartScan] Waiting for scan button...');
            
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 secondes
                
                const checkButton = () => {
                    attempts++;
                    
                    const scanBtn = document.getElementById('minimalScanBtn');
                    if (scanBtn) {
                        console.log('[StartScan] ✅ Scan button found');
                        resolve(scanBtn);
                        return;
                    }
                    
                    if (attempts >= maxAttempts) {
                        console.warn('[StartScan] Scan button timeout');
                        resolve(null);
                        return;
                    }
                    
                    setTimeout(checkButton, 100);
                };
                
                checkButton();
            });
        }
        
        // ========================================
        // DÉCLENCHER LE SCAN
        // ========================================
        triggerScan(scanBtn) {
            console.log('[StartScan] Triggering scan...');
            
            try {
                // Méthode 1: Appeler directement startScan
                if (window.minimalScanModule && typeof window.minimalScanModule.startScan === 'function') {
                    console.log('[StartScan] Calling minimalScanModule.startScan()');
                    window.minimalScanModule.startScan();
                    console.log('[StartScan] ✅ Scan started successfully via method call');
                    return;
                }
                
                // Méthode 2: Simuler un clic sur le bouton
                if (scanBtn && !scanBtn.disabled) {
                    console.log('[StartScan] Simulating click on scan button');
                    scanBtn.click();
                    console.log('[StartScan] ✅ Scan started successfully via button click');
                    return;
                }
                
                console.error('[StartScan] ❌ Could not trigger scan - no method available');
                
            } catch (error) {
                console.error('[StartScan] ❌ Error triggering scan:', error);
            }
        }
        
        // ========================================
        // MÉTHODES UTILITAIRES
        // ========================================
        
        // Forcer un scan manuel (utile pour debug)
        forceScan() {
            console.log('[StartScan] Force scan requested');
            this.pendingScan = true;
            this.scanAttempts = 0;
            this.autoStartScan();
        }
        
        // Obtenir l'état du module
        getStatus() {
            return {
                initialized: this.isInitialized,
                pendingScan: this.pendingScan,
                scanAttempts: this.scanAttempts,
                lastProvider: this.lastProvider,
                currentPage: this.getCurrentPage(),
                activeProvider: this.getActiveProvider(),
                minimalScanModule: !!window.minimalScanModule,
                pageManager: !!window.pageManager,
                pageManagerGmail: !!window.pageManagerGmail,
                navigationWrapped: this.navigationWrapped
            };
        }
        
        // Réinitialiser le module
        reset() {
            console.log('[StartScan] Resetting module...');
            
            this.scanAttempts = 0;
            this.pendingScan = false;
            
            if (this.pageObserver) {
                this.pageObserver.disconnect();
                this.pageObserver = null;
            }
            
            if (this.observerTimeout) {
                clearTimeout(this.observerTimeout);
                this.observerTimeout = null;
            }
            
            console.log('[StartScan] Module reset complete');
        }
        
        // Nettoyage complet
        cleanup() {
            console.log('[StartScan] Cleaning up...');
            
            this.reset();
            this.isInitialized = false;
            this.navigationWrapped = false;
            
            if (this.moduleCheckInterval) {
                clearInterval(this.moduleCheckInterval);
                this.moduleCheckInterval = null;
            }
            
            console.log('[StartScan] Cleanup complete');
        }
    }
    
    // ========================================
    // CRÉATION ET INITIALISATION DU MODULE
    // ========================================
    const startScanModule = new StartScanModule();
    
    // Exposer globalement
    window.startScanModule = startScanModule;
    
    // Fonctions globales pour compatibilité
    window.autoStartScan = () => startScanModule.autoStartScan();
    window.forceStartScan = () => startScanModule.forceScan();
    window.getStartScanStatus = () => startScanModule.getStatus();
    
    // ========================================
    // INITIALISATION AU CHARGEMENT
    // ========================================
    
    // Fonction d'initialisation sécurisée
    const safeInit = () => {
        try {
            // Vérifier que les modules de base sont présents
            if (!window.uiManager) {
                console.log('[StartScan] UIManager not ready, waiting...');
                setTimeout(safeInit, 500);
                return;
            }
            
            // Initialiser le module
            startScanModule.init();
            
        } catch (error) {
            console.error('[StartScan] Error during initialization:', error);
            setTimeout(safeInit, 1000);
        }
    };
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[StartScan] DOM ready, starting initialization...');
            setTimeout(safeInit, 1000); // Attendre que les autres modules soient chargés
        });
    } else {
        console.log('[StartScan] DOM already loaded, starting initialization...');
        setTimeout(safeInit, 1000); // Attendre que les autres modules soient chargés
    }
    
    console.log('[StartScan] ✅ Module v4.0 COMPLET loaded - Auto-scan ready for double auth');
})();
