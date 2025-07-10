// PageManagerGmail.js - Version 22.0 - Gestionnaire Gmail Complet et Unifié

console.log('[PageManagerGmail] 🚀 Loading v22.0 - Complete Gmail Manager...');

class PageManagerGmail {
    constructor() {
        // État principal
        this.currentPage = null;
        this.emails = [];
        this.selectedEmails = new Set();
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.isInitialized = false;
        this.currentViewMode = 'flat'; // flat, grouped-domain, grouped-sender
        this.createdTasks = new Map();
        this.hideExplanation = this.getLocalStorageItem('hideGmailExplanation') === 'true';
        
        // État de synchronisation
        this.syncState = {
            authenticated: false,
            lastSync: null,
            emailCount: 0,
            provider: 'gmail'
        };
        
        // Cache pour optimisation
        this._categoriesCache = null;
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        console.log('[PageManagerGmail] ✅ Initialized v22.0');
        this.init();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async init() {
        try {
            console.log('[PageManagerGmail] 🔧 Initializing...');
            
            // Vérifier l'authentification Google
            await this.checkAuthentication();
            
            // Charger les emails depuis la session si disponibles
            this.loadEmailsFromSession();
            
            // S'abonner aux événements
            this.setupEventListeners();
            
            // Ajouter les styles une fois
            this.addStyles();
            
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Ready - Complete Gmail Manager');
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Init error:', error);
        }
    }

    // ================================================
    // STOCKAGE LOCAL
    // ================================================
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

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async checkAuthentication() {
        console.log('[PageManagerGmail] 🔐 Checking authentication...');
        
        try {
            // Vérifier via GoogleAuthService
            if (window.googleAuthService?.isAuthenticated) {
                const isAuth = await window.googleAuthService.isAuthenticated();
                this.syncState.authenticated = isAuth;
                console.log('[PageManagerGmail] Google Auth:', isAuth ? 'Connecté' : 'Non connecté');
                return isAuth;
            }
            
            // Vérifier via MailService
            if (window.mailService?.getCurrentProvider) {
                const provider = window.mailService.getCurrentProvider();
                this.syncState.authenticated = (provider === 'google' || provider === 'gmail');
                return this.syncState.authenticated;
            }
            
            // Vérifier via localStorage
            const authToken = this.getLocalStorageItem('googleAuthToken');
            this.syncState.authenticated = !!authToken;
            
            return this.syncState.authenticated;
            
        } catch (error) {
            console.error('[PageManagerGmail] Auth check error:', error);
            return false;
        }
    }

    // ================================================
    // CHARGEMENT DES EMAILS
    // ================================================
    loadEmailsFromSession() {
        try {
            console.log('[PageManagerGmail] 📥 Loading emails from session...');
            
            // Depuis EmailScanner
            if (window.emailScanner?.emails) {
                this.emails = window.emailScanner.emails.filter(e => 
                    !e.provider || e.provider === 'google' || e.provider === 'gmail'
                );
                console.log(`[PageManagerGmail] ✅ ${this.emails.length} emails Gmail chargés depuis EmailScanner`);
                this.syncState.emailCount = this.emails.length;
                return;
            }
            
            // Depuis sessionStorage
            const scanResults = sessionStorage.getItem('scanResults');
            if (scanResults) {
                const data = JSON.parse(scanResults);
                if (data.provider === 'google' || data.provider === 'gmail') {
                    this.emails = data.emails || [];
                    console.log(`[PageManagerGmail] 📥 ${this.emails.length} emails chargés depuis sessionStorage`);
                    this.syncState.emailCount = this.emails.length;
                }
            }
            
            // Depuis localStorage
            const savedEmails = this.getLocalStorageItem('gmailEmails');
            if (savedEmails) {
                this.emails = JSON.parse(savedEmails);
                console.log(`[PageManagerGmail] 💾 ${this.emails.length} emails chargés depuis localStorage`);
                this.syncState.emailCount = this.emails.length;
            }
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur chargement emails:', error);
        }
    }

    async fetchEmails() {
        console.log('[PageManagerGmail] 📧 Fetching emails from Gmail...');
        
        if (!this.syncState.authenticated) {
            throw new Error('Non authentifié');
        }

        try {
            this.showLoading('Récupération des emails Gmail...');
            
            // Via MailService
            if (window.mailService?.getMessages) {
                const provider = window.mailService.getCurrentProvider();
                if (provider !== 'google' && provider !== 'gmail') {
                    await window.mailService.setProvider('google');
                }
                
                this.emails = await window.mailService.getMessages('INBOX', {
                    maxResults: 500,
                    includeSpam: false
                });
            }
            // Via GoogleAuthService
            else if (window.googleAuthService?.fetchEmails) {
                this.emails = await window.googleAuthService.fetchEmails({
                    maxResults: 500
                });
            }
            // Via simulation
            else {
                console.warn('[PageManagerGmail] Services non disponibles, génération d\'emails de test');
                this.emails = this.generateTestEmails();
            }
            
            console.log(`[PageManagerGmail] ✅ ${this.emails.length} emails récupérés`);
            this.syncState.emailCount = this.emails.length;
            this.syncState.lastSync = new Date().toISOString();
            
            // Catégoriser les emails
            if (window.categoryManager) {
                await this.categorizeEmails();
            }
            
            // Sauvegarder en local
            this.saveEmailsToLocal();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur récupération:', error);
            this.hideLoading();
            throw error;
        }
    }

    async categorizeEmails() {
        console.log('[PageManagerGmail] 🏷️ Catégorisation des emails...');
        
        if (!window.categoryManager?.analyzeEmail) {
            console.warn('[PageManagerGmail] ⚠️ CategoryManager non disponible');
            return;
        }

        let count = 0;
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        for (const email of this.emails) {
            if (!email.category) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.isPreselectedForTasks = preselectedCategories.includes(email.category);
                    count++;
                } catch (error) {
                    email.category = 'other';
                    email.isPreselectedForTasks = false;
                }
            }
        }
        
