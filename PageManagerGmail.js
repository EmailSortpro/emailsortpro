// PageManagerGmail.js - Version 18.0 - Optimisé avec affichage complet des emails

class PageManagerGmail {
    constructor() {
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        this.isInitialized = false;
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // État de synchronisation Gmail
        this.syncState = {
            startScanSynced: false,
            emailScannerSynced: false,
            categoryManagerSynced: false,
            lastSyncTimestamp: null,
            emailCount: 0,
            provider: 'gmail'
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
        
        // Cache pour le contenu des emails
        this.emailContentCache = new Map();
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupSyncListeners();
            this.setupCategoryManagerIntegration();
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Version 18.0 Gmail - Optimisé avec affichage complet');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur initialisation:', error);
        }
    }

    // ================================================
    // INTÉGRATION CATEGORYMANAGER (Optimisé)
    // ================================================
    setupCategoryManagerIntegration() {
        if (window.categoryManager) {
            this.syncState.categoryManagerSynced = true;
            window.categoryManager.addChangeListener((type, value) => {
                this.handleCategoryManagerChange(type, value);
            });
        } else {
            setTimeout(() => this.setupCategoryManagerIntegration(), 2000);
        }
    }

    handleCategoryManagerChange(type, value) {
        if (type === 'taskPreselectedCategories') {
            this.invalidateTaskCategoriesCache();
            if (window.emailScanner?.updateTaskPreselectedCategories) {
                window.emailScanner.updateTaskPreselectedCategories(value);
            }
        }
        
        if (this.currentPage === 'emails' && window.emailScanner?.emails?.length > 0) {
            setTimeout(() => window.emailScanner.recategorizeEmails?.(), 150);
        }
    }

    // ================================================
    // LISTENERS (Consolidé)
    // ================================================
    setupEventListeners() {
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.source !== 'PageManagerGmail') {
                this.handleGenericSettingsChanged(e.detail);
            }
        });
    }

    setupSyncListeners() {
        const handlers = {
            'scanCompleted': (e) => this.handleScanCompleted(e.detail),
            'emailScannerSynced': (e) => this.handleEmailScannerSynced(e.detail),
            'emailsRecategorized': () => this.currentPage === 'emails' && this.refreshEmailsView(),
            'googleAuthReady': (e) => e.detail.authenticated && (this.syncState.provider = 'gmail')
        };
        
        Object.entries(handlers).forEach(([event, handler]) => {
            window.addEventListener(event, handler);
        });
    }

    handleScanCompleted(scanData) {
        this.syncState.startScanSynced = true;
        this.syncState.lastSyncTimestamp = scanData.timestamp || Date.now();
        this.syncState.emailCount = scanData.results?.total || 0;
        this.lastScanData = scanData;
        
        if (this.currentPage === 'emails') {
            setTimeout(() => this.loadPage('emails'), 500);
        }
    }

    handleEmailScannerSynced(syncData) {
        this.syncState.emailScannerSynced = true;
        this.syncState.lastSyncTimestamp = syncData.timestamp || Date.now();
        if (syncData.emailCount !== undefined) {
            this.syncState.emailCount = syncData.emailCount;
        }
        if (this.currentPage === 'emails') {
            setTimeout(() => this.refreshEmailsView(), 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        const { type, value } = changeData;
        
        if (type === 'taskPreselectedCategories') {
            this.invalidateTaskCategoriesCache();
            if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
                window.aiTaskAnalyzer.updatePreselectedCategories(value);
            }
        }
        
        if (window.emailScanner?.emails?.length > 0) {
            setTimeout(() => window.emailScanner.recategorizeEmails?.(), 150);
        }
    }

    // ================================================
    // CHARGEMENT DES PAGES (Simplifié)
    // ================================================
    async loadPage(pageName) {
        if (!this.isInitialized) return;

        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content') || 
                         document.querySelector('#content');
        
        if (!container) {
            console.error('[PageManagerGmail] Container non trouvé');
            return;
        }

        try {
            this.showLoading(`Chargement ${pageName}...`);
            this.updateNavigation(pageName);
            container.innerHTML = '';
            
            if (this.requiresAuthentication(pageName)) {
                const authStatus = await this.checkAuthenticationStatus();
                if (!authStatus.isAuthenticated) {
                    this.hideLoading();
                    container.innerHTML = this.renderAuthRequired();
                    return;
                }
            }
            
            await this.renderPage(pageName, container);
            this.currentPage = pageName;
            this.hideLoading();

        } catch (error) {
            console.error(`[PageManagerGmail] Erreur chargement ${pageName}:`, error);
            this.hideLoading();
            this.showError(`Erreur: ${error.message}`);
        }
    }

    requiresAuthentication(pageName) {
        return ['emails', 'tasks', 'scanner'].includes(pageName);
    }

    async checkAuthenticationStatus() {
        try {
            let isAuthenticated = false;
            
            if (window.googleAuthService?.isAuthenticated) {
                isAuthenticated = window.googleAuthService.isAuthenticated();
            }
            
            if (!isAuthenticated && window.googleAuthService?.getAccessToken) {
                try {
                    const token = await window.googleAuthService.getAccessToken();
                    isAuthenticated = !!token;
                } catch (e) {}
            }
            
            return { isAuthenticated, provider: 'gmail' };
            
        } catch (error) {
            return { isAuthenticated: false };
        }
    }

    async renderPage(pageName, container) {
        const moduleName = this.pageModules[pageName];
        if (moduleName && window[moduleName]?.render) {
            return window[moduleName].render(container);
        }
        
        switch (pageName) {
            case 'emails':
                return this.renderEmails(container);
            case 'dashboard':
                this.showPageContent();
                break;
            default:
                container.innerHTML = `<div class="empty-state">Page ${pageName} en construction</div>`;
        }
    }

    // ================================================
    // MÉTHODES POUR RÉCUPÉRER LES DONNÉES
    // ================================================
    getAllEmails() {
        return window.emailScanner?.getAllEmails?.() || window.emailScanner?.emails || [];
    }

    getCategories() {
        return window.categoryManager?.getCategories?.() || 
               window.emailScanner?.defaultWebCategories || 
               { 'all': { name: 'Tous', icon: '📧', color: '#1e293b' } };
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        if (this._taskCategoriesCache && (now - this._taskCategoriesCacheTime) < 10000) {
            return [...this._taskCategoriesCache];
        }
        
        let categories = window.categoryManager?.getTaskPreselectedCategories?.() || 
                        window.emailScanner?.getTaskPreselectedCategories?.() || 
                        [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        return [...categories];
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS (Optimisé)
    // ================================================
    async renderEmails(container) {
        const emails = this.getAllEmails();
        const categories = this.getCategories();
        
        if (emails.length === 0 && !this.syncState.startScanSynced) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const categoryCounts = this.calculateCategoryCounts(emails);
        const selectedCount = this.selectedEmails.size;
        
        container.innerHTML = `
            <div class="emails-page-modern">
                ${!this.hideExplanation ? this.renderExplanationNotice() : ''}
                <div class="fixed-header-wrapper">
                    ${this.renderControlsBar(selectedCount)}
                    ${this.renderCategoryTabs(categoryCounts, emails.length, categories)}
                </div>
                <div class="emails-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.addEmailsStyles();
        this.setupEmailsEventListeners();
        
        // Auto-analyse si activée
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselected = this.getTaskPreselectedCategories();
            if (preselected.length > 0) {
                const toAnalyze = emails.filter(e => preselected.includes(e.category)).slice(0, 5);
                if (toAnalyze.length > 0) {
                    setTimeout(() => this.analyzeEmails(toAnalyze), 1000);
                }
            }
        }
    }

    renderExplanationNotice() {
        return `
            <div class="explanation-notice">
                <i class="fab fa-google"></i>
                <span>Emails Gmail ${this.syncState.startScanSynced ? 'synchronisés' : 'disponibles'}. Cliquez pour sélectionner et créer des tâches.</span>
                <button class="explanation-close" onclick="pageManagerGmail.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderControlsBar(selectedCount) {
        return `
            <div class="controls-bar">
                <div class="search-section">
                    <div class="search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="emailSearchInput"
                               placeholder="Rechercher dans Gmail..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="search-clear" onclick="pageManagerGmail.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="actions-section">
                    ${this.renderViewModes()}
                    ${this.renderActionButtons(selectedCount)}
                </div>
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
                    <button class="view-mode ${this.currentViewMode === mode.id ? 'active' : ''}" 
                            onclick="pageManagerGmail.changeViewMode('${mode.id}')"
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
                        onclick="pageManagerGmail.createTasksFromSelection()"
                        ${selectedCount === 0 ? 'disabled' : ''}>
                    <i class="fas fa-tasks"></i>
                    <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                </button>
                
                <button class="btn btn-secondary" onclick="pageManagerGmail.refreshEmails()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Actualiser</span>
                </button>
                
                ${selectedCount > 0 ? `
                    <button class="btn btn-clear" onclick="pageManagerGmail.clearSelection()">
                        <i class="fas fa-times"></i>
                        <span>Effacer (${selectedCount})</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselected = this.getTaskPreselectedCategories();
        const tabs = [{ id: 'all', name: 'Tous', icon: '📧', count: totalEmails }];
        
        Object.entries(categories).forEach(([id, cat]) => {
            if (id !== 'all' && (categoryCounts[id] || 0) > 0) {
                tabs.push({
                    id,
                    name: cat.name,
                    icon: cat.icon,
                    count: categoryCounts[id],
                    isPreselected: preselected.includes(id)
                });
            }
        });
        
        if (categoryCounts.other > 0) {
            tabs.push({ id: 'other', name: 'Autre', icon: '📌', count: categoryCounts.other });
        }
        
        return `
            <div class="category-filters-wrapper">
                <div class="category-filters">
                    ${tabs.map(tab => `
                        <button class="category-tab ${this.currentCategory === tab.id ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}" 
                                onclick="pageManagerGmail.filterByCategory('${tab.id}')"
                                data-category-id="${tab.id}">
                            <span class="tab-icon">${tab.icon}</span>
                            <span class="tab-name">${tab.name}</span>
                            <span class="tab-count">${tab.count}</span>
                            ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU DES EMAILS (Optimisé)
    // ================================================
    renderEmailsList() {
        const emails = this.getFilteredEmails();
        
        if (emails.length === 0) {
            return this.renderEmptyState();
        }

        if (this.currentViewMode === 'flat') {
            return `
                <div class="emails-list">
                    ${emails.map(email => this.renderEmailCard(email)).join('')}
                </div>
            `;
        }
        
        return this.renderGroupedView(emails);
    }

    getFilteredEmails() {
        let emails = this.getAllEmails();
        
        // Filtrer par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            emails = emails.filter(email => 
                this.currentCategory === 'other' 
                    ? (!email.category || email.category === 'other')
                    : email.category === this.currentCategory
            );
        }
        
        // Filtrer par recherche
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            emails = emails.filter(email => 
                (email.subject || '').toLowerCase().includes(search) ||
                (email.from?.emailAddress?.name || '').toLowerCase().includes(search) ||
                (email.from?.emailAddress?.address || '').toLowerCase().includes(search) ||
                (email.bodyPreview || '').toLowerCase().includes(search)
            );
        }
        
        return emails;
    }

    renderEmailCard(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const isPreselected = this.getTaskPreselectedCategories().includes(email.category);
        const isSelected = this.selectedEmails.has(email.id) || isPreselected;
        
        if (isPreselected && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselected ? 'preselected' : ''}" 
                 data-email-id="${email.id}">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); pageManagerGmail.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar" style="background-color: ${isPreselected ? '#8b5cf6' : '#3b82f6'}"></div>
                
                <div class="email-content" onclick="pageManagerGmail.handleEmailClick(event, '${email.id}')">
                    <div class="email-header">
                        <h3 class="email-title">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="email-type gmail-badge">
                                <i class="fab fa-google"></i> Gmail
                            </span>
                            <span class="email-date">
                                📅 ${this.formatDate(email.receivedDateTime)}
                            </span>
                            ${isPreselected ? '<span class="preselected-badge">⭐ Pré-sélectionné</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <i class="fas fa-envelope"></i>
                        <span class="sender-name">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="attachment-indicator">📎</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="email-actions">
                    ${this.renderEmailActions(email, hasTask)}
                </div>
            </div>
        `;
    }

    renderEmailActions(email, hasTask) {
        if (hasTask) {
            return `
                <button class="action-btn view-task" onclick="event.stopPropagation(); pageManagerGmail.openCreatedTask('${email.id}')" title="Voir la tâche">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="action-btn details" onclick="event.stopPropagation(); pageManagerGmail.showEmailModal('${email.id}')" title="Voir l'email">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }
        
        return `
            <button class="action-btn create-task" onclick="event.stopPropagation(); pageManagerGmail.showTaskCreationModal('${email.id}')" title="Créer une tâche">
                <i class="fas fa-tasks"></i>
            </button>
            <button class="action-btn calendar" onclick="event.stopPropagation(); pageManagerGmail.openGoogleCalendar('${email.id}')" title="Google Calendar">
                <i class="fab fa-google"></i>
            </button>
            <button class="action-btn details" onclick="event.stopPropagation(); pageManagerGmail.showEmailModal('${email.id}')" title="Voir l'email">
                <i class="fas fa-eye"></i>
            </button>
        `;
    }

    renderGroupedView(emails) {
        const groups = this.createEmailGroups(emails);
        
        return `
            <div class="emails-grouped">
                ${groups.map(group => `
                    <div class="email-group" data-group-key="${group.key}">
                        <div class="group-header" onclick="pageManagerGmail.toggleGroup('${group.key}')">
                            <div class="group-avatar" style="background: ${this.generateColor(group.name)}">
                                ${this.currentViewMode === 'grouped-domain' ? 
                                    '<i class="fas fa-globe"></i>' : 
                                    group.name.charAt(0).toUpperCase()
                                }
                            </div>
                            <div class="group-info">
                                <div class="group-name">${group.name}</div>
                                <div class="group-meta">${group.count} emails • ${this.formatDate(group.latestDate)}</div>
                            </div>
                            <div class="group-expand">
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        <div class="group-content" style="display: none;">
                            ${group.emails.map(email => this.renderEmailCard(email)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createEmailGroups(emails) {
        const groups = {};
        
        emails.forEach(email => {
            const key = this.currentViewMode === 'grouped-domain' 
                ? email.from?.emailAddress?.address?.split('@')[1] || 'unknown'
                : email.from?.emailAddress?.address || 'unknown';
            
            const name = this.currentViewMode === 'grouped-domain'
                ? `@${key}`
                : email.from?.emailAddress?.name || key;
            
            if (!groups[key]) {
                groups[key] = { key, name, emails: [], count: 0, latestDate: null };
            }
            
            groups[key].emails.push(email);
            groups[key].count++;
            
            const date = new Date(email.receivedDateTime);
            if (!groups[key].latestDate || date > groups[key].latestDate) {
                groups[key].latestDate = date;
            }
        });
        
        return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
    }

    // ================================================
    // MODAL D'AFFICHAGE D'EMAIL COMPLET
    // ================================================
    async showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        // Récupérer le contenu complet
        const fullContent = await this.getFullEmailContent(email);
        
        const modal = document.createElement('div');
        modal.className = 'email-modal-overlay';
        modal.innerHTML = `
            <div class="email-modal">
                <div class="email-modal-header">
                    <h2><i class="fab fa-google"></i> Email Gmail</h2>
                    <button class="modal-close" onclick="this.closest('.email-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="email-modal-content">
                    <div class="email-details">
                        <div class="detail-row">
                            <span class="detail-label">De:</span>
                            <span class="detail-value">${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Sujet:</span>
                            <span class="detail-value">${email.subject || 'Sans sujet'}</span>
                        </div>
                        ${email.category ? `
                            <div class="detail-row">
                                <span class="detail-label">Catégorie:</span>
                                <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                    ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="email-body">
                        ${fullContent}
                    </div>
                </div>
                <div class="email-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.email-modal-overlay').remove()">
                        Fermer
                    </button>
                    ${!this.createdTasks.has(emailId) ? `
                        <button class="btn btn-primary" onclick="document.querySelector('.email-modal-overlay').remove(); pageManagerGmail.showTaskCreationModal('${emailId}')">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async getFullEmailContent(email) {
        // Vérifier le cache
        if (this.emailContentCache.has(email.id)) {
            return this.emailContentCache.get(email.id);
        }
        
        let content = email.bodyPreview || 'Aucun contenu disponible';
        
        // Si on a le contenu HTML complet
        if (email.body?.content) {
            content = email.body.content;
        } else if (email.body?.contentType === 'html' && email.body?.content) {
            content = email.body.content;
        } else if (email.uniqueBody?.content) {
            content = email.uniqueBody.content;
        } else if (window.mailService && email.id) {
            // Essayer de récupérer le contenu complet via MailService
            try {
                const fullEmail = await this.fetchFullEmailContent(email.id);
                if (fullEmail && fullEmail.body) {
                    content = fullEmail.body;
                }
            } catch (error) {
                console.warn('[PageManagerGmail] Impossible de récupérer le contenu complet:', error);
            }
        }
        
        // Nettoyer et sécuriser le contenu HTML
        content = this.sanitizeEmailContent(content);
        
        // Mettre en cache
        this.emailContentCache.set(email.id, content);
        
        return content;
    }

    async fetchFullEmailContent(emailId) {
        if (!window.mailService || this.syncState.provider !== 'gmail') {
            return null;
        }
        
        try {
            // Utiliser l'API Gmail pour récupérer le contenu complet
            const accessToken = await window.googleAuthService?.getAccessToken();
            if (!accessToken) return null;
            
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) return null;
            
            const message = await response.json();
            
            // Extraire le contenu HTML ou texte
            let body = '';
            
            const extractBody = (parts) => {
                if (!parts) return '';
                
                for (const part of parts) {
                    if (part.mimeType === 'text/html' && part.body?.data) {
                        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    } else if (part.mimeType === 'text/plain' && part.body?.data && !body) {
                        body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    } else if (part.parts) {
                        const nested = extractBody(part.parts);
                        if (nested) return nested;
                    }
                }
                
                return body;
            };
            
            if (message.payload) {
                return extractBody([message.payload]);
            }
            
            return null;
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur récupération contenu email:', error);
            return null;
        }
    }

    sanitizeEmailContent(content) {
        // Créer un conteneur temporaire
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        // Supprimer les scripts et styles dangereux
        temp.querySelectorAll('script, link[rel="stylesheet"], style').forEach(el => el.remove());
        
        // Convertir les liens en target="_blank"
        temp.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        // Gérer les images
        temp.querySelectorAll('img').forEach(img => {
            // Ajouter une classe pour le style
            img.classList.add('email-image');
            
            // Gérer les erreurs de chargement
            img.onerror = function() {
                this.style.display = 'none';
            };
            
            // Limiter la largeur
            if (!img.style.maxWidth) {
                img.style.maxWidth = '100%';
            }
            img.style.height = 'auto';
        });
        
        return `
            <div class="email-content-wrapper">
                ${temp.innerHTML}
            </div>
        `;
    }

    // ================================================
    // ACTIONS SUR LES EMAILS
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
        const count = this.selectedEmails.size;
        
        // Mettre à jour le bouton de création
        const createBtn = document.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
        if (createBtn) {
            createBtn.disabled = count === 0;
            createBtn.classList.toggle('disabled', count === 0);
            const span = createBtn.querySelector('span');
            if (span) span.textContent = `Créer tâche${count > 1 ? 's' : ''}`;
            const badge = createBtn.querySelector('.count-badge');
            if (badge) badge.textContent = count;
        }
        
        // Gérer le bouton d'effacement
        const clearBtn = document.querySelector('.btn-clear');
        if (count > 0 && !clearBtn) {
            const actionsContainer = document.querySelector('.action-buttons');
            if (actionsContainer) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-clear';
                btn.onclick = () => this.clearSelection();
                btn.innerHTML = `<i class="fas fa-times"></i><span>Effacer (${count})</span>`;
                actionsContainer.appendChild(btn);
            }
        } else if (count === 0 && clearBtn) {
            clearBtn.remove();
        } else if (clearBtn) {
            clearBtn.querySelector('span').textContent = `Effacer (${count})`;
        }
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        this.showToast('Sélection effacée', 'info');
    }

    refreshEmailsView() {
        const container = document.querySelector('.emails-container');
        if (container) {
            container.innerHTML = this.renderEmailsList();
        }
        this.updateControlsOnly();
    }

    async refreshEmails() {
        this.showLoading('Actualisation...');
        
        try {
            if (window.emailScanner?.recategorizeEmails) {
                await window.emailScanner.recategorizeEmails();
            }
            await this.loadPage('emails');
            this.showToast('Emails actualisés', 'success');
        } catch (error) {
            this.hideLoading();
            this.showToast('Erreur d\'actualisation', 'error');
        }
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            this.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        this.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                const taskData = await this.buildTaskData(email);
                if (window.taskManager) {
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    if (task) {
                        this.createdTasks.set(emailId, task.id);
                        created++;
                    }
                }
            } catch (error) {
                console.error('[PageManagerGmail] Erreur création tâche:', error);
            }
        }
        
        this.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks?.();
            this.showToast(`${created} tâche${created > 1 ? 's créées' : ' créée'}`, 'success');
            this.clearSelection();
        }
    }

    async buildTaskData(email) {
        let analysis = this.aiAnalysisResults.get(email.id);
        
        if (!analysis && window.aiTaskAnalyzer) {
            try {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(email.id, analysis);
            } catch (e) {}
        }
        
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        return {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: analysis?.mainTask?.title || `Email de ${senderName}`,
            description: analysis?.mainTask?.description || email.bodyPreview || '',
            priority: analysis?.mainTask?.priority || 'medium',
            dueDate: analysis?.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: !!analysis,
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            provider: 'gmail'
        };
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        let analysis;
        try {
            this.showLoading('Analyse de l\'email...');
            if (window.aiTaskAnalyzer) {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(emailId, analysis);
            }
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
        }

        const modal = document.createElement('div');
        modal.className = 'task-modal-overlay';
        modal.innerHTML = `
            <div class="task-modal">
                <div class="task-modal-header">
                    <h2>✅ Créer une tâche</h2>
                    <button class="modal-close" onclick="this.closest('.task-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="task-modal-content">
                    ${analysis ? `
                        <div class="ai-badge">
                            <i class="fas fa-robot"></i>
                            <span>✨ Analyse intelligente par Claude AI</span>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>📝 Titre</label>
                        <input type="text" id="task-title" value="${analysis?.mainTask?.title || `Email de ${email.from?.emailAddress?.name || 'Inconnu'}`}" />
                    </div>
                    
                    <div class="form-group">
                        <label>📄 Description</label>
                        <textarea id="task-description" rows="4">${analysis?.mainTask?.description || email.bodyPreview || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>⚡ Priorité</label>
                            <select id="task-priority">
                                <option value="urgent" ${analysis?.mainTask?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                <option value="high" ${analysis?.mainTask?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${!analysis?.mainTask?.priority || analysis?.mainTask?.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${analysis?.mainTask?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>📅 Échéance</label>
                            <input type="date" id="task-duedate" value="${analysis?.mainTask?.dueDate || ''}" />
                        </div>
                    </div>
                </div>
                <div class="task-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.task-modal-overlay').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="pageManagerGmail.createTaskFromModal('${email.id}')">
                        <i class="fas fa-check"></i> Créer la tâche
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        const taskData = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: document.getElementById('task-title')?.value,
            description: document.getElementById('task-description')?.value,
            priority: document.getElementById('task-priority')?.value,
            dueDate: document.getElementById('task-duedate')?.value,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            provider: 'gmail'
        };

        if (!taskData.title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks?.();
                this.showToast('Tâche créée avec succès', 'success');
                document.querySelector('.task-modal-overlay')?.remove();
                this.refreshEmailsView();
            }
        } catch (error) {
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    // ================================================
    // AUTRES ACTIONS
    // ================================================
    async openGoogleCalendar(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const senderEmail = email.from?.emailAddress?.address;
        const calendarUrl = `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(senderEmail)}`;
        window.open(calendarUrl, '_blank');
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => window.tasksView?.showTaskDetails?.(taskId), 100);
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    handleEmailClick(event, emailId) {
        if (event.target.closest('.email-actions') || event.target.type === 'checkbox') {
            return;
        }
        this.showEmailModal(emailId);
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-expand i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            content.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.categoryId === categoryId);
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        document.querySelector('.explanation-notice')?.remove();
    }

    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim();
                    this.refreshEmailsView();
                }, 300);
            });
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const input = document.getElementById('emailSearchInput');
        if (input) input.value = '';
        this.refreshEmailsView();
    }

    async analyzeEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('[PageManagerGmail] Erreur analyse:', error);
                }
            }
        }
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        let otherCount = 0;
        
        emails.forEach(email => {
            if (email.category && email.category !== 'other') {
                counts[email.category] = (counts[email.category] || 0) + 1;
            } else {
                otherCount++;
            }
        });
        
        if (otherCount > 0) counts.other = otherCount;
        return counts;
    }

    getEmailById(emailId) {
        return this.getAllEmails().find(email => email.id === emailId);
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

    generateColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 65%, 45%), hsl(${(hue + 30) % 360}, 65%, 55%))`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // ================================================
    // MÉTHODES SYSTÈME
    // ================================================
    renderAuthRequired() {
        return `
            <div class="auth-required-state">
                <div class="auth-icon"><i class="fas fa-lock"></i></div>
                <h3>Authentification requise</h3>
                <p>Connectez-vous pour accéder à vos emails Gmail</p>
                <button class="btn btn-primary" onclick="pageManagerGmail.handleLogin()">
                    <i class="fab fa-google"></i> Se connecter avec Gmail
                </button>
            </div>
        `;
    }

    async handleLogin() {
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else {
                window.location.href = '/auth.html';
            }
        } catch (error) {
            this.showError('Erreur de connexion: ' + error.message);
        }
    }

    renderEmptyState() {
        if (this.searchTerm) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                    <h3>Aucun résultat</h3>
                    <p>Aucun email ne correspond à "${this.searchTerm}"</p>
                    <button class="btn btn-primary" onclick="pageManagerGmail.clearSearch()">
                        <i class="fas fa-undo"></i> Effacer la recherche
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fab fa-google"></i></div>
                <h3>Aucun email Gmail</h3>
                <p>Utilisez le scanner pour récupérer vos emails</p>
                <button class="btn btn-primary" onclick="pageManagerGmail.loadPage('scanner')">
                    <i class="fas fa-search"></i> Scanner
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    showPageContent() {
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        if (container) {
            container.style.display = 'block';
            container.style.opacity = '1';
        }
    }

    showLoading(message = 'Chargement...') {
        window.uiManager?.showLoading?.(message) || console.log(`Loading: ${message}`);
    }

    hideLoading() {
        window.uiManager?.hideLoading?.();
    }

    showError(message) {
        window.uiManager?.showToast?.(message, 'error') || console.error(message);
    }

    showToast(message, type = 'info') {
        window.uiManager?.showToast?.(message, type) || console.log(`${type}: ${message}`);
    }

    // ================================================
    // STYLES CSS (Consolidé et optimisé)
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('emailsPageStylesGmail')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailsPageStylesGmail';
        styles.textContent = `
            /* Base styles */
            .emails-page-modern {
                padding: 16px;
                background: #f8fafc;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }

            /* Header fixe */
            .fixed-header-wrapper {
                position: sticky;
                top: 0;
                z-index: 1000;
                background: rgba(248, 250, 252, 0.98);
                backdrop-filter: blur(20px);
                padding: 12px 20px 8px;
                border-bottom: 2px solid #e5e7eb;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            /* Controls */
            .controls-bar {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 8px;
            }

            /* Search */
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
                transition: all 0.2s;
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
            }

            /* Actions */
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
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
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

            /* Buttons */
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
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
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
                border: none;
                box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(66, 133, 244, 0.35);
            }

            .btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
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

            /* Categories */
            .category-filters {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                max-width: 1200px;
                margin: 0 auto;
            }

            .category-tab {
                height: 56px;
                padding: 0 16px;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                font-size: 12px;
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
                color: white;
            }

            .category-tab.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
            }

            .tab-icon {
                font-size: 18px;
            }

            .tab-name {
                font-weight: 600;
            }

            .tab-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
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

            /* Emails */
            .emails-container {
                margin: 0 16px;
                padding-top: 16px;
            }

            .emails-list,
            .emails-grouped {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .email-card,
            .group-header {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                min-height: 80px;
                border-bottom: none;
                border-left: 3px solid transparent;
            }

            .email-card:first-child,
            .group-header:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                border-top: 1px solid #e5e7eb;
            }

            .email-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .email-card + .email-card,
            .group-header + .group-header {
                border-top: 1px solid #e5e7eb;
            }

            .email-card:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-left-color: #4285f4;
                z-index: 2;
            }

            .email-card.selected {
                background: linear-gradient(135deg, #e8f0fe 0%, #c2e1ff 100%);
                border-left: 4px solid #4285f4;
                border-color: #4285f4;
            }

            .email-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left-color: #22c55e;
            }

            .email-card.preselected {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left-color: #8b5cf6;
            }

            .email-checkbox {
                margin-right: 12px;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                cursor: pointer;
                appearance: none;
                position: relative;
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
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .priority-bar {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .email-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
            }

            .email-title {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .email-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }

            .email-type,
            .email-date,
            .preselected-badge {
                display: flex;
                align-items: center;
                gap: 3px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
            }

            .gmail-badge {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                color: white !important;
            }

            .preselected-badge {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                font-weight: 700;
            }

            .email-sender {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
            }

            .sender-name {
                font-weight: 600;
                color: #374151;
            }

            .attachment-indicator {
                color: #dc2626;
                font-weight: 600;
            }

            .category-badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .email-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: 12px;
                flex-shrink: 0;
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
                transition: all 0.3s;
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
            }

            .action-btn.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .action-btn.calendar {
                color: #4285f4;
            }

            .action-btn.calendar:hover {
                background: linear-gradient(135deg, #e8f0fe 0%, #c2e1ff 100%);
                border-color: #4285f4;
            }

            /* Groups */
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
                gap: 4px;
            }

            .group-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .group-meta {
                color: #6b7280;
                font-size: 12px;
            }

            .group-expand {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .group-content {
                background: transparent;
            }

            .group-content .email-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            /* Empty state */
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

            .empty-state h3 {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }

            .empty-state p {
                font-size: 15px;
                margin-bottom: 24px;
                color: #6b7280;
            }

            /* Modals */
            .email-modal-overlay,
            .task-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .email-modal,
            .task-modal {
                background: white;
                border-radius: 16px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .email-modal-header,
            .task-modal-header {
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .email-modal-header h2,
            .task-modal-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
            }

            .modal-close:hover {
                background: #f3f4f6;
            }

            .email-modal-content,
            .task-modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .email-details {
                margin-bottom: 20px;
            }

            .detail-row {
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
            }

            .detail-label {
                font-weight: 600;
                color: #374151;
                margin-right: 8px;
                min-width: 80px;
            }

            .detail-value {
                color: #6b7280;
                flex: 1;
            }

            .email-body {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                line-height: 1.6;
                color: #374151;
                overflow-x: auto;
            }

            /* Contenu email avec images */
            .email-content-wrapper {
                max-width: 100%;
                overflow-x: auto;
            }

            .email-content-wrapper img,
            .email-image {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 10px 0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .email-content-wrapper a {
                color: #3b82f6;
                text-decoration: underline;
            }

            .email-content-wrapper a:hover {
                color: #2563eb;
            }

            .email-content-wrapper table {
                max-width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
            }

            .email-content-wrapper td,
            .email-content-wrapper th {
                padding: 8px;
                border: 1px solid #e5e7eb;
            }

            .email-modal-footer,
            .task-modal-footer {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            /* Task modal specific */
            .ai-badge {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                color: #0c4a6e;
                font-weight: 600;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Auth state */
            .auth-required-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 12px;
                margin: 20px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            .auth-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #4285f4;
            }

            .auth-required-state h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .auth-required-state p {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 24px;
            }

            /* Notifications */
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
                transition: all 0.2s ease;
            }

            .explanation-close:hover {
                background: rgba(66, 133, 244, 0.2);
                transform: scale(1.1);
            }

            /* Loading states */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(5px);
            }

            .loading-content {
                text-align: center;
            }

            .loading-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #e5e7eb;
                border-top-color: #4285f4;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 16px;
                color: #6b7280;
                font-weight: 500;
            }

            /* Toast notifications */
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 400px;
                z-index: 100001;
                animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .toast.success {
                border-left: 4px solid #10b981;
            }

            .toast.error {
                border-left: 4px solid #ef4444;
            }

            .toast.warning {
                border-left: 4px solid #f59e0b;
            }

            .toast.info {
                border-left: 4px solid #3b82f6;
            }

            .toast-icon {
                font-size: 20px;
            }

            .toast.success .toast-icon { color: #10b981; }
            .toast.error .toast-icon { color: #ef4444; }
            .toast.warning .toast-icon { color: #f59e0b; }
            .toast.info .toast-icon { color: #3b82f6; }

            .toast-message {
                flex: 1;
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }

            .toast-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .toast-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            /* Scrollbar styling */
            .emails-container::-webkit-scrollbar,
            .email-modal-content::-webkit-scrollbar,
            .task-modal-content::-webkit-scrollbar {
                width: 8px;
            }

            .emails-container::-webkit-scrollbar-track,
            .email-modal-content::-webkit-scrollbar-track,
            .task-modal-content::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 4px;
            }

            .emails-container::-webkit-scrollbar-thumb,
            .email-modal-content::-webkit-scrollbar-thumb,
            .task-modal-content::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 4px;
                transition: background 0.2s ease;
            }

            .emails-container::-webkit-scrollbar-thumb:hover,
            .email-modal-content::-webkit-scrollbar-thumb:hover,
            .task-modal-content::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }

            /* Print styles */
            @media print {
                .fixed-header-wrapper,
                .email-actions,
                .group-expand,
                .modal-close,
                .explanation-notice {
                    display: none !important;
                }

                .email-card {
                    page-break-inside: avoid;
                    border: 1px solid #e5e7eb !important;
                    margin-bottom: 10px;
                }

                .email-modal {
                    position: static;
                    max-width: 100%;
                    box-shadow: none;
                }
            }

            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .email-card {
                animation: fadeIn 0.3s ease-out;
            }

            .group-content {
                animation: slideDown 0.3s ease-out;
            }

            .preselected-star {
                animation: pulse 2s infinite;
            }

            /* Accessibility */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }

            /* Focus styles */
            .btn:focus,
            .action-btn:focus,
            .category-tab:focus,
            .email-checkbox:focus,
            .modal-close:focus {
                outline: 2px solid #4285f4;
                outline-offset: 2px;
            }

            .search-input:focus,
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #4285f4;
                box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .email-card,
                .group-header {
                    border-width: 2px;
                }

                .btn {
                    border-width: 2px;
                }

                .category-tab {
                    border-width: 3px;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }

            /* Dark mode support (future) */
            @media (prefers-color-scheme: dark) {
                /* Dark mode styles can be added here */
            }

            /* Responsive - Mobile optimizations */
            @media (max-width: 768px) {
                .fixed-header-wrapper {
                    padding: 8px 12px 4px;
                }

                .controls-bar {
                    padding: 8px;
                }

                .search-input {
                    height: 40px;
                    font-size: 16px; /* Prevent zoom on iOS */
                }

                .btn {
                    height: 40px;
                    padding: 0 12px;
                    font-size: 12px;
                }

                .btn span {
                    display: none;
                }

                .btn i {
                    margin: 0;
                }

                .count-badge {
                    position: static;
                    margin-left: 4px;
                }

                .category-tab {
                    height: 48px;
                    padding: 0 12px;
                    font-size: 11px;
                }

                .tab-icon {
                    font-size: 16px;
                }

                .tab-name {
                    font-size: 11px;
                }

                .email-card {
                    padding: 12px;
                }

                .email-title {
                    font-size: 14px;
                }

                .email-meta {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }

                .email-actions {
                    flex-direction: column;
                    gap: 4px;
                }

                .action-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }

                .email-modal,
                .task-modal {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .email-modal-header,
                .task-modal-header,
                .email-modal-content,
                .task-modal-content,
                .email-modal-footer,
                .task-modal-footer {
                    padding: 16px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .empty-state {
                    padding: 40px 20px;
                }

                .auth-required-state {
                    padding: 40px 20px;
                    margin: 10px;
                }
            }

            /* Responsive - Small phones */
            @media (max-width: 480px) {
                .view-modes {
                    width: 100%;
                }

                .view-mode span {
                    display: none;
                }

                .category-filters {
                    gap: 4px;
                }

                .category-tab {
                    flex: 1;
                    min-width: 80px;
                }

                .email-card {
                    padding: 10px;
                    min-height: 70px;
                }

                .priority-bar {
                    width: 3px;
                    height: 50px;
                    margin-right: 8px;
                }

                .email-checkbox {
                    width: 18px;
                    height: 18px;
                    margin-right: 8px;
                }

                .group-avatar {
                    width: 36px;
                    height: 36px;
                    font-size: 14px;
                }

                .toast {
                    right: 10px;
                    left: 10px;
                    bottom: 10px;
                    max-width: none;
                }
            }

            /* Responsive - Large screens */
            @media (min-width: 1440px) {
                .emails-page-modern {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .category-filters {
                    max-width: 1400px;
                }

                .email-modal,
                .task-modal {
                    max-width: 1000px;
                }
            }

            /* Responsive - Extra large screens */
            @media (min-width: 1920px) {
                .emails-page-modern {
                    max-width: 1600px;
                }

                .email-card {
                    padding: 20px;
                    min-height: 90px;
                }

                .email-title {
                    font-size: 16px;
                }

                .email-sender {
                    font-size: 13px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // CLEANUP
    // ================================================
    cleanup() {
        this.invalidateTaskCategoriesCache();
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        this.emailContentCache.clear();
        console.log('[PageManagerGmail] 🧹 Nettoyage effectué');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.pageManagerGmail) {
    window.pageManagerGmail.cleanup?.();
}

window.pageManagerGmail = new PageManagerGmail();

// Bind des méthodes
Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
        window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
    }
});

console.log('✅ PageManagerGmail v18.0 loaded - Optimisé avec affichage complet des emails');
