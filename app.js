// app.js - Application EmailSortPro complète v5.0
// Double authentification Gmail/Outlook avec interface complète

class EmailSortProApp {
    constructor() {
        this.version = '5.0';
        this.isInitialized = false;
        this.initPromise = null;
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.user = null;
        this.currentPage = 'dashboard';
        this.lastScrollState = null;
        this.contentObserver = null;
        
        console.log(`[App] EmailSortPro v${this.version} - Initialisation complète...`);
        
        // Configuration des providers
        this.providers = {
            google: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#4285f4',
                gradient: 'linear-gradient(135deg, #4285f4, #34a853)'
            },
            microsoft: {
                name: 'Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                gradient: 'linear-gradient(135deg, #0078d4, #106ebe)'
            }
        };
        
        // Bind des méthodes
        this.init = this.init.bind(this);
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.checkScrollNeeded = this.checkScrollNeeded.bind(this);
        
        // Initialiser immédiatement
        this.startInitialization();
    }
    
    // =====================================
    // INITIALISATION PRINCIPALE
    // =====================================
    async startInitialization() {
        try {
            // Afficher l'écran de chargement
            this.showLoadingScreen();
            
            // Attendre que le DOM soit prêt
            await this.waitForDOM();
            
            // Configurer les écouteurs d'événements d'authentification
            this.setupAuthListeners();
            
            // Vérifier l'authentification rapide
            const quickAuth = this.quickAuthCheck();
            if (quickAuth.authenticated) {
                console.log('[App] ✅ Authentification rapide détectée:', quickAuth.provider);
                this.currentProvider = quickAuth.provider;
                this.isAuthenticated = true;
                
                // Afficher l'interface immédiatement
                this.showAppInterface();
                
                // Continuer l'initialisation en arrière-plan
                this.backgroundInit();
            } else {
                // Initialisation complète
                await this.init();
            }
            
        } catch (error) {
            console.error('[App] ❌ Erreur d\'initialisation:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
        }
    }
    
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._doInit();
        return this.initPromise;
    }
    
    async _doInit() {
        console.log('[App] Initialisation complète...');
        
        try {
            // 1. Vérifier les prérequis
            if (!this.checkPrerequisites()) {
                throw new Error('Prérequis manquants');
            }
            
            // 2. Attendre que les services soient chargés
            await this.waitForServices();
            
            // 3. Initialiser les services d'authentification
            await this.initializeAuthServices();
            
            // 4. Vérifier l'authentification
            const isAuthenticated = await this.checkAuthentication();
            
            if (isAuthenticated) {
                console.log('[App] ✅ Utilisateur authentifié avec', this.currentProvider);
                this.showAppInterface();
                await this.initializeAppComponents();
                await this.updateUserDisplay();
                this.loadInitialPage();
            } else {
                console.log('[App] Utilisateur non authentifié');
                this.showLoginPage();
            }
            
            // 5. Configurer les gestionnaires d'événements
            this.setupEventHandlers();
            
            // 6. Initialiser le gestionnaire de scroll
            this.initializeScrollManager();
            
            // 7. Initialiser les analytics
            this.initializeAnalytics();
            
            this.isInitialized = true;
            console.log('[App] ✅ Initialisation terminée');
            
        } catch (error) {
            console.error('[App] ❌ Erreur d\'initialisation:', error);
            this.handleInitializationError(error);
        }
    }
    
    // =====================================
    // AUTHENTIFICATION
    // =====================================
    setupAuthListeners() {
        // Écouter les événements Google
        window.addEventListener('googleAuthReady', (event) => {
            console.log('[App] Google Auth Ready:', event.detail);
            if (event.detail.authenticated && !this.currentProvider) {
                this.handleAuthSuccess('google', event.detail.user);
            }
        });
        
        window.addEventListener('googleAuthSuccess', (event) => {
            console.log('[App] Google Auth Success:', event.detail);
            this.handleAuthSuccess('google', event.detail.user);
        });
        
        // Écouter les événements Microsoft
        window.addEventListener('msalAuthSuccess', (event) => {
            console.log('[App] Microsoft Auth Success:', event.detail);
            this.handleAuthSuccess('microsoft', event.detail.user);
        });
    }
    
    handleAuthSuccess(provider, user) {
        this.currentProvider = provider;
        this.isAuthenticated = true;
        this.user = user;
        sessionStorage.setItem('lastAuthProvider', provider);
        
        if (!document.body.classList.contains('app-active')) {
            this.showAppInterface();
            this.backgroundInit();
        }
    }
    
    quickAuthCheck() {
        try {
            const lastProvider = sessionStorage.getItem('lastAuthProvider');
            
            // Vérifier Google
            const googleToken = localStorage.getItem('google_token_emailsortpro');
            if (googleToken) {
                try {
                    const tokenData = JSON.parse(googleToken);
                    if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                        return { authenticated: true, provider: 'google' };
                    }
                } catch (e) {}
            }
            
            // Vérifier Microsoft
            const msalKeys = localStorage.getItem('msal.account.keys');
            if (msalKeys && lastProvider === 'microsoft') {
                return { authenticated: true, provider: 'microsoft' };
            }
            
        } catch (error) {
            console.warn('[App] Erreur vérification rapide:', error);
        }
        
