// PageManager.js - Version 15.0 - OPTIMISÉE ET SIMPLIFIÉE

class PageManager {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.searchTerm = '';
        this.currentCategory = 'all';
        this.currentViewMode = 'flat';
        this.createdTasks = new Map();
        
        // Cache emails simplifié
        this.emailsCache = [];
        this.lastScanTime = null;
        
        // Détection provider
        this.currentProvider = null;
        
        // Pages disponibles
        this.pages = {
            scanner: () => this.renderScanner(),
            emails: () => this.renderEmails(),
            tasks: () => this.renderTasks(),
            categories: () => this.renderCategories(),
            settings: () => this.renderSettings(),
            ranger: () => this.renderRanger()
        };
        
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 15.0 - Optimisée');
        this.detectProvider();
        this.setupEventListeners();
        this.loadCachedEmails();
    }

    // ========================================
    // GESTION DES EMAILS - SIMPLIFIÉ
    // ========================================
    
    getAllEmails() {
        // 1. Cache local en priorité
        if (this.emailsCache.length > 0) {
            return this.emailsCache;
        }
        
        // 2. EmailScanner
        if (window.emailScanner?.getAllEmails) {
            const emails = window.emailScanner.getAllEmails();
            if (emails?.length > 0) {
                this.emailsCache = emails;
                return emails;
            }
        }
        
        // 3. SessionStorage
        try {
            const stored = sessionStorage.getItem('lastScanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.emails?.length > 0) {
                    this.emailsCache = data.emails;
                    return data.emails;
                }
            }
        } catch (e) {
            console.warn('[PageManager] Erreur sessionStorage:', e);
        }
        
        return [];
    }

    getEmailById(emailId) {
        if (!emailId) return null;
        
        // Chercher dans le cache
        const email = this.emailsCache.find(e => e.id === emailId);
        if (email) return email;
        
        // Chercher dans EmailScanner
        if (window.emailScanner?.getEmailById) {
            return window.emailScanner.getEmailById(emailId);
        }
        
        return null;
    }

    loadCachedEmails() {
        this.getAllEmails(); // Charge le cache au démarrage
    }

    async refreshEmails() {
        console.log('[PageManager] 🔄 Actualisation emails...');
        
        try {
            // Vider le cache pour forcer rechargement
            this.emailsCache = [];
            
            // Recharger depuis EmailScanner
            const emails = this.getAllEmails();
            
            if (this.currentPage === 'emails') {
                await this.renderEmails();
            }
            
            window.uiManager?.showToast(`${emails.length} emails actualisés`, 'success');
            
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
            window.uiManager?.showToast('Erreur actualisation', 'error');
        }
    }

    // ========================================
    // DÉTECTION PROVIDER
    // ========================================
    
    detectProvider() {
        if (window.googleAuthService?.isAuthenticated?.()) {
            this.currentProvider = 'gmail';
        } else if (window.authService?.isAuthenticated?.()) {
            this.currentProvider = 'outlook';
        } else {
            this.currentProvider = null;
        }
        return this.currentProvider;
    }

    getProviderInfo() {
        const provider = this.detectProvider();
        
        if (provider === 'gmail') {
            return {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                connected: true
            };
        } else if (provider === 'outlook') {
            return {
                name: 'Outlook', 
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                connected: true
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-unlink',
            color: '#6b7280',
            connected: false
        };
    }

    // ========================================
    // RENDU PAGE EMAILS - OPTIMISÉ
    // ========================================
    
    async renderEmails() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        console.log('[PageManager] 📧 Rendu page emails...');
        
        const emails = this.getAllEmails();
        const providerInfo = this.getProviderInfo();
        
        console.log(`[PageManager] ${emails.length} emails à afficher`);
        
        // Si aucun email
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyState();
            this.addStyles();
            return;
        }

        // Calculs
        const categoryCounts = this.calculateCategoryCounts(emails);
        const filteredEmails = this.getFilteredEmails(emails);
        
        // Rendu HTML
        container.innerHTML = `
            <div class="emails-page">
                <!-- Provider Status -->
                <div class="provider-status">
                    <div class="provider-badge ${providerInfo.connected ? 'connected' : ''}">
                        <i class="${providerInfo.icon}"></i>
                        <span>${providerInfo.name}</span>
                    </div>
                    <div class="email-count">
                        ${emails.length} emails • ${this.selectedEmails.size} sélectionnés
                    </div>
                </div>

                <!-- Barre de contrôle -->
                <div class="controls-bar">
                    <!-- Recherche -->
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               id="emailSearch"
                               placeholder="Rechercher..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="clear-search" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Actions -->
                    <div class="actions">
                        <button class="btn-action" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        
                        <button class="btn-action" onclick="window.pageManager.toggleAllSelection()">
                            <i class="fas fa-check-square"></i>
                            <span>Tout sélectionner</span>
                        </button>
                        
                        <button class="btn-action primary ${this.selectedEmails.size === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.createTasksFromSelection()"
                                ${this.selectedEmails.size === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            <span>Créer tâches (${this.selectedEmails.size})</span>
                        </button>
                    </div>
                </div>

                <!-- Filtres catégories -->
                <div class="category-filters">
                    ${this.renderCategoryFilters(categoryCounts, emails.length)}
                </div>

                <!-- Liste emails -->
                <div class="emails-list">
                    ${filteredEmails.length > 0 ? 
                        filteredEmails.map(email => this.renderEmailCard(email)).join('') :
                        '<div class="no-results">Aucun email ne correspond aux critères</div>'
                    }
                </div>
            </div>
        `;

        this.addStyles();
        this.setupEmailEventListeners();
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const sender = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const category = window.categoryManager?.getCategory(email.category);
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}" 
                 data-email-id="${email.id}">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="email-content" onclick="window.pageManager.handleEmailClick('${email.id}')">
                    <div class="email-header">
                        <h3 class="email-subject">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="email-date">${this.formatDate(email.receivedDateTime)}</span>
                            ${email.hasAttachments ? '<i class="fas fa-paperclip attachment-icon"></i>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <span class="sender-name">${this.escapeHtml(sender)}</span>
                        <span class="sender-email">${this.escapeHtml(senderEmail)}</span>
                    </div>
                    
                    ${category ? `
                        <div class="email-category" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon} ${category.name}
                        </div>
                    ` : ''}
                    
                    ${email.bodyPreview ? `
                        <div class="email-preview">
                            ${this.escapeHtml(email.bodyPreview.substring(0, 150))}...
                        </div>
                    ` : ''}
                </div>
                
                <div class="email-actions">
                    ${!hasTask ? `
                        <button class="action-btn" 
                                onclick="event.stopPropagation(); window.pageManager.createTaskFromEmail('${email.id}')"
                                title="Créer une tâche">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : `
                        <button class="action-btn success" 
                                onclick="event.stopPropagation(); window.pageManager.viewTask('${email.id}')"
                                title="Voir la tâche">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="action-btn" 
                            onclick="event.stopPropagation(); window.pageManager.showEmailDetail('${email.id}')"
                            title="Voir l'email">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryFilters(counts, total) {
        const categories = window.categoryManager?.getCategories() || {};
        const buttons = [];
        
        // Bouton "Tous"
        buttons.push(`
            <button class="category-filter ${this.currentCategory === 'all' ? 'active' : ''}" 
                    onclick="window.pageManager.filterByCategory('all')">
                <span class="cat-icon">📧</span>
                <span class="cat-name">Tous</span>
                <span class="cat-count">${total}</span>
            </button>
        `);
        
        // Autres catégories
        Object.entries(counts).forEach(([catId, count]) => {
            if (count > 0 && categories[catId]) {
                const cat = categories[catId];
                buttons.push(`
                    <button class="category-filter ${this.currentCategory === catId ? 'active' : ''}" 
                            onclick="window.pageManager.filterByCategory('${catId}')">
                        <span class="cat-icon">${cat.icon}</span>
                        <span class="cat-name">${cat.name}</span>
                        <span class="cat-count">${count}</span>
                    </button>
                `);
            }
        });
        
        return buttons.join('');
    }

    renderEmptyState() {
        const providerInfo = this.getProviderInfo();
        
        return `
            <div class="emails-page">
                <div class="empty-state">
                    <i class="fas fa-inbox empty-icon"></i>
                    <h2>Aucun email trouvé</h2>
                    <p>${providerInfo.connected ? 
                        `Connecté à ${providerInfo.name}. Lancez un scan pour récupérer vos emails.` :
                        'Connectez-vous à Gmail ou Outlook pour commencer.'
                    }</p>
                    <div class="empty-actions">
                        ${providerInfo.connected ? `
                            <button class="btn primary" onclick="window.pageManager.loadPage('scanner')">
                                <i class="fas fa-search"></i> Aller au scanner
                            </button>
                        ` : `
                            <button class="btn primary gmail" onclick="window.googleAuthService?.login()">
                                <i class="fab fa-google"></i> Connexion Gmail
                            </button>
                            <button class="btn primary outlook" onclick="window.authService?.login()">
                                <i class="fab fa-microsoft"></i> Connexion Outlook
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // GESTION SÉLECTION ET ACTIONS
    // ========================================
    
    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        this.updateSelectionUI();
    }

    toggleAllSelection() {
        const filtered = this.getFilteredEmails(this.getAllEmails());
        
        if (this.selectedEmails.size === filtered.length) {
            this.selectedEmails.clear();
        } else {
            filtered.forEach(email => this.selectedEmails.add(email.id));
        }
        
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        // Mettre à jour les checkboxes
        document.querySelectorAll('.email-card').forEach(card => {
            const emailId = card.dataset.emailId;
            const checkbox = card.querySelector('.email-checkbox');
            const isSelected = this.selectedEmails.has(emailId);
            
            card.classList.toggle('selected', isSelected);
            if (checkbox) checkbox.checked = isSelected;
        });
        
        // Mettre à jour le bouton de création
        const createBtn = document.querySelector('.btn-action.primary');
        if (createBtn) {
            const count = this.selectedEmails.size;
            createBtn.disabled = count === 0;
            createBtn.classList.toggle('disabled', count === 0);
            createBtn.querySelector('span').textContent = `Créer tâches (${count})`;
        }
        
        // Mettre à jour le compteur
        const countElement = document.querySelector('.email-count');
        if (countElement) {
            const total = this.getAllEmails().length;
            countElement.textContent = `${total} emails • ${this.selectedEmails.size} sélectionnés`;
        }
    }

    handleEmailClick(emailId) {
        this.showEmailDetail(emailId);
    }

    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) return;
        
        let created = 0;
        window.uiManager?.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                const task = await this.createTaskFromEmail(emailId);
                if (task) {
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManager] Erreur création tâche:', error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.uiManager?.showToast(`${created} tâches créées`, 'success');
            this.selectedEmails.clear();
            this.renderEmails();
        }
    }

    async createTaskFromEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return null;
        
        const sender = email.from?.emailAddress?.name || 'Inconnu';
        const taskData = {
            title: `Email de ${sender}: ${email.subject || 'Sans sujet'}`,
            description: email.bodyPreview || '',
            priority: email.importance === 'high' ? 'high' : 'medium',
            dueDate: null,
            emailId: emailId,
            category: email.category
        };
        
        if (window.taskManager) {
            return window.taskManager.createTaskFromEmail(taskData, email);
        }
        
        return null;
    }

    viewTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId || !window.tasksView) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                window.tasksView.showTaskDetails?.(taskId);
            }, 100);
        });
    }

    showEmailDetail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Email complet</h2>
                    <button class="close-btn" onclick="this.closest('.email-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="email-detail-header">
                        <h3>${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-detail-meta">
                            <div>De: <strong>${this.escapeHtml(email.from?.emailAddress?.name || 'Inconnu')}</strong></div>
                            <div>Email: ${this.escapeHtml(email.from?.emailAddress?.address || '')}</div>
                            <div>Date: ${new Date(email.receivedDateTime).toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="email-detail-body">
                        ${email.body?.content || email.bodyPreview || 'Aucun contenu'}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.email-modal').remove()">Fermer</button>
                    ${!this.createdTasks.has(emailId) ? `
                        <button class="btn primary" onclick="window.pageManager.createTaskFromEmail('${emailId}'); this.closest('.email-modal').remove()">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // ========================================
    // FILTRAGE ET RECHERCHE
    // ========================================
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.renderEmails();
    }

    clearSearch() {
        this.searchTerm = '';
        this.renderEmails();
    }

    getFilteredEmails(emails) {
        let filtered = emails;
        
        // Filtre par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            filtered = filtered.filter(email => email.category === this.currentCategory);
        }
        
        // Filtre par recherche
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(email => {
                const subject = (email.subject || '').toLowerCase();
                const sender = (email.from?.emailAddress?.name || '').toLowerCase();
                const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
                const preview = (email.bodyPreview || '').toLowerCase();
                
                return subject.includes(search) || 
                       sender.includes(search) || 
                       senderEmail.includes(search) || 
                       preview.includes(search);
            });
        }
        
        return filtered;
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            if (email.category) {
                counts[email.category] = (counts[email.category] || 0) + 1;
            }
        });
        return counts;
    }

    // ========================================
    // ÉVÉNEMENTS
    // ========================================
    
    setupEventListeners() {
        // Écouter les scans terminés
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, rechargement emails');
            this.emailsCache = []; // Vider le cache
            if (this.currentPage === 'emails') {
                this.renderEmails();
            }
        });

        // Écouter les recatégorisations
        window.addEventListener('emailsRecategorized', () => {
            console.log('[PageManager] Emails recatégorisés');
            this.emailsCache = [];
            if (this.currentPage === 'emails') {
                this.renderEmails();
            }
        });
    }

    setupEmailEventListeners() {
        // Recherche
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.renderEmails();
                }, 300);
            });
        }
    }

    // ========================================
    // AUTRES PAGES
    // ========================================
    
    async renderScanner() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        if (window.scanStartModule?.render) {
            await window.scanStartModule.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module scanner en cours de chargement...</div>';
        }
    }

    async renderTasks() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        if (window.tasksView?.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module tâches en cours de chargement...</div>';
        }
    }

    async renderCategories() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        if (window.categoriesPage?.render) {
            window.categoriesPage.render(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module catégories en cours de chargement...</div>';
        }
    }

    async renderSettings() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        if (window.categoriesPage?.renderSettings) {
            window.categoriesPage.renderSettings(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module paramètres en cours de chargement...</div>';
        }
    }

    async renderRanger() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        if (window.domainOrganizer?.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            container.innerHTML = '<div class="empty-state">Module rangement en cours de chargement...</div>';
        }
    }

    // ========================================
    // NAVIGATION
    // ========================================
    
    async loadPage(pageName) {
        console.log(`[PageManager] Navigation vers: ${pageName}`);
        
        if (pageName === 'dashboard') {
            this.updateNavigation(pageName);
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        this.updateNavigation(pageName);
        window.uiManager?.showLoading();

        try {
            if (this.pages[pageName]) {
                await this.pages[pageName]();
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }
        } catch (error) {
            console.error('[PageManager] Erreur:', error);
            pageContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erreur</h2>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    // ========================================
    // UTILITAIRES
    // ========================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Hier';
        } else if (days < 7) {
            return `Il y a ${days} jours`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    // ========================================
    // STYLES CSS OPTIMISÉS
    // ========================================
    
    addStyles() {
        if (document.getElementById('pageManagerStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerStyles';
        styles.textContent = `
            /* Variables globales */
            :root {
                --primary: #6366f1;
                --primary-dark: #4f46e5;
                --success: #10b981;
                --danger: #ef4444;
                --warning: #f59e0b;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-400: #9ca3af;
                --gray-500: #6b7280;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-800: #1f2937;
                --gray-900: #111827;
                --radius: 12px;
                --shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            /* Page emails */
            .emails-page {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }

            /* Provider status */
            .provider-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }

            .provider-badge {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                background: var(--gray-100);
                border-radius: 8px;
                font-weight: 600;
                color: var(--gray-600);
            }

            .provider-badge.connected {
                background: #dcfce7;
                color: #15803d;
            }

            .email-count {
                color: var(--gray-600);
                font-size: 14px;
            }

            /* Barre de contrôle */
            .controls-bar {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                flex-wrap: wrap;
                align-items: center;
            }

            .search-box {
                position: relative;
                flex: 1;
                min-width: 250px;
                max-width: 400px;
            }

            .search-box i {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
            }

            .search-box input {
                width: 100%;
                padding: 10px 40px 10px 40px;
                border: 2px solid var(--gray-200);
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s;
            }

            .search-box input:focus {
                outline: none;
                border-color: var(--primary);
            }

            .clear-search {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--danger);
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            .actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .btn-action {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: white;
                border: 2px solid var(--gray-200);
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-action:hover {
                background: var(--gray-50);
                border-color: var(--gray-300);
                transform: translateY(-1px);
            }

            .btn-action.primary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .btn-action.primary:hover {
                background: var(--primary-dark);
                border-color: var(--primary-dark);
            }

            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            /* Filtres catégories */
            .category-filters {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .category-filter {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: white;
                border: 2px solid var(--gray-200);
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .category-filter:hover {
                background: var(--gray-50);
                border-color: var(--gray-300);
                transform: translateY(-1px);
            }

            .category-filter.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .cat-icon {
                font-size: 16px;
            }

            .cat-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
            }

            .category-filter.active .cat-count {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Liste emails */
            .emails-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .email-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px 20px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                transition: all 0.2s;
                cursor: pointer;
            }

            .email-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .email-card.selected {
                background: #eff6ff;
                border: 2px solid var(--primary);
                padding: 13px 18px;
            }

            .email-card.has-task {
                background: #f0fdf4;
            }

            .email-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            .email-content {
                flex: 1;
                min-width: 0;
            }

            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 5px;
            }

            .email-subject {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--gray-800);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .email-meta {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--gray-500);
                font-size: 13px;
                flex-shrink: 0;
            }

            .attachment-icon {
                color: var(--warning);
            }

            .email-sender {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 5px;
                color: var(--gray-600);
                font-size: 14px;
            }

            .sender-name {
                font-weight: 600;
            }

            .sender-email {
                color: var(--gray-500);
                font-size: 13px;
            }

            .email-category {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 5px;
            }

            .email-preview {
                margin-top: 8px;
                color: var(--gray-600);
                font-size: 13px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .email-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 2px solid var(--gray-200);
                border-radius: 8px;
                color: var(--gray-600);
                cursor: pointer;
                transition: all 0.2s;
            }

            .action-btn:hover {
                background: var(--primary);
                border-color: var(--primary);
                color: white;
                transform: scale(1.1);
            }

            .action-btn.success {
                background: var(--success);
                border-color: var(--success);
                color: white;
            }

            /* Modal email */
            .email-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                z-index: 9999;
            }

            .modal-content {
                background: white;
                border-radius: var(--radius);
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--gray-200);
            }

            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: var(--gray-800);
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--gray-400);
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .close-btn:hover {
                background: var(--gray-100);
                color: var(--gray-600);
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .email-detail-header {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--gray-200);
            }

            .email-detail-header h3 {
                margin: 0 0 15px 0;
                color: var(--gray-800);
            }

            .email-detail-meta {
                display: flex;
                flex-direction: column;
                gap: 8px;
                color: var(--gray-600);
                font-size: 14px;
            }

            .email-detail-body {
                line-height: 1.6;
                color: var(--gray-700);
                white-space: pre-wrap;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid var(--gray-200);
            }

            /* Boutons génériques */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: white;
                border: 2px solid var(--gray-200);
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn:hover {
                background: var(--gray-50);
                border-color: var(--gray-300);
            }

            .btn.primary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .btn.primary:hover {
                background: var(--primary-dark);
                border-color: var(--primary-dark);
            }

            .btn.primary.gmail {
                background: #ea4335;
                border-color: #ea4335;
            }

            .btn.primary.gmail:hover {
                background: #d33b2c;
                border-color: #d33b2c;
            }

            .btn.primary.outlook {
                background: #0078d4;
                border-color: #0078d4;
            }

            .btn.primary.outlook:hover {
                background: #106ebe;
                border-color: #106ebe;
            }

            /* États vides */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }

            .empty-icon {
                font-size: 48px;
                color: var(--gray-300);
                margin-bottom: 20px;
            }

            .empty-state h2 {
                margin: 0 0 10px 0;
                color: var(--gray-800);
            }

            .empty-state p {
                color: var(--gray-600);
                margin-bottom: 30px;
            }

            .empty-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .no-results {
                text-align: center;
                padding: 40px;
                color: var(--gray-500);
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .emails-page {
                    padding: 10px;
                }

                .controls-bar {
                    flex-direction: column;
                    align-items: stretch;
                }

                .search-box {
                    max-width: none;
                }

                .actions {
                    justify-content: center;
                }

                .category-filters {
                    justify-content: center;
                }

                .email-card {
                    flex-wrap: wrap;
                    padding: 12px;
                }

                .email-content {
                    width: 100%;
                }

                .email-actions {
                    width: 100%;
                    justify-content: flex-end;
                    margin-top: 10px;
                }

                .modal-content {
                    max-height: 100vh;
                    border-radius: 0;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ========================================
// INITIALISATION
// ========================================

// Nettoyer l'ancienne instance
if (window.pageManager) {
    console.log('[PageManager] Nettoyage ancienne instance...');
    try {
        window.pageManager.selectedEmails?.clear();
        window.pageManager.createdTasks?.clear();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage:', e);
    }
}

// Créer nouvelle instance
console.log('[PageManager] 🚀 Création instance v15.0 OPTIMISÉE');
window.pageManager = new PageManager();

// Bind des méthodes
const methods = Object.getOwnPropertyNames(PageManager.prototype);
methods.forEach(method => {
    if (method !== 'constructor' && typeof window.pageManager[method] === 'function') {
        window.pageManager[method] = window.pageManager[method].bind(window.pageManager);
    }
});

console.log('✅ PageManager v15.0 chargé avec succès!');
console.log('📧 Version simplifiée et optimisée pour performance maximale');
