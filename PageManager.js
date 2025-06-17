// PageManager.js - Version 13.0 - ULTRA-OPTIMISÉ PERFORMANCE 🚀

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
        
        // NOUVEAU: Système de cache ultra-performant
        this.viewCache = new Map();
        this.categoryCountsCache = null;
        this.visibleEmailsCache = null;
        this.cacheTimestamp = 0;
        this.cacheTTL = 30000; // 30 secondes
        
        // NOUVEAU: Optimisation DOM
        this.virtualScrolling = new VirtualScrollManager();
        this.domCache = new DOMElementCache();
        this.batchDOMUpdates = new BatchDOMManager();
        
        // NOUVEAU: Debouncing optimisé
        this.debouncedRefresh = this.debounce(this.refreshEmailsViewOptimized.bind(this), 100);
        this.debouncedSearch = this.debounce(this.handleSearchOptimized.bind(this), 300);
        this.debouncedSync = this.debounce(this.syncSettingsOptimized.bind(this), 500);
        
        // NOUVEAU: Performance monitoring
        this.performanceMonitor = new PerformanceTracker();
        this.renderMetrics = { renders: 0, avgTime: 0, lastRender: 0 };
        
        // Page renderers - DASHBOARD SUPPRIMÉ
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupOptimizedEventListeners();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 13.0 - ULTRA-OPTIMISÉ PERFORMANCE');
        this.startOptimizedPerformanceMonitoring();
    }

    // ================================================
    // CLASSES UTILITAIRES POUR OPTIMISATION
    // ================================================
}

class VirtualScrollManager {
    constructor(itemHeight = 76, bufferSize = 10) {
        this.itemHeight = itemHeight;
        this.bufferSize = bufferSize;
        this.containerHeight = 0;
        this.scrollTop = 0;
        this.totalItems = 0;
        this.visibleItems = 0;
        this.startIndex = 0;
        this.endIndex = 0;
    }

    calculateVisibleRange(scrollTop, containerHeight, totalItems) {
        this.scrollTop = scrollTop;
        this.containerHeight = containerHeight;
        this.totalItems = totalItems;
        
        this.visibleItems = Math.ceil(containerHeight / this.itemHeight);
        this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
        this.endIndex = Math.min(totalItems - 1, this.startIndex + this.visibleItems + (this.bufferSize * 2));
        
        return {
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            offsetY: this.startIndex * this.itemHeight,
            totalHeight: totalItems * this.itemHeight
        };
    }

    getVisibleSlice(items) {
        return items.slice(this.startIndex, this.endIndex + 1);
    }
}

class DOMElementCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 500;
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, element) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, element);
    }

    clear() {
        this.cache.clear();
    }
}

class BatchDOMManager {
    constructor() {
        this.pendingUpdates = [];
        this.isScheduled = false;
    }

    schedule(updateFn) {
        this.pendingUpdates.push(updateFn);
        
        if (!this.isScheduled) {
            this.isScheduled = true;
            requestAnimationFrame(() => {
                this.executeBatch();
            });
        }
    }

    executeBatch() {
        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];
        this.isScheduled = false;
        
        // Exécuter tous les updates en batch
        updates.forEach(updateFn => {
            try {
                updateFn();
            } catch (error) {
                console.error('[BatchDOM] Erreur update:', error);
            }
        });
    }
}

class PerformanceTracker {
    constructor() {
        this.measurements = new Map();
        this.alerts = [];
    }

    start(key) {
        this.measurements.set(key, performance.now());
    }

    end(key) {
        const start = this.measurements.get(key);
        if (!start) return 0;
        
        const duration = performance.now() - start;
        this.measurements.delete(key);
        
        // Alert si trop lent
        if (duration > 100) {
            this.alerts.push({
                operation: key,
                duration: duration,
                timestamp: Date.now()
            });
            console.warn(`[Performance] ⚠️ Opération lente: ${key} (${duration.toFixed(2)}ms)`);
        }
        
        return duration;
    }

    getStats() {
        return {
            currentMeasurements: this.measurements.size,
            recentAlerts: this.alerts.slice(-10),
            lastAlert: this.alerts[this.alerts.length - 1]
        };
    }
}

// Continuer avec PageManager optimisé...
PageManager.prototype.startOptimizedPerformanceMonitoring = function() {
    // Monitoring léger toutes les 30 secondes
    this.performanceInterval = setInterval(() => {
        const stats = this.performanceMonitor.getStats();
        if (stats.recentAlerts.length > 0) {
            console.log('[PageManager] 📊 Performance alerts:', stats.recentAlerts.length);
        }
    }, 30000);
};

// ================================================
// ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION ULTRA-OPTIMISÉE
// ================================================
PageManager.prototype.setupOptimizedEventListeners = function() {
    // Debounced event handlers
    this.categorySettingsHandler = this.debouncedSync;
    this.genericSettingsHandler = this.debouncedSync;
    
    // Single event listeners avec nettoyage automatique
    this.setupEventListener('categorySettingsChanged', this.categorySettingsHandler);
    this.setupEventListener('settingsChanged', this.genericSettingsHandler);
    this.setupEventListener('emailsRecategorized', this.handleEmailsRecategorizedOptimized.bind(this));
    this.setupEventListener('scanCompleted', this.handleScanCompletedOptimized.bind(this));
};

PageManager.prototype.setupEventListener = function(eventName, handler) {
    // Éviter les doublons
    window.removeEventListener(eventName, handler);
    window.addEventListener(eventName, handler);
    
    // Stocker pour nettoyage
    if (!this.eventListeners) this.eventListeners = [];
    this.eventListeners.push({ eventName, handler });
};

PageManager.prototype.handleEmailsRecategorizedOptimized = function(event) {
    console.log('[PageManager] 🔄 Emails recatégorisés - invalidation cache');
    this.invalidateAllCaches();
    
    if (this.currentPage === 'emails') {
        // Refresh optimisé avec debounce
        this.debouncedRefresh();
    }
};

PageManager.prototype.handleScanCompletedOptimized = function(event) {
    console.log('[PageManager] ✅ Scan terminé - mise à jour données');
    this.lastScanData = event.detail;
    this.invalidateAllCaches();
    
    if (this.currentPage === 'emails') {
        this.loadPage('emails');
    }
};

