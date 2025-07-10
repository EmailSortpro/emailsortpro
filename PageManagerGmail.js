// PageManagerGmail.js - Version 20.0 - Gestionnaire Gmail Optimisé

console.log('[PageManagerGmail] 🚀 Loading v20.0 - Optimized Gmail Manager...');

class PageManagerGmail {
    constructor() {
        this.currentPage = null;
        this.emails = [];
        this.selectedEmails = new Set();
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.isInitialized = false;
        
        console.log('[PageManagerGmail] ✅ Initialized');
        this.init();
    }

    async init() {
        try {
            // Vérifier l'authentification Google
            await this.checkAuthentication();
            
            // Charger les emails depuis la session si disponibles
            this.loadEmailsFromSession();
            
            // S'abonner aux événements
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Ready');
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Init error:', error);
        }
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async checkAuthentication() {
        if (window.googleAuthService?.isAuthenticated) {
            const isAuth = await window.googleAuthService.isAuthenticated();
            console.log('[PageManagerGmail] 🔐 Google Auth:', isAuth ? 'Connecté' : 'Non connecté');
            return isAuth;
        }
        return false;
    }

    // ================================================
    // CHARGEMENT DES EMAILS
    // ================================================
    loadEmailsFromSession() {
        try {
            // Depuis EmailScanner
            if (window.emailScanner?.emails) {
                this.emails = window.emailScanner.emails.filter(e => 
                    !e.provider || e.provider === 'google' || e.provider === 'gmail'
                );
                console.log(`[PageManagerGmail] ✅ ${this.emails.length} emails Gmail chargés depuis EmailScanner`);
                return;
            }
            
            // Depuis sessionStorage
            const scanResults = sessionStorage.getItem('scanResults');
            if (scanResults) {
                const data = JSON.parse(scanResults);
                if (data.provider === 'google' || data.provider === 'gmail') {
                    console.log('[PageManagerGmail] 📥 Résultats de scan Gmail trouvés');
                }
            }
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur chargement emails:', error);
        }
    }

    async fetchEmails() {
        console.log('[PageManagerGmail] 📧 Récupération des emails...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }

        try {
            // S'assurer que MailService est sur Google
            const provider = window.mailService.getCurrentProvider();
            if (provider !== 'google') {
                console.warn('[PageManagerGmail] ⚠️ MailService pas sur Google');
                return;
            }
            
            // Récupérer les emails
            this.emails = await window.mailService.getMessages('INBOX', {
                maxResults: 500
            });
            
            console.log(`[PageManagerGmail] ✅ ${this.emails.length} emails récupérés`);
            
            // Catégoriser si nécessaire
            if (window.categoryManager) {
                await this.categorizeEmails();
            }
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur récupération:', error);
            throw error;
        }
    }

    async categorizeEmails() {
        console.log('[PageManagerGmail] 🏷️ Catégorisation des emails...');
        
        if (!window.categoryManager?.analyzeEmail) {
            console.warn('[PageManagerGmail] ⚠️ CategoryManager non disponible');
            return;
        }

        let count = 0;
        for (const email of this.emails) {
            if (!email.category) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.isPreselectedForTasks = this.isPreselectedCategory(email.category);
                    count++;
                } catch (error) {
                    email.category = 'other';
                }
            }
        }
        
        console.log(`[PageManagerGmail] ✅ ${count} emails catégorisés`);
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        // Scan complété
        window.addEventListener('scanCompleted', (e) => {
            if (e.detail?.provider === 'google' || e.detail?.provider === 'gmail') {
                console.log('[PageManagerGmail] 📨 Scan Gmail terminé');
                this.loadEmailsFromSession();
                if (this.currentPage === 'emails') {
                    this.refreshView();
                }
            }
        });
        
        // Emails recatégorisés
        window.addEventListener('emailsRecategorized', () => {
            if (this.currentPage === 'emails') {
                this.refreshView();
            }
        });
    }

