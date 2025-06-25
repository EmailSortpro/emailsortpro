// PageManagerOutlook.js - Version optimisée spécifiquement pour Outlook

class PageManagerOutlook {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.provider = 'outlook';
        
        // Configuration de vue
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        this.searchTerm = '';
        this.autoAnalyzeEnabled = true;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // État UI
        this.lastEmailClick = 0;
        this.lastScanData = null;
        
        // Renderers de pages
        this.pages = {
            scanner: () => this.renderScanner(),
            emails: () => this.renderEmails(),
            tasks: () => this.renderTasks(),
            categories: () => this.renderCategories(),
            settings: () => this.renderSettings(),
            ranger: () => this.renderRanger()
        };
        
        this.init();
    }

    init() {
        console.log('[PageManagerOutlook] ✅ Initialisation v1.0');
        this.setupEventListeners();
        this.injectStyles();
    }

    // ===== GESTION DES ÉVÉNEMENTS =====
    setupEventListeners() {
        // Changements de paramètres
        window.addEventListener('categorySettingsChanged', (e) => {
            this.handleSettingsChanged(e.detail);
        });

        // Recatégorisation
        window.addEventListener('emailsRecategorized', () => {
            if (this.currentPage === 'emails') {
                setTimeout(() => this.refreshEmailsView(), 100);
            }
        });

        // Fin de scan
        window.addEventListener('scanCompleted', (e) => {
            this.lastScanData = e.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });

        // Scroll pour sticky controls
        window.addEventListener('scroll', () => this.handleScrollForSticky());
    }

    // ===== NAVIGATION =====
    async loadPage(pageName) {
        console.log(`[PageManagerOutlook] Chargement page: ${pageName}`);

        // Ignorer le dashboard (géré par index.html)
        if (pageName === 'dashboard') {
            this.updateNavigation(pageName);
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        this.updateNavigation(pageName);
        window.uiManager?.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName]();
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManagerOutlook] Erreur:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    // ===== PAGE EMAILS (PRINCIPALE) =====
    async renderEmails() {
        const container = document.getElementById('pageContent');
        const emails = window.emailScanner?.getAllEmails() || [];
        
        console.log(`[PageManagerOutlook] Rendu ${emails.length} emails`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Structure principale
        container.innerHTML = `
            <div class="emails-page-outlook">
                ${this.renderExplanationBanner()}
                ${this.renderControlsBar()}
                ${this.renderCategoryFilters()}
                <div class="sticky-controls-container"></div>
                <div class="emails-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.setupEmailsEventListeners();
        this.setupStickyControls();
        
        // Auto-analyse si configurée
        if (this.autoAnalyzeEnabled) {
            this.startAutoAnalysis();
        }
    }

    renderExplanationBanner() {
        if (this.hideExplanation) return '';
        
        return `
            <div class="explanation-banner">
                <i class="fas fa-info-circle"></i>
                <span>Double-cliquez pour sélectionner, simple clic pour voir les détails</span>
                <button class="close-btn" onclick="window.pageManager.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderControlsBar() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && 
                          visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        return `
            <div class="controls-bar">
                <!-- Recherche -->
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           id="emailSearchInput"
                           placeholder="Rechercher..." 
                           value="${this.searchTerm}">
                    ${this.searchTerm ? `
                        <button class="clear-search" onclick="window.pageManager.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                
                <!-- Modes de vue -->
                <div class="view-modes">
                    ${this.renderViewModeButton('grouped-domain', 'fa-globe', 'Domaine')}
                    ${this.renderViewModeButton('grouped-sender', 'fa-user', 'Expéditeur')}
                    ${this.renderViewModeButton('flat', 'fa-list', 'Liste')}
                </div>
                
                <!-- Actions -->
                <div class="action-buttons">
                    <button class="btn-select-all ${allSelected ? 'all-selected' : ''}" 
                            onclick="window.pageManager.toggleAllSelection()">
                        <i class="fas fa-${allSelected ? 'square' : 'check-square'}"></i>
                        <span>${allSelected ? 'Désélectionner' : 'Sélectionner'} tous</span>
                        <span class="count">(${visibleEmails.length})</span>
                    </button>
                    
                    <button class="btn-create-tasks ${selectedCount === 0 ? 'disabled' : ''}" 
                            onclick="window.pageManager.createTasksFromSelection()"
                            ${selectedCount === 0 ? 'disabled' : ''}>
                        <i class="fas fa-tasks"></i>
                        <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                        ${selectedCount > 0 ? `<span class="badge">${selectedCount}</span>` : ''}
                    </button>
                    
                    <div class="dropdown">
                        <button class="btn-actions ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.toggleBulkActions(event)"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-ellipsis-v"></i>
                            <span>Actions</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu" id="bulkActionsMenu">
                            ${this.renderBulkActions()}
                        </div>
                    </div>
                    
                    <button class="btn-refresh" onclick="window.pageManager.refreshEmails()">
                        <i class="fas fa-sync-alt"></i>
                        <span>Actualiser</span>
                    </button>
                    
                    ${selectedCount > 0 ? `
                        <button class="btn-clear" onclick="window.pageManager.clearSelection()">
                            <i class="fas fa-times"></i>
                            <span>Effacer (${selectedCount})</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderViewModeButton(mode, icon, label) {
        const isActive = this.currentViewMode === mode;
        return `
            <button class="view-mode ${isActive ? 'active' : ''}" 
                    onclick="window.pageManager.changeViewMode('${mode}')"
                    title="${label}">
                <i class="fas ${icon}"></i>
                <span>${label}</span>
            </button>
        `;
    }

    renderBulkActions() {
        return `
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
        `;
    }

    renderCategoryFilters() {
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        const preselectedCategories = this.getTaskPreselectedCategories();
        const counts = this.calculateCategoryCounts(emails);
        
        const filters = [
            {
                id: 'all',
                name: 'Tous',
                icon: '📧',
                count: emails.length,
                isPreselected: false
            }
        ];
        
        // Ajouter les catégories avec emails
        Object.entries(categories).forEach(([id, cat]) => {
            const count = counts[id] || 0;
            if (count > 0) {
                filters.push({
                    id,
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    count,
                    isPreselected: preselectedCategories.includes(id)
                });
            }
        });
        
        // Ajouter "Autre" si nécessaire
        if (counts.other > 0) {
            filters.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                count: counts.other,
                isPreselected: false
            });
        }
        
        return `
            <div class="category-filters">
                ${filters.map(filter => this.renderCategoryFilter(filter)).join('')}
            </div>
        `;
    }

    renderCategoryFilter(filter) {
        const isActive = this.currentCategory === filter.id;
        return `
            <button class="category-filter ${isActive ? 'active' : ''} ${filter.isPreselected ? 'preselected' : ''}"
                    onclick="window.pageManager.filterByCategory('${filter.id}')"
                    data-category-id="${filter.id}">
                <div class="filter-content">
                    <div class="filter-top">
                        <span class="filter-icon">${filter.icon}</span>
                        <span class="filter-count">${filter.count}</span>
                    </div>
                    <div class="filter-name">${filter.name}</div>
                </div>
                ${filter.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
            </button>
        `;
    }

    renderEmailsList() {
        const emails = this.getVisibleEmails();
        
        if (emails.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(emails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(emails, this.currentViewMode);
            default:
                return this.renderFlatView(emails);
        }
    }

    renderFlatView(emails) {
        return `
            <div class="emails-flat">
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

    renderEmailCard(email) {
        const hasTask = this.createdTasks.has(email.id);
        const isPreselected = email.isPreselectedForTasks && this.getTaskPreselectedCategories().includes(email.category);
        const isSelected = this.selectedEmails.has(email.id) || isPreselected;
        
        // Auto-sélection des emails pré-sélectionnés
        if (isPreselected && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselected ? 'preselected' : ''}"
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar" style="background-color: ${this.getEmailPriorityColor(email)}"></div>
                
                <div class="email-content">
                    <div class="email-header">
                        <h3 class="email-title">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="meta-badge">📧 Email</span>
                            <span class="meta-badge">📅 ${this.formatEmailDate(email.receivedDateTime)}</span>
                            ${email.categoryScore ? `
                                <span class="meta-badge confidence">🎯 ${Math.round(email.categoryConfidence * 100)}%</span>
                            ` : ''}
                            ${isPreselected ? '<span class="meta-badge preselected">⭐ Pré-sélectionné</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-info">
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
        return `
            ${!hasTask ? `
                <button class="action-btn create-task" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            ` : `
                <button class="action-btn view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche">
                    <i class="fas fa-check-circle"></i>
                </button>
            `}
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                    title="Voir l'email">
                <i class="fas fa-eye"></i>
            </button>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="email-group" data-group-key="${group.key}">
                <div class="group-header" onclick="window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
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

    // ===== GESTION DES ÉVÉNEMENTS EMAILS =====
    handleEmailClick(event, emailId) {
        // Ignorer si clic sur checkbox ou actions
        if (event.target.type === 'checkbox' || event.target.closest('.email-actions')) {
            return;
        }
        
        // Double-clic pour sélection
        const now = Date.now();
        const timeSinceLastClick = now - this.lastEmailClick;
        
        if (timeSinceLastClick < 300) {
            event.preventDefault();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
        } else {
            this.lastEmailClick = now;
            // Simple clic = modal après délai
            setTimeout(() => {
                if (Date.now() - this.lastEmailClick >= 250) {
                    this.showEmailModal(emailId);
                }
            }, 250);
        }
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.updateEmailSelectionUI(emailId);
        this.updateControlsOnly();
    }

    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => this.selectedEmails.delete(email.id));
        } else {
            visibleEmails.forEach(email => this.selectedEmails.add(email.id));
        }
        
        this.refreshEmailsView();
    }

    toggleGroup(groupKey, event) {
        event.preventDefault();
        event.stopPropagation();
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-expand i');
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            group.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            group.classList.add('expanded');
        }
    }

    // ===== ACTIONS EN MASSE =====
    toggleBulkActions(event) {
        event.stopPropagation();
        const menu = document.getElementById('bulkActionsMenu');
        const isVisible = menu.classList.contains('show');
        
        // Fermer tous les dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        
        if (!isVisible) {
            menu.classList.add('show');
            
            // Créer overlay pour fermer au clic
            const overlay = document.createElement('div');
            overlay.className = 'dropdown-overlay';
            overlay.onclick = () => {
                menu.classList.remove('show');
                overlay.remove();
            };
            document.body.appendChild(overlay);
        }
    }

    async bulkMarkAsRead() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        await window.emailScanner?.performBatchAction(selectedIds, 'markAsRead');
        this.clearSelection();
    }

    async bulkArchive() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        if (confirm(`Archiver ${selectedIds.length} email(s) ?`)) {
            window.uiManager?.showToast(`${selectedIds.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        if (confirm(`Supprimer ${selectedIds.length} email(s) ?\n\nCette action est irréversible.`)) {
            await window.emailScanner?.performBatchAction(selectedIds, 'delete');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        const emails = selectedIds.map(id => this.getEmailById(id)).filter(Boolean);
        this.exportEmailsToCSV(emails);
        this.clearSelection();
    }

    // ===== CRÉATION DE TÂCHES =====
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
                const analysis = await this.analyzeEmail(emailId);
                if (analysis && window.taskManager) {
                    const taskData = this.buildTaskDataFromAnalysis(email, analysis);
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManagerOutlook] Erreur création tâche:', error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        }
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        window.uiManager?.showLoading('Analyse de l\'email...');
        const analysis = await this.analyzeEmail(emailId);
        window.uiManager?.hideLoading();
        
        if (!analysis) return;

        const modal = new TaskCreationModal(email, analysis);
        modal.show();
    }

    // ===== MODALES =====
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        const modal = new EmailViewModal(email);
        modal.show();
    }

    // ===== UTILITAIRES =====
    getVisibleEmails() {
        let emails = window.emailScanner?.getAllEmails() || [];
        
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
            emails = emails.filter(e => this.matchesSearch(e, this.searchTerm));
        }
        
        return emails;
    }

    matchesSearch(email, term) {
        const search = term.toLowerCase();
        return (
            (email.subject || '').toLowerCase().includes(search) ||
            (email.from?.emailAddress?.name || '').toLowerCase().includes(search) ||
            (email.from?.emailAddress?.address || '').toLowerCase().includes(search) ||
            (email.bodyPreview || '').toLowerCase().includes(search)
        );
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
        
        if (otherCount > 0) {
            counts.other = otherCount;
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
        
        return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
    }

    async analyzeEmail(emailId) {
        let analysis = this.aiAnalysisResults.get(emailId);
        if (!analysis && window.aiTaskAnalyzer) {
            const email = this.getEmailById(emailId);
            analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            this.aiAnalysisResults.set(emailId, analysis);
        }
        return analysis;
    }

    // ===== MÉTHODES HELPERS =====
    getEmailById(emailId) {
        return window.emailScanner?.getEmailById(emailId);
    }

    getTaskPreselectedCategories() {
        return window.categoryManager?.getTaskPreselectedCategories() || [];
    }

    getCategoryColor(categoryId) {
        return window.categoryManager?.getCategory(categoryId)?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        return window.categoryManager?.getCategory(categoryId)?.icon || '📌';
    }

    getCategoryName(categoryId) {
        return window.categoryManager?.getCategory(categoryId)?.name || 'Autre';
    }

    generateAvatarColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 65%, 45%), hsl(${(hue + 30) % 360}, 65%, 55%))`;
    }

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return '#3b82f6';
    }

    formatEmailDate(dateString) {
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

    // ===== AUTRES PAGES =====
    async renderScanner() {
        const container = document.getElementById('pageContent');
        if (window.scanStartModule?.render) {
            await window.scanStartModule.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Scanner en cours de chargement...</div>';
        }
    }

    async renderTasks() {
        const container = document.getElementById('pageContent');
        if (window.tasksView?.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module tâches en cours de chargement...</div>';
        }
    }

    async renderCategories() {
        const container = document.getElementById('pageContent');
        if (window.categoriesPage?.render) {
            window.categoriesPage.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module catégories en cours de chargement...</div>';
        }
    }

    async renderSettings() {
        const container = document.getElementById('pageContent');
        if (window.categoriesPage?.renderSettings) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = '<div class="empty-state">Paramètres en cours de chargement...</div>';
        }
    }

    async renderRanger() {
        const container = document.getElementById('pageContent');
        if (window.domainOrganizer?.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module de rangement en cours de chargement...</div>';
        }
    }

    // ===== STYLES CSS =====
    injectStyles() {
        if (document.getElementById('pageManagerOutlookStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerOutlookStyles';
        styles.textContent = `
            /* Variables CSS */
            :root {
                --primary-color: #6366f1;
                --primary-hover: #5457e5;
                --success-color: #10b981;
                --danger-color: #ef4444;
                --warning-color: #f59e0b;
                --text-primary: #1f2937;
                --text-secondary: #6b7280;
                --border-color: #e5e7eb;
                --bg-primary: #ffffff;
                --bg-secondary: #f9fafb;
                --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
                --radius-sm: 8px;
                --radius-md: 12px;
                --radius-lg: 16px;
                --transition: all 0.2s ease;
            }

            /* Container principal */
            .emails-page-outlook {
                padding: 16px;
                min-height: 100vh;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }

            /* Bannière d'explication */
            .explanation-banner {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--radius-md);
                padding: 12px 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
            }

            .explanation-banner i {
                color: var(--primary-color);
            }

            .explanation-banner .close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                transition: var(--transition);
            }

            .explanation-banner .close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
            }

            /* Barre de contrôles */
            .controls-bar {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--radius-md);
                padding: 12px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: var(--shadow-sm);
            }

            /* Recherche */
            .search-box {
                position: relative;
                flex: 1;
                max-width: 400px;
            }

            .search-box input {
                width: 100%;
                padding: 10px 12px 10px 36px;
                border: 2px solid var(--border-color);
                border-radius: var(--radius-sm);
                font-size: 14px;
                transition: var(--transition);
            }

            .search-box input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .search-box i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-secondary);
            }

            .search-box .clear-search {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--danger-color);
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                padding: 3px;
                gap: 2px;
            }

            .view-mode {
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: var(--text-secondary);
                border-radius: 6px;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                font-weight: 600;
            }

            .view-mode:hover {
                background: white;
                color: var(--text-primary);
            }

            .view-mode.active {
                background: white;
                color: var(--text-primary);
                box-shadow: var(--shadow-sm);
            }

            /* Boutons d'action */
            .action-buttons {
                display: flex;
                gap: 8px;
            }

            .action-buttons button {
                padding: 10px 16px;
                border-radius: var(--radius-sm);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 6px;
                position: relative;
            }

            .btn-select-all {
                background: #f0f9ff;
                color: #0369a1;
                border: 1px solid #0ea5e9;
            }

            .btn-select-all:hover {
                background: #e0f2fe;
            }

            .btn-select-all.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .btn-create-tasks {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn-create-tasks:hover:not(.disabled) {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn-actions {
                background: white;
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }

            .btn-refresh {
                background: white;
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }

            .btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }

            .action-buttons button.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--danger-color);
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }

            /* Dropdown */
            .dropdown {
                position: relative;
            }

            .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow-lg);
                min-width: 200px;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: var(--transition);
                z-index: 1000;
            }

            .dropdown-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .dropdown-item {
                padding: 10px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-primary);
                font-size: 13px;
                transition: var(--transition);
            }

            .dropdown-item:hover {
                background: var(--bg-secondary);
            }

            .dropdown-item.danger {
                color: var(--danger-color);
            }

            .dropdown-divider {
                height: 1px;
                background: var(--border-color);
                margin: 8px 0;
            }

            .dropdown-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999;
            }

            /* Filtres de catégories */
            .category-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }

            .category-filter {
                height: 60px;
                padding: 8px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-width: 100px;
                flex: 0 1 auto;
            }

            .category-filter:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .category-filter.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: transparent;
            }

            .category-filter.preselected {
                border-color: #8b5cf6;
                border-width: 2px;
            }

            .filter-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                gap: 4px;
            }

            .filter-top {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .filter-icon {
                font-size: 16px;
            }

            .filter-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
            }

            .category-filter.active .filter-count {
                background: rgba(255, 255, 255, 0.3);
            }

            .filter-name {
                font-size: 12px;
                font-weight: 700;
            }

            .preselected-star {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: #8b5cf6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
            }

            /* Container des emails */
            .emails-container {
                background: transparent;
            }

            /* Vue liste */
            .emails-flat {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* Carte email */
            .email-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid var(--border-color);
                padding: 14px;
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-height: 76px;
                border-bottom: none;
            }

            .email-card:first-child {
                border-radius: var(--radius-md) var(--radius-md) 0 0;
            }

            .email-card:last-child {
                border-radius: 0 0 var(--radius-md) var(--radius-md);
                border-bottom: 1px solid var(--border-color);
            }

            .email-card:only-child {
                border-radius: var(--radius-md);
                border-bottom: 1px solid var(--border-color);
            }

            .email-card:hover {
                background: white;
                box-shadow: var(--shadow-md);
                border-color: rgba(99, 102, 241, 0.2);
                transform: translateY(-1px);
                z-index: 10;
            }

            .email-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid var(--primary-color);
            }

            .email-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid var(--success-color);
            }

            .email-card.preselected {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid #8b5cf6;
            }

            /* Checkbox */
            .email-checkbox {
                width: 20px;
                height: 20px;
                margin-right: 12px;
                cursor: pointer;
                flex-shrink: 0;
            }

            /* Barre de priorité */
            .priority-bar {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: 12px;
                flex-shrink: 0;
            }

            /* Contenu email */
            .email-content {
                flex: 1;
                min-width: 0;
            }

            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 4px;
            }

            .email-title {
                font-size: 15px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .email-meta {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .meta-badge {
                background: var(--bg-secondary);
                color: var(--text-secondary);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid var(--border-color);
                white-space: nowrap;
            }

            .meta-badge.confidence {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
            }

            .meta-badge.preselected {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                border: none;
            }

            .email-info {
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--text-secondary);
                font-size: 12px;
            }

            .sender-name {
                font-weight: 600;
                color: var(--text-primary);
            }

            .attachment-indicator {
                font-size: 14px;
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

            /* Actions email */
            .email-actions {
                display: flex;
                gap: 4px;
                margin-left: 12px;
                flex-shrink: 0;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: var(--radius-sm);
                background: rgba(255, 255, 255, 0.9);
                color: var(--text-secondary);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                font-size: 13px;
            }

            .action-btn:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }

            .action-btn.create-task {
                color: var(--primary-color);
            }

            .action-btn.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: var(--primary-color);
            }

            .action-btn.view-task {
                color: var(--success-color);
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .action-btn.details {
                color: #8b5cf6;
            }

            .action-btn.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
            }

            /* Vue groupée */
            .emails-grouped {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .email-group {
                background: white;
                border-radius: var(--radius-md);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }

            .group-header {
                display: flex;
                align-items: center;
                padding: 14px;
                cursor: pointer;
                transition: var(--transition);
                gap: 12px;
            }

            .group-header:hover {
                background: var(--bg-secondary);
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
            }

            .group-info {
                flex: 1;
            }

            .group-name {
                font-weight: 700;
                color: var(--text-primary);
                font-size: 15px;
            }

            .group-meta {
                color: var(--text-secondary);
                font-size: 12px;
            }

            .group-expand {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                transition: var(--transition);
            }

            .email-group.expanded .group-expand {
                transform: rotate(180deg);
            }

            .group-content {
                border-top: 1px solid var(--border-color);
            }

            .group-content .email-card:first-child {
                border-radius: 0;
            }

            .group-content .email-card:last-child {
                border-radius: 0;
                border-bottom: none;
            }

            /* État vide */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-sm);
            }

            .empty-state h3 {
                font-size: 22px;
                color: var(--text-primary);
                margin-bottom: 12px;
            }

            .empty-state p {
                color: var(--text-secondary);
                margin-bottom: 24px;
            }

            /* Sticky controls */
            .sticky-controls-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid var(--border-color);
                padding: 16px;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                display: none;
            }

            .sticky-controls-container.sticky-active {
                transform: translateY(0);
                display: block;
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .controls-bar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .search-box {
                    max-width: none;
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
            }

            @media (max-width: 768px) {
                .view-mode span,
                .action-buttons button span {
                    display: none;
                }

                .view-mode,
                .action-buttons button {
                    min-width: 44px;
                    padding: 10px;
                    justify-content: center;
                }

                .category-filter {
                    flex: 0 1 calc(50% - 4px);
                }

                .email-meta {
                    display: none;
                }
            }

            @media (max-width: 480px) {
                .emails-page-outlook {
                    padding: 8px;
                }

                .controls-bar {
                    padding: 8px;
                }

                .action-buttons {
                    flex-direction: column;
                    gap: 8px;
                }

                .action-buttons button {
                    width: 100%;
                    justify-content: center;
                }

                .category-filters {
                    flex-direction: column;
                }

                .category-filter {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Classes modales simplifiées
class TaskCreationModal {
    constructor(email, analysis) {
        this.email = email;
        this.analysis = analysis;
    }

    show() {
        const modalId = `modal_${Date.now()}`;
        const senderName = this.email.from?.emailAddress?.name || 'Inconnu';
        
        const html = `
            <div id="${modalId}" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div class="modal-content" style="background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div class="modal-header" style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px;">Créer une tâche</h2>
                        <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <form id="taskForm">
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Titre</label>
                                <input type="text" id="taskTitle" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;" 
                                       value="${this.analysis.mainTask?.title || ''} - ${senderName}">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Description</label>
                                <textarea id="taskDescription" rows="4" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;">
${this.analysis.mainTask?.description || this.analysis.summary || ''}</textarea>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Priorité</label>
                                    <select id="taskPriority" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                                        <option value="urgent" ${this.analysis.mainTask?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                        <option value="high" ${this.analysis.mainTask?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                        <option value="medium" ${this.analysis.mainTask?.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                        <option value="low" ${this.analysis.mainTask?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Échéance</label>
                                    <input type="date" id="taskDueDate" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;"
                                           value="${this.analysis.mainTask?.dueDate || ''}">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${modalId}').remove()" 
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${this.email.id}', '${modalId}')" 
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
    }
}

class EmailViewModal {
    constructor(email) {
        this.email = email;
    }

    show() {
        const modalId = `modal_${Date.now()}`;
        const senderName = this.email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = this.email.from?.emailAddress?.address || '';
        
        const html = `
            <div id="${modalId}" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div class="modal-content" style="background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div class="modal-header" style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px;">Email Complet</h2>
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';" 
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                            <div style="margin-bottom: 12px;"><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</div>
                            <div style="margin-bottom: 12px;"><strong>Date:</strong> ${new Date(this.email.receivedDateTime).toLocaleString('fr-FR')}</div>
                            <div><strong>Sujet:</strong> ${this.email.subject || 'Sans sujet'}</div>
                            ${this.email.category && this.email.category !== 'other' ? `
                                <div style="margin-top: 12px;">
                                    <strong>Catégorie:</strong>
                                    <span style="background: ${window.pageManager.getCategoryColor(this.email.category)}20; 
                                                 color: ${window.pageManager.getCategoryColor(this.email.category)}; 
                                                 padding: 4px 8px; border-radius: 6px; font-size: 12px;">
                                        ${window.pageManager.getCategoryIcon(this.email.category)} ${window.pageManager.getCategoryName(this.email.category)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                        <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; max-height: 400px; overflow-y: auto;">
                            ${this.getEmailContent()}
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${modalId}').remove(); document.body.style.overflow = 'auto';" 
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Fermer
                        </button>
                        ${!window.pageManager.createdTasks.has(this.email.id) ? `
                            <button onclick="document.getElementById('${modalId}').remove(); window.pageManager.showTaskCreationModal('${this.email.id}');" 
                                    style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
    }

    getEmailContent() {
        if (this.email.body?.content) {
            let content = this.email.body.content;
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${window.pageManager.escapeHtml(this.email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }
}

// Exporter l'instance globale
window.pageManager = new PageManagerOutlook();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManagerOutlook.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManagerOutlook v1.0 loaded - Optimized for Outlook');