        return { authenticated: false, provider: null };
    }
    
    async checkAuthentication() {
        console.log('[App] Vérification de l\'authentification...');
        
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        
        // Vérifier Google
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            this.currentProvider = 'google';
            this.isAuthenticated = true;
            this.user = await window.googleAuthService.getUserInfo();
            this.user.provider = 'google';
            console.log('[App] ✅ Authentifié avec Google');
            return true;
        }
        
        // Vérifier Microsoft
        if (window.authService && window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            this.isAuthenticated = true;
            this.user = await window.authService.getUserInfo();
            this.user.provider = 'microsoft';
            console.log('[App] ✅ Authentifié avec Microsoft');
            return true;
        }
        
        console.log('[App] ❌ Non authentifié');
        return false;
    }
    
    // =====================================
    // INTERFACE UTILISATEUR
    // =====================================
    showLoadingScreen() {
        const loadingHTML = `
            <div id="appLoadingScreen" class="app-loading-screen">
                <div class="loading-content">
                    <div class="logo-animation">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h1>EmailSortPro</h1>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                    <p class="loading-text">Chargement de l'application...</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('appLoadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => loadingScreen.remove(), 300);
        }
    }
    
    showLoginPage() {
        console.log('[App] Affichage de la page de connexion');
        
        this.hideLoadingScreen();
        document.body.classList.add('login-mode');
        document.body.classList.remove('app-active');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'flex';
            this.enhanceLoginPage();
        }
    }
    
    enhanceLoginPage() {
        const loginPage = document.getElementById('loginPage');
        if (!loginPage) return;
        
        loginPage.innerHTML = `
            <div class="login-container animated fadeIn">
                <div class="login-card">
                    <div class="login-header">
                        <div class="app-logo">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        <h1>EmailSortPro</h1>
                        <p>Gérez vos emails intelligemment</p>
                    </div>
                    
                    <div class="login-body">
                        <h2>Choisissez votre service de messagerie</h2>
                        
                        <div class="login-options">
                            <button class="login-button google" onclick="window.app.loginGoogle()">
                                <i class="fab fa-google"></i>
                                <span>Continuer avec Gmail</span>
                            </button>
                            
                            <button class="login-button microsoft" onclick="window.app.loginMicrosoft()">
                                <i class="fab fa-microsoft"></i>
                                <span>Continuer avec Outlook</span>
                            </button>
                        </div>
                        
                        <div class="login-features">
                            <div class="feature">
                                <i class="fas fa-shield-alt"></i>
                                <span>Connexion sécurisée</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-lock"></i>
                                <span>Vos données restent privées</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-sync"></i>
                                <span>Synchronisation en temps réel</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="login-footer">
                        <p>En vous connectant, vous acceptez nos <a href="#">conditions d'utilisation</a></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    showAppInterface() {
        console.log('[App] Affichage de l\'interface principale');
        
        this.hideLoadingScreen();
        document.body.classList.remove('login-mode');
        document.body.classList.add('app-active');
        
        // Masquer la page de connexion
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        // Afficher les éléments de l'application
        this.showElement('.app-header');
        this.showElement('.app-nav');
        this.showElement('#pageContent');
        
        // Ajouter la classe du provider
        document.body.classList.add(`provider-${this.currentProvider}`);
        
        // Forcer l'affichage
        this.forceAppDisplay();
    }
    
    showElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'block';
            element.style.opacity = '1';
            element.style.visibility = 'visible';
        }
    }
    
    forceAppDisplay() {
        const style = document.createElement('style');
        style.textContent = `
            body.app-active #loginPage { display: none !important; }
            body.app-active .app-header { display: block !important; opacity: 1 !important; }
            body.app-active .app-nav { display: block !important; opacity: 1 !important; }
            body.app-active #pageContent { display: block !important; opacity: 1 !important; }
        `;
        document.head.appendChild(style);
    }
    
    // =====================================
    // GESTION DES PAGES
    // =====================================
    loadInitialPage() {
        console.log('[App] Chargement de la page initiale');
        
        this.currentPage = 'dashboard';
        this.setPageMode('dashboard');
        
        // Charger le dashboard
        if (window.dashboardModule && typeof window.dashboardModule.render === 'function') {
            setTimeout(() => {
                window.dashboardModule.render();
            }, 100);
        } else {
            this.showFallbackDashboard();
        }
    }
    
    handleNavigation(event) {
        event.preventDefault();
        
        const page = event.currentTarget.dataset.page;
        if (!page || page === this.currentPage) return;
        
        console.log('[App] Navigation vers:', page);
        
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // Changer de page
        this.currentPage = page;
        this.setPageMode(page);
        
        // Charger la page
        if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
            window.pageManager.loadPage(page);
        } else {
            this.loadPageFallback(page);
        }
        
        // Analytics
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('page_view', { page });
        }
    }
    
    setPageMode(pageName) {
        const body = document.body;
        
        // Nettoyer les classes de page
        body.classList.remove(
            'page-dashboard', 'page-scanner', 'page-emails', 
            'page-tasks', 'page-ranger', 'page-settings'
        );
        
        // Ajouter la nouvelle classe
        body.classList.add(`page-${pageName}`);
        
        // Gérer le scroll selon la page
        if (pageName === 'dashboard') {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
            setTimeout(() => this.checkScrollNeeded(), 300);
        }
        
        // Exposer globalement
        window.currentPage = pageName;
    }
    
    loadPageFallback(page) {
        console.log('[App] Chargement de la page en mode fallback:', page);
        
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;
        
        const pages = {
            dashboard: this.getDashboardHTML(),
            scanner: this.getScannerHTML(),
            emails: this.getEmailsHTML(),
            tasks: this.getTasksHTML(),
            ranger: this.getRangerHTML(),
            settings: this.getSettingsHTML()
        };
        
        pageContent.innerHTML = pages[page] || '<div class="page-container"><h1>Page non trouvée</h1></div>';
        
        // Initialiser les composants de la page
        this.initializePageComponents(page);
    }
    
    // =====================================
    // CONTENU DES PAGES
    // =====================================
    getDashboardHTML() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1><i class="fas fa-tachometer-alt"></i> Tableau de bord</h1>
                    <div class="dashboard-date">${new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                
                <div class="dashboard-welcome">
                    <h2>Bienvenue, ${this.user?.displayName || this.user?.name || 'Utilisateur'} !</h2>
                    <p>Voici un aperçu de votre activité EmailSortPro</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card emails">
                        <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Emails non lus</div>
                        </div>
                    </div>
                    
                    <div class="stat-card tasks">
                        <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Tâches actives</div>
                        </div>
                    </div>
                    
                    <div class="stat-card scanned">
                        <div class="stat-icon"><i class="fas fa-search"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Emails scannés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card organized">
                        <div class="stat-icon"><i class="fas fa-folder"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Emails organisés</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-actions">
                    <h3>Actions rapides</h3>
                    <div class="action-grid">
                        <button class="action-card" onclick="window.app.navigateToPage('scanner')">
                            <i class="fas fa-search"></i>
                            <span>Scanner les emails</span>
                        </button>
                        
                        <button class="action-card" onclick="window.app.navigateToPage('tasks')">
                            <i class="fas fa-plus-circle"></i>
                            <span>Créer une tâche</span>
                        </button>
                        
                        <button class="action-card" onclick="window.app.navigateToPage('emails')">
                            <i class="fas fa-inbox"></i>
                            <span>Voir les emails</span>
                        </button>
                        
                        <button class="action-card" onclick="window.app.navigateToPage('ranger')">
                            <i class="fas fa-archive"></i>
                            <span>Ranger les emails</span>
                        </button>
                    </div>
                </div>
                
                <div class="dashboard-recent">
                    <h3>Activité récente</h3>
                    <div class="activity-list">
                        <div class="activity-empty">
                            <i class="fas fa-clock"></i>
                            <p>Aucune activité récente</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getScannerHTML() {
        return `
            <div class="scanner-container">
                <div class="page-header">
                    <h1><i class="fas fa-search"></i> Scanner d'emails</h1>
                    <p>Analysez vos emails pour identifier les actions importantes</p>
                </div>
                
                <div class="scanner-controls">
                    <div class="control-group">
                        <label>Période à scanner</label>
                        <select id="scanPeriod" class="form-control">
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                            <option value="all">Tous les emails</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Type d'analyse</label>
                        <select id="scanType" class="form-control">
                            <option value="all">Analyse complète</option>
                            <option value="urgent">Urgents uniquement</option>
                            <option value="tasks">Tâches potentielles</option>
                            <option value="follow">À suivre</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-primary btn-scan" onclick="window.app.startScan()">
                        <i class="fas fa-play"></i> Lancer le scan
                    </button>
                </div>
                
                <div class="scanner-progress" style="display: none;">
                    <div class="progress-bar-container">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="progress-text">Analyse en cours...</div>
                </div>
                
                <div class="scanner-results">
                    <div class="results-empty">
                        <i class="fas fa-inbox"></i>
                        <h3>Aucun scan effectué</h3>
                        <p>Lancez un scan pour analyser vos emails</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getEmailsHTML() {
        return `
            <div class="emails-container">
                <div class="page-header">
                    <h1><i class="fas fa-envelope"></i> Emails</h1>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="window.app.refreshEmails()">
                            <i class="fas fa-sync"></i> Actualiser
                        </button>
                    </div>
                </div>
                
                <div class="emails-filters">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">
                            Tous <span class="count">0</span>
                        </button>
                        <button class="filter-btn" data-filter="unread">
                            Non lus <span class="count">0</span>
                        </button>
                        <button class="filter-btn" data-filter="flagged">
                            Importants <span class="count">0</span>
                        </button>
                        <button class="filter-btn" data-filter="attachments">
                            Avec pièces jointes <span class="count">0</span>
                        </button>
                    </div>
                    
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Rechercher dans les emails..." id="emailSearch">
                    </div>
                </div>
                
                <div class="emails-list">
                    <div class="emails-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Chargement des emails...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getTasksHTML() {
        return `
            <div class="tasks-container">
                <div class="page-header">
                    <h1><i class="fas fa-tasks"></i> Tâches</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="window.app.createNewTask()">
                            <i class="fas fa-plus"></i> Nouvelle tâche
                        </button>
                    </div>
                </div>
                
                <div class="tasks-filters">
                    <button class="filter-btn active" data-filter="all">Toutes</button>
                    <button class="filter-btn" data-filter="todo">À faire</button>
                    <button class="filter-btn" data-filter="inprogress">En cours</button>
                    <button class="filter-btn" data-filter="completed">Terminées</button>
                    <button class="filter-btn" data-filter="overdue">En retard</button>
                </div>
                
                <div class="tasks-board">
                    <div class="task-column" data-status="todo">
                        <div class="column-header">
                            <h3>À faire</h3>
                            <span class="task-count">0</span>
                        </div>
                        <div class="task-list"></div>
                    </div>
                    
                    <div class="task-column" data-status="inprogress">
                        <div class="column-header">
                            <h3>En cours</h3>
                            <span class="task-count">0</span>
                        </div>
                        <div class="task-list"></div>
                    </div>
                    
                    <div class="task-column" data-status="completed">
                        <div class="column-header">
                            <h3>Terminées</h3>
                            <span class="task-count">0</span>
                        </div>
                        <div class="task-list"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getRangerHTML() {
        return `
            <div class="ranger-container">
                <div class="page-header">
                    <h1><i class="fas fa-archive"></i> Ranger les emails</h1>
                    <p>Organisez automatiquement vos emails par catégories</p>
                </div>
                
                <div class="ranger-stats">
                    <div class="stat-box">
                        <i class="fas fa-envelope"></i>
                        <div class="stat-info">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Emails à ranger</div>
                        </div>
                    </div>
                    
                    <div class="stat-box">
                        <i class="fas fa-folder"></i>
                        <div class="stat-info">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Catégories actives</div>
                        </div>
                    </div>
                    
                    <div class="stat-box">
                        <i class="fas fa-check-circle"></i>
                        <div class="stat-info">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Emails rangés</div>
                        </div>
                    </div>
                </div>
                
                <div class="ranger-actions">
                    <button class="btn btn-primary" onclick="window.app.startAutoRanger()">
                        <i class="fas fa-magic"></i> Ranger automatiquement
                    </button>
                    
                    <button class="btn btn-secondary" onclick="window.app.configureFolders()">
                        <i class="fas fa-cog"></i> Configurer les dossiers
                    </button>
                </div>
                
                <div class="ranger-preview">
                    <h3>Aperçu du rangement</h3>
                    <div class="preview-empty">
                        <i class="fas fa-folder-open"></i>
                        <p>Lancez le rangement automatique pour voir l'aperçu</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getSettingsHTML() {
        return `
            <div class="settings-container">
                <div class="page-header">
                    <h1><i class="fas fa-cog"></i> Paramètres</h1>
                </div>
                
                <div class="settings-sections">
                    <div class="settings-section">
                        <h2><i class="fas fa-user"></i> Compte</h2>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>Email connecté</label>
                                <div class="setting-value">${this.user?.email || this.user?.mail || 'Non disponible'}</div>
                            </div>
                            
                            <div class="setting-item">
                                <label>Fournisseur</label>
                                <div class="setting-value">
                                    <span class="provider-badge ${this.currentProvider}">
                                        <i class="${this.providers[this.currentProvider].icon}"></i>
                                        ${this.providers[this.currentProvider].name}
                                    </span>
                                </div>
                            </div>
                            
                            <button class="btn btn-danger" onclick="window.app.logout()">
                                <i class="fas fa-sign-out-alt"></i> Se déconnecter
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h2><i class="fas fa-bell"></i> Notifications</h2>
                        <div class="settings-content">
                            <div class="setting-toggle">
                                <label>
                                    <input type="checkbox" id="notifEmails" checked>
                                    <span>Notifications pour les nouveaux emails</span>
                                </label>
                            </div>
                            
                            <div class="setting-toggle">
                                <label>
                                    <input type="checkbox" id="notifTasks" checked>
                                    <span>Rappels de tâches</span>
                                </label>
                            </div>
                            
                            <div class="setting-toggle">
                                <label>
                                    <input type="checkbox" id="notifUrgent" checked>
                                    <span>Alertes emails urgents</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h2><i class="fas fa-palette"></i> Apparence</h2>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>Thème</label>
                                <select class="form-control" id="themeSelect">
                                    <option value="light">Clair</option>
                                    <option value="dark">Sombre</option>
                                    <option value="auto">Automatique</option>
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <label>Taille du texte</label>
                                <select class="form-control" id="fontSizeSelect">
                                    <option value="small">Petit</option>
                                    <option value="medium" selected>Moyen</option>
                                    <option value="large">Grand</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h2><i class="fas fa-database"></i> Données</h2>
                        <div class="settings-content">
                            <button class="btn btn-secondary" onclick="window.app.exportData()">
                                <i class="fas fa-download"></i> Exporter les données
                            </button>
                            
                            <button class="btn btn-secondary" onclick="window.app.clearCache()">
                                <i class="fas fa-trash"></i> Vider le cache
                            </button>
                            
                            <button class="btn btn-warning" onclick="window.app.resetApp()">
                                <i class="fas fa-undo"></i> Réinitialiser l'application
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // =====================================
    // GESTION DU SCROLL
    // =====================================
    initializeScrollManager() {
        console.log('[App] Initialisation du gestionnaire de scroll');
        
        this.checkScrollNeeded = () => {
            const contentHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const currentPage = this.currentPage;
            
            // Dashboard: jamais de scroll
            if (currentPage === 'dashboard') {
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // Autres pages: scroll si nécessaire
            if (contentHeight > viewportHeight + 50) {
                document.body.style.overflow = 'auto';
            } else {
                document.body.style.overflow = 'hidden';
            }
        };
        
        // Observer les changements de contenu
        if (window.MutationObserver) {
            this.contentObserver = new MutationObserver(() => {
                if (this.currentPage !== 'dashboard') {
                    setTimeout(() => this.checkScrollNeeded(), 100);
                }
            });
            
            this.contentObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Écouter le redimensionnement
        window.addEventListener('resize', () => {
            if (this.currentPage !== 'dashboard') {
                this.checkScrollNeeded();
            }
        });
        
        // Exposer globalement
        window.checkScrollNeeded = this.checkScrollNeeded;
        window.setPageMode = (page) => this.setPageMode(page);
    }
    
    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    async waitForDOM() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
    }
    
    async waitForServices() {
        console.log('[App] Attente des services...');
        
        const requiredServices = ['uiManager'];
        const authServices = ['authService', 'googleAuthService'];
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            // Vérifier les services requis
            const hasRequired = requiredServices.every(service => window[service]);
            const hasAuth = authServices.some(service => window[service]);
            
            if (hasRequired && hasAuth) {
                console.log('[App] ✅ Services chargés');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn('[App] Timeout en attendant les services');
    }
    
    async initializeAuthServices() {
        console.log('[App] Initialisation des services d\'authentification...');
        
        const promises = [];
        
        if (window.googleAuthService) {
            promises.push(
                window.googleAuthService.initialize()
                    .then(() => console.log('[App] ✅ Google Auth initialisé'))
                    .catch(err => console.warn('[App] ⚠️ Google Auth:', err.message))
            );
        }
        
        if (window.authService) {
            promises.push(
                window.authService.initialize()
                    .then(() => console.log('[App] ✅ Microsoft Auth initialisé'))
                    .catch(err => console.warn('[App] ⚠️ Microsoft Auth:', err.message))
            );
        }
        
        await Promise.allSettled(promises);
    }
    
    async initializeAppComponents() {
        console.log('[App] Initialisation des composants...');
        
        const components = [
            { name: 'mailService', init: 'initialize' },
            { name: 'taskManager', init: 'initialize' },
            { name: 'categoryManager', init: 'initialize' }
        ];
        
        for (const component of components) {
            if (window[component.name] && typeof window[component.name][component.init] === 'function') {
                try {
                    await window[component.name][component.init]();
                    console.log(`[App] ✅ ${component.name} initialisé`);
                } catch (error) {
                    console.warn(`[App] ⚠️ Erreur ${component.name}:`, error.message);
                }
            }
        }
    }
    
    async updateUserDisplay() {
        console.log('[App] Mise à jour de l\'affichage utilisateur');
        
        if (window.uiManager && this.user) {
            window.uiManager.updateAuthStatus(this.user);
        }
        
        // Ajouter le badge du provider
        const userInfo = document.querySelector('.user-info');
        if (userInfo && this.currentProvider) {
            const badge = document.createElement('span');
            badge.className = `provider-indicator ${this.currentProvider}`;
            badge.innerHTML = `<i class="${this.providers[this.currentProvider].icon}"></i>`;
            userInfo.appendChild(badge);
        }
    }
    
    setupEventHandlers() {
        console.log('[App] Configuration des gestionnaires d\'événements');
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', this.handleNavigation);
        });
        
        // Gestion des erreurs
        window.addEventListener('error', (event) => {
            console.error('[App] Erreur globale:', event.error);
            this.handleGlobalError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Promise rejetée:', event.reason);
            this.handlePromiseRejection(event.reason);
        });
    }
    
    // =====================================
    // MÉTHODES D'AUTHENTIFICATION
    // =====================================
    async loginGoogle() {
        console.log('[App] Connexion Google...');
        
        try {
            this.showLoadingModal('Connexion à Gmail...');
            
            if (!window.googleAuthService) {
                throw new Error('Service Google non disponible');
            }
            
            await window.googleAuthService.login();
            
        } catch (error) {
            console.error('[App] Erreur connexion Google:', error);
            this.hideLoadingModal();
            this.showToast('Erreur de connexion Google: ' + error.message, 'error');
        }
    }
    
    async loginMicrosoft() {
        console.log('[App] Connexion Microsoft...');
        
        try {
            this.showLoadingModal('Connexion à Outlook...');
            
            if (!window.authService) {
                throw new Error('Service Microsoft non disponible');
            }
            
            await window.authService.login();
            
        } catch (error) {
            console.error('[App] Erreur connexion Microsoft:', error);
            this.hideLoadingModal();
            this.showToast('Erreur de connexion Microsoft: ' + error.message, 'error');
        }
    }
    
    async logout() {
        console.log('[App] Déconnexion...');
        
        const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
        if (!confirmed) return;
        
        try {
            this.showLoadingModal('Déconnexion...');
            
            if (this.currentProvider === 'google' && window.googleAuthService) {
                await window.googleAuthService.logout();
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                await window.authService.logout();
            }
            
            this.cleanup();
            
        } catch (error) {
            console.error('[App] Erreur déconnexion:', error);
            this.cleanup();
        }
    }
    
    cleanup() {
        console.log('[App] Nettoyage...');
        
        // Réinitialiser l'état
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.user = null;
        this.currentPage = 'dashboard';
        
        // Nettoyer le stockage
        sessionStorage.clear();
        
        // Recharger
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    // =====================================
    // MÉTHODES D'ACTION
    // =====================================
    navigateToPage(page) {
        const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navItem) {
            navItem.click();
        }
    }
    
    async startScan() {
        console.log('[App] Démarrage du scan...');
        
        const scannerProgress = document.querySelector('.scanner-progress');
        const scannerResults = document.querySelector('.scanner-results');
        
        if (scannerProgress) {
            scannerProgress.style.display = 'block';
        }
        
        if (scannerResults) {
            scannerResults.innerHTML = '<div class="scanning-animation"><i class="fas fa-spinner fa-spin"></i> Analyse en cours...</div>';
        }
        
        // Simuler un scan
        setTimeout(() => {
            if (scannerProgress) {
                scannerProgress.style.display = 'none';
            }
            
            if (scannerResults) {
                scannerResults.innerHTML = `
                    <div class="scan-complete">
                        <i class="fas fa-check-circle"></i>
                        <h3>Scan terminé</h3>
                        <p>12 emails importants identifiés</p>
                    </div>
                `;
            }
            
            this.showToast('Scan terminé avec succès', 'success');
        }, 3000);
    }
    
    async refreshEmails() {
        console.log('[App] Actualisation des emails...');
        this.showToast('Actualisation en cours...', 'info');
        
        // Actualiser via le service mail
        if (window.mailService && typeof window.mailService.refreshEmails === 'function') {
            try {
                await window.mailService.refreshEmails();
                this.showToast('Emails actualisés', 'success');
            } catch (error) {
                this.showToast('Erreur d\'actualisation', 'error');
            }
        }
    }
    
    createNewTask() {
        console.log('[App] Création d\'une nouvelle tâche...');
        
        // Ouvrir le modal de création
        if (window.taskManager && typeof window.taskManager.showCreateModal === 'function') {
            window.taskManager.showCreateModal();
        } else {
            this.showToast('Gestionnaire de tâches non disponible', 'warning');
        }
    }
    
    // =====================================
    // MÉTHODES UI
    // =====================================
    showLoadingModal(message = 'Chargement...') {
        const modal = document.createElement('div');
        modal.id = 'loadingModal';
        modal.className = 'loading-modal';
        modal.innerHTML = `
            <div class="loading-modal-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.remove();
        }
    }
    
    showToast(message, type = 'info', duration = 3000) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type, duration);
        } else {
            // Fallback
            console.log(`[Toast ${type}] ${message}`);
        }
    }
    
    showError(message) {
        console.error('[App] Erreur:', message);
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'app-error-container';
        errorContainer.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Erreur d'application</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Recharger l'application
                </button>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorContainer);
    }
    
    // =====================================
    // INITIALISATION DES COMPOSANTS DE PAGE
    // =====================================
    initializePageComponents(page) {
        switch (page) {
            case 'emails':
                this.initializeEmailsPage();
                break;
            case 'tasks':
                this.initializeTasksPage();
                break;
            case 'settings':
                this.initializeSettingsPage();
                break;
        }
    }
    
    initializeEmailsPage() {
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Appliquer le filtre
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Implémenter la recherche
                console.log('Recherche:', e.target.value);
            });
        }
    }
    
    initializeTasksPage() {
        // Filtres de tâches
        document.querySelectorAll('.tasks-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tasks-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Filtrer les tâches
            });
        });
    }
    
    initializeSettingsPage() {
        // Thème
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
        
        // Taille de police
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                document.body.className = document.body.className.replace(/font-\w+/, '');
                document.body.classList.add(`font-${e.target.value}`);
            });
        }
    }
    
    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('emailsortpro_theme', theme);
    }
    
    // =====================================
    // ANALYTICS
    // =====================================
    initializeAnalytics() {
        if (window.analyticsManager) {
            try {
                window.analyticsManager.onPageLoad('app');
                
                if (this.user) {
                    window.analyticsManager.trackAuthentication(this.currentProvider, this.user);
                }
                
                console.log('[App] ✅ Analytics initialisées');
            } catch (error) {
                console.warn('[App] Erreur analytics:', error);
            }
        }
    }
    
    // =====================================
    // GESTION DES ERREURS
    // =====================================
    handleGlobalError(error) {
        if (window.analyticsManager) {
            window.analyticsManager.onError('global_error', {
                message: error?.message || 'Unknown error',
                stack: error?.stack
            });
        }
    }
    
    handlePromiseRejection(reason) {
        if (window.analyticsManager) {
            window.analyticsManager.onError('promise_rejection', {
                reason: reason?.message || reason || 'Unknown rejection'
            });
        }
    }
    
    handleInitializationError(error) {
        console.error('[App] Erreur d\'initialisation:', error);
        
        if (error.message.includes('Prérequis')) {
            this.showConfigurationError();
        } else {
            this.showError('Impossible d\'initialiser l\'application: ' + error.message);
        }
    }
    
    showConfigurationError() {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'config-error-container';
        errorContainer.innerHTML = `
            <div class="error-content">
                <i class="fas fa-cog"></i>
                <h2>Configuration requise</h2>
                <p>L'application nécessite une configuration initiale</p>
                <a href="setup.html" class="btn btn-primary">
                    Configurer l'application
                </a>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorContainer);
    }
    
    // =====================================
    // MÉTHODES SUPPLÉMENTAIRES
    // =====================================
    async backgroundInit() {
        console.log('[App] Initialisation en arrière-plan...');
        
        try {
            await this.waitForServices();
            await this.initializeAuthServices();
            await this.initializeAppComponents();
            await this.updateUserDisplay();
            this.loadInitialPage();
            this.setupEventHandlers();
            this.initializeScrollManager();
            this.initializeAnalytics();
            
            this.isInitialized = true;
            console.log('[App] ✅ Initialisation arrière-plan terminée');
        } catch (error) {
            console.error('[App] Erreur initialisation arrière-plan:', error);
        }
    }
    
    checkPrerequisites() {
        if (!window.AppConfig) {
            console.error('[App] Configuration manquante');
            return false;
        }
        
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.error('[App] Configuration invalide:', validation.issues);
            return false;
        }
        
        return true;
    }
    
    showFallbackDashboard() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = this.getDashboardHTML();
        }
    }
    
    // =====================================
    // MÉTHODES DE PARAMÈTRES
    // =====================================
    async exportData() {
        console.log('[App] Export des données...');
        this.showToast('Export en cours...', 'info');
        
        try {
            const data = {
                user: this.user,
                provider: this.currentProvider,
                tasks: window.taskManager ? window.taskManager.getAllTasks() : [],
                categories: window.categoryManager ? window.categoryManager.getAllCategories() : [],
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emailsortpro-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Export terminé', 'success');
        } catch (error) {
            console.error('[App] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }
    
    clearCache() {
        console.log('[App] Vidage du cache...');
        
        if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
            // Vider le cache spécifique
            const keysToKeep = ['emailsortpro_client_id', 'emailsortpro_theme'];
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key) && key.startsWith('emailsortpro_cache_')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.showToast('Cache vidé', 'success');
        }
    }
    
    resetApp() {
        console.log('[App] Réinitialisation de l\'application...');
        
        if (confirm('⚠️ Cette action supprimera toutes vos données locales. Continuer ?')) {
            this.cleanup();
        }
    }
    
    // =====================================
    // MÉTHODES RANGER
    // =====================================
    async startAutoRanger() {
        console.log('[App] Démarrage du rangement automatique...');
        this.showToast('Analyse des emails en cours...', 'info');
        
        // Simuler le rangement
        setTimeout(() => {
            const preview = document.querySelector('.ranger-preview');
            if (preview) {
                preview.innerHTML = `
                    <h3>Aperçu du rangement</h3>
                    <div class="ranger-results">
                        <div class="ranger-category">
                            <i class="fas fa-briefcase"></i>
                            <span>Professionnel</span>
                            <span class="count">23 emails</span>
                        </div>
                        <div class="ranger-category">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Achats</span>
                            <span class="count">12 emails</span>
                        </div>
                        <div class="ranger-category">
                            <i class="fas fa-bell"></i>
                            <span>Notifications</span>
                            <span class="count">45 emails</span>
                        </div>
                    </div>
                    <button class="btn btn-success" onclick="window.app.confirmRanger()">
                        <i class="fas fa-check"></i> Confirmer le rangement
                    </button>
                `;
            }
            
            this.showToast('Analyse terminée', 'success');
        }, 2000);
    }
    
    confirmRanger() {
        console.log('[App] Confirmation du rangement...');
        this.showToast('Rangement en cours...', 'info');
        
        setTimeout(() => {
            this.showToast('80 emails ont été rangés avec succès', 'success');
            
            // Mettre à jour les stats
            const statsValue = document.querySelector('.ranger-stats .stat-box:last-child .stat-value');
            if (statsValue) {
                statsValue.textContent = '80';
            }
            
            // Réinitialiser l'aperçu
            const preview = document.querySelector('.ranger-preview');
            if (preview) {
                preview.innerHTML = `
                    <h3>Aperçu du rangement</h3>
                    <div class="preview-empty">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <p>Rangement terminé avec succès</p>
                    </div>
                `;
            }
        }, 1500);
    }
    
    configureFolders() {
        console.log('[App] Configuration des dossiers...');
        this.showToast('Configuration des dossiers à venir...', 'info');
    }
    
    // =====================================
    // MÉTHODES DE DIAGNOSTIC
    // =====================================
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            currentProvider: this.currentProvider,
            isAuthenticated: this.isAuthenticated,
            currentPage: this.currentPage,
            user: this.user ? {
                email: this.user.email || this.user.mail,
                name: this.user.displayName || this.user.name
            } : null,
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                uiManager: !!window.uiManager,
                taskManager: !!window.taskManager,
                pageManager: !!window.pageManager,
                dashboardModule: !!window.dashboardModule,
                analyticsManager: !!window.analyticsManager
            }
        };
    }
}

// =====================================
// INSTANCE GLOBALE
// =====================================
window.app = null;

// =====================================
// INITIALISATION AU CHARGEMENT
// =====================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] DOM chargé, initialisation de EmailSortPro v5.0...');
    
    try {
        // Injecter les styles
        document.head.insertAdjacentHTML('beforeend', appStyles);
        
        // Créer l'instance de l'application
        window.app = new EmailSortProApp();
        
        // Exposer les méthodes globales
        window.checkScrollNeeded = () => window.app.checkScrollNeeded();
        window.setPageMode = (page) => window.app.setPageMode(page);
        
    } catch (error) {
        console.error('[App] Erreur critique lors de l\'initialisation:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 3rem; border-radius: 20px; text-align: center; max-width: 500px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h1 style="color: #1f2937; margin-bottom: 1rem;">Erreur critique</h1>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${error.message}</p>
                    <button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;">
                        Recharger la page
                    </button>
                </div>
            </div>
        `;
    }
});

