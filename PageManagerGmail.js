// PageManagerGmail.js - Version 19.0 - Corrigé et Optimisé

class PageManagerGmail {
    constructor() {
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        this.isInitialized = false;
        
        // Vue modes pour les emails
        this.currentViewMode = 'flat'; // Par défaut en liste
        this.currentCategory = null;
        
        // État de synchronisation Gmail
        this.syncState = {
            startScanSynced: false,
            emailScannerSynced: false,
            categoryManagerSynced: false,
            lastSyncTimestamp: null,
            emailCount: 0,
            provider: 'gmail'
        };
        
        // Cache pour optimisation
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        // Page modules mapping
        this.pageModules = {
            scanner: 'minimalScanModule',
            emails: null,
            tasks: 'tasksView',
            categories: 'categoriesPage',
            settings: 'categoriesPage',
            ranger: 'domainOrganizer'
        };
        
        // Cache pour le contenu des emails
        this.emailContentCache = new Map();
        
        // Cache local des emails
        this.emailsCache = [];
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupSyncListeners();
            this.setupCategoryManagerIntegration();
            
            // Charger les emails depuis le sessionStorage si disponibles
            this.loadEmailsFromStorage();
            
            // Écouter les événements d'authentification Google
            window.addEventListener('googleAuthReady', (e) => {
                console.log('[PageManagerGmail] 🔐 Google Auth Ready:', e.detail);
                if (e.detail && e.detail.authenticated) {
                    this.syncState.provider = 'gmail';
                    // Recharger la page si on est sur une page nécessitant l'auth
                    if (this.currentPage && this.requiresAuthentication(this.currentPage)) {
                        setTimeout(() => this.loadPage(this.currentPage), 500);
                    }
                }
            });
            
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Version 19.0 - Corrigé et Optimisé');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur initialisation:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES EMAILS DEPUIS LE STORAGE
    // ================================================
    loadEmailsFromStorage() {
        try {
            const scanResults = sessionStorage.getItem('scanResults');
            if (scanResults) {
                const results = JSON.parse(scanResults);
                console.log('[PageManagerGmail] 📥 Résultats de scan trouvés:', results);
                
                if (results.provider === 'google' || results.provider === 'gmail') {
                    this.syncState.emailCount = results.total || 0;
                    this.syncState.startScanSynced = true;
                    this.syncState.lastSyncTimestamp = results.timestamp || Date.now();
                }
            }
        } catch (error) {
            console.warn('[PageManagerGmail] ⚠️ Erreur chargement depuis storage:', error);
        }
    }

    // ================================================
    // INTÉGRATION CATEGORYMANAGER
    // ================================================
    setupCategoryManagerIntegration() {
        if (window.categoryManager) {
            this.syncState.categoryManagerSynced = true;
            window.categoryManager.addChangeListener((type, value) => {
                this.handleCategoryManagerChange(type, value);
            });
        } else {
            setTimeout(() => this.setupCategoryManagerIntegration(), 2000);
        }
    }

    handleCategoryManagerChange(type, value) {
        if (type === 'taskPreselectedCategories') {
            this.invalidateTaskCategoriesCache();
            if (window.emailScanner?.updateTaskPreselectedCategories) {
                window.emailScanner.updateTaskPreselectedCategories(value);
            }
        }
        
        if (this.currentPage === 'emails' && this.getAllEmails().length > 0) {
            setTimeout(() => window.emailScanner?.recategorizeEmails?.(), 150);
        }
    }

    // ================================================
    // LISTENERS
    // ================================================
    setupEventListeners() {
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.source !== 'PageManagerGmail') {
                this.handleGenericSettingsChanged(e.detail);
            }
        });
    }

    setupSyncListeners() {
        const handlers = {
            'scanCompleted': (e) => this.handleScanCompleted(e.detail),
            'emailScannerSynced': (e) => this.handleEmailScannerSynced(e.detail),
            'emailsRecategorized': () => this.currentPage === 'emails' && this.refreshEmailsView(),
            'googleAuthReady': (e) => e.detail.authenticated && (this.syncState.provider = 'gmail'),
            'mailServiceReady': (e) => this.handleMailServiceReady(e.detail)
        };
        
        Object.entries(handlers).forEach(([event, handler]) => {
            window.addEventListener(event, handler);
        });
    }

    handleScanCompleted(scanData) {
        console.log('[PageManagerGmail] 📨 Scan terminé, traitement des données:', scanData);
        
        this.syncState.startScanSynced = true;
        this.syncState.lastSyncTimestamp = scanData.timestamp || Date.now();
        this.syncState.emailCount = scanData.results?.total || scanData.total || 0;
        this.lastScanData = scanData;
        
        if (scanData.emails && Array.isArray(scanData.emails)) {
            this.emailsCache = scanData.emails;
            console.log(`[PageManagerGmail] ✅ ${this.emailsCache.length} emails stockés dans le cache`);
        }
        
        if (this.currentPage === 'emails') {
            console.log('[PageManagerGmail] 🔄 Rafraîchissement de la vue emails...');
            setTimeout(() => this.refreshEmailsView(), 500);
        }
    }

    handleEmailScannerSynced(syncData) {
        this.syncState.emailScannerSynced = true;
        this.syncState.lastSyncTimestamp = syncData.timestamp || Date.now();
        if (syncData.emailCount !== undefined) {
            this.syncState.emailCount = syncData.emailCount;
        }
        if (this.currentPage === 'emails') {
            setTimeout(() => this.refreshEmailsView(), 200);
        }
    }

    handleMailServiceReady(detail) {
        console.log('[PageManagerGmail] 📧 MailService prêt:', detail);
        if (detail.provider === 'google' || detail.provider === 'gmail') {
            this.syncState.provider = 'gmail';
        }
    }

    handleGenericSettingsChanged(changeData) {
        const { type, value } = changeData;
        
        if (type === 'taskPreselectedCategories') {
            this.invalidateTaskCategoriesCache();
            if (window.aiTaskAnalyzer?.updatePreselectedCategories) {
                window.aiTaskAnalyzer.updatePreselectedCategories(value);
            }
        }
        
        if (this.getAllEmails().length > 0) {
            setTimeout(() => window.emailScanner?.recategorizeEmails?.(), 150);
        }
    }

    // ================================================
    // MÉTHODES POUR RÉCUPÉRER LES DONNÉES
    // ================================================
    getAllEmails() {
        let emails = [];
        
        // 1. Cache local en priorité
        if (this.emailsCache && this.emailsCache.length > 0) {
            console.log(`[PageManagerGmail] 📧 Utilisation du cache local: ${this.emailsCache.length} emails`);
            emails = this.emailsCache;
        }
        // 2. EmailScanner avec méthode getAllEmails
        else if (window.emailScanner?.getAllEmails && typeof window.emailScanner.getAllEmails === 'function') {
            emails = window.emailScanner.getAllEmails();
            console.log(`[PageManagerGmail] 📧 Emails depuis emailScanner.getAllEmails(): ${emails.length}`);
        }
        // 3. EmailScanner avec propriété emails
        else if (window.emailScanner?.emails && Array.isArray(window.emailScanner.emails)) {
            emails = window.emailScanner.emails;
            console.log(`[PageManagerGmail] 📧 Emails depuis emailScanner.emails: ${emails.length}`);
        }
        // 4. Essayer de récupérer depuis MailService
        else if (window.mailService && this.syncState.startScanSynced) {
            console.log('[PageManagerGmail] 🔄 Tentative de récupération depuis MailService...');
            this.fetchEmailsFromMailService();
        }
        
        // Vérifier et forcer la catégorisation si nécessaire
        const needsCategorization = emails.some(email => !email.category || email.category === '');
        if (needsCategorization && window.categoryManager) {
            console.log('[PageManagerGmail] ⚠️ Emails non catégorisés détectés, lancement de la catégorisation...');
            emails = this.categorizeEmails(emails);
        }
        
        // Filtrer pour ne garder que les emails Gmail/Google
        const gmailEmails = emails.filter(email => {
            return !email.provider || email.provider === 'google' || email.provider === 'gmail';
        });
        
        console.log(`[PageManagerGmail] 📊 Total emails Gmail: ${gmailEmails.length}/${emails.length}`);
        return gmailEmails;
    }

    categorizeEmails(emails) {
        if (!window.categoryManager || !window.categoryManager.analyzeEmail) {
            console.warn('[PageManagerGmail] CategoryManager non disponible pour la catégorisation');
            return emails;
        }

        console.log('[PageManagerGmail] 🏷️ Catégorisation de', emails.length, 'emails...');
        
        return emails.map(email => {
            if (!email.category || email.category === '') {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                } catch (error) {
                    console.error('[PageManagerGmail] Erreur catégorisation email:', error);
                    email.category = 'other';
                }
            }
            return email;
        });
    }

    async fetchEmailsFromMailService() {
        if (!window.mailService) return;
        
        try {
            console.log('[PageManagerGmail] 🔄 Récupération des emails depuis MailService...');
            const emails = await window.mailService.getMessages('inbox', { top: 1000 });
            
            if (emails && emails.length > 0) {
                this.emailsCache = emails;
                console.log(`[PageManagerGmail] ✅ ${emails.length} emails récupérés depuis MailService`);
                
                if (this.currentPage === 'emails') {
                    this.refreshEmailsView();
                }
            }
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur récupération MailService:', error);
        }
    }

    getCategories() {
        return window.categoryManager?.getCategories?.() || 
               window.emailScanner?.defaultWebCategories || 
               { 'all': { name: 'Tous', icon: '📧', color: '#1e293b' } };
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        if (this._taskCategoriesCache && (now - this._taskCategoriesCacheTime) < 10000) {
            return [...this._taskCategoriesCache];
        }
        
        let categories = window.categoryManager?.getTaskPreselectedCategories?.() || 
                        window.emailScanner?.getTaskPreselectedCategories?.() || 
                        [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        return [...categories];
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
    }

    // ================================================
    // CHARGEMENT DES PAGES
    // ================================================
    async loadPage(pageName) {
        if (!this.isInitialized) return;

        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content') || 
                         document.querySelector('#content');
        
        if (!container) {
            console.error('[PageManagerGmail] Container non trouvé');
            return;
        }

        try {
            this.showLoading(`Chargement ${pageName}...`);
            this.updateNavigation(pageName);
            container.innerHTML = '';
            
            if (this.requiresAuthentication(pageName)) {
                const authStatus = await this.checkAuthenticationStatus();
                if (!authStatus.isAuthenticated) {
                    this.hideLoading();
                    container.innerHTML = this.renderAuthRequired();
                    return;
                }
            }
            
            await this.renderPage(pageName, container);
            this.currentPage = pageName;
            this.hideLoading();

        } catch (error) {
            console.error(`[PageManagerGmail] Erreur chargement ${pageName}:`, error);
            this.hideLoading();
            this.showError(`Erreur: ${error.message}`);
        }
    }

    requiresAuthentication(pageName) {
        return ['emails', 'tasks', 'scanner'].includes(pageName);
    }

    async checkAuthenticationStatus() {
        try {
            let isAuthenticated = false;
            
            // Vérifier GoogleAuthService d'abord (pour Gmail)
            if (window.googleAuthService) {
                if (typeof window.googleAuthService.isAuthenticated === 'function') {
                    const authCheck = await window.googleAuthService.isAuthenticated();
                    isAuthenticated = authCheck.authenticated || false;
                    console.log('[PageManagerGmail] GoogleAuthService check:', authCheck);
                }
                
                if (!isAuthenticated && typeof window.googleAuthService.getAccessToken === 'function') {
                    try {
                        const token = await window.googleAuthService.getAccessToken();
                        isAuthenticated = !!token;
                        console.log('[PageManagerGmail] Token disponible:', !!token);
                    } catch (e) {
                        console.warn('[PageManagerGmail] Erreur récupération token:', e);
                    }
                }
            }
            
            return { 
                isAuthenticated, 
                provider: 'gmail',
                source: isAuthenticated ? 'googleAuthService' : 'none'
            };
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur vérification auth:', error);
            return { isAuthenticated: false };
        }
    }

    async renderPage(pageName, container) {
        const moduleName = this.pageModules[pageName];
        if (moduleName && window[moduleName]?.render) {
            return window[moduleName].render(container);
        }
        
        switch (pageName) {
            case 'emails':
                return this.renderEmails(container);
            case 'dashboard':
                this.showPageContent();
                break;
            default:
                container.innerHTML = `<div class="empty-state">Page ${pageName} en construction</div>`;
        }
    }

    // ================================================
    // RENDU DE LA PAGE EMAILS
    // ================================================
    async renderEmails(container) {
        console.log('[PageManagerGmail] 🎨 Rendu de la page emails...');
        
        const emails = this.getAllEmails();
        const categories = this.getCategories();
        
        console.log(`[PageManagerGmail] 📊 Emails à afficher: ${emails.length}`);
        console.log(`[PageManagerGmail] 📊 Sync state:`, this.syncState);
        
        if (emails.length === 0 && !this.syncState.startScanSynced) {
            console.log('[PageManagerGmail] ⚠️ Aucun email et pas de sync');
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        if (emails.length === 0 && this.syncState.startScanSynced) {
            console.log('[PageManagerGmail] 🔄 Sync effectué mais pas d\'emails, tentative de récupération...');
            await this.fetchEmailsFromMailService();
            const updatedEmails = this.getAllEmails();
            
            if (updatedEmails.length === 0) {
                container.innerHTML = this.renderNoEmailsAfterScan();
                return;
            }
        }

        const categoryCounts = this.calculateCategoryCounts(emails);
        const selectedCount = this.selectedEmails.size;
        
        container.innerHTML = `
            <div class="emails-page-gmail">
                ${!this.hideExplanation ? this.renderExplanationNotice() : ''}
                <div class="email-page-header">
                    <div class="header-top">
                        <h1 class="page-title">
                            <i class="fab fa-google"></i>
                            <span>Emails Gmail</span>
                            <span class="email-count">${emails.length}</span>
                        </h1>
                        <div class="header-actions">
                            <div class="view-mode-selector">
                                <button class="view-mode-btn ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('flat')"
                                        title="Vue par liste">
                                    <i class="fas fa-list"></i>
                                </button>
                                <button class="view-mode-btn ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('grouped-domain')"
                                        title="Vue par domaine">
                                    <i class="fas fa-globe"></i>
                                </button>
                                <button class="view-mode-btn ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                        onclick="pageManagerGmail.changeViewMode('grouped-sender')"
                                        title="Vue par expéditeur">
                                    <i class="fas fa-user"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="search-bar-container">
                        <div class="search-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="emailSearchInput"
                                   placeholder="Rechercher dans vos emails Gmail..." 
                                   value="${this.searchTerm}">
                            ${this.searchTerm ? `
                                <button class="clear-search" onclick="pageManagerGmail.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="category-tabs-container">
                        ${this.renderCategoryTabs(categoryCounts, emails.length, categories)}
                    </div>
                    
                    <div class="action-bar">
                        <div class="selection-info">
                            ${selectedCount > 0 ? `
                                <span class="selected-count">${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                            ` : ''}
                        </div>
                        <div class="action-buttons">
                            <button class="btn-action btn-create-tasks ${selectedCount === 0 ? 'disabled' : ''}" 
                                    onclick="pageManagerGmail.createTasksFromSelection()"
                                    ${selectedCount === 0 ? 'disabled' : ''}>
                                <i class="fas fa-tasks"></i>
                                <span>Créer des tâches</span>
                            </button>
                            
                            <button class="btn-action btn-refresh" onclick="pageManagerGmail.refreshEmails()">
                                <i class="fas fa-sync-alt"></i>
                                <span>Actualiser</span>
                            </button>
                            
                            ${selectedCount > 0 ? `
                                <button class="btn-action btn-clear-selection" onclick="pageManagerGmail.clearSelection()">
                                    <i class="fas fa-times"></i>
                                    <span>Effacer</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="emails-list-container">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.addEmailsStyles();
        this.setupEmailsEventListeners();
        
        // Auto-analyse si activée
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselected = this.getTaskPreselectedCategories();
            if (preselected.length > 0) {
                const toAnalyze = emails.filter(e => preselected.includes(e.category)).slice(0, 5);
                if (toAnalyze.length > 0) {
                    setTimeout(() => this.analyzeEmails(toAnalyze), 1000);
                }
            }
        }
    }

    renderNoEmailsAfterScan() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fab fa-google"></i></div>
                <h3>Scan terminé - Aucun email Gmail trouvé</h3>
                <p>Le scan s'est terminé avec succès mais aucun email n'a été trouvé.</p>
                <p>Cela peut arriver si :</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Votre boîte Gmail est vide</li>
                    <li>Les filtres appliqués sont trop restrictifs</li>
                    <li>Un problème de synchronisation s'est produit</li>
                </ul>
                <button class="btn btn-primary" onclick="pageManagerGmail.loadPage('scanner')">
                    <i class="fas fa-sync-alt"></i> Relancer un scan
                </button>
            </div>
        `;
    }

    renderExplanationNotice() {
        return `
            <div class="explanation-notice">
                <i class="fab fa-google"></i>
                <span>Emails Gmail ${this.syncState.startScanSynced ? 'synchronisés' : 'disponibles'}. Cliquez pour sélectionner et créer des tâches.</span>
                <button class="explanation-close" onclick="pageManagerGmail.hideExplanationMessage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselected = this.getTaskPreselectedCategories();
        console.log('[PageManagerGmail] 📌 Catégories pré-sélectionnées:', preselected);
        
        const tabs = [{ 
            id: 'all', 
            name: 'Tous', 
            icon: '📧', 
            count: totalEmails,
            isPreselected: false 
        }];
        
        // Ajouter les catégories actives
        Object.entries(categories).forEach(([catId, category]) => {
            if (catId === 'all') return;
            
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                const isPreselected = preselected.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected
                });
                
                if (isPreselected) {
                    console.log(`[PageManagerGmail] ⭐ Catégorie pré-sélectionnée: ${category.name} (${count} emails)`);
                }
            }
        });
        
        // Ajouter "Autre"
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
        
        // Diviser en lignes de 6 boutons maximum
        let tabsHTML = '';
        for (let i = 0; i < tabs.length; i += 6) {
            const rowTabs = tabs.slice(i, i + 6);
            tabsHTML += `<div class="category-row">`;
            tabsHTML += rowTabs.map(tab => {
                const isCurrentCategory = this.currentCategory === tab.id;
                const baseClasses = `category-tab ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}`;
                
                return `
                    <button class="${baseClasses}" 
                            onclick="pageManagerGmail.filterByCategory('${tab.id}')"
                            data-category-id="${tab.id}"
                            title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                        <span class="tab-icon">${tab.icon}</span>
                        <span class="tab-name">${tab.name}</span>
                        <span class="tab-count">${tab.count}</span>
                        ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                    </button>
                `;
            }).join('');
            tabsHTML += `</div>`;
        }
        
        return `
            <div class="category-filters-wrapper">
                <div class="category-filters" id="categoryFilters">
                    ${tabsHTML}
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU DES EMAILS
    // ================================================
    renderEmailsList() {
        const emails = this.getFilteredEmails();
        
        if (emails.length === 0) {
            return `
                <div class="no-emails-message">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun email dans cette catégorie</p>
                </div>
            `;
        }

        if (this.currentViewMode === 'flat') {
            return `
                <div class="emails-list flat-view">
                    ${emails.map(email => this.renderEmailCard(email)).join('')}
                </div>
            `;
        }
        
        return this.renderGroupedView(emails);
    }

    getFilteredEmails() {
        let emails = this.getAllEmails();
        
        // Filtrer par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            emails = emails.filter(email => 
                this.currentCategory === 'other' 
                    ? (!email.category || email.category === 'other')
                    : email.category === this.currentCategory
            );
        }
        
        // Filtrer par recherche
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            emails = emails.filter(email => 
                (email.subject || '').toLowerCase().includes(search) ||
                (email.from?.emailAddress?.name || '').toLowerCase().includes(search) ||
                (email.from?.emailAddress?.address || '').toLowerCase().includes(search) ||
                (email.bodyPreview || '').toLowerCase().includes(search)
            );
        }
        
        return emails;
    }

    renderEmailCard(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const isPreselected = this.getTaskPreselectedCategories().includes(email.category);
        const isSelected = this.selectedEmails.has(email.id);
        
        // Auto-sélectionner les emails pré-sélectionnés au premier rendu
        if (isPreselected && !this.selectedEmails.has(email.id) && !hasTask) {
            this.selectedEmails.add(email.id);
        }
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${isPreselected ? 'preselected' : ''}" 
                 data-email-id="${email.id}">
                
                <div class="email-checkbox-wrapper">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           id="checkbox-${email.id}"
                           ${isSelected ? 'checked' : ''}
                           ${hasTask ? 'disabled' : ''}
                           onchange="event.stopPropagation(); pageManagerGmail.toggleEmailSelection('${email.id}')">
                    <label for="checkbox-${email.id}" class="checkbox-label"></label>
                </div>
                
                <div class="email-main" onclick="pageManagerGmail.handleEmailClick(event, '${email.id}')">
                    <div class="email-sender-section">
                        <div class="sender-avatar" style="background: ${this.generateAvatarColor(senderEmail)}">
                            ${senderName.charAt(0).toUpperCase()}
                        </div>
                        <div class="sender-info">
                            <div class="sender-name">${this.escapeHtml(senderName)}</div>
                            <div class="sender-email">${this.escapeHtml(senderEmail)}</div>
                        </div>
                    </div>
                    
                    <div class="email-content-section">
                        <div class="email-subject">
                            ${this.escapeHtml(email.subject || 'Sans sujet')}
                            ${email.hasAttachments ? '<i class="fas fa-paperclip attachment-icon"></i>' : ''}
                        </div>
                        <div class="email-preview">${this.escapeHtml(email.bodyPreview || '')}</div>
                        <div class="email-meta">
                            <span class="email-date">
                                <i class="far fa-clock"></i>
                                ${this.formatDate(email.receivedDateTime)}
                            </span>
                            ${email.category && email.category !== 'other' ? `
                                <span class="email-category" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                    ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                </span>
                            ` : ''}
                            ${isPreselected ? '<span class="preselected-badge"><i class="fas fa-star"></i> Pré-sélectionné</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="email-actions">
                    ${hasTask ? `
                        <button class="email-action-btn task-created" onclick="event.stopPropagation(); pageManagerGmail.openCreatedTask('${email.id}')" title="Voir la tâche">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : `
                        <button class="email-action-btn create-task" onclick="event.stopPropagation(); pageManagerGmail.showTaskCreationModal('${email.id}')" title="Créer une tâche">
                            <i class="fas fa-plus-circle"></i>
                        </button>
                    `}
                    <button class="email-action-btn view-email" onclick="event.stopPropagation(); pageManagerGmail.showEmailModal('${email.id}')" title="Voir l'email">
                        <i class="fas fa-envelope-open"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderGroupedView(emails) {
        const groups = this.createEmailGroups(emails);
        
        return `
            <div class="emails-list grouped-view">
                ${groups.map(group => `
                    <div class="email-group" data-group-key="${group.key}">
                        <div class="group-header" onclick="pageManagerGmail.toggleGroup('${group.key}')">
                            <div class="group-avatar" style="background: ${this.generateColor(group.name)}">
                                ${this.currentViewMode === 'grouped-domain' ? 
                                    '<i class="fas fa-globe"></i>' : 
                                    group.name.charAt(0).toUpperCase()
                                }
                            </div>
                            <div class="group-info">
                                <div class="group-name">${group.name}</div>
                                <div class="group-meta">${group.count} emails • ${this.formatDate(group.latestDate)}</div>
                            </div>
                            <i class="fas fa-chevron-down group-toggle"></i>
                        </div>
                        <div class="group-emails" style="display: none;">
                            ${group.emails.map(email => this.renderEmailCard(email)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createEmailGroups(emails) {
        const groups = {};
        
        emails.forEach(email => {
            const key = this.currentViewMode === 'grouped-domain' 
                ? email.from?.emailAddress?.address?.split('@')[1] || 'unknown'
                : email.from?.emailAddress?.address || 'unknown';
            
            const name = this.currentViewMode === 'grouped-domain'
                ? `@${key}`
                : email.from?.emailAddress?.name || key;
            
            if (!groups[key]) {
                groups[key] = { key, name, emails: [], count: 0, latestDate: null };
            }
            
            groups[key].emails.push(email);
            groups[key].count++;
            
            const date = new Date(email.receivedDateTime);
            if (!groups[key].latestDate || date > groups[key].latestDate) {
                groups[key].latestDate = date;
            }
        });
        
        return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
    }

    // ================================================
    // MODAL D'AFFICHAGE D'EMAIL COMPLET
    // ================================================
    async showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        const fullContent = await this.getFullEmailContent(email);
        
        const modal = document.createElement('div');
        modal.className = 'email-modal-overlay';
        modal.innerHTML = `
            <div class="email-modal">
                <div class="email-modal-header">
                    <h2><i class="fab fa-google"></i> Email Gmail</h2>
                    <button class="modal-close" onclick="this.closest('.email-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="email-modal-content">
                    <div class="email-details">
                        <div class="detail-row">
                            <span class="detail-label">De:</span>
                            <span class="detail-value">${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Sujet:</span>
                            <span class="detail-value">${email.subject || 'Sans sujet'}</span>
                        </div>
                        ${email.category ? `
                            <div class="detail-row">
                                <span class="detail-label">Catégorie:</span>
                                <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                    ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="email-body">
                        ${fullContent}
                    </div>
                </div>
                <div class="email-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.email-modal-overlay').remove()">
                        Fermer
                    </button>
                    ${!this.createdTasks.has(emailId) ? `
                        <button class="btn btn-primary" onclick="document.querySelector('.email-modal-overlay').remove(); pageManagerGmail.showTaskCreationModal('${emailId}')">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async getFullEmailContent(email) {
        if (this.emailContentCache.has(email.id)) {
            return this.emailContentCache.get(email.id);
        }
        
        let content = email.bodyPreview || 'Aucun contenu disponible';
        
        if (email.body?.content) {
            content = email.body.content;
        } else if (email.body?.contentType === 'html' && email.body?.content) {
            content = email.body.content;
        } else if (email.uniqueBody?.content) {
            content = email.uniqueBody.content;
        } else if (email.bodyHtml) {
            content = email.bodyHtml;
        } else if (email.bodyText) {
            content = `<pre>${this.escapeHtml(email.bodyText)}</pre>`;
        }
        
        content = this.sanitizeEmailContent(content);
        this.emailContentCache.set(email.id, content);
        
        return content;
    }

    sanitizeEmailContent(content) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        temp.querySelectorAll('script, link[rel="stylesheet"], style').forEach(el => el.remove());
        
        // Améliorer la détection des liens de désabonnement
        temp.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Détecter les liens de désabonnement et les styliser
            const linkText = link.textContent.toLowerCase();
            const linkHref = link.href?.toLowerCase() || '';
            
            if (linkText.includes('désabonner') || linkText.includes('unsubscribe') || 
                linkText.includes('se désabonner') || linkText.includes('stop') ||
                linkHref.includes('unsubscribe') || linkHref.includes('optout') || 
                linkHref.includes('stop') || linkHref.includes('preferences')) {
                
                link.style.cssText = `
                    display: inline-block;
                    padding: 6px 12px;
                    margin: 4px 0;
                    background: #f8f9fa;
                    color: #5f6368;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 12px;
                    border: 1px solid #dadce0;
                    transition: all 0.2s;
                `;
                
                link.onmouseover = function() {
                    this.style.background = '#e8eaed';
                    this.style.borderColor = '#5f6368';
                };
                
                link.onmouseout = function() {
                    this.style.background = '#f8f9fa';
                    this.style.borderColor = '#dadce0';
                };
            }
        });
        
        temp.querySelectorAll('img').forEach(img => {
            img.classList.add('email-image');
            img.onerror = function() {
                this.style.display = 'none';
            };
            if (!img.style.maxWidth) {
                img.style.maxWidth = '100%';
            }
            img.style.height = 'auto';
        });
        
        return `<div class="email-content-wrapper">${temp.innerHTML}</div>`;
    }

    // ================================================
    // ACTIONS SUR LES EMAILS
    // ================================================
    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const count = this.selectedEmails.size;
        const selectionInfo = document.querySelector('.selection-info');
        const createBtn = document.querySelector('.btn-create-tasks');
        const clearBtn = document.querySelector('.btn-clear-selection');
        
        if (selectionInfo) {
            selectionInfo.innerHTML = count > 0 ? 
                `<span class="selected-count">${count} sélectionné${count > 1 ? 's' : ''}</span>` : '';
        }
        
        if (createBtn) {
            createBtn.classList.toggle('disabled', count === 0);
            createBtn.disabled = count === 0;
        }
        
        if (clearBtn) {
            clearBtn.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    clearSelection() {
        this.selectedEmails.clear();
        document.querySelectorAll('.email-checkbox:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.email-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateSelectionInfo();
        this.showToast('Sélection effacée', 'info');
    }

    refreshEmailsView() {
        console.log('[PageManagerGmail] 🔄 Rafraîchissement de la vue emails...');
        const container = document.querySelector('.emails-list-container');
        if (container) {
            container.innerHTML = this.renderEmailsList();
        }
        this.updateSelectionInfo();
    }

    async refreshEmails() {
        this.showLoading('Actualisation...');
        
        try {
            await this.fetchEmailsFromMailService();
            
            if (window.emailScanner?.recategorizeEmails) {
                await window.emailScanner.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            this.showToast('Emails actualisés', 'success');
        } catch (error) {
            this.hideLoading();
            this.showToast('Erreur d\'actualisation', 'error');
        }
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            this.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        this.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                const taskData = await this.buildTaskData(email);
                if (window.taskManager) {
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    if (task) {
                        this.createdTasks.set(emailId, task.id);
                        created++;
                    }
                }
            } catch (error) {
                console.error('[PageManagerGmail] Erreur création tâche:', error);
            }
        }
        
        this.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks?.();
            this.showToast(`${created} tâche${created > 1 ? 's créées' : ' créée'}`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async buildTaskData(email) {
        let analysis = this.aiAnalysisResults.get(email.id);
        
        if (!analysis && window.aiTaskAnalyzer) {
            try {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(email.id, analysis);
            } catch (e) {}
        }
        
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        return {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: analysis?.mainTask?.title || `Email de ${senderName}`,
            description: analysis?.mainTask?.description || email.bodyPreview || '',
            priority: analysis?.mainTask?.priority || 'medium',
            dueDate: analysis?.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: !!analysis,
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            provider: 'gmail'
        };
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        let analysis;
        try {
            this.showLoading('Analyse de l\'email...');
            if (window.aiTaskAnalyzer) {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(emailId, analysis);
            }
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
        }

        const modal = document.createElement('div');
        modal.className = 'task-modal-overlay';
        modal.innerHTML = `
            <div class="task-modal">
                <div class="task-modal-header">
                    <h2>✅ Créer une tâche</h2>
                    <button class="modal-close" onclick="this.closest('.task-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="task-modal-content">
                    ${analysis ? `
                        <div class="ai-badge">
                            <i class="fas fa-robot"></i>
                            <span>✨ Analyse intelligente par Claude AI</span>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>📝 Titre</label>
                        <input type="text" id="task-title" value="${analysis?.mainTask?.title || `Email de ${email.from?.emailAddress?.name || 'Inconnu'}`}" />
                    </div>
                    
                    <div class="form-group">
                        <label>📄 Description</label>
                        <textarea id="task-description" rows="4">${analysis?.mainTask?.description || email.bodyPreview || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>⚡ Priorité</label>
                            <select id="task-priority">
                                <option value="urgent" ${analysis?.mainTask?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                <option value="high" ${analysis?.mainTask?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${!analysis?.mainTask?.priority || analysis?.mainTask?.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${analysis?.mainTask?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>📅 Échéance</label>
                            <input type="date" id="task-duedate" value="${analysis?.mainTask?.dueDate || ''}" />
                        </div>
                    </div>
                </div>
                <div class="task-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.task-modal-overlay').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" onclick="pageManagerGmail.createTaskFromModal('${email.id}')">
                        <i class="fas fa-check"></i> Créer la tâche
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        const taskData = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: document.getElementById('task-title')?.value,
            description: document.getElementById('task-description')?.value,
            priority: document.getElementById('task-priority')?.value,
            dueDate: document.getElementById('task-duedate')?.value,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            provider: 'gmail'
        };

        if (!taskData.title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks?.();
                this.showToast('Tâche créée avec succès', 'success');
                document.querySelector('.task-modal-overlay')?.remove();
                this.refreshEmailsView();
            }
        } catch (error) {
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    // ================================================
    // AUTRES ACTIONS
    // ================================================
    async openGoogleCalendar(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const senderEmail = email.from?.emailAddress?.address;
        const calendarUrl = `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(senderEmail)}`;
        window.open(calendarUrl, '_blank');
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => window.tasksView?.showTaskDetails?.(taskId), 100);
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    handleEmailClick(event, emailId) {
        if (event.target.closest('.email-actions') || 
            event.target.closest('.email-checkbox-wrapper') ||
            event.target.type === 'checkbox') {
            return;
        }
        this.showEmailModal(emailId);
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-emails');
        const icon = group.querySelector('.group-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            content.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.categoryId === categoryId);
        });
    }

    changeViewMode(mode) {
        console.log('[PageManagerGmail] 🔄 Changement de vue:', mode);
        this.currentViewMode = mode;
        
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.view-mode-btn[onclick*="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.refreshEmailsView();
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        document.querySelector('.explanation-notice')?.remove();
    }

    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim();
                    this.refreshEmailsView();
                }, 300);
            });
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const input = document.getElementById('emailSearchInput');
        if (input) input.value = '';
        this.refreshEmailsView();
    }

    async analyzeEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('[PageManagerGmail] Erreur analyse:', error);
                }
            }
        }
    }

    calculateCategoryCounts(emails) {
        console.log('[PageManagerGmail] 📊 Calcul des comptages de catégories...');
        
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
            console.log(`[PageManagerGmail] 📌 ${uncategorizedCount} emails dans la catégorie "Autre"`);
        }
        
        console.log('[PageManagerGmail] 📊 Comptages finaux:', counts);
        
        return counts;
    }

    getEmailById(emailId) {
        return this.getAllEmails().find(email => email.id === emailId);
    }

    getCategoryColor(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const category = this.getCategories()[categoryId];
        return category?.name || categoryId || 'Autre';
    }

    generateColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 65%, 45%), hsl(${(hue + 30) % 360}, 65%, 55%))`;
    }

    generateAvatarColor(email) {
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 30) % 360}, 70%, 60%))`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // ================================================
    // MÉTHODES SYSTÈME
    // ================================================
    renderAuthRequired() {
        return `
            <div class="auth-required-state">
                <div class="auth-icon"><i class="fas fa-lock"></i></div>
                <h3>Authentification requise</h3>
                <p>Connectez-vous pour accéder à vos emails Gmail</p>
                <button class="btn btn-primary" onclick="pageManagerGmail.handleLogin()">
                    <i class="fab fa-google"></i> Se connecter avec Gmail
                </button>
            </div>
        `;
    }

    async handleLogin() {
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else {
                window.location.href = '/auth.html';
            }
        } catch (error) {
            this.showError('Erreur de connexion: ' + error.message);
        }
    }

    renderEmptyState() {
        if (this.searchTerm) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                    <h3>Aucun résultat</h3>
                    <p>Aucun email ne correspond à "${this.searchTerm}"</p>
                    <button class="btn btn-primary" onclick="pageManagerGmail.clearSearch()">
                        <i class="fas fa-undo"></i> Effacer la recherche
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fab fa-google"></i></div>
                <h3>Aucun email Gmail</h3>
                <p>Utilisez le scanner pour récupérer vos emails</p>
                <button class="btn btn-primary" onclick="pageManagerGmail.loadPage('scanner')">
                    <i class="fas fa-search"></i> Scanner
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    showPageContent() {
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        if (container) {
            container.style.display = 'block';
            container.style.opacity = '1';
        }
    }

    showLoading(message = 'Chargement...') {
        window.uiManager?.showLoading?.(message) || console.log(`Loading: ${message}`);
    }

    hideLoading() {
        window.uiManager?.hideLoading?.();
    }

    showError(message) {
        window.uiManager?.showToast?.(message, 'error') || console.error(message);
    }

    showToast(message, type = 'info') {
        window.uiManager?.showToast?.(message, type) || console.log(`${type}: ${message}`);
    }

    // ================================================
    // STYLES CSS (Design moderne Gmail)
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('emailsPageStylesGmail')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailsPageStylesGmail';
        styles.textContent = `
            /* Base styles - Moderne comme PageManager */
            .emails-page-gmail {
                background: #f8fafc;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                padding: 16px;
            }

            /* Header moderne */
            .email-page-header {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin-bottom: 16px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                overflow: hidden;
            }

            .header-top {
                padding: 20px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #f0f0f0;
            }

            .page-title {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .page-title i {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 28px;
            }

            .email-count {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 700;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
            }

            /* View mode selector moderne */
            .view-mode-selector {
                display: flex;
                gap: 2px;
                background: #f8fafc;
                padding: 4px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .view-mode-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .view-mode-btn:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }

            .view-mode-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            /* Search bar moderne */
            .search-bar-container {
                padding: 16px 24px;
                background: #f8fafc;
            }

            .search-wrapper {
                position: relative;
                max-width: 720px;
                margin: 0 auto;
            }

            .search-wrapper i {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
                font-size: 16px;
            }

            .search-input {
                width: 100%;
                height: 44px;
                padding: 0 48px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 14px;
                background: #f9fafb;
                transition: all 0.2s ease;
            }

            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                outline: none;
            }

            .clear-search {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                width: 28px;
                height: 28px;
                border: none;
                background: #ef4444;
                color: white;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 12px;
            }

            .clear-search:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }

            /* Category tabs modernes */
            .category-tabs-container {
                padding: 16px 24px;
                background: white;
            }

            .category-filters-wrapper {
                max-width: 1200px;
                margin: 0 auto;
            }

            .category-filters {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .category-row {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 6px;
            }

            .category-tab {
                height: 56px;
                padding: 0;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                font-size: 12px;
            }

            .category-tab .tab-icon {
                font-size: 18px;
                line-height: 1;
            }

            .category-tab .tab-name {
                font-size: 12px;
                font-weight: 700;
                color: #1f2937;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 90%;
                padding: 0 4px;
            }

            .category-tab .tab-count {
                position: absolute;
                top: 3px;
                right: 3px;
                background: #3b82f6;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 5px;
                border-radius: 8px;
                min-width: 18px;
                text-align: center;
                line-height: 1.2;
            }

            .category-tab.preselected {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
            }

            .category-tab.preselected .tab-count {
                background: #8b5cf6;
            }

            .category-tab:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(59, 130, 246, 0.15);
            }

            .category-tab.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
            }

            .category-tab.active .tab-name,
            .category-tab.active .tab-icon {
                color: white;
            }

            .category-tab.active .tab-count {
                background: rgba(255, 255, 255, 0.2);
            }

            .preselected-star {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 18px;
                height: 18px;
                background: #8b5cf6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(139, 92, 246, 0.4);
            }

            /* Action bar moderne */
            .action-bar {
                padding: 12px 24px;
                background: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .selection-info {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }

            .selected-count {
                font-weight: 700;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .action-buttons {
                display: flex;
                gap: 8px;
            }

            .btn-action {
                height: 44px;
                padding: 0 16px;
                border: 1px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .btn-action:hover:not(.disabled) {
                background: #f9fafb;
                border-color: #6366f1;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .btn-create-tasks {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn-create-tasks:hover:not(.disabled) {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn-clear-selection {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }

            .btn-clear-selection:hover {
                background: #fee2e2;
                border-color: #ef4444;
            }

            /* Emails list moderne */
            .emails-list-container {
                padding: 0;
            }

            .emails-list {
                background: transparent;
                border-radius: 0;
                overflow: visible;
                box-shadow: none;
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* Email card moderne */
            .email-card {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: 80px;
                border-bottom: none;
            }

            .email-card:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            .email-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .email-card + .email-card {
                border-top: 1px solid #e5e7eb;
            }

            .email-card:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 2;
            }

            .email-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }

            .email-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }

            .email-card.preselected {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid #8b5cf6;
                border-color: rgba(139, 92, 246, 0.3);
            }

            /* Checkbox moderne */
            .email-checkbox-wrapper {
                margin-right: 12px;
                position: relative;
            }

            .email-checkbox {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }

            .checkbox-label {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                display: block;
                position: relative;
                cursor: pointer;
                transition: all 0.2s ease;
                background: white;
            }

            .email-checkbox:checked + .checkbox-label {
                background: #6366f1;
                border-color: #6366f1;
            }

            .email-checkbox:checked + .checkbox-label::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: 700;
            }

            .email-card.preselected .email-checkbox:checked + .checkbox-label {
                background: #8b5cf6;
                border-color: #8b5cf6;
            }

            /* Email main content */
            .email-main {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 0;
            }

            /* Sender section moderne */
            .email-sender-section {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
                width: 240px;
            }

            .sender-avatar {
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

            .sender-info {
                min-width: 0;
                flex: 1;
            }

            .sender-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .sender-email {
                font-size: 12px;
                color: #6b7280;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* Email content section */
            .email-content-section {
                flex: 1;
                min-width: 0;
            }

            .email-subject {
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 15px;
            }

            .attachment-icon {
                color: #ef4444;
                font-size: 14px;
                flex-shrink: 0;
            }

            .email-preview {
                font-size: 13px;
                color: #6b7280;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 4px;
                font-weight: 500;
            }

            .email-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
                color: #6b7280;
                flex-wrap: wrap;
            }

            .email-date {
                display: flex;
                align-items: center;
                gap: 3px;
                background: #f8fafc;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
            }

            .email-category {
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
            }

            .preselected-badge {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
            }

            /* Email actions modernes */
            .email-actions {
                display: flex;
                gap: 4px;
                margin-left: 12px;
                opacity: 0;
                transition: opacity 0.2s;
                flex-shrink: 0;
            }

            .email-card:hover .email-actions {
                opacity: 1;
            }

            .email-action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 14px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }

            .email-action-btn:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .email-action-btn.create-task {
                color: #3b82f6;
            }

            .email-action-btn.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }

            .email-action-btn.task-created {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .email-action-btn.view-email {
                color: #6366f1;
            }

            .email-action-btn.view-email:hover {
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                border-color: #6366f1;
                color: #4338ca;
            }

            /* Grouped view moderne */
            .email-group {
                margin-bottom: 16px;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
            }

            .group-header {
                padding: 16px 24px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease;
            }

            .group-header:hover {
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            }

            .group-avatar {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .group-info {
                flex: 1;
            }

            .group-name {
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 2px;
                font-size: 16px;
            }

            .group-meta {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
            }

            .group-toggle {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: white;
                border: 2px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6b7280;
                transition: all 0.3s ease;
            }

            .group-header:hover .group-toggle {
                border-color: #6366f1;
                color: #6366f1;
            }

            .group-emails {
                border-top: 1px solid #f0f0f0;
            }

            /* Empty states moderne */
            .no-emails-message,
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .no-emails-message i,
            .empty-state-icon {
                font-size: 48px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
            }

            .empty-state {
                margin: 20px auto;
                max-width: 400px;
            }

            .empty-state h3 {
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .empty-state p {
                margin-bottom: 20px;
                color: #6b7280;
                font-weight: 500;
            }

            /* Modal styles modernes */
            .email-modal-overlay,
            .task-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.75);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(4px);
            }

            .email-modal,
            .task-modal {
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 24px 48px rgba(0,0,0,0.3);
            }

            .email-modal-header,
            .task-modal-header {
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .email-modal-header h2,
            .task-modal-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .modal-close {
                width: 32px;
                height: 32px;
                border: none;
                background: none;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 24px;
            }

            .modal-close:hover {
                background: #f3f4f6;
            }

            .email-modal-content,
            .task-modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .email-details {
                margin-bottom: 24px;
            }

            .detail-row {
                display: flex;
                margin-bottom: 12px;
            }

            .detail-label {
                font-weight: 600;
                color: #374151;
                margin-right: 12px;
                min-width: 80px;
            }

            .detail-value {
                color: #6b7280;
                flex: 1;
            }

            .category-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }

            .email-body {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                line-height: 1.6;
                color: #374151;
            }

            .email-content-wrapper {
                max-width: 100%;
                overflow-x: auto;
            }

            .email-content-wrapper img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 8px 0;
            }

            .email-modal-footer,
            .task-modal-footer {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            /* Forms modernes */
            .ai-badge {
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                border: 1px solid #0ea5e9;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                color: #0c4a6e;
                font-weight: 600;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                transition: all 0.2s;
                background: #f9fafb;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Buttons modernes */
            .btn {
                padding: 12px 20px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn:hover {
                background: #f3f4f6;
            }

            .btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #4b5563;
                border: 1px solid #d1d5db;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            /* Notification moderne */
            .explanation-notice {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 0 0 12px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #1e40af;
                font-size: 13px;
                font-weight: 500;
            }

            .explanation-close {
                margin-left: auto;
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
                transition: all 0.2s;
            }

            .explanation-close:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }

            /* Auth state moderne */
            .auth-required-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 16px;
                margin: 20px auto;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .auth-icon {
                font-size: 48px;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .auth-required-state h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 12px;
            }

            .auth-required-state p {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 24px;
                font-weight: 500;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .category-row {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            @media (max-width: 768px) {
                .email-sender-section {
                    width: auto;
                    flex: 0 0 auto;
                }

                .sender-info {
                    display: none;
                }

                .email-main {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .email-content-section {
                    width: 100%;
                }

                .email-actions {
                    opacity: 1;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .category-row {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 480px) {
                .header-top {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .page-title {
                    font-size: 20px;
                }

                .category-row {
                    grid-template-columns: repeat(2, 1fr);
                }

                .action-buttons {
                    flex-wrap: wrap;
                }

                .email-card {
                    padding: 12px 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
                color: #202124;
                flex: 1;
            }

            .email-body {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                line-height: 1.6;
                color: #202124;
            }

            .email-content-wrapper {
                max-width: 100%;
                overflow-x: auto;
            }

            .email-content-wrapper img {
                max-width: 100%;
                height: auto;
            }

            .email-modal-footer,
            .task-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            /* Forms */
            .ai-badge {
                background: #e3f2fd;
                border-radius: 8px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 20px;
                color: #1565c0;
                font-size: 14px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                font-weight: 500;
                color: #202124;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
                transition: border-color 0.2s;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #1a73e8;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Buttons */
            .btn {
                padding: 8px 24px;
                border: 1px solid #dadce0;
                background: white;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                color: #1a73e8;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn:hover {
                background: #f8f9fa;
            }

            .btn-primary {
                background: #1a73e8;
                color: white;
                border-color: #1a73e8;
            }

            .btn-primary:hover {
                background: #1557b0;
                border-color: #1557b0;
            }

            .btn-secondary {
                color: #5f6368;
            }

            /* Notification */
            .explanation-notice {
                background: #e8f0fe;
                border: 1px solid #d2e2fc;
                border-radius: 8px;
                padding: 12px 16px;
                margin: 16px 24px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                color: #1967d2;
            }

            .explanation-close {
                margin-left: auto;
                width: 28px;
                height: 28px;
                border: none;
                background: transparent;
                color: #1967d2;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .explanation-close:hover {
                background: rgba(0,0,0,0.05);
            }

            /* Auth state */
            .auth-required-state {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border-radius: 8px;
                margin: 20px auto;
                max-width: 400px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            }

            .auth-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #4285f4;
            }

            .auth-required-state h3 {
                font-size: 24px;
                font-weight: 400;
                color: #202124;
                margin-bottom: 12px;
            }

            .auth-required-state p {
                font-size: 16px;
                color: #5f6368;
                margin-bottom: 24px;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .category-row {
                    flex-wrap: wrap;
                }
                
                .category-tab {
                    min-width: calc(33.333% - 5.33px);
                }
            }

            @media (max-width: 768px) {
                .email-sender-section {
                    width: auto;
                    flex: 0 0 auto;
                }

                .sender-info {
                    display: none;
                }

                .email-main {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .email-content-section {
                    width: 100%;
                }

                .email-actions {
                    opacity: 1;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .category-tab {
                    min-width: calc(50% - 4px);
                }
            }

            @media (max-width: 480px) {
                .header-top {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .page-title {
                    font-size: 20px;
                }

                .category-tab {
                    min-width: 100%;
                }

                .action-buttons {
                    flex-wrap: wrap;
                }

                .email-card {
                    padding: 12px 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // CLEANUP
    // ================================================
    cleanup() {
        this.invalidateTaskCategoriesCache();
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        this.emailContentCache.clear();
        this.emailsCache = [];
        console.log('[PageManagerGmail] 🧹 Nettoyage effectué');
    }

    // ================================================
    // DEBUG METHODS
    // ================================================
    getDebugInfo() {
        return {
            version: '19.0',
            isInitialized: this.isInitialized,
            currentPage: this.currentPage,
            syncState: this.syncState,
            emailsInCache: this.emailsCache.length,
            emailsFromScanner: this.getAllEmails().length,
            selectedEmails: this.selectedEmails.size,
            createdTasks: this.createdTasks.size,
            currentCategory: this.currentCategory,
            currentViewMode: this.currentViewMode,
            searchTerm: this.searchTerm,
            providers: {
                googleAuth: !!window.googleAuthService,
                mailService: !!window.mailService,
                emailScanner: !!window.emailScanner,
                categoryManager: !!window.categoryManager,
                taskManager: !!window.taskManager
            }
        };
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
(function() {
    // Nettoyer l'ancienne instance si elle existe
    if (window.pageManagerGmail) {
        window.pageManagerGmail.cleanup?.();
    }

    window.pageManagerGmail = new PageManagerGmail();

    // Bind des méthodes
    Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
            window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
        }
    });

    // Fonction de debug globale
    window.debugPageManagerGmail = function() {
        console.group('🔍 Debug PageManagerGmail');
        console.log(window.pageManagerGmail.getDebugInfo());
        console.groupEnd();
    };

    console.log('✅ PageManagerGmail v19.0 loaded - Corrigé et Optimisé');
    console.log('💡 Utilisez window.debugPageManagerGmail() pour déboguer');
})();
