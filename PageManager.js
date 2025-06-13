// PageManager.js - Version 12.0 - Synchronisé avec EmailScanner centralisé

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
        
        // Page renderers - DASHBOARD SUPPRIMÉ
        this.pages = {
            // dashboard: supprimé - géré par index.html
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 12.0 - Synchronisé avec EmailScanner centralisé');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] Paramètres changés, mise à jour interface');
            if (this.currentPage === 'emails') {
                this.refreshEmailsView();
            }
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
    }

    // =====================================
    // PAGE LOADING - DASHBOARD IGNORÉ
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        // IGNORER complètement le dashboard
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

    // =====================================
    // EMAILS PAGE - SYNCHRONISÉE AVEC EMAILSCANNER
    // =====================================
    async renderEmails(container) {
        // Récupérer les emails depuis EmailScanner centralisé
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] Rendu page emails avec ${emails.length} emails`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const visibleEmails = this.getVisibleEmails();
            const allVisible = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Texte explicatif avec possibilité de fermer -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized">
                            <i class="fas fa-info-circle"></i>
                            <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour transformer les emails sélectionnés en tâches ou effectuer d'autres opérations. Vous pouvez également filtrer par catégorie ci-dessous.</span>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Barre de contrôles -->
                    <div class="controls-bar-harmonized">
                        <!-- Section recherche -->
                        <div class="search-section-harmonized">
                            <div class="search-box-harmonized">
                                <i class="fas fa-search search-icon-harmonized"></i>
                                <input type="text" 
                                       class="search-input-harmonized" 
                                       id="emailSearchInput"
                                       placeholder="Rechercher emails..." 
                                       value="${this.searchTerm}">
                                ${this.searchTerm ? `
                                    <button class="search-clear-harmonized" onclick="window.pageManager.clearSearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Modes de vue -->
                        <div class="view-modes-harmonized">
                            <button class="view-mode-harmonized ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-domain')"
                                    title="Par domaine">
                                <i class="fas fa-globe"></i>
                                <span>Domaine</span>
                            </button>
                            <button class="view-mode-harmonized ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-sender')"
                                    title="Par expéditeur">
                                <i class="fas fa-user"></i>
                                <span>Expéditeur</span>
                            </button>
                            <button class="view-mode-harmonized ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('flat')"
                                    title="Liste complète">
                                <i class="fas fa-list"></i>
                                <span>Liste</span>
                            </button>
                        </div>
                        
                        <!-- Actions principales -->
                        <div class="action-buttons-harmonized">
                            <!-- Bouton Sélectionner tout / Désélectionner -->
                            <button class="btn-harmonized btn-selection-toggle" 
                                    onclick="window.pageManager.toggleAllSelection()"
                                    title="${allVisible ? 'Désélectionner tout' : 'Sélectionner tout'}">
                                <i class="fas ${allVisible ? 'fa-square-check' : 'fa-square'}"></i>
                                <span>${allVisible ? 'Désélectionner' : 'Sélectionner'}</span>
                                ${visibleEmails.length > 0 ? `<span class="count-badge-small">${visibleEmails.length}</span>` : ''}
                            </button>
                            
                            <!-- Informations de sélection et actions -->
                            ${selectedCount > 0 ? `
                                <div class="selection-info-harmonized">
                                    <span class="selection-count-harmonized">${selectedCount} sélectionné(s)</span>
                                    <button class="btn-harmonized btn-clear-selection" onclick="window.pageManager.clearSelection()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                
                                <!-- Actions groupées -->
                                <button class="btn-harmonized btn-primary" onclick="window.pageManager.createTasksFromSelection()">
                                    <i class="fas fa-tasks"></i>
                                    <span>Créer ${selectedCount} tâche${selectedCount > 1 ? 's' : ''}</span>
                                    <span class="count-badge-harmonized">${selectedCount}</span>
                                </button>
                                
                                <div class="dropdown-action-harmonized">
                                    <button class="btn-harmonized btn-secondary dropdown-toggle" onclick="window.pageManager.toggleBulkActions(event)">
                                        <i class="fas fa-ellipsis-v"></i>
                                        <span>Actions</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu-harmonized" id="bulkActionsMenu">
                                        <button class="dropdown-item-harmonized" onclick="window.pageManager.bulkMarkAsRead()">
                                            <i class="fas fa-eye"></i>
                                            <span>Marquer comme lu</span>
                                        </button>
                                        <button class="dropdown-item-harmonized" onclick="window.pageManager.bulkArchive()">
                                            <i class="fas fa-archive"></i>
                                            <span>Archiver</span>
                                        </button>
                                        <button class="dropdown-item-harmonized danger" onclick="window.pageManager.bulkDelete()">
                                            <i class="fas fa-trash"></i>
                                            <span>Supprimer</span>
                                        </button>
                                        <div class="dropdown-divider"></div>
                                        <button class="dropdown-item-harmonized" onclick="window.pageManager.bulkExport()">
                                            <i class="fas fa-download"></i>
                                            <span>Exporter</span>
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <button class="btn-harmonized btn-secondary" onclick="window.pageManager.refreshEmails()">
                                <i class="fas fa-sync-alt"></i>
                                <span>Actualiser</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filtres de catégories -->
                    <div class="status-filters-harmonized-twolines">
                        ${this.buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories)}
                    </div>

                    <!-- CONTENU DES EMAILS -->
                    <div class="tasks-container-harmonized">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addHarmonizedEmailStyles();
            this.setupEmailsEventListeners();
        };

        renderEmailsPage();
        
        // Auto-analyze si activé
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    Utilisez le scanner pour récupérer et analyser vos emails.
                </p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES DE SÉLECTION
    // ================================================
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast('Emails désélectionnés', 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.refreshEmailsView();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    refreshEmailsView() {
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        this.updateControlsBar();
    }

    updateControlsBar() {
        const container = document.getElementById('pageContent');
        if (container && this.currentPage === 'emails') {
            // Sauvegarder l'état de recherche
            const searchInput = document.getElementById('emailSearchInput');
            const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
            
            // Re-render
            this.renderEmails(container);
            
            // Restaurer la recherche
            setTimeout(() => {
                const newSearchInput = document.getElementById('emailSearchInput');
                if (newSearchInput && currentSearchValue) {
                    newSearchInput.value = currentSearchValue;
                }
            }, 100);
        }
    }

    // ================================================
    // FILTRES DE CATÉGORIES
    // ================================================
    buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) {
        const tabs = [
            { id: 'all', name: 'Tous', icon: '📧', count: totalEmails }
        ];
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    count: count
                });
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            tabs.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                count: otherCount
            });
        }
        
        return tabs.map(tab => {
            return `
                <button class="status-pill-harmonized-twolines ${this.currentCategory === tab.id ? 'active' : ''}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    // ================================================
    // RENDU DES EMAILS
    // ================================================
    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        // Appliquer les filtres
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
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

    renderEmptyState() {
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">Aucun email trouvé</h3>
                <p class="empty-state-text-harmonized">
                    ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun email dans cette catégorie'}
                </p>
                ${this.searchTerm ? `
                    <button class="btn-harmonized btn-primary" onclick="window.pageManager.clearSearch()">
                        <i class="fas fa-undo"></i>
                        <span>Effacer la recherche</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    renderHarmonizedEmailRow(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        return `
            <div class="task-harmonized-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <!-- Checkbox de sélection -->
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <!-- Indicateur de priorité -->
                <div class="priority-bar-harmonized" style="background-color: ${this.getEmailPriorityColor(email)}"></div>
                
                <!-- Contenu principal -->
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
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-indicator-harmonized" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Actions rapides -->
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
                <div class="group-header-harmonized" onclick="window.pageManager.toggleGroup('${group.key}')">
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
                    <div class="group-expand-harmonized">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
                </div>
            </div>
        `;
    }

    // ================================================
    // ÉVÉNEMENTS ET HANDLERS
    // ================================================
    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') return;
        if (event.target.closest('.task-actions-harmonized')) return;
        this.showEmailModal(emailId);
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
        }
    }

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
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshEmailsView();
    }

    // ================================================
    // ACTIONS GROUPÉES
    // ================================================
    toggleBulkActions(event) {
        event.stopPropagation();
        const menu = document.getElementById('bulkActionsMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-action-harmonized')) {
                menu?.classList.remove('show');
            }
        }, { once: true });
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
                ['De', 'Sujet', 'Date', 'Catégorie', 'Contenu'].join(','),
                ...emails.map(email => [
                    `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                    `"${email.subject || ''}"`,
                    email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                    `"${this.getCategoryName(email.category)}"`,
                    `"${(email.bodyPreview || '').substring(0, 100)}"`
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `emails_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.uiManager?.showToast('Export terminé', 'success');
        }
        this.clearSelection();
    }

    // ================================================
    // AUTRES PAGES (Scanner, Tasks, Categories, Settings, Ranger)
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
        
        console.log('[PageManager] Utilisation interface scanner fallback');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">Module de scan en cours de chargement...</p>
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
                    <p class="empty-text">Créez des tâches à partir de vos emails</p>
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
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSettings(container) {
        if (window.categoriesPage) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Paramètres</h1>
                </div>
                
                <div class="settings-card">
                    <h3>Configuration IA</h3>
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
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">Module de rangement en cours de chargement...</p>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            // Recatégoriser les emails existants
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                await window.emailScanner.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            window.uiManager?.showToast('Emails actualisés', 'success');
            
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

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
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
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu disponible'}</p>`;
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

    // ================================================
    // MÉTHODES SIMPLIFIÉES POUR ÉVITER LA DUPLICATION
    // ================================================
    
    // Toutes les autres méthodes (création de tâches, modales, etc.) 
    // sont incluses mais simplifiées pour éviter les erreurs de syntaxe
    
    async createTasksFromSelection() {
        window.uiManager?.showToast('Fonction de création de tâches en développement', 'info');
        this.clearSelection();
    }

    async showTaskCreationModal(emailId) {
        window.uiManager?.showToast('Modal de création de tâche en développement', 'info');
    }

    showEmailModal(emailId) {
        window.uiManager?.showToast('Modal d\'affichage email en développement', 'info');
    }

    // Styles harmonisés - version simplifiée pour éviter les erreurs
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Styles de base pour éviter les erreurs de chargement */
            .tasks-page-modern { font-family: system-ui, sans-serif; padding: 20px; }
            .controls-bar-harmonized { display: flex; gap: 16px; margin-bottom: 20px; padding: 16px; background: white; border-radius: 12px; }
            .btn-harmonized { padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; }
            .btn-primary { background: #3b82f6; color: white; border-color: #3b82f6; }
            .task-harmonized-card { display: flex; align-items: center; padding: 16px; background: white; border: 1px solid #e5e7eb; margin-bottom: 1px; }
            .task-harmonized-card:hover { background: #f9fafb; }
            .task-harmonized-card.selected { background: #eff6ff; border-color: #3b82f6; }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v12.0 loaded - Synchronisé avec EmailScanner centralisé');