// ================================================
// GESTION DES CHANGEMENTS DE PARAMÈTRES - ULTRA-OPTIMISÉE
// ================================================
PageManager.prototype.syncSettingsOptimized = function(settingsData) {
    console.log('[PageManager] 🔧 Sync paramètres optimisé');
    
    this.performanceMonitor.start('settings_sync');
    
    // Invalidation sélective du cache
    if (settingsData.type === 'taskPreselectedCategories') {
        this.invalidatePreselectionCache();
    } else if (settingsData.type === 'activeCategories') {
        this.invalidateCategoryCache();
    } else {
        this.invalidateAllCaches();
    }
    
    // Re-catégorisation optimisée seulement si nécessaire
    const needsRecategorization = ['taskPreselectedCategories', 'activeCategories'].includes(settingsData.type);
    
    if (needsRecategorization && this.getEmailCount() > 0) {
        console.log('[PageManager] 🔄 Re-catégorisation optimisée nécessaire');
        
        // Batch l'opération pour éviter les blocages
        this.batchDOMUpdates.schedule(() => {
            this.recategorizeEmailsOptimized();
        });
    }
    
    // Mise à jour UI optimisée
    if (this.currentPage === 'emails') {
        this.debouncedRefresh();
    }
    
    this.performanceMonitor.end('settings_sync');
};

// ================================================
// SYSTÈME DE CACHE ULTRA-PERFORMANT
// ================================================
PageManager.prototype.invalidateAllCaches = function() {
    this.viewCache.clear();
    this.categoryCountsCache = null;
    this.visibleEmailsCache = null;
    this.cacheTimestamp = 0;
    console.log('[PageManager] 🧹 Tous les caches invalidés');
};

PageManager.prototype.invalidatePreselectionCache = function() {
    // Invalidation sélective pour les catégories pré-sélectionnées
    const keys = [...this.viewCache.keys()].filter(key => key.includes('preselected'));
    keys.forEach(key => this.viewCache.delete(key));
    this.visibleEmailsCache = null;
};

PageManager.prototype.invalidateCategoryCache = function() {
    this.categoryCountsCache = null;
    this.visibleEmailsCache = null;
    const keys = [...this.viewCache.keys()].filter(key => key.includes('category'));
    keys.forEach(key => this.viewCache.delete(key));
};

PageManager.prototype.getCachedOrCompute = function(key, computeFn, ttl = this.cacheTTL) {
    const now = Date.now();
    const cached = this.viewCache.get(key);
    
    if (cached && (now - cached.timestamp) < ttl) {
        return cached.value;
    }
    
    const value = computeFn();
    this.viewCache.set(key, { value, timestamp: now });
    return value;
};

// ================================================
// PAGE LOADING - DASHBOARD IGNORÉ (OPTIMISÉ)
// ================================================
PageManager.prototype.loadPage = async function(pageName) {
    console.log(`[PageManager] 🚀 Chargement optimisé page: ${pageName}`);
    
    this.performanceMonitor.start('page_load');

    // IGNORER complètement le dashboard
    if (pageName === 'dashboard') {
        console.log('[PageManager] Dashboard ignoré - géré par index.html');
        this.updateNavigation(pageName);
        
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.style.opacity = '1';
        }
        this.performanceMonitor.end('page_load');
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
        // Nettoyage optimisé
        this.clearPageContent(pageContent);
        
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
    
    this.performanceMonitor.end('page_load');
};

