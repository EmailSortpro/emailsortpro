// PageManager.js - Version 13.0 - Gmail Compatible avec priorité Newsletter/Spam

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Gmail/Outlook detection et état
        this.currentProvider = null;
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: null
        };
        
        // Newsletter/Spam priority system
        this.categoryPriority = {
            'marketing_news': 100,  // PRIORITÉ ABSOLUE
            'spam': 95,
            'security': 90,
            'finance': 85,
            'tasks': 80,
            'meetings': 75,
            'commercial': 70,
            'support': 65,
            'hr': 60,
            'notifications': 55,
            'reminders': 50,
            'project': 45,
            'internal': 40,
            'cc': 35,
            'other': 0
        };
        
        // Page renderers - DASHBOARD SUPPRIMÉ
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.detectProviders();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 13.0 - Gmail Compatible avec priorité Newsletter/Spam');
        this.startPeriodicProviderCheck();
    }

    // ================================================
    // DÉTECTION PROVIDER GMAIL/OUTLOOK - RENFORCÉE
    // ================================================
    detectProviders() {
        console.log('[PageManager] 🔍 Détection providers email...');
        
        // Reset connection status
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: Date.now()
        };
        
        // PRIORITÉ 1: Gmail via GoogleAuthService
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                const isGmailAuth = window.googleAuthService.isAuthenticated();
                this.connectionStatus.gmail = isGmailAuth;
                
                if (isGmailAuth) {
                    this.currentProvider = 'gmail';
                    console.log('[PageManager] ✅ Gmail détecté et authentifié');
                    return 'gmail';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Gmail:', error);
            }
        }
        
        // PRIORITÉ 2: Outlook via AuthService
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function') {
            try {
                const isOutlookAuth = window.authService.isAuthenticated();
                this.connectionStatus.outlook = isOutlookAuth;
                
                if (isOutlookAuth) {
                    this.currentProvider = 'outlook';
                    console.log('[PageManager] ✅ Outlook détecté et authentifié');
                    return 'outlook';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Outlook:', error);
            }
        }
        
        console.log('[PageManager] ⚠️ Aucun provider email authentifié');
        this.currentProvider = null;
        return null;
    }

    getProviderInfo() {
        const provider = this.detectProviders();
        
        if (provider === 'gmail') {
            return {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                status: 'connected',
                priority: 'high',
                optimized: true
            };
        } else if (provider === 'outlook') {
            return {
                name: 'Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                status: 'connected',
                priority: 'normal',
                optimized: false
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-unlink',
            color: '#6b7280',
            status: 'disconnected',
            priority: 'none',
            optimized: false
        };
    }

    startPeriodicProviderCheck() {
        // Vérifier les providers toutes les 30 secondes
        setInterval(() => {
            const oldProvider = this.currentProvider;
            const newProvider = this.detectProviders();
            
            if (oldProvider !== newProvider) {
                console.log(`[PageManager] 🔄 Provider changé: ${oldProvider} → ${newProvider}`);
                this.updateProviderStatus();
            }
        }, 30000);
    }

    updateProviderStatus() {
        // Mettre à jour l'affichage si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.updateProviderInfoDisplay();
        }
        
        // Dispatcher un événement pour les autres composants
        this.dispatchEvent('providerChanged', {
            provider: this.currentProvider,
            connectionStatus: this.connectionStatus
        });
    }

    updateProviderInfoDisplay() {
        const providerDisplays = document.querySelectorAll('.provider-status-display');
        const providerInfo = this.getProviderInfo();
        
        providerDisplays.forEach(display => {
            if (display) {
                const statusClass = providerInfo.status === 'connected' ? 'connected' : 'disconnected';
                const optimizedBadge = providerInfo.optimized ? 
                    '<span class="optimization-badge">🚀 Optimisé</span>' : '';
                
                display.innerHTML = `
                    <div class="provider-info ${statusClass}" style="color: ${providerInfo.color};">
                        <i class="${providerInfo.icon}"></i>
                        <span>${providerInfo.name}</span>
                        ${optimizedBadge}
                    </div>
                `;
            }
        });
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION FIXÉE
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres depuis CategoriesPage
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter les changements génériques de paramètres
        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        // Écouter la recatégorisation des emails
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés, mise à jour interface');
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, données mises à jour');
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });

        // Écouter le scroll pour gérer la position fixe
        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });

        // Écouter les changements de provider
        window.addEventListener('providerChanged', (event) => {
            console.log('[PageManager] Provider changé:', event.detail);
            this.updateProviderInfoDisplay();
        });
    }

    // ================================================
    // GESTION POSITION FIXE POUR SCROLL
    // ================================================
    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.controls-and-filters-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        
        if (scrollY > containerTop - 20) {
            stickyContainer.classList.add('sticky-active');
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = stickyContainer.offsetHeight + 'px';
            }
        } else {
            stickyContainer.classList.remove('sticky-active');
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = '0';
            }
        }
    }

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES
    // ================================================
    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails?.();
                }, 100);
            }
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails?.();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
        }
    }

    // =====================================
    // PAGE LOADING - DASHBOARD IGNORÉ
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
            this.updateNavigation(pageName);
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.style.opacity = '1';
            }
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Container de contenu non trouvé');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager?.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    renderErrorPage(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                    Retour au tableau de bord
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ================================================
    // RENDU PAGE EMAILS - AVEC PRIORITÉ NEWSLETTER/SPAM
    // ================================================
    async renderEmails(container) {
        // Récupérer les emails depuis EmailScanner centralisé
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] 📧 Rendu page emails avec ${emails.length} emails`);
        console.log(`[PageManager] 🔌 Provider actuel: ${this.currentProvider}`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Priorité Newsletter/Spam - Analyse et correction
        this.ensureNewsletterSpamPriority(emails);

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const providerInfo = this.getProviderInfo();
            
            // Stats Newsletter/Spam
            const newsletterCount = emails.filter(e => e.category === 'marketing_news').length;
            const spamCount = emails.filter(e => e.category === 'spam').length;
            const preselectedCount = emails.filter(e => e.isPreselectedForTasks).length;
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Texte explicatif avec stats provider -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized ${providerInfo.status === 'connected' ? 'provider-connected' : 'provider-disconnected'}">
                            <div class="explanation-content">
                                <div class="explanation-main">
                                    <i class="fas fa-info-circle"></i>
                                    <span>
                                        Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action. 
                                        <strong>Newsletters et spam détectés automatiquement en priorité.</strong>
                                    </span>
                                </div>
                                <div class="explanation-stats">
                                    <span class="stat-item newsletter">📰 ${newsletterCount} newsletters</span>
                                    <span class="stat-item spam">🚫 ${spamCount} spam</span>
                                    <span class="stat-item preselected">⭐ ${preselectedCount} pré-sélectionnés</span>
                                    <span class="stat-item provider" style="color: ${providerInfo.color};">
                                        <i class="${providerInfo.icon}"></i> ${providerInfo.name}
                                    </span>
                                </div>
                            </div>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Container original des contrôles et filtres -->
                    <div class="controls-and-filters-container">
                        <!-- Barre de contrôles unifiée -->
                        <div class="controls-bar-single-line">
                            <!-- Status Provider -->
                            <div class="provider-status-display">
                                ${this.renderProviderStatus(providerInfo)}
                            </div>
                            
                            <!-- Barre de recherche -->
                            <div class="search-section">
                                <div class="search-box">
                                    <i class="fas fa-search search-icon"></i>
                                    <input type="text" 
                                           class="search-input" 
                                           id="emailSearchInput"
                                           placeholder="Rechercher..." 
                                           value="${this.searchTerm}">
                                    ${this.searchTerm ? `
                                        <button class="search-clear" onclick="window.pageManager.clearSearch()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Modes de vue -->
                            <div class="view-modes">
                                <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-domain')"
                                        title="Par domaine">
                                    <i class="fas fa-globe"></i>
                                    <span>Domaine</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-sender')"
                                        title="Par expéditeur">
                                    <i class="fas fa-user"></i>
                                    <span>Expéditeur</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('flat')"
                                        title="Liste complète">
                                    <i class="fas fa-list"></i>
                                    <span>Liste</span>
                                </button>
                            </div>
                            
                            <!-- Actions principales -->
                            <div class="action-buttons">
                                <!-- Bouton Sélectionner/Désélectionner tout -->
                                <button class="btn-action btn-selection-toggle" 
                                        onclick="window.pageManager.toggleAllSelection()"
                                        title="Sélectionner/Désélectionner tous les emails visibles">
                                    <i class="fas fa-check-square"></i>
                                    <span class="btn-text">Sélectionner tous</span>
                                    <span class="btn-count">(${this.getVisibleEmails().length})</span>
                                </button>
                                
                                <!-- Bouton Créer tâches -->
                                <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="window.pageManager.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-tasks"></i>
                                    <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                                </button>
                                
                                <!-- Bouton Actions -->
                                <div class="dropdown-action">
                                    <button class="btn-action btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                            onclick="window.pageManager.toggleBulkActions(event)"
                                            ${selectedCount === 0 ? 'disabled' : ''}>
                                        <i class="fas fa-ellipsis-v"></i>
                                        <span class="btn-text">Actions</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu" id="bulkActionsMenu">
                                        <button class="dropdown-item" onclick="window.pageManager.bulkMarkAsRead()">
                                            <i class="fas fa-eye"></i>
                                            <span>Marquer comme lu</span>
                                        </button>
                                        <button class="dropdown-item" onclick="window.pageManager.bulkArchive()">
                                            <i class="fas fa-archive"></i>
                                            <span>Archiver</span>
                                        </button>
                                        <button class="dropdown-item danger" onclick="window.pageManager.bulkDelete()">
                                            <i class="fas fa-trash"></i>
                                            <span>Supprimer</span>
                                        </button>
                                        <div class="dropdown-divider"></div>
                                        <button class="dropdown-item" onclick="window.pageManager.bulkExport()">
                                            <i class="fas fa-download"></i>
                                            <span>Exporter</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Bouton Actualiser -->
                                <button class="btn-action btn-secondary" onclick="window.pageManager.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span class="btn-text">Actualiser</span>
                                </button>
                                
                                <!-- Bouton Effacer sélection -->
                                ${selectedCount > 0 ? `
                                    <button class="btn-action btn-clear" 
                                            onclick="window.pageManager.clearSelection()"
                                            title="Effacer la sélection">
                                        <i class="fas fa-times"></i>
                                        <span class="btn-text">Effacer (${selectedCount})</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Filtres de catégories avec priorité Newsletter/Spam -->
                        <div class="status-filters-compact">
                            ${this.buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories)}
                        </div>
                    </div>

                    <!-- Container fixe (clone) -->
                    <div class="sticky-controls-container">
                        <!-- Contenu cloné dynamiquement -->
                    </div>

                    <!-- CONTENU DES EMAILS -->
                    <div class="tasks-container-harmonized">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addExpandedEmailStyles();
            this.setupEmailsEventListeners();
            this.setupStickyControls();
        };

        renderEmailsPage();
        
        // Auto-analyze si activé
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselectedCategories = this.getTaskPreselectedCategories();
            
            if (preselectedCategories && preselectedCategories.length > 0) {
                const emailsToAnalyze = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).slice(0, 5);
                
                if (emailsToAnalyze.length > 0) {
                    setTimeout(() => {
                        this.analyzeFirstEmails(emailsToAnalyze);
                    }, 1000);
                }
            }
        }
    }

    // ================================================
    // PRIORITÉ NEWSLETTER/SPAM - NOUVELLE MÉTHODE
    // ================================================
    ensureNewsletterSpamPriority(emails) {
        console.log('[PageManager] 🔍 Vérification priorité Newsletter/Spam...');
        
        let corrected = 0;
        
        emails.forEach(email => {
            const originalCategory = email.category;
            const correctedCategory = this.detectNewsletterSpamPriority(email);
            
            if (correctedCategory && correctedCategory !== originalCategory) {
                console.log(`[PageManager] 📰 Correction: "${email.subject?.substring(0, 40)}" ${originalCategory} → ${correctedCategory}`);
                email.category = correctedCategory;
                email.categoryScore = (email.categoryScore || 0) + 50;
                email.categoryConfidence = Math.max(email.categoryConfidence || 0, 0.9);
                email.priorityCorrection = true;
                corrected++;
            }
        });
        
        if (corrected > 0) {
            console.log(`[PageManager] ✅ ${corrected} emails corrigés avec priorité Newsletter/Spam`);
        }
    }

    detectNewsletterSpamPriority(email) {
        const content = this.extractEmailContentForAnalysis(email);
        
        // Patterns Newsletter - PRIORITÉ ABSOLUE
        const newsletterPatterns = [
            /unsubscribe|désabonner|se désinscrire/i,
            /newsletter|bulletin|lettre d'information/i,
            /mailing list|liste de diffusion/i,
            /view in browser|voir dans le navigateur/i,
            /email preferences|préférences email/i,
            /promotion|promo|offre spéciale|special offer/i,
            /limited offer|offre limitée|flash sale/i,
            /shop now|acheter maintenant|buy now/i,
            /you are receiving this|vous recevez cet email/i,
            /manage subscription|gérer abonnement/i
        ];
        
        // Patterns Spam
        const spamPatterns = [
            /urgent|urgence.*action/i,
            /félicitations.*gagné|congratulations.*won/i,
            /cliquez ici immédiatement|click here immediately/i,
            /réclamez maintenant|claim now/i,
            /offre exclusive.*expire/i,
            /100% gratuit.*aucun frais/i
        ];
        
        // Vérifier Newsletter en premier
        const hasNewsletterPattern = newsletterPatterns.some(pattern => 
            pattern.test(content.text) || 
            pattern.test(content.subject) ||
            pattern.test(content.sender)
        );
        
        if (hasNewsletterPattern) {
            return 'marketing_news';
        }
        
        // Vérifier Spam
        const hasSpamPattern = spamPatterns.some(pattern => 
            pattern.test(content.text) || 
            pattern.test(content.subject)
        );
        
        if (hasSpamPattern) {
            return 'spam';
        }
        
        // Vérifier domaine suspect
        if (this.isSuspiciousDomain(content.domain)) {
            return 'spam';
        }
        
        return null; // Pas de correction nécessaire
    }

    extractEmailContentForAnalysis(email) {
        const subject = email.subject || '';
        const body = email.bodyPreview || email.body?.content || '';
        const sender = email.from?.emailAddress?.address || '';
        const senderName = email.from?.emailAddress?.name || '';
        const domain = sender.includes('@') ? sender.split('@')[1] : '';
        
        return {
            text: (subject + ' ' + body + ' ' + senderName).toLowerCase(),
            subject: subject.toLowerCase(),
            sender: sender.toLowerCase(),
            domain: domain.toLowerCase()
        };
    }

    isSuspiciousDomain(domain) {
        const suspiciousDomains = [
            'temp-mail', 'guerrillamail', '10minutemail', 'mailinator',
            'throwaway', 'fakeinbox', 'yopmail', 'maildrop'
        ];
        
        return suspiciousDomains.some(suspicious => domain.includes(suspicious));
    }

    // ================================================
    // PROVIDER STATUS RENDERING
    // ================================================
    renderProviderStatus(providerInfo) {
        const statusClass = providerInfo.status === 'connected' ? 'connected' : 'disconnected';
        const optimizedBadge = providerInfo.optimized ? 
            '<span class="optimization-badge">🚀 Optimisé</span>' : '';
        
        return `
            <div class="provider-info ${statusClass}" style="color: ${providerInfo.color};">
                <i class="${providerInfo.icon}"></i>
                <span>${providerInfo.name}</span>
                ${optimizedBadge}
            </div>
        `;
    }

    // ================================================
    // FILTRES CATÉGORIES AVEC PRIORITÉ
    // ================================================
    buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        // ORDRE PRIORITAIRE: Newsletter/Spam d'abord
        const priorityOrder = [
            'all',
            'marketing_news', // NEWSLETTER EN PREMIER
            'spam',           // SPAM EN SECOND
            'security',
            'finance', 
            'tasks',
            'meetings',
            'commercial',
            'support',
            'hr',
            'notifications',
            'reminders',
            'project',
            'internal',
            'cc',
            'other'
        ];
        
        const tabs = [];
        
        // Ajouter "Tous" en premier
        tabs.push({
            id: 'all',
            name: 'Tous',
            icon: '📧',
            count: totalEmails,
            isPreselected: false,
            priority: 1000
        });
        
        // Ajouter les catégories dans l'ordre de priorité
        priorityOrder.slice(1).forEach(catId => {
            const count = categoryCounts[catId] || 0;
            const category = categories[catId];
            
            if (count > 0 && category) {
                const isPreselected = preselectedCategories.includes(catId);
                const priority = this.categoryPriority[catId] || 0;
                
                // Icônes spéciales pour Newsletter et Spam
                let icon = category.icon;
                let specialClass = '';
                
                if (catId === 'marketing_news') {
                    icon = '📰';
                    specialClass = 'newsletter-priority';
                } else if (catId === 'spam') {
                    icon = '🚫';
                    specialClass = 'spam-priority';
                }
                
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected,
                    priority: priority,
                    specialClass: specialClass
                });
            }
        });
        
        // Trier par priorité décroissante
        tabs.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-compact ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''} ${tab.specialClass || ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    // ================================================
    // SETUP CONTRÔLES COLLANTS - INCHANGÉ
    // ================================================
    setupStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        stickyContainer.innerHTML = originalContainer.innerHTML;
        this.setupEventListenersForStickyClone(stickyContainer);
        
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                this.syncStickyControls();
            }, 100);
        });
        
        observer.observe(originalContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    setupEventListenersForStickyClone(stickyContainer) {
        const searchInput = stickyContainer.querySelector('#emailSearchInput');
        if (searchInput) {
            searchInput.id = 'emailSearchInputSticky';
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        stickyContainer.querySelectorAll('.view-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (mode) {
                    this.changeViewMode(mode);
                }
            });
        });

        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('window.pageManager')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eval(onclickAttr);
                });
            }
        });

        stickyContainer.querySelectorAll('.status-pill-compact').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = pill.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (categoryId) {
                    this.filterByCategory(categoryId);
                }
            });
        });
    }

    syncStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        const originalSearch = originalContainer.querySelector('#emailSearchInput');
        const stickySearch = stickyContainer.querySelector('#emailSearchInputSticky');
        
        if (originalSearch && stickySearch && originalSearch.value !== stickySearch.value) {
            stickySearch.value = originalSearch.value;
        }

        const originalButtons = originalContainer.querySelectorAll('.active, .disabled');
        const stickyButtons = stickyContainer.querySelectorAll('button, .status-pill-compact');
        
        originalButtons.forEach((origBtn, index) => {
            const stickyBtn = stickyButtons[index];
            if (stickyBtn) {
                stickyBtn.className = origBtn.className;
            }
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES - EXTENSIONS
    // ================================================
    getTaskPreselectedCategories() {
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            return window.categoriesPage.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories pré-sélectionnées:', error);
            return [];
        }
    }

    renderEmptyEmailsState() {
        const providerInfo = this.getProviderInfo();
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                        'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.'
                    }
                </p>
                <div class="empty-state-actions">
                    ${providerInfo.status === 'connected' ? `
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                            <i class="fas fa-search"></i>
                            Aller au scanner
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    // ================================================
    // AUTRES MÉTHODES INCHANGÉES (sauf corrections)
    // ================================================
    
    // Toutes les autres méthodes restent identiques à la version précédente
    // (toggleAllSelection, toggleEmailSelection, updateControlsBarOnly, etc.)
    // Je les inclurai dans la suite pour la cohérence...

    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection email:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        this.updateControlsBarOnly();
        console.log('[PageManager] Total sélectionnés:', this.selectedEmails.size);
    }

    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        const updateContainer = (container) => {
            if (!container) return;
            
            const selectAllBtn = container.querySelector('.btn-selection-toggle');
            if (selectAllBtn) {
                const btnText = selectAllBtn.querySelector('.btn-text');
                const btnCount = selectAllBtn.querySelector('.btn-count');
                const icon = selectAllBtn.querySelector('i');
                
                if (allSelected) {
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectAllBtn.classList.add('all-selected');
                } else {
                    if (btnText) btnText.textContent = 'Sélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-square');
                        icon.classList.add('fa-check-square');
                    }
                    selectAllBtn.classList.remove('all-selected');
                }
                
                if (btnCount) {
                    btnCount.textContent = `(${visibleEmails.length})`;
                }
            }
            
            const createTaskBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createTaskBtn) {
                const span = createTaskBtn.querySelector('.btn-text');
                const countBadge = createTaskBtn.querySelector('.count-badge');
                
                if (selectedCount === 0) {
                    createTaskBtn.classList.add('disabled');
                    createTaskBtn.disabled = true;
                } else {
                    createTaskBtn.classList.remove('disabled');
                    createTaskBtn.disabled = false;
                }
                
                if (span) {
                    span.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
                }
                
                if (countBadge) {
                    if (selectedCount > 0) {
                        countBadge.textContent = selectedCount;
                        countBadge.style.display = 'inline';
                    } else {
                        countBadge.style.display = 'none';
                    }
                } else if (selectedCount > 0) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'count-badge';
                    newBadge.textContent = selectedCount;
                    createTaskBtn.appendChild(newBadge);
                }
            }
            
            const actionsBtn = container.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
            if (actionsBtn) {
                if (selectedCount === 0) {
                    actionsBtn.classList.add('disabled');
                    actionsBtn.disabled = true;
                } else {
                    actionsBtn.classList.remove('disabled');
                    actionsBtn.disabled = false;
                }
            }
            
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionButtonsContainer = container.querySelector('.action-buttons');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionButtonsContainer) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-action btn-clear';
                    clearBtn.onclick = () => window.pageManager.clearSelection();
                    clearBtn.title = 'Effacer la sélection';
                    clearBtn.innerHTML = `
                        <i class="fas fa-times"></i>
                        <span class="btn-text">Effacer (${selectedCount})</span>
                    `;
                    actionButtonsContainer.appendChild(clearBtn);
                } else if (existingClearBtn) {
                    const span = existingClearBtn.querySelector('.btn-text');
                    if (span) {
                        span.textContent = `Effacer (${selectedCount})`;
                    }
                }
            } else {
                if (existingClearBtn) {
                    existingClearBtn.remove();
                }
            }
        };
        
        updateContainer(document.querySelector('.controls-and-filters-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    refreshEmailsView() {
        console.log('[PageManager] Rafraîchissement vue emails...');
        
        const expandedGroups = new Set();
        document.querySelectorAll('.task-group-harmonized.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) {
                expandedGroups.add(groupKey);
            }
        });
        
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
            
            expandedGroups.forEach(groupKey => {
                const group = document.querySelector(`[data-group-key="${groupKey}"]`);
                if (group) {
                    const content = group.querySelector('.group-content-harmonized');
                    const icon = group.querySelector('.group-expand-harmonized i');
                    const header = group.querySelector('.group-header-harmonized');
                    
                    if (content && icon && header) {
                        content.style.display = 'block';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                        group.classList.add('expanded');
                        header.classList.add('expanded-header');
                    }
                }
            });
        }
        
        this.updateControlsBarOnly();
        
        setTimeout(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue && newSearchInput.value !== currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
            const stickySearchInput = document.getElementById('emailSearchInputSticky');
            if (stickySearchInput && currentSearchValue && stickySearchInput.value !== currentSearchValue) {
                stickySearchInput.value = currentSearchValue;
            }
        }, 50);
        
        console.log('[PageManager] Vue emails rafraîchie avec', this.selectedEmails.size, 'sélectionnés');
    }

    // [Toutes les autres méthodes restent identiques...]
    // Je continue avec les méthodes critiques pour l'affichage et la fonctionnalité

    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        console.log(`[PageManager] 📧 Rendu liste emails: ${emails.length} total, catégorie: ${this.currentCategory}`);
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        if (this.searchTerm) {
            const beforeSearch = filteredEmails.length;
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
            console.log(`[PageManager] 🔍 Après recherche "${this.searchTerm}": ${filteredEmails.length} (était ${beforeSearch})`);
        }
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(filteredEmails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(filteredEmails, this.currentViewMode);
            default:
                return this.renderFlatView(filteredEmails);
        }
    }

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    renderHarmonizedEmailRow(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        const preselectedCategories = this.getTaskPreselectedCategories();
        let isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
            isPreselectedForTasks = true;
            email.isPreselectedForTasks = true;
        }
        
        const isSelected = this.selectedEmails.has(email.id) || isPreselectedForTasks;
        
        if (isPreselectedForTasks && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        // Classes spéciales pour Newsletter/Spam
        let specialClasses = '';
        if (email.category === 'marketing_news') {
            specialClasses = 'newsletter-email';
        } else if (email.category === 'spam') {
            specialClasses = 'spam-email';
        } else if (email.priorityCorrection) {
            specialClasses = 'priority-corrected';
        }
        
        const cardClasses = [
            'task-harmonized-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected-task' : '',
            specialClasses
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar-harmonized" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">📧 Email</span>
                            <span class="deadline-badge-harmonized">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                            ${email.categoryScore ? `
                                <span class="confidence-badge-harmonized">
                                    🎯 ${Math.round(email.categoryConfidence * 100)}%
                                </span>
                            ` : ''}
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge-harmonized">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                            ${email.priorityCorrection ? `
                                <span class="correction-badge-harmonized">
                                    ✅ Corrigé
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-indicator-harmonized ${email.category === 'marketing_news' ? 'newsletter-category' : ''} ${email.category === 'spam' ? 'spam-category' : ''}" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};
                                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                ${isPreselectedForTasks ? ' ⭐' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-actions-harmonized">
                    ${this.renderHarmonizedEmailActions(email)}
                </div>
            </div>
        `;
    }

    renderHarmonizedEmailActions(email) {
        const hasTask = this.createdTasks.has(email.id);
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="action-btn-harmonized create-task" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn-harmonized view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                    title="Voir l'email">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // STYLES CSS ÉTENDUS AVEC NEWSLETTER/SPAM
    // ================================================
    addExpandedEmailStyles() {
        if (document.getElementById('expandedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'expandedEmailStyles';
        styles.textContent = `
            /* Variables CSS de base */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-height: 76px;
                --card-padding: 14px;
                --card-border-radius: 12px;
                --action-btn-size: 36px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --preselect-color: #8b5cf6;
                --newsletter-color: #f97316;
                --spam-color: #ef4444;
                --sticky-height: 180px;
            }
            
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            /* Texte explicatif amélioré avec stats provider */
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                backdrop-filter: blur(10px);
                position: relative;
            }

            .explanation-text-harmonized.provider-connected {
                background: rgba(16, 185, 129, 0.1);
                border-color: rgba(16, 185, 129, 0.3);
            }

            .explanation-text-harmonized.provider-disconnected {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .explanation-content {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
            }

            .explanation-main {
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
            }

            .explanation-stats {
                display: flex;
                flex-wrap: wrap;
                gap: var(--gap-medium);
                margin-top: var(--gap-small);
            }

            .stat-item {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .stat-item.newsletter {
                background: rgba(249, 115, 22, 0.1);
                color: var(--newsletter-color);
                border: 1px solid rgba(249, 115, 22, 0.3);
            }

            .stat-item.spam {
                background: rgba(239, 68, 68, 0.1);
                color: var(--spam-color);
                border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .stat-item.preselected {
                background: rgba(139, 92, 246, 0.1);
                color: var(--preselect-color);
                border: 1px solid rgba(139, 92, 246, 0.3);
            }

            .stat-item.provider {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                font-weight: 700;
            }
            
            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }

            /* Provider Status Display */
            .provider-status-display {
                flex-shrink: 0;
                margin-right: var(--gap-medium);
            }

            .provider-info {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: var(--btn-border-radius);
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .provider-info.connected {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }

            .provider-info.disconnected {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }

            .optimization-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 6px;
                font-weight: 700;
                border: 1px solid white;
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
            }

            /* ===== CONTAINERS POUR POSITION FIXE ===== */
            .controls-and-filters-container {
                position: relative;
                z-index: 100;
                background: transparent;
                margin-bottom: var(--gap-medium);
            }
            
            .sticky-controls-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: var(--gap-large);
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                opacity: 0;
                visibility: hidden;
            }
            
            .sticky-controls-container.sticky-active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }

            /* ===== BARRE DE CONTRÔLES UNIFIÉE ===== */
            .controls-bar-single-line {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: var(--gap-large);
                position: relative;
                z-index: 1000;
                min-height: var(--btn-height);
            }
            
            /* Section de recherche */
            .search-section {
                flex: 1;
                max-width: 400px;
                min-width: 250px;
            }
            
            .search-box {
                position: relative;
                width: 100%;
                height: var(--btn-height);
                display: flex;
                align-items: center;
            }
            
            .search-input {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-medium) 0 40px;
                border: 2px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
            }
            
            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-input::placeholder {
                color: #9ca3af;
                font-weight: 400;
            }
            
            .search-icon {
                position: absolute;
                left: var(--gap-medium);
                color: #6b7280;
                pointer-events: none;
                font-size: 14px;
                z-index: 1;
            }
            
            .search-input:focus + .search-icon {
                color: #3b82f6;
            }
            
            .search-clear {
                position: absolute;
                right: var(--gap-small);
                background: #ef4444;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all var(--transition-speed) ease;
            }
            
            .search-clear:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 3px;
                gap: 2px;
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            .view-mode {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 0 12px;
                height: calc(var(--btn-height) - 6px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 80px;
                white-space: nowrap;
            }
            
            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }
            
            .view-mode.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
            }

            /* Actions */
            .action-buttons {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
                position: relative;
                z-index: 1001;
            }
            
            .btn-action {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--gap-medium);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: var(--shadow-base);
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .btn-action:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed !important;
                pointer-events: none;
            }
            
            .btn-action.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-action.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-action.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-action.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .btn-action.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                min-width: 140px;
            }
            
            .btn-action.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }
            
            .btn-action.btn-selection-toggle.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-selection-toggle.all-selected:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-action.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-clear:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-text {
                font-weight: inherit;
            }
            
            .btn-count {
                font-size: 11px;
                opacity: 0.8;
                margin-left: 2px;
            }
            
            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
                animation: badgePulse 2s ease-in-out infinite;
            }

            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Dropdown */
            .dropdown-action {
                position: relative;
                display: inline-block;
                z-index: 1002;
            }
            
            .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                min-width: 200px;
                z-index: 9999;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
            }
            
            .dropdown-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 10px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                color: #374151;
                font-size: var(--btn-font-size);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .dropdown-item:hover {
                background: #f8fafc;
                color: #1f2937;
            }
            
            .dropdown-item.danger {
                color: #dc2626;
            }
            
            .dropdown-item.danger:hover {
                background: #fef2f2;
                color: #b91c1c;
            }

            /* ===== FILTRES CATÉGORIES AVEC PRIORITÉ NEWSLETTER/SPAM ===== */
            .status-filters-compact {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
                position: relative;
                z-index: 10;
                align-items: flex-start;
            }
            
            .status-pill-compact {
                height: 60px;
                padding: var(--gap-small);
                font-size: 12px;
                font-weight: 700;
                flex: 0 1 calc(16.666% - var(--gap-small));
                min-width: 120px;
                max-width: 180px;
                border-radius: var(--btn-border-radius);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
                position: relative;
                overflow: visible;
                z-index: 11;
            }

            /* Styles spéciaux pour Newsletter et Spam */
            .status-pill-compact.newsletter-priority {
                border-width: 2px;
                border-color: var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
                animation: newsletterPulse 3s ease-in-out infinite;
            }

            .status-pill-compact.spam-priority {
                border-width: 2px;
                border-color: var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
                animation: spamPulse 3s ease-in-out infinite;
            }

            @keyframes newsletterPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2); }
                50% { transform: scale(1.02); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
            }

            @keyframes spamPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2); }
                50% { transform: scale(1.02); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
            }
            
            .status-pill-compact.preselected-category {
                animation: pulsePreselected 3s ease-in-out infinite;
                border-width: 2px;
                border-color: var(--preselect-color);
            }
            
            .status-pill-compact.preselected-category::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border-radius: inherit;
                background: linear-gradient(45deg, var(--preselect-color), #a78bfa, var(--preselect-color));
                background-size: 300% 300%;
                animation: gradientShift 4s ease infinite;
                z-index: -1;
                opacity: 0.3;
            }
            
            @keyframes pulsePreselected {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            .pill-content-twolines {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                width: 100%;
                height: 100%;
                justify-content: center;
            }
            
            .pill-first-line-twolines {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .pill-icon-twolines {
                font-size: 16px;
            }
            
            .pill-count-twolines {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
                min-width: 18px;
                text-align: center;
            }
            
            .pill-second-line-twolines {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }
            
            .pill-text-twolines {
                font-weight: 700;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
            }
            
            .preselected-star {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: var(--preselect-color);
                color: white;
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                animation: starPulse 2s ease-in-out infinite;
                z-index: 15;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            @keyframes starPulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                }
                50% { 
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.6);
                }
            }
            
            .status-pill-compact:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
                z-index: 12;
            }
            
            .status-pill-compact.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
                z-index: 13;
            }
            
            .status-pill-compact.active.preselected-category {
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
            }

            .status-pill-compact.active.newsletter-priority {
                background: linear-gradient(135deg, var(--newsletter-color) 0%, #ea580c 100%);
                box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
            }

            .status-pill-compact.active.spam-priority {
                background: linear-gradient(135deg, var(--spam-color) 0%, #dc2626 100%);
                box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
            }
            
            .status-pill-compact.active .pill-count-twolines {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            /* Container des emails */
            .tasks-container-harmonized {
                background: transparent;
                transition: padding-top 0.3s ease;
            }
            
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* ===== CARTES D'EMAILS AVEC NEWSLETTER/SPAM STYLING ===== */
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                z-index: 1;
            }

            /* Styles spéciaux Newsletter */
            .task-harmonized-card.newsletter-email {
                border-left: 4px solid var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
            }

            .task-harmonized-card.newsletter-email:hover {
                border-left: 5px solid var(--newsletter-color);
                box-shadow: 0 8px 24px rgba(249, 115, 22, 0.15);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
            }

            /* Styles spéciaux Spam */
            .task-harmonized-card.spam-email {
                border-left: 4px solid var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
                opacity: 0.8;
            }

            .task-harmonized-card.spam-email:hover {
                border-left: 5px solid var(--spam-color);
                box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
                opacity: 1;
            }

            /* Emails corrigés par priorité */
            .task-harmonized-card.priority-corrected {
                border-left: 4px solid #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
            }
            
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 2;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }
            
            .task-harmonized-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid var(--preselect-color);
                border-color: rgba(139, 92, 246, 0.3);
            }
            
            .task-harmonized-card.preselected-task:hover {
                border-left: 4px solid var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
                border-color: rgba(139, 92, 246, 0.4);
            }
            
            .task-harmonized-card.preselected-task.selected {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-left: 4px solid var(--preselect-color);
                border-color: var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
            }
            
            .task-checkbox-harmonized {
                margin-right: var(--gap-medium);
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all var(--transition-speed) ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-harmonized-card.preselected-task .task-checkbox-harmonized:checked {
                background: var(--preselect-color);
                border-color: var(--preselect-color);
            }

            .task-harmonized-card.newsletter-email .task-checkbox-harmonized:checked {
                background: var(--newsletter-color);
                border-color: var(--newsletter-color);
            }

            .task-harmonized-card.spam-email .task-checkbox-harmonized:checked {
                background: var(--spam-color);
                border-color: var(--spam-color);
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: 4px;
            }
            
            .task-title-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
            }
            
            .task-type-badge-harmonized,
            .deadline-badge-harmonized,
            .confidence-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: #f8fafc;
                color: #64748b;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
                white-space: nowrap;
            }
            
            .confidence-badge-harmonized {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
            }
            
            .preselected-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                color: white !important;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
                animation: badgePulse 2s ease-in-out infinite;
            }

            .correction-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white !important;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
            }
            
            .reply-indicator-harmonized {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
            }
            
            .category-indicator-harmonized {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
                transition: all 0.2s ease;
            }

            .category-indicator-harmonized.newsletter-category {
                border: 2px solid var(--newsletter-color);
                box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                animation: newsletterCategoryGlow 2s ease-in-out infinite;
            }

            .category-indicator-harmonized.spam-category {
                border: 2px solid var(--spam-color);
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                animation: spamCategoryGlow 2s ease-in-out infinite;
            }

            @keyframes newsletterCategoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.4);
                }
            }

            @keyframes spamCategoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
                }
            }
            
            .task-harmonized-card.preselected-task .category-indicator-harmonized {
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                animation: categoryGlow 2s ease-in-out infinite;
            }

            @keyframes categoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5);
                }
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
                z-index: 10;
                position: relative;
            }
            
            .action-btn-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                z-index: 11;
                position: relative;
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.create-task {
                color: #3b82f6;
            }
            
            .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task {
                color: var(--preselect-color);
                background: rgba(139, 92, 246, 0.1);
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-color: var(--preselect-color);
                color: #7c3aed;
            }

            .task-harmonized-card.newsletter-email .action-btn-harmonized.create-task {
                color: var(--newsletter-color);
                background: rgba(249, 115, 22, 0.1);
            }

            .task-harmonized-card.newsletter-email .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
                border-color: var(--newsletter-color);
                color: #ea580c;
            }

            .task-harmonized-card.spam-email .action-btn-harmonized.create-task {
                color: var(--spam-color);
                background: rgba(239, 68, 68, 0.1);
            }

            .task-harmonized-card.spam-email .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                border-color: var(--spam-color);
                color: #dc2626;
            }
            
            .action-btn-harmonized.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }
            
            .action-btn-harmonized.view-task:hover {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }

            /* Vue groupée - inchangée mais compatible */
            .tasks-grouped-harmonized {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-group-harmonized {
                background: transparent;
                border: none;
                border-radius: 0;
                overflow: visible;
                margin: 0;
                padding: 0;
                z-index: 1;
            }
            
            .group-header-harmonized {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                gap: var(--gap-medium);
                z-index: 1;
            }
            
            .group-avatar-harmonized {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 16px;
                flex-shrink: 0;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            
            .group-info-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .group-name-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .group-meta-harmonized {
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .group-expand-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
            }
            
            .group-content-harmonized {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }

            /* État vide harmonisé */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-harmonized {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
            }

            .empty-state-actions {
                display: flex;
                gap: var(--gap-medium);
                justify-content: center;
                flex-wrap: wrap;
            }

            /* États vide standard */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
                margin-left: auto;
                margin-right: auto;
            }

            /* Boutons dans empty state */
            .empty-state .btn,
            .empty-state-harmonized .btn,
            .btn {
                display: inline-flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 12px 24px;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                text-decoration: none;
                border: 1px solid transparent;
                white-space: nowrap;
            }

            .btn.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn.btn-secondary {
                background: white;
                color: #374151;
                border-color: #e5e7eb;
                box-shadow: var(--shadow-base);
            }

            .btn.btn-secondary:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }

            /* RESPONSIVE ÉTENDU */
            @media (max-width: 1400px) {
                .status-pill-compact {
                    flex: 0 1 calc(20% - var(--gap-small));
                    min-width: 100px;
                    max-width: 160px;
                }
            }
            
            @media (max-width: 1200px) {
                .status-pill-compact {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 80px;
                    max-width: 140px;
                }
            }
            
            @media (max-width: 1024px) {
                .status-pill-compact {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 70px;
                    max-width: 120px;
                    height: 52px;
                }
                
                .controls-bar-single-line {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .search-section {
                    max-width: none;
                    order: 1;
                }
                
                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }

                .provider-status-display {
                    order: 0;
                    margin-right: 0;
                    margin-bottom: var(--gap-small);
                }
                
                .dropdown-menu {
                    right: auto;
                    left: 0;
                }
            }
            
            @media (max-width: 768px) {
                .status-filters-compact {
                    flex-wrap: wrap;
                    gap: 2px;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    background: transparent;
                }
                
                .status-pill-compact {
                    flex: 0 1 calc(50% - 1px);
                    min-width: 0;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .view-mode span,
                .btn-action .btn-text {
                    display: none;
                }
                
                .view-mode {
                    min-width: 44px;
                    padding: 0;
                    justify-content: center;
                }
                
                .btn-action {
                    padding: 0 var(--gap-small);
                    min-width: 44px;
                    justify-content: center;
                }
                
                .btn-action .btn-count {
                    display: none;
                }
                
                .search-input {
                    font-size: 14px;
                    padding: 0 var(--gap-small) 0 36px;
                }
                
                .search-icon {
                    left: var(--gap-small);
                    font-size: 14px;
                }

                .explanation-stats {
                    justify-content: center;
                }

                .stat-item {
                    font-size: 11px;
                    padding: 3px 6px;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-compact {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .status-pill-compact {
                    flex: none;
                    width: 100%;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .controls-bar-single-line {
                    padding: var(--gap-small);
                    gap: var(--gap-small);
                }
                
                .action-buttons {
                    flex-direction: column;
                    gap: var(--gap-small);
                    align-items: stretch;
                }
                
                .action-buttons > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .dropdown-menu {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 300px;
                }
                
                .sticky-controls-container {
                    padding: var(--gap-small);
                }

                .explanation-content {
                    align-items: center;
                }

                .explanation-stats {
                    flex-direction: column;
                    align-items: center;
                    gap: var(--gap-small);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES RESTANTES INCHANGÉES (mais avec corrections mineures)
    // ================================================
    
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.refreshEmailsView();
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput && stickySearchInput.value !== term) {
            stickySearchInput.value = term;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput) stickySearchInput.value = '';
        
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        console.log(`[PageManager] 🔍 Filtrage par catégorie: ${categoryId}`);
        
        this.currentCategory = categoryId;
        
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails;
        
        if (categoryId === 'all') {
            filteredEmails = emails;
            console.log(`[PageManager] 📧 Affichage de tous les emails: ${emails.length}`);
        } else if (categoryId === 'other') {
            filteredEmails = emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            });
            console.log(`[PageManager] 📌 Emails "Autre" trouvés: ${filteredEmails.length}`);
        } else {
            filteredEmails = emails.filter(email => email.category === categoryId);
            console.log(`[PageManager] 🏷️ Emails dans catégorie "${categoryId}": ${filteredEmails.length}`);
        }
        
        this.refreshEmailsView();
        
        ['', 'Sticky'].forEach(suffix => {
            const containerSelector = suffix ? '.sticky-controls-container' : '.controls-and-filters-container';
            const container = document.querySelector(containerSelector);
            if (container) {
                container.querySelectorAll('.status-pill-compact').forEach(pill => {
                    const pillCategoryId = pill.dataset.categoryId;
                    if (pillCategoryId === categoryId) {
                        pill.classList.add('active');
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('[PageManager] Toggle groupe:', groupKey);
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) {
            console.error('[PageManager] Groupe non trouvé:', groupKey);
            return;
        }
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (!content || !icon || !header) {
            console.error('[PageManager] Éléments du groupe manquants');
            return;
        }
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
        }
    }

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') {
            return;
        }
        
        if (event.target.closest('.task-actions-harmonized')) {
            return;
        }
        
        if (event.target.closest('.group-header-harmonized')) {
            return;
        }
        
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        this.lastEmailClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                this.showEmailModal(emailId);
            }
        }, 250);
    }

    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="tasks-grouped-harmonized">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="task-group-harmonized" data-group-key="${group.key}">
                <div class="group-header-harmonized" onclick="event.preventDefault(); event.stopPropagation(); window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar-harmonized" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info-harmonized">
                        <div class="group-name-harmonized">${displayName}</div>
                        <div class="group-meta-harmonized">${group.count} email${group.count > 1 ? 's' : ''} • ${this.formatEmailDate(group.latestDate)}</div>
                    </div>
                    <div class="group-expand-harmonized" onclick="event.preventDefault(); event.stopPropagation();">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        const providerInfo = this.getProviderInfo();
        
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email pour le moment.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = providerInfo.status === 'connected' ? 
                `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.';
            
            if (providerInfo.status === 'connected') {
                action = `
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        <span>Aller au scanner</span>
                    </button>
                `;
            } else {
                action = `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            <span>Se connecter à Gmail</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter à Outlook</span>
                        </button>
                    </div>
                `;
            }
        }
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">${title}</h3>
                <p class="empty-state-text-harmonized">${text}</p>
                ${action}
            </div>
        `;
    }

    // ================================================
    // MÉTHODES UTILITAIRES ET HELPERS
    // ================================================
    
    calculateCategoryCounts(emails) {
        console.log('[PageManager] 📊 Calcul des comptages de catégories...');
        
        const counts = {};
        let uncategorizedCount = 0;
        
        emails.forEach(email => {
            const cat = email.category;
            
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                uncategorizedCount++;
            }
        });
        
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
            console.log(`[PageManager] 📌 ${uncategorizedCount} emails dans la catégorie "Autre"`);
        }
        
        console.log('[PageManager] 📊 Comptages finaux:', {
            categories: counts,
            totalEmails: emails.length,
            sumCounts: Object.values(counts).reduce((sum, count) => sum + count, 0)
        });
        
        const totalCounted = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (totalCounted !== emails.length) {
            console.error(`[PageManager] ❌ ERREUR COMPTAGE: ${totalCounted} comptés vs ${emails.length} emails totaux`);
        }
        
        return counts;
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    emails: [],
                    count: 0,
                    latestDate: null
                };
            }
            
            groups[groupKey].emails.push(email);
            groups[groupKey].count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!groups[groupKey].latestDate || emailDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = emailDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    generateAvatarColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%))`;
    }

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        if (email.category === 'marketing_news') return '#f97316';
        if (email.category === 'spam') return '#ef4444';
        return '#3b82f6';
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getEmailContent(email) {
        if (email.body?.content) {
            let content = email.body.content;
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }

    getCategoryColor(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.name || categoryId || 'Autre';
    }

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               sender.includes(search) || 
               senderEmail.includes(search) || 
               preview.includes(search);
    }

    // ================================================
    // ACTIONS BULK ET CRÉATION DE TÂCHES
    // ================================================
    
    toggleBulkActions(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('bulkActionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        const isCurrentlyVisible = menu.classList.contains('show');
        
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
            if (dropdown !== menu) {
                dropdown.classList.remove('show');
            }
        });
        
        document.querySelectorAll('.dropdown-toggle.show').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('show');
            }
        });
        
        const existingOverlay = document.querySelector('.dropdown-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (isCurrentlyVisible) {
            menu.classList.remove('show');
            button.classList.remove('show');
        } else {
            menu.classList.add('show');
            button.classList.add('show');
            
            menu.style.zIndex = '9999';
            menu.style.position = 'absolute';
            
            const overlay = document.createElement('div');
            overlay.className = 'dropdown-overlay show';
            overlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 9998 !important;
                background: rgba(0, 0, 0, 0.05) !important;
                cursor: pointer !important;
                display: block !important;
            `;
            
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.remove('show');
                button.classList.remove('show');
                overlay.remove();
            });
            
            document.body.appendChild(overlay);
            
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    menu.classList.remove('show');
                    button.classList.remove('show');
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            setTimeout(() => {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    button.classList.remove('show');
                    if (overlay.parentNode) {
                        overlay.remove();
                    }
                }
            }, 15000);
        }
    }

    async bulkMarkAsRead() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (window.emailScanner) {
            await window.emailScanner.performBatchAction(selectedEmails, 'markAsRead');
        } else {
            window.uiManager?.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
        }
        this.clearSelection();
    }

    async bulkArchive() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Archiver ${selectedEmails.length} email(s) ?`)) {
            window.uiManager?.showToast(`${selectedEmails.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Supprimer définitivement ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
            if (window.emailScanner) {
                await window.emailScanner.performBatchAction(selectedEmails, 'delete');
            } else {
                window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            }
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (window.emailScanner) {
            window.emailScanner.exportResults('csv');
        } else {
            const emails = selectedEmails.map(id => this.getEmailById(id)).filter(Boolean);
            
            const csvContent = [
                ['De', 'Sujet', 'Date', 'Catégorie', 'Provider', 'Contenu'].join(','),
                ...emails.map(email => [
                    `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                    `"${email.subject || ''}"`,
                    email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                    `"${this.getCategoryName(email.category)}"`,
                    `"${this.currentProvider || 'unknown'}"`,
                    `"${(email.bodyPreview || '').substring(0, 100)}"`
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `emails_${this.currentProvider || 'scan'}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.uiManager?.showToast('Export terminé', 'success');
        }
        this.clearSelection();
    }

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager?.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                let analysis = this.aiAnalysisResults.get(emailId);
                if (!analysis && window.aiTaskAnalyzer) {
                    analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(emailId, analysis);
                }
                
                if (analysis && window.taskManager) {
                    const taskData = this.buildTaskDataFromAnalysis(email, analysis);
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManager] Erreur création tâche:', emailId, error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} (${this.currentProvider || 'scan'})`, 'success');
            this.clearSelection();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
        }
    }

    buildTaskDataFromAnalysis(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        
        return {
            id: this.generateTaskId(),
            title: analysis.mainTask?.title || `Email de ${senderName}`,
            description: analysis.mainTask?.description || analysis.summary || '',
            priority: analysis.mainTask?.priority || 'medium',
            dueDate: analysis.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            aiAnalysis: analysis,
            tags: [senderDomain, analysis.importance, ...(analysis.tags || [])].filter(Boolean),
            method: 'ai',
            provider: this.currentProvider || 'unknown'
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ================================================
    // MODALES ET INTERACTIONS
    // ================================================
    
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            window.uiManager?.showLoading('Analyse de l\'email...');
            analysis = await window.aiTaskAnalyzer?.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager?.hideLoading();
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'analyse', 'error');
            return;
        }

        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildTaskCreationModal(uniqueId, email, analysis);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskCreationModal(uniqueId, email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const providerInfo = this.getProviderInfo();
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Créer une tâche</h2>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; color: ${providerInfo.color};">
                                <i class="${providerInfo.icon}"></i>
                                <span style="font-size: 14px; font-weight: 600;">${providerInfo.name}</span>
                                ${email.category === 'marketing_news' ? '<span style="background: #f97316; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">📰 Newsletter</span>' : ''}
                                ${email.category === 'spam' ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">🚫 Spam</span>' : ''}
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        ${this.buildTaskCreationForm(email, analysis)}
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    buildTaskCreationForm(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-robot" style="color: #0ea5e9; font-size: 20px;"></i>
                    <span style="color: #0c4a6e; font-weight: 600;">Analyse intelligente par Claude AI - Depuis ${this.currentProvider || 'email'}</span>
                </div>
                
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: ${this.generateAvatarColor(senderName)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                        ${senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1f2937; font-size: 16px;">${senderName}</div>
                        <div style="color: #6b7280; font-size: 14px;">${senderEmail}</div>
                        <div style="color: #9ca3af; font-size: 12px;">@${senderDomain}</div>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Titre de la tâche</label>
                    <input type="text" id="task-title" 
                           style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                           value="${enhancedTitle}" 
                           onfocus="this.style.borderColor='#3b82f6'"
                           onblur="this.style.borderColor='#e5e7eb'" />
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Description</label>
                    <textarea id="task-description" 
                              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 100px; transition: border-color 0.2s;"
                              onfocus="this.style.borderColor='#3b82f6'"
                              onblur="this.style.borderColor='#e5e7eb'"
                              rows="4">${analysis.mainTask.description || analysis.summary || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Priorité</label>
                        <select id="task-priority" 
                                style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                                onfocus="this.style.borderColor='#3b82f6'"
                                onblur="this.style.borderColor='#e5e7eb'">
                            <option value="urgent" ${analysis.mainTask.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis.mainTask.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${analysis.mainTask.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis.mainTask.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Date d'échéance</label>
                        <input type="date" id="task-duedate" 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='#3b82f6'"
                               onblur="this.style.borderColor='#e5e7eb'"
                               value="${analysis.mainTask.dueDate || ''}" />
                    </div>
                </div>
                
                <div>
                    <button onclick="window.pageManager.toggleEmailContext()" 
                            style="width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #475569; transition: background 0.2s;"
                            onmouseover="this.style.background='#f1f5f9'"
                            onmouseout="this.style.background='#f8fafc'">
                        <i class="fas fa-chevron-right" id="context-toggle-icon" style="transition: transform 0.2s;"></i>
                        <span>Afficher le contenu original de l'email</span>
                    </button>
                    <div id="email-context-content" style="display: none; margin-top: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                            <div style="margin-bottom: 4px;"><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</div>
                            <div style="margin-bottom: 4px;"><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</div>
                            <div><strong>Sujet:</strong> ${email.subject || 'Sans sujet'}</div>
                        </div>
                        <div style="max-height: 200px; overflow-y: auto; font-size: 14px; line-height: 1.5; color: #374151;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    toggleEmailContext() {
        const content = document.getElementById('email-context-content');
        const icon = document.getElementById('context-toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            icon.style.transform = 'rotate(90deg)';
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.transform = 'rotate(0deg)';
        }
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        const analysis = this.aiAnalysisResults.get(emailId);
        
        if (!email || !analysis) {
            window.uiManager?.showToast('Données manquantes', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = this.buildTaskDataFromAnalysis(email, {
                ...analysis,
                mainTask: {
                    ...analysis.mainTask,
                    title,
                    description,
                    priority,
                    dueDate
                }
            });

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                window.uiManager?.showToast(`Tâche créée avec succès (${this.currentProvider || 'email'})`, 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const providerInfo = this.getProviderInfo();
        const uniqueId = 'email_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Email Complet</h2>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; color: ${providerInfo.color};">
                                <i class="${providerInfo.icon}"></i>
                                <span style="font-size: 14px; font-weight: 600;">${providerInfo.name}</span>
                                ${email.category === 'marketing_news' ? '<span style="background: #f97316; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">📰 Newsletter</span>' : ''}
                                ${email.category === 'spam' ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">🚫 Spam</span>' : ''}
                                ${email.priorityCorrection ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✅ Corrigé</span>' : ''}
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">De:</span>
                                <span style="color: #1f2937;">${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                            </div>
                            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">Date:</span>
                                <span style="color: #1f2937;">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">Sujet:</span>
                                <span style="color: #1f2937; font-weight: 600;">${email.subject || 'Sans sujet'}</span>
                            </div>
                            ${email.category && email.category !== 'other' ? `
                                <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 60px;">Catégorie:</span>
                                    <span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; max-height: 400px; overflow-y: auto; line-height: 1.6; color: #374151;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                    style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // ================================================
    // MÉTHODES UTILITAIRES FINALES
    // ================================================
    
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                await window.emailScanner.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            window.uiManager?.showToast(`Emails actualisés (${this.currentProvider || 'provider'})`, 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        }
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                if (window.tasksView?.showTaskDetails) {
                    window.tasksView.showTaskDetails(taskId);
                }
            }, 100);
        });
    }

    getEmailById(emailId) {
        return window.emailScanner?.getEmailById(emailId) || null;
    }

    async analyzeFirstEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('[PageManager] Erreur analyse email:', error);
                }
            }
        }
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'PageManager',
                    timestamp: Date.now(),
                    provider: this.currentProvider
                }
            }));
        } catch (error) {
            console.error(`[PageManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // AUTRES PAGES - AVEC PROVIDER INFO
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Utilisation ScanStartModule moderne');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule, fallback:', error);
            }
        }
        
        const providerInfo = this.getProviderInfo();
        console.log('[PageManager] Utilisation interface scanner fallback');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Module de scan en cours de chargement...` :
                        'Connectez-vous à Gmail ou Outlook pour commencer.'
                    }
                </p>
                ${providerInfo.status !== 'connected' ? `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails ${this.currentProvider || 'scannés'}</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                        ${id === 'marketing_news' ? '<span class="priority-badge">🚀 Priorité Newsletter/Spam</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSettings(container) {
        if (window.categoriesPage) {
            window.categoriesPage.renderSettings(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Paramètres</h1>
                </div>
                
                <div class="settings-card">
                    <h3>Configuration IA</h3>
                    <p>Provider actuel: <strong style="color: ${providerInfo.color};">${providerInfo.name}</strong></p>
                    <button class="btn primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        <i class="fas fa-cog"></i> Configurer Claude AI
                    </button>
                </div>
            `;
        }
    }

    async renderRanger(container) {
        if (window.domainOrganizer && window.domainOrganizer.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">
                        Organisez vos emails ${providerInfo.name} par domaine. Module en cours de chargement...
                    </p>
                </div>
            `;
        }
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE SÉCURISÉE
// ================================================
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.pageManager.destroy?.();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage:', e);
    }
}

console.log('[PageManager] 🚀 Création nouvelle instance v13.0...');
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

// ================================================
// FONCTIONS DE TEST GLOBALES
// ================================================
window.testPageManagerGmail = function() {
    console.group('🧪 TEST PageManager v13.0 - Gmail Compatible');
    
    const debugInfo = {
        currentProvider: window.pageManager.currentProvider,
        connectionStatus: window.pageManager.connectionStatus,
        providerInfo: window.pageManager.getProviderInfo(),
        categoryPriority: window.pageManager.categoryPriority,
        emails: window.emailScanner?.getAllEmails?.()?.length || 0
    };
    
    console.log('Debug Info:', debugInfo);
    console.log('Provider détecté:', window.pageManager.detectProviders());
    console.log('Status connexions:', window.pageManager.connectionStatus);
    
    // Test priorité Newsletter/Spam
    if (window.emailScanner?.getAllEmails) {
        const emails = window.emailScanner.getAllEmails();
        const newsletterEmails = emails.filter(e => e.category === 'marketing_news');
        const spamEmails = emails.filter(e => e.category === 'spam');
        const correctedEmails = emails.filter(e => e.priorityCorrection);
        
        console.log('📰 Newsletters détectées:', newsletterEmails.length);
        console.log('🚫 Spam détecté:', spamEmails.length);
        console.log('✅ Emails corrigés:', correctedEmails.length);
    }
    
    console.groupEnd();
    return { 
        success: true, 
        provider: debugInfo.currentProvider,
        connected: debugInfo.providerInfo.status === 'connected',
        version: '13.0-Gmail-Compatible'
    };
};

window.debugNewsletterSpamDetection = function() {
    console.group('🔍 DEBUG Détection Newsletter/Spam');
    
    if (!window.emailScanner?.getAllEmails) {
        console.log('❌ Aucun email disponible pour le test');
        console.groupEnd();
        return;
    }
    
    const emails = window.emailScanner.getAllEmails();
    console.log(`📧 Total emails: ${emails.length}`);
    
    // Analyser par catégorie
    const categories = {};
    emails.forEach(email => {
        const cat = email.category || 'undefined';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('📊 Distribution par catégorie:');
    Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([cat, count]) => {
            const priority = window.pageManager.categoryPriority[cat] || 0;
            console.log(`  ${cat}: ${count} emails (priorité: ${priority})`);
        });
    
    // Tester la correction automatique
    const testEmails = [
        { subject: "Newsletter hebdomadaire - Unsubscribe here", category: 'other' },
        { subject: "Promotion spéciale 50% - Désabonnez-vous", category: 'tasks' },
        { subject: "Spam: Félicitations vous avez gagné!", category: 'notifications' }
    ];
    
    console.log('🧪 Test correction automatique:');
    testEmails.forEach(email => {
        const correction = window.pageManager.detectNewsletterSpamPriority(email);
        console.log(`  "${email.subject}" → ${email.category} → ${correction || 'pas de correction'}`);
    });
    
    console.groupEnd();
};

console.log('✅ PageManager v13.0 loaded - Gmail Compatible avec priorité Newsletter/Spam fonctionnelle!');
