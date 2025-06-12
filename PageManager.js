// PageManager.js - Version 12.0 - Intégration avec EmailScanner centralisé

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.temporaryEmailStorage = [];
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // NOUVEAU : État de synchronisation avec EmailScanner
        this.preselectedCategories = [];
        this.emailsWithPreselection = [];
        
        // Page renderers - DASHBOARD SUPPRIMÉ
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

    init() {
        console.log('[PageManager] Initialized v12.0 - Intégration EmailScanner centralisé');
        
        // Configurer les listeners pour EmailScanner
        this.setupEmailScannerListeners();
        
        // Synchroniser avec EmailScanner au démarrage
        this.syncWithEmailScanner();
    }

    // =====================================
    // SYNCHRONISATION AVEC EMAILSCANNER
    // =====================================
    setupEmailScannerListeners() {
        // Écouter les changements de catégories pré-sélectionnées
        window.addEventListener('preselectedCategoriesChanged', (event) => {
            const { categories } = event.detail;
            console.log('[PageManager] Catégories pré-sélectionnées mises à jour:', categories);
            this.preselectedCategories = categories;
            this.updateEmailsPreselectionDisplay();
        });

        // Écouter la fin du scan
        window.addEventListener('scanCompleted', (event) => {
            const { results, preselectedCategories } = event.detail;
            console.log('[PageManager] Scan terminé, résultats reçus:', results);
            this.preselectedCategories = preselectedCategories;
            this.handleScanCompletion(results);
        });

        // Écouter les erreurs de scan
        window.addEventListener('scanError', (event) => {
            const { error } = event.detail;
            console.error('[PageManager] Erreur de scan reçue:', error);
            window.uiManager?.showToast(`Erreur de scan: ${error}`, 'error');
        });

        console.log('[PageManager] Listeners EmailScanner configurés');
    }

    syncWithEmailScanner() {
        if (window.emailScanner) {
            // Récupérer les catégories pré-sélectionnées actuelles
            this.preselectedCategories = window.emailScanner.getCurrentPreselectedCategories();
            console.log('[PageManager] Synchronisé avec EmailScanner:', this.preselectedCategories);
        }
    }

    handleScanCompletion(results) {
        this.lastScanData = results;
        
        // Si on est sur la page emails, la recharger
        if (this.currentPage === 'emails') {
            this.loadPage('emails');
        }
        
        // Notification
        const totalEmails = results.total;
        const preselectedCount = results.preselected || 0;
        
        let message = `✅ ${totalEmails} emails analysés`;
        if (preselectedCount > 0) {
            message += ` (${preselectedCount} pré-sélectionnés pour tâches)`;
        }
        
        window.uiManager?.showToast(message, 'success');
    }

    // =====================================
    // MÉTHODES POUR DEMANDER UN SCAN À EMAILSCANNER
    // =====================================
    requestScan(options = {}) {
        console.log('[PageManager] Demande de scan à EmailScanner:', options);
        
        // Émettre la demande vers EmailScanner
        window.dispatchEvent(new CustomEvent('requestScan', {
            detail: { options }
        }));
    }

    // =====================================
    // PAGE LOADING - DASHBOARD IGNORÉ (INCHANGÉ)
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Loading page: ${pageName}`);

        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignored - handled by index.html');
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
            console.error('[PageManager] Page content container not found');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} not found`);
            }

            window.uiManager.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Error loading page:`, error);
            window.uiManager.hideLoading();
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = `
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

    // =====================================
    // EMAILS PAGE - AVEC INTÉGRATION EMAILSCANNER
    // =====================================
    async renderEmails(container) {
        // Récupérer les emails depuis EmailScanner
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Synchroniser les catégories pré-sélectionnées
        this.preselectedCategories = window.emailScanner?.getCurrentPreselectedCategories() || [];
        
        // Initialize view mode
        this.currentViewMode = this.currentViewMode || 'grouped-domain';
        this.currentCategory = this.currentCategory || null;

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const visibleEmails = this.getVisibleEmails();
            const allVisible = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
            
            // NOUVEAU : Calculer les emails pré-sélectionnés visibles
            const preselectedVisibleEmails = visibleEmails.filter(email => email.isPreselected);
            const preselectedCount = preselectedVisibleEmails.length;
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Texte explicatif avec informations sur la pré-sélection -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized">
                            <i class="fas fa-info-circle"></i>
                            <span>
                                Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action. 
                                <strong>${preselectedCount > 0 ? `${preselectedCount} emails sont pré-sélectionnés` : 'Aucun email pré-sélectionné'}</strong> 
                                pour la création automatique de tâches selon vos paramètres.
                            </span>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Barre de contrôles avec info pré-sélection -->
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
                        
                        <!-- Modes de vue harmonisés -->
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
                        
                        <!-- Actions principales avec gestion pré-sélection -->
                        <div class="action-buttons-harmonized">
                            <!-- NOUVEAU : Bouton pour sélectionner tous les pré-sélectionnés -->
                            ${preselectedCount > 0 ? `
                                <button class="btn-harmonized btn-preselected" 
                                        onclick="window.pageManager.selectAllPreselected()"
                                        title="Sélectionner tous les emails pré-sélectionnés">
                                    <i class="fas fa-bullseye"></i>
                                    <span>Sélectionner pré-sélectionnés</span>
                                    <span class="count-badge-preselected">${preselectedCount}</span>
                                </button>
                            ` : ''}
                            
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
                            
                            <!-- NOUVEAU : Bouton création automatique pour pré-sélectionnés -->
                            ${preselectedCount > 0 ? `
                                <button class="btn-harmonized btn-auto-tasks" onclick="window.pageManager.createTasksForAllPreselected()">
                                    <i class="fas fa-magic"></i>
                                    <span>Auto-tâches (${preselectedCount})</span>
                                </button>
                            ` : ''}
                            
                            <button class="btn-harmonized btn-secondary" onclick="window.pageManager.refreshEmails()">
                                <i class="fas fa-sync-alt"></i>
                                <span>Actualiser</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filtres de catégories avec marquage pré-sélection -->
                    <div class="status-filters-harmonized-twolines">
                        ${this.buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories)}
                    </div>

                    <!-- CONTENU DES EMAILS avec marquage pré-sélection -->
                    <div class="tasks-container-harmonized">
                        ${this.renderEmailsList()}
                    </div>
                </div>
            `;

            this.addHarmonizedEmailStyles();
            this.setupEmailsEventListeners();
        };

        renderEmailsPage();
        
        // Auto-analyze if enabled
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    // =====================================
    // NOUVELLES MÉTHODES POUR GESTION PRÉ-SÉLECTION
    // =====================================
    
    /**
     * Sélectionner tous les emails pré-sélectionnés visibles
     */
    selectAllPreselected() {
        const visibleEmails = this.getVisibleEmails();
        const preselectedEmails = visibleEmails.filter(email => email.isPreselected);
        
        // Ajouter tous les emails pré-sélectionnés à la sélection
        preselectedEmails.forEach(email => {
            this.selectedEmails.add(email.id);
        });
        
        const count = preselectedEmails.length;
        window.uiManager.showToast(`${count} emails pré-sélectionnés ajoutés à la sélection`, 'success');
        
        this.refreshEmailsView();
    }

    /**
     * Créer des tâches pour tous les emails pré-sélectionnés (via EmailScanner)
     */
    async createTasksForAllPreselected() {
        if (!window.emailScanner) {
            window.uiManager.showToast('EmailScanner non disponible', 'error');
            return;
        }

        window.uiManager.showLoading('Création automatique de tâches...');

        try {
            const result = await window.emailScanner.createTasksForPreselectedEmails();
            
            window.uiManager.hideLoading();
            
            if (result.created > 0) {
                window.uiManager.showToast(`${result.created} tâche(s) créée(s) automatiquement`, 'success');
                
                // Marquer les emails comme ayant des tâches créées
                const preselectedEmails = window.emailScanner.getPreselectedEmails();
                preselectedEmails.forEach(email => {
                    this.createdTasks.set(email.id, `auto-task-${Date.now()}`);
                });
                
                this.refreshEmailsView();
            } else {
                window.uiManager.showToast('Aucune tâche créée', 'warning');
            }
            
            if (result.errors > 0) {
                window.uiManager.showToast(`${result.errors} erreur(s) lors de la création`, 'warning');
            }
            
        } catch (error) {
            window.uiManager.hideLoading();
            console.error('[PageManager] Erreur création tâches automatiques:', error);
            window.uiManager.showToast('Erreur lors de la création automatique', 'error');
        }
    }

    /**
     * Mettre à jour l'affichage des emails avec le marquage pré-sélection
     */
    updateEmailsPreselectionDisplay() {
        if (this.currentPage === 'emails') {
            this.refreshEmailsView();
        }
    }

    // =====================================
    // RENDU DES EMAILS AVEC MARQUAGE PRÉ-SÉLECTION
    // =====================================
    renderHarmonizedEmailRow(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const isPreselected = email.isPreselected || false; // NOUVEAU
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        // Générer couleur pour l'avatar
        const avatarColor = this.generateAvatarColor(senderName);
        
        // Classes CSS supplémentaires pour pré-sélection
        const preselectedClass = isPreselected ? 'preselected' : '';
        
        return `
            <div class="task-harmonized-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${preselectedClass}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <!-- NOUVEAU : Indicateur de pré-sélection -->
                ${isPreselected ? `
                    <div class="preselection-indicator" title="Email pré-sélectionné pour création de tâches">
                        <i class="fas fa-bullseye"></i>
                    </div>
                ` : ''}
                
                <!-- Checkbox de sélection harmonisé -->
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <!-- Indicateur de priorité harmonisé avec couleur pré-sélection -->
                <div class="priority-bar-harmonized" style="background-color: ${isPreselected ? '#f59e0b' : this.getEmailPriorityColor(email)}"></div>
                
                <!-- Contenu principal harmonisé et centré -->
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">
                            ${this.escapeHtml(email.subject || 'Sans sujet')}
                            ${isPreselected ? '<i class="fas fa-star preselected-star" title="Pré-sélectionné"></i>' : ''}
                        </h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">📧 Email</span>
                            ${isPreselected ? '<span class="preselected-badge">🎯 Auto</span>' : ''}
                            <span class="deadline-badge-harmonized">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                        ${isPreselected ? '<span class="reply-indicator-harmonized preselected-text">• Pré-sélectionné</span>' : ''}
                    </div>
                </div>
                
                <!-- Actions rapides harmonisées -->
                <div class="task-actions-harmonized">
                    ${this.renderHarmonizedEmailActions(email)}
                </div>
            </div>
        `;
    }

    // =====================================
    // FILTRES DE CATÉGORIES AVEC MARQUAGE PRÉ-SÉLECTION
    // =====================================
    buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) {
        const tabs = [
            { id: 'all', name: 'Tous', icon: '📧', count: totalEmails, isPreselected: false }
        ];
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                const isPreselected = this.preselectedCategories.includes(catId);
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
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
            const preselectedClass = tab.isPreselected ? 'preselected-category' : '';
            const preselectedIcon = tab.isPreselected ? '<i class="fas fa-star preselected-star-small"></i>' : '';
            
            return `
                <button class="status-pill-harmonized-twolines ${this.currentCategory === tab.id ? 'active' : ''} ${preselectedClass}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                            ${preselectedIcon}
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    // =====================================
    // STYLES HARMONISÉS AVEC AJOUTS PRÉ-SÉLECTION
    // =====================================
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Styles existants inchangés... */
            /* Variables CSS identiques à TasksView */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-padding-vertical: 0;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-line-height: 1;
                --btn-gap: 8px;
                
                --pill-height: 48px;
                --pill-padding-horizontal: 16px;
                --pill-padding-vertical: 0;
                --pill-font-size: 14px;
                --pill-border-radius: 12px;
                
                --card-height: 76px;
                --card-padding: 14px;
                --card-border-radius: 12px;
                
                --input-height: 44px;
                --input-padding: 12px 16px;
                --input-font-size: 13px;
                
                --action-btn-size: 36px;
                --action-btn-font-size: 13px;
                
                --gap-tiny: 4px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --gap-xl: 20px;
                
                --border-width: 1px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --shadow-primary: 0 4px 12px rgba(99, 102, 241, 0.25);
                
                /* NOUVELLES VARIABLES POUR PRÉ-SÉLECTION */
                --preselected-color: #f59e0b;
                --preselected-bg: rgba(245, 158, 11, 0.1);
                --preselected-border: rgba(245, 158, 11, 0.3);
            }
            
            /* Page principale */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            /* Texte explicatif */
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
                backdrop-filter: blur(10px);
                position: relative;
            }

            .explanation-text-harmonized i {
                font-size: 16px;
                color: #3b82f6;
                flex-shrink: 0;
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
                flex-shrink: 0;
            }
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                border-color: rgba(59, 130, 246, 0.3);
                transform: scale(1.1);
            }
            
            /* NOUVEAUX STYLES PRÉ-SÉLECTION */
            
            /* Indicateur de pré-sélection sur les cartes */
            .preselection-indicator {
                position: absolute;
                top: 8px;
                right: 8px;
                background: var(--preselected-color);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                z-index: 3;
                animation: pulse-preselected 2s infinite;
            }
            
            @keyframes pulse-preselected {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            /* Cartes pré-sélectionnées */
            .task-harmonized-card.preselected {
                background: linear-gradient(135deg, var(--preselected-bg) 0%, rgba(245, 158, 11, 0.05) 100%);
                border-left: 4px solid var(--preselected-color);
                position: relative;
            }
            
            .task-harmonized-card.preselected::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, var(--preselected-color), transparent);
                opacity: 0.7;
            }
            
            /* Étoile de pré-sélection dans le titre */
            .preselected-star {
                color: var(--preselected-color);
                margin-left: 8px;
                font-size: 12px;
                animation: twinkle 2s infinite;
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Badge pré-sélectionné */
            .preselected-badge {
                background: var(--preselected-color);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
                margin-left: 4px;
            }
            
            /* Texte pré-sélectionné */
            .preselected-text {
                color: var(--preselected-color) !important;
                font-weight: 600;
            }
            
            /* Bouton pré-sélectionnés */
            .btn-harmonized.btn-preselected {
                background: linear-gradient(135deg, var(--preselected-color) 0%, #d97706 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            
            .btn-harmonized.btn-preselected:hover {
                background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
            }
            
            .count-badge-preselected {
                background: rgba(255, 255, 255, 0.3);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 6px;
                margin-left: 4px;
                min-width: 16px;
                text-align: center;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Bouton auto-tâches */
            .btn-harmonized.btn-auto-tasks {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            
            .btn-harmonized.btn-auto-tasks:hover {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }
            
            /* Catégories pré-sélectionnées */
            .status-pill-harmonized-twolines.preselected-category {
                background: linear-gradient(135deg, var(--preselected-bg) 0%, rgba(245, 158, 11, 0.05) 100%);
                border: 2px solid var(--preselected-border);
                position: relative;
            }
            
            .status-pill-harmonized-twolines.preselected-category::after {
                content: '';
                position: absolute;
                top: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                background: var(--preselected-color);
                border-radius: 50%;
                border: 2px solid white;
            }
            
            .preselected-star-small {
                color: var(--preselected-color);
                font-size: 8px;
                margin-left: 2px;
            }
            
            /* Barre de contrôles */
            .controls-bar-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--gap-large);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                min-height: calc(var(--btn-height) + var(--gap-medium) * 2);
                box-sizing: border-box;
            }
            
            /* Section recherche */
            .search-section-harmonized {
                flex: 0 0 300px;
                height: var(--btn-height);
                display: flex;
                align-items: center;
            }
            
            .search-box-harmonized {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
            }
            
            .search-input-harmonized {
                width: 100%;
                height: var(--btn-height);
                padding: 0 var(--gap-medium) 0 44px;
                border: var(--border-width) solid #d1d5db;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                box-sizing: border-box;
                line-height: var(--btn-line-height);
                outline: none;
                text-align: left;
                vertical-align: middle;
            }
            
            .search-input-harmonized:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-icon-harmonized {
                position: absolute;
                left: var(--gap-medium);
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .search-clear-harmonized {
                position: absolute;
                right: var(--gap-small);
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                transition: all var(--transition-speed) ease;
                outline: none;
            }
            
            .search-clear-harmonized:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }
            
            /* Modes de vue */
            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: var(--border-width) solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: var(--gap-tiny);
                gap: 2px;
                height: var(--btn-height);
                box-sizing: border-box;
                align-items: center;
                justify-content: center;
            }
            
            .view-mode-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: 0 var(--btn-padding-horizontal);
                height: calc(var(--btn-height) - var(--gap-small));
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                white-space: nowrap;
                box-sizing: border-box;
                min-width: 120px;
                flex: 1;
                text-align: center;
            }
            
            .view-mode-harmonized:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
                transform: translateY(-1px);
            }
            
            /* Actions principales */
            .action-buttons-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            .action-buttons-harmonized > *,
            .action-buttons-harmonized .btn-harmonized,
            .action-buttons-harmonized .selection-info-harmonized {
                height: var(--btn-height);
                min-height: var(--btn-height);
                max-height: var(--btn-height);
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-harmonized {
                background: white;
                color: #374151;
                border: var(--border-width) solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: var(--btn-padding-vertical) var(--btn-padding-horizontal);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                text-decoration: none;
                white-space: nowrap;
                box-shadow: var(--shadow-base);
                min-width: fit-content;
                gap: var(--btn-gap);
            }
            
            .btn-harmonized:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-harmonized.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: var(--shadow-primary);
            }
            
            .btn-harmonized.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-harmonized.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-harmonized.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            /* Bouton sélection/désélection */
            .btn-harmonized.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                position: relative;
            }
            
            .btn-harmonized.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
                transform: translateY(-1px);
            }
            
            .count-badge-small {
                background: #0ea5e9;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 6px;
                margin-left: 4px;
                min-width: 16px;
                text-align: center;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-harmonized.btn-clear-selection {
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                width: var(--btn-height);
                height: var(--btn-height);
                min-width: var(--btn-height);
                max-width: var(--btn-height);
                padding: 0;
                border-radius: var(--btn-border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-harmonized.btn-clear-selection:hover {
                background: #e5e7eb;
                color: #374151;
                transform: translateY(-1px);
            }
            
            .selection-info-harmonized {
                height: var(--btn-height);
                padding: var(--btn-padding-vertical) var(--btn-padding-horizontal);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: var(--border-width) solid #93c5fd;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                color: #1e40af;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                box-sizing: border-box;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                text-align: center;
            }
            
            .count-badge-harmonized {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 3px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Dropdown pour actions groupées */
            .dropdown-action-harmonized {
                position: relative;
                display: inline-block;
            }
            
            .dropdown-toggle {
                position: relative;
            }
            
            .dropdown-menu-harmonized {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                z-index: 1000;
                padding: 8px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
            }
            
            .dropdown-menu-harmonized.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 10px 16px;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                color: #374151;
                font-size: var(--btn-font-size);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .dropdown-item-harmonized:hover {
                background: #f8fafc;
                color: #1f2937;
            }
            
            .dropdown-item-harmonized.danger {
                color: #dc2626;
            }
            
            .dropdown-item-harmonized.danger:hover {
                background: #fef2f2;
                color: #b91c1c;
            }
            
            .dropdown-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }
            
            /* Filtres de catégories 2 lignes */
            .status-filters-harmonized-twolines {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                align-items: stretch;
                justify-content: flex-start;
                width: 100%;
                min-height: auto;
            }
            
            .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                height: auto;
                min-height: 60px;
                padding: var(--gap-small);
                font-size: 12px;
                font-weight: 700;
                flex: 0 1 calc(16.666% - var(--gap-small));
                min-width: 120px;
                max-width: 180px;
                box-sizing: border-box;
                border-radius: var(--pill-border-radius);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: var(--border-width) solid #e5e7eb;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .pill-content-twolines {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: var(--gap-tiny);
                width: 100%;
                height: 100%;
                text-align: center;
            }
            
            .pill-first-line-twolines {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-tiny);
                width: 100%;
                flex-shrink: 0;
                padding: 4px 8px;
                margin-bottom: 4px;
            }
            
            .pill-second-line-twolines {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                text-align: center;
                flex: 1;
                min-height: 0;
            }
            
            .pill-icon-twolines {
                font-size: 16px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-count-twolines {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
                min-width: 18px;
                text-align: center;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-text-twolines {
                font-weight: 700;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                word-break: break-word;
                hyphens: auto;
                max-width: 100%;
                white-space: normal;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }
            
            .status-pill-harmonized-twolines:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
            }
            
            .status-pill-harmonized-twolines.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
            }
            
            .status-pill-harmonized-twolines.active .pill-first-line-twolines {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .status-pill-harmonized-twolines.active .pill-count-twolines {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }
            
            /* Container des emails */
            .tasks-container-harmonized {
                background: transparent;
            }
            
            /* Liste d'emails */
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                background: transparent;
            }
            
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                box-shadow: none;
                overflow: hidden;
                min-height: var(--card-height);
                max-height: var(--card-height);
                box-sizing: border-box;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: var(--border-width) solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: var(--border-width) solid #e5e7eb;
            }
            
            .task-harmonized-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 1;
            }
            
            .task-harmonized-card:hover::before {
                opacity: 1;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }
            
            .task-harmonized-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            .task-checkbox-harmonized {
                margin-right: var(--gap-medium);
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all var(--transition-speed) ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: 700;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                flex-shrink: 0;
            }
            
            .task-harmonized-card:hover .priority-bar-harmonized {
                height: 60px;
                width: 5px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: var(--gap-tiny);
                height: 100%;
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: var(--gap-tiny);
            }
            
            .task-title-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-align: left;
                display: flex;
                align-items: center;
            }
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
            }
            
            .task-type-badge-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                color: #475569;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: var(--border-width) solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                white-space: nowrap;
                line-height: 1;
                text-align: center;
            }
            
            .deadline-badge-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                font-size: 10px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
                white-space: nowrap;
                border: var(--border-width) solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                line-height: 1;
                text-align: center;
                background: #f8fafc;
                color: #64748b;
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-tiny);
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .task-recipient-harmonized i {
                color: #9ca3af;
                font-size: 12px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
                text-align: left;
                display: flex;
                align-items: center;
            }
            
            .reply-indicator-harmonized {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
                text-align: center;
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-tiny);
                margin-left: var(--gap-medium);
                flex-shrink: 0;
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
                font-size: var(--action-btn-font-size);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
                text-align: center;
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.create-task {
                color: #3b82f6;
                border-color: transparent;
            }
            
            .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }
            
            .action-btn-harmonized.view-task {
                color: #16a34a;
                border-color: transparent;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }
            
            .action-btn-harmonized.view-task:hover {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
                border-color: transparent;
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }
            
            /* État vide */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-harmonized {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-align: center;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
                text-align: center;
            }
            
            /* RESPONSIVE */
            @media (max-width: 1200px) {
                :root {
                    --btn-height: 42px;
                    --card-height: 84px;
                    --action-btn-size: 34px;
                }
                
                .status-filters-harmonized-twolines .status-pill-harmonized-twolines {
                    flex: 0 1 calc(20% - var(--gap-small));
                    min-width: 100px;
                    max-width: 160px;
                    min-height: 56px;
                }
            }
            
            @media (max-width: 1024px) {
                .controls-bar-harmonized {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                    padding: var(--gap-large);
                }
                
                .search-section-harmonized {
                    flex: none;
                    width: 100%;
                    order: 1;
                }
                
                .view-modes-harmonized {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons-harmonized {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // =====================================
    // MÉTHODES DE SÉLECTION ET ACTIONS (AVEC AJOUTS PRÉ-SÉLECTION)
    // =====================================
    
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager.showToast('Emails désélectionnés', 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
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
        window.uiManager.showToast('Sélection effacée', 'info');
    }

    refreshEmailsView() {
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        this.updateControlsBar();
    }

    updateControlsBar() {
        const container = document.getElementById('pageContent');
        if (container) {
            const searchInput = document.getElementById('emailSearchInput');
            const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
            
            this.renderEmails(container);
            
            setTimeout(() => {
                const newSearchInput = document.getElementById('emailSearchInput');
                if (newSearchInput && currentSearchValue) {
                    newSearchInput.value = currentSearchValue;
                }
            }, 100);
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES (INCHANGÉES)
    // =====================================
    
    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        let filteredEmails = emails;
        
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

    // =====================================
    // RESTE DES MÉTHODES (INCHANGÉES - VOIR FICHIER ORIGINAL)
    // =====================================
    
    // Toutes les autres méthodes restent identiques au fichier original...
    // (renderScanner, renderTasks, renderCategories, renderSettings, renderRanger,
    //  generateAvatarColor, getEmailPriorityColor, formatEmailDate, escapeHtml, etc.)

    // =====================================
    // MÉTHODES MANQUANTES AJOUTÉES
    // =====================================
    
    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    getTemporaryEmails() {
        return this.temporaryEmailStorage || [];
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

    // =====================================
    // MÉTHODES DE RENDU AUTRES PAGES
    // =====================================
    
    renderScanner(container) {
        console.log('[PageManager] Rendering scanner page...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Using modern ScanStartModule');
                return window.scanStartModule.render(container);
            } catch (error) {
                console.error('[PageManager] Error with ScanStartModule, falling back:', error);
            }
        }
        
        console.log('[PageManager] Using fallback scanner interface');
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

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    
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

    // =====================================
    // MÉTHODES POUR LA GESTION DES VUES
    // =====================================
    
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

    // =====================================
    // MÉTHODES POUR LES ACTIONS
    // =====================================
    
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

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
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

    // =====================================
    // MÉTHODES POUR LES ACTIONS GROUPÉES
    // =====================================
    
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
        
        window.uiManager.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
        this.clearSelection();
    }

    async bulkArchive() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Archiver ${selectedEmails.length} email(s) ?`)) {
            window.uiManager.showToast(`${selectedEmails.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Supprimer définitivement ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
            selectedEmails.forEach(emailId => {
                const emails = this.getTemporaryEmails();
                const index = emails.findIndex(email => email.id === emailId);
                if (index !== -1) {
                    emails.splice(index, 1);
                }
            });
            
            window.uiManager.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        const emails = selectedEmails.map(id => this.getEmailById(id)).filter(Boolean);
        
        const csvContent = [
            ['De', 'Sujet', 'Date', 'Contenu'].join(','),
            ...emails.map(email => [
                `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                `"${email.subject || ''}"`,
                email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
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
        
        window.uiManager.showToast('Export terminé', 'success');
        this.clearSelection();
    }

    // =====================================
    // MÉTHODES POUR LES TÂCHES
    // =====================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                let analysis = this.aiAnalysisResults.get(emailId);
                if (!analysis && window.aiTaskAnalyzer) {
                    analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(emailId, analysis);
                }
                
                if (analysis && window.taskManager) {
                    const taskData = this.buildTaskDataFromAnalysis(email, analysis);
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManager] Error creating task for email:', emailId, error);
            }
        }
        
        window.uiManager.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            window.uiManager.showToast('Aucune tâche créée', 'warning');
        }
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

    getEmailById(emailId) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        return emails.find(e => e.id === emailId);
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

    // =====================================
    // MÉTHODES MODALES
    // =====================================
    
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'email_modal_' + Date.now();
        const modalHTML = `
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
                                <span style="color: #1f2937;">${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                            </div>
                            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">Date:</span>
                                <span style="color: #1f2937;">${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 700; color: #374151; min-width: 60px;">Sujet:</span>
                                <span style="color: #1f2937; font-weight: 600;">${email.subject || 'Sans sujet'}</span>
                            </div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; max-height: 400px; overflow-y: auto; line-height: 1.6; color: #374151;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                    style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu disponible'}</p>`;
    }

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
            
            if (emails.length > 0 && window.categoryManager) {
                emails.forEach(email => {
                    const result = window.categoryManager.analyzeEmail(email);
                    email.category = result.category || 'other';
                });
            }
            
            await this.loadPage('emails');
            window.uiManager.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'actualisation', 'error');
        }
    }

    async analyzeFirstEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('[PageManager] Error analyzing email:', error);
                }
            }
        }
    }
}

// Create global instance
window.pageManager = new PageManager();

// Bind methods to preserve context
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v12.0 loaded - Intégration avec EmailScanner centralisé');
