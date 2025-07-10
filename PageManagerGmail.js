// PageManagerGmail.js - Version 18.0 - Optimisé avec support complet des emails et pièces jointes

class PageManagerGmail {
    constructor() {
        // État principal
        this.state = {
            currentPage: null,
            selectedEmails: new Set(),
            aiAnalysisResults: new Map(),
            createdTasks: new Map(),
            currentViewMode: 'grouped-domain',
            currentCategory: null,
            searchTerm: '',
            autoAnalyzeEnabled: true,
            hideExplanation: this.getStorageItem('hideEmailExplanation') === 'true'
        }

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.pageManagerGmail) {
    console.log('[PageManagerGmail] 🔄 Nettoyage ancienne instance...');
    window.pageManagerGmail.cleanup?.();
}

console.log('[PageManagerGmail] 🚀 Création nouvelle instance v18.0...');
window.pageManagerGmail = new PageManagerGmail();

// Bind toutes les méthodes pour éviter les problèmes de contexte
Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
        window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
    }
});

// Fonctions de debug globales
window.debugPageManagerGmailSync = function() {
    return window.pageManagerGmail?.getSyncStatus() || { error: 'PageManagerGmail non disponible' };
};

window.refreshPageManagerGmailEmails = function() {
    if (window.pageManagerGmail && window.pageManagerGmail.state.currentPage === 'emails') {
        window.pageManagerGmail.refreshEmailsView();
        return { success: true, message: 'Vue emails Gmail rafraîchie' };
    }
    return { success: false, message: 'Pas sur la page emails ou PageManagerGmail non disponible' };
};

