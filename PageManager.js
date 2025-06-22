// PageManager.js - Version 12.2 - Avec position fixe et sélection tout

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
        console.log('[PageManager] ✅ Version 12.2 - Position fixe et sélection tout');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION FIXÉE
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres depuis CategoriesPage
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter les changements génériques de paramètres
        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
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

        // Écouter le scroll pour gérer la position fixe
        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });
    }

    // ================================================
    // GESTION POSITION FIXE POUR SCROLL
    // ================================================
    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.controls-and-filters-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        
        if (scrollY > containerTop - 20) {
            stickyContainer.classList.add('sticky-active');
            // Ajouter un padding-top au contenu pour compenser
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

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES - NOUVELLE
    // ================================================
    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        // Si c'est un changement de catégories pré-sélectionnées, forcer la re-catégorisation
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            // Déclencher la re-catégorisation si des emails existent
            if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails?.();
                }, 100);
            }
        }
        
        // Mettre à jour l'affichage si on est sur la page emails
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                // Mettre à jour le auto-analyzer si disponible
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                // Déclencher la re-catégorisation
                if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails?.();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                // Mettre à jour l'affichage selon les nouvelles préférences
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
        }
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

    // ================================================
    // RENDU PAGE EMAILS COMPLET AVEC POSITION FIXE
    // ================================================
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

                    <!-- Container original des contrôles et filtres -->
                    <div class="controls-and-filters-container">
                        <!-- Barre de contrôles unifiée sur une seule ligne -->
                        <div class="controls-bar-single-line">
                            <!-- Barre de recherche -->
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
                            
                            <!-- Modes de vue -->
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
                            
                            <!-- Actions principales -->
                            <div class="action-buttons">
                                <!-- Bouton Sélectionner/Désélectionner tout -->
                                <button class="btn-action btn-selection-toggle" 
                                        onclick="window.pageManager.toggleAllSelection()"
                                        title="Sélectionner/Désélectionner tous les emails visibles">
                                    <i class="fas fa-check-square"></i>
                                    <span class="btn-text">Sélectionner tous</span>
                                    <span class="btn-count">(${this.getVisibleEmails().length})</span>
                                </button>
                                
                                <!-- Bouton Créer tâches -->
                                <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="window.pageManager.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-tasks"></i>
                                    <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                                </button>
                                
                                <!-- Bouton Actions -->
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
                                
                                <!-- Bouton Actualiser -->
                                <button class="btn-action btn-secondary" onclick="window.pageManager.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span class="btn-text">Actualiser</span>
                                </button>
                                
                                <!-- Bouton Effacer sélection (uniquement si des emails sont sélectionnés) -->
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

                        <!-- Filtres de catégories compacts -->
                        <div class="status-filters-compact">
                            ${this.buildCompactCategoryTabs(categoryCounts, totalEmails, categories)}
                        </div>
                    </div>

                    <!-- Container fixe (clone) - Initialement masqué -->
                    <div class="sticky-controls-container">
                        <!-- Même contenu que ci-dessus, sera copié dynamiquement -->
                    </div>

                    <!-- CONTENU DES EMAILS -->
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
        
        // Auto-analyze si activé ET si catégories pré-sélectionnées configurées
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselectedCategories = this.getTaskPreselectedCategories();
            console.log('[PageManager] 🤖 Catégories pré-sélectionnées pour analyse:', preselectedCategories);
            
            if (preselectedCategories && preselectedCategories.length > 0) {
                // Filtrer les emails selon les catégories pré-sélectionnées
                const emailsToAnalyze = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).slice(0, 5);
                
                console.log('[PageManager] 🎯 Emails sélectionnés pour analyse:', emailsToAnalyze.length);
                
                if (emailsToAnalyze.length > 0) {
                    setTimeout(() => {
                        this.analyzeFirstEmails(emailsToAnalyze);
                    }, 1000);
                }
            }
        }
    }

    // ================================================
    // SETUP CONTRÔLES COLLANTS (STICKY)
    // ================================================
    setupStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        // Cloner le contenu original dans le container fixe
        stickyContainer.innerHTML = originalContainer.innerHTML;
        
        // Ajouter des event listeners au clone
        this.setupEventListenersForStickyClone(stickyContainer);
        
        // Observer les changements pour synchroniser
        const observer = new MutationObserver(() => {
            // Re-synchroniser périodiquement si nécessaire
            setTimeout(() => {
                this.syncStickyControls();
            }, 100);
        });
        
        observer.observe(originalContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    setupEventListenersForStickyClone(stickyContainer) {
        // Recherche dans le clone sticky
        const searchInput = stickyContainer.querySelector('#emailSearchInput');
        if (searchInput) {
            searchInput.id = 'emailSearchInputSticky'; // Éviter les doublons d'ID
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Boutons de mode de vue dans le sticky
        stickyContainer.querySelectorAll('.view-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (mode) {
                    this.changeViewMode(mode);
                }
            });
        });

        // Boutons d'action dans le sticky
        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('window.pageManager')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eval(onclickAttr);
                });
            }
        });

        // Filtres de catégories dans le sticky
        stickyContainer.querySelectorAll('.status-pill-compact').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = pill.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (categoryId) {
                    this.filterByCategory(categoryId);
                }
            });
        });
    }

    syncStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        // Synchroniser les valeurs des inputs
        const originalSearch = originalContainer.querySelector('#emailSearchInput');
        const stickySearch = stickyContainer.querySelector('#emailSearchInputSticky');
        
        if (originalSearch && stickySearch && originalSearch.value !== stickySearch.value) {
            stickySearch.value = originalSearch.value;
        }

        // Synchroniser les états actifs des boutons
        const originalButtons = originalContainer.querySelectorAll('.active, .disabled');
        const stickyButtons = stickyContainer.querySelectorAll('button, .status-pill-compact');
        
        originalButtons.forEach((origBtn, index) => {
            const stickyBtn = stickyButtons[index];
            if (stickyBtn) {
                stickyBtn.className = origBtn.className;
            }
        });
    }

    // ================================================
    // MÉTHODE POUR RÉCUPÉRER LES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    getTaskPreselectedCategories() {
        // Essayer depuis CategoryManager en priorité
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        // Sinon depuis CategoriesPage
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            return window.categoriesPage.getTaskPreselectedCategories();
        }
        
        // Fallback sur localStorage
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories pré-sélectionnées:', error);
            return [];
        }
    }

    debugPreselection() {
        console.group('🔍 DEBUG PRÉ-SÉLECTION COMPLÈTE');
        
        // 1. Sources des catégories
        console.group('📋 Sources des catégories pré-sélectionnées:');
        
        const categoriesFromManager = window.categoryManager?.getTaskPreselectedCategories() || [];
        const categoriesFromPage = window.categoriesPage?.getTaskPreselectedCategories() || [];
        const categoriesFromLocal = this.getTaskPreselectedCategories();
        const categoriesFromScanner = window.emailScanner?.getTaskPreselectedCategories() || [];
        
        console.log('CategoryManager:', categoriesFromManager);
        console.log('CategoriesPage:', categoriesFromPage);
        console.log('PageManager:', categoriesFromLocal);
        console.log('EmailScanner:', categoriesFromScanner);
        
        // Vérifier la cohérence
        const allSources = [
            { name: 'CategoryManager', cats: categoriesFromManager },
            { name: 'CategoriesPage', cats: categoriesFromPage },
            { name: 'PageManager', cats: categoriesFromLocal },
            { name: 'EmailScanner', cats: categoriesFromScanner }
        ];
        
        const referenceSource = categoriesFromManager;
        const inconsistencies = [];
        
        allSources.forEach(source => {
            if (JSON.stringify([...source.cats].sort()) !== JSON.stringify([...referenceSource].sort())) {
                inconsistencies.push(source.name);
            }
        });
        
        if (inconsistencies.length > 0) {
            console.warn('⚠️ INCOHÉRENCES DÉTECTÉES:', inconsistencies);
        } else {
            console.log('✅ Toutes les sources sont synchronisées');
        }
        
        console.groupEnd();
        
        // 2. État des emails
        console.group('📧 État des emails:');
        
        const emails = window.emailScanner?.getAllEmails() || [];
        const preselectedEmails = emails.filter(e => e.isPreselectedForTasks === true);
        const shouldBePreselected = emails.filter(e => categoriesFromLocal.includes(e.category));
        const missedEmails = shouldBePreselected.filter(e => !e.isPreselectedForTasks);
        
        console.log('Total emails:', emails.length);
        console.log('Marqués pré-sélectionnés (flag):', preselectedEmails.length);
        console.log('Devraient être pré-sélectionnés (catégorie):', shouldBePreselected.length);
        console.log('Emails manqués:', missedEmails.length);
        
        if (missedEmails.length > 0) {
            console.warn('⚠️ Emails qui devraient être marqués mais ne le sont pas:');
            missedEmails.slice(0, 5).forEach(email => {
                console.log('  -', {
                    subject: email.subject?.substring(0, 40),
                    category: email.category,
                    isPreselectedForTasks: email.isPreselectedForTasks
                });
            });
        }
        
        console.groupEnd();
        
        // 3. Détails par catégorie
        console.group('📊 Détails par catégorie pré-sélectionnée:');
        
        categoriesFromLocal.forEach(catId => {
            const category = window.categoryManager?.getCategory(catId);
            const emailsInCategory = emails.filter(e => e.category === catId);
            const markedAsPreselected = emailsInCategory.filter(e => e.isPreselectedForTasks === true);
            
            console.group(`${category?.icon || '📂'} ${category?.name || catId} (${catId}):`);
            console.log('Total emails dans cette catégorie:', emailsInCategory.length);
            console.log('Marqués pré-sélectionnés:', markedAsPreselected.length);
            console.log('Pourcentage correct:', markedAsPreselected.length === emailsInCategory.length ? '✅ 100%' : `❌ ${Math.round(markedAsPreselected.length / emailsInCategory.length * 100)}%`);
            
            if (markedAsPreselected.length < emailsInCategory.length) {
                const notMarked = emailsInCategory.filter(e => !e.isPreselectedForTasks);
                console.warn('Emails non marqués:', notMarked.slice(0, 3).map(e => ({
                    subject: e.subject?.substring(0, 40),
                    score: e.categoryScore,
                    confidence: Math.round(e.categoryConfidence * 100) + '%'
                })));
            }
            
            console.groupEnd();
        });
        
        console.groupEnd();
        
        // 4. État de l'affichage
        console.group('🖼️ État de l\'affichage:');
        
        const categoryButtons = document.querySelectorAll('.status-pill-harmonized-twolines');
        const preselectedButtons = document.querySelectorAll('.status-pill-harmonized-twolines.preselected-category');
        const emailCards = document.querySelectorAll('.task-harmonized-card');
        const preselectedCards = document.querySelectorAll('.task-harmonized-card.preselected-task');
        
        console.log('Boutons de catégorie totaux:', categoryButtons.length);
        console.log('Boutons avec style pré-sélectionné:', preselectedButtons.length);
        console.log('Cartes d\'email totales:', emailCards.length);
        console.log('Cartes avec style pré-sélectionné:', preselectedCards.length);
        
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            sources: {
                categoryManager: categoriesFromManager,
                categoriesPage: categoriesFromPage,
                pageManager: categoriesFromLocal,
                emailScanner: categoriesFromScanner,
                isSync: inconsistencies.length === 0
            },
            emails: {
                total: emails.length,
                markedPreselected: preselectedEmails.length,
                shouldBePreselected: shouldBePreselected.length,
                missed: missedEmails.length
            },
            display: {
                categoryButtons: categoryButtons.length,
                preselectedButtons: preselectedButtons.length,
                emailCards: emailCards.length,
                preselectedCards: preselectedCards.length
            }
        };
    }

    // Méthode utilitaire pour dispatcher des événements
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'PageManager',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[PageManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    forceUpdatePreselection() {
        console.log('[PageManager] 🔄 === FORCE UPDATE PRÉ-SÉLECTION ===');
        
        // 1. Forcer la synchronisation des catégories
        const freshCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
        console.log('[PageManager] 📋 Catégories fraîches depuis CategoryManager:', freshCategories);
        
        // 2. Mettre à jour EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(freshCategories);
            console.log('[PageManager] ✅ EmailScanner mis à jour');
        }
        
        // 3. Mettre à jour les emails
        const emails = window.emailScanner?.getAllEmails() || [];
        let updated = 0;
        let added = 0;
        let removed = 0;
        
        emails.forEach(email => {
            const shouldBePreselected = freshCategories.includes(email.category);
            const currentlyPreselected = email.isPreselectedForTasks === true;
            
            if (shouldBePreselected && !currentlyPreselected) {
                email.isPreselectedForTasks = true;
                updated++;
                added++;
            } else if (!shouldBePreselected && currentlyPreselected) {
                email.isPreselectedForTasks = false;
                updated++;
                removed++;
            }
        });
        
        console.log(`[PageManager] 📊 Résultat: ${updated} emails mis à jour (${added} ajoutés, ${removed} retirés)`);
        
        // 4. Mettre à jour les boutons de catégories sans reconstruction complète
        document.querySelectorAll('.status-pill-harmonized-twolines').forEach(button => {
            const categoryId = button.dataset.categoryId;
            if (categoryId && categoryId !== 'all') {
                const starContainer = button.querySelector('.preselected-star-container');
                if (starContainer) {
                    if (freshCategories.includes(categoryId)) {
                        starContainer.classList.add('visible');
                        button.classList.add('preselected-category');
                    } else {
                        starContainer.classList.remove('visible');
                        button.classList.remove('preselected-category');
                    }
                }
            }
        });
        
        // 5. Rafraîchir seulement la liste des emails
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer && this.currentPage === 'emails') {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        // 6. Déclencher un événement pour notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('preselectionUpdated', {
                categories: freshCategories,
                updated: updated,
                added: added,
                removed: removed
            });
        }, 100);
        
        return {
            categories: freshCategories,
            emailsUpdated: updated,
            added: added,
            removed: removed
        };
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
    // MÉTHODES DE SÉLECTION - AVEC SÉLECTION TOUT
    // ================================================
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            // Désélectionner tous les emails visibles
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
        } else {
            // Sélectionner tous les emails visibles
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection email:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
            console.log('[PageManager] Email désélectionné:', emailId);
        } else {
            this.selectedEmails.add(emailId);
            console.log('[PageManager] Email sélectionné:', emailId);
        }
        
        // Mise à jour immédiate de la checkbox spécifique
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        // Mise à jour des compteurs et boutons SANS reconstruire toute la liste
        this.updateControlsBarOnly();
        
        console.log('[PageManager] Sélection mise à jour. Total sélectionnés:', this.selectedEmails.size);
    }

    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        console.log('[PageManager] Mise à jour contrôles uniquement -', selectedCount, 'sélectionnés');
        
        // Fonction pour mettre à jour un container (original ou sticky)
        const updateContainer = (container) => {
            if (!container) return;
            
            // Mettre à jour le bouton "Sélectionner tout"
            const selectAllBtn = container.querySelector('.btn-selection-toggle');
            if (selectAllBtn) {
                const btnText = selectAllBtn.querySelector('.btn-text');
                const btnCount = selectAllBtn.querySelector('.btn-count');
                const icon = selectAllBtn.querySelector('i');
                
                if (allSelected) {
                    // Tous sélectionnés -> Proposer de désélectionner
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectAllBtn.classList.add('all-selected');
                } else {
                    // Pas tous sélectionnés -> Proposer de sélectionner
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
            
            // Mettre à jour le bouton "Créer tâches"
            const createTaskBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createTaskBtn) {
                const span = createTaskBtn.querySelector('.btn-text');
                const countBadge = createTaskBtn.querySelector('.count-badge');
                
                if (selectedCount === 0) {
                    createTaskBtn.classList.add('disabled');
                    createTaskBtn.disabled = true;
                } else {
                    createTaskBtn.classList.remove('disabled');
                    createTaskBtn.disabled = false;
                }
                
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
            
            // Mettre à jour le bouton "Actions"
            const actionsBtn = container.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
            if (actionsBtn) {
                if (selectedCount === 0) {
                    actionsBtn.classList.add('disabled');
                    actionsBtn.disabled = true;
                } else {
                    actionsBtn.classList.remove('disabled');
                    actionsBtn.disabled = false;
                }
            }
            
            // Gérer le bouton "Effacer sélection"
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionButtonsContainer = container.querySelector('.action-buttons');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionButtonsContainer) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-action btn-clear';
                    clearBtn.onclick = () => window.pageManager.clearSelection();
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
        
        // Mettre à jour les deux containers (original et sticky)
        updateContainer(document.querySelector('.controls-and-filters-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
        
        console.log('[PageManager] Contrôles mis à jour -', selectedCount, 'sélectionnés');
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

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
            
            console.log('[PageManager] Groupes restaurés:', expandedGroups.size);
        }
        
        // Mettre à jour seulement les contrôles
        this.updateControlsBarOnly();
        
        // Restaurer la recherche
        setTimeout(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue && newSearchInput.value !== currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
            // Synchroniser avec le sticky aussi
            const stickySearchInput = document.getElementById('emailSearchInputSticky');
            if (stickySearchInput && currentSearchValue && stickySearchInput.value !== currentSearchValue) {
                stickySearchInput.value = currentSearchValue;
            }
        }, 50);
        
        console.log('[PageManager] Vue emails rafraîchie avec', this.selectedEmails.size, 'sélectionnés');
    }

    buildCompactCategoryTabs(categoryCounts, totalEmails, categories) {
        // Récupérer les catégories pré-sélectionnées
        const preselectedCategories = this.getTaskPreselectedCategories();
        console.log('[PageManager] 📌 Catégories pré-sélectionnées pour l\'affichage:', preselectedCategories);
        
        const tabs = [
            { 
                id: 'all', 
                name: 'Tous', 
                icon: '📧', 
                count: totalEmails,
                isPreselected: false 
            }
        ];
        
        // Ajouter les catégories avec emails
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                const isPreselected = preselectedCategories.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected
                });
                
                if (isPreselected) {
                    console.log(`[PageManager] ⭐ Catégorie pré-sélectionnée: ${category.name} (${count} emails)`);
                }
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
        
        // Générer le HTML avec structure 2 lignes
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-compact ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="pill-first-line">
                        <span class="pill-icon">${tab.icon}</span>
                        <span class="pill-count">${tab.count}</span>
                    </div>
                    <div class="pill-second-line">
                        <span class="pill-text">${tab.name}</span>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    filterByCategory(categoryId) {
        console.log(`[PageManager] 🔍 Filtrage par catégorie: ${categoryId}`);
        
        this.currentCategory = categoryId;
        
        // Debug du filtrage
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails;
        
        if (categoryId === 'all') {
            filteredEmails = emails;
            console.log(`[PageManager] 📧 Affichage de tous les emails: ${emails.length}`);
        } else if (categoryId === 'other') {
            // CORRECTION CRITIQUE: Filtrer correctement les emails "Autre"
            filteredEmails = emails.filter(email => {
                const cat = email.category;
                return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
            });
            console.log(`[PageManager] 📌 Emails "Autre" trouvés: ${filteredEmails.length}`);
        } else {
            filteredEmails = emails.filter(email => email.category === categoryId);
            console.log(`[PageManager] 🏷️ Emails dans catégorie "${categoryId}": ${filteredEmails.length}`);
        }
        
        // Mettre à jour l'affichage
        this.refreshEmailsView();
        
        // Mettre à jour visuellement le bouton actif dans les deux containers
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

    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        console.log(`[PageManager] 📧 Rendu liste emails: ${emails.length} total, catégorie: ${this.currentCategory}`);
        
        // Appliquer le filtre de catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                // CORRECTION CRITIQUE: Filtrer correctement les emails "Autre"
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
                console.log(`[PageManager] 📌 Emails "Autre" filtrés: ${filteredEmails.length}`);
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
                console.log(`[PageManager] 🏷️ Emails catégorie "${this.currentCategory}": ${filteredEmails.length}`);
            }
        }
        
        // Appliquer le filtre de recherche
        if (this.searchTerm) {
            const beforeSearch = filteredEmails.length;
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
            console.log(`[PageManager] 🔍 Après recherche "${this.searchTerm}": ${filteredEmails.length} (était ${beforeSearch})`);
        }
        
        // Affichage si aucun email trouvé
        if (filteredEmails.length === 0) {
            console.log('[PageManager] 📭 Aucun email à afficher');
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

    renderEmptyState() {
        console.log(`[PageManager] 📭 Rendu état vide - Catégorie: ${this.currentCategory}, Recherche: "${this.searchTerm}"`);
        
        let title, text, action = '';
        
        if (this.searchTerm) {
            // État vide à cause de la recherche
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            // État vide pour la catégorie "Autre"
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            // État vide pour une catégorie spécifique
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email pour le moment.';
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            // État vide général (aucun email du tout)
            title = 'Aucun email trouvé';
            text = 'Utilisez le scanner pour récupérer et analyser vos emails.';
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    <span>Aller au scanner</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">${title}</h3>
                <p class="empty-state-text-harmonized">${text}</p>
                ${action}
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
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        // Récupérer les catégories pré-sélectionnées avec synchronisation forcée
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        // Double vérification: le flag email.isPreselectedForTasks ET l'appartenance à une catégorie pré-sélectionnée
        let isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        // Si le flag n'est pas défini mais que la catégorie est pré-sélectionnée, le corriger
        if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
            isPreselectedForTasks = true;
            email.isPreselectedForTasks = true;
        }
        
        // CORRECTION CRITIQUE: Un email pré-sélectionné doit être automatiquement sélectionné pour création de tâche
        const isSelected = this.selectedEmails.has(email.id) || isPreselectedForTasks;
        
        // Si l'email est pré-sélectionné mais pas encore dans la sélection, l'ajouter
        if (isPreselectedForTasks && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        // Classes CSS pour l'email
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
                
                <!-- Checkbox de sélection avec gestion d'événement corrigée -->
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <!-- Indicateur de priorité avec couleur spéciale si pré-sélectionné -->
                <div class="priority-bar-harmonized" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
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
                <div class="group-header-harmonized" onclick="event.preventDefault(); event.stopPropagation(); window.pageManager.toggleGroup('${group.key}', event)">
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
                    <div class="group-expand-harmonized" onclick="event.preventDefault(); event.stopPropagation();">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
                </div>
            </div>
        `;
    }

    handleEmailClick(event, emailId) {
        // Empêcher la propagation si c'est un clic sur checkbox
        if (event.target.type === 'checkbox') {
            console.log('[PageManager] Clic checkbox détecté, arrêt propagation');
            return;
        }
        
        // Empêcher la propagation si c'est un clic sur les actions
        if (event.target.closest('.task-actions-harmonized')) {
            console.log('[PageManager] Clic action détecté, arrêt propagation');
            return;
        }
        
        // Empêcher la propagation si c'est un clic dans un groupe header
        if (event.target.closest('.group-header-harmonized')) {
            console.log('[PageManager] Clic dans group header, arrêt propagation');
            return;
        }
        
        // Vérifier si c'est un double-clic pour sélection
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            // Double-clic = toggle sélection
            console.log('[PageManager] Double-clic détecté, toggle sélection');
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        this.lastEmailClick = now;
        
        // Simple clic = ouvrir modal après délai pour permettre double-clic
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                console.log('[PageManager] Simple clic confirmé, ouverture modal');
                this.showEmailModal(emailId);
            }
        }, 250);
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

    toggleGroup(groupKey, event) {
        // Arrêter la propagation pour éviter les conflits
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('[PageManager] Toggle groupe:', groupKey);
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) {
            console.error('[PageManager] Groupe non trouvé:', groupKey);
            return;
        }
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (!content || !icon || !header) {
            console.error('[PageManager] Éléments du groupe manquants');
            return;
        }
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            // Fermer le groupe
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
            console.log('[PageManager] Groupe fermé:', groupKey);
        } else {
            // Ouvrir le groupe
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
            console.log('[PageManager] Groupe ouvert:', groupKey);
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
        
        // Synchroniser la recherche dans le sticky aussi
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
        
        this.refreshEmailsView();
    }

    toggleBulkActions(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('bulkActionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        const isCurrentlyVisible = menu.classList.contains('show');
        
        // Fermer tous les autres dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
            if (dropdown !== menu) {
                dropdown.classList.remove('show');
            }
        });
        
        // Retirer les classes show des autres boutons
        document.querySelectorAll('.dropdown-toggle.show').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('show');
            }
        });
        
        // Supprimer l'overlay existant
        const existingOverlay = document.querySelector('.dropdown-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (isCurrentlyVisible) {
            // Fermer le menu
            menu.classList.remove('show');
            button.classList.remove('show');
            console.log('[PageManager] Dropdown Actions fermé');
        } else {
            // Ouvrir le menu
            menu.classList.add('show');
            button.classList.add('show');
            console.log('[PageManager] Dropdown Actions ouvert');
            
            // S'assurer que le menu a le z-index maximum
            menu.style.zIndex = '9999';
            menu.style.position = 'absolute';
            
            // Créer un overlay pour détecter les clics à l'extérieur
            const overlay = document.createElement('div');
            overlay.className = 'dropdown-overlay show';
            overlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 9998 !important;
                background: rgba(0, 0, 0, 0.05) !important;
                cursor: pointer !important;
                display: block !important;
            `;
            
            // Fermer le dropdown quand on clique sur l'overlay
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.remove('show');
                button.classList.remove('show');
                overlay.remove();
                console.log('[PageManager] Dropdown fermé via overlay');
            });
            
            // Ajouter l'overlay au body (pas dans le container des emails)
            document.body.appendChild(overlay);
            
            // Fermer avec Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    menu.classList.remove('show');
                    button.classList.remove('show');
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                    console.log('[PageManager] Dropdown fermé via Escape');
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Empêcher la fermeture quand on clique dans le menu
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Auto-fermeture après 15 secondes
            setTimeout(() => {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    button.classList.remove('show');
                    if (overlay.parentNode) {
                        overlay.remove();
                    }
                    console.log('[PageManager] Dropdown fermé automatiquement');
                }
            }, 15000);
        }
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
    // CRÉATION DE TÂCHES
    // ================================================
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
                console.error('[PageManager] Erreur création tâche:', emailId, error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
        }
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

    // ================================================
    // MODALES
    // ================================================
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            window.uiManager?.showLoading('Analyse de l\'email...');
            analysis = await window.aiTaskAnalyzer?.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager?.hideLoading();
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'analyse', 'error');
            return;
        }

        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildTaskCreationModal(uniqueId, email, analysis);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskCreationModal(uniqueId, email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
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
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
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
                    <div style="width: 48px; height: 48px; background: ${this.generateAvatarColor(senderName)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
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
            window.uiManager?.showToast('Données manquantes', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
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

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                window.uiManager?.showToast('Tâche créée avec succès', 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
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
                            ${email.category && email.category !== 'other' ? `
                                <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 60px;">Catégorie:</span>
                                    <span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>
                                </div>
                            ` : ''}
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
        
        console.log(`[PageManager] 👁️ Calcul emails visibles: ${emails.length} total, catégorie: ${this.currentCategory}`);
        
        // Appliquer le filtre de catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                // CORRECTION CRITIQUE: Filtrer correctement les emails "Autre"
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    const isOther = !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                    return isOther;
                });
                console.log(`[PageManager] 📌 Emails "Autre" visibles: ${filteredEmails.length}`);
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
                console.log(`[PageManager] 🏷️ Emails catégorie "${this.currentCategory}" visibles: ${filteredEmails.length}`);
            }
        }
        
        // Appliquer le filtre de recherche
        if (this.searchTerm) {
            const beforeSearch = filteredEmails.length;
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
            console.log(`[PageManager] 🔍 Après recherche "${this.searchTerm}": ${filteredEmails.length} visibles (était ${beforeSearch})`);
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
        console.log('[PageManager] 📊 Calcul des comptages de catégories...');
        
        const counts = {};
        let uncategorizedCount = 0;
        
        emails.forEach(email => {
            const cat = email.category;
            
            // Si l'email a une catégorie valide
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                // Email non catégorisé -> dans "other"
                uncategorizedCount++;
            }
        });
        
        // CORRECTION CRITIQUE: Toujours inclure "other" si il y a des emails non catégorisés
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
            console.log(`[PageManager] 📌 ${uncategorizedCount} emails dans la catégorie "Autre"`);
        }
        
        // Debug des comptages
        console.log('[PageManager] 📊 Comptages finaux:', {
            categories: counts,
            totalEmails: emails.length,
            sumCounts: Object.values(counts).reduce((sum, count) => sum + count, 0)
        });
        
        // Vérification de cohérence
        const totalCounted = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (totalCounted !== emails.length) {
            console.error(`[PageManager] ❌ ERREUR COMPTAGE: ${totalCounted} comptés vs ${emails.length} emails totaux`);
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
            // Nettoyer le contenu HTML pour éviter les erreurs de parsing
            let content = email.body.content;
            // Remplacer les meta tags problématiques
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
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
    // STYLES CSS COMPLETS AVEC POSITION FIXE
    // ================================================
    addExpandedEmailStyles() {
        if (document.getElementById('expandedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'expandedEmailStyles';
        styles.textContent = `
            /* Variables CSS étendues */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-height: 76px;
                --card-padding: 14px;
                --card-border-radius: 12px;
                --action-btn-size: 36px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --preselect-color: #8b5cf6;
                --preselect-color-light: #a78bfa;
                --preselect-color-dark: #7c3aed;
                --sticky-height: 180px;
            }
            
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
                backdrop-filter: blur(10px);
                position: relative;
            }

            .explanation-text-harmonized i {
                font-size: 16px;
                color: #3b82f6;
                flex-shrink: 0;
            }
            
            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                color: #3b82f6;
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
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }
            
            /* ===== CONTAINERS POUR POSITION FIXE ===== */
            .controls-and-filters-container {
                position: relative;
                z-index: 100;
                background: transparent;
                margin-bottom: var(--gap-medium);
            }
            
            .sticky-controls-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: var(--gap-large);
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                opacity: 0;
                visibility: hidden;
            }
            
            .sticky-controls-container.sticky-active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            /* ===== BARRE DE CONTRÔLES UNIFIÉE SUR UNE LIGNE ===== */
            .controls-bar-single-line {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: var(--gap-large);
                position: relative;
                z-index: 1000;
                min-height: var(--btn-height);
            }
            
            /* Section de recherche */
            .search-section {
                flex: 1;
                max-width: 400px;
                min-width: 250px;
            }
            
            .search-box {
                position: relative;
                width: 100%;
                height: var(--btn-height);
                display: flex;
                align-items: center;
            }
            
            .search-input {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-medium) 0 40px;
                border: 2px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
            }
            
            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-input::placeholder {
                color: #9ca3af;
                font-weight: 400;
            }
            
            .search-icon {
                position: absolute;
                left: var(--gap-medium);
                color: #6b7280;
                pointer-events: none;
                font-size: 14px;
                z-index: 1;
            }
            
            .search-input:focus + .search-icon {
                color: #3b82f6;
            }
            
            .search-clear {
                position: absolute;
                right: var(--gap-small);
                background: #ef4444;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all var(--transition-speed) ease;
            }
            
            .search-clear:hover {
                background: #dc2626;
                transform: scale(1.1);
            }
            
            /* Modes de vue */
            .view-modes {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 3px;
                gap: 2px;
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            .view-mode {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 0 12px;
                height: calc(var(--btn-height) - 6px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 80px;
                white-space: nowrap;
            }
            
            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }
            
            .view-mode.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
            }
            
            /* Actions */
            .action-buttons {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
                position: relative;
                z-index: 1001;
            }
            
            .btn-action {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--gap-medium);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: var(--shadow-base);
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .btn-action:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed !important;
                pointer-events: none;
            }
            
            .btn-action.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-action.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-action.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-action.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .btn-action.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                min-width: 140px;
            }
            
            .btn-action.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }
            
            .btn-action.btn-selection-toggle.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-selection-toggle.all-selected:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-action.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-clear:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-text {
                font-weight: inherit;
            }
            
            .btn-count {
                font-size: 11px;
                opacity: 0.8;
                margin-left: 2px;
            }
            
            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            /* Dropdown */
            .dropdown-action {
                position: relative;
                display: inline-block;
                z-index: 1002;
            }
            
            .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
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
                gap: var(--gap-small);
                padding: 10px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                color: #374151;
                font-size: var(--btn-font-size);
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
            
            /* ===== FILTRES DE CATÉGORIES AGRANDIS AVEC GESTION 2 LIGNES ===== */
            .status-filters-compact {
                display: flex;
                gap: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
                position: relative;
                z-index: 10;
                align-items: flex-start;
            }
            
            .status-pill-compact {
                height: auto;
                min-height: 48px;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
                border-radius: calc(var(--btn-border-radius) + 2px);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
                position: relative;
                overflow: visible;
                z-index: 11;
                flex: 0 1 calc(16.666% - var(--gap-medium));
                min-width: 140px;
                max-width: 220px;
                text-align: center;
            }
            
            .status-pill-compact.preselected-category {
                border-color: var(--preselect-color);
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                border-width: 2px;
                animation: pulsePreselected 3s ease-in-out infinite;
            }
            
            /* Première ligne : Icône + Compteur */
            .pill-first-line {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
            }
            
            .status-pill-compact .pill-icon {
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .status-pill-compact .pill-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 700;
                min-width: 24px;
                text-align: center;
                flex-shrink: 0;
            }
            
            /* Deuxième ligne : Texte */
            .pill-second-line {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }
            
            .status-pill-compact .pill-text {
                font-weight: 700;
                color: inherit;
                font-size: 13px;
                line-height: 1.2;
                text-align: center;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
                max-width: 100%;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .status-pill-compact .preselected-star {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 18px;
                height: 18px;
                background: var(--preselect-color);
                color: white;
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                animation: starPulse 2s ease-in-out infinite;
                z-index: 15;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .status-pill-compact:hover {
                border-color: #3b82f6;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
                z-index: 12;
            }
            
            .status-pill-compact.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                transform: translateY(-2px);
                z-index: 13;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
            
            .status-pill-compact.active.preselected-category {
                background: linear-gradient(135deg, var(--preselect-color) 0%, var(--preselect-color-dark) 100%);
                border-color: var(--preselect-color);
                box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
            }
            
            .status-pill-compact.active .pill-count {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }
            
            .status-pill-compact.preselected-category:hover {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                border-color: var(--preselect-color);
                transform: translateY(-2px);
            }
            
            /* Adaptation responsive pour maintenir la lisibilité */
            @media (max-width: 1400px) {
                .status-pill-compact {
                    flex: 0 1 calc(20% - var(--gap-medium));
                    min-width: 130px;
                    max-width: 200px;
                }
            }
            
            @media (max-width: 1200px) {
                .status-pill-compact {
                    flex: 0 1 calc(25% - var(--gap-medium));
                    min-width: 120px;
                    max-width: 180px;
                }
            }
            
            @media (max-width: 1024px) {
                .status-pill-compact {
                    flex: 0 1 calc(33.333% - var(--gap-medium));
                    min-width: 110px;
                    max-width: 160px;
                }
                
                .controls-bar-single-line {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .search-section {
                    max-width: none;
                    order: 1;
                }
                
                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }
                
                .dropdown-menu {
                    right: auto;
                    left: 0;
                }
            }
            
            /* Bouton de sélection amélioré */
            .btn-expanded.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: calc(var(--btn-height) + 8px);
                min-width: 120px;
                gap: 2px;
            }
            
            .btn-expanded.btn-selection-toggle .main-text {
                font-size: 12px;
                font-weight: 700;
                line-height: 1.2;
            }
            
            .btn-expanded.btn-selection-toggle .sub-text {
                font-size: 10px;
                font-weight: 500;
                opacity: 0.8;
                line-height: 1;
            }
            
            .btn-expanded.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }
            
            .btn-expanded.btn-selection-toggle.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-expanded.btn-selection-toggle.all-selected:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            /* Container des emails */
            .tasks-container-harmonized {
                background: transparent;
                transition: padding-top 0.3s ease;
            }
            
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            /* ===== CARTES D'EMAILS AVEC PRÉ-SÉLECTION ===== */
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                z-index: 1;
            }
            
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 2;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }
            
            .task-harmonized-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid var(--preselect-color);
                border-color: rgba(139, 92, 246, 0.3);
            }
            
            .task-harmonized-card.preselected-task:hover {
                border-left: 4px solid var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
                border-color: rgba(139, 92, 246, 0.4);
            }
            
            .task-harmonized-card.preselected-task.selected {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-left: 4px solid var(--preselect-color);
                border-color: var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
            }
            
            .task-checkbox-harmonized {
                margin-right: var(--gap-medium);
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all var(--transition-speed) ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-harmonized-card.preselected-task .task-checkbox-harmonized:checked {
                background: var(--preselect-color);
                border-color: var(--preselect-color);
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: 4px;
            }
            
            .task-title-harmonized {
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
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
            }
            
            .task-type-badge-harmonized,
            .deadline-badge-harmonized,
            .confidence-badge-harmonized {
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
            
            .confidence-badge-harmonized {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
            }
            
            .preselected-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, var(--preselect-color) 0%, var(--preselect-color-dark) 100%);
                color: white !important;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
            }
            
            .reply-indicator-harmonized {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
            }
            
            .category-indicator-harmonized {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
                transition: all 0.2s ease;
            }
            
            .task-harmonized-card.preselected-task .category-indicator-harmonized {
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                animation: categoryGlow 2s ease-in-out infinite;
            }
            
            @keyframes categoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5);
                }
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
                z-index: 10;
                position: relative;
            }
            
            .action-btn-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
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
                z-index: 11;
                position: relative;
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.create-task {
                color: #3b82f6;
            }
            
            .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task {
                color: var(--preselect-color);
                background: rgba(139, 92, 246, 0.1);
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-color: var(--preselect-color);
                color: var(--preselect-color-dark);
            }
            
            .action-btn-harmonized.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }
            
            .action-btn-harmonized.view-task:hover {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }
            
            /* Vue groupée */
            .tasks-grouped-harmonized {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-group-harmonized {
                background: transparent;
                border: none;
                border-radius: 0;
                overflow: visible;
                margin: 0;
                padding: 0;
                z-index: 1;
            }
            
            .group-header-harmonized {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                gap: var(--gap-medium);
                z-index: 1;
            }
            
            .group-avatar-harmonized {
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
            
            .group-info-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .group-name-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .group-meta-harmonized {
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .group-expand-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
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
            
            .group-content-harmonized {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }
            
            /* État vide harmonisé */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-harmonized {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
            }
            
            /* RESPONSIVE ÉTENDU */
            @media (max-width: 1400px) {
                .search-box-full {
                    max-width: 700px;
                }
                
                .buttons-line-full {
                    gap: var(--gap-medium);
                }
                
                .action-buttons-expanded {
                    gap: var(--gap-small);
                }
            }
            
            @media (max-width: 1200px) {
                .search-box-full {
                    max-width: 600px;
                }
                
                .view-mode-expanded {
                    min-width: 100px;
                    padding: 0 12px;
                }
                
                .btn-expanded {
                    padding: 0 12px;
                }
            }
            
            @media (max-width: 1024px) {
                .controls-bar-single-line {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .search-section {
                    max-width: none;
                    order: 1;
                }
                
                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }
                
                .dropdown-menu {
                    right: auto;
                    left: 0;
                }
            }
            
            @media (max-width: 768px) {
                .status-filters-compact {
                    flex-wrap: wrap;
                    gap: 2px;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    background: transparent;
                }
                
                .status-pill-compact {
                    flex: 0 1 calc(50% - 1px);
                    min-width: 0;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .status-pill-compact:first-child,
                .status-pill-compact:last-child {
                    border-radius: var(--btn-border-radius);
                }
                
                .view-mode span,
                .btn-action .btn-text {
                    display: none;
                }
                
                .view-mode {
                    min-width: 44px;
                    padding: 0;
                    justify-content: center;
                }
                
                .btn-action {
                    padding: 0 var(--gap-small);
                    min-width: 44px;
                    justify-content: center;
                }
                
                .btn-action .btn-count {
                    display: none;
                }
                
                .search-input {
                    font-size: 14px;
                    padding: 0 var(--gap-small) 0 36px;
                }
                
                .search-icon {
                    left: var(--gap-small);
                    font-size: 14px;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-compact {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .status-pill-compact {
                    flex: none;
                    width: 100%;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .controls-bar-single-line {
                    padding: var(--gap-small);
                    gap: var(--gap-small);
                }
                
                .action-buttons {
                    flex-direction: column;
                    gap: var(--gap-small);
                    align-items: stretch;
                }
                
                .action-buttons > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .dropdown-menu {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 300px;
                }
                
                .sticky-controls-container {
                    padding: var(--gap-small);
                }
            }, 0.06);
                    display: flex;
                    flex-direction: column;
                    gap: var(--gap-large);
                    position: relative;
                    z-index: 100;
                }
                
                .buttons-line-full {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .view-modes-expanded {
                    width: 100%;
                    justify-content: space-around;
                }
                
                .action-buttons-expanded {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .search-box-full {
                    max-width: 100%;
                }
                
                .buttons-separator {
                    display: none;
                }
            }
            
            @media (max-width: 768px) {
                .view-mode-expanded span,
                .btn-expanded span {
                    display: none;
                }
                
                .view-mode-expanded {
                    min-width: 44px;
                    padding: 0;
                    justify-content: center;
                }
                
                .btn-expanded {
                    padding: 0 var(--gap-small);
                }
                
                .search-input-full {
                    font-size: var(--btn-font-size);
                    padding: 0 var(--gap-medium) 0 48px;
                }
                
                .search-icon-full {
                    left: var(--gap-medium);
                    font-size: 16px;
                }
            }
            
            @media (max-width: 480px) {
                .controls-bar-harmonized-expanded {
                    padding: var(--gap-small);
                    gap: var(--gap-medium);
                }
                
                .action-buttons-expanded {
                    flex-direction: column;
                    gap: var(--gap-small);
                    align-items: stretch;
                }
                
                .action-buttons-expanded > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .dropdown-menu-expanded {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 300px;
                }
                
                .search-box-full {
                    height: calc(var(--btn-height) + 4px);
                }
                
                .search-input-full {
                    padding: 0 var(--gap-small) 0 40px;
                }
                
                .sticky-controls-container {
                    padding: var(--gap-small);
                }
            }
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

console.log('✅ PageManager v12.2 loaded - Position fixe et sélection tout');