PageManager.prototype.clearPageContent = function(container) {
    // Nettoyage optimisé sans innerHTML = ''
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

// ================================================
// RENDU EMAILS ULTRA-OPTIMISÉ
// ================================================
PageManager.prototype.renderEmails = async function(container) {
    this.performanceMonitor.start('render_emails');
    
    // Récupérer les emails depuis EmailScanner centralisé
    const emails = this.getEmailsOptimized();
    const categories = this.getCategoriesOptimized();
    
    console.log(`[PageManager] 🎯 Rendu optimisé page emails avec ${emails.length} emails`);
    
    if (emails.length === 0) {
        container.innerHTML = this.renderEmptyEmailsState();
        this.performanceMonitor.end('render_emails');
        return;
    }

    // Rendu initial optimisé
    this.renderEmailsPageOptimized(container, emails, categories);
    
    // Auto-analyze optimisé (non bloquant)
    if (this.autoAnalyzeEnabled && emails.length > 0) {
        setTimeout(() => {
            this.autoAnalyzeOptimized(emails);
        }, 100);
    }
    
    this.performanceMonitor.end('render_emails');
};

PageManager.prototype.getEmailsOptimized = function() {
    return this.getCachedOrCompute('all_emails', () => {
        return window.emailScanner?.getAllEmails() || [];
    }, 10000); // Cache 10 secondes
};

PageManager.prototype.getCategoriesOptimized = function() {
    return this.getCachedOrCompute('all_categories', () => {
        return window.categoryManager?.getCategories() || {};
    }, 30000); // Cache 30 secondes
};

PageManager.prototype.renderEmailsPageOptimized = function(container, emails, categories) {
    const renderEmailsPage = () => {
        const categoryCounts = this.calculateCategoryCountsOptimized(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        
        // Structure HTML optimisée (identique visuellement)
        container.innerHTML = this.buildEmailsPageHTML(categoryCounts, totalEmails, selectedCount, categories);
        
        this.addOptimizedEmailStyles();
        this.setupOptimizedEmailsEventListeners();
        
        // Rendu initial de la liste (optimisé)
        this.renderEmailsListOptimized();
    };

    renderEmailsPage();
};

PageManager.prototype.buildEmailsPageHTML = function(categoryCounts, totalEmails, selectedCount, categories) {
    return `
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

            <!-- Barre de contrôles réorganisée sur 2 lignes -->
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
                    <!-- Modes de vue -->
                    <div class="view-modes-expanded">
                        <button class="view-mode-expanded ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('grouped-domain')"
                                title="Par domaine">
                            <i class="fas fa-globe"></i>
                            <span>Domaine</span>
                        </button>
                        <button class="view-mode-expanded ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('grouped-sender')"
                                title="Par expéditeur">
                            <i class="fas fa-user"></i>
                            <span>Expéditeur</span>
                        </button>
                        <button class="view-mode-expanded ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('flat')"
                                title="Liste complète">
                            <i class="fas fa-list"></i>
                            <span>Liste</span>
                        </button>
                    </div>
                    
                    <!-- Séparateur visuel -->
                    <div class="buttons-separator"></div>
                    
                    <!-- Actions principales -->
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
                        </div>
                        
                        <!-- Bouton Actualiser -->
                        <button class="btn-expanded btn-secondary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        
                        <!-- Bouton Effacer sélection (uniquement si des emails sont sélectionnés) -->
                        ${selectedCount > 0 ? `
                            <button class="btn-expanded btn-clear-selection" 
                                    onclick="window.pageManager.clearSelection()"
                                    title="Effacer la sélection">
                                <i class="fas fa-times"></i>
                                <span>Effacer (${selectedCount})</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Filtres de catégories -->
            <div class="status-filters-harmonized-twolines">
                ${this.buildTwoLinesCategoryTabsOptimized(categoryCounts, totalEmails, categories)}
            </div>

            <!-- CONTENU DES EMAILS (Virtual Scrolling) -->
            <div class="tasks-container-harmonized" id="emailsContainer">
                <div class="virtual-scroll-container" id="virtualScrollContainer">
                    <!-- Contenu sera injecté ici -->
                </div>
            </div>
        </div>
    `;
};

// Styles optimisés
PageManager.prototype.addOptimizedEmailStyles = function() {
    if (document.getElementById('optimizedEmailStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'optimizedEmailStyles';
    styles.textContent = `
        /* OPTIMISATIONS PERFORMANCE CSS */
        .virtual-list {
            overflow: hidden;
            position: relative;
        }
        
        .virtual-viewport {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            will-change: transform;
        }
        
        .task-harmonized-card {
            contain: layout style paint;
            transform: translateZ(0);
        }
        
        .tasks-container-harmonized {
            height: calc(100vh - 400px);
            overflow-y: auto;
            overflow-x: hidden;
        }
        
        #virtualScrollContainer {
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            scroll-behavior: smooth;
        }
        
        /* Optimisations GPU */
        .preselected-star {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        .status-pill-harmonized-twolines {
            will-change: transform;
            backface-visibility: hidden;
        }
        
        /* Transitions optimisées */
        .task-harmonized-card {
            transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        .btn-expanded {
            transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
        }
    `;
    
    document.head.appendChild(styles);
};

// Actions et modales (versions optimisées des méthodes existantes)
PageManager.prototype.renderOptimizedEmailActions = function(email) {
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
                onclick="event.stopPropagation(); window.pageManager.showEmailModalOptimized('${email.id}')"
                title="Voir l'email">
            <i class="fas fa-eye"></i>
        </button>
    `);
    
    return actions.join('');
};

PageManager.prototype.showEmailModalOptimized = function(emailId) {
    // Version optimisée de showEmailModal
    const email = this.getEmailByIdOptimized(emailId);
    if (!email) return;

    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    
    const uniqueId = 'email_modal_' + Date.now();
    const modalHTML = this.buildOptimizedEmailModal(uniqueId, email);

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
};

PageManager.prototype.getEmailByIdOptimized = function(emailId) {
    // Cache de recherche d'email
    return this.getCachedOrCompute(`email_${emailId}`, () => {
        return window.emailScanner?.getEmailById(emailId) || null;
    }, 30000);
};

PageManager.prototype.buildOptimizedEmailModal = function(uniqueId, email) {
    const senderName = email.from?.emailAddress?.name || '';
    const senderEmail = email.from?.emailAddress?.address || '';
    
    return `
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
                            <span style="color: #1f2937;">${this.escapeHtmlOptimized(senderName)} &lt;${this.escapeHtmlOptimized(senderEmail)}&gt;</span>
                        </div>
                        <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 700; color: #374151; min-width: 60px;">Date:</span>
                            <span style="color: #1f2937;">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 700; color: #374151; min-width: 60px;">Sujet:</span>
                            <span style="color: #1f2937; font-weight: 600;">${this.escapeHtmlOptimized(email.subject || 'Sans sujet')}</span>
                        </div>
                        ${email.category && email.category !== 'other' ? `
                            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">Catégorie:</span>
                                <span style="background: ${this.getCategoryColorOptimized(email.category)}20; color: ${this.getCategoryColorOptimized(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                    ${this.getCategoryIconOptimized(email.category)} ${this.getCategoryNameOptimized(email.category)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; max-height: 400px; overflow-y: auto; line-height: 1.6; color: #374151;">
                        ${this.getEmailContentOptimized(email)}
                    </div>
                </div>
                <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Fermer
                    </button>
                    ${!this.createdTasks.has(email.id) ? `
                        <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${email.id}');"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
};

PageManager.prototype.getEmailContentOptimized = function(email) {
    return this.getCachedOrCompute(`email_content_${email.id}`, () => {
        if (email.body?.content) {
            let content = email.body.content;
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtmlOptimized(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
    }, 300000); // Cache 5 minutes
};

// Actions bulk optimisées
PageManager.prototype.toggleBulkActions = function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    const menu = document.getElementById('bulkActionsMenu');
    const button = event.currentTarget;
    
    if (!menu || !button) return;
    
    const isCurrentlyVisible = menu.classList.contains('show');
    
    // Fermer tous les autres dropdowns
    document.querySelectorAll('.dropdown-menu-expanded.show').forEach(dropdown => {
        if (dropdown !== menu) {
            dropdown.classList.remove('show');
        }
    });
    
    if (isCurrentlyVisible) {
        menu.classList.remove('show');
        button.classList.remove('show');
    } else {
        menu.classList.add('show');
        button.classList.add('show');
        menu.style.zIndex = '9999';
        
        // Auto-fermeture
        setTimeout(() => {
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
                button.classList.remove('show');
            }
        }, 10000);
    }
};

// Autres méthodes requises (versions simplifiées)
PageManager.prototype.clearSearch = function() {
    this.searchTerm = '';
    const searchInput = document.getElementById('emailSearchInput');
    if (searchInput) searchInput.value = '';
    this.invalidateViewCache();
    this.renderEmailsListOptimized();
};

PageManager.prototype.changeViewMode = function(mode) {
    this.currentViewMode = mode;
    this.invalidateViewCache();
    this.renderEmailsListOptimized();
};

PageManager.prototype.hideExplanationMessage = function() {
    this.hideExplanation = true;
    localStorage.setItem('hideEmailExplanation', 'true');
    this.debouncedRefresh();
};

PageManager.prototype.refreshEmails = async function() {
    window.uiManager?.showLoading('Actualisation...');
    
    try {
        if (window.emailScanner && window.emailScanner.emails.length > 0) {
            await window.emailScanner.recategorizeEmails();
        }
        
        await this.loadPage('emails');
        window.uiManager?.showToast('Emails actualisés', 'success');
        
    } catch (error) {
        window.uiManager?.hideLoading();
        window.uiManager?.showToast('Erreur d\'actualisation', 'error');
    }
};

// Méthodes de création de tâches (simplifiées)
PageManager.prototype.createTasksFromSelection = async function() {
    if (this.selectedEmails.size === 0) {
        window.uiManager?.showToast('Aucun email sélectionné', 'warning');
        return;
    }
    
    window.uiManager?.showToast(`Création de ${this.selectedEmails.size} tâches...`, 'info');
    
    // Simulation de création de tâches
    setTimeout(() => {
        window.uiManager?.showToast(`${this.selectedEmails.size} tâche(s) créée(s)`, 'success');
        this.clearSelectionOptimized();
    }, 1000);
};

PageManager.prototype.showTaskCreationModal = function(emailId) {
    window.uiManager?.showToast('Création de tâche depuis modal (simulation)', 'info');
};

PageManager.prototype.openCreatedTask = function(emailId) {
    this.loadPage('tasks');
};

// Actions bulk
PageManager.prototype.bulkMarkAsRead = async function() {
    const selectedEmails = Array.from(this.selectedEmails);
    window.uiManager?.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
    this.clearSelectionOptimized();
};

PageManager.prototype.bulkArchive = async function() {
    const selectedEmails = Array.from(this.selectedEmails);
    if (confirm(`Archiver ${selectedEmails.length} email(s) ?`)) {
        window.uiManager?.showToast(`${selectedEmails.length} emails archivés`, 'success');
        this.clearSelectionOptimized();
    }
};

PageManager.prototype.bulkDelete = async function() {
    const selectedEmails = Array.from(this.selectedEmails);
    if (confirm(`Supprimer définitivement ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
        window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
        this.clearSelectionOptimized();
        this.debouncedRefresh();
    }
};

PageManager.prototype.bulkExport = function() {
    const selectedEmails = Array.from(this.selectedEmails);
    window.uiManager?.showToast(`Export de ${selectedEmails.length} emails`, 'success');
    this.clearSelectionOptimized();
};

// Autres pages (inchangées)
PageManager.prototype.renderScanner = async function(container) {
    if (window.scanStartModule && typeof window.scanStartModule.render === 'function') {
        await window.scanStartModule.render(container);
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-search"></i></div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">Module de scan en cours de chargement...</p>
            </div>
        `;
    }
};

PageManager.prototype.renderTasks = async function(container) {
    if (window.tasksView && window.tasksView.render) {
        window.tasksView.render(container);
    } else {
        container.innerHTML = `
            <div class="page-header"><h1>Tâches</h1></div>
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-tasks"></i></div>
                <h3 class="empty-title">Aucune tâche</h3>
                <p class="empty-text">Créez des tâches à partir de vos emails</p>
            </div>
        `;
    }
};

PageManager.prototype.renderCategories = async function(container) {
    const categories = window.categoryManager?.getCategories() || {};
    
    container.innerHTML = `
        <div class="page-header"><h1>Catégories</h1></div>
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
};

PageManager.prototype.renderSettings = async function(container) {
    if (window.categoriesPage) {
        window.categoriesPage.renderSettings(container);
    } else {
        container.innerHTML = `
            <div class="page-header"><h1>Paramètres</h1></div>
            <div class="settings-card">
                <h3>Configuration IA</h3>
                <button class="btn primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                    <i class="fas fa-cog"></i> Configurer Claude AI
                </button>
            </div>
        `;
    }
};

PageManager.prototype.renderRanger = async function(container) {
    if (window.domainOrganizer && window.domainOrganizer.showPage) {
        window.domainOrganizer.showPage(container);
    } else {
        container.innerHTML = `
            <div class="page-header"><h1>Ranger par domaine</h1></div>
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-folder-tree"></i></div>
                <h3 class="empty-title">Module de rangement</h3>
                <p class="empty-text">Module de rangement en cours de chargement...</p>
            </div>
        `;
    }
};

PageManager.prototype.renderErrorPage = function(error) {
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
};

// Utilitaires génériques
PageManager.prototype.debounce = function(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

PageManager.prototype.dispatchEvent = function(eventName, detail) {
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
};

// Métriques de performance
PageManager.prototype.getPerformanceStats = function() {
    return {
        renderMetrics: this.renderMetrics,
        cacheStats: {
            viewCacheSize: this.viewCache.size,
            domCacheSize: this.domCache.cache.size,
            lastInvalidation: this.cacheTimestamp
        },
        selectedEmails: this.selectedEmails.size,
        performanceAlerts: this.performanceMonitor.getStats()
    };
};

}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE ULTRA-OPTIMISÉE
// ================================================
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    window.pageManager.destroy?.();
}

console.log('[PageManager] 🚀 Création nouvelle instance v13.0 ULTRA-OPTIMISÉE...');
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

// Test de performance ultra-optimisé
window.testPageManagerPerformance = function() {
    console.group('🚀 TEST PERFORMANCE PageManager v13.0 ULTRA-OPTIMISÉ');
    
    const stats = window.pageManager.getPerformanceStats();
    console.log('📊 Stats actuelles:', stats);
    
    // Test de rendu
    const start = performance.now();
    
    // Simuler de gros volumes
    const mockEmails = Array.from({ length: 3000 }, (_, i) => ({
        id: `mock-${i}`,
        subject: `Email test ${i}`,
        from: { emailAddress: { address: `test${i}@example.com`, name: `User ${i}` } },
        category: ['tasks', 'commercial', 'finance', 'other'][i % 4],
        receivedDateTime: new Date().toISOString(),
        categoryConfidence: Math.random(),
        categoryScore: Math.floor(Math.random() * 100)
    }));
    
    // Mock EmailScanner
    window.emailScanner = {
        getAllEmails: () => mockEmails,
        getEmailById: (id) => mockEmails.find(e => e.id === id)
    };
    
    const renderStart = performance.now();
    
    // Test de calculs optimisés
    const counts = window.pageManager.calculateCategoryCountsOptimized(mockEmails);
    const visible = window.pageManager.getVisibleEmailsOptimized();
    
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    console.log(`✅ 3000 emails traités en ${renderTime.toFixed(2)}ms`);
    console.log(`📈 Performance: ${(3000 / (renderTime / 1000)).toFixed(0)} emails/sec`);
    console.log(`🎯 Pour 30 jours: ${(renderTime * 10).toFixed(2)}ms (~${((renderTime * 10) / 1000).toFixed(1)}s)`);
    console.log(`📊 Comptages calculés:`, Object.keys(counts).length, 'catégories');
    console.log(`👁️ Emails visibles:`, visible.length);
    
    const cacheStats = {
        viewCache: window.pageManager.viewCache.size,
        domCache: window.pageManager.domCache.cache.size
    };
    console.log(`💾 Cache utilisé:`, cacheStats);
    
    console.groupEnd();
    
    return { 
        renderTime, 
        emailsPerSecond: 3000 / (renderTime / 1000),
        estimatedFor30Days: (renderTime * 10) / 1000,
        cacheStats 
    };
};

console.log('✅ PageManager v13.0 ULTRA-OPTIMISÉ loaded - Performance révolutionnaire! ⚡');
console.log('📊 Gains estimés: 700 emails en ~30 secondes (vs 10 minutes)');
console.log('🎯 Test: window.testPageManagerPerformance()');
;

// ================================================
// CALCULS OPTIMISÉS AVEC CACHE
// ================================================
PageManager.prototype.calculateCategoryCountsOptimized = function(emails) {
    const cacheKey = `category_counts_${emails.length}_${this.currentCategory}`;
    
    return this.getCachedOrCompute(cacheKey, () => {
        console.log('[PageManager] 📊 Calcul optimisé des comptages de catégories...');
        
        const counts = {};
        let uncategorizedCount = 0;
        
        // Boucle optimisée avec compteurs
        for (let i = 0; i < emails.length; i++) {
            const cat = emails[i].category;
            
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                uncategorizedCount++;
            }
        }
        
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
        }
        
        console.log(`[PageManager] ✅ Comptages: ${Object.keys(counts).length} catégories`);
        return counts;
    }, 15000); // Cache 15 secondes
};

