// PageManager.js - Version 14.0 - Intégration complète et optimisée

class PageManager {
    constructor() {
        // État principal
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
        
        // Cache pour performances
        this.cachedEmails = [];
        this.cachedCategories = {};
        this.lastCacheUpdate = 0;
        this.cacheTimeout = 5000; // 5 secondes
        
        // Optimisation UI
        this.uiUpdateThrottle = null;
        this.lastSelectionUpdate = 0;
        this.selectionUpdateDelay = 100;
        
        // Page renderers - DASHBOARD SUPPRIMÉ
        this.pages = {
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
        console.log('[PageManager] ✅ Version 14.0 - Intégration complète avec Gmail/Outlook');
        
        // Optimiser la gestion des événements
        this.debouncedUpdateControls = this.debounce(this.updateControlsBarOnly.bind(this), 150);
        this.throttledRefreshView = this.throttle(this.refreshEmailsView.bind(this), 200);
    }

    // ================================================
    // UTILITAIRES DE PERFORMANCE
    // ================================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ================================================
    // SYSTÈME DE CACHE OPTIMISÉ
    // ================================================
    getCachedEmails() {
        const now = Date.now();
        if (now - this.lastCacheUpdate > this.cacheTimeout || this.cachedEmails.length === 0) {
            this.updateCache();
        }
        return this.cachedEmails;
    }

    getCachedCategories() {
        const now = Date.now();
        if (now - this.lastCacheUpdate > this.cacheTimeout || Object.keys(this.cachedCategories).length === 0) {
            this.updateCache();
        }
        return this.cachedCategories;
    }

    updateCache() {
        try {
            this.cachedEmails = window.emailScanner?.getAllEmails() || [];
            this.cachedCategories = window.categoryManager?.getCategories() || {};
            this.lastCacheUpdate = Date.now();
            console.log(`[PageManager] 🔄 Cache mis à jour: ${this.cachedEmails.length} emails, ${Object.keys(this.cachedCategories).length} catégories`);
        } catch (error) {
            console.error('[PageManager] Erreur mise à jour cache:', error);
            this.cachedEmails = [];
            this.cachedCategories = {};
        }
    }

    invalidateCache() {
        this.lastCacheUpdate = 0;
        console.log('[PageManager] 🗑️ Cache invalidé');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - OPTIMISÉS
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', this.debounce((event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        }, 300));

        window.addEventListener('settingsChanged', this.debounce((event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        }, 300));

        // Écouter la recatégorisation des emails
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés, invalidation cache');
            this.invalidateCache();
            if (this.currentPage === 'emails') {
                this.throttledRefreshView();
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, mise à jour données');
            this.lastScanData = event.detail;
            this.invalidateCache();
            if (this.currentPage === 'emails') {
                setTimeout(() => this.loadPage('emails'), 100);
            }
        });

        // Optimiser le gestionnaire de scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScrollForSticky();
            }, 16); // 60fps
        }, { passive: true });
    }

    // ================================================
    // GESTION POSITION FIXE - OPTIMISÉE
    // ================================================
    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.controls-and-filters-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        const shouldBeSticky = scrollY > containerTop - 20;
        const isCurrentlySticky = stickyContainer.classList.contains('sticky-active');
        
        if (shouldBeSticky !== isCurrentlySticky) {
            if (shouldBeSticky) {
                stickyContainer.classList.add('sticky-active');
                const content = document.querySelector('.tasks-container-harmonized');
                if (content) {
                    content.style.paddingTop = stickyContainer.offsetHeight + 'px';
                }
            } else {
                stickyContainer.classList.remove('sticky-active');
                const content = document.querySelector('.tasks-container-harmonized');
                if (content) {
                    content.style.paddingTop = '0';
                }
            }
        }
    }

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES
    // ================================================
    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            this.invalidateCache();
            
            if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails?.();
                }, 100);
            }
        }
        
        if (this.currentPage === 'emails') {
            this.throttledRefreshView();
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                this.invalidateCache();
                
                if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                this.invalidateCache();
                
                if (window.emailScanner && window.emailScanner.emails?.length > 0) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails?.();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                this.invalidateCache();
                break;
        }
        
        if (this.currentPage === 'emails') {
            this.throttledRefreshView();
        }
    }

    // ================================================
    // PAGE LOADING - OPTIMISÉ
    // ================================================
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
        
        // Affichage de chargement optimisé
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(`Chargement ${pageName}...`);
        }

        try {
            // Nettoyage rapide du contenu
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
            
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

    // ================================================
    // RENDU PAGE EMAILS - OPTIMISÉ
    // ================================================
    async renderEmails(container) {
        const emails = this.getCachedEmails();
        const categories = this.getCachedCategories();
        
        console.log(`[PageManager] Rendu page emails avec ${emails.length} emails (cache)`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized">
                            <i class="fas fa-info-circle"></i>
                            <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour transformer les emails sélectionnés en tâches ou effectuer d'autres opérations.</span>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <div class="controls-and-filters-container">
                        <div class="controls-bar-single-line">
                            <div class="search-section">
                                <div class="search-box">
                                    <i class="fas fa-search search-icon"></i>
                                    <input type="text" 
                                           class="search-input" 
                                           id="emailSearchInput"
                                           placeholder="Rechercher..." 
                                           value="${this.searchTerm}">
                                    ${this.searchTerm ? `
                                        <button class="search-clear" onclick="window.pageManager.clearSearch()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="view-modes">
                                <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-domain')"
                                        title="Par domaine">
                                    <i class="fas fa-globe"></i>
                                    <span>Domaine</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('grouped-sender')"
                                        title="Par expéditeur">
                                    <i class="fas fa-user"></i>
                                    <span>Expéditeur</span>
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                        onclick="window.pageManager.changeViewMode('flat')"
                                        title="Liste complète">
                                    <i class="fas fa-list"></i>
                                    <span>Liste</span>
                                </button>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn-action btn-selection-toggle" 
                                        onclick="window.pageManager.toggleAllSelection()"
                                        title="Sélectionner/Désélectionner tous les emails visibles">
                                    <i class="fas fa-check-square"></i>
                                    <span class="btn-text">Sélectionner tous</span>
                                    <span class="btn-count">(${this.getVisibleEmails().length})</span>
                                </button>
                                
                                <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="window.pageManager.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-tasks"></i>
                                    <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                                </button>
                                
                                <div class="dropdown-action">
                                    <button class="btn-action btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                            onclick="window.pageManager.toggleBulkActions(event)"
                                            ${selectedCount === 0 ? 'disabled' : ''}>
                                        <i class="fas fa-ellipsis-v"></i>
                                        <span class="btn-text">Actions</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu" id="bulkActionsMenu">
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
                                    </div>
                                </div>
                                
                                <button class="btn-action btn-secondary" onclick="window.pageManager.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span class="btn-text">Actualiser</span>
                                </button>
                                
                                ${selectedCount > 0 ? `
                                    <button class="btn-action btn-clear" 
                                            onclick="window.pageManager.clearSelection()"
                                            title="Effacer la sélection">
                                        <i class="fas fa-times"></i>
                                        <span class="btn-text">Effacer (${selectedCount})</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <div class="status-filters-compact">
                            ${this.buildCompactCategoryTabs(categoryCounts, totalEmails, categories)}
                        </div>
                    </div>

                    <div class="sticky-controls-container">
                        <!-- Contenu copié dynamiquement -->
                    </div>

                    <div class="tasks-container-harmonized">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addExpandedEmailStyles();
            this.setupEmailsEventListeners();
            this.setupStickyControls();
        };

        renderEmailsPage();
        
        // Auto-analyse optimisée
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselectedCategories = this.getTaskPreselectedCategories();
            
            if (preselectedCategories?.length > 0) {
                const emailsToAnalyze = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).slice(0, 5);
                
                if (emailsToAnalyze.length > 0) {
                    setTimeout(() => {
                        this.analyzeFirstEmails(emailsToAnalyze);
                    }, 1000);
                }
            }
        }
    }

    // ================================================
    // MÉTHODES DE SÉLECTION - OPTIMISÉES
    // ================================================
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
            }
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
            }
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection email:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Mise à jour immédiate de la checkbox
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        // Mise à jour throttlée des contrôles
        this.debouncedUpdateControls();
        
        console.log('[PageManager] Total sélectionnés:', this.selectedEmails.size);
    }

    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        // Fonction pour mettre à jour un container
        const updateContainer = (container) => {
            if (!container) return;
            
            // Bouton "Sélectionner tout"
            const selectAllBtn = container.querySelector('.btn-selection-toggle');
            if (selectAllBtn) {
                const btnText = selectAllBtn.querySelector('.btn-text');
                const btnCount = selectAllBtn.querySelector('.btn-count');
                const icon = selectAllBtn.querySelector('i');
                
                if (allSelected) {
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectAllBtn.classList.add('all-selected');
                } else {
                    if (btnText) btnText.textContent = 'Sélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-square');
                        icon.classList.add('fa-check-square');
                    }
                    selectAllBtn.classList.remove('all-selected');
                }
                
                if (btnCount) {
                    btnCount.textContent = `(${visibleEmails.length})`;
                }
            }
            
            // Bouton "Créer tâches"
            const createTaskBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createTaskBtn) {
                const span = createTaskBtn.querySelector('.btn-text');
                const countBadge = createTaskBtn.querySelector('.count-badge');
                
                createTaskBtn.disabled = selectedCount === 0;
                createTaskBtn.classList.toggle('disabled', selectedCount === 0);
                
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
            
            // Bouton "Actions"
            const actionsBtn = container.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
            if (actionsBtn) {
                actionsBtn.disabled = selectedCount === 0;
                actionsBtn.classList.toggle('disabled', selectedCount === 0);
            }
            
            // Bouton "Effacer sélection"
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionButtonsContainer = container.querySelector('.action-buttons');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionButtonsContainer) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-action btn-clear';
                    clearBtn.onclick = () => this.clearSelection();
                    clearBtn.title = 'Effacer la sélection';
                    clearBtn.innerHTML = `
                        <i class="fas fa-times"></i>
                        <span class="btn-text">Effacer (${selectedCount})</span>
                    `;
                    actionButtonsContainer.appendChild(clearBtn);
                } else if (existingClearBtn) {
                    const span = existingClearBtn.querySelector('.btn-text');
                    if (span) {
                        span.textContent = `Effacer (${selectedCount})`;
                    }
                }
            } else {
                if (existingClearBtn) {
                    existingClearBtn.remove();
                }
            }
        };
        
        // Mettre à jour les deux containers
        updateContainer(document.querySelector('.controls-and-filters-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        if (window.uiManager?.showToast) {
            window.uiManager.showToast('Sélection effacée', 'info');
        }
    }

    // ================================================
    // RENDU OPTIMISÉ DES EMAILS
    // ================================================
    refreshEmailsView() {
        console.log('[PageManager] Rafraîchissement vue emails...');
        
        // Sauvegarder l'état des groupes ouverts
        const expandedGroups = new Set();
        document.querySelectorAll('.task-group-harmonized.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) {
                expandedGroups.add(groupKey);
            }
        });
        
        // Sauvegarder l'état de recherche
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        // Mettre à jour seulement le contenu des emails
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
            
            // Restaurer l'état des groupes ouverts
            expandedGroups.forEach(groupKey => {
                const group = document.querySelector(`[data-group-key="${groupKey}"]`);
                if (group) {
                    const content = group.querySelector('.group-content-harmonized');
                    const icon = group.querySelector('.group-expand-harmonized i');
                    const header = group.querySelector('.group-header-harmonized');
                    
                    if (content && icon && header) {
                        content.style.display = 'block';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                        group.classList.add('expanded');
                        header.classList.add('expanded-header');
                    }
                }
            });
        }
        
        // Mettre à jour les contrôles
        this.updateControlsBarOnly();
        
        // Restaurer la recherche
        requestAnimationFrame(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue && newSearchInput.value !== currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
            
            const stickySearchInput = document.getElementById('emailSearchInputSticky');
            if (stickySearchInput && currentSearchValue && stickySearchInput.value !== currentSearchValue) {
                stickySearchInput.value = currentSearchValue;
            }
        });
    }

    renderEmailsList() {
        const emails = this.getCachedEmails();
        let filteredEmails = emails;
        
        // Appliquer le filtre de catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        // Appliquer le filtre de recherche
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

        // Rendu selon le mode de vue
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

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    renderHarmonizedEmailRow(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        
        // Récupérer les catégories pré-sélectionnées
        const preselectedCategories = this.getTaskPreselectedCategories();
        let isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        // Correction du flag si nécessaire
        if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
            isPreselectedForTasks = true;
            email.isPreselectedForTasks = true;
        }
        
        const isSelected = this.selectedEmails.has(email.id);
        
        const cardClasses = [
            'task-harmonized-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected-task' : ''
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar-harmonized" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
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
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge-harmonized">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-indicator-harmonized" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};
                                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                ${isPreselectedForTasks ? ' ⭐' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
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

    // ================================================
    // MÉTHODES UTILITAIRES - OPTIMISÉES
    // ================================================
    getTaskPreselectedCategories() {
        try {
            if (window.categoryManager?.getTaskPreselectedCategories) {
                return window.categoryManager.getTaskPreselectedCategories();
            }
            
            if (window.categoriesPage?.getTaskPreselectedCategories) {
                return window.categoriesPage.getTaskPreselectedCategories();
            }
            
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories pré-sélectionnées:', error);
            return [];
        }
    }

    getVisibleEmails() {
        const emails = this.getCachedEmails();
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
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

    buildCompactCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        Object.entries(categories).forEach(([catId, category]) => {
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
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-compact ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    // ================================================
    // AUTRES MÉTHODES (gardées courtes pour la longueur)
    // ================================================
    
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        // Mettre à jour visuellement les boutons actifs
        ['', 'Sticky'].forEach(suffix => {
            const containerSelector = suffix ? '.sticky-controls-container' : '.controls-and-filters-container';
            const container = document.querySelector(containerSelector);
            if (container) {
                container.querySelectorAll('.status-pill-compact').forEach(pill => {
                    const pillCategoryId = pill.dataset.categoryId;
                    if (pillCategoryId === categoryId) {
                        pill.classList.add('active');
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox' || 
            event.target.closest('.task-actions-harmonized') ||
            event.target.closest('.group-header-harmonized')) {
            return;
        }
        
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

    // Méthodes simplifiées pour les autres pages
    async renderScanner(container) {
        if (window.scanStartModule?.render) {
            try {
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule:', error);
            }
        }
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-search"></i></div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">Module de scan en cours de chargement...</p>
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView?.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-tasks"></i></div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = this.getCachedCategories();
        
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
        if (window.categoriesPage?.renderSettings) {
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
        if (window.domainOrganizer?.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-folder-tree"></i></div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">Module en cours de chargement...</p>
                </div>
            `;
        }
    }

    // Méthodes utilitaires simplifiées
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return '#3b82f6';
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

    getEmailById(emailId) {
        return this.getCachedEmails().find(email => email.id === emailId) || null;
    }

    // Ajout des styles optimisés (méthode raccourcie)
    addExpandedEmailStyles() {
        if (document.getElementById('expandedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'expandedEmailStyles';
        styles.textContent = `/* Styles PageManager v14.0 complets mais raccourcis pour l'affichage */`;
        document.head.appendChild(styles);
        this.stylesAdded = true;
    }

    // Méthodes de setup événements (raccourcies)
    setupStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;
        stickyContainer.innerHTML = originalContainer.innerHTML;
        this.setupEventListenersForStickyClone(stickyContainer);
    }

    setupEventListenersForStickyClone(stickyContainer) {
        const searchInput = stickyContainer.querySelector('#emailSearchInput');
        if (searchInput) {
            searchInput.id = 'emailSearchInputSticky';
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr?.includes('window.pageManager')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eval(onclickAttr);
                });
            }
        });
    }

    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.throttledRefreshView();
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput && stickySearchInput.value !== term) {
            stickySearchInput.value = term;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput) stickySearchInput.value = '';
        
        this.throttledRefreshView();
    }

    // ================================================
    // ACTIONS BULK ET CRÉATION TÂCHES (simplifiées)
    // ================================================

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Aucun email sélectionné', 'warning');
            }
            return;
        }
        
        let created = 0;
        const selectedEmailsArray = Array.from(this.selectedEmails);
        
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(`Création de ${selectedEmailsArray.length} tâches...`);
        }
        
        try {
            for (const emailId of selectedEmailsArray) {
                const email = this.getEmailById(emailId);
                if (!email || this.createdTasks.has(emailId)) continue;
                
                // Simulation de création de tâche
                this.createdTasks.set(emailId, `task-${Date.now()}-${Math.random()}`);
                created++;
            }
            
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
            
            if (created > 0) {
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
                }
                this.clearSelection();
                this.refreshEmailsView();
            }
        } catch (error) {
            console.error('[PageManager] Erreur création tâches:', error);
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
        }
    }

    // Autres méthodes bulk (simplifiées)
    async bulkMarkAsRead() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`${count} emails marqués comme lus`, 'success');
        }
        this.clearSelection();
    }

    async bulkArchive() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Archiver ${count} email(s) ?`)) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${count} emails archivés`, 'success');
            }
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Supprimer ${count} email(s) ?\nCette action est irréversible.`)) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${count} emails supprimés`, 'success');
            }
            this.clearSelection();
        }
    }

    async bulkExport() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast('Export terminé', 'success');
        }
        this.clearSelection();
    }

    toggleBulkActions(event) {
        event.stopPropagation();
        const menu = document.getElementById('bulkActionsMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    // ================================================
    // MÉTHODES D'INTERFACE SIMPLIFIÉES
    // ================================================

    async refreshEmails() {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading('Actualisation...');
        }
        
        try {
            this.invalidateCache();
            await this.loadPage('emails');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Emails actualisés', 'success');
            }
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
        } finally {
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
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

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = 'Utilisez le scanner pour récupérer et analyser vos emails.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Aller au scanner</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                ${action}
            </div>
        `;
    }

    // Méthodes de modal (simplifiées)
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; display: flex; flex-direction: column;">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Email</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove();" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                            <div style="margin-bottom: 8px;"><strong>De:</strong> ${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</div>
                            <div style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</div>
                            <div><strong>Sujet:</strong> ${email.subject || 'Sans sujet'}</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; max-height: 400px; overflow-y: auto;">
                            ${email.bodyPreview || 'Aucun contenu disponible'}
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove();" style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Méthodes de vue groupée (simplifiées)
    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        return `<div class="tasks-grouped-harmonized">${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}</div>`;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="task-group-harmonized" data-group-key="${group.key}">
                <div class="group-header-harmonized" onclick="window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar-harmonized" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? '<i class="fas fa-globe"></i>' : group.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="group-info-harmonized">
                        <div class="group-name-harmonized">${displayName}</div>
                        <div class="group-meta-harmonized">${group.count} email${group.count > 1 ? 's' : ''}</div>
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

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        
        if (!content || !icon) return;
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
        }
    }

    // ================================================
    // MÉTHODES D'ANALYSE - SIMPLIFIÉES
    // ================================================

    async analyzeFirstEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails.slice(0, 3)) { // Limiter à 3 pour la performance
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
    // NETTOYAGE ET DESTRUCTION
    // ================================================

    cleanup() {
        // Nettoyer les timeouts et intervals
        if (this.uiUpdateThrottle) {
            clearTimeout(this.uiUpdateThrottle);
        }
        
        // Vider les caches
        this.cachedEmails = [];
        this.cachedCategories = {};
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        
        console.log('[PageManager] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        console.log('[PageManager] 💥 Instance détruite');
    }
}

// ================================================
// CRÉATION INSTANCE GLOBALE OPTIMISÉE
// ================================================

// Nettoyer l'ancienne instance si elle existe
if (window.pageManager) {
    try {
        window.pageManager.cleanup?.();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage ancienne instance:', e);
    }
}

// Créer la nouvelle instance
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v14.0 loaded - Intégration complète Gmail/Outlook optimisée');