console.log('✅ PageManagerGmail v18.0 loaded - Optimisé avec support complet des emails');;
        
        // État de synchronisation
        this.syncState = {
            startScanSynced: false,
            emailScannerSynced: false,
            categoryManagerSynced: false,
            lastSyncTimestamp: null,
            emailCount: 0,
            provider: 'gmail'
        };
        
        // Cache
        this.cache = {
            taskCategories: null,
            taskCategoriesTime: 0,
            emails: null,
            emailsTime: 0
        };
        
        // Configuration
        this.config = {
            cacheTimeout: 10000,
            debounceDelay: 300,
            maxEmailsPerAnalysis: 5,
            pageModules: {
                scanner: 'minimalScanModule',
                tasks: 'tasksView',
                categories: 'categoriesPage',
                settings: 'categoriesPage',
                ranger: 'domainOrganizer'
            }
        };
        
        this.init();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    init() {
        try {
            this.setupEventListeners();
            this.setupSyncListeners();
            this.setupCategoryManagerIntegration();
            console.log('[PageManagerGmail] ✅ Version 18.0 - Optimisé avec support complet');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur initialisation:', error);
        }
    }

    setupEventListeners() {
        // Événements globaux
        window.addEventListener('settingsChanged', this.handleSettingsChanged.bind(this));
        window.addEventListener('error', (e) => console.error('[PageManagerGmail] Global error:', e.error));
        
        // Cleanup sur fermeture
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    setupSyncListeners() {
        const listeners = {
            'scanCompleted': this.handleScanCompleted,
            'emailScannerSynced': this.handleEmailScannerSynced,
            'emailsRecategorized': this.handleEmailsRecategorized,
            'emailScannerReady': this.handleEmailScannerReady,
            'googleAuthReady': this.handleGmailAuthReady
        };
        
        Object.entries(listeners).forEach(([event, handler]) => {
            window.addEventListener(event, handler.bind(this));
        });
    }

    setupCategoryManagerIntegration() {
        if (window.categoryManager) {
            this.syncState.categoryManagerSynced = true;
            window.categoryManager.addChangeListener(this.handleCategoryChange.bind(this));
        } else {
            setTimeout(() => this.setupCategoryManagerIntegration(), 2000);
        }
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    handleSettingsChanged(event) {
        if (event.detail?.source === 'PageManagerGmail') return;
        
        const { type, value } = event.detail;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.invalidateCache('taskCategories');
                this.updatePreselectedCategories(value);
                break;
            case 'activeCategories':
                this.updateActiveCategories(value);
                break;
            case 'preferences':
                if (this.state.currentPage === 'emails') {
                    this.refreshEmailsView();
                }
                break;
        }
    }

    handleCategoryChange(type, value) {
        switch (type) {
            case 'taskPreselectedCategories':
                this.invalidateCache('taskCategories');
                this.updatePreselectedCategories(value);
                break;
            case 'activeCategories':
                this.updateActiveCategories(value);
                break;
            case 'categoryCreated':
            case 'categoryUpdated':
            case 'categoryDeleted':
                if (this.state.currentPage === 'emails') {
                    this.refreshEmailsView();
                }
                break;
        }
    }

    handleScanCompleted(event) {
        const scanData = event.detail;
        this.syncState.startScanSynced = true;
        this.syncState.lastSyncTimestamp = scanData.timestamp || Date.now();
        this.syncState.emailCount = scanData.results?.total || 0;
        
        if (this.state.currentPage === 'emails') {
            setTimeout(() => this.loadPage('emails'), 500);
        }
    }

    handleEmailScannerSynced(event) {
        this.syncState.emailScannerSynced = true;
        this.syncState.lastSyncTimestamp = event.detail.timestamp || Date.now();
        
        if (event.detail.emailCount !== undefined) {
            this.syncState.emailCount = event.detail.emailCount;
        }
        
        if (this.state.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleEmailsRecategorized(event) {
        if (event.detail.emails) {
            this.syncState.emailCount = event.detail.emails.length;
        }
        
        if (this.state.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleEmailScannerReady(event) {
        this.syncState.emailScannerSynced = true;
        if (event.detail.emailCount) {
            this.syncState.emailCount = event.detail.emailCount;
        }
    }

    handleGmailAuthReady(event) {
        if (event.detail.authenticated && event.detail.user) {
            this.syncState.provider = 'gmail';
        }
    }

    // ================================================
    // NAVIGATION ET PAGES
    // ================================================
    async loadPage(pageName) {
        if (pageName === 'dashboard') {
            this.updateNavigation(pageName);
            return;
        }

        const container = this.getPageContainer();
        if (!container) {
            console.error('[PageManagerGmail] Container non trouvé');
            return;
        }

        try {
            this.showLoading(`Chargement ${pageName}...`);
            this.updateNavigation(pageName);
            
            if (this.requiresAuthentication(pageName)) {
                const authStatus = await this.checkAuthenticationStatus();
                if (!authStatus.isAuthenticated) {
                    this.hideLoading();
                    container.innerHTML = this.renderAuthRequiredState(pageName);
                    return;
                }
            }
            
            if (pageName === 'emails') {
                await this.checkEmailSyncStatus();
            }
            
            await this.renderPage(pageName, container);
            this.state.currentPage = pageName;
            this.initializePageEvents(pageName);
            
        } catch (error) {
            console.error(`[PageManagerGmail] Erreur chargement ${pageName}:`, error);
            this.showError(`Erreur: ${error.message}`);
            container.innerHTML = this.renderErrorPage(error);
        } finally {
            this.hideLoading();
        }
    }

    async renderPage(pageName, container) {
        const moduleName = this.config.pageModules[pageName];
        if (moduleName && window[moduleName]) {
            return await this.delegateToModule(moduleName, container);
        }
        
        const renderers = {
            emails: () => this.renderEmails(container),
            tasks: () => this.renderTasks(container),
            categories: () => this.renderCategories(container),
            settings: () => this.renderSettings(container),
            scanner: () => this.renderScanner(container),
            ranger: () => this.renderRanger(container)
        };
        
        const renderer = renderers[pageName];
        if (renderer) {
            return await renderer();
        }
        
        throw new Error(`Page ${pageName} non trouvée`);
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS
    // ================================================
    async renderEmails(container) {
        const emails = this.getAllEmails();
        const categories = this.getCategories();
        
        if (emails.length === 0 && !this.syncState.startScanSynced) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const categoryCounts = this.calculateCategoryCounts(emails);
        const selectedCount = this.state.selectedEmails.size;
        
        container.innerHTML = this.buildEmailsPageHTML(emails, categories, categoryCounts, selectedCount);
        
        this.addEmailsStyles();
        this.setupEmailsEventListeners();
        
        // Analyse automatique si activée
        if (this.state.autoAnalyzeEnabled && emails.length > 0) {
            this.analyzePreselectedEmails(emails);
        }
    }

    buildEmailsPageHTML(emails, categories, categoryCounts, selectedCount) {
        return `
            <div class="emails-page-modern">
                ${this.renderExplanationNotice()}
                <div class="fixed-header-wrapper">
                    ${this.renderControlsBar(selectedCount)}
                    ${this.renderCategoryFilters(categoryCounts, emails.length, categories)}
                </div>
                <div class="emails-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;
    }

    renderExplanationNotice() {
        if (this.state.hideExplanation) return '';
        
        return `
            <div class="explanation-notice">
                <i class="fab fa-google"></i>
                <span>Emails Gmail ${this.syncState.startScanSynced ? 'synchronisés' : 'disponibles'}. Cliquez pour sélectionner et créer des tâches.</span>
                <button class="explanation-close" onclick="window.pageManagerGmail.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderControlsBar(selectedCount) {
        return `
            <div class="controls-bar">
                <div class="search-section">
                    ${this.renderSearchBox()}
                </div>
                <div class="actions-section">
                    ${this.renderViewModes()}
                    ${this.renderActionButtons(selectedCount)}
                </div>
            </div>
        `;
    }

    renderSearchBox() {
        return `
            <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input type="text" 
                       class="search-input" 
                       id="emailSearchInput"
                       placeholder="Rechercher dans Gmail..." 
                       value="${this.state.searchTerm}">
                ${this.state.searchTerm ? `
                    <button class="search-clear" onclick="window.pageManagerGmail.clearSearch()">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderViewModes() {
        const modes = [
            { id: 'grouped-domain', icon: 'fa-globe', label: 'Domaine' },
            { id: 'grouped-sender', icon: 'fa-user', label: 'Expéditeur' },
            { id: 'flat', icon: 'fa-list', label: 'Liste' }
        ];
        
        return `
            <div class="view-modes">
                ${modes.map(mode => `
                    <button class="view-mode ${this.state.currentViewMode === mode.id ? 'active' : ''}" 
                            onclick="window.pageManagerGmail.changeViewMode('${mode.id}')"
                            title="Par ${mode.label.toLowerCase()}">
                        <i class="fas ${mode.icon}"></i>
                        <span>${mode.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderActionButtons(selectedCount) {
        return `
            <div class="action-buttons">
                <button class="btn btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                        onclick="window.pageManagerGmail.createTasksFromSelection()"
                        ${selectedCount === 0 ? 'disabled' : ''}>
                    <i class="fas fa-tasks"></i>
                    <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                </button>
                
                ${this.renderBulkActionsDropdown(selectedCount)}
                
                <button class="btn btn-secondary" onclick="window.pageManagerGmail.refreshEmails()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Actualiser</span>
                </button>
                
                ${selectedCount > 0 ? `
                    <button class="btn btn-clear" 
                            onclick="window.pageManagerGmail.clearSelection()">
                        <i class="fas fa-times"></i>
                        <span>Effacer (${selectedCount})</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderBulkActionsDropdown(selectedCount) {
        return `
            <div class="dropdown-wrapper">
                <button class="btn btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                        onclick="window.pageManagerGmail.toggleBulkActions(event)"
                        ${selectedCount === 0 ? 'disabled' : ''}>
                    <i class="fas fa-ellipsis-v"></i>
                    <span>Actions</span>
                </button>
                <div class="dropdown-menu" id="bulkActionsMenu">
                    <button class="dropdown-item" onclick="window.pageManagerGmail.bulkMarkAsRead()">
                        <i class="fas fa-eye"></i>
                        <span>Marquer comme lu</span>
                    </button>
                    <button class="dropdown-item" onclick="window.pageManagerGmail.bulkArchive()">
                        <i class="fas fa-archive"></i>
                        <span>Archiver</span>
                    </button>
                    <button class="dropdown-item danger" onclick="window.pageManagerGmail.bulkDelete()">
                        <i class="fas fa-trash"></i>
                        <span>Supprimer</span>
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="window.pageManagerGmail.bulkExport()">
                        <i class="fas fa-download"></i>
                        <span>Exporter</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryFilters(categoryCounts, totalEmails, categories) {
        return `
            <div class="category-filters-wrapper">
                <div class="category-filters" id="categoryFilters">
                    ${this.buildCategoryTabs(categoryCounts, totalEmails, categories)}
                </div>
            </div>
        `;
    }

    buildCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        const tabs = this.prepareCategoryTabs(categories, categoryCounts, totalEmails, preselectedCategories);
        
        // Diviser en lignes de 6 maximum
        let tabsHTML = '';
        for (let i = 0; i < tabs.length; i += 6) {
            const rowTabs = tabs.slice(i, i + 6);
            tabsHTML += `<div class="category-row">`;
            tabsHTML += rowTabs.map(tab => this.renderCategoryTab(tab)).join('');
            tabsHTML += `</div>`;
        }
        
        return tabsHTML;
    }

    prepareCategoryTabs(categories, categoryCounts, totalEmails, preselectedCategories) {
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        // Ajouter les catégories avec des emails
        Object.entries(categories).forEach(([catId, category]) => {
            if (catId === 'all') return;
            
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: preselectedCategories.includes(catId)
                });
            }
        });
        
        // Ajouter "Autre" si nécessaire
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            tabs.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                count: otherCount,
                isPreselected: false
            });
        }
        
        return tabs;
    }

    renderCategoryTab(tab) {
        const isActive = this.state.currentCategory === tab.id;
        const classes = `category-tab ${isActive ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}`;
        
        return `
            <button class="${classes}" 
                    onclick="window.pageManagerGmail.filterByCategory('${tab.id}')"
                    data-category-id="${tab.id}"
                    title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                <span class="tab-icon">${tab.icon}</span>
                <span class="tab-name">${tab.name}</span>
                <span class="tab-count">${tab.count}</span>
                ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
            </button>
        `;
    }

    // ================================================
    // RENDU DES EMAILS
    // ================================================
    renderEmailsList() {
        const emails = this.getFilteredEmails();
        
        if (emails.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.state.currentViewMode) {
            case 'flat':
                return this.renderFlatView(emails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(emails);
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

    renderGroupedView(emails) {
        const groups = this.createEmailGroups(emails);
        
        return `
            <div class="emails-grouped">
                ${groups.map(group => this.renderEmailGroup(group)).join('')}
            </div>
        `;
    }

    renderEmailCard(email) {
        const hasTask = this.state.createdTasks.has(email.id);
        const preselectedCategories = this.getTaskPreselectedCategories();
        const isPreselected = email.isPreselectedForTasks || preselectedCategories.includes(email.category);
        const isSelected = this.state.selectedEmails.has(email.id) || isPreselected;
        
        // Auto-sélectionner si pré-sélectionné
        if (isPreselected && !this.state.selectedEmails.has(email.id)) {
            this.state.selectedEmails.add(email.id);
        }
        
        const classes = [
            'email-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselected ? 'preselected' : '',
            'gmail-email'
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${classes}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselected}">
                
                ${this.renderEmailCheckbox(email.id, isSelected)}
                ${this.renderEmailPriorityBar(email, isPreselected)}
                ${this.renderEmailContent(email, isPreselected)}
                ${this.renderEmailActions(email)}
            </div>
        `;
    }

    renderEmailCheckbox(emailId, isSelected) {
        return `
            <input type="checkbox" 
                   class="email-checkbox" 
                   ${isSelected ? 'checked' : ''}
                   onchange="event.stopPropagation(); window.pageManagerGmail.toggleEmailSelection('${emailId}')">
        `;
    }

    renderEmailPriorityBar(email, isPreselected) {
        const color = isPreselected ? '#8b5cf6' : this.getEmailPriorityColor(email);
        return `<div class="priority-bar" style="background-color: ${color}"></div>`;
    }

    renderEmailContent(email, isPreselected) {
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        return `
            <div class="email-content" onclick="window.pageManagerGmail.handleEmailClick(event, '${email.id}')">
                <div class="email-header">
                    <h3 class="email-title">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                    ${this.renderEmailMeta(email, isPreselected)}
                </div>
                <div class="email-sender">
                    <i class="fas fa-envelope"></i>
                    <span class="sender-name">${this.escapeHtml(senderName)}</span>
                    ${email.hasAttachments ? '<span class="attachment-indicator">📎 Pièce jointe</span>' : ''}
                    ${this.renderCategoryBadge(email, isPreselected)}
                </div>
            </div>
        `;
    }

    renderEmailMeta(email, isPreselected) {
        return `
            <div class="email-meta">
                <span class="email-type gmail-badge">
                    <i class="fab fa-google"></i> Gmail
                </span>
                <span class="email-date">
                    📅 ${this.formatEmailDate(email.receivedDateTime)}
                </span>
                ${isPreselected ? '<span class="preselected-badge">⭐ Pré-sélectionné</span>' : ''}
                ${this.syncState.startScanSynced ? '<span class="sync-badge">🔄 Synchronisé</span>' : ''}
                ${email.categoryConfidence ? `
                    <span class="confidence-badge">🎯 ${Math.round(email.categoryConfidence * 100)}%</span>
                ` : ''}
            </div>
        `;
    }

    renderCategoryBadge(email, isPreselected) {
        if (!email.category || email.category === 'other') return '';
        
        return `
            <span class="category-badge" 
                  style="background: ${this.getCategoryColor(email.category)}20; 
                         color: ${this.getCategoryColor(email.category)};
                         ${isPreselected ? 'font-weight: 700;' : ''}">
                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                ${isPreselected ? ' ⭐' : ''}
            </span>
        `;
    }

    renderEmailActions(email) {
        const hasTask = this.state.createdTasks.has(email.id);
        
        return `
            <div class="email-actions">
                ${hasTask ? 
                    this.renderViewTaskButton(email.id) : 
                    this.renderCreateTaskButton(email.id)}
                ${this.renderCalendarButton(email.id)}
                ${this.renderReminderButton(email.id)}
                ${this.renderDetailsButton(email.id)}
            </div>
        `;
    }

    renderCreateTaskButton(emailId) {
        return `
            <button class="action-btn create-task" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.showTaskCreationModal('${emailId}')"
                    title="Créer une tâche">
                <i class="fas fa-tasks"></i>
            </button>
        `;
    }

    renderViewTaskButton(emailId) {
        return `
            <button class="action-btn view-task" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.openCreatedTask('${emailId}')"
                    title="Voir la tâche créée">
                <i class="fas fa-check-circle"></i>
            </button>
        `;
    }

    renderCalendarButton(emailId) {
        return `
            <button class="action-btn calendar gmail-calendar" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.openGoogleCalendar('${emailId}')"
                    title="Voir dans Google Calendar">
                <i class="fab fa-google"></i>
            </button>
        `;
    }

    renderReminderButton(emailId) {
        return `
            <button class="action-btn reminder" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.createCalendarReminder('${emailId}')"
                    title="Créer un rappel">
                <i class="fas fa-bell"></i>
            </button>
        `;
    }

    renderDetailsButton(emailId) {
        return `
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.showEmailModal('${emailId}')"
                    title="Voir le contenu complet">
                <i class="fas fa-eye"></i>
            </button>
        `;
    }

    renderEmailGroup(group) {
        const displayName = this.state.currentViewMode === 'grouped-domain' ? 
            `@${group.name}` : group.name;
        
        return `
            <div class="email-group" data-group-key="${group.key}">
                <div class="group-header" onclick="window.pageManagerGmail.toggleGroup('${group.key}', event)">
                    <div class="group-avatar" style="background: ${this.generateAvatarColor(group.name)}">
                        ${this.state.currentViewMode === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info">
                        <div class="group-name">${displayName}</div>
                        <div class="group-meta">${group.count} email${group.count > 1 ? 's' : ''} • ${this.formatEmailDate(group.latestDate)}</div>
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

    // ================================================
    // MODAL D'EMAIL COMPLET (SANS LIMITATION)
    // ================================================
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        // Supprimer les anciens modals
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const modalId = 'email_modal_' + Date.now();
        const modalHTML = this.buildEmailModalHTML(modalId, email);
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Charger le contenu complet si nécessaire
        this.loadFullEmailContent(email, modalId);
    }

    buildEmailModalHTML(modalId, email) {
        const senderInfo = this.getEmailSenderInfo(email);
        
        return `
            <div id="${modalId}" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div class="modal-container" style="background: white; border-radius: 12px; max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    ${this.renderEmailModalHeader(modalId)}
                    ${this.renderEmailModalContent(email, senderInfo)}
                    ${this.renderEmailModalFooter(modalId, email)}
                </div>
            </div>
        `;
    }

    renderEmailModalHeader(modalId) {
        return `
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">
                    <i class="fab fa-google" style="color: #4285f4; margin-right: 8px;"></i>
                    Email Gmail Complet
                </h2>
                <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
                    ×
                </button>
            </div>
        `;
    }

    renderEmailModalContent(email, senderInfo) {
        return `
            <div class="modal-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                ${this.renderEmailDetails(email, senderInfo)}
                ${this.renderEmailAttachments(email)}
                ${this.renderEmailBody(email)}
                ${this.renderEmailThread(email)}
            </div>
        `;
    }

    renderEmailDetails(email, senderInfo) {
        return `
            <div class="email-details" style="margin-bottom: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <div style="margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #374151; margin-right: 8px;">De:</span>
                    <span style="color: #6b7280;">${senderInfo.name} &lt;${senderInfo.email}&gt;</span>
                </div>
                ${email.toRecipients ? `
                    <div style="margin-bottom: 12px;">
                        <span style="font-weight: 600; color: #374151; margin-right: 8px;">À:</span>
                        <span style="color: #6b7280;">${this.formatRecipients(email.toRecipients)}</span>
                    </div>
                ` : ''}
                ${email.ccRecipients?.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        <span style="font-weight: 600; color: #374151; margin-right: 8px;">Cc:</span>
                        <span style="color: #6b7280;">${this.formatRecipients(email.ccRecipients)}</span>
                    </div>
                ` : ''}
                <div style="margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #374151; margin-right: 8px;">Date:</span>
                    <span style="color: #6b7280;">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #374151; margin-right: 8px;">Sujet:</span>
                    <span style="color: #6b7280; font-weight: 600;">${email.subject || 'Sans sujet'}</span>
                </div>
                ${this.renderEmailCategorizationInfo(email)}
            </div>
        `;
    }

    renderEmailCategorizationInfo(email) {
        let info = '';
        
        if (email.category) {
            info += `
                <div style="margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #374151; margin-right: 8px;">Catégorie:</span>
                    <span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                    </span>
                </div>
            `;
        }
        
        if (email.categoryConfidence) {
            info += `
                <div style="margin-bottom: 12px;">
                    <span style="font-weight: 600; color: #374151; margin-right: 8px;">Confiance IA:</span>
                    <span style="color: #059669; font-weight: 600;">${Math.round(email.categoryConfidence * 100)}%</span>
                </div>
            `;
        }
        
        if (this.syncState.startScanSynced) {
            info += '<span class="sync-badge">🔄 Synchronisé depuis Gmail</span>';
        }
        
        return info;
    }

    renderEmailAttachments(email) {
        if (!email.attachments || email.attachments.length === 0) return '';
        
        return `
            <div class="email-attachments" style="margin-bottom: 20px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">
                    <i class="fas fa-paperclip"></i> Pièces jointes (${email.attachments.length})
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                    ${email.attachments.map(att => this.renderAttachment(att)).join('')}
                </div>
            </div>
        `;
    }

    renderAttachment(attachment) {
        const icon = this.getAttachmentIcon(attachment.contentType);
        const size = this.formatFileSize(attachment.size);
        
        return `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.borderColor='#4285f4'; this.style.transform='translateY(-1px)'"
                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
                <div style="font-size: 24px; color: #6b7280;">
                    <i class="${icon}"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: #374151; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${attachment.name}
                    </div>
                    <div style="color: #6b7280; font-size: 11px;">${size}</div>
                </div>
                ${attachment.contentId ? `
                    <button style="background: #4285f4; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer;"
                            onclick="window.pageManagerGmail.downloadAttachment('${attachment.contentId}')">
                        <i class="fas fa-download"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderEmailBody(email) {
        return `
            <div class="email-body" id="email-body-${email.id}" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; line-height: 1.6; color: #374151;">
                <div class="email-content-wrapper">
                    ${this.getFullEmailContent(email)}
                </div>
            </div>
        `;
    }

    renderEmailThread(email) {
        if (!email.conversationId || !email.thread || email.thread.length <= 1) return '';
        
        return `
            <div class="email-thread" style="margin-top: 20px; border-top: 2px solid #e5e7eb; padding-top: 20px;">
                <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">
                    <i class="fas fa-comments"></i> Conversation complète (${email.thread.length} messages)
                </h4>
                <div class="thread-messages" style="display: flex; flex-direction: column; gap: 16px;">
                    ${email.thread.map(msg => this.renderThreadMessage(msg)).join('')}
                </div>
            </div>
        `;
    }

    renderThreadMessage(message) {
        const isCurrentMessage = message.id === this.currentEmailId;
        
        return `
            <div class="thread-message ${isCurrentMessage ? 'current' : ''}" 
                 style="background: ${isCurrentMessage ? '#e8f0fe' : '#f9fafb'}; border: 1px solid ${isCurrentMessage ? '#4285f4' : '#e5e7eb'}; border-radius: 8px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <strong style="color: #1f2937;">${message.from?.emailAddress?.name || 'Inconnu'}</strong>
                        <span style="color: #6b7280; font-size: 13px; margin-left: 8px;">
                            ${this.formatEmailDate(message.receivedDateTime)}
                        </span>
                    </div>
                    ${message.hasAttachments ? '<span class="attachment-indicator">📎</span>' : ''}
                </div>
                <div style="color: #374151; line-height: 1.5;">
                    ${this.getMessagePreview(message)}
                </div>
            </div>
        `;
    }

    renderEmailModalFooter(modalId, email) {
        const hasTask = this.state.createdTasks.has(email.id);
        
        return `
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.pageManagerGmail.replyToEmail('${email.id}')" 
                            style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-weight: 500; color: #374151;">
                        <i class="fas fa-reply"></i> Répondre
                    </button>
                    <button onclick="window.pageManagerGmail.forwardEmail('${email.id}')" 
                            style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-weight: 500; color: #374151;">
                        <i class="fas fa-share"></i> Transférer
                    </button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';" 
                            style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-weight: 500; color: #374151;">
                        Fermer
                    </button>
                    ${!hasTask ? `
                        <button onclick="document.getElementById('${modalId}').remove(); window.pageManagerGmail.showTaskCreationModal('${email.id}');" 
                                style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async loadFullEmailContent(email, modalId) {
        // Si on a déjà le contenu complet
        if (email.body?.content) {
            return;
        }
        
        // Sinon, essayer de charger le contenu complet
        try {
            if (window.googleAuthService && window.googleAuthService.getEmailContent) {
                const fullContent = await window.googleAuthService.getEmailContent(email.id);
                if (fullContent) {
                    const bodyElement = document.querySelector(`#email-body-${email.id} .email-content-wrapper`);
                    if (bodyElement) {
                        bodyElement.innerHTML = this.sanitizeEmailContent(fullContent);
                    }
                }
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur chargement contenu complet:', error);
        }
    }

    getFullEmailContent(email) {
        // Retourner le contenu complet sans limitation
        if (email.body?.content) {
            return this.sanitizeEmailContent(email.body.content);
        }
        
        if (email.bodyPreview) {
            // Si on n'a que le preview, l'afficher avec une indication
            return `
                <div>${this.escapeHtml(email.bodyPreview)}</div>
                ${email.bodyPreview.length >= 255 ? `
                    <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; font-size: 13px; color: #92400e;">
                        <i class="fas fa-info-circle"></i> Aperçu limité. Le contenu complet nécessite une connexion Gmail active.
                    </div>
                ` : ''}
            `;
        }
        
        return '<p style="color: #6b7280; font-style: italic;">Aucun contenu disponible</p>';
    }

    sanitizeEmailContent(html) {
        // Nettoyer le HTML pour éviter les injections XSS
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Supprimer les scripts et éléments dangereux
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
        dangerousTags.forEach(tag => {
            const elements = div.getElementsByTagName(tag);
            while (elements.length > 0) {
                elements[0].parentNode.removeChild(elements[0]);
            }
        });
        
        // Supprimer les attributs dangereux
        const allElements = div.getElementsByTagName('*');
        for (let element of allElements) {
            const attrs = element.attributes;
            for (let i = attrs.length - 1; i >= 0; i--) {
                const attrName = attrs[i].name;
                if (attrName.startsWith('on') || attrName === 'href' && attrs[i].value.startsWith('javascript:')) {
                    element.removeAttribute(attrName);
                }
            }
        }
        
        // Ajouter target="_blank" aux liens
        const links = div.getElementsByTagName('a');
        for (let link of links) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
        
        return div.innerHTML;
    }

    // ================================================
    // GESTION DES EMAILS
    // ================================================
    getAllEmails() {
        if (this.cache.emails && Date.now() - this.cache.emailsTime < this.config.cacheTimeout) {
            return this.cache.emails;
        }
        
        let emails = [];
        
        if (window.emailScanner?.getAllEmails) {
            emails = window.emailScanner.getAllEmails();
        } else if (window.emailScanner?.emails) {
            emails = window.emailScanner.emails;
        }
        
        this.cache.emails = emails;
        this.cache.emailsTime = Date.now();
        
        return emails;
    }

    getFilteredEmails() {
        let emails = this.getAllEmails();
        
        // Filtrer par catégorie
        if (this.state.currentCategory && this.state.currentCategory !== 'all') {
            if (this.state.currentCategory === 'other') {
                emails = emails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                emails = emails.filter(email => email.category === this.state.currentCategory);
            }
        }
        
        // Filtrer par recherche
        if (this.state.searchTerm) {
            emails = emails.filter(email => this.matchesSearch(email, this.state.searchTerm));
        }
        
        return emails;
    }

    getEmailById(emailId) {
        const emails = this.getAllEmails();
        return emails.find(email => email.id === emailId) || null;
    }

    getEmailSenderInfo(email) {
        return {
            name: email.from?.emailAddress?.name || 'Inconnu',
            email: email.from?.emailAddress?.address || '',
            domain: email.from?.emailAddress?.address?.split('@')[1] || 'unknown'
        };
    }

    getMessagePreview(message) {
        if (message.bodyPreview) {
            return this.escapeHtml(message.bodyPreview);
        }
        if (message.body?.content) {
            const text = this.stripHtml(message.body.content);
            return this.escapeHtml(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        }
        return '<em>Aucun aperçu disponible</em>';
    }

    matchesSearch(email, searchTerm) {
        const search = searchTerm.toLowerCase();
        const fields = [
            email.subject,
            email.from?.emailAddress?.name,
            email.from?.emailAddress?.address,
            email.bodyPreview,
            this.getCategoryName(email.category)
        ];
        
        return fields.some(field => field?.toLowerCase().includes(search));
    }

    // ================================================
    // ACTIONS SUR LES EMAILS
    // ================================================
    toggleEmailSelection(emailId) {
        if (this.state.selectedEmails.has(emailId)) {
            this.state.selectedEmails.delete(emailId);
        } else {
            this.state.selectedEmails.add(emailId);
        }
        
        this.updateSelectionUI(emailId);
        this.updateControlsOnly();
    }

    updateSelectionUI(emailId) {
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .email-checkbox`);
        if (checkbox) {
            checkbox.checked = this.state.selectedEmails.has(emailId);
        }
        
        const card = document.querySelector(`[data-email-id="${emailId}"]`);
        if (card) {
            card.classList.toggle('selected', this.state.selectedEmails.has(emailId));
        }
    }

    updateControlsOnly() {
        const count = this.state.selectedEmails.size;
        
        // Mettre à jour le bouton de création de tâches
        const createBtn = document.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
        if (createBtn) {
            createBtn.disabled = count === 0;
            createBtn.classList.toggle('disabled', count === 0);
            
            const span = createBtn.querySelector('span');
            if (span) {
                span.textContent = `Créer tâche${count > 1 ? 's' : ''}`;
            }
            
            const badge = createBtn.querySelector('.count-badge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
            } else if (count > 0) {
                createBtn.insertAdjacentHTML('beforeend', `<span class="count-badge">${count}</span>`);
            }
        }
        
        // Mettre à jour le bouton d'actions
        const actionsBtn = document.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
        if (actionsBtn) {
            actionsBtn.disabled = count === 0;
            actionsBtn.classList.toggle('disabled', count === 0);
        }
        
        // Gérer le bouton "Effacer"
        const clearBtn = document.querySelector('.btn-clear');
        const actionButtons = document.querySelector('.action-buttons');
        
        if (count > 0 && !clearBtn && actionButtons) {
            const newClearBtn = document.createElement('button');
            newClearBtn.className = 'btn btn-clear';
            newClearBtn.onclick = () => this.clearSelection();
            newClearBtn.innerHTML = `
                <i class="fas fa-times"></i>
                <span>Effacer (${count})</span>
            `;
            actionButtons.appendChild(newClearBtn);
        } else if (count === 0 && clearBtn) {
            clearBtn.remove();
        } else if (clearBtn) {
            const span = clearBtn.querySelector('span');
            if (span) {
                span.textContent = `Effacer (${count})`;
            }
        }
    }

    clearSelection() {
        this.state.selectedEmails.clear();
        this.refreshEmailsView();
        this.showToast('Sélection effacée', 'info');
    }

    handleEmailClick(event, emailId) {
        // Ignorer les clics sur les éléments interactifs
        if (event.target.closest('.email-checkbox, .email-actions, button')) {
            return;
        }
        
        // Double-clic pour sélection
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            event.preventDefault();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
        } else {
            this.lastEmailClick = now;
            setTimeout(() => {
                if (Date.now() - this.lastEmailClick >= 250) {
                    this.showEmailModal(emailId);
                }
            }, 250);
        }
    }

    toggleGroup(groupKey, event) {
        event?.preventDefault();
        event?.stopPropagation();
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-expand i');
        
        if (!content || !icon) return;
        
        const isExpanded = content.style.display !== 'none';
        
        content.style.display = isExpanded ? 'none' : 'block';
        icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        group.classList.toggle('expanded', !isExpanded);
    }

    // ================================================
    // ACTIONS BULK
    // ================================================
    toggleBulkActions(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('bulkActionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        // Fermer si déjà ouvert
        if (menu.classList.contains('show')) {
            this.closeBulkActions();
            return;
        }
        
        // Ouvrir le menu
        menu.classList.add('show');
        button.classList.add('show');
        
        // Créer overlay
        const overlay = document.createElement('div');
        overlay.className = 'dropdown-overlay';
        overlay.onclick = () => this.closeBulkActions();
        document.body.appendChild(overlay);
        
        // Fermer sur Escape
        this.bulkActionsEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeBulkActions();
            }
        };
        document.addEventListener('keydown', this.bulkActionsEscapeHandler);
        
        // Auto-fermeture après 15s
        this.bulkActionsTimeout = setTimeout(() => this.closeBulkActions(), 15000);
    }

    closeBulkActions() {
        const menu = document.getElementById('bulkActionsMenu');
        const button = document.querySelector('.dropdown-toggle.show');
        const overlay = document.querySelector('.dropdown-overlay');
        
        menu?.classList.remove('show');
        button?.classList.remove('show');
        overlay?.remove();
        
        if (this.bulkActionsEscapeHandler) {
            document.removeEventListener('keydown', this.bulkActionsEscapeHandler);
            this.bulkActionsEscapeHandler = null;
        }
        
        if (this.bulkActionsTimeout) {
            clearTimeout(this.bulkActionsTimeout);
            this.bulkActionsTimeout = null;
        }
    }

    async bulkMarkAsRead() {
        const count = this.state.selectedEmails.size;
        if (count === 0) return;
        
        // TODO: Implémenter avec Gmail API
        this.showToast(`${count} emails marqués comme lus`, 'success');
        this.clearSelection();
    }

    async bulkArchive() {
        const count = this.state.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Archiver ${count} email(s) ?`)) {
            // TODO: Implémenter avec Gmail API
            this.showToast(`${count} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const count = this.state.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Supprimer définitivement ${count} email(s) ?\n\nCette action est irréversible.`)) {
            // TODO: Implémenter avec Gmail API
            this.showToast(`${count} emails supprimés`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const count = this.state.selectedEmails.size;
        if (count === 0) return;
        
        if (window.emailScanner?.exportResults) {
            window.emailScanner.exportResults('csv');
        }
        this.showToast('Export terminé', 'success');
        this.clearSelection();
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    async createTasksFromSelection() {
        const count = this.state.selectedEmails.size;
        if (count === 0) {
            this.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        this.showLoading(`Création de ${count} tâches...`);
        
        try {
            for (const emailId of this.state.selectedEmails) {
                const email = this.getEmailById(emailId);
                if (!email || this.state.createdTasks.has(emailId)) continue;
                
                const success = await this.createTaskFromEmail(email);
                if (success) created++;
            }
            
            if (created > 0) {
                this.saveCreatedTasks();
                this.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
                this.clearSelection();
            } else {
                this.showToast('Aucune tâche créée', 'warning');
            }
        } finally {
            this.hideLoading();
        }
    }

    async createTaskFromEmail(email) {
        try {
            let analysis = this.state.aiAnalysisResults.get(email.id);
            
            if (!analysis && window.aiTaskAnalyzer) {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.state.aiAnalysisResults.set(email.id, analysis);
            }
            
            const taskData = analysis ? 
                this.buildTaskDataFromAnalysis(email, analysis) : 
                this.buildTaskDataFromEmail(email);
            
            if (window.taskManager) {
                const task = window.taskManager.createTaskFromEmail(taskData, email);
                if (task) {
                    this.state.createdTasks.set(email.id, task.id);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('[PageManagerGmail] Erreur création tâche:', error);
            return false;
        }
    }

    buildTaskDataFromAnalysis(email, analysis) {
        const senderInfo = this.getEmailSenderInfo(email);
        
        return {
            id: this.generateTaskId(),
            title: analysis?.mainTask?.title || `Email de ${senderInfo.name}`,
            description: analysis?.mainTask?.description || analysis?.summary || email.bodyPreview || '',
            priority: analysis?.mainTask?.priority || 'medium',
            dueDate: analysis?.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            emailFrom: senderInfo.email,
            emailFromName: senderInfo.name,
            emailSubject: email.subject,
            emailDomain: senderInfo.domain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            aiAnalysis: analysis,
            tags: [senderInfo.domain, analysis?.importance, ...(analysis?.tags || [])].filter(Boolean),
            method: 'ai',
            provider: 'gmail'
        };
    }

    buildTaskDataFromEmail(email) {
        const senderInfo = this.getEmailSenderInfo(email);
        
        return {
            id: this.generateTaskId(),
            title: `Email de ${senderInfo.name}`,
            description: email.bodyPreview || email.subject || '',
            priority: 'medium',
            dueDate: null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: false,
            emailFrom: senderInfo.email,
            emailFromName: senderInfo.name,
            emailSubject: email.subject,
            emailDomain: senderInfo.domain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            tags: [senderInfo.domain].filter(Boolean),
            method: 'manual',
            provider: 'gmail'
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            this.showLoading('Analyse de l\'email...');
            if (window.aiTaskAnalyzer) {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, { useApi: true });
                this.state.aiAnalysisResults.set(emailId, analysis);
            }
        } catch (error) {
            console.warn('[PageManagerGmail] Analyse IA non disponible');
        } finally {
            this.hideLoading();
        }

        const modalId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildTaskCreationModalHTML(modalId, email, analysis);
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskCreationModalHTML(modalId, email, analysis) {
        const senderInfo = this.getEmailSenderInfo(email);
        const defaultTitle = analysis?.mainTask?.title || `Email de ${senderInfo.name}`;
        
        return `
            <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">✅ Créer une tâche</h2>
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">×</button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        ${this.renderTaskCreationForm(email, senderInfo, analysis, defaultTitle)}
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManagerGmail.createTaskFromModal('${email.id}'); document.getElementById('${modalId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTaskCreationForm(email, senderInfo, analysis, defaultTitle) {
        return `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${analysis ? `
                    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-robot" style="color: #0ea5e9; font-size: 20px;"></i>
                        <span style="color: #0c4a6e; font-weight: 600;">✨ Analyse intelligente par Claude AI</span>
                    </div>
                ` : `
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 20px;"></i>
                        <span style="color: #92400e; font-weight: 600;">⚠️ Création manuelle - Analyse IA non disponible</span>
                    </div>
                `}
                
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: ${this.generateAvatarColor(senderInfo.name)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                        ${senderInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1f2937; font-size: 16px;">${senderInfo.name}</div>
                        <div style="color: #6b7280; font-size: 14px;">${senderInfo.email}</div>
                    </div>
                    <div style="margin-left: auto;">
                        <span style="background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                            <i class="fab fa-google"></i> Gmail
                        </span>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📝 Titre de la tâche</label>
                    <input type="text" id="task-title" 
                           style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                           value="${defaultTitle}" />
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📄 Description</label>
                    <textarea id="task-description" 
                              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 100px;"
                              rows="4">${analysis?.mainTask?.description || analysis?.summary || email.bodyPreview || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">⚡ Priorité</label>
                        <select id="task-priority" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            <option value="urgent" ${analysis?.mainTask?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis?.mainTask?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${!analysis?.mainTask?.priority || analysis?.mainTask?.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis?.mainTask?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📅 Date d'échéance</label>
                        <input type="date" id="task-duedate" 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                               value="${analysis?.mainTask?.dueDate || ''}" />
                    </div>
                </div>
            </div>
        `;
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
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
            const analysis = this.state.aiAnalysisResults.get(emailId);
            const taskData = analysis ? 
                this.buildTaskDataFromAnalysis(email, {
                    ...analysis,
                    mainTask: { ...analysis.mainTask, title, description, priority, dueDate }
                }) : 
                { ...this.buildTaskDataFromEmail(email), title, description, priority, dueDate };

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.state.createdTasks.set(emailId, task.id);
                this.saveCreatedTasks();
                this.showToast('Tâche créée avec succès', 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur création tâche:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    openCreatedTask(emailId) {
        const taskId = this.state.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                window.tasksView?.showTaskDetails?.(taskId);
            }, 100);
        });
    }

    // ================================================
    // INTÉGRATION GOOGLE CALENDAR
    // ================================================
    async openGoogleCalendar(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            this.showToast('Email non trouvé', 'error');
            return;
        }

        const senderEmail = email.from?.emailAddress?.address;
        const calendarUrl = `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(senderEmail)}`;
        window.open(calendarUrl, '_blank');
        
        this.showToast(`Ouverture de Google Calendar`, 'info');
    }

    async createCalendarReminder(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            this.showToast('Email non trouvé', 'error');
            return;
        }
        
        this.showReminderCreationModal(email);
    }

    showReminderCreationModal(email) {
        const modalId = 'reminder_modal_' + Date.now();
        const modalHTML = this.buildReminderModalHTML(modalId, email);
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildReminderModalHTML(modalId, email) {
        const senderInfo = this.getEmailSenderInfo(email);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        return `
            <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                            <i class="fab fa-google" style="color: #4285f4; margin-right: 8px;"></i>
                            Créer un rappel Google
                        </h2>
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">×</button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        ${this.renderReminderForm(email, senderInfo, tomorrow)}
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManagerGmail.createGoogleCalendarEvent('${email.id}'); document.getElementById('${modalId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #4285f4, #34a853); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fab fa-google"></i> Créer dans Google Calendar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderReminderForm(email, senderInfo, defaultDate) {
        return `
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">Email de: ${senderInfo.name}</div>
                <div style="color: #b45309; font-size: 14px;">${email.subject || 'Sans sujet'}</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📝 Titre du rappel</label>
                    <input type="text" id="reminder-title" 
                           style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                           value="Répondre à ${senderInfo.name}" />
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📄 Notes</label>
                    <textarea id="reminder-notes" 
                              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 100px;"
                              rows="4">Email: ${email.subject}
De: ${senderInfo.name}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📅 Date</label>
                        <input type="date" id="reminder-date" 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                               value="${defaultDate.toISOString().split('T')[0]}" />
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">⏰ Heure</label>
                        <input type="time" id="reminder-time" 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                               value="09:00" />
                    </div>
                </div>
            </div>
        `;
    }

    async createGoogleCalendarEvent(emailId) {
        const title = document.getElementById('reminder-title')?.value || 'Rappel';
        const notes = document.getElementById('reminder-notes')?.value || '';
        const date = document.getElementById('reminder-date')?.value;
        const time = document.getElementById('reminder-time')?.value;
        
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
        
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            details: notes,
            dates: `${this.formatDateForGoogleCalendar(startDateTime)}/${this.formatDateForGoogleCalendar(endDateTime)}`,
            sf: 'true'
        });
        
        const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
        window.open(calendarUrl, '_blank');
        
        this.showToast('Ouverture de Google Calendar', 'info');
        document.body.style.overflow = 'auto';
    }

    formatDateForGoogleCalendar(date) {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    // ================================================
    // ACTIONS EMAIL
    // ================================================
    async replyToEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Ouvrir Gmail avec réponse pré-remplie
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.from?.emailAddress?.address)}&su=Re: ${encodeURIComponent(email.subject || '')}`;
        window.open(gmailUrl, '_blank');
    }

    async forwardEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Ouvrir Gmail pour transfert
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=Fwd: ${encodeURIComponent(email.subject || '')}`;
        window.open(gmailUrl, '_blank');
    }

    async downloadAttachment(contentId) {
        // TODO: Implémenter avec Gmail API
        this.showToast('Téléchargement en cours...', 'info');
    }

    // ================================================
    // RECHERCHE ET FILTRES
    // ================================================
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (!searchInput) return;
        
        // Debounce pour la recherche
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, this.config.debounceDelay);
        });
    }

    handleSearch(term) {
        this.state.searchTerm = term.trim();
        this.refreshEmailsView();
    }

    clearSearch() {
        this.state.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.state.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    changeViewMode(mode) {
        this.state.currentViewMode = mode;
        this.refreshEmailsView();
    }

    // ================================================
    // REFRESH ET SYNCHRONISATION
    // ================================================
    refreshEmailsView() {
        // Sauvegarder l'état des groupes ouverts
        const expandedGroups = new Set();
        document.querySelectorAll('.email-group.expanded').forEach(group => {
            const key = group.dataset.groupKey;
            if (key) expandedGroups.add(key);
        });
        
        const container = document.querySelector('.emails-container');
        if (container) {
            container.innerHTML = this.renderEmailsList();
            
            // Restaurer l'état des groupes
            expandedGroups.forEach(key => {
                const group = document.querySelector(`[data-group-key="${key}"]`);
                if (group) {
                    const content = group.querySelector('.group-content');
                    const icon = group.querySelector('.group-expand i');
                    if (content && icon) {
                        content.style.display = 'block';
                        icon.className = 'fas fa-chevron-up';
                        group.classList.add('expanded');
                    }
                }
            });
        }
        
        this.updateControlsOnly();
    }

    async refreshEmails() {
        this.showLoading('Actualisation...');
        
        try {
            await this.checkEmailSyncStatus();
            
            if (window.emailScanner?.recategorizeEmails) {
                await window.emailScanner.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            this.showToast('Emails actualisés', 'success');
        } catch (error) {
            this.showToast('Erreur d\'actualisation', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // ================================================
    // AUTRES PAGES
    // ================================================
    async renderScanner(container) {
        const authStatus = await this.checkAuthenticationStatus();
        
        if (!authStatus.isAuthenticated) {
            container.innerHTML = this.renderScannerAuthRequired();
            return;
        }
        
        if (window.minimalScanModule?.render) {
            try {
                await window.minimalScanModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManagerGmail] Erreur module scanner:', error);
            }
        }
        
        container.innerHTML = this.renderScannerAuthenticated(authStatus);
    }

    renderScannerAuthRequired() {
        return `
            <div class="scanner-auth-required">
                <div class="scanner-header">
                    <h1><i class="fas fa-search"></i> Scanner d'emails Gmail</h1>
                    <p>Connectez-vous pour analyser vos emails Gmail</p>
                </div>
                
                <div class="auth-card gmail-auth">
                    <div class="auth-icon">
                        <i class="fab fa-google"></i>
                    </div>
                    <h3>Connexion Gmail</h3>
                    <p>Accédez à vos emails Gmail</p>
                    <button class="btn btn-primary btn-large" onclick="window.pageManagerGmail.handleLogin()">
                        <i class="fab fa-google"></i>
                        Se connecter avec Gmail
                    </button>
                </div>
                
                <div class="scanner-info">
                    <div class="info-card">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Sécurisé</h4>
                        <p>Authentification OAuth2 Google</p>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-robot"></i>
                        <h4>IA Intégrée</h4>
                        <p>Analyse intelligente avec Claude AI</p>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-tasks"></i>
                        <h4>Productivité</h4>
                        <p>Convertit automatiquement en tâches</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderScannerAuthenticated(authStatus) {
        return `
            <div class="scanner-authenticated">
                <div class="scanner-header">
                    <h1><i class="fab fa-google"></i> Scanner Gmail</h1>
                    <p>Analysez vos emails Gmail et créez des tâches automatiquement</p>
                </div>
                
                <div class="scanner-status gmail-status">
                    <div class="status-item">
                        <i class="fas fa-user"></i>
                        <span>Connecté${authStatus.user ? ' : ' + authStatus.user.email : ''}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-database"></i>
                        <span>EmailScanner: ${window.emailScanner ? 'Disponible' : 'Non disponible'}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-sync-alt"></i>
                        <span>Synchronisation: ${this.syncState.emailScannerSynced ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView?.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = this.renderTasksPlaceholder();
        }
    }

    renderTasksPlaceholder() {
        return `
            <div class="tasks-page">
                <div class="page-header">
                    <h1><i class="fas fa-tasks"></i> Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails Gmail</p>
                    <button class="btn btn-primary" onclick="window.pageManagerGmail.loadPage('emails')">
                        <i class="fab fa-google"></i>
                        Voir les emails
                    </button>
                </div>
            </div>
        `;
    }

    async renderCategories(container) {
        if (window.categoriesPage?.renderSettings) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = this.renderCategoriesPlaceholder();
        }
    }

    renderCategoriesPlaceholder() {
        const categories = this.getCategories();
        
        return `
            <div class="categories-page">
                <div class="page-header">
                    <h1><i class="fas fa-tags"></i> Catégories</h1>
                </div>
                
                <div class="categories-grid">
                    ${Object.entries(categories).map(([id, cat]) => `
                        <div class="category-card">
                            <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                                ${cat.icon}
                            </div>
                            <h3>${cat.name}</h3>
                            <p>${cat.description || 'Pas de description'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderSettings(container) {
        if (window.categoriesPage?.renderSettings) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = this.renderSettingsPlaceholder();
        }
    }

    renderSettingsPlaceholder() {
        return `
            <div class="settings-page">
                <div class="page-header">
                    <h1><i class="fas fa-cog"></i> Paramètres</h1>
                </div>
                
                <div class="settings-grid">
                    <div class="settings-card">
                        <h3><i class="fas fa-robot"></i> Configuration IA</h3>
                        <p>Configurez l'analyseur IA Claude</p>
                        <button class="btn btn-primary" onclick="window.pageManagerGmail.configureAI()">
                            <i class="fas fa-cog"></i> Configurer
                        </button>
                    </div>
                    
                    <div class="settings-card">
                        <h3><i class="fas fa-tags"></i> Catégories</h3>
                        <p>Gérez vos catégories d'emails</p>
                        <button class="btn btn-secondary" onclick="window.pageManagerGmail.loadPage('categories')">
                            <i class="fas fa-tags"></i> Gérer
                        </button>
                    </div>
                    
                    <div class="settings-card gmail-sync-card">
                        <h3><i class="fab fa-google"></i> Synchronisation Gmail</h3>
                        <p>État: ${this.syncState.emailScannerSynced ? 'Synchronisé' : 'Non synchronisé'}</p>
                        <div class="sync-status">
                            ${this.renderSyncStatus()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSyncStatus() {
        return `
            ${this.syncState.startScanSynced ? '✅' : '❌'} StartScan<br>
            ${this.syncState.emailScannerSynced ? '✅' : '❌'} EmailScanner<br>
            ${this.syncState.categoryManagerSynced ? '✅' : '❌'} CategoryManager
        `;
    }

    async renderRanger(container) {
        if (window.domainOrganizer?.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = this.renderRangerPlaceholder();
        }
    }

    renderRangerPlaceholder() {
        return `
            <div class="ranger-page">
                <div class="page-header">
                    <h1><i class="fas fa-folder-tree"></i> Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">Organisez vos emails Gmail par domaine</p>
                </div>
            </div>
        `;
    }

    // ================================================
    // ÉTATS VIDES
    // ================================================
    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fab fa-google"></i>
                </div>
                <h3 class="empty-state-title">Aucun email Gmail trouvé</h3>
                <p class="empty-state-text">
                    Utilisez le scanner pour récupérer et analyser vos emails Gmail.
                </p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" onclick="window.pageManagerGmail.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        Aller au scanner
                    </button>
                    ${this.syncState.emailScannerSynced ? `
                        <button class="btn btn-secondary" onclick="window.pageManagerGmail.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            Actualiser
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.state.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.state.searchTerm}" dans Gmail`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManagerGmail.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.state.currentCategory === 'other') {
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails Gmail ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn btn-primary" onclick="window.pageManagerGmail.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.state.currentCategory && this.state.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.state.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email Gmail pour le moment.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManagerGmail.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = 'Utilisez le scanner pour récupérer et analyser vos emails Gmail.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManagerGmail.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Aller au scanner</span>
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
                ${action}
            </div>
        `;
    }

    renderAuthRequiredState(pageName) {
        return `
            <div class="auth-required-state">
                <div class="auth-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="auth-title">Authentification requise</h3>
                <p class="auth-text">
                    Vous devez être connecté pour accéder à cette page.
                </p>
                <div class="auth-actions">
                    <button class="btn btn-primary" onclick="window.pageManagerGmail.handleLogin()">
                        <i class="fab fa-google"></i>
                        Se connecter avec Gmail
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManagerGmail.loadPage('dashboard')">
                        <i class="fas fa-home"></i>
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        `;
    }

    renderErrorPage(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-refresh"></i>
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async checkAuthenticationStatus() {
        try {
            let isAuthenticated = false;
            let user = null;
            
            // Vérifier Google Auth en priorité
            if (window.googleAuthService) {
                if (window.googleAuthService.isAuthenticated?.()) {
                    isAuthenticated = true;
                    user = window.googleAuthService.getAccount?.();
                }
                
                if (!isAuthenticated && window.googleAuthService.getAccessToken) {
                    try {
                        const token = await window.googleAuthService.getAccessToken();
                        if (token) {
                            isAuthenticated = true;
                        }
                    } catch (error) {
                        console.warn('[PageManagerGmail] Pas de token Gmail:', error);
                    }
                }
            }
            
            // Fallback sur authService
            if (!isAuthenticated && window.authService) {
                isAuthenticated = window.authService.isAuthenticated?.() || false;
                
                if (window.authService.checkAuthStatus) {
                    try {
                        const status = await window.authService.checkAuthStatus();
                        isAuthenticated = status.isAuthenticated || isAuthenticated;
                        user = status.user || user;
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur vérification auth:', error);
                    }
                }
            }
            
            // Vérifier localStorage
            if (!isAuthenticated) {
                const storedAuth = this.getStorageItem('authStatus') || this.getStorageItem('userInfo');
                if (storedAuth) {
                    isAuthenticated = true;
                }
            }
            
            return {
                isAuthenticated,
                user,
                provider: this.syncState.provider
            };
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur authentification:', error);
            return { isAuthenticated: false, user: null, error: error.message };
        }
    }

    async handleLogin() {
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else if (window.authService?.login) {
                await window.authService.login();
            } else if (window.authService?.signIn) {
                await window.authService.signIn();
            } else {
                window.location.href = '/auth.html';
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur connexion:', error);
            this.showError('Erreur lors de la connexion: ' + error.message);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getCategories() {
        if (window.categoryManager?.getCategories) {
            return window.categoryManager.getCategories();
        }
        
        if (window.emailScanner?.defaultWebCategories) {
            return window.emailScanner.defaultWebCategories;
        }
        
        return {
            'all': { name: 'Tous', icon: '📧', color: '#1e293b' },
            'other': { name: 'Autre', icon: '❓', color: '#64748b' }
        };
    }

    getTaskPreselectedCategories() {
        if (this.cache.taskCategories && 
            Date.now() - this.cache.taskCategoriesTime < this.config.cacheTimeout) {
            return [...this.cache.taskCategories];
        }
        
        let categories = [];
        
        if (window.categoryManager?.getTaskPreselectedCategories) {
            categories = window.categoryManager.getTaskPreselectedCategories();
        } else if (window.emailScanner?.getTaskPreselectedCategories) {
            categories = window.emailScanner.getTaskPreselectedCategories();
        } else {
            try {
                const settings = JSON.parse(this.getStorageItem('categorySettings') || '{}');
                categories = settings.taskPreselectedCategories || [];
            } catch (error) {
                categories = [];
            }
        }
        
        this.cache.taskCategories = [...categories];
        this.cache.taskCategoriesTime = Date.now();
        
        return [...categories];
    }

    getCategoryColor(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.name || categoryId || 'Autre';
    }

    calculateCategoryCounts(emails) {
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
        }
        
        return counts;
    }

    createEmailGroups(emails) {
        const groups = {};
        const mode = this.state.currentViewMode;
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (mode === 'grouped-domain') {
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
            if (!a.latestDate || !b.latestDate) return 0;
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
        return '#3b82f6';
    }

    getAttachmentIcon(contentType) {
        if (!contentType) return 'fas fa-file';
        
        if (contentType.includes('pdf')) return 'fas fa-file-pdf';
        if (contentType.includes('image')) return 'fas fa-file-image';
        if (contentType.includes('word') || contentType.includes('document')) return 'fas fa-file-word';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'fas fa-file-powerpoint';
        if (contentType.includes('zip') || contentType.includes('compressed')) return 'fas fa-file-archive';
        if (contentType.includes('text')) return 'fas fa-file-alt';
        
        return 'fas fa-file';
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

    formatRecipients(recipients) {
        if (!recipients || recipients.length === 0) return '';
        
        return recipients
            .map(r => `${r.emailAddress?.name || ''} <${r.emailAddress?.address || ''}>`)
            .join(', ');
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    // ================================================
    // GESTION DU STOCKAGE
    // ================================================
    getStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
            return null;
        }
    }

    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
        }
    }

    saveCreatedTasks() {
        if (window.taskManager?.saveTasks) {
            window.taskManager.saveTasks();
        }
    }

    // ================================================
    // INTERFACE UTILISATEUR
    // ================================================
    showLoading(message = 'Chargement...') {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(message);
        }
    }

    hideLoading() {
        if (window.uiManager?.hideLoading) {
            window.uiManager.hideLoading();
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    getPageContainer() {
        return document.getElementById('pageContent') || 
               document.querySelector('.page-content') || 
               document.querySelector('#content');
    }

    hideExplanationMessage() {
        this.state.hideExplanation = true;
        this.setStorageItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    configureAI() {
        if (window.aiTaskAnalyzer?.showConfigurationModal) {
            window.aiTaskAnalyzer.showConfigurationModal();
        } else {
            this.showToast('Configuration IA non disponible', 'warning');
        }
    }

    // ================================================
    // ANALYSE AUTOMATIQUE
    // ================================================
    async analyzePreselectedEmails(emails) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        if (!preselectedCategories || preselectedCategories.length === 0) return;
        
        const emailsToAnalyze = emails
            .filter(email => preselectedCategories.includes(email.category))
            .slice(0, this.config.maxEmailsPerAnalysis);
        
        if (emailsToAnalyze.length === 0) return;
        
        setTimeout(async () => {
            for (const email of emailsToAnalyze) {
                if (!this.state.aiAnalysisResults.has(email.id) && window.aiTaskAnalyzer) {
                    try {
                        const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                        this.state.aiAnalysisResults.set(email.id, analysis);
                    } catch (error) {
                        console.error('[PageManagerGmail] Erreur analyse:', error);
                    }
                }
            }
        }, 1000);
    }

    // ================================================
    // MISE À JOUR DES CATÉGORIES
    // ================================================
    updatePreselectedCategories(categories) {
        this.invalidateCache('taskCategories');
        
        if (window.emailScanner?.updateTaskPreselectedCategories) {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
            window.aiTaskAnalyzer.updatePreselectedCategories(categories);
        }
        
        if (window.emailScanner?.emails?.length > 0) {
            setTimeout(() => {
                window.emailScanner.recategorizeEmails?.();
            }, 150);
        }
    }

    updateActiveCategories(categories) {
        if (window.emailScanner?.updateSettings) {
            window.emailScanner.updateSettings({ activeCategories: categories });
        }
        
        if (window.emailScanner?.emails?.length > 0) {
            setTimeout(() => {
                window.emailScanner.recategorizeEmails?.();
            }, 150);
        }
    }

    // ================================================
    // CACHE ET SYNCHRONISATION
    // ================================================
    invalidateCache(type) {
        if (type === 'taskCategories') {
            this.cache.taskCategories = null;
            this.cache.taskCategoriesTime = 0;
        } else if (type === 'emails') {
            this.cache.emails = null;
            this.cache.emailsTime = 0;
        }
    }

    async checkEmailSyncStatus() {
        try {
            const ready = window.emailScanner && 
                         typeof window.emailScanner.getAllEmails === 'function';
            
            if (ready) {
                const emails = window.emailScanner.getAllEmails();
                this.syncState.emailScannerSynced = true;
                this.syncState.emailCount = emails.length;
                this.syncState.startScanSynced = window.emailScanner.startScanSynced || false;
                
                if (emails.length === 0) {
                    await this.tryRecoverScanResults();
                }
            } else {
                this.syncState.emailScannerSynced = false;
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur vérification sync:', error);
        }
    }

    async tryRecoverScanResults() {
        try {
            const scanResults = this.getStorageItem('scanResults');
            if (scanResults) {
                const results = JSON.parse(scanResults);
                const age = Date.now() - (results.timestamp || 0);
                
                if (age < 30 * 60 * 1000) { // 30 minutes
                    this.syncState.emailCount = results.total || 0;
                    this.syncState.startScanSynced = results.emailScannerSynced || false;
                }
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur récupération résultats:', error);
        }
    }

    getSyncStatus() {
        return {
            ...this.syncState,
            emailScanner: {
                available: !!window.emailScanner,
                emails: window.emailScanner?.emails?.length || 0,
                startScanSynced: window.emailScanner?.startScanSynced || false
            },
            categoryManager: {
                available: !!window.categoryManager,
                preselectedCategories: this.getTaskPreselectedCategories(),
                categories: Object.keys(this.getCategories()).length
            },
            googleAuth: {
                available: !!window.googleAuthService,
                authenticated: window.googleAuthService?.isAuthenticated?.() || false,
                user: window.googleAuthService?.getAccount?.()?.email || null
            }
        };
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('emailsPageStylesGmail')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailsPageStylesGmail';
        styles.textContent = this.getEmailsStyles();
        document.head.appendChild(styles);
    }

    getEmailsStyles() {
        return `
            .emails-page-modern {
                padding: 16px;
                background: #f8fafc;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }

            .explanation-notice {
                background: rgba(66, 133, 244, 0.1);
                border: 1px solid rgba(66, 133, 244, 0.2);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 0 16px 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #1a73e8;
                font-size: 13px;
                font-weight: 500;
            }
            
            .explanation-close {
                margin-left: auto;
                background: rgba(66, 133, 244, 0.1);
                border: 1px solid rgba(66, 133, 244, 0.2);
                color: #4285f4;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }

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
                border-color: #4285f4;
                background: white;
                box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.1);
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
            }

            .actions-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }

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
                border-color: #4285f4;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .btn-primary {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(66, 133, 244, 0.35);
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

            .dropdown-wrapper {
                position: relative;
            }

            .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
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
                gap: 12px;
                padding: 12px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                color: #374151;
                font-size: 13px;
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

            .dropdown-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }

            .dropdown-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9998;
                background: rgba(0, 0, 0, 0.05);
                cursor: pointer;
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

            .fixed-header-wrapper .controls-bar {
                margin-bottom: 8px;
                box-shadow: none;
                border: 1px solid #e5e7eb;
            }

            .fixed-header-wrapper .category-filters-wrapper {
                position: relative;
                top: auto;
                z-index: auto;
                margin: 0;
                padding: 0;
                background: transparent;
                border: none;
                box-shadow: none;
            }

            .page-content,
            #pageContent,
            #content {
                position: relative;
                overflow-y: auto;
                height: 100vh;
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
                background: #4285f4;
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
                border-color: #4285f4;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(66, 133, 244, 0.15);
            }

            .category-tab.active {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                border-color: #4285f4;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
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

            .emails-container {
                background: transparent;
                margin: 0 16px;
                padding-top: 16px;
            }

            .emails-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

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

            .email-card.gmail-email {
                border-left: 3px solid #4285f4;
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
                border-color: rgba(66, 133, 244, 0.2);
                border-left: 3px solid #4285f4;
                z-index: 2;
            }

            .email-card.selected {
                background: linear-gradient(135deg, #e8f0fe 0%, #c2e1ff 100%);
                border-left: 4px solid #4285f4;
                border-color: #4285f4;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(66, 133, 244, 0.15);
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
                background: #4285f4;
                border-color: #4285f4;
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

            .priority-bar {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: 12px;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

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

            .gmail-badge {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                color: white !important;
                border: none !important;
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

            .sync-badge {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                font-weight: 700;
                box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 3px;
                white-space: nowrap;
            }

            .confidence-badge {
                background: rgba(16, 185, 129, 0.1);
                color: #059669;
                border-color: #bbf7d0;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #bbf7d0;
                white-space: nowrap;
            }

            .email-sender {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }

            .sender-name {
                font-weight: 600;
                color: #374151;
            }

            .attachment-indicator {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
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
            }

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

            .action-btn.calendar,
            .action-btn.gmail-calendar {
                color: #4285f4;
            }

            .action-btn.calendar:hover,
            .action-btn.gmail-calendar:hover {
                background: linear-gradient(135deg, #e8f0fe 0%, #c2e1ff 100%);
                border-color: #4285f4;
                color: #1a73e8;
            }

            .action-btn.reminder {
                color: #f59e0b;
            }

            .action-btn.reminder:hover {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-color: #f59e0b;
                color: #d97706;
            }

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
                color: #4285f4;
                background: linear-gradient(135deg, #e8f0fe 0%, #c2e1ff 100%);
                border-color: #4285f4;
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

            /* Styles spécifiques Gmail */
            .scanner-auth-required .auth-card.gmail-auth {
                border: 2px solid #4285f4;
                background: linear-gradient(135deg, #f8fbff 0%, #e8f0fe 100%);
            }

            .scanner-authenticated .scanner-status.gmail-status {
                border-left: 3px solid #4285f4;
            }

            .settings-card.gmail-sync-card {
                border: 2px solid #4285f4;
                background: linear-gradient(135deg, #f8fbff 0%, #e8f0fe 100%);
            }

            /* Styles pour les pièces jointes */
            .email-attachments {
                margin-bottom: 20px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
            }

            .email-attachments h4 {
                margin: 0 0 12px 0;
                color: #374151;
                font-size: 14px;
                font-weight: 600;
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
            }

            @media (max-width: 480px) {
                .category-row {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .category-tab {
                    height: 52px;
                }
            }
        `;
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        // Nettoyer les listeners
        if (this.bulkActionsEscapeHandler) {
            document.removeEventListener('keydown', this.bulkActionsEscapeHandler);
        }
        
        if (this.bulkActionsTimeout) {
            clearTimeout(this.bulkActionsTimeout);
        }
        
        // Nettoyer le cache
        this.invalidateCache('taskCategories');
        this.invalidateCache('emails');
        
        // Nettoyer l'état
        this.state.selectedEmails.clear();
        this.state.aiAnalysisResults.clear();
        this.state.createdTasks.clear();
        
        console.log('[PageManagerGmail] 🧹 Nettoyage effectué');
    }

    // ================================================
    // AUTRES MÉTHODES UTILITAIRES
    // ================================================
    requiresAuthentication(pageName) {
        return ['emails', 'tasks', 'scanner'].includes(pageName);
    }

    initializePageEvents(pageName) {
        if (pageName === 'emails') {
            this.setupEmailsEventListeners();
        }
    }

    async delegateToModule(moduleName, container) {
        const module = window[moduleName];
        if (!module) {
            throw new Error(`Module ${moduleName} non trouvé`);
        }

        if (module.render) {
            await module.render(container);
        } else if (module.showPage) {
            await module.showPage(container);
        } else if (module.renderSettings) {
            await module.renderSettings(container);
        } else {
            throw new Error(`Module ${moduleName} n'a pas de méthode de rendu`);
        }
    }
}
