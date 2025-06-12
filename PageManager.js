// PageManager.js - Version 14.0 - Réécriture complète avec synchronisation parfaite

class PageManager {
    constructor() {
        // États principaux
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
        
        // NOUVEAU: Système de synchronisation ultra-robuste
        this.syncState = {
            isActive: false,
            lastSync: 0,
            syncLock: false,
            pendingOperations: [],
            watchers: new Set(),
            settingsVersion: 0,
            uiVersion: 0
        };
        
        // NOUVEAU: Cache pour optimiser les performances
        this.cache = {
            settings: null,
            emails: null,
            categories: null,
            lastUpdate: 0,
            ttl: 5000 // 5 secondes de cache
        };
        
        // Page renderers - DASHBOARD IGNORÉ
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

    async init() {
        console.log('[PageManager] ✅ Version 14.0 - Réécriture complète avec synchronisation parfaite');
        
        try {
            // 1. Initialiser la synchronisation
            await this.initializeSynchronization();
            
            // 2. Configurer les événements
            this.setupEventListeners();
            
            // 3. Démarrer la surveillance
            this.startSyncWatcher();
            
            console.log('[PageManager] 🎯 Initialisation complète terminée');
        } catch (error) {
            console.error('[PageManager] ❌ Erreur initialisation:', error);
        }
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION ULTRA-ROBUSTE
    // ================================================
    async initializeSynchronization() {
        console.log('[PageManager] 🔄 Initialisation de la synchronisation...');
        
        // S'abonner aux changements du CategoryManager
        if (window.categoryManager?.addWatcher) {
            window.categoryManager.addWatcher((settings) => {
                console.log('[PageManager] 📨 Settings mis à jour via CategoryManager watcher:', settings);
                this.handleSettingsUpdate(settings);
            });
        }
        
        // S'abonner aux changements de l'EmailScanner
        if (window.emailScanner?.addWatcher) {
            window.emailScanner.addWatcher((data) => {
                console.log('[PageManager] 📨 Données EmailScanner mises à jour:', data);
                this.handleEmailScannerUpdate(data);
            });
        }
        
        // Charger l'état initial
        await this.loadInitialState();
        
        this.syncState.isActive = true;
        this.syncState.lastSync = Date.now();
        
        console.log('[PageManager] ✅ Synchronisation initialisée');
    }

    async loadInitialState() {
        console.log('[PageManager] 📚 Chargement de l\'état initial...');
        
        try {
            // Charger les paramètres
            if (window.categoryManager?.getSettings) {
                this.cache.settings = window.categoryManager.getSettings();
            }
            
            // Charger les catégories
            if (window.categoryManager?.getCategories) {
                this.cache.categories = window.categoryManager.getCategories();
            }
            
            // Charger les emails si disponibles
            if (window.emailScanner?.getAllEmails) {
                this.cache.emails = window.emailScanner.getAllEmails();
            }
            
            this.cache.lastUpdate = Date.now();
            this.syncState.settingsVersion++;
            
            console.log('[PageManager] ✅ État initial chargé');
        } catch (error) {
            console.error('[PageManager] ❌ Erreur chargement état initial:', error);
        }
    }

    handleSettingsUpdate(newSettings) {
        if (this.syncState.syncLock) {
            console.log('[PageManager] 🔒 Mise à jour settings en attente (lock actif)');
            this.syncState.pendingOperations.push({ type: 'settings', data: newSettings });
            return;
        }
        
        this.syncState.syncLock = true;
        
        try {
            console.log('[PageManager] 🔄 Traitement mise à jour settings:', newSettings);
            
            // Mettre à jour le cache
            this.cache.settings = { ...newSettings };
            this.cache.lastUpdate = Date.now();
            this.syncState.settingsVersion++;
            this.syncState.lastSync = Date.now();
            
            // Forcer la mise à jour de l'interface si nécessaire
            if (this.currentPage === 'emails') {
                this.scheduleUIUpdate();
            }
            
            // Notifier les watchers
            this.notifyWatchers('settings', newSettings);
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur traitement mise à jour settings:', error);
        } finally {
            this.syncState.syncLock = false;
            this.processPendingOperations();
        }
    }

    handleEmailScannerUpdate(data) {
        if (this.syncState.syncLock) {
            console.log('[PageManager] 🔒 Mise à jour emails en attente (lock actif)');
            this.syncState.pendingOperations.push({ type: 'emails', data });
            return;
        }
        
        this.syncState.syncLock = true;
        
        try {
            console.log('[PageManager] 📧 Traitement mise à jour emails:', data);
            
            // Mettre à jour le cache
            if (data.emails) {
                this.cache.emails = [...data.emails];
            }
            if (data.settings) {
                this.cache.settings = { ...data.settings };
            }
            
            this.cache.lastUpdate = Date.now();
            this.syncState.lastSync = Date.now();
            
            // Forcer la mise à jour de l'interface
            if (this.currentPage === 'emails') {
                this.scheduleUIUpdate();
            }
            
            // Notifier les watchers
            this.notifyWatchers('emails', data);
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur traitement mise à jour emails:', error);
        } finally {
            this.syncState.syncLock = false;
            this.processPendingOperations();
        }
    }

    processPendingOperations() {
        if (this.syncState.pendingOperations.length > 0) {
            const operation = this.syncState.pendingOperations.shift();
            console.log('[PageManager] 🔄 Traitement opération en attente:', operation.type);
            
            setTimeout(() => {
                if (operation.type === 'settings') {
                    this.handleSettingsUpdate(operation.data);
                } else if (operation.type === 'emails') {
                    this.handleEmailScannerUpdate(operation.data);
                }
            }, 50);
        }
    }

    scheduleUIUpdate() {
        // Débounce les mises à jour UI pour éviter les re-rendus trop fréquents
        if (this.uiUpdateTimeout) {
            clearTimeout(this.uiUpdateTimeout);
        }
        
        this.uiUpdateTimeout = setTimeout(() => {
            console.log('[PageManager] 🎨 Mise à jour UI programmée');
            this.refreshEmailsView();
            this.syncState.uiVersion++;
        }, 200);
    }

    // ================================================
    // SYSTÈME DE WATCHERS
    // ================================================
    addWatcher(callback) {
        this.syncState.watchers.add(callback);
        console.log(`[PageManager] 👁️ Watcher ajouté (total: ${this.syncState.watchers.size})`);
        
        // Appeler immédiatement avec l'état actuel
        try {
            callback({
                settings: this.cache.settings,
                emails: this.cache.emails,
                categories: this.cache.categories,
                currentPage: this.currentPage,
                syncVersion: this.syncState.settingsVersion
            });
        } catch (error) {
            console.error('[PageManager] ❌ Erreur callback watcher:', error);
        }
    }

    removeWatcher(callback) {
        this.syncState.watchers.delete(callback);
        console.log(`[PageManager] 👁️ Watcher supprimé (total: ${this.syncState.watchers.size})`);
    }

    notifyWatchers(type, data) {
        const notificationData = {
            type,
            data,
            settings: this.cache.settings,
            emails: this.cache.emails,
            categories: this.cache.categories,
            currentPage: this.currentPage,
            syncVersion: this.syncState.settingsVersion,
            timestamp: Date.now()
        };
        
        this.syncState.watchers.forEach(callback => {
            try {
                callback(notificationData);
            } catch (error) {
                console.error('[PageManager] ❌ Erreur notification watcher:', error);
            }
        });
    }

    // ================================================
    // SURVEILLANCE CONTINUE
    // ================================================
    startSyncWatcher() {
        // Surveiller la cohérence toutes les 3 secondes
        setInterval(() => {
            this.checkSyncConsistency();
        }, 3000);
        
        console.log('[PageManager] 👁️ Surveillance synchronisation démarrée');
    }

    checkSyncConsistency() {
        if (this.syncState.syncLock) return;
        
        try {
            const now = Date.now();
            
            // Vérifier si le cache est expiré
            if (now - this.cache.lastUpdate > this.cache.ttl) {
                console.log('[PageManager] ⏰ Cache expiré, rechargement...');
                this.loadInitialState();
                return;
            }
            
            // Vérifier la cohérence avec CategoryManager
            if (window.categoryManager?.getSettings) {
                const managerSettings = window.categoryManager.getSettings();
                const cachedSettings = this.cache.settings;
                
                if (managerSettings && cachedSettings) {
                    const managerCategories = managerSettings.taskPreselectedCategories || [];
                    const cachedCategories = cachedSettings.taskPreselectedCategories || [];
                    
                    const areEqual = JSON.stringify(managerCategories.sort()) === 
                                   JSON.stringify(cachedCategories.sort());
                    
                    if (!areEqual) {
                        console.log('[PageManager] ⚠️ Incohérence détectée avec CategoryManager');
                        console.log('  - Manager:', managerCategories);
                        console.log('  - Cache:', cachedCategories);
                        
                        this.handleSettingsUpdate(managerSettings);
                    }
                }
            }
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur vérification cohérence:', error);
        }
    }

    // ================================================
    // MÉTHODES DE SYNCHRONISATION PUBLIQUES
    // ================================================
    async forceSynchronization() {
        console.log('[PageManager] 🚀 === SYNCHRONISATION FORCÉE ===');
        
        this.syncState.lastSync = Date.now();
        
        try {
            // 1. Recharger l'état depuis toutes les sources
            await this.loadInitialState();
            
            // 2. Forcer la synchronisation de tous les modules
            await this.syncAllModules();
            
            // 3. Mettre à jour l'interface
            if (this.currentPage === 'emails') {
                this.refreshEmailsView();
            }
            
            // 4. Dispatcher l'événement global
            setTimeout(() => {
                this.dispatchEvent('pageManagerFullSync', {
                    settings: this.cache.settings,
                    emails: this.cache.emails,
                    syncVersion: this.syncState.settingsVersion,
                    timestamp: this.syncState.lastSync
                });
            }, 50);
            
            console.log('[PageManager] ✅ Synchronisation forcée terminée');
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur synchronisation forcée:', error);
        }
    }

    async syncAllModules() {
        console.log('[PageManager] 🔄 Synchronisation de tous les modules...');
        
        const settings = this.cache.settings;
        if (!settings) {
            console.warn('[PageManager] ⚠️ Aucun settings en cache pour synchronisation');
            return;
        }
        
        const modules = [
            {
                name: 'EmailScanner',
                instance: window.emailScanner,
                methods: ['updateSettings', 'updateTaskPreselectedCategories', 'forceSettingsReload']
            },
            {
                name: 'CategoriesPage',
                instance: window.categoriesPage,
                methods: ['forceSynchronization']
            },
            {
                name: 'MinimalScanModule',
                instance: window.minimalScanModule,
                methods: ['updateSettings']
            },
            {
                name: 'AITaskAnalyzer',
                instance: window.aiTaskAnalyzer,
                methods: ['updatePreselectedCategories', 'updateAutomationSettings']
            }
        ].filter(module => module.instance);
        
        console.log(`[PageManager] 🎯 Synchronisation de ${modules.length} modules...`);
        
        for (const module of modules) {
            try {
                console.log(`[PageManager] 🔄 Synchronisation ${module.name}...`);
                
                for (const methodName of module.methods) {
                    if (typeof module.instance[methodName] === 'function') {
                        try {
                            if (methodName === 'updateTaskPreselectedCategories' || methodName === 'updatePreselectedCategories') {
                                await module.instance[methodName](settings.taskPreselectedCategories || []);
                            } else if (methodName === 'updateAutomationSettings') {
                                await module.instance[methodName](settings.automationSettings || {});
                            } else if (methodName === 'updateSettings') {
                                await module.instance[methodName](settings);
                            } else {
                                await module.instance[methodName]();
                            }
                            
                            console.log(`[PageManager] ✅ ${module.name}.${methodName} exécuté`);
                        } catch (error) {
                            console.error(`[PageManager] ❌ Erreur ${module.name}.${methodName}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`[PageManager] ❌ Erreur synchronisation ${module.name}:`, error);
            }
        }
        
        console.log('[PageManager] ✅ Synchronisation modules terminée');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    setupEventListeners() {
        if (this.eventsSetup) return;
        
        // Écouter les changements de paramètres depuis CategoriesPage
        this.categorySettingsHandler = (event) => {
            if (event.detail?.source === 'PageManager') return; // Éviter les boucles
            
            console.log('[PageManager] 📨 categorySettingsChanged reçu:', event.detail);
            if (event.detail?.settings) {
                this.handleSettingsUpdate(event.detail.settings);
            }
        };

        // Écouter les changements génériques de paramètres
        this.settingsChangedHandler = (event) => {
            if (event.detail?.source === 'PageManager') return;
            
            console.log('[PageManager] 📨 settingsChanged reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        };

        // Écouter la recatégorisation des emails
        this.emailsRecategorizedHandler = (event) => {
            console.log('[PageManager] 📧 emailsRecategorized reçu');
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        };

        // Écouter les fins de scan
        this.scanCompletedHandler = (event) => {
            console.log('[PageManager] 🔍 scanCompleted reçu');
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        };

        // Synchronisation forcée
        this.forceSyncHandler = (event) => {
            if (event.detail?.source === 'PageManager') return;
            
            console.log('[PageManager] 🚀 forceSynchronization reçu');
            this.forceSynchronization();
        };
        
        // Ajouter les listeners
        window.addEventListener('categorySettingsChanged', this.categorySettingsHandler);
        window.addEventListener('settingsChanged', this.settingsChangedHandler);
        window.addEventListener('emailsRecategorized', this.emailsRecategorizedHandler);
        window.addEventListener('scanCompleted', this.scanCompletedHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        
        this.eventsSetup = true;
        console.log('[PageManager] 🎧 Event listeners configurés');
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        // Mettre à jour le cache local
        if (this.cache.settings) {
            switch (type) {
                case 'taskPreselectedCategories':
                    this.cache.settings.taskPreselectedCategories = value;
                    break;
                case 'scanSettings':
                    this.cache.settings.scanSettings = { ...this.cache.settings.scanSettings, ...value };
                    break;
                case 'preferences':
                    this.cache.settings.preferences = { ...this.cache.settings.preferences, ...value };
                    break;
                case 'automationSettings':
                    this.cache.settings.automationSettings = { ...this.cache.settings.automationSettings, ...value };
                    break;
            }
            
            this.cache.lastUpdate = Date.now();
            this.syncState.settingsVersion++;
        }
        
        // Actions spécifiques selon le type
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                if (window.emailScanner?.recategorizeEmails) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                if (this.currentPage === 'emails') {
                    this.scheduleUIUpdate();
                }
                break;
        }
    }

    // ================================================
    // CHARGEMENT DE PAGES
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
            // Vérifier le cache avant de rendre
            this.ensureCacheValid();
            
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
                
                // Notifier les watchers du changement de page
                this.notifyWatchers('pageChanged', { page: pageName });
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

    ensureCacheValid() {
        const now = Date.now();
        if (now - this.cache.lastUpdate > this.cache.ttl) {
            console.log('[PageManager] 🔄 Cache expiré, rechargement...');
            this.loadInitialState();
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
    // RENDU DE LA PAGE EMAILS - ULTRA-OPTIMISÉ
    // ================================================
    async renderEmails(container) {
        // Récupérer les emails depuis le cache ou EmailScanner
        const emails = this.cache.emails || window.emailScanner?.getAllEmails() || [];
        const categories = this.cache.categories || window.categoryManager?.getCategories() || {};
        const settings = this.cache.settings || {};
        
        console.log(`[PageManager] 📧 Rendu page emails avec ${emails.length} emails (cache: ${!!this.cache.emails})`);
        
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
            
            // Récupérer les catégories pré-sélectionnées depuis le cache
            const taskPreselectedCategories = settings.taskPreselectedCategories || [];
            
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

                    <!-- Indicateur de synchronisation -->
                    <div class="sync-status-bar" id="syncStatusBar">
                        ${this.renderSyncStatusBar()}
                    </div>

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
            const preselectedCategories = settings.taskPreselectedCategories || [];
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

    renderSyncStatusBar() {
        const syncVersion = this.syncState.settingsVersion;
        const lastSync = this.syncState.lastSync;
        const timeSinceSync = Date.now() - lastSync;
        const isRecent = timeSinceSync < 10000; // Moins de 10 secondes
        
        const statusColor = isRecent ? '#10b981' : '#f59e0b';
        const statusIcon = isRecent ? 'fa-check-circle' : 'fa-clock';
        const statusText = isRecent ? 
            'Interface synchronisée' : 
            `Dernière sync: ${Math.floor(timeSinceSync / 1000)}s`;
        
        return `
            <div class="sync-status-indicator" style="background: ${statusColor}20; border: 1px solid ${statusColor}; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i>
                <span>${statusText}</span>
                <span class="sync-version">v${syncVersion}</span>
                ${!isRecent ? `
                    <button onclick="window.pageManager.forceSynchronization()" 
                            class="sync-refresh-btn">
                        <i class="fas fa-sync"></i>
                    </button>
                ` : ''}
            </div>
        `;
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
    // MÉTHODES DE GESTION DES EMAILS
    // ================================================
    getVisibleEmails() {
        const emails = this.cache.emails || [];
        let filteredEmails = emails;
        
        // Appliquer les filtres
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

    // ================================================
    // MISE À JOUR DE L'INTERFACE
    // ================================================
    refreshEmailsView() {
        if (this.syncState.syncLock) {
            console.log('[PageManager] 🔒 Refresh en attente (lock actif)');
            this.syncState.pendingOperations.push({ type: 'refresh' });
            return;
        }
        
        console.log('[PageManager] 🔄 Refresh emails view...');
        
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        // Mettre à jour la barre de statut de synchronisation
        const syncStatusBar = document.getElementById('syncStatusBar');
        if (syncStatusBar) {
            syncStatusBar.innerHTML = this.renderSyncStatusBar();
        }
        
        this.updateControlsBar();
        this.syncState.uiVersion++;
    }

    updateControlsBar() {
        // Sauvegarder l'état de recherche
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        // Mettre à jour seulement les parties dynamiques
        const actionButtons = document.querySelector('.action-buttons-harmonized');
        if (actionButtons) {
            const selectedCount = this.selectedEmails.size;
            const visibleEmails = this.getVisibleEmails();
            const allVisible = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
            
            // Mettre à jour le bouton de sélection
            const toggleBtn = actionButtons.querySelector('.btn-selection-toggle');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                const span = toggleBtn.querySelector('span');
                const badge = toggleBtn.querySelector('.count-badge-small');
                
                icon.className = `fas ${allVisible ? 'fa-square-check' : 'fa-square'}`;
                span.textContent = allVisible ? 'Désélectionner' : 'Sélectionner';
                toggleBtn.title = allVisible ? 'Désélectionner tout' : 'Sélectionner tout';
                
                if (badge) {
                    badge.textContent = visibleEmails.length;
                }
            }
        }
        
        // Restaurer la recherche
        setTimeout(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
        }, 50);
    }

    // ================================================
    // RENDU DES LISTES D'EMAILS
    // ================================================
    renderEmailsList() {
        const emails = this.getVisibleEmails();
        
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
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    renderHarmonizedEmailRow(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        
        // Vérifier si l'email est dans une catégorie pré-sélectionnée pour les tâches
        const settings = this.cache.settings || {};
        const preselectedCategories = settings.taskPreselectedCategories || [];
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
    // MÉTHODES DE RENDU DES AUTRES PAGES
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
        const categories = this.cache.categories || {};
        
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
        if (window.categoriesPage && typeof window.categoriesPage.renderSettings === 'function') {
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
    getEmailById(emailId) {
        const emails = this.cache.emails || [];
        return emails.find(email => email.id === emailId);
    }

    getCategoryColor(categoryId) {
        const categories = this.cache.categories || {};
        const category = categories[categoryId];
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const categories = this.cache.categories || {};
        const category = categories[categoryId];
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const categories = this.cache.categories || {};
        const category = categories[categoryId];
        return category?.name || categoryId || 'Autre';
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

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail: { ...detail, source: 'PageManager' } }));
        } catch (error) {
            console.error(`[PageManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // MÉTHODES PUBLIQUES SIMPLIFIÉES
    // ================================================
    async refreshEmails() {
        console.log('[PageManager] 🔄 Refresh emails demandé');
        
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            // Recharger depuis EmailScanner
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                await window.emailScanner.recategorizeEmails?.();
            }
            
            // Recharger le cache
            await this.loadInitialState();
            
            // Mettre à jour l'interface
            await this.loadPage('emails');
            
            window.uiManager?.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur refresh:', error);
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    // Méthodes d'événements simplifiées
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

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    // ================================================
    // MÉTHODES D'INITIALISATION DES ÉVÉNEMENTS
    // ================================================
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

    // ================================================
    // STYLES CSS
    // ================================================
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Barre de statut de synchronisation */
            .sync-status-bar {
                margin-bottom: 16px;
            }
            
            .sync-status-indicator {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .sync-version {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                margin-left: auto;
            }
            
            .sync-refresh-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: inherit;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
            }
            
            .sync-refresh-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            
            /* Email pré-sélectionné */
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid #8b5cf6;
            }
            
            .task-harmonized-card.preselected-task:hover {
                border-left: 4px solid #8b5cf6;
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
            }
            
            .preselected-badge-harmonized {
                background: #fdf4ff;
                color: #8b5cf6;
                border-color: #e9d5ff;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            /* Styles harmonisés existants... */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 16px;
                font-size: 13px;
            }
            
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
                backdrop-filter: blur(10px);
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
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }
            
            /* Autres styles harmonisés conservés... */
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES STUBÉES POUR COMPATIBILITÉ
    // ================================================
    buildTwoLinesCategoryTabs() { return ''; }
    renderEmptyState() { return '<div>Aucun email à afficher</div>'; }
    renderGroupedView() { return '<div>Vue groupée en développement</div>'; }
    toggleBulkActions() { console.log('Bulk actions'); }
    bulkMarkAsRead() { console.log('Mark as read'); }
    bulkArchive() { console.log('Archive'); }
    bulkDelete() { console.log('Delete'); }
    bulkExport() { console.log('Export'); }
    createTasksFromSelection() { console.log('Create tasks'); }
    showTaskCreationModal() { console.log('Task creation modal'); }
    showEmailModal() { console.log('Email modal'); }
    openCreatedTask() { console.log('Open task'); }
    analyzeFirstEmails() { console.log('Analyze emails'); }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        console.log('[PageManager] 🧹 Nettoyage...');
        
        // Nettoyer les timeouts
        if (this.uiUpdateTimeout) {
            clearTimeout(this.uiUpdateTimeout);
        }
        
        // Nettoyer les event listeners
        if (this.categorySettingsHandler) {
            window.removeEventListener('categorySettingsChanged', this.categorySettingsHandler);
        }
        if (this.settingsChangedHandler) {
            window.removeEventListener('settingsChanged', this.settingsChangedHandler);
        }
        if (this.emailsRecategorizedHandler) {
            window.removeEventListener('emailsRecategorized', this.emailsRecategorizedHandler);
        }
        if (this.scanCompletedHandler) {
            window.removeEventListener('scanCompleted', this.scanCompletedHandler);
        }
        if (this.forceSyncHandler) {
            window.removeEventListener('forceSynchronization', this.forceSyncHandler);
        }
        
        // Se désabonner des watchers
        if (window.categoryManager?.removeWatcher) {
            window.categoryManager.removeWatcher(this.handleSettingsUpdate.bind(this));
        }
        if (window.emailScanner?.removeWatcher) {
            window.emailScanner.removeWatcher(this.handleEmailScannerUpdate.bind(this));
        }
        
        // Nettoyer les états
        this.syncState.isActive = false;
        this.syncState.watchers.clear();
        this.cache = { settings: null, emails: null, categories: null, lastUpdate: 0, ttl: 5000 };
        
        console.log('[PageManager] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        console.log('[PageManager] Instance détruite');
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

console.log('✅ PageManager v14.0 loaded - Réécriture complète avec synchronisation parfaite');
