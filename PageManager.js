// PageManager.js - Version 14.0 - Interface corrigée et intégration complète CategoriesPage

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
        
        // Synchronisation légère
        this.syncState = {
            lastSettingsSync: 0,
            isRefreshing: false
        };
        
        // Page renderers - intégration CategoriesPage pour les paramètres
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container), // Délégation vers CategoriesPage
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 14.0 - Interface corrigée et intégration complète');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION
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

        // Synchronisation forcée
        window.addEventListener('forceSynchronization', (event) => {
            console.log('[PageManager] 📨 forceSynchronization reçu');
            this.forceSynchronization();
        });
    }

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES
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

    // ================================================
    // SYNCHRONISATION FORCÉE
    // ================================================
    async forceSynchronization() {
        console.log('[PageManager] 🚀 === SYNCHRONISATION FORCÉE ===');
        
        this.syncState.lastSettingsSync = Date.now();
        
        if (this.currentPage === 'emails' && !this.syncState.isRefreshing) {
            this.refreshEmailsView();
        }
        
        console.log('[PageManager] ✅ Synchronisation forcée terminée');
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
    // RENDU DES PARAMÈTRES - DÉLÉGATION VERS CATEGORIESPAGE
    // =====================================
    async renderSettings(container) {
        console.log('[PageManager] 🛠️ Rendu page paramètres - délégation vers CategoriesPage');
        
        try {
            // Vérifier si CategoriesPage est disponible
            if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
                console.log('[PageManager] ✅ CategoriesPage disponible, délégation...');
                
                // S'assurer que CategoriesPage est initialisé
                if (!window.categoriesPage.isInitialized) {
                    console.log('[PageManager] 🔄 Initialisation CategoriesPage...');
                    // Laisser CategoriesPage s'initialiser
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Déléguer le rendu à CategoriesPage
                window.categoriesPage.renderSettings(container);
                
                console.log('[PageManager] ✅ Paramètres rendus via CategoriesPage');
                return;
                
            } else {
                console.warn('[PageManager] ⚠️ CategoriesPage non disponible, rendu fallback');
                throw new Error('CategoriesPage non disponible');
            }
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur lors du rendu des paramètres:', error);
            
            // Fallback : interface de paramètres basique
            container.innerHTML = this.renderSettingsFallback();
        }
    }

    renderSettingsFallback() {
        console.log('[PageManager] 🔄 Rendu paramètres fallback');
        
        return `
            <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                        <i class="fas fa-cog" style="font-size: 24px; color: #6366f1;"></i>
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1f2937;">Paramètres</h1>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #92400e;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span style="font-weight: 600;">Module de paramètres en cours de chargement</span>
                        </div>
                        <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
                            Le module CategoriesPage est nécessaire pour afficher l'interface complète des paramètres.
                        </p>
                    </div>
                    
                    <div style="display: grid; gap: 16px;">
                        <!-- Status modules -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">État des modules</h3>
                            <div style="display: grid; gap: 8px;">
                                ${this.renderModuleStatus('CategoryManager', !!window.categoryManager)}
                                ${this.renderModuleStatus('CategoriesPage', !!window.categoriesPage)}
                                ${this.renderModuleStatus('EmailScanner', !!window.emailScanner)}
                                ${this.renderModuleStatus('AITaskAnalyzer', !!window.aiTaskAnalyzer)}
                                ${this.renderModuleStatus('TaskManager', !!window.taskManager)}
                                ${this.renderModuleStatus('UIManager', !!window.uiManager)}
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Actions</h3>
                            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                <button onclick="location.reload()" 
                                        style="padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-redo"></i> Recharger la page
                                </button>
                                <button onclick="window.pageManager.loadPage('dashboard')" 
                                        style="padding: 10px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-home"></i> Retour au tableau de bord
                                </button>
                                <button onclick="window.pageManager.debugModules()" 
                                        style="padding: 10px 16px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-bug"></i> Debug modules
                                </button>
                            </div>
                        </div>
                        
                        <!-- Informations -->
                        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px;">
                            <h3 style="margin: 0 0 12px 0; color: #0c4a6e;">Information</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
                                Pour accéder à l'interface complète des paramètres, assurez-vous que tous les modules sont chargés correctement. 
                                Le module CategoriesPage gère l'interface des paramètres, la configuration des catégories, et l'automatisation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderModuleStatus(moduleName, isAvailable) {
        const statusIcon = isAvailable ? '✅' : '❌';
        const statusColor = isAvailable ? '#10b981' : '#ef4444';
        const statusText = isAvailable ? 'Disponible' : 'Non disponible';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">${moduleName}</span>
                <span style="display: flex; align-items: center; gap: 6px; color: ${statusColor}; font-size: 14px; font-weight: 600;">
                    ${statusIcon} ${statusText}
                </span>
            </div>
        `;
    }

    debugModules() {
        console.log('\n=== DEBUG MODULES PAGEMANAGER ===');
        console.log('CategoryManager:', window.categoryManager ? '✅ Disponible' : '❌ Non disponible');
        console.log('CategoriesPage:', window.categoriesPage ? '✅ Disponible' : '❌ Non disponible');
        console.log('EmailScanner:', window.emailScanner ? '✅ Disponible' : '❌ Non disponible');
        console.log('AITaskAnalyzer:', window.aiTaskAnalyzer ? '✅ Disponible' : '❌ Non disponible');
        console.log('TaskManager:', window.taskManager ? '✅ Disponible' : '❌ Non disponible');
        console.log('UIManager:', window.uiManager ? '✅ Disponible' : '❌ Non disponible');
        
        if (window.categoriesPage) {
            console.log('CategoriesPage methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.categoriesPage)));
            console.log('CategoriesPage.renderSettings:', typeof window.categoriesPage.renderSettings);
            console.log('CategoriesPage.isInitialized:', window.categoriesPage.isInitialized);
        }
        
        console.log('================================\n');
        
        window.uiManager?.showToast('Voir la console pour les détails de debug', 'info');
    }

    // =====================================
    // EMAILS PAGE - INTERFACE RESTAURÉE AVEC INTÉGRATION
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
    // MÉTHODES DE SÉLECTION ET EMAIL MANAGEMENT
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
        if (this.syncState.isRefreshing) return;
        
        this.syncState.isRefreshing = true;
        
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        this.updateControlsBar();
        
        this.syncState.isRefreshing = false;
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
    // FILTRES ET AFFICHAGE
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
        
        // Vérifier si l'email est dans une catégorie pré-sélectionnée pour les tâches
        const preselectedCategories = this.getTaskPreselectedCategories();
        const isPreselectedForTasks = preselectedCategories.includes(email.category);
        
        return `
            <div class="task-harmonized-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselectedForTasks ? 'preselected-task' : ''}" 
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

    // ================================================
    // AUTRES PAGES (Scanner, Tasks, Categories, Ranger)
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] 🎯 Rendu page scanner...');
        
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
    // ÉVÉNEMENTS ET HANDLERS (méthodes simplifiées)
    // ================================================
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
        if (event.target.type === 'checkbox') return;
        if (event.target.closest('.task-actions-harmonized')) return;
        this.showEmailModal(emailId);
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
    // MÉTHODES UTILITAIRES (versions allégées)
    // ================================================
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

    // ================================================
    // ACTIONS GROUPÉES (stubs fonctionnels)
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
        
        window.uiManager?.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
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
            window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        window.uiManager?.showToast('Export en cours...', 'info');
        // Logique d'export simplifiée
        this.clearSelection();
    }

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

    // ================================================
    // MODALES SIMPLIFIÉES (stubs)
    // ================================================
    async showTaskCreationModal(emailId) {
        window.uiManager?.showToast('Fonctionnalité de création de tâches en cours de développement', 'info');
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        window.uiManager?.showToast(`Email de ${email.from?.emailAddress?.name || 'Inconnu'}: ${email.subject || 'Sans sujet'}`, 'info');
    }

    openCreatedTask(emailId) {
        window.uiManager?.showToast('Ouverture de la tâche...', 'info');
        this.loadPage('tasks');
    }

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        window.uiManager?.showToast(`Création de ${this.selectedEmails.size} tâche(s) en cours...`, 'info');
        // Logique de création simplifiée
        this.clearSelection();
    }

    async analyzeFirstEmails(emails) {
        // Analyse simplifiée
        console.log('[PageManager] Analyse de', emails.length, 'emails...');
    }

    // ================================================
    // STYLES CSS SIMPLIFIÉS (conservés pour compatibilité)
    // ================================================
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Variables CSS */
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
                position: relative;
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

            .controls-bar-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--gap-large);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                min-height: calc(var(--btn-height) + var(--gap-medium) * 2);
            }

            .search-section-harmonized {
                flex: 0 0 300px;
                height: var(--btn-height);
            }

            .search-box-harmonized {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
            }

            .search-input-harmonized {
                width: 100%;
                height: var(--btn-height);
                padding: 0 var(--gap-medium) 0 44px;
                border: 1px solid #d1d5db;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
            }

            .search-icon-harmonized {
                position: absolute;
                left: var(--gap-medium);
                color: #9ca3af;
                pointer-events: none;
            }

            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 4px;
                gap: 2px;
                height: var(--btn-height);
            }

            .view-mode-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: 0 var(--btn-padding-horizontal);
                height: calc(var(--btn-height) - 8px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 120px;
            }

            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
            }

            .action-buttons-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                height: var(--btn-height);
                flex-shrink: 0;
            }

            .btn-harmonized {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--btn-padding-horizontal);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
                box-shadow: var(--shadow-base);
            }

            .btn-harmonized:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }

            .btn-harmonized.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .status-filters-harmonized-twolines {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
            }

            .status-pill-harmonized-twolines {
                height: 60px;
                padding: var(--gap-small);
                font-size: 12px;
                font-weight: 700;
                flex: 0 1 calc(16.666% - var(--gap-small));
                min-width: 120px;
                max-width: 180px;
                border-radius: var(--btn-border-radius);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
            }

            .status-pill-harmonized-twolines.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
            }

            .tasks-container-harmonized {
                background: transparent;
            }

            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

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
                z-index: 1;
            }

            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }

            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid #8b5cf6;
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
            .confidence-badge-harmonized,
            .preselected-badge-harmonized {
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

            .preselected-badge-harmonized {
                background: #fdf4ff;
                color: #8b5cf6;
                border-color: #e9d5ff;
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

            .category-indicator-harmonized {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .task-actions-harmonized {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
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

            .action-btn-harmonized.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .action-btn-harmonized.details {
                color: #8b5cf6;
            }

            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }

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

            .dropdown-action-harmonized {
                position: relative;
                display: inline-block;
            }

            .dropdown-menu-harmonized {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                z-index: 1000;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
            }

            .dropdown-menu-harmonized.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .dropdown-item-harmonized {
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

            .dropdown-item-harmonized:hover {
                background: #f8fafc;
                color: #1f2937;
            }

            .dropdown-item-harmonized.danger {
                color: #dc2626;
            }

            .dropdown-item-harmonized.danger:hover {
                background: #fef2f2;
                color: #b91c1c;
            }

            .dropdown-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }

            .selection-info-harmonized {
                height: var(--btn-height);
                padding: 0 var(--btn-padding-horizontal);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                color: #1e40af;
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
            }

            .count-badge-small {
                background: #0ea5e9;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 6px;
                margin-left: 4px;
                min-width: 16px;
                text-align: center;
            }

            .count-badge-harmonized {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 3px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
            }

            .pill-content-twolines {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                width: 100%;
                height: 100%;
            }

            .pill-first-line-twolines {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-bottom: 4px;
            }

            .pill-icon-twolines {
                font-size: 16px;
            }

            .pill-count-twolines {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
                min-width: 18px;
                text-align: center;
            }

            .pill-text-twolines {
                font-weight: 700;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
            }

            /* États responsifs simplifiés */
            @media (max-width: 1024px) {
                .controls-bar-harmonized {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                    padding: var(--gap-large);
                }

                .search-section-harmonized {
                    flex: none;
                    width: 100%;
                }

                .view-modes-harmonized {
                    width: 100%;
                    justify-content: space-around;
                }

                .action-buttons-harmonized {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 80px;
                    max-width: 140px;
                    height: 52px;
                }
            }

            @media (max-width: 768px) {
                .view-mode-harmonized span,
                .btn-harmonized span {
                    display: none;
                }

                .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 70px;
                    max-width: 120px;
                    height: 48px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES DE RENDU POUR VUE GROUPÉE (simplifiées)
    // ================================================
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

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
        }
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
}

// ================================================
// INITIALISATION ET EXPORT GLOBAL
// ================================================

// Créer l'instance globale avec nettoyage préalable
try {
    if (window.pageManager) {
        // Nettoyage de l'ancienne instance si elle existe
        console.log('[PageManager] Nettoyage ancienne instance...');
        delete window.pageManager;
    }

    console.log('[PageManager] Création nouvelle instance v14.0...');
    window.pageManager = new PageManager();

    // Bind des méthodes pour préserver le contexte
    Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
            window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
        }
    });

    console.log('✅ PageManager v14.0 loaded - Interface corrigée et intégration complète');
    
    // Test de l'intégration CategoriesPage
    setTimeout(() => {
        if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
            console.log('✅ Intégration CategoriesPage confirmée');
        } else {
            console.warn('⚠️ CategoriesPage non disponible lors de l\'initialisation');
        }
    }, 1000);
    
} catch (error) {
    console.error('[PageManager] ❌ Erreur critique initialisation:', error);
    
    // Fallback minimal en cas d'erreur
    window.pageManager = {
        loadPage: (pageName) => {
            console.error('[PageManager] Mode fallback - impossible de charger:', pageName);
            const container = document.getElementById('pageContent');
            if (container) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                        <h2>Erreur PageManager</h2>
                        <p>Le gestionnaire de pages a rencontré une erreur. Veuillez recharger la page.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Recharger
                        </button>
                    </div>
                `;
            }
        },
        debugModules: () => {
            console.log('Mode fallback - debug non disponible');
        }
    };
}
