// Test de performance ultra-optimisé
window.testPageManagerPerformance = function() {
    if (!window.pageManager || !window.pageManager.renderEmails) {
        console.error('PageManager non disponible pour le test');
        return;
    }
    
    console.group('🚀 TEST PERFORMANCE PageManager v13.0');
    
    const start = performance.now();
    
    // Simuler 1000 emails pour test de performance
    const testEmails = Array.from({ length: 1000 }, (_, i) => ({
        id: `test-${i}`,
        subject: `Email test ${i}`,
        from: { emailAddress: { address: `test${i}@example.com`, name: `User ${i}` } },
        bodyPreview: 'Contenu de test',
        receivedDateTime: new Date(Date.now() - i * 3600000).toISOString(),
        category: ['tasks', 'commercial', 'security', 'other'][i % 4],
        categoryScore: 50 + (i % 50),
        categoryConfidence: 0.5 + (i % 50) / 100,
        isPreselectedForTasks: i % 10 === 0
    }));
    
    // Simuler EmailScanner temporairement
    const originalEmailScanner = window.emailScanner;
    window.emailScanner = {
        getAllEmails: () => testEmails,
        getEmailById: (id) => testEmails.find(e => e.id === id)
    };
    
    try {
        // Test de rendu
        const container = document.createElement('div');
        const renderStart = performance.now();
        window.pageManager.renderEmails(container);
        const renderTime = performance.now() - renderStart;
        
        // Test de filtrage
        const filterStart = performance.now();
        window.pageManager.filterByCategory('tasks');
        const filterTime = performance.now() - filterStart;
        
        // Test de sélection
        const selectionStart = performance.now();
        for (let i = 0; i < 100; i++) {
            window.pageManager.toggleEmailSelection(`test-${i}`);
        }
        const selectionTime = performance.now() - selectionStart;
        
        const totalTime = performance.now() - start;
        
        console.log(`✅ 1000 emails rendus en ${renderTime.toFixed(2)}ms`);
        console.log(`✅ Filtrage en ${filterTime.toFixed(2)}ms`);
        console.log(`✅ 100 sélections en ${selectionTime.toFixed(2)}ms`);
        console.log(`📊 Total: ${totalTime.toFixed(2)}ms`);
        console.log(`📈 Performance: ${(1000 / (renderTime / 1000)).toFixed(0)} emails/sec`);
        
        const stats = window.pageManager.getPerformanceStats();
        console.log('📋 Stats de performance:', stats);
        
        console.groupEnd();
        
        // Restaurer l'EmailScanner original
        window.emailScanner = originalEmailScanner;
        
        return { 
            renderTime, 
            filterTime, 
            selectionTime, 
            totalTime,
            emailsPerSecond: 1000 / (renderTime / 1000)
        };
        
    } catch (error) {
        console.error('Erreur pendant le test de performance:', error);
        window.emailScanner = originalEmailScanner;
        console.groupEnd();
        return null;
    }
};// PageManager.js - Version 13.0 - ULTRA OPTIMISÉ PERFORMANCE 🚀⚡

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
        
        // NOUVEAU: Cache ultra-haute performance
        this.renderCache = new Map();
        this.domCache = new Map();
        this.lastRenderTime = 0;
        this.RENDER_THROTTLE = 16; // 60fps max
        
        // NOUVEAU: Optimisations batch et worker-like
        this.batchProcessor = new PageManagerBatchProcessor(25); // Taille batch optimale
        this.performanceMonitor = new PageManagerPerformanceMonitor();
        this.virtualScrolling = new PageManagerVirtualScrollManager();
        
        // NOUVEAU: Gestionnaire d'événements optimisé
        this.eventDelegator = new PageManagerEventDelegator();
        this.debounceTimers = new Map();
        
        // NOUVEAU: Synchronisation ultra-légère
        this.syncQueue = [];
        this.syncInProgress = false;
        this.lastSettingsSync = 0;
        this.SYNC_INTERVAL = 30000; // 30 secondes au lieu de 2-10
        
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
        console.log('[PageManager] ✅ Version 13.0 - ULTRA OPTIMISÉ PERFORMANCE');
        this.startOptimizedPerformanceMonitoring();
    }

    // ================================================
    // OPTIMISATIONS BATCH ET WORKERS
    // ================================================
    
    startOptimizedPerformanceMonitoring() {
        // Monitoring léger toutes les 10 secondes
        setInterval(() => {
            const stats = this.getPerformanceStats();
            if (stats.renderTime > 100) {
                console.warn('[PageManager] ⚠️ Render lent détecté:', stats.renderTime + 'ms');
            }
        }, 10000);
    }

    getPerformanceStats() {
        return {
            renderTime: this.performanceMonitor.getAverageTime('render'),
            cacheHitRate: this.renderCache.size > 0 ? 
                (this.renderCache.get('hits') || 0) / this.renderCache.size * 100 : 0,
            memoryUsage: performance.memory ? 
                Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0,
            selectedEmails: this.selectedEmails.size,
            visibleEmails: this.getVisibleEmailsCount()
        };
    }

    getVisibleEmailsCount() {
        try {
            return this.getVisibleEmails().length;
        } catch {
            return 0;
        }
    }

    // ================================================
    // GESTION D'ÉVÉNEMENTS ULTRA-OPTIMISÉE
    // ================================================
    setupEventListeners() {
        // Event delegation ultra-optimisée
        this.eventDelegator.setup();
        
        // Écouter les changements de paramètres avec debounce
        this.addDebouncedListener('categorySettingsChanged', 
            (event) => this.handleSettingsChanged(event.detail), 1000);

        this.addDebouncedListener('settingsChanged', 
            (event) => this.handleGenericSettingsChanged(event.detail), 800);

        // Écouter la recatégorisation avec throttle
        this.addThrottledListener('emailsRecategorized', 
            (event) => this.handleEmailsRecategorized(event), 2000);

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.debouncedRefreshEmails();
            }
        });
    }

    addDebouncedListener(eventName, handler, delay) {
        window.addEventListener(eventName, (event) => {
            this.debounce(`${eventName}_handler`, () => handler(event), delay);
        });
    }

    addThrottledListener(eventName, handler, delay) {
        let lastCall = 0;
        window.addEventListener(eventName, (event) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                handler(event);
            }
        });
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

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES - OPTIMISÉE
    // ================================================
    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres (optimisé)');
        
        // Invalider le cache de rendu
        this.invalidateRenderCache();
        
        if (settingsData.settings?.taskPreselectedCategories) {
            this.queueSync('preselectedCategories', settingsData.settings.taskPreselectedCategories);
        }
        
        // Mise à jour légère de l'affichage
        if (this.currentPage === 'emails') {
            this.debouncedRefreshEmails();
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique (optimisé)');
        
        const { type, value } = changeData;
        
        // Cache des changements pour traitement batch
        this.queueSync(type, value);
    }

    handleEmailsRecategorized(event) {
        console.log('[PageManager] Emails recatégorisés (throttled)');
        if (this.currentPage === 'emails') {
            this.invalidateRenderCache();
            this.debouncedRefreshEmails();
        }
    }

    queueSync(type, value) {
        this.syncQueue.push({ type, value, timestamp: Date.now() });
        
        // Traitement batch différé
        this.debounce('syncQueue', () => {
            this.processSyncQueue();
        }, 500);
    }

    processSyncQueue() {
        if (this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            // Grouper les changements par type
            const changesByType = {};
            for (const change of this.syncQueue) {
                if (!changesByType[change.type]) {
                    changesByType[change.type] = [];
                }
                changesByType[change.type].push(change.value);
            }
            
            // Traitement batch par type
            for (const [type, values] of Object.entries(changesByType)) {
                this.processChangeType(type, values[values.length - 1]); // Dernière valeur
            }
            
            this.syncQueue = [];
            
        } finally {
            this.syncInProgress = false;
        }
    }

    processChangeType(type, value) {
        switch (type) {
            case 'taskPreselectedCategories':
            case 'preselectedCategories':
                this.updateTaskPreselection(value);
                break;
                
            case 'activeCategories':
                this.updateActiveCategories(value);
                break;
                
            case 'preferences':
                this.updatePreferences(value);
                break;
        }
    }

    updateTaskPreselection(categories) {
        // Mise à jour optimisée sans re-render complet
        if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
            window.aiTaskAnalyzer.updatePreselectedCategories(categories);
        }
        
        // Invalider seulement le cache des boutons de catégories
        this.invalidatePartialCache('categoryButtons');
    }

    updateActiveCategories(categories) {
        if (window.emailScanner?.updateSettings) {
            window.emailScanner.updateSettings({ activeCategories: categories });
        }
        
        this.invalidatePartialCache('categoryTabs');
    }

    updatePreferences(preferences) {
        // Mise à jour légère des préférences d'affichage
        this.invalidatePartialCache('controls');
    }

    // ================================================
    // CACHE DE RENDU ULTRA-PERFORMANT
    // ================================================
    
    invalidateRenderCache() {
        this.renderCache.clear();
        this.domCache.clear();
        console.log('[PageManager] 🧹 Cache de rendu invalidé');
    }

    invalidatePartialCache(section) {
        const keysToDelete = [];
        for (const key of this.renderCache.keys()) {
            if (key.startsWith(section)) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            this.renderCache.delete(key);
        }
        
        console.log(`[PageManager] 🧹 Cache partiel '${section}' invalidé`);
    }

    getCachedRender(key, generator) {
        if (this.renderCache.has(key)) {
            const cached = this.renderCache.get(key);
            if (Date.now() - cached.timestamp < 30000) { // 30s cache
                return cached.content;
            }
        }
        
        const content = generator();
        this.renderCache.set(key, {
            content,
            timestamp: Date.now()
        });
        
        return content;
    }

    // ================================================
    // PAGE LOADING - OPTIMISÉ
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page optimisé: ${pageName}`);

        // IGNORER complètement le dashboard
        if (pageName === 'dashboard') {
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
        
        // Éviter le loading pour les transitions rapides
        if (this.currentPage !== pageName) {
            window.uiManager?.showLoading(`Chargement ${pageName}...`);
        }

        try {
            this.performanceMonitor.startMeasurement('pageLoad');
            
            // Nettoyage optimisé
            this.cleanupCurrentPage();
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            const loadTime = this.performanceMonitor.endMeasurement('pageLoad');
            console.log(`[PageManager] ✅ Page '${pageName}' chargée en ${loadTime.toFixed(2)}ms`);
            
            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    cleanupCurrentPage() {
        // Nettoyage optimisé selon la page actuelle
        if (this.currentPage === 'emails') {
            this.cleanupEmailsPage();
        }
        
        // Nettoyer les timers de debounce
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    }

    cleanupEmailsPage() {
        // Nettoyer les event listeners temporaires
        this.eventDelegator.cleanup();
        
        // Nettoyer les observateurs de scroll virtuel
        this.virtualScrolling.cleanup();
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
        // Mise à jour optimisée avec requestAnimationFrame
        requestAnimationFrame(() => {
            document.querySelectorAll('.nav-item').forEach(item => {
                const isActive = item.dataset.page === activePage;
                item.classList.toggle('active', isActive);
            });
        });
    }

    // ================================================
    // RENDU EMAILS ULTRA-OPTIMISÉ
    // ================================================

    async renderEmails(container) {
        this.performanceMonitor.startMeasurement('render');
        
        const emails = window.emailScanner?.getAllEmails() || [];
        
        console.log(`[PageManager] Rendu emails optimisé: ${emails.length} emails`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const renderEmailsPage = () => {
            const cacheKey = `emails_${this.currentViewMode}_${this.currentCategory}_${this.searchTerm}_${emails.length}`;
            
            return this.getCachedRender(cacheKey, () => {
                const categoryCounts = this.calculateCategoryCountsOptimized(emails);
                const totalEmails = emails.length;
                const selectedCount = this.selectedEmails.size;
                
                return `
                    <div class="tasks-page-modern">
                        ${this.renderExplanationOptimized()}
                        ${this.renderControlsBarOptimized(selectedCount)}
                        ${this.renderCategoryFiltersOptimized(categoryCounts, totalEmails)}
                        <div class="tasks-container-harmonized">
                            ${this.renderEmailsListOptimized()}
                        </div>
                    </div>
                `;
            });
        };

        container.innerHTML = renderEmailsPage();
        
        // Setup événements avec delegation
        this.setupOptimizedEmailsEventListeners();
        
        // Styles en cache
        this.addOptimizedEmailStyles();
        
        const renderTime = this.performanceMonitor.endMeasurement('render');
        console.log(`[PageManager] ✅ Emails rendus en ${renderTime.toFixed(2)}ms`);
        
        // Auto-analyze optimisé
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            this.scheduleOptimizedAutoAnalysis(emails);
        }
    }

    renderExplanationOptimized() {
        if (this.hideExplanation) return '';
        
        return this.getCachedRender('explanation', () => `
            <div class="explanation-text-harmonized">
                <i class="fas fa-info-circle"></i>
                <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour transformer les emails sélectionnés en tâches ou effectuer d'autres opérations.</span>
                <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
    }

    renderControlsBarOptimized(selectedCount) {
        const cacheKey = `controls_${selectedCount}_${this.searchTerm}_${this.currentViewMode}`;
        
        return this.getCachedRender(cacheKey, () => `
            <div class="controls-bar-harmonized-expanded">
                <!-- PREMIÈRE LIGNE : Barre de recherche étendue -->
                <div class="search-line-full">
                    <div class="search-box-full">
                        <i class="fas fa-search search-icon-full"></i>
                        <input type="text" 
                               class="search-input-full" 
                               id="emailSearchInput"
                               placeholder="Rechercher dans vos emails (expéditeur, sujet, contenu)..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="search-clear-full" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- SECONDE LIGNE : Tous les boutons -->
                <div class="buttons-line-full">
                    ${this.renderViewModesOptimized()}
                    <div class="buttons-separator"></div>
                    ${this.renderActionButtonsOptimized(selectedCount)}
                </div>
            </div>
        `);
    }

    renderViewModesOptimized() {
        return this.getCachedRender('viewModes', () => `
            <div class="view-modes-expanded">
                <button class="view-mode-expanded ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-domain')">
                    <i class="fas fa-globe"></i>
                    <span>Domaine</span>
                </button>
                <button class="view-mode-expanded ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('grouped-sender')">
                    <i class="fas fa-user"></i>
                    <span>Expéditeur</span>
                </button>
                <button class="view-mode-expanded ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                        onclick="window.pageManager.changeViewMode('flat')">
                    <i class="fas fa-list"></i>
                    <span>Liste</span>
                </button>
            </div>
        `);
    }

    renderActionButtonsOptimized(selectedCount) {
        return `
            <div class="action-buttons-expanded">
                <!-- Bouton Créer tâches -->
                <button class="btn-expanded btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                        onclick="window.pageManager.createTasksFromSelection()"
                        ${selectedCount === 0 ? 'disabled' : ''}>
                    <i class="fas fa-tasks"></i>
                    <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                    ${selectedCount > 0 ? `<span class="count-badge-main">${selectedCount}</span>` : ''}
                </button>
                
                <!-- Bouton Actions -->
                <div class="dropdown-action-expanded">
                    <button class="btn-expanded btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                            onclick="window.pageManager.toggleBulkActions(event)"
                            ${selectedCount === 0 ? 'disabled' : ''}>
                        <i class="fas fa-ellipsis-v"></i>
                        <span>Actions</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    ${this.renderDropdownMenuOptimized()}
                </div>
                
                <!-- Bouton Actualiser -->
                <button class="btn-expanded btn-secondary" onclick="window.pageManager.refreshEmails()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Actualiser</span>
                </button>
                
                <!-- Bouton Effacer sélection -->
                ${selectedCount > 0 ? `
                    <button class="btn-expanded btn-clear-selection" 
                            onclick="window.pageManager.clearSelection()">
                        <i class="fas fa-times"></i>
                        <span>Effacer (${selectedCount})</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderDropdownMenuOptimized() {
        return this.getCachedRender('dropdownMenu', () => `
            <div class="dropdown-menu-expanded" id="bulkActionsMenu">
                <button class="dropdown-item-expanded" onclick="window.pageManager.bulkMarkAsRead()">
                    <i class="fas fa-eye"></i>
                    <span>Marquer comme lu</span>
                </button>
                <button class="dropdown-item-expanded" onclick="window.pageManager.bulkArchive()">
                    <i class="fas fa-archive"></i>
                    <span>Archiver</span>
                </button>
                <button class="dropdown-item-expanded danger" onclick="window.pageManager.bulkDelete()">
                    <i class="fas fa-trash"></i>
                    <span>Supprimer</span>
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item-expanded" onclick="window.pageManager.bulkExport()">
                    <i class="fas fa-download"></i>
                    <span>Exporter</span>
                </button>
            </div>
        `);
    }

    renderCategoryFiltersOptimized(categoryCounts, totalEmails) {
        const cacheKey = `categoryTabs_${Object.keys(categoryCounts).join('_')}_${this.currentCategory}`;
        
        return this.getCachedRender(cacheKey, () => {
            const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
            const categories = window.categoryManager?.getCategories() || {};
            
            return this.buildOptimizedCategoryTabs(categoryCounts, totalEmails, categories, preselectedCategories);
        });
    }

    buildOptimizedCategoryTabs(categoryCounts, totalEmails, categories, preselectedCategories) {
        const tabs = [
            { id: 'all', name: 'Tous', icon: '📧', count: totalEmails, isPreselected: false }
        ];
        
        // Traitement batch des catégories
        const categoryEntries = Object.entries(categories);
        for (let i = 0; i < categoryEntries.length; i++) {
            const [catId, category] = categoryEntries[i];
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
        }
        
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
        
        // Génération HTML optimisée
        const tabsHtml = tabs.map(tab => {
            const isActive = this.currentCategory === tab.id;
            const classes = `status-pill-harmonized-twolines ${isActive ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
            
            return `
                <button class="${classes}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}">
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
        
        return `<div class="status-filters-harmonized-twolines">${tabsHtml}</div>`;
    }

    // ================================================
    // RENDU LISTE D'EMAILS OPTIMISÉ
    // ================================================

    renderEmailsListOptimized() {
        const emails = this.getVisibleEmailsOptimized();
        
        if (emails.length === 0) {
            return this.renderEmptyStateOptimized();
        }

        // Utiliser le scroll virtuel pour de gros volumes
        if (emails.length > 100) {
            return this.renderVirtualizedEmailsList(emails);
        }

        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatViewOptimized(emails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedViewOptimized(emails, this.currentViewMode);
            default:
                return this.renderFlatViewOptimized(emails);
        }
    }

    // Ajouter cette méthode dans PageManager.js après renderEmailsListOptimized (vers la ligne 800)

    // ================================================
    // RENDU VUE GROUPÉE OPTIMISÉE
    // ================================================
    renderGroupedViewOptimized(groupedEmails, totalCount, preselectedCount) {
        const groups = [];
        let totalGroupedCount = 0;
        
        // Convertir les groupes en tableau trié
        Object.entries(groupedEmails).forEach(([categoryId, emails]) => {
            if (emails.length === 0) return;
            
            const category = window.categoryManager?.getCategory(categoryId) || {
                name: categoryId,
                icon: '📧',
                color: '#6b7280'
            };
            
            totalGroupedCount += emails.length;
            groups.push({
                categoryId,
                category,
                emails,
                count: emails.length,
                preselectedCount: emails.filter(e => e.isPreselectedForTasks).length
            });
        });
        
        // Trier les groupes par nombre d'emails
        groups.sort((a, b) => b.count - a.count);
        
        // Générer le HTML
        const groupsHtml = groups.map(group => {
            const emailsHtml = group.emails.slice(0, 10).map(email => 
                this.renderEmailRowOptimized(email)
            ).join('');
            
            const hasMore = group.emails.length > 10;
            
            return `
                <div class="email-group" data-category="${group.categoryId}">
                    <div class="group-header" onclick="window.pageManager.toggleGroup('${group.categoryId}')">
                        <div class="group-info">
                            <span class="group-icon">${group.category.icon}</span>
                            <span class="group-name">${group.category.name}</span>
                            <span class="group-count">${group.count} emails</span>
                            ${group.preselectedCount > 0 ? `
                                <span class="group-preselected">
                                    <i class="fas fa-star"></i> ${group.preselectedCount}
                                </span>
                            ` : ''}
                        </div>
                        <i class="fas fa-chevron-down group-toggle"></i>
                    </div>
                    <div class="group-emails">
                        ${emailsHtml}
                        ${hasMore ? `
                            <div class="group-more">
                                <button class="btn-show-more" onclick="window.pageManager.showMoreInGroup('${group.categoryId}')">
                                    Voir ${group.emails.length - 10} emails de plus
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="emails-grouped-view">
                <div class="grouped-stats">
                    <div class="stat">
                        <i class="fas fa-layer-group"></i>
                        <span>${groups.length} groupes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-envelope"></i>
                        <span>${totalGroupedCount} emails</span>
                    </div>
                    ${preselectedCount > 0 ? `
                        <div class="stat highlight">
                            <i class="fas fa-star"></i>
                            <span>${preselectedCount} pré-sélectionnés</span>
                        </div>
                    ` : ''}
                </div>
                
                ${groupsHtml}
            </div>
        `;
    }
    
    // Méthode pour toggler un groupe
    toggleGroup(categoryId) {
        const group = document.querySelector(`[data-category="${categoryId}"]`);
        if (group) {
            group.classList.toggle('collapsed');
        }
    }
    
    // Méthode pour afficher plus d'emails dans un groupe
    showMoreInGroup(categoryId) {
        const group = this.groupedEmails[categoryId];
        if (!group) return;
        
        const groupElement = document.querySelector(`[data-category="${categoryId}"] .group-emails`);
        if (!groupElement) return;
        
        // Générer le HTML pour tous les emails
        const allEmailsHtml = group.map(email => 
            this.renderEmailRowOptimized(email)
        ).join('');
        
        groupElement.innerHTML = allEmailsHtml;
    }
    
    // Méthode helper pour grouper les emails par catégorie
    groupEmailsByCategory(emails) {
        const grouped = {};
        
        emails.forEach(email => {
            const category = email.category || 'other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(email);
        });
        
        return grouped;
    }

    renderVirtualizedEmailsList(emails) {
        // Configuration du scroll virtuel pour de gros volumes
        return this.virtualScrolling.render(emails, (email) => 
            this.renderOptimizedEmailRow(email)
        );
    }

    renderFlatViewOptimized(emails) {
        // Rendu batch pour éviter les blocages
        const batchSize = 50;
        const emailBatches = [];
        
        for (let i = 0; i < emails.length; i += batchSize) {
            emailBatches.push(emails.slice(i, i + batchSize));
        }
        
        const batchHtml = emailBatches.map(batch => 
            batch.map(email => this.renderOptimizedEmailRow(email)).join('')
        ).join('');
        
        return `<div class="tasks-harmonized-list">${batchHtml}</div>`;
    }

    renderOptimizedEmailRow(email) {
        const cacheKey = `emailRow_${email.id}_${this.selectedEmails.has(email.id)}_${email.isPreselectedForTasks}`;
        
        return this.getCachedRender(cacheKey, () => {
            const hasTask = this.createdTasks.has(email.id);
            const senderName = email.from?.emailAddress?.name || 
                             email.from?.emailAddress?.address || 'Inconnu';
            
            const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
            let isPreselectedForTasks = email.isPreselectedForTasks === true;
            
            // Correction rapide du flag si nécessaire
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
                        ${this.renderEmailContentOptimized(email, isPreselectedForTasks)}
                    </div>
                    
                    <div class="task-actions-harmonized">
                        ${this.renderEmailActionsOptimized(email)}
                    </div>
                </div>
            `;
        });
    }

    renderEmailContentOptimized(email, isPreselectedForTasks) {
        return `
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
                <span class="recipient-name-harmonized">${this.escapeHtml(email.from?.emailAddress?.name || '')}</span>
                ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                ${this.renderCategoryIndicatorOptimized(email, isPreselectedForTasks)}
            </div>
        `;
    }

    renderCategoryIndicatorOptimized(email, isPreselectedForTasks) {
        if (!email.category || email.category === 'other') return '';
        
        const categoryColor = this.getCategoryColor(email.category);
        const categoryIcon = this.getCategoryIcon(email.category);
        const categoryName = this.getCategoryName(email.category);
        
        return `
            <span class="category-indicator-harmonized" 
                  style="background: ${categoryColor}20; 
                         color: ${categoryColor};
                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                ${categoryIcon} ${categoryName}
                ${isPreselectedForTasks ? ' ⭐' : ''}
            </span>
        `;
    }

    renderEmailActionsOptimized(email) {
        const hasTask = this.createdTasks.has(email.id);
        
        if (hasTask) {
            return `
                <button class="action-btn-harmonized view-task" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="action-btn-harmonized details" 
                        onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }
        
        return `
            <button class="action-btn-harmonized create-task" 
                    onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')">
                <i class="fas fa-tasks"></i>
            </button>
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')">
                <i class="fas fa-eye"></i>
            </button>
        `;
    }

    // ================================================
    // CALCULS OPTIMISÉS
    // ================================================

    calculateCategoryCountsOptimized(emails) {
        const counts = {};
        let uncategorizedCount = 0;
        
        // Boucle optimisée sur emails
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const cat = email.category;
            
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                uncategorizedCount++;
            }
        }
        
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
        }
        
        return counts;
    }

    getVisibleEmailsOptimized() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        // Filtre de catégorie optimisé
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
        
        // Filtre de recherche optimisé
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filteredEmails = filteredEmails.filter(email => this.matchesSearchOptimized(email, searchLower));
        }
        
        return filteredEmails;
    }

    matchesSearchOptimized(email, searchLower) {
        // Recherche optimisée avec early return
        const subject = email.subject?.toLowerCase();
        if (subject && subject.includes(searchLower)) return true;
        
        const senderName = email.from?.emailAddress?.name?.toLowerCase();
        if (senderName && senderName.includes(searchLower)) return true;
        
        const senderEmail = email.from?.emailAddress?.address?.toLowerCase();
        if (senderEmail && senderEmail.includes(searchLower)) return true;
        
        const preview = email.bodyPreview?.toLowerCase();
        return preview && preview.includes(searchLower);
    }

    getTaskPreselectedCategoriesOptimized() {
        // Cache des catégories pré-sélectionnées
        return this.getCachedRender('preselectedCategories', () => {
            if (window.categoryManager?.getTaskPreselectedCategories) {
                return window.categoryManager.getTaskPreselectedCategories();
            }
            
            try {
                const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
                return settings.taskPreselectedCategories || [];
            } catch {
                return [];
            }
        });
    }

    // ================================================
    // GESTION D'ÉVÉNEMENTS OPTIMISÉE
    // ================================================

    setupOptimizedEmailsEventListeners() {
        // Event delegation optimisée
        this.eventDelegator.setupEmailsEvents();
        
        // Recherche avec debounce optimisé
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce('search', () => this.handleSearch(e.target.value), 300);
            });
        }
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.invalidatePartialCache('emailsList');
        this.debouncedRefreshEmails();
    }

    debouncedRefreshEmails() {
        this.debounce('refreshEmails', () => this.refreshEmailsViewOptimized(), 200);
    }

    refreshEmailsViewOptimized() {
        this.performanceMonitor.startMeasurement('refresh');
        
        // Sauvegarder l'état des groupes ouverts
        const expandedGroups = this.saveExpandedGroupsState();
        
        // Mise à jour seulement du contenu nécessaire
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            this.invalidatePartialCache('emailsList');
            emailsContainer.innerHTML = this.renderEmailsListOptimized();
            
            // Restaurer l'état des groupes
            this.restoreExpandedGroupsState(expandedGroups);
        }
        
        // Mise à jour optimisée des contrôles
        this.updateControlsBarOptimized();
        
        const refreshTime = this.performanceMonitor.endMeasurement('refresh');
        console.log(`[PageManager] ✅ Refresh optimisé en ${refreshTime.toFixed(2)}ms`);
    }

    saveExpandedGroupsState() {
        const expandedGroups = new Set();
        document.querySelectorAll('.task-group-harmonized.expanded').forEach(group => {
            const groupKey = group.dataset.groupKey;
            if (groupKey) expandedGroups.add(groupKey);
        });
        return expandedGroups;
    }

    restoreExpandedGroupsState(expandedGroups) {
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

    updateControlsBarOptimized() {
        const selectedCount = this.selectedEmails.size;
        
        // Mise à jour ciblée des éléments spécifiques
        const updateTasks = [
            () => this.updateCreateTaskButton(selectedCount),
            () => this.updateActionsButton(selectedCount),
            () => this.updateClearSelectionButton(selectedCount)
        ];
        
        // Traitement batch des mises à jour
        requestAnimationFrame(() => {
            updateTasks.forEach(task => {
                try {
                    task();
                } catch (error) {
                    console.warn('[PageManager] Erreur mise à jour contrôle:', error);
                }
            });
        });
    }

    updateCreateTaskButton(selectedCount) {
        const createTaskBtn = document.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
        if (!createTaskBtn) return;
        
        const span = createTaskBtn.querySelector('span');
        let countBadge = createTaskBtn.querySelector('.count-badge-main');
        
        createTaskBtn.disabled = selectedCount === 0;
        createTaskBtn.classList.toggle('disabled', selectedCount === 0);
        
        if (span) {
            span.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
        }
        
        if (selectedCount > 0) {
            if (!countBadge) {
                countBadge = document.createElement('span');
                countBadge.className = 'count-badge-main';
                createTaskBtn.appendChild(countBadge);
            }
            countBadge.textContent = selectedCount;
            countBadge.style.display = 'block';
        } else if (countBadge) {
            countBadge.style.display = 'none';
        }
    }

    updateActionsButton(selectedCount) {
        const actionsBtn = document.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
        if (!actionsBtn) return;
        
        actionsBtn.disabled = selectedCount === 0;
        actionsBtn.classList.toggle('disabled', selectedCount === 0);
    }

    updateClearSelectionButton(selectedCount) {
        const existingClearBtn = document.querySelector('.btn-clear-selection');
        const actionButtonsContainer = document.querySelector('.action-buttons-expanded');
        
        if (selectedCount > 0) {
            if (!existingClearBtn && actionButtonsContainer) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'btn-expanded btn-clear-selection';
                clearBtn.onclick = () => this.clearSelection();
                clearBtn.innerHTML = `
                    <i class="fas fa-times"></i>
                    <span>Effacer (${selectedCount})</span>
                `;
                actionButtonsContainer.appendChild(clearBtn);
            } else if (existingClearBtn) {
                const span = existingClearBtn.querySelector('span');
                if (span) span.textContent = `Effacer (${selectedCount})`;
            }
        } else if (existingClearBtn) {
            existingClearBtn.remove();
        }
    }

    // ================================================
    // GESTION DE SÉLECTION OPTIMISÉE
    // ================================================

    toggleEmailSelection(emailId) {
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
        
        // Mise à jour optimisée des contrôles
        this.updateControlsBarOptimized();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsViewOptimized();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    // ================================================
    // FILTRAGE OPTIMISÉ
    // ================================================

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.invalidatePartialCache('emailsList');
        this.refreshEmailsViewOptimized();
        
        // Mise à jour visuelle optimisée des boutons
        requestAnimationFrame(() => {
            document.querySelectorAll('.status-pill-harmonized-twolines').forEach(pill => {
                pill.classList.toggle('active', pill.dataset.categoryId === categoryId);
            });
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.invalidatePartialCache('emailsList');
        this.refreshEmailsViewOptimized();
    }

    // ================================================
    // ACTIONS EN MASSE OPTIMISÉES
    // ================================================

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
            this.refreshEmailsViewOptimized();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (window.emailScanner) {
            window.emailScanner.exportResults('csv');
        } else {
            // Export optimisé
            this.performOptimizedExport(selectedEmails);
        }
        this.clearSelection();
    }

    performOptimizedExport(selectedEmailIds) {
        const emails = selectedEmailIds.map(id => this.getEmailById(id)).filter(Boolean);
        
        const csvRows = ['De,Sujet,Date,Catégorie,Contenu'];
        
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const row = [
                `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                `"${email.subject || ''}"`,
                email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                `"${this.getCategoryName(email.category)}"`,
                `"${(email.bodyPreview || '').substring(0, 100)}"`
            ].join(',');
            csvRows.push(row);
        }
        
        const csvContent = csvRows.join('\n');
        this.downloadCSV(csvContent, `emails_${new Date().toISOString().split('T')[0]}.csv`);
        
        window.uiManager?.showToast('Export terminé', 'success');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // ================================================
    // CRÉATION DE TÂCHES OPTIMISÉE
    // ================================================

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        const emailIds = Array.from(this.selectedEmails);
        window.uiManager?.showLoading(`Création de ${emailIds.length} tâches...`);
        
        let created = 0;
        
        // Traitement par batch pour éviter les blocages
        const batchSize = 5;
        for (let i = 0; i < emailIds.length; i += batchSize) {
            const batch = emailIds.slice(i, i + batchSize);
            
            for (const emailId of batch) {
                const email = this.getEmailById(emailId);
                if (!email || this.createdTasks.has(emailId)) continue;
                
                try {
                    const taskCreated = await this.createTaskFromEmail(email);
                    if (taskCreated) {
                        created++;
                        this.createdTasks.set(emailId, taskCreated.id);
                    }
                } catch (error) {
                    console.error('[PageManager] Erreur création tâche:', emailId, error);
                }
            }
            
            // Pause micro entre les batches
            if (i + batchSize < emailIds.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
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

    async createTaskFromEmail(email) {
        let analysis = this.aiAnalysisResults.get(email.id);
        
        if (!analysis && window.aiTaskAnalyzer) {
            analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            this.aiAnalysisResults.set(email.id, analysis);
        }
        
        if (analysis && window.taskManager) {
            const taskData = this.buildTaskDataFromAnalysis(email, analysis);
            return window.taskManager.createTaskFromEmail(taskData, email);
        }
        
        return null;
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
    // AUTRES MÉTHODES OPTIMISÉES
    // ================================================

    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                await window.emailScanner.recategorizeEmails();
            }
            
            this.invalidateRenderCache();
            await this.loadPage('emails');
            window.uiManager?.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        }
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.invalidatePartialCache('explanation');
        this.refreshEmailsViewOptimized();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.invalidatePartialCache('emailsList');
        this.refreshEmailsViewOptimized();
    }

    // ================================================
    // MÉTHODES UTILITAIRES OPTIMISÉES
    // ================================================

    getEmailById(emailId) {
        return window.emailScanner?.getEmailById(emailId) || null;
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

    renderEmptyStateOptimized() {
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn-harmonized btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
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

    // ================================================
    // MÉTHODES D'AIDE OPTIMISÉES
    // ================================================

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, function(match) {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
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

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        return '#3b82f6';
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

    scheduleOptimizedAutoAnalysis(emails) {
        const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
        
        if (preselectedCategories && preselectedCategories.length > 0) {
            const emailsToAnalyze = emails
                .filter(email => preselectedCategories.includes(email.category))
                .slice(0, 3); // Limite à 3 pour performance
            
            if (emailsToAnalyze.length > 0) {
                setTimeout(() => {
                    this.analyzeFirstEmailsOptimized(emailsToAnalyze);
                }, 1500);
            }
        }
    }

    async analyzeFirstEmailsOptimized(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                    
                    // Pause entre les analyses
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error('[PageManager] Erreur analyse email optimisée:', error);
                }
            }
        }
    }

    addOptimizedEmailStyles() {
        if (document.getElementById('optimizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'optimizedEmailStyles';
        styles.textContent = `
            /* CSS Ultra-Optimisé - Version 13.0 */
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
            }
            
            /* Optimisations GPU */
            .task-harmonized-card,
            .status-pill-harmonized-twolines,
            .btn-expanded,
            .action-btn-harmonized {
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
            }
            
            /* Page principale ultra-optimisée */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
                contain: layout style paint;
            }

            /* Barre de contrôles ultra-optimisée */
            .controls-bar-harmonized-expanded {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-large);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                gap: var(--gap-large);
                position: relative;
                z-index: 1000;
                contain: layout style;
            }
            
            /* Recherche optimisée */
            .search-line-full {
                width: 100%;
                display: flex;
                justify-content: center;
            }
            
            .search-box-full {
                position: relative;
                width: 100%;
                max-width: 800px;
                height: calc(var(--btn-height) + 8px);
                display: flex;
                align-items: center;
            }
            
            .search-input-full {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-large) 0 56px;
                border: 2px solid #e5e7eb;
                border-radius: calc(var(--btn-border-radius) + 4px);
                font-size: calc(var(--btn-font-size) + 2px);
                background: #f9fafb;
                transition: border-color var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
                will-change: border-color, background;
            }
            
            .search-input-full:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            }
            
            /* Boutons optimisés */
            .btn-expanded {
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
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
                will-change: transform, box-shadow;
            }
            
            .btn-expanded:hover {
                transform: translateY(-1px) translateZ(0);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-expanded.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-expanded.btn-primary:hover {
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            /* Cartes d'emails ultra-optimisées */
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                contain: layout;
            }
            
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                z-index: 1;
                contain: layout style;
            }
            
            .task-harmonized-card:hover {
                transform: translateY(-1px) translateZ(0);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                z-index: 2;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                transform: translateY(-1px) translateZ(0);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }
            
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid var(--preselect-color);
                border-color: rgba(139, 92, 246, 0.3);
            }
            
            /* Filtres de catégories optimisés */
            .status-filters-harmonized-twolines {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
                contain: layout;
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
                transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
                position: relative;
                overflow: visible;
                contain: layout style;
            }
            
            .status-pill-harmonized-twolines:hover {
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
            }
            
            .status-pill-harmonized-twolines.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
            }
            
            /* Étoile pré-sélection optimisée */
            .preselected-star {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: var(--preselect-color);
                color: white;
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                z-index: 15;
                animation: starPulse 2s ease-in-out infinite;
                will-change: transform;
            }
            
            @keyframes starPulse {
                0%, 100% { transform: scale(1) translateZ(0); }
                50% { transform: scale(1.15) translateZ(0); }
            }
            
            /* Dropdown optimisé */
            .dropdown-menu-expanded {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                min-width: 220px;
                z-index: 9999;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px) translateZ(0);
                transition: all 0.2s ease;
                will-change: transform, opacity;
                contain: layout style;
            }
            
            .dropdown-menu-expanded.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) translateZ(0);
            }
            
            /* Actions d'emails optimisées */
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
                contain: layout;
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
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                will-change: transform, box-shadow;
            }
            
            .action-btn-harmonized:hover {
                transform: translateY(-1px) translateZ(0);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            /* Responsive ultra-optimisé */
            @media (max-width: 1024px) {
                .controls-bar-harmonized-expanded {
                    padding: var(--gap-medium);
                }
                
                .status-pill-harmonized-twolines {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 100px;
                }
            }
            
            @media (max-width: 768px) {
                .status-pill-harmonized-twolines {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 80px;
                    height: 52px;
                }
                
                .task-harmonized-card {
                    padding: 12px;
                    min-height: 68px;
                    max-height: 68px;
                }
            }
            
            @media (max-width: 480px) {
                .tasks-page-modern {
                    padding: var(--gap-small);
                }
                
                .status-pill-harmonized-twolines {
                    flex: 0 1 calc(50% - 4px);
                    min-width: 70px;
                    height: 48px;
                }
                
                .search-input-full {
                    padding: 0 var(--gap-small) 0 40px;
                    font-size: var(--btn-font-size);
                }
            }
            
            /* Animations optimisées */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) translateZ(0);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) translateZ(0);
                }
            }
            
            .task-harmonized-card {
                animation: fadeInUp 0.3s ease-out;
            }
            
            /* Performance hints */
            * {
                box-sizing: border-box;
            }
            
            .tasks-container-harmonized {
                contain: layout style paint;
                transform: translateZ(0);
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // AUTRES PAGES OPTIMISÉES
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner optimisé...');
        
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
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
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
        if (window.domainOrganizer?.showPage) {
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
    // MODALES OPTIMISÉES
    // ================================================

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        this.cleanupModals();
        
        let analysis;
        try {
            window.uiManager?.showLoading('Analyse optimisée...');
            analysis = await window.aiTaskAnalyzer?.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager?.hideLoading();
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'analyse', 'error');
            return;
        }

        this.renderTaskCreationModal(email, analysis);
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        this.cleanupModals();
        this.renderEmailModal(email);
    }

    cleanupModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    renderTaskCreationModal(email, analysis) {
        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildTaskCreationModalHTML(uniqueId, email, analysis);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    renderEmailModal(email) {
        const uniqueId = 'email_modal_' + Date.now();
        const modalHTML = this.buildEmailModalHTML(uniqueId, email);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskCreationModalHTML(uniqueId, email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div id="${uniqueId}" class="modal-overlay-optimized">
                <div class="modal-content-optimized">
                    <div class="modal-header-optimized">
                        <h2>Créer une tâche</h2>
                        <button onclick="window.pageManager.closeModal('${uniqueId}')" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-optimized">
                        ${this.buildTaskCreationForm(email, analysis, enhancedTitle)}
                    </div>
                    <div class="modal-footer-optimized">
                        <button onclick="window.pageManager.closeModal('${uniqueId}')" class="btn-secondary">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); window.pageManager.closeModal('${uniqueId}');" class="btn-primary">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    buildEmailModalHTML(uniqueId, email) {
        return `
            <div id="${uniqueId}" class="modal-overlay-optimized">
                <div class="modal-content-optimized">
                    <div class="modal-header-optimized">
                        <h2>Email Complet</h2>
                        <button onclick="window.pageManager.closeModal('${uniqueId}')" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-optimized">
                        ${this.buildEmailContent(email)}
                    </div>
                    <div class="modal-footer-optimized">
                        <button onclick="window.pageManager.closeModal('${uniqueId}')" class="btn-secondary">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(email.id) ? `
                            <button onclick="window.pageManager.closeModal('${uniqueId}'); window.pageManager.showTaskCreationModal('${email.id}');" class="btn-primary">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    buildTaskCreationForm(email, analysis, enhancedTitle) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        return `
            <div class="task-form-optimized">
                <div class="ai-badge-optimized">
                    <i class="fas fa-robot"></i>
                    <span>Analyse intelligente par Claude AI</span>
                </div>
                
                <div class="sender-info-optimized">
                    <div class="sender-avatar" style="background: ${this.generateAvatarColor(senderName)}">
                        ${senderName.charAt(0).toUpperCase()}
                    </div>
                    <div class="sender-details">
                        <div class="sender-name">${senderName}</div>
                        <div class="sender-email">${senderEmail}</div>
                    </div>
                </div>
                
                <div class="form-field">
                    <label>Titre de la tâche</label>
                    <input type="text" id="task-title" value="${enhancedTitle}" />
                </div>
                
                <div class="form-field">
                    <label>Description</label>
                    <textarea id="task-description" rows="4">${analysis.mainTask.description || analysis.summary || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-field">
                        <label>Priorité</label>
                        <select id="task-priority">
                            <option value="urgent" ${analysis.mainTask.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis.mainTask.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${analysis.mainTask.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis.mainTask.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label>Date d'échéance</label>
                        <input type="date" id="task-duedate" value="${analysis.mainTask.dueDate || ''}" />
                    </div>
                </div>
            </div>
        `;
    }

    buildEmailContent(email) {
        return `
            <div class="email-meta-optimized">
                <div class="meta-row">
                    <span class="meta-label">De:</span>
                    <span>${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Date:</span>
                    <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Sujet:</span>
                    <span class="meta-subject">${email.subject || 'Sans sujet'}</span>
                </div>
                ${this.buildCategoryMeta(email)}
            </div>
            <div class="email-body-optimized">
                ${this.getEmailContent(email)}
            </div>
        `;
    }

    buildCategoryMeta(email) {
        if (!email.category || email.category === 'other') return '';
        
        return `
            <div class="meta-row">
                <span class="meta-label">Catégorie:</span>
                <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)};">
                    ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                </span>
            </div>
        `;
    }

    getEmailContent(email) {
        if (email.body?.content) {
            let content = email.body.content;
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
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
                this.refreshEmailsViewOptimized();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

    // ================================================
    // GESTIONNAIRES D'ÉVÉNEMENTS OPTIMISÉS
    // ================================================

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

    toggleBulkActions(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const menu = document.getElementById('bulkActionsMenu');
        const button = event.currentTarget;
        
        if (!menu || !button) return;
        
        const isCurrentlyVisible = menu.classList.contains('show');
        
        this.closeAllDropdowns();
        
        if (!isCurrentlyVisible) {
            menu.classList.add('show');
            button.classList.add('show');
            this.setupDropdownCloseHandlers(menu, button);
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu-expanded.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle.show').forEach(btn => {
            btn.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-overlay').forEach(overlay => {
            overlay.remove();
        });
    }

    setupDropdownCloseHandlers(menu, button) {
        const overlay = document.createElement('div');
        overlay.className = 'dropdown-overlay show';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 9998 !important;
            background: transparent !important;
            cursor: pointer !important;
        `;
        
        const closeDropdown = () => {
            menu.classList.remove('show');
            button.classList.remove('show');
            overlay.remove();
        };
        
        overlay.addEventListener('click', closeDropdown);
        document.body.appendChild(overlay);
        
        setTimeout(closeDropdown, 15000);
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

    // ================================================
    // NETTOYAGE ET DESTRUCTION OPTIMISÉE
    // ================================================

    destroy() {
        console.log('[PageManager] 🧹 Destruction optimisée...');
        
        // Nettoyer tous les timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        
        // Nettoyer les caches
        this.renderCache.clear();
        this.domCache.clear();
        this.aiAnalysisResults.clear();
        
        // Nettoyer les observateurs
        this.eventDelegator.cleanup();
        this.virtualScrolling.cleanup();
        this.performanceMonitor.cleanup();
        
        // Nettoyer les event listeners
        const eventsToClean = ['categorySettingsChanged', 'settingsChanged', 'emailsRecategorized', 'scanCompleted'];
        eventsToClean.forEach(eventName => {
            window.removeEventListener(eventName, this[`${eventName}Handler`]);
        });
        
        // Reset des propriétés
        this.selectedEmails.clear();
        this.createdTasks.clear();
        this.syncQueue = [];
        
        console.log('[PageManager] ✅ Destruction optimisée terminée');
    }
}

// ================================================
// CLASSES UTILITAIRES OPTIMISÉES
// ================================================

class PageManagerBatchProcessor {
    constructor(batchSize = 25) {
        this.batchSize = batchSize;
    }

    async processBatch(items, processor) {
        const results = [];
        
        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processor(item))
            );
            results.push(...batchResults);
            
            if (i + this.batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        return results;
    }
}

class PageManagerPerformanceMonitor {
    constructor() {
        this.measurements = new Map();
        this.trends = new Map();
    }

    startMeasurement(key) {
        this.measurements.set(key, performance.now());
    }

    endMeasurement(key) {
        const start = this.measurements.get(key);
        if (!start) return 0;
        
        const duration = performance.now() - start;
        this.measurements.delete(key);
        
        this.updateTrends(key, duration);
        return duration;
    }

    updateTrends(key, duration) {
        if (!this.trends.has(key)) {
            this.trends.set(key, []);
        }
        
        const trend = this.trends.get(key);
        trend.push(duration);
        
        if (trend.length > 10) {
            trend.shift();
        }
    }

    getAverageTime(key) {
        const trend = this.trends.get(key);
        if (!trend || trend.length === 0) return 0;
        
        return trend.reduce((sum, time) => sum + time, 0) / trend.length;
    }

    cleanup() {
        this.measurements.clear();
        this.trends.clear();
    }
}

class PageManagerVirtualScrollManager {
    constructor() {
        this.observer = null;
        this.visibleItems = new Set();
    }

    render(items, renderer) {
        if (items.length < 200) {
            return items.map(renderer).join('');
        }
        
        return this.setupVirtualScroll(items, renderer);
    }

    setupVirtualScroll(items, renderer) {
        const containerHeight = 600;
        const itemHeight = 76;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 5;
        
        const visibleEmails = items.slice(0, visibleItems);
        
        return `
            <div class="virtual-scroll-container" style="height: ${containerHeight}px; overflow-y: auto;">
                <div class="virtual-content" style="height: ${items.length * itemHeight}px;">
                    <div class="visible-items">
                        ${visibleEmails.map(renderer).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.visibleItems.clear();
    }
}

class PageManagerEventDelegator {
    constructor() {
        this.handlers = new Map();
        this.setupComplete = false;
    }

    setup() {
        if (this.setupComplete) return;
        
        this.setupEmailsEvents();
        this.setupComplete = true;
    }

    setupEmailsEvents() {
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.handleGlobalChange = this.handleGlobalChange.bind(this);
        
        document.addEventListener('click', this.handleGlobalClick, { passive: true });
        document.addEventListener('change', this.handleGlobalChange, { passive: true });
    }

    handleGlobalClick(event) {
        const target = event.target;
        
        if (target.matches('.task-harmonized-card')) {
            const emailId = target.dataset.emailId;
            if (emailId) {
                window.pageManager.handleEmailClick(event, emailId);
            }
        }
        
        if (target.matches('.status-pill-harmonized-twolines')) {
            const categoryId = target.dataset.categoryId;
            if (categoryId) {
                window.pageManager.filterByCategory(categoryId);
            }
        }
    }

    handleGlobalChange(event) {
        const target = event.target;
        
        if (target.matches('.task-checkbox-harmonized')) {
            const emailId = target.closest('[data-email-id]')?.dataset.emailId;
            if (emailId) {
                window.pageManager.toggleEmailSelection(emailId);
            }
        }
    }

    cleanup() {
        if (this.handleGlobalClick) {
            document.removeEventListener('click', this.handleGlobalClick);
        }
        if (this.handleGlobalChange) {
            document.removeEventListener('change', this.handleGlobalChange);
        }
        this.handlers.clear();
        this.setupComplete = false;
    }
}

// ================================================
// INITIALISATION GLOBALE ULTRA-OPTIMISÉE
// ================================================

// Attendre que les autres modules soient chargés pour éviter les conflits
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.pageManager.destroy();
    } catch (error) {
        console.warn('[PageManager] Erreur lors du nettoyage:', error);
    }
}

// Délai pour éviter les conflits de chargement
setTimeout(() => {
    console.log('[PageManager] 🚀 Création nouvelle instance v13.0 ULTRA-OPTIMISÉE...');
    
    try {
        window.pageManager = new PageManager();

        // Bind des méthodes pour préserver le contexte
        Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
            if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
                try {
                    window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
                } catch (error) {
                    console.warn(`[PageManager] Erreur bind ${name}:`, error);
                }
            }
        });
        
        console.log('✅ PageManager v13.0 ULTRA-OPTIMISÉ loaded - Performance maximisée! 🚀⚡');
        
        // Notifier que PageManager est prêt
        window.dispatchEvent(new CustomEvent('pageManagerReady', {
            detail: { version: '13.0', optimized: true }
        }));
        
    } catch (error) {
        console.error('[PageManager] ❌ Erreur lors de l\'initialisation:', error);
        
        // Fallback: essayer de restaurer une version basique
        window.pageManager = {
            loadPage: (page) => console.warn(`PageManager fallback: loadPage(${page})`),
            currentPage: null
        };
    }
}, 100); // 100ms de délai
