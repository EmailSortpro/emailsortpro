// PageManagerGmail.js - Version 1.0 - Optimisé pour Gmail
console.log('[PageManagerGmail] 🚀 Chargement v1.0...');

class PageManagerGmail {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.emailProvider = 'gmail';
        this.isGmail = true;
        
        // Configuration
        this.config = {
            autoAnalyze: true,
            showNotifications: true,
            defaultViewMode: 'grouped-domain',
            maxEmailsPerPage: 100,
            enableAI: true
        };
        
        // État de synchronisation
        this.syncState = {
            emailsLoaded: false,
            categoriesLoaded: false,
            tasksLoaded: false,
            lastSync: null
        };
        
        // Cache
        this.cache = {
            emails: [],
            categories: {},
            taskPreselectedCategories: [],
            lastUpdate: 0
        };
        
        // Filtres actifs
        this.filters = {
            category: 'all',
            search: '',
            dateRange: null,
            starred: false,
            unread: false
        };
        
        // État UI
        this.ui = {
            loading: false,
            viewMode: this.config.defaultViewMode,
            expandedGroups: new Set(),
            hideExplanation: localStorage.getItem('hideGmailExplanation') === 'true'
        };
        
        this.init();
    }
    
    // ================================================
    // INITIALISATION
    // ================================================
    async init() {
        try {
            console.log('[PageManagerGmail] 📧 Initialisation pour Gmail...');
            
            // Vérifier qu'on est bien sur Gmail
            if (!this.detectGmail()) {
                console.warn('[PageManagerGmail] ⚠️ Pas sur Gmail, arrêt initialisation');
                return;
            }
            
            // Charger la configuration
            await this.loadConfiguration();
            
            // Setup des listeners
            this.setupEventListeners();
            this.setupGmailObservers();
            
            // Synchroniser avec les autres modules
            await this.syncWithModules();
            
            console.log('[PageManagerGmail] ✅ Initialisation complète');
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur initialisation:', error);
        }
    }
    
    detectGmail() {
        const hostname = window.location.hostname;
        const isGmail = hostname.includes('mail.google.com') || hostname.includes('gmail.com');
        
        if (isGmail) {
            console.log('[PageManagerGmail] ✅ Gmail détecté');
        }
        
        return isGmail;
    }
    
    async loadConfiguration() {
        try {
            // Charger depuis localStorage
            const saved = localStorage.getItem('pageManagerGmailConfig');
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
            
            // Charger les catégories depuis CategoryManager
            if (window.categoryManager) {
                this.cache.categories = window.categoryManager.getCategories();
                this.cache.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
            }
            
            console.log('[PageManagerGmail] 📋 Configuration chargée');
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur chargement config:', error);
        }
    }
    
    setupEventListeners() {
        // Écouter les changements de catégories
        window.addEventListener('categoryChanged', (e) => this.handleCategoryChange(e));
        window.addEventListener('emailsScanned', (e) => this.handleEmailsScanned(e));
        window.addEventListener('taskCreated', (e) => this.handleTaskCreated(e));
        
        // Écouter les raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        console.log('[PageManagerGmail] 🎯 Event listeners configurés');
    }
    
    setupGmailObservers() {
        // Observer les changements dans l'interface Gmail
        const observer = new MutationObserver((mutations) => {
            // Détecter les changements de vue Gmail
            for (const mutation of mutations) {
                if (mutation.target.classList && mutation.target.classList.contains('AO')) {
                    this.handleGmailViewChange();
                    break;
                }
            }
        });
        
        const gmailContainer = document.querySelector('.AO');
        if (gmailContainer) {
            observer.observe(gmailContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
    
    async syncWithModules() {
        console.log('[PageManagerGmail] 🔄 Synchronisation avec les modules...');
        
        // Sync avec EmailScanner
        if (window.emailScannerGmail) {
            const emails = await window.emailScannerGmail.getAllEmails();
            this.cache.emails = emails;
            this.syncState.emailsLoaded = true;
            console.log(`[PageManagerGmail] 📧 ${emails.length} emails synchronisés`);
        }
        
        // Sync avec CategoryManager
        if (window.categoryManager) {
            this.cache.categories = window.categoryManager.getCategories();
            this.cache.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
            this.syncState.categoriesLoaded = true;
        }
        
        // Sync avec TaskManager
        if (window.taskManager) {
            this.syncState.tasksLoaded = true;
        }
        
        this.syncState.lastSync = Date.now();
    }
    
    // ================================================
    // NAVIGATION & CHARGEMENT DES PAGES
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManagerGmail] 📄 Chargement page: ${pageName}`);
        
        if (this.currentPage === pageName && !this.needsRefresh()) {
            console.log('[PageManagerGmail] Page déjà chargée et à jour');
            return;
        }
        
        this.ui.loading = true;
        this.showLoading(`Chargement ${this.getPageTitle(pageName)}...`);
        
        try {
            const container = this.getContainer();
            if (!container) {
                throw new Error('Container non trouvé');
            }
            
            // Nettoyer le container
            container.innerHTML = '';
            container.className = 'page-container gmail-page';
            
            // Router vers la bonne méthode
            switch (pageName) {
                case 'emails':
                    await this.renderEmailsPage(container);
                    break;
                case 'scanner':
                    await this.renderScannerPage(container);
                    break;
                case 'tasks':
                    await this.renderTasksPage(container);
                    break;
                case 'categories':
                    await this.renderCategoriesPage(container);
                    break;
                case 'settings':
                    await this.renderSettingsPage(container);
                    break;
                case 'dashboard':
                    await this.renderDashboard(container);
                    break;
                default:
                    throw new Error(`Page inconnue: ${pageName}`);
            }
            
            this.currentPage = pageName;
            this.updateNavigation(pageName);
            this.hideLoading();
            
            console.log(`[PageManagerGmail] ✅ Page ${pageName} chargée`);
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur chargement page:', error);
            this.hideLoading();
            this.showError(error.message);
        } finally {
            this.ui.loading = false;
        }
    }
    
    // ================================================
    // RENDU PAGE EMAILS
    // ================================================
    async renderEmailsPage(container) {
        console.log('[PageManagerGmail] 📧 Rendu page emails Gmail...');
        
        // Vérifier authentification
        if (!await this.checkAuth()) {
            container.innerHTML = this.renderAuthRequired();
            return;
        }
        
        // Rafraîchir les emails si nécessaire
        if (!this.syncState.emailsLoaded || this.needsRefresh()) {
            await this.refreshEmails();
        }
        
        const emails = this.getFilteredEmails();
        const stats = this.calculateStats(emails);
        
        // Structure HTML optimisée pour Gmail
        container.innerHTML = `
            <div class="gmail-emails-page">
                ${this.renderEmailsHeader(stats)}
                ${this.renderEmailsToolbar()}
                ${this.renderCategoryTabs(stats)}
                <div class="emails-content">
                    ${this.renderEmailsList(emails)}
                </div>
            </div>
        `;
        
        // Ajouter les styles Gmail
        this.injectGmailStyles();
        
        // Initialiser les interactions
        this.initEmailsInteractions();
        
        // Analyse IA automatique si activée
        if (this.config.enableAI && this.config.autoAnalyze) {
            this.startAutoAnalysis(emails);
        }
    }
    
    renderEmailsHeader(stats) {
        return `
            <div class="gmail-header">
                <div class="gmail-logo">
                    <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Gmail">
                </div>
                <div class="gmail-search">
                    <div class="search-wrapper">
                        <button class="search-toggle">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                        <input type="text" 
                               id="gmail-search-input"
                               class="gmail-search-input" 
                               placeholder="Rechercher dans les emails" 
                               value="${this.filters.search}">
                        ${this.filters.search ? `
                            <button class="search-clear" onclick="window.pageManagerGmail.clearSearch()">
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="gmail-stats">
                    <span class="stat-item">
                        <strong>${stats.total}</strong> emails
                    </span>
                    <span class="stat-item">
                        <strong>${stats.selected}</strong> sélectionnés
                    </span>
                    ${stats.preselected > 0 ? `
                        <span class="stat-item starred">
                            <strong>${stats.preselected}</strong> ⭐
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderEmailsToolbar() {
        const hasSelection = this.selectedEmails.size > 0;
        
        return `
            <div class="gmail-toolbar">
                <div class="toolbar-left">
                    <button class="toolbar-btn checkbox-all" onclick="window.pageManagerGmail.toggleSelectAll()">
                        <input type="checkbox" class="gmail-checkbox">
                    </button>
                    
                    <button class="toolbar-btn dropdown-btn" onclick="window.pageManagerGmail.showSelectionMenu(event)">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </button>
                    
                    <button class="toolbar-btn" onclick="window.pageManagerGmail.refreshEmails()" title="Actualiser">
                        <svg class="icon-refresh" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                    
                    <div class="toolbar-separator"></div>
                    
                    ${hasSelection ? `
                        <button class="toolbar-btn primary" onclick="window.pageManagerGmail.createTasksFromSelection()">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                            <span>Créer tâche${this.selectedEmails.size > 1 ? 's' : ''}</span>
                        </button>
                        
                        <button class="toolbar-btn" onclick="window.pageManagerGmail.archiveSelection()">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                            </svg>
                            <span>Archiver</span>
                        </button>
                        
                        <button class="toolbar-btn clear-selection" onclick="window.pageManagerGmail.clearSelection()">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                            <span>Effacer (${this.selectedEmails.size})</span>
                        </button>
                    ` : ''}
                </div>
                
                <div class="toolbar-right">
                    <div class="view-modes">
                        ${this.renderViewModes()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderViewModes() {
        const modes = [
            { id: 'grouped-domain', icon: '🌐', title: 'Par domaine' },
            { id: 'grouped-sender', icon: '👤', title: 'Par expéditeur' },
            { id: 'flat', icon: '📋', title: 'Liste' }
        ];
        
        return modes.map(mode => `
            <button class="view-mode-btn ${this.ui.viewMode === mode.id ? 'active' : ''}"
                    onclick="window.pageManagerGmail.changeViewMode('${mode.id}')"
                    title="${mode.title}">
                <span class="mode-icon">${mode.icon}</span>
            </button>
        `).join('');
    }
    
    renderCategoryTabs(stats) {
        const categories = this.getCategoriesWithCounts();
        
        return `
            <div class="gmail-categories">
                <div class="category-scroll">
                    ${this.renderCategoryTab('all', 'Tous', '📧', stats.total, false)}
                    ${categories.map(cat => 
                        this.renderCategoryTab(cat.id, cat.name, cat.icon, cat.count, cat.isPreselected)
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    renderCategoryTab(id, name, icon, count, isPreselected) {
        const isActive = this.filters.category === id;
        
        return `
            <button class="category-tab ${isActive ? 'active' : ''} ${isPreselected ? 'preselected' : ''}"
                    onclick="window.pageManagerGmail.filterByCategory('${id}')"
                    data-category="${id}">
                <span class="tab-content">
                    <span class="tab-icon">${icon}</span>
                    <span class="tab-name">${name}</span>
                    <span class="tab-count">${count}</span>
                    ${isPreselected ? '<span class="preselected-indicator">⭐</span>' : ''}
                </span>
            </button>
        `;
    }
    
    renderEmailsList(emails) {
        if (emails.length === 0) {
            return this.renderEmptyState();
        }
        
        switch (this.ui.viewMode) {
            case 'grouped-domain':
                return this.renderGroupedEmails(emails, 'domain');
            case 'grouped-sender':
                return this.renderGroupedEmails(emails, 'sender');
            default:
                return this.renderFlatEmails(emails);
        }
    }
    
    renderFlatEmails(emails) {
        return `
            <div class="gmail-email-list">
                ${emails.map(email => this.renderEmailRow(email)).join('')}
            </div>
        `;
    }
    
    renderGroupedEmails(emails, groupBy) {
        const groups = this.groupEmails(emails, groupBy);
        
        return `
            <div class="gmail-email-groups">
                ${groups.map(group => this.renderEmailGroup(group)).join('')}
            </div>
        `;
    }
    
    renderEmailGroup(group) {
        const isExpanded = this.ui.expandedGroups.has(group.key);
        
        return `
            <div class="email-group ${isExpanded ? 'expanded' : ''}" data-group="${group.key}">
                <div class="group-header" onclick="window.pageManagerGmail.toggleGroup('${group.key}')">
                    <div class="group-avatar" style="background: ${this.generateColor(group.name)}">
                        ${group.avatar}
                    </div>
                    <div class="group-info">
                        <div class="group-name">${group.name}</div>
                        <div class="group-meta">${group.count} emails • ${this.formatDate(group.latest)}</div>
                    </div>
                    <button class="group-toggle">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </button>
                </div>
                ${isExpanded ? `
                    <div class="group-emails">
                        ${group.emails.map(email => this.renderEmailRow(email)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderEmailRow(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const isPreselected = this.isEmailPreselected(email);
        const hasTask = this.emailHasTask(email);
        
        return `
            <div class="gmail-email-row ${isSelected ? 'selected' : ''} ${isPreselected ? 'preselected' : ''} ${hasTask ? 'has-task' : ''}"
                 data-email-id="${email.id}">
                
                <div class="email-checkbox-cell">
                    <input type="checkbox" 
                           class="gmail-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onchange="window.pageManagerGmail.toggleEmailSelection('${email.id}')">
                </div>
                
                <div class="email-star-cell">
                    <button class="star-btn ${email.isStarred ? 'starred' : ''}"
                            onclick="window.pageManagerGmail.toggleStar('${email.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="email-importance ${email.importance || 'normal'}">
                    <div class="importance-marker"></div>
                </div>
                
                <div class="email-content" onclick="window.pageManagerGmail.openEmail('${email.id}')">
                    <div class="email-sender">
                        ${this.escapeHtml(email.from?.emailAddress?.name || 'Unknown')}
                        ${email.unread ? '<span class="unread-indicator"></span>' : ''}
                    </div>
                    
                    <div class="email-subject-line">
                        <span class="email-subject">${this.escapeHtml(email.subject || 'No subject')}</span>
                        <span class="email-snippet"> - ${this.escapeHtml(email.bodyPreview || '')}</span>
                    </div>
                    
                    <div class="email-labels">
                        ${this.renderEmailLabels(email)}
                    </div>
                </div>
                
                <div class="email-metadata">
                    ${email.hasAttachments ? '<span class="attachment-icon">📎</span>' : ''}
                    <span class="email-date">${this.formatDate(email.receivedDateTime)}</span>
                </div>
                
                <div class="email-actions">
                    ${this.renderEmailActions(email, hasTask)}
                </div>
            </div>
        `;
    }
    
    renderEmailLabels(email) {
        const labels = [];
        
        // Catégorie
        if (email.category && email.category !== 'other') {
            const category = this.cache.categories[email.category];
            if (category) {
                labels.push(`
                    <span class="email-label category-label" style="background: ${category.color}20; color: ${category.color}">
                        ${category.icon} ${category.name}
                    </span>
                `);
            }
        }
        
        // Pré-sélectionné
        if (this.isEmailPreselected(email)) {
            labels.push('<span class="email-label preselected-label">⭐ Tâche auto</span>');
        }
        
        // Simulé
        if (email.webSimulated) {
            labels.push('<span class="email-label simulated-label">🤖 Simulé</span>');
        }
        
        return labels.join('');
    }
    
    renderEmailActions(email, hasTask) {
        return `
            ${!hasTask ? `
                <button class="action-btn create-task" 
                        onclick="event.stopPropagation(); window.pageManagerGmail.createTask('${email.id}')"
                        title="Créer une tâche">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                    </svg>
                </button>
            ` : `
                <button class="action-btn view-task" 
                        onclick="event.stopPropagation(); window.pageManagerGmail.viewTask('${email.id}')"
                        title="Voir la tâche">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                </button>
            `}
            
            <button class="action-btn archive" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.archiveEmail('${email.id}')"
                    title="Archiver">
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                </svg>
            </button>
        `;
    }
    
    renderEmptyState() {
        let message, action;
        
        if (this.filters.search) {
            message = `Aucun email trouvé pour "${this.filters.search}"`;
            action = `<button class="btn-primary" onclick="window.pageManagerGmail.clearSearch()">Effacer la recherche</button>`;
        } else if (this.filters.category !== 'all') {
            message = 'Aucun email dans cette catégorie';
            action = `<button class="btn-primary" onclick="window.pageManagerGmail.filterByCategory('all')">Voir tous les emails</button>`;
        } else {
            message = 'Aucun email à afficher';
            action = `<button class="btn-primary" onclick="window.pageManagerGmail.loadPage('scanner')">Scanner les emails</button>`;
        }
        
        return `
            <div class="gmail-empty-state">
                <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/zero_state_priority_2x.png" alt="Aucun email">
                <h3>${message}</h3>
                ${action}
            </div>
        `;
    }
    
    // ================================================
    // AUTRES PAGES
    // ================================================
    async renderScannerPage(container) {
        if (window.minimalScanModule) {
            await window.minimalScanModule.render(container);
        } else {
            container.innerHTML = `
                <div class="gmail-scanner-page">
                    <div class="scanner-card">
                        <div class="scanner-icon">
                            <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Gmail Scanner">
                        </div>
                        <h2>Scanner Gmail</h2>
                        <p>Analysez vos emails Gmail avec l'IA</p>
                        <button class="btn-primary large" onclick="window.pageManagerGmail.startScan()">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            Démarrer l'analyse
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    async renderTasksPage(container) {
        if (window.tasksView) {
            await window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="gmail-tasks-page">
                    <h2>Mes Tâches Gmail</h2>
                    <div class="tasks-placeholder">
                        <p>Module de tâches en cours de chargement...</p>
                    </div>
                </div>
            `;
        }
    }
    
    async renderCategoriesPage(container) {
        if (window.categoriesPage) {
            await window.categoriesPage.renderSettings(container);
        } else {
            const categories = Object.values(this.cache.categories);
            
            container.innerHTML = `
                <div class="gmail-categories-page">
                    <h2>Gestion des Catégories</h2>
                    <div class="categories-grid">
                        ${categories.map(cat => `
                            <div class="category-card" style="border-color: ${cat.color}">
                                <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                                    ${cat.icon}
                                </div>
                                <h3>${cat.name}</h3>
                                <p>${cat.description || 'Aucune description'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    async renderSettingsPage(container) {
        container.innerHTML = `
            <div class="gmail-settings-page">
                <h2>Paramètres Gmail Email Manager</h2>
                
                <div class="settings-section">
                    <h3>Analyse IA</h3>
                    <label class="setting-toggle">
                        <input type="checkbox" ${this.config.autoAnalyze ? 'checked' : ''} 
                               onchange="window.pageManagerGmail.updateConfig('autoAnalyze', this.checked)">
                        <span>Analyse automatique des emails</span>
                    </label>
                    <label class="setting-toggle">
                        <input type="checkbox" ${this.config.enableAI ? 'checked' : ''} 
                               onchange="window.pageManagerGmail.updateConfig('enableAI', this.checked)">
                        <span>Activer l'IA Claude</span>
                    </label>
                </div>
                
                <div class="settings-section">
                    <h3>Affichage</h3>
                    <label class="setting-toggle">
                        <input type="checkbox" ${this.config.showNotifications ? 'checked' : ''} 
                               onchange="window.pageManagerGmail.updateConfig('showNotifications', this.checked)">
                        <span>Afficher les notifications</span>
                    </label>
                </div>
                
                <div class="settings-section">
                    <h3>Synchronisation</h3>
                    <div class="sync-status">
                        <p>Dernière sync: ${this.formatDate(this.syncState.lastSync)}</p>
                        <p>Emails: ${this.cache.emails.length}</p>
                        <p>Catégories: ${Object.keys(this.cache.categories).length}</p>
                    </div>
                    <button class="btn-primary" onclick="window.pageManagerGmail.forceSync()">
                        Forcer la synchronisation
                    </button>
                </div>
            </div>
        `;
    }
    
    async renderDashboard(container) {
        const stats = this.calculateStats(this.cache.emails);
        
        container.innerHTML = `
            <div class="gmail-dashboard">
                <h1>Tableau de bord Gmail</h1>
                
                <div class="dashboard-cards">
                    <div class="stat-card">
                        <div class="stat-icon">📧</div>
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Emails total</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📨</div>
                        <div class="stat-value">${stats.unread}</div>
                        <div class="stat-label">Non lus</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${stats.starred}</div>
                        <div class="stat-label">Importants</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.tasks}</div>
                        <div class="stat-label">Tâches créées</div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>Actions rapides</h2>
                    <div class="action-grid">
                        <button class="action-card" onclick="window.pageManagerGmail.loadPage('scanner')">
                            <div class="action-icon">🔍</div>
                            <div class="action-label">Scanner</div>
                        </button>
                        <button class="action-card" onclick="window.pageManagerGmail.loadPage('emails')">
                            <div class="action-icon">📧</div>
                            <div class="action-label">Emails</div>
                        </button>
                        <button class="action-card" onclick="window.pageManagerGmail.loadPage('tasks')">
                            <div class="action-icon">✅</div>
                            <div class="action-label">Tâches</div>
                        </button>
                        <button class="action-card" onclick="window.pageManagerGmail.loadPage('categories')">
                            <div class="action-icon">🏷️</div>
                            <div class="action-label">Catégories</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ================================================
    // GESTION DES EMAILS
    // ================================================
    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        this.updateSelectionUI();
    }
    
    toggleSelectAll() {
        const visibleEmails = this.getFilteredEmails();
        const allSelected = visibleEmails.every(e => this.selectedEmails.has(e.id));
        
        if (allSelected) {
            // Tout désélectionner
            visibleEmails.forEach(e => this.selectedEmails.delete(e.id));
        } else {
            // Tout sélectionner
            visibleEmails.forEach(e => this.selectedEmails.add(e.id));
        }
        
        this.updateSelectionUI();
    }
    
    clearSelection() {
        this.selectedEmails.clear();
        this.updateSelectionUI();
    }
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            this.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        this.showLoading(`Création de ${this.selectedEmails.size} tâche(s)...`);
        
        try {
            let created = 0;
            
            for (const emailId of this.selectedEmails) {
                const email = this.getEmailById(emailId);
                if (email) {
                    const success = await this.createTaskFromEmail(email);
                    if (success) created++;
                }
            }
            
            this.hideLoading();
            this.showToast(`${created} tâche(s) créée(s) avec succès`, 'success');
            this.clearSelection();
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur création tâches:', error);
            this.hideLoading();
            this.showError('Erreur lors de la création des tâches');
        }
    }
    
    async createTask(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Afficher modal de création
        this.showTaskCreationModal(email);
    }
    
    async createTaskFromEmail(email) {
        try {
            // Analyser avec l'IA si disponible
            let taskData = null;
            
            if (this.config.enableAI && window.aiTaskAnalyzer) {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                if (analysis) {
                    taskData = {
                        title: analysis.mainTask?.title || `Email de ${email.from?.emailAddress?.name}`,
                        description: analysis.mainTask?.description || email.bodyPreview,
                        priority: analysis.mainTask?.priority || 'medium',
                        dueDate: analysis.mainTask?.dueDate,
                        emailId: email.id,
                        category: email.category,
                        aiGenerated: true
                    };
                }
            }
            
            // Fallback manuel
            if (!taskData) {
                taskData = {
                    title: `Email de ${email.from?.emailAddress?.name || 'Inconnu'}`,
                    description: email.bodyPreview || email.subject,
                    priority: 'medium',
                    emailId: email.id,
                    category: email.category,
                    aiGenerated: false
                };
            }
            
            // Créer la tâche
            if (window.taskManager) {
                const task = window.taskManager.createTaskFromEmail(taskData, email);
                return !!task;
            }
            
            return false;
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur création tâche:', error);
            return false;
        }
    }
    
    archiveSelection() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        // Simuler l'archivage
        this.showToast(`${count} email(s) archivé(s)`, 'success');
        
        // Retirer de la liste
        this.selectedEmails.forEach(id => {
            const index = this.cache.emails.findIndex(e => e.id === id);
            if (index > -1) {
                this.cache.emails.splice(index, 1);
            }
        });
        
        this.clearSelection();
        this.refreshEmailsList();
    }
    
    archiveEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Retirer de la liste
        const index = this.cache.emails.findIndex(e => e.id === emailId);
        if (index > -1) {
            this.cache.emails.splice(index, 1);
        }
        
        this.showToast('Email archivé', 'success');
        this.refreshEmailsList();
    }
    
    toggleStar(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        email.isStarred = !email.isStarred;
        
        // Mettre à jour l'UI
        const starBtn = document.querySelector(`[data-email-id="${emailId}"] .star-btn`);
        if (starBtn) {
            starBtn.classList.toggle('starred');
        }
    }
    
    openEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        this.showEmailModal(email);
    }
    
    // ================================================
    // FILTRES ET RECHERCHE
    // ================================================
    filterByCategory(categoryId) {
        this.filters.category = categoryId;
        this.refreshEmailsList();
        
        // Mettre à jour les tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryId);
        });
    }
    
    changeViewMode(mode) {
        this.ui.viewMode = mode;
        this.refreshEmailsList();
        
        // Mettre à jour les boutons
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.onclick.includes(mode));
        });
    }
    
    toggleGroup(groupKey) {
        if (this.ui.expandedGroups.has(groupKey)) {
            this.ui.expandedGroups.delete(groupKey);
        } else {
            this.ui.expandedGroups.add(groupKey);
        }
        
        // Mettre à jour l'UI
        const group = document.querySelector(`[data-group="${groupKey}"]`);
        if (group) {
            group.classList.toggle('expanded');
        }
    }
    
    handleSearch(value) {
        this.filters.search = value;
        
        // Debounce
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.refreshEmailsList();
        }, 300);
    }
    
    clearSearch() {
        this.filters.search = '';
        const input = document.getElementById('gmail-search-input');
        if (input) input.value = '';
        this.refreshEmailsList();
    }
    
    // ================================================
    // MODALS
    // ================================================
    showEmailModal(email) {
        const modalId = `email-modal-${Date.now()}`;
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'gmail-modal-overlay';
        modal.innerHTML = `
            <div class="gmail-modal">
                <div class="modal-header">
                    <h2>${this.escapeHtml(email.subject || 'Sans sujet')}</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="email-detail-header">
                        <div class="sender-info">
                            <div class="sender-avatar" style="background: ${this.generateColor(email.from?.emailAddress?.name)}">
                                ${(email.from?.emailAddress?.name || 'U')[0].toUpperCase()}
                            </div>
                            <div class="sender-details">
                                <div class="sender-name">${this.escapeHtml(email.from?.emailAddress?.name || 'Inconnu')}</div>
                                <div class="sender-email">${this.escapeHtml(email.from?.emailAddress?.address || '')}</div>
                            </div>
                        </div>
                        <div class="email-date">${this.formatFullDate(email.receivedDateTime)}</div>
                    </div>
                    
                    <div class="email-detail-content">
                        ${email.body?.content || email.bodyPreview || 'Aucun contenu'}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Fermer
                    </button>
                    ${!this.emailHasTask(email) ? `
                        <button class="btn-primary" onclick="document.getElementById('${modalId}').remove(); window.pageManagerGmail.createTask('${email.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                            Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showTaskCreationModal(email) {
        const modalId = `task-modal-${Date.now()}`;
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'gmail-modal-overlay';
        modal.innerHTML = `
            <div class="gmail-modal task-creation">
                <div class="modal-header">
                    <h2>Créer une tâche</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>Titre</label>
                        <input type="text" id="task-title" class="form-input" 
                               value="Email de ${this.escapeHtml(email.from?.emailAddress?.name || 'Inconnu')}">
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="task-description" class="form-textarea" rows="4">${this.escapeHtml(email.bodyPreview || email.subject || '')}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Priorité</label>
                            <select id="task-priority" class="form-select">
                                <option value="low">Basse</option>
                                <option value="medium" selected>Normale</option>
                                <option value="high">Haute</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'échéance</label>
                            <input type="date" id="task-duedate" class="form-input">
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Annuler
                    </button>
                    <button class="btn-primary" onclick="window.pageManagerGmail.saveTaskFromModal('${email.id}', '${modalId}')">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                        Créer la tâche
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async saveTaskFromModal(emailId, modalId) {
        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;
        
        if (!title) {
            this.showToast('Le titre est requis', 'error');
            return;
        }
        
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const taskData = {
            title,
            description,
            priority,
            dueDate,
            emailId: email.id,
            category: email.category,
            createdFrom: 'manual'
        };
        
        try {
            if (window.taskManager) {
                const task = window.taskManager.createTaskFromEmail(taskData, email);
                if (task) {
                    this.showToast('Tâche créée avec succès', 'success');
                    document.getElementById(modalId).remove();
                    this.refreshEmailsList();
                }
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur création tâche:', error);
            this.showError('Erreur lors de la création de la tâche');
        }
    }
    
    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getFilteredEmails() {
        let emails = [...this.cache.emails];
        
        // Filtrer par catégorie
        if (this.filters.category && this.filters.category !== 'all') {
            if (this.filters.category === 'other') {
                emails = emails.filter(e => !e.category || e.category === 'other');
            } else {
                emails = emails.filter(e => e.category === this.filters.category);
            }
        }
        
        // Filtrer par recherche
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            emails = emails.filter(e => 
                e.subject?.toLowerCase().includes(search) ||
                e.from?.emailAddress?.name?.toLowerCase().includes(search) ||
                e.from?.emailAddress?.address?.toLowerCase().includes(search) ||
                e.bodyPreview?.toLowerCase().includes(search)
            );
        }
        
        // Filtrer par état
        if (this.filters.unread) {
            emails = emails.filter(e => e.unread);
        }
        
        if (this.filters.starred) {
            emails = emails.filter(e => e.isStarred);
        }
        
        return emails;
    }
    
    groupEmails(emails, groupBy) {
        const groups = new Map();
        
        emails.forEach(email => {
            let key, name, avatar;
            
            if (groupBy === 'domain') {
                key = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                name = key;
                avatar = '🌐';
            } else {
                key = email.from?.emailAddress?.address || 'unknown';
                name = email.from?.emailAddress?.name || key;
                avatar = name[0].toUpperCase();
            }
            
            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    name,
                    avatar,
                    emails: [],
                    count: 0,
                    latest: null
                });
            }
            
            const group = groups.get(key);
            group.emails.push(email);
            group.count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!group.latest || emailDate > group.latest) {
                group.latest = emailDate;
            }
        });
        
        // Trier par date la plus récente
        return Array.from(groups.values()).sort((a, b) => b.latest - a.latest);
    }
    
    calculateStats(emails) {
        return {
            total: emails.length,
            selected: this.selectedEmails.size,
            unread: emails.filter(e => e.unread).length,
            starred: emails.filter(e => e.isStarred).length,
            preselected: emails.filter(e => this.isEmailPreselected(e)).length,
            tasks: emails.filter(e => this.emailHasTask(e)).length
        };
    }
    
    getCategoriesWithCounts() {
        const emails = this.cache.emails;
        const counts = new Map();
        
        // Compter les emails par catégorie
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts.set(cat, (counts.get(cat) || 0) + 1);
        });
        
        // Construire la liste des catégories
        const categories = [];
        const taskPreselected = new Set(this.cache.taskPreselectedCategories);
        
        Object.entries(this.cache.categories).forEach(([id, category]) => {
            if (id === 'all') return;
            
            const count = counts.get(id) || 0;
            if (count > 0) {
                categories.push({
                    id,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count,
                    isPreselected: taskPreselected.has(id)
                });
            }
        });
        
        // Ajouter "Autre" si nécessaire
        const otherCount = counts.get('other') || 0;
        if (otherCount > 0) {
            categories.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                color: '#6b7280',
                count: otherCount,
                isPreselected: false
            });
        }
        
        // Trier : pré-sélectionnées d'abord, puis par nombre
        return categories.sort((a, b) => {
            if (a.isPreselected && !b.isPreselected) return -1;
            if (!a.isPreselected && b.isPreselected) return 1;
            return b.count - a.count;
        });
    }
    
    isEmailPreselected(email) {
        return this.cache.taskPreselectedCategories.includes(email.category);
    }
    
    emailHasTask(email) {
        // Vérifier si une tâche existe pour cet email
        if (window.taskManager) {
            const tasks = window.taskManager.getTasks();
            return tasks.some(task => task.emailId === email.id);
        }
        return false;
    }
    
    getEmailById(emailId) {
        return this.cache.emails.find(e => e.id === emailId);
    }
    
    async checkAuth() {
        if (window.authService) {
            return window.authService.isAuthenticated();
        }
        return true; // Assume authentifié si pas d'authService
    }
    
    needsRefresh() {
        const now = Date.now();
        const lastUpdate = this.cache.lastUpdate || 0;
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        return (now - lastUpdate) > maxAge;
    }
    
    // ================================================
    // ACTIONS & ÉVÉNEMENTS
    // ================================================
    async refreshEmails() {
        console.log('[PageManagerGmail] 🔄 Actualisation des emails...');
        
        try {
            if (window.emailScannerGmail) {
                const emails = await window.emailScannerGmail.getAllEmails();
                this.cache.emails = emails;
                this.cache.lastUpdate = Date.now();
                this.syncState.emailsLoaded = true;
                
                console.log(`[PageManagerGmail] ✅ ${emails.length} emails actualisés`);
            }
            
            this.refreshEmailsList();
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur actualisation:', error);
            this.showError('Erreur lors de l\'actualisation');
        }
    }
    
    refreshEmailsList() {
        const container = document.querySelector('.emails-content');
        if (!container) return;
        
        const emails = this.getFilteredEmails();
        container.innerHTML = this.renderEmailsList(emails);
        
        this.updateSelectionUI();
        this.updateStats();
    }
    
    updateSelectionUI() {
        // Mettre à jour les checkboxes
        document.querySelectorAll('.gmail-email-row').forEach(row => {
            const emailId = row.dataset.emailId;
            const checkbox = row.querySelector('.gmail-checkbox');
            if (checkbox) {
                checkbox.checked = this.selectedEmails.has(emailId);
            }
            row.classList.toggle('selected', this.selectedEmails.has(emailId));
        });
        
        // Mettre à jour la toolbar
        const hasSelection = this.selectedEmails.size > 0;
        document.querySelectorAll('.toolbar-btn.primary, .toolbar-btn.clear-selection').forEach(btn => {
            btn.style.display = hasSelection ? 'flex' : 'none';
        });
        
        // Mettre à jour le checkbox "tout sélectionner"
        const selectAllCheckbox = document.querySelector('.checkbox-all .gmail-checkbox');
        if (selectAllCheckbox) {
            const visibleEmails = this.getFilteredEmails();
            const allSelected = visibleEmails.length > 0 && visibleEmails.every(e => this.selectedEmails.has(e.id));
            selectAllCheckbox.checked = allSelected;
            selectAllCheckbox.indeterminate = this.selectedEmails.size > 0 && !allSelected;
        }
    }
    
    updateStats() {
        const stats = this.calculateStats(this.getFilteredEmails());
        
        // Mettre à jour l'affichage des stats
        const statsContainer = document.querySelector('.gmail-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <span class="stat-item">
                    <strong>${stats.total}</strong> emails
                </span>
                <span class="stat-item">
                    <strong>${stats.selected}</strong> sélectionnés
                </span>
                ${stats.preselected > 0 ? `
                    <span class="stat-item starred">
                        <strong>${stats.preselected}</strong> ⭐
                    </span>
                ` : ''}
            `;
        }
    }
    
    initEmailsInteractions() {
        // Recherche
        const searchInput = document.getElementById('gmail-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Raccourcis clavier
        this.setupKeyboardShortcuts();
        
        // Auto-refresh
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        }
    }
    
    setupKeyboardShortcuts() {
        // Géré dans handleKeyboard
    }
    
    handleKeyboard(e) {
        if (this.currentPage !== 'emails') return;
        
        // Ctrl/Cmd + A : Tout sélectionner
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            this.toggleSelectAll();
        }
        
        // Escape : Effacer la sélection
        if (e.key === 'Escape') {
            this.clearSelection();
        }
        
        // Delete : Archiver la sélection
        if (e.key === 'Delete' && this.selectedEmails.size > 0) {
            e.preventDefault();
            this.archiveSelection();
        }
    }
    
    handleCategoryChange(event) {
        console.log('[PageManagerGmail] 📨 Changement de catégorie:', event.detail);
        
        // Recharger les catégories
        if (window.categoryManager) {
            this.cache.categories = window.categoryManager.getCategories();
            this.cache.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
        }
        
        // Rafraîchir si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.refreshEmailsList();
        }
    }
    
    handleEmailsScanned(event) {
        console.log('[PageManagerGmail] 📧 Emails scannés:', event.detail);
        
        // Synchroniser avec les nouveaux emails
        this.syncWithModules().then(() => {
            if (this.currentPage === 'emails') {
                this.refreshEmailsList();
            }
        });
    }
    
    handleTaskCreated(event) {
        console.log('[PageManagerGmail] ✅ Tâche créée:', event.detail);
        
        // Rafraîchir pour mettre à jour les indicateurs
        if (this.currentPage === 'emails') {
            this.refreshEmailsList();
        }
    }
    
    handleGmailViewChange() {
        console.log('[PageManagerGmail] 👁️ Vue Gmail changée');
        // Peut être utilisé pour synchroniser avec l'interface native Gmail
    }
    
    async startAutoAnalysis(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        console.log('[PageManagerGmail] 🤖 Démarrage analyse IA automatique...');
        
        // Analyser les emails pré-sélectionnés
        const toAnalyze = emails.filter(e => this.isEmailPreselected(e)).slice(0, 5);
        
        for (const email of toAnalyze) {
            try {
                await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            } catch (error) {
                console.error('[PageManagerGmail] Erreur analyse:', error);
            }
        }
    }
    
    startAutoRefresh() {
        // Actualiser toutes les 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            this.refreshEmails();
        }, 5 * 60 * 1000);
    }
    
    async startScan() {
        console.log('[PageManagerGmail] 🔍 Démarrage du scan Gmail...');
        
        try {
            if (window.emailScannerGmail) {
                this.showLoading('Scan des emails Gmail en cours...');
                
                const results = await window.emailScannerGmail.scan({
                    days: 7,
                    onProgress: (progress) => {
                        this.updateLoadingProgress(progress);
                    }
                });
                
                this.hideLoading();
                this.showToast(`${results.total} emails scannés avec succès`, 'success');
                
                // Recharger la page emails
                await this.loadPage('emails');
                
            } else {
                throw new Error('Scanner Gmail non disponible');
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur scan:', error);
            this.hideLoading();
            this.showError('Erreur lors du scan: ' + error.message);
        }
    }
    
    updateLoadingProgress(progress) {
        const loadingText = document.querySelector('.gmail-loading-text');
        if (loadingText && progress.message) {
            loadingText.textContent = progress.message;
        }
    }
    
    async forceSync() {
        this.showLoading('Synchronisation en cours...');
        
        try {
            await this.syncWithModules();
            await this.refreshEmails();
            
            this.hideLoading();
            this.showToast('Synchronisation terminée', 'success');
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur sync:', error);
            this.hideLoading();
            this.showError('Erreur de synchronisation');
        }
    }
    
    updateConfig(key, value) {
        this.config[key] = value;
        
        // Sauvegarder
        localStorage.setItem('pageManagerGmailConfig', JSON.stringify(this.config));
        
        console.log(`[PageManagerGmail] Config mise à jour: ${key} = ${value}`);
        
        // Actions spécifiques
        if (key === 'autoAnalyze' && value && this.currentPage === 'emails') {
            this.startAutoAnalysis(this.getFilteredEmails());
        }
    }
    
    viewTask(emailId) {
        // Rediriger vers la page des tâches
        this.loadPage('tasks').then(() => {
            // Essayer d'ouvrir la tâche spécifique
            if (window.tasksView && window.tasksView.showTaskByEmailId) {
                window.tasksView.showTaskByEmailId(emailId);
            }
        });
    }
    
    showSelectionMenu(event) {
        event.stopPropagation();
        
        const menuId = `selection-menu-${Date.now()}`;
        
        const menu = document.createElement('div');
        menu.id = menuId;
        menu.className = 'gmail-dropdown-menu';
        menu.style.cssText = `
            position: absolute;
            top: ${event.target.getBoundingClientRect().bottom + 5}px;
            left: ${event.target.getBoundingClientRect().left}px;
        `;
        
        menu.innerHTML = `
            <div class="dropdown-item" onclick="window.pageManagerGmail.selectAll()">
                Tout sélectionner
            </div>
            <div class="dropdown-item" onclick="window.pageManagerGmail.selectNone()">
                Tout désélectionner
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" onclick="window.pageManagerGmail.selectUnread()">
                Sélectionner non lus
            </div>
            <div class="dropdown-item" onclick="window.pageManagerGmail.selectStarred()">
                Sélectionner importants
            </div>
            <div class="dropdown-item" onclick="window.pageManagerGmail.selectPreselected()">
                Sélectionner pré-sélectionnés
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Fermer au clic ailleurs
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
    
    selectAll() {
        const emails = this.getFilteredEmails();
        emails.forEach(e => this.selectedEmails.add(e.id));
        this.updateSelectionUI();
    }
    
    selectNone() {
        this.clearSelection();
    }
    
    selectUnread() {
        const emails = this.getFilteredEmails().filter(e => e.unread);
        emails.forEach(e => this.selectedEmails.add(e.id));
        this.updateSelectionUI();
    }
    
    selectStarred() {
        const emails = this.getFilteredEmails().filter(e => e.isStarred);
        emails.forEach(e => this.selectedEmails.add(e.id));
        this.updateSelectionUI();
    }
    
    selectPreselected() {
        const emails = this.getFilteredEmails().filter(e => this.isEmailPreselected(e));
        emails.forEach(e => this.selectedEmails.add(e.id));
        this.updateSelectionUI();
    }
    
    // ================================================
    // UI & NOTIFICATIONS
    // ================================================
    showLoading(message = 'Chargement...') {
        const existingLoader = document.getElementById('gmail-loader');
        if (existingLoader) {
            existingLoader.querySelector('.gmail-loading-text').textContent = message;
            return;
        }
        
        const loader = document.createElement('div');
        loader.id = 'gmail-loader';
        loader.className = 'gmail-loading-overlay';
        loader.innerHTML = `
            <div class="gmail-loading-content">
                <div class="gmail-spinner"></div>
                <div class="gmail-loading-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(loader);
    }
    
    hideLoading() {
        const loader = document.getElementById('gmail-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    showToast(message, type = 'info') {
        const toastId = `toast-${Date.now()}`;
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `gmail-toast ${type}`;
        
        const icons = {
            info: '📋',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Suppression automatique
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    // ================================================
    // UTILITAIRES
    // ================================================
    getContainer() {
        return document.getElementById('pageContent') || 
               document.querySelector('.page-content') || 
               document.querySelector('#content');
    }
    
    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item, .nav-link').forEach(item => {
            const page = item.dataset.page || item.getAttribute('href')?.replace('#', '');
            item.classList.toggle('active', page === activePage);
        });
    }
    
    getPageTitle(pageName) {
        const titles = {
            emails: 'Emails',
            scanner: 'Scanner',
            tasks: 'Tâches',
            categories: 'Catégories',
            settings: 'Paramètres',
            dashboard: 'Tableau de bord'
        };
        
        return titles[pageName] || pageName;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Moins d'une heure
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m`;
        }
        
        // Moins d'un jour
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h`;
        }
        
        // Moins d'une semaine
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}j`;
        }
        
        // Plus ancien
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    }
    
    formatFullDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    generateColor(text) {
        if (!text) return '#6b7280';
        
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    renderAuthRequired() {
        return `
            <div class="gmail-auth-required">
                <div class="auth-card">
                    <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Gmail">
                    <h2>Connexion requise</h2>
                    <p>Connectez-vous à votre compte Google pour accéder à vos emails</p>
                    <button class="btn-primary large" onclick="window.authService?.login()">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Se connecter avec Google
                    </button>
                </div>
            </div>
        `;
    }
    
    // ================================================
    // STYLES CSS GMAIL
    // ================================================
    injectGmailStyles() {
        if (document.getElementById('gmail-page-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmail-page-styles';
        styles.textContent = `
            /* Reset et base */
            .gmail-page {
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                color: #202124;
                background: #f8f9fa;
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            /* Header Gmail */
            .gmail-header {
                background: white;
                border-bottom: 1px solid #dadce0;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 16px;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .gmail-logo img {
                height: 40px;
            }
            
            .gmail-search {
                flex: 1;
                max-width: 720px;
            }
            
            .search-wrapper {
                position: relative;
                background: #f1f3f4;
                border-radius: 8px;
                display: flex;
                align-items: center;
                transition: all 0.2s;
            }
            
            .search-wrapper:focus-within {
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            
            .search-toggle {
                background: none;
                border: none;
                padding: 12px 16px;
                cursor: pointer;
                color: #5f6368;
            }
            
            .gmail-search-input {
                flex: 1;
                background: none;
                border: none;
                padding: 12px 0;
                font-size: 16px;
                outline: none;
            }
            
            .search-clear {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: #5f6368;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gmail-stats {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 14px;
                color: #5f6368;
            }
            
            .stat-item.starred {
                color: #fbbc04;
                font-weight: 500;
            }
            
            /* Toolbar */
            .gmail-toolbar {
                background: white;
                border-bottom: 1px solid #dadce0;
                padding: 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 48px;
            }
            
            .toolbar-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .toolbar-btn {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 4px;
                color: #5f6368;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .toolbar-btn:hover {
                background: #f1f3f4;
            }
            
            .toolbar-btn.primary {
                background: #1a73e8;
                color: white;
                padding: 8px 16px;
            }
            
            .toolbar-btn.primary:hover {
                background: #1557b0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .toolbar-separator {
                width: 1px;
                height: 20px;
                background: #dadce0;
                margin: 0 8px;
            }
            
            .gmail-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            /* Categories */
            .gmail-categories {
                background: white;
                border-bottom: 1px solid #dadce0;
                padding: 8px 16px;
                overflow-x: auto;
            }
            
            .category-scroll {
                display: flex;
                gap: 8px;
                min-width: min-content;
            }
            
            .category-tab {
                background: none;
                border: none;
                padding: 8px 16px;
                cursor: pointer;
                border-radius: 16px;
                transition: all 0.2s;
                white-space: nowrap;
                position: relative;
            }
            
            .category-tab:hover {
                background: #f1f3f4;
            }
            
            .category-tab.active {
                background: #e8f0fe;
                color: #1967d2;
            }
            
            .category-tab.preselected .tab-name {
                font-weight: 600;
            }
            
            .tab-content {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .tab-count {
                color: #5f6368;
                font-size: 12px;
            }
            
            .preselected-indicator {
                position: absolute;
                top: 4px;
                right: 4px;
                font-size: 10px;
            }
            
            /* Email List */
            .gmail-email-list {
                background: white;
            }
            
            .gmail-email-row {
                display: flex;
                align-items: center;
                padding: 0 16px;
                border-bottom: 1px solid #f1f3f4;
                cursor: pointer;
                transition: all 0.1s;
                position: relative;
                min-height: 40px;
            }
            
            .gmail-email-row:hover {
                box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 
                            0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
                z-index: 1;
            }
            
            .gmail-email-row.selected {
                background: #e8f0fe;
            }
            
            .gmail-email-row.preselected {
                background: #f3e8ff;
            }
            
            .gmail-email-row.has-task .email-content {
                opacity: 0.7;
            }
            
            .email-checkbox-cell,
            .email-star-cell {
                width: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .star-btn {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: #dadce0;
                transition: color 0.2s;
            }
            
            .star-btn:hover {
                color: #fbbc04;
            }
            
            .star-btn.starred {
                color: #fbbc04;
            }
            
            .star-btn svg {
                fill: currentColor;
            }
            
            .email-importance {
                width: 12px;
                position: relative;
            }
            
            .importance-marker {
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 10px solid transparent;
            }
            
            .email-importance.high .importance-marker {
                border-bottom-color: #ea4335;
            }
            
            .email-content {
                flex: 1;
                min-width: 0;
                padding: 8px 16px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .email-sender {
                font-size: 14px;
                font-weight: 500;
                color: #202124;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .unread-indicator {
                width: 8px;
                height: 8px;
                background: #1a73e8;
                border-radius: 50%;
            }
            
            .email-subject-line {
                font-size: 14px;
                color: #202124;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .email-subject {
                font-weight: 400;
            }
            
            .email-snippet {
                color: #5f6368;
            }
            
            .email-labels {
                display: flex;
                gap: 4px;
                margin-top: 2px;
            }
            
            .email-label {
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: 500;
            }
            
            .category-label {
                border: 1px solid currentColor;
            }
            
            .preselected-label {
                background: #8b5cf6;
                color: white;
            }
            
            .simulated-label {
                background: #f1f3f4;
                color: #5f6368;
            }
            
            .email-metadata {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 16px;
                color: #5f6368;
                font-size: 14px;
            }
            
            .email-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .gmail-email-row:hover .email-actions {
                opacity: 1;
            }
            
            .action-btn {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 4px;
                color: #5f6368;
                transition: all 0.2s;
            }
            
            .action-btn:hover {
                background: #f1f3f4;
            }
            
            .action-btn.create-task:hover {
                color: #1a73e8;
            }
            
            .action-btn.view-task {
                color: #34a853;
            }
            
            /* Email Groups */
            .gmail-email-groups {
                background: white;
            }
            
            .email-group {
                margin-bottom: 8px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .group-header {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .group-header:hover {
                background: #f8f9fa;
            }
            
            .group-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 500;
                margin-right: 12px;
            }
            
            .group-info {
                flex: 1;
            }
            
            .group-name {
                font-weight: 500;
                color: #202124;
            }
            
            .group-meta {
                font-size: 13px;
                color: #5f6368;
            }
            
            .group-toggle {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: #5f6368;
                transition: transform 0.2s;
            }
            
            .email-group.expanded .group-toggle {
                transform: rotate(180deg);
            }
            
            .group-emails {
                border-top: 1px solid #f1f3f4;
            }
            
            /* Empty State */
            .gmail-empty-state {
                text-align: center;
                padding: 80px 20px;
                color: #5f6368;
            }
            
            .gmail-empty-state img {
                width: 200px;
                margin-bottom: 24px;
                opacity: 0.6;
            }
            
            .gmail-empty-state h3 {
                font-size: 22px;
                font-weight: 400;
                color: #202124;
                margin-bottom: 16px;
            }
            
            /* Modals */
            .gmail-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .gmail-modal {
                background: white;
                border-radius: 8px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .modal-header {
                padding: 24px;
                border-bottom: 1px solid #dadce0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-header h2 {
                font-size: 22px;
                font-weight: 400;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: #5f6368;
                border-radius: 4px;
            }
            
            .modal-close:hover {
                background: #f1f3f4;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #dadce0;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            /* Forms */
            .form-group {
                margin-bottom: 24px;
            }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #5f6368;
                margin-bottom: 8px;
            }
            
            .form-input,
            .form-textarea,
            .form-select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-size: 16px;
                transition: border 0.2s;
            }
            
            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                outline: none;
                border-color: #1a73e8;
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            /* Buttons */
            .btn-primary,
            .btn-secondary {
                padding: 8px 24px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #1a73e8;
                color: white;
            }
            
            .btn-primary:hover {
                background: #1557b0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .btn-secondary {
                background: white;
                color: #1a73e8;
                border: 1px solid #dadce0;
            }
            
            .btn-secondary:hover {
                background: #f8f9fa;
            }
            
            .btn-primary.large {
                padding: 12px 32px;
                font-size: 16px;
            }
            
            /* Loading */
            .gmail-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gmail-loading-content {
                text-align: center;
            }
            
            .gmail-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #1a73e8;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .gmail-loading-text {
                font-size: 16px;
                color: #5f6368;
            }
            
            /* Toast */
            .gmail-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #323232;
                color: white;
                padding: 12px 24px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                transition: transform 0.3s;
                z-index: 10000;
            }
            
            .gmail-toast.show {
                transform: translateX(-50%) translateY(0);
            }
            
            .gmail-toast.success {
                background: #34a853;
            }
            
            .gmail-toast.warning {
                background: #fbbc04;
                color: #202124;
            }
            
            .gmail-toast.error {
                background: #ea4335;
            }
            
            /* Dropdown Menu */
            .gmail-dropdown-menu {
                position: fixed;
                background: white;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                min-width: 200px;
                z-index: 1000;
                padding: 8px 0;
            }
            
            .dropdown-item {
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                color: #202124;
                transition: background 0.2s;
            }
            
            .dropdown-item:hover {
                background: #f1f3f4;
            }
            
            .dropdown-divider {
                height: 1px;
                background: #dadce0;
                margin: 8px 0;
            }
            
            /* View modes */
            .view-modes {
                display: flex;
                background: #f1f3f4;
                border-radius: 4px;
                padding: 2px;
            }
            
            .view-mode-btn {
                background: none;
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 3px;
                font-size: 13px;
                color: #5f6368;
                transition: all 0.2s;
            }
            
            .view-mode-btn:hover {
                background: rgba(0,0,0,0.05);
            }
            
            .view-mode-btn.active {
                background: white;
                color: #202124;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .gmail-header {
                    flex-wrap: wrap;
                }
                
                .gmail-search {
                    order: 3;
                    flex-basis: 100%;
                    margin-top: 8px;
                }
                
                .email-content {
                    padding: 8px;
                }
                
                .email-subject-line {
                    font-size: 13px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // ================================================
    // DESTRUCTION & NETTOYAGE
    // ================================================
    destroy() {
        console.log('[PageManagerGmail] 🧹 Destruction...');
        
        // Arrêter l'auto-refresh
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // Nettoyer les timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Retirer les styles
        const styles = document.getElementById('gmail-page-styles');
        if (styles) {
            styles.remove();
        }
        
        // Vider le cache
        this.cache = {
            emails: [],
            categories: {},
            taskPreselectedCategories: [],
            lastUpdate: 0
        };
        
        // Réinitialiser l'état
        this.selectedEmails.clear();
        this.ui.expandedGroups.clear();
        
        console.log('[PageManagerGmail] ✅ Destruction terminée');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
(function() {
    // Nettoyer l'ancienne instance
    if (window.pageManagerGmail) {
        console.log('[PageManagerGmail] 🔄 Nettoyage ancienne instance...');
        window.pageManagerGmail.destroy?.();
    }
    
    // Créer la nouvelle instance
    console.log('[PageManagerGmail] 🚀 Création nouvelle instance...');
    window.pageManagerGmail = new PageManagerGmail();
    
    // Exposer globalement pour compatibilité
    window.PageManagerGmail = PageManagerGmail;
    
    console.log('[PageManagerGmail] ✅ Version 1.0 chargée - Optimisé pour Gmail!');
})();
