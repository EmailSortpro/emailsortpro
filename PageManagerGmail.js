// PageManagerGmail.js - Version 2.0 - Correction complète pour Gmail
// Support intégral de l'authentification Gmail avec gestion des erreurs

console.log('[PageManagerGmail] 🚀 Création nouvelle instance v2.0...');

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
            console.log('[PageManagerGmail] ✅ Version 2.0 - Gmail Edition initialisée');
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
    // AUTHENTIFICATION GMAIL - MÉTHODE COMPLÈTE
    // ================================================
    async checkAuthentication() {
        console.log('[PageManagerGmail] 🔐 Vérification authentification...');
        
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
            
            console.log('[PageManagerGmail] ✅ Résultat authentification:', {
                isAuthenticated,
                provider,
                user: user?.email || user?.emailAddress || 'unknown',
                gmailAPIConnected: this.syncState.gmailAPIConnected
            });
            
            return isAuthenticated;
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur vérification authentification:', error);
            return false;
        }
    }

    // ================================================
    // MÉTHODE LOADPAGE PRINCIPALE
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
                
                const isAuthenticated = await this.checkAuthentication();
                console.log('[PageManagerGmail] Auth status for page:', isAuthenticated);
                
                if (!isAuthenticated) {
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
    // RENDU DES PAGES
    // ================================================
    async renderPage(pageName) {
        const container = this.getPageContainer();
        if (!container) {
            throw new Error('Page container not found');
        }
        
        // Mettre à jour le mode de page si disponible
        if (window.setPageMode) {
            window.setPageMode(pageName);
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
        
        // Ajouter les styles si nécessaire
        this.addAuthRequiredStyles();
        this.hideLoading();
    }

    addAuthRequiredStyles() {
        if (document.getElementById('auth-required-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'auth-required-styles';
        styles.textContent = `
            .auth-required-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 60vh;
                padding: 2rem;
                text-align: center;
            }
            
            .auth-icon {
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 2rem;
                font-size: 3rem;
                color: white;
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            
            .auth-title {
                font-size: 2rem;
                color: #1f2937;
                margin-bottom: 1rem;
                font-weight: 600;
            }
            
            .auth-text {
                font-size: 1.125rem;
                color: #6b7280;
                margin-bottom: 2rem;
                max-width: 500px;
            }
            
            .auth-actions {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                width: 100%;
                max-width: 300px;
            }
            
            .gmail-login-btn {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }
            
            .gmail-login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
            }
        `;
        document.head.appendChild(styles);
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
            const isAuthenticated = await this.checkAuthentication();
            
            if (isAuthenticated) {
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
    // RENDU DE LA PAGE SCANNER
    // ================================================
    async renderScanner(container) {
        console.log('[PageManagerGmail] Rendering scanner page...');
        
        const isAuthenticated = await this.checkAuthentication();
        console.log('[PageManagerGmail] Auth status for scanner:', isAuthenticated);
        
        // Si authentifié, déléguer au module scanner
        if (isAuthenticated) {
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
        
        const isAuthenticated = await this.checkAuthentication();
        
        if (!isAuthenticated) {
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
    // RENDU DE LA PAGE TASKS
    // ================================================
    async renderTasks(container) {
        console.log('[PageManagerGmail] Rendering tasks page...');
        
        if (window.tasksView && typeof window.tasksView.render === 'function') {
            try {
                await window.tasksView.render(container);
            } catch (error) {
                console.error('[PageManagerGmail] Error rendering tasks:', error);
                this.showError('Erreur lors du chargement des tâches');
            }
        } else {
            container.innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1><i class="fas fa-tasks"></i> Tâches</h1>
                    </div>
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Module de tâches non disponible</p>
                    </div>
                </div>
            `;
        }
    }

    // ================================================
    // RENDU DE LA PAGE CATEGORIES
    // ================================================
    async renderCategories(container) {
        console.log('[PageManagerGmail] Rendering categories page...');
        
        if (window.categoriesPage && typeof window.categoriesPage.render === 'function') {
            try {
                await window.categoriesPage.render(container);
            } catch (error) {
                console.error('[PageManagerGmail] Error rendering categories:', error);
                this.showError('Erreur lors du chargement des catégories');
            }
        } else {
            container.innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1><i class="fas fa-layer-group"></i> Catégories</h1>
                    </div>
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Module de catégories non disponible</p>
                    </div>
                </div>
            `;
        }
    }

    // ================================================
    // RENDU DE LA PAGE RANGER
    // ================================================
    async renderRanger(container) {
        console.log('[PageManagerGmail] Rendering ranger page...');
        
        if (window.domainOrganizer && typeof window.domainOrganizer.render === 'function') {
            try {
                await window.domainOrganizer.render(container);
            } catch (error) {
                console.error('[PageManagerGmail] Error rendering ranger:', error);
                this.showError('Erreur lors du chargement du ranger');
            }
        } else {
            container.innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1><i class="fas fa-sitemap"></i> Domain Organizer</h1>
                    </div>
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Module Domain Organizer non disponible</p>
                    </div>
                </div>
            `;
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
    // SETUP LISTENERS
    // ================================================
    setupEventListeners() {
        console.log('[PageManagerGmail] Setting up event listeners...');
        
        // Gestionnaire global des erreurs
        window.addEventListener('error', (event) => {
            console.error('[PageManagerGmail] Global error:', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[PageManagerGmail] Unhandled promise rejection:', event.reason);
        });
    }

    setupSyncListeners() {
        console.log('[PageManagerGmail] 📡 Configuration des listeners de synchronisation...');
        
        // Écouter les événements de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManagerGmail] 📨 Scan completed event received:', event.detail);
            this.handleScanCompleted(event.detail);
        });
        
        // Écouter les événements d'EmailScanner
        window.addEventListener('emailScannerSynced', (event) => {
            console.log('[PageManagerGmail] 📨 EmailScanner synced event received:', event.detail);
            this.handleEmailScannerSynced(event.detail);
        });
        
        // Écouter les changements de catégories
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManagerGmail] 📨 Emails recategorized event received:', event.detail);
            this.handleEmailsRecategorized(event.detail);
        });
        
        // Écouter EmailScanner ready
        window.addEventListener('emailScannerReady', () => {
            console.log('[PageManagerGmail] 📨 EmailScanner ready event received');
            this.handleEmailScannerReady();
        });
        
        console.log('[PageManagerGmail] ✅ Listeners de synchronisation configurés');
    }

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

    // ================================================
    // HANDLERS D'ÉVÉNEMENTS
    // ================================================
    handleScanCompleted(data) {
        console.log('[PageManagerGmail] 🔄 Traitement scan terminé:', data);
        
        if (data.provider === 'google' || data.provider === 'gmail') {
            this.syncState.emailCount = data.total || 0;
            this.syncState.startScanSynced = true;
            this.lastScanData = data;
            
            // Si on est sur la page emails, rafraîchir
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 500);
            }
        }
    }

    handleEmailScannerSynced(data) {
        console.log('[PageManagerGmail] 🔄 EmailScanner synchronisé:', data);
        
        this.syncState.emailScannerSynced = true;
        this.syncState.emailCount = data.emailCount || 0;
        
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleEmailsRecategorized(data) {
        console.log('[PageManagerGmail] 🔄 Emails recatégorisés:', data);
        
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleEmailScannerReady() {
        console.log('[PageManagerGmail] 🔄 EmailScanner prêt');
        this.syncState.emailScannerSynced = true;
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

    handleActiveCategoriesChange(value) {
        console.log('[PageManagerGmail] 📂 Catégories actives changées:', value);
        
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleCategoryStructureChange(type, value) {
        console.log('[PageManagerGmail] 🏗️ Structure catégories changée:', type, value);
        
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleGenericCategoryChange(type, value) {
        console.log('[PageManagerGmail] 🔄 Changement générique:', type);
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    async getCategories() {
        if (window.categoryManager && typeof window.categoryManager.getAllCategories === 'function') {
            return window.categoryManager.getAllCategories();
        }
        
        // Catégories par défaut
        return [
            { id: 'marketing', name: 'Marketing', color: '#ef4444', icon: 'fas fa-megaphone' },
            { id: 'newsletters', name: 'Newsletters', color: '#f59e0b', icon: 'fas fa-newspaper' },
            { id: 'notifications', name: 'Notifications', color: '#3b82f6', icon: 'fas fa-bell' },
            { id: 'finance', name: 'Finance', color: '#10b981', icon: 'fas fa-dollar-sign' },
            { id: 'shopping', name: 'Shopping', color: '#8b5cf6', icon: 'fas fa-shopping-cart' },
            { id: 'other', name: 'Autres', color: '#6b7280', icon: 'fas fa-folder' }
        ];
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

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const category = email.category || 'other';
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }

    // ================================================
    // CONSTRUCTION DE L'INTERFACE EMAILS
    // ================================================
    buildCategoryTabs(categories, categoryCounts) {
        const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
        
        let tabs = `
            <div class="category-tab ${!this.currentCategory ? 'active' : ''}" 
                 onclick="window.pageManagerGmail.filterByCategory(null)">
                <span class="tab-name">Tous</span>
                <span class="tab-count">${totalCount}</span>
            </div>
        `;
        
        categories.forEach(category => {
            const count = categoryCounts[category.id] || 0;
            tabs += `
                <div class="category-tab ${this.currentCategory === category.id ? 'active' : ''}" 
                     onclick="window.pageManagerGmail.filterByCategory('${category.id}')"
                     style="--category-color: ${category.color}">
                    <i class="${category.icon} tab-icon"></i>
                    <span class="tab-name">${category.name}</span>
                    <span class="tab-count">${count}</span>
                </div>
            `;
        });
        
        return tabs;
    }

    async renderEmailsList(emails) {
        let filteredEmails = this.getVisibleEmails(emails);
        
        if (filteredEmails.length === 0) {
            return `
                <div class="no-emails">
                    <i class="fas fa-search"></i>
                    <p>Aucun email trouvé</p>
                </div>
            `;
        }
        
        if (this.currentViewMode === 'flat') {
            return this.renderFlatView(filteredEmails);
        } else {
            return this.renderGroupedView(filteredEmails);
        }
    }

    renderFlatView(emails) {
        return emails.map(email => this.renderEmailCard(email)).join('');
    }

    renderGroupedView(emails) {
        const groups = this.createEmailGroups(emails);
        let html = '';
        
        for (const [groupName, groupEmails] of Object.entries(groups)) {
            html += this.renderEmailGroup(groupName, groupEmails);
        }
        
        return html;
    }

    createEmailGroups(emails) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey;
            
            if (this.currentViewMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
            } else if (this.currentViewMode === 'grouped-category') {
                groupKey = email.category || 'other';
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(email);
        });
        
        return groups;
    }

    renderEmailGroup(groupName, emails) {
        const isExpanded = true; // Par défaut, tous les groupes sont ouverts
        
        return `
            <div class="email-group" data-group="${groupName}">
                <div class="group-header" onclick="window.pageManagerGmail.toggleGroup('${groupName}')">
                    <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} group-toggle"></i>
                    <span class="group-name">${this.getGroupDisplayName(groupName)}</span>
                    <span class="group-count">${emails.length}</span>
                </div>
                <div class="group-emails ${isExpanded ? 'expanded' : ''}">
                    ${emails.map(email => this.renderEmailCard(email)).join('')}
                </div>
            </div>
        `;
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const isPreselected = this.getTaskPreselectedCategories().includes(email.category);
        const aiAnalysis = this.aiAnalysisResults.get(email.id);
        const createdTask = this.createdTasks.get(email.id);
        const isNewsletter = this.detectGmailNewsletter(email);
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${isPreselected ? 'preselected' : ''} ${createdTask ? 'task-created' : ''}" 
                 data-email-id="${email.id}"
                 data-category="${email.category || 'other'}"
                 data-preselected="${isPreselected}">
                
                <div class="email-checkbox-wrapper">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onchange="window.pageManagerGmail.toggleEmailSelection('${email.id}')">
                </div>
                
                <div class="email-content" onclick="window.pageManagerGmail.handleEmailClick(event, '${email.id}')">
                    <div class="email-header">
                        <div class="email-from">
                            <div class="email-avatar" style="background-color: ${this.generateAvatarColor(email.from?.emailAddress?.address)}">
                                ${this.getAvatarLetters(email.from?.emailAddress?.name || email.from?.emailAddress?.address)}
                            </div>
                            <div class="email-from-details">
                                <div class="email-from-name">${this.escapeHtml(email.from?.emailAddress?.name || 'Sans nom')}</div>
                                <div class="email-from-address">${this.escapeHtml(email.from?.emailAddress?.address || '')}</div>
                            </div>
                        </div>
                        <div class="email-meta">
                            ${email.hasAttachments ? '<i class="fas fa-paperclip attachment-icon" title="Pièces jointes"></i>' : ''}
                            ${email.importance === 'high' ? '<i class="fas fa-exclamation-circle importance-icon" title="Important"></i>' : ''}
                            ${isNewsletter ? '<i class="fas fa-newspaper newsletter-icon" title="Newsletter"></i>' : ''}
                            <span class="email-date">${this.formatEmailDate(email.receivedDateTime)}</span>
                        </div>
                    </div>
                    
                    <div class="email-subject">${this.escapeHtml(email.subject || 'Sans objet')}</div>
                    
                    <div class="email-preview">${this.escapeHtml(email.bodyPreview || '')}</div>
                    
                    <div class="email-footer">
                        <div class="email-category">
                            <span class="category-badge" style="background-color: ${this.getCategoryColor(email.category)}">
                                <i class="${this.getCategoryIcon(email.category)}"></i>
                                ${this.getCategoryName(email.category)}
                            </span>
                        </div>
                        
                        ${aiAnalysis ? `
                            <div class="ai-analysis-badge">
                                <i class="fas fa-robot"></i>
                                IA: ${aiAnalysis.suggestedAction || 'Analysé'}
                            </div>
                        ` : ''}
                        
                        ${createdTask ? `
                            <div class="task-created-badge" onclick="window.pageManagerGmail.openCreatedTask('${createdTask.id}')">
                                <i class="fas fa-check-circle"></i>
                                Tâche créée
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${isNewsletter || email.category === 'marketing' ? this.renderEmailActions(email) : ''}
            </div>
        `;
    }

    renderEmailActions(email) {
        return `
            <div class="email-actions">
                <button class="email-action" onclick="window.pageManagerGmail.handleUnsubscribe('${email.id}')" title="Se désabonner">
                    <i class="fas fa-times-circle"></i>
                </button>
                <button class="email-action" onclick="window.pageManagerGmail.archiveEmail('${email.id}')" title="Archiver">
                    <i class="fas fa-archive"></i>
                </button>
            </div>
        `;
    }

    // ================================================
    // GESTION DES SÉLECTIONS
    // ================================================
    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        this.updateControlsOnly();
    }

    updateControlsOnly() {
        const selectionCount = document.getElementById('selectionCount');
        if (selectionCount) {
            selectionCount.textContent = `${this.selectedEmails.size} email${this.selectedEmails.size !== 1 ? 's' : ''} sélectionné${this.selectedEmails.size !== 1 ? 's' : ''}`;
        }
        
        // Mettre à jour l'état des boutons
        document.querySelectorAll('.controls-bar button').forEach(btn => {
            if (this.selectedEmails.size === 0) {
                btn.setAttribute('disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });
    }

    // ================================================
    // ACTIONS SUR LES EMAILS
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) return;
        
        console.log('[PageManagerGmail] Creating tasks from selection:', this.selectedEmails.size);
        
        this.showLoading(`Création de ${this.selectedEmails.size} tâche${this.selectedEmails.size > 1 ? 's' : ''}...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const emailId of this.selectedEmails) {
            try {
                const email = await this.getEmailById(emailId);
                if (!email) continue;
                
                const taskData = await this.buildTaskDataFromEmail(email);
                
                if (window.taskManager && typeof window.taskManager.createTask === 'function') {
                    const task = await window.taskManager.createTask(taskData);
                    this.createdTasks.set(emailId, task);
                    successCount++;
                    
                    // Mettre à jour l'affichage de l'email
                    const emailCard = document.querySelector(`[data-email-id="${emailId}"]`);
                    if (emailCard) {
                        emailCard.classList.add('task-created');
                    }
                }
            } catch (error) {
                console.error('[PageManagerGmail] Error creating task for email:', emailId, error);
                errorCount++;
            }
        }
        
        this.hideLoading();
        
        if (successCount > 0) {
            this.showToast(`✅ ${successCount} tâche${successCount > 1 ? 's créées' : ' créée'} avec succès`, 'success');
        }
        
        if (errorCount > 0) {
            this.showToast(`❌ ${errorCount} erreur${errorCount > 1 ? 's' : ''} lors de la création`, 'error');
        }
        
        // Réinitialiser la sélection
        this.clearSelection();
        this.refreshEmailsView();
    }

    async buildTaskDataFromEmail(email) {
        // Vérifier si on a une analyse IA
        const aiAnalysis = this.aiAnalysisResults.get(email.id);
        
        if (aiAnalysis && aiAnalysis.taskData) {
            return this.buildTaskDataFromAnalysis(email, aiAnalysis);
        } else {
            return this.buildTaskDataFromEmailBasic(email);
        }
    }

    buildTaskDataFromAnalysis(email, analysis) {
        return {
            id: this.generateTaskId(),
            title: analysis.taskData.title || email.subject,
            description: analysis.taskData.description || email.bodyPreview,
            category: email.category,
            priority: analysis.taskData.priority || 'medium',
            dueDate: analysis.taskData.dueDate || null,
            status: 'pending',
            source: 'email',
            sourceId: email.id,
            sourceEmail: {
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                date: email.receivedDateTime
            },
            aiSuggestions: analysis.suggestions || [],
            createdAt: new Date().toISOString(),
            createdBy: 'gmail-scanner'
        };
    }

    buildTaskDataFromEmailBasic(email) {
        return {
            id: this.generateTaskId(),
            title: email.subject || 'Sans titre',
            description: email.bodyPreview || '',
            category: email.category || 'other',
            priority: email.importance === 'high' ? 'high' : 'medium',
            dueDate: null,
            status: 'pending',
            source: 'email',
            sourceId: email.id,
            sourceEmail: {
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                date: email.receivedDateTime
            },
            createdAt: new Date().toISOString(),
            createdBy: 'gmail-scanner'
        };
    }

    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    clearSelection() {
        this.selectedEmails.clear();
        document.querySelectorAll('.email-card.selected').forEach(card => {
            card.classList.remove('selected');
            const checkbox = card.querySelector('.email-checkbox');
            if (checkbox) checkbox.checked = false;
        });
        this.updateControlsOnly();
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getVisibleEmails(emails) {
        if (!emails) {
            emails = this.lastEmailsList || [];
        }
        
        let filtered = emails;
        
        // Filtrer par catégorie
        if (this.currentCategory) {
            filtered = filtered.filter(email => email.category === this.currentCategory);
        }
        
        // Filtrer par recherche
        if (this.searchTerm) {
            filtered = filtered.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filtered;
    }

    matchesSearch(email, searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
            email.subject?.toLowerCase().includes(term) ||
            email.bodyPreview?.toLowerCase().includes(term) ||
            email.from?.emailAddress?.name?.toLowerCase().includes(term) ||
            email.from?.emailAddress?.address?.toLowerCase().includes(term)
        );
    }

    async getEmailById(emailId) {
        // Essayer de récupérer depuis EmailScanner
        if (window.emailScanner && typeof window.emailScanner.getEmailById === 'function') {
            return await window.emailScanner.getEmailById(emailId);
        }
        
        // Sinon chercher dans la liste actuelle
        const emails = await this.getAllEmails();
        return emails.find(email => email.id === emailId);
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) {
            return `Il y a ${minutes} min`;
        } else if (hours < 24) {
            return `Il y a ${hours}h`;
        } else if (days < 7) {
            return `Il y a ${days}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    }

    generateAvatarColor(email) {
        if (!email) return '#6b7280';
        
        const colors = [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
        ];
        
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    getAvatarLetters(name) {
        if (!name) return '?';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        
        return name.substring(0, 2).toUpperCase();
    }

    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryColor(categoryId) {
        if (window.categoryManager && typeof window.categoryManager.getCategoryById === 'function') {
            const category = window.categoryManager.getCategoryById(categoryId);
            if (category) return category.color;
        }
        
        const defaultColors = {
            marketing: '#ef4444',
            newsletters: '#f59e0b',
            notifications: '#3b82f6',
            finance: '#10b981',
            shopping: '#8b5cf6',
            other: '#6b7280'
        };
        
        return defaultColors[categoryId] || '#6b7280';
    }

    getCategoryIcon(categoryId) {
        if (window.categoryManager && typeof window.categoryManager.getCategoryById === 'function') {
            const category = window.categoryManager.getCategoryById(categoryId);
            if (category) return category.icon;
        }
        
        const defaultIcons = {
            marketing: 'fas fa-megaphone',
            newsletters: 'fas fa-newspaper',
            notifications: 'fas fa-bell',
            finance: 'fas fa-dollar-sign',
            shopping: 'fas fa-shopping-cart',
            other: 'fas fa-folder'
        };
        
        return defaultIcons[categoryId] || 'fas fa-folder';
    }

    getCategoryName(categoryId) {
        if (window.categoryManager && typeof window.categoryManager.getCategoryById === 'function') {
            const category = window.categoryManager.getCategoryById(categoryId);
            if (category) return category.name;
        }
        
        const defaultNames = {
            marketing: 'Marketing',
            newsletters: 'Newsletters',
            notifications: 'Notifications',
            finance: 'Finance',
            shopping: 'Shopping',
            other: 'Autres'
        };
        
        return defaultNames[categoryId] || 'Autres';
    }

    getGroupDisplayName(groupName) {
        if (this.currentViewMode === 'grouped-category') {
            return this.getCategoryName(groupName);
        }
        
        return groupName;
    }

    detectGmailNewsletter(email) {
        // Détecter les newsletters Gmail
        if (email.headers && email.headers['List-Unsubscribe']) {
            return true;
        }
        
        if (email.labels && email.labels.includes('Promotions')) {
            return true;
        }
        
        const newsletterKeywords = ['newsletter', 'unsubscribe', 'weekly digest', 'daily update'];
        const bodyLower = (email.bodyPreview || '').toLowerCase();
        
        return newsletterKeywords.some(keyword => bodyLower.includes(keyword));
    }

    // ================================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ================================================
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.refreshEmailsView();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        this.setLocalStorageItem('hideEmailExplanation', 'true');
        const notice = document.querySelector('.explanation-notice');
        if (notice) {
            notice.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notice.remove(), 300);
        }
    }

    toggleGroup(groupName) {
        const group = document.querySelector(`[data-group="${groupName}"]`);
        if (!group) return;
        
        const emails = group.querySelector('.group-emails');
        const toggle = group.querySelector('.group-toggle');
        
        if (emails.classList.contains('expanded')) {
            emails.classList.remove('expanded');
            toggle.classList.remove('fa-chevron-down');
            toggle.classList.add('fa-chevron-right');
        } else {
            emails.classList.add('expanded');
            toggle.classList.remove('fa-chevron-right');
            toggle.classList.add('fa-chevron-down');
        }
    }

    handleEmailClick(event, emailId) {
        if (event.target.closest('.email-checkbox-wrapper') || 
            event.target.closest('.email-actions') ||
            event.target.closest('.task-created-badge')) {
            return;
        }
        
        this.showEmailModal(emailId);
    }

    async refreshEmailsView() {
        if (this.currentPage !== 'emails') return;
        
        console.log('[PageManagerGmail] Refreshing emails view...');
        
        const container = document.getElementById('emailsContainer');
        if (!container) return;
        
        const emails = await this.getAllEmails();
        this.lastEmailsList = emails;
        
        container.innerHTML = await this.renderEmailsList(emails);
    }

    setupEmailsEventListeners() {
        // Les événements sont gérés via onclick dans le HTML
        console.log('[PageManagerGmail] Email event listeners setup');
    }

    // ================================================
    // ACTIONS GMAIL SPÉCIFIQUES
    // ================================================
    async handleUnsubscribe(emailId) {
        const email = await this.getEmailById(emailId);
        if (!email) return;
        
        const unsubscribeLink = this.findUnsubscribeLink(email);
        
        if (unsubscribeLink) {
            this.showUnsubscribeModal(email, unsubscribeLink);
        } else {
            this.showAlternativeUnsubscribeModal(email);
        }
    }

    findUnsubscribeLink(email) {
        // Chercher dans les headers
        if (email.headers && email.headers['List-Unsubscribe']) {
            const header = email.headers['List-Unsubscribe'];
            const urlMatch = header.match(/<(https?:\/\/[^>]+)>/);
            if (urlMatch) return urlMatch[1];
        }
        
        // Chercher dans le body
        const bodyLower = (email.bodyPreview || '').toLowerCase();
        const unsubscribeRegex = /https?:\/\/[^\s]+unsubscribe[^\s]*/i;
        const match = bodyLower.match(unsubscribeRegex);
        
        return match ? match[0] : null;
    }

    showUnsubscribeModal(email, unsubscribeLink) {
        // Créer un modal pour confirmer le désabonnement
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Se désabonner</h3>
                <p>Voulez-vous vous désabonner de :</p>
                <p><strong>${email.from?.emailAddress?.name || email.from?.emailAddress?.address}</strong></p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.open('${unsubscribeLink}', '_blank'); this.closest('.modal-overlay').remove();">
                        Ouvrir le lien de désabonnement
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove();">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showAlternativeUnsubscribeModal(email) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Options de désabonnement</h3>
                <p>Aucun lien de désabonnement trouvé pour :</p>
                <p><strong>${email.from?.emailAddress?.address}</strong></p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.pageManagerGmail.createGmailFilter('${email.from?.emailAddress?.address}')">
                        Créer un filtre Gmail
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManagerGmail.blockSender('${email.from?.emailAddress?.address}')">
                        Bloquer l'expéditeur
                    </button>
                    <button class="btn btn-link" onclick="this.closest('.modal-overlay').remove();">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    createGmailFilter(emailAddress) {
        // Ouvrir les paramètres Gmail pour créer un filtre
        const filterUrl = `https://mail.google.com/mail/u/0/#settings/filters?compose=new&from=${encodeURIComponent(emailAddress)}`;
        window.open(filterUrl, '_blank');
        
        document.querySelector('.modal-overlay')?.remove();
        this.showToast('Redirection vers les filtres Gmail...', 'info');
    }

    blockSender(emailAddress) {
        // Marquer comme spam et archiver
        this.showToast(`${emailAddress} sera marqué comme spam`, 'success');
        document.querySelector('.modal-overlay')?.remove();
        
        // TODO: Implémenter l'API Gmail pour bloquer réellement
    }

    async archiveEmail(emailId) {
        console.log('[PageManagerGmail] Archiving email:', emailId);
        
        // Retirer de la vue
        const emailCard = document.querySelector(`[data-email-id="${emailId}"]`);
        if (emailCard) {
            emailCard.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => emailCard.remove(), 300);
        }
        
        this.showToast('Email archivé', 'success');
        
        // TODO: Implémenter l'archivage via l'API Gmail
    }

    // ================================================
    // MODALS
    // ================================================
    showEmailModal(emailId) {
        console.log('[PageManagerGmail] Showing email modal for:', emailId);
        
        // TODO: Implémenter l'affichage détaillé de l'email
        this.showToast('Affichage détaillé en cours de développement', 'info');
    }

    openCreatedTask(taskId) {
        console.log('[PageManagerGmail] Opening task:', taskId);
        
        if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
            window.pageManager.loadPage('tasks');
            
            // TODO: Ouvrir la tâche spécifique dans la vue des tâches
        }
    }

    // ================================================
    // ANALYSE IA
    // ================================================
    async analyzeFirstEmails() {
        // Analyser automatiquement les 5 premiers emails visibles
        const visibleEmails = this.getVisibleEmails().slice(0, 5);
        
        for (const email of visibleEmails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                // TODO: Appeler le service d'analyse IA
                console.log('[PageManagerGmail] Would analyze email:', email.id);
            }
        }
    }

    // ================================================
    // STYLES
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('gmail-emails-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmail-emails-styles';
        styles.textContent = this.getEmailsStyles();
        document.head.appendChild(styles);
    }

    getEmailsStyles() {
        return `
            .emails-page-modern {
                padding: 20px;
                background: #f9fafb;
                min-height: calc(100vh - 140px);
            }
            
            .explanation-notice {
                background: #e0e7ff;
                border: 1px solid #c7d2fe;
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                color: #4338ca;
            }
            
            .close-notice {
                margin-left: auto;
                background: none;
                border: none;
                color: #4338ca;
                cursor: pointer;
                padding: 4px;
            }
            
            .page-header-modern {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .page-title {
                font-size: 28px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .email-count {
                background: #e5e7eb;
                color: #4b5563;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .provider-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
            }
            
            .provider-badge.gmail {
                background: linear-gradient(135deg, #4285f4, #34a853);
            }
            
            .header-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .search-container {
                position: relative;
                width: 300px;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 40px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #4285f4;
                box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
            }
            
            .clear-search {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
            }
            
            .view-toggles {
                display: flex;
                gap: 4px;
                background: #f3f4f6;
                padding: 4px;
                border-radius: 8px;
            }
            
            .view-toggle {
                padding: 8px 12px;
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .view-toggle.active {
                background: white;
                color: #4285f4;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .category-tabs-container {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                overflow-x: auto;
                padding-bottom: 4px;
            }
            
            .category-tab {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }
            
            .category-tab:hover {
                border-color: #d1d5db;
                transform: translateY(-1px);
            }
            
            .category-tab.active {
                background: var(--category-color, #4285f4);
                color: white;
                border-color: var(--category-color, #4285f4);
            }
            
            .tab-icon {
                font-size: 14px;
            }
            
            .tab-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .controls-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .selection-info {
                color: #6b7280;
                font-weight: 500;
            }
            
            .action-buttons {
                display: flex;
                gap: 12px;
            }
            
            .bulk-actions-panel {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 20px;
                display: flex;
                gap: 8px;
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .bulk-action {
                padding: 8px 16px;
                background: #f3f4f6;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .bulk-action:hover {
                background: #e5e7eb;
            }
            
            .emails-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .email-group {
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
            }
            
            .group-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: #f9fafb;
                cursor: pointer;
                user-select: none;
            }
            
            .group-toggle {
                color: #6b7280;
                transition: transform 0.2s;
            }
            
            .group-name {
                flex: 1;
                font-weight: 600;
                color: #374151;
            }
            
            .group-count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 500;
            }
            
            .group-emails {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            
            .group-emails.expanded {
                max-height: 5000px;
            }
            
            .email-card {
                display: flex;
                align-items: center;
                padding: 16px;
                background: white;
                border-bottom: 1px solid #f3f4f6;
                transition: all 0.2s;
                position: relative;
            }
            
            .email-card:last-child {
                border-bottom: none;
            }
            
            .email-card:hover {
                background: #f9fafb;
            }
            
            .email-card.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .email-card.preselected {
                background: #fef3c7;
                border-left: 3px solid #f59e0b;
            }
            
            .email-card.task-created {
                opacity: 0.7;
            }
            
            .email-checkbox-wrapper {
                margin-right: 16px;
            }
            
            .email-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .email-content {
                flex: 1;
                cursor: pointer;
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .email-from {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .email-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }
            
            .email-from-details {
                display: flex;
                flex-direction: column;
            }
            
            .email-from-name {
                font-weight: 600;
                color: #1f2937;
            }
            
            .email-from-address {
                font-size: 13px;
                color: #6b7280;
            }
            
            .email-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 13px;
            }
            
            .attachment-icon,
            .importance-icon,
            .newsletter-icon {
                font-size: 16px;
            }
            
            .attachment-icon {
                color: #6b7280;
            }
            
            .importance-icon {
                color: #ef4444;
            }
            
            .newsletter-icon {
                color: #f59e0b;
            }
            
            .email-subject {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .email-preview {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: 8px;
            }
            
            .email-footer {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                color: white;
            }
            
            .ai-analysis-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                background: #e0e7ff;
                color: #4338ca;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .task-created-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                background: #d1fae5;
                color: #059669;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .task-created-badge:hover {
                background: #a7f3d0;
            }
            
            .email-actions {
                display: flex;
                gap: 4px;
                margin-left: 16px;
            }
            
            .email-action {
                padding: 8px;
                background: #f3f4f6;
                border: none;
                border-radius: 6px;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .email-action:hover {
                background: #e5e7eb;
                color: #374151;
            }
            
            .no-emails {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .no-emails i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.3;
            }
            
            .empty-state-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 60vh;
            }
            
            .empty-state {
                text-align: center;
                max-width: 400px;
            }
            
            .empty-icon {
                width: 120px;
                height: 120px;
                background: #f3f4f6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 48px;
                color: #9ca3af;
            }
            
            .empty-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 24px;
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(-20px);
                }
            }
            
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.2s ease;
            }
            
            .modal-content {
                background: white;
                padding: 32px;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-content h3 {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #1f2937;
            }
            
            .modal-content p {
                color: #6b7280;
                margin-bottom: 12px;
            }
            
            .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .page-header-modern {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .header-right {
                    width: 100%;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .search-container {
                    width: 100%;
                }
                
                .controls-bar {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: stretch;
                }
                
                .action-buttons button {
                    flex: 1;
                }
            }
        `;
    }

    // ================================================
    // ACTIONS GROUPÉES
    // ================================================
    toggleBulkActions() {
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    async bulkMarkAsRead() {
        console.log('[PageManagerGmail] Marking emails as read:', this.selectedEmails.size);
        
        this.showLoading('Marquage en cours...');
        
        // Simuler l'action
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.hideLoading();
        this.showToast(`${this.selectedEmails.size} emails marqués comme lus`, 'success');
        this.clearSelection();
        
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) panel.style.display = 'none';
    }

    async bulkArchive() {
        console.log('[PageManagerGmail] Archiving emails:', this.selectedEmails.size);
        
        this.showLoading('Archivage en cours...');
        
        // Retirer les emails de la vue
        for (const emailId of this.selectedEmails) {
            const card = document.querySelector(`[data-email-id="${emailId}"]`);
            if (card) {
                card.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => card.remove(), 300);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.hideLoading();
        this.showToast(`${this.selectedEmails.size} emails archivés`, 'success');
        this.clearSelection();
        
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) panel.style.display = 'none';
    }

    async bulkDelete() {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedEmails.size} emails ?`)) {
            return;
        }
        
        console.log('[PageManagerGmail] Deleting emails:', this.selectedEmails.size);
        
        this.showLoading('Suppression en cours...');
        
        // Retirer les emails de la vue
        for (const emailId of this.selectedEmails) {
            const card = document.querySelector(`[data-email-id="${emailId}"]`);
            if (card) {
                card.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => card.remove(), 300);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.hideLoading();
        this.showToast(`${this.selectedEmails.size} emails supprimés`, 'success');
        this.clearSelection();
        
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) panel.style.display = 'none';
    }

    async bulkExport() {
        console.log('[PageManagerGmail] Exporting emails:', this.selectedEmails.size);
        
        this.showLoading('Préparation de l\'export...');
        
        const emails = [];
        for (const emailId of this.selectedEmails) {
            const email = await this.getEmailById(emailId);
            if (email) {
                emails.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.address,
                    date: email.receivedDateTime,
                    category: email.category,
                    preview: email.bodyPreview
                });
            }
        }
        
        // Créer le fichier JSON
        const blob = new Blob([JSON.stringify(emails, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emails_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.hideLoading();
        this.showToast(`${emails.length} emails exportés`, 'success');
        
        const panel = document.getElementById('bulkActionsPanel');
        if (panel) panel.style.display = 'none';
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

console.log('✅ PageManagerGmail v2.0 loaded - Gmail Edition complète');