        console.log(`[PageManagerGmail] ✅ ${count} emails catégorisés`);
    }

    saveEmailsToLocal() {
        try {
            this.setLocalStorageItem('gmailEmails', JSON.stringify(this.emails));
            this.setLocalStorageItem('gmailSyncState', JSON.stringify(this.syncState));
            console.log('[PageManagerGmail] 💾 Emails sauvegardés localement');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur sauvegarde locale:', error);
        }
    }

    generateTestEmails() {
        const testEmails = [];
        const senders = [
            { name: 'Jean Dupont', email: 'jean.dupont@example.com' },
            { name: 'Marie Martin', email: 'marie.martin@company.fr' },
            { name: 'Support Google', email: 'support@google.com' },
            { name: 'Amazon', email: 'noreply@amazon.fr' },
            { name: 'LinkedIn', email: 'notifications@linkedin.com' }
        ];
        
        const subjects = [
            'Réunion projet demain à 14h',
            'Votre commande a été expédiée',
            'Nouvelle connexion à votre compte',
            'Invitation: Webinar marketing digital',
            'Rappel: Renouvellement abonnement'
        ];
        
        for (let i = 0; i < 20; i++) {
            const sender = senders[Math.floor(Math.random() * senders.length)];
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            
            testEmails.push({
                id: `test-email-${Date.now()}-${i}`,
                subject: subject,
                from: {
                    emailAddress: {
                        name: sender.name,
                        address: sender.email
                    }
                },
                receivedDateTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
                bodyText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                hasAttachments: Math.random() > 0.7,
                importance: Math.random() > 0.8 ? 'high' : 'normal',
                isRead: Math.random() > 0.3,
                provider: 'gmail',
                webSimulated: true
            });
        }
        
        return testEmails;
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        console.log('[PageManagerGmail] 🎯 Setting up event listeners...');
        
        // Scan complété
        window.addEventListener('scanCompleted', (e) => {
            if (e.detail?.provider === 'google' || e.detail?.provider === 'gmail') {
                console.log('[PageManagerGmail] 📨 Scan Gmail terminé');
                this.loadEmailsFromSession();
                if (this.currentPage === 'emails') {
                    this.refreshView();
                }
            }
        });
        
        // Emails recatégorisés
        window.addEventListener('emailsRecategorized', () => {
            if (this.currentPage === 'emails') {
                this.refreshView();
            }
        });
        
        // Changements de catégories
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.type === 'taskPreselectedCategories') {
                this.invalidateTaskCategoriesCache();
                this.categorizeEmails().then(() => {
                    if (this.currentPage === 'emails') {
                        this.refreshView();
                    }
                });
            }
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    // ================================================
    // NAVIGATION
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManagerGmail] 📄 Loading page: ${pageName}`);
        
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        
        if (!container) {
            console.error('[PageManagerGmail] ❌ Container non trouvé');
            return;
        }

        try {
            this.currentPage = pageName;
            
            switch (pageName) {
                case 'emails':
                    await this.renderEmailsPage(container);
                    break;
                    
                case 'scanner':
                    await this.renderScannerPage(container);
                    break;
                    
                default:
                    container.innerHTML = `
                        <div class="empty-page">
                            <h2>Page ${pageName} non disponible</h2>
                        </div>
                    `;
            }
            
            this.updateNavigation(pageName);
            
        } catch (error) {
            console.error(`[PageManagerGmail] ❌ Erreur chargement ${pageName}:`, error);
            this.showError(container, error.message);
        }
    }

    // ================================================
    // PAGE EMAILS
    // ================================================
    async renderEmailsPage(container) {
        console.log('[PageManagerGmail] 🎨 Rendering emails page...');
        
        // Vérifier l'authentification
        const isAuth = await this.checkAuthentication();
        if (!isAuth) {
            this.renderAuthRequired(container);
            return;
        }
        
        // Charger les emails si nécessaire
        if (this.emails.length === 0) {
            try {
                await this.fetchEmails();
            } catch (error) {
                console.log('[PageManagerGmail] ⚠️ Pas d\'emails disponibles');
            }
        }
        
        // Calculer les statistiques
        const categoryCounts = this.calculateCategoryCounts(this.emails);
        const totalEmails = this.emails.length;
        const selectedCount = this.selectedEmails.size;
        
        // Rendre la page
        container.innerHTML = `
            <div class="gmail-page-modern">
                ${!this.hideExplanation && this.emails.length > 0 ? `
                    <div class="explanation-notice">
                        <i class="fas fa-info-circle"></i>
                        <span>Emails Gmail synchronisés. Cliquez pour sélectionner et créer des tâches.</span>
                        <button class="explanation-close" onclick="pageManagerGmail.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}

                <div class="fixed-header-wrapper">
                    <div class="controls-bar">
                        <div class="search-section">
                            <div class="search-box">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input" 
                                       id="emailSearchInput"
                                       placeholder="Rechercher dans vos emails Gmail..." 
                                       value="${this.searchTerm}">
                                ${this.searchTerm ? `
                                    <button class="search-clear" onclick="pageManagerGmail.clearSearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="actions-section">
                            <div class="view-modes">
                                <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('flat')"
                                        title="Liste complète">
                                    <i class="fas fa-list"></i>
                                    <span>Liste</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('grouped-domain')"
                                        title="Par domaine">
                                    <i class="fas fa-globe"></i>
                                    <span>Domaine</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('grouped-sender')"
                                        title="Par expéditeur">
                                    <i class="fas fa-user"></i>
                                    <span>Expéditeur</span>
                                </button>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="pageManagerGmail.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}
                                        title="Créer des tâches à partir des emails sélectionnés">
                                    <i class="fas fa-tasks"></i>
                                    <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                                </button>
                                
                                <button class="btn btn-secondary" onclick="pageManagerGmail.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span>Actualiser</span>
                                </button>
                                
                                ${selectedCount > 0 ? `
                                    <button class="btn btn-clear" 
                                            onclick="pageManagerGmail.clearSelection()"
                                            title="Effacer la sélection">
                                        <i class="fas fa-times"></i>
                                        <span>Effacer (${selectedCount})</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="category-filters-wrapper">
                        <div class="category-filters" id="categoryFilters">
                            ${this.buildCategoryTabs(categoryCounts, totalEmails)}
                        </div>
                    </div>
                </div>

                <div class="emails-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;
        
        // Setup interactions
        this.setupEmailsInteractions();
    }

    buildCategoryTabs(categoryCounts, totalEmails) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        const categories = this.getCategories();
        
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        // Ajouter les autres catégories
        Object.entries(categories).forEach(([catId, category]) => {
            if (catId === 'all') return;
            
            const count = categoryCounts[catId] || 0;
            if (count > 0 || catId === 'other') {
                const isPreselected = preselectedCategories.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected
                });
            }
        });
        
        // Diviser en lignes de 6 boutons maximum
        let tabsHTML = '';
        for (let i = 0; i < tabs.length; i += 6) {
            const rowTabs = tabs.slice(i, i + 6);
            tabsHTML += `<div class="category-row">`;
            tabsHTML += rowTabs.map(tab => {
                const isCurrentCategory = this.currentCategory === tab.id;
                const baseClasses = `category-tab ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}`;
                
                return `
                    <button class="${baseClasses}" 
                            onclick="pageManagerGmail.filterByCategory('${tab.id}')"
                            data-category-id="${tab.id}"
                            title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                        <span class="tab-icon">${tab.icon}</span>
                        <span class="tab-name">${tab.name}</span>
                        <span class="tab-count">${tab.count}</span>
                        ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                    </button>
                `;
            }).join('');
            tabsHTML += `</div>`;
        }
        
        return tabsHTML;
    }

    renderEmailsList() {
        const emails = this.getFilteredEmails();
        
        if (emails.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(emails, this.currentViewMode);
            case 'flat':
            default:
                return this.renderFlatView(emails);
        }
    }

    renderFlatView(emails) {
        return `
            <div class="emails-list">
                ${emails.map(email => this.renderEmailCard(email)).join('')}
            </div>
        `;
    }

    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="emails-grouped">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.getAvatarColor(group.name);
        
        return `
            <div class="email-group" data-group-key="${group.key}">
                <div class="group-header" onclick="pageManagerGmail.toggleGroup('${group.key}', event)">
                    <div class="group-avatar" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info">
                        <div class="group-name">${displayName}</div>
                        <div class="group-meta">${group.count} email${group.count > 1 ? 's' : ''} • ${this.formatDate(group.latestDate)}</div>
                    </div>
                    <div class="group-expand">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content" style="display: none;">
                    ${group.emails.map(email => this.renderEmailCard(email)).join('')}
                </div>
            </div>
        `;
    }

    renderEmailCard(email) {
        const hasTask = this.createdTasks.has(email.id);
        const sender = email.from?.emailAddress || {};
        const senderName = sender.name || sender.address || 'Inconnu';
        const senderEmail = sender.address || '';
        
        const preselectedCategories = this.getTaskPreselectedCategories();
        const isPreselectedForTasks = email.isPreselectedForTasks || preselectedCategories.includes(email.category);
        const isSelected = this.selectedEmails.has(email.id);
        
        const cardClasses = [
            'email-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected' : '',
            !email.isRead ? 'unread' : ''
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); pageManagerGmail.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
                <div class="email-content" onclick="pageManagerGmail.handleEmailClick(event, '${email.id}')">
                    <div class="email-header">
                        <h3 class="email-title">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="email-type">
                                <i class="fab fa-google"></i> Gmail
                            </span>
                            <span class="email-date">
                                📅 ${this.formatDate(email.receivedDateTime)}
                            </span>
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                            ${email.hasAttachments ? `
                                <span class="attachment-indicator">
                                    📎 Pièce jointe
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <div class="sender-avatar-small" style="background: ${this.getAvatarColor(senderEmail)}">
                            ${senderName.charAt(0).toUpperCase()}
                        </div>
                        <span class="sender-name">${this.escapeHtml(senderName)}</span>
                        <span class="sender-email">${this.escapeHtml(senderEmail)}</span>
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-badge" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                            </span>
                        ` : ''}
                    </div>
                    
                    ${email.bodyPreview ? `
                        <div class="email-preview">
                            ${this.escapeHtml(email.bodyPreview)}
                        </div>
                    ` : ''}
                </div>
                
                <div class="email-actions">
                    ${this.renderEmailActions(email)}
                </div>
            </div>
        `;
    }

    renderEmailActions(email) {
        const hasTask = this.createdTasks.has(email.id);
        const actions = [];
        
        // Bouton principal : voir le détail
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); pageManagerGmail.showEmailModal('${email.id}')"
                    title="Voir le contenu complet de l'email">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        // Bouton créer/voir tâche
        if (!hasTask) {
            actions.push(`
                <button class="action-btn create-task" 
                        onclick="event.stopPropagation(); pageManagerGmail.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche à partir de cet email">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn view-task" 
                        onclick="event.stopPropagation(); pageManagerGmail.openCreatedTask('${email.id}')"
                        title="Voir la tâche créée">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        // Bouton Agenda
        actions.push(`
            <button class="action-btn calendar" 
                    onclick="event.stopPropagation(); pageManagerGmail.openGoogleCalendar('${email.id}')"
                    title="Ajouter au calendrier Google">
                <i class="fas fa-calendar-alt"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="pageManagerGmail.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email Gmail.';
            action = `
                <button class="btn btn-primary" onclick="pageManagerGmail.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email Gmail';
            text = 'Connectez-vous ou lancez un scan pour récupérer vos emails Gmail.';
            action = `
                <button class="btn btn-primary" onclick="pageManagerGmail.refreshEmails()">
                    <i class="fas fa-sync"></i>
                    <span>Récupérer les emails</span>
                </button>
                <button class="btn btn-secondary" onclick="pageManagerGmail.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Scanner</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fab fa-google"></i>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                <div class="empty-state-actions">
                    ${action}
                </div>
            </div>
        `;
    }

    // ================================================
    // PAGE SCANNER
    // ================================================
    async renderScannerPage(container) {
        console.log('[PageManagerGmail] 🔍 Rendering scanner page...');
        
        const isAuth = await this.checkAuthentication();
        const hasEmails = this.emails.length > 0;
        const emailCount = this.emails.length;
        
        // Interface cohérente avec Outlook - pas de section auth séparée
        container.innerHTML = `
            <div class="gmail-page-modern scanner-page-unified">
                <!-- Header moderne unifié comme Outlook -->
                <div class="scanner-header-modern">
                    <div class="header-content">
                        <div class="header-icon gmail-icon">
                            <i class="fab fa-google"></i>
                        </div>
                        <div class="header-text">
                            <h1>Scanner d'emails Gmail</h1>
                            <p>Synchronisez et analysez vos emails Gmail pour créer des tâches automatiquement</p>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="scanner-main-content">
                    <!-- Status Cards -->
                    <div class="status-cards">
                        <div class="status-card ${isAuth ? 'connected' : 'disconnected'}">
                            <div class="status-icon">
                                <i class="fas ${isAuth ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                            </div>
                            <div class="status-info">
                                <h3>${isAuth ? 'Connecté' : 'Non connecté'}</h3>
                                <p>${isAuth ? 'Compte Google actif' : 'Connexion requise'}</p>
                            </div>
                        </div>
                        
                        <div class="status-card">
                            <div class="status-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="status-info">
                                <h3>${emailCount}</h3>
                                <p>Emails disponibles</p>
                            </div>
                        </div>
                        
                        <div class="status-card">
                            <div class="status-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="status-info">
                                <h3>${this.syncState.lastSync ? this.formatDate(this.syncState.lastSync) : 'Jamais'}</h3>
                                <p>Dernière synchronisation</p>
                            </div>
                        </div>
                    </div>

                    <!-- Scan Control -->
                    <div class="scan-control-card">
                        <div class="scan-illustration">
                            <div class="scan-icon-wrapper gmail-gradient">
                                <i class="fab fa-google"></i>
                                <div class="scan-pulse"></div>
                            </div>
                        </div>
                        
                        <div class="scan-content">
                            <h2>Synchronisation Gmail</h2>
                            ${!isAuth ? `
                                <div class="auth-warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <p>Vous devez vous connecter à Google pour scanner vos emails</p>
                                </div>
                            ` : `
                                <p>Récupérez vos emails Gmail pour les analyser et créer des tâches automatiquement</p>
                            `}
                            
                            <div class="scan-options ${!isAuth ? 'disabled' : ''}">
                                <label class="scan-option">
                                    <input type="checkbox" checked ${!isAuth ? 'disabled' : ''}>
                                    <span>Inclure les emails des 7 derniers jours</span>
                                </label>
                                <label class="scan-option">
                                    <input type="checkbox" checked ${!isAuth ? 'disabled' : ''}>
                                    <span>Catégoriser automatiquement avec l'IA</span>
                                </label>
                                <label class="scan-option">
                                    <input type="checkbox" ${!isAuth ? 'disabled' : ''}>
                                    <span>Créer des tâches pour les emails importants</span>
                                </label>
                            </div>
                            
                            <div class="scan-actions">
                                ${!isAuth ? `
                                    <button class="btn btn-primary btn-large" onclick="pageManagerGmail.login()">
                                        <i class="fab fa-google"></i>
                                        <span>Se connecter avec Google</span>
                                    </button>
                                ` : `
                                    <button class="btn btn-primary btn-large" onclick="pageManagerGmail.startScan()">
                                        <i class="fas fa-sync"></i>
                                        <span>Lancer la synchronisation</span>
                                    </button>
                                `}
                                
                                ${hasEmails ? `
                                    <button class="btn btn-secondary" onclick="pageManagerGmail.loadPage('emails')">
                                        <i class="fas fa-eye"></i>
                                        <span>Voir les ${emailCount} emails</span>
                                    </button>
                                ` : ''}
                                
                                ${isAuth ? `
                                    <button class="btn btn-secondary disconnect" onclick="pageManagerGmail.disconnect()">
                                        <i class="fas fa-sign-out-alt"></i>
                                        <span>Déconnecter</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Résultats de scan (si disponibles) -->
                    ${this.syncState.lastSync && hasEmails ? `
                        <div class="scan-results">
                            <h3>Dernière synchronisation</h3>
                            <div class="results-grid">
                                <div class="result-item">
                                    <span class="result-label">Emails synchronisés:</span>
                                    <span class="result-value">${emailCount}</span>
                                </div>
                                <div class="result-item">
                                    <span class="result-label">Catégories détectées:</span>
                                    <span class="result-value">${Object.keys(this.calculateCategoryCounts(this.emails)).length}</span>
                                </div>
                                <div class="result-item">
                                    <span class="result-label">Emails avec pièces jointes:</span>
                                    <span class="result-value">${this.emails.filter(e => e.hasAttachments).length}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Features Section comme Outlook -->
                <div class="features-section">
                    <h2>Fonctionnalités Gmail</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon gmail-feature">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>OAuth 2.0</h3>
                            <p>Authentification sécurisée avec Google OAuth</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon gmail-feature">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3>IA Intégrée</h3>
                            <p>Catégorisation intelligente par Claude AI</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon gmail-feature">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <h3>Tâches Auto</h3>
                            <p>Création automatique de tâches à partir des emails</p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon gmail-feature">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <h3>Synchronisation</h3>
                            <p>Import rapide via l'API Gmail</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async disconnect() {
        try {
            if (window.googleAuthService?.logout) {
                await window.googleAuthService.logout();
            }
            
            // Effacer l'état local
            this.syncState.authenticated = false;
            this.emails = [];
            this.selectedEmails.clear();
            this.createdTasks.clear();
            
            // Effacer le stockage local
            this.setLocalStorageItem('gmailEmails', '[]');
            this.setLocalStorageItem('googleAuthToken', '');
            
            this.showToast('Déconnecté de Google', 'success');
            this.loadPage('scanner');
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur déconnexion:', error);
            this.showToast('Erreur lors de la déconnexion', 'error');
        }
    }

    async startScan() {
        console.log('[PageManagerGmail] 🚀 Starting Gmail scan...');
        
        try {
            await this.fetchEmails();
            this.showToast(`${this.emails.length} emails synchronisés!`, 'success');
            
            // Rediriger vers la page emails
            setTimeout(() => {
                this.loadPage('emails');
            }, 1000);
            
        } catch (error) {
            console.error('[PageManagerGmail] Scan error:', error);
            this.showToast('Erreur lors du scan: ' + error.message, 'error');
        }
    }

    // ================================================
    // INTERACTIONS
    // ================================================
    setupEmailsInteractions() {
        console.log('[PageManagerGmail] 🎯 Setting up interactions...');
        
        // Recherche
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim();
                    this.refreshView();
                }, 300);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentPage !== 'emails') return;
            
            // Ctrl/Cmd + A pour tout sélectionner
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAllVisible();
            }
            
            // Escape pour effacer la sélection
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox' || 
            event.target.closest('.email-actions') || 
            event.target.closest('button')) {
            return;
        }
        
        // Double-clic pour sélectionner, simple clic pour voir
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

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.updateControlsOnly();
    }

    selectAllVisible() {
        const visibleEmails = this.getFilteredEmails();
        visibleEmails.forEach(email => {
            this.selectedEmails.add(email.id);
        });
        this.refreshView();
        this.showToast(`${visibleEmails.length} emails sélectionnés`, 'info');
    }

    updateControlsOnly() {
        const selectedCount = this.selectedEmails.size;
        
        // Mettre à jour le bouton de création de tâches
        const createTaskBtn = document.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
        if (createTaskBtn) {
            const span = createTaskBtn.querySelector('span');
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
        
        // Gérer le bouton Effacer
        const existingClearBtn = document.querySelector('.btn-clear');
        const actionButtonsContainer = document.querySelector('.action-buttons');
        
        if (selectedCount > 0) {
            if (!existingClearBtn && actionButtonsContainer) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'btn btn-clear';
                clearBtn.onclick = () => pageManagerGmail.clearSelection();
                clearBtn.title = 'Effacer la sélection';
                clearBtn.innerHTML = `
                    <i class="fas fa-times"></i>
                    <span>Effacer (${selectedCount})</span>
                `;
                actionButtonsContainer.appendChild(clearBtn);
            } else if (existingClearBtn) {
                const span = existingClearBtn.querySelector('span');
                if (span) {
                    span.textContent = `Effacer (${selectedCount})`;
                }
            }
        } else {
            if (existingClearBtn) {
                existingClearBtn.remove();
            }
        }
        
        // Mettre à jour les checkboxes
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            const emailId = checkbox.closest('[data-email-id]')?.dataset.emailId;
            if (emailId) {
                checkbox.checked = this.selectedEmails.has(emailId);
            }
        });
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    clearSearch() {
        this.searchTerm = '';
        this.refreshView();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        this.setLocalStorageItem('hideGmailExplanation', 'true');
        this.refreshView();
    }

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-expand i');
        const header = group.querySelector('.group-header');
        
        if (!content || !icon || !header) return;
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded');
        }
    }

    async refreshEmails() {
        console.log('[PageManagerGmail] 🔄 Refreshing emails...');
        
        try {
            await this.fetchEmails();
            this.refreshView();
            this.showToast('Emails actualisés', 'success');
        } catch (error) {
            this.showToast('Erreur actualisation', 'error');
        }
    }

    refreshView() {
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        if (container && this.currentPage === 'emails') {
            this.renderEmailsPage(container);
        }
    }

    // ================================================
    // MODALS
    // ================================================
    async showEmailModal(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const sender = email.from?.emailAddress || {};
        const senderName = sender.name || sender.address || 'Inconnu';
        const senderEmail = sender.address || '';
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>
                            <i class="fab fa-google" style="color: #4285f4; margin-right: 8px;"></i>
                            Email Gmail
                        </h2>
                        <button class="modal-close" onclick="pageManagerGmail.closeModal('${uniqueId}')">
                            ×
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="email-details">
                            <div class="sender-info">
                                <div class="sender-avatar" style="background: ${this.getAvatarColor(senderEmail)}">
                                    ${senderName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="sender-name-large">${this.escapeHtml(senderName)}</div>
                                    <div class="sender-email-large">${this.escapeHtml(senderEmail)}</div>
                                </div>
                            </div>
                            <div class="email-info-row">
                                <span class="info-label">Date:</span>
                                <span class="info-value">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="email-info-row">
                                <span class="info-label">Sujet:</span>
                                <span class="info-value">${this.escapeHtml(email.subject || 'Sans sujet')}</span>
                            </div>
                            ${email.category ? `
                                <div class="email-info-row">
                                    <span class="info-label">Catégorie:</span>
                                    <span class="category-badge-large" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>
                                </div>
                            ` : ''}
                            ${email.hasAttachments ? `
                                <div class="email-info-row">
                                    <span class="info-label">Pièces jointes:</span>
                                    <span class="attachment-badge">📎 Fichiers attachés</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="email-body">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="pageManagerGmail.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button class="btn btn-primary" onclick="pageManagerGmail.closeModal('${uniqueId}'); pageManagerGmail.showTaskCreationModal('${emailId}');">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                        <button class="btn btn-google" onclick="pageManagerGmail.closeModal('${uniqueId}'); pageManagerGmail.openGoogleCalendar('${emailId}');">
                            <i class="fas fa-calendar-alt"></i> Ajouter au calendrier
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    async showTaskCreationModal(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;

        const uniqueId = 'task_creation_modal_' + Date.now();
        const sender = email.from?.emailAddress || {};
        const senderName = sender.name || sender.address || 'Inconnu';
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay modal-dark">
                <div class="modal-container modal-medium">
                    <div class="modal-header">
                        <h2>✅ Créer une tâche</h2>
                        <button class="modal-close" onclick="pageManagerGmail.closeModal('${uniqueId}')">
                            ×
                        </button>
                    </div>
                    <div class="modal-content">
                        <form id="task-form" class="task-form">
                            <div class="form-group">
                                <label>📝 Titre de la tâche</label>
                                <input type="text" id="task-title" class="form-input" 
                                       value="Email de ${this.escapeHtml(senderName)}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>📄 Description</label>
                                <textarea id="task-description" class="form-textarea" rows="4">${this.escapeHtml(email.bodyPreview || email.subject || '')}</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>⚡ Priorité</label>
                                    <select id="task-priority" class="form-select">
                                        <option value="urgent">🚨 Urgent</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="low">📄 Basse</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>📅 Date d'échéance</label>
                                    <input type="date" id="task-duedate" class="form-input">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="pageManagerGmail.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn btn-primary" onclick="pageManagerGmail.createTaskFromModal('${email.id}'); pageManagerGmail.closeModal('${uniqueId}');">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Focus sur le titre
        setTimeout(() => {
            document.getElementById('task-title')?.focus();
        }, 100);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    async createTaskFromEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email || !window.taskManager) return;
        
        try {
            const task = {
                id: this.generateTaskId(),
                title: `Email: ${email.subject || 'Sans sujet'}`,
                description: email.bodyPreview || '',
                emailId: email.id,
                category: email.category || 'other',
                priority: 'medium',
                status: 'todo',
                createdAt: new Date().toISOString(),
                provider: 'gmail',
                emailFrom: email.from?.emailAddress?.address,
                emailFromName: email.from?.emailAddress?.name,
                emailSubject: email.subject
            };
            
            const createdTask = window.taskManager.createTaskFromEmail(task, email);
            if (createdTask) {
                this.createdTasks.set(emailId, createdTask.id);
                window.taskManager.saveTasks?.();
                this.showToast('Tâche créée', 'success');
                this.refreshView();
            }
            
        } catch (error) {
            console.error('[PageManagerGmail] Error creating task:', error);
            this.showToast('Erreur création tâche', 'error');
        }
    }

    async createTaskFromModal(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) {
            this.showToast('Email non trouvé', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = {
                id: this.generateTaskId(),
                title,
                description,
                priority,
                dueDate,
                status: 'todo',
                emailId: email.id,
                category: email.category || 'other',
                createdAt: new Date().toISOString(),
                provider: 'gmail',
                emailFrom: email.from?.emailAddress?.address,
                emailFromName: email.from?.emailAddress?.name,
                emailSubject: email.subject
            };

            if (window.taskManager) {
                const task = window.taskManager.createTaskFromEmail(taskData, email);
                if (task) {
                    this.createdTasks.set(emailId, task.id);
                    window.taskManager.saveTasks?.();
                    this.showToast('Tâche créée avec succès', 'success');
                    this.refreshView();
                }
            } else {
                // Fallback: sauvegarder localement
                this.saveTaskLocally(taskData);
                this.createdTasks.set(emailId, taskData.id);
                this.showToast('Tâche créée localement', 'success');
                this.refreshView();
            }
            
        } catch (error) {
            console.error('[PageManagerGmail] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            this.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        this.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.emails.find(e => e.id === emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                await this.createTaskFromEmail(emailId);
                created++;
            } catch (error) {
                console.error('[PageManagerGmail] Erreur création tâche:', error);
            }
        }
        
        this.hideLoading();
        
        if (created > 0) {
            this.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            this.showToast('Aucune tâche créée', 'warning');
        }
    }

    saveTaskLocally(taskData) {
        try {
            const tasks = JSON.parse(this.getLocalStorageItem('gmailTasks') || '[]');
            tasks.push(taskData);
            this.setLocalStorageItem('gmailTasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('[PageManagerGmail] Error saving task locally:', error);
        }
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        if (window.pageManager) {
            window.pageManager.loadPage('tasks').then(() => {
                setTimeout(() => {
                    if (window.tasksView?.showTaskDetails) {
                        window.tasksView.showTaskDetails(taskId);
                    }
                }, 100);
            });
        } else {
            this.showToast('Gestionnaire de tâches non disponible', 'warning');
        }
    }

    openGoogleCalendar(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        const subject = encodeURIComponent(email.subject || 'Sans sujet');
        const details = encodeURIComponent(email.bodyPreview || '');
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${subject}&details=${details}`;
        
        window.open(calendarUrl, '_blank');
        this.showToast('Ouverture du calendrier Google', 'info');
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getFilteredEmails() {
        let emails = [...this.emails];
        
        // Filtre catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                emails = emails.filter(e => !e.category || e.category === 'other');
            } else {
                emails = emails.filter(e => e.category === this.currentCategory);
            }
        }
        
        // Filtre recherche
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            emails = emails.filter(e => 
                (e.subject || '').toLowerCase().includes(search) ||
                (e.from?.emailAddress?.name || '').toLowerCase().includes(search) ||
                (e.from?.emailAddress?.address || '').toLowerCase().includes(search) ||
                (e.bodyPreview || '').toLowerCase().includes(search)
            );
        }
        
        // Tri par date
        emails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        
        return emails;
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
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

    getCategories() {
        if (this._categoriesCache) {
            return this._categoriesCache;
        }
        
        if (window.categoryManager?.getCategories) {
            this._categoriesCache = window.categoryManager.getCategories();
            return this._categoriesCache;
        }
        
        const defaultCategories = {
            'work': { name: 'Travail', icon: '💼', color: '#3b82f6' },
            'personal': { name: 'Personnel', icon: '👤', color: '#10b981' },
            'shopping': { name: 'Shopping', icon: '🛒', color: '#f59e0b' },
            'finance': { name: 'Finance', icon: '💰', color: '#8b5cf6' },
            'travel': { name: 'Voyage', icon: '✈️', color: '#ec4899' },
            'health': { name: 'Santé', icon: '🏥', color: '#ef4444' },
            'education': { name: 'Éducation', icon: '🎓', color: '#14b8a6' },
            'news': { name: 'Actualités', icon: '📰', color: '#64748b' },
            'social': { name: 'Social', icon: '👥', color: '#0ea5e9' },
            'other': { name: 'Autre', icon: '📌', color: '#6b7280' }
        };
        
        this._categoriesCache = defaultCategories;
        return defaultCategories;
    }

    getCategoryName(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.name || categoryId;
    }

    getCategoryIcon(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.icon || '📁';
    }

    getCategoryColor(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.color || '#6b7280';
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000; // 10 secondes
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            return [...this._taskCategoriesCache];
        }
        
        let categories = [];
        
        if (window.categoryManager?.getTaskPreselectedCategories) {
            categories = window.categoryManager.getTaskPreselectedCategories();
        } else {
            // Catégories par défaut pour les tâches
            categories = ['work', 'finance', 'travel'];
        }
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        return [...categories];
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        this._categoriesCache = null;
        console.log('[PageManagerGmail] 🔄 Cache des catégories invalidé');
    }

    getAvatarColor(email) {
        if (!email) return '#6b7280';
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 30) % 360}, 70%, 60%))`;
    }

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return '#3b82f6';
    }

    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
        
        return d.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        if (email.bodyHtml) {
            return email.bodyHtml;
        }
        if (email.bodyText) {
            return `<pre style="white-space: pre-wrap; font-family: inherit;">${this.escapeHtml(email.bodyText)}</pre>`;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }

    // ================================================
    // UI HELPERS
    // ================================================
    renderAuthRequired(container) {
        container.innerHTML = `
            <div class="auth-required-state">
                <div class="auth-icon">
                    <i class="fab fa-google"></i>
                </div>
                <h3 class="auth-title">Connexion Gmail requise</h3>
                <p class="auth-text">
                    Connectez-vous avec votre compte Google pour accéder à vos emails Gmail.
                </p>
                <div class="auth-actions">
                    <button class="btn btn-primary btn-large" onclick="pageManagerGmail.login()">
                        <i class="fab fa-google"></i>
                        Se connecter avec Google
                    </button>
                    <button class="btn btn-secondary" onclick="pageManagerGmail.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        Scanner des emails
                    </button>
                </div>
            </div>
        `;
    }

    async login() {
        try {
            this.showLoading('Connexion à Google...');
            
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
                this.syncState.authenticated = true;
                this.hideLoading();
                this.loadPage('emails');
            } else if (window.mailService?.authenticate) {
                await window.mailService.authenticate('google');
                this.syncState.authenticated = true;
                this.hideLoading();
                this.loadPage('emails');
            } else {
                this.hideLoading();
                this.showToast('Service d\'authentification non disponible', 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showToast('Erreur connexion: ' + error.message, 'error');
        }
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Erreur</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Réessayer
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    showLoading(message = 'Chargement...') {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(message);
        } else {
            // Créer notre propre loading
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'gmail-loading';
            loadingDiv.className = 'loading-overlay';
            loadingDiv.innerHTML = `
                <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            `;
            document.body.appendChild(loadingDiv);
        }
    }

    hideLoading() {
        if (window.uiManager?.hideLoading) {
            window.uiManager.hideLoading();
        } else {
            const loadingDiv = document.getElementById('gmail-loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            // Créer notre propre toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
            
            // Animation
            setTimeout(() => toast.classList.add('show'), 100);
            
            // Auto-hide
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // ================================================
    // CLEANUP
    // ================================================
    cleanup() {
        console.log('[PageManagerGmail] 🧹 Cleaning up...');
        
        // Sauvegarder l'état
        this.saveEmailsToLocal();
        
        // Invalider les caches
        this.invalidateTaskCategoriesCache();
        
        // Nettoyer les sélections
        this.selectedEmails.clear();
        this.createdTasks.clear();
        
        console.log('[PageManagerGmail] ✅ Cleanup done');
    }

    // ================================================
    // STYLES CSS COMPLETS
    // ================================================
    addStyles() {
        if (document.getElementById('gmail-page-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmail-page-styles';
        styles.textContent = `
            /* Base styles pour Gmail */
            .gmail-page-modern {
                padding: 0;
                background: #f8fafc;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                position: relative;
            }

            /* Notice d'explication */
            .explanation-notice {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 0 16px 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #1e40af;
                font-size: 13px;
                font-weight: 500;
            }
            
            .explanation-close {
                margin-left: auto;
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
                transition: all 0.2s;
            }

            .explanation-close:hover {
                background: #3b82f6;
                color: white;
            }

            /* Header fixe */
            .fixed-header-wrapper {
                position: sticky;
                top: 0;
                z-index: 1000;
                background: rgba(248, 250, 252, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                margin: 0;
                padding: 12px 20px 8px 20px;
                border-bottom: 2px solid #e5e7eb;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            /* Barre de contrôles */
            .controls-bar {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            /* Section recherche */
            .search-section {
                width: 100%;
            }

            .search-box {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }

            .search-input {
                width: 100%;
                height: 44px;
                padding: 0 16px 0 48px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 14px;
                background: #f9fafb;
                transition: all 0.2s ease;
            }

            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                outline: none;
            }

            .search-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
                font-size: 16px;
            }

            .search-clear {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s;
            }

            .search-clear:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }

            /* Section actions */
            .actions-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 4px;
                gap: 2px;
            }

            .view-mode {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 600;
            }

            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }

            .view-mode.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            /* Boutons d'action */
            .action-buttons {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .btn {
                height: 44px;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 0 16px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                position: relative;
            }

            .btn:hover {
                background: #f9fafb;
                border-color: #6366f1;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }

            .btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }

            .btn-large {
                height: 52px;
                padding: 0 24px;
                font-size: 15px;
            }

            .btn-google {
                background: #4285f4;
                color: white;
                border: none;
            }

            .btn-google:hover {
                background: #3367d6;
            }

            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
            }

            /* Filtres de catégories */
            .category-filters-wrapper {
                position: relative;
                margin: 0;
                padding: 0;
                background: transparent;
            }

            .category-filters {
                display: flex;
                flex-direction: column;
                gap: 6px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .category-row {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 6px;
                width: 100%;
            }

            .category-tab {
                height: 56px;
                padding: 0;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                font-size: 12px;
            }

            .category-tab .tab-icon {
                font-size: 18px;
                line-height: 1;
            }

            .category-tab .tab-name {
                font-size: 12px;
                font-weight: 700;
                color: #1f2937;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 90%;
                padding: 0 4px;
            }

            .category-tab .tab-count {
                position: absolute;
                top: 3px;
                right: 3px;
                background: #3b82f6;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 5px;
                border-radius: 8px;
                min-width: 18px;
                text-align: center;
                line-height: 1.2;
            }

            .category-tab.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
            }

            .category-tab.preselected .tab-count {
                background: #8b5cf6;
            }

            .category-tab:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(59, 130, 246, 0.15);
            }

            .category-tab.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
            }

            .category-tab.active .tab-name {
                color: white;
            }

            .category-tab.active .tab-count {
                background: rgba(255, 255, 255, 0.2);
            }

            .preselected-star {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 18px;
                height: 18px;
                background: #8b5cf6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(139, 92, 246, 0.4);
            }

            /* Container des emails */
            .emails-container {
                background: transparent;
                margin: 0 16px;
                padding-top: 16px;
                padding-bottom: 32px;
            }

            /* Liste des emails */
            .emails-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* Carte email */
            .email-card {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: 80px;
                border-bottom: none;
            }

            .email-card:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                border-top: 1px solid #e5e7eb;
            }

            .email-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .email-card + .email-card {
                border-top: 1px solid #e5e7eb;
            }

            .email-card:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 2;
            }

            .email-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }

            .email-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }

            .email-card.preselected {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid #8b5cf6;
                border-color: rgba(139, 92, 246, 0.3);
            }

            .email-card.preselected:hover {
                border-left: 4px solid #8b5cf6;
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
                border-color: rgba(139, 92, 246, 0.4);
            }

            .email-card.preselected.selected {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-left: 4px solid #8b5cf6;
                border-color: #8b5cf6;
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
            }

            .email-card.unread {
                font-weight: 600;
            }

            .email-card.unread .email-title {
                font-weight: 800;
            }

            /* Checkbox */
            .email-checkbox {
                margin-right: 12px;
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all 0.2s ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .email-checkbox:checked {
                background: #6366f1;
                border-color: #6366f1;
            }

            .email-checkbox:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }

            .email-card.preselected .email-checkbox:checked {
                background: #8b5cf6;
                border-color: #8b5cf6;
            }

            /* Barre de priorité */
            .priority-bar {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: 12px;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            /* Contenu email */
            .email-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }

            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 4px;
            }

            .email-title {
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

            .email-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
                flex-wrap: wrap;
            }

            .email-type,
            .email-date {
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

            .email-type {
                background: #4285f4;
                color: white;
                border: none;
            }

            .preselected-badge {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                border: none;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
            }

            .attachment-indicator {
                color: #dc2626;
                font-weight: 600;
                font-size: 11px;
                background: #fee2e2;
                padding: 4px 8px;
                border-radius: 6px;
                border: 1px solid #fecaca;
            }

            .email-sender {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 13px;
                font-weight: 500;
                line-height: 1.2;
            }

            .sender-avatar-small {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 11px;
                flex-shrink: 0;
            }

            .sender-name {
                font-weight: 600;
                color: #374151;
            }

            .sender-email {
                color: #6b7280;
                font-size: 12px;
            }

            .category-badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
                transition: all 0.2s ease;
                margin-left: auto;
            }

            .email-preview {
                color: #6b7280;
                font-size: 13px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-top: 4px;
            }

            /* Actions email */
            .email-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: 12px;
                flex-shrink: 0;
                z-index: 10;
                position: relative;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 8px;
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
            }

            .action-btn:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .action-btn.create-task {
                color: #3b82f6;
            }

            .action-btn.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }

            .action-btn.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .action-btn.view-task:hover {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                border-color: #16a34a;
                color: #15803d;
            }

            .action-btn.calendar {
                color: #0ea5e9;
            }

            .action-btn.calendar:hover {
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                border-color: #0ea5e9;
                color: #0284c7;
            }

            .action-btn.details {
                color: #6366f1;
            }

            .action-btn.details:hover {
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                border-color: #6366f1;
                color: #4f46e5;
            }

            /* Vue groupée */
            .emails-grouped {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .email-group {
                background: transparent;
                border: none;
                border-radius: 0;
                overflow: visible;
                margin: 0;
                padding: 0;
            }

            .group-header {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: 80px;
                border-bottom: none;
                gap: 12px;
            }

            .group-header:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                border-top: 1px solid #e5e7eb;
            }

            .group-header + .group-header {
                border-top: 1px solid #e5e7eb;
            }

            .group-header:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                z-index: 2;
            }

            .group-avatar {
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

            .group-info {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }

            .group-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .group-meta {
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }

            .group-expand {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 8px;
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

            .group-expand:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                color: #374151;
            }

            .email-group.expanded .group-expand {
                transform: rotate(180deg) translateY(-1px);
                color: #3b82f6;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
            }

            .group-content {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }

            .email-group.expanded .group-content {
                display: block;
            }

            .group-content .email-card {
                border-radius: 0;
                margin: 0;
                border-bottom: none;
            }

            .group-content .email-card + .email-card {
                border-top: 1px solid #e5e7eb;
            }

            .group-content .email-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            /* États vides */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #4285f4;
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
            }

            .empty-state-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: center;
            }

            /* Auth required */
            .auth-required-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                max-width: 500px;
                margin: 40px auto;
            }

            .auth-icon {
                font-size: 64px;
                margin-bottom: 24px;
                color: #4285f4;
            }

            .auth-title {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .auth-text {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 32px;
                line-height: 1.6;
            }

            .auth-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
            }

            /* Page scanner unifiée */
            .scanner-page-unified {
                padding: 0;
                background: #f8fafc;
                min-height: 100vh;
            }

            /* Header moderne */
            .scanner-header-modern {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                color: white;
                padding: 60px 20px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .scanner-header-modern::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: pulse 4s ease-in-out infinite;
            }

            .header-content {
                position: relative;
                z-index: 1;
                max-width: 800px;
                margin: 0 auto;
            }

            .header-icon {
                font-size: 64px;
                margin-bottom: 20px;
                animation: float 3s ease-in-out infinite;
            }

            .header-text h1 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 12px;
            }

            .header-text p {
                font-size: 18px;
                opacity: 0.9;
                max-width: 600px;
                margin: 0 auto;
            }

            /* Section authentification */
            .auth-section {
                padding: 40px 20px;
                max-width: 500px;
                margin: 0 auto;
            }

            .auth-card {
                background: white;
                border-radius: 16px;
                padding: 48px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: 1px solid #e5e7eb;
            }

            .auth-icon-large {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 40px;
                color: white;
                box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3);
            }

            .auth-card h2 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .auth-card p {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 32px;
                line-height: 1.6;
            }

            /* Contenu principal scanner */
            .scanner-main-content {
                padding: 40px 20px;
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Status Cards */
            .status-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }

            .status-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
                transition: all 0.3s ease;
            }

            .status-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }

            .status-icon {
                width: 48px;
                height: 48px;
                background: #e0e7ff;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4285f4;
                font-size: 20px;
            }

            .status-info h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
            }

            .status-info p {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }

            /* Scan Control Card */
            .scan-control-card {
                background: white;
                border-radius: 16px;
                padding: 48px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: 1px solid #e5e7eb;
                display: flex;
                gap: 48px;
                align-items: center;
                margin-bottom: 40px;
            }

            .scan-illustration {
                flex-shrink: 0;
            }

            .scan-icon-wrapper {
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .scan-icon-wrapper i {
                font-size: 48px;
                color: #4285f4;
            }

            .scan-pulse {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50%;
                border: 2px solid #4285f4;
                animation: pulse-ring 2s ease-out infinite;
            }

            .scan-content {
                flex: 1;
            }

            .scan-content h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .scan-content p {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 24px;
                line-height: 1.6;
            }

            .scan-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 32px;
            }

            .scan-option {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                color: #374151;
                font-size: 14px;
            }

            .scan-option input[type="checkbox"] {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 4px;
                cursor: pointer;
            }

            .scan-option input[type="checkbox"]:checked {
                background: #4285f4;
                border-color: #4285f4;
            }

            .scan-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            /* Features Section */
            .features-section {
                padding: 60px 20px;
                background: #f9fafb;
                text-align: center;
            }

            .features-section h2 {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 40px;
            }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 30px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .feature-card {
                background: white;
                border-radius: 12px;
                padding: 40px 30px;
                text-align: center;
                transition: all 0.3s ease;
                border: 1px solid #e5e7eb;
            }

            .feature-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            }

            .feature-icon {
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 28px;
                color: #4285f4;
            }

            .feature-card h3 {
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .feature-card p {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
            }

            /* Styles spécifiques Gmail */
            .gmail-icon {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 25%, #fbbc04 50%, #ea4335 75%);
            }

            .gmail-gradient {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%) !important;
            }

            .gmail-feature {
                background: linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%) !important;
                color: #1a73e8 !important;
            }

            .status-card.connected .status-icon {
                background: #e6f4ea;
                color: #34a853;
            }

            .status-card.disconnected .status-icon {
                background: #fce8e6;
                color: #ea4335;
            }

            .auth-warning {
                background: #fef7e0;
                border: 1px solid #fbbc04;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #5f6368;
            }

            .auth-warning i {
                color: #fbbc04;
                font-size: 20px;
            }

            .scan-options.disabled {
                opacity: 0.5;
                pointer-events: none;
            }

            .btn.disconnect {
                background: #fce8e6;
                color: #ea4335;
                border-color: #fadbd8;
            }

            .btn.disconnect:hover {
                background: #ea4335;
                color: white;
                border-color: #ea4335;
            }

            /* Résultats de scan */
            .scan-results {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-top: 20px;
                border: 1px solid #e5e7eb;
            }

            .scan-results h3 {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 16px;
            }

            .results-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .result-label {
                font-size: 14px;
                color: #6b7280;
            }

            .result-value {
                font-size: 18px;
                font-weight: 700;
                color: #1a73e8;
            }

            /* Responsive Scanner Page */
            @media (max-width: 768px) {
                .scanner-header-modern {
                    padding: 40px 20px;
                }

                .header-text h1 {
                    font-size: 28px;
                }

                .header-text p {
                    font-size: 16px;
                }

                .header-icon {
                    font-size: 48px;
                }

                .scan-control-card {
                    flex-direction: column;
                    padding: 32px 24px;
                    text-align: center;
                }

                .scan-icon-wrapper {
                    width: 100px;
                    height: 100px;
                }

                .scan-content h2 {
                    font-size: 24px;
                }

                .status-cards {
                    grid-template-columns: 1fr;
                }

                .features-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .feature-card {
                    padding: 30px 20px;
                }
            }

            /* Error state */
            .error-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .error-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 20px;
            }

            /* Modals */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.2s ease;
            }

            .modal-overlay.modal-dark {
                background: rgba(0, 0, 0, 0.75);
            }

            .modal-container {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }

            .modal-container.modal-medium {
                max-width: 600px;
            }

            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: center;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            }

            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .modal-content {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            /* Email details in modal */
            .email-details {
                margin-bottom: 20px;
            }

            .sender-info {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .sender-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
            }

            .sender-name-large {
                font-weight: 700;
                color: #1f2937;
                font-size: 16px;
            }

            .sender-email-large {
                color: #6b7280;
                font-size: 14px;
            }

            .email-info-row {
                display: flex;
                margin-bottom: 12px;
            }

            .info-label {
                font-weight: 600;
                color: #374151;
                margin-right: 8px;
                min-width: 100px;
            }

            .info-value {
                color: #6b7280;
            }

            .category-badge-large {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .attachment-badge {
                color: #dc2626;
                font-weight: 600;
            }

            .email-body {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                line-height: 1.6;
                color: #374151;
            }

            /* Task form */
            .task-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-group label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }

            .form-input,
            .form-textarea,
            .form-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s;
            }

            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }

            .form-textarea {
                resize: vertical;
                min-height: 100px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Loading */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loading-content {
                background: white;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }

            .loading-content i {
                font-size: 48px;
                color: #6366f1;
                margin-bottom: 16px;
            }

            .loading-content p {
                color: #374151;
                font-size: 16px;
                font-weight: 500;
            }

            /* Toast */
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 250px;
                max-width: 400px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 100000;
            }

            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }

            .toast i {
                font-size: 20px;
            }

            .toast-success {
                border-left: 4px solid #10b981;
            }

            .toast-success i {
                color: #10b981;
            }

            .toast-error {
                border-left: 4px solid #ef4444;
            }

            .toast-error i {
                color: #ef4444;
            }

            .toast-warning {
                border-left: 4px solid #f59e0b;
            }

            .toast-warning i {
                color: #f59e0b;
            }

            .toast-info {
                border-left: 4px solid #3b82f6;
            }

            .toast-info i {
                color: #3b82f6;
            }

            /* Animations */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .category-row {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            @media (max-width: 768px) {
                .actions-section {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                }

                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .category-filters-wrapper {
                    padding: 8px 12px;
                }

                .category-row {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 4px;
                }
                
                .category-tab {
                    height: 48px;
                    font-size: 11px;
                }

                .category-tab .tab-icon {
                    font-size: 16px;
                }

                .email-meta {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }

                .email-actions {
                    flex-direction: column;
                    gap: 2px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .modal-container {
                    margin: 10px;
                }
            }

            @media (max-width: 480px) {
                .category-row {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .category-tab {
                    height: 52px;
                }

                .scanner-info {
                    grid-template-columns: 1fr;
                }

                .scan-status {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INITIALISATION
// ================================================
if (window.pageManagerGmail) {
    console.log('[PageManagerGmail] 🔄 Cleaning up old instance...');
    window.pageManagerGmail.cleanup?.();
}

window.pageManagerGmail = new PageManagerGmail();

console.log('✅ PageManagerGmail v22.0 loaded - Complete Gmail Manager');
