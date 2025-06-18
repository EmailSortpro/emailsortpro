// PageManager.js - Version 17.0 - AFFICHAGE NEWSLETTER AMÉLIORÉ 🚀
console.log('[PageManager] 🚀 Loading PageManager.js v17.0 - NEWSLETTER DISPLAY ENHANCED...');

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
        
        // Modal states
        this.currentModal = null;
        this.editingEmailId = null;
        
        // Newsletter tracking
        this.newsletterStats = {
            total: 0,
            displayed: 0,
            lastUpdate: null
        };
        
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
        console.log('[PageManager] ✅ Version 17.0 - Affichage newsletter amélioré');
        this.setupEventListeners();
        this.startPerformanceMonitoring();
    }

    // ================================================
    // MÉTHODE DEBOUNCE CORRIGÉE
    // ================================================
    debounce(key, func, delay) {
        return () => {
            const existingTimer = this.debounceTimers.get(key);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            
            const timer = setTimeout(() => {
                func();
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
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
            // Mettre à jour les stats newsletter
            if (event.detail?.newsletterCount !== undefined) {
                this.newsletterStats.total = event.detail.newsletterCount;
                this.newsletterStats.lastUpdate = Date.now();
            }
            if (this.currentPage === 'emails') {
                this.debounce('refreshEmails', () => this.refreshEmailsView(), 500)();
            }
        });

        // Fermer les modales avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
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
        
        // Nettoyer les modales
        this.closeModal();
        
        // Nettoyer les event listeners spécifiques à la page
        if (this.currentPage === 'emails') {
            this.cleanupEmailsPage();
        }
    }

    cleanupEmailsPage() {
        // Nettoyage spécifique à la page emails
        const container = document.querySelector('.tasks-container-modern');
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
            <div class="error-container-modern">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Erreur de chargement</h2>
                <p>${error.message}</p>
                <button class="btn-modern btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-arrow-left"></i>
                    Retour au scanner
                </button>
            </div>
        `;
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS - STYLE MODERNE AVEC NEWSLETTER
    // ================================================
    async renderEmails(container) {
        console.log('[PageManager] 📧 Rendu de la page emails moderne...');
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
            
            // Compter les newsletters
            const newsletterCount = emails.filter(email => email.category === 'marketing_news' || email.isNewsletter).length;
            this.newsletterStats.total = newsletterCount;
            this.newsletterStats.lastUpdate = Date.now();
            console.log(`[PageManager] 📰 ${newsletterCount} newsletters détectées`);
            
            // Si aucun email, afficher l'état vide
            if (emails.length === 0) {
                container.innerHTML = this.renderEmptyEmailsState();
                return;
            }
            
            // Calculer les statistiques
            const categoryCounts = this.calculateCategoryCounts(emails);
            const selectedCount = this.selectedEmails.size;
            
            // Render la page complète avec style moderne
            container.innerHTML = `
                <div class="emails-page-modern">
                    ${this.renderExplanationModern()}
                    ${this.renderControlsBarModern(selectedCount, emails.length)}
                    ${this.renderCategoryFiltersModern(categoryCounts, emails.length)}
                    ${this.renderNewsletterBanner()}
                    <div class="emails-container-modern">
                        ${this.renderEmailsListModern(emails)}
                    </div>
                </div>
            `;
            
            // Setup les event listeners
            this.setupEmailsEventListeners();
            
            // Ajouter les styles modernes
            this.addModernEmailsStyles();
            
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
            <div class="empty-state-modern">
                <div class="empty-icon-modern">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3>Aucun email trouvé</h3>
                <p>Utilisez le scanner pour récupérer et analyser vos emails</p>
                <button class="btn-modern btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Scanner des emails
                </button>
            </div>
        `;
    }

    renderExplanationModern() {
        if (this.hideExplanation) return '';
        
        return `
            <div class="explanation-modern">
                <div class="explanation-content">
                    <i class="fas fa-lightbulb"></i>
                    <span>Cliquez sur un email pour voir les détails et la tâche suggérée. Sélectionnez plusieurs emails pour créer des tâches en masse.</span>
                </div>
                <button class="explanation-close" onclick="window.pageManager.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    // NOUVEAU: Bannière d'information newsletter
    renderNewsletterBanner() {
        if (this.newsletterStats.total === 0) return '';
        
        return `
            <div class="newsletter-banner-modern">
                <div class="newsletter-info">
                    <i class="fas fa-newspaper"></i>
                    <span><strong>${this.newsletterStats.total}</strong> newsletters détectées</span>
                </div>
                <div class="newsletter-actions">
                    <button class="btn-modern btn-sm btn-secondary" onclick="window.pageManager.filterByCategory('marketing_news')">
                        <i class="fas fa-filter"></i>
                        Voir les newsletters
                    </button>
                    <button class="btn-modern btn-sm btn-ghost" onclick="window.pageManager.selectAllNewsletters()">
                        <i class="fas fa-check-square"></i>
                        Sélectionner toutes
                    </button>
                </div>
            </div>
        `;
    }

    renderControlsBarModern(selectedCount, totalCount) {
        return `
            <div class="controls-bar-modern">
                <!-- Ligne de recherche -->
                <div class="search-line-modern">
                    <div class="search-box-modern">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               id="emailSearchInput"
                               class="search-input-modern" 
                               placeholder="Rechercher dans vos emails (expéditeur, sujet, contenu)..." 
                               value="${this.escapeHtml(this.searchTerm)}">
                        ${this.searchTerm ? `
                            <button class="search-clear-modern" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Ligne des actions et vue -->
                <div class="actions-line-modern">
                    ${this.renderViewModesModern()}
                    
                    <div class="actions-buttons-group">
                        <button class="btn-modern btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.createTasksFromSelection()"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            <span>Créer ${selectedCount > 1 ? selectedCount + ' tâches' : 'une tâche'}</span>
                        </button>
                        
                        <button class="btn-modern btn-select-all" 
                                onclick="window.pageManager.toggleSelectAll()">
                            <i class="fas fa-${this.selectedEmails.size === totalCount ? 'square-minus' : 'check-square'}"></i>
                            <span>${this.selectedEmails.size === totalCount ? 'Désélectionner tout' : 'Tout sélectionner'}</span>
                        </button>
                        
                        <div class="dropdown-modern">
                            <button class="btn-modern btn-secondary dropdown-toggle" 
                                    onclick="window.pageManager.toggleActionsMenu(event)">
                                <i class="fas fa-ellipsis-v"></i>
                                <span>Actions</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu-modern" id="actionsDropdown">
                                <button class="dropdown-item-modern" 
                                        onclick="window.pageManager.markSelectedAsRead()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-eye"></i>
                                    Marquer comme lu
                                </button>
                                <button class="dropdown-item-modern" 
                                        onclick="window.pageManager.archiveSelected()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-archive"></i>
                                    Archiver
                                </button>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item-modern" 
                                        onclick="window.pageManager.exportEmails()">
                                    <i class="fas fa-download"></i>
                                    Exporter
                                </button>
                            </div>
                        </div>
                        
                        <button class="btn-modern btn-icon" onclick="window.pageManager.refreshEmails()" title="Actualiser">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="btn-modern btn-ghost" onclick="window.pageManager.clearSelection()">
                                <i class="fas fa-times"></i>
                                <span>Effacer (${selectedCount})</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderViewModesModern() {
        return `
            <div class="view-modes-modern">
                <button class="view-mode-modern ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-domain')"
                        title="Grouper par domaine">
                    <i class="fas fa-globe"></i>
                    <span>Domaine</span>
                </button>
                <button class="view-mode-modern ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-sender')"
                        title="Grouper par expéditeur">
                    <i class="fas fa-user"></i>
                    <span>Expéditeur</span>
                </button>
                <button class="view-mode-modern ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('flat')"
                        title="Vue liste">
                    <i class="fas fa-list"></i>
                    <span>Liste</span>
                </button>
            </div>
        `;
    }

    renderCategoryFiltersModern(categoryCounts, totalEmails) {
        const categories = window.categoryManager?.getCategories() || {};
        const taskPreselectedCategories = this.getTaskPreselectedCategories();
        
        let filtersHtml = `
            <button class="category-pill-modern ${!this.currentCategory ? 'active' : ''}" 
                    onclick="window.pageManager.filterByCategory(null)"
                    data-category="all"
                    title="Tous les emails">
                <div class="pill-content">
                    <span class="pill-icon">📧</span>
                    <span class="pill-name">Tous</span>
                    <span class="pill-count">(${totalEmails})</span>
                </div>
            </button>
        `;
        
        // Trier les catégories par nombre d'emails (décroissant)
        const sortedCategories = Object.entries(categories)
            .map(([id, cat]) => ({ id, ...cat, count: categoryCounts[id] || 0 }))
            .filter(cat => cat.count > 0)
            .sort((a, b) => b.count - a.count);
        
        // Ajouter les catégories
        for (const cat of sortedCategories) {
            const isPreselected = taskPreselectedCategories.includes(cat.id);
            const isNewsletter = cat.id === 'marketing_news';
            
            filtersHtml += `
                <button class="category-pill-modern ${this.currentCategory === cat.id ? 'active' : ''} ${isPreselected ? 'preselected' : ''} ${isNewsletter ? 'newsletter' : ''}" 
                        onclick="window.pageManager.filterByCategory('${cat.id}')"
                        data-category="${cat.id}"
                        style="--cat-color: ${cat.color}"
                        title="${cat.name}">
                    <div class="pill-content">
                        <span class="pill-icon">${cat.icon}</span>
                        <span class="pill-name">${cat.name}</span>
                        <span class="pill-count">(${cat.count})</span>
                    </div>
                    ${isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                    ${isNewsletter && cat.count > 10 ? '<span class="newsletter-badge">📰</span>' : ''}
                </button>
            `;
        }
        
        // Ajouter "Autre" si nécessaire
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            filtersHtml += `
                <button class="category-pill-modern ${this.currentCategory === 'other' ? 'active' : ''}" 
                        onclick="window.pageManager.filterByCategory('other')"
                        data-category="other"
                        title="Non catégorisé">
                    <div class="pill-content">
                        <span class="pill-icon">📌</span>
                        <span class="pill-name">Autre</span>
                        <span class="pill-count">(${otherCount})</span>
                    </div>
                </button>
            `;
        }
        
        return `<div class="category-filters-modern">${filtersHtml}</div>`;
    }

    renderEmailsListModern(emails) {
        const filteredEmails = this.getFilteredEmails(emails);
        
        if (filteredEmails.length === 0) {
            return this.renderEmptySearchState();
        }
        
        // Mettre à jour le compteur de newsletters affichées
        this.newsletterStats.displayed = filteredEmails.filter(e => e.category === 'marketing_news' || e.isNewsletter).length;
        
        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatViewModern(filteredEmails);
            case 'grouped-domain':
                return this.renderGroupedViewModern(filteredEmails, 'domain');
            case 'grouped-sender':
                return this.renderGroupedViewModern(filteredEmails, 'sender');
            default:
                return this.renderFlatViewModern(filteredEmails);
        }
    }

    renderFlatViewModern(emails) {
        const emailsHtml = emails.map(email => this.renderEmailCardModern(email)).join('');
        return `<div class="emails-list-modern">${emailsHtml}</div>`;
    }

    renderGroupedViewModern(emails, groupBy) {
        const groups = this.groupEmails(emails, groupBy);
        let html = '<div class="emails-groups-modern">';
        
        // Trier les groupes par nombre d'emails
        const sortedGroups = Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length);
        
        for (const [groupKey, groupEmails] of sortedGroups) {
            const isExpanded = false; // Par défaut fermé
            const newsletterCount = groupEmails.filter(e => e.category === 'marketing_news' || e.isNewsletter).length;
            
            html += `
                <div class="email-group-modern ${isExpanded ? 'expanded' : ''}" data-group-key="${groupKey}">
                    <div class="group-header-modern" onclick="window.pageManager.toggleGroup('${groupKey}')">
                        <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>
                        <span class="group-icon">${groupBy === 'domain' ? '🌐' : '👤'}</span>
                        <span class="group-name">${groupKey}</span>
                        <span class="group-count">${groupEmails.length}</span>
                        ${newsletterCount > 0 ? `<span class="group-newsletter-count" title="${newsletterCount} newsletter(s)">📰 ${newsletterCount}</span>` : ''}
                    </div>
                    <div class="group-content-modern" style="display: ${isExpanded ? 'block' : 'none'}">
                        ${groupEmails.map(email => this.renderEmailCardModern(email)).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    renderEmailCardModern(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const isPreselected = email.isPreselectedForTasks === true;
        const isNewsletter = email.category === 'marketing_news' || email.isNewsletter === true;
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const hasAIAnalysis = this.aiAnalysisResults.has(email.id);
        
        // Priorité de couleur basée sur la catégorie
        const priorityColor = this.getEmailPriorityColor(email);
        
        return `
            <div class="email-card-modern ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselected ? 'preselected' : ''} ${isNewsletter ? 'newsletter' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox-modern" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation()"
                       onchange="window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="email-priority-bar" style="background: ${priorityColor}"></div>
                
                <div class="email-content-modern">
                    <div class="email-header-modern">
                        <h4 class="email-subject-modern">${this.escapeHtml(email.subject || 'Sans sujet')}</h4>
                        <div class="email-meta-modern">
                            <span class="email-date">${this.formatDate(email.receivedDateTime)}</span>
                            ${email.hasAttachments ? '<i class="fas fa-paperclip attachment-icon" title="Pièce jointe"></i>' : ''}
                            ${hasAIAnalysis ? '<i class="fas fa-robot ai-icon" title="Analysé par IA"></i>' : ''}
                            ${isNewsletter ? '<i class="fas fa-newspaper newsletter-icon" title="Newsletter"></i>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-from-modern">
                        <span class="sender-name">${this.escapeHtml(senderName)}</span>
                        ${this.renderCategoryBadgeModern(email)}
                    </div>
                    
                    ${isNewsletter && email.matchedPatterns?.length > 0 ? `
                        <div class="newsletter-keywords-preview">
                            <i class="fas fa-tag"></i>
                            <span>${email.matchedPatterns.slice(0, 3).map(p => p.keyword).join(', ')}${email.matchedPatterns.length > 3 ? '...' : ''}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="email-actions-modern">
                    ${hasTask ? `
                        <button class="action-btn-modern success" 
                                onclick="event.stopPropagation(); window.pageManager.viewTask('${email.id}')"
                                title="Voir la tâche créée">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : `
                        <button class="action-btn-modern primary" 
                                onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                                title="Créer une tâche">
                            <i class="fas fa-plus"></i>
                        </button>
                    `}
                    <button class="action-btn-modern secondary" 
                            onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                            title="Voir l'email complet">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryBadgeModern(email) {
        if (!email.category || email.category === 'other') {
            return '<span class="category-badge-modern other">Non catégorisé</span>';
        }
        
        const category = window.categoryManager?.getCategory(email.category);
        if (!category) return '';
        
        const isPreselected = email.isPreselectedForTasks === true;
        const isNewsletter = email.category === 'marketing_news';
        
        return `
            <span class="category-badge-modern ${isPreselected ? 'preselected' : ''} ${isNewsletter ? 'newsletter' : ''}" 
                  style="background: ${category.color}20; color: ${category.color}">
                ${category.icon} ${category.name}
                ${isPreselected ? ' ⭐' : ''}
                ${isNewsletter && email.categoryScore >= 100 ? ' ✓' : ''}
            </span>
        `;
    }

    renderEmptySearchState() {
        if (this.searchTerm) {
            return `
                <div class="empty-state-modern">
                    <i class="fas fa-search"></i>
                    <h3>Aucun résultat</h3>
                    <p>Aucun email ne correspond à "${this.escapeHtml(this.searchTerm)}"</p>
                    <button class="btn-modern btn-primary" onclick="window.pageManager.clearSearch()">
                        Effacer la recherche
                    </button>
                </div>
            `;
        } else if (this.currentCategory) {
            const category = window.categoryManager?.getCategory(this.currentCategory);
            return `
                <div class="empty-state-modern">
                    <i class="fas fa-folder-open"></i>
                    <h3>Catégorie vide</h3>
                    <p>${category?.icon || ''} "${category?.name || this.currentCategory}" ne contient aucun email</p>
                    <button class="btn-modern btn-primary" onclick="window.pageManager.filterByCategory(null)">
                        Voir tous les emails
                    </button>
                </div>
            `;
        }
        
        return this.renderEmptyEmailsState();
    }

    // ================================================
    // NOUVELLES MÉTHODES
    // ================================================
    toggleSelectAll() {
        const emails = this.getFilteredEmails(window.emailScanner?.getAllEmails() || []);
        
        if (this.selectedEmails.size === emails.length) {
            // Tout désélectionner
            this.selectedEmails.clear();
        } else {
            // Tout sélectionner
            emails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
        }
        
        this.refreshEmailsView();
    }

    selectAllNewsletters() {
        const emails = this.getFilteredEmails(window.emailScanner?.getAllEmails() || []);
        const newsletters = emails.filter(e => e.category === 'marketing_news' || e.isNewsletter);
        
        newsletters.forEach(email => {
            this.selectedEmails.add(email.id);
        });
        
        this.refreshEmailsView();
        
        if (window.uiManager) {
            window.uiManager.showToast(`${newsletters.length} newsletters sélectionnées`, 'success');
        }
    }

    // ================================================
    // MODALES POUR VISUALISATION ET ÉDITION
    // ================================================
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const analysis = this.aiAnalysisResults.get(emailId);
        const hasTask = this.createdTasks.has(emailId);
        const isNewsletter = email.category === 'marketing_news' || email.isNewsletter;
        
        const modalHtml = `
            <div class="modal-backdrop-modern" onclick="if(event.target === this) window.pageManager.closeModal()">
                <div class="modal-modern modal-email">
                    <div class="modal-header-modern">
                        <h2>Email complet</h2>
                        <button class="modal-close-modern" onclick="window.pageManager.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body-modern">
                        <div class="email-details-section">
                            <div class="email-detail-row">
                                <span class="detail-label">De :</span>
                                <span class="detail-value">
                                    ${email.from?.emailAddress?.name || ''} 
                                    &lt;${email.from?.emailAddress?.address || ''}&gt;
                                </span>
                            </div>
                            <div class="email-detail-row">
                                <span class="detail-label">Date :</span>
                                <span class="detail-value">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="email-detail-row">
                                <span class="detail-label">Sujet :</span>
                                <span class="detail-value subject">${this.escapeHtml(email.subject || 'Sans sujet')}</span>
                            </div>
                            ${email.category ? `
                                <div class="email-detail-row">
                                    <span class="detail-label">Catégorie :</span>
                                    <span class="detail-value">${this.renderCategoryBadgeModern(email)}</span>
                                </div>
                            ` : ''}
                            ${isNewsletter ? `
                                <div class="email-detail-row">
                                    <span class="detail-label">Détection :</span>
                                    <span class="detail-value">
                                        <span class="newsletter-detection-info">
                                            <i class="fas fa-newspaper"></i>
                                            Newsletter détectée (score: ${email.categoryScore || 0}, confiance: ${Math.round((email.categoryConfidence || 0) * 100)}%)
                                        </span>
                                    </span>
                                </div>
                                ${email.matchedPatterns?.length > 0 ? `
                                    <div class="email-detail-row">
                                        <span class="detail-label">Mots-clés :</span>
                                        <span class="detail-value">
                                            <div class="matched-keywords">
                                                ${email.matchedPatterns.slice(0, 5).map(pattern => `
                                                    <span class="keyword-tag ${pattern.type}">
                                                        ${pattern.keyword} (${pattern.type})
                                                    </span>
                                                `).join('')}
                                                ${email.matchedPatterns.length > 5 ? `<span class="keyword-more">+${email.matchedPatterns.length - 5} autres</span>` : ''}
                                            </div>
                                        </span>
                                    </div>
                                ` : ''}
                            ` : ''}
                        </div>
                        
                        ${analysis ? `
                            <div class="ai-analysis-section">
                                <h3><i class="fas fa-robot"></i> Analyse IA</h3>
                                <div class="ai-summary">${analysis.summary || 'Pas de résumé disponible'}</div>
                                ${analysis.mainTask ? `
                                    <div class="ai-task-suggestion">
                                        <h4>Tâche suggérée :</h4>
                                        <div class="suggested-task">
                                            <div class="task-title">${analysis.mainTask.title}</div>
                                            <div class="task-description">${analysis.mainTask.description || ''}</div>
                                            ${analysis.mainTask.dueDate ? `
                                                <div class="task-due">
                                                    <i class="fas fa-calendar"></i> 
                                                    Échéance : ${new Date(analysis.mainTask.dueDate).toLocaleDateString('fr-FR')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        
                        <div class="email-body-section">
                            <h3>Contenu de l'email</h3>
                            <div class="email-body-content">
                                ${this.getEmailContent(email)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer-modern">
                        <button class="btn-modern btn-secondary" onclick="window.pageManager.closeModal()">
                            Fermer
                        </button>
                        ${!hasTask ? `
                            <button class="btn-modern btn-primary" onclick="window.pageManager.closeModal(); window.pageManager.showTaskCreationModal('${emailId}');">
                                <i class="fas fa-tasks"></i>
                                Créer une tâche
                            </button>
                        ` : `
                            <button class="btn-modern btn-success" onclick="window.pageManager.viewTask('${emailId}')">
                                <i class="fas fa-check-circle"></i>
                                Voir la tâche
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
        this.currentModal = 'email';
        
        // Si pas d'analyse et pas newsletter, en lancer une
        if (!analysis && !isNewsletter && window.aiTaskAnalyzer) {
            this.analyzeEmailForModal(emailId);
        }
    }

    showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const analysis = this.aiAnalysisResults.get(emailId);
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        
        // Si pas d'analyse et pas newsletter, en créer une d'abord
        if (!analysis && (email.category !== 'marketing_news' && !email.isNewsletter) && window.aiTaskAnalyzer) {
            window.uiManager?.showLoading('Analyse de l\'email...');
            window.aiTaskAnalyzer.analyzeEmailForTasks(email).then(result => {
                window.uiManager?.hideLoading();
                this.aiAnalysisResults.set(emailId, result);
                this.showTaskCreationModal(emailId); // Rappeler avec l'analyse
            }).catch(error => {
                window.uiManager?.hideLoading();
                console.error('[PageManager] Erreur analyse:', error);
                // Continuer sans analyse
                this.showTaskCreationModalContent(email, null);
            });
            return;
        }
        
        this.showTaskCreationModalContent(email, analysis);
    }

    showTaskCreationModalContent(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const suggestedTitle = analysis?.mainTask?.title || email.subject || 'Nouvelle tâche';
        const suggestedDescription = analysis?.mainTask?.description || analysis?.summary || '';
        const suggestedPriority = analysis?.mainTask?.priority || 'medium';
        const suggestedDueDate = analysis?.mainTask?.dueDate || '';
        const isNewsletter = email.category === 'marketing_news' || email.isNewsletter;
        
        const modalHtml = `
            <div class="modal-backdrop-modern" onclick="if(event.target === this) window.pageManager.closeModal()">
                <div class="modal-modern modal-task-creation">
                    <div class="modal-header-modern">
                        <h2>Créer une tâche</h2>
                        <button class="modal-close-modern" onclick="window.pageManager.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body-modern">
                        ${analysis ? `
                            <div class="ai-badge-modern">
                                <i class="fas fa-robot"></i>
                                <span>Suggestion basée sur l'analyse IA</span>
                            </div>
                        ` : ''}
                        
                        ${isNewsletter ? `
                            <div class="newsletter-warning-modern">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Cet email est une newsletter. Voulez-vous vraiment créer une tâche ?</span>
                            </div>
                        ` : ''}
                        
                        <div class="task-form-modern">
                            <div class="form-group-modern">
                                <label>Titre de la tâche</label>
                                <input type="text" 
                                       id="task-title-input" 
                                       class="form-input-modern" 
                                       value="${this.escapeHtml(suggestedTitle)}"
                                       placeholder="Entrez le titre de la tâche">
                            </div>
                            
                            <div class="form-group-modern">
                                <label>Description</label>
                                <textarea id="task-description-input" 
                                          class="form-textarea-modern" 
                                          rows="4"
                                          placeholder="Ajoutez une description...">${this.escapeHtml(suggestedDescription)}</textarea>
                            </div>
                            
                            <div class="form-row-modern">
                                <div class="form-group-modern">
                                    <label>Priorité</label>
                                    <select id="task-priority-input" class="form-select-modern">
                                        <option value="urgent" ${suggestedPriority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                        <option value="high" ${suggestedPriority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                        <option value="medium" ${suggestedPriority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                        <option value="low" ${suggestedPriority === 'low' ? 'selected' : ''}>📄 Basse</option>
                                    </select>
                                </div>
                                
                                <div class="form-group-modern">
                                    <label>Date d'échéance</label>
                                    <input type="date" 
                                           id="task-duedate-input" 
                                           class="form-input-modern"
                                           value="${suggestedDueDate}">
                                </div>
                            </div>
                            
                            <div class="email-context-modern">
                                <h4>Email d'origine</h4>
                                <div class="email-context-info">
                                    <div class="sender-info">
                                        <i class="fas fa-user"></i>
                                        <span>${this.escapeHtml(senderName)}</span>
                                    </div>
                                    <div class="subject-info">
                                        <i class="fas fa-envelope"></i>
                                        <span>${this.escapeHtml(email.subject || 'Sans sujet')}</span>
                                    </div>
                                    ${email.category ? `
                                        <div class="category-info">
                                            <i class="fas fa-tag"></i>
                                            ${this.renderCategoryBadgeModern(email)}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer-modern">
                        <button class="btn-modern btn-secondary" onclick="window.pageManager.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern btn-primary" onclick="window.pageManager.createTaskFromModal('${email.id}')">
                            <i class="fas fa-check"></i>
                            Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
        this.currentModal = 'task-creation';
        this.editingEmailId = email.id;
        
        // Focus sur le titre
        setTimeout(() => {
            document.getElementById('task-title-input')?.focus();
        }, 100);
    }

    async analyzeEmailForModal(emailId) {
        if (!window.aiTaskAnalyzer) return;
        
        try {
            const email = this.getEmailById(emailId);
            const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            this.aiAnalysisResults.set(emailId, analysis);
            
            // Mettre à jour la modal si elle est toujours ouverte
            if (this.currentModal === 'email') {
                const analysisSection = document.querySelector('.ai-analysis-section');
                if (!analysisSection) {
                    // Ajouter la section d'analyse
                    const modalBody = document.querySelector('.modal-body-modern');
                    const detailsSection = modalBody.querySelector('.email-details-section');
                    
                    const analysisHtml = `
                        <div class="ai-analysis-section">
                            <h3><i class="fas fa-robot"></i> Analyse IA</h3>
                            <div class="ai-summary">${analysis.summary || 'Pas de résumé disponible'}</div>
                            ${analysis.mainTask ? `
                                <div class="ai-task-suggestion">
                                    <h4>Tâche suggérée :</h4>
                                    <div class="suggested-task">
                                        <div class="task-title">${analysis.mainTask.title}</div>
                                        <div class="task-description">${analysis.mainTask.description || ''}</div>
                                        ${analysis.mainTask.dueDate ? `
                                            <div class="task-due">
                                                <i class="fas fa-calendar"></i> 
                                                Échéance : ${new Date(analysis.mainTask.dueDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    
                    detailsSection.insertAdjacentHTML('afterend', analysisHtml);
                }
            }
        } catch (error) {
            console.error('[PageManager] Erreur analyse email pour modal:', error);
        }
    }

    createTaskFromModal(emailId) {
        const title = document.getElementById('task-title-input')?.value?.trim();
        const description = document.getElementById('task-description-input')?.value?.trim();
        const priority = document.getElementById('task-priority-input')?.value;
        const dueDate = document.getElementById('task-duedate-input')?.value;
        
        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }
        
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        // Créer la tâche
        if (window.taskManager) {
            const taskData = {
                title,
                description,
                priority,
                dueDate,
                emailId: email.id,
                emailFrom: email.from?.emailAddress?.address,
                emailSubject: email.subject,
                category: email.category,
                status: 'todo'
            };
            
            const task = window.taskManager.createTask(taskData);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager.saveTasks();
                window.uiManager?.showToast('Tâche créée avec succès', 'success');
                this.closeModal();
                this.refreshEmailsView();
            }
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal-backdrop-modern');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
            this.currentModal = null;
            this.editingEmailId = null;
        }
    }

    getEmailContent(email) {
        if (email.body?.content) {
            // Nettoyer le HTML potentiellement dangereux
            let content = email.body.content;
            content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
            content = content.replace(/<meta[^>]*>/gi, '');
            return `<div class="email-html-content">${content}</div>`;
        }
        
        if (email.bodyPreview) {
            return `<div class="email-text-content">${this.escapeHtml(email.bodyPreview)}</div>`;
        }
        
        return '<div class="email-no-content">Aucun contenu disponible</div>';
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

    getEmailPriorityColor(email) {
        // Rouge pour urgent/sécurité
        if (email.importance === 'high' || email.category === 'security') return '#ef4444';
        
        // Orange pour commercial/finance
        if (email.category === 'commercial' || email.category === 'finance') return '#f97316';
        
        // Violet pour pré-sélectionné
        if (email.isPreselectedForTasks) return '#8b5cf6';
        
        // Vert pour tâches
        if (email.category === 'tasks') return '#10b981';
        
        // Bleu pour meetings
        if (email.category === 'meetings') return '#3b82f6';
        
        // Gris pour newsletter
        if (email.category === 'marketing_news') return '#6b7280';
        
        // Bleu clair par défaut
        return '#0ea5e9';
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
        
        // Fermer les dropdowns en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-modern')) {
                this.closeAllDropdowns();
            }
        });
    }

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox' || event.target.closest('.email-actions-modern')) {
            return;
        }
        
        // Double-click pour sélection rapide
        const now = Date.now();
        if (this.lastClickTime && (now - this.lastClickTime < 300)) {
            this.toggleEmailSelection(emailId);
        } else {
            this.showEmailModal(emailId);
        }
        this.lastClickTime = now;
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Mettre à jour la checkbox
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .email-checkbox-modern`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        // Mettre à jour la carte
        const card = document.querySelector(`[data-email-id="${emailId}"]`);
        if (card) {
            card.classList.toggle('selected', this.selectedEmails.has(emailId));
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
        const content = group.querySelector('.group-content-modern');
        const icon = group.querySelector('.group-header-modern i');
        
        if (isExpanded) {
            group.classList.remove('expanded');
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        } else {
            group.classList.add('expanded');
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        }
    }

    toggleActionsMenu(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('actionsDropdown');
        const isOpen = dropdown.classList.contains('show');
        
        this.closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('show');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu-modern.show').forEach(menu => {
            menu.classList.remove('show');
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
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        }
    }

    async createTaskFromEmailData(email) {
        // Analyser l'email si nécessaire et si ce n'est pas une newsletter
        let analysis = this.aiAnalysisResults.get(email.id);
        
        if (!analysis && window.aiTaskAnalyzer && email.category !== 'marketing_news' && !email.isNewsletter) {
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
                category: email.category,
                status: 'todo'
            };
            
            return window.taskManager.createTask(taskData);
        }
        
        return null;
    }

    markSelectedAsRead() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        if (window.emailScanner?.performBatchAction) {
            window.emailScanner.performBatchAction(selectedIds, 'markAsRead');
        }
        
        this.clearSelection();
    }

    archiveSelected() {
        const selectedIds = Array.from(this.selectedEmails);
        if (selectedIds.length === 0) return;
        
        if (confirm(`Archiver ${selectedIds.length} email(s) ?`)) {
            // TODO: Implémenter l'archivage
            window.uiManager?.showToast(`${selectedIds.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    exportEmails() {
        if (window.emailScanner?.exportResults) {
            window.emailScanner.exportResults('csv');
        }
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
        const container = document.querySelector('.emails-container-modern');
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
        container.innerHTML = this.renderEmailsListModern(emails);
        
        // Mettre à jour les contrôles
        this.updateControlsBar();
        this.updateCategoryFilters(emails);
        this.updateNewsletterBanner();
    }

    updateControlsBar() {
        const selectedCount = this.selectedEmails.size;
        const totalCount = window.emailScanner?.getAllEmails()?.length || 0;
        const controlsBar = document.querySelector('.controls-bar-modern');
        
        if (controlsBar) {
            // Remplacer toute la barre de contrôles
            controlsBar.outerHTML = this.renderControlsBarModern(selectedCount, totalCount);
            
            // Réattacher les event listeners
            const searchInput = document.getElementById('emailSearchInput');
            if (searchInput) {
                searchInput.value = this.searchTerm;
                searchInput.addEventListener('input', (e) => {
                    this.debounce('search', () => {
                        this.searchTerm = e.target.value;
                        this.refreshEmailsView();
                    }, 300)();
                });
            }
        }
    }

    updateCategoryFilters(emails) {
        const filtersContainer = document.querySelector('.category-filters-modern');
        if (!filtersContainer) return;
        
        const categoryCounts = this.calculateCategoryCounts(emails);
        filtersContainer.outerHTML = this.renderCategoryFiltersModern(categoryCounts, emails.length);
    }

    updateNewsletterBanner() {
        const existingBanner = document.querySelector('.newsletter-banner-modern');
        const newBanner = this.renderNewsletterBanner();
        
        if (existingBanner && newBanner) {
            existingBanner.outerHTML = newBanner;
        } else if (!existingBanner && newBanner) {
            const filters = document.querySelector('.category-filters-modern');
            if (filters) {
                filters.insertAdjacentHTML('afterend', newBanner);
            }
        } else if (existingBanner && !newBanner) {
            existingBanner.remove();
        }
    }

    // ================================================
    // AUTRES PAGES
    // ================================================
    async renderScanner(container) {
        if (window.scanStartModule?.render) {
            await window.scanStartModule.render(container);
        } else {
            container.innerHTML = `
                <div class="empty-state-modern">
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
                <div class="empty-state-modern">
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
                <div class="empty-state-modern">
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
                <div class="empty-state-modern">
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
                <div class="empty-state-modern">
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
        // Analyser les premiers emails pré-sélectionnés (sauf newsletters)
        const preselectedEmails = emails
            .filter(email => email.isPreselectedForTasks && email.category !== 'marketing_news' && !email.isNewsletter)
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
    // STYLES MODERNES AMÉLIORÉS AVEC NEWSLETTER
    // ================================================
    addModernEmailsStyles() {
        if (document.getElementById('pageManagerModernStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerModernStyles';
        styles.textContent = `
            /* PageManager Modern Styles v17.0 - Newsletter Enhanced */
            :root {
                --pm-primary: #3b82f6;
                --pm-primary-dark: #2563eb;
                --pm-primary-light: #60a5fa;
                --pm-secondary: #8b5cf6;
                --pm-success: #10b981;
                --pm-warning: #f59e0b;
                --pm-danger: #ef4444;
                --pm-gray-50: #f9fafb;
                --pm-gray-100: #f3f4f6;
                --pm-gray-200: #e5e7eb;
                --pm-gray-300: #d1d5db;
                --pm-gray-400: #9ca3af;
                --pm-gray-500: #6b7280;
                --pm-gray-600: #4b5563;
                --pm-gray-700: #374151;
                --pm-gray-800: #1f2937;
                --pm-gray-900: #111827;
                --pm-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                --pm-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                --pm-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                --pm-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                --pm-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                --pm-transition: all 0.2s ease;
                --pm-font-size-base: 16px;
                --pm-font-size-lg: 18px;
                --pm-font-size-xl: 20px;
            }
            
            /* Container moderne */
            .emails-page-modern {
                padding: 24px;
                max-width: 1600px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                font-size: var(--pm-font-size-base);
            }
            
            /* États vides modernes */
            .empty-state-modern,
            .error-container-modern {
                text-align: center;
                padding: 80px 20px;
                color: var(--pm-gray-500);
            }
            
            .empty-state-modern .empty-icon-modern,
            .error-container-modern .error-icon {
                font-size: 72px;
                margin-bottom: 24px;
                opacity: 0.3;
            }
            
            .empty-state-modern h3,
            .error-container-modern h2 {
                font-size: 32px;
                margin-bottom: 12px;
                color: var(--pm-gray-900);
                font-weight: 600;
            }
            
            .empty-state-modern p,
            .error-container-modern p {
                margin-bottom: 24px;
                font-size: var(--pm-font-size-lg);
                color: var(--pm-gray-600);
            }
            
            /* Explanation moderne */
            .explanation-modern {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: var(--pm-shadow-sm);
            }
            
            .explanation-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: var(--pm-font-size-base);
                color: var(--pm-gray-700);
                flex: 1;
            }
            
            .explanation-content i {
                color: var(--pm-primary);
                font-size: 20px;
            }
            
            .explanation-close {
                background: none;
                border: none;
                color: var(--pm-gray-500);
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: var(--pm-transition);
            }
            
            .explanation-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: var(--pm-gray-700);
            }
            
            /* Newsletter banner */
            .newsletter-banner-modern {
                background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: var(--pm-shadow-sm);
            }
            
            .newsletter-info {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: var(--pm-font-size-base);
                color: var(--pm-gray-700);
            }
            
            .newsletter-info i {
                color: var(--pm-secondary);
                font-size: 20px;
            }
            
            .newsletter-actions {
                display: flex;
                gap: 12px;
            }
            
            /* Controls bar moderne */
            .controls-bar-modern {
                background: white;
                border: 1px solid var(--pm-gray-200);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 24px;
                box-shadow: var(--pm-shadow-md);
            }
            
            .search-line-modern {
                margin-bottom: 16px;
            }
            
            .search-box-modern {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-box-modern i {
                position: absolute;
                left: 20px;
                color: var(--pm-gray-400);
                font-size: 20px;
                pointer-events: none;
            }
            
            .search-input-modern {
                width: 100%;
                padding: 16px 20px 16px 52px;
                border: 2px solid var(--pm-gray-200);
                border-radius: 12px;
                font-size: var(--pm-font-size-base);
                transition: var(--pm-transition);
                background: var(--pm-gray-50);
            }
            
            .search-input-modern:focus {
                outline: none;
                border-color: var(--pm-primary);
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            }
            
            .search-clear-modern {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                color: var(--pm-gray-400);
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: var(--pm-transition);
            }
            
            .search-clear-modern:hover {
                background: var(--pm-gray-100);
                color: var(--pm-gray-600);
            }
            
            /* Actions line moderne */
            .actions-line-modern {
                display: flex;
                align-items: center;
                gap: 16px;
                justify-content: space-between;
            }
            
            .actions-buttons-group {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            /* View modes modernes */
            .view-modes-modern {
                display: flex;
                background: var(--pm-gray-100);
                border-radius: 10px;
                padding: 4px;
                gap: 4px;
            }
            
            .view-mode-modern {
                background: none;
                border: none;
                padding: 10px 14px;
                border-radius: 8px;
                color: var(--pm-gray-600);
                cursor: pointer;
                transition: var(--pm-transition);
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: var(--pm-font-size-base);
                font-weight: 500;
            }
            
            .view-mode-modern:hover {
                background: white;
                color: var(--pm-gray-800);
                box-shadow: var(--pm-shadow-sm);
            }
            
            .view-mode-modern.active {
                background: white;
                color: var(--pm-primary);
                box-shadow: var(--pm-shadow);
            }
            
            .view-mode-modern i {
                font-size: 18px;
            }
            
            /* Boutons modernes */
            .btn-modern {
                padding: 12px 20px;
                border: none;
                border-radius: 10px;
                font-size: var(--pm-font-size-base);
                font-weight: 600;
                cursor: pointer;
                transition: var(--pm-transition);
                display: inline-flex;
                align-items: center;
                gap: 8px;
                position: relative;
                white-space: nowrap;
            }
            
            .btn-modern.btn-sm {
                padding: 8px 16px;
                font-size: 14px;
            }
            
            .btn-modern:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-modern.btn-primary {
                background: linear-gradient(135deg, var(--pm-primary) 0%, var(--pm-primary-dark) 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-modern.btn-primary:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
            
            .btn-modern.btn-secondary {
                background: white;
                color: var(--pm-gray-700);
                border: 1px solid var(--pm-gray-300);
            }
            
            .btn-modern.btn-secondary:hover:not(:disabled) {
                background: var(--pm-gray-50);
                border-color: var(--pm-gray-400);
            }
            
            .btn-modern.btn-select-all {
                background: white;
                color: var(--pm-gray-700);
                border: 1px solid var(--pm-gray-300);
            }
            
            .btn-modern.btn-select-all:hover {
                background: var(--pm-gray-50);
                border-color: var(--pm-primary);
                color: var(--pm-primary);
            }
            
            .btn-modern.btn-success {
                background: linear-gradient(135deg, var(--pm-success) 0%, #059669 100%);
                color: white;
            }
            
            .btn-modern.btn-ghost {
                background: none;
                color: var(--pm-gray-600);
                border: none;
            }
            
            .btn-modern.btn-ghost:hover {
                background: var(--pm-gray-100);
                color: var(--pm-gray-800);
            }
            
            .btn-modern.btn-icon {
                padding: 12px;
                aspect-ratio: 1;
            }
            
            /* Dropdown moderne */
            .dropdown-modern {
                position: relative;
            }
            
            .dropdown-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .dropdown-menu-modern {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid var(--pm-gray-200);
                border-radius: 12px;
                box-shadow: var(--pm-shadow-xl);
                min-width: 220px;
                padding: 8px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: var(--pm-transition);
                z-index: 1000;
            }
            
            .dropdown-menu-modern.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item-modern {
                width: 100%;
                padding: 12px 16px;
                background: none;
                border: none;
                border-radius: 8px;
                font-size: var(--pm-font-size-base);
                text-align: left;
                cursor: pointer;
                transition: var(--pm-transition);
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--pm-gray-700);
            }
            
            .dropdown-item-modern:hover:not(:disabled) {
                background: var(--pm-gray-100);
                color: var(--pm-gray-900);
            }
            
            .dropdown-item-modern:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .dropdown-divider {
                height: 1px;
                background: var(--pm-gray-200);
                margin: 8px 0;
            }
            
            /* Filtres de catégories modernes */
            .category-filters-modern {
                display: flex;
                flex-wrap: wrap;
                gap: 0;
                margin-bottom: 24px;
            }
            
            .category-pill-modern {
                background: white;
                border: 1px solid var(--pm-gray-200);
                border-radius: 8px;
                padding: 8px 6px;
                cursor: pointer;
                transition: var(--pm-transition);
                position: relative;
                overflow: visible;
                display: flex;
                align-items: center;
                justify-content: center;
                width: calc(16.666% - 1px);
                min-height: 48px;
                margin-right: -1px;
                margin-bottom: -1px;
                color: var(--pm-gray-800);
            }
            
            .category-pill-modern:nth-child(6n) {
                margin-right: 0;
            }
            
            .category-pill-modern:hover {
                background: var(--pm-gray-50);
                z-index: 1;
                box-shadow: 0 0 0 1px var(--pm-gray-300);
            }
            
            .category-pill-modern.active {
                background: rgba(59, 130, 246, 0.15);
                color: var(--pm-gray-800);
                z-index: 2;
                box-shadow: 0 0 0 2px var(--pm-primary);
                border-color: var(--pm-primary);
            }
            
            .category-pill-modern.active .pill-icon,
            .category-pill-modern.active .pill-name,
            .category-pill-modern.active .pill-count {
                color: var(--pm-gray-800);
                font-weight: 600;
            }
            
            .category-pill-modern.preselected {
                background: linear-gradient(135deg, white 0%, #faf5ff 100%);
            }
            
            .category-pill-modern.newsletter {
                background: linear-gradient(135deg, white 0%, #f3f4f6 100%);
            }
            
            .pill-content {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                font-weight: 500;
                width: 100%;
                justify-content: center;
                padding: 0 2px;
            }
            
            .pill-icon {
                font-size: 16px;
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
                line-height: 1;
            }
            
            .pill-name {
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
                word-break: break-word;
                hyphens: auto;
                max-width: 100%;
            }
            
            .pill-count {
                font-size: 11px;
                font-weight: 600;
                opacity: 0.7;
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
            }
            
            .preselected-star {
                position: absolute;
                top: -4px;
                right: -4px;
                background: var(--pm-secondary);
                color: white;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                animation: pulse 2s ease-in-out infinite;
                z-index: 3;
            }
            
            .newsletter-badge {
                position: absolute;
                top: -4px;
                left: -4px;
                background: var(--pm-gray-600);
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                z-index: 3;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            /* Container des emails */
            .emails-container-modern {
                background: white;
                border: 1px solid var(--pm-gray-200);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: var(--pm-shadow-md);
            }
            
            /* Liste d'emails moderne */
            .emails-list-modern {
                background: white;
            }
            
            /* Carte d'email moderne */
            .email-card-modern {
                padding: 16px 24px;
                border-bottom: 1px solid var(--pm-gray-100);
                cursor: pointer;
                transition: var(--pm-transition);
                display: flex;
                gap: 16px;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
            
            .email-card-modern:hover {
                background: var(--pm-gray-50);
            }
            
            .email-card-modern.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
                border-left: 4px solid var(--pm-primary);
                padding-left: 20px;
            }
            
            .email-card-modern.has-task {
                opacity: 0.7;
            }
            
            .email-card-modern.preselected {
                background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                border-left: 4px solid var(--pm-secondary);
                padding-left: 20px;
            }
            
            .email-card-modern.newsletter {
                background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            }
            
            .email-checkbox-modern {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                cursor: pointer;
                accent-color: var(--pm-primary);
            }
            
            .email-priority-bar {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                transition: var(--pm-transition);
            }
            
            .email-content-modern {
                flex: 1;
                min-width: 0;
            }
            
            .email-header-modern {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
                gap: 16px;
            }
            
            .email-subject-modern {
                font-size: var(--pm-font-size-lg);
                font-weight: 600;
                margin: 0;
                color: var(--pm-gray-900);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }
            
            .email-meta-modern {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                color: var(--pm-gray-500);
                flex-shrink: 0;
            }
            
            .attachment-icon {
                color: var(--pm-gray-400);
                font-size: 16px;
            }
            
            .ai-icon {
                color: var(--pm-secondary);
                font-size: 16px;
            }
            
            .newsletter-icon {
                color: var(--pm-gray-500);
                font-size: 16px;
            }
            
            .email-from-modern {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: var(--pm-font-size-base);
                color: var(--pm-gray-600);
                margin-bottom: 10px;
            }
            
            .sender-name {
                font-weight: 500;
            }
            
            .newsletter-keywords-preview {
                font-size: 13px;
                color: var(--pm-gray-500);
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 6px;
            }
            
            .newsletter-keywords-preview i {
                font-size: 12px;
            }
            
            .category-badge-modern {
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            
            .category-badge-modern.other {
                background: var(--pm-gray-100);
                color: var(--pm-gray-600);
            }
            
            .category-badge-modern.preselected {
                font-weight: 700;
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
            }
            
            .category-badge-modern.newsletter {
                background: var(--pm-gray-100);
                color: var(--pm-gray-700);
            }
            
            .email-actions-modern {
                display: flex;
                gap: 10px;
                flex-shrink: 0;
            }
            
            .action-btn-modern {
                background: white;
                border: 1px solid var(--pm-gray-200);
                border-radius: 8px;
                padding: 10px 14px;
                cursor: pointer;
                transition: var(--pm-transition);
                font-size: 15px;
                color: var(--pm-gray-600);
            }
            
            .action-btn-modern:hover {
                background: var(--pm-gray-50);
                border-color: var(--pm-gray-300);
                transform: translateY(-1px);
            }
            
            .action-btn-modern.primary {
                color: var(--pm-primary);
                border-color: var(--pm-primary);
            }
            
            .action-btn-modern.primary:hover {
                background: var(--pm-primary);
                color: white;
            }
            
            .action-btn-modern.success {
                color: var(--pm-success);
                border-color: var(--pm-success);
            }
            
            .action-btn-modern.success:hover {
                background: var(--pm-success);
                color: white;
            }
            
            .action-btn-modern.secondary {
                color: var(--pm-gray-600);
            }
            
            /* Groupes d'emails modernes */
            .emails-groups-modern {
                background: white;
            }
            
            .email-group-modern {
                border-bottom: 1px solid var(--pm-gray-200);
            }
            
            .email-group-modern:last-child {
                border-bottom: none;
            }
            
            .group-header-modern {
                padding: 18px 24px;
                background: var(--pm-gray-50);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 14px;
                font-weight: 600;
                transition: var(--pm-transition);
                color: var(--pm-gray-800);
            }
            
            .group-header-modern:hover {
                background: var(--pm-gray-100);
            }
            
            .group-header-modern i {
                color: var(--pm-gray-500);
                transition: transform 0.2s;
                font-size: 16px;
            }
            
            .group-icon {
                font-size: 24px;
            }
            
            .group-name {
                flex: 1;
                font-size: var(--pm-font-size-lg);
            }
            
            .group-count {
                background: white;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 14px;
                color: var(--pm-gray-600);
                border: 1px solid var(--pm-gray-200);
            }
            
            .group-newsletter-count {
                background: var(--pm-gray-600);
                color: white;
                padding: 4px 10px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            
            .group-content-modern {
                border-top: 1px solid var(--pm-gray-100);
            }
            
            /* Modales modernes */
            .modal-backdrop-modern {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                animation: fadeIn 0.2s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-modern {
                background: white;
                border-radius: 20px;
                width: 100%;
                max-width: 700px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: var(--pm-shadow-xl);
                animation: slideUp 0.3s;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-modern.modal-email {
                max-width: 900px;
            }
            
            .modal-modern.modal-task-creation {
                max-width: 700px;
            }
            
            .modal-header-modern {
                padding: 28px 28px 24px;
                border-bottom: 1px solid var(--pm-gray-200);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header-modern h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
                color: var(--pm-gray-900);
            }
            
            .modal-close-modern {
                background: none;
                border: none;
                color: var(--pm-gray-500);
                cursor: pointer;
                padding: 10px;
                border-radius: 8px;
                transition: var(--pm-transition);
                font-size: 22px;
            }
            
            .modal-close-modern:hover {
                background: var(--pm-gray-100);
                color: var(--pm-gray-700);
            }
            
            .modal-body-modern {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer-modern {
                padding: 24px 28px;
                border-top: 1px solid var(--pm-gray-200);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Sections dans les modales */
            .email-details-section {
                margin-bottom: 28px;
            }
            
            .email-detail-row {
                display: flex;
                margin-bottom: 14px;
                font-size: var(--pm-font-size-base);
            }
            
            .detail-label {
                font-weight: 600;
                color: var(--pm-gray-600);
                width: 100px;
                flex-shrink: 0;
            }
            
            .detail-value {
                color: var(--pm-gray-800);
                flex: 1;
            }
            
            .detail-value.subject {
                font-weight: 600;
                color: var(--pm-gray-900);
                font-size: var(--pm-font-size-lg);
            }
            
            .newsletter-detection-info {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: var(--pm-gray-100);
                border-radius: 8px;
                font-size: 14px;
            }
            
            .matched-keywords {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .keyword-tag {
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
            }
            
            .keyword-tag.absolute {
                background: var(--pm-danger);
                color: white;
            }
            
            .keyword-tag.strong {
                background: var(--pm-warning);
                color: white;
            }
            
            .keyword-tag.weak {
                background: var(--pm-gray-300);
                color: var(--pm-gray-800);
            }
            
            .keyword-more {
                padding: 4px 10px;
                color: var(--pm-gray-600);
                font-size: 13px;
            }
            
            .ai-analysis-section {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 28px;
            }
            
            .ai-analysis-section h3 {
                font-size: var(--pm-font-size-lg);
                font-weight: 600;
                margin: 0 0 16px 0;
                color: var(--pm-secondary);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .ai-summary {
                font-size: var(--pm-font-size-base);
                color: var(--pm-gray-700);
                line-height: 1.7;
                margin-bottom: 18px;
            }
            
            .ai-task-suggestion {
                background: white;
                border-radius: 10px;
                padding: 18px;
                margin-top: 18px;
            }
            
            .ai-task-suggestion h4 {
                font-size: var(--pm-font-size-base);
                font-weight: 600;
                margin: 0 0 14px 0;
                color: var(--pm-gray-800);
            }
            
            .suggested-task {
                background: var(--pm-gray-50);
                border-radius: 8px;
                padding: 16px;
            }
            
            .task-title {
                font-weight: 600;
                color: var(--pm-gray-900);
                margin-bottom: 10px;
                font-size: var(--pm-font-size-lg);
            }
            
            .task-description {
                font-size: 15px;
                color: var(--pm-gray-600);
                line-height: 1.6;
                margin-bottom: 10px;
            }
            
            .task-due {
                font-size: 14px;
                color: var(--pm-warning);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-body-section {
                margin-top: 28px;
            }
            
            .email-body-section h3 {
                font-size: var(--pm-font-size-lg);
                font-weight: 600;
                margin: 0 0 18px 0;
                color: var(--pm-gray-800);
            }
            
            .email-body-content {
                background: var(--pm-gray-50);
                border: 1px solid var(--pm-gray-200);
                border-radius: 12px;
                padding: 24px;
                max-height: 450px;
                overflow-y: auto;
            }
            
            .email-html-content {
                font-size: var(--pm-font-size-base);
                line-height: 1.7;
                color: var(--pm-gray-700);
            }
            
            .email-text-content {
                font-size: var(--pm-font-size-base);
                line-height: 1.7;
                color: var(--pm-gray-700);
                white-space: pre-wrap;
            }
            
            .email-no-content {
                text-align: center;
                color: var(--pm-gray-500);
                font-style: italic;
                font-size: var(--pm-font-size-base);
            }
            
            /* Badge AI moderne */
            .ai-badge-modern {
                background: linear-gradient(135deg, var(--pm-secondary) 0%, #7c3aed 100%);
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 24px;
            }
            
            /* Newsletter warning */
            .newsletter-warning-modern {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: var(--pm-gray-800);
                padding: 12px 18px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 24px;
            }
            
            .newsletter-warning-modern i {
                color: var(--pm-warning);
                font-size: 18px;
            }
            
            /* Formulaire de tâche moderne */
            .task-form-modern {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .form-group-modern {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .form-group-modern label {
                font-size: var(--pm-font-size-base);
                font-weight: 600;
                color: var(--pm-gray-700);
            }
            
            .form-input-modern,
            .form-textarea-modern,
            .form-select-modern {
                padding: 14px 18px;
                border: 2px solid var(--pm-gray-200);
                border-radius: 10px;
                font-size: var(--pm-font-size-base);
                transition: var(--pm-transition);
                background: white;
                font-family: inherit;
            }
            
            .form-input-modern:focus,
            .form-textarea-modern:focus,
            .form-select-modern:focus {
                outline: none;
                border-color: var(--pm-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-textarea-modern {
                resize: vertical;
                min-height: 120px;
            }
            
            .form-row-modern {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 18px;
            }
            
            .email-context-modern {
                background: var(--pm-gray-50);
                border-radius: 12px;
                padding: 20px;
            }
            
            .email-context-modern h4 {
                font-size: var(--pm-font-size-base);
                font-weight: 600;
                margin: 0 0 14px 0;
                color: var(--pm-gray-700);
            }
            
            .email-context-info {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .sender-info,
            .subject-info,
            .category-info {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 15px;
                color: var(--pm-gray-600);
            }
            
            .sender-info i,
            .subject-info i,
            .category-info i {
                color: var(--pm-gray-400);
                width: 18px;
            }
            
            /* Responsive */
            @media (max-width: 1400px) {
                .category-pill-modern {
                    width: calc(25% - 1px);
                }
                
                .category-pill-modern:nth-child(6n) {
                    margin-right: -1px;
                }
                
                .category-pill-modern:nth-child(4n) {
                    margin-right: 0;
                }
            }
            
            @media (max-width: 768px) {
                .emails-page-modern {
                    padding: 16px;
                }
                
                .actions-line-modern {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .actions-buttons-group {
                    flex-wrap: wrap;
                    gap: 8px;
                    width: 100%;
                }
                
                .btn-modern span {
                    display: none;
                }
                
                .btn-modern.btn-primary span,
                .btn-modern.btn-select-all span {
                    display: inline;
                }
                
                .category-pill-modern {
                    width: calc(33.333% - 1px);
                    padding: 8px 10px;
                }
                
                .category-pill-modern:nth-child(4n) {
                    margin-right: -1px;
                }
                
                .category-pill-modern:nth-child(3n) {
                    margin-right: 0;
                }
                
                .pill-icon {
                    font-size: 15px;
                }
                
                .pill-name {
                    font-size: 12px;
                    max-width: 80px;
                }
                
                .pill-count {
                    font-size: 11px;
                }
                
                .email-preview-modern {
                    display: none;
                }
                
                .form-row-modern {
                    grid-template-columns: 1fr;
                }
                
                .email-card-modern {
                    padding: 16px 20px;
                }
                
                .email-subject-modern {
                    font-size: 16px;
                }
                
                .newsletter-banner-modern {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .newsletter-actions {
                    width: 100%;
                    justify-content: stretch;
                }
                
                .newsletter-actions .btn-modern {
                    flex: 1;
                }
            }
            
            @media (max-width: 480px) {
                .modal-modern {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .email-meta-modern {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .category-pill-modern {
                    width: calc(50% - 1px);
                    padding: 7px 8px;
                    min-height: 40px;
                }
                
                .category-pill-modern:nth-child(3n) {
                    margin-right: -1px;
                }
                
                .category-pill-modern:nth-child(2n) {
                    margin-right: 0;
                }
                
                .pill-content {
                    font-size: 11px;
                    gap: 4px;
                }
                
                .pill-icon {
                    font-size: 14px;
                }
                
                .pill-name {
                    font-size: 11px;
                    max-width: 60px;
                }
                
                .pill-count {
                    font-size: 10px;
                }
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
        
        // Fermer les modales
        this.closeModal();
        
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

console.log('[PageManager] 🚀 Création nouvelle instance v17.0...');
window.pageManager = new PageManager();

// Exposer les méthodes globalement pour les onclick
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v17.0 loaded - Affichage newsletter amélioré! 📰');
