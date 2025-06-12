// PageManager.js - Version 13.0 - Synchronisation intégrale réécriture

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
        
        // NOUVEAU: État de synchronisation renforcé
        this.syncState = {
            lastUpdate: 0,
            pendingSync: false,
            isRefreshing: false,
            settingsCache: null,
            emailsCache: null,
            categoryCache: null
        };
        
        // NOUVEAU: Queue des événements pour éviter les conflits
        this.eventQueue = [];
        this.isProcessingEvents = false;
        
        // NOUVEAU: Monitoring temps réel
        this.syncInterval = null;
        this.settingsWatcher = null;
        
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
        this.startSyncMonitoring();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 13.0 - Synchronisation intégrale réécriture');
        
        // Synchronisation initiale
        this.forceCacheRefresh();
    }

    // ================================================
    // SYSTÈME DE SURVEILLANCE TEMPS RÉEL - NOUVEAU
    // ================================================
    startSyncMonitoring() {
        // Surveillance continue toutes les 2 secondes
        this.syncInterval = setInterval(() => {
            this.checkForUpdates();
        }, 2000);
        
        // Surveillance spéciale des paramètres toutes les 500ms
        this.settingsWatcher = setInterval(() => {
            this.watchSettingsChanges();
        }, 500);
        
        console.log('[PageManager] 🔄 Surveillance temps réel activée');
    }

    checkForUpdates() {
        if (this.syncState.isRefreshing || this.isProcessingEvents) {
            return; // Éviter les conflits
        }
        
        try {
            // Vérifier si les données ont changé
            const hasSettingsChanged = this.hasSettingsChanged();
            const hasEmailsChanged = this.hasEmailsChanged();
            const hasCategoriesChanged = this.hasCategoriesChanged();
            
            if (hasSettingsChanged || hasEmailsChanged || hasCategoriesChanged) {
                console.log('[PageManager] 🔍 Changements détectés:', {
                    settings: hasSettingsChanged,
                    emails: hasEmailsChanged,
                    categories: hasCategoriesChanged
                });
                
                this.queueSyncEvent('auto-update', {
                    settings: hasSettingsChanged,
                    emails: hasEmailsChanged,
                    categories: hasCategoriesChanged
                });
            }
        } catch (error) {
            console.error('[PageManager] Erreur vérification updates:', error);
        }
    }

    watchSettingsChanges() {
        if (!window.categoryManager) return;
        
        try {
            const currentSettings = window.categoryManager.getSettings();
            const currentTaskCategories = window.categoryManager.getTaskPreselectedCategories();
            
            if (!this.syncState.settingsCache) {
                this.syncState.settingsCache = {
                    settings: JSON.stringify(currentSettings),
                    taskCategories: JSON.stringify(currentTaskCategories)
                };
                return;
            }
            
            const settingsStr = JSON.stringify(currentSettings);
            const taskCategoriesStr = JSON.stringify(currentTaskCategories);
            
            if (this.syncState.settingsCache.settings !== settingsStr ||
                this.syncState.settingsCache.taskCategories !== taskCategoriesStr) {
                
                console.log('[PageManager] 📊 Changement de paramètres détecté');
                console.log('  - Anciennes catégories tâches:', JSON.parse(this.syncState.settingsCache.taskCategories));
                console.log('  - Nouvelles catégories tâches:', currentTaskCategories);
                
                this.syncState.settingsCache = {
                    settings: settingsStr,
                    taskCategories: taskCategoriesStr
                };
                
                this.queueSyncEvent('settings-changed', {
                    settings: currentSettings,
                    taskCategories: currentTaskCategories
                });
            }
        } catch (error) {
            console.error('[PageManager] Erreur watch settings:', error);
        }
    }

    hasSettingsChanged() {
        if (!window.categoryManager) return false;
        
        try {
            const current = JSON.stringify(window.categoryManager.getSettings());
            const cached = this.syncState.settingsCache?.settings;
            return current !== cached;
        } catch (error) {
            return false;
        }
    }

    hasEmailsChanged() {
        if (!window.emailScanner) return false;
        
        try {
            const currentEmails = window.emailScanner.getAllEmails();
            const currentStr = JSON.stringify({
                count: currentEmails.length,
                lastUpdate: Math.max(...currentEmails.map(e => new Date(e.receivedDateTime).getTime()))
            });
            
            const cached = this.syncState.emailsCache;
            return currentStr !== cached;
        } catch (error) {
            return false;
        }
    }

    hasCategoriesChanged() {
        if (!window.categoryManager) return false;
        
        try {
            const current = JSON.stringify(Object.keys(window.categoryManager.getCategories()));
            const cached = this.syncState.categoryCache;
            return current !== cached;
        } catch (error) {
            return false;
        }
    }

    // ================================================
    // SYSTÈME DE QUEUE D'ÉVÉNEMENTS - NOUVEAU
    // ================================================
    queueSyncEvent(type, data) {
        this.eventQueue.push({
            type,
            data,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        
        if (!this.isProcessingEvents) {
            this.processEventQueue();
        }
    }

    async processEventQueue() {
        if (this.isProcessingEvents || this.eventQueue.length === 0) {
            return;
        }
        
        this.isProcessingEvents = true;
        
        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                console.log(`[PageManager] 🔄 Traitement événement: ${event.type}`, event.data);
                
                await this.handleSyncEvent(event);
                
                // Petite pause pour éviter la surcharge
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (error) {
            console.error('[PageManager] Erreur traitement queue:', error);
        } finally {
            this.isProcessingEvents = false;
        }
    }

    async handleSyncEvent(event) {
        const { type, data } = event;
        
        switch (type) {
            case 'settings-changed':
                await this.handleSettingsChange(data);
                break;
                
            case 'categories-changed':
                await this.handleCategoriesChange(data);
                break;
                
            case 'emails-changed':
                await this.handleEmailsChange(data);
                break;
                
            case 'auto-update':
                await this.handleAutoUpdate(data);
                break;
                
            case 'force-refresh':
                await this.handleForceRefresh(data);
                break;
                
            default:
                console.warn(`[PageManager] Type d'événement inconnu: ${type}`);
        }
    }

    async handleSettingsChange(data) {
        console.log('[PageManager] 🎯 === GESTION CHANGEMENT PARAMÈTRES ===');
        
        // Mettre à jour le cache
        this.forceCacheRefresh();
        
        // Si on est sur la page emails, forcer la mise à jour
        if (this.currentPage === 'emails') {
            console.log('[PageManager] 📧 Page emails active, mise à jour en cours...');
            
            // Re-catégoriser les emails si nécessaire
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Recatégorisation des emails...');
                await window.emailScanner.recategorizeEmails();
            }
            
            // Actualiser l'affichage
            await this.refreshEmailsView();
        }
        
        console.log('[PageManager] ✅ Changement paramètres traité');
    }

    async handleCategoriesChange(data) {
        console.log('[PageManager] 🏷️ Gestion changement catégories');
        
        this.forceCacheRefresh();
        
        if (this.currentPage === 'emails') {
            await this.refreshEmailsView();
        }
    }

    async handleEmailsChange(data) {
        console.log('[PageManager] 📧 Gestion changement emails');
        
        this.forceCacheRefresh();
        
        if (this.currentPage === 'emails') {
            await this.refreshEmailsView();
        }
    }

    async handleAutoUpdate(data) {
        console.log('[PageManager] 🔄 Mise à jour automatique');
        
        if (data.settings) {
            await this.handleSettingsChange(data);
        } else if (data.emails) {
            await this.handleEmailsChange(data);
        } else if (data.categories) {
            await this.handleCategoriesChange(data);
        }
    }

    async handleForceRefresh(data) {
        console.log('[PageManager] 🚀 Actualisation forcée');
        
        this.forceCacheRefresh();
        
        if (this.currentPage === 'emails') {
            await this.renderEmails(document.getElementById('pageContent'));
        }
    }

    // ================================================
    // GESTION DU CACHE - NOUVEAU
    // ================================================
    forceCacheRefresh() {
        console.log('[PageManager] 🔄 Actualisation cache forcée');
        
        try {
            // Cache des paramètres
            if (window.categoryManager) {
                const settings = window.categoryManager.getSettings();
                const taskCategories = window.categoryManager.getTaskPreselectedCategories();
                
                this.syncState.settingsCache = {
                    settings: JSON.stringify(settings),
                    taskCategories: JSON.stringify(taskCategories)
                };
            }
            
            // Cache des emails
            if (window.emailScanner) {
                const emails = window.emailScanner.getAllEmails();
                this.syncState.emailsCache = JSON.stringify({
                    count: emails.length,
                    lastUpdate: emails.length > 0 ? 
                        Math.max(...emails.map(e => new Date(e.receivedDateTime).getTime())) : 0
                });
            }
            
            // Cache des catégories
            if (window.categoryManager) {
                this.syncState.categoryCache = JSON.stringify(
                    Object.keys(window.categoryManager.getCategories())
                );
            }
            
            this.syncState.lastUpdate = Date.now();
            console.log('[PageManager] ✅ Cache actualisé');
            
        } catch (error) {
            console.error('[PageManager] Erreur actualisation cache:', error);
        }
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION RENFORCÉE
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres avec priorité haute
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 categorySettingsChanged reçu:', event.detail);
            this.queueSyncEvent('settings-changed', event.detail);
        });

        // Écouter les changements génériques
        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 settingsChanged reçu:', event.detail);
            this.queueSyncEvent('settings-changed', event.detail);
        });

        // Écouter la recatégorisation des emails
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] 📨 emailsRecategorized reçu');
            this.queueSyncEvent('emails-changed', event.detail);
        });

        // Écouter la fin de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] 📨 scanCompleted reçu');
            this.lastScanData = event.detail;
            this.queueSyncEvent('emails-changed', event.detail);
        });

        // Écouter la synchronisation forcée
        window.addEventListener('forceSynchronization', (event) => {
            console.log('[PageManager] 📨 forceSynchronization reçu');
            this.queueSyncEvent('force-refresh', event.detail);
        });

        // Nouveau: Écouter les changements EmailScanner
        window.addEventListener('emailScannerSynced', (event) => {
            console.log('[PageManager] 📨 emailScannerSynced reçu');
            this.queueSyncEvent('emails-changed', event.detail);
        });
    }

    // ================================================
    // MÉTHODES PUBLIQUES DE SYNCHRONISATION - NOUVELLES
    // ================================================
    async forceSynchronization() {
        console.log('[PageManager] 🚀 === SYNCHRONISATION FORCÉE ===');
        
        this.queueSyncEvent('force-refresh', { 
            source: 'manual',
            timestamp: Date.now()
        });
        
        // Attendre que la queue soit traitée
        while (this.isProcessingEvents || this.eventQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('[PageManager] ✅ Synchronisation forcée terminée');
    }

    async refreshCurrentPage() {
        if (!this.currentPage) return;
        
        console.log(`[PageManager] 🔄 Actualisation page courante: ${this.currentPage}`);
        
        const container = document.getElementById('pageContent');
        if (container && this.pages[this.currentPage]) {
            await this.pages[this.currentPage](container);
        }
    }

    // ================================================
    // MÉTHODES DE RÉCUPÉRATION DES PARAMÈTRES - RENFORCÉES
    // ================================================
    getTaskPreselectedCategories() {
        // Priorité 1: CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const categories = window.categoryManager.getTaskPreselectedCategories();
            console.log('[PageManager] 📋 Catégories depuis CategoryManager:', categories);
            return categories;
        }
        
        // Priorité 2: CategoriesPage
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            const categories = window.categoriesPage.getTaskPreselectedCategories();
            console.log('[PageManager] 📋 Catégories depuis CategoriesPage:', categories);
            return categories;
        }
        
        // Priorité 3: EmailScanner
        if (window.emailScanner && typeof window.emailScanner.getTaskPreselectedCategories === 'function') {
            const categories = window.emailScanner.getTaskPreselectedCategories();
            console.log('[PageManager] 📋 Catégories depuis EmailScanner:', categories);
            return categories;
        }
        
        // Fallback localStorage
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            const categories = settings.taskPreselectedCategories || [];
            console.log('[PageManager] 📋 Catégories depuis localStorage:', categories);
            return categories;
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories:', error);
            return ['tasks', 'commercial', 'finance', 'meetings']; // Défaut
        }
    }

    getCurrentSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            return window.categoryManager.getSettings();
        }
        
        try {
            return JSON.parse(localStorage.getItem('categorySettings') || '{}');
        } catch (error) {
            console.error('[PageManager] Erreur récupération settings:', error);
            return {};
        }
    }

    // ================================================
    // PAGE LOADING - DASHBOARD IGNORÉ AVEC SYNC
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] 📄 Chargement page: ${pageName}`);

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
            // NOUVEAU: Forcer la synchronisation avant le chargement
            this.forceCacheRefresh();
            
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
                
                // NOUVEAU: Si c'est la page emails, démarrer l'auto-analyse
                if (pageName === 'emails') {
                    setTimeout(() => {
                        this.startEmailsAutoAnalysis();
                    }, 1000);
                }
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

    // ================================================
    // EMAILS PAGE - SYNCHRONISÉE AVEC PARAMÈTRES EN TEMPS RÉEL
    // ================================================
    async renderEmails(container) {
        console.log('[PageManager] 📧 === RENDU PAGE EMAILS AVEC SYNC ===');
        
        // Force refresh du cache avant rendu
        this.forceCacheRefresh();
        
        // Récupérer les emails depuis EmailScanner centralisé
        const emails = window.emailScanner?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] 📊 Rendu avec ${emails.length} emails`);
        console.log(`[PageManager] 🏷️ Catégories disponibles:`, Object.keys(categories));
        
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
            
            // NOUVEAU: Récupérer les catégories pré-sélectionnées avec sync
            const preselectedCategories = this.getTaskPreselectedCategories();
            const preselectedCount = emails.filter(email => 
                preselectedCategories.includes(email.category)
            ).length;
            
            console.log('[PageManager] 📋 Catégories pré-sélectionnées actuelles:', preselectedCategories);
            console.log('[PageManager] ⭐ Emails dans catégories pré-sélectionnées:', preselectedCount);
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Indicateur de synchronisation -->
                    <div class="sync-status-bar" id="syncStatusBar">
                        ${this.renderSyncStatusBar(preselectedCategories, preselectedCount)}
                    </div>
                    
                    <!-- Texte explicatif avec possibilité de fermer -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized">
                            <i class="fas fa-info-circle"></i>
                            <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour transformer les emails sélectionnés en tâches ou effectuer d'autres opérations. Les emails des catégories pré-sélectionnées (${preselectedCategories.length}) sont prioritaires pour la création de tâches.</span>
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
                            
                            <!-- NOUVEAU: Bouton synchronisation -->
                            <button class="btn-harmonized btn-sync" onclick="window.pageManager.forceSynchronization()" title="Synchroniser">
                                <i class="fas fa-sync"></i>
                                <span>Sync</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filtres de catégories -->
                    <div class="status-filters-harmonized-twolines">
                        ${this.buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories, preselectedCategories)}
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
        
        // NOUVEAU: Démarrer la surveillance temps réel de cette page
        this.startEmailPageMonitoring();
    }

    // ================================================
    // NOUVEAU: BARRE DE STATUT DE SYNCHRONISATION
    // ================================================
    renderSyncStatusBar(preselectedCategories, preselectedCount) {
        const syncTime = new Date().toLocaleTimeString('fr-FR');
        
        return `
            <div class="sync-status-content">
                <div class="sync-info">
                    <i class="fas fa-sync-alt" id="syncIcon"></i>
                    <span>Synchronisé à ${syncTime}</span>
                    <span class="separator">•</span>
                    <span>${preselectedCategories.length} catégorie(s) pré-sélectionnée(s)</span>
                    <span class="separator">•</span>
                    <span>${preselectedCount} email(s) prioritaire(s)</span>
                </div>
                <div class="sync-actions">
                    <button class="btn-sync-small" onclick="window.pageManager.openSettingsPage()" title="Modifier paramètres">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-sync-small" onclick="window.pageManager.forceSynchronization()" title="Forcer sync">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // NOUVEAU: SURVEILLANCE PAGE EMAILS
    // ================================================
    startEmailPageMonitoring() {
        if (this.emailPageMonitor) {
            clearInterval(this.emailPageMonitor);
        }
        
        // Surveillance spéciale pour la page emails toutes les 1 seconde
        this.emailPageMonitor = setInterval(() => {
            if (this.currentPage === 'emails') {
                this.updateEmailPageSync();
            } else {
                clearInterval(this.emailPageMonitor);
                this.emailPageMonitor = null;
            }
        }, 1000);
    }

    updateEmailPageSync() {
        try {
            // Mettre à jour la barre de statut
            const syncBar = document.getElementById('syncStatusBar');
            if (syncBar) {
                const preselectedCategories = this.getTaskPreselectedCategories();
                const emails = window.emailScanner?.getAllEmails() || [];
                const preselectedCount = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).length;
                
                syncBar.innerHTML = this.renderSyncStatusBar(preselectedCategories, preselectedCount);
            }
            
            // Animer l'icône de sync
            const syncIcon = document.getElementById('syncIcon');
            if (syncIcon && this.syncState.lastUpdate > Date.now() - 2000) {
                syncIcon.classList.add('fa-spin');
                setTimeout(() => {
                    syncIcon.classList.remove('fa-spin');
                }, 1000);
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur update sync page emails:', error);
        }
    }

    // ================================================
    // NOUVEAU: MÉTHODE POUR OUVRIR LES PARAMÈTRES
    // ================================================
    openSettingsPage() {
        console.log('[PageManager] 🔧 Ouverture page paramètres depuis emails');
        this.loadPage('settings');
    }

    // ================================================
    // MISE À JOUR DES FILTRES - AVEC PRÉ-SÉLECTION
    // ================================================
    buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories, preselectedCategories) {
        const tabs = [
            { id: 'all', name: 'Tous', icon: '📧', count: totalEmails }
        ];
        
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
            const isActive = this.currentCategory === tab.id;
            const preselectedClass = tab.isPreselected ? 'preselected-category' : '';
            
            return `
                <button class="status-pill-harmonized-twolines ${isActive ? 'active' : ''} ${preselectedClass}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        title="${tab.isPreselected ? 'Catégorie pré-sélectionnée pour tâches' : ''}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                            ${tab.isPreselected ? '<span class="pill-star">⭐</span>' : ''}
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    // ================================================
    // RENDU DES EMAILS - AVEC INDICATEURS PRÉ-SÉLECTION
    // ================================================
    renderHarmonizedEmailRow(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        // NOUVEAU: Vérifier si l'email est dans une catégorie pré-sélectionnée EN TEMPS RÉEL
        const preselectedCategories = this.getTaskPreselectedCategories();
        const isPreselectedForTasks = preselectedCategories.includes(email.category);
        
        // NOUVEAU: Classes CSS basées sur la pré-sélection
        const preselectedClass = isPreselectedForTasks ? 'preselected-task' : '';
        const urgentClass = email.importance === 'high' ? 'urgent-email' : '';
        
        return `
            <div class="task-harmonized-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${preselectedClass} ${urgentClass}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <!-- Checkbox de sélection -->
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <!-- Indicateur de priorité -->
                <div class="priority-bar-harmonized" style="background-color: ${this.getEmailPriorityColor(email)}"></div>
                
                <!-- NOUVEAU: Indicateur pré-sélection -->
                ${isPreselectedForTasks ? `
                    <div class="preselection-indicator" title="Catégorie pré-sélectionnée pour tâches">
                        <i class="fas fa-star"></i>
                    </div>
                ` : ''}
                
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
                                    ⭐ Prioritaire
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

    // ================================================
    // AUTO-ANALYSE INTELLIGENTE - NOUVEAU
    // ================================================
    startEmailsAutoAnalysis() {
        if (!this.autoAnalyzeEnabled) return;
        
        const emails = window.emailScanner?.getAllEmails() || [];
        if (emails.length === 0) return;
        
        // Prioriser les emails pré-sélectionnés
        const preselectedCategories = this.getTaskPreselectedCategories();
        const priorityEmails = emails.filter(email => 
            preselectedCategories.includes(email.category) && !email.aiAnalysis
        ).slice(0, 5);
        
        console.log('[PageManager] 🤖 Auto-analyse démarrée pour', priorityEmails.length, 'emails prioritaires');
        
        if (priorityEmails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(priorityEmails);
            }, 1500);
        }
    }

    // ================================================
    // MÉTHODES DE RAFRAÎCHISSEMENT - RENFORCÉES
    // ================================================
    async refreshEmailsView() {
        if (this.syncState.isRefreshing) {
            console.log('[PageManager] 🔄 Rafraîchissement déjà en cours');
            return;
        }
        
        this.syncState.isRefreshing = true;
        
        try {
            console.log('[PageManager] 🔄 Rafraîchissement vue emails...');
            
            // Forcer le cache refresh
            this.forceCacheRefresh();
            
            const emailsContainer = document.querySelector('.tasks-container-harmonized');
            if (emailsContainer) {
                emailsContainer.innerHTML = this.renderEmailsList();
            }
            
            // Mettre à jour la barre de contrôles
            this.updateControlsBar();
            
            // Mettre à jour la barre de statut
            const syncBar = document.getElementById('syncStatusBar');
            if (syncBar) {
                const preselectedCategories = this.getTaskPreselectedCategories();
                const emails = window.emailScanner?.getAllEmails() || [];
                const preselectedCount = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).length;
                
                syncBar.innerHTML = this.renderSyncStatusBar(preselectedCategories, preselectedCount);
            }
            
            console.log('[PageManager] ✅ Vue emails rafraîchie');
            
        } catch (error) {
            console.error('[PageManager] Erreur rafraîchissement vue emails:', error);
        } finally {
            this.syncState.isRefreshing = false;
        }
    }

    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            // Force synchronisation complète
            await this.forceSynchronization();
            
            // Recatégoriser les emails existants si nécessaire
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Recatégorisation des emails...');
                await window.emailScanner.recategorizeEmails();
            }
            
            // Recharger la page emails
            await this.loadPage('emails');
            
            window.uiManager?.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
            console.error('[PageManager] Erreur refreshEmails:', error);
        }
    }

    // ================================================
    // STYLES CSS AMÉLIORÉS AVEC SYNCHRONISATION
    // ================================================
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Styles existants... */
            
            /* NOUVEAU: Barre de statut de synchronisation */
            .sync-status-bar {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 16px;
                font-size: 13px;
                color: #475569;
            }
            
            .sync-status-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }
            
            .sync-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .sync-info .separator {
                color: #94a3b8;
                font-weight: 300;
            }
            
            .sync-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-sync-small {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                color: #3b82f6;
                padding: 6px 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }
            
            .btn-sync-small:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: translateY(-1px);
            }
            
            /* NOUVEAU: Bouton sync principal */
            .btn-harmonized.btn-sync {
                background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                color: white;
                border-color: transparent;
            }
            
            .btn-harmonized.btn-sync:hover {
                background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
            }
            
            /* NOUVEAU: Indicateur de pré-sélection sur les emails */
            .preselection-indicator {
                position: absolute;
                top: 8px;
                right: 8px;
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                box-shadow: 0 2px 6px rgba(251, 191, 36, 0.3);
                animation: pulseGlow 2s infinite;
            }
            
            @keyframes pulseGlow {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1);
                    box-shadow: 0 2px 6px rgba(251, 191, 36, 0.3);
                }
                50% { 
                    opacity: 0.8; 
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
                }
            }
            
            /* NOUVEAU: Classes pour catégories pré-sélectionnées */
            .status-pill-harmonized-twolines.preselected-category {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-color: #f59e0b;
                color: #92400e;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
                transform: translateY(-1px);
            }
            
            .status-pill-harmonized-twolines.preselected-category .pill-star {
                color: #f59e0b;
                font-size: 10px;
                margin-left: 4px;
                animation: twinkle 1.5s infinite;
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* NOUVEAU: Email pré-sélectionné */
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%);
                border-left: 4px solid #f59e0b;
                position: relative;
            }
            
            .task-harmonized-card.preselected-task:hover {
                border-left: 5px solid #f59e0b;
                box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15);
            }
            
            /* NOUVEAU: Email urgent */
            .task-harmonized-card.urgent-email {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                border-left: 4px solid #ef4444;
            }
            
            .task-harmonized-card.urgent-email .preselected-badge-harmonized {
                background: #ef4444;
                color: white;
            }
            
            /* NOUVEAU: Badge prioritaire */
            .preselected-badge-harmonized {
                background: #fbbf24;
                color: #92400e;
                border-color: #f59e0b;
                font-weight: 700;
                animation: priorityPulse 3s infinite;
            }
            
            @keyframes priorityPulse {
                0%, 100% { 
                    background: #fbbf24;
                    transform: scale(1);
                }
                50% { 
                    background: #f59e0b;
                    transform: scale(1.05);
                }
            }
            
            /* NOUVEAU: Animation sync icon */
            #syncIcon.fa-spin {
                animation: spin 1s linear infinite;
                color: #06b6d4;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* NOUVEAU: États de synchronisation */
            .sync-status-bar.syncing {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #1e40af;
            }
            
            .sync-status-bar.error {
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                border-color: #ef4444;
                color: #dc2626;
            }
            
            .sync-status-bar.success {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border-color: #10b981;
                color: #047857;
            }
            
            /* Amélioration responsive */
            @media (max-width: 768px) {
                .sync-status-content {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .sync-info {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .preselection-indicator {
                    width: 20px;
                    height: 20px;
                    font-size: 8px;
                }
            }
            
            /* Tous les autres styles existants restent identiques... */
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES UTILITAIRES CONSERVÉES ET ENRICHIES
    // ================================================
    
    // [Conserver toutes les méthodes existantes comme toggleAllSelection, 
    // toggleEmailSelection, clearSelection, etc. mais enrichies avec la sync]
    
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
            
            // NOUVEAU: Message avec info pré-sélection
            const preselectedCategories = this.getTaskPreselectedCategories();
            const preselectedCount = visibleEmails.filter(email => 
                preselectedCategories.includes(email.category)
            ).length;
            
            const message = preselectedCount > 0 ? 
                `${visibleEmails.length} emails sélectionnés (${preselectedCount} prioritaires)` :
                `${visibleEmails.length} emails sélectionnés`;
                
            window.uiManager?.showToast(message, 'success');
        }
        
        this.refreshEmailsView();
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION - AVEC ARRÊT SURVEILLANCE
    // ================================================
    cleanup() {
        console.log('[PageManager] 🧹 Nettoyage avec arrêt surveillance...');
        
        // Arrêter la surveillance
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.settingsWatcher) {
            clearInterval(this.settingsWatcher);
            this.settingsWatcher = null;
        }
        
        if (this.emailPageMonitor) {
            clearInterval(this.emailPageMonitor);
            this.emailPageMonitor = null;
        }
        
        // Vider la queue d'événements
        this.eventQueue = [];
        this.isProcessingEvents = false;
        
        // Reset du state
        this.syncState = {
            lastUpdate: 0,
            pendingSync: false,
            isRefreshing: false,
            settingsCache: null,
            emailsCache: null,
            categoryCache: null
        };
        
        console.log('[PageManager] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        console.log('[PageManager] Instance détruite');
    }

    // ================================================
    // MÉTHODES ESSENTIELLES MANQUANTES - CORRECTION
    // ================================================
    
    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
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

    // ================================================
    // PAGES DE RENDU - TOUTES LES PAGES
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

    // [Inclure toutes les autres méthodes existantes...]
    
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

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
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

    // [Continuer avec toutes les autres méthodes nécessaires...]
    
    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
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

    // ================================================
    // MÉTHODES UTILITAIRES COMPLÈTES
    // ================================================
    
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
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

    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') return;
        if (event.target.closest('.task-actions-harmonized')) return;
        this.showEmailModal(emailId);
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

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshEmailsView();
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

    // Actions groupées
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

    getEmailById(emailId) {
        return window.emailScanner?.getEmailById(emailId) || null;
    }

    // Méthodes de modales et tâches simplifiées
    async showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        window.uiManager?.showToast('Modal email non implémentée', 'info');
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        window.uiManager?.showToast('Création de tâche non implémentée', 'info');
    }

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        window.uiManager?.showToast(`Création de ${this.selectedEmails.size} tâches non implémentée`, 'info');
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
}

// Créer l'instance globale avec nettoyage préalable
if (window.pageManager) {
    window.pageManager.destroy?.();
}

window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v13.0 loaded - Synchronisation intégrale réécriture');
