// app.js - Application EmailSortPro avec authentification dual provider (Microsoft + Google) v5.0
// AVEC BLOCAGE STRICT DES LICENCES EXPIRÉES

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null; // 'microsoft' ou 'google'
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.licenseBlocked = false; // Flag pour bloquer l'accès
        
        console.log('[App] Constructor - EmailSortPro starting with dual provider support and license enforcement...');
    }

    async init() {
        console.log('[App] Initializing dual provider application...');
        
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

            console.log('[App] Initializing auth services...');
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 30000)
            );
            
            // Initialiser les deux services d'authentification en parallèle
            const authPromises = [];
            
            if (window.authService) {
                authPromises.push(
                    window.authService.initialize().then(() => {
                        console.log('[App] ✅ Microsoft auth service initialized');
                        return 'microsoft';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Microsoft auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            if (window.googleAuthService) {
                authPromises.push(
                    window.googleAuthService.initialize().then(() => {
                        console.log('[App] ✅ Google auth service initialized');
                        return 'google';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Google auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            // Attendre au moins un service d'auth
            const initResults = await Promise.race([
                Promise.allSettled(authPromises),
                initTimeout
            ]);
            
            console.log('[App] Auth services initialization results:', initResults);
            
            // IMPORTANT: Initialiser le service de licence AVANT les modules
            await this.initializeLicenseService();
            
            // INITIALISER LES MODULES CRITIQUES
            await this.initializeCriticalModules();
            
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // =====================================
    // INITIALISATION DU SERVICE DE LICENCE
    // =====================================
    async initializeLicenseService() {
        console.log('[App] Initializing license service...');
        
        if (!window.licenseService) {
            console.error('[App] License service not available!');
            this.showError('Service de licence non disponible. Veuillez recharger la page.');
            return false;
        }
        
        try {
            await window.licenseService.initialize();
            console.log('[App] ✅ License service initialized');
            return true;
        } catch (error) {
            console.error('[App] Failed to initialize license service:', error);
            this.showError('Erreur d\'initialisation du service de licence.');
            return false;
        }
    }

    // =====================================
    // INITIALISATION DES MODULES CRITIQUES
    // =====================================
    async initializeCriticalModules() {
        console.log('[App] Initializing critical modules...');
        
        // 1. Vérifier TaskManager
        await this.ensureTaskManagerReady();
        
        // 2. Vérifier PageManager
        await this.ensurePageManagerReady();
        
        // 3. Vérifier TasksView
        await this.ensureTasksViewReady();
        
        // 4. Vérifier DashboardModule
        await this.ensureDashboardModuleReady();
        
        // 5. Bind methods
        this.bindModuleMethods();
        
        // 6. Initialiser la gestion du scroll
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialized');
    }

    // =====================================
    // GESTION INTELLIGENTE DU SCROLL
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        // Variables pour éviter les boucles infinies
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        let lastContentHeight = 0;
        let lastViewportHeight = 0;
        
        // Fonction pour vérifier si le scroll est nécessaire
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) {
                return;
            }
            
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const currentPage = this.currentPage || 'dashboard';
                    
                    // Vérifier si les dimensions ont réellement changé
                    const dimensionsChanged = 
                        Math.abs(contentHeight - lastContentHeight) > 10 || 
                        Math.abs(viewportHeight - lastViewportHeight) > 10;
                    
                    lastContentHeight = contentHeight;
                    lastViewportHeight = viewportHeight;
                    
                    // Dashboard: JAMAIS de scroll
                    if (currentPage === 'dashboard') {
                        const newState = 'dashboard-no-scroll';
                        if (lastScrollState !== newState) {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                            lastScrollState = newState;
                        }
                        scrollCheckInProgress = false;
                        return;
                    }
                    
                    // Autres pages: scroll seulement si vraiment nécessaire
                    const threshold = 100;
                    const needsScroll = contentHeight > viewportHeight + threshold;
                    const newState = needsScroll ? 'scroll-enabled' : 'scroll-disabled';
                    
                    if (lastScrollState !== newState || dimensionsChanged) {
                        if (needsScroll) {
                            body.classList.add('needs-scroll');
                            body.style.overflow = '';
                            body.style.overflowY = '';
                            body.style.overflowX = '';
                        } else {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                        }
                        lastScrollState = newState;
                    }
                    
                } catch (error) {
                    console.error('[SCROLL_MANAGER] Error checking scroll:', error);
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150);
        };

        // Fonction pour définir le mode de page
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) {
                return;
            }
            
            const body = document.body;
            
            // Mettre à jour la page actuelle
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            // Nettoyer les anciennes classes de page
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode'
            );
            
            // Ajouter la nouvelle classe de page
            body.classList.add(`page-${pageName}`);
            
            // Réinitialiser l'état du scroll
            lastScrollState = null;
            lastContentHeight = 0;
            lastViewportHeight = 0;
            
            // Dashboard: configuration immédiate
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
                body.style.overflowY = 'hidden';
                body.style.overflowX = 'hidden';
                lastScrollState = 'dashboard-no-scroll';
                return;
            }
            
            // Autres pages: vérifier après stabilisation du contenu
            setTimeout(() => {
                if (this.currentPage === pageName) {
                    this.checkScrollNeeded();
                }
            }, 300);
        };

        // Observer pour les changements de contenu
        if (window.MutationObserver) {
            let observerTimeout;
            let pendingMutations = false;
            
            const contentObserver = new MutationObserver((mutations) => {
                if (this.currentPage === 'dashboard') {
                    return;
                }
                
                const significantChanges = mutations.some(mutation => {
                    if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        const target = mutation.target;
                        
                        if (attrName === 'style' && target === document.body) {
                            return false;
                        }
                        if (attrName === 'class' && target === document.body) {
                            return false;
                        }
                    }
                    
                    if (mutation.type === 'childList') {
                        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
                    }
                    
                    return false;
                });
                
                if (significantChanges && !pendingMutations) {
                    pendingMutations = true;
                    clearTimeout(observerTimeout);
                    
                    observerTimeout = setTimeout(() => {
                        if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                            this.checkScrollNeeded();
                        }
                        pendingMutations = false;
                    }, 250);
                }
            });

            contentObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
                attributeOldValue: false
            });
        }

        // Gestionnaire de redimensionnement
        let resizeTimeout;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        window.addEventListener('resize', () => {
            const currentSize = { width: window.innerWidth, height: window.innerHeight };
            
            const sizeChanged = 
                Math.abs(currentSize.width - lastWindowSize.width) > 10 ||
                Math.abs(currentSize.height - lastWindowSize.height) > 10;
            
            if (!sizeChanged || this.currentPage === 'dashboard') {
                return;
            }
            
            lastWindowSize = currentSize;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                    this.checkScrollNeeded();
                }
            }, 300);
        });

        console.log('[App] ✅ Scroll manager initialized');
    }

    async ensureTaskManagerReady() {
        console.log('[App] Ensuring TaskManager is ready...');
        
        if (window.taskManager && window.taskManager.initialized) {
            console.log('[App] ✅ TaskManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while ((!window.taskManager || !window.taskManager.initialized) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.taskManager || !window.taskManager.initialized) {
            console.error('[App] TaskManager not ready after 5 seconds');
            return false;
        }
        
        const essentialMethods = ['createTaskFromEmail', 'createTask', 'updateTask', 'deleteTask', 'getStats'];
        for (const method of essentialMethods) {
            if (typeof window.taskManager[method] !== 'function') {
                console.error(`[App] TaskManager missing essential method: ${method}`);
                return false;
            }
        }
        
        console.log('[App] ✅ TaskManager ready with', window.taskManager.getAllTasks().length, 'tasks');
        return true;
    }

    async ensurePageManagerReady() {
        console.log('[App] Ensuring PageManager is ready...');
        
        if (window.pageManager) {
            console.log('[App] ✅ PageManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.pageManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.pageManager) {
            console.error('[App] PageManager not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ PageManager ready');
        return true;
    }

    async ensureTasksViewReady() {
        console.log('[App] Ensuring TasksView is ready...');
        
        if (window.tasksView) {
            console.log('[App] ✅ TasksView already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.tasksView && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.tasksView) {
            console.warn('[App] TasksView not ready after 3 seconds - will work without it');
            return false;
        }
        
        console.log('[App] ✅ TasksView ready');
        return true;
    }

    async ensureDashboardModuleReady() {
        console.log('[App] Ensuring DashboardModule is ready...');
        
        if (window.dashboardModule) {
            console.log('[App] ✅ DashboardModule already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.dashboardModule && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.dashboardModule) {
            console.error('[App] DashboardModule not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ DashboardModule ready');
        return true;
    }

    bindModuleMethods() {
        // Bind TaskManager methods
        if (window.taskManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.taskManager)).forEach(name => {
                    if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
                        window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
                    }
                });
                console.log('[App] ✅ TaskManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding TaskManager methods:', error);
            }
        }
        
        // Bind autres modules...
        if (window.pageManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.pageManager)).forEach(name => {
                    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
                        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
                    }
                });
                console.log('[App] ✅ PageManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding PageManager methods:', error);
            }
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

        if (!window.authService && !window.googleAuthService) {
            console.error('[App] No authentication service available');
            this.showError('Authentication service not available. Please refresh the page.');
            return false;
        }

        return true;
    }

    // =====================================
    // VÉRIFICATION DE L'AUTHENTIFICATION DUAL PROVIDER
    // =====================================
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status for both providers...');
        
        // Vérifier d'abord s'il y a un callback Google à traiter
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            // IMPORTANT: Vérifier la licence même après le callback Google
            await this.verifyLicenseAfterAuth();
            return;
        }
        
        // Vérifier Microsoft d'abord
        if (window.authService && window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] Microsoft authentication found, getting user info...');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.user.provider = 'microsoft';
                    this.isAuthenticated = true;
                    this.activeProvider = 'microsoft';
                    console.log('[App] ✅ Microsoft user authenticated:', this.user.displayName || this.user.mail);
                    
                    // IMPORTANT: Vérifier la licence
                    await this.verifyLicenseAfterAuth();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Microsoft user info:', userInfoError);
                    if (userInfoError.message.includes('401') || userInfoError.message.includes('403')) {
                        console.log('[App] Microsoft token seems invalid, clearing auth');
                        await window.authService.reset();
                    }
                }
            }
        }
        
        // Vérifier Google ensuite
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                console.log('[App] Google authentication found, getting user info...');
                try {
                    this.user = await window.googleAuthService.getUserInfo();
                    this.user.provider = 'google';
                    this.isAuthenticated = true;
                    this.activeProvider = 'google';
                    console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                    
                    // IMPORTANT: Vérifier la licence
                    await this.verifyLicenseAfterAuth();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Google user info:', userInfoError);
                    await window.googleAuthService.reset();
                }
            }
        }
        
        // Aucune authentification trouvée
        console.log('[App] No valid authentication found');
        this.showLogin();
    }

    // =====================================
    // VÉRIFICATION DE LICENCE APRÈS AUTH
    // =====================================
    async verifyLicenseAfterAuth() {
        console.log('[App] Verifying license after authentication...');
        
        if (!this.user || !window.licenseService) {
            console.error('[App] Cannot verify license - missing user or license service');
            this.showLogin();
            return;
        }
        
        try {
            const userEmail = this.user.mail || this.user.email;
            console.log('[App] Checking license for:', userEmail);
            
            // Appeler le service de licence pour vérifier
            const licenseStatus = await window.licenseService.authenticateWithEmail(userEmail);
            
            console.log('[App] License status received:', licenseStatus);
            
            // BLOCAGE STRICT SI LICENCE EXPIRÉE
            if (!licenseStatus.valid && licenseStatus.status === 'expired') {
                console.error('[App] ❌ LICENSE EXPIRED - BLOCKING ACCESS');
                this.licenseBlocked = true;
                this.showExpiredLicenseScreen(licenseStatus);
                return;
            }
            
            // Si licence non trouvée, proposer de créer un compte d'essai
            if (licenseStatus.status === 'not_found') {
                console.log('[App] User not found in database, showing trial creation');
                this.showTrialCreationScreen(userEmail);
                return;
            }
            
            // Si licence bloquée
            if (licenseStatus.status === 'blocked') {
                console.error('[App] ❌ LICENSE BLOCKED');
                this.licenseBlocked = true;
                this.showBlockedLicenseScreen(licenseStatus);
                return;
            }
            
            // Si licence pas encore commencée
            if (licenseStatus.status === 'not_started') {
                console.log('[App] License not started yet');
                this.showNotStartedLicenseScreen(licenseStatus);
                return;
            }
            
            // Si erreur de vérification
            if (licenseStatus.status === 'error') {
                console.error('[App] License verification error');
                this.showLicenseErrorScreen(licenseStatus);
                return;
            }
            
            // LICENCE VALIDE - Continuer
            console.log('[App] ✅ License is valid, showing app');
            
            // Stocker les infos de licence dans l'utilisateur
            this.user.licenseInfo = licenseStatus;
            
            // Afficher l'avertissement si proche de l'expiration
            if (licenseStatus.warningLevel) {
                this.showLicenseWarning(licenseStatus);
            }
            
            // Afficher l'application
            this.showAppWithTransition();
            
        } catch (error) {
            console.error('[App] License verification error:', error);
            this.showLicenseErrorScreen({
                status: 'error',
                message: 'Erreur de vérification de licence',
                error: error.message
            });
        }
    }

    // =====================================
    // ÉCRANS DE BLOCAGE DE LICENCE
    // =====================================
    
    showExpiredLicenseScreen(licenseStatus) {
        console.log('[App] Showing expired license screen');
        
        const adminContact = licenseStatus.adminContact || {};
        const daysExpired = licenseStatus.daysExpired || 0;
        const accountType = licenseStatus.user?.account_type || 'professional';
        const userRole = licenseStatus.user?.role || 'user';
        const isAdmin = userRole === 'company_admin' || userRole === 'super_admin';
        
        document.body.classList.add('login-mode', 'license-blocked');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container license-expired-container">
                    <div style="max-width: 700px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #ef4444;">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Licence Expirée
                        </h1>
                        
                        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.3rem; line-height: 1.8; color: #1f2937; margin-bottom: 20px;">
                                Votre licence EmailSortPro a expiré depuis <strong>${daysExpired} jour${daysExpired > 1 ? 's' : ''}</strong>.
                            </p>
                            <p style="font-size: 1.1rem; line-height: 1.6; color: #4b5563;">
                                ${licenseStatus.detailedMessage || 'Pour continuer à utiliser EmailSortPro, veuillez renouveler votre licence.'}
                            </p>
                        </div>
                        
                        ${accountType === 'individual' || isAdmin ? `
                            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #3b82f6; margin-bottom: 15px;">
                                    <i class="fas fa-info-circle"></i> ${isAdmin ? 'Vous êtes administrateur' : 'Compte Personnel'}
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 20px;">
                                    Pour régulariser votre compte et continuer à utiliser EmailSortPro, 
                                    accédez à votre espace de gestion :
                                </p>
                                <a href="https://emailsortpro.netlify.app/analytics.html" 
                                   class="login-button" 
                                   style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                                          color: white; display: inline-flex; align-items: center; gap: 10px;
                                          padding: 15px 30px; font-size: 1.1rem;">
                                    <i class="fas fa-chart-line"></i>
                                    Accéder à l'espace de gestion
                                </a>
                            </div>
                        ` : `
                            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #f59e0b; margin-bottom: 15px;">
                                    <i class="fas fa-building"></i> Compte Professionnel
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 15px;">
                                    Contactez votre administrateur pour renouveler la licence :
                                </p>
                                <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px;">
                                    ${adminContact.email ? `
                                        <p style="margin: 8px 0;">
                                            <strong>Email administrateur :</strong> 
                                            <a href="mailto:${adminContact.email}" style="color: #3b82f6; font-size: 1.1rem;">
                                                ${adminContact.email}
                                            </a>
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        `}
                        
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
                            <button onclick="window.app.logout()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151; 
                                           border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-sign-out-alt"></i>
                                Se déconnecter
                            </button>
                            <button onclick="location.reload()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151; 
                                           border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 0.9rem; color: #6b7280;">
                            Utilisateur : ${licenseStatus.user?.email || this.user?.email || 'Non identifié'}
                        </p>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showBlockedLicenseScreen(licenseStatus) {
        console.log('[App] Showing blocked license screen');
        
        const adminContact = licenseStatus.adminContact || {};
        const userRole = licenseStatus.user?.role || 'user';
        const isAdmin = userRole === 'company_admin' || userRole === 'super_admin';
        
        document.body.classList.add('login-mode', 'license-blocked');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #dc2626;">
                            <i class="fas fa-ban"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Compte Bloqué
                        </h1>
                        
                        <div style="background: rgba(220, 38, 38, 0.1); border: 2px solid rgba(220, 38, 38, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message}
                            </p>
                        </div>
                        
                        ${isAdmin ? `
                            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #3b82f6; margin-bottom: 15px;">
                                    <i class="fas fa-info-circle"></i> Vous êtes administrateur
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 20px;">
                                    Pour débloquer votre compte, accédez à votre espace de gestion :
                                </p>
                                <a href="https://emailsortpro.netlify.app/analytics.html" 
                                   class="login-button" 
                                   style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                                          color: white; display: inline-flex; align-items: center; gap: 10px;
                                          padding: 15px 30px; font-size: 1.1rem;">
                                    <i class="fas fa-chart-line"></i>
                                    Accéder à l'espace de gestion
                                </a>
                            </div>
                        ` : adminContact.email ? `
                            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #f59e0b; margin-bottom: 15px;">Contact administrateur</h3>
                                <div style="background: white; padding: 20px; border-radius: 10px;">
                                    <p>
                                        <strong>Email administrateur :</strong> 
                                        <a href="mailto:${adminContact.email}" style="color: #3b82f6; font-size: 1.1rem;">
                                            ${adminContact.email}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        ` : ''}
                        
                        <button onclick="window.app.logout()" class="login-button" 
                                style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                            <i class="fas fa-sign-out-alt"></i>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showNotStartedLicenseScreen(licenseStatus) {
        console.log('[App] Showing not started license screen');
        
        const startDate = new Date(licenseStatus.startsAt).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #fbbf24;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Licence Non Active
                        </h1>
                        
                        <div style="background: rgba(251, 191, 36, 0.1); border: 2px solid rgba(251, 191, 36, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message}
                            </p>
                            <p style="font-size: 1.1rem; margin-top: 15px; color: #f59e0b; font-weight: 600;">
                                Date d'activation : ${startDate}
                            </p>
                        </div>
                        
                        <button onclick="window.app.logout()" class="login-button" 
                                style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                            <i class="fas fa-sign-out-alt"></i>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showLicenseErrorScreen(licenseStatus) {
        console.log('[App] Showing license error screen');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #ef4444;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Erreur de Licence
                        </h1>
                        
                        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message || 'Une erreur s\'est produite lors de la vérification de votre licence.'}
                            </p>
                            ${licenseStatus.error ? `
                                <p style="font-size: 0.9rem; margin-top: 15px; color: #6b7280;">
                                    Détails : ${licenseStatus.error}
                                </p>
                            ` : ''}
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Réessayer
                            </button>
                            <button onclick="window.app.logout()" class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                                <i class="fas fa-sign-out-alt"></i>
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showTrialCreationScreen(email) {
        console.log('[App] Showing trial creation screen for:', email);
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 700px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #10b981;">
                            <i class="fas fa-gift"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Bienvenue sur EmailSortPro !
                        </h1>
                        
                        <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937; margin-bottom: 20px;">
                                Vous n'avez pas encore de compte EmailSortPro.
                            </p>
                            <p style="font-size: 1.1rem; color: #10b981; font-weight: 600;">
                                Créez votre compte et profitez de 15 jours d'essai gratuit !
                            </p>
                        </div>
                        
                        <div id="accountTypeSelection" style="margin: 30px 0;">
                            <h3 style="margin-bottom: 20px; color: #1f2937;">
                                Choisissez votre type de compte :
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 500px; margin: 0 auto;">
                                <button onclick="window.app.createTrialAccount('individual')" 
                                        class="account-type-button">
                                    <i class="fas fa-user" style="font-size: 3rem; margin-bottom: 15px; color: #3b82f6;"></i>
                                    <h4 style="margin-bottom: 8px;">Personnel</h4>
                                    <p style="font-size: 0.9rem; color: #6b7280;">Pour un usage individuel</p>
                                </button>
                                
                                <button onclick="window.app.createTrialAccount('professional')" 
                                        class="account-type-button">
                                    <i class="fas fa-building" style="font-size: 3rem; margin-bottom: 15px; color: #8b5cf6;"></i>
                                    <h4 style="margin-bottom: 8px;">Professionnel</h4>
                                    <p style="font-size: 0.9rem; color: #6b7280;">Pour votre entreprise</p>
                                </button>
                            </div>
                        </div>
                        
                        <div id="companyNameSection" style="display: none; margin: 30px auto; max-width: 400px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1f2937;">
                                Nom de votre entreprise :
                            </label>
                            <input type="text" 
                                   id="companyNameInput" 
                                   class="login-input" 
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; 
                                          border-radius: 10px; font-size: 1rem;"
                                   placeholder="Entrez le nom de votre entreprise">
                            <button onclick="window.app.confirmTrialCreation()" 
                                    class="login-button" 
                                    style="margin-top: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-check"></i>
                                Créer mon compte d'essai
                            </button>
                        </div>
                        
                        <div style="margin-top: 40px;">
                            <button onclick="window.app.logout()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                                <i class="fas fa-arrow-left"></i>
                                Retour
                            </button>
                        </div>
                    </div>
                </div>
                
                <style>
                    .account-type-button {
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 15px;
                        padding: 30px 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                    }
                    
                    .account-type-button:hover {
                        border-color: #3b82f6;
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .account-type-button h4 {
                        font-size: 1.2rem;
                        color: #1f2937;
                    }
                </style>
            `;
        }
        
        this.hideModernLoading();
        
        // Stocker l'email pour la création
        this.pendingTrialEmail = email;
    }

    showLicenseWarning(licenseStatus) {
        if (!window.uiManager) return;
        
        const daysRemaining = licenseStatus.daysRemaining;
        let message = '';
        let type = 'info';
        
        if (licenseStatus.warningLevel === 'critical') {
            message = `⚠️ Attention : Votre licence expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} !`;
            type = 'error';
        } else if (licenseStatus.warningLevel === 'warning') {
            message = `⏰ Votre licence expire dans ${daysRemaining} jours.`;
            type = 'warning';
        } else if (licenseStatus.warningLevel === 'info') {
            message = `ℹ️ Votre licence expire dans ${daysRemaining} jours.`;
            type = 'info';
        }
        
        if (message) {
            window.uiManager.showToast(message, type, 10000);
        }
    }

    // =====================================
    // CRÉATION DE COMPTE D'ESSAI
    // =====================================
    
    async createTrialAccount(accountType) {
        console.log('[App] Creating trial account:', accountType);
        
        this.pendingAccountType = accountType;
        
        if (accountType === 'professional') {
            // Afficher le champ nom d'entreprise
            document.getElementById('accountTypeSelection').style.display = 'none';
            document.getElementById('companyNameSection').style.display = 'block';
        } else {
            // Créer directement le compte personnel
            await this.confirmTrialCreation();
        }
    }

    async confirmTrialCreation() {
        console.log('[App] Confirming trial creation');
        
        const accountType = this.pendingAccountType;
        const email = this.pendingTrialEmail;
        let companyName = null;
        
        if (accountType === 'professional') {
            companyName = document.getElementById('companyNameInput')?.value.trim();
            if (!companyName) {
                alert('Veuillez entrer le nom de votre entreprise');
                return;
            }
        }
        
        this.showModernLoading('Création de votre compte d\'essai...');
        
        try {
            const result = await window.licenseService.createUserWithTrial(
                email,
                accountType,
                companyName
            );
            
            if (result.success) {
                console.log('[App] Trial account created successfully');
                
                // Réauthentifier pour obtenir les nouvelles infos
                const licenseStatus = await window.licenseService.authenticateWithEmail(email);
                
                if (licenseStatus.valid) {
                    this.user.licenseInfo = licenseStatus;
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            '🎉 Compte créé avec succès ! Profitez de vos 15 jours d\'essai gratuit.',
                            'success',
                            8000
                        );
                    }
                    
                    setTimeout(() => {
                        this.showAppWithTransition();
                    }, 1000);
                } else {
                    throw new Error('Erreur lors de la validation du compte créé');
                }
            } else {
                throw new Error(result.error || 'Erreur lors de la création du compte');
            }
            
        } catch (error) {
            console.error('[App] Trial creation error:', error);
            this.hideModernLoading();
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur : ' + error.message,
                    'error',
                    8000
                );
            } else {
                alert('Erreur : ' + error.message);
            }
        }
    }

    // =====================================
    // GESTION DU CALLBACK GOOGLE OAuth2
    // =====================================
    async handleGoogleCallback() {
        console.log('[App] Handling Google OAuth2 callback...');
        
        try {
            // Vérifier s'il y a des données de callback Google
            const callbackDataStr = sessionStorage.getItem('google_callback_data');
            if (!callbackDataStr) {
                console.log('[App] No Google callback data found');
                return false;
            }
            
            const callbackData = JSON.parse(callbackDataStr);
            console.log('[App] Found Google callback data:', callbackData);
            
            // Nettoyer les données de callback
            sessionStorage.removeItem('google_callback_data');
            
            // Traiter le callback avec le service Google
            const urlParams = new URLSearchParams();
            urlParams.set('code', callbackData.code);
            urlParams.set('state', callbackData.state);
            
            const success = await window.googleAuthService.handleOAuthCallback(urlParams);
            
            if (success) {
                console.log('[App] ✅ Google callback handled successfully');
                
                // Obtenir les informations utilisateur
                this.user = await window.googleAuthService.getUserInfo();
                this.user.provider = 'google';
                this.isAuthenticated = true;
                this.activeProvider = 'google';
                
                console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                return true;
            } else {
                throw new Error('Google callback processing failed');
            }
            
        } catch (error) {
            console.error('[App] ❌ Error handling Google callback:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur de traitement Google: ' + error.message,
                    'error',
                    8000
                );
            }
            
            return false;
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

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // NAVIGATION CORRIGÉE
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                // Vérifier si l'accès est bloqué
                if (this.licenseBlocked) {
                    console.warn('[App] Navigation blocked - license expired');
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            '❌ Accès bloqué - Licence expirée',
                            'error'
                        );
                    }
                    return;
                }
                
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

        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
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
            
            if (event.reason && event.reason.message && 
                event.reason.message.includes('Cannot read properties of undefined')) {
                
                if (event.reason.message.includes('createTaskFromEmail')) {
                    console.error('[App] TaskManager createTaskFromEmail error detected');
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur du gestionnaire de tâches. Veuillez actualiser la page.',
                            'warning'
                        );
                    }
                }
            }
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });
    }

    // =====================================
    // MÉTHODES DE CONNEXION DUAL PROVIDER
    // =====================================

    // Méthode de connexion unifiée (backward compatibility)
    async login() {
        console.log('[App] Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    // Connexion Microsoft spécifique
    async loginMicrosoft() {
        console.log('[App] Microsoft login attempted...');
        
        try {
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                console.log('[App] Microsoft AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Microsoft login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Microsoft. Veuillez réessayer.';
            
            if (error.errorCode) {
                const errorCode = error.errorCode;
                if (window.AppConfig.errors && window.AppConfig.errors[errorCode]) {
                    errorMessage = window.AppConfig.errors[errorCode];
                } else {
                    switch (errorCode) {
                        case 'popup_window_error':
                            errorMessage = 'Popup bloqué. Autorisez les popups pour Outlook et réessayez.';
                            break;
                        case 'user_cancelled':
                            errorMessage = 'Connexion Outlook annulée.';
                            break;
                        case 'network_error':
                            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                            break;
                        case 'unauthorized_client':
                            errorMessage = 'Configuration incorrecte. Vérifiez votre Azure Client ID.';
                            break;
                        default:
                            errorMessage = `Erreur Microsoft: ${errorCode}`;
                    }
                }
            } else if (error.message.includes('unauthorized_client')) {
                errorMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    // Connexion Google spécifique - SANS IFRAME
    async loginGoogle() {
        console.log('[App] Google login attempted...');
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService.isInitialized) {
                console.log('[App] Google AuthService not initialized, initializing...');
                await window.googleAuthService.initialize();
            }
            
            // Le service Google redirige automatiquement, pas besoin d'attendre
            await window.googleAuthService.login();
            
            // Cette ligne ne sera jamais atteinte car login() redirige
            console.log('[App] This should not be reached due to redirect');
            
        } catch (error) {
            console.error('[App] Google login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Gmail. Veuillez réessayer.';
            
            if (error.message) {
                if (error.message.includes('cookies')) {
                    errorMessage = 'Cookies tiers bloqués. Autorisez les cookies pour accounts.google.com et réessayez.';
                } else if (error.message.includes('domain') || error.message.includes('origin')) {
                    errorMessage = 'Erreur de domaine Gmail. Vérifiez la configuration Google Console.';
                } else if (error.message.includes('client')) {
                    errorMessage = 'Configuration Google incorrecte. Vérifiez votre Client ID.';
                } else {
                    errorMessage = `Erreur Gmail: ${error.message}`;
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            // Déconnexion selon le provider actif
            if (this.activeProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else {
                // Fallback: essayer les deux
                if (window.authService) {
                    try { await window.authService.logout(); } catch (e) {}
                }
                if (window.googleAuthService) {
                    try { await window.googleAuthService.logout(); } catch (e) {}
                }
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
        console.log('[App] Force cleanup dual provider...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.licenseBlocked = false;
        
        // Nettoyer les deux services d'authentification
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        // Nettoyer le service de licence
        if (window.licenseService) {
            window.licenseService.reset();
        }
        
        // Nettoyer le localStorage sélectivement
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
        
        // Nettoyer sessionStorage aussi
        try {
            sessionStorage.removeItem('google_callback_data');
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('direct_token_data');
        } catch (e) {
            console.warn('[App] Error cleaning sessionStorage:', e);
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLogin() {
        console.log('[App] Showing login page');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active', 'license-blocked');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    showAppWithTransition() {
        console.log('[App] Showing application with transition - Provider:', this.activeProvider);
        
        // Vérifier une dernière fois si la licence est bloquée
        if (this.licenseBlocked) {
            console.error('[App] Cannot show app - license is blocked!');
            return;
        }
        
        this.hideModernLoading();
        
        // Retirer le mode login et activer le mode app
        document.body.classList.remove('login-mode', 'license-blocked');
        document.body.classList.add('app-active');
        console.log('[App] App mode activated');
        
        // Afficher les éléments
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
            console.log('[App] Header displayed');
        }
        
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
            console.log('[App] Navigation displayed');
        }
        
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        }
        
        // Mettre à jour l'interface utilisateur avec le provider
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Mettre à jour l'affichage utilisateur avec badge provider ET info licence
        if (window.updateUserDisplay) {
            const userWithLicense = {
                ...this.user,
                licenseInfo: this.user.licenseInfo
            };
            window.updateUserDisplay(userWithLicense);
        }
        
        // INITIALISATION DASHBOARD VIA MODULE
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        // Forcer immédiatement pas de scroll pour le dashboard
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        console.log('[App] Dashboard scroll forcé à hidden');
        
        // CHARGER LE DASHBOARD VIA LE MODULE
        if (window.dashboardModule) {
            console.log('[App] Loading dashboard via dashboardModule...');
            setTimeout(() => {
                window.dashboardModule.render();
                console.log('[App] Dashboard loaded via module for provider:', this.activeProvider);
            }, 100);
        } else {
            console.warn('[App] Dashboard module not available, will retry...');
            setTimeout(() => {
                if (window.dashboardModule) {
                    window.dashboardModule.render();
                }
            }, 500);
        }
        
        // Forcer l'affichage avec CSS
        this.forceAppDisplay();
        
        console.log(`[App] ✅ Application fully displayed with ${this.activeProvider} provider`);
    }

    forceAppDisplay() {
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
            body.license-blocked .app-header,
            body.license-blocked .app-nav,
            body.license-blocked #pageContent {
                display: none !important;
            }
        `;
        
        const oldStyle = document.getElementById('force-app-display');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(forceDisplayStyle);
        console.log('[App] Force display CSS injected');
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
        }
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Erreur d'application</h1>
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Actualiser la page
                            </button>
                            <button onclick="window.app.forceCleanup()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
    }

    showConfigurationError(issues) {
        console.error('[App] Configuration error:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">Configuration requise</h1>
                        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(251, 191, 36, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px;">Pour résoudre :</h4>
                                <ol style="margin-left: 20px;">
                                    <li>Cliquez sur "Configurer l'application"</li>
                                    <li>Suivez l'assistant de configuration</li>
                                    <li>Entrez vos Client IDs Azure et Google</li>
                                </ol>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="setup.html" class="login-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    // =====================================
    // DIAGNOSTIC ET INFORMATIONS DUAL PROVIDER
    // =====================================
    getDiagnosticInfo() {
        return {
            isAuthenticated: this.isAuthenticated,
            activeProvider: this.activeProvider,
            licenseBlocked: this.licenseBlocked,
            user: this.user ? {
                name: this.user.displayName || this.user.name,
                email: this.user.mail || this.user.email,
                provider: this.user.provider,
                licenseInfo: this.user.licenseInfo
            } : null,
            currentPage: this.currentPage,
            isInitialized: !this.isInitializing,
            microsoftAuthService: window.authService ? {
                isInitialized: window.authService.isInitialized,
                isAuthenticated: window.authService.isAuthenticated()
            } : null,
            googleAuthService: window.googleAuthService ? {
                isInitialized: window.googleAuthService.isInitialized,
                isAuthenticated: window.googleAuthService.isAuthenticated(),
                method: 'Direct OAuth2 (sans iframe)',
                avoidsiFrameError: true
            } : null,
            licenseService: window.licenseService ? {
                initialized: window.licenseService.initialized,
                hasCurrentUser: !!window.licenseService.currentUser
            } : null,
            services: window.checkServices ? window.checkServices() : null,
            googleCallbackData: sessionStorage.getItem('google_callback_data'),
            sessionData: {
                googleCallback: !!sessionStorage.getItem('google_callback_data'),
                googleToken: !!localStorage.getItem('google_token_emailsortpro'),
                directToken: !!sessionStorage.getItem('direct_token_data')
            }
        };
    }
}

// =====================================
// FONCTIONS GLOBALES D'URGENCE DUAL PROVIDER
// =====================================

window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered for dual provider');
    
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
    
    // Nettoyer sessionStorage
    try {
        sessionStorage.clear();
    } catch (e) {
        console.warn('[Emergency] Error clearing sessionStorage:', e);
    }
    
    window.location.reload();
};

window.forceShowApp = function() {
    console.log('[Global] Force show app triggered');
    if (window.app && typeof window.app.showAppWithTransition === 'function') {
        // Vérifier si la licence est bloquée
        if (window.app.licenseBlocked) {
            console.error('[Global] Cannot force show app - license is blocked');
            return;
        }
        window.app.showAppWithTransition();
    } else {
        document.body.classList.add('app-active');
        document.body.classList.remove('login-mode', 'license-blocked');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        if (window.dashboardModule) {
            window.dashboardModule.render();
        }
    }
};

// =====================================
// VÉRIFICATION DES SERVICES DUAL PROVIDER
// =====================================
function checkServicesReady() {
    const requiredServices = ['uiManager', 'licenseService'];
    const authServices = ['authService', 'googleAuthService'];
    const optionalServices = ['mailService', 'emailScanner', 'categoryManager', 'dashboardModule'];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const availableAuthServices = authServices.filter(service => window[service]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    if (missingRequired.length > 0) {
        console.error('[App] Missing REQUIRED services:', missingRequired);
        return false;
    }
    
    if (availableAuthServices.length === 0) {
        console.error('[App] No authentication services available:', authServices);
        return false;
    }
    
    if (missingOptional.length > 0) {
        console.warn('[App] Missing optional services:', missingOptional);
    }
    
    if (!window.AppConfig) {
        console.error('[App] Missing AppConfig');
        return false;
    }
    
    console.log('[App] Available auth services:', availableAuthServices);
    return true;
}

// =====================================
// INITIALISATION PRINCIPALE DUAL PROVIDER
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating dual provider app instance with license enforcement...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        const maxAttempts = 50;
        
        if (checkServicesReady()) {
            console.log('[App] All required services ready, initializing dual provider app...');
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else if (attempts < maxAttempts) {
            console.log(`[App] Waiting for services... (${attempts + 1}/${maxAttempts})`);
            setTimeout(() => waitForServices(attempts + 1), 100);
        } else {
            console.error('[App] Timeout waiting for services, initializing anyway...');
            setTimeout(() => {
                window.app.init();
            }, 100);
        }
    };
    
    waitForServices();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) {
            console.error('[App] App instance not created, creating fallback...');
            document.body.classList.add('login-mode');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] Fallback initialization check...');
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
                document.body.classList.add('login-mode');
            }
        }
    }, 5000);
});

// =====================================
// DIAGNOSTIC GLOBAL DUAL PROVIDER
// =====================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION DUAL PROVIDER - EmailSortPro');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            console.log('📱 App Status:', appDiag);
            
            // Services
            if (appDiag.services) {
                console.log('🛠️ Services:', appDiag.services);
            }
            
            // License Service
            if (appDiag.licenseService) {
                console.log('🔐 License Service:', appDiag.licenseService);
            }
            
            // Microsoft
            if (appDiag.microsoftAuthService) {
                console.log('🔵 Microsoft Auth:', appDiag.microsoftAuthService);
            }
            
            // Google
            if (appDiag.googleAuthService) {
                console.log('🔴 Google Auth:', appDiag.googleAuthService);
            }
            
            // Session Data
            if (appDiag.sessionData) {
                console.log('💾 Session Data:', appDiag.sessionData);
            }
            
            // License Status
            if (appDiag.user && appDiag.user.licenseInfo) {
                console.log('📋 License Info:', appDiag.user.licenseInfo);
            }
            
            return appDiag;
        } else {
            console.log('❌ App instance not available');
            return { error: 'App instance not available' };
        }
    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ App v5.0 loaded - DUAL PROVIDER with STRICT LICENSE ENFORCEMENT');// app.js - Application EmailSortPro avec authentification dual provider (Microsoft + Google) v5.0
// AVEC BLOCAGE STRICT DES LICENCES EXPIRÉES

class App {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null; // 'microsoft' ou 'google'
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.licenseBlocked = false; // Flag pour bloquer l'accès
        
        console.log('[App] Constructor - EmailSortPro starting with dual provider support and license enforcement...');
    }

    async init() {
        console.log('[App] Initializing dual provider application...');
        
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

            console.log('[App] Initializing auth services...');
            
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initialization timeout')), 30000)
            );
            
            // Initialiser les deux services d'authentification en parallèle
            const authPromises = [];
            
            if (window.authService) {
                authPromises.push(
                    window.authService.initialize().then(() => {
                        console.log('[App] ✅ Microsoft auth service initialized');
                        return 'microsoft';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Microsoft auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            if (window.googleAuthService) {
                authPromises.push(
                    window.googleAuthService.initialize().then(() => {
                        console.log('[App] ✅ Google auth service initialized');
                        return 'google';
                    }).catch(error => {
                        console.warn('[App] ⚠️ Google auth service failed:', error.message);
                        return null;
                    })
                );
            }
            
            // Attendre au moins un service d'auth
            const initResults = await Promise.race([
                Promise.allSettled(authPromises),
                initTimeout
            ]);
            
            console.log('[App] Auth services initialization results:', initResults);
            
            // IMPORTANT: Initialiser le service de licence AVANT les modules
            await this.initializeLicenseService();
            
            // INITIALISER LES MODULES CRITIQUES
            await this.initializeCriticalModules();
            
            await this.checkAuthenticationStatus();
            
        } catch (error) {
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
            this.setupEventListeners();
        }
    }

    // =====================================
    // INITIALISATION DU SERVICE DE LICENCE
    // =====================================
    async initializeLicenseService() {
        console.log('[App] Initializing license service...');
        
        if (!window.licenseService) {
            console.error('[App] License service not available!');
            this.showError('Service de licence non disponible. Veuillez recharger la page.');
            return false;
        }
        
        try {
            await window.licenseService.initialize();
            console.log('[App] ✅ License service initialized');
            return true;
        } catch (error) {
            console.error('[App] Failed to initialize license service:', error);
            this.showError('Erreur d\'initialisation du service de licence.');
            return false;
        }
    }

    // =====================================
    // INITIALISATION DES MODULES CRITIQUES
    // =====================================
    async initializeCriticalModules() {
        console.log('[App] Initializing critical modules...');
        
        // 1. Vérifier TaskManager
        await this.ensureTaskManagerReady();
        
        // 2. Vérifier PageManager
        await this.ensurePageManagerReady();
        
        // 3. Vérifier TasksView
        await this.ensureTasksViewReady();
        
        // 4. Vérifier DashboardModule
        await this.ensureDashboardModuleReady();
        
        // 5. Bind methods
        this.bindModuleMethods();
        
        // 6. Initialiser la gestion du scroll
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialized');
    }

    // =====================================
    // GESTION INTELLIGENTE DU SCROLL
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initializing scroll manager...');
        
        // Variables pour éviter les boucles infinies
        let scrollCheckInProgress = false;
        let lastScrollState = null;
        let lastContentHeight = 0;
        let lastViewportHeight = 0;
        
        // Fonction pour vérifier si le scroll est nécessaire
        this.checkScrollNeeded = () => {
            if (scrollCheckInProgress) {
                return;
            }
            
            scrollCheckInProgress = true;
            
            setTimeout(() => {
                try {
                    const body = document.body;
                    const contentHeight = document.documentElement.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const currentPage = this.currentPage || 'dashboard';
                    
                    // Vérifier si les dimensions ont réellement changé
                    const dimensionsChanged = 
                        Math.abs(contentHeight - lastContentHeight) > 10 || 
                        Math.abs(viewportHeight - lastViewportHeight) > 10;
                    
                    lastContentHeight = contentHeight;
                    lastViewportHeight = viewportHeight;
                    
                    // Dashboard: JAMAIS de scroll
                    if (currentPage === 'dashboard') {
                        const newState = 'dashboard-no-scroll';
                        if (lastScrollState !== newState) {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                            lastScrollState = newState;
                        }
                        scrollCheckInProgress = false;
                        return;
                    }
                    
                    // Autres pages: scroll seulement si vraiment nécessaire
                    const threshold = 100;
                    const needsScroll = contentHeight > viewportHeight + threshold;
                    const newState = needsScroll ? 'scroll-enabled' : 'scroll-disabled';
                    
                    if (lastScrollState !== newState || dimensionsChanged) {
                        if (needsScroll) {
                            body.classList.add('needs-scroll');
                            body.style.overflow = '';
                            body.style.overflowY = '';
                            body.style.overflowX = '';
                        } else {
                            body.classList.remove('needs-scroll');
                            body.style.overflow = 'hidden';
                            body.style.overflowY = 'hidden';
                            body.style.overflowX = 'hidden';
                        }
                        lastScrollState = newState;
                    }
                    
                } catch (error) {
                    console.error('[SCROLL_MANAGER] Error checking scroll:', error);
                } finally {
                    scrollCheckInProgress = false;
                }
            }, 150);
        };

        // Fonction pour définir le mode de page
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) {
                return;
            }
            
            const body = document.body;
            
            // Mettre à jour la page actuelle
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            // Nettoyer les anciennes classes de page
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode'
            );
            
            // Ajouter la nouvelle classe de page
            body.classList.add(`page-${pageName}`);
            
            // Réinitialiser l'état du scroll
            lastScrollState = null;
            lastContentHeight = 0;
            lastViewportHeight = 0;
            
            // Dashboard: configuration immédiate
            if (pageName === 'dashboard') {
                body.style.overflow = 'hidden';
                body.style.overflowY = 'hidden';
                body.style.overflowX = 'hidden';
                lastScrollState = 'dashboard-no-scroll';
                return;
            }
            
            // Autres pages: vérifier après stabilisation du contenu
            setTimeout(() => {
                if (this.currentPage === pageName) {
                    this.checkScrollNeeded();
                }
            }, 300);
        };

        // Observer pour les changements de contenu
        if (window.MutationObserver) {
            let observerTimeout;
            let pendingMutations = false;
            
            const contentObserver = new MutationObserver((mutations) => {
                if (this.currentPage === 'dashboard') {
                    return;
                }
                
                const significantChanges = mutations.some(mutation => {
                    if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        const target = mutation.target;
                        
                        if (attrName === 'style' && target === document.body) {
                            return false;
                        }
                        if (attrName === 'class' && target === document.body) {
                            return false;
                        }
                    }
                    
                    if (mutation.type === 'childList') {
                        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
                    }
                    
                    return false;
                });
                
                if (significantChanges && !pendingMutations) {
                    pendingMutations = true;
                    clearTimeout(observerTimeout);
                    
                    observerTimeout = setTimeout(() => {
                        if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                            this.checkScrollNeeded();
                        }
                        pendingMutations = false;
                    }, 250);
                }
            });

            contentObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
                attributeOldValue: false
            });
        }

        // Gestionnaire de redimensionnement
        let resizeTimeout;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        window.addEventListener('resize', () => {
            const currentSize = { width: window.innerWidth, height: window.innerHeight };
            
            const sizeChanged = 
                Math.abs(currentSize.width - lastWindowSize.width) > 10 ||
                Math.abs(currentSize.height - lastWindowSize.height) > 10;
            
            if (!sizeChanged || this.currentPage === 'dashboard') {
                return;
            }
            
            lastWindowSize = currentSize;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentPage !== 'dashboard' && !scrollCheckInProgress) {
                    this.checkScrollNeeded();
                }
            }, 300);
        });

        console.log('[App] ✅ Scroll manager initialized');
    }

    async ensureTaskManagerReady() {
        console.log('[App] Ensuring TaskManager is ready...');
        
        if (window.taskManager && window.taskManager.initialized) {
            console.log('[App] ✅ TaskManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while ((!window.taskManager || !window.taskManager.initialized) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.taskManager || !window.taskManager.initialized) {
            console.error('[App] TaskManager not ready after 5 seconds');
            return false;
        }
        
        const essentialMethods = ['createTaskFromEmail', 'createTask', 'updateTask', 'deleteTask', 'getStats'];
        for (const method of essentialMethods) {
            if (typeof window.taskManager[method] !== 'function') {
                console.error(`[App] TaskManager missing essential method: ${method}`);
                return false;
            }
        }
        
        console.log('[App] ✅ TaskManager ready with', window.taskManager.getAllTasks().length, 'tasks');
        return true;
    }

    async ensurePageManagerReady() {
        console.log('[App] Ensuring PageManager is ready...');
        
        if (window.pageManager) {
            console.log('[App] ✅ PageManager already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.pageManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.pageManager) {
            console.error('[App] PageManager not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ PageManager ready');
        return true;
    }

    async ensureTasksViewReady() {
        console.log('[App] Ensuring TasksView is ready...');
        
        if (window.tasksView) {
            console.log('[App] ✅ TasksView already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.tasksView && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.tasksView) {
            console.warn('[App] TasksView not ready after 3 seconds - will work without it');
            return false;
        }
        
        console.log('[App] ✅ TasksView ready');
        return true;
    }

    async ensureDashboardModuleReady() {
        console.log('[App] Ensuring DashboardModule is ready...');
        
        if (window.dashboardModule) {
            console.log('[App] ✅ DashboardModule already ready');
            return true;
        }
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (!window.dashboardModule && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.dashboardModule) {
            console.error('[App] DashboardModule not ready after 3 seconds');
            return false;
        }
        
        console.log('[App] ✅ DashboardModule ready');
        return true;
    }

    bindModuleMethods() {
        // Bind TaskManager methods
        if (window.taskManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.taskManager)).forEach(name => {
                    if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
                        window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
                    }
                });
                console.log('[App] ✅ TaskManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding TaskManager methods:', error);
            }
        }
        
        // Bind autres modules...
        if (window.pageManager) {
            try {
                Object.getOwnPropertyNames(Object.getPrototypeOf(window.pageManager)).forEach(name => {
                    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
                        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
                    }
                });
                console.log('[App] ✅ PageManager methods bound');
            } catch (error) {
                console.warn('[App] Error binding PageManager methods:', error);
            }
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

        if (!window.authService && !window.googleAuthService) {
            console.error('[App] No authentication service available');
            this.showError('Authentication service not available. Please refresh the page.');
            return false;
        }

        return true;
    }

    // =====================================
    // VÉRIFICATION DE L'AUTHENTIFICATION DUAL PROVIDER
    // =====================================
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status for both providers...');
        
        // Vérifier d'abord s'il y a un callback Google à traiter
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            // IMPORTANT: Vérifier la licence même après le callback Google
            await this.verifyLicenseAfterAuth();
            return;
        }
        
        // Vérifier Microsoft d'abord
        if (window.authService && window.authService.isAuthenticated()) {
            const account = window.authService.getAccount();
            if (account) {
                console.log('[App] Microsoft authentication found, getting user info...');
                try {
                    this.user = await window.authService.getUserInfo();
                    this.user.provider = 'microsoft';
                    this.isAuthenticated = true;
                    this.activeProvider = 'microsoft';
                    console.log('[App] ✅ Microsoft user authenticated:', this.user.displayName || this.user.mail);
                    
                    // IMPORTANT: Vérifier la licence
                    await this.verifyLicenseAfterAuth();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Microsoft user info:', userInfoError);
                    if (userInfoError.message.includes('401') || userInfoError.message.includes('403')) {
                        console.log('[App] Microsoft token seems invalid, clearing auth');
                        await window.authService.reset();
                    }
                }
            }
        }
        
        // Vérifier Google ensuite
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                console.log('[App] Google authentication found, getting user info...');
                try {
                    this.user = await window.googleAuthService.getUserInfo();
                    this.user.provider = 'google';
                    this.isAuthenticated = true;
                    this.activeProvider = 'google';
                    console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                    
                    // IMPORTANT: Vérifier la licence
                    await this.verifyLicenseAfterAuth();
                    return;
                } catch (userInfoError) {
                    console.error('[App] Error getting Google user info:', userInfoError);
                    await window.googleAuthService.reset();
                }
            }
        }
        
        // Aucune authentification trouvée
        console.log('[App] No valid authentication found');
        this.showLogin();
    }

    // =====================================
    // VÉRIFICATION DE LICENCE APRÈS AUTH
    // =====================================
    async verifyLicenseAfterAuth() {
        console.log('[App] Verifying license after authentication...');
        
        if (!this.user || !window.licenseService) {
            console.error('[App] Cannot verify license - missing user or license service');
            this.showLogin();
            return;
        }
        
        try {
            const userEmail = this.user.mail || this.user.email;
            console.log('[App] Checking license for:', userEmail);
            
            // Appeler le service de licence pour vérifier
            const licenseStatus = await window.licenseService.authenticateWithEmail(userEmail);
            
            console.log('[App] License status received:', licenseStatus);
            
            // BLOCAGE STRICT SI LICENCE EXPIRÉE
            if (!licenseStatus.valid && licenseStatus.status === 'expired') {
                console.error('[App] ❌ LICENSE EXPIRED - BLOCKING ACCESS');
                this.licenseBlocked = true;
                this.showExpiredLicenseScreen(licenseStatus);
                return;
            }
            
            // Si licence non trouvée, proposer de créer un compte d'essai
            if (licenseStatus.status === 'not_found') {
                console.log('[App] User not found in database, showing trial creation');
                this.showTrialCreationScreen(userEmail);
                return;
            }
            
            // Si licence bloquée
            if (licenseStatus.status === 'blocked') {
                console.error('[App] ❌ LICENSE BLOCKED');
                this.licenseBlocked = true;
                this.showBlockedLicenseScreen(licenseStatus);
                return;
            }
            
            // Si licence pas encore commencée
            if (licenseStatus.status === 'not_started') {
                console.log('[App] License not started yet');
                this.showNotStartedLicenseScreen(licenseStatus);
                return;
            }
            
            // Si erreur de vérification
            if (licenseStatus.status === 'error') {
                console.error('[App] License verification error');
                this.showLicenseErrorScreen(licenseStatus);
                return;
            }
            
            // LICENCE VALIDE - Continuer
            console.log('[App] ✅ License is valid, showing app');
            
            // Stocker les infos de licence dans l'utilisateur
            this.user.licenseInfo = licenseStatus;
            
            // Afficher l'avertissement si proche de l'expiration
            if (licenseStatus.warningLevel) {
                this.showLicenseWarning(licenseStatus);
            }
            
            // Afficher l'application
            this.showAppWithTransition();
            
        } catch (error) {
            console.error('[App] License verification error:', error);
            this.showLicenseErrorScreen({
                status: 'error',
                message: 'Erreur de vérification de licence',
                error: error.message
            });
        }
    }

    // =====================================
    // ÉCRANS DE BLOCAGE DE LICENCE
    // =====================================
    
    showExpiredLicenseScreen(licenseStatus) {
        console.log('[App] Showing expired license screen');
        
        const adminContact = licenseStatus.adminContact || {};
        const daysExpired = licenseStatus.daysExpired || 0;
        const accountType = licenseStatus.user?.account_type || 'professional';
        const userRole = licenseStatus.user?.role || 'user';
        const isAdmin = userRole === 'company_admin' || userRole === 'super_admin';
        
        document.body.classList.add('login-mode', 'license-blocked');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container license-expired-container">
                    <div style="max-width: 700px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #ef4444;">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Licence Expirée
                        </h1>
                        
                        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.3rem; line-height: 1.8; color: #1f2937; margin-bottom: 20px;">
                                Votre licence EmailSortPro a expiré depuis <strong>${daysExpired} jour${daysExpired > 1 ? 's' : ''}</strong>.
                            </p>
                            <p style="font-size: 1.1rem; line-height: 1.6; color: #4b5563;">
                                ${licenseStatus.detailedMessage || 'Pour continuer à utiliser EmailSortPro, veuillez renouveler votre licence.'}
                            </p>
                        </div>
                        
                        ${accountType === 'individual' || isAdmin ? `
                            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #3b82f6; margin-bottom: 15px;">
                                    <i class="fas fa-info-circle"></i> ${isAdmin ? 'Vous êtes administrateur' : 'Compte Personnel'}
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 20px;">
                                    Pour régulariser votre compte et continuer à utiliser EmailSortPro, 
                                    accédez à votre espace de gestion :
                                </p>
                                <a href="https://emailsortpro.netlify.app/analytics.html" 
                                   class="login-button" 
                                   style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                                          color: white; display: inline-flex; align-items: center; gap: 10px;
                                          padding: 15px 30px; font-size: 1.1rem;">
                                    <i class="fas fa-chart-line"></i>
                                    Accéder à l'espace de gestion
                                </a>
                            </div>
                        ` : `
                            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #f59e0b; margin-bottom: 15px;">
                                    <i class="fas fa-building"></i> Compte Professionnel
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 15px;">
                                    Contactez votre administrateur pour renouveler la licence :
                                </p>
                                <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px;">
                                    ${adminContact.email ? `
                                        <p style="margin: 8px 0;">
                                            <strong>Email administrateur :</strong> 
                                            <a href="mailto:${adminContact.email}" style="color: #3b82f6; font-size: 1.1rem;">
                                                ${adminContact.email}
                                            </a>
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        `}
                        
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
                            <button onclick="window.app.logout()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151; 
                                           border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-sign-out-alt"></i>
                                Se déconnecter
                            </button>
                            <button onclick="location.reload()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151; 
                                           border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 0.9rem; color: #6b7280;">
                            Utilisateur : ${licenseStatus.user?.email || this.user?.email || 'Non identifié'}
                        </p>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showBlockedLicenseScreen(licenseStatus) {
        console.log('[App] Showing blocked license screen');
        
        const adminContact = licenseStatus.adminContact || {};
        const userRole = licenseStatus.user?.role || 'user';
        const isAdmin = userRole === 'company_admin' || userRole === 'super_admin';
        
        document.body.classList.add('login-mode', 'license-blocked');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #dc2626;">
                            <i class="fas fa-ban"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Compte Bloqué
                        </h1>
                        
                        <div style="background: rgba(220, 38, 38, 0.1); border: 2px solid rgba(220, 38, 38, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message}
                            </p>
                        </div>
                        
                        ${isAdmin ? `
                            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #3b82f6; margin-bottom: 15px;">
                                    <i class="fas fa-info-circle"></i> Vous êtes administrateur
                                </h3>
                                <p style="font-size: 1.1rem; color: #1f2937; line-height: 1.6; margin-bottom: 20px;">
                                    Pour débloquer votre compte, accédez à votre espace de gestion :
                                </p>
                                <a href="https://emailsortpro.netlify.app/analytics.html" 
                                   class="login-button" 
                                   style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                                          color: white; display: inline-flex; align-items: center; gap: 10px;
                                          padding: 15px 30px; font-size: 1.1rem;">
                                    <i class="fas fa-chart-line"></i>
                                    Accéder à l'espace de gestion
                                </a>
                            </div>
                        ` : adminContact.email ? `
                            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); 
                                        padding: 25px; border-radius: 15px; margin: 30px 0;">
                                <h3 style="color: #f59e0b; margin-bottom: 15px;">Contact administrateur</h3>
                                <div style="background: white; padding: 20px; border-radius: 10px;">
                                    <p>
                                        <strong>Email administrateur :</strong> 
                                        <a href="mailto:${adminContact.email}" style="color: #3b82f6; font-size: 1.1rem;">
                                            ${adminContact.email}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        ` : ''}
                        
                        <button onclick="window.app.logout()" class="login-button" 
                                style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                            <i class="fas fa-sign-out-alt"></i>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showNotStartedLicenseScreen(licenseStatus) {
        console.log('[App] Showing not started license screen');
        
        const startDate = new Date(licenseStatus.startsAt).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #fbbf24;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Licence Non Active
                        </h1>
                        
                        <div style="background: rgba(251, 191, 36, 0.1); border: 2px solid rgba(251, 191, 36, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message}
                            </p>
                            <p style="font-size: 1.1rem; margin-top: 15px; color: #f59e0b; font-weight: 600;">
                                Date d'activation : ${startDate}
                            </p>
                        </div>
                        
                        <button onclick="window.app.logout()" class="login-button" 
                                style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                            <i class="fas fa-sign-out-alt"></i>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showLicenseErrorScreen(licenseStatus) {
        console.log('[App] Showing license error screen');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #ef4444;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Erreur de Licence
                        </h1>
                        
                        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">
                                ${licenseStatus.message || 'Une erreur s\'est produite lors de la vérification de votre licence.'}
                            </p>
                            ${licenseStatus.error ? `
                                <p style="font-size: 0.9rem; margin-top: 15px; color: #6b7280;">
                                    Détails : ${licenseStatus.error}
                                </p>
                            ` : ''}
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Réessayer
                            </button>
                            <button onclick="window.app.logout()" class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                                <i class="fas fa-sign-out-alt"></i>
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    showTrialCreationScreen(email) {
        console.log('[App] Showing trial creation screen for:', email);
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 700px; margin: 0 auto; text-align: center;">
                        <div style="font-size: 5rem; margin-bottom: 30px; color: #10b981;">
                            <i class="fas fa-gift"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">
                            Bienvenue sur EmailSortPro !
                        </h1>
                        
                        <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.3); 
                                    padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937; margin-bottom: 20px;">
                                Vous n'avez pas encore de compte EmailSortPro.
                            </p>
                            <p style="font-size: 1.1rem; color: #10b981; font-weight: 600;">
                                Créez votre compte et profitez de 15 jours d'essai gratuit !
                            </p>
                        </div>
                        
                        <div id="accountTypeSelection" style="margin: 30px 0;">
                            <h3 style="margin-bottom: 20px; color: #1f2937;">
                                Choisissez votre type de compte :
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 500px; margin: 0 auto;">
                                <button onclick="window.app.createTrialAccount('individual')" 
                                        class="account-type-button">
                                    <i class="fas fa-user" style="font-size: 3rem; margin-bottom: 15px; color: #3b82f6;"></i>
                                    <h4 style="margin-bottom: 8px;">Personnel</h4>
                                    <p style="font-size: 0.9rem; color: #6b7280;">Pour un usage individuel</p>
                                </button>
                                
                                <button onclick="window.app.createTrialAccount('professional')" 
                                        class="account-type-button">
                                    <i class="fas fa-building" style="font-size: 3rem; margin-bottom: 15px; color: #8b5cf6;"></i>
                                    <h4 style="margin-bottom: 8px;">Professionnel</h4>
                                    <p style="font-size: 0.9rem; color: #6b7280;">Pour votre entreprise</p>
                                </button>
                            </div>
                        </div>
                        
                        <div id="companyNameSection" style="display: none; margin: 30px auto; max-width: 400px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1f2937;">
                                Nom de votre entreprise :
                            </label>
                            <input type="text" 
                                   id="companyNameInput" 
                                   class="login-input" 
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; 
                                          border-radius: 10px; font-size: 1rem;"
                                   placeholder="Entrez le nom de votre entreprise">
                            <button onclick="window.app.confirmTrialCreation()" 
                                    class="login-button" 
                                    style="margin-top: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-check"></i>
                                Créer mon compte d'essai
                            </button>
                        </div>
                        
                        <div style="margin-top: 40px;">
                            <button onclick="window.app.logout()" 
                                    class="login-button" 
                                    style="background: rgba(107, 114, 128, 0.2); color: #374151;">
                                <i class="fas fa-arrow-left"></i>
                                Retour
                            </button>
                        </div>
                    </div>
                </div>
                
                <style>
                    .account-type-button {
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 15px;
                        padding: 30px 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                    }
                    
                    .account-type-button:hover {
                        border-color: #3b82f6;
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .account-type-button h4 {
                        font-size: 1.2rem;
                        color: #1f2937;
                    }
                </style>
            `;
        }
        
        this.hideModernLoading();
        
        // Stocker l'email pour la création
        this.pendingTrialEmail = email;
    }

    showLicenseWarning(licenseStatus) {
        if (!window.uiManager) return;
        
        const daysRemaining = licenseStatus.daysRemaining;
        let message = '';
        let type = 'info';
        
        if (licenseStatus.warningLevel === 'critical') {
            message = `⚠️ Attention : Votre licence expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} !`;
            type = 'error';
        } else if (licenseStatus.warningLevel === 'warning') {
            message = `⏰ Votre licence expire dans ${daysRemaining} jours.`;
            type = 'warning';
        } else if (licenseStatus.warningLevel === 'info') {
            message = `ℹ️ Votre licence expire dans ${daysRemaining} jours.`;
            type = 'info';
        }
        
        if (message) {
            window.uiManager.showToast(message, type, 10000);
        }
    }

    // =====================================
    // CRÉATION DE COMPTE D'ESSAI
    // =====================================
    
    async createTrialAccount(accountType) {
        console.log('[App] Creating trial account:', accountType);
        
        this.pendingAccountType = accountType;
        
        if (accountType === 'professional') {
            // Afficher le champ nom d'entreprise
            document.getElementById('accountTypeSelection').style.display = 'none';
            document.getElementById('companyNameSection').style.display = 'block';
        } else {
            // Créer directement le compte personnel
            await this.confirmTrialCreation();
        }
    }

    async confirmTrialCreation() {
        console.log('[App] Confirming trial creation');
        
        const accountType = this.pendingAccountType;
        const email = this.pendingTrialEmail;
        let companyName = null;
        
        if (accountType === 'professional') {
            companyName = document.getElementById('companyNameInput')?.value.trim();
            if (!companyName) {
                alert('Veuillez entrer le nom de votre entreprise');
                return;
            }
        }
        
        this.showModernLoading('Création de votre compte d\'essai...');
        
        try {
            const result = await window.licenseService.createUserWithTrial(
                email,
                accountType,
                companyName
            );
            
            if (result.success) {
                console.log('[App] Trial account created successfully');
                
                // Réauthentifier pour obtenir les nouvelles infos
                const licenseStatus = await window.licenseService.authenticateWithEmail(email);
                
                if (licenseStatus.valid) {
                    this.user.licenseInfo = licenseStatus;
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            '🎉 Compte créé avec succès ! Profitez de vos 15 jours d\'essai gratuit.',
                            'success',
                            8000
                        );
                    }
                    
                    setTimeout(() => {
                        this.showAppWithTransition();
                    }, 1000);
                } else {
                    throw new Error('Erreur lors de la validation du compte créé');
                }
            } else {
                throw new Error(result.error || 'Erreur lors de la création du compte');
            }
            
        } catch (error) {
            console.error('[App] Trial creation error:', error);
            this.hideModernLoading();
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur : ' + error.message,
                    'error',
                    8000
                );
            } else {
                alert('Erreur : ' + error.message);
            }
        }
    }

    // =====================================
    // GESTION DU CALLBACK GOOGLE OAuth2
    // =====================================
    async handleGoogleCallback() {
        console.log('[App] Handling Google OAuth2 callback...');
        
        try {
            // Vérifier s'il y a des données de callback Google
            const callbackDataStr = sessionStorage.getItem('google_callback_data');
            if (!callbackDataStr) {
                console.log('[App] No Google callback data found');
                return false;
            }
            
            const callbackData = JSON.parse(callbackDataStr);
            console.log('[App] Found Google callback data:', callbackData);
            
            // Nettoyer les données de callback
            sessionStorage.removeItem('google_callback_data');
            
            // Traiter le callback avec le service Google
            const urlParams = new URLSearchParams();
            urlParams.set('code', callbackData.code);
            urlParams.set('state', callbackData.state);
            
            const success = await window.googleAuthService.handleOAuthCallback(urlParams);
            
            if (success) {
                console.log('[App] ✅ Google callback handled successfully');
                
                // Obtenir les informations utilisateur
                this.user = await window.googleAuthService.getUserInfo();
                this.user.provider = 'google';
                this.isAuthenticated = true;
                this.activeProvider = 'google';
                
                console.log('[App] ✅ Google user authenticated:', this.user.displayName || this.user.email);
                return true;
            } else {
                throw new Error('Google callback processing failed');
            }
            
        } catch (error) {
            console.error('[App] ❌ Error handling Google callback:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur de traitement Google: ' + error.message,
                    'error',
                    8000
                );
            }
            
            return false;
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

    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // NAVIGATION CORRIGÉE
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                // Vérifier si l'accès est bloqué
                if (this.licenseBlocked) {
                    console.warn('[App] Navigation blocked - license expired');
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            '❌ Accès bloqué - Licence expirée',
                            'error'
                        );
                    }
                    return;
                }
                
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

        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
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
            
            if (event.reason && event.reason.message && 
                event.reason.message.includes('Cannot read properties of undefined')) {
                
                if (event.reason.message.includes('createTaskFromEmail')) {
                    console.error('[App] TaskManager createTaskFromEmail error detected');
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur du gestionnaire de tâches. Veuillez actualiser la page.',
                            'warning'
                        );
                    }
                }
            }
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });
    }

    // =====================================
    // MÉTHODES DE CONNEXION DUAL PROVIDER
    // =====================================

    // Méthode de connexion unifiée (backward compatibility)
    async login() {
        console.log('[App] Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    // Connexion Microsoft spécifique
    async loginMicrosoft() {
        console.log('[App] Microsoft login attempted...');
        
        try {
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService.isInitialized) {
                console.log('[App] Microsoft AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Microsoft login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Microsoft. Veuillez réessayer.';
            
            if (error.errorCode) {
                const errorCode = error.errorCode;
                if (window.AppConfig.errors && window.AppConfig.errors[errorCode]) {
                    errorMessage = window.AppConfig.errors[errorCode];
                } else {
                    switch (errorCode) {
                        case 'popup_window_error':
                            errorMessage = 'Popup bloqué. Autorisez les popups pour Outlook et réessayez.';
                            break;
                        case 'user_cancelled':
                            errorMessage = 'Connexion Outlook annulée.';
                            break;
                        case 'network_error':
                            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                            break;
                        case 'unauthorized_client':
                            errorMessage = 'Configuration incorrecte. Vérifiez votre Azure Client ID.';
                            break;
                        default:
                            errorMessage = `Erreur Microsoft: ${errorCode}`;
                    }
                }
            } else if (error.message.includes('unauthorized_client')) {
                errorMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    // Connexion Google spécifique - SANS IFRAME
    async loginGoogle() {
        console.log('[App] Google login attempted...');
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService.isInitialized) {
                console.log('[App] Google AuthService not initialized, initializing...');
                await window.googleAuthService.initialize();
            }
            
            // Le service Google redirige automatiquement, pas besoin d'attendre
            await window.googleAuthService.login();
            
            // Cette ligne ne sera jamais atteinte car login() redirige
            console.log('[App] This should not be reached due to redirect');
            
        } catch (error) {
            console.error('[App] Google login error:', error);
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Gmail. Veuillez réessayer.';
            
            if (error.message) {
                if (error.message.includes('cookies')) {
                    errorMessage = 'Cookies tiers bloqués. Autorisez les cookies pour accounts.google.com et réessayez.';
                } else if (error.message.includes('domain') || error.message.includes('origin')) {
                    errorMessage = 'Erreur de domaine Gmail. Vérifiez la configuration Google Console.';
                } else if (error.message.includes('client')) {
                    errorMessage = 'Configuration Google incorrecte. Vérifiez votre Client ID.';
                } else {
                    errorMessage = `Erreur Gmail: ${error.message}`;
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            // Déconnexion selon le provider actif
            if (this.activeProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else {
                // Fallback: essayer les deux
                if (window.authService) {
                    try { await window.authService.logout(); } catch (e) {}
                }
                if (window.googleAuthService) {
                    try { await window.googleAuthService.logout(); } catch (e) {}
                }
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
        console.log('[App] Force cleanup dual provider...');
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.licenseBlocked = false;
        
        // Nettoyer les deux services d'authentification
        if (window.authService) {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService) {
            window.googleAuthService.forceCleanup();
        }
        
        // Nettoyer le service de licence
        if (window.licenseService) {
            window.licenseService.reset();
        }
        
        // Nettoyer le localStorage sélectivement
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
        
        // Nettoyer sessionStorage aussi
        try {
            sessionStorage.removeItem('google_callback_data');
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('direct_token_data');
        } catch (e) {
            console.warn('[App] Error cleaning sessionStorage:', e);
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLogin() {
        console.log('[App] Showing login page');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active', 'license-blocked');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    showAppWithTransition() {
        console.log('[App] Showing application with transition - Provider:', this.activeProvider);
        
        // Vérifier une dernière fois si la licence est bloquée
        if (this.licenseBlocked) {
            console.error('[App] Cannot show app - license is blocked!');
            return;
        }
        
        this.hideModernLoading();
        
        // Retirer le mode login et activer le mode app
        document.body.classList.remove('login-mode', 'license-blocked');
        document.body.classList.add('app-active');
        console.log('[App] App mode activated');
        
        // Afficher les éléments
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        }
        
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
            console.log('[App] Header displayed');
        }
        
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
            console.log('[App] Navigation displayed');
        }
        
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        }
        
        // Mettre à jour l'interface utilisateur avec le provider
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Mettre à jour l'affichage utilisateur avec badge provider ET info licence
        if (window.updateUserDisplay) {
            const userWithLicense = {
                ...this.user,
                licenseInfo: this.user.licenseInfo
            };
            window.updateUserDisplay(userWithLicense);
        }
        
        // INITIALISATION DASHBOARD VIA MODULE
        this.currentPage = 'dashboard';
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        // Forcer immédiatement pas de scroll pour le dashboard
        document.body.style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';
        console.log('[App] Dashboard scroll forcé à hidden');
        
        // CHARGER LE DASHBOARD VIA LE MODULE
        if (window.dashboardModule) {
            console.log('[App] Loading dashboard via dashboardModule...');
            setTimeout(() => {
                window.dashboardModule.render();
                console.log('[App] Dashboard loaded via module for provider:', this.activeProvider);
            }, 100);
        } else {
            console.warn('[App] Dashboard module not available, will retry...');
            setTimeout(() => {
                if (window.dashboardModule) {
                    window.dashboardModule.render();
                }
            }, 500);
        }
        
        // Forcer l'affichage avec CSS
        this.forceAppDisplay();
        
        console.log(`[App] ✅ Application fully displayed with ${this.activeProvider} provider`);
    }

    forceAppDisplay() {
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
            body.license-blocked .app-header,
            body.license-blocked .app-nav,
            body.license-blocked #pageContent {
                display: none !important;
            }
        `;
        
        const oldStyle = document.getElementById('force-app-display');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(forceDisplayStyle);
        console.log('[App] Force display CSS injected');
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
        }
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Erreur d'application</h1>
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0;">
                            <p style="font-size: 1.2rem; line-height: 1.6; color: #1f2937;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" class="login-button">
                                <i class="fas fa-refresh"></i>
                                Actualiser la page
                            </button>
                            <button onclick="window.app.forceCleanup()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
            loginPage.style.display = 'flex';
        }
        
        this.hideModernLoading();
    }

    showConfigurationError(issues) {
        console.error('[App] Configuration error:', issues);
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.innerHTML = `
                <div class="login-container">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center; color: #1f2937;">
                        <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #1f2937;">Configuration requise</h1>
                        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: left;">
                            <h3 style="color: #fbbf24; margin-bottom: 15px;">Problèmes détectés :</h3>
                            <ul style="margin-left: 20px;">
                                ${issues.map(issue => `<li style="margin: 8px 0;">${issue}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(251, 191, 36, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px;">Pour résoudre :</h4>
                                <ol style="margin-left: 20px;">
                                    <li>Cliquez sur "Configurer l'application"</li>
                                    <li>Suivez l'assistant de configuration</li>
                                    <li>Entrez vos Client IDs Azure et Google</li>
                                </ol>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="setup.html" class="login-button" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white;">
                                <i class="fas fa-cog"></i>
                                Configurer l'application
                            </a>
                            <button onclick="location.reload()" class="login-button" style="background: rgba(107, 114, 128, 0.2); color: #374151; border: 1px solid rgba(107, 114, 128, 0.3);">
                                <i class="fas fa-refresh"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.hideModernLoading();
    }

    // =====================================
    // DIAGNOSTIC ET INFORMATIONS DUAL PROVIDER
    // =====================================
    getDiagnosticInfo() {
        return {
            isAuthenticated: this.isAuthenticated,
            activeProvider: this.activeProvider,
            licenseBlocked: this.licenseBlocked,
            user: this.user ? {
                name: this.user.displayName || this.user.name,
                email: this.user.mail || this.user.email,
                provider: this.user.provider,
                licenseInfo: this.user.licenseInfo
            } : null,
            currentPage: this.currentPage,
            isInitialized: !this.isInitializing,
            microsoftAuthService: window.authService ? {
                isInitialized: window.authService.isInitialized,
                isAuthenticated: window.authService.isAuthenticated()
            } : null,
            googleAuthService: window.googleAuthService ? {
                isInitialized: window.googleAuthService.isInitialized,
                isAuthenticated: window.googleAuthService.isAuthenticated(),
                method: 'Direct OAuth2 (sans iframe)',
                avoidsiFrameError: true
            } : null,
            licenseService: window.licenseService ? {
                initialized: window.licenseService.initialized,
                hasCurrentUser: !!window.licenseService.currentUser
            } : null,
            services: window.checkServices ? window.checkServices() : null,
            googleCallbackData: sessionStorage.getItem('google_callback_data'),
            sessionData: {
                googleCallback: !!sessionStorage.getItem('google_callback_data'),
                googleToken: !!localStorage.getItem('google_token_emailsortpro'),
                directToken: !!sessionStorage.getItem('direct_token_data')
            }
        };
    }
}

// =====================================
// FONCTIONS GLOBALES D'URGENCE DUAL PROVIDER
// =====================================

window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered for dual provider');
    
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
    
    // Nettoyer sessionStorage
    try {
        sessionStorage.clear();
    } catch (e) {
        console.warn('[Emergency] Error clearing sessionStorage:', e);
    }
    
    window.location.reload();
};

window.forceShowApp = function() {
    console.log('[Global] Force show app triggered');
    if (window.app && typeof window.app.showAppWithTransition === 'function') {
        // Vérifier si la licence est bloquée
        if (window.app.licenseBlocked) {
            console.error('[Global] Cannot force show app - license is blocked');
            return;
        }
        window.app.showAppWithTransition();
    } else {
        document.body.classList.add('app-active');
        document.body.classList.remove('login-mode', 'license-blocked');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        if (window.dashboardModule) {
            window.dashboardModule.render();
        }
    }
};

// =====================================
// VÉRIFICATION DES SERVICES DUAL PROVIDER
// =====================================
function checkServicesReady() {
    const requiredServices = ['uiManager', 'licenseService'];
    const authServices = ['authService', 'googleAuthService'];
    const optionalServices = ['mailService', 'emailScanner', 'categoryManager', 'dashboardModule'];
    
    const missingRequired = requiredServices.filter(service => !window[service]);
    const availableAuthServices = authServices.filter(service => window[service]);
    const missingOptional = optionalServices.filter(service => !window[service]);
    
    if (missingRequired.length > 0) {
        console.error('[App] Missing REQUIRED services:', missingRequired);
        return false;
    }
    
    if (availableAuthServices.length === 0) {
        console.error('[App] No authentication services available:', authServices);
        return false;
    }
    
    if (missingOptional.length > 0) {
        console.warn('[App] Missing optional services:', missingOptional);
    }
    
    if (!window.AppConfig) {
        console.error('[App] Missing AppConfig');
        return false;
    }
    
    console.log('[App] Available auth services:', availableAuthServices);
    return true;
}

// =====================================
// INITIALISATION PRINCIPALE DUAL PROVIDER
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating dual provider app instance with license enforcement...');
    
    document.body.classList.add('login-mode');
    
    window.app = new App();
    
    const waitForServices = (attempts = 0) => {
        const maxAttempts = 50;
        
        if (checkServicesReady()) {
            console.log('[App] All required services ready, initializing dual provider app...');
            
            setTimeout(() => {
                window.app.init();
            }, 100);
        } else if (attempts < maxAttempts) {
            console.log(`[App] Waiting for services... (${attempts + 1}/${maxAttempts})`);
            setTimeout(() => waitForServices(attempts + 1), 100);
        } else {
            console.error('[App] Timeout waiting for services, initializing anyway...');
            setTimeout(() => {
                window.app.init();
            }, 100);
        }
    };
    
    waitForServices();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) {
            console.error('[App] App instance not created, creating fallback...');
            document.body.classList.add('login-mode');
            window.app = new App();
            window.app.init();
        } else if (!window.app.isAuthenticated && !window.app.isInitializing) {
            console.log('[App] Fallback initialization check...');
            
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.style.display === 'none') {
                loginPage.style.display = 'flex';
                document.body.classList.add('login-mode');
            }
        }
    }, 5000);
});

// =====================================
// DIAGNOSTIC GLOBAL DUAL PROVIDER
// =====================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION DUAL PROVIDER - EmailSortPro');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            console.log('📱 App Status:', appDiag);
            
            // Services
            if (appDiag.services) {
                console.log('🛠️ Services:', appDiag.services);
            }
            
            // License Service
            if (appDiag.licenseService) {
                console.log('🔐 License Service:', appDiag.licenseService);
            }
            
            // Microsoft
            if (appDiag.microsoftAuthService) {
                console.log('🔵 Microsoft Auth:', appDiag.microsoftAuthService);
            }
            
            // Google
            if (appDiag.googleAuthService) {
                console.log('🔴 Google Auth:', appDiag.googleAuthService);
            }
            
            // Session Data
            if (appDiag.sessionData) {
                console.log('💾 Session Data:', appDiag.sessionData);
            }
            
            // License Status
            if (appDiag.user && appDiag.user.licenseInfo) {
                console.log('📋 License Info:', appDiag.user.licenseInfo);
            }
            
            return appDiag;
        } else {
            console.log('❌ App instance not available');
            return { error: 'App instance not available' };
        }
    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ App v5.0 loaded - DUAL PROVIDER with STRICT LICENSE ENFORCEMENT');