// =====================================
// FONCTIONS GLOBALES D'URGENCE
// =====================================
window.emergencyReset = function() {
    console.log('[App] Réinitialisation d\'urgence...');
    
    if (window.analyticsManager) {
        window.analyticsManager.trackEvent('emergency_reset', { trigger: 'manual' });
    }
    
    const keysToKeep = ['emailsortpro_client_id', 'emailsortpro_theme'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
        }
    });
    
    sessionStorage.clear();
    window.location.reload();
};

window.appDiagnostic = function() {
    console.group('🔍 DIAGNOSTIC APPLICATION');
    
    if (window.app) {
        const info = window.app.getDebugInfo();
        console.log('📱 État de l\'application:', info);
        
        // Test des services
        console.log('\n🧪 Test des services:');
        Object.entries(info.services).forEach(([service, available]) => {
            console.log(`${available ? '✅' : '❌'} ${service}`);
        });
        
        // Informations utilisateur
        if (info.user) {
            console.log('\n👤 Utilisateur connecté:');
            console.log(`Email: ${info.user.email}`);
            console.log(`Nom: ${info.user.name}`);
            console.log(`Provider: ${info.currentProvider}`);
        }
        
        return info;
    } else {
        console.log('❌ Instance de l\'application non disponible');
        return null;
    }
    
    console.groupEnd();
};

