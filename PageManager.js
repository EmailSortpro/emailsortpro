// PageManager.js - Version 15.0 - Restructuré avec intégration complète et optimisé

class PageManager {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = 'all';
        
        // Cache optimisé pour performances
        this.cachedEmails = [];
        this.cachedCategories = {};
        this.lastCacheUpdate = 0;
        this.cacheTimeout = 3000; // 3 secondes
        
        // Intégration avec les autres modules
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // Optimisation UI
        this.uiUpdateThrottle = null;
        this.lastSelectionUpdate = 0;
        this.selectionUpdateDelay = 100;
        
        // Page renderers optimisés
        this.pages = {
            scanner: (container) => this.renderScannerPage(container),
            emails: (container) => this.renderEmailsPage(container),
            tasks: (container) => this.renderTasksPage(container),
            categories: (container) => this.renderCategoriesPage(container),
            settings: (container) => this.renderSettingsPage(container),
            ranger: (container) => this.renderRangerPage(container)
        };
        
        // Initialisation
        this.setupEventListeners();
        this.loadSettingsFromCategoryManager();
        this.initializeOptimizations();
        
        console.log('[PageManager] ✅ Version 15.0 - Restructuré avec intégration complète');
    }

    // ================================================
    // INITIALISATION ET CONFIGURATION
    // ================================================
    
    initializeOptimizations() {
        // Optimiser la gestion des événements
        this.debouncedUpdateControls = this.debounce(this.updateControlsBarOnly.bind(this), 150);
        this.throttledRefreshView = this.throttle(this.refreshEmailsView.bind(this), 200);
        this.debouncedSearch = this.debounce(this.performSearch.bind(this), 300);
        
        // Précharger les styles
        this.addPageStyles();
        
        console.log('[PageManager] 🚀 Optimisations initialisées');
    }

    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                
                console.log('[PageManager] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[PageManager] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
            } else {
                return this.loadSettingsFromFallback();
            }
        } catch (error) {
            console.error('[PageManager] Erreur chargement CategoryManager:', error);
            return this.loadSettingsFromFallback();
        }
    }

    loadSettingsFromFallback() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[PageManager] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[PageManager] 📝 Utilisation paramètres par défaut');
            }
            
            this.lastSettingsSync = Date.now();
            return true;
        } catch (error) {
            console.error('[PageManager] Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
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
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    
    setupEventListeners() {
        // Écouter les changements de paramètres avec debounce
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
            console.log('[PageManager] 📧 Emails recatégorisés, invalidation cache');
            this.invalidateCache();
            if (this.currentPage === 'emails') {
                this.throttledRefreshView();
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] 🔍 Scan terminé, mise à jour données');
            this.lastScanData = event.detail;
            this.invalidateCache();
            if (this.currentPage === 'emails') {
                setTimeout(() => this.loadPage('emails'), 100);
            }
        });

        // Gestionnaire de scroll optimisé pour sticky controls
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScrollForSticky();
            }, 16); // 60fps
        }, { passive: true });

        // Écouter les changements de localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[PageManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
            }
        });
    }

    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            this.taskPreselectedCategories = [...settingsData.settings.taskPreselectedCategories];
            this.invalidateCache();
            
            // Déclencher une re-catégorisation si nécessaire
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
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
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

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.loadSettingsFromCategoryManager();
        
        const changes = this.detectSettingsChanges(oldSettings, this.settings);
        changes.forEach(change => {
            this.handleGenericSettingsChanged({ type: change.type, value: change.value });
        });
    }

    detectSettingsChanges(oldSettings, newSettings) {
        const changes = [];
        const criticalFields = [
            'taskPreselectedCategories',
            'activeCategories', 
            'categoryExclusions',
            'scanSettings',
            'automationSettings',
            'preferences'
        ];
        
        criticalFields.forEach(field => {
            const oldValue = JSON.stringify(oldSettings[field] || {});
            const newValue = JSON.stringify(newSettings[field] || {});
            
            if (oldValue !== newValue) {
                changes.push({
                    type: field,
                    value: newSettings[field],
                    oldValue: oldSettings[field]
                });
            }
        });
        
        return changes;
    }

    // ================================================
    // GESTION DES PAGES
    // ================================================
    
    async loadPage(pageName) {
        console.log(`[PageManager] 📄 Chargement page: ${pageName}`);

        // IGNORER complètement le dashboard - géré par index.html
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
        
        // Affichage de chargement
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(`Chargement ${pageName}...`);
        }

        try {
            // Nettoyage du contenu précédent
            pageContent.innerHTML = '';
            pageContent.className = 'page-content';
            
            // Charger la page appropriée
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
                
                // Post-traitement selon la page
                this.handlePageSpecificSetup(pageName);
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }

        } catch (error) {
            console.error(`[PageManager] ❌ Erreur chargement page ${pageName}:`, error);
            
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
            
            pageContent.innerHTML = this.renderErrorPage(error, pageName);
        }
    }

    handlePageSpecificSetup(pageName) {
        switch (pageName) {
            case 'emails':
                this.setupEmailsSpecificFeatures();
                break;
            case 'scanner':
                this.setupScannerSpecificFeatures();
                break;
            case 'tasks':
                this.setupTasksSpecificFeatures();
                break;
            case 'categories':
                this.setupCategoriesSpecificFeatures();
                break;
            case 'settings':
                this.setupSettingsSpecificFeatures();
                break;
            case 'ranger':
                this.setupRangerSpecificFeatures();
                break;
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

    renderErrorPage(error, pageName) {
        return `
            <div class="error-page">
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="error-title">Erreur de chargement</h2>
                    <p class="error-message">${this.escapeHtml(error.message)}</p>
                    <div class="error-details">Page: ${pageName}</div>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('${pageName}')">
                            <i class="fas fa-redo"></i>
                            Réessayer
                        </button>
                        <button class="btn btn-secondary" onclick="window.pageManager.loadPage('dashboard')">
                            <i class="fas fa-home"></i>
                            Tableau de bord
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU DES PAGES SPÉCIFIQUES
    // ================================================
    
    async renderScannerPage(container) {
        console.log('[PageManager] 🔍 Rendu page scanner');
        
        if (window.scanStartModule?.render) {
            try {
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule:', error);
            }
        }
        
        // Fallback si le module scanner n'est pas disponible
        container.innerHTML = `
            <div class="page-fallback">
                <div class="fallback-content">
                    <div class="fallback-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h2 class="fallback-title">Scanner d'emails</h2>
                    <p class="fallback-text">Module de scan en cours de chargement...</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        Recharger
                    </button>
                </div>
            </div>
        `;
    }

    async renderEmailsPage(container) {
        console.log('[PageManager] 📧 Rendu page emails');
        
        const emails = this.getCachedEmails();
        const categories = this.getCachedCategories();
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Synchroniser les catégories pré-sélectionnées
        this.syncTaskPreselectedCategories();

        const categoryCounts = this.calculateCategoryCounts(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        
        container.innerHTML = `
            <div class="emails-page">
                ${!this.hideExplanation ? this.renderExplanationBanner() : ''}
                
                <div class="emails-controls-container">
                    ${this.renderEmailsControls(categoryCounts, totalEmails, categories, selectedCount)}
                </div>

                <div class="sticky-controls-container">
                    <!-- Contenu copié dynamiquement -->
                </div>

                <div class="emails-content-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.setupEmailsEventListeners();
        this.setupStickyControls();
        
        // Auto-analyse optimisée si activée
        if (this.settings.scanSettings?.autoAnalyze && emails.length > 0) {
            setTimeout(() => this.performAutoAnalysis(emails), 1000);
        }
    }

    async renderTasksPage(container) {
        console.log('[PageManager] ✅ Rendu page tâches');
        
        if (window.tasksView?.render) {
            try {
                window.tasksView.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur TasksView:', error);
            }
        }
        
        // Fallback simple
        const tasksCount = this.createdTasks.size;
        container.innerHTML = `
            <div class="page-fallback">
                <div class="fallback-content">
                    <div class="fallback-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h2 class="fallback-title">Tâches (${tasksCount})</h2>
                    <p class="fallback-text">
                        ${tasksCount > 0 ? 
                            `Vous avez ${tasksCount} tâche${tasksCount > 1 ? 's' : ''} créée${tasksCount > 1 ? 's' : ''} depuis les emails.` :
                            'Créez des tâches à partir de vos emails dans la section Emails.'
                        }
                    </p>
                    ${tasksCount === 0 ? `
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async renderCategoriesPage(container) {
        console.log('[PageManager] 🏷️ Rendu page catégories');
        
        if (window.categoriesPage?.renderSettings) {
            try {
                window.categoriesPage.renderSettings(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur CategoriesPage:', error);
            }
        }
        
        // Fallback - affichage basique des catégories
        const categories = this.getCachedCategories();
        const preselectedCategories = this.taskPreselectedCategories;
        
        container.innerHTML = `
            <div class="page-fallback">
                <div class="fallback-content">
                    <h2 class="fallback-title">Catégories</h2>
                    <p class="fallback-text">Gestion des catégories d'emails</p>
                    
                    <div class="categories-grid">
                        ${Object.entries(categories).map(([id, cat]) => `
                            <div class="category-card ${preselectedCategories.includes(id) ? 'preselected' : ''}">
                                <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                                    ${cat.icon}
                                </div>
                                <h3 class="category-name">${cat.name}</h3>
                                <p class="category-description">${cat.description || ''}</p>
                                ${preselectedCategories.includes(id) ? 
                                    '<div class="preselected-badge">⭐ Pré-sélectionnée</div>' : 
                                    ''
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async renderSettingsPage(container) {
        console.log('[PageManager] ⚙️ Rendu page paramètres');
        
        if (window.categoriesPage?.renderSettings) {
            try {
                window.categoriesPage.renderSettings(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur page paramètres:', error);
            }
        }
        
        // Fallback paramètres basiques
        container.innerHTML = `
            <div class="page-fallback">
                <div class="fallback-content">
                    <h2 class="fallback-title">Paramètres</h2>
                    <p class="fallback-text">Configuration de l'application</p>
                    
                    <div class="settings-card">
                        <h3>Configuration IA</h3>
                        <p>Configurez l'analyseur IA pour la création automatique de tâches</p>
                        <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                            <i class="fas fa-cog"></i>
                            Configurer Claude AI
                        </button>
                    </div>
                    
                    <div class="settings-card">
                        <h3>Catégories pré-sélectionnées</h3>
                        <p>Catégories actuellement pré-sélectionnées pour la création de tâches :</p>
                        <div class="preselected-list">
                            ${this.taskPreselectedCategories.map(catId => {
                                const cat = window.categoryManager?.getCategory(catId);
                                return cat ? `
                                    <span class="category-badge" style="background: ${cat.color}20; color: ${cat.color}">
                                        ${cat.icon} ${cat.name}
                                    </span>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderRangerPage(container) {
        console.log('[PageManager] 📁 Rendu page ranger');
        
        if (window.domainOrganizer?.showPage) {
            try {
                window.domainOrganizer.showPage(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur DomainOrganizer:', error);
            }
        }
        
        // Fallback
        container.innerHTML = `
            <div class="page-fallback">
                <div class="fallback-content">
                    <div class="fallback-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h2 class="fallback-title">Ranger par domaine</h2>
                    <p class="fallback-text">Module de rangement en cours de chargement...</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        Recharger
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // COMPOSANTS DE LA PAGE EMAILS
    // ================================================
    
    renderExplanationBanner() {
        return `
            <div class="explanation-banner">
                <div class="explanation-content">
                    <i class="fas fa-info-circle"></i>
                    <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour créer des tâches ou effectuer d'autres opérations.</span>
                </div>
                <button class="explanation-close" onclick="window.pageManager.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderEmailsControls(categoryCounts, totalEmails, categories, selectedCount) {
        return `
            <div class="controls-bar">
                <div class="search-section">
                    <div class="search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="emailSearchInput"
                               placeholder="Rechercher emails..." 
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
                            title="Grouper par domaine">
                        <i class="fas fa-globe"></i>
                        <span>Domaine</span>
                    </button>
                    <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                            onclick="window.pageManager.changeViewMode('grouped-sender')"
                            title="Grouper par expéditeur">
                        <i class="fas fa-user"></i>
                        <span>Expéditeur</span>
                    </button>
                    <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                            onclick="window.pageManager.changeViewMode('flat')"
                            title="Liste simple">
                        <i class="fas fa-list"></i>
                        <span>Liste</span>
                    </button>
                </div>
                
                <div class="action-buttons">
                    ${this.renderActionButtons(selectedCount)}
                </div>
            </div>

            <div class="category-filters">
                ${this.renderCategoryTabs(categoryCounts, totalEmails, categories)}
            </div>
        `;
    }

    renderActionButtons(selectedCount) {
        const visibleCount = this.getVisibleEmails().length;
        const allSelected = visibleCount > 0 && this.getVisibleEmails().every(email => this.selectedEmails.has(email.id));
        
        return `
            <button class="btn-action btn-selection-toggle" 
                    onclick="window.pageManager.toggleAllSelection()"
                    title="Sélectionner/Désélectionner tous les emails visibles">
                <i class="fas ${allSelected ? 'fa-square' : 'fa-check-square'}"></i>
                <span class="btn-text">${allSelected ? 'Désélectionner' : 'Sélectionner'} tous</span>
                <span class="btn-count">(${visibleCount})</span>
            </button>
            
            <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                    onclick="window.pageManager.createTasksFromSelection()"
                    ${selectedCount === 0 ? 'disabled' : ''}
                    title="Créer des tâches depuis les emails sélectionnés">
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
                    ${this.renderBulkActionsMenu()}
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
        `;
    }

    renderBulkActionsMenu() {
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

    renderCategoryTabs(categoryCounts, totalEmails, categories) {
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
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: this.taskPreselectedCategories.includes(catId)
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
        
        return tabs.map(tab => {
            const isActive = this.currentCategory === tab.id;
            const classes = `category-tab ${isActive ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}`;
            
            return `
                <button class="${classes}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="tab-content">
                        <div class="tab-header">
                            <span class="tab-icon">${tab.icon}</span>
                            <span class="tab-count">${tab.count}</span>
                        </div>
                        <div class="tab-name">${tab.name}</div>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    // ================================================
    // RENDU DES EMAILS
    // ================================================
    
    renderEmailsList() {
        const emails = this.getFilteredEmails();
        
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
            <div class="emails-list-flat">
                ${emails.map(email => this.renderEmailCard(email)).join('')}
            </div>
        `;
    }

    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        return `
            <div class="emails-list-grouped">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const isPreselected = this.isEmailPreselectedForTasks(email);
        const senderName = this.getEmailSenderName(email);
        const categoryInfo = this.getEmailCategoryInfo(email);
        
        const cardClasses = [
            'email-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselected ? 'preselected' : ''
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="email-priority-bar" 
                     style="background-color: ${this.getEmailPriorityColor(email)}"></div>
                
                <div class="email-content">
                    <div class="email-header">
                        <h3 class="email-subject">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="email-type-badge">📧</span>
                            <span class="email-date">${this.formatEmailDate(email.receivedDateTime)}</span>
                            ${email.categoryScore ? `
                                <span class="confidence-badge">
                                    🎯 ${Math.round(email.categoryConfidence * 100)}%
                                </span>
                            ` : ''}
                            ${isPreselected ? `
                                <span class="preselected-badge">⭐ Pré-sélectionné</span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <i class="fas fa-envelope"></i>
                        <span class="sender-name">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="attachment-indicator">📎</span>' : ''}
                        ${categoryInfo ? `
                            <span class="category-badge" 
                                  style="background: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                                ${categoryInfo.icon} ${categoryInfo.name}
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
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="email-action-btn create-task" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="email-action-btn view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche créée">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="email-action-btn view-email" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                    title="Voir l'email">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
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
                        <div class="group-meta">${group.count} email${group.count > 1 ? 's' : ''}</div>
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

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    Effacer la recherche
                </button>
            `;
        } else if (this.currentCategory !== 'all') {
            title = 'Aucun email dans cette catégorie';
            text = 'Aucun email trouvé pour la catégorie sélectionnée.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    Voir tous les emails
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = 'Utilisez le scanner pour récupérer et analyser vos emails.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title">${title}</h3>
                <p class="empty-text">${text}</p>
                ${action}
            </div>
        `;
    }

    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title">Aucun email scanné</h3>
                <p class="empty-text">
                    Commencez par scanner vos emails pour les analyser et les organiser automatiquement.
                </p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Scanner mes emails
                </button>
            </div>
        `;
    }

    // ================================================
    // LOGIQUE MÉTIER - EMAILS
    // ================================================
    
    getFilteredEmails() {
        let emails = this.getCachedEmails();
        
        // Filtre par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                emails = emails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                emails = emails.filter(email => email.category === this.currentCategory);
            }
        }
        
        // Filtre par recherche
        if (this.searchTerm) {
            emails = emails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return emails;
    }

    getVisibleEmails() {
        return this.getFilteredEmails();
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

    isEmailPreselectedForTasks(email) {
        return this.taskPreselectedCategories.includes(email.category) || email.isPreselectedForTasks === true;
    }

    getEmailSenderName(email) {
        return email.from?.emailAddress?.name || 
               email.from?.emailAddress?.address || 
               'Expéditeur inconnu';
    }

    getEmailCategoryInfo(email) {
        if (!email.category || email.category === 'other') return null;
        
        const category = window.categoryManager?.getCategory(email.category);
        return category ? {
            id: email.category,
            name: category.name,
            icon: category.icon,
            color: category.color
        } : null;
    }

    getEmailPriorityColor(email) {
        if (this.isEmailPreselectedForTasks(email)) return '#8b5cf6';
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return '#3b82f6';
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

    syncTaskPreselectedCategories() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 2000) return; // Éviter les sync trop fréquentes
        
        try {
            if (window.categoryManager?.getTaskPreselectedCategories) {
                const freshCategories = window.categoryManager.getTaskPreselectedCategories();
                const oldCategories = [...this.taskPreselectedCategories];
                
                this.taskPreselectedCategories = [...freshCategories];
                
                // Si changement détecté, actualiser l'affichage
                if (JSON.stringify(oldCategories.sort()) !== JSON.stringify(freshCategories.sort())) {
                    console.log('[PageManager] 🔄 Catégories pré-sélectionnées mises à jour:', freshCategories);
                    this.lastSettingsSync = now;
                    return true;
                }
            }
        } catch (error) {
            console.error('[PageManager] Erreur sync catégories:', error);
        }
        
        this.lastSettingsSync = now;
        return false;
    }

    // ================================================
    // GESTION DES INTERACTIONS
    // ================================================
    
    handleEmailClick(event, emailId) {
        // Ignorer les clics sur les éléments interactifs
        if (event.target.type === 'checkbox' || 
            event.target.closest('.email-actions') ||
            event.target.closest('.group-header')) {
            return;
        }
        
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        // Double-clic pour sélectionner
        if (now - lastClick < 300) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        this.lastEmailClick = now;
        
        // Clic simple pour voir l'email
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                this.showEmailModal(emailId);
            }
        }, 250);
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection email:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Mise à jour immédiate de la checkbox
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .email-checkbox`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        // Mise à jour des contrôles avec debounce
        this.debouncedUpdateControls();
        
        console.log('[PageManager] Total sélectionnés:', this.selectedEmails.size);
    }

    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && 
                           visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            // Désélectionner tous
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
            }
        } else {
            // Sélectionner tous
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
            }
        }
        
        this.refreshEmailsView();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        if (window.uiManager?.showToast) {
            window.uiManager.showToast('Sélection effacée', 'info');
        }
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        // Mettre à jour visuellement les onglets
        document.querySelectorAll('.category-tab').forEach(tab => {
            const tabCategoryId = tab.dataset.categoryId;
            if (tabCategoryId === categoryId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
        
        // Mettre à jour visuellement les boutons de vue
        document.querySelectorAll('.view-mode').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick*="changeViewMode('${mode}')"]`)?.classList.add('active');
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content');
        const icon = group.querySelector('.group-expand i');
        
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
    // GESTION DE LA RECHERCHE
    // ================================================
    
    performSearch(term) {
        this.searchTerm = term.trim();
        this.throttledRefreshView();
        
        // Synchroniser l'input sticky
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput && stickySearchInput.value !== term) {
            stickySearchInput.value = term;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        
        const searchInputs = document.querySelectorAll('#emailSearchInput, #emailSearchInputSticky');
        searchInputs.forEach(input => {
            if (input) input.value = '';
        });
        
        this.throttledRefreshView();
    }

    // ================================================
    // ACTIONS EN MASSE
    // ================================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Aucun email sélectionné', 'warning');
            }
            return;
        }
        
        const selectedEmailsArray = Array.from(this.selectedEmails);
        let created = 0;
        
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading(`Création de ${selectedEmailsArray.length} tâche${selectedEmailsArray.length > 1 ? 's' : ''}...`);
        }
        
        try {
            for (const emailId of selectedEmailsArray) {
                const email = this.getEmailById(emailId);
                if (!email || this.createdTasks.has(emailId)) continue;
                
                // Simulation de création de tâche - remplacer par l'implémentation réelle
                this.createdTasks.set(emailId, {
                    id: `task-${Date.now()}-${Math.random()}`,
                    title: email.subject || 'Tâche depuis email',
                    emailId: emailId,
                    createdAt: new Date().toISOString()
                });
                created++;
                
                // Petit délai pour l'UX
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
            
            if (created > 0) {
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast(
                        `${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} avec succès`, 
                        'success'
                    );
                }
                this.clearSelection();
                this.refreshEmailsView();
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur création tâches:', error);
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur lors de la création des tâches', 'error');
            }
        }
    }

    async bulkMarkAsRead() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        // Simulation - remplacer par l'implémentation réelle
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`${count} email${count > 1 ? 's' : ''} marqué${count > 1 ? 's' : ''} comme lu${count > 1 ? 's' : ''}`, 'success');
        }
        this.clearSelection();
    }

    async bulkArchive() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Archiver ${count} email${count > 1 ? 's' : ''} ?\nIls seront déplacés vers les archives.`)) {
            // Simulation - remplacer par l'implémentation réelle
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${count} email${count > 1 ? 's' : ''} archivé${count > 1 ? 's' : ''}`, 'success');
            }
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        if (confirm(`Supprimer définitivement ${count} email${count > 1 ? 's' : ''} ?\nCette action est irréversible.`)) {
            // Simulation - remplacer par l'implémentation réelle
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${count} email${count > 1 ? 's' : ''} supprimé${count > 1 ? 's' : ''}`, 'success');
            }
            this.clearSelection();
        }
    }

    async bulkExport() {
        const count = this.selectedEmails.size;
        if (count === 0) return;
        
        try {
            if (window.emailScanner?.exportResults) {
                window.emailScanner.exportResults('csv');
            } else {
                // Fallback simple
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast('Export terminé', 'success');
                }
            }
            this.clearSelection();
        } catch (error) {
            console.error('[PageManager] Erreur export:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    toggleBulkActions(event) {
        event.stopPropagation();
        const menu = document.getElementById('bulkActionsMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
        
        // Fermer le menu quand on clique ailleurs
        const closeMenu = (e) => {
            if (!e.target.closest('.dropdown-action')) {
                menu?.classList.remove('show');
                document.removeEventListener('click', closeMenu);
            }
        };
        
        if (menu?.classList.contains('show')) {
            setTimeout(() => {
                document.addEventListener('click', closeMenu);
            }, 10);
        }
    }

    // ================================================
    // GESTION DES MODALES ET ACTIONS SPÉCIFIQUES
    // ================================================
    
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            console.error('[PageManager] Email non trouvé:', emailId);
            return;
        }

        // Supprimer les modales existantes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const senderName = this.getEmailSenderName(email);
        const categoryInfo = this.getEmailCategoryInfo(email);
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay" onclick="this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <i class="fas fa-envelope"></i>
                            Email
                        </h2>
                        <button class="modal-close" onclick="document.getElementById('${uniqueId}').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="email-details">
                            <div class="detail-row">
                                <strong>De:</strong> 
                                <span>${this.escapeHtml(senderName)}</span>
                                ${email.from?.emailAddress?.address ? 
                                    `<span class="email-address">&lt;${this.escapeHtml(email.from.emailAddress.address)}&gt;</span>` : 
                                    ''
                                }
                            </div>
                            <div class="detail-row">
                                <strong>Date:</strong> 
                                <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Sujet:</strong> 
                                <span>${this.escapeHtml(email.subject || 'Sans sujet')}</span>
                            </div>
                            ${categoryInfo ? `
                                <div class="detail-row">
                                    <strong>Catégorie:</strong> 
                                    <span class="category-badge" style="background: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                                        ${categoryInfo.icon} ${categoryInfo.name}
                                    </span>
                                </div>
                            ` : ''}
                            ${email.hasAttachments ? `
                                <div class="detail-row">
                                    <strong>Pièces jointes:</strong> 
                                    <span class="attachment-indicator">📎 Oui</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="email-content">
                            <h4>Contenu de l'email</h4>
                            <div class="email-body">
                                ${email.bodyPreview || email.body?.content || 'Aucun contenu disponible'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('${uniqueId}').remove()">
                            Fermer
                        </button>
                        <button class="btn btn-primary" onclick="window.pageManager.showTaskCreationModal('${emailId}'); document.getElementById('${uniqueId}').remove();">
                            <i class="fas fa-tasks"></i>
                            Créer une tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Focus sur la modale pour l'accessibilité
        setTimeout(() => {
            const modal = document.getElementById(uniqueId);
            modal?.focus();
        }, 10);
    }

    showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            console.error('[PageManager] Email non trouvé pour création tâche:', emailId);
            return;
        }

        if (this.createdTasks.has(emailId)) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Une tâche existe déjà pour cet email', 'info');
            }
            return;
        }

        // Supprimer les modales existantes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_modal_' + Date.now();
        const suggestedTitle = email.subject || 'Tâche depuis email';
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay" onclick="event.target === this && this.remove()">
                <div class="modal-content task-creation-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <i class="fas fa-tasks"></i>
                            Créer une tâche
                        </h2>
                        <button class="modal-close" onclick="document.getElementById('${uniqueId}').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="taskTitle">Titre de la tâche</label>
                            <input type="text" 
                                   id="taskTitle" 
                                   class="form-control" 
                                   value="${this.escapeHtml(suggestedTitle)}"
                                   placeholder="Entrez le titre de la tâche">
                        </div>
                        
                        <div class="form-group">
                            <label for="taskDescription">Description</label>
                            <textarea id="taskDescription" 
                                      class="form-control" 
                                      rows="4"
                                      placeholder="Description optionnelle de la tâche">${email.bodyPreview ? this.escapeHtml(email.bodyPreview.substring(0, 200)) : ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="taskPriority">Priorité</label>
                                <select id="taskPriority" class="form-control">
                                    <option value="normal">Normale</option>
                                    <option value="high" ${email.importance === 'high' ? 'selected' : ''}>Élevée</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="taskDueDate">Échéance</label>
                                <input type="date" 
                                       id="taskDueDate" 
                                       class="form-control"
                                       min="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        
                        <div class="email-reference">
                            <h4>Email de référence</h4>
                            <div class="email-preview">
                                <div class="email-preview-header">
                                    <strong>${this.escapeHtml(email.subject || 'Sans sujet')}</strong>
                                    <span class="email-preview-meta">
                                        De: ${this.escapeHtml(this.getEmailSenderName(email))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('${uniqueId}').remove()">
                            Annuler
                        </button>
                        <button class="btn btn-primary" onclick="window.pageManager.createTaskFromModal('${emailId}', '${uniqueId}')">
                            <i class="fas fa-plus"></i>
                            Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Focus sur le champ titre
        setTimeout(() => {
            const titleInput = document.getElementById('taskTitle');
            titleInput?.focus();
            titleInput?.select();
        }, 10);
    }

    async createTaskFromModal(emailId, modalId) {
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const priorityInput = document.getElementById('taskPriority');
        const dueDateInput = document.getElementById('taskDueDate');
        
        const title = titleInput?.value?.trim();
        if (!title) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Le titre de la tâche est requis', 'warning');
            }
            titleInput?.focus();
            return;
        }

        const taskData = {
            id: `task-${Date.now()}-${Math.random()}`,
            title: title,
            description: descriptionInput?.value?.trim() || '',
            priority: priorityInput?.value || 'normal',
            dueDate: dueDateInput?.value || null,
            emailId: emailId,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // Simulation de création - remplacer par l'implémentation réelle
            this.createdTasks.set(emailId, taskData);
            
            // Fermer la modale
            document.getElementById(modalId)?.remove();
            
            // Notification de succès
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Tâche créée avec succès', 'success');
            }
            
            // Actualiser l'affichage
            this.refreshEmailsView();
            
            // Option: rediriger vers les tâches
            const shouldRedirect = await this.askUserRedirection();
            if (shouldRedirect) {
                setTimeout(() => {
                    this.loadPage('tasks');
                }, 500);
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur création tâche:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur lors de la création de la tâche', 'error');
            }
        }
    }

    async askUserRedirection() {
        return new Promise((resolve) => {
            const confirmed = confirm('Tâche créée avec succès !\n\nVoulez-vous voir vos tâches maintenant ?');
            resolve(confirmed);
        });
    }

    openCreatedTask(emailId) {
        const task = this.createdTasks.get(emailId);
        if (!task) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Tâche non trouvée', 'warning');
            }
            return;
        }

        // Si TasksView est disponible, l'utiliser
        if (window.tasksView?.showTaskDetail) {
            window.tasksView.showTaskDetail(task.id);
        } else {
            // Fallback: rediriger vers la page des tâches
            this.loadPage('tasks');
        }
    }

    // ================================================
    // RAFRAÎCHISSEMENT ET MISE À JOUR
    // ================================================
    
    refreshEmailsView() {
        console.log('[PageManager] 🔄 Rafraîchissement vue emails...');
        
        if (this.currentPage !== 'emails') {
            console.log('[PageManager] Page emails non active, pas de rafraîchissement');
            return;
        }
        
        // Sauvegarder l'état des groupes ouverts
        const expandedGroups = new Set();
        document.querySelectorAll('.email-group.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) {
                expandedGroups.add(groupKey);
            }
        });
        
        // Sauvegarder l'état de recherche
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        // Mettre à jour seulement le contenu des emails
        const emailsContainer = document.querySelector('.emails-content-container');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
            
            // Restaurer l'état des groupes ouverts
            expandedGroups.forEach(groupKey => {
                const group = document.querySelector(`[data-group-key="${groupKey}"]`);
                if (group) {
                    const content = group.querySelector('.group-content');
                    const icon = group.querySelector('.group-expand i');
                    
                    if (content && icon) {
                        content.style.display = 'block';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                        group.classList.add('expanded');
                    }
                }
            });
        }
        
        // Mettre à jour les contrôles
        this.updateControlsBarOnly();
        
        // Restaurer la recherche
        requestAnimationFrame(() => {
            const searchInputs = document.querySelectorAll('#emailSearchInput, #emailSearchInputSticky');
            searchInputs.forEach(input => {
                if (input && currentSearchValue && input.value !== currentSearchValue) {
                    input.value = currentSearchValue;
                }
            });
        });
    }

    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && 
                           visibleEmails.every(email => this.selectedEmails.has(email.id));
        
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
        
        // Mettre à jour les deux containers (principal et sticky)
        updateContainer(document.querySelector('.emails-controls-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
    }

    async refreshEmails() {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading('Actualisation des emails...');
        }
        
        try {
            this.invalidateCache();
            await this.loadPage('emails');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Emails actualisés', 'success');
            }
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur lors de l\'actualisation', 'error');
            }
        } finally {
            if (window.uiManager?.hideLoading) {
                window.uiManager.hideLoading();
            }
        }
    }

    // ================================================
    // SETUP ET CONFIGURATION SPÉCIFIQUES AUX PAGES
    // ================================================
    
    setupEmailsSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page emails');
        // Analyse automatique si activée
        if (this.settings.scanSettings?.autoAnalyze) {
            setTimeout(() => this.performAutoAnalysis(), 2000);
        }
    }

    setupScannerSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page scanner');
        // Pas de configuration spéciale nécessaire
    }

    setupTasksSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page tâches');
        // Sync avec les tâches créées localement
    }

    setupCategoriesSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page catégories');
        // Sync des paramètres de catégories
    }

    setupSettingsSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page paramètres');
        // Configuration des paramètres
    }

    setupRangerSpecificFeatures() {
        console.log('[PageManager] 🔧 Configuration spécifique page ranger');
        // Configuration du rangement par domaine
    }

    setupEmailsEventListeners() {
        // Recherche
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debouncedSearch(e.target.value);
            });
        }
        
        // Fermer les dropdowns quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-action')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    setupStickyControls() {
        const originalContainer = document.querySelector('.emails-controls-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) {
            console.warn('[PageManager] Containers pour sticky controls non trouvés');
            return;
        }
        
        // Cloner le contenu
        stickyContainer.innerHTML = originalContainer.innerHTML;
        
        // Modifier les IDs pour éviter les conflits
        const stickySearchInput = stickyContainer.querySelector('#emailSearchInput');
        if (stickySearchInput) {
            stickySearchInput.id = 'emailSearchInputSticky';
            stickySearchInput.addEventListener('input', (e) => {
                this.debouncedSearch(e.target.value);
                // Synchroniser avec l'input principal
                const mainSearchInput = document.getElementById('emailSearchInput');
                if (mainSearchInput) {
                    mainSearchInput.value = e.target.value;
                }
            });
        }
        
        // Réattacher les événements pour les boutons clonés
        this.setupEventListenersForStickyClone(stickyContainer);
    }

    setupEventListenersForStickyClone(stickyContainer) {
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

    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.emails-controls-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        const shouldBeSticky = scrollY > containerTop - 20;
        const isCurrentlySticky = stickyContainer.classList.contains('sticky-active');
        
        if (shouldBeSticky !== isCurrentlySticky) {
            if (shouldBeSticky) {
                stickyContainer.classList.add('sticky-active');
                const content = document.querySelector('.emails-content-container');
                if (content) {
                    content.style.paddingTop = stickyContainer.offsetHeight + 'px';
                }
            } else {
                stickyContainer.classList.remove('sticky-active');
                const content = document.querySelector('.emails-content-container');
                if (content) {
                    content.style.paddingTop = '0';
                }
            }
        }
    }

    // ================================================
    // ANALYSE AUTOMATIQUE
    // ================================================
    
    async performAutoAnalysis(emails = null) {
        if (!window.aiTaskAnalyzer) {
            console.log('[PageManager] AITaskAnalyzer non disponible pour l\'analyse auto');
            return;
        }
        
        const emailsToAnalyze = emails || this.getCachedEmails();
        if (emailsToAnalyze.length === 0) return;
        
        // Filtrer les emails pré-sélectionnés pour les tâches
        const preselectedEmails = emailsToAnalyze.filter(email => 
            this.isEmailPreselectedForTasks(email) && 
            email.categoryConfidence > 0.6 &&
            !this.aiAnalysisResults.has(email.id)
        ).slice(0, 5); // Limiter à 5 pour la performance
        
        if (preselectedEmails.length === 0) {
            console.log('[PageManager] Aucun email à analyser automatiquement');
            return;
        }
        
        console.log(`[PageManager] 🤖 Analyse auto de ${preselectedEmails.length} emails pré-sélectionnés`);
        
        for (const email of preselectedEmails) {
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(email.id, analysis);
                
                if (analysis?.mainTask?.title) {
                    console.log(`[PageManager] ✅ Tâche suggérée pour "${email.subject}": ${analysis.mainTask.title}`);
                }
                
                // Petit délai entre les analyses
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error('[PageManager] Erreur analyse auto:', error);
            }
        }
        
        console.log('[PageManager] ✅ Analyse automatique terminée');
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    
    getEmailById(emailId) {
        return this.getCachedEmails().find(email => email.id === emailId) || null;
    }

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
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    generateAvatarColor(text) {
        if (!text) return '#64748b';
        
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e'
        ];
        
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    // ================================================
    // STYLES CSS
    // ================================================
    
    addPageStyles() {
        if (document.getElementById('pageManagerStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerStyles';
        styles.textContent = `
            /* PageManager v15.0 - Styles optimisés */
            .page-content {
                min-height: calc(100vh - 140px);
                padding: 0;
                background: #f8fafc;
            }
            
            /* États d'erreur et fallback */
            .error-page, .page-fallback {
                min-height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
            }
            
            .error-content, .fallback-content {
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            
            .error-icon, .fallback-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 32px;
            }
            
            .fallback-icon {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            }
            
            .error-title, .fallback-title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 12px;
            }
            
            .error-message, .fallback-text {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            
            .error-details {
                font-size: 14px;
                color: #9ca3af;
                margin-bottom: 24px;
                font-family: monospace;
                background: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                display: inline-block;
            }
            
            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            /* Page emails */
            .emails-page {
                background: #f8fafc;
                min-height: calc(100vh - 140px);
            }
            
            .explanation-banner {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                margin: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
            }
            
            .explanation-content {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #3b82f6;
                font-size: 14px;
                font-weight: 500;
            }
            
            .explanation-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .explanation-close:hover {
                background: rgba(107, 114, 128, 0.1);
                color: #374151;
            }
            
            /* Contrôles emails */
            .emails-controls-container {
                background: white;
                border-bottom: 1px solid #e5e7eb;
                padding: 20px;
                position: relative;
                z-index: 10;
            }
            
            .controls-bar {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .search-section {
                flex: 1;
                min-width: 200px;
            }
            
            .search-box {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                color: #9ca3af;
                z-index: 1;
            }
            
            .search-input {
                width: 100%;
                padding: 12px 12px 12px 40px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: #f9fafb;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-clear {
                position: absolute;
                right: 8px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 10px;
            }
            
            .view-modes {
                display: flex;
                background: #f3f4f6;
                border-radius: 10px;
                padding: 4px;
                gap: 2px;
            }
            
            .view-mode {
                padding: 8px 12px;
                border: none;
                background: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                color: #6b7280;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .view-mode.active {
                background: white;
                color: #3b82f6;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .view-mode:hover:not(.active) {
                color: #374151;
            }
            
            .action-buttons {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .btn-action {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 2px solid;
                border-radius: 10px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                text-decoration: none;
                position: relative;
            }
            
            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            .btn-action.btn-primary {
                border-color: #3b82f6;
                color: #3b82f6;
            }
            
            .btn-action.btn-primary:hover:not(.disabled) {
                background: #3b82f6;
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-action.btn-secondary {
                border-color: #6b7280;
                color: #6b7280;
            }
            
            .btn-action.btn-secondary:hover:not(.disabled) {
                background: #6b7280;
                color: white;
            }
            
            .btn-action.btn-clear {
                border-color: #ef4444;
                color: #ef4444;
            }
            
            .btn-action.btn-clear:hover {
                background: #ef4444;
                color: white;
            }
            
            .count-badge {
                background: #ef4444;
                color: white;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 10px;
                margin-left: 4px;
                font-weight: 700;
            }
            
            .dropdown-action {
                position: relative;
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 8px 0;
                min-width: 200px;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                pointer-events: none;
                z-index: 1000;
            }
            
            .dropdown-menu.show {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }
            
            .dropdown-item {
                width: 100%;
                padding: 10px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                color: #374151;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dropdown-item:hover {
                background: #f3f4f6;
            }
            
            .dropdown-item.danger {
                color: #ef4444;
            }
            
            .dropdown-item.danger:hover {
                background: #fef2f2;
            }
            
            .dropdown-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }
            
            /* Filtres de catégories */
            .category-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .category-tab {
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-width: 100px;
            }
            
            .category-tab:hover {
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            .category-tab.active {
                border-color: #3b82f6;
                background: #3b82f6;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .category-tab.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(147, 51, 234, 0.1));
            }
            
            .category-tab.preselected.active {
                background: #8b5cf6;
                border-color: #8b5cf6;
            }
            
            .tab-content {
                text-align: center;
            }
            
            .tab-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-bottom: 4px;
            }
            
            .tab-icon {
                font-size: 16px;
            }
            
            .tab-count {
                background: rgba(0, 0, 0, 0.1);
                color: inherit;
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 700;
            }
            
            .category-tab.active .tab-count {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .tab-name {
                font-size: 13px;
                font-weight: 600;
                color: inherit;
            }
            
            .preselected-star {
                position: absolute;
                top: -6px;
                right: -6px;
                font-size: 14px;
            }
            
            /* Sticky controls */
            .sticky-controls-container {
                position: fixed;
                top: -200px;
                left: 0;
                right: 0;
                background: white;
                border-bottom: 1px solid #e5e7eb;
                padding: 20px;
                transition: top 0.3s ease;
                z-index: 100;
                opacity: 0;
                pointer-events: none;
            }
            
            .sticky-controls-container.sticky-active {
                top: 0;
                opacity: 1;
                pointer-events: all;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            /* Liste des emails */
            .emails-content-container {
                padding: 20px;
                transition: padding-top 0.3s ease;
            }
            
            .emails-list-flat {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .emails-list-grouped {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            /* Cartes d'emails */
            .email-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                display: flex;
                align-items: flex-start;
                gap: 16px;
            }
            
            .email-card:hover {
                border-color: #9ca3af;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
            
            .email-card.selected {
                border-color: #3b82f6;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05));
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            
            .email-card.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(147, 51, 234, 0.05));
            }
            
            .email-card.has-task {
                border-color: #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
            }
            
            .email-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
                margin-top: 2px;
            }
            
            .email-priority-bar {
                width: 4px;
                height: 100%;
                border-radius: 2px;
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
            }
            
            .email-content {
                flex: 1;
                min-width: 0;
            }
            
            .email-header {
                margin-bottom: 12px;
            }
            
            .email-subject {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
                line-height: 1.4;
            }
            
            .email-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .email-type-badge, .email-date, .confidence-badge, .preselected-badge {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .confidence-badge {
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 8px;
                color: #059669;
            }
            
            .preselected-badge {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                padding: 4px 8px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 12px;
            }
            
            .email-sender {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 14px;
                flex-wrap: wrap;
            }
            
            .sender-name {
                font-weight: 500;
                color: #374151;
            }
            
            .attachment-indicator {
                color: #f59e0b;
            }
            
            .category-badge {
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid currentColor;
            }
            
            .email-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .email-card:hover .email-actions {
                opacity: 1;
            }
            
            .email-action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                color: #6b7280;
            }
            
            .email-action-btn:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                transform: scale(1.1);
            }
            
            .email-action-btn.create-task:hover {
                border-color: #8b5cf6;
                color: #8b5cf6;
            }
            
            .email-action-btn.view-task {
                border-color: #10b981;
                color: #10b981;
            }
            
            /* Groupes d'emails */
            .email-group {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                overflow: hidden;
            }
            
            .group-header {
                padding: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 16px;
                transition: background 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .group-header:hover {
                background: #f9fafb;
            }
            
            .group-avatar {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 18px;
            }
            
            .group-info {
                flex: 1;
            }
            
            .group-name {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .group-meta {
                font-size: 14px;
                color: #6b7280;
            }
            
            .group-expand {
                color: #9ca3af;
                transition: transform 0.3s ease;
            }
            
            .email-group.expanded .group-expand {
                transform: rotate(180deg);
            }
            
            .group-content {
                padding: 0 20px 20px 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            /* États vides */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #e5e7eb, #d1d5db);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: #9ca3af;
                font-size: 32px;
            }
            
            .empty-title {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .empty-text {
                font-size: 16px;
                margin-bottom: 24px;
                line-height: 1.6;
            }
            
            /* Modales */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .modal-header {
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Formulaires dans les modales */
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-row {
                display: flex;
                gap: 16px;
            }
            
            .form-row .form-group {
                flex: 1;
            }
            
            .form-group label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 6px;
                font-size: 14px;
            }
            
            .form-control {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: #f9fafb;
            }
            
            .form-control:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            textarea.form-control {
                resize: vertical;
                min-height: 100px;
            }
            
            /* Détails email dans modale */
            .email-details {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .detail-row {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .detail-row:last-child {
                margin-bottom: 0;
            }
            
            .detail-row strong {
                color: #374151;
                font-weight: 600;
                min-width: 80px;
            }
            
            .email-address {
                color: #6b7280;
                font-size: 13px;
            }
            
            .email-content h4 {
                margin: 0 0 12px 0;
                color: #374151;
                font-size: 16px;
                font-weight: 600;
            }
            
            .email-body {
                background: white;
                border: 1px solid #e5e7eb;
                padding: 16px;
                border-radius: 12px;
                max-height: 300px;
                overflow-y: auto;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }
            
            /* Référence email dans création tâche */
            .email-reference {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }
            
            .email-reference h4 {
                margin: 0 0 12px 0;
                color: #374151;
                font-size: 14px;
                font-weight: 600;
            }
            
            .email-preview {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
            }
            
            .email-preview-header {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .email-preview-meta {
                font-size: 12px;
                color: #6b7280;
            }
            
            /* Catégories dans fallback */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 24px;
            }
            
            .category-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                transition: all 0.3s ease;
            }
            
            .category-card:hover {
                border-color: #9ca3af;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
            
            .category-card.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(147, 51, 234, 0.05));
            }
            
            .category-icon {
                width: 60px;
                height: 60px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 24px;
            }
            
            .category-name {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }
            
            .category-description {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 12px 0;
                line-height: 1.5;
            }
            
            .preselected-badge {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 8px;
                font-weight: 600;
            }
            
            /* Settings card */
            .settings-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
            }
            
            .settings-card h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }
            
            .settings-card p {
                color: #6b7280;
                margin: 0 0 16px 0;
                line-height: 1.6;
            }
            
            .preselected-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }
            
            /* Boutons génériques */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: 2px solid;
                border-radius: 10px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            
            .btn.btn-primary {
                border-color: #3b82f6;
                color: #3b82f6;
            }
            
            .btn.btn-primary:hover {
                background: #3b82f6;
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn.btn-secondary {
                border-color: #6b7280;
                color: #6b7280;
            }
            
            .btn.btn-secondary:hover {
                background: #6b7280;
                color: white;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .controls-bar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                }
                
                .view-modes {
                    justify-content: center;
                }
                
                .action-buttons {
                    justify-content: center;
                }
                
                .category-filters {
                    justify-content: center;
                }
                
                .email-card {
                    padding: 16px;
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .email-actions {
                    flex-direction: row;
                    align-self: flex-end;
                }
                
                .modal-content {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .form-row {
                    flex-direction: column;
                }
                
                .categories-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 480px) {
                .emails-controls-container,
                .sticky-controls-container {
                    padding: 16px;
                }
                
                .emails-content-container {
                    padding: 16px;
                }
                
                .email-card {
                    padding: 12px;
                }
                
                .modal-header,
                .modal-body,
                .modal-footer {
                    padding: 16px;
                }
                
                .category-tab {
                    min-width: 80px;
                    padding: 10px 12px;
                }
                
                .tab-header {
                    flex-direction: column;
                    gap: 2px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        console.log('[PageManager] ✅ Styles CSS ajoutés');
    }

    // ================================================
    // API PUBLIQUE ET UTILITAIRES
    // ================================================
    
    getDebugInfo() {
        return {
            currentPage: this.currentPage,
            selectedEmailsCount: this.selectedEmails.size,
            searchTerm: this.searchTerm,
            currentCategory: this.currentCategory,
            currentViewMode: this.currentViewMode,
            cachedEmailsCount: this.cachedEmails.length,
            cachedCategoriesCount: Object.keys(this.cachedCategories).length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            createdTasksCount: this.createdTasks.size,
            aiAnalysisResultsCount: this.aiAnalysisResults.size,
            hideExplanation: this.hideExplanation,
            lastCacheUpdate: this.lastCacheUpdate,
            lastSettingsSync: this.lastSettingsSync,
            settings: this.settings,
            version: '15.0',
            integrationStatus: {
                categoryManager: !!window.categoryManager,
                emailScanner: !!window.emailScanner,
                aiTaskAnalyzer: !!window.aiTaskAnalyzer,
                uiManager: !!window.uiManager,
                scanStartModule: !!window.scanStartModule,
                tasksView: !!window.tasksView,
                categoriesPage: !!window.categoriesPage,
                domainOrganizer: !!window.domainOrganizer
            }
        };
    }

    // Méthodes publiques pour l'API
    getAllEmails() {
        return this.getCachedEmails();
    }

    getSelectedEmails() {
        return this.getCachedEmails().filter(email => this.selectedEmails.has(email.id));
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.getCachedEmails();
        }
        return this.getCachedEmails().filter(email => email.category === categoryId);
    }

    selectEmail(emailId) {
        this.selectedEmails.add(emailId);
        this.updateControlsBarOnly();
    }

    deselectEmail(emailId) {
        this.selectedEmails.delete(emailId);
        this.updateControlsBarOnly();
    }

    selectAllEmails() {
        this.getVisibleEmails().forEach(email => {
            this.selectedEmails.add(email.id);
        });
        this.refreshEmailsView();
    }

    deselectAllEmails() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.refreshEmailsView();
    }

    setCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    setViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    // Méthodes pour l'intégration avec d'autres modules
    updateTaskPreselectedCategories(categories) {
        console.log('[PageManager] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== 
                          JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged) {
            this.invalidateCache();
            if (this.currentPage === 'emails') {
                this.refreshEmailsView();
            }
            console.log('[PageManager] ✅ Catégories mises à jour, vue rafraîchie');
        }
        
        return this.taskPreselectedCategories;
    }

    getTaskPreselectedCategories() {
        // Synchroniser avec CategoryManager si disponible
        this.syncTaskPreselectedCategories();
        return [...this.taskPreselectedCategories];
    }

    notifyEmailsChanged() {
        console.log('[PageManager] 📧 Notification de changement d\'emails');
        this.invalidateCache();
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    notifyCategoriesChanged() {
        console.log('[PageManager] 🏷️ Notification de changement de catégories');
        this.invalidateCache();
        if (this.currentPage === 'emails' || this.currentPage === 'categories') {
            this.refreshEmailsView();
        }
    }

    notifySettingsChanged(newSettings) {
        console.log('[PageManager] ⚙️ Notification de changement de paramètres');
        this.settings = { ...this.settings, ...newSettings };
        this.invalidateCache();
        
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    // Méthodes pour la gestion des tâches
    hasTaskForEmail(emailId) {
        return this.createdTasks.has(emailId);
    }

    getTaskForEmail(emailId) {
        return this.createdTasks.get(emailId) || null;
    }

    addTaskForEmail(emailId, taskData) {
        this.createdTasks.set(emailId, taskData);
        this.refreshEmailsView();
        console.log(`[PageManager] ✅ Tâche ajoutée pour email ${emailId}:`, taskData);
    }

    removeTaskForEmail(emailId) {
        const removed = this.createdTasks.delete(emailId);
        if (removed) {
            this.refreshEmailsView();
            console.log(`[PageManager] 🗑️ Tâche supprimée pour email ${emailId}`);
        }
        return removed;
    }

    // Méthodes pour l'analyse IA
    hasAIAnalysisForEmail(emailId) {
        return this.aiAnalysisResults.has(emailId);
    }

    getAIAnalysisForEmail(emailId) {
        return this.aiAnalysisResults.get(emailId) || null;
    }

    addAIAnalysisForEmail(emailId, analysisData) {
        this.aiAnalysisResults.set(emailId, analysisData);
        console.log(`[PageManager] 🤖 Analyse IA ajoutée pour email ${emailId}`);
    }

    // Méthodes d'export et utilitaires
    exportSelectedEmails(format = 'csv') {
        const selectedEmails = this.getSelectedEmails();
        if (selectedEmails.length === 0) {
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Aucun email sélectionné à exporter', 'warning');
            }
            return;
        }

        try {
            let content, filename, mimeType;

            if (format === 'csv') {
                content = this.emailsToCSV(selectedEmails);
                filename = `emails_selectionnes_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else if (format === 'json') {
                content = JSON.stringify(selectedEmails, null, 2);
                filename = `emails_selectionnes_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json;charset=utf-8;';
            }

            this.downloadFile(content, filename, mimeType);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${selectedEmails.length} emails exportés`, 'success');
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur export:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    emailsToCSV(emails) {
        const headers = ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Pré-sélectionné'];
        const rows = [headers];

        emails.forEach(email => {
            const categoryInfo = this.getEmailCategoryInfo(email);
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                this.getEmailSenderName(email),
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo?.name || 'Non catégorisé',
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                this.isEmailPreselectedForTasks(email) ? 'Oui' : 'Non'
            ]);
        });

        return rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // Méthodes de statistiques
    getEmailStats() {
        const emails = this.getCachedEmails();
        const stats = {
            total: emails.length,
            selected: this.selectedEmails.size,
            preselected: emails.filter(email => this.isEmailPreselectedForTasks(email)).length,
            withTasks: this.createdTasks.size,
            withAIAnalysis: this.aiAnalysisResults.size,
            byCategory: {},
            byProvider: {},
            byImportance: { high: 0, normal: 0, low: 0 },
            withAttachments: 0,
            averageConfidence: 0
        };

        // Calculs détaillés
        let totalConfidence = 0;
        let emailsWithConfidence = 0;

        emails.forEach(email => {
            // Par catégorie
            const cat = email.category || 'other';
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

            // Par provider
            const provider = email.sourceProvider || 'unknown';
            stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;

            // Par importance
            const importance = email.importance || 'normal';
            stats.byImportance[importance] = (stats.byImportance[importance] || 0) + 1;

            // Pièces jointes
            if (email.hasAttachments) {
                stats.withAttachments++;
            }

            // Confiance
            if (email.categoryConfidence) {
                totalConfidence += email.categoryConfidence;
                emailsWithConfidence++;
            }
        });

        if (emailsWithConfidence > 0) {
            stats.averageConfidence = Math.round((totalConfidence / emailsWithConfidence) * 100);
        }

        return stats;
    }

    getCategoryStats() {
        const categories = this.getCachedCategories();
        const emails = this.getCachedEmails();
        const stats = {};

        Object.entries(categories).forEach(([categoryId, category]) => {
            const categoryEmails = emails.filter(email => email.category === categoryId);
            
            stats[categoryId] = {
                id: categoryId,
                name: category.name,
                icon: category.icon,
                color: category.color,
                count: categoryEmails.length,
                percentage: emails.length > 0 ? Math.round((categoryEmails.length / emails.length) * 100) : 0,
                isPreselected: this.taskPreselectedCategories.includes(categoryId),
                averageConfidence: this.calculateAverageConfidenceForCategory(categoryEmails),
                withTasks: categoryEmails.filter(email => this.createdTasks.has(email.id)).length
            };
        });

        return stats;
    }

    calculateAverageConfidenceForCategory(emails) {
        if (emails.length === 0) return 0;
        
        const totalConfidence = emails.reduce((sum, email) => {
            return sum + (email.categoryConfidence || 0);
        }, 0);
        
        return Math.round((totalConfidence / emails.length) * 100);
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    
    cleanup() {
        console.log('[PageManager] 🧹 Nettoyage...');
        
        // Nettoyer les timeouts et intervals
        if (this.uiUpdateThrottle) {
            clearTimeout(this.uiUpdateThrottle);
            this.uiUpdateThrottle = null;
        }
        
        // Vider les caches et collections
        this.cachedEmails = [];
        this.cachedCategories = {};
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        
        // Réinitialiser les propriétés
        this.currentPage = null;
        this.searchTerm = '';
        this.currentCategory = 'all';
        this.currentViewMode = 'grouped-domain';
        this.lastCacheUpdate = 0;
        this.lastSettingsSync = 0;
        
        // Supprimer les styles ajoutés
        const styles = document.getElementById('pageManagerStyles');
        if (styles) {
            styles.remove();
        }
        
        // Supprimer les modales ouvertes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        console.log('[PageManager] ✅ Nettoyage terminé');
    }

    destroy() {
        console.log('[PageManager] 💥 Destruction PageManager...');
        
        this.cleanup();
        
        // Vider les objets
        this.pages = {};
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        console.log('[PageManager] ✅ PageManager détruit');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================

// Nettoyer l'ancienne instance si elle existe
if (window.pageManager) {
    try {
        console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
        window.pageManager.cleanup?.();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage ancienne instance:', e);
    }
}

// Créer la nouvelle instance
try {
    console.log('[PageManager] 🚀 Création nouvelle instance v15.0...');
    window.pageManager = new PageManager();
    
    // Bind des méthodes pour préserver le contexte
    Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
            window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
        }
    });
    
    console.log('✅ PageManager v15.0 loaded - Restructuré avec intégration complète et optimisé');
    
} catch (error) {
    console.error('[PageManager] ❌ Erreur création instance:', error);
    
    // Instance de secours
    window.pageManager = {
        currentPage: null,
        selectedEmails: new Set(),
        
        loadPage: function(pageName) {
            console.error('[PageManager] Instance de secours - loadPage non disponible');
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur PageManager - Rechargez la page', 'error');
            }
        },
        
        getDebugInfo: function() {
            return {
                error: 'Instance de secours suite à: ' + error.message,
                available: false,
                needsReload: true
            };
        },
        
        cleanup: function() {
            console.log('[PageManager] Instance de secours - Nettoyage');
        },
        
        destroy: function() {
            console.log('[PageManager] Instance de secours - Destruction');
        }
    };
    
    console.log('[PageManager] 🔧 Instance de secours créée - Rechargez la page');
}

// Test de fonctionnement
window.testPageManager = function() {
    console.group('🧪 TEST PageManager v15.0');
    
    const debugInfo = window.pageManager.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    if (debugInfo.available === false) {
        console.log('❌ PageManager non fonctionnel');
        console.groupEnd();
        return { success: false, error: debugInfo.error };
    }
    
    // Test des méthodes principales
    console.log('✅ PageManager fonctionnel');
    console.log('Emails en cache:', debugInfo.cachedEmailsCount);
    console.log('Catégories en cache:', debugInfo.cachedCategoriesCount);
    console.log('Catégories pré-sélectionnées:', debugInfo.taskPreselectedCategories);
    console.log('Intégrations:', debugInfo.integrationStatus);
    
    console.groupEnd();
    return { 
        success: true, 
        version: debugInfo.version,
        emailsCount: debugInfo.cachedEmailsCount,
        categoriesCount: debugInfo.cachedCategoriesCount,
        integrations: debugInfo.integrationStatus
    };
};

console.log('🎯 PageManager v15.0 - Restructuré et optimisé - Prêt à l\'utilisation!');