    // ================================================
    // NAVIGATION
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManagerGmail] 📄 Loading page: ${pageName}`);
        
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        
        if (!container) {
            console.error('[PageManagerGmail] ❌ Container non trouvé');
            return;
        }

        try {
            this.currentPage = pageName;
            
            switch (pageName) {
                case 'emails':
                    await this.renderEmailsPage(container);
                    break;
                    
                case 'scanner':
                    if (window.minimalScanModule) {
                        await window.minimalScanModule.render(container);
                    }
                    break;
                    
                default:
                    container.innerHTML = `
                        <div class="empty-page">
                            <h2>Page ${pageName} non disponible</h2>
                        </div>
                    `;
            }
            
            this.updateNavigation(pageName);
            
        } catch (error) {
            console.error(`[PageManagerGmail] ❌ Erreur chargement ${pageName}:`, error);
            this.showError(container, error.message);
        }
    }

    // ================================================
    // PAGE EMAILS
    // ================================================
    async renderEmailsPage(container) {
        console.log('[PageManagerGmail] 🎨 Rendu page emails...');
        
        // Vérifier l'authentification
        const isAuth = await this.checkAuthentication();
        if (!isAuth) {
            this.renderAuthRequired(container);
            return;
        }
        
        // Charger les emails si nécessaire
        if (this.emails.length === 0) {
            try {
                await this.fetchEmails();
            } catch (error) {
                console.log('[PageManagerGmail] ⚠️ Pas d\'emails disponibles');
            }
        }
        
        // Rendre la page
        container.innerHTML = this.buildEmailsHTML();
        
        // Ajouter les styles
        this.addStyles();
        
        // Setup interactions
        this.setupEmailsInteractions();
    }

    buildEmailsHTML() {
        const filteredEmails = this.getFilteredEmails();
        const categories = this.getCategories();
        const stats = this.calculateStats();
        
        return `
            <div class="gmail-page">
                <!-- Header -->
                <div class="gmail-header">
                    <div class="header-main">
                        <h1 class="page-title">
                            <i class="fab fa-google"></i>
                            <span>Gmail</span>
                            <span class="email-count">${this.emails.length}</span>
                        </h1>
                        <div class="header-actions">
                            <button class="btn-refresh" onclick="pageManagerGmail.refreshEmails()">
                                <i class="fas fa-sync"></i>
                                <span>Actualiser</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search -->
                    <div class="search-section">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="emailSearch"
                                   placeholder="Rechercher dans vos emails..." 
                                   value="${this.searchTerm}">
                            ${this.searchTerm ? `
                                <button class="clear-search" onclick="pageManagerGmail.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Categories -->
                    <div class="categories-section">
                        ${this.buildCategoriesHTML(stats)}
                    </div>
                    
                    <!-- Actions bar -->
                    ${this.selectedEmails.size > 0 ? `
                        <div class="actions-bar">
                            <span class="selection-info">
                                ${this.selectedEmails.size} sélectionné(s)
                            </span>
                            <button class="btn-action" onclick="pageManagerGmail.createTasks()">
                                <i class="fas fa-tasks"></i>
                                <span>Créer des tâches</span>
                            </button>
                            <button class="btn-action secondary" onclick="pageManagerGmail.clearSelection()">
                                <i class="fas fa-times"></i>
                                <span>Effacer</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Emails list -->
                <div class="emails-container">
                    ${filteredEmails.length > 0 ? `
                        <div class="emails-list">
                            ${filteredEmails.map(email => this.buildEmailCard(email)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>Aucun email</h3>
                            <p>${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Lancez un scan pour récupérer vos emails'}</p>
                            ${!this.searchTerm ? `
                                <button class="btn-primary" onclick="pageManagerGmail.loadPage('scanner')">
                                    <i class="fas fa-search"></i>
                                    <span>Scanner</span>
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    buildCategoriesHTML(stats) {
        const categories = [
            { id: 'all', name: 'Tous', icon: '📧', count: this.emails.length },
            ...Object.entries(stats).map(([id, count]) => ({
                id,
                name: this.getCategoryName(id),
                icon: this.getCategoryIcon(id),
                count,
                isPreselected: this.isPreselectedCategory(id)
            }))
        ].filter(cat => cat.count > 0);
        
        return `
            <div class="category-tabs">
                ${categories.map(cat => `
                    <button class="category-tab ${this.currentCategory === cat.id ? 'active' : ''} ${cat.isPreselected ? 'preselected' : ''}"
                            onclick="pageManagerGmail.filterByCategory('${cat.id}')">
                        <span class="tab-icon">${cat.icon}</span>
                        <span class="tab-name">${cat.name}</span>
                        <span class="tab-count">${cat.count}</span>
                        ${cat.isPreselected ? '<span class="star">⭐</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }

    buildEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const sender = email.from?.emailAddress || {};
        const date = new Date(email.receivedDateTime);
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''}" data-email-id="${email.id}">
                <div class="email-checkbox">
                    <input type="checkbox" 
                           id="check-${email.id}"
                           ${isSelected ? 'checked' : ''}
                           onchange="pageManagerGmail.toggleSelection('${email.id}')">
                    <label for="check-${email.id}"></label>
                </div>
                
                <div class="email-content" onclick="pageManagerGmail.showEmail('${email.id}')">
                    <div class="sender-info">
                        <div class="sender-avatar" style="background: ${this.getAvatarColor(sender.address)}">
                            ${(sender.name || sender.address || '?')[0].toUpperCase()}
                        </div>
                        <div class="sender-details">
                            <div class="sender-name">${sender.name || sender.address || 'Inconnu'}</div>
                            <div class="sender-email">${sender.address || ''}</div>
                        </div>
                    </div>
                    
                    <div class="email-info">
                        <div class="email-subject">
                            ${email.subject || 'Sans sujet'}
                            ${email.hasAttachments ? '<i class="fas fa-paperclip"></i>' : ''}
                        </div>
                        <div class="email-preview">${email.bodyPreview || ''}</div>
                        <div class="email-meta">
                            <span class="email-date">${this.formatDate(date)}</span>
                            ${email.category && email.category !== 'other' ? `
                                <span class="email-category" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                    ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="email-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); pageManagerGmail.createTaskFromEmail('${email.id}')" title="Créer une tâche">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // INTERACTIONS
    // ================================================
    setupEmailsInteractions() {
        // Recherche
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim();
                    this.refreshView();
                }, 300);
            });
        }
    }

    toggleSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.refreshView();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshView();
    }

    clearSearch() {
        this.searchTerm = '';
        this.refreshView();
    }

    async refreshEmails() {
        console.log('[PageManagerGmail] 🔄 Actualisation...');
        
        try {
            this.showLoading();
            await this.fetchEmails();
            this.refreshView();
            this.showToast('Emails actualisés', 'success');
        } catch (error) {
            this.showToast('Erreur actualisation', 'error');
        } finally {
            this.hideLoading();
        }
    }

    refreshView() {
        const container = document.getElementById('pageContent') || 
                         document.querySelector('.page-content');
        if (container && this.currentPage === 'emails') {
            this.renderEmailsPage(container);
        }
    }

    // ================================================
    // MODALS
    // ================================================
    async showEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal email-modal">
                <div class="modal-header">
                    <h2>Email Gmail</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="email-details">
                        <p><strong>De:</strong> ${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</p>
                        <p><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</p>
                        <p><strong>Sujet:</strong> ${email.subject || 'Sans sujet'}</p>
                    </div>
                    <div class="email-body">
                        ${email.bodyHtml || email.bodyText || email.bodyPreview || 'Aucun contenu'}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Fermer
                    </button>
                    <button class="btn-primary" onclick="pageManagerGmail.createTaskFromEmail('${emailId}'); this.closest('.modal-overlay').remove()">
                        <i class="fas fa-tasks"></i>
                        Créer une tâche
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async createTaskFromEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email || !window.taskManager) return;
        
        try {
            const task = {
                title: `Email: ${email.subject || 'Sans sujet'}`,
                description: email.bodyPreview || '',
                emailId: email.id,
                category: email.category || 'other',
                priority: 'medium',
                status: 'todo',
                createdAt: new Date().toISOString(),
                provider: 'gmail'
            };
            
            window.taskManager.createTaskFromEmail(task, email);
            this.showToast('Tâche créée', 'success');
            
        } catch (error) {
            this.showToast('Erreur création tâche', 'error');
        }
    }

    async createTasks() {
        if (this.selectedEmails.size === 0) return;
        
        let created = 0;
        for (const emailId of this.selectedEmails) {
            try {
                await this.createTaskFromEmail(emailId);
                created++;
            } catch (error) {
                console.error('[PageManagerGmail] Erreur création tâche:', error);
            }
        }
        
        this.clearSelection();
        this.showToast(`${created} tâche(s) créée(s)`, 'success');
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getFilteredEmails() {
        let emails = [...this.emails];
        
        // Filtre catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            emails = emails.filter(e => e.category === this.currentCategory);
        }
        
        // Filtre recherche
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            emails = emails.filter(e => 
                (e.subject || '').toLowerCase().includes(search) ||
                (e.from?.emailAddress?.name || '').toLowerCase().includes(search) ||
                (e.from?.emailAddress?.address || '').toLowerCase().includes(search) ||
                (e.bodyPreview || '').toLowerCase().includes(search)
            );
        }
        
        // Tri par date
        emails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        
        return emails;
    }

    calculateStats() {
        const stats = {};
        this.emails.forEach(email => {
            const cat = email.category || 'other';
            stats[cat] = (stats[cat] || 0) + 1;
        });
        return stats;
    }

    getCategories() {
        return window.categoryManager?.getCategories?.() || {};
    }

    getCategoryName(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.name || categoryId;
    }

    getCategoryIcon(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.icon || '📁';
    }

    getCategoryColor(categoryId) {
        const categories = this.getCategories();
        return categories[categoryId]?.color || '#6b7280';
    }

    isPreselectedCategory(categoryId) {
        const preselected = window.categoryManager?.getTaskPreselectedCategories?.() || [];
        return preselected.includes(categoryId);
    }

    getAvatarColor(email) {
        if (!email) return '#6b7280';
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
        
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    // ================================================
    // UI HELPERS
    // ================================================
    renderAuthRequired(container) {
        container.innerHTML = `
            <div class="auth-required">
                <div class="auth-icon"><i class="fas fa-lock"></i></div>
                <h2>Connexion requise</h2>
                <p>Connectez-vous avec Gmail pour accéder à vos emails</p>
                <button class="btn-primary" onclick="pageManagerGmail.login()">
                    <i class="fab fa-google"></i>
                    Se connecter
                </button>
            </div>
        `;
    }

    async login() {
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
                this.loadPage('emails');
            }
        } catch (error) {
            this.showToast('Erreur connexion', 'error');
        }
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Erreur</h2>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">
                    Réessayer
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    showLoading() {
        if (window.uiManager?.showLoading) {
            window.uiManager.showLoading();
        }
    }

    hideLoading() {
        if (window.uiManager?.hideLoading) {
            window.uiManager.hideLoading();
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // ================================================
    // STYLES
    // ================================================
    addStyles() {
        if (document.getElementById('gmail-page-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmail-page-styles';
        styles.textContent = `
            .gmail-page {
                background: #f8f9fa;
                min-height: 100vh;
            }
            
            /* Header */
            .gmail-header {
                background: white;
                border-bottom: 1px solid #e0e0e0;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .header-main {
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .page-title {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 24px;
                font-weight: 400;
                margin: 0;
            }
            
            .page-title i {
                color: #4285f4;
            }
            
            .email-count {
                background: #e8f0fe;
                color: #1967d2;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .btn-refresh {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: white;
                border: 1px solid #dadce0;
                border-radius: 4px;
                color: #5f6368;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-refresh:hover {
                background: #f8f9fa;
                border-color: #1a73e8;
                color: #1a73e8;
            }
            
            /* Search */
            .search-section {
                padding: 16px 20px;
                background: #f8f9fa;
            }
            
            .search-box {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .search-box i {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #5f6368;
            }
            
            .search-box input {
                width: 100%;
                padding: 12px 48px;
                border: none;
                border-radius: 8px;
                background: white;
                font-size: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            }
            
            .search-box input:focus {
                outline: none;
                box-shadow: 0 1px 6px rgba(0,0,0,0.2);
            }
            
            .clear-search {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                color: #5f6368;
                cursor: pointer;
                border-radius: 50%;
            }
            
            .clear-search:hover {
                background: rgba(0,0,0,0.05);
            }
            
            /* Categories */
            .categories-section {
                padding: 16px 20px;
                background: white;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .category-tabs {
                display: flex;
                gap: 8px;
                overflow-x: auto;
                scrollbar-width: none;
            }
            
            .category-tabs::-webkit-scrollbar {
                display: none;
            }
            
            .category-tab {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                color: #5f6368;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
                position: relative;
            }
            
            .category-tab:hover {
                border-color: #1a73e8;
                transform: translateY(-1px);
            }
            
            .category-tab.active {
                background: #1a73e8;
                border-color: #1a73e8;
                color: white;
            }
            
            .category-tab.preselected {
                border-color: #8b5cf6;
                background: #faf5ff;
            }
            
            .tab-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
            }
            
            .category-tab.active .tab-count {
                background: rgba(255,255,255,0.2);
            }
            
            .star {
                position: absolute;
                top: -4px;
                right: -4px;
                font-size: 12px;
            }
            
            /* Actions bar */
            .actions-bar {
                padding: 12px 20px;
                background: #f1f3f4;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .selection-info {
                font-size: 14px;
                color: #5f6368;
                font-weight: 500;
            }
            
            .btn-action {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #1a73e8;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-action:hover {
                background: #1557b0;
            }
            
            .btn-action.secondary {
                background: white;
                color: #5f6368;
                border: 1px solid #dadce0;
            }
            
            .btn-action.secondary:hover {
                background: #f8f9fa;
            }
            
            /* Emails */
            .emails-container {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .emails-list {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            
            .email-card {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .email-card:hover {
                background: #f8f9fa;
            }
            
            .email-card.selected {
                background: #e8f0fe;
            }
            
            .email-checkbox {
                margin-right: 16px;
            }
            
            .email-checkbox input {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .email-content {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 0;
            }
            
            .sender-info {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 200px;
                flex-shrink: 0;
            }
            
            .sender-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 500;
                flex-shrink: 0;
            }
            
            .sender-details {
                min-width: 0;
            }
            
            .sender-name {
                font-weight: 500;
                color: #202124;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .sender-email {
                font-size: 12px;
                color: #5f6368;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .email-info {
                flex: 1;
                min-width: 0;
            }
            
            .email-subject {
                font-weight: 500;
                color: #202124;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .email-subject i {
                color: #5f6368;
                margin-left: 8px;
            }
            
            .email-preview {
                font-size: 14px;
                color: #5f6368;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 4px;
            }
            
            .email-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12px;
                color: #5f6368;
            }
            
            .email-category {
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 500;
            }
            
            .email-actions {
                margin-left: 16px;
            }
            
            .action-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                color: #5f6368;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .action-btn:hover {
                background: rgba(0,0,0,0.05);
                color: #1a73e8;
            }
            
            /* Empty state */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 8px;
                color: #5f6368;
            }
            
            .empty-state i {
                font-size: 48px;
                color: #dadce0;
                margin-bottom: 16px;
            }
            
            .empty-state h3 {
                font-size: 20px;
                font-weight: 400;
                color: #202124;
                margin-bottom: 8px;
            }
            
            .empty-state p {
                margin-bottom: 24px;
            }
            
            .btn-primary {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 24px;
                background: #1a73e8;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary:hover {
                background: #1557b0;
            }
            
            /* Auth required */
            .auth-required {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 8px;
                max-width: 400px;
                margin: 40px auto;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            }
            
            .auth-icon {
                font-size: 48px;
                color: #4285f4;
                margin-bottom: 20px;
            }
            
            .auth-required h2 {
                font-size: 24px;
                font-weight: 400;
                color: #202124;
                margin-bottom: 12px;
            }
            
            .auth-required p {
                color: #5f6368;
                margin-bottom: 24px;
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal {
                background: white;
                border-radius: 8px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 24px 48px rgba(0,0,0,0.15);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 400;
            }
            
            .modal-close {
                width: 40px;
                height: 40px;
                border: none;
                background: transparent;
                color: #5f6368;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
            }
            
            .modal-close:hover {
                background: rgba(0,0,0,0.05);
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .email-details {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .email-details p {
                margin: 8px 0;
            }
            
            .email-body {
                line-height: 1.6;
                color: #202124;
            }
            
            .modal-footer {
                padding: 16px 20px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .btn-secondary {
                padding: 8px 16px;
                background: white;
                color: #5f6368;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-secondary:hover {
                background: #f8f9fa;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .sender-info {
                    width: auto;
                }
                
                .sender-details {
                    display: none;
                }
                
                .email-content {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .category-tabs {
                    padding-bottom: 8px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INITIALISATION
// ================================================
if (window.pageManagerGmail) {
    console.log('[PageManagerGmail] 🔄 Cleaning up old instance...');
}

window.pageManagerGmail = new PageManagerGmail();

console.log('✅ PageManagerGmail v20.0 loaded - Optimized Gmail Manager');
