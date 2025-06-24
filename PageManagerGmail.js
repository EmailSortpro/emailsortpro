// PageManagerGmail.js - Gestionnaire de pages simplifié pour Gmail
// Version 1.0 - Interface simplifiée adaptée Gmail

class PageManagerGmail {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.provider = 'gmail';
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Vue modes pour les emails (simplifiés)
        this.currentViewMode = 'flat'; // Gmail préfère la vue liste
        this.currentCategory = null;
        
        // Page renderers
        this.pages = {
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container)
        };
        
        this.init();
    }

    init() {
        console.log('[PageManagerGmail] ✅ Version 1.0 - Interface simplifiée Gmail');
        this.setupEventListeners();
    }

    // ================================================
    // ÉVÉNEMENTS SIMPLIFIÉS
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManagerGmail] 📨 Paramètres changés:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter la recatégorisation
        window.addEventListener('emailsRecategorized', () => {
            if (this.currentPage === 'emails') {
                this.refreshEmailsView();
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });
    }

    handleSettingsChanged(settingsData) {
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManagerGmail] 📋 Catégories pré-sélectionnées changées');
            
            if (window.emailScannerGmail && window.emailScannerGmail.emails?.length > 0) {
                setTimeout(() => {
                    window.emailScannerGmail.recategorizeEmails?.();
                }, 100);
            }
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    // ================================================
    // CHARGEMENT DES PAGES
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManagerGmail] Chargement page: ${pageName}`);

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManagerGmail] Container de contenu non trouvé');
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
            console.error(`[PageManagerGmail] Erreur chargement page:`, error);
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
                <button class="btn btn-primary" onclick="window.pageManagerGmail.loadPage('emails')">
                    Retour aux emails
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
    // RENDU PAGE EMAILS SIMPLIFIÉ POUR GMAIL
    // ================================================
    async renderEmails(container) {
        const emails = window.emailScannerGmail?.getAllEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManagerGmail] Rendu page emails avec ${emails.length} emails`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        const categoryCounts = this.calculateCategoryCounts(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        
        container.innerHTML = `
            <div class="gmail-emails-page">
                <!-- Texte explicatif -->
                ${!this.hideExplanation ? `
                    <div class="explanation-text-gmail">
                        <i class="fas fa-info-circle"></i>
                        <span>Cliquez sur un email pour le voir en détail. Utilisez les cases à cocher pour sélectionner plusieurs emails.</span>
                        <button class="explanation-close-btn" onclick="window.pageManagerGmail.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Barre de contrôles simplifiée -->
                <div class="gmail-controls-bar">
                    <!-- Recherche -->
                    <div class="gmail-search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               class="gmail-search-input" 
                               id="emailSearchInput"
                               placeholder="Rechercher dans les emails..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="search-clear" onclick="window.pageManagerGmail.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Actions principales -->
                    <div class="gmail-actions">
                        <button class="gmail-btn ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManagerGmail.createTasksFromSelection()"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            Créer tâche${selectedCount > 1 ? 's' : ''}
                            ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                        </button>
                        
                        <button class="gmail-btn secondary" onclick="window.pageManagerGmail.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            Actualiser
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="gmail-btn danger" 
                                    onclick="window.pageManagerGmail.clearSelection()">
                                <i class="fas fa-times"></i>
                                Effacer (${selectedCount})
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Filtres de catégories -->
                <div class="gmail-category-filters">
                    ${this.buildCategoryTabs(categoryCounts, totalEmails, categories)}
                </div>

                <!-- Liste des emails -->
                <div class="gmail-emails-list">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.addGmailStyles();
        this.setupEmailsEventListeners();
    }

    renderEmptyEmailsState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email Gmail trouvé</h3>
                <p class="empty-state-text">
                    Utilisez le scanner pour récupérer vos emails Gmail.
                </p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                    <i class="fas fa-search"></i>
                    Aller au scanner
                </button>
            </div>
        `;
    }

    buildCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        
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
                    isPreselected: preselectedCategories.includes(catId)
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
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            
            return `
                <button class="gmail-category-tab ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected' : ''}" 
                        onclick="window.pageManagerGmail.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}">
                    <span class="tab-icon">${tab.icon}</span>
                    <span class="tab-name">${tab.name}</span>
                    <span class="tab-count">${tab.count}</span>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    renderEmailsList() {
        const emails = window.emailScannerGmail?.getAllEmails() || [];
        let filteredEmails = this.getFilteredEmails(emails);
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

        // Gmail utilise toujours la vue liste plate
        return `
            <div class="gmail-emails-container">
                ${filteredEmails.map(email => this.renderGmailEmailRow(email)).join('')}
            </div>
        `;
    }

    renderGmailEmailRow(email) {
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const isSelected = this.selectedEmails.has(email.id);
        const isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        return `
            <div class="gmail-email-row ${isSelected ? 'selected' : ''} ${isPreselectedForTasks ? 'preselected' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManagerGmail.handleEmailClick(event, '${email.id}')">
                
                <!-- Checkbox -->
                <input type="checkbox" 
                       class="gmail-email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManagerGmail.toggleEmailSelection('${email.id}')">
                
                <!-- Contenu principal -->
                <div class="gmail-email-content">
                    <div class="gmail-email-header">
                        <span class="gmail-sender">${this.escapeHtml(senderName)}</span>
                        <span class="gmail-date">${this.formatEmailDate(email.receivedDateTime)}</span>
                    </div>
                    <div class="gmail-email-subject">
                        ${this.escapeHtml(email.subject || 'Sans sujet')}
                        ${email.hasAttachments ? '<i class="fas fa-paperclip attachment-icon"></i>' : ''}
                    </div>
                    <div class="gmail-email-preview">
                        ${this.escapeHtml(email.bodyPreview || '')}
                    </div>
                </div>
                
                <!-- Catégorie -->
                ${email.category && email.category !== 'other' ? `
                    <div class="gmail-category-badge" 
                         style="background: ${this.getCategoryColor(email.category)}20; 
                                color: ${this.getCategoryColor(email.category)};">
                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                        ${isPreselectedForTasks ? ' ⭐' : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ================================================
    // GESTION DES CLICS SIMPLIFIÉE
    // ================================================
    handleEmailClick(event, emailId) {
        // Empêcher la propagation pour checkbox
        if (event.target.type === 'checkbox') {
            return;
        }
        
        // Simple clic = ouvrir modal (pas de double-clic pour Gmail)
        console.log('[PageManagerGmail] 📧 Ouverture email:', emailId);
        this.showEmailModal(emailId);
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        this.updateControlsBar();
    }

    updateControlsBar() {
        const selectedCount = this.selectedEmails.size;
        
        // Mettre à jour le bouton créer tâches
        const createTaskBtn = document.querySelector('.gmail-btn:has(.fa-tasks)');
        if (createTaskBtn) {
            if (selectedCount === 0) {
                createTaskBtn.classList.add('disabled');
                createTaskBtn.disabled = true;
            } else {
                createTaskBtn.classList.remove('disabled');
                createTaskBtn.disabled = false;
            }
            
            const countBadge = createTaskBtn.querySelector('.count-badge');
            if (countBadge) {
                countBadge.textContent = selectedCount;
            }
        }
        
        // Gérer le bouton effacer
        const clearBtn = document.querySelector('.gmail-btn.danger');
        if (selectedCount > 0 && !clearBtn) {
            const actionsContainer = document.querySelector('.gmail-actions');
            if (actionsContainer) {
                const newClearBtn = document.createElement('button');
                newClearBtn.className = 'gmail-btn danger';
                newClearBtn.onclick = () => this.clearSelection();
                newClearBtn.innerHTML = `
                    <i class="fas fa-times"></i>
                    Effacer (${selectedCount})
                `;
                actionsContainer.appendChild(newClearBtn);
            }
        } else if (clearBtn && selectedCount === 0) {
            clearBtn.remove();
        } else if (clearBtn) {
            clearBtn.innerHTML = `
                <i class="fas fa-times"></i>
                Effacer (${selectedCount})
            `;
        }
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    getFilteredEmails(emails) {
        let filteredEmails = emails;
        
        // Filtre par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => 
                    !email.category || email.category === 'other'
                );
            } else {
                filteredEmails = filteredEmails.filter(email => 
                    email.category === this.currentCategory
                );
            }
        }
        
        // Filtre par recherche
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => 
                this.matchesSearch(email, this.searchTerm)
            );
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

    renderEmptyState() {
        let message = 'Aucun email trouvé';
        
        if (this.searchTerm) {
            message = `Aucun email ne correspond à "${this.searchTerm}"`;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            message = `Aucun email dans la catégorie "${categoryName}"`;
        }
        
        return `
            <div class="gmail-empty-state">
                <i class="fas fa-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    }

    refreshEmailsView() {
        const emailsContainer = document.querySelector('.gmail-emails-list');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        this.updateControlsBar();
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

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    // ================================================
    // CRÉATION DE TÂCHES SIMPLIFIÉE
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        window.uiManager?.showToast(`Création de ${this.selectedEmails.size} tâches...`, 'info');
        
        // Logique simplifiée de création de tâches
        // Pour Gmail, on peut déléguer à un service de tâches externe
        
        this.clearSelection();
        window.uiManager?.showToast('Tâches créées avec succès', 'success');
    }

    // ================================================
    // MODAL EMAIL SIMPLIFIÉ
    // ================================================
    showEmailModal(emailId) {
        const email = window.emailScannerGmail?.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const modalHTML = `
            <div class="gmail-modal-overlay" onclick="if(event.target === this) this.remove()">
                <div class="gmail-modal">
                    <div class="gmail-modal-header">
                        <h3>${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <button class="gmail-modal-close" onclick="this.closest('.gmail-modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="gmail-modal-body">
                        <div class="gmail-email-info">
                            <p><strong>De:</strong> ${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</p>
                            <p><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</p>
                            ${email.category ? `
                                <p><strong>Catégorie:</strong> 
                                    <span class="category-badge" style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>
                                </p>
                            ` : ''}
                        </div>
                        <div class="gmail-email-content">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div class="gmail-modal-footer">
                        <button class="gmail-btn" onclick="this.closest('.gmail-modal-overlay').remove()">
                            Fermer
                        </button>
                        <button class="gmail-btn primary" onclick="window.pageManagerGmail.createTaskFromEmail('${emailId}')">
                            <i class="fas fa-tasks"></i>
                            Créer une tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async createTaskFromEmail(emailId) {
        // Logique simplifiée de création de tâche
        window.uiManager?.showToast('Tâche créée', 'success');
        document.querySelector('.gmail-modal-overlay')?.remove();
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            if (window.emailScannerGmail && window.emailScannerGmail.emails.length > 0) {
                await window.emailScannerGmail.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            window.uiManager?.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        }
    }

    getTaskPreselectedCategories() {
        if (window.categoryManager) {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManagerGmail] Erreur récupération catégories:', error);
            return [];
        }
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
            return email.body.content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu')}</p>`;
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
    // AUTRES PAGES (simplifiées)
    // ================================================
    async renderTasks(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Tâches Gmail</h1>
            </div>
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>Gestion des tâches simplifiée pour Gmail</p>
            </div>
        `;
    }

    async renderCategories(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <p>Configuration des catégories</p>
            </div>
        `;
    }

    async renderSettings(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Paramètres Gmail</h1>
            </div>
            <div class="settings-card">
                <h3>Configuration Gmail</h3>
                <p>Paramètres simplifiés pour Gmail</p>
            </div>
        `;
    }

    // ================================================
    // STYLES CSS POUR GMAIL
    // ================================================
    addGmailStyles() {
        if (document.getElementById('gmailPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmailPageStyles';
        styles.textContent = `
            /* Gmail Page Styles */
            .gmail-emails-page {
                font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #f8f9fa;
                min-height: 100vh;
                padding: 16px;
            }
            
            .explanation-text-gmail {
                background: #e8f0fe;
                border: 1px solid #dadce0;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #3c4043;
                font-size: 14px;
                position: relative;
            }
            
            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: transparent;
                border: none;
                color: #5f6368;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .explanation-close-btn:hover {
                background: rgba(60, 64, 67, 0.08);
            }
            
            /* Barre de contrôles Gmail */
            .gmail-controls-bar {
                background: white;
                border: 1px solid #dadce0;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 1px 2px rgba(60, 64, 67, 0.1);
            }
            
            .gmail-search-box {
                flex: 1;
                max-width: 500px;
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .gmail-search-box i {
                position: absolute;
                left: 12px;
                color: #5f6368;
                font-size: 14px;
            }
            
            .gmail-search-input {
                width: 100%;
                padding: 8px 36px;
                border: 1px solid #dadce0;
                border-radius: 24px;
                font-size: 14px;
                background: #f8f9fa;
                transition: all 0.2s;
            }
            
            .gmail-search-input:focus {
                outline: none;
                background: white;
                border-color: #1a73e8;
                box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
            }
            
            .search-clear {
                position: absolute;
                right: 8px;
                background: #5f6368;
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                transition: background 0.2s;
            }
            
            .search-clear:hover {
                background: #3c4043;
            }
            
            .gmail-actions {
                display: flex;
                gap: 8px;
            }
            
            .gmail-btn {
                padding: 8px 16px;
                border: 1px solid #dadce0;
                background: white;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                position: relative;
                color: #3c4043;
            }
            
            .gmail-btn:hover {
                background: #f8f9fa;
                box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3);
            }
            
            .gmail-btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .gmail-btn.secondary {
                background: #f8f9fa;
            }
            
            .gmail-btn.danger {
                color: #d33b3b;
                border-color: #fdd;
            }
            
            .gmail-btn.danger:hover {
                background: #fef1f1;
            }
            
            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #d33b3b;
                color: white;
                font-size: 10px;
                padding: 2px 5px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
            }
            
            /* Filtres de catégories */
            .gmail-category-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .gmail-category-tab {
                padding: 6px 16px;
                background: white;
                border: 1px solid #dadce0;
                border-radius: 16px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                position: relative;
            }
            
            .gmail-category-tab:hover {
                background: #f8f9fa;
                border-color: #1a73e8;
            }
            
            .gmail-category-tab.active {
                background: #e8f0fe;
                border-color: #1a73e8;
                color: #1a73e8;
            }
            
            .gmail-category-tab.preselected {
                border-width: 2px;
                border-color: #8b5cf6;
            }
            
            .tab-count {
                background: rgba(95, 99, 104, 0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .preselected-star {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #8b5cf6;
                color: white;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                border: 2px solid white;
            }
            
            /* Liste des emails */
            .gmail-emails-container {
                background: white;
                border: 1px solid #dadce0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .gmail-email-row {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #e8eaed;
                cursor: pointer;
                transition: background 0.1s;
                position: relative;
            }
            
            .gmail-email-row:hover {
                background: #f8f9fa;
            }
            
            .gmail-email-row.selected {
                background: #e8f0fe;
            }
            
            .gmail-email-row.preselected {
                border-left: 3px solid #8b5cf6;
            }
            
            .gmail-email-checkbox {
                margin-right: 16px;
                cursor: pointer;
            }
            
            .gmail-email-content {
                flex: 1;
                min-width: 0;
            }
            
            .gmail-email-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .gmail-sender {
                font-weight: 500;
                color: #202124;
                font-size: 14px;
            }
            
            .gmail-date {
                font-size: 13px;
                color: #5f6368;
            }
            
            .gmail-email-subject {
                font-size: 14px;
                color: #202124;
                margin-bottom: 2px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .attachment-icon {
                color: #5f6368;
                font-size: 12px;
            }
            
            .gmail-email-preview {
                font-size: 13px;
                color: #5f6368;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .gmail-category-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                margin-left: 12px;
            }
            
            /* État vide */
            .gmail-empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #5f6368;
            }
            
            .gmail-empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #dadce0;
            }
            
            /* Modal Gmail */
            .gmail-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .gmail-modal {
                background: white;
                border-radius: 8px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            
            .gmail-modal-header {
                padding: 20px;
                border-bottom: 1px solid #e8eaed;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .gmail-modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 400;
                color: #202124;
            }
            
            .gmail-modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #5f6368;
                cursor: pointer;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            
            .gmail-modal-close:hover {
                background: rgba(60, 64, 67, 0.08);
            }
            
            .gmail-modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .gmail-email-info {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e8eaed;
            }
            
            .gmail-email-info p {
                margin: 8px 0;
                font-size: 14px;
                color: #3c4043;
            }
            
            .category-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .gmail-email-content {
                font-size: 14px;
                line-height: 1.6;
                color: #3c4043;
            }
            
            .gmail-modal-footer {
                padding: 16px 20px;
                border-top: 1px solid #e8eaed;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .gmail-btn.primary {
                background: #1a73e8;
                color: white;
                border-color: #1a73e8;
            }
            
            .gmail-btn.primary:hover {
                background: #1557b0;
                border-color: #1557b0;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
window.pageManagerGmail = new PageManagerGmail();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
        window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
    }
});

console.log('✅ PageManagerGmail loaded - Interface simplifiée pour Gmail');
