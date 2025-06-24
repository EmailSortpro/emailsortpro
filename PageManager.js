// PageManager.js - Version 13.0 - Orchestration parfaite avec CategoryManager et Google

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
        
        // État de synchronisation
        this.isSyncing = false;
        this.syncQueue = [];
        
        // Page renderers
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

    async init() {
        console.log('[PageManager] ✅ Version 13.0 - Initialisation avec orchestration parfaite');
        
        // Attendre que les services critiques soient prêts
        await this.waitForServices();
        
        // Synchroniser avec CategoryManager
        this.syncWithCategoryManager();
        
        console.log('[PageManager] ✅ Initialisation complète');
    }

    // ================================================
    // ATTENTE DES SERVICES CRITIQUES
    // ================================================
    async waitForServices() {
        console.log('[PageManager] ⏳ Attente des services critiques...');
        
        const maxAttempts = 30;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const servicesReady = this.checkServicesReady();
            
            if (servicesReady.allReady) {
                console.log('[PageManager] ✅ Tous les services sont prêts');
                return true;
            }
            
            attempts++;
            console.log(`[PageManager] Attente... (${attempts}/${maxAttempts})`, servicesReady);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn('[PageManager] ⚠️ Timeout attente services, continuation avec services disponibles');
        return false;
    }

    checkServicesReady() {
        const services = {
            categoryManager: !!window.categoryManager?.isInitialized,
            emailScanner: !!window.emailScanner,
            googleAuth: !!window.googleAuthService,
            uiManager: !!window.uiManager?.isInitialized
        };
        
        services.allReady = Object.values(services).every(ready => ready);
        
        return services;
    }

    // ================================================
    // SYNCHRONISATION AVEC CATEGORYMANAGER
    // ================================================
    syncWithCategoryManager() {
        if (!window.categoryManager) {
            console.error('[PageManager] CategoryManager non disponible');
            return;
        }
        
        console.log('[PageManager] 🔄 Synchronisation avec CategoryManager...');
        
        // S'abonner aux changements
        window.categoryManager.addChangeListener((type, value) => {
            console.log('[PageManager] 📨 Changement CategoryManager:', type);
            this.handleCategoryManagerChange(type, value);
        });
        
        // Récupérer l'état initial
        const categories = window.categoryManager.getTaskPreselectedCategories();
        console.log('[PageManager] 📋 Catégories pré-sélectionnées initiales:', categories);
    }

    handleCategoryManagerChange(type, value) {
        console.log('[PageManager] 🔧 Traitement changement:', type, value);
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.handlePreselectedCategoriesChange(value);
                break;
                
            case 'scanCompleted':
                this.handleScanCompleted(value);
                break;
                
            case 'activeCategories':
                this.handleActiveCategoriesChange(value);
                break;
                
            default:
                console.log('[PageManager] Changement non géré:', type);
        }
    }

    handlePreselectedCategoriesChange(categories) {
        console.log('[PageManager] ⭐ Mise à jour catégories pré-sélectionnées:', categories);
        
        // Mettre à jour EmailScanner
        if (window.emailScanner) {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        // Rafraîchir la vue si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    handleScanCompleted(scanResult) {
        console.log('[PageManager] 📊 Scan terminé, résultats:', scanResult);
        
        this.lastScanData = scanResult;
        
        // Si on est sur la page emails, rafraîchir
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.loadPage('emails');
            }, 100);
        }
    }

    handleActiveCategoriesChange(categories) {
        console.log('[PageManager] 🏷️ Catégories actives changées:', categories);
        
        // Déclencher re-catégorisation si nécessaire
        if (window.emailScanner?.emails?.length > 0) {
            window.emailScanner.recategorizeEmails();
        }
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter la recatégorisation
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés');
            if (this.currentPage === 'emails') {
                this.refreshEmailsView();
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé via event');
            this.handleScanCompleted(event.detail);
        });

        // Écouter quand EmailScanner est prêt
        window.addEventListener('emailScannerReady', (event) => {
            console.log('[PageManager] EmailScanner prêt:', event.detail);
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });

        // Écouter le scroll pour la position fixe
        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });
    }

    // ================================================
    // GESTION DES PAGES
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        // Ignorer le dashboard
        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré');
            this.updateNavigation(pageName);
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Container non trouvé');
            return;
        }

        this.updateNavigation(pageName);
        
        // Ne pas afficher le loading pour les changements rapides
        if (this.currentPage !== pageName) {
            window.uiManager?.showLoading(`Chargement ${pageName}...`);
        }

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
            console.error(`[PageManager] Erreur chargement:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error);
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

    // ================================================
    // RENDU PAGE SCANNER AVEC ORCHESTRATION
    // ================================================
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner avec orchestration...');
        
        // Vérifier l'état d'authentification
        const authStatus = this.checkAuthStatus();
        
        if (!authStatus.isAuthenticated) {
            container.innerHTML = this.renderAuthRequired(authStatus);
            return;
        }
        
        // Utiliser ScanStartModule si disponible
        if (window.scanStartModule?.render && window.scanStartModule.stylesAdded) {
            try {
                console.log('[PageManager] Utilisation ScanStartModule');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule:', error);
            }
        }
        
        // Interface de scan basique avec orchestration
        container.innerHTML = this.renderBasicScanner(authStatus);
        
        // Ajouter les event listeners
        this.setupScannerEventListeners();
    }

    renderBasicScanner(authStatus) {
        const provider = authStatus.provider;
        const providerInfo = this.getProviderInfo(provider);
        
        return `
            <div class="scanner-page">
                <div class="scanner-header">
                    <h1>Scanner d'emails</h1>
                    <div class="provider-badge" style="background: ${providerInfo.color}20; color: ${providerInfo.color}">
                        <i class="${providerInfo.icon}"></i>
                        <span>${providerInfo.name}</span>
                    </div>
                </div>
                
                <div class="scan-options">
                    <div class="option-group">
                        <label>Période</label>
                        <select id="scanPeriod" class="form-control">
                            <option value="7">7 derniers jours</option>
                            <option value="14">14 derniers jours</option>
                            <option value="30">30 derniers jours</option>
                            <option value="90">3 mois</option>
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label>Options</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="autoCategrize" checked>
                                Catégorisation automatique
                            </label>
                            <label>
                                <input type="checkbox" id="autoAnalyze" checked>
                                Analyse IA pour tâches
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="scan-actions">
                    <button class="btn btn-primary btn-large" onclick="window.pageManager.startScan()">
                        <i class="fas fa-search"></i>
                        Lancer le scan
                    </button>
                </div>
                
                <div id="scanProgress" class="scan-progress hidden">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-message"></div>
                </div>
                
                <div id="scanResults" class="scan-results hidden">
                    <!-- Résultats ici -->
                </div>
            </div>
        `;
    }

    // ================================================
    // ORCHESTRATION DU SCAN
    // ================================================
    async startScan() {
        console.log('[PageManager] 🚀 Démarrage scan orchestré');
        
        if (!window.emailScanner) {
            window.uiManager?.showToast('Scanner non disponible', 'error');
            return;
        }
        
        // Récupérer les options
        const period = document.getElementById('scanPeriod')?.value || 7;
        const autoCategrize = document.getElementById('autoCategrize')?.checked ?? true;
        const autoAnalyze = document.getElementById('autoAnalyze')?.checked ?? true;
        
        // Récupérer les catégories pré-sélectionnées depuis CategoryManager
        const taskPreselectedCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
        
        console.log('[PageManager] 📋 Options de scan:', {
            period,
            autoCategrize,
            autoAnalyze,
            taskPreselectedCategories
        });
        
        // UI de progression
        const progressDiv = document.getElementById('scanProgress');
        const resultsDiv = document.getElementById('scanResults');
        
        if (progressDiv) progressDiv.classList.remove('hidden');
        if (resultsDiv) resultsDiv.classList.add('hidden');
        
        try {
            // Lancer le scan avec orchestration
            const results = await window.emailScanner.scan({
                days: parseInt(period),
                autoCategrize,
                autoAnalyze,
                taskPreselectedCategories,
                onProgress: (progress) => this.updateScanProgress(progress)
            });
            
            console.log('[PageManager] ✅ Scan terminé:', results);
            
            // Afficher les résultats
            this.displayScanResults(results);
            
            // Notifier CategoryManager
            if (window.categoryManager?.recordScanResult) {
                window.categoryManager.recordScanResult(results);
            }
            
        } catch (error) {
            console.error('[PageManager] ❌ Erreur scan:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            if (progressDiv) progressDiv.classList.add('hidden');
        }
    }

    updateScanProgress(progress) {
        const progressBar = document.querySelector('.progress-fill');
        const progressMessage = document.querySelector('.progress-message');
        
        if (progress.phase === 'complete') {
            if (progressBar) progressBar.style.width = '100%';
            if (progressMessage) progressMessage.textContent = 'Scan terminé !';
            return;
        }
        
        if (progress.phase === 'error') {
            if (progressMessage) {
                progressMessage.textContent = `Erreur: ${progress.message}`;
                progressMessage.classList.add('error');
            }
            return;
        }
        
        if (progressMessage) {
            progressMessage.textContent = progress.message || 'Scan en cours...';
        }
        
        if (progressBar && progress.progress) {
            const percent = Math.round((progress.progress.current / progress.progress.total) * 100);
            progressBar.style.width = `${percent}%`;
        }
    }

    displayScanResults(results) {
        const resultsDiv = document.getElementById('scanResults');
        const progressDiv = document.getElementById('scanProgress');
        
        if (progressDiv) progressDiv.classList.add('hidden');
        if (!resultsDiv) return;
        
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = `
            <div class="results-summary">
                <h2>Résultats du scan</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #3b82f6">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.total}</div>
                            <div class="stat-label">Emails trouvés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #10b981">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.categorized}</div>
                            <div class="stat-label">Catégorisés</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #8b5cf6">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${results.stats?.preselectedForTasks || 0}</div>
                            <div class="stat-label">Pré-sélectionnés</div>
                        </div>
                    </div>
                </div>
                
                <div class="categories-breakdown">
                    <h3>Répartition par catégorie</h3>
                    ${this.renderCategoriesBreakdown(results.breakdown)}
                </div>
                
                <div class="scan-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-eye"></i>
                        Voir les emails
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManager.startScan()">
                        <i class="fas fa-redo"></i>
                        Nouveau scan
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoriesBreakdown(breakdown) {
        if (!breakdown || Object.keys(breakdown).length === 0) {
            return '<p class="no-data">Aucune catégorie détectée</p>';
        }
        
        const categories = Object.entries(breakdown)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a);
        
        return `
            <div class="categories-list">
                ${categories.map(([catId, count]) => {
                    const catInfo = this.getCategoryInfo(catId);
                    const percentage = Math.round((count / Object.values(breakdown).reduce((a, b) => a + b, 0)) * 100);
                    
                    return `
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-icon">${catInfo.icon}</span>
                                <span class="category-name">${catInfo.name}</span>
                            </div>
                            <div class="category-stats">
                                <span class="category-count">${count}</span>
                                <span class="category-percent">${percentage}%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-bar-fill" style="width: ${percentage}%; background: ${catInfo.color}"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ================================================
    // RENDU PAGE EMAILS AVEC SYNCHRONISATION
    // ================================================
    async renderEmails(container) {
        // Vérifier si EmailScanner a des données
        const emails = window.emailScanner?.getAllEmails() || [];
        
        console.log(`[PageManager] Rendu emails: ${emails.length} emails`);
        
        if (emails.length === 0) {
            // Vérifier s'il y a des résultats en cache
            const cachedResults = this.loadCachedResults();
            if (cachedResults && cachedResults.emails?.length > 0) {
                console.log('[PageManager] Chargement depuis le cache');
                await this.restoreFromCache(cachedResults);
            } else {
                container.innerHTML = this.renderEmptyEmailsState();
                return;
            }
        }
        
        // Récupérer les catégories depuis CategoryManager
        const categories = window.categoryManager?.getCategories() || {};
        const taskPreselectedCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
        
        console.log('[PageManager] 📋 Catégories pré-sélectionnées:', taskPreselectedCategories);
        
        // Rendu de la page emails
        this.renderEmailsPage(container, emails, categories, taskPreselectedCategories);
    }

    renderEmailsPage(container, emails, categories, taskPreselectedCategories) {
        const categoryCounts = this.calculateCategoryCounts(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        
        container.innerHTML = `
            <div class="tasks-page-modern">
                ${!this.hideExplanation ? this.renderExplanationBanner() : ''}
                
                <!-- Contrôles et filtres -->
                <div class="controls-and-filters-container">
                    ${this.renderControlsBar(selectedCount)}
                    ${this.renderCategoryFilters(categoryCounts, totalEmails, categories, taskPreselectedCategories)}
                </div>
                
                <!-- Container sticky (clone) -->
                <div class="sticky-controls-container"></div>
                
                <!-- Liste des emails -->
                <div class="tasks-container-harmonized">
                    ${this.renderEmailsList(emails)}
                </div>
            </div>
        `;
        
        this.addExpandedEmailStyles();
        this.setupEmailsEventListeners();
        this.setupStickyControls();
        
        // Auto-analyse si activée
        if (this.autoAnalyzeEnabled && taskPreselectedCategories.length > 0) {
            this.autoAnalyzePreselectedEmails(emails, taskPreselectedCategories);
        }
    }

    renderControlsBar(selectedCount) {
        const visibleCount = this.getVisibleEmails().length;
        
        return `
            <div class="controls-bar-single-line">
                <!-- Recherche -->
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
                    ${this.renderViewModes()}
                </div>
                
                <!-- Actions -->
                <div class="action-buttons">
                    ${this.renderActionButtons(selectedCount, visibleCount)}
                </div>
            </div>
        `;
    }

    renderCategoryFilters(categoryCounts, totalEmails, categories, taskPreselectedCategories) {
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
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: taskPreselectedCategories.includes(catId)
                });
            }
        });
        
        // Ajouter "Autre" si nécessaire
        if (categoryCounts.other > 0) {
            tabs.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                count: categoryCounts.other,
                isPreselected: false
            });
        }
        
        return `
            <div class="status-filters-compact">
                ${tabs.map(tab => this.renderCategoryTab(tab)).join('')}
            </div>
        `;
    }

    renderCategoryTab(tab) {
        const isActive = this.currentCategory === tab.id;
        const classes = `status-pill-compact ${isActive ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''}`;
        
        return `
            <button class="${classes}" 
                    onclick="window.pageManager.filterByCategory('${tab.id}')"
                    data-category-id="${tab.id}"
                    title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée' : ''}">
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
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    checkAuthStatus() {
        const googleAuth = window.googleAuthService?.isAuthenticated();
        const microsoftAuth = window.authService?.isAuthenticated();
        
        return {
            isAuthenticated: googleAuth || microsoftAuth,
            provider: googleAuth ? 'google' : (microsoftAuth ? 'microsoft' : null),
            googleAuth,
            microsoftAuth
        };
    }

    getProviderInfo(provider) {
        const providers = {
            google: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335'
            },
            microsoft: {
                name: 'Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4'
            }
        };
        
        return providers[provider] || {
            name: 'Email',
            icon: 'fas fa-envelope',
            color: '#6b7280'
        };
    }

    getCategoryInfo(categoryId) {
        return window.categoryManager?.getCategory(categoryId) || {
            id: categoryId,
            name: categoryId,
            icon: '📂',
            color: '#6b7280'
        };
    }

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filtered = emails;
        
        // Filtre catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filtered = filtered.filter(email => 
                    !email.category || email.category === 'other'
                );
            } else {
                filtered = filtered.filter(email => 
                    email.category === this.currentCategory
                );
            }
        }
        
        // Filtre recherche
        if (this.searchTerm) {
            filtered = filtered.filter(email => 
                this.matchesSearch(email, this.searchTerm)
            );
        }
        
        return filtered;
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
            const category = email.category || 'other';
            counts[category] = (counts[category] || 0) + 1;
        });
        
        return counts;
    }

    loadCachedResults() {
        try {
            // Essayer sessionStorage d'abord
            const sessionData = sessionStorage.getItem('lastScanResults');
            if (sessionData) {
                return JSON.parse(sessionData);
            }
            
            // Puis localStorage
            const localData = localStorage.getItem('emailsCachePersistent');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.expiry > Date.now()) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('[PageManager] Erreur lecture cache:', error);
        }
        
        return null;
    }

    async restoreFromCache(cachedData) {
        if (window.emailScanner && cachedData.emails) {
            window.emailScanner.emails = cachedData.emails;
            console.log('[PageManager] Cache restauré:', cachedData.emails.length, 'emails');
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
                    Utilisez le scanner pour récupérer vos emails
                </p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            </div>
        `;
    }

    renderAuthRequired(authStatus) {
        return `
            <div class="auth-required">
                <div class="auth-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>Authentification requise</h2>
                <p>Veuillez vous connecter pour scanner vos emails</p>
                
                <div class="auth-buttons">
                    ${!authStatus.googleAuth ? `
                        <button class="btn btn-google" onclick="window.app?.loginWithGoogle()">
                            <i class="fab fa-google"></i>
                            Se connecter avec Gmail
                        </button>
                    ` : ''}
                    
                    ${!authStatus.microsoftAuth ? `
                        <button class="btn btn-microsoft" onclick="window.app?.loginWithMicrosoft()">
                            <i class="fab fa-microsoft"></i>
                            Se connecter avec Outlook
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Méthodes stub pour les autres fonctionnalités
    handleScrollForSticky() {
        // Implémentation dans la version complète
    }

    setupStickyControls() {
        // Implémentation dans la version complète
    }

    setupEmailsEventListeners() {
        // Implémentation dans la version complète
    }

    renderEmailsList(emails) {
        // Implémentation simplifiée
        return `<div class="emails-list">Liste des emails (${emails.length})</div>`;
    }

    renderViewModes() {
        // Implémentation simplifiée
        return '';
    }

    renderActionButtons() {
        // Implémentation simplifiée
        return '';
    }

    renderExplanationBanner() {
        // Implémentation simplifiée
        return '';
    }

    addExpandedEmailStyles() {
        // Styles dans la version complète
    }

    autoAnalyzePreselectedEmails() {
        // Analyse automatique dans la version complète
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    refreshEmailsView() {
        if (this.currentPage === 'emails') {
            this.loadPage('emails');
        }
    }

    clearSearch() {
        this.searchTerm = '';
        this.refreshEmailsView();
    }

    renderErrorPage(error) {
        return `
            <div class="error-page">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Erreur de chargement</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    Rafraîchir la page
                </button>
            </div>
        `;
    }

    // Pages stub
    async renderTasks(container) {
        container.innerHTML = '<div class="page-content">Page Tâches</div>';
    }

    async renderCategories(container) {
        container.innerHTML = '<div class="page-content">Page Catégories</div>';
    }

    async renderSettings(container) {
        container.innerHTML = '<div class="page-content">Page Paramètres</div>';
    }

    async renderRanger(container) {
        container.innerHTML = '<div class="page-content">Page Ranger</div>';
    }

    setupScannerEventListeners() {
        // Event listeners pour le scanner
    }
}

// Créer l'instance globale
window.pageManager = new PageManager();

// Bind des méthodes pour le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v13.0 - Orchestration parfaite avec CategoryManager et Google');
