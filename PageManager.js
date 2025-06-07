// PageManager.js - Version 9.2 - Interface unifiée et cohérente avec design professionnel

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
        console.log('[PageManager] Initialized v9.2 - Interface unifiée et cohérente');
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
    // EMAILS PAGE - INTERFACE UNIFIÉE
    // =====================================
    async renderEmails(container) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialize view mode - grouped by domain by default
        this.currentViewMode = this.currentViewMode || 'grouped-domain';
        this.currentCategory = this.currentCategory || 'all';

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            
            container.innerHTML = `
                <!-- BARRE PRINCIPALE UNIFIÉE - TOUT SUR UNE LIGNE -->
                <div class="emails-unified-toolbar">
                    <!-- Section Gauche: Titre, compteur et explication -->
                    <div class="toolbar-section toolbar-left">
                        <div class="page-header-info">
                            <h1 class="page-title">Emails</h1>
                            <span class="item-counter">${totalEmails} email${totalEmails > 1 ? 's' : ''}</span>
                            ${selectedCount > 0 ? `
                                <div class="selection-indicator">
                                    <span class="selection-count">${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                                    <button class="btn-unified btn-clear" onclick="window.pageManager.clearSelection()" title="Désélectionner tout">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="page-explanation">
                            <i class="fas fa-info-circle explanation-icon"></i>
                            <span class="explanation-text">
                                ${selectedCount > 0 ? 
                                    `${selectedCount} email${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''}. Créez des tâches ou changez la vue.` :
                                    this.currentCategory === 'all' ? 
                                        'Visualisez vos emails par domaine, expéditeur ou en liste complète. Sélectionnez des emails pour créer des tâches.' :
                                        `Affichage de la catégorie "${this.getCategoryInfo(this.currentCategory).name}". Utilisez les filtres pour naviguer.`
                                }
                            </span>
                        </div>
                    </div>
                    
                    <!-- Section Centre: Recherche -->
                    <div class="toolbar-section toolbar-center">
                        <div class="unified-search-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="unified-search-input" 
                                   id="emailSearchInput"
                                   placeholder="Rechercher par expéditeur, sujet, contenu..." 
                                   value="${this.searchTerm}">
                            <button class="search-clear-btn" id="searchClearBtn" 
                                    style="display: ${this.searchTerm ? 'flex' : 'none'}"
                                    onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Section Droite: Actions principales -->
                    <div class="toolbar-section toolbar-right">
                        <!-- Modes de vue -->
                        <div class="view-mode-group">
                            <button class="btn-unified view-mode-btn ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    data-mode="grouped-domain"
                                    onclick="window.pageManager.changeViewMode('grouped-domain')"
                                    title="Grouper par domaine">
                                <i class="fas fa-globe"></i>
                                <span class="btn-text">Par domaine</span>
                            </button>
                            <button class="btn-unified view-mode-btn ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    data-mode="grouped-sender"
                                    onclick="window.pageManager.changeViewMode('grouped-sender')"
                                    title="Grouper par expéditeur">
                                <i class="fas fa-user"></i>
                                <span class="btn-text">Par expéditeur</span>
                            </button>
                            <button class="btn-unified view-mode-btn ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    data-mode="flat"
                                    onclick="window.pageManager.changeViewMode('flat')"
                                    title="Vue liste complète">
                                <i class="fas fa-list"></i>
                                <span class="btn-text">Liste complète</span>
                            </button>
                        </div>
                        
                        <!-- Actions -->
                        <div class="action-group">
                            <!-- Bouton Créer tâches - TOUJOURS VISIBLE -->
                            <button class="btn-unified btn-primary ${selectedCount > 0 ? 'with-selection' : ''}" 
                                    onclick="${selectedCount > 0 ? 'window.pageManager.createTasksFromSelection()' : 'window.pageManager.createTasksFromAllVisible()'}" 
                                    title="${selectedCount > 0 ? 
                                        `Créer des tâches pour les ${selectedCount} emails sélectionnés` : 
                                        'Créer des tâches pour tous les emails visibles'}">
                                <i class="fas fa-tasks"></i>
                                <span class="btn-text">
                                    ${selectedCount > 0 ? 
                                        `Créer ${selectedCount} tâche${selectedCount > 1 ? 's' : ''}` : 
                                        'Créer tâches'
                                    }
                                </span>
                                ${selectedCount > 0 ? `<span class="selection-badge">${selectedCount}</span>` : ''}
                            </button>
                            
                            <button class="btn-unified btn-secondary" onclick="window.pageManager.refreshEmails()" title="Actualiser la liste des emails">
                                <i class="fas fa-sync"></i>
                                <span class="btn-text">Actualiser</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- FILTRES DE CATÉGORIES UNIFIÉS -->
                <div class="unified-category-filters">
                    ${this.buildUnifiedCategoryFilters(categoryCounts, totalEmails, categories, this.currentCategory)}
                </div>

                <!-- ZONE DE CONTENU PRINCIPAL -->
                <div class="emails-content-area" id="emailsList">
                    ${this.renderEmailsList()}
                </div>

                <!-- STATISTIQUES EN BAS (optionnel) -->
                ${this.renderEmailStats(emails, categoryCounts)}
            `;

            this.addUnifiedEmailStyles();
            this.setupEmailsEventListeners();
        };

        renderEmailsPage();
        
        // Auto-analyze first emails if enabled
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    // =====================================
    // CONSTRUCTION DES FILTRES UNIFIÉS
    // =====================================
    buildUnifiedCategoryFilters(categoryCounts, totalEmails, categories, currentCategory) {
        let filters = `
            <button class="unified-filter-btn ${currentCategory === 'all' ? 'active' : ''}" 
                    data-category="all"
                    onclick="window.pageManager.filterByCategory('all')">
                <span class="filter-icon">📧</span>
                <span class="filter-label">Tous</span>
                <span class="filter-count">${totalEmails}</span>
            </button>
        `;
        
        // Ajouter les catégories avec emails
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                filters += `
                    <button class="unified-filter-btn ${currentCategory === catId ? 'active' : ''}" 
                            data-category="${catId}"
                            onclick="window.pageManager.filterByCategory('${catId}')"
                            style="--category-color: ${category.color}">
                        <span class="filter-icon">${category.icon}</span>
                        <span class="filter-label">${category.name}</span>
                        <span class="filter-count">${count}</span>
                    </button>
                `;
            }
        });
        
        // Ajouter "Autre" si nécessaire
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            filters += `
                <button class="unified-filter-btn ${currentCategory === 'other' ? 'active' : ''}" 
                        data-category="other"
                        onclick="window.pageManager.filterByCategory('other')">
                    <span class="filter-icon">📌</span>
                    <span class="filter-label">Autre</span>
                    <span class="filter-count">${otherCount}</span>
                </button>
            `;
        }
        
        return filters;
    }

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
            return this.renderEmptyEmailState();
        }

        // Render based on view mode
        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatEmailView(filteredEmails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedEmailView(filteredEmails, this.currentViewMode);
            default:
                return this.renderFlatEmailView(filteredEmails);
        }
    }

    renderEmptyEmailState() {
        return `
            <div class="empty-state-modern">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun email dans cette catégorie'}
                </p>
                ${this.searchTerm ? `
                    <button class="btn-unified btn-primary" onclick="window.pageManager.clearSearch()">
                        <i class="fas fa-undo"></i>
                        <span>Effacer la recherche</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderFlatEmailView(emails) {
        return `
            <div class="unified-emails-list">
                ${emails.map(email => this.renderUnifiedEmailItem(email)).join('')}
            </div>
        `;
    }

    renderUnifiedEmailItem(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown';
        const senderDomain = email.from?.emailAddress?.address?.split('@')[1] || '';
        const senderInitial = senderName.charAt(0).toUpperCase();
        const formattedDate = this.formatEmailDate(email.receivedDateTime);
        
        // Extract deadline from AI analysis if available
        const analysis = this.aiAnalysisResults.get(email.id);
        const deadline = analysis?.mainTask?.dueDate || analysis?.actionsHighlighted?.find(a => a.deadline)?.deadline || null;
        
        // Category info
        const categoryInfo = this.getCategoryInfo(email.category || 'other');
        
        return `
            <div class="unified-email-item ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <!-- Checkbox -->
                <div class="email-checkbox-wrapper">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                </div>
                
                <!-- Sender Avatar -->
                <div class="sender-avatar" style="background: linear-gradient(135deg, ${this.generateColorFromText(senderName)})">
                    ${senderInitial}
                </div>
                
                <!-- Email Content sur une seule ligne -->
                <div class="email-main-content">
                    <div class="email-header">
                        <!-- Sender Info -->
                        <div class="email-sender">
                            <span class="sender-name" title="${this.escapeHtml(senderName)}">${this.escapeHtml(senderName)}</span>
                            ${senderDomain ? `<span class="sender-domain">@${senderDomain}</span>` : ''}
                        </div>
                        
                        <!-- Subject -->
                        <div class="email-subject" title="${this.escapeHtml(email.subject || 'Sans sujet')}">
                            ${this.escapeHtml(email.subject || 'Sans sujet')}
                        </div>
                        
                        <!-- Meta Information -->
                        <div class="email-meta">
                            ${deadline ? `
                                <span class="email-deadline ${this.getDeadlineClass(deadline)}" title="Échéance: ${deadline}">
                                    <i class="fas fa-clock"></i>
                                    ${this.formatDeadline(deadline)}
                                </span>
                            ` : ''}
                            
                            ${email.hasAttachments ? `
                                <span class="attachment-indicator" title="Contient des pièces jointes">
                                    <i class="fas fa-paperclip"></i>
                                </span>
                            ` : ''}
                            
                            ${analysis ? `
                                <span class="ai-indicator" title="Analysé par IA">
                                    <i class="fas fa-robot"></i>
                                </span>
                            ` : ''}
                            
                            <span class="email-date">${formattedDate}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actions compactes -->
                <div class="email-actions">
                    ${hasTask ? `
                        <button class="action-btn task-created" onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')" title="Voir la tâche créée">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : `
                        <button class="action-btn create-task" onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')" title="Créer une tâche">
                            <i class="fas fa-plus-circle"></i>
                        </button>
                    `}
                    
                    <button class="action-btn view-email" onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')" title="Voir l'email complet">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderGroupedEmailView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="grouped-emails-container">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? 
            `@${group.name}` : 
            group.name;
            
        const icon = groupType === 'grouped-domain' ? 
            '<i class="fas fa-globe"></i>' : 
            group.avatar;
        
        return `
            <div class="email-group" data-group-key="${group.key}">
                <div class="group-header" onclick="window.pageManager.toggleEmailGroup('${group.key}')">
                    <div class="group-info">
                        <div class="group-icon">
                            ${icon}
                        </div>
                        <div class="group-details">
                            <div class="group-name">${displayName}</div>
                            <div class="group-stats">${group.count} email${group.count > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <div class="group-meta">
                        <span class="group-date">${this.formatEmailDate(group.latestDate)}</span>
                        <i class="fas fa-chevron-down group-toggle-icon"></i>
                    </div>
                </div>
                
                <div class="group-emails" style="display: none;">
                    ${group.emails.map(email => this.renderUnifiedEmailItem(email)).join('')}
                </div>
            </div>
        `;
    }

    renderEmailStats(emails, categoryCounts) {
        if (emails.length === 0) return '';
        
        const totalSize = emails.reduce((sum, email) => sum + (email.size || 0), 0);
        const withAttachments = emails.filter(e => e.hasAttachments).length;
        const analyzed = emails.filter(e => this.aiAnalysisResults.has(e.id)).length;
        
        return `
            <div class="email-stats-bar">
                <div class="stats-group">
                    <span class="stat-item">
                        <i class="fas fa-envelope"></i>
                        ${emails.length} emails
                    </span>
                    ${withAttachments > 0 ? `
                        <span class="stat-item">
                            <i class="fas fa-paperclip"></i>
                            ${withAttachments} avec pièces jointes
                        </span>
                    ` : ''}
                    ${analyzed > 0 ? `
                        <span class="stat-item">
                            <i class="fas fa-robot"></i>
                            ${analyzed} analysés par IA
                        </span>
                    ` : ''}
                </div>
                
                <div class="stats-actions">
                    <button class="stats-action-btn" onclick="window.pageManager.exportEmails()" title="Exporter la liste">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="stats-action-btn" onclick="window.pageManager.selectAllVisible()" title="Sélectionner tous les emails visibles">
                        <i class="fas fa-check-square"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // =====================================
    // UTILITY METHODS
    // =====================================
    generateColorFromText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%)`;
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================
    // EVENT HANDLERS
    // =====================================
    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') return;
        this.showEmailModal(emailId);
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Re-render emails list
        const emailsList = document.getElementById('emailsList');
        if (emailsList) {
            emailsList.innerHTML = this.renderEmailsList();
        }
        
        this.setupGroupToggles();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Update active filter
        document.querySelectorAll('.unified-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Re-render emails list
        const emailsList = document.getElementById('emailsList');
        if (emailsList) {
            emailsList.innerHTML = this.renderEmailsList();
        }
        
        this.setupGroupToggles();
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Re-render to update selection UI
        this.renderEmails(document.getElementById('pageContent'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.renderEmails(document.getElementById('pageContent'));
    }

    selectAllVisible() {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        filteredEmails.forEach(email => {
            this.selectedEmails.add(email.id);
        });
        
        this.renderEmails(document.getElementById('pageContent'));
        window.uiManager.showToast(`${filteredEmails.length} emails sélectionnés`, 'success');
    }

    toggleEmailGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const emailsContainer = group.querySelector('.group-emails');
        const toggleIcon = group.querySelector('.group-toggle-icon');
        
        if (emailsContainer.style.display === 'none') {
            emailsContainer.style.display = 'block';
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
        } else {
            emailsContainer.style.display = 'none';
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
        }
    }

    setupGroupToggles() {
        // Group toggles are handled by inline onclick handlers
        console.log('[PageManager] Group toggles ready');
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
        
        const emailsList = document.getElementById('emailsList');
        if (emailsList) {
            emailsList.innerHTML = this.renderEmailsList();
        }
        
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            clearBtn.style.display = this.searchTerm ? 'flex' : 'none';
        }
        
        this.setupGroupToggles();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const emailsList = document.getElementById('emailsList');
        if (emailsList) {
            emailsList.innerHTML = this.renderEmailsList();
        }
        
        this.setupGroupToggles();
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
                // Get or create analysis
                let analysis = this.aiAnalysisResults.get(emailId);
                if (!analysis && window.aiTaskAnalyzer) {
                    analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(emailId, analysis);
                }
                
                // Create task
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
        
        // Select emails to process
        emailsToProcess.forEach(email => this.selectedEmails.add(email.id));
        
        // Create tasks
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

    // =====================================
    // STYLES UNIFIÉS
    // =====================================
    addUnifiedEmailStyles() {
        if (document.getElementById('unifiedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unifiedEmailStyles';
        styles.textContent = `
            /* ===== BARRE PRINCIPALE ÉLÉGANTE - COMPROMIS DESIGN ===== */
            .emails-unified-toolbar {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 20px 24px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .toolbar-main-line {
                display: flex;
                align-items: center;
                gap: 24px;
                justify-content: space-between;
                min-height: 48px;
            }
            
            .toolbar-description {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 1px solid #bae6fd;
                border-radius: 8px;
                font-size: 13px;
                line-height: 1.4;
                margin-top: 4px;
            }
            
            .description-icon {
                color: #0ea5e9;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .description-text {
                color: #075985;
                font-weight: 500;
            }
            
            .toolbar-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .toolbar-left {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 280px;
            }
            
            .page-title {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1;
            }
            
            .item-counter {
                font-size: 15px;
                color: #6b7280;
                font-weight: 600;
                background: #f3f4f6;
                padding: 6px 14px;
                border-radius: 16px;
                white-space: nowrap;
            }
            
            .selection-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 10px;
                padding: 8px 14px;
                font-size: 14px;
                color: #1e40af;
                font-weight: 600;
            }
            
            .selection-count {
                white-space: nowrap;
            }
            
            .toolbar-center {
                flex: 1;
                max-width: 450px;
                min-width: 250px;
                display: flex;
                justify-content: center;
            }
            
            .toolbar-right {
                flex-shrink: 0;
                gap: 20px;
                display: flex;
                align-items: center;
            }
            
            /* ===== TITRE ET COMPTEURS ===== */
            .page-title {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1;
            }
            
            .item-counter {
                font-size: 14px;
                color: #6b7280;
                font-weight: 600;
                background: #f3f4f6;
                padding: 4px 12px;
                border-radius: 12px;
                white-space: nowrap;
            }
            
            .selection-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                padding: 6px 12px;
            }
            
            .selection-count {
                font-size: 13px;
                color: #1e40af;
                font-weight: 600;
            }
            
            /* ===== RECHERCHE ÉLÉGANTE ===== */
            .unified-search-wrapper {
                position: relative;
                width: 100%;
                max-width: 420px;
            }
            
            .unified-search-input {
                width: 100%;
                padding: 12px 18px 12px 46px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                font-size: 15px;
                background: #f9fafb;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .unified-search-input:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: 16px;
            }
            
            .search-clear-btn {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .search-clear-btn:hover {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            /* ===== BOUTONS UNIFIÉS ===== */
            .btn-unified {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                background: white;
                color: #374151;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                white-space: nowrap;
                min-height: 40px;
                box-sizing: border-box;
            }
            
            .btn-unified:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .btn-unified.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
            }
            
            .btn-unified.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-unified.btn-primary.with-selection {
                background: linear-gradient(135deg, #10b981, #059669);
                border-color: #10b981;
                position: relative;
                animation: selectionPulse 2s infinite;
            }
            
            .btn-unified.btn-primary.with-selection:hover {
                background: linear-gradient(135deg, #059669, #047857);
                border-color: #059669;
            }
            
            .selection-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
            }
            
            @keyframes selectionPulse {
                0%, 100% { box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25); }
                50% { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
            }
            
            .btn-unified.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-unified.btn-secondary:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            
            .btn-unified.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
                padding: 6px 10px;
                min-height: 32px;
            }
            
            .btn-unified.btn-clear:hover {
                background: #dc2626;
                color: white;
                border-color: #dc2626;
            }
            
            /* ===== GROUPES DE BOUTONS ===== */
            .view-mode-group {
                display: flex;
                gap: 2px;
                background: #f3f4f6;
                padding: 2px;
                border-radius: 6px;
            }
            
            .view-mode-btn {
                border: none !important;
                background: transparent !important;
                color: #6b7280 !important;
                padding: 8px 12px !important;
                border-radius: 4px !important;
                min-height: 36px !important;
            }
            
            .view-mode-btn:hover {
                background: rgba(255, 255, 255, 0.5) !important;
                color: #374151 !important;
            }
            
            .view-mode-btn.active {
                background: white !important;
                color: #1f2937 !important;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
                transform: none !important;
            }
            
            .action-group {
                display: flex;
                gap: 8px;
            }
            
            /* ===== FILTRES DE CATÉGORIES UNIFIÉS ===== */
            .unified-category-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 16px;
                padding: 0;
            }
            
            .unified-filter-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                white-space: nowrap;
                min-height: 40px;
                box-sizing: border-box;
            }
            
            .unified-filter-btn:hover {
                border-color: var(--category-color, #3b82f6);
                background: color-mix(in srgb, var(--category-color, #3b82f6) 8%, white);
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .unified-filter-btn.active {
                background: var(--category-color, #3b82f6);
                color: white;
                border-color: var(--category-color, #3b82f6);
                box-shadow: 0 2px 6px color-mix(in srgb, var(--category-color, #3b82f6) 25%, transparent);
            }
            
            .filter-icon {
                font-size: 16px;
            }
            
            .filter-label {
                font-weight: 600;
            }
            
            .filter-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
            }
            
            .unified-filter-btn.active .filter-count {
                background: rgba(255, 255, 255, 0.25);
            }
            
            /* ===== ZONE DE CONTENU ===== */
            .emails-content-area {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                min-height: 400px;
            }
            
            /* ===== LISTE D'EMAILS UNIFIÉE ===== */
            .unified-emails-list {
                display: flex;
                flex-direction: column;
            }
            
            .unified-email-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 60px;
                max-height: 60px;
                overflow: hidden;
            }
            
            .unified-email-item:last-child {
                border-bottom: none;
            }
            
            .unified-email-item:hover {
                background: #f9fafb;
            }
            
            .unified-email-item.selected {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
            }
            
            .unified-email-item.has-task {
                background: #f0fdf4;
                border-left: 4px solid #10b981;
            }
            
            /* ===== ÉLÉMENTS D'EMAIL ===== */
            .email-checkbox-wrapper {
                flex-shrink: 0;
            }
            
            .email-checkbox {
                width: 16px;
                height: 16px;
                cursor: pointer;
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
                flex-shrink: 0;
            }
            
            .email-main-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }
            
            .email-sender {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            
            .sender-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sender-domain {
                font-size: 13px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 2px 8px;
                border-radius: 4px;
                white-space: nowrap;
            }
            
            .email-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .email-deadline {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                font-weight: 600;
                padding: 3px 8px;
                border-radius: 4px;
                white-space: nowrap;
            }
            
            .email-deadline.normal {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .email-deadline.soon {
                background: #fef3c7;
                color: #d97706;
            }
            
            .email-deadline.today {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .email-deadline.overdue {
                background: #dc2626;
                color: white;
                animation: pulse 2s infinite;
            }
            
            .email-date {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .email-subject {
                font-size: 15px;
                font-weight: 600;
                color: #374151;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
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
            
            .email-tags {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            /* Indicateurs compacts */
            .attachment-indicator,
            .ai-indicator {
                display: flex;
                align-items: center;
                font-size: 11px;
                color: #6b7280;
                padding: 2px;
            }
            
            .ai-indicator {
                color: #3b82f6;
            }
            
            .attachment-indicator {
                color: #f59e0b;
            }
            
            /* ===== ACTIONS D'EMAIL COMPACTES ===== */
            .email-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }
            
            .action-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .action-btn:hover {
                background: #f9fafb;
                border-color: #d1d5db;
                transform: translateY(-1px);
            }
            
            .action-btn.task-created {
                background: #dcfce7;
                color: #16a34a;
                border-color: #16a34a;
            }
            
            .action-btn.task-created:hover {
                background: #16a34a;
                color: white;
            }
            
            .action-btn.create-task:hover {
                background: #dbeafe;
                color: #2563eb;
                border-color: #2563eb;
            }
            
            .action-btn.view-email:hover {
                background: #f3f4f6;
                color: #374151;
                border-color: #9ca3af;
            }
            
            /* ===== VUE GROUPÉE ===== */
            .grouped-emails-container {
                display: flex;
                flex-direction: column;
            }
            
            .email-group {
                border-bottom: 1px solid #f3f4f6;
            }
            
            .email-group:last-child {
                border-bottom: none;
            }
            
            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: #f9fafb;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .group-header:hover {
                background: #f3f4f6;
            }
            
            .email-group.expanded .group-header {
                background: #eff6ff;
                border-bottom-color: #bfdbfe;
            }
            
            .group-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .group-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .group-details {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .group-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
            }
            
            .group-stats {
                font-size: 13px;
                color: #6b7280;
            }
            
            .group-meta {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .group-date {
                font-size: 13px;
                color: #6b7280;
            }
            
            .group-toggle-icon {
                color: #9ca3af;
                transition: transform 0.2s ease;
            }
            
            .email-group.expanded .group-toggle-icon {
                transform: rotate(180deg);
            }
            
            .group-emails {
                background: white;
            }
            
            /* ===== STATISTIQUES ===== */
            .email-stats-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                background: #f9fafb;
                border-top: 1px solid #f3f4f6;
                margin-top: 16px;
            }
            
            .stats-group {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                color: #6b7280;
            }
            
            .stats-actions {
                display: flex;
                gap: 8px;
            }
            
            .stats-action-btn {
                width: 32px;
                height: 32px;
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
            
            .stats-action-btn:hover {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            /* ===== ÉTAT VIDE ===== */
            .empty-state-modern {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #d1d5db;
            }
            
            .empty-state-title {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .empty-state-text {
                font-size: 14px;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 1024px) {
                .toolbar-main-line {
                    flex-wrap: wrap;
                    gap: 12px;
                }
                
                .toolbar-left {
                    order: 1;
                    width: 100%;
                    justify-content: space-between;
                }
                
                .toolbar-center {
                    order: 2;
                    width: 100%;
                    max-width: none;
                }
                
                .toolbar-right {
                    order: 3;
                    width: 100%;
                    justify-content: flex-end;
                }
                
                .toolbar-view-line {
                    order: 4;
                }
                
                .page-explanation {
                    font-size: 11px;
                }
                
                .btn-text {
                    display: none;
                }
            }
            
            @media (max-width: 768px) {
                .emails-unified-toolbar {
                    padding: 12px 16px;
                    gap: 8px;
                }
                
                .toolbar-main-line {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .toolbar-section {
                    width: 100%;
                    justify-content: center;
                }
                
                .toolbar-left {
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }
                
                .page-explanation {
                    display: none;
                }
                
                .view-mode-group {
                    width: 100%;
                    justify-content: space-evenly;
                }
                
                .unified-category-filters {
                    gap: 4px;
                    justify-content: center;
                }
                
                .unified-filter-btn {
                    padding: 6px 8px;
                    font-size: 12px;
                }
                
                .filter-label {
                    display: none;
                }
                
                .unified-email-item {
                    padding: 6px 12px;
                    gap: 8px;
                    min-height: 44px;
                    max-height: 44px;
                }
                
                .sender-avatar {
                    width: 28px;
                    height: 28px;
                    font-size: 12px;
                }
                
                .email-sender {
                    min-width: 100px;
                }
                
                .sender-name {
                    max-width: 80px;
                    font-size: 12px;
                }
                
                .email-subject {
                    font-size: 12px;
                }
                
                .email-meta {
                    gap: 4px;
                }
                
                .action-btn {
                    width: 20px;
                    height: 20px;
                    font-size: 9px;
                }
            }
            
            /* ===== ANIMATIONS ===== */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            /* ===== UTILITAIRES ===== */
            .btn-text {
                font-weight: 600;
            }
            
            /* Support pour color-mix si non supporté */
            @supports not (color: color-mix(in srgb, red, blue)) {
                .unified-filter-btn:hover {
                    background: rgba(59, 130, 246, 0.08);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // =====================================
    // AUTRES MÉTHODES (inchangées)
    // =====================================
    
    // Garder toutes les autres méthodes existantes...
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
            let groupKey;
            let groupName;
            let groupAvatar;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
                groupAvatar = domain.charAt(0).toUpperCase();
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
                groupAvatar = senderName.charAt(0).toUpperCase();
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    avatar: groupAvatar,
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

    // Méthodes utilitaires existantes...
    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        try {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                return `Échue il y a ${Math.abs(diffDays)}j`;
            } else if (diffDays === 0) {
                return 'Aujourd\'hui';
            } else if (diffDays === 1) {
                return 'Demain';
            } else if (diffDays <= 7) {
                return `${diffDays}j`;
            } else {
                return deadlineDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                });
            }
        } catch (error) {
            return deadline;
        }
    }

    getCategoryInfo(categoryId) {
        if (categoryId === 'other') {
            return { name: 'Autre', icon: '📌', color: '#6B7280' };
        }
        
        const category = window.categoryManager?.getCategory(categoryId);
        if (category) {
            return {
                name: category.name,
                icon: category.icon,
                color: category.color
            };
        }
        
        return { name: categoryId, icon: '📂', color: '#6B7280' };
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
            
            // Email details
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            
            // AI Analysis
            aiAnalysis: analysis,
            
            // Tags
            tags: [
                senderDomain,
                analysis.importance,
                ...(analysis.tags || [])
            ].filter(Boolean),
            
            method: 'ai'
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
            
            if (emails.length > 0 && window.categoryManager) {
                // Re-categorize emails
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
        
        // Update display
        const emailsList = document.getElementById('emailsList');
        if (emailsList) {
            emailsList.innerHTML = this.renderEmailsList();
            this.setupGroupToggles();
        }
    }

    // =====================================
    // MODAL METHODS (gardées de la version précédente)
    // =====================================
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        // Nettoyer tout modal existant
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Get or create AI analysis
        let analysis;
        try {
            window.uiManager.showLoading('Analyse de l\'email...');
            analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
                useApi: true
            });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager.hideLoading();
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'analyse', 'error');
            return;
        }

        // Créer un nouvel id unique
        const uniqueId = 'task_creation_modal_' + Date.now();

        // Créer le modal avec style inline pour forcer l'affichage
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 900px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Créer une tâche à partir de cet email</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        ${this.buildEnhancedTaskCreationModal(email, analysis)}
                    </div>
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${emailId}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildEnhancedTaskCreationModal(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div class="task-creation-form">
                <div class="ai-suggestion-banner">
                    <i class="fas fa-robot"></i>
                    <span>Analyse intelligente par Claude AI</span>
                </div>
                
                <div class="sender-context-box">
                    <div class="sender-avatar-small">${senderName.charAt(0).toUpperCase()}</div>
                    <div class="sender-details">
                        <div class="sender-name-bold">${senderName}</div>
                        <div class="sender-email-small">${senderEmail}</div>
                        <div class="sender-domain">@${senderDomain}</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Titre de la tâche</label>
                    <input type="text" id="task-title" class="form-input" 
                           value="${enhancedTitle}" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="task-description" class="form-textarea" rows="4">${analysis.mainTask.description || analysis.summary || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="task-priority" class="form-select">
                            <option value="urgent" ${analysis.mainTask.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis.mainTask.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${analysis.mainTask.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis.mainTask.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="task-duedate" class="form-input" 
                               value="${analysis.mainTask.dueDate || ''}" />
                    </div>
                </div>
                
                <div class="email-context-section">
                    <button class="context-toggle-btn" onclick="window.pageManager.toggleEmailContext()">
                        <i class="fas fa-chevron-right" id="context-toggle-icon"></i>
                        <span>Afficher le contenu original de l'email</span>
                    </button>
                    <div class="email-context-content" id="email-context-content" style="display: none;">
                        <div class="context-header">
                            <div class="context-meta">
                                <strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;<br>
                                <strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}<br>
                                <strong>Sujet:</strong> ${email.subject || 'Sans sujet'}
                            </div>
                        </div>
                        <div class="context-body">
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
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
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
            
            // Update email display
            const emailsList = document.getElementById('emailsList');
            if (emailsList) {
                emailsList.innerHTML = this.renderEmailsList();
                this.setupGroupToggles();
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager.showToast('Erreur lors de la création', 'error');
        }
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        // Nettoyer tout modal existant
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Créer un nouvel id unique
        const uniqueId = 'email_modal_' + Date.now();

        // Créer le modal avec style inline pour forcer l'affichage
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Email Complet</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 20px;">
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">De:</span>
                                <span>${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">Date:</span>
                                <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">Sujet:</span>
                                <span>${email.subject || 'Sans sujet'}</span>
                            </div>
                        </div>
                        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu'}</p>`;
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

    // =====================================
    // OTHER PAGES (inchangées)
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
            <div class="page-header">
                <h1>Tableau de bord</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
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
                    <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        Configurer
                    </button>
                </div>
            ` : ''}

            <div class="grid grid-4">
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-tasks',
                    label: 'Tâches totales',
                    value: taskStats.total,
                    color: 'var(--primary)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-clock',
                    label: 'À faire',
                    value: taskStats.byStatus.todo,
                    color: 'var(--info)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-check-circle',
                    label: 'Terminées',
                    value: taskStats.byStatus.completed,
                    color: 'var(--success)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-exclamation-circle',
                    label: 'En retard',
                    value: taskStats.overdue,
                    color: 'var(--danger)'
                })}
            </div>

            ${scanData ? this.renderScanStats(scanData) : this.renderWelcome()}
        `;
    }

    renderWelcome() {
        return `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h2 class="empty-state-title">Bienvenue!</h2>
                    <p class="empty-state-text">
                        Commencez par scanner vos emails pour les organiser automatiquement.
                    </p>
                    <button class="btn btn-primary btn-large" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Démarrer le scan
                    </button>
                </div>
            </div>
        `;
    }

    renderScanStats(scanData) {
        return `
            <div class="card">
                <h3>Résultats du dernier scan</h3>
                <div class="scan-stats">
                    <p>${scanData.total} emails analysés - ${scanData.categorized} catégorisés</p>
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
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-state-title">Scanner d'emails</h3>
                <p class="empty-state-text">Module de scan en cours de chargement...</p>
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
                    <div class="empty-state-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-state-title">Aucune tâche</h3>
                    <p class="empty-state-text">Créez des tâches à partir de vos emails</p>
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
                    <div class="card category-card">
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
                
                <div class="card">
                    <h3>Configuration IA</h3>
                    <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        <i class="fas fa-cog"></i> Configurer Claude AI
                    </button>
                </div>
            `;
        }
    }
}

// Create global instance
window.pageManager = new PageManager();

// Bind methods
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v9.2 loaded - Interface unifiée et cohérente avec design professionnel');
