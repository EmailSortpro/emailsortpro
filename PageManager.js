// PageManager.js - Version 10.1 - Affichage optimisé compact

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.temporaryEmailStorage = [];
        this.lastScanData = null;
        
        // Page renderers
        this.pages = {
            dashboard: (container) => this.renderDashboard(container),
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container)
        };
        
        this.init();
    }

    init() {
        console.log('[PageManager] Initialized v10.1 - Affichage optimisé compact');
    }

    // =====================================
    // PAGE LOADING
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Loading page: ${pageName}`);

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Page content container not found');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} not found`);
            }

            window.uiManager.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Error loading page:`, error);
            window.uiManager.hideLoading();
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = `
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
    // EMAILS PAGE - INTERFACE MODERNE
    // =====================================
    async renderEmails(container) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialize view mode
        this.currentViewMode = this.currentViewMode || 'grouped-domain';
        this.currentCategory = this.currentCategory || 'all';

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            
            container.innerHTML = `
                <!-- HEADER PRINCIPAL -->
                <div class="emails-header">
                    <div class="header-title-section">
                        <div class="header-explanation">
                            <div class="explanation-main">
                                <i class="fas fa-info-circle explanation-icon"></i>
                                <span class="explanation-text">
                                    ${selectedCount > 0 ? 
                                        `${selectedCount} email${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''}. Créez des tâches ou modifiez la sélection.` :
                                        this.currentCategory === 'all' ? 
                                            `Visualisez vos ${totalEmails} emails par domaine, expéditeur ou en liste complète. Sélectionnez des emails pour créer des tâches.` :
                                            `Affichage de la catégorie "${this.getCategoryDisplayName(this.currentCategory)}". Utilisez les filtres pour naviguer entre les catégories.`
                                    }
                                </span>
                            </div>
                            ${selectedCount > 0 ? `
                                <button class="selection-clear" onclick="window.pageManager.clearSelection()" title="Désélectionner tout">
                                    <i class="fas fa-times"></i>
                                    <span>Désélectionner</span>
                                </button>
                            ` : `
                                <div class="selection-actions">
                                    <button class="selection-action" onclick="window.pageManager.selectAllVisible()" title="Sélectionner tous les emails visibles">
                                        <i class="fas fa-check-square"></i>
                                        <span>Sélectionner tout</span>
                                    </button>
                                    <button class="selection-action" onclick="window.pageManager.clearSelection()" title="Désélectionner tous les emails">
                                        <i class="fas fa-square"></i>
                                        <span>Désélectionner tout</span>
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- BARRE DE CONTRÔLES SUR UNE LIGNE -->
                <div class="emails-controls-bar">
                    <!-- Section Gauche: Recherche -->
                    <div class="controls-search">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="emailSearchInput"
                                   placeholder="Rechercher emails..." 
                                   value="${this.searchTerm}">
                            ${this.searchTerm ? `
                                <button class="search-clear" id="searchClearBtn" onclick="window.pageManager.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Section Centre: Modes de vue -->
                    <div class="controls-views">
                        <div class="view-buttons">
                            <button class="view-btn ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-domain')"
                                    title="Par domaine">
                                <i class="fas fa-globe"></i>
                                <span>Par domaine</span>
                            </button>
                            <button class="view-btn ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-sender')"
                                    title="Par expéditeur">
                                <i class="fas fa-user"></i>
                                <span>Par expéditeur</span>
                            </button>
                            <button class="view-btn ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('flat')"
                                    title="Liste complète">
                                <i class="fas fa-list"></i>
                                <span>Liste</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Section Droite: Actions -->
                    <div class="controls-actions">
                        <button class="action-btn primary ${selectedCount > 0 ? 'with-selection' : ''}" 
                                onclick="${selectedCount > 0 ? 'window.pageManager.createTasksFromSelection()' : 'window.pageManager.createTasksFromAllVisible()'}">
                            <i class="fas fa-tasks"></i>
                            <span>${selectedCount > 0 ? `Créer ${selectedCount} tâche${selectedCount > 1 ? 's' : ''}` : 'Créer tâches'}</span>
                            ${selectedCount > 0 ? `<span class="selection-count">${selectedCount}</span>` : ''}
                        </button>
                        
                        <button class="action-btn secondary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                    </div>
                </div>

                <!-- FILTRES DE CATÉGORIES -->
                <div class="category-filters">
                    ${this.buildCategoryFilters(categoryCounts, totalEmails, categories)}
                </div>

                <!-- CONTENU DES EMAILS -->
                <div class="emails-content" id="emailsContent">
                    ${this.renderEmailsList()}
                </div>
            `;

            this.addModernStyles();
            this.setupEmailsEventListeners();
        };

        renderEmailsPage();
        
        // Auto-analyze if enabled
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    // =====================================
    // FILTRES DE CATÉGORIES
    // =====================================
    buildCategoryFilters(categoryCounts, totalEmails, categories) {
        let filters = `
            <button class="category-filter ${this.currentCategory === 'all' ? 'active' : ''}" 
                    onclick="window.pageManager.filterByCategory('all')">
                <span class="filter-icon">📧</span>
                <span class="filter-name">Tous</span>
                <span class="filter-count">${totalEmails}</span>
            </button>
        `;
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                filters += `
                    <button class="category-filter ${this.currentCategory === catId ? 'active' : ''}" 
                            onclick="window.pageManager.filterByCategory('${catId}')"
                            style="--category-color: ${category.color}">
                        <span class="filter-icon">${category.icon}</span>
                        <span class="filter-name">${category.name}</span>
                        <span class="filter-count">${count}</span>
                    </button>
                `;
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            filters += `
                <button class="category-filter ${this.currentCategory === 'other' ? 'active' : ''}" 
                        onclick="window.pageManager.filterByCategory('other')">
                    <span class="filter-icon">📌</span>
                    <span class="filter-name">Autre</span>
                    <span class="filter-count">${otherCount}</span>
                </button>
            `;
        }
        
        return filters;
    }

    // =====================================
    // RENDU DES EMAILS
    // =====================================
    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        let filteredEmails = emails;
        
        // Apply filters
        if (this.currentCategory !== 'all') {
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
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title">Aucun email trouvé</h3>
                <p class="empty-text">
                    ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun email dans cette catégorie'}
                </p>
                ${this.searchTerm ? `
                    <button class="btn primary" onclick="window.pageManager.clearSearch()">
                        <i class="fas fa-undo"></i>
                        <span>Effacer la recherche</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderFlatView(emails) {
        return `
            <div class="emails-list">
                ${emails.map(email => this.renderEmailCard(email)).join('')}
            </div>
        `;
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <div class="email-checkbox-container">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                </div>
                
                <div class="email-sender-simple">
                    ${this.escapeHtml(senderName)}
                </div>
                
                <div class="email-subject-simple">
                    ${this.escapeHtml(email.subject || 'Sans sujet')}
                </div>
                
                <div class="email-time-simple">
                    ${this.formatEmailDate(email.receivedDateTime)}
                </div>
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
        const icon = groupType === 'grouped-domain' ? 
            '<i class="fas fa-globe"></i>' : 
            `<div class="group-avatar">${group.name.charAt(0).toUpperCase()}</div>`;
        
        return `
            <div class="email-group" data-group-key="${group.key}">
                <div class="group-header" onclick="window.pageManager.toggleGroup('${group.key}')">
                    <div class="group-info">
                        <div class="group-icon">${icon}</div>
                        <div class="group-details">
                            <div class="group-name">${displayName}</div>
                            <div class="group-count">${group.count} email${group.count > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <div class="group-controls">
                        <div class="group-date">${this.formatEmailDate(group.latestDate)}</div>
                        <i class="fas fa-chevron-down group-toggle"></i>
                    </div>
                </div>
                
                <div class="group-content" style="display: none;">
                    ${group.emails.map(email => this.renderEmailCard(email)).join('')}
                </div>
            </div>
        `;
    }

    // =====================================
    // ÉVÉNEMENTS ET HANDLERS
    // =====================================
    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') return;
        if (event.target.closest('.email-actions')) return;
        this.showEmailModal(emailId);
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.view-btn').classList.add('active');
        
        // Re-render
        const emailsContent = document.getElementById('emailsContent');
        if (emailsContent) {
            emailsContent.innerHTML = this.renderEmailsList();
        }
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Update filters
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Re-render
        const emailsContent = document.getElementById('emailsContent');
        if (emailsContent) {
            emailsContent.innerHTML = this.renderEmailsList();
        }
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.renderEmails(document.getElementById('pageContent'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.renderEmails(document.getElementById('pageContent'));
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const toggle = group.querySelector('.group-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.classList.remove('fa-chevron-down');
            toggle.classList.add('fa-chevron-up');
            group.classList.add('expanded');
        } else {
            content.style.display = 'none';
            toggle.classList.remove('fa-chevron-up');
            toggle.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
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
        
        const emailsContent = document.getElementById('emailsContent');
        if (emailsContent) {
            emailsContent.innerHTML = this.renderEmailsList();
        }
        
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            clearBtn.style.display = this.searchTerm ? 'block' : 'none';
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const emailsContent = document.getElementById('emailsContent');
        if (emailsContent) {
            emailsContent.innerHTML = this.renderEmailsList();
        }
    }

    // =====================================
    // STYLES MODERNES OPTIMISÉS
    // =====================================
    addModernStyles() {
        if (document.getElementById('modernEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernEmailStyles';
        styles.textContent = `
            /* ===== RESET & BASE ===== */
            * {
                box-sizing: border-box;
            }
            
            /* ===== HEADER PRINCIPAL ===== */
            .emails-header {
                margin-bottom: 16px;
                padding: 0 4px;
            }
            
            .header-title-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }
            
            .header-explanation {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: 12px 16px;
            }
            
            .explanation-main {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .explanation-icon {
                color: #0ea5e9;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .explanation-text {
                color: #075985;
                font-weight: 600;
                font-size: 13px;
                line-height: 1.3;
            }
            
            .selection-clear {
                display: flex;
                align-items: center;
                gap: 6px;
                background: #ef4444;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .selection-clear:hover {
                background: #dc2626;
                transform: translateY(-1px);
            }
            
            .selection-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }
            
            .selection-action {
                display: flex;
                align-items: center;
                gap: 4px;
                background: white;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                font-size: 11px;
                transition: all 0.2s ease;
            }
            
            .selection-action:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            /* ===== BARRE DE CONTRÔLES COMPACTE ===== */
            .emails-controls-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin: 0 4px 16px 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Recherche */
            .controls-search {
                flex: 0 0 280px;
            }
            
            .search-container {
                position: relative;
                width: 100%;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 14px 10px 38px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 13px;
                background: #f9fafb;
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: 13px;
            }
            
            .search-clear {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
                color: white;
                border: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                transition: background 0.2s;
            }
            
            .search-clear:hover {
                background: #dc2626;
            }
            
            /* Modes de vue */
            .controls-views {
                flex: 1;
                display: flex;
                justify-content: center;
            }
            
            .view-buttons {
                display: flex;
                background: #f3f4f6;
                border-radius: 10px;
                padding: 3px;
            }
            
            .view-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 7px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .view-btn:hover {
                background: rgba(255, 255, 255, 0.5);
                color: #374151;
            }
            
            .view-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                font-weight: 600;
            }
            
            /* Actions */
            .controls-actions {
                flex: 0 0 auto;
                display: flex;
                gap: 10px;
            }
            
            .action-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                border: 2px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.3s ease;
                position: relative;
                white-space: nowrap;
            }
            
            .action-btn.primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
            }
            
            .action-btn.primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 5px 16px rgba(59, 130, 246, 0.4);
            }
            
            .action-btn.primary.with-selection {
                background: linear-gradient(135deg, #10b981, #047857);
                box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
                animation: pulse 2s infinite;
            }
            
            .action-btn.secondary {
                background: white;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .action-btn.secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            .selection-count {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 1px 5px;
                border-radius: 8px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            /* ===== FILTRES DE CATÉGORIES COMPACTS ===== */
            .category-filters {
                display: flex;
                gap: 6px;
                margin: 0 4px 16px 4px;
                flex-wrap: wrap;
            }
            
            .category-filter {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                background: white;
                color: #374151;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 13px;
                font-weight: 500;
            }
            
            .category-filter:hover {
                border-color: var(--category-color, #3b82f6);
                background: color-mix(in srgb, var(--category-color, #3b82f6) 5%, white);
                transform: translateY(-1px);
            }
            
            .category-filter.active {
                background: var(--category-color, #3b82f6);
                color: white;
                border-color: var(--category-color, #3b82f6);
                box-shadow: 0 3px 10px color-mix(in srgb, var(--category-color, #3b82f6) 30%, transparent);
            }
            
            .filter-icon {
                font-size: 14px;
            }
            
            .filter-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 1px 6px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                min-width: 18px;
                text-align: center;
            }
            
            .category-filter.active .filter-count {
                background: rgba(255, 255, 255, 0.25);
            }
            
            /* ===== CONTENU DES EMAILS ===== */
            .emails-content {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin: 0 4px;
                overflow: hidden;
                min-height: 400px;
            }
            
            /* ===== LISTE D'EMAILS COMPACTE ===== */
            .emails-list {
                display: flex;
                flex-direction: column;
            }
            
            .email-card {
                display: flex;
                flex-direction: column;
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s ease;
                background: white;
            }
            
            .email-card:last-child {
                border-bottom: none;
            }
            
            .email-card:hover {
                background: #f8fafc;
            }
            
            .email-card.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .email-card.has-task {
                background: #f0fdf4;
                border-left: 3px solid #10b981;
            }
            
            /* Header de l'email (ligne 1) */
            .email-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 6px;
            }
            
            .email-checkbox-container {
                flex-shrink: 0;
            }
            
            .email-checkbox {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .email-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .email-sender-info {
                flex: 1;
                min-width: 0;
            }
            
            .sender-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 14px;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .sender-domain {
                font-size: 11px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 1px 4px;
                border-radius: 3px;
                display: inline-block;
                margin-top: 1px;
            }
            
            .email-meta-badges {
                display: flex;
                gap: 4px;
                align-items: center;
                flex-shrink: 0;
            }
            
            .deadline-badge,
            .attachment-badge,
            .ai-badge {
                display: flex;
                align-items: center;
                gap: 3px;
                padding: 3px 6px;
                border-radius: 5px;
                font-size: 10px;
                font-weight: 600;
            }
            
            .deadline-badge.normal {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .deadline-badge.soon {
                background: #fef3c7;
                color: #d97706;
            }
            
            .deadline-badge.today {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .deadline-badge.overdue {
                background: #dc2626;
                color: white;
                animation: blink 1s infinite;
            }
            
            .attachment-badge {
                background: #fef3c7;
                color: #d97706;
            }
            
            .ai-badge {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .email-date {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }
            
            .email-actions {
                display: flex;
                gap: 3px;
                flex-shrink: 0;
            }
            
            .email-action-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .email-action-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            
            .email-action-btn.task-done {
                background: #dcfce7;
                color: #16a34a;
                border-color: #16a34a;
            }
            
            .email-action-btn.task-done:hover {
                background: #16a34a;
                color: white;
            }
            
            .email-action-btn.create-task:hover {
                background: #dbeafe;
                color: #2563eb;
                border-color: #2563eb;
            }
            
            .email-action-btn.view-email:hover {
                background: #f3f4f6;
                color: #374151;
                border-color: #9ca3af;
            }
            
            /* Contenu de l'email (ligne 2) */
            .email-content {
                margin-left: 62px;
                padding-left: 0;
            }
            
            .email-subject {
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
                line-height: 1.3;
                margin-bottom: 3px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .email-preview {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            /* ===== FORÇAGE TOTAL - HARMONISATION ABSOLUE DE TOUS LES BOUTONS ===== */
            
            /* RÈGLE UNIVERSELLE STRICTE - TOUS FONT 44PX */
            .view-btn,
            .action-btn,
            .category-filter,
            .search-input,
            .selection-clear,
            .selection-action,
            .view-buttons .view-btn,
            .category-filters .category-filter,
            .controls-search .search-input,
            .controls-actions .action-btn {
                height: 44px !important;
                min-height: 44px !important;
                max-height: 44px !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            /* ===== BOUTONS DE VUE - FORÇAGE ABSOLU 44PX ===== */
            .view-buttons {
                display: flex !important;
                background: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 10px !important;
                padding: 0 !important;
                gap: 0 !important;
                height: 44px !important;
                min-height: 44px !important;
                max-height: 44px !important;
            }
            
            .view-btn {
                gap: 6px !important;
                padding: 0 16px !important;
                border: none !important;
                background: transparent !important;
                color: #6b7280 !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                white-space: nowrap !important;
                flex: 1 !important;
                margin: 0 !important;
            }
            
            .view-btn:first-child {
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
            }
            
            .view-btn:last-child {
                border-top-left-radius: 0 !important;
                border-bottom-left-radius: 0 !important;
            }
            
            .view-btn:not(:first-child):not(:last-child) {
                border-radius: 0 !important;
            }
            
            .view-btn:hover {
                background: #f1f5f9 !important;
                color: #374151 !important;
                transform: none !important;
            }
            
            .view-btn.active {
                background: white !important;
                color: #1f2937 !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                font-weight: 600 !important;
                border: 1px solid #d1d5db !important;
                z-index: 1 !important;
            }
            
            /* ===== FILTRES DE CATÉGORIES - FORÇAGE ABSOLU 44PX ===== */
            .category-filters {
                display: flex !important;
                gap: 8px !important;
                flex-wrap: wrap !important;
                margin: 0 4px 12px 4px !important;
            }
            
            .category-filter {
                gap: 8px !important;
                padding: 0 16px !important;
                border: 2px solid #e5e7eb !important;
                border-radius: 10px !important;
                background: white !important;
                color: #374151 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                white-space: nowrap !important;
                margin: 0 !important;
            }
            
            .category-filter:hover {
                border-color: var(--category-color, #3b82f6) !important;
                background: color-mix(in srgb, var(--category-color, #3b82f6) 5%, white) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            }
            
            .category-filter.active {
                background: var(--category-color, #3b82f6) !important;
                color: white !important;
                border-color: var(--category-color, #3b82f6) !important;
                box-shadow: 0 4px 12px color-mix(in srgb, var(--category-color, #3b82f6) 30%, transparent) !important;
                transform: translateY(-1px) !important;
            }
            
            .filter-icon {
                font-size: 14px !important;
                flex-shrink: 0 !important;
            }
            
            .filter-count {
                background: rgba(0, 0, 0, 0.1) !important;
                padding: 2px 6px !important;
                border-radius: 8px !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                min-width: 20px !important;
                text-align: center !important;
                line-height: 1.2 !important;
                flex-shrink: 0 !important;
            }
            
            .category-filter.active .filter-count {
                background: rgba(255, 255, 255, 0.25) !important;
            }
            
            /* ===== BOUTONS D'ACTION - FORÇAGE ABSOLU 44PX ===== */
            .action-btn {
                gap: 8px !important;
                padding: 0 20px !important;
                border: 2px solid transparent !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                transition: all 0.3s ease !important;
                position: relative !important;
                white-space: nowrap !important;
                margin: 0 !important;
            }
            
            .action-btn.primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
            }
            
            .action-btn.primary:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
            }
            
            .action-btn.primary.with-selection {
                background: linear-gradient(135deg, #10b981, #047857) !important;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
                animation: pulse 2s infinite !important;
            }
            
            .action-btn.secondary {
                background: white !important;
                color: #374151 !important;
                border: 2px solid #d1d5db !important;
            }
            
            .action-btn.secondary:hover {
                background: #f9fafb !important;
                border-color: #9ca3af !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            }

            /* ===== CHAMP DE RECHERCHE - FORÇAGE ABSOLU 44PX ===== */
            .search-container {
                position: relative !important;
                width: 100% !important;
            }
            
            .search-input {
                width: 100% !important;
                padding: 0 16px 0 44px !important;
                border: 2px solid #e5e7eb !important;
                border-radius: 10px !important;
                font-size: 13px !important;
                background: #f9fafb !important;
                transition: all 0.3s ease !important;
                margin: 0 !important;
            }
            
            .search-input:focus {
                outline: none !important;
                border-color: #3b82f6 !important;
                background: white !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
            }
            
            .search-icon {
                position: absolute !important;
                left: 16px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                color: #9ca3af !important;
                font-size: 14px !important;
                z-index: 2 !important;
            }
            
            .search-clear {
                position: absolute !important;
                right: 12px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                background: #ef4444 !important;
                color: white !important;
                border: none !important;
                width: 20px !important;
                height: 20px !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 10px !important;
                transition: background 0.2s !important;
                z-index: 2 !important;
            }
            
            .search-clear:hover {
                background: #dc2626 !important;
            }

            /* ===== BOUTONS DE SÉLECTION - FORÇAGE ABSOLU ===== */
            .selection-clear {
                gap: 6px !important;
                background: #ef4444 !important;
                color: white !important;
                border: none !important;
                padding: 0 16px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-weight: 600 !important;
                font-size: 13px !important;
                transition: all 0.2s ease !important;
                flex-shrink: 0 !important;
                white-space: nowrap !important;
                margin: 0 !important;
            }
            
            .selection-clear:hover {
                background: #dc2626 !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
            }
            
            .selection-action {
                gap: 6px !important;
                background: white !important;
                color: #374151 !important;
                border: 2px solid #d1d5db !important;
                padding: 0 12px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-weight: 500 !important;
                font-size: 12px !important;
                transition: all 0.2s ease !important;
                white-space: nowrap !important;
                margin: 0 !important;
            }
            
            .selection-action:hover {
                background: #f9fafb !important;
                border-color: #9ca3af !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }

            /* ===== BARRE DE CONTRÔLES ===== */
            .emails-controls-bar {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 16px !important;
                padding: 16px !important;
                background: white !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 12px !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                margin: 0 4px 12px 4px !important;
            }
            
            .controls-search {
                flex: 0 0 300px !important;
            }
            
            .controls-views {
                flex: 1 !important;
                display: flex !important;
                justify-content: center !important;
            }
            
            .controls-actions {
                flex: 0 0 auto !important;
                display: flex !important;
                gap: 12px !important;
            }

            /* ===== ESPACEMENT HARMONIEUX ===== */
            .emails-header {
                margin-bottom: 12px !important;
                padding: 0 4px !important;
            }
            
            .emails-content {
                margin: 0 4px !important;
            }

            /* ===== CORRECTION DES INTERFÉRENCES ===== */
            /* Supprimer tous les styles conflictuels */
            .view-btn,
            .action-btn,
            .category-filter,
            .search-input {
                line-height: normal !important;
                vertical-align: middle !important;
            }
            
            /* Forcer l'alignement vertical parfait */
            .emails-controls-bar > *,
            .category-filters > *,
            .view-buttons > *,
            .controls-actions > * {
                align-self: center !important;
            }

            /* ===== VUE GROUPÉE ULTRA-SIMPLIFIÉE - UNE LIGNE PAR EMAIL ===== */
            .emails-grouped {
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 12px !important;
                overflow: hidden !important;
            }
            
            .email-group {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: white !important;
                position: relative !important;
            }
            
            .email-group + .email-group::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 1px !important;
                background: #f1f5f9 !important;
                z-index: 10 !important;
            }
            
            /* ===== HEADER DE GROUPE COMPACT ===== */
            .group-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 8px 16px !important;
                margin: 0 !important;
                background: white !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
                border: none !important;
                min-height: 40px !important;
                max-height: 40px !important;
                height: 40px !important;
                box-sizing: border-box !important;
                position: relative !important;
                z-index: 20 !important;
            }
            
            .group-header:hover {
                background: #f8fafc !important;
            }
            
            .email-group.expanded .group-header {
                background: #f0f9ff !important;
                border-bottom: 1px solid #e0e7ff !important;
            }
            
            .group-info {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-icon {
                width: 28px !important;
                height: 28px !important;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 11px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-weight: 600 !important;
            }
            
            .group-avatar {
                width: 28px !important;
                height: 28px !important;
                background: linear-gradient(135deg, #10b981, #047857) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 12px !important;
                font-weight: 700 !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-details {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-name {
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-count {
                font-size: 10px !important;
                color: #6b7280 !important;
                font-weight: 600 !important;
                background: #f3f4f6 !important;
                padding: 2px 5px !important;
                border-radius: 6px !important;
                margin: 0 0 0 6px !important;
                min-width: 18px !important;
                text-align: center !important;
                line-height: 1.2 !important;
                flex-shrink: 0 !important;
            }
            
            .group-controls {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-date {
                font-size: 10px !important;
                color: #9ca3af !important;
                font-weight: 500 !important;
                margin: 0 !important;
                padding: 0 !important;
                white-space: nowrap !important;
            }
            
            .group-toggle {
                color: #9ca3af !important;
                transition: all 0.2s ease !important;
                font-size: 10px !important;
                width: 14px !important;
                height: 14px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            
            .group-header:hover .group-toggle {
                color: #6b7280 !important;
            }
            
            .email-group.expanded .group-toggle {
                transform: rotate(180deg) !important;
                color: #3b82f6 !important;
            }
            
            .group-content {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
            }
            
            .email-group.expanded .group-content {
                background: #fafbfc !important;
            }
            
            /* ===== EMAILS ULTRA-SIMPLIFIÉS - ÉPURÉS ===== */
            .group-content .email-card {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                margin: 0 !important;
                padding: 6px 16px !important;
                border-bottom: 1px solid #f8fafc !important;
                background: inherit !important;
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                border-radius: 0 !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
                min-height: 32px !important;
                max-height: 32px !important;
                height: 32px !important;
                box-sizing: border-box !important;
            }
            
            .group-content .email-card:hover {
                background: #f8fafc !important;
            }
            
            .group-content .email-card.selected {
                background: #eff6ff !important;
                border-left: 3px solid #3b82f6 !important;
                padding-left: 13px !important;
            }
            
            .group-content .email-card.has-task {
                background: #f0fdf4 !important;
                border-left: 3px solid #10b981 !important;
                padding-left: 13px !important;
            }
            
            .group-content .email-card:first-child {
                margin-top: 0 !important;
            }
            
            .group-content .email-card:last-child {
                border-bottom: none !important;
                margin-bottom: 0 !important;
            }
            
            /* ===== ÉLÉMENTS SIMPLIFIÉS ===== */
            .email-checkbox-container {
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .email-checkbox {
                width: 14px !important;
                height: 14px !important;
                cursor: pointer !important;
                margin: 0 !important;
            }
            
            .email-sender-simple {
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 0 0 160px !important;
                min-width: 0 !important;
            }
            
            .email-subject-simple {
                font-size: 13px !important;
                font-weight: 400 !important;
                color: #374151 !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .email-time-simple {
                font-size: 11px !important;
                color: #9ca3af !important;
                font-weight: 500 !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            
            /* ===== SUPPRESSION DES ANCIENS STYLES ===== */
            .email-card-content,
            .email-sender,
            .email-subject,
            .email-meta,
            .email-badges,
            .email-badge,
            .email-date,
            .email-actions,
            .email-action-btn,
            .attachment-badge,
            .ai-badge,
            .priority-badge {
                display: none !important;
            }
            
            /* Animation pulse */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .emails-controls-bar {
                    flex-direction: column !important;
                    gap: 12px !important;
                    padding: 12px !important;
                }
                
                .view-btn span,
                .action-btn span {
                    display: none !important;
                }
                
                .category-filters {
                    justify-content: center !important;
                    gap: 6px !important;
                }
                
                .filter-name {
                    display: none !important;
                }
            }

            /* ===== VUE GROUPÉE (inchangée) ===== */
            .emails-grouped {
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 12px !important;
                overflow: hidden !important;
            }
            
            .email-group {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: white !important;
                position: relative !important;
            }
            
            .email-group + .email-group::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 1px !important;
                background: #f1f5f9 !important;
                z-index: 10 !important;
            }
            
            .group-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 16px !important;
                margin: 0 !important;
                background: white !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
                border: none !important;
                min-height: 48px !important;
                max-height: 48px !important;
                height: 48px !important;
                box-sizing: border-box !important;
                position: relative !important;
                z-index: 20 !important;
            }
            
            .group-header:hover {
                background: #f8fafc !important;
            }
            
            .email-group.expanded .group-header {
                background: #f0f9ff !important;
                border-bottom: 1px solid #e0e7ff !important;
            }
            
            .group-info {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-icon {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 12px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-weight: 600 !important;
            }
            
            .group-avatar {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #10b981, #047857) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-details {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-name {
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-size: 14px !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-count {
                font-size: 11px !important;
                color: #6b7280 !important;
                font-weight: 600 !important;
                background: #f3f4f6 !important;
                padding: 2px 6px !important;
                border-radius: 8px !important;
                margin: 0 0 0 8px !important;
                min-width: 20px !important;
                text-align: center !important;
                line-height: 1.3 !important;
                flex-shrink: 0 !important;
            }
            
            .group-controls {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-date {
                font-size: 11px !important;
                color: #9ca3af !important;
                font-weight: 500 !important;
                margin: 0 !important;
                padding: 0 !important;
                white-space: nowrap !important;
            }
            
            .group-toggle {
                color: #9ca3af !important;
                transition: all 0.2s ease !important;
                font-size: 11px !important;
                width: 16px !important;
                height: 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            
            .group-header:hover .group-toggle {
                color: #6b7280 !important;
            }
            
            .email-group.expanded .group-toggle {
                transform: rotate(180deg) !important;
                color: #3b82f6 !important;
            }
            
            .group-content {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
            }
            
            .email-group.expanded .group-content {
                background: #fafbfc !important;
            }
            
            /* Emails dans les groupes */
            .group-content .email-card {
                margin: 0 !important;
                padding: 10px 16px !important;
                border-bottom: 1px solid #f3f4f6 !important;
                background: inherit !important;
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                border-radius: 0 !important;
            }
            
            .group-content .email-card:hover {
                background: #f8fafc !important;
            }
            
            .group-content .email-card:first-child {
                margin-top: 0 !important;
                padding-top: 10px !important;
            }
            
            .group-content .email-card:last-child {
                border-bottom: none !important;
                margin-bottom: 0 !important;
                padding-bottom: 10px !important;
            }
            
            /* Animation pulse */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .emails-controls-bar {
                    flex-direction: column !important;
                    gap: 12px !important;
                    padding: 12px !important;
                }
                
                .view-btn span,
                .action-btn span {
                    display: none !important;
                }
                
                .category-filters {
                    justify-content: center !important;
                    gap: 6px !important;
                }
                
                .filter-name {
                    display: none !important;
                }
            }

            /* ===== VUE GROUPÉE ULTRA-CONDENSÉE ET PROPRE ===== */
            .emails-grouped {
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 12px !important;
                overflow: hidden !important;
            }
            
            .email-group {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: white !important;
                position: relative !important;
            }
            
            .email-group + .email-group::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 1px !important;
                background: #f1f5f9 !important;
                z-index: 10 !important;
            }
            
            .group-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 16px !important;
                margin: 0 !important;
                background: white !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
                border: none !important;
                min-height: 48px !important;
                max-height: 48px !important;
                height: 48px !important;
                box-sizing: border-box !important;
                position: relative !important;
                z-index: 20 !important;
            }
            
            .group-header:hover {
                background: #f8fafc !important;
            }
            
            .email-group.expanded .group-header {
                background: #f0f9ff !important;
                border-bottom: 1px solid #e0e7ff !important;
            }
            
            .group-info {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-icon {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 12px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-weight: 600 !important;
            }
            
            .group-avatar {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #10b981, #047857) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-details {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-name {
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-size: 14px !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-count {
                font-size: 11px !important;
                color: #6b7280 !important;
                font-weight: 600 !important;
                background: #f3f4f6 !important;
                padding: 2px 6px !important;
                border-radius: 8px !important;
                margin: 0 0 0 8px !important;
                min-width: 20px !important;
                text-align: center !important;
                line-height: 1.3 !important;
                flex-shrink: 0 !important;
            }
            
            .group-controls {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-date {
                font-size: 11px !important;
                color: #9ca3af !important;
                font-weight: 500 !important;
                margin: 0 !important;
                padding: 0 !important;
                white-space: nowrap !important;
            }
            
            .group-toggle {
                color: #9ca3af !important;
                transition: all 0.2s ease !important;
                font-size: 11px !important;
                width: 16px !important;
                height: 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            
            .group-header:hover .group-toggle {
                color: #6b7280 !important;
            }
            
            .email-group.expanded .group-toggle {
                transform: rotate(180deg) !important;
                color: #3b82f6 !important;
            }
            
            .group-content {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
            }
            
            .email-group.expanded .group-content {
                background: #fafbfc !important;
            }
            
            /* Emails dans les groupes - ultra condensés */
            .group-content .email-card {
                margin: 0 !important;
                padding: 10px 16px !important;
                border-bottom: 1px solid #f3f4f6 !important;
                background: inherit !important;
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                border-radius: 0 !important;
            }
            
            .group-content .email-card:hover {
                background: #f8fafc !important;
            }
            
            .group-content .email-card:first-child {
                margin-top: 0 !important;
                padding-top: 10px !important;
            }
            
            .group-content .email-card:last-child {
                border-bottom: none !important;
                margin-bottom: 0 !important;
                padding-bottom: 10px !important;
            }
            
            /* Animation pulse pour les boutons actifs */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            /* Responsive ultra-compact */
            @media (max-width: 768px) {
                .emails-controls-bar {
                    flex-direction: column !important;
                    gap: 12px !important;
                    padding: 12px !important;
                }
                
                .view-btn span,
                .action-btn span {
                    display: none !important;
                }
                
                .category-filters {
                    justify-content: center !important;
                    gap: 6px !important;
                }
                
                .filter-name {
                    display: none !important;
                }
            }

            /* ===== VUE GROUPÉE ULTRA-CONDENSÉE ET PROPRE ===== */
            .emails-grouped {
                display: flex !important;
                flex-direction: column !important;
                gap: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 12px !important;
                overflow: hidden !important;
            }
            
            .email-group {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: white !important;
                position: relative !important;
            }
            
            .email-group + .email-group::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 1px !important;
                background: #f1f5f9 !important;
                z-index: 10 !important;
            }
            
            .group-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 16px !important;
                margin: 0 !important;
                background: white !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
                border: none !important;
                min-height: 48px !important;
                max-height: 48px !important;
                height: 48px !important;
                box-sizing: border-box !important;
                position: relative !important;
                z-index: 20 !important;
            }
            
            .group-header:hover {
                background: #f8fafc !important;
            }
            
            .email-group.expanded .group-header {
                background: #f0f9ff !important;
                border-bottom: 1px solid #e0e7ff !important;
            }
            
            .group-info {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-icon {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 12px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-weight: 600 !important;
            }
            
            .group-avatar {
                width: 32px !important;
                height: 32px !important;
                background: linear-gradient(135deg, #10b981, #047857) !important;
                color: white !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-details {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-name {
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-size: 14px !important;
                line-height: 1.2 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            
            .group-count {
                font-size: 11px !important;
                color: #6b7280 !important;
                font-weight: 600 !important;
                background: #f3f4f6 !important;
                padding: 2px 6px !important;
                border-radius: 8px !important;
                margin: 0 0 0 8px !important;
                min-width: 20px !important;
                text-align: center !important;
                line-height: 1.3 !important;
                flex-shrink: 0 !important;
            }
            
            .group-controls {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .group-date {
                font-size: 11px !important;
                color: #9ca3af !important;
                font-weight: 500 !important;
                margin: 0 !important;
                padding: 0 !important;
                white-space: nowrap !important;
            }
            
            .group-toggle {
                color: #9ca3af !important;
                transition: all 0.2s ease !important;
                font-size: 11px !important;
                width: 16px !important;
                height: 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }
            
            .group-header:hover .group-toggle {
                color: #6b7280 !important;
            }
            
            .email-group.expanded .group-toggle {
                transform: rotate(180deg) !important;
                color: #3b82f6 !important;
            }
            
            .group-content {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
            }
            
            .email-group.expanded .group-content {
                background: #fafbfc !important;
            }
            
            /* Emails dans les groupes - ultra condensés */
            .group-content .email-card {
                margin: 0 !important;
                padding: 10px 16px !important;
                border-bottom: 1px solid #f3f4f6 !important;
                background: inherit !important;
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                border-radius: 0 !important;
            }
            
            .group-content .email-card:hover {
                background: #f8fafc !important;
            }
            
            .group-content .email-card:first-child {
                margin-top: 0 !important;
                padding-top: 10px !important;
            }
            
            .group-content .email-card:last-child {
                border-bottom: none !important;
                margin-bottom: 0 !important;
                padding-bottom: 10px !important;
            }
            
            /* FORÇAGE ABSOLU - suppression de TOUS les espaces */
            .emails-grouped > * {
                margin: 0 !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
            }
            
            .email-group,
            .email-group + .email-group {
                margin: 0 !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                border-top: none !important;
                border-bottom: none !important;
                padding: 0 !important;
                gap: 0 !important;
            }
            
            /* Nettoyage total des espacements résiduels */
            .emails-grouped::before,
            .emails-grouped::after,
            .email-group::before,
            .email-group::after {
                display: none !important;
            }
            
            /* CSS de nettoyage pour éliminer tout espace */
            .emails-grouped {
                line-height: 0 !important;
            }
            
            .emails-grouped > .email-group {
                line-height: normal !important;
                display: block !important;
                float: none !important;
                clear: none !important;
            }
            
            /* Responsive ultra-compact */
            @media (max-width: 768px) {
                .group-header {
                    padding: 8px 12px !important;
                    min-height: 44px !important;
                    max-height: 44px !important;
                    height: 44px !important;
                }
                
                .group-icon,
                .group-avatar {
                    width: 28px !important;
                    height: 28px !important;
                    font-size: 11px !important;
                }
                
                .group-name {
                    font-size: 13px !important;
                }
                
                .group-count {
                    font-size: 10px !important;
                    padding: 2px 5px !important;
                }
                
                .group-date {
                    font-size: 10px !important;
                }
                
                .group-content .email-card {
                    padding: 8px 12px !important;
                }
            }
            
            /* Sélecteur de secours pour éliminer tout espacement */
            .emails-grouped,
            .emails-grouped *,
            .email-group,
            .email-group * {
                margin-block-start: 0 !important;
                margin-block-end: 0 !important;
                margin-inline-start: 0 !important;
                margin-inline-end: 0 !important;
            }
            
            /* ===== ÉTAT VIDE ===== */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #d1d5db;
            }
            
            .empty-title {
                font-size: 20px;
                font-weight: 700;
                color: #374151;
                margin: 0 0 6px 0;
            }
            
            .empty-text {
                font-size: 14px;
                margin: 0 0 20px 0;
                line-height: 1.5;
            }
            
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            
            .btn.primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
            }
            
            .btn.primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 5px 16px rgba(59, 130, 246, 0.4);
            }
            
            /* ===== ANIMATIONS ===== */
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.5; }
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 1024px) {
                .emails-controls-bar {
                    flex-direction: column;
                    gap: 12px;
                    padding: 12px;
                }
                
                .controls-search {
                    flex: none;
                    width: 100%;
                }
                
                .controls-views {
                    flex: none;
                    width: 100%;
                }
                
                .view-buttons {
                    width: 100%;
                    justify-content: space-evenly;
                }
                
                .controls-actions {
                    flex: none;
                    width: 100%;
                    justify-content: center;
                }
            }
            
            @media (max-width: 768px) {
                .emails-header {
                    margin-bottom: 12px;
                }
                
                .header-explanation {
                    padding: 10px 12px;
                }
                
                .explanation-text {
                    font-size: 12px;
                }
                
                .emails-controls-bar {
                    padding: 10px;
                    gap: 10px;
                }
                
                .view-btn span {
                    display: none;
                }
                
                .action-btn span {
                    display: none;
                }
                
                .category-filters {
                    justify-content: center;
                    gap: 4px;
                }
                
                .filter-name {
                    display: none;
                }
                
                .email-card {
                    padding: 10px 12px;
                }
                
                .email-header {
                    gap: 6px;
                }
                
                .email-avatar {
                    width: 30px;
                    height: 30px;
                    font-size: 12px;
                }
                
                .email-content {
                    margin-left: 46px;
                }
                
                .sender-name {
                    font-size: 13px;
                }
                
                .email-subject {
                    font-size: 13px;
                }
                
                .email-preview {
                    font-size: 12px;
                }
                
                .email-action-btn {
                    width: 24px;
                    height: 24px;
                    font-size: 11px;
                }
            }
            
            /* Support pour les navigateurs sans color-mix */
            @supports not (color: color-mix(in srgb, red, blue)) {
                .category-filter:hover {
                    background: rgba(59, 130, 246, 0.05);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // =====================================
    // UTILITY METHODS
    // =====================================
    generateGradient(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%))`;
    }

    getDeadlineClass(deadline) {
        try {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return 'overdue';
            if (diffDays === 0) return 'today';
            if (diffDays <= 3) return 'soon';
            return 'normal';
        } catch (error) {
            return 'normal';
        }
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        try {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return `Échue`;
            if (diffDays === 0) return 'Aujourd\'hui';
            if (diffDays === 1) return 'Demain';
            if (diffDays <= 7) return `${diffDays}j`;
            return deadlineDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } catch (error) {
            return deadline;
        }
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

    // =====================================
    // TASK CREATION METHODS
    // =====================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
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
                console.error('[PageManager] Error creating task for email:', emailId, error);
            }
        }
        
        window.uiManager.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            window.uiManager.showToast('Aucune tâche créée', 'warning');
        }
    }

    async createTasksFromAllVisible() {
        const emails = this.getVisibleEmails();
        if (emails.length === 0) {
            window.uiManager.showToast('Aucun email visible', 'warning');
            return;
        }
        
        const emailsToProcess = emails.filter(email => !this.createdTasks.has(email.id));
        if (emailsToProcess.length === 0) {
            window.uiManager.showToast('Toutes les tâches ont déjà été créées', 'info');
            return;
        }
        
        emailsToProcess.forEach(email => this.selectedEmails.add(email.id));
        await this.createTasksFromSelection();
    }

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    getEmailById(emailId) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        return emails.find(e => e.id === emailId);
    }

    getTemporaryEmails() {
        return this.temporaryEmailStorage || [];
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
            method: 'ai'
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
            
            if (emails.length > 0 && window.categoryManager) {
                emails.forEach(email => {
                    const result = window.categoryManager.analyzeEmail(email);
                    email.category = result.category || 'other';
                });
            }
            
            await this.loadPage('emails');
            window.uiManager.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'actualisation', 'error');
        }
    }

    async analyzeFirstEmails(emails) {
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
                        useApi: false,
                        quickMode: true
                    });
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('Auto-analysis error:', error);
                }
            }
        }
        
        const emailsContent = document.getElementById('emailsContent');
        if (emailsContent) {
            emailsContent.innerHTML = this.renderEmailsList();
        }
    }

    // =====================================
    // MODAL METHODS
    // =====================================
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            window.uiManager.showLoading('Analyse de l\'email...');
            analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager.hideLoading();
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'analyse', 'error');
            return;
        }

        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Créer une tâche</h2>
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
                        <button onclick="window.pageManager.createTaskFromModal('${emailId}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
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
                    <span style="color: #0c4a6e; font-weight: 600;">Analyse intelligente par Claude AI</span>
                </div>
                
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: ${this.generateGradient(senderName)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
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
            window.uiManager.showToast('Données manquantes', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            window.uiManager.showToast('Le titre est requis', 'warning');
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

            const task = window.taskManager.createTaskFromEmail(taskData, email);
            this.createdTasks.set(emailId, task.id);
            
            window.taskManager.saveTasks();
            window.uiManager.showToast('Tâche créée avec succès', 'success');
            
            const emailsContent = document.getElementById('emailsContent');
            if (emailsContent) {
                emailsContent.innerHTML = this.renderEmailsList();
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager.showToast('Erreur lors de la création', 'error');
        }
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Email Complet</h2>
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

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu disponible'}</p>`;
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

    selectAllVisible() {
        const emails = this.getVisibleEmails();
        emails.forEach(email => {
            this.selectedEmails.add(email.id);
        });
        
        this.renderEmails(document.getElementById('pageContent'));
        window.uiManager.showToast(`${emails.length} emails sélectionnés`, 'success');
    }

    exportEmails() {
        const emails = this.getVisibleEmails();
        if (emails.length === 0) {
            window.uiManager.showToast('Aucun email à exporter', 'warning');
            return;
        }
        
        const csvContent = [
            ['Expéditeur', 'Nom', 'Sujet', 'Date', 'Catégorie', 'Avec pièces jointes'].join(','),
            ...emails.map(email => [
                `"${email.from?.emailAddress?.address || ''}"`,
                `"${email.from?.emailAddress?.name || ''}"`,
                `"${email.subject || ''}"`,
                new Date(email.receivedDateTime).toLocaleDateString('fr-FR'),
                email.category || 'other',
                email.hasAttachments ? 'Oui' : 'Non'
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
        
        window.uiManager.showToast('Export terminé', 'success');
    }

    getCategoryDisplayName(categoryId) {
        const categories = window.categoryManager?.getCategories() || {};
        return categories[categoryId]?.name || categoryId;
    }

    // =====================================
    // OTHER PAGES (Dashboard, Scanner, Tasks, Categories, Settings)
    // =====================================
    async renderDashboard(container) {
        const scanData = this.lastScanData;
        const taskStats = window.taskManager?.getStats() || {
            total: 0,
            byStatus: { todo: 0, 'in-progress': 0, completed: 0 },
            overdue: 0
        };
        
        const aiConfigured = window.aiTaskAnalyzer?.isConfigured() || false;
        
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Tableau de bord</h1>
                <div class="dashboard-actions">
                    <button class="btn primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Nouveau scan
                    </button>
                </div>
            </div>

            ${!aiConfigured ? `
                <div class="ai-banner">
                    <div class="ai-banner-icon"><i class="fas fa-magic"></i></div>
                    <div class="ai-banner-content">
                        <h3>Activez l'IA pour des suggestions intelligentes</h3>
                        <p>Configurez Claude AI pour analyser vos emails automatiquement</p>
                    </div>
                    <button class="btn primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        Configurer
                    </button>
                </div>
            ` : ''}

            <div class="dashboard-stats">
                ${this.createDashboardCard({
                    icon: 'fas fa-tasks',
                    label: 'Tâches totales',
                    value: taskStats.total,
                    color: '#3b82f6'
                })}
                ${this.createDashboardCard({
                    icon: 'fas fa-clock',
                    label: 'À faire',
                    value: taskStats.byStatus.todo,
                    color: '#06b6d4'
                })}
                ${this.createDashboardCard({
                    icon: 'fas fa-check-circle',
                    label: 'Terminées',
                    value: taskStats.byStatus.completed,
                    color: '#10b981'
                })}
                ${this.createDashboardCard({
                    icon: 'fas fa-exclamation-circle',
                    label: 'En retard',
                    value: taskStats.overdue,
                    color: '#ef4444'
                })}
            </div>

            ${scanData ? this.renderScanStats(scanData) : this.renderWelcome()}
        `;

        this.addDashboardStyles();
    }

    createDashboardCard({ icon, label, value, color }) {
        return `
            <div class="dashboard-card" style="--card-color: ${color}">
                <div class="card-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="card-content">
                    <div class="card-value">${value}</div>
                    <div class="card-label">${label}</div>
                </div>
            </div>
        `;
    }

    renderWelcome() {
        return `
            <div class="welcome-card">
                <div class="welcome-content">
                    <div class="welcome-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h2 class="welcome-title">Bienvenue!</h2>
                    <p class="welcome-text">
                        Commencez par scanner vos emails pour les organiser automatiquement.
                    </p>
                    <button class="btn primary large" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Démarrer le scan
                    </button>
                </div>
            </div>
        `;
    }

    renderScanStats(scanData) {
        return `
            <div class="scan-stats-card">
                <h3>Résultats du dernier scan</h3>
                <div class="scan-stats">
                    <div class="stat">
                        <span class="stat-number">${scanData.total}</span>
                        <span class="stat-label">emails analysés</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${scanData.categorized}</span>
                        <span class="stat-label">catégorisés</span>
                    </div>
                </div>
            </div>
        `;
    }

    async renderScanner(container) {
        console.log('[PageManager] Rendering scanner page...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Using modern ScanStartModule');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Error with ScanStartModule, falling back:', error);
            }
        }
        
        console.log('[PageManager] Using fallback scanner interface');
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

    addDashboardStyles() {
        if (document.getElementById('dashboardStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'dashboardStyles';
        styles.textContent = `
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
            }
            
            .dashboard-title {
                font-size: 32px;
                font-weight: 800;
                color: #111827;
                margin: 0;
            }
            
            .dashboard-actions {
                display: flex;
                gap: 12px;
            }
            
            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .dashboard-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 24px;
                display: flex;
                align-items: center;
                gap: 20px;
                transition: all 0.3s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .dashboard-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .card-icon {
                width: 60px;
                height: 60px;
                background: var(--card-color);
                color: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .card-content {
                flex: 1;
            }
            
            .card-value {
                font-size: 32px;
                font-weight: 800;
                color: #1f2937;
                line-height: 1;
                margin-bottom: 4px;
            }
            
            .card-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 600;
            }
            
            .welcome-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 48px;
                text-align: center;
            }
            
            .welcome-content {
                max-width: 400px;
                margin: 0 auto;
            }
            
            .welcome-icon {
                font-size: 64px;
                color: #3b82f6;
                margin-bottom: 24px;
            }
            
            .welcome-title {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 16px 0;
            }
            
            .welcome-text {
                font-size: 16px;
                color: #6b7280;
                line-height: 1.6;
                margin: 0 0 32px 0;
            }
            
            .ai-banner {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 1px solid #0ea5e9;
                border-radius: 16px;
                padding: 24px;
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .ai-banner-icon {
                width: 48px;
                height: 48px;
                background: #0ea5e9;
                color: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .ai-banner-content {
                flex: 1;
            }
            
            .ai-banner-content h3 {
                margin: 0 0 4px 0;
                font-size: 18px;
                font-weight: 700;
                color: #0c4a6e;
            }
            
            .ai-banner-content p {
                margin: 0;
                color: #075985;
                font-size: 14px;
            }
            
            .scan-stats-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 24px;
            }
            
            .scan-stats-card h3 {
                margin: 0 0 20px 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .scan-stats {
                display: flex;
                gap: 32px;
            }
            
            .stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: 800;
                color: #3b82f6;
            }
            
            .stat-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 600;
            }
            
            .btn.large {
                padding: 16px 32px;
                font-size: 16px;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
window.pageManager = new PageManager();

// Bind methods to preserve context
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v10.1 loaded - Affichage optimisé compact');
