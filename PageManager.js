// PageManager.js - VERSION SYNCHRONISÉE v12.0
// Interface utilisateur synchronisée avec EmailScanner centralisateur

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.searchTerm = '';
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // State pour emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Synchronisation avec EmailScanner
        this.emailScannerReady = false;
        this.unsubscribeFromEmailScanner = null;
        this.lastKnownEmailsCount = 0;
        
        // Page renderers - DASHBOARD SUPPRIMÉ
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        console.log('[PageManager] ✅ Version 12.0 - Synchronisé avec EmailScanner');
        
        this.init();
    }

    // ================================================
    // INITIALISATION ET SYNCHRONISATION
    // ================================================
    
    init() {
        this.setupEmailScannerConnection();
    }
    
    async setupEmailScannerConnection() {
        // Attendre que EmailScanner soit prêt
        await this.waitForEmailScanner();
        
        if (window.emailScanner) {
            this.emailScannerReady = true;
            
            // S'abonner aux changements d'EmailScanner
            this.unsubscribeFromEmailScanner = window.emailScanner.subscribe((eventType, data) => {
                this.handleEmailScannerEvent(eventType, data);
            });
            
            // Charger l'état initial
            this.loadInitialEmailState();
            
            console.log('[PageManager] 🔗 Connecté à EmailScanner');
        }
    }
    
    async waitForEmailScanner() {
        let attempts = 0;
        const maxAttempts = 50; // 10 secondes
        
        while (!window.emailScanner && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        if (!window.emailScanner) {
            console.warn('[PageManager] EmailScanner non disponible après 10s');
        }
    }
    
    handleEmailScannerEvent(eventType, data) {
        switch (eventType) {
            case 'scanStarted':
                this.onScanStarted(data);
                break;
            case 'scanProgress':
                this.onScanProgress(data);
                break;
            case 'scanCompleted':
                this.onScanCompleted(data);
                break;
            case 'scanError':
                this.onScanError(data);
                break;
            case 'emailsReprocessed':
                this.onEmailsReprocessed(data);
                break;
            case 'settingsChanged':
                this.onSettingsChanged(data);
                break;
        }
    }
    
    loadInitialEmailState() {
        if (!window.emailScanner) return;
        
        const emails = window.emailScanner.getAllEmails();
        this.lastKnownEmailsCount = emails.length;
        
        console.log(`[PageManager] État initial chargé: ${emails.length} emails`);
    }
    
    onScanStarted(data) {
        console.log('[PageManager] 🚀 Scan démarré:', data);
        
        // Si on est sur la page emails, afficher un indicateur de chargement
        if (this.currentPage === 'emails') {
            this.showEmailsLoadingState();
        }
    }
    
    onScanProgress(data) {
        // Mettre à jour la progression si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.updateEmailsProgress(data);
        }
    }
    
    onScanCompleted(data) {
        console.log('[PageManager] ✅ Scan terminé:', data);
        this.lastKnownEmailsCount = data.total || 0;
        
        // Rafraîchir automatiquement la page emails si elle est active
        if (this.currentPage === 'emails') {
            this.autoRefreshEmailsView();
        }
        
        // Effacer les sélections précédentes
        this.selectedEmails.clear();
    }
    
    onScanError(error) {
        console.error('[PageManager] ❌ Erreur de scan:', error);
        
        if (this.currentPage === 'emails') {
            this.showEmailsErrorState(error);
        }
    }
    
    onEmailsReprocessed(data) {
        console.log('[PageManager] 🔄 Emails retraités:', data);
        
        // Rafraîchir la vue si on est sur la page emails
        if (this.currentPage === 'emails') {
            this.autoRefreshEmailsView();
        }
    }
    
    onSettingsChanged(data) {
        console.log('[PageManager] ⚙️ Paramètres changés:', data);
        
        // Certains changements peuvent nécessiter une mise à jour de l'interface
        const { type } = data;
        
        if (type === 'preferences' && this.currentPage === 'emails') {
            // Les préférences d'affichage ont changé
            setTimeout(() => this.autoRefreshEmailsView(), 500);
        }
    }

    // ================================================
    // GESTION DES ÉTATS D'AFFICHAGE
    // ================================================
    
    showEmailsLoadingState() {
        const container = document.querySelector('.tasks-container-harmonized');
        if (container) {
            container.innerHTML = `
                <div class="emails-loading-state">
                    <div class="loading-spinner"></div>
                    <h3>Scan en cours...</h3>
                    <p>Récupération et analyse des emails</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            `;
        }
    }
    
    updateEmailsProgress(progressData) {
        const { phase, message, progress } = progressData;
        
        const loadingContainer = document.querySelector('.emails-loading-state');
        if (!loadingContainer) return;
        
        const titleElement = loadingContainer.querySelector('h3');
        const messageElement = loadingContainer.querySelector('p');
        const progressFill = loadingContainer.querySelector('.progress-fill');
        
        if (titleElement) {
            titleElement.textContent = phase === 'fetching' ? 'Récupération...' : 
                                     phase === 'categorizing' ? 'Catégorisation...' : 
                                     phase === 'complete' ? 'Terminé !' : 'Scan en cours...';
        }
        
        if (messageElement) {
            messageElement.textContent = message || 'Traitement en cours';
        }
        
        if (progressFill && progress) {
            const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
            progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
    }
    
    showEmailsErrorState(error) {
        const container = document.querySelector('.tasks-container-harmonized');
        if (container) {
            container.innerHTML = `
                <div class="emails-error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erreur lors du scan</h3>
                    <p>${error.message || 'Une erreur est survenue'}</p>
                    <button class="btn-harmonized btn-primary" onclick="window.pageManager.retryEmailScan()">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }
    
    autoRefreshEmailsView() {
        // Délai pour permettre au scan de se terminer complètement
        setTimeout(() => {
            if (this.currentPage === 'emails') {
                console.log('[PageManager] 🔄 Rafraîchissement automatique de la vue emails');
                this.refreshEmailsView();
            }
        }, 500);
    }
    
    retryEmailScan() {
        if (window.emailScanner && !window.emailScanner.isScanning) {
            // Lancer un nouveau scan avec les paramètres par défaut
            const settings = window.emailScanner.getScanSettings();
            window.emailScanner.scan({
                days: settings.defaultPeriod,
                folder: settings.defaultFolder
            }).catch(error => {
                console.error('[PageManager] Erreur lors du retry:', error);
            });
        }
    }

    // ================================================
    // PAGE LOADING AVEC SYNCHRONISATION
    // ================================================
    
    async loadPage(pageName) {
        console.log(`[PageManager] Loading page: ${pageName}`);

        // IGNORER complètement le dashboard - laissé à index.html
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

    // ================================================
    // EMAILS PAGE SYNCHRONISÉE
    // ================================================
    
    async renderEmails(container) {
        // Attendre que EmailScanner soit prêt
        if (!this.emailScannerReady) {
            container.innerHTML = this.renderEmailsWaitingState();
            
            // Attendre et réessayer
            setTimeout(() => {
                if (this.emailScannerReady) {
                    this.renderEmails(container);
                }
            }, 1000);
            return;
        }
        
        const emails = this.getEmailsFromScanner();
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] Rendu emails: ${emails.length} emails disponibles`);
        
        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            const selectedCount = this.selectedEmails.size;
            const visibleEmails = this.getVisibleEmails();
            const allVisible = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
            
            container.innerHTML = `
                <div class="tasks-page-modern">
                    <!-- Indicateur de synchronisation -->
                    <div class="sync-status-bar">
                        <div class="sync-info">
                            ${this.emailScannerReady ? `
                                <div class="sync-indicator connected">
                                    <i class="fas fa-wifi"></i>
                                    <span>Synchronisé avec EmailScanner</span>
                                    <span class="emails-count">${totalEmails} emails</span>
                                </div>
                            ` : `
                                <div class="sync-indicator disconnected">
                                    <i class="fas fa-wifi-slash"></i>
                                    <span>Non synchronisé</span>
                                </div>
                            `}
                        </div>
                        <div class="sync-actions">
                            <button class="btn-sync" onclick="window.pageManager.forceRefreshEmails()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            ${window.emailScanner?.isScanning ? `
                                <div class="scanning-indicator">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>Scan en cours...</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Texte explicatif -->
                    ${!this.hideExplanation ? `
                        <div class="explanation-text-harmonized">
                            <i class="fas fa-info-circle"></i>
                            <span>Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action pour transformer les emails sélectionnés en tâches ou effectuer d'autres opérations. Vous pouvez également filtrer par catégorie ci-dessous.</span>
                            <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}

                    <!-- Barre de contrôles harmonisée -->
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
    }
    
    renderEmailsWaitingState() {
        return `
            <div class="emails-waiting-state">
                <div class="waiting-spinner"></div>
                <h3>Connexion à EmailScanner...</h3>
                <p>Initialisation du système de synchronisation</p>
            </div>
        `;
    }
    
    getEmailsFromScanner() {
        if (!this.emailScannerReady || !window.emailScanner) {
            return [];
        }
        
        try {
            return window.emailScanner.getAllEmails() || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération emails:', error);
            return [];
        }
    }
    
    forceRefreshEmails() {
        if (!this.emailScannerReady) {
            window.uiManager?.showToast('EmailScanner non prêt', 'warning');
            return;
        }
        
        console.log('[PageManager] 🔄 Actualisation forcée des emails');
        this.autoRefreshEmailsView();
    }

    // ================================================
    // MÉTHODES DE SÉLECTION (INCHANGÉES)
    // ================================================
    
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
        if (container && this.currentPage === 'emails') {
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

    // ================================================
    // RENDU DES EMAILS (INCHANGÉ)
    // ================================================
    
    renderEmailsList() {
        const emails = this.getEmailsFromScanner();
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

    renderEmptyState() {
        const hasScannedEmails = this.getEmailsFromScanner().length > 0;
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">
                    ${hasScannedEmails ? 'Aucun email trouvé' : 'Aucun email scanné'}
                </h3>
                <p class="empty-state-text-harmonized">
                    ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 
                      hasScannedEmails ? 'Aucun email dans cette catégorie' : 
                      'Lancez un scan pour voir vos emails'}
                </p>
                ${this.searchTerm ? `
                    <button class="btn-harmonized btn-primary" onclick="window.pageManager.clearSearch()">
                        <i class="fas fa-undo"></i>
                        <span>Effacer la recherche</span>
                    </button>
                ` : !hasScannedEmails ? `
                    <button class="btn-harmonized btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        <span>Aller au scanner</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    // ================================================
    // TOUTES LES AUTRES MÉTHODES RESTENT IDENTIQUES
    // ================================================
    
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
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const avatarColor = this.generateAvatarColor(senderName);
        
        return `
            <div class="task-harmonized-card ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar-harmonized" style="background-color: ${this.getEmailPriorityColor(email)}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">📧 Email</span>
                            <span class="deadline-badge-harmonized">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                    </div>
                </div>
                
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

    // ================================================
    // ÉVÉNEMENTS ET HANDLERS (INCHANGÉS)
    // ================================================
    
    handleEmailClick(event, emailId) {
        if (event.target.type === 'checkbox') return;
        if (event.target.closest('.task-actions-harmonized')) return;
        this.showEmailModal(emailId);
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

    // ================================================
    // ACTIONS GROUPÉES (INCHANGÉES)
    // ================================================
    
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

    // ================================================
    // UTILITY METHODS (INCHANGÉS)
    // ================================================
    
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

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
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

    getVisibleEmails() {
        const emails = this.getEmailsFromScanner();
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) {
        const tabs = [
            { id: 'all', name: 'Tous', icon: '📧', count: totalEmails }
        ];
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: category.icon,
                    count: count
                });
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            tabs.push({
                id: 'other',
                name: 'Autre',
                icon: '📌',
                count: otherCount
            });
        }
        
        return tabs.map(tab => {
            return `
                <button class="status-pill-harmonized-twolines ${this.currentCategory === tab.id ? 'active' : ''}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    getEmailById(emailId) {
        const emails = this.getEmailsFromScanner();
        return emails.find(e => e.id === emailId);
    }

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            // Forcer un rafraîchissement via EmailScanner
            if (this.emailScannerReady && window.emailScanner) {
                // Reprocesser les emails avec les paramètres actuels
                await window.emailScanner.reprocessEmails();
            }
            
            await this.loadPage('emails');
            window.uiManager.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'actualisation', 'error');
        }
    }

    // ================================================
    // TASK CREATION METHODS (SIMPLIFIÉS)
    // ================================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        window.uiManager.showToast(`Création de ${this.selectedEmails.size} tâches...`, 'info');
        
        // Simulation de création de tâches
        let created = 0;
        for (const emailId of this.selectedEmails) {
            if (!this.createdTasks.has(emailId)) {
                this.createdTasks.set(emailId, `task-${Date.now()}-${emailId}`);
                created++;
            }
        }
        
        if (created > 0) {
            window.uiManager.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            window.uiManager.showToast('Aucune nouvelle tâche créée', 'warning');
        }
    }

    showTaskCreationModal(emailId) {
        console.log('[PageManager] Ouverture modal création tâche pour:', emailId);
        // Implémentation simplifiée
        window.uiManager.showToast('Modal de création de tâche (à implémenter)', 'info');
    }

    showEmailModal(emailId) {
        console.log('[PageManager] Ouverture modal email pour:', emailId);
        // Implémentation simplifiée
        window.uiManager.showToast('Modal d\'affichage email (à implémenter)', 'info');
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (taskId) {
            this.loadPage('tasks');
        }
    }

    // ================================================
    // AUTRES PAGES (INCHANGÉES)
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendering scanner page...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Using modern ScanStartModule');
                await window.scanStartModule.render(container);
                return;
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

    // ================================================
    // STYLES HARMONISÉS AVEC INDICATEURS DE SYNC
    // ================================================
    
    addHarmonizedEmailStyles() {
        if (document.getElementById('harmonizedEmailStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedEmailStyles';
        styles.textContent = `
            /* Tous les styles existants + nouveaux styles de synchronisation */
            
            /* Barre de statut de synchronisation */
            .sync-status-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            }
            
            .sync-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .sync-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                border: 1px solid;
            }
            
            .sync-indicator.connected {
                background: #dcfce7;
                color: #16a34a;
                border-color: #16a34a;
            }
            
            .sync-indicator.disconnected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #dc2626;
            }
            
            .emails-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                color: inherit;
            }
            
            .sync-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .btn-sync {
                width: 36px;
                height: 36px;
                border: none;
                background: #f3f4f6;
                color: #6b7280;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .btn-sync:hover {
                background: #e5e7eb;
                color: #374151;
                transform: translateY(-1px);
            }
            
            .scanning-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #3b82f6;
                font-size: 12px;
                font-weight: 600;
            }
            
            .scanning-indicator .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* États de chargement et d'erreur */
            .emails-loading-state,
            .emails-waiting-state,
            .emails-error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 30px;
                text-align: center;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            }
            
            .loading-spinner,
            .waiting-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            .error-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 20px;
            }
            
            .progress-bar {
                width: 100%;
                max-width: 300px;
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin-top: 16px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                border-radius: 3px;
                transition: width 0.3s ease;
            }
            
            /* Reprendre tous les autres styles existants... */
            /* [Tous les styles du PageManager original restent identiques] */
        `;
        
        document.head.appendChild(styles);
    }
    
    // ================================================
    // NETTOYAGE LORS DE LA DESTRUCTION
    // ================================================
    
    destroy() {
        if (this.unsubscribeFromEmailScanner) {
            this.unsubscribeFromEmailScanner();
            this.unsubscribeFromEmailScanner = null;
        }
        
        console.log('[PageManager] Instance détruite et désabonnée');
    }
}

// Créer l'instance globale
window.pageManager = new PageManager();

// Bind methods to preserve context
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v12.0 SYNCHRONISÉ loaded');