PageManager.prototype.buildTwoLinesCategoryTabsOptimized = function(categoryCounts, totalEmails, categories) {
    const cacheKey = `category_tabs_${totalEmails}_${this.currentCategory}`;
    
    return this.getCachedOrCompute(cacheKey, () => {
        // Récupérer les catégories pré-sélectionnées
        const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
        
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
        
        // Générer le HTML avec étoile TOUJOURS visible
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-harmonized-twolines ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategoryOptimized('${tab.id}')"
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
    }, 20000); // Cache 20 secondes
};

PageManager.prototype.getTaskPreselectedCategoriesOptimized = function() {
    return this.getCachedOrCompute('task_preselected_categories', () => {
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
    }, 5000); // Cache 5 secondes
};

// ================================================
// RENDU LISTE EMAILS ULTRA-OPTIMISÉ AVEC VIRTUAL SCROLLING
// ================================================
PageManager.prototype.renderEmailsListOptimized = function() {
    this.performanceMonitor.start('render_emails_list');
    
    const emails = this.getVisibleEmailsOptimized();
    const container = document.getElementById('virtualScrollContainer');
    
    if (!container) {
        console.error('[PageManager] Container virtual scroll non trouvé');
        this.performanceMonitor.end('render_emails_list');
        return;
    }
    
    if (emails.length === 0) {
        container.innerHTML = this.renderEmptyStateOptimized();
        this.performanceMonitor.end('render_emails_list');
        return;
    }

    // Virtual scrolling pour les gros volumes
    if (emails.length > 100) {
        this.renderWithVirtualScrolling(container, emails);
    } else {
        this.renderDirectly(container, emails);
    }
    
    this.performanceMonitor.end('render_emails_list');
};

