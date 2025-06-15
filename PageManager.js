async renderEmails(container) {
    // Récupérer les emails depuis EmailScanner centralisé
    const emails = window.emailScanner?.getAllEmails() || [];
    const categories = window.categoryManager?.getCategories() || {};
    
    console.log(`[PageManager] Rendu page emails avec ${emails.length} emails`);
    
    if (emails.length === 0) {
        container.innerHTML = this.renderEmptyEmailsState();
        return;
    }

    const renderEmailsPage = () => {
        const categoryCounts = this.calculateCategoryCounts(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allVisible = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        container.innerHTML = `
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

                <!-- Barre de contrôles FIXÉE et COMPACTE -->
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
                    
                    <!-- Actions principales COMPACTES -->
                    <div class="action-buttons-harmonized">
                        <!-- Bouton Sélectionner tout -->
                        <button class="btn-harmonized btn-selection-toggle" 
                                onclick="window.pageManager.toggleAllSelection()"
                                title="${allVisible ? 'Désélectionner tout' : 'Sélectionner tout'}">
                            <i class="fas ${allVisible ? 'fa-square-check' : 'fa-square'}"></i>
                            <span>${allVisible ? 'Désélectionner' : 'Sélectionner'}</span>
                            ${visibleEmails.length > 0 ? `<span class="count-badge-small">${visibleEmails.length}</span>` : ''}
                        </button>
                        
                        <!-- Bouton Créer tâches (avec nombre intégré) -->
                        ${selectedCount > 0 ? `
                            <button class="btn-harmonized btn-primary" 
                                    onclick="window.pageManager.createTasksFromSelection()">
                                <i class="fas fa-tasks"></i>
                                <span>Créer ${selectedCount} tâche${selectedCount > 1 ? 's' : ''}</span>
                            </button>
                            
                            <!-- Bouton clear selection -->
                            <button class="btn-harmonized btn-clear-selection" 
                                    onclick="window.pageManager.clearSelection()"
                                    title="Effacer la sélection">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : `
                            <button class="btn-harmonized btn-primary disabled" disabled>
                                <i class="fas fa-tasks"></i>
                                <span>Créer tâches</span>
                            </button>
                        `}
                        
                        <!-- Bouton Actions -->
                        <div class="dropdown-action-harmonized">
                            <button class="btn-harmonized btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                    onclick="window.pageManager.toggleBulkActions(event)"
                                    ${selectedCount === 0 ? 'disabled' : ''}>
                                <i class="fas fa-ellipsis-v"></i>
                                <span>Actions</span>
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
                        
                        <!-- Bouton Actualiser -->
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
    
    // Auto-analyze si activé ET si catégories pré-sélectionnées configurées
    if (this.autoAnalyzeEnabled && emails.length > 0) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        console.log('[PageManager] 🤖 Catégories pré-sélectionnées pour analyse:', preselectedCategories);
        
        if (preselectedCategories && preselectedCategories.length > 0) {
            // Filtrer les emails selon les catégories pré-sélectionnées
            const emailsToAnalyze = emails.filter(email => 
                preselectedCategories.includes(email.category)
            ).slice(0, 5);
            
            console.log('[PageManager] 🎯 Emails sélectionnés pour analyse:', emailsToAnalyze.length);
            
            if (emailsToAnalyze.length > 0) {
                setTimeout(() => {
                    this.analyzeFirstEmails(emailsToAnalyze);
                }, 1000);
            }
        }
    }
}
