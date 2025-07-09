// app.js - Application EmailSortPro avec intégration de licence v5.1
// Correction du chargement de startscan.js pour Gmail

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
        this.netlifyDomain = 'emailsortpro.netlify.app';
        this.isNetlifyEnv = window.location.hostname.includes('netlify.app');
        
        // Nouveau: État de la licence
        this.licenseStatus = null;
        this.isLicenseChecked = false;
        
        console.log('[App] Constructor - EmailSortPro v5.1 with proper scanner loading...');
        console.log('[App] Environment:', this.isNetlifyEnv ? 'Netlify' : 'Local');
        console.log('[App] Domain:', window.location.hostname);
        
        // Initialiser Analytics Manager immédiatement
        this.initializeAnalytics();
    }

    // =====================================
    // INITIALISATION ANALYTICS AVEC CAPTURE D'EMAIL
    // =====================================
    initializeAnalytics() {
        console.log('[App] Initializing analytics with email tracking...');
        
        try {
            // Vérifier si l'analytics manager est disponible
            if (window.analyticsManager) {
                console.log('[App] ✅ Analytics manager ready');
                
                // Track page load event
                window.analyticsManager.onPageLoad('index');
                
                console.log('[App] ✅ Analytics initialized successfully');
            } else {
                console.warn('[App] Analytics manager not available yet, will retry...');
                
                // Retry après un délai
                setTimeout(() => {
                    if (window.analyticsManager) {
                        console.log('[App] ✅ Analytics manager now available');
                        window.analyticsManager.onPageLoad('index');
                    } else {
                        console.warn('[App] Analytics manager still not available');
                    }
                }, 1000);
            }
        } catch (error) {
            console.warn('[App] Error initializing analytics:', error);
        }
    }

    async init() {
        console.log('[App] Initializing dual provider application with license check...');
        
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

            // Initialiser le service de licence
            await this.initializeLicenseService();

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
        
        try {
            if (!window.licenseService) {
                console.error('[App] License service not available');
                return false;
            }
            
            await window.licenseService.initialize();
            console.log('[App] ✅ License service initialized');
            return true;
            
        } catch (error) {
            console.error('[App] Error initializing license service:', error);
            return false;
        }
    }

    // =====================================
    // VÉRIFICATION DE LA LICENCE APRÈS AUTHENTIFICATION
    // =====================================
    async checkUserLicense(email) {
        console.log('[App] Checking user license for:', email);
        
        try {
            if (!window.licenseService) {
                console.error('[App] License service not available');
                return { valid: true, status: 'error', message: 'Service de licence indisponible' };
            }
            
            const licenseResult = await window.licenseService.authenticateWithEmail(email);
            this.licenseStatus = licenseResult;
            this.isLicenseChecked = true;
            
            console.log('[App] License status:', licenseResult);
            
            // Si la licence est expirée et ce n'est pas un admin
            if (!licenseResult.valid && licenseResult.status === 'expired' && licenseResult.blockAccess) {
                console.warn('[App] ❌ License expired - checking admin status');
                
                // Vérifier si c'est un admin
                const user = licenseResult.user;
                if (user && (user.role === 'super_admin' || user.role === 'company_admin')) {
                    console.log('[App] Admin user detected - allowing access to analytics');
                    licenseResult.valid = true;
                    licenseResult.adminAccess = true;
                    licenseResult.message = 'Accès administrateur - Licence expirée';
                }
            }
            
            return licenseResult;
            
        } catch (error) {
            console.error('[App] Error checking license:', error);
            return {
                valid: true,
                status: 'error',
                message: 'Erreur lors de la vérification de la licence',
                error: error.message
            };
        }
    }

    // =====================================
    // VÉRIFICATION DE L'AUTHENTIFICATION AVEC LICENCE
    // =====================================
    async checkAuthenticationStatus() {
        console.log('[App] Checking authentication status for both providers...');
        
        // Vérifier d'abord s'il y a un callback Google à traiter
        const googleCallbackHandled = await this.handleGoogleCallback();
        if (googleCallbackHandled) {
            // La vérification de licence sera faite dans handleGoogleCallback
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
                    
                    // VÉRIFIER LA LICENCE
                    const licenseResult = await this.checkUserLicense(this.user.mail || this.user.userPrincipalName);
                    
                    if (!licenseResult.valid && licenseResult.blockAccess) {
                        this.showLicenseExpiredPage(licenseResult);
                        return;
                    }
                    
                    // ANALYTICS: Track authentication avec email en clair
                    this.trackUserAuthentication(this.user);
                    
                    console.log('[App] ✅ Microsoft user authenticated with valid license:', this.user.displayName || this.user.mail);
                    this.showAppWithTransition();
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
                    
                    // VÉRIFIER LA LICENCE
                    const licenseResult = await this.checkUserLicense(this.user.email);
                    
                    if (!licenseResult.valid && licenseResult.blockAccess) {
                        this.showLicenseExpiredPage(licenseResult);
                        return;
                    }
                    
                    // ANALYTICS: Track authentication avec email en clair
                    this.trackUserAuthentication(this.user);
                    
                    console.log('[App] ✅ Google user authenticated with valid license:', this.user.displayName || this.user.email);
                    this.showAppWithTransition();
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
    // AFFICHAGE DE LA PAGE LICENCE EXPIRÉE
    // =====================================
    showLicenseExpiredPage(licenseResult) {
        console.log('[App] Showing license expired page');
        
        // ANALYTICS: Track license expired
        this.trackEvent('license_expired', {
            userEmail: licenseResult.user?.email || 'unknown',
            daysExpired: licenseResult.daysExpired || 0,
            isAdmin: licenseResult.user?.role === 'super_admin' || licenseResult.user?.role === 'company_admin'
        });
        
        // Masquer le loading
        this.hideModernLoading();
        
        // Retirer le mode login et afficher la page d'expiration
        document.body.classList.remove('login-mode', 'app-active');
        document.body.classList.add('license-expired-mode');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        // Créer et afficher la page d'expiration
        const expiredPage = document.createElement('div');
        expiredPage.id = 'licenseExpiredPage';
        expiredPage.className = 'license-expired-page';
        
        const adminContact = licenseResult.adminContact || {
            email: 'support@emailsortpro.com',
            name: 'Support EmailSortPro'
        };
        
        const isAdmin = licenseResult.user && (
            licenseResult.user.role === 'super_admin' || 
            licenseResult.user.role === 'company_admin'
        );
        
        expiredPage.innerHTML = `
            <div class="license-expired-container">
                <div class="license-expired-card">
                    <div class="license-expired-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h1 class="license-expired-title">Licence Expirée</h1>
                    
                    <div class="license-expired-message">
                        <p>${licenseResult.detailedMessage || licenseResult.message}</p>
                        ${licenseResult.daysExpired ? `
                            <p class="days-expired">Votre licence a expiré il y a <strong>${licenseResult.daysExpired} jour${licenseResult.daysExpired > 1 ? 's' : ''}</strong></p>
                        ` : ''}
                    </div>
                    
                    <div class="license-expired-actions">
                        ${isAdmin ? `
                            <div class="admin-notice">
                                <i class="fas fa-user-shield"></i>
                                <p>En tant qu'administrateur, vous avez accès au système de gestion des licences</p>
                            </div>
                            <a href="https://emailsortpro.netlify.app/analytics.html" class="btn btn-primary">
                                <i class="fas fa-chart-line"></i>
                                Accéder au système de licences
                            </a>
                        ` : `
                            <div class="contact-admin">
                                <h3>Contactez votre administrateur</h3>
                                <div class="admin-info">
                                    <div class="admin-detail">
                                        <i class="fas fa-user"></i>
                                        <span>${adminContact.name}</span>
                                    </div>
                                    <div class="admin-detail">
                                        <i class="fas fa-envelope"></i>
                                        <a href="mailto:${adminContact.email}">${adminContact.email}</a>
                                    </div>
                                    ${adminContact.phone ? `
                                        <div class="admin-detail">
                                            <i class="fas fa-phone"></i>
                                            <a href="tel:${adminContact.phone}">${adminContact.phone}</a>
                                        </div>
                                    ` : ''}
                                </div>
                                ${adminContact.fallbackEmail ? `
                                    <p class="fallback-contact">
                                        Ou contactez le support : 
                                        <a href="mailto:${adminContact.fallbackEmail}">${adminContact.fallbackEmail}</a>
                                    </p>
                                ` : ''}
                            </div>
                        `}
                        
                        <button onclick="window.app.logout()" class="btn btn-secondary">
                            <i class="fas fa-sign-out-alt"></i>
                            Se déconnecter
                        </button>
                    </div>
                    
                    <div class="license-expired-footer">
                        <p>Utilisateur : <strong>${licenseResult.user?.email}</strong></p>
                        ${licenseResult.user?.company?.name ? `
                            <p>Société : <strong>${licenseResult.user.company.name}</strong></p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les styles CSS
        if (!document.getElementById('license-expired-styles')) {
            const styles = document.createElement('style');
            styles.id = 'license-expired-styles';
            styles.textContent = `
                .license-expired-mode {
                    overflow: hidden;
                }
                
                .license-expired-page {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .license-expired-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .license-expired-card {
                    background: white;
                    border-radius: 20px;
                    padding: 48px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    text-align: center;
                }
                
                .license-expired-icon {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 24px;
                    background: #fee2e2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    color: #dc2626;
                    animation: pulse-icon 2s ease-in-out infinite;
                }
                
                @keyframes pulse-icon {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                
                .license-expired-title {
                    font-size: 2.5rem;
                    color: #1f2937;
                    margin-bottom: 16px;
                    font-weight: 700;
                }
                
                .license-expired-message {
                    color: #4b5563;
                    font-size: 1.125rem;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                
                .license-expired-message p {
                    margin-bottom: 12px;
                }
                
                .days-expired {
                    color: #dc2626;
                    font-size: 1rem;
                    margin-top: 16px;
                }
                
                .admin-notice {
                    background: #dbeafe;
                    border: 1px solid #93c5fd;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-align: left;
                }
                
                .admin-notice i {
                    font-size: 24px;
                    color: #2563eb;
                }
                
                .admin-notice p {
                    color: #1e40af;
                    margin: 0;
                    flex: 1;
                }
                
                .contact-admin {
                    background: #f3f4f6;
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    text-align: left;
                }
                
                .contact-admin h3 {
                    color: #1f2937;
                    margin-bottom: 16px;
                    font-size: 1.25rem;
                }
                
                .admin-info {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .admin-detail {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #4b5563;
                }
                
                .admin-detail i {
                    width: 20px;
                    color: #6b7280;
                }
                
                .admin-detail a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .admin-detail a:hover {
                    text-decoration: underline;
                }
                
                .fallback-contact {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                
                .license-expired-actions {
                    margin: 32px 0;
                }
                
                .license-expired-actions .btn {
                    margin: 8px;
                    padding: 12px 24px;
                    font-size: 1rem;
                }
                
                .license-expired-footer {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                
                .license-expired-footer p {
                    margin: 4px 0;
                }
                
                @media (max-width: 640px) {
                    .license-expired-card {
                        padding: 32px 24px;
                    }
                    
                    .license-expired-title {
                        font-size: 2rem;
                    }
                    
                    .license-expired-icon {
                        width: 100px;
                        height: 100px;
                        font-size: 50px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Ajouter la page au DOM
        document.body.appendChild(expiredPage);
    }

    // =====================================
    // INITIALISATION DES MODULES CRITIQUES (CORRIGÉE)
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
        
        // 5. Vérifier MailService avec fallback
        await this.ensureMailServiceReady();
        
        // 6. NE PAS CRÉER DE FALLBACK POUR SCAN - Laisser startscan.js se charger
        console.log('[App] Skipping scan module fallback - letting startscan.js handle it');
        
        // 7. Bind methods
        this.bindModuleMethods();
        
        // 8. Initialiser la gestion du scroll
        this.initializeScrollManager();
        
        console.log('[App] Critical modules initialized');
    }

    // =====================================
    // TRACKING ANALYTICS AVEC EMAIL EN CLAIR
    // =====================================
    trackUserAuthentication(user) {
        console.log('[App] Tracking user authentication for analytics...');
        
        if (!window.analyticsManager || typeof window.analyticsManager.trackAuthentication !== 'function') {
            console.warn('[App] Analytics manager not available for authentication tracking');
            return;
        }
        
        try {
            // Préparer les données utilisateur avec email en clair
            const userInfo = {
                displayName: user.displayName || user.name || 'Utilisateur',
                mail: user.mail || user.email || user.userPrincipalName,
                userPrincipalName: user.userPrincipalName || user.email,
                email: user.email || user.mail || user.userPrincipalName, // Email explicite
                provider: user.provider || 'unknown',
                // Ajouter les infos de licence
                licenseStatus: this.licenseStatus?.status || 'unknown',
                licenseValid: this.licenseStatus?.valid || false,
                // Données supplémentaires si disponibles
                homeAccountId: user.homeAccountId,
                localAccountId: user.localAccountId,
                tenantId: user.tenantId
            };
            
            console.log('[App] ✅ Tracking authentication with email:', {
                email: userInfo.email,
                name: userInfo.displayName,
                provider: userInfo.provider,
                licenseStatus: userInfo.licenseStatus
            });
            
            // Appeler la méthode de tracking
            window.analyticsManager.trackAuthentication(userInfo.provider, userInfo);
            
            console.log('[App] ✅ Authentication tracked successfully in analytics');
            
        } catch (error) {
            console.warn('[App] Error tracking authentication:', error);
        }
    }

    // =====================================
    // TRACKING D'ÉVÉNEMENTS ANALYTICS
    // =====================================
    trackEvent(eventType, eventData = {}) {
        if (!window.analyticsManager || typeof window.analyticsManager.trackEvent !== 'function') {
            return;
        }
        
        try {
            // Ajouter automatiquement les infos utilisateur si disponibles
            const enrichedData = {
                ...eventData,
                userEmail: this.user?.email || this.user?.mail || 'anonymous',
                userName: this.user?.displayName || this.user?.name || 'Anonymous',
                provider: this.activeProvider || 'unknown',
                licenseStatus: this.licenseStatus?.status || 'unknown'
            };
            
            window.analyticsManager.trackEvent(eventType, enrichedData);
            console.log('[App] ✅ Event tracked:', eventType, enrichedData);
        } catch (error) {
            console.warn('[App] Error tracking event:', error);
        }
    }

    trackPageChange(pageName) {
        this.trackEvent('page_change', {
            page: pageName,
            previousPage: this.currentPage
        });
    }

    trackError(errorType, errorData) {
        if (!window.analyticsManager || typeof window.analyticsManager.onError !== 'function') {
            return;
        }
        
        try {
            window.analyticsManager.onError(errorType, {
                ...errorData,
                userEmail: this.user?.email || this.user?.mail || 'anonymous',
                provider: this.activeProvider || 'unknown',
                licenseStatus: this.licenseStatus?.status || 'unknown'
            });
            console.log('[App] ✅ Error tracked:', errorType, errorData);
        } catch (error) {
            console.warn('[App] Error tracking error:', error);
        }
    }

    // [Les méthodes de vérification des modules restent identiques à l'original...]
    async ensureMailServiceReady() {
        console.log('[App] Ensuring MailService is ready...');
        
        if (window.mailService && typeof window.mailService.getEmails === 'function') {
            console.log('[App] ✅ MailService already ready');
            return true;
        }
        
        // Attendre le chargement du service
        let attempts = 0;
        const maxAttempts = 30;
        
        while ((!window.mailService || typeof window.mailService.getEmails !== 'function') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.mailService || typeof window.mailService.getEmails !== 'function') {
            console.warn('[App] MailService not ready, creating fallback...');
            this.createMailServiceFallback();
            return false;
        }
        
        console.log('[App] ✅ MailService ready');
        return true;
    }

    createMailServiceFallback() {
        console.log('[App] Creating MailService fallback...');
        
        if (!window.mailService) {
            window.mailService = {};
        }
        
        // Créer des méthodes fallback sécurisées
        const fallbackMethods = {
            getEmails: async () => {
                console.warn('[MailService] Fallback: getEmails called - returning empty array');
                return [];
            },
            
            getFolders: async () => {
                console.warn('[MailService] Fallback: getFolders called - returning default folders');
                return [
                    { id: 'inbox', displayName: 'Boîte de réception', totalItemCount: 0 },
                    { id: 'sent', displayName: 'Éléments envoyés', totalItemCount: 0 }
                ];
            },
            
            getEmailCount: async () => {
                console.warn('[MailService] Fallback: getEmailCount called - returning 0');
                return 0;
            },
            
            searchEmails: async () => {
                console.warn('[MailService] Fallback: searchEmails called - returning empty array');
                return [];
            },
            
            moveToFolder: async () => {
                console.warn('[MailService] Fallback: moveToFolder called - operation skipped');
                return true;
            },
            
            markAsRead: async () => {
                console.warn('[MailService] Fallback: markAsRead called - operation skipped');
                return true;
            },
            
            deleteEmail: async () => {
                console.warn('[MailService] Fallback: deleteEmail called - operation skipped');
                return true;
            }
        };
        
        // Ajouter les méthodes manquantes
        Object.keys(fallbackMethods).forEach(method => {
            if (typeof window.mailService[method] !== 'function') {
                window.mailService[method] = fallbackMethods[method];
            }
        });
        
        console.log('[App] ✅ MailService fallback created');
    }

    // [Les autres méthodes de vérification restent identiques...]
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

        // Fonction pour définir le mode de page avec analytics
        window.setPageMode = (pageName) => {
            if (!pageName || this.currentPage === pageName) {
                return;
            }
            
            const body = document.body;
            
            // Mettre à jour la page actuelle et tracker le changement
            const previousPage = this.currentPage;
            this.currentPage = pageName;
            
            // ANALYTICS: Track page change
            this.trackPageChange(pageName);
            
            console.log(`[App] Page mode changed: ${previousPage} → ${pageName}`);
            
            // Nettoyer les anciennes classes de page
            body.classList.remove(
                'page-dashboard', 'page-scanner', 'page-emails', 
                'page-tasks', 'page-ranger', 'page-settings', 
                'needs-scroll', 'login-mode', 'license-expired-mode'
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

        // Observer pour les changements de contenu avec gestion d'erreurs
        if (window.MutationObserver) {
            let observerTimeout;
            let pendingMutations = false;
            
            const contentObserver = new MutationObserver((mutations) => {
                try {
                    if (this.currentPage === 'dashboard') {
                        return;
                    }
                    
                    const significantChanges = mutations.some(mutation => {
                        try {
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
                        } catch (error) {
                            console.warn('[ScrollManager] Error processing mutation:', error);
                            return false;
                        }
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
                } catch (error) {
                    console.error('[ScrollManager] Observer error:', error);
                }
            });

            try {
                contentObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class'],
                    attributeOldValue: false
                });
                console.log('[App] ✅ Content observer initialized');
            } catch (error) {
                console.warn('[App] Could not initialize content observer:', error);
            }
        }

        // Gestionnaire de redimensionnement
        let resizeTimeout;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        window.addEventListener('resize', () => {
            try {
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
            } catch (error) {
                console.error('[ScrollManager] Resize error:', error);
            }
        });

        console.log('[App] ✅ Scroll manager initialized');
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
        // Vérification spéciale pour Netlify
        if (this.isNetlifyEnv) {
            console.log('[App] Running in Netlify environment, adjusting checks...');
        }

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

        // Vérifier le service de licence
        if (!window.licenseService) {
            console.error('[App] License service not available');
            this.showError('License service not available. Please refresh the page.');
            return false;
        }

        return true;
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
                
                // VÉRIFIER LA LICENCE
                const licenseResult = await this.checkUserLicense(this.user.email);
                
                if (!licenseResult.valid && licenseResult.blockAccess) {
                    this.showLicenseExpiredPage(licenseResult);
                    return true; // Retourner true car le callback a été traité
                }
                
                // ANALYTICS: Track authentication
                this.trackUserAuthentication(this.user);
                
                console.log('[App] ✅ Google user authenticated with valid license:', this.user.displayName || this.user.email);
                this.showAppWithTransition();
                return true;
            } else {
                throw new Error('Google callback processing failed');
            }
            
        } catch (error) {
            console.error('[App] ❌ Error handling Google callback:', error);
            
            // ANALYTICS: Track error
            this.trackError('google_callback_error', {
                message: error.message
            });
            
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
        
        // ANALYTICS: Track initialization error
        this.trackError('app_init_error', {
            message: error.message,
            attempt: this.initializationAttempts
        });
        
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
        
        // NAVIGATION CORRIGÉE AVEC ANALYTICS
        document.querySelectorAll('.nav-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                try {
                    const page = e.currentTarget.dataset.page;
                    if (page && window.pageManager) {
                        this.currentPage = page;
                        
                        if (window.setPageMode) {
                            window.setPageMode(page);
                        }
                        
                        // Vérification robuste avant le chargement de page
                        if (typeof window.pageManager.loadPage === 'function') {
                            window.pageManager.loadPage(page);
                        } else {
                            console.error('[App] PageManager.loadPage is not a function');
                            if (window.uiManager) {
                                window.uiManager.showToast('Erreur de navigation', 'error');
                            }
                        }
                    }
                } catch (error) {
                    console.error('[App] Navigation error:', error);
                    
                    // ANALYTICS: Track navigation error
                    this.trackError('navigation_error', {
                        message: error.message,
                        targetPage: e.currentTarget.dataset.page
                    });
                    
                    if (window.uiManager) {
                        window.uiManager.showToast('Erreur de navigation: ' + error.message, 'error');
                    }
                }
            });
        });

        // Gestion globale des erreurs avec analytics
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
            
            // ANALYTICS: Track global error
            this.trackError('global_window_error', window.lastGlobalError);
            
            if (event.error && event.error.message) {
                const message = event.error.message;
                
                // Erreurs spécifiques
                if (message.includes('unauthorized_client')) {
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur de configuration Azure. Vérifiez votre Client ID.',
                            'error',
                            10000
                        );
                    }
                } else if (message.includes('Cannot set properties of undefined')) {
                    console.error('[App] DOM manipulation error detected:', message);
                    
                    // Essayer de diagnostiquer l'erreur
                    if (message.includes('innerHTML')) {
                        console.error('[App] innerHTML error - element may not exist');
                        if (window.uiManager) {
                            window.uiManager.showToast(
                                'Erreur d\'affichage. Rechargement recommandé.',
                                'warning',
                                5000
                            );
                        }
                    }
                } else if (message.includes('is not a function')) {
                    console.error('[App] Function call error:', message);
                    
                    if (message.includes('getEmails')) {
                        console.error('[App] MailService error detected - creating fallback');
                        this.createMailServiceFallback();
                    }
                }
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
            
            // ANALYTICS: Track promise rejection
            this.trackError('promise_rejection', {
                reason: event.reason?.message || event.reason || 'Unknown rejection'
            });
            
            if (event.reason && event.reason.message) {
                const message = event.reason.message;
                
                if (message.includes('Cannot read properties of undefined')) {
                    if (message.includes('createTaskFromEmail')) {
                        console.error('[App] TaskManager createTaskFromEmail error detected');
                        
                        if (window.uiManager) {
                            window.uiManager.showToast(
                                'Erreur du gestionnaire de tâches. Veuillez actualiser la page.',
                                'warning'
                            );
                        }
                    } else if (message.includes('getEmails')) {
                        console.error('[App] MailService getEmails error detected');
                        this.createMailServiceFallback();
                        
                        if (window.uiManager) {
                            window.uiManager.showToast(
                                'Service de messagerie indisponible. Mode dégradé activé.',
                                'info'
                            );
                        }
                    }
                } else if (message.includes('render')) {
                    console.error('[App] Render error detected');
                    
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Erreur d\'affichage détectée',
                            'warning'
                        );
                    }
                }
            }
            
            if (event.reason && event.reason.errorCode) {
                console.log('[App] MSAL promise rejection:', event.reason.errorCode);
            }
        });

        console.log('[App] ✅ Event listeners set up with error handling and analytics');
    }

    // =====================================
    // MÉTHODES DE CONNEXION AVEC ANALYTICS ET LICENCE
    // =====================================

    // Méthode de connexion unifiée (backward compatibility)
    async login() {
        console.log('[App] Unified login attempted - defaulting to Microsoft...');
        return this.loginMicrosoft();
    }

    // Connexion Microsoft spécifique avec analytics et vérification de licence
    async loginMicrosoft() {
        console.log('[App] Microsoft login attempted...');
        
        // ANALYTICS: Track login attempt
        this.trackEvent('login_attempt', { provider: 'microsoft' });
        
        try {
            this.showModernLoading('Connexion à Outlook...');
            
            if (!window.authService) {
                throw new Error('Microsoft AuthService not available');
            }
            
            if (!window.authService.isInitialized) {
                console.log('[App] Microsoft AuthService not initialized, initializing...');
                await window.authService.initialize();
            }
            
            await window.authService.login();
            // La vérification de licence se fera dans checkAuthenticationStatus après le callback
            
        } catch (error) {
            console.error('[App] Microsoft login error:', error);
            
            // ANALYTICS: Track login error
            this.trackError('microsoft_login_error', {
                message: error.message,
                errorCode: error.errorCode
            });
            
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
            } else if (error.message.includes('not available')) {
                errorMessage = 'Service Microsoft temporairement indisponible.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    // Connexion Google spécifique
    async loginGoogle() {
        console.log('[App] Google login attempted...');
        
        // ANALYTICS: Track login attempt
        this.trackEvent('login_attempt', { provider: 'google' });
        
        try {
            this.showModernLoading('Connexion à Gmail...');
            
            if (!window.googleAuthService) {
                throw new Error('Google AuthService not available');
            }
            
            if (!window.googleAuthService.isInitialized) {
                console.log('[App] Google AuthService not initialized, initializing...');
                await window.googleAuthService.initialize();
            }
            
            await window.googleAuthService.login();
            // La vérification de licence se fera dans checkAuthenticationStatus après le callback
            
        } catch (error) {
            console.error('[App] Google login error:', error);
            
            // ANALYTICS: Track login error
            this.trackError('google_login_error', {
                message: error.message
            });
            
            this.hideModernLoading();
            
            let errorMessage = 'Échec de la connexion Google. Veuillez réessayer.';
            
            if (error.message.includes('popup_blocked')) {
                errorMessage = 'Popup bloqué. Autorisez les popups pour Gmail et réessayez.';
            } else if (error.message.includes('user_cancelled')) {
                errorMessage = 'Connexion Gmail annulée.';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(errorMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[App] Logout attempted...');
        
        // ANALYTICS: Track logout attempt
        this.trackEvent('logout_attempt', { provider: this.activeProvider, licenseStatus: this.licenseStatus?.status });
        
        try {
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (!confirmed) return;
            
            this.showModernLoading('Déconnexion...');
            
            // Nettoyer l'état de la licence
            if (window.licenseService) {
                window.licenseService.clearCache();
            }
            
            // Déconnexion selon le provider actif
            if (this.activeProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            } else if (this.activeProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else {
                // Fallback: essayer les deux
                if (window.authService) {
                    try { await window.authService.logout(); } catch (e) {
                        console.warn('[App] Microsoft logout error:', e);
                    }
                }
                if (window.googleAuthService) {
                    try { await window.googleAuthService.logout(); } catch (e) {
                        console.warn('[App] Google logout error:', e);
                    }
                }
                this.forceCleanup();
            }
            
        } catch (error) {
            console.error('[App] Logout error:', error);
            
            // ANALYTICS: Track logout error
            this.trackError('logout_error', {
                message: error.message,
                provider: this.activeProvider
            });
            
            this.hideModernLoading();
            if (window.uiManager) {
                window.uiManager.showToast('Erreur de déconnexion. Nettoyage forcé...', 'warning');
            }
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[App] Force cleanup dual provider...');
        
        // ANALYTICS: Track cleanup
        this.trackEvent('force_cleanup', { provider: this.activeProvider });
        
        this.user = null;
        this.isAuthenticated = false;
        this.activeProvider = null;
        this.isInitializing = false;
        this.initializationPromise = null;
        this.currentPage = 'dashboard';
        this.licenseStatus = null;
        this.isLicenseChecked = false;
        
        // Nettoyer les deux services d'authentification
        if (window.authService && typeof window.authService.forceCleanup === 'function') {
            window.authService.forceCleanup();
        }
        
        if (window.googleAuthService && typeof window.googleAuthService.forceCleanup === 'function') {
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
        
        // Supprimer la page de licence expirée si elle existe
        const licenseExpiredPage = document.getElementById('licenseExpiredPage');
        if (licenseExpiredPage) {
            licenseExpiredPage.remove();
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showLogin() {
        console.log('[App] Showing login page');
        
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active', 'license-expired-mode');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
        } else {
            console.error('[App] Login page element not found');
        }
        
        // Supprimer la page de licence expirée si elle existe
        const licenseExpiredPage = document.getElementById('licenseExpiredPage');
        if (licenseExpiredPage) {
            licenseExpiredPage.remove();
        }
        
        this.hideModernLoading();
        
        if (window.uiManager) {
            window.uiManager.updateAuthStatus(null);
        }
    }

    showAppWithTransition() {
        console.log('[App] Showing application with transition - Provider:', this.activeProvider);
        
        // ANALYTICS: Track app display
        this.trackEvent('app_displayed', {
            provider: this.activeProvider,
            userEmail: this.user?.email || this.user?.mail,
            licenseStatus: this.licenseStatus?.status || 'unknown',
            licenseValid: this.licenseStatus?.valid || false
        });
        
        this.hideModernLoading();
        
        // Retirer le mode login et activer le mode app
        document.body.classList.remove('login-mode', 'license-expired-mode');
        document.body.classList.add('app-active');
        console.log('[App] App mode activated');
        
        // Supprimer la page de licence expirée si elle existe
        const licenseExpiredPage = document.getElementById('licenseExpiredPage');
        if (licenseExpiredPage) {
            licenseExpiredPage.remove();
        }
        
        // Afficher les éléments avec vérification de leur existence
        const loginPage = document.getElementById('loginPage');
        const appHeader = document.querySelector('.app-header');
        const appNav = document.querySelector('.app-nav');
        const pageContent = document.getElementById('pageContent');
        
        if (loginPage) {
            loginPage.style.display = 'none';
            console.log('[App] Login page hidden');
        } else {
            console.warn('[App] Login page element not found');
        }
        
        if (appHeader) {
            appHeader.style.display = 'block';
            appHeader.style.opacity = '1';
            appHeader.style.visibility = 'visible';
            console.log('[App] Header displayed');
        } else {
            console.warn('[App] Header element not found');
        }
        
        if (appNav) {
            appNav.style.display = 'block';
            appNav.style.opacity = '1';
            appNav.style.visibility = 'visible';
            console.log('[App] Navigation displayed');
        } else {
            console.warn('[App] Navigation element not found');
        }
        
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
            pageContent.style.visibility = 'visible';
            console.log('[App] Page content displayed');
        } else {
            console.warn('[App] Page content element not found');
        }
        
        // Mettre à jour l'interface utilisateur avec le provider et le statut de licence
        if (window.uiManager && typeof window.uiManager.updateAuthStatus === 'function') {
            window.uiManager.updateAuthStatus(this.user);
            
            // Afficher un avertissement si la licence expire bientôt
            if (this.licenseStatus && this.licenseStatus.warningLevel) {
                let message = '';
                let type = 'info';
                
                if (this.licenseStatus.warningLevel === 'critical') {
                    message = `⚠️ Votre licence expire dans ${this.licenseStatus.daysRemaining} jour${this.licenseStatus.daysRemaining > 1 ? 's' : ''}`;
                    type = 'error';
                } else if (this.licenseStatus.warningLevel === 'warning') {
                    message = `Votre licence expire dans ${this.licenseStatus.daysRemaining} jours`;
                    type = 'warning';
                } else if (this.licenseStatus.status === 'trial') {
                    message = this.licenseStatus.message;
                    type = 'info';
                }
                
                if (message) {
                    window.uiManager.showToast(message, type, 10000);
                }
            }
        }
        
        // Mettre à jour l'affichage utilisateur avec badge provider
        if (window.updateUserDisplay && typeof window.updateUserDisplay === 'function') {
            window.updateUserDisplay(this.user);
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
        
        // CHARGER LE DASHBOARD VIA LE MODULE avec vérification robuste
        if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
            console.log('[App] Loading dashboard via dashboardModule...');
            setTimeout(() => {
                try {
                    window.dashboardModule.render();
                    console.log('[App] Dashboard loaded via module for provider:', this.activeProvider);
                } catch (error) {
                    console.error('[App] Dashboard render error:', error);
                    this.showDashboardFallback();
                }
            }, 100);
        } else {
            console.warn('[App] Dashboard module not available, creating fallback...');
            setTimeout(() => {
                if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
                    try {
                        window.dashboardModule.render();
                    } catch (error) {
                        console.error('[App] Dashboard render error:', error);
                        this.showDashboardFallback();
                    }
                } else {
                    this.showDashboardFallback();
                }
            }, 500);
        }
        
        // Forcer l'affichage avec CSS
        this.forceAppDisplay();
        
        setTimeout(() => {
            window.checkScrollNeeded();
        }, 1000);
        
        console.log(`[App] ✅ Application fully displayed with ${this.activeProvider} provider`);
    }

    showDashboardFallback() {
        console.log('[App] Showing dashboard fallback...');
        
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[App] Cannot show dashboard fallback - pageContent not found');
            return;
        }
        
        const licenseInfo = this.licenseStatus ? `
            <div class="license-status-card ${this.licenseStatus.status}">
                <i class="fas fa-key"></i>
                <span>Licence ${this.licenseStatus.status === 'trial' ? 'd\'essai' : this.licenseStatus.status}</span>
                ${this.licenseStatus.daysRemaining ? `<span class="days-remaining">${this.licenseStatus.daysRemaining} jours restants</span>` : ''}
            </div>
        ` : '';
        
        pageContent.innerHTML = `
            <div class="dashboard-fallback">
                <div class="dashboard-header">
                    <h1><i class="fas fa-tachometer-alt"></i> Tableau de bord</h1>
                    <p>Bienvenue dans EmailSortPro</p>
                </div>
                ${licenseInfo}
                <div class="dashboard-content">
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <div class="card-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="card-content">
                                <h3>Scanner d'emails</h3>
                                <p>Analysez et triez vos emails automatiquement</p>
                                <button onclick="window.pageManager?.loadPage('scanner')" class="btn btn-primary">
                                    <i class="fas fa-search"></i> Accéder au scanner
                                </button>
                            </div>
                        </div>
                        <div class="dashboard-card">
                            <div class="card-icon">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <div class="card-content">
                                <h3>Gestionnaire de tâches</h3>
                                <p>Organisez vos tâches et suivez vos projets</p>
                                <button onclick="window.pageManager?.loadPage('tasks')" class="btn btn-primary">
                                    <i class="fas fa-list"></i> Voir les tâches
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="provider-info">
                        <div class="provider-badge ${this.activeProvider}">
                            <i class="fas fa-${this.activeProvider === 'microsoft' ? 'envelope' : 'envelope'}"></i>
                            Connecté via ${this.activeProvider === 'microsoft' ? 'Microsoft Outlook' : 'Google Gmail'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('[App] Dashboard fallback displayed');
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
            .dashboard-fallback {
                padding: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            .dashboard-header {
                text-align: center;
                margin-bottom: 3rem;
            }
            .dashboard-header h1 {
                font-size: 2.5rem;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            .license-status-card {
                max-width: 400px;
                margin: 0 auto 2rem;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                font-weight: 600;
            }
            .license-status-card.trial {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fbbf24;
            }
            .license-status-card.active {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #34d399;
            }
            .license-status-card.expired {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #f87171;
            }
            .days-remaining {
                margin-left: 0.5rem;
                padding: 0.25rem 0.75rem;
                background: rgba(0,0,0,0.1);
                border-radius: 20px;
                font-size: 0.875rem;
            }
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            .dashboard-card {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .card-icon {
                font-size: 3rem;
                color: #3b82f6;
                margin-bottom: 1rem;
            }
            .provider-info {
                text-align: center;
                margin-top: 2rem;
            }
            .provider-badge {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                font-weight: 600;
                color: white;
            }
            .provider-badge.microsoft {
                background: linear-gradient(135deg, #0078d4, #106ebe);
            }
            .provider-badge.google {
                background: linear-gradient(135deg, #4285f4, #34a853);
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
        document.body.style.overflow = '';
    }

    showError(message) {
        console.error('[App] Showing error:', message);
        
        // ANALYTICS: Track error display
        this.trackError('app_error_display', { message: message });
        
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
                            ${this.isNetlifyEnv ? `
                                <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 10px;">
                                    <p style="font-size: 1rem; color: #1e40af;">
                                        <i class="fas fa-info-circle"></i>
                                        Environnement Netlify détecté: ${this.netlifyDomain}
                                    </p>
                                </div>
                            ` : ''}
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
                            ${this.isNetlifyEnv ? `
                                <button onclick="window.diagnoseApp()" class="login-button" style="background: rgba(59, 130, 246, 0.2); color: #1e40af; border: 1px solid rgba(59, 130, 246, 0.3);">
                                    <i class="fas fa-stethoscope"></i>
                                    Diagnostic
                                </button>
                            ` : ''}
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
        
        // ANALYTICS: Track configuration error
        this.trackError('config_error', { issues: issues });
        
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
                            ${this.isNetlifyEnv ? `
                                <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.05); border-radius: 10px;">
                                    <h4 style="color: #1e40af; margin-bottom: 10px;">
                                        <i class="fas fa-cloud"></i> Environnement Netlify
                                    </h4>
                                    <p style="font-size: 0.9rem; color: #1e40af;">
                                        Domaine: ${this.netlifyDomain}<br>
                                        Vérifiez que les URLs de redirection sont configurées pour ce domaine.
                                    </p>
                                </div>
                            ` : ''}
                            <div style="margin-top: 20px; padding: 20px; background: rgba(251, 191, 36, 0.05); border-radius: 10px;">
                                <h4 style="margin-bottom: 10px;">Pour résoudre :</h4>
                                <ol style="margin-left: 20px;">
                                    <li>Cliquez sur "Configurer l'application"</li>
                                    <li>Suivez l'assistant de configuration</li>
                                    <li>Entrez vos Client IDs Azure et Google</li>
                                    ${this.isNetlifyEnv ? '<li>Configurez les URLs de redirection pour Netlify</li>' : ''}
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
    // DIAGNOSTIC ET INFORMATIONS AVEC ANALYTICS ET LICENCE
    // =====================================
    getDiagnosticInfo() {
        return {
            environment: {
                isNetlify: this.isNetlifyEnv,
                domain: window.location.hostname,
                netlifyDomain: this.netlifyDomain,
                userAgent: navigator.userAgent.substring(0, 100)
            },
            app: {
                isAuthenticated: this.isAuthenticated,
                activeProvider: this.activeProvider,
                currentPage: this.currentPage,
                isInitialized: !this.isInitializing,
                initAttempts: this.initializationAttempts
            },
            user: this.user ? {
                name: this.user.displayName || this.user.name,
                email: this.user.mail || this.user.email,
                provider: this.user.provider
            } : null,
            license: {
                isChecked: this.isLicenseChecked,
                status: this.licenseStatus?.status || 'unknown',
                valid: this.licenseStatus?.valid || false,
                daysRemaining: this.licenseStatus?.daysRemaining || 'N/A',
                warningLevel: this.licenseStatus?.warningLevel || 'none',
                adminAccess: this.licenseStatus?.adminAccess || false
            },
            analytics: {
                available: !!window.analyticsManager,
                tracking: !!window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function',
                lastSession: window.analyticsManager ? window.analyticsManager.currentSession : null
            },
            services: {
                licenseService: window.licenseService ? {
                    available: true,
                    isInitialized: window.licenseService.initialized,
                    hasCurrentUser: !!window.licenseService.currentUser
                } : { available: false },
                microsoftAuth: window.authService ? {
                    available: true,
                    isInitialized: window.authService.isInitialized,
                    isAuthenticated: window.authService.isAuthenticated()
                } : { available: false },
                googleAuth: window.googleAuthService ? {
                    available: true,
                    isInitialized: window.googleAuthService.isInitialized,
                    isAuthenticated: window.googleAuthService.isAuthenticated(),
                    method: 'Direct OAuth2 (sans iframe)',
                    avoidsiFrameError: true
                } : { available: false },
                mailService: window.mailService ? {
                    available: true,
                    hasGetEmails: typeof window.mailService.getEmails === 'function',
                    isFallback: window.mailService._isFallback || false
                } : { available: false },
                pageManager: window.pageManager ? {
                    available: true,
                    hasLoadPage: typeof window.pageManager.loadPage === 'function'
                } : { available: false },
                taskManager: window.taskManager ? {
                    available: true,
                    isInitialized: window.taskManager.initialized,
                    taskCount: window.taskManager.getAllTasks ? window.taskManager.getAllTasks().length : 'unknown'
                } : { available: false },
                dashboardModule: window.dashboardModule ? {
                    available: true,
                    hasRender: typeof window.dashboardModule.render === 'function'
                } : { available: false },
                scanModule: window.minimalScanModule ? {
                    available: true,
                    hasRender: typeof window.minimalScanModule.render === 'function',
                    isFallback: window.minimalScanModule._isFallback || false
                } : { available: false },
                uiManager: window.uiManager ? {
                    available: true,
                    hasUpdateAuthStatus: typeof window.uiManager.updateAuthStatus === 'function'
                } : { available: false },
                analyticsManager: window.analyticsManager ? {
                    available: true,
                    hasTrackEvent: typeof window.analyticsManager.trackEvent === 'function',
                    hasTrackAuth: typeof window.analyticsManager.trackAuthentication === 'function',
                    hasOnError: typeof window.analyticsManager.onError === 'function'
                } : { available: false }
            },
            dom: {
                loginPage: !!document.getElementById('loginPage'),
                pageContent: !!document.getElementById('pageContent'),
                appHeader: !!document.querySelector('.app-header'),
                appNav: !!document.querySelector('.app-nav'),
                loadingOverlay: !!document.getElementById('loadingOverlay'),
                licenseExpiredPage: !!document.getElementById('licenseExpiredPage')
            },
            sessionData: {
                googleCallback: !!sessionStorage.getItem('google_callback_data'),
                googleToken: !!localStorage.getItem('google_token_emailsortpro'),
                directToken: !!sessionStorage.getItem('direct_token_data'),
                googleOAuthState: !!sessionStorage.getItem('google_oauth_state')
            },
            errors: {
                lastGlobalError: window.lastGlobalError || null,
                lastPromiseRejection: window.lastPromiseRejection || null
            }
        };
    }

    // Méthode de test pour vérifier les services critiques avec analytics et licence
    testCriticalServices() {
        console.group('🧪 Test des services critiques avec analytics et licence');
        
        const tests = [];
        
        // Test LicenseService
        try {
            if (window.licenseService && window.licenseService.initialized) {
                tests.push({ service: 'LicenseService', status: '✅ OK', details: 'Service initialisé' });
            } else {
                tests.push({ service: 'LicenseService', status: '❌ ERROR', details: 'Non initialisé' });
            }
        } catch (error) {
            tests.push({ service: 'LicenseService', status: '❌ ERROR', details: error.message });
        }
        
        // Test MailService
        try {
            if (window.mailService && typeof window.mailService.getEmails === 'function') {
                tests.push({ service: 'MailService', status: '✅ OK', details: 'getEmails disponible' });
            } else {
                tests.push({ service: 'MailService', status: '⚠️ FALLBACK', details: 'Service en mode dégradé' });
            }
        } catch (error) {
            tests.push({ service: 'MailService', status: '❌ ERROR', details: error.message });
        }
        
        // Test PageManager
        try {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                tests.push({ service: 'PageManager', status: '✅ OK', details: 'loadPage disponible' });
            } else {
                tests.push({ service: 'PageManager', status: '❌ ERROR', details: 'loadPage non disponible' });
            }
        } catch (error) {
            tests.push({ service: 'PageManager', status: '❌ ERROR', details: error.message });
        }
        
        // Test TaskManager
        try {
            if (window.taskManager && window.taskManager.initialized) {
                tests.push({ service: 'TaskManager', status: '✅ OK', details: `${window.taskManager.getAllTasks().length} tâches` });
            } else {
                tests.push({ service: 'TaskManager', status: '❌ ERROR', details: 'Non initialisé' });
            }
        } catch (error) {
            tests.push({ service: 'TaskManager', status: '❌ ERROR', details: error.message });
        }
        
        // Test Auth Services
        try {
            if (window.authService && window.authService.isInitialized) {
                tests.push({ service: 'Microsoft Auth', status: '✅ OK', details: 'Initialisé' });
            } else {
                tests.push({ service: 'Microsoft Auth', status: '⚠️ WARNING', details: 'Non initialisé' });
            }
        } catch (error) {
            tests.push({ service: 'Microsoft Auth', status: '❌ ERROR', details: error.message });
        }
        
        try {
            if (window.googleAuthService && window.googleAuthService.isInitialized) {
                tests.push({ service: 'Google Auth', status: '✅ OK', details: 'Initialisé' });
            } else {
                tests.push({ service: 'Google Auth', status: '⚠️ WARNING', details: 'Non initialisé' });
            }
        } catch (error) {
            tests.push({ service: 'Google Auth', status: '❌ ERROR', details: error.message });
        }
        
        // Test Analytics Manager
        try {
            if (window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function') {
                tests.push({ service: 'Analytics Manager', status: '✅ OK', details: 'Tracking disponible' });
            } else {
                tests.push({ service: 'Analytics Manager', status: '⚠️ WARNING', details: 'Non disponible' });
            }
        } catch (error) {
            tests.push({ service: 'Analytics Manager', status: '❌ ERROR', details: error.message });
        }
        
        tests.forEach(test => {
            console.log(`${test.status} ${test.service}: ${test.details}`);
        });
        
        console.groupEnd();
        return tests;
    }
}

// =====================================
// FONCTIONS GLOBALES D'URGENCE AVEC ANALYTICS ET LICENCE
// =====================================

window.emergencyReset = function() {
    console.log('[App] Emergency reset triggered for dual provider with license');
    
    // ANALYTICS: Track emergency reset
    if (window.app && window.app.trackEvent) {
        window.app.trackEvent('emergency_reset', { trigger: 'manual' });
    }
    
    const keysToKeep = ['emailsort_categories', 'emailsort_tasks', 'emailsortpro_client_id', 'emailsortpro_analytics'];
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
    
    // Nettoyer le service de licence
    if (window.licenseService) {
        window.licenseService.reset();
    }
    
    window.location.reload();
};

window.forceShowApp = function() {
    console.log('[Global] Force show app triggered');
    if (window.app && typeof window.app.showAppWithTransition === 'function') {
        window.app.showAppWithTransition();
    } else {
        document.body.classList.add('app-active');
        document.body.classList.remove('login-mode', 'license-expired-mode');
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        // Supprimer la page de licence expirée si elle existe
        const licenseExpiredPage = document.getElementById('licenseExpiredPage');
        if (licenseExpiredPage) {
            licenseExpiredPage.remove();
        }
        
        if (window.setPageMode) {
            window.setPageMode('dashboard');
        }
        
        if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
            try {
                window.dashboardModule.render();
            } catch (error) {
                console.error('[Global] Dashboard render error:', error);
            }
        }
    }
};

window.testServices = function() {
    console.log('[Global] Testing services...');
    if (window.app && typeof window.app.testCriticalServices === 'function') {
        return window.app.testCriticalServices();
    } else {
        console.error('[Global] App instance not available for testing');
        return [];
    }
};

window.repairMailService = function() {
    console.log('[Global] Repairing MailService...');
    if (window.app && typeof window.app.createMailServiceFallback === 'function') {
        window.app.createMailServiceFallback();
        console.log('[Global] MailService fallback created');
        return true;
    } else {
        console.error('[Global] Cannot repair MailService - App instance not available');
        return false;
    }
};

// Fonction pour tester la licence manuellement
window.testLicense = async function(email) {
    console.log('[Global] Testing license for:', email);
    
    if (!window.licenseService) {
        console.error('[Global] License service not available');
        return null;
    }
    
    try {
        await window.licenseService.initialize();
        const result = await window.licenseService.checkLicenseStatus(email);
        console.log('[Global] License result:', result);
        return result;
    } catch (error) {
        console.error('[Global] License test error:', error);
        return null;
    }
};

// =====================================
// VÉRIFICATION DES SERVICES AVEC ANALYTICS ET LICENCE
// =====================================
function checkServicesReady() {
    const requiredServices = ['uiManager', 'licenseService'];
    const authServices = ['authService', 'googleAuthService'];
    const optionalServices = ['mailService', 'emailScanner', 'categoryManager', 'dashboardModule', 'analyticsManager'];
    
    try {
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
        console.log('[App] License service available:', !!window.licenseService);
        console.log('[App] Analytics available:', !!window.analyticsManager);
        return true;
    } catch (error) {
        console.error('[App] Error checking services:', error);
        return false;
    }
}

window.checkServices = function() {
    const services = {
        required: ['uiManager', 'AppConfig', 'licenseService'],
        auth: ['authService', 'googleAuthService'],
        optional: ['mailService', 'emailScanner', 'categoryManager', 'dashboardModule', 'pageManager', 'taskManager'],
        analytics: ['analyticsManager']
    };
    
    const result = {
        ready: true,
        available: {},
        missing: {},
        errors: {}
    };
    
    Object.keys(services).forEach(category => {
        result.available[category] = [];
        result.missing[category] = [];
        
        services[category].forEach(service => {
            try {
                if (window[service]) {
                    result.available[category].push(service);
                } else {
                    result.missing[category].push(service);
                    if (category === 'required') {
                        result.ready = false;
                    }
                }
            } catch (error) {
                result.errors[service] = error.message;
                result.missing[category].push(service);
                if (category === 'required') {
                    result.ready = false;
                }
            }
        });
    });
    
    // Vérification spéciale pour les services d'auth
    if (result.available.auth.length === 0) {
        result.ready = false;
    }
    
    return result;
};

// =====================================
// GESTION DES ERREURS GLOBALES AVEC ANALYTICS
// =====================================
window.addEventListener('error', (event) => {
    window.lastGlobalError = {
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename,
        lineno: event.lineno,
        timestamp: new Date().toISOString()
    };
    
    // Track dans analytics si disponible
    if (window.app && window.app.trackError) {
        window.app.trackError('global_window_error', window.lastGlobalError);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    window.lastPromiseRejection = {
        reason: event.reason?.message || event.reason || 'Unknown rejection',
        stack: event.reason?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
    };
    
    // Track dans analytics si disponible
    if (window.app && window.app.trackError) {
        window.app.trackError('unhandled_promise_rejection', window.lastPromiseRejection);
    }
});

// =====================================
// INITIALISATION PRINCIPALE AVEC ANALYTICS ET LICENCE
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, creating dual provider app instance with analytics and license...');
    
    try {
        document.body.classList.add('login-mode');
        
        window.app = new App();
        
        const waitForServices = (attempts = 0) => {
            const maxAttempts = 50;
            
            try {
                if (checkServicesReady()) {
                    console.log('[App] All required services ready, initializing dual provider app with analytics and license...');
                    
                    setTimeout(() => {
                        try {
                            window.app.init();
                        } catch (initError) {
                            console.error('[App] Error during app initialization:', initError);
                            if (window.app) {
                                window.app.showError('Erreur lors de l\'initialisation: ' + initError.message);
                            }
                        }
                    }, 100);
                } else if (attempts < maxAttempts) {
                    console.log(`[App] Waiting for services... (${attempts + 1}/${maxAttempts})`);
                    setTimeout(() => waitForServices(attempts + 1), 100);
                } else {
                    console.error('[App] Timeout waiting for services, initializing anyway...');
                    setTimeout(() => {
                        try {
                            window.app.init();
                        } catch (fallbackError) {
                            console.error('[App] Fallback initialization failed:', fallbackError);
                            if (window.app) {
                                window.app.showError('Échec de l\'initialisation de secours: ' + fallbackError.message);
                            }
                        }
                    }, 100);
                }
            } catch (serviceCheckError) {
                console.error('[App] Error checking services:', serviceCheckError);
                setTimeout(() => waitForServices(attempts + 1), 200);
            }
        };
        
        waitForServices();
        
    } catch (domError) {
        console.error('[App] Critical error during DOM initialization:', domError);
        
        // Track error si analytics disponible
        if (window.analyticsManager && window.analyticsManager.onError) {
            try {
                window.analyticsManager.onError('dom_init_error', {
                    message: domError.message,
                    stack: domError.stack
                });
            } catch (analyticsError) {
                console.warn('[App] Analytics error during DOM error tracking:', analyticsError);
            }
        }
        
        // Affichage d'erreur d'urgence
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: system-ui;">
                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); text-align: center; max-width: 500px;">
                    <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">⚠️</div>
                    <h1 style="color: #1f2937; margin-bottom: 1rem;">Erreur critique</h1>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Une erreur critique s'est produite lors du chargement de l'application.</p>
                    <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        Recharger la page
                    </button>
                </div>
            </div>
        `;
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        try {
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
        } catch (loadError) {
            console.error('[App] Error during load event:', loadError);
            
            // Track error si analytics disponible
            if (window.app && window.app.trackError) {
                window.app.trackError('load_event_error', {
                    message: loadError.message
                });
            }
        }
    }, 5000);
});

// =====================================
// DIAGNOSTIC GLOBAL AVEC ANALYTICS ET LICENCE
// =====================================
window.diagnoseApp = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION DUAL PROVIDER + ANALYTICS + LICENSE - EmailSortPro v5.1');
    
    try {
        if (window.app) {
            const appDiag = window.app.getDiagnosticInfo();
            
            console.log('🌐 Environment:', appDiag.environment);
            console.log('📱 App Status:', appDiag.app);
            console.log('👤 User:', appDiag.user);
            console.log('🔑 License:', appDiag.license);
            console.log('📊 Analytics:', appDiag.analytics);
            console.log('🛠️ Services:', appDiag.services);
            console.log('🏗️ DOM Elements:', appDiag.dom);
            console.log('💾 Session Data:', appDiag.sessionData);
            
            if (appDiag.errors.lastGlobalError || appDiag.errors.lastPromiseRejection) {
                console.log('❌ Recent Errors:', appDiag.errors);
            }
            
            // Test des services critiques
            const serviceTests = window.app.testCriticalServices();
            console.log('🧪 Service Tests:', serviceTests);
            
            // Diagnostic analytics spécifique
            if (window.analyticsManager) {
                console.log('📈 Analytics Data:', window.analyticsManager.getGlobalStats());
                console.log('👥 User Stats:', window.analyticsManager.getAllUsers().length + ' utilisateurs');
                console.log('🏢 Company Stats:', window.analyticsManager.getAllCompanies().length + ' sociétés');
            }
            
            // Diagnostic licence spécifique
            if (window.licenseService) {
                window.licenseService.debug().then(debug => {
                    console.log('🔐 License Service Debug:', debug);
                });
            }
            
            return appDiag;
        } else {
            console.log('❌ App instance not available');
            
            // Diagnostic de base sans instance app
            const basicDiag = {
                error: 'App instance not available',
                services: window.checkServices ? window.checkServices() : 'checkServices not available',
                analytics: {
                    available: !!window.analyticsManager,
                    hasData: window.analyticsManager ? !!window.analyticsManager.getGlobalStats : false
                },
                license: {
                    available: !!window.licenseService,
                    initialized: window.licenseService ? window.licenseService.initialized : false
                },
                dom: {
                    loginPage: !!document.getElementById('loginPage'),
                    pageContent: !!document.getElementById('pageContent'),
                    licenseExpiredPage: !!document.getElementById('licenseExpiredPage')
                },
                environment: {
                    isNetlify: window.location.hostname.includes('netlify.app'),
                    domain: window.location.hostname,
                    userAgent: navigator.userAgent.substring(0, 100)
                }
            };
            
            console.log('📊 Basic Diagnostic:', basicDiag);
            return basicDiag;
        }
    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return { error: error.message, stack: error.stack };
    } finally {
        console.groupEnd();
    }
};

// =====================================
// FONCTIONS D'AIDE POUR NETLIFY AVEC ANALYTICS ET LICENCE
// =====================================
window.netlifyHelpers = {
    checkDomain: () => {
        const isNetlify = window.location.hostname.includes('netlify.app');
        const domain = window.location.hostname;
        console.log(`Environment: ${isNetlify ? 'Netlify' : 'Other'} (${domain})`);
        return { isNetlify, domain };
    },
    
    validateConfig: () => {
        if (!window.AppConfig) {
            console.error('AppConfig not loaded');
            return false;
        }
        
        const validation = window.AppConfig.validate();
        console.log('Config validation:', validation);
        return validation.valid;
    },
    
    testAuth: async () => {
        const results = {};
        
        if (window.authService) {
            try {
                results.microsoft = {
                    available: true,
                    initialized: window.authService.isInitialized,
                    authenticated: window.authService.isAuthenticated()
                };
            } catch (error) {
                results.microsoft = { error: error.message };
            }
        }
        
        if (window.googleAuthService) {
            try {
                results.google = {
                    available: true,
                    initialized: window.googleAuthService.isInitialized,
                    authenticated: window.googleAuthService.isAuthenticated()
                };
            } catch (error) {
                results.google = { error: error.message };
            }
        }
        
        console.log('Auth test results:', results);
        return results;
    },
    
    testAnalytics: () => {
        const results = {
            available: !!window.analyticsManager,
            methods: {}
        };
        
        if (window.analyticsManager) {
            const methods = ['trackEvent', 'trackAuthentication', 'onError', 'getGlobalStats', 'getAllUsers', 'getAllCompanies'];
            methods.forEach(method => {
                results.methods[method] = typeof window.analyticsManager[method] === 'function';
            });
            
            try {
                results.stats = window.analyticsManager.getGlobalStats();
                results.users = window.analyticsManager.getAllUsers().length;
                results.companies = window.analyticsManager.getAllCompanies().length;
            } catch (error) {
                results.error = error.message;
            }
        }
        
        console.log('Analytics test results:', results);
        return results;
    },
    
    testLicense: async () => {
        const results = {
            available: !!window.licenseService,
            initialized: false,
            debug: null
        };
        
        if (window.licenseService) {
            try {
                results.initialized = window.licenseService.initialized;
                results.debug = await window.licenseService.debug();
            } catch (error) {
                results.error = error.message;
            }
        }
        
        console.log('License test results:', results);
        return results;
    }
};

// =====================================
// FONCTIONS ANALYTICS GLOBALES
// =====================================
window.analyticsHelpers = {
    // Fonction pour accéder aux analytics depuis analytics.html
    getAnalyticsData: () => {
        if (!window.analyticsManager) {
            console.warn('[Analytics] Analytics manager not available');
            return null;
        }
        
        try {
            return window.analyticsManager.getAnalyticsData();
        } catch (error) {
            console.error('[Analytics] Error getting analytics data:', error);
            return null;
        }
    },
    
    // Fonction pour filtrer les utilisateurs par domaine
    getUsersByDomain: (domain) => {
        if (!window.analyticsManager) {
            console.warn('[Analytics] Analytics manager not available');
            return [];
        }
        
        try {
            const allUsers = window.analyticsManager.getAllUsers();
            return allUsers.filter(user => {
                const userDomain = user.email ? user.email.split('@')[1] : '';
                return userDomain.toLowerCase().includes(domain.toLowerCase());
            });
        } catch (error) {
            console.error('[Analytics] Error filtering users by domain:', error);
            return [];
        }
    },
    
    // Fonction pour filtrer les utilisateurs par email
    getUserByEmail: (email) => {
        if (!window.analyticsManager) {
            console.warn('[Analytics] Analytics manager not available');
            return null;
        }
        
        try {
            const allUsers = window.analyticsManager.getAllUsers();
            return allUsers.find(user => 
                user.email && user.email.toLowerCase() === email.toLowerCase()
            );
        } catch (error) {
            console.error('[Analytics] Error finding user by email:', error);
            return null;
        }
    },
    
    // Fonction pour obtenir les statistiques par société
    getCompanyStats: (companyName) => {
        if (!window.analyticsManager) {
            console.warn('[Analytics] Analytics manager not available');
            return null;
        }
        
        try {
            const companies = window.analyticsManager.getAllCompanies();
            return companies.find(company => 
                company.name && company.name.toLowerCase() === companyName.toLowerCase()
            );
        } catch (error) {
            console.error('[Analytics] Error getting company stats:', error);
            return null;
        }
    },
    
    // Fonction pour exporter les données filtrées
    exportFilteredData: (filter = {}) => {
        if (!window.analyticsManager) {
            console.warn('[Analytics] Analytics manager not available');
            return;
        }
        
        try {
            let data = window.analyticsManager.getAnalyticsData();
            
            // Appliquer les filtres
            if (filter.domain) {
                const filteredUsers = {};
                Object.keys(data.users).forEach(email => {
                    const userDomain = email.split('@')[1];
                    if (userDomain && userDomain.toLowerCase().includes(filter.domain.toLowerCase())) {
                        filteredUsers[email] = data.users[email];
                    }
                });
                data.users = filteredUsers;
            }
            
            if (filter.company) {
                const filteredCompanies = {};
                Object.keys(data.companies).forEach(companyName => {
                    if (companyName.toLowerCase().includes(filter.company.toLowerCase())) {
                        filteredCompanies[companyName] = data.companies[companyName];
                    }
                });
                data.companies = filteredCompanies;
            }
            
            // Exporter
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emailsortpro-analytics-filtered-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('[Analytics] Filtered data exported successfully');
        } catch (error) {
            console.error('[Analytics] Error exporting filtered data:', error);
        }
    }
};

console.log('✅ App v5.1 loaded - DUAL PROVIDER (Microsoft + Google) + ANALYTICS + LICENSE INTEGRATION');
console.log('🔧 Fonctions globales disponibles: window.diagnoseApp(), window.testServices(), window.repairMailService(), window.testLicense()');
console.log('🌐 Helpers Netlify: window.netlifyHelpers');
console.log('📊 Helpers Analytics: window.analyticsHelpers');
console.log('🔑 Système de licence: Blocage automatique des licences expirées avec accès admin préservé');
console.log('🔍 Scanner: Module startscan.js chargé SANS fallback pour permettre le chargement natif');