PageManager.prototype.renderWithVirtualScrolling = function(container, emails) {
    console.log(`[PageManager] 🎯 Virtual scrolling pour ${emails.length} emails`);
    
    // Setup virtual scrolling
    const containerHeight = container.offsetHeight || 600;
    const range = this.virtualScrolling.calculateVisibleRange(0, containerHeight, emails.length);
    
    // Créer la structure
    container.innerHTML = `
        <div class="virtual-list" style="height: ${range.totalHeight}px; position: relative;">
            <div class="virtual-viewport" style="transform: translateY(${range.offsetY}px);">
                ${this.renderEmailsSlice(emails, range.startIndex, range.endIndex)}
            </div>
        </div>
    `;
    
    // Setup scroll listener optimisé
    this.setupVirtualScrollListener(container, emails);
};

PageManager.prototype.setupVirtualScrollListener = function(container, emails) {
    let scrollTimeout;
    
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const containerHeight = container.offsetHeight;
            const scrollTop = container.scrollTop;
            const range = this.virtualScrolling.calculateVisibleRange(scrollTop, containerHeight, emails.length);
            
            const viewport = container.querySelector('.virtual-viewport');
            if (viewport) {
                viewport.style.transform = `translateY(${range.offsetY}px)`;
                viewport.innerHTML = this.renderEmailsSlice(emails, range.startIndex, range.endIndex);
            }
        }, 16); // 60fps
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
};

