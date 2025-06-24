// PageManager.js - Version 16.0 - CORRIGÉ ET COMPLET

class PageManager {
    constructor() {
        // État principal
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.createdTasks = new Map();
        this.aiAnalysisResults = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.currentCategory = 'all';
        this.currentViewMode = 'flat';
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // Cache emails simplifié mais robuste
        this.emailsCache = {
            emails: [],
            lastUpdate: null,
            source: null
        };
        
        // Détection provider
        this.currentProvider = null;
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            authenticated: false
        };
        
        // Pages
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
        console.log('[PageManager] ✅ Version 16.0 - Corrigé et Complet');
        this.detectProvider();
        this.setupEventListeners();
        this.loadEmailsFromCache();
    }

    // ========================================
    // GESTION DES EMAILS - ROBUSTE
    // ========================================
    
    getAllEmails() {
        // 1. Cache local
        if (this.emailsCache.emails.length > 0) {
            return this.emailsCache.emails;
        }
        
        // 2. EmailScanner
        if (window.emailScanner?.getAllEmails) {
            const emails = window.emailScanner.getAllEmails();
            if (emails?.length > 0) {
                this.updateEmailsCache(emails, 'emailScanner');
                return emails;
            }
        }
        
        // 3. SessionStorage
        try {
            const stored = sessionStorage.getItem('lastScanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.emails?.length > 0) {
                    this.updateEmailsCache(data.emails, 'sessionStorage');
                    return data.emails;
                }
            }
        } catch (e) {
            console.warn('[PageManager] Erreur sessionStorage:', e);
        }
        
        return [];
    }

    updateEmailsCache(emails, source) {
        this.emailsCache = {
            emails: [...emails],
            lastUpdate: Date.now(),
            source: source
        };
        console.log(`[PageManager] 📦 Cache mis à jour: ${emails.length} emails depuis ${source}`);
    }

    getEmailById(emailId) {
        if (!emailId) return null;
        
        // Chercher dans le cache
        const email = this.emailsCache.emails.find(e => e.id === emailId);
        if (email) return email;
        
        // Chercher dans EmailScanner
        if (window.emailScanner?.getEmailById) {
            return window.emailScanner.getEmailById(emailId);
        }
        
        return null;
    }

    loadEmailsFromCache() {
        const emails = this.getAllEmails();
        console.log(`[PageManager] 📥 ${emails.length} emails chargés au démarrage`);
    }

    async refreshEmails() {
        console.log('[PageManager] 🔄 Actualisation emails...');
        window.uiManager?.showLoading('Actualisation des emails...');
        
        try {
            // Vider le cache
            this.emailsCache.emails = [];
            
            // Forcer rechargement
            const emails = this.getAllEmails();
            
            if (this.currentPage === 'emails') {
                await this.renderEmails();
            }
            
            window.uiManager?.showToast(`${emails.length} emails actualisés`, 'success');
            
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
            window.uiManager?.showToast('Erreur actualisation', 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    // ========================================
    // DÉTECTION PROVIDER
    // ========================================
    
    detectProvider() {
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            authenticated: false
        };
        
        if (window.googleAuthService?.isAuthenticated?.()) {
            this.currentProvider = 'gmail';
            this.connectionStatus.gmail = true;
            this.connectionStatus.authenticated = true;
        } else if (window.authService?.isAuthenticated?.()) {
            this.currentProvider = 'outlook';
            this.connectionStatus.outlook = true;
            this.connectionStatus.authenticated = true;
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
                status: 'connected',
                canScan: true
            };
        } else if (provider === 'outlook') {
            return {
                name: 'Outlook', 
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                status: 'connected',
                canScan: true
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-unlink',
            color: '#6b7280',
            status: 'disconnected',
            canScan: false
        };
    }

    // ========================================
    // RENDU PAGE EMAILS - COMPLET
    // ========================================
    
    async renderEmails() {
        const container = document.getElementById('pageContent');
        if (!container) return;
        
        console.log('[PageManager] 📧 Rendu page emails v16...');
        
        const emails = this.getAllEmails();
        const providerInfo = this.getProviderInfo();
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] ${emails.length} emails à afficher`);
        
        // Si aucun email
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyState();
            this.addStyles();
            return;
        }

        // Stats et filtrage
        const categoryCounts = this.calculateCategoryCounts(emails);
        const filteredEmails = this.getFilteredEmails(emails);
        const selectedCount = this.selectedEmails.size;
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        // Stats spéciales
        const newsletterCount = emails.filter(e => e.category === 'marketing_news').length;
        const spamCount = emails.filter(e => e.category === 'spam').length;
        const preselectedCount = emails.filter(e => e.isPreselectedForTasks).length;
        
        // HTML complet avec tous les boutons restaurés
        container.innerHTML = `
            <div class="emails-page-v16">
                <!-- Status Bar -->
                <div class="status-bar">
                    <div class="provider-status ${providerInfo.status}">
                        <i class="${providerInfo.icon}"></i>
                        <span>${providerInfo.name}</span>
                        ${providerInfo.status === 'connected' ? '<span class="status-dot"></span>' : ''}
                    </div>
                    <div class="email-stats">
                        <span class="stat-item">
                            <i class="fas fa-envelope"></i> ${emails.length} emails
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-check-circle"></i> ${selectedCount} sélectionnés
                        </span>
                        ${newsletterCount > 0 ? `<span class="stat-item newsletter">📰 ${newsletterCount}</span>` : ''}
                        ${spamCount > 0 ? `<span class="stat-item spam">🚫 ${spamCount}</span>` : ''}
                        ${preselectedCount > 0 ? `<span class="stat-item preselected">⭐ ${preselectedCount}</span>` : ''}
                    </div>
                </div>

                <!-- Message explicatif -->
                ${!this.hideExplanation ? `
                    <div class="explanation-message">
                        <div class="explanation-content">
                            <i class="fas fa-info-circle"></i>
                            <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action.</span>
                        </div>
                        <button class="close-explanation" onclick="window.pageManager.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Barre de contrôle complète -->
                <div class="controls-bar">
                    <!-- Actions de scan -->
                    <div class="control-group">
                        <button class="btn-control refresh" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        ${providerInfo.canScan ? `
                            <button class="btn-control scan" onclick="window.pageManager.loadPage('scanner')">
                                <i class="fas fa-search"></i>
                                <span>Scanner</span>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Recherche -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               id="emailSearch"
                               class="search-input"
                               placeholder="Rechercher dans les emails..." 
                               value="${this.searchTerm}">
                        ${this.searchTerm ? `
                            <button class="clear-search" onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Modes de vue -->
                    <div class="view-modes">
                        <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('flat')"
                                title="Vue liste">
                            <i class="fas fa-list"></i>
                        </button>
                        <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('grouped-domain')"
                                title="Grouper par domaine">
                            <i class="fas fa-globe"></i>
                        </button>
                        <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                onclick="window.pageManager.changeViewMode('grouped-sender')"
                                title="Grouper par expéditeur">
                            <i class="fas fa-user"></i>
                        </button>
                    </div>
                    
                    <!-- Actions principales -->
                    <div class="control-group">
                        <button class="btn-control select-all" onclick="window.pageManager.toggleAllSelection()">
                            <i class="fas fa-check-square"></i>
                            <span>${this.selectedEmails.size === filteredEmails.length ? 'Désélectionner' : 'Sélectionner'} tout</span>
                        </button>
                        
                        <button class="btn-control primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                onclick="window.pageManager.createTasksFromSelection()"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-tasks"></i>
                            <span>Créer tâches</span>
                            ${selectedCount > 0 ? `<span class="badge">${selectedCount}</span>` : ''}
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="btn-control danger" onclick="window.pageManager.clearSelection()">
                                <i class="fas fa-times"></i>
                                <span>Effacer</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Filtres catégories -->
                <div class="category-filters">
                    ${this.renderCategoryFilters(categoryCounts, emails.length, categories, preselectedCategories)}
                </div>

                <!-- Liste emails -->
                <div class="emails-container">
                    ${this.currentViewMode === 'flat' ? 
                        this.renderFlatView(filteredEmails) :
                        this.renderGroupedView(filteredEmails)
                    }
                </div>
            </div>
        `;

        this.addStyles();
        this.setupEmailEventListeners();
        
        // Auto-analyze si activé
        if (this.autoAnalyzeEnabled && preselectedCount > 0) {
            this.analyzePreselectedEmails();
        }
    }

    renderFlatView(emails) {
        if (emails.length === 0) {
            return '<div class="no-results">Aucun email ne correspond aux critères</div>';
        }
        
        return `
            <div class="emails-list">
                ${emails.map(email => this.renderEmailCard(email)).join('')}
            </div>
        `;
    }

    renderGroupedView(emails) {
        if (emails.length === 0) {
            return '<div class="no-results">Aucun email ne correspond aux critères</div>';
        }
        
        const groups = this.groupEmails(emails);
        
        return `
            <div class="emails-grouped">
                ${Object.entries(groups).map(([groupKey, group]) => `
                    <div class="email-group">
                        <div class="group-header" onclick="window.pageManager.toggleGroup('${groupKey}')">
                            <div class="group-info">
                                <span class="group-icon">
                                    ${this.currentViewMode === 'grouped-domain' ? 
                                        '<i class="fas fa-globe"></i>' : 
                                        '<i class="fas fa-user"></i>'
                                    }
                                </span>
                                <span class="group-name">${group.name}</span>
                                <span class="group-count">${group.emails.length} emails</span>
                            </div>
                            <i class="fas fa-chevron-down group-toggle"></i>
                        </div>
                        <div class="group-emails" id="group-${groupKey}">
                            ${group.emails.map(email => this.renderEmailCard(email)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmailCard(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const sender = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const category = window.categoryManager?.getCategory(email.category);
        const hasAiAnalysis = this.aiAnalysisResults.has(email.id);
        
        // Classes spéciales
        let specialClasses = '';
        if (email.category === 'marketing_news') specialClasses += ' newsletter-email';
        if (email.category === 'spam') specialClasses += ' spam-email';
        if (email.isPreselectedForTasks) specialClasses += ' preselected';
        if (hasTask) specialClasses += ' has-task';
        
        return `
            <div class="email-card ${isSelected ? 'selected' : ''} ${specialClasses}" 
                 data-email-id="${email.id}">
                
                <input type="checkbox" 
                       class="email-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="email-priority" style="background: ${this.getEmailPriorityColor(email)}"></div>
                
                <div class="email-content" onclick="window.pageManager.handleEmailClick('${email.id}')">
                    <div class="email-header">
                        <h3 class="email-subject">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            <span class="email-date">${this.formatDate(email.receivedDateTime)}</span>
                            ${email.hasAttachments ? '<i class="fas fa-paperclip"></i>' : ''}
                            ${email.importance === 'high' ? '<i class="fas fa-exclamation-circle high-importance"></i>' : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <i class="fas fa-user-circle"></i>
                        <span class="sender-name">${this.escapeHtml(sender)}</span>
                        <span class="sender-email">${this.escapeHtml(senderEmail)}</span>
                    </div>
                    
                    ${category ? `
                        <div class="email-category" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon} ${category.name}
                            ${email.isPreselectedForTasks ? '<span class="preselected-badge">⭐</span>' : ''}
                        </div>
                    ` : ''}
                    
                    ${email.bodyPreview ? `
                        <div class="email-preview">
                            ${this.escapeHtml(email.bodyPreview.substring(0, 150))}...
                        </div>
                    ` : ''}
                    
                    ${hasAiAnalysis ? `
                        <div class="ai-analysis-badge">
                            <i class="fas fa-robot"></i> Analysé par IA
                        </div>
                    ` : ''}
                </div>
                
                <div class="email-actions">
                    ${!hasTask ? `
                        <button class="action-btn create-task" 
                                onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                                title="Créer une tâche">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : `
                        <button class="action-btn view-task" 
                                onclick="event.stopPropagation(); window.pageManager.viewTask('${email.id}')"
                                title="Voir la tâche">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    `}
                    
                    ${!hasAiAnalysis && email.isPreselectedForTasks ? `
                        <button class="action-btn analyze" 
                                onclick="event.stopPropagation(); window.pageManager.analyzeEmail('${email.id}')"
                                title="Analyser avec IA">
                            <i class="fas fa-brain"></i>
                        </button>
                    ` : ''}
                    
                    <button class="action-btn view" 
                            onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                            title="Voir l'email">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryFilters(counts, total, categories, preselectedCategories) {
        const buttons = [];
        
        // Bouton "Tous"
        buttons.push({
            id: 'all',
            name: 'Tous',
            icon: '📧',
            count: total,
            active: this.currentCategory === 'all',
            color: '#1e293b'
        });
        
        // Catégories avec emails
        Object.entries(counts).forEach(([catId, count]) => {
            if (count > 0 && categories[catId]) {
                const cat = categories[catId];
                buttons.push({
                    id: catId,
                    name: cat.name,
                    icon: cat.icon,
                    count: count,
                    active: this.currentCategory === catId,
                    color: cat.color,
                    isPreselected: preselectedCategories.includes(catId),
                    isNewsletter: catId === 'marketing_news',
                    isSpam: catId === 'spam'
                });
            }
        });
        
        // Trier par priorité
        buttons.sort((a, b) => {
            if (a.id === 'all') return -1;
            if (b.id === 'all') return 1;
            if (a.isNewsletter) return -1;
            if (b.isNewsletter) return 1;
            if (a.isSpam) return -1;
            if (b.isSpam) return 1;
            if (a.isPreselected && !b.isPreselected) return -1;
            if (!a.isPreselected && b.isPreselected) return 1;
            return b.count - a.count;
        });
        
        return buttons.map(btn => `
            <button class="category-filter ${btn.active ? 'active' : ''} ${btn.isPreselected ? 'preselected' : ''} ${btn.isNewsletter ? 'newsletter' : ''} ${btn.isSpam ? 'spam' : ''}" 
                    onclick="window.pageManager.filterByCategory('${btn.id}')"
                    style="${btn.active ? `background: ${btn.color}; color: white;` : ''}">
                <span class="filter-icon">${btn.icon}</span>
                <span class="filter-name">${btn.name}</span>
                <span class="filter-count">${btn.count}</span>
                ${btn.isPreselected ? '<span class="star-badge">⭐</span>' : ''}
            </button>
        `).join('');
    }

    renderEmptyState() {
        const providerInfo = this.getProviderInfo();
        
        return `
            <div class="emails-page-v16">
                <div class="empty-state">
                    <i class="fas fa-inbox empty-icon"></i>
                    <h2>Aucun email trouvé</h2>
                    <p>${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Lancez un scan pour récupérer vos emails.` :
                        'Connectez-vous à Gmail ou Outlook pour commencer.'
                    }</p>
                    <div class="empty-actions">
                        ${providerInfo.status === 'connected' ? `
                            <button class="btn primary" onclick="window.pageManager.loadPage('scanner')">
                                <i class="fas fa-search"></i> Aller au scanner
                            </button>
                        ` : `
                            <button class="btn gmail" onclick="window.googleAuthService?.login()">
                                <i class="fab fa-google"></i> Connexion Gmail
                            </button>
                            <button class="btn outlook" onclick="window.authService?.login()">
                                <i class="fab fa-microsoft"></i> Connexion Outlook
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // MODALS
    // ========================================
    
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const sender = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const category = window.categoryManager?.getCategory(email.category);
        const hasTask = this.createdTasks.has(emailId);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content email-modal">
                <div class="modal-header">
                    <h2>Email complet</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="email-detail-header">
                        <h3>${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        ${category ? `
                            <div class="email-detail-category" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon} ${category.name}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="email-detail-info">
                        <div class="info-row">
                            <span class="info-label">De:</span>
                            <span class="info-value">
                                <strong>${this.escapeHtml(sender)}</strong>
                                ${senderEmail ? `<span class="sender-email">&lt;${this.escapeHtml(senderEmail)}&gt;</span>` : ''}
                            </span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Date:</span>
                            <span class="info-value">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        
                        ${email.toRecipients?.length > 0 ? `
                            <div class="info-row">
                                <span class="info-label">À:</span>
                                <span class="info-value">${email.toRecipients.map(r => 
                                    this.escapeHtml(r.emailAddress?.name || r.emailAddress?.address || '')
                                ).join(', ')}</span>
                            </div>
                        ` : ''}
                        
                        ${email.ccRecipients?.length > 0 ? `
                            <div class="info-row">
                                <span class="info-label">Cc:</span>
                                <span class="info-value">${email.ccRecipients.map(r => 
                                    this.escapeHtml(r.emailAddress?.name || r.emailAddress?.address || '')
                                ).join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="email-detail-body">
                        ${this.getEmailContent(email)}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()">Fermer</button>
                    ${!hasTask ? `
                        <button class="btn primary" onclick="window.pageManager.createTaskFromEmail('${emailId}'); this.closest('.modal-overlay').remove()">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : `
                        <button class="btn success" onclick="window.pageManager.viewTask('${emailId}'); this.closest('.modal-overlay').remove()">
                            <i class="fas fa-check-circle"></i> Voir la tâche
                        </button>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const sender = email.from?.emailAddress?.name || 'Inconnu';
        const suggestedTitle = `Email de ${sender}: ${email.subject || 'Sans sujet'}`;
        const suggestedPriority = this.determinePriority(email);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content task-modal">
                <div class="modal-header">
                    <h2>Créer une tâche</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>Titre de la tâche</label>
                        <input type="text" id="task-title" class="form-input" value="${this.escapeHtml(suggestedTitle)}">
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="task-description" class="form-textarea" rows="4">${this.escapeHtml(email.bodyPreview || '')}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Priorité</label>
                            <select id="task-priority" class="form-select">
                                <option value="urgent" ${suggestedPriority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                <option value="high" ${suggestedPriority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${suggestedPriority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${suggestedPriority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Échéance</label>
                            <input type="date" id="task-due-date" class="form-input">
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                    <button class="btn primary" onclick="window.pageManager.createTaskFromModal('${emailId}')">
                        <i class="fas fa-check"></i> Créer la tâche
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
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
        
        this.renderEmails();
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.renderEmails();
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
        const createBtn = document.querySelector('.btn-control.primary');
        if (createBtn) {
            const count = this.selectedEmails.size;
            createBtn.disabled = count === 0;
            createBtn.classList.toggle('disabled', count === 0);
            const badge = createBtn.querySelector('.badge');
            if (badge) badge.textContent = count;
        }
        
        // Mettre à jour les stats
        const statElement = document.querySelector('.stat-item .fa-check-circle')?.parentElement;
        if (statElement) {
            statElement.innerHTML = `<i class="fas fa-check-circle"></i> ${this.selectedEmails.size} sélectionnés`;
        }
    }

    handleEmailClick(emailId) {
        this.showEmailModal(emailId);
    }

    // ========================================
    // CRÉATION DE TÂCHES
    // ========================================
    
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
            priority: this.determinePriority(email),
            dueDate: null,
            emailId: emailId,
            category: email.category
        };
        
        if (window.taskManager) {
            const task = window.taskManager.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager.saveTasks();
                return task;
            }
        }
        
        return null;
    }

    async createTaskFromModal(emailId) {
        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-due-date')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        const email = this.getEmailById(emailId);
        if (!email) return;

        const taskData = {
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            emailId: emailId,
            category: email.category
        };

        if (window.taskManager) {
            const task = window.taskManager.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager.saveTasks();
                window.uiManager?.showToast('Tâche créée avec succès', 'success');
                document.querySelector('.modal-overlay')?.remove();
                this.renderEmails();
            }
        }
    }

    determinePriority(email) {
        if (email.importance === 'high') return 'urgent';
        if (email.category === 'security') return 'high';
        if (email.category === 'finance') return 'high';
        if (email.category === 'tasks') return 'high';
        if (email.categoryScore > 120) return 'high';
        if (email.category === 'meetings') return 'medium';
        return 'medium';
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

    // ========================================
    // ANALYSE IA
    // ========================================
    
    async analyzeEmail(emailId) {
        const email = this.getEmailById(emailId);
        if (!email || !window.aiTaskAnalyzer) return;
        
        window.uiManager?.showLoading('Analyse IA en cours...');
        
        try {
            const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            this.aiAnalysisResults.set(emailId, analysis);
            
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Analyse terminée', 'success');
            
            // Rafraîchir la carte email
            const emailCard = document.querySelector(`[data-email-id="${emailId}"]`);
            if (emailCard) {
                const newCard = this.renderEmailCard(email);
                const temp = document.createElement('div');
                temp.innerHTML = newCard;
                emailCard.replaceWith(temp.firstChild);
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur analyse IA:', error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur analyse IA', 'error');
        }
    }

    async analyzePreselectedEmails() {
        const emails = this.getAllEmails();
        const preselectedEmails = emails.filter(e => 
            e.isPreselectedForTasks && 
            !this.aiAnalysisResults.has(e.id)
        ).slice(0, 5);
        
        if (preselectedEmails.length === 0) return;
        
        for (const email of preselectedEmails) {
            await this.analyzeEmail(email.id);
        }
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

    changeViewMode(mode) {
        this.currentViewMode = mode;
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
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }

    getTaskPreselectedCategories() {
        if (window.categoryManager?.getTaskPreselectedCategories) {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            return [];
        }
    }

    // ========================================
    // GROUPEMENT
    // ========================================
    
    groupEmails(emails) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (this.currentViewMode === 'grouped-domain') {
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
                    emails: []
                };
            }
            
            groups[groupKey].emails.push(email);
        });
        
        return groups;
    }

    toggleGroup(groupKey) {
        const groupEl = document.getElementById(`group-${groupKey}`);
        const toggleIcon = groupEl?.previousElementSibling.querySelector('.group-toggle');
        
        if (groupEl) {
            groupEl.classList.toggle('collapsed');
            if (toggleIcon) {
                toggleIcon.classList.toggle('fa-chevron-down');
                toggleIcon.classList.toggle('fa-chevron-up');
            }
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
    // ÉVÉNEMENTS
    // ========================================
    
    setupEventListeners() {
        // Scan terminé
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé');
            this.emailsCache.emails = [];
            if (this.currentPage === 'emails') {
                this.renderEmails();
            }
        });

        // Recatégorisation
        window.addEventListener('emailsRecategorized', () => {
            console.log('[PageManager] Emails recatégorisés');
            this.emailsCache.emails = [];
            if (this.currentPage === 'emails') {
                this.renderEmails();
            }
        });
        
        // Changement de paramètres
        window.addEventListener('categorySettingsChanged', () => {
            if (this.currentPage === 'emails') {
                setTimeout(() => this.renderEmails(), 100);
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

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.category === 'security') return '#991b1b';
        if (email.category === 'finance') return '#dc2626';
        if (email.category === 'tasks') return '#ef4444';
        if (email.category === 'marketing_news') return '#8b5cf6';
        if (email.hasAttachments) return '#f59e0b';
        return '#3b82f6';
    }

    getEmailContent(email) {
        if (email.body?.content) {
            // Si c'est du HTML, le nettoyer
            if (email.body.content.includes('<')) {
                return this.cleanHtml(email.body.content);
            }
            return `<pre>${this.escapeHtml(email.body.content)}</pre>`;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu')}</p>`;
    }

    cleanHtml(html) {
        // Nettoyer le HTML dangereux
        const cleaned = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/on\w+="[^"]*"/gi, '');
        
        return cleaned;
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        document.querySelector('.explanation-message')?.remove();
    }

    // ========================================
    // STYLES CSS COMPLETS
    // ========================================
    
    addStyles() {
        if (document.getElementById('pageManagerStylesV16')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pageManagerStylesV16';
        styles.textContent = `
            /* Reset et variables */
            .emails-page-v16 * {
                box-sizing: border-box;
            }
            
            .emails-page-v16 {
                --primary: #3b82f6;
                --primary-dark: #2563eb;
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
                --radius: 8px;
                --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
                
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: var(--gray-800);
                line-height: 1.5;
            }

            /* Page layout */
            .emails-page-v16 {
                padding: 20px;
                max-width: 1600px;
                margin: 0 auto;
            }

            /* Status bar */
            .status-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 12px 16px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }

            .provider-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 14px;
            }

            .provider-status.connected {
                color: var(--success);
            }

            .provider-status.disconnected {
                color: var(--gray-500);
            }

            .status-dot {
                width: 8px;
                height: 8px;
                background: var(--success);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            .email-stats {
                display: flex;
                gap: 16px;
                font-size: 13px;
                color: var(--gray-600);
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .stat-item.newsletter { color: #8b5cf6; font-weight: 600; }
            .stat-item.spam { color: #ef4444; font-weight: 600; }
            .stat-item.preselected { color: #f59e0b; font-weight: 600; }

            /* Message explicatif */
            .explanation-message {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                margin-bottom: 16px;
                background: #eff6ff;
                border: 1px solid #3b82f6;
                border-radius: var(--radius);
                font-size: 14px;
                color: #1e40af;
            }

            .explanation-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .close-explanation {
                background: none;
                border: none;
                color: #3b82f6;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .close-explanation:hover {
                background: rgba(59, 130, 246, 0.1);
            }

            /* Barre de contrôle */
            .controls-bar {
                display: flex;
                gap: 16px;
                margin-bottom: 16px;
                padding: 16px;
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                flex-wrap: wrap;
                align-items: center;
            }

            .control-group {
                display: flex;
                gap: 8px;
            }

            .btn-control {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .btn-control:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
                transform: translateY(-1px);
            }

            .btn-control.primary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .btn-control.primary:hover {
                background: var(--primary-dark);
                border-color: var(--primary-dark);
            }

            .btn-control.danger {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }

            .btn-control.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .btn-control .badge {
                background: white;
                color: var(--primary);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
                margin-left: 4px;
            }

            /* Recherche */
            .search-container {
                position: relative;
                flex: 1;
                max-width: 400px;
            }

            .search-input {
                width: 100%;
                padding: 8px 14px 8px 36px;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 13px;
                transition: all 0.2s;
            }

            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 14px;
            }

            .clear-search {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gray-200);
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: var(--gray-600);
                transition: all 0.2s;
            }

            .clear-search:hover {
                background: var(--danger);
                color: white;
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: var(--gray-100);
                border-radius: 6px;
                padding: 2px;
            }

            .view-mode {
                background: none;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                color: var(--gray-600);
                transition: all 0.2s;
            }

            .view-mode:hover {
                background: rgba(0, 0, 0, 0.05);
            }

            .view-mode.active {
                background: white;
                color: var(--gray-800);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            /* Filtres catégories */
            .category-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }

            .category-filter {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .category-filter:hover {
                background: var(--gray-50);
                border-color: var(--gray-300);
                transform: translateY(-1px);
            }

            .category-filter.active {
                color: white;
                border-color: transparent;
            }

            .category-filter.preselected {
                box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
            }

            .category-filter.newsletter {
                border-color: #8b5cf6;
            }

            .category-filter.spam {
                border-color: #ef4444;
            }

            .filter-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 1px 6px;
                border-radius: 10px;
                font-size: 11px;
            }

            .category-filter.active .filter-count {
                background: rgba(255, 255, 255, 0.2);
            }

            .star-badge {
                font-size: 10px;
            }

            /* Liste emails */
            .emails-container {
                background: white;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                overflow: hidden;
            }

            .emails-list {
                display: flex;
                flex-direction: column;
            }

            .email-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-bottom: 1px solid var(--gray-100);
                transition: all 0.2s;
                position: relative;
            }

            .email-card:hover {
                background: var(--gray-50);
            }

            .email-card.selected {
                background: #eff6ff;
            }

            .email-card.newsletter-email {
                border-left: 3px solid #8b5cf6;
                background: rgba(139, 92, 246, 0.02);
            }

            .email-card.spam-email {
                border-left: 3px solid #ef4444;
                background: rgba(239, 68, 68, 0.02);
                opacity: 0.8;
            }

            .email-card.preselected {
                border-left: 3px solid #f59e0b;
            }

            .email-card.has-task {
                background: rgba(16, 185, 129, 0.05);
            }

            .email-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
                flex-shrink: 0;
            }

            .email-priority {
                width: 3px;
                height: 40px;
                border-radius: 2px;
                flex-shrink: 0;
            }

            .email-content {
                flex: 1;
                min-width: 0;
                cursor: pointer;
            }

            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 4px;
                gap: 12px;
            }

            .email-subject {
                margin: 0;
                font-size: 14px;
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
                gap: 8px;
                color: var(--gray-500);
                font-size: 12px;
                flex-shrink: 0;
            }

            .high-importance {
                color: var(--danger);
            }

            .email-sender {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 4px;
                color: var(--gray-600);
                font-size: 13px;
            }

            .sender-name {
                font-weight: 500;
            }

            .sender-email {
                color: var(--gray-400);
                font-size: 12px;
            }

            .email-category {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                margin-top: 4px;
            }

            .preselected-badge {
                margin-left: 4px;
            }

            .email-preview {
                margin-top: 6px;
                color: var(--gray-500);
                font-size: 12px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .ai-analysis-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                margin-top: 6px;
                padding: 3px 8px;
                background: #ddd6fe;
                color: #7c3aed;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }

            .email-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }

            .action-btn {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 6px;
                color: var(--gray-600);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .action-btn:hover {
                background: var(--gray-50);
                border-color: var(--gray-300);
                transform: scale(1.05);
            }

            .action-btn.create-task:hover {
                background: var(--primary);
                border-color: var(--primary);
                color: white;
            }

            .action-btn.view-task {
                color: var(--success);
                border-color: var(--success);
            }

            .action-btn.analyze:hover {
                background: #8b5cf6;
                border-color: #8b5cf6;
                color: white;
            }

            /* Groupes emails */
            .emails-grouped {
                display: flex;
                flex-direction: column;
            }

            .email-group {
                margin-bottom: 16px;
            }

            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: var(--gray-50);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius);
                cursor: pointer;
                transition: all 0.2s;
            }

            .group-header:hover {
                background: var(--gray-100);
            }

            .group-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .group-name {
                font-weight: 600;
                color: var(--gray-800);
            }

            .group-count {
                color: var(--gray-500);
                font-size: 13px;
            }

            .group-emails {
                margin-top: 8px;
                border: 1px solid var(--gray-200);
                border-radius: var(--radius);
                overflow: hidden;
                transition: all 0.3s;
            }

            .group-emails.collapsed {
                display: none;
            }

            .group-emails .email-card:last-child {
                border-bottom: none;
            }

            /* Modal */
            .modal-overlay {
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
                animation: fadeIn 0.2s;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: slideIn 0.2s;
            }

            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .email-modal {
                max-width: 800px;
            }

            .task-modal {
                max-width: 600px;
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

            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: var(--gray-400);
                cursor: pointer;
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            }

            .modal-close:hover {
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
            }

            .email-detail-header h3 {
                margin: 0 0 12px 0;
                color: var(--gray-800);
                font-size: 18px;
            }

            .email-detail-category {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
            }

            .email-detail-info {
                background: var(--gray-50);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .info-row {
                display: flex;
                align-items: start;
                gap: 12px;
                margin-bottom: 12px;
            }

            .info-row:last-child {
                margin-bottom: 0;
            }

            .info-label {
                font-weight: 600;
                color: var(--gray-600);
                min-width: 60px;
                font-size: 13px;
            }

            .info-value {
                color: var(--gray-800);
                font-size: 13px;
            }

            .email-detail-body {
                line-height: 1.6;
                color: var(--gray-700);
                font-size: 14px;
            }

            .email-detail-body pre {
                background: var(--gray-50);
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 13px;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px;
                border-top: 1px solid var(--gray-200);
            }

            /* Formulaire */
            .form-group {
                margin-bottom: 16px;
            }

            .form-group label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: var(--gray-700);
                font-size: 13px;
            }

            .form-input,
            .form-textarea,
            .form-select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.2s;
            }

            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Boutons génériques */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
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

            .btn.success {
                background: var(--success);
                color: white;
                border-color: var(--success);
            }

            .btn.gmail {
                background: #ea4335;
                color: white;
                border-color: #ea4335;
            }

            .btn.gmail:hover {
                background: #d33b2c;
                border-color: #d33b2c;
            }

            .btn.outlook {
                background: #0078d4;
                color: white;
                border-color: #0078d4;
            }

            .btn.outlook:hover {
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
                margin-bottom: 16px;
            }

            .empty-state h2 {
                margin: 0 0 8px 0;
                color: var(--gray-800);
                font-size: 24px;
            }

            .empty-state p {
                color: var(--gray-600);
                margin-bottom: 24px;
                font-size: 14px;
            }

            .empty-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .no-results {
                text-align: center;
                padding: 40px;
                color: var(--gray-500);
                font-size: 14px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .emails-page-v16 {
                    padding: 12px;
                }

                .status-bar {
                    flex-direction: column;
                    gap: 12px;
                    align-items: flex-start;
                }

                .controls-bar {
                    flex-direction: column;
                    gap: 12px;
                }

                .control-group {
                    width: 100%;
                    justify-content: center;
                }

                .search-container {
                    max-width: none;
                    width: 100%;
                }

                .email-card {
                    padding: 10px 12px;
                }

                .email-actions {
                    gap: 4px;
                }

                .action-btn {
                    width: 28px;
                    height: 28px;
                    font-size: 12px;
                }

                .modal-content {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .form-row {
                    grid-template-columns: 1fr;
                }
            }

            /* Autres styles de page */
            .page-header {
                margin-bottom: 24px;
            }

            .page-header h1 {
                margin: 0;
                font-size: 28px;
                color: var(--gray-800);
            }

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 16px;
            }

            .category-card {
                background: white;
                border-radius: var(--radius);
                padding: 20px;
                box-shadow: var(--shadow);
                text-align: center;
            }

            .category-icon {
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 24px;
                border-radius: 12px;
            }

            .category-card h3 {
                margin: 0 0 8px 0;
                color: var(--gray-800);
            }

            .category-card p {
                margin: 0;
                color: var(--gray-600);
                font-size: 14px;
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
        window.pageManager.aiAnalysisResults?.clear();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage:', e);
    }
}

// Créer nouvelle instance
console.log('[PageManager] 🚀 Création instance v16.0 CORRIGÉE');
window.pageManager = new PageManager();

// Bind des méthodes
const methods = Object.getOwnPropertyNames(PageManager.prototype);
methods.forEach(method => {
    if (method !== 'constructor' && typeof window.pageManager[method] === 'function') {
        window.pageManager[method] = window.pageManager[method].bind(window.pageManager);
    }
});

console.log('✅ PageManager v16.0 chargé avec succès!');
console.log('📧 Version corrigée avec toutes les fonctionnalités restaurées');
console.log('🎨 Styles optimisés et design compact');
console.log('🔧 Catégorisation corrigée');