// =====================================
// STYLES CSS INTÉGRÉS
// =====================================
const appStyles = `
<style>
/* Loading Screen */
.app-loading-screen {
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
    transition: opacity 0.3s ease;
}

.app-loading-screen.fade-out {
    opacity: 0;
    pointer-events: none;
}

.loading-content {
    text-align: center;
    color: white;
}

.logo-animation {
    font-size: 5rem;
    margin-bottom: 2rem;
    animation: pulse 2s infinite;
}

.loading-progress {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin: 2rem auto;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: white;
    width: 30%;
    animation: loading 2s infinite;
}

@keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
}

/* Login Page Enhanced */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
    overflow: hidden;
}

.login-header {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.app-logo {
    font-size: 4rem;
    color: #667eea;
    margin-bottom: 1rem;
}

.login-body {
    padding: 3rem 2rem;
}

.login-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
}

.login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.login-button.google {
    background: #4285f4;
    color: white;
}

.login-button.google:hover {
    background: #357ae8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.login-button.microsoft {
    background: #0078d4;
    color: white;
}

.login-button.microsoft:hover {
    background: #106ebe;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

.login-features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 3rem;
}

.feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.9rem;
}

/* Provider Badges */
.provider-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
}

.provider-badge.google {
    background: linear-gradient(135deg, #4285f4, #34a853);
}

.provider-badge.microsoft {
    background: linear-gradient(135deg, #0078d4, #106ebe);
}

.provider-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    margin-left: 0.5rem;
}

.provider-indicator.google {
    background: #4285f4;
}

.provider-indicator.microsoft {
    background: #0078d4;
}

/* Dashboard Styles */
.dashboard-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.dashboard-date {
    color: #6b7280;
    font-size: 1rem;
}

.dashboard-welcome {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 3rem;
}

.dashboard-welcome h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-card.emails .stat-icon {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.stat-card.tasks .stat-icon {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.stat-card.scanned .stat-icon {
    background: rgba(251, 146, 60, 0.1);
    color: #fb923c;
}

.stat-card.organized .stat-icon {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
}

.stat-label {
    color: #6b7280;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.dashboard-actions {
    margin-bottom: 3rem;
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.action-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-card:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-2px);
}

.action-card i {
    font-size: 2rem;
    color: #667eea;
    display: block;
    margin-bottom: 0.5rem;
}

.action-card span {
    color: #4b5563;
    font-weight: 600;
}

.activity-list {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.activity-empty {
    text-align: center;
    color: #9ca3af;
    padding: 3rem;
}

.activity-empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Scanner Page */
.scanner-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.scanner-controls {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 2rem;
    align-items: flex-end;
    margin-bottom: 2rem;
}

.control-group {
    flex: 1;
}

.control-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4b5563;
    font-weight: 600;
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #667eea;
}

.btn-scan {
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
}

.scanner-progress {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.progress-bar-container {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.scanner-results {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    min-height: 300px;
}

.results-empty, .scan-complete {
    text-align: center;
    padding: 3rem;
}

.results-empty i, .scan-complete i {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.results-empty i {
    color: #9ca3af;
}

.scan-complete i {
    color: #10b981;
}

/* Emails Page */
.emails-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.emails-filters {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.filter-group {
    display: flex;
    gap: 0.5rem;
}

.filter-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-btn:hover {
    border-color: #667eea;
}

.filter-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
}

.filter-btn .count {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.1rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f3f4f6;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    flex: 1;
    max-width: 400px;
}

.search-box input {
    border: none;
    background: none;
    outline: none;
    flex: 1;
    font-size: 1rem;
}

.emails-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    min-height: 400px;
}

.emails-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #6b7280;
}

.emails-loading i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Tasks Page */
.tasks-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.tasks-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.tasks-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.task-column {
    background: #f3f4f6;
    border-radius: 12px;
    padding: 1rem;
    min-height: 500px;
}

.column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
}

.column-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #4b5563;
}

.task-count {
    background: #e5e7eb;
    color: #6b7280;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Ranger Page */
.ranger-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.ranger-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-box {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-box i {
    font-size: 2.5rem;
    color: #667eea;
}

.ranger-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.ranger-preview {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.preview-empty {
    text-align: center;
    padding: 3rem;
    color: #9ca3af;
}

.ranger-results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
}

.ranger-category {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f3f4f6;
    border-radius: 8px;
}

.ranger-category i {
    font-size: 1.5rem;
    color: #667eea;
}

.ranger-category span:first-of-type {
    flex: 1;
    font-weight: 600;
}

.ranger-category .count {
    color: #6b7280;
}

/* Settings Page */
.settings-container {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.settings-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.settings-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.settings-section h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    color: #1f2937;
}

.settings-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.setting-item label {
    font-weight: 600;
    color: #4b5563;
}

.setting-value {
    color: #1f2937;
}

.setting-toggle {
    display: flex;
    align-items: center;
}

.setting-toggle label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
}

.setting-toggle input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

/* Utility Classes */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a67d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: #6b7280;
    color: white;
}

.btn-secondary:hover {
    background: #4b5563;
}

.btn-success {
    background: #10b981;
    color: white;
}

.btn-success:hover {
    background: #059669;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-warning {
    background: #f59e0b;
    color: white;
}

.btn-warning:hover {
    background: #d97706;
}

/* Loading Modal */
.loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.loading-modal-content {
    background: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    text-align: center;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error Container */
.app-error-container, .config-error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
}

.error-content i {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.config-error-container .error-content i {
    color: #f59e0b;
}

/* Animations */
.animated {
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

.fadeIn {
    animation-name: fadeIn;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-stats {
        grid-template-columns: 1fr;
    }
    
    .action-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .tasks-board {
        grid-template-columns: 1fr;
    }
    
    .emails-filters {
        flex-direction: column;
    }
    
    .filter-group {
        flex-wrap: wrap;
    }
    
    .scanner-controls {
        flex-direction: column;
    }
}

/* Page Specific Body Classes */
body.page-dashboard {
    overflow: hidden;
}

body.page-scanner,
body.page-emails,
body.page-tasks,
body.page-ranger,
body.page-settings {
    overflow: auto;
}

/* Theme Support */
body.theme-dark {
    background: #1f2937;
    color: #e5e7eb;
}

body.theme-dark .dashboard-container,
body.theme-dark .scanner-container,
body.theme-dark .emails-container,
body.theme-dark .tasks-container,
body.theme-dark .ranger-container,
body.theme-dark .settings-container {
    color: #e5e7eb;
}

body.theme-dark .stat-card,
body.theme-dark .action-card,
body.theme-dark .scanner-controls,
body.theme-dark .scanner-results,
body.theme-dark .emails-filters,
body.theme-dark .emails-list,
body.theme-dark .settings-section,
body.theme-dark .ranger-preview {
    background: #374151;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

body.theme-dark .form-control,
body.theme-dark .filter-btn {
    background: #4b5563;
    border-color: #6b7280;
    color: #e5e7eb;
}

body.theme-dark .task-column {
    background: #374151;
}

/* Font Size Support */
body.font-small { font-size: 14px; }
body.font-medium { font-size: 16px; }
body.font-large { font-size: 18px; }
</style>
`;