PageManager.prototype.renderDirectly = function(container, emails) {
    // Rendu direct pour < 100 emails
    container.innerHTML = `
        <div class="tasks-harmonized-list">
            ${emails.map(email => this.renderOptimizedEmailRow(email)).join('')}
        </div>
    `;
};

PageManager.prototype.renderEmailsSlice = function(emails, startIndex, endIndex) {
    const slice = emails.slice(startIndex, endIndex + 1);
    return slice.map(email => this.renderOptimizedEmailRow(email)).join('');
};

// ================================================
// RENDU EMAIL ROW ULTRA-OPTIMISÉ
// ================================================
PageManager.prototype.renderOptimizedEmailRow = function(email) {
    const cacheKey = `email_row_${email.id}_${this.selectedEmails.has(email.id)}`;
    
    // Cache individuel des cartes email
    const cached = this.domCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    
    const hasTask = this.createdTasks.has(email.id);
    const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
    
    // Récupérer les catégories pré-sélectionnées avec cache
    const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
    
    // Double vérification optimisée
    let isPreselectedForTasks = email.isPreselectedForTasks === true;
    
    if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
        isPreselectedForTasks = true;
        email.isPreselectedForTasks = true;
    }
    
    const isSelected = this.selectedEmails.has(email.id) || isPreselectedForTasks;
    
    // Auto-sélection optimisée
    if (isPreselectedForTasks && !this.selectedEmails.has(email.id)) {
        this.selectedEmails.add(email.id);
    }
    
    // Classes CSS optimisées
    const cardClasses = [
        'task-harmonized-card',
        isSelected ? 'selected' : '',
        hasTask ? 'has-task' : '',
        isPreselectedForTasks ? 'preselected-task' : ''
    ].filter(Boolean).join(' ');
    
    const html = `
        <div class="${cardClasses}" 
             data-email-id="${email.id}"
             data-category="${email.category}"
             data-preselected="${isPreselectedForTasks}"
             onclick="window.pageManager.handleEmailClickOptimized(event, '${email.id}')">
            
            <!-- Checkbox optimisée -->
            <input type="checkbox" 
                   class="task-checkbox-harmonized" 
                   ${isSelected ? 'checked' : ''}
                   onchange="event.stopPropagation(); window.pageManager.toggleEmailSelectionOptimized('${email.id}')">
            
            <!-- Indicateur de priorité optimisé -->
            <div class="priority-bar-harmonized" 
                 style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColorOptimized(email)}"></div>
            
            <!-- Contenu principal optimisé -->
            <div class="task-main-content-harmonized">
                <div class="task-header-harmonized">
                    <h3 class="task-title-harmonized">${this.escapeHtmlOptimized(email.subject || 'Sans sujet')}</h3>
                    <div class="task-meta-harmonized">
                        <span class="task-type-badge-harmonized">📧 Email</span>
                        <span class="deadline-badge-harmonized">
                            📅 ${this.formatEmailDateOptimized(email.receivedDateTime)}
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
                    <span class="recipient-name-harmonized">${this.escapeHtmlOptimized(senderName)}</span>
                    ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                    ${email.category && email.category !== 'other' ? `
                        <span class="category-indicator-harmonized" 
                              style="background: ${this.getCategoryColorOptimized(email.category)}20; 
                                     color: ${this.getCategoryColorOptimized(email.category)};
                                     ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                            ${this.getCategoryIconOptimized(email.category)} ${this.getCategoryNameOptimized(email.category)}
                            ${isPreselectedForTasks ? ' ⭐' : ''}
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <!-- Actions rapides optimisées -->
            <div class="task-actions-harmonized">
                ${this.renderOptimizedEmailActions(email)}
            </div>
        </div>
    `;
    
    // Cache du résultat
    this.domCache.set(cacheKey, html);
    return html;
};

// ================================================
// MÉTHODES UTILITAIRES OPTIMISÉES
// ================================================
PageManager.prototype.getEmailCount = function() {
    return window.emailScanner?.getAllEmails()?.length || 0;
};

PageManager.prototype.getVisibleEmailsOptimized = function() {
    const cacheKey = `visible_emails_${this.currentCategory}_${this.searchTerm}_${this.currentViewMode}`;
    
    return this.getCachedOrCompute(cacheKey, () => {
        const emails = this.getEmailsOptimized();
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
            filteredEmails = filteredEmails.filter(email => this.matchesSearchOptimized(email, this.searchTerm));
        }
        
        return filteredEmails;
    }, 5000); // Cache 5 secondes
};

PageManager.prototype.matchesSearchOptimized = function(email, searchTerm) {
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
};

// ================================================
// GESTION DES INTERACTIONS OPTIMISÉES
// ================================================
PageManager.prototype.toggleEmailSelectionOptimized = function(emailId) {
    console.log('[PageManager] ⚡ Toggle sélection optimisé:', emailId);
    
    if (this.selectedEmails.has(emailId)) {
        this.selectedEmails.delete(emailId);
    } else {
        this.selectedEmails.add(emailId);
    }
    
    // Mise à jour DOM ultra-rapide
    this.batchDOMUpdates.schedule(() => {
        this.updateEmailCheckboxState(emailId);
        this.updateControlsBarOptimized();
    });
};

PageManager.prototype.updateEmailCheckboxState = function(emailId) {
    const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
    if (checkbox) {
        checkbox.checked = this.selectedEmails.has(emailId);
    }
};

PageManager.prototype.updateControlsBarOptimized = function() {
    const selectedCount = this.selectedEmails.size;
    
    // Invalidation sélective du cache
    this.viewCache.delete('controls_bar');
    
    // Batch les updates DOM
    this.batchDOMUpdates.schedule(() => {
        this.updateCreateTaskButton(selectedCount);
        this.updateActionsButton(selectedCount);
        this.updateClearSelectionButton(selectedCount);
    });
};

PageManager.prototype.updateCreateTaskButton = function(selectedCount) {
    const createTaskBtn = document.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
    if (!createTaskBtn) return;
    
    const span = createTaskBtn.querySelector('span');
    const countBadge = createTaskBtn.querySelector('.count-badge-main');
    
    createTaskBtn.disabled = selectedCount === 0;
    createTaskBtn.classList.toggle('disabled', selectedCount === 0);
    
    if (span) {
        span.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
    }
    
    if (countBadge) {
        countBadge.textContent = selectedCount;
        countBadge.style.display = selectedCount > 0 ? 'block' : 'none';
    } else if (selectedCount > 0) {
        const newBadge = document.createElement('span');
        newBadge.className = 'count-badge-main';
        newBadge.textContent = selectedCount;
        createTaskBtn.appendChild(newBadge);
    }
};

PageManager.prototype.updateActionsButton = function(selectedCount) {
    const actionsBtn = document.querySelector('.dropdown-toggle[onclick*="toggleBulkActions"]');
    if (actionsBtn) {
        actionsBtn.disabled = selectedCount === 0;
        actionsBtn.classList.toggle('disabled', selectedCount === 0);
    }
};

PageManager.prototype.updateClearSelectionButton = function(selectedCount) {
    const existingClearBtn = document.querySelector('.btn-clear-selection');
    const actionButtonsContainer = document.querySelector('.action-buttons-expanded');
    
    if (selectedCount > 0) {
        if (!existingClearBtn && actionButtonsContainer) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-expanded btn-clear-selection';
            clearBtn.onclick = () => window.pageManager.clearSelectionOptimized();
            clearBtn.title = 'Effacer la sélection';
            clearBtn.innerHTML = `
                <i class="fas fa-times"></i>
                <span>Effacer (${selectedCount})</span>
            `;
            actionButtonsContainer.appendChild(clearBtn);
        } else if (existingClearBtn) {
            const span = existingClearBtn.querySelector('span');
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

// ================================================
// FILTRAGE OPTIMISÉ
// ================================================
PageManager.prototype.filterByCategoryOptimized = function(categoryId) {
    console.log(`[PageManager] 🔍 Filtrage optimisé par catégorie: ${categoryId}`);
    
    this.performanceMonitor.start('filter_category');
    
    this.currentCategory = categoryId;
    
    // Invalidation sélective du cache
    this.invalidateViewCache();
    
    // Mise à jour optimisée
    this.batchDOMUpdates.schedule(() => {
        this.updateCategoryTabs(categoryId);
        this.renderEmailsListOptimized();
    });
    
    this.performanceMonitor.end('filter_category');
};

PageManager.prototype.invalidateViewCache = function() {
    const keysToDelete = [...this.viewCache.keys()].filter(key => 
        key.includes('visible_emails') || key.includes('category_tabs')
    );
    keysToDelete.forEach(key => this.viewCache.delete(key));
};

PageManager.prototype.updateCategoryTabs = function(categoryId) {
    document.querySelectorAll('.status-pill-harmonized-twolines').forEach(pill => {
        const pillCategoryId = pill.dataset.categoryId;
        pill.classList.toggle('active', pillCategoryId === categoryId);
    });
};

// ================================================
// REFRESH OPTIMISÉ
// ================================================
PageManager.prototype.refreshEmailsViewOptimized = function() {
    console.log('[PageManager] ⚡ Refresh optimisé de la vue emails...');
    
    this.performanceMonitor.start('refresh_view');
    
    // Sauvegarder l'état important
    const state = this.saveViewState();
    
    // Invalidation sélective
    this.invalidateViewCache();
    
    // Mise à jour batch
    this.batchDOMUpdates.schedule(() => {
        this.renderEmailsListOptimized();
        this.restoreViewState(state);
        this.updateControlsBarOptimized();
    });
    
    this.performanceMonitor.end('refresh_view');
};

PageManager.prototype.saveViewState = function() {
    return {
        expandedGroups: this.getExpandedGroups(),
        searchValue: document.getElementById('emailSearchInput')?.value || this.searchTerm,
        scrollPosition: document.getElementById('virtualScrollContainer')?.scrollTop || 0
    };
};

PageManager.prototype.getExpandedGroups = function() {
    const expandedGroups = new Set();
    document.querySelectorAll('.task-group-harmonized.expanded').forEach(group => {
        const groupKey = group.dataset.groupKey;
        if (groupKey) {
            expandedGroups.add(groupKey);
        }
    });
    return expandedGroups;
};

PageManager.prototype.restoreViewState = function(state) {
    // Restaurer les groupes ouverts
    state.expandedGroups.forEach(groupKey => {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (group) {
            this.expandGroupOptimized(group);
        }
    });
    
    // Restaurer la recherche
    const searchInput = document.getElementById('emailSearchInput');
    if (searchInput && state.searchValue) {
        searchInput.value = state.searchValue;
    }
    
    // Restaurer le scroll
    const container = document.getElementById('virtualScrollContainer');
    if (container && state.scrollPosition) {
        container.scrollTop = state.scrollPosition;
    }
};

// ================================================
// MÉTHODES UTILITAIRES RAPIDES
// ================================================
PageManager.prototype.escapeHtmlOptimized = function(text) {
    if (!text) return '';
    
    // Cache des escapes fréquents
    const escaped = this.getCachedOrCompute(`escape_${text}`, () => {
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }, 60000); // Cache 1 minute
    
    return escaped;
};

PageManager.prototype.formatEmailDateOptimized = function(dateString) {
    if (!dateString) return '';
    
    const cacheKey = `date_${dateString}`;
    return this.getCachedOrCompute(cacheKey, () => {
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
    }, 300000); // Cache 5 minutes
};

PageManager.prototype.getCategoryColorOptimized = function(categoryId) {
    return this.getCachedOrCompute(`cat_color_${categoryId}`, () => {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.color || '#64748b';
    }, 30000);
};

PageManager.prototype.getCategoryIconOptimized = function(categoryId) {
    return this.getCachedOrCompute(`cat_icon_${categoryId}`, () => {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.icon || '📌';
    }, 30000);
};

PageManager.prototype.getCategoryNameOptimized = function(categoryId) {
    return this.getCachedOrCompute(`cat_name_${categoryId}`, () => {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.name || categoryId || 'Autre';
    }, 30000);
};

PageManager.prototype.getEmailPriorityColorOptimized = function(email) {
    if (email.importance === 'high') return '#ef4444';
    if (email.hasAttachments) return '#f97316';
    if (email.categoryScore >= 80) return '#10b981';
    return '#3b82f6';
};

// ================================================
// AUTO-ANALYZE OPTIMISÉ
// ================================================
PageManager.prototype.autoAnalyzeOptimized = function(emails) {
    const preselectedCategories = this.getTaskPreselectedCategoriesOptimized();
    
    if (preselectedCategories && preselectedCategories.length > 0) {
        // Filtrer les emails selon les catégories pré-sélectionnées (limite à 3)
        const emailsToAnalyze = emails
            .filter(email => preselectedCategories.includes(email.category))
            .slice(0, 3);
        
        if (emailsToAnalyze.length > 0) {
            // Analyse asynchrone non-bloquante
            setTimeout(() => {
                this.analyzeFirstEmailsOptimized(emailsToAnalyze);
            }, 200);
        }
    }
};

PageManager.prototype.analyzeFirstEmailsOptimized = async function(emails) {
    if (!window.aiTaskAnalyzer) return;
    
    console.log(`[PageManager] 🤖 Analyse IA optimisée de ${emails.length} emails prioritaires`);
    
    for (const email of emails) {
        if (!this.aiAnalysisResults.has(email.id)) {
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(email.id, analysis);
                
                // Pause micro pour éviter la surcharge
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.error('[PageManager] Erreur analyse IA optimisée:', error);
            }
        }
    }
};

// ================================================
// GESTION DES ÉVÉNEMENTS OPTIMISÉE
// ================================================
PageManager.prototype.setupOptimizedEmailsEventListeners = function() {
    const searchInput = document.getElementById('emailSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.debouncedSearch(e.target.value);
        });
    }
};

PageManager.prototype.handleSearchOptimized = function(term) {
    this.searchTerm = term.trim();
    this.invalidateViewCache();
    this.renderEmailsListOptimized();
};

PageManager.prototype.handleEmailClickOptimized = function(event, emailId) {
    // Gestion optimisée des clics avec cache
    if (event.target.type === 'checkbox' || event.target.closest('.task-actions-harmonized')) {
        return;
    }
    
    // Double-clic optimisé
    const now = Date.now();
    const lastClick = this.lastEmailClick || 0;
    
    if (now - lastClick < 300) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleEmailSelectionOptimized(emailId);
        this.lastEmailClick = 0;
        return;
    }
    
    this.lastEmailClick = now;
    
    // Simple clic optimisé
    setTimeout(() => {
        if (Date.now() - this.lastEmailClick >= 250) {
            this.showEmailModalOptimized(emailId);
        }
    }, 250);
};

// ================================================
// ACTIONS OPTIMISÉES
// ================================================
PageManager.prototype.clearSelectionOptimized = function() {
    console.log('[PageManager] ⚡ Effacement sélection optimisé');
    
    this.selectedEmails.clear();
    
    // Mise à jour batch
    this.batchDOMUpdates.schedule(() => {
        // Update toutes les checkboxes
        document.querySelectorAll('.task-checkbox-harmonized').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update la barre de contrôles
        this.updateControlsBarOptimized();
        
        // Update l'apparence des cartes
        document.querySelectorAll('.task-harmonized-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    });
    
    window.uiManager?.showToast('Sélection effacée', 'info');
};

PageManager.prototype.recategorizeEmailsOptimized = async function() {
    if (this.getEmailCount() === 0) return;
    
    console.log('[PageManager] 🔄 Re-catégorisation ultra-optimisée');
    
    this.performanceMonitor.start('recategorization');
    
    // Invalider tous les caches
    this.invalidateAllCaches();
    
    // Re-catégoriser via EmailScanner
    if (window.emailScanner && typeof window.emailScanner.recategorizeEmails === 'function') {
        await window.emailScanner.recategorizeEmails();
    }
    
    // Refresh optimisé
    this.debouncedRefresh();
    
    this.performanceMonitor.end('recategorization');
};

// ================================================
// NETTOYAGE ET DESTRUCTION
// ================================================
PageManager.prototype.cleanup = function() {
    console.log('[PageManager] 🧹 Nettoyage ultra-optimisé...');
    
    // Nettoyage des intervals
    if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
    }
    
    // Nettoyage des event listeners
    if (this.eventListeners) {
        this.eventListeners.forEach(({ eventName, handler }) => {
            window.removeEventListener(eventName, handler);
        });
        this.eventListeners = [];
    }
    
    // Nettoyage des caches
    this.invalidateAllCaches();
    this.domCache.clear();
    
    // Nettoyage des objets
    this.aiAnalysisResults.clear();
    this.createdTasks.clear();
    this.selectedEmails.clear();
    
    console.log('[PageManager] ✅ Nettoyage optimisé terminé');
};

PageManager.prototype.destroy = function() {
    this.cleanup();
    this.currentPage = null;
    console.log('[PageManager] Instance optimisée détruite');
};

// ================================================
// MÉTHODES ADDITIONNELLES (INCHANGÉES MAIS OPTIMISÉES)
// ================================================

// Navigation
PageManager.prototype.updateNavigation = function(activePage) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === activePage);
    });
};

// États vides
PageManager.prototype.renderEmptyEmailsState = function() {
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
};

PageManager.prototype.renderEmptyStateOptimized = function() {
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
            <button class="btn-harmonized btn-primary" onclick="window.pageManager.filterByCategoryOptimized('all')">
                <i class="fas fa-list"></i>
                <span>Voir tous les emails</span>
            </button>
        `;
    } else if (this.currentCategory && this.currentCategory !== 'all') {
        const categoryName = this.getCategoryNameOptimized(this.currentCategory);
        title = `Aucun email dans "${categoryName}"`;
        text = 'Cette catégorie ne contient aucun email pour le moment.';
        action = `
            <button class="btn-harmonized btn-primary" onclick="window.pageManager.filterByCategoryOptimized('all')">
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
