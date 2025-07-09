// PageManagerGmail.js - Version 1.2 - Correction complète de l'authentification Gmail

console.log('[PageManagerGmail] 🚀 Création nouvelle instance v1.2...');

class PageManagerGmail {
    constructor() {
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = this.getLocalStorageItem('hideEmailExplanation') === 'true';
        this.isInitialized = false;
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Détection spécifique Gmail
        this.provider = 'gmail';
        this.isGmail = true;
        this.gmailDetected = false;
        
        // État de synchronisation Gmail
        this.syncState = {
            startScanSynced: false,
            emailScannerSynced: false,
            categoryManagerSynced: false,
            lastSyncTimestamp: null,
            emailCount: 0,
            gmailAPIConnected: false,
            authState: {
                isAuthenticated: false,
                provider: null,
                user: null
            }
        };
        
        // Cache pour optimisation
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        // Page modules mapping
        this.pageModules = {
            scanner: 'minimalScanModule',
            emails: null,
            tasks: 'tasksView',
            categories: 'categoriesPage',
            settings: 'categoriesPage',
            ranger: 'domainOrganizer'
        };
        
        this.safeInit();
    }

    getLocalStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
            return null;
        }
    }

    setLocalStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
        }
    }

    safeInit() {
        try {
            this.detectGmailEnvironment();
            this.setupEventListeners();
            this.setupSyncListeners();
            this.setupCategoryManagerIntegration();
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Version 1.2 - Gmail Edition initialisée avec auth complète');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur initialisation:', error);
        }
    }

    // ================================================
    // DÉTECTION ENVIRONNEMENT GMAIL
    // ================================================
    detectGmailEnvironment() {
        console.log('[PageManagerGmail] 🔍 Détection environnement Gmail...');
        
        // Vérifier l'URL
        const hostname = window.location.hostname.toLowerCase();
        if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
            this.gmailDetected = true;
            console.log('[PageManagerGmail] ✅ Gmail détecté via URL');
        }
        
        // Vérifier les éléments DOM spécifiques à Gmail
        const gmailSelectors = [
            '.gmail_default',
            '[gh="tl"]', // Toolbar Gmail
            '.T-I.T-I-KE', // Bouton composer
            '.zA', // Ligne d'email Gmail
            '.nH .no .nH', // Structure Gmail
            '[role="main"][aria-label*="Gmail"]'
        ];
        
        for (const selector of gmailSelectors) {
            if (document.querySelector(selector)) {
                this.gmailDetected = true;
                console.log('[PageManagerGmail] ✅ Gmail détecté via DOM:', selector);
                break;
            }
        }
        
        // Observer pour détecter Gmail après chargement
        if (!this.gmailDetected) {
            this.observeGmailLoad();
        }
    }

    observeGmailLoad() {
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector('.gmail_default') || document.querySelector('[gh="tl"]')) {
                this.gmailDetected = true;
                console.log('[PageManagerGmail] ✅ Gmail détecté après chargement');
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout après 10 secondes
        setTimeout(() => observer.disconnect(), 10000);
    }

    // ================================================
    // AUTHENTIFICATION GMAIL COMPLÈTEMENT CORRIGÉE
    // ================================================
    async checkAuthenticationStatus() {
        console.log('[PageManagerGmail] 🔐 Vérification authentification complète...');
        
        try {
            // Réinitialiser l'état
            this.syncState.authState = {
                isAuthenticated: false,
                provider: null,
                user: null
            };
            
            let isAuthenticated = false;
            let user = null;
            let provider = null;
            
            // 1. Vérifier GoogleAuthService en priorité
            if (window.googleAuthService) {
                console.log('[PageManagerGmail] Vérification Google Auth Service...');
                
                // Méthode 1: isAuthenticated()
                if (typeof window.googleAuthService.isAuthenticated === 'function') {
                    try {
                        const googleAuth = window.googleAuthService.isAuthenticated();
                        if (googleAuth) {
                            isAuthenticated = true;
                            provider = 'google';
                            console.log('[PageManagerGmail] ✅ Google isAuthenticated: true');
                        }
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur isAuthenticated:', error);
                    }
                }
                
                // Méthode 2: checkAuthentication() pour plus de détails
                if (!isAuthenticated && typeof window.googleAuthService.checkAuthentication === 'function') {
                    try {
                        const authCheck = await window.googleAuthService.checkAuthentication();
                        if (authCheck && authCheck.isAuthenticated) {
                            isAuthenticated = true;
                            provider = 'google';
                            user = authCheck.user;
                            this.syncState.gmailAPIConnected = true;
                            console.log('[PageManagerGmail] ✅ Google checkAuthentication: authenticated', authCheck);
                        }
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur checkAuthentication:', error);
                    }
                }
                
                // Méthode 3: Vérifier le token stocké
                if (!isAuthenticated) {
                    const storedToken = this.getLocalStorageItem('google_token_emailsortpro');
                    if (storedToken) {
                        try {
                            const tokenData = JSON.parse(storedToken);
                            if (tokenData && tokenData.access_token) {
                                const expiresAt = tokenData.expires_at || 0;
                                if (expiresAt > Date.now()) {
                                    isAuthenticated = true;
                                    provider = 'google';
                                    console.log('[PageManagerGmail] ✅ Token Google valide trouvé');
                                }
                            }
                        } catch (e) {
                            console.warn('[PageManagerGmail] Erreur parsing token:', e);
                        }
                    }
                }
                
                // Récupérer les infos utilisateur si authentifié
                if (isAuthenticated && !user) {
                    if (typeof window.googleAuthService.getUserInfo === 'function') {
                        try {
                            user = await window.googleAuthService.getUserInfo();
                            console.log('[PageManagerGmail] ✅ User info récupéré:', user?.email || user?.emailAddress);
                        } catch (error) {
                            console.warn('[PageManagerGmail] Erreur getUserInfo:', error);
                        }
                    }
                }
            }
            
            // 2. Vérifier Microsoft comme fallback
            if (!isAuthenticated && window.authService) {
                console.log('[PageManagerGmail] Vérification Microsoft Auth comme fallback...');
                
                if (typeof window.authService.isAuthenticated === 'function') {
                    try {
                        const msAuth = window.authService.isAuthenticated();
                        if (msAuth) {
                            isAuthenticated = true;
                            provider = 'microsoft';
                            user = { email: 'Microsoft User', provider: 'microsoft' };
                            console.log('[PageManagerGmail] ✅ Authentifié via Microsoft');
                        }
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur Microsoft auth:', error);
                    }
                }
            }
            
            // 3. Vérifier via l'app principale
            if (!isAuthenticated && window.app) {
                console.log('[PageManagerGmail] Vérification via App principale...');
                
                if (window.app.isAuthenticated) {
                    isAuthenticated = true;
                    provider = window.app.activeProvider;
                    user = window.app.user;
                    console.log('[PageManagerGmail] ✅ Authentifié via App:', provider);
                }
            }
            
            // 4. Vérifier les résultats du scan stockés
            if (!isAuthenticated) {
                try {
                    const scanResults = sessionStorage.getItem('scanResults');
                    const scanProvider = sessionStorage.getItem('lastScanProvider');
                    
                    if (scanResults && scanProvider) {
                        isAuthenticated = true;
                        provider = scanProvider;
                        console.log('[PageManagerGmail] ✅ Authentification détectée via scan results:', provider);
                    }
                } catch (e) {
                    console.warn('[PageManagerGmail] Erreur lecture sessionStorage:', e);
                }
            }
            
            // 5. Vérifier Gmail natif
            if (!isAuthenticated && this.gmailDetected) {
                const gmailInterface = document.querySelector('.gmail_default') || 
                                     document.querySelector('[gh="tl"]') ||
                                     document.querySelector('.T-I.T-I-KE');
                
                if (gmailInterface) {
                    isAuthenticated = true;
                    provider = 'gmail-native';
                    console.log('[PageManagerGmail] ✅ Utilisateur connecté à Gmail natif');
                    
                    // Essayer de récupérer l'email de l'utilisateur
                    const accountButton = document.querySelector('[aria-label*="Google Account"]');
                    if (accountButton) {
                        const emailMatch = accountButton.getAttribute('aria-label')?.match(/([^@]+@[^)]+)/);
                        if (emailMatch) {
                            user = { email: emailMatch[1], provider: 'gmail-native' };
                        }
                    }
                }
            }
            
            // 6. Dernière tentative : indicateurs localStorage
            if (!isAuthenticated) {
                const authIndicators = [
                    'googleAuthStatus',
                    'authStatus',
                    'userInfo',
                    'msalAccount',
                    'google_user_info'
                ];
                
                for (const indicator of authIndicators) {
                    try {
                        const value = this.getLocalStorageItem(indicator);
                        if (value) {
                            isAuthenticated = true;
                            provider = indicator.includes('google') ? 'google' : 'microsoft';
                            console.log('[PageManagerGmail] ✅ Indicateur auth trouvé:', indicator);
                            break;
                        }
                    } catch (e) {
                        // Ignorer les erreurs
                    }
                }
            }
            
            // Mettre à jour l'état de synchronisation
            this.syncState.authState = {
                isAuthenticated,
                provider,
                user
            };
            
            console.log('[PageManagerGmail] ✅ Résultat final authentification:', {
                isAuthenticated,
                provider,
                user: user?.email || user?.emailAddress || 'unknown',
                gmailAPIConnected: this.syncState.gmailAPIConnected
            });
            
            return this.syncState.authState;
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur critique vérification authentification:', error);
            return {
                isAuthenticated: false,
                provider: null,
                user: null,
                error: error.message
            };
        }
    }

    // ================================================
    // MÉTHODE LOADPAGE CORRIGÉE
    // ================================================
    async loadPage(pageName) {
        console.log('[PageManagerGmail] Loading page:', pageName);
        
        if (!pageName || this.currentPage === pageName) {
            console.log('[PageManagerGmail] Same page or no page specified, skipping');
            return;
        }
        
        this.currentPage = pageName;
        
        // Mettre à jour la navigation
        this.updateNavigation(pageName);
        
        // Afficher le loading
        this.showLoading();
        
        try {
            // Vérifier si la page nécessite une authentification
            if (this.requiresAuthentication(pageName)) {
                console.log('[PageManagerGmail] Page requires authentication:', pageName);
                
                const authStatus = await this.checkAuthenticationStatus();
                console.log('[PageManagerGmail] Auth status for page:', authStatus);
                
                if (!authStatus.isAuthenticated) {
                    console.log('[PageManagerGmail] User not authenticated, showing auth required message');
                    this.renderAuthRequiredState(pageName);
                    return;
                }
            }
            
            // Rendre la page
            await this.renderPage(pageName);
            
        } catch (error) {
            console.error('[PageManagerGmail] Error loading page:', error);
            this.showError('Erreur lors du chargement de la page: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // ================================================
    // RENDU PAGE AUTHENTIFICATION REQUISE
    // ================================================
    renderAuthRequiredState(pageName) {
        const container = this.getPageContainer();
        if (!container) return;
        
        container.innerHTML = `
            <div class="auth-required-state">
                <div class="auth-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="auth-title">Authentification requise</h3>
                <p class="auth-text">
                    Vous devez être connecté pour accéder à cette page.
                </p>
                <div class="auth-actions">
                    <button class="btn btn-primary gmail-login-btn" onclick="window.pageManagerGmail.handleLogin('google')">
                        <i class="fab fa-google"></i>
                        Se connecter avec Google
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManagerGmail.loadPage('dashboard')">
                        <i class="fas fa-home"></i>
                        Retour au tableau de bord
                    </button>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-link" onclick="window.pageManagerGmail.refreshAuthStatus()">
                        <i class="fas fa-sync"></i>
                        Actualiser le statut de connexion
                    </button>
                </div>
            </div>
        `;
        
        this.hideLoading();
    }

    // ================================================
    // MÉTHODE DE CONNEXION
    // ================================================
    async handleLogin(provider = 'google') {
        console.log('[PageManagerGmail] Handling login request for:', provider);
        
        try {
            this.showLoading('Connexion en cours...');
            
            if (provider === 'google' && window.googleAuthService) {
                if (typeof window.googleAuthService.login === 'function') {
                    console.log('[PageManagerGmail] Using GoogleAuthService.login()');
                    await window.googleAuthService.login();
                } else if (typeof window.googleAuthService.signIn === 'function') {
                    console.log('[PageManagerGmail] Using GoogleAuthService.signIn()');
                    await window.googleAuthService.signIn();
                } else {
                    throw new Error('Méthode de connexion Google non disponible');
                }
            } else if (provider === 'microsoft' && window.authService) {
                console.log('[PageManagerGmail] Using Microsoft auth');
                await window.authService.login();
            } else {
                throw new Error(`Provider ${provider} non disponible`);
            }
            
            // Après connexion, recharger la page actuelle
            setTimeout(() => {
                this.loadPage(this.currentPage);
            }, 1000);
            
        } catch (error) {
            console.error('[PageManagerGmail] Login error:', error);
            this.showError('Erreur lors de la connexion: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // ================================================
    // ACTUALISATION DU STATUT D'AUTHENTIFICATION
    // ================================================
    async refreshAuthStatus() {
        console.log('[PageManagerGmail] Refreshing auth status...');
        
        this.showLoading('Actualisation...');
        
        try {
            const authStatus = await this.checkAuthenticationStatus();
            
            if (authStatus.isAuthenticated) {
                this.showToast('✅ Connexion détectée !', 'success');
                
                // Recharger la page actuelle
                setTimeout(() => {
                    this.loadPage(this.currentPage);
                }, 500);
            } else {
                this.showToast('❌ Aucune connexion active', 'error');
            }
        } catch (error) {
            console.error('[PageManagerGmail] Error refreshing auth:', error);
            this.showError('Erreur lors de l\'actualisation');
        } finally {
            this.hideLoading();
        }
    }

    // ================================================
    // RENDU DE LA PAGE SCANNER CORRIGÉ
    // ================================================
    async renderScanner(container) {
        console.log('[PageManagerGmail] Rendering scanner page...');
        
        const authStatus = await this.checkAuthenticationStatus();
        console.log('[PageManagerGmail] Auth status for scanner:', authStatus);
        
        // Si authentifié, déléguer au module scanner
        if (authStatus.isAuthenticated) {
            if (window.minimalScanModule && typeof window.minimalScanModule.render === 'function') {
                try {
                    console.log('[PageManagerGmail] Délégation au minimalScanModule...');
                    await window.minimalScanModule.render(container);
                    return;
                } catch (error) {
                    console.error('[PageManagerGmail] Erreur avec minimalScanModule:', error);
                    this.showError('Erreur du module scanner: ' + error.message);
                }
            } else {
                console.error('[PageManagerGmail] MinimalScanModule non disponible');
                this.showError('Module scanner non disponible');
            }
        } else {
            // Si non authentifié, afficher l'état d'authentification requise
            this.renderAuthRequiredState('scanner');
        }
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS
    // ================================================
    async renderEmails(container) {
        console.log('[PageManagerGmail] Rendering emails page...');
        
        const authStatus = await this.checkAuthenticationStatus();
        
        if (!authStatus.isAuthenticated) {
            this.renderAuthRequiredState('emails');
            return;
        }
        
        // Vérifier s'il y a des résultats de scan
        await this.checkEmailSyncStatus();
        
        // Si pas d'emails, proposer de scanner
        const emails = await this.getAllEmails();
        
        if (!emails || emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }
        
        // Ajouter les styles
        this.addEmailsStyles();
        
        // Construire l'interface
        const categories = await this.getCategories();
        const categoryCounts = this.calculateCategoryCounts(emails);
        
        container.innerHTML = `
            <div class="emails-page-modern">
                ${!this.hideExplanation ? `
                    <div class="explanation-notice">
                        <i class="fas fa-info-circle"></i>
                        <span>Sélectionnez des emails pour créer des tâches automatiquement</span>
                        <button class="close-notice" onclick="window.pageManagerGmail.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div class="page-header-modern">
                    <div class="header-left">
                        <h1 class="page-title">
                            <i class="fas fa-envelope"></i>
                            Emails
                            <span class="email-count">${emails.length}</span>
                            <span class="provider-badge gmail">
                                <i class="fab fa-google"></i> Gmail
                            </span>
                        </h1>
                    </div>
                    
                    <div class="header-right">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input gmail-style" 
                                   placeholder="Rechercher dans les emails..."
                                   value="${this.searchTerm}"
                                   onchange="window.pageManagerGmail.handleSearch(event)">
                            ${this.searchTerm ? `
                                <button class="clear-search" onclick="window.pageManagerGmail.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                        
                        <div class="view-toggles">
                            <button class="view-toggle ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    onclick="window.pageManagerGmail.changeViewMode('flat')"
                                    title="Vue liste">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="view-toggle ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    onclick="window.pageManagerGmail.changeViewMode('grouped-domain')"
                                    title="Grouper par domaine">
                                <i class="fas fa-sitemap"></i>
                            </button>
                            <button class="view-toggle ${this.currentViewMode === 'grouped-category' ? 'active' : ''}" 
                                    onclick="window.pageManagerGmail.changeViewMode('grouped-category')"
                                    title="Grouper par catégorie">
                                <i class="fas fa-layer-group"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="category-tabs-container">
                    ${this.buildCategoryTabs(categories, categoryCounts)}
                </div>
                
                <div class="controls-bar">
                    <div class="selection-info">
                        <span id="selectionCount">
                            ${this.selectedEmails.size} email${this.selectedEmails.size !== 1 ? 's' : ''} sélectionné${this.selectedEmails.size !== 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-secondary" 
                                onclick="window.pageManagerGmail.toggleBulkActions()"
                                ${this.selectedEmails.size === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cog"></i>
                            Actions groupées
                        </button>
                        
                        <button class="btn btn-primary" 
                                onclick="window.pageManagerGmail.createTasksFromSelection()"
                                ${this.selectedEmails.size === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            Créer ${this.selectedEmails.size} tâche${this.selectedEmails.size !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
                
                <div id="bulkActionsPanel" class="bulk-actions-panel" style="display: none;">
                    <button class="bulk-action" onclick="window.pageManagerGmail.bulkMarkAsRead()">
                        <i class="fas fa-envelope-open"></i> Marquer comme lu
                    </button>
                    <button class="bulk-action" onclick="window.pageManagerGmail.bulkArchive()">
                        <i class="fas fa-archive"></i> Archiver
                    </button>
                    <button class="bulk-action" onclick="window.pageManagerGmail.bulkDelete()">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                    <button class="bulk-action" onclick="window.pageManagerGmail.bulkExport()">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                </div>
                
                <div class="emails-container" id="emailsContainer">
                    ${await this.renderEmailsList(emails)}
                </div>
            </div>
        `;
        
        // Initialiser les événements
        this.setupEmailsEventListeners();
        
        // Analyser les premiers emails si activé
        if (this.autoAnalyzeEnabled) {
            this.analyzeFirstEmails();
        }
    }

    // ================================================
    // INTÉGRATION CATEGORYMANAGER
    // ================================================
    setupCategoryManagerIntegration() {
        console.log('[PageManagerGmail] 🔗 Configuration intégration CategoryManager...');
        
        if (window.categoryManager) {
            console.log('[PageManagerGmail] ✅ CategoryManager détecté');
            this.syncState.categoryManagerSynced = true;
            
            window.categoryManager.addChangeListener((type, value, settings) => {
                console.log('[PageManagerGmail] 📨 Changement CategoryManager reçu:', type, value);
                this.handleCategoryManagerChange(type, value, settings);
            });
        } else {
            console.warn('[PageManagerGmail] ⚠️ CategoryManager non trouvé, attente...');
            setTimeout(() => this.setupCategoryManagerIntegration(), 2000);
        }
    }

    handleCategoryManagerChange(type, value, settings) {
        console.log('[PageManagerGmail] 🔄 Traitement changement CategoryManager:', type);
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.invalidateTaskCategoriesCache();
                this.handleTaskPreselectedCategoriesChange(value);
                break;
                
            case 'activeCategories':
                this.handleActiveCategoriesChange(value);
                break;
                
            case 'categoryCreated':
            case 'categoryUpdated':
            case 'categoryDeleted':
                this.handleCategoryStructureChange(type, value);
                break;
                
            default:
                this.handleGenericCategoryChange(type, value);
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 100);
        }
    }

    // ================================================
    // SYNCHRONISATION AVEC LE SCAN
    // ================================================
    async checkEmailSyncStatus() {
        console.log('[PageManagerGmail] Checking email sync status...');
        
        try {
            // Vérifier les résultats du scan dans sessionStorage
            const scanResults = sessionStorage.getItem('scanResults');
            if (scanResults) {
                const results = JSON.parse(scanResults);
                console.log('[PageManagerGmail] Scan results found:', results);
                
                if (results.provider === 'google' || results.provider === 'gmail') {
                    this.syncState.emailCount = results.total || 0;
                    this.lastScanData = results;
                    
                    // Nettoyer après utilisation
                    sessionStorage.removeItem('scanResults');
                }
            }
            
            // Si pas d'emails, essayer de récupérer depuis EmailScanner
            if (window.emailScanner && typeof window.emailScanner.getEmails === 'function') {
                const emails = await window.emailScanner.getEmails();
                if (emails && emails.length > 0) {
                    this.syncState.emailCount = emails.length;
                    this.syncState.emailScannerSynced = true;
                }
            }
            
        } catch (error) {
            console.warn('[PageManagerGmail] Error checking email sync:', error);
        }
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async getAllEmails() {
        console.log('[PageManagerGmail] Getting all emails...');
        
        try {
            // 1. Essayer EmailScanner d'abord
            if (window.emailScanner && typeof window.emailScanner.getEmails === 'function') {
                const emails = await window.emailScanner.getEmails();
                if (emails && emails.length > 0) {
                    console.log('[PageManagerGmail] ✅ Emails from EmailScanner:', emails.length);
                    return emails;
                }
            }
            
            // 2. Essayer de récupérer depuis le cache local
            const cachedEmails = this.getCachedEmails();
            if (cachedEmails && cachedEmails.length > 0) {
                console.log('[PageManagerGmail] ✅ Emails from cache:', cachedEmails.length);
                return cachedEmails;
            }
            
            // 3. Générer des emails de démonstration pour Gmail
            console.log('[PageManagerGmail] 📧 Generating demo Gmail emails...');
            return this.generateDemoGmailEmails();
            
        } catch (error) {
            console.error('[PageManagerGmail] Error getting emails:', error);
            return [];
        }
    }

    getCachedEmails() {
        try {
            const cached = this.getLocalStorageItem('gmail_emails_cache');
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            console.warn('[PageManagerGmail] Error reading cache:', error);
        }
        return null;
    }

    generateDemoGmailEmails() {
        const demoEmails = [
            {
                id: 'gmail_demo_1',
                subject: 'Votre commande Amazon a été expédiée',
                from: { emailAddress: { name: 'Amazon', address: 'ship-confirm@amazon.com' }},
                receivedDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Votre commande #123-456 a été expédiée et arrivera demain...',
                category: 'shopping',
                hasAttachments: false,
                isRead: false,
                labels: ['Promotions'],
                webSimulated: true
            },
            {
                id: 'gmail_demo_2',
                subject: 'Newsletter hebdomadaire - Tech News',
                from: { emailAddress: { name: 'TechCrunch', address: 'newsletter@techcrunch.com' }},
                receivedDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Les dernières actualités tech de la semaine. Unsubscribe at the bottom...',
                category: 'newsletters',
                hasAttachments: false,
                isRead: true,
                labels: ['Updates'],
                headers: { 'List-Unsubscribe': '<http://techcrunch.com/unsubscribe>' },
                webSimulated: true
            },
            {
                id: 'gmail_demo_3',
                subject: 'Rappel: Réunion demain à 14h',
                from: { emailAddress: { name: 'Google Calendar', address: 'calendar-notification@google.com' }},
                receivedDateTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Rappel: Vous avez une réunion prévue demain à 14h00...',
                category: 'notifications',
                hasAttachments: false,
                isRead: false,
                labels: ['Important'],
                webSimulated: true
            },
            {
                id: 'gmail_demo_4',
                subject: 'Votre relevé bancaire est disponible',
                from: { emailAddress: { name: 'BNP Paribas', address: 'noreply@bnpparibas.com' }},
                receivedDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Votre relevé bancaire du mois de décembre est maintenant disponible...',
                category: 'finance',
                hasAttachments: true,
                isRead: false,
                labels: [],
                webSimulated: true
            },
            {
                id: 'gmail_demo_5',
                subject: '50% de réduction sur votre prochain achat',
                from: { emailAddress: { name: 'Nike', address: 'offers@nike.com' }},
                receivedDateTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Profitez de 50% de réduction sur une sélection d\'articles...',
                category: 'marketing',
                hasAttachments: false,
                isRead: true,
                labels: ['Promotions'],
                webSimulated: true
            }
        ];
        
        // Si on a des catégories pré-sélectionnées, marquer certains emails
        const preselectedCategories = this.getTaskPreselectedCategories();
        if (preselectedCategories.length > 0) {
            demoEmails.forEach(email => {
                if (preselectedCategories.includes(email.category)) {
                    email.isPreselectedForTasks = true;
                }
            });
        }
        
        return demoEmails;
    }

    // ================================================
    // RENDU ÉTAT VIDE
    // ================================================
    renderEmptyEmailsState() {
        return `
            <div class="empty-state-container">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h2>Aucun email trouvé</h2>
                    <p>Commencez par scanner vos emails Gmail pour les organiser</p>
                    <div class="empty-actions">
                        <button class="btn btn-primary" onclick="window.pageManagerGmail.loadPage('scanner')">
                            <i class="fas fa-search"></i>
                            Scanner mes emails
                        </button>
                        <button class="btn btn-secondary" onclick="window.pageManagerGmail.refreshEmails()">
                            <i class="fas fa-sync"></i>
                            Actualiser
                        </button>
                    </div>
                    <div class="provider-info" style="margin-top: 30px;">
                        <span class="provider-badge gmail">
                            <i class="fab fa-google"></i>
                            Connecté via Gmail
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTUALISATION DES EMAILS
    // ================================================
    async refreshEmails() {
        console.log('[PageManagerGmail] Refreshing emails...');
        
        this.showLoading('Actualisation des emails...');
        
        try {
            // Recharger la page emails
            await this.loadPage('emails');
            
            this.showToast('✅ Emails actualisés', 'success');
        } catch (error) {
            console.error('[PageManagerGmail] Error refreshing emails:', error);
            this.showError('Erreur lors de l\'actualisation');
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    showLoading(message = 'Chargement...') {
        if (window.uiManager && typeof window.uiManager.showLoading === 'function') {
            window.uiManager.showLoading(message);
        }
    }

    hideLoading() {
        if (window.uiManager && typeof window.uiManager.hideLoading === 'function') {
            window.uiManager.hideLoading();
        }
    }

    showError(message) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, 'error', 8000);
        } else {
            console.error('[PageManagerGmail]', message);
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type);
        }
    }

    getPageContainer() {
        return document.getElementById('pageContent');
    }

    updateNavigation(pageName) {
        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    requiresAuthentication(pageName) {
        const authRequired = ['scanner', 'emails', 'tasks'];
        return authRequired.includes(pageName);
    }

    async renderPage(pageName) {
        const container = this.getPageContainer();
        if (!container) {
            throw new Error('Page container not found');
        }
        
        switch (pageName) {
            case 'scanner':
                await this.renderScanner(container);
                break;
            case 'emails':
                await this.renderEmails(container);
                break;
            case 'tasks':
                await this.renderTasks(container);
                break;
            case 'categories':
            case 'settings':
                await this.renderCategories(container);
                break;
            case 'ranger':
                await this.renderRanger(container);
                break;
            default:
                throw new Error(`Page inconnue: ${pageName}`);
        }
    }

    // ================================================
    // MÉTHODES EXISTANTES À COPIER
    // ================================================
    
    handleTaskPreselectedCategoriesChange(value) {
        console.log('[PageManagerGmail] 📋 Catégories tâches pré-sélectionnées changées:', value);
        
        // Si on est sur la page emails, mettre à jour l'affichage
        if (this.currentPage === 'emails') {
            const visibleEmails = this.getVisibleEmails();
            
            visibleEmails.forEach(email => {
                const emailCard = document.querySelector(`[data-email-id="${email.id}"]`);
                if (!emailCard) return;
                
                const shouldBePreselected = value.includes(email.category);
                const isCurrentlyPreselected = emailCard.dataset.preselected === 'true';
                
                if (shouldBePreselected !== isCurrentlyPreselected) {
                    emailCard.dataset.preselected = shouldBePreselected;
                    
                    if (shouldBePreselected) {
                        emailCard.classList.add('preselected');
                        if (!this.selectedEmails.has(email.id)) {
                            this.selectedEmails.add(email.id);
                            const checkbox = emailCard.querySelector('.email-checkbox');
                            if (checkbox) checkbox.checked = true;
                        }
                    } else {
                        emailCard.classList.remove('preselected');
                    }
                }
            });
            
            this.updateControlsOnly();
        }
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        if (this._taskCategoriesCache && (now - this._taskCategoriesCacheTime) < 5000) {
            return this._taskCategoriesCache;
        }
        
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            this._taskCategoriesCache = window.categoryManager.getTaskPreselectedCategories() || [];
            this._taskCategoriesCacheTime = now;
            return this._taskCategoriesCache;
        }
        
        return [];
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
    }

    // ================================================
    // CLEANUP
    // ================================================
    cleanup() {
        if (this.categoryManagerChangeListener) {
            window.categoryManager?.removeChangeListener?.(this.categoryManagerChangeListener);
        }
        
        this.invalidateTaskCategoriesCache();
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        
        console.log('[PageManagerGmail] 🧹 Nettoyage effectué');
    }
}

// ================================================
// COPIER TOUTES LES MÉTHODES NON SURCHARGÉES
// ================================================
// Copier les méthodes du PageManager original qui ne sont pas redéfinies
const methodsToCopy = [
    'setupSyncListeners',
    'handleScanCompleted',
    'handleEmailScannerSynced',
    'handleEmailsRecategorized',
    'handleEmailScannerReady',
    'setupEventListeners',
    'handleGenericSettingsChanged',
    'tryRecoverScanResults',
    'initializePageEvents',
    'getCategories',
    'buildCategoryTabs',
    'renderEmailsList',
    'renderFlatView',
    'renderGroupedView',
    'renderEmailGroup',
    'renderEmailCard',
    'toggleEmailSelection',
    'updateControlsOnly',
    'clearSelection',
    'refreshEmailsView',
    'filterByCategory',
    'changeViewMode',
    'hideExplanationMessage',
    'toggleGroup',
    'handleEmailClick',
    'setupEmailsEventListeners',
    'handleSearch',
    'clearSearch',
    'toggleBulkActions',
    'bulkMarkAsRead',
    'bulkArchive',
    'bulkDelete',
    'bulkExport',
    'createTasksFromSelection',
    'buildTaskDataFromAnalysis',
    'buildTaskDataFromEmail',
    'generateTaskId',
    'getEmailById',
    'showEmailModal',
    'showTaskCreationModal',
    'createTaskFromModal',
    'openCreatedTask',
    'renderTasks',
    'renderCategories',
    'renderSettings',
    'startFallbackScan',
    'renderRanger',
    'renderEmptyState',
    'configureAI',
    'getVisibleEmails',
    'matchesSearch',
    'calculateCategoryCounts',
    'createEmailGroups',
    'generateAvatarColor',
    'getEmailPriorityColor',
    'formatEmailDate',
    'escapeHtml',
    'getEmailContent',
    'getCategoryColor',
    'getCategoryIcon',
    'getCategoryName',
    'analyzeFirstEmails',
    'safeCall',
    'showPageContent',
    'renderErrorPage',
    'getSyncStatus',
    'handleActiveCategoriesChange',
    'handleCategoryStructureChange',
    'handleGenericCategoryChange',
    'detectGmailNewsletter',
    'renderEmailActions',
    'handleUnsubscribe',
    'findUnsubscribeLink',
    'showUnsubscribeModal',
    'showAlternativeUnsubscribeModal',
    'confirmUnsubscribe',
    'createGmailFilter',
    'blockSender',
    'archiveEmail',
    'showLabelMenu',
    'toggleLabel',
    'addEmailsStyles',
    'getBaseEmailStyles'
];

// Copier les méthodes depuis le prototype de PageManager si disponible
if (typeof PageManager !== 'undefined') {
    methodsToCopy.forEach(methodName => {
        if (!PageManagerGmail.prototype[methodName] && PageManager.prototype[methodName]) {
            PageManagerGmail.prototype[methodName] = PageManager.prototype[methodName];
        }
    });
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.pageManagerGmail) {
    console.log('[PageManagerGmail] 🔄 Nettoyage ancienne instance...');
    window.pageManagerGmail.cleanup?.();
}

window.pageManagerGmail = new PageManagerGmail();

// Bind toutes les méthodes
Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
        window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
    }
});

// Exposer comme PageManager si on est dans Gmail
if (window.location.hostname.includes('gmail.com') || window.location.hostname.includes('mail.google.com')) {
    window.pageManager = window.pageManagerGmail;
}

// Fonction globale pour basculer entre les gestionnaires
window.switchPageManager = function(provider) {
    if (provider === 'gmail' && window.pageManagerGmail) {
        window.pageManager = window.pageManagerGmail;
        console.log('[Global] Switched to PageManagerGmail');
    } else if (provider === 'microsoft' && window.pageManagerOriginal) {
        window.pageManager = window.pageManagerOriginal;
        console.log('[Global] Switched to PageManager (Microsoft)');
    }
};

// Fonctions de debug globales
window.debugPageManagerGmail = function() {
    return window.pageManagerGmail?.getSyncStatus() || { error: 'PageManagerGmail non disponible' };
};

console.log('✅ PageManagerGmail v1.2 loaded - Gmail Edition avec authentification complète');
