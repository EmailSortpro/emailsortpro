// PageManager.js - Version 14.0 - COMPLÈTEMENT RÉÉCRIT ET CORRIGÉ 🚀
console.log('[PageManager] 🚀 Loading PageManager.js v14.0 - COMPLETE REWRITE...');

class PageManager {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Cache et optimisation
        this.renderCache = new Map();
        this.domCache = new Map();
        this.performanceMetrics = {
            lastRenderTime: 0,
            lastRefreshTime: 0,
            emailsPerSecond: 0
        };
        
        // Synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.lastSettingsSync = 0;
        this.debounceTimers = new Map();
        
        // Configuration des pages
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 14.0 - Initialisation complète');
        this.setupEventListeners();
        this.startPerformanceMonitoring();
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            this.handleSettingsChanged(event.detail);
        });

        window.addEventListener('settingsChanged', (event) => {
            this.handleSettingsChanged(event.detail);
        });

        // Écouter les changements d'emails
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] 📨 Scan terminé, mise à jour si nécessaire');
            if (this.currentPage === 'emails') {
                this.debounce('refreshEmails', () => this.refreshEmailsView(), 500)();
            }
        });

        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] 🔄 Emails recatégorisés');
            if (this.currentPage === 'emails') {
                this.debounce('refreshEmails', () => this.refreshEmailsView(), 500)();
            }
        });
    }

    startPerformanceMonitoring() {
        // Monitoring léger des performances
        setInterval(() => {
            if (this.performanceMetrics.lastRenderTime > 200) {
                console.warn('[PageManager] ⚠️ Render lent détecté:', this.performanceMetrics.lastRenderTime + 'ms');
            }
        }, 30000);
    }

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES
    // ================================================
    handleSettingsChanged(detail) {
        console.log('[PageManager] 🔧 Changement de paramètres détecté');
        
        // Invalider le cache
        this.invalidateCache();
        
        // Rafraîchir si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.debounce('refreshAfterSettings', () => {
                this.refreshEmailsView();
            }, 300)();
        }
    }

    // ================================================
    // CHARGEMENT DES PAGES
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] 📄 Chargement de la page: ${pageName}`);

        // Ignorer le dashboard qui n'existe plus
        if (pageName === 'dashboard') {
            pageName = 'scanner';
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] ❌ Container pageContent non trouvé');
            return;
        }

        try {
            // Nettoyer la page actuelle
            this.cleanupCurrentPage();
            
            // Afficher le loading
            if (window.uiManager) {
                window.uiManager.showLoading(`Chargement ${pageName}...`);
            }

            // Mettre à jour la navigation
            this.updateNavigation(pageName);
            
            // Render la nouvelle page
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            // Cacher le loading
            if (window.uiManager) {
                window.uiManager.hideLoading();
            }

        } catch (error) {
            console.error(`[PageManager] ❌ Erreur chargement page ${pageName}:`, error);
            
            if (window.uiManager) {
                window.uiManager.hideLoading();
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
            
            // Afficher une page d'erreur
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    cleanupCurrentPage() {
        // Nettoyer les timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        
        // Nettoyer les event listeners spécifiques à la page
        if (this.currentPage === 'emails') {
            this.cleanupEmailsPage();
        }
    }

    cleanupEmailsPage() {
        // Nettoyage spécifique à la page emails
        const container = document.querySelector('.tasks-container-harmonized');
        if (container) {
            container.innerHTML = '';
        }
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    renderErrorPage(error) {
        return `
            <div class="error-container">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Erreur de chargement</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    Retour au scanner
                </button>
            </div>
        `;
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS - CORRIGÉ
    // ================================================
    async renderEmails(container) {
        console.log('[PageManager] 📧 Rendu de la page emails...');
        const startTime = performance.now();
        
        try {
            // Récupérer les emails de manière sécurisée
            let emails = [];
            if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
                emails = window.emailScanner.getAllEmails();
            }
            
            // Vérifier que c'est bien un tableau
            if (!Array.isArray(emails)) {
                console.warn('[PageManager] ⚠️ getAllEmails n\'a pas retourné un tableau:', emails);
                emails = [];
            }
            
            console.log(`[PageManager] 📊 ${emails.length} emails trouvés`);
            
            // Si aucun email, afficher l'état vide
            if (emails.length === 0) {
                container.innerHTML = this.renderEmptyEmailsState();
                return;
            }
            
            // Calculer les statistiques
            const categoryCounts = this.calculateCategoryCounts(emails);
            const selectedCount = this.selectedEmails.size;
            
            // Render la page complète
            container.innerHTML = `
                <div class="emails-page">
                    ${this.renderExplanation()}
                    ${this.renderControlsBar(selectedCount)}
                    ${this.renderCategoryFilters(categoryCounts, emails.length)}
                    <div class="emails-container">
                        ${this.renderEmailsList(emails)}
                    </div>
                </div>
            `;
            
            // Setup les event listeners
            this.setupEmailsEventListeners();
            
            // Ajouter les styles
            this.addEmailsStyles();
            
            const renderTime = performance.now() - startTime;
            this.performanceMetrics.lastRenderTime = renderTime;
            console.log(`[PageManager] ✅ Page emails rendue en ${renderTime.toFixed(2)}ms`);
            
            // Auto-analyse si activée
            if (this.autoAnalyzeEnabled && emails.length > 0) {
                this.scheduleAutoAnalysis(emails);
            }
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur lors du rendu des emails:', error);
            container.innerHTML = this.renderErrorPage(error);
        }
    }

    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3>Aucun email trouvé</h3>
                <p>Utilisez le scanner pour récupérer et analyser vos emails.</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            </div>
        `;
    }

    renderExplanation() {
        if (this.hideExplanation) return '';
        
        return `
            <div class="explanation-bar">
                <i class="fas fa-info-circle"></i>
                <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour créer des tâches.</span>
                <button class="close-btn" onclick="window.pageManager.hideExplanationMessage()">
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
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               id="emailSearchInput"
                               class="search-input" 
                               placeholder="Rechercher dans vos emails..." 
                               value="${this.escapeHtml(this.searchTerm)}">
                        ${this.searchTerm ? `
                            <button class="clear-search" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="actions-section">
                    ${this.renderViewModes()}
                    
                    <div class="separator"></div>
                    
                    <button class="btn btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                            onclick="window.pageManager.createTasksFromSelection()"
                            ${selectedCount === 0 ? 'disabled' : ''}>
                        <i class="fas fa-tasks"></i>
                        Créer tâche${selectedCount > 1 ? 's' : ''}
                        ${selectedCount > 0 ? `<span class="badge">${selectedCount}</span>` : ''}
                    </button>
                    
                    <button class="btn btn-secondary" onclick="window.pageManager.refreshEmails()">
                        <i class="fas fa-sync-alt"></i>
                        Actualiser
                    </button>
                    
                    ${selectedCount > 0 ? `
                        <button class="btn btn-ghost" onclick="window.pageManager.clearSelection()">
                            <i class="fas fa-times"></i>
                            Effacer sélection
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderViewModes() {
        return `
            <div class="view-modes">
                <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-domain')"
                        title="Grouper par domaine">
                    <i class="fas fa-globe"></i>
                </button>
                <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-sender')"
                        title="Grouper par expéditeur">
                    <i class="fas fa-user"></i>
                </button>
                <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('flat')"
                        title="Vue liste">
                    <i class="fas fa-list"></i>
                </button>
            </div>
        `;
    }

    renderCategoryFilters(categoryCounts, totalEmails) {
        const categories = window.categoryManager?.getCategories() || {};
        const taskPreselectedCategories = this.getTaskPreselectedCategories();
        
        let filtersHtml = `
            <button class="category-filter ${!this.currentCategory ? 'active' : ''}" 
                    onclick="window.pageManager.filterByCategory(null)">
                <span class="icon">📧</span>
                <span class="name">Tous</span>
                <span class="count">${totalEmails}</span>
            </button>
        `;
        
        // Ajouter les catégories avec des emails
        for (const [categoryId, category] of Object.entries(categories)) {
            const count = categoryCounts[categoryId] || 0;
            if (count > 0) {
                const isPreselected = taskPreselectedCategories.includes(categoryId);
                filtersHtml += `
                    <button class="category-filter ${this.currentCategory === categoryId ? 'active' : ''} ${isPreselected ? 'preselected' : ''}" 
                            onclick="window.pageManager.filterByCategory('${categoryId}')">
                        <span class="icon">${category.icon}</span>
                        <span class="name">${category.name}</span>
                        <span class="count">${count}</span>
                        ${isPreselected ? '<span class="star">⭐</span>' : ''}
                    </button>
                `;
            }
        }
        
        // Ajouter "Autre" si nécessaire
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            filtersHtml += `
                <button class="category-filter ${this.currentCategory === 'other' ? 'active' : ''}" 
                        onclick="window.pageManager.filterByCategory('other')">
                    <span class="icon">📌</span>
                    <span class="name">Autre</span>
                    <span class="count">${otherCount}</span>
                </button>
            `;
        }
        
        return `<div class="category-filters">${filtersHtml}</div>`;
    }

    renderEmailsList(emails) {
        const filteredEmails = this.getFilteredEmails(emails);
        
        if (filteredEmails.length === 0) {
            return this.renderEmptySearchState();
        }
        
        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(filteredEmails);
            case 'grouped-domain':
                return this.renderGroupedView(filteredEmails, 'domain');
            case 'grouped-sender':
                return this.renderGroupedView(filteredEmails, 'sender');
            default:
                return this.renderFlatView(filteredEmails);
        }
    }

    renderFlatView(emails) {
        const emailsHtml = emails.map(email => this.renderEmailCard(email)).join('');
        return `<div class="emails-list">${emailsHtml}</div>`;
    }

    renderGroupedView(emails, groupBy) {
        const groups = this.groupEmails(emails, groupBy);
        let html = '<div class="emails-groups">';
        
        for (const [groupKey, groupEmails] of Object.entries(groups)) {
            const isExpanded = true; // Par défaut ouvert
            html += `
                <div class="email-group ${isExpanded ? 'expanded' : ''}" data-group-key="${groupKey}">
                    <div class="group-header" onclick="window.pageManager.toggleGroup('${groupKey}')">
                        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                        <span class="group-name">${groupKey}</span>
                        <span class="group-count">${groupEmails.length}</span>
                    </div>
                    <div class="group-content" style="display: ${isExpanded ? 'block' : 'none'}">
                        ${groupEmails.map(email => this.renderEmailCard(email)).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const isPreselected = email.isPreselectedForTasks === true;
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselected ? 'preselected' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation()"
                       onchange="window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="email-content">
                    <div class="email-header">
                        <h4 class="email-subject">${this.escapeHtml(email.subject || 'Sans sujet')}</h4>
                        <div class="email-meta">
                            <span class="email-date">${this.formatDate(email.receivedDateTime)}</span>
                            ${email.hasAttachments ? '<i class="fas fa-paperclip" title="Pièce jointe"></i>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-from">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHtml(senderName)}</span>
                        ${this.renderCategoryBadge(email)}
                    </div>
                    
                    ${email.bodyPreview ? `
                        <div class="email-preview">${this.escapeHtml(email.bodyPreview)}</div>
                    ` : ''}
                </div>
                
                <div class="email-actions">
                    ${hasTask ? `
                        <button class="action-btn success" 
                                onclick="event.stopPropagation(); window.pageManager.viewTask('${email.id}')"
                                title="Voir la tâche">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : `
                        <button class="action-btn primary" 
                                onclick="event.stopPropagation(); window.pageManager.createTaskFromEmail('${email.id}')"
                                title="Créer une tâche">
                            <i class="fas fa-plus"></i>
                        </button>
                    `}
                    <button class="action-btn secondary" 
                            onclick="event.stopPropagation(); window.pageManager.showEmailDetails('${email.id}')"
                            title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryBadge(email) {
        if (!email.category || email.category === 'other') {
            return '<span class="category-badge other">Non catégorisé</span>';
        }
        
        const category = window.categoryManager?.getCategory(email.category);
        if (!category) return '';
        
        const color = category.color || '#64748b';
        return `
            <span class="category-badge" style="background: ${color}20; color: ${color}">
                ${category.icon} ${category.name}
            </span>
        `;
    }

    renderEmptySearchState() {
        if (this.searchTerm) {
            return `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Aucun résultat</h3>
                    <p>Aucun email ne correspond à votre recherche "${this.escapeHtml(this.searchTerm)}"</p>
                    <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                        Effacer la recherche
                    </button>
                </div>
            `;
        } else if (this.currentCategory) {
            const category = window.categoryManager?.getCategory(this.currentCategory);
            return `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Aucun email dans cette catégorie</h3>
                    <p>La catégorie "${category?.name || this.currentCategory}" ne contient aucun email</p>
                    <button class="btn btn-primary" onclick="window.pageManager.filterByCategory(null)">
                        Voir tous les emails
                    </button>
                </div>
            `;
        }
        
        return this.renderEmptyEmailsState();
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    calculateCategoryCounts(emails) {
        const counts = {};
        
        if (!Array.isArray(emails)) {
            console.warn('[PageManager] calculateCategoryCounts: emails n\'est pas un tableau');
            return counts;
        }
        
        emails.forEach(email => {
            const category = email.category || 'other';
            counts[category] = (counts[category] || 0) + 1;
        });
        
        return counts;
    }

    getFilteredEmails(emails) {
        if (!Array.isArray(emails)) {
            console.warn('[PageManager] getFilteredEmails: emails n\'est pas un tableau');
            return [];
        }
        
        let filtered = emails;
        
        // Filtrer par catégorie
        if (this.currentCategory) {
            filtered = filtered.filter(email => {
                if (this.currentCategory === 'other') {
                    return !email.category || email.category === 'other';
                }
                return email.category === this.currentCategory;
            });
        }
        
        // Filtrer par recherche
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(email => {
                const subject = (email.subject || '').toLowerCase();
                const from = (email.from?.emailAddress?.name || '').toLowerCase();
                const fromEmail = (email.from?.emailAddress?.address || '').toLowerCase();
                const preview = (email.bodyPreview || '').toLowerCase();
                
                return subject.includes(searchLower) ||
                       from.includes(searchLower) ||
                       fromEmail.includes(searchLower) ||
                       preview.includes(searchLower);
            });
        }
        
        return filtered;
    }

    groupEmails(emails, groupBy) {
        const groups = {};
        
        emails.forEach(email => {
            let key;
            if (groupBy === 'domain') {
                const emailAddress = email.from?.emailAddress?.address || '';
                key = emailAddress.split('@')[1] || 'Inconnu';
            } else if (groupBy === 'sender') {
                key = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
            }
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(email);
        });
        
        return groups;
    }

    getTaskPreselectedCategories() {
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch {
            return [];
        }
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEmailsEventListeners() {
        // Recherche
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce('search', () => {
                    this.searchTerm = e.target.value;
                    this.refreshEmailsView();
                }, 300)();
            });
        }
    }

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox' || event.target.closest('.email-actions')) {
            return;
        }
        
        this.showEmailDetails(emailId);
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        this.updateControlsBar();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.refreshEmailsView();
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const isExpanded = group.classList.contains('expanded');
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-header i');
        
        if (isExpanded) {
            group.classList.remove('expanded');
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            group.classList.add('expanded');
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }

    // ================================================
    // ACTIONS SUR LES EMAILS
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        const emailIds = Array.from(this.selectedEmails);
        window.uiManager?.showLoading(`Création de ${emailIds.length} tâches...`);
        
        let created = 0;
        
        for (const emailId of emailIds) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                const task = await this.createTaskFromEmailData(email);
                if (task) {
                    created++;
                    this.createdTasks.set(emailId, task.id);
                }
            } catch (error) {
                console.error('[PageManager] Erreur création tâche:', error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        }
    }

    async createTaskFromEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        window.uiManager?.showLoading('Création de la tâche...');
        
        try {
            const task = await this.createTaskFromEmailData(email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                this.refreshEmailsView();
                window.uiManager?.showToast('Tâche créée avec succès', 'success');
            }
        } catch (error) {
            console.error('[PageManager] Erreur création tâche:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    async createTaskFromEmailData(email) {
        // Analyser l'email si nécessaire
        let analysis = this.aiAnalysisResults.get(email.id);
        
        if (!analysis && window.aiTaskAnalyzer) {
            try {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(email.id, analysis);
            } catch (error) {
                console.error('[PageManager] Erreur analyse IA:', error);
            }
        }
        
        // Créer la tâche
        if (window.taskManager) {
            const taskData = {
                title: analysis?.mainTask?.title || email.subject || 'Email sans titre',
                description: analysis?.mainTask?.description || email.bodyPreview || '',
                priority: analysis?.mainTask?.priority || 'medium',
                dueDate: analysis?.mainTask?.dueDate || null,
                emailId: email.id,
                emailFrom: email.from?.emailAddress?.address,
                emailSubject: email.subject,
                category: email.category
            };
            
            return window.taskManager.createTask(taskData);
        }
        
        return null;
    }

    showEmailDetails(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Afficher une modal avec les détails
        console.log('[PageManager] Affichage détails email:', emailId);
        // TODO: Implémenter la modal de détails
    }

    viewTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        // Naviguer vers la page des tâches
        this.loadPage('tasks').then(() => {
            // TODO: Ouvrir la tâche spécifique
            console.log('[PageManager] Ouverture tâche:', taskId);
        });
    }

    // ================================================
    // RAFRAÎCHISSEMENT
    // ================================================
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            // Forcer la recatégorisation si EmailScanner est disponible
            if (window.emailScanner && typeof window.emailScanner.recategorizeEmails === 'function') {
                await window.emailScanner.recategorizeEmails();
            }
            
            // Recharger la page
            await this.loadPage('emails');
            
            window.uiManager?.showToast('Emails actualisés', 'success');
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    refreshEmailsView() {
        const container = document.querySelector('.emails-container');
        if (!container) return;
        
        // Récupérer les emails de manière sécurisée
        let emails = [];
        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            emails = window.emailScanner.getAllEmails();
        }
        
        // Vérifier que c'est bien un tableau
        if (!Array.isArray(emails)) {
            console.warn('[PageManager] refreshEmailsView: emails n\'est pas un tableau');
            emails = [];
        }
        
        // Mettre à jour le contenu
        container.innerHTML = this.renderEmailsList(emails);
        
        // Mettre à jour les contrôles
        this.updateControlsBar();
        this.updateCategoryFilters(emails);
    }

    updateControlsBar() {
        const selectedCount = this.selectedEmails.size;
        const controlsBar = document.querySelector('.controls-bar');
        
        if (controlsBar) {
            const actionsSection = controlsBar.querySelector('.actions-section');
            if (actionsSection) {
                // Remplacer uniquement la section actions
                const searchSection = controlsBar.querySelector('.search-section');
                controlsBar.innerHTML = searchSection.outerHTML + `
                    <div class="actions-section">
                        ${this.renderViewModes()}
                        <div class="separator"></div>
                        <button class="btn btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.createTasksFromSelection()"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            Créer tâche${selectedCount > 1 ? 's' : ''}
                            ${selectedCount > 0 ? `<span class="badge">${selectedCount}</span>` : ''}
                        </button>
                        <button class="btn btn-secondary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            Actualiser
                        </button>
                        ${selectedCount > 0 ? `
                            <button class="btn btn-ghost" onclick="window.pageManager.clearSelection()">
                                <i class="fas fa-times"></i>
                                Effacer sélection
                            </button>
                        ` : ''}
                    </div>
                `;
            }
        }
    }

    updateCategoryFilters(emails) {
        const filtersContainer = document.querySelector('.category-filters');
        if (!filtersContainer) return;
        
        const categoryCounts = this.calculateCategoryCounts(emails);
        filtersContainer.outerHTML = this.renderCategoryFilters(categoryCounts, emails.length);
    }

    // ================================================
    // AUTRES PAGES
    // ================================================
    async renderScanner(container) {
        if (window.scanStartModule?.render) {
            await window.scanStartModule.render(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Scanner d'emails</h3>
                    <p>Module en cours de chargement...</p>
                </div>
            `;
        }
    }

    async renderTasks(container) {
        if (window.tasksView?.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>Mes tâches</h3>
                    <p>Aucune tâche pour le moment</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        if (window.categoriesPage?.render) {
            window.categoriesPage.render(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Catégories</h3>
                    <p>Module en cours de chargement...</p>
                </div>
            `;
        }
    }

    async renderSettings(container) {
        if (window.categoriesPage?.renderSettings) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cog"></i>
                    <h3>Paramètres</h3>
                    <p>Module en cours de chargement...</p>
                </div>
            `;
        }
    }

    async renderRanger(container) {
        if (window.domainOrganizer?.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-tree"></i>
                    <h3>Ranger par domaine</h3>
                    <p>Module en cours de chargement...</p>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getEmailById(emailId) {
        if (window.emailScanner && typeof window.emailScanner.getEmailById === 'function') {
            return window.emailScanner.getEmailById(emailId);
        }
        return null;
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    scheduleAutoAnalysis(emails) {
        // Analyser les premiers emails pré-sélectionnés
        const preselectedEmails = emails
            .filter(email => email.isPreselectedForTasks)
            .slice(0, 3);
        
        if (preselectedEmails.length > 0 && window.aiTaskAnalyzer) {
            setTimeout(async () => {
                for (const email of preselectedEmails) {
                    if (!this.aiAnalysisResults.has(email.id)) {
                        try {
                            const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                            this.aiAnalysisResults.set(email.id, analysis);
                        } catch (error) {
                            console.error('[PageManager] Erreur analyse automatique:', error);
                        }
                    }
                }
            }, 1000);
        }
    }

    debounce(key, func, delay) {
        const existingTimer = this.debounceTimers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Moins d'une heure
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `il y a ${minutes} min`;
        }
        
        // Moins d'un jour
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `il y a ${hours}h`;
        }
        
        // Moins d'une semaine
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `il y a ${days}j`;
        }
        
        // Plus d'une semaine
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    invalidateCache() {
        this.renderCache.clear();
        this.domCache.clear();
    }

    // ================================================
    // STYLES
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('pageManagerStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerStyles';
        styles.textContent = `
            /* Page Manager Styles v14.0 */
            .emails-page {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .empty-state, .error-container {
                text-align: center;
                padding: 60px 20px;
                color: #64748b;
            }
            
            .empty-state .empty-icon, .error-container .error-icon {
                font-size: 48px;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            
            .empty-state h3, .error-container h2 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #1e293b;
            }
            
            .empty-state p, .error-container p {
                margin-bottom: 20px;
                font-size: 16px;
            }
            
            /* Explanation Bar */
            .explanation-bar {
                background: #eff6ff;
                border: 1px solid #dbeafe;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                color: #1e40af;
            }
            
            .explanation-bar .close-btn {
                margin-left: auto;
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .explanation-bar .close-btn:hover {
                background: #dbeafe;
                color: #1e40af;
            }
            
            /* Controls Bar */
            .controls-bar {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                gap: 20px;
                align-items: center;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .search-section {
                flex: 1;
            }
            
            .search-box {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-box i {
                position: absolute;
                left: 16px;
                color: #64748b;
                pointer-events: none;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 16px 10px 44px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .clear-search {
                position: absolute;
                right: 8px;
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                padding: 6px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .clear-search:hover {
                background: #f3f4f6;
                color: #1e293b;
            }
            
            .actions-section {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .separator {
                width: 1px;
                height: 24px;
                background: #e5e7eb;
            }
            
            /* View Modes */
            .view-modes {
                display: flex;
                background: #f3f4f6;
                border-radius: 6px;
                padding: 2px;
                gap: 2px;
            }
            
            .view-mode {
                background: none;
                border: none;
                padding: 6px 10px;
                border-radius: 4px;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .view-mode:hover {
                background: white;
                color: #1e293b;
            }
            
            .view-mode.active {
                background: white;
                color: #3b82f6;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Buttons */
            .btn {
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }
            
            .btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover:not(.disabled) {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-secondary {
                background: white;
                color: #475569;
                border: 1px solid #e5e7eb;
            }
            
            .btn-secondary:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
            }
            
            .btn-ghost {
                background: none;
                color: #64748b;
                border: none;
            }
            
            .btn-ghost:hover {
                background: #f3f4f6;
                color: #1e293b;
            }
            
            .btn .badge {
                background: white;
                color: #3b82f6;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 4px;
            }
            
            /* Category Filters */
            .category-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .category-filter {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                position: relative;
            }
            
            .category-filter:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            .category-filter.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .category-filter.preselected {
                border-color: #8b5cf6;
                background: #faf5ff;
            }
            
            .category-filter .icon {
                font-size: 16px;
            }
            
            .category-filter .count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .category-filter.active .count {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .category-filter .star {
                position: absolute;
                top: -8px;
                right: -8px;
                font-size: 12px;
            }
            
            /* Emails Container */
            .emails-container {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
            }
            
            /* Email Card */
            .email-card {
                padding: 16px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .email-card:hover {
                background: #f8fafc;
            }
            
            .email-card.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
                padding-left: 13px;
            }
            
            .email-card.has-task {
                opacity: 0.7;
            }
            
            .email-card.preselected {
                border-left: 3px solid #8b5cf6;
                padding-left: 13px;
            }
            
            .email-checkbox {
                width: 18px;
                height: 18px;
                flex-shrink: 0;
                cursor: pointer;
            }
            
            .email-content {
                flex: 1;
                min-width: 0;
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .email-subject {
                font-size: 15px;
                font-weight: 500;
                margin: 0;
                color: #1e293b;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }
            
            .email-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #64748b;
                flex-shrink: 0;
            }
            
            .email-from {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                color: #64748b;
                margin-bottom: 6px;
            }
            
            .email-preview {
                font-size: 13px;
                color: #64748b;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 600px;
            }
            
            .category-badge {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                margin-left: auto;
            }
            
            .category-badge.other {
                background: #f3f4f6;
                color: #64748b;
            }
            
            .email-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .action-btn {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 6px 10px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }
            
            .action-btn:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            .action-btn.primary {
                color: #3b82f6;
                border-color: #3b82f6;
            }
            
            .action-btn.primary:hover {
                background: #eff6ff;
            }
            
            .action-btn.success {
                color: #10b981;
                border-color: #10b981;
            }
            
            .action-btn.success:hover {
                background: #ecfdf5;
            }
            
            .action-btn.secondary {
                color: #64748b;
            }
            
            /* Email Groups */
            .emails-groups {
                background: white;
            }
            
            .email-group {
                border-bottom: 1px solid #e5e7eb;
            }
            
            .group-header {
                padding: 12px 16px;
                background: #f8fafc;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .group-header:hover {
                background: #f3f4f6;
            }
            
            .group-header i {
                color: #64748b;
                transition: transform 0.2s;
            }
            
            .email-group.expanded .group-header i {
                transform: rotate(180deg);
            }
            
            .group-name {
                flex: 1;
                color: #1e293b;
            }
            
            .group-count {
                background: #e5e7eb;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                color: #64748b;
            }
            
            .group-content {
                border-top: 1px solid #f3f4f6;
            }
        `;
        document.head.appendChild(styles);
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        // Nettoyer les timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        
        // Nettoyer les caches
        this.renderCache.clear();
        this.domCache.clear();
        
        // Reset des données
        this.selectedEmails.clear();
        this.createdTasks.clear();
        this.aiAnalysisResults.clear();
        
        console.log('[PageManager] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        console.log('[PageManager] Instance détruite');
    }
}

// ================================================
// INITIALISATION
// ================================================
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.pageManager.destroy();
    } catch (error) {
        console.warn('[PageManager] Erreur lors du nettoyage:', error);
    }
}

console.log('[PageManager] 🚀 Création nouvelle instance v14.0...');
window.pageManager = new PageManager();

// Exposer les méthodes globalement pour les onclick
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v14.0 loaded - Complètement réécrit et corrigé!');
