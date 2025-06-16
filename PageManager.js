// PageManager.js - Version 12.1 - Synchronisation fixée avec paramètres

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
        
        // Page renderers - DASHBOARD SUPPRIMÉ
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

    init() {
        console.log('[PageManager] ✅ Version 12.1 - Synchronisation fixée avec paramètres');
    }

    // ================================================
    // ÉVÉNEMENTS GLOBAUX - SYNCHRONISATION FIXÉE
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres depuis CategoriesPage
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés reçus:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        // Écouter les changements génériques de paramètres
        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        // Écouter la recatégorisation des emails
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] Emails recatégorisés, mise à jour interface');
            if (this.currentPage === 'emails') {
                setTimeout(() => {
                    this.refreshEmailsView();
                }, 100);
            }
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] Scan terminé, données mises à jour');
            this.lastScanData = event.detail;
            if (this.currentPage === 'emails') {
                this.loadPage('emails');
            }
        });
    }

    // ================================================
    // GESTION DES CHANGEMENTS DE PARAMÈTRES - NOUVELLE
    // ================================================
    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        // Si c'est un changement de catégories pré-sélectionnées, forcer la re-catégorisation
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées:', settingsData.settings.taskPreselectedCategories);
            
            // Déclencher la re-catégorisation si des emails existent
            if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                console.log('[PageManager] 🔄 Déclenchement re-catégorisation...');
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails?.();
                }, 100);
            }
        }
        
        // Mettre à jour l'affichage si on est sur la page emails
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[PageManager] 🔧 Traitement changement générique:', changeData);
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                // Mettre à jour le auto-analyzer si disponible
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                // Déclencher la re-catégorisation
                if (window.emailScanner && window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                    setTimeout(() => {
                        window.emailScanner.recategorizeEmails?.();
                    }, 150);
                }
                break;
                
            case 'preferences':
                console.log('[PageManager] ⚙️ Préférences changées:', value);
                // Mettre à jour l'affichage selon les nouvelles préférences
                if (this.currentPage === 'emails') {
                    setTimeout(() => {
                        this.refreshEmailsView();
                    }, 100);
                }
                break;
        }
    }

    // =====================================
    // PAGE LOADING - DASHBOARD IGNORÉ
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        // IGNORER complètement le dashboard
        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
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
            console.error('[PageManager] Container de contenu non trouvé');
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
            console.error(`[PageManager] Erreur chargement page:`, error);
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
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                    Retour au tableau de bord
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
            <div class="emails-page-container">
                <div class="emails-main-container">
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

                    <!-- Barre de contrôles avec boutons TOUJOURS VISIBLES -->
                    <div class="controls-section-wrapper">
                        <div class="controls-bar-harmonized ${selectedCount > 0 ? 'has-selection' : ''}">
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
                            
                            <!-- Actions principales TOUJOURS VISIBLES -->
                            <div class="action-buttons-harmonized">
                                <!-- Bouton Sélectionner tout TOUJOURS VISIBLE -->
                                <button class="btn-harmonized btn-selection-toggle" 
                                        onclick="window.pageManager.toggleAllSelection()"
                                        title="${allVisible ? 'Désélectionner tout' : 'Sélectionner tout'}">
                                    <i class="fas ${allVisible ? 'fa-square-check' : 'fa-square'}"></i>
                                    <span>${allVisible ? 'Désélectionner' : 'Sélectionner'}</span>
                                    ${visibleEmails.length > 0 ? `<span class="count-badge-small">${visibleEmails.length}</span>` : ''}
                                </button>
                                
                                <!-- Bouton Créer tâches TOUJOURS VISIBLE (désactivé si pas de sélection) -->
                                <button class="btn-harmonized btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                        onclick="window.pageManager.createTasksFromSelection()"
                                        ${selectedCount === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-tasks"></i>
                                    <span>Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                    ${selectedCount > 0 ? `<span class="count-badge-harmonized">${selectedCount}</span>` : ''}
                                </button>
                                
                                <!-- Bouton Actions TOUJOURS VISIBLE (désactivé si pas de sélection) -->
                                <div class="dropdown-action-harmonized">
                                    <button class="btn-harmonized btn-secondary dropdown-toggle ${selectedCount === 0 ? 'disabled' : ''}" 
                                            onclick="window.pageManager.toggleBulkActions(event)"
                                            ${selectedCount === 0 ? 'disabled' : ''}>
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
                                
                                <!-- Bouton Actualiser TOUJOURS VISIBLE -->
                                <button class="btn-harmonized btn-secondary" onclick="window.pageManager.refreshEmails()">
                                    <i class="fas fa-sync-alt"></i>
                                    <span>Actualiser</span>
                                </button>
                                
                                <!-- Indicateur de sélection (si emails sélectionnés) -->
                                ${selectedCount > 0 ? `
                                    <div class="selection-info-harmonized">
                                        <span class="selection-count-harmonized">${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                                        <button class="btn-harmonized btn-clear-selection" onclick="window.pageManager.clearSelection()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
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
    // ================================================
    // MÉTHODE POUR RÉCUPÉRER LES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    getTaskPreselectedCategories() {
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
    }

    // Ajouter ces méthodes dans PageManager.js après getTaskPreselectedCategories()

debugPreselection() {
    console.group('🔍 DEBUG PRÉ-SÉLECTION COMPLÈTE');
    
    // 1. Sources des catégories
    console.group('📋 Sources des catégories pré-sélectionnées:');
    
    const categoriesFromManager = window.categoryManager?.getTaskPreselectedCategories() || [];
    const categoriesFromPage = window.categoriesPage?.getTaskPreselectedCategories() || [];
    const categoriesFromLocal = this.getTaskPreselectedCategories();
    const categoriesFromScanner = window.emailScanner?.getTaskPreselectedCategories() || [];
    
    console.log('CategoryManager:', categoriesFromManager);
    console.log('CategoriesPage:', categoriesFromPage);
    console.log('PageManager:', categoriesFromLocal);
    console.log('EmailScanner:', categoriesFromScanner);
    
    // Vérifier la cohérence
    const allSources = [
        { name: 'CategoryManager', cats: categoriesFromManager },
        { name: 'CategoriesPage', cats: categoriesFromPage },
        { name: 'PageManager', cats: categoriesFromLocal },
        { name: 'EmailScanner', cats: categoriesFromScanner }
    ];
    
    const referenceSource = categoriesFromManager;
    const inconsistencies = [];
    
    allSources.forEach(source => {
        if (JSON.stringify([...source.cats].sort()) !== JSON.stringify([...referenceSource].sort())) {
            inconsistencies.push(source.name);
        }
    });
    
    if (inconsistencies.length > 0) {
        console.warn('⚠️ INCOHÉRENCES DÉTECTÉES:', inconsistencies);
    } else {
        console.log('✅ Toutes les sources sont synchronisées');
    }
    
    console.groupEnd();
    
    // 2. État des emails
    console.group('📧 État des emails:');
    
    const emails = window.emailScanner?.getAllEmails() || [];
    const preselectedEmails = emails.filter(e => e.isPreselectedForTasks === true);
    const shouldBePreselected = emails.filter(e => categoriesFromLocal.includes(e.category));
    const missedEmails = shouldBePreselected.filter(e => !e.isPreselectedForTasks);
    
    console.log('Total emails:', emails.length);
    console.log('Marqués pré-sélectionnés (flag):', preselectedEmails.length);
    console.log('Devraient être pré-sélectionnés (catégorie):', shouldBePreselected.length);
    console.log('Emails manqués:', missedEmails.length);
    
    if (missedEmails.length > 0) {
        console.warn('⚠️ Emails qui devraient être marqués mais ne le sont pas:');
        missedEmails.slice(0, 5).forEach(email => {
            console.log('  -', {
                subject: email.subject?.substring(0, 40),
                category: email.category,
                isPreselectedForTasks: email.isPreselectedForTasks
            });
        });
    }
    
    console.groupEnd();
    
    // 3. Détails par catégorie
    console.group('📊 Détails par catégorie pré-sélectionnée:');
    
    categoriesFromLocal.forEach(catId => {
        const category = window.categoryManager?.getCategory(catId);
        const emailsInCategory = emails.filter(e => e.category === catId);
        const markedAsPreselected = emailsInCategory.filter(e => e.isPreselectedForTasks === true);
        
        console.group(`${category?.icon || '📂'} ${category?.name || catId} (${catId}):`);
        console.log('Total emails dans cette catégorie:', emailsInCategory.length);
        console.log('Marqués pré-sélectionnés:', markedAsPreselected.length);
        console.log('Pourcentage correct:', markedAsPreselected.length === emailsInCategory.length ? '✅ 100%' : `❌ ${Math.round(markedAsPreselected.length / emailsInCategory.length * 100)}%`);
        
        if (markedAsPreselected.length < emailsInCategory.length) {
            const notMarked = emailsInCategory.filter(e => !e.isPreselectedForTasks);
            console.warn('Emails non marqués:', notMarked.slice(0, 3).map(e => ({
                subject: e.subject?.substring(0, 40),
                score: e.categoryScore,
                confidence: Math.round(e.categoryConfidence * 100) + '%'
            })));
        }
        
        console.groupEnd();
    });
    
    console.groupEnd();
    
    // 4. État de l'affichage
    console.group('🖼️ État de l\'affichage:');
    
    const categoryButtons = document.querySelectorAll('.status-pill-harmonized-twolines');
    const preselectedButtons = document.querySelectorAll('.status-pill-harmonized-twolines.preselected-category');
    const emailCards = document.querySelectorAll('.task-harmonized-card');
    const preselectedCards = document.querySelectorAll('.task-harmonized-card.preselected-task');
    
    console.log('Boutons de catégorie totaux:', categoryButtons.length);
    console.log('Boutons avec style pré-sélectionné:', preselectedButtons.length);
    console.log('Cartes d\'email totales:', emailCards.length);
    console.log('Cartes avec style pré-sélectionné:', preselectedCards.length);
    
    console.groupEnd();
    
    console.groupEnd();
    
    return {
        sources: {
            categoryManager: categoriesFromManager,
            categoriesPage: categoriesFromPage,
            pageManager: categoriesFromLocal,
            emailScanner: categoriesFromScanner,
            isSync: inconsistencies.length === 0
        },
        emails: {
            total: emails.length,
            markedPreselected: preselectedEmails.length,
            shouldBePreselected: shouldBePreselected.length,
            missed: missedEmails.length
        },
        display: {
            categoryButtons: categoryButtons.length,
            preselectedButtons: preselectedButtons.length,
            emailCards: emailCards.length,
            preselectedCards: preselectedCards.length
        }
    };
}


// Méthode utilitaire pour dispatcher des événements
dispatchEvent(eventName, detail) {
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
}

    renderEmptyEmailsState() {
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
    }

    // ================================================
    // MÉTHODES DE SÉLECTION
    // ================================================
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast('Emails désélectionnés', 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
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
        window.uiManager?.showToast('Sélection effacée', 'info');
    }


updateControlsBar() {
    const container = document.getElementById('pageContent');
    if (container && this.currentPage === 'emails') {
        // Sauvegarder l'état de recherche
        const searchInput = document.getElementById('emailSearchInput');
        const currentSearchValue = searchInput ? searchInput.value : this.searchTerm;
        
        // Re-render avec le nouveau layout
        this.renderEmails(container);
        
        // Restaurer la recherche
        setTimeout(() => {
            const newSearchInput = document.getElementById('emailSearchInput');
            if (newSearchInput && currentSearchValue) {
                newSearchInput.value = currentSearchValue;
            }
        }, 100);
    }
}


buildTwoLinesCategoryTabs(categoryCounts, totalEmails, categories) {
    // Récupérer les catégories pré-sélectionnées
    const preselectedCategories = this.getTaskPreselectedCategories();
    console.log('[PageManager] 📌 Catégories pré-sélectionnées pour l\'affichage:', preselectedCategories);
    
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
            
            if (isPreselected) {
                console.log(`[PageManager] ⭐ Catégorie pré-sélectionnée: ${category.name} (${count} emails)`);
            }
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
                    onclick="window.pageManager.filterByCategory('${tab.id}')"
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
}


    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshEmailsView();
    }

    // ================================================
    // RENDU DES EMAILS
    // ================================================
    renderEmailsList() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        // Appliquer les filtres
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

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderHarmonizedEmailRow(email)).join('')}
            </div>
        `;
    }

    
// PageManager.js - Méthode renderHarmonizedEmailRow() complète corrigée (remplacer vers ligne 1230)

renderHarmonizedEmailRow(email) {
    const isSelected = this.selectedEmails.has(email.id);
    const hasTask = this.createdTasks.has(email.id);
    const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
    const senderEmail = email.from?.emailAddress?.address || '';
    
    // Récupérer les catégories pré-sélectionnées avec synchronisation forcée
    const preselectedCategories = this.getTaskPreselectedCategories();
    
    // Double vérification: le flag email.isPreselectedForTasks ET l'appartenance à une catégorie pré-sélectionnée
    let isPreselectedForTasks = email.isPreselectedForTasks === true;
    
    // Si le flag n'est pas défini mais que la catégorie est pré-sélectionnée, le corriger
    if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
        isPreselectedForTasks = true;
        email.isPreselectedForTasks = true;
        
        const category = window.categoryManager?.getCategory(email.category);
        console.log(`[PageManager] 🔧 Correction flag pré-sélection pour email:`, {
            subject: email.subject?.substring(0, 40),
            category: email.category,
            categoryName: category?.name || email.category,
            categoryIcon: category?.icon || '📂'
        });
    }
    
    // Auto-sélection si pré-sélectionné et pas encore de tâche
    if (isPreselectedForTasks && !isSelected && !hasTask && this.autoSelectPreselected !== false) {
        this.selectedEmails.add(email.id);
    }
    
    // Classes CSS pour l'email
    const cardClasses = [
        'task-harmonized-card',
        isSelected || (isPreselectedForTasks && !hasTask) ? 'selected' : '',
        hasTask ? 'has-task' : '',
        isPreselectedForTasks ? 'preselected-task' : ''
    ].filter(Boolean).join(' ');
    
    return `
        <div class="${cardClasses}" 
             data-email-id="${email.id}"
             data-category="${email.category}"
             data-preselected="${isPreselectedForTasks}"
             onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
            
            <!-- Checkbox de sélection -->
            <input type="checkbox" 
                   class="task-checkbox-harmonized" 
                   ${(isSelected || (isPreselectedForTasks && !hasTask)) ? 'checked' : ''}
                   onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
            
            <!-- Indicateur de priorité avec couleur spéciale si pré-sélectionné -->
            <div class="priority-bar-harmonized" 
                 style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
            
            <!-- Contenu principal -->
            <div class="task-main-content-harmonized">
                <div class="task-header-harmonized">
                    <h3 class="task-title-harmonized">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                    <div class="task-meta-harmonized">
                        <span class="task-type-badge-harmonized">📧 Email</span>
                        <span class="deadline-badge-harmonized">
                            📅 ${this.formatEmailDate(email.receivedDateTime)}
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
                    <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                    ${email.hasAttachments ? '<span class="reply-indicator-harmonized">• Pièce jointe</span>' : ''}
                    ${email.category && email.category !== 'other' ? `
                        <span class="category-indicator-harmonized" 
                              style="background: ${this.getCategoryColor(email.category)}20; 
                                     color: ${this.getCategoryColor(email.category)};
                                     ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                            ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                            ${isPreselectedForTasks ? ' ⭐' : ''}
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <!-- Actions rapides -->
            <div class="task-actions-harmonized">
                ${this.renderHarmonizedEmailActions(email)}
            </div>
        </div>
    `;
}

// Ajouter cette méthode dans PageManager.js après la méthode getTaskPreselectedCategories()

debugPreselection() {
    console.group('🔍 DEBUG PRÉ-SÉLECTION');
    
    // 1. Vérifier les catégories configurées
    const categoriesFromManager = window.categoryManager?.getTaskPreselectedCategories() || [];
    const categoriesFromPage = window.categoriesPage?.getTaskPreselectedCategories() || [];
    const categoriesFromLocal = this.getTaskPreselectedCategories();
    
    console.log('📋 Catégories pré-sélectionnées:');
    console.log('  - CategoryManager:', categoriesFromManager);
    console.log('  - CategoriesPage:', categoriesFromPage);
    console.log('  - PageManager:', categoriesFromLocal);
    
    // 2. Vérifier les emails
    const emails = window.emailScanner?.getAllEmails() || [];
    const preselectedEmails = emails.filter(e => e.isPreselectedForTasks);
    const shouldBePreselected = emails.filter(e => categoriesFromLocal.includes(e.category));
    
    console.log('📧 Emails:');
    console.log('  - Total:', emails.length);
    console.log('  - Marqués pré-sélectionnés:', preselectedEmails.length);
    console.log('  - Devraient être pré-sélectionnés:', shouldBePreselected.length);
    
    // 3. Détails par catégorie
    console.log('📊 Détails par catégorie:');
    categoriesFromLocal.forEach(catId => {
        const category = window.categoryManager?.getCategory(catId);
        const emailsInCategory = emails.filter(e => e.category === catId);
        const markedAsPreselected = emailsInCategory.filter(e => e.isPreselectedForTasks);
        
        console.log(`  ${category?.icon || '📂'} ${category?.name || catId}:`, {
            total: emailsInCategory.length,
            marqués: markedAsPreselected.length,
            emails: emailsInCategory.slice(0, 3).map(e => ({
                subject: e.subject?.substring(0, 50),
                isPreselectedForTasks: e.isPreselectedForTasks
            }))
        });
    });
    
    // 4. Vérifier la synchronisation
    const isSync = JSON.stringify(categoriesFromManager.sort()) === JSON.stringify(categoriesFromLocal.sort());
    console.log('🔄 Synchronisation:', isSync ? '✅ OK' : '❌ DÉSYNCHRONISÉ');
    
    console.groupEnd();
    
    return {
        configured: categoriesFromLocal,
        emails: {
            total: emails.length,
            preselected: preselectedEmails.length,
            shouldBePreselected: shouldBePreselected.length
        },
        isSync
    };
}

forceUpdatePreselection() {
    console.log('[PageManager] 🔄 === FORCE UPDATE PRÉ-SÉLECTION ===');
    
    // 1. Forcer la synchronisation des catégories
    const freshCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
    console.log('[PageManager] 📋 Catégories fraîches depuis CategoryManager:', freshCategories);
    
    // 2. Mettre à jour EmailScanner
    if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
        window.emailScanner.updateTaskPreselectedCategories(freshCategories);
        console.log('[PageManager] ✅ EmailScanner mis à jour');
    }
    
    // 3. Mettre à jour les emails
    const emails = window.emailScanner?.getAllEmails() || [];
    let updated = 0;
    let added = 0;
    let removed = 0;
    
    emails.forEach(email => {
        const shouldBePreselected = freshCategories.includes(email.category);
        const currentlyPreselected = email.isPreselectedForTasks === true;
        
        if (shouldBePreselected && !currentlyPreselected) {
            email.isPreselectedForTasks = true;
            updated++;
            added++;
        } else if (!shouldBePreselected && currentlyPreselected) {
            email.isPreselectedForTasks = false;
            updated++;
            removed++;
        }
    });
    
    console.log(`[PageManager] 📊 Résultat: ${updated} emails mis à jour (${added} ajoutés, ${removed} retirés)`);
    
    // 4. Mettre à jour les boutons de catégories sans reconstruction complète
    document.querySelectorAll('.status-pill-harmonized-twolines').forEach(button => {
        const categoryId = button.dataset.categoryId;
        if (categoryId && categoryId !== 'all') {
            const starContainer = button.querySelector('.preselected-star-container');
            if (starContainer) {
                if (freshCategories.includes(categoryId)) {
                    starContainer.classList.add('visible');
                    button.classList.add('preselected-category');
                } else {
                    starContainer.classList.remove('visible');
                    button.classList.remove('preselected-category');
                }
            }
        }
    });
    
    // 5. Rafraîchir seulement la liste des emails
    const emailsContainer = document.querySelector('.tasks-container-harmonized');
    if (emailsContainer && this.currentPage === 'emails') {
        emailsContainer.innerHTML = this.renderEmailsList();
    }
    
    // 6. Déclencher un événement pour notifier les autres modules
    setTimeout(() => {
        this.dispatchEvent('preselectionUpdated', {
            categories: freshCategories,
            updated: updated,
            added: added,
            removed: removed
        });
    }, 100);
    
    return {
        categories: freshCategories,
        emailsUpdated: updated,
        added: added,
        removed: removed
    };
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
    // ÉVÉNEMENTS ET HANDLERS
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
    // ACTIONS GROUPÉES
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
        
        if (window.emailScanner) {
            await window.emailScanner.performBatchAction(selectedEmails, 'markAsRead');
        } else {
            window.uiManager?.showToast(`${selectedEmails.length} emails marqués comme lus`, 'success');
        }
        this.clearSelection();
    }

    async bulkArchive() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Archiver ${selectedEmails.length} email(s) ?`)) {
            window.uiManager?.showToast(`${selectedEmails.length} emails archivés`, 'success');
            this.clearSelection();
        }
    }

    async bulkDelete() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (confirm(`Supprimer définitivement ${selectedEmails.length} email(s) ?\n\nCette action est irréversible.`)) {
            if (window.emailScanner) {
                await window.emailScanner.performBatchAction(selectedEmails, 'delete');
            } else {
                window.uiManager?.showToast(`${selectedEmails.length} emails supprimés`, 'success');
            }
            this.clearSelection();
            this.refreshEmailsView();
        }
    }

    async bulkExport() {
        const selectedEmails = Array.from(this.selectedEmails);
        if (selectedEmails.length === 0) return;
        
        if (window.emailScanner) {
            window.emailScanner.exportResults('csv');
        } else {
            const emails = selectedEmails.map(id => this.getEmailById(id)).filter(Boolean);
            
            const csvContent = [
                ['De', 'Sujet', 'Date', 'Catégorie', 'Contenu'].join(','),
                ...emails.map(email => [
                    `"${email.from?.emailAddress?.name || email.from?.emailAddress?.address || ''}"`,
                    `"${email.subject || ''}"`,
                    email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString('fr-FR') : '',
                    `"${this.getCategoryName(email.category)}"`,
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
            
            window.uiManager?.showToast('Export terminé', 'success');
        }
        this.clearSelection();
    }

    // ================================================
    // CRÉATION DE TÂCHES
    // ================================================
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager?.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
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
                console.error('[PageManager] Erreur création tâche:', emailId, error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`, 'success');
            this.clearSelection();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
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

    // ================================================
    // MODALES
    // ================================================
    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        let analysis;
        try {
            window.uiManager?.showLoading('Analyse de l\'email...');
            analysis = await window.aiTaskAnalyzer?.analyzeEmailForTasks(email, { useApi: true });
            this.aiAnalysisResults.set(emailId, analysis);
            window.uiManager?.hideLoading();
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'analyse', 'error');
            return;
        }

        const uniqueId = 'task_creation_modal_' + Date.now();
        const modalHTML = this.buildTaskCreationModal(uniqueId, email, analysis);

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildTaskCreationModal(uniqueId, email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Créer une tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        ${this.buildTaskCreationForm(email, analysis)}
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    buildTaskCreationForm(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        return `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-robot" style="color: #0ea5e9; font-size: 20px;"></i>
                    <span style="color: #0c4a6e; font-weight: 600;">Analyse intelligente par Claude AI</span>
                </div>
                
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: ${this.generateAvatarColor(senderName)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                        ${senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1f2937; font-size: 16px;">${senderName}</div>
                        <div style="color: #6b7280; font-size: 14px;">${senderEmail}</div>
                        <div style="color: #9ca3af; font-size: 12px;">@${senderDomain}</div>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Titre de la tâche</label>
                    <input type="text" id="task-title" 
                           style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                           value="${enhancedTitle}" 
                           onfocus="this.style.borderColor='#3b82f6'"
                           onblur="this.style.borderColor='#e5e7eb'" />
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Description</label>
                    <textarea id="task-description" 
                              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 100px; transition: border-color 0.2s;"
                              onfocus="this.style.borderColor='#3b82f6'"
                              onblur="this.style.borderColor='#e5e7eb'"
                              rows="4">${analysis.mainTask.description || analysis.summary || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Priorité</label>
                        <select id="task-priority" 
                                style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                                onfocus="this.style.borderColor='#3b82f6'"
                                onblur="this.style.borderColor='#e5e7eb'">
                            <option value="urgent" ${analysis.mainTask.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis.mainTask.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${analysis.mainTask.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis.mainTask.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Date d'échéance</label>
                        <input type="date" id="task-duedate" 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='#3b82f6'"
                               onblur="this.style.borderColor='#e5e7eb'"
                               value="${analysis.mainTask.dueDate || ''}" />
                    </div>
                </div>
                
                <div>
                    <button onclick="window.pageManager.toggleEmailContext()" 
                            style="width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #475569; transition: background 0.2s;"
                            onmouseover="this.style.background='#f1f5f9'"
                            onmouseout="this.style.background='#f8fafc'">
                        <i class="fas fa-chevron-right" id="context-toggle-icon" style="transition: transform 0.2s;"></i>
                        <span>Afficher le contenu original de l'email</span>
                    </button>
                    <div id="email-context-content" style="display: none; margin-top: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                            <div style="margin-bottom: 4px;"><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</div>
                            <div style="margin-bottom: 4px;"><strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</div>
                            <div><strong>Sujet:</strong> ${email.subject || 'Sans sujet'}</div>
                        </div>
                        <div style="max-height: 200px; overflow-y: auto; font-size: 14px; line-height: 1.5; color: #374151;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    toggleEmailContext() {
        const content = document.getElementById('email-context-content');
        const icon = document.getElementById('context-toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            icon.style.transform = 'rotate(90deg)';
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.transform = 'rotate(0deg)';
        }
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        const analysis = this.aiAnalysisResults.get(emailId);
        
        if (!email || !analysis) {
            window.uiManager?.showToast('Données manquantes', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = this.buildTaskDataFromAnalysis(email, {
                ...analysis,
                mainTask: {
                    ...analysis.mainTask,
                    title,
                    description,
                    priority,
                    dueDate
                }
            });

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                window.uiManager?.showToast('Tâche créée avec succès', 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

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
                            ${email.category && email.category !== 'other' ? `
                                <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 60px;">Catégorie:</span>
                                    <span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                        ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                    </span>
                                </div>
                            ` : ''}
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation...');
        
        try {
            // Recatégoriser les emails existants
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                await window.emailScanner.recategorizeEmails();
            }
            
            await this.loadPage('emails');
            window.uiManager?.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager?.hideLoading();
            window.uiManager?.showToast('Erreur d\'actualisation', 'error');
        }
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                if (window.tasksView?.showTaskDetails) {
                    window.tasksView.showTaskDetails(taskId);
                }
            }, 100);
        });
    }

    getEmailById(emailId) {
        return window.emailScanner?.getEmailById(emailId) || null;
    }

    getVisibleEmails() {
        const emails = window.emailScanner?.getAllEmails() || [];
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredEmails = filteredEmails.filter(email => (email.category || 'other') === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
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
        if (email.categoryScore >= 80) return '#10b981';
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

    getEmailContent(email) {
        if (email.body?.content) {
            // Nettoyer le contenu HTML pour éviter les erreurs de parsing
            let content = email.body.content;
            // Remplacer les meta tags problématiques
            content = content.replace(/<meta[^>]*>/gi, '');
            return content;
        }
        return `<p>${this.escapeHtml(email.bodyPreview || 'Aucun contenu disponible')}</p>`;
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

    async analyzeFirstEmails(emails) {
        if (!window.aiTaskAnalyzer) return;
        
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('[PageManager] Erreur analyse email:', error);
                }
            }
        }
    }

    // ================================================
    // AUTRES PAGES (Scanner, Tasks, Categories, Settings, Ranger)
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Utilisation ScanStartModule moderne');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule, fallback:', error);
            }
        }
        
        console.log('[PageManager] Utilisation interface scanner fallback');
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

addHarmonizedEmailStyles() {
    if (document.getElementById('harmonizedEmailStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'harmonizedEmailStyles';
    styles.textContent = `
        /* Variables CSS */
        :root {
            --btn-height: 44px;
            --btn-padding-horizontal: 16px;
            --btn-font-size: 13px;
            --btn-border-radius: 10px;
            --btn-font-weight: 600;
            --btn-gap: 8px;
            --card-height: 76px;
            --card-padding: 14px;
            --card-border-radius: 12px;
            --action-btn-size: 36px;
            --gap-small: 8px;
            --gap-medium: 12px;
            --gap-large: 16px;
            --transition-speed: 0.2s;
            --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
            --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
            --preselect-color: #8b5cf6;
            --preselect-color-light: #a78bfa;
            --preselect-color-dark: #7c3aed;
        }
        
        /* Conteneur principal centré */
        .emails-page-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .emails-main-container {
            width: 100%;
            max-width: 1400px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            padding: 24px;
            margin: 0 auto;
        }

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
        }
        
        .explanation-close-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: scale(1.1);
        }
        
        /* Wrapper pour la section de contrôles avec fond gris */
        .controls-section-wrapper {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: var(--card-border-radius);
            padding: var(--gap-medium);
            margin-bottom: var(--gap-medium);
            transition: all var(--transition-speed) ease;
        }
        
        /* Barre de contrôles */
        .controls-bar-harmonized {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--gap-large);
            min-height: var(--btn-height);
            transition: all var(--transition-speed) ease;
        }
        
        /* Ajustement dynamique quand il y a une sélection */
        .controls-bar-harmonized.has-selection {
            flex-wrap: wrap;
            gap: var(--gap-medium);
        }
        
        .search-section-harmonized {
            flex: 0 0 300px;
            height: var(--btn-height);
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
            border: 1px solid #d1d5db;
            border-radius: var(--btn-border-radius);
            font-size: var(--btn-font-size);
            background: white;
            transition: all var(--transition-speed) ease;
            outline: none;
        }
        
        .search-input-harmonized:focus {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-icon-harmonized {
            position: absolute;
            left: var(--gap-medium);
            color: #9ca3af;
            pointer-events: none;
        }
        
        .search-clear-harmonized {
            position: absolute;
            right: var(--gap-small);
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
            transition: all var(--transition-speed) ease;
        }
        
        .search-clear-harmonized:hover {
            background: #dc2626;
            transform: scale(1.1);
        }
        
        .view-modes-harmonized {
            display: flex;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: var(--btn-border-radius);
            padding: 4px;
            gap: 2px;
            height: var(--btn-height);
        }
        
        .view-mode-harmonized {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--btn-gap);
            padding: 0 var(--btn-padding-horizontal);
            height: calc(var(--btn-height) - 8px);
            border: none;
            background: transparent;
            color: #6b7280;
            border-radius: calc(var(--btn-border-radius) - 2px);
            cursor: pointer;
            transition: all var(--transition-speed) ease;
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            min-width: 120px;
        }
        
        .view-mode-harmonized:hover {
            background: rgba(59, 130, 246, 0.05);
            color: #374151;
        }
        
        .view-mode-harmonized.active {
            background: #3b82f6;
            color: white;
            box-shadow: var(--shadow-base);
            font-weight: 700;
        }
        
        .action-buttons-harmonized {
            display: flex;
            align-items: center;
            gap: var(--gap-small);
            height: var(--btn-height);
            flex-shrink: 0;
            flex-wrap: wrap;
        }
        
        .btn-harmonized {
            height: var(--btn-height);
            background: white;
            color: #374151;
            border: 1px solid #e5e7eb;
            border-radius: var(--btn-border-radius);
            padding: 0 var(--btn-padding-horizontal);
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            cursor: pointer;
            transition: all var(--transition-speed) ease;
            display: flex;
            align-items: center;
            gap: var(--btn-gap);
            box-shadow: var(--shadow-base);
            position: relative;
            white-space: nowrap;
        }
        
        .btn-harmonized:hover {
            background: #f9fafb;
            border-color: #6366f1;
            color: #1f2937;
            transform: translateY(-1px);
            box-shadow: var(--shadow-hover);
        }
        
        /* Boutons désactivés */
        .btn-harmonized.disabled {
            opacity: 0.5;
            cursor: not-allowed !important;
            pointer-events: none;
        }
        
        .btn-harmonized.disabled:hover {
            transform: none !important;
            box-shadow: var(--shadow-base) !important;
            background: white !important;
            border-color: #e5e7eb !important;
        }
        
        .btn-harmonized.btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        
        .btn-harmonized.btn-primary:hover {
            background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }
        
        .btn-harmonized.btn-primary.disabled {
            background: #e5e7eb !important;
            color: #9ca3af !important;
            box-shadow: var(--shadow-base) !important;
        }
        
        .btn-harmonized.btn-secondary {
            background: white;
            color: #475569;
            border-color: #e2e8f0;
        }
        
        .btn-harmonized.btn-secondary:hover {
            background: #f1f5f9;
            color: #334155;
            border-color: #cbd5e1;
        }
        
        .btn-harmonized.btn-selection-toggle {
            background: #f0f9ff;
            color: #0369a1;
            border-color: #0ea5e9;
        }
        
        .btn-harmonized.btn-selection-toggle:hover {
            background: #e0f2fe;
            color: #0c4a6e;
            border-color: #0284c7;
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
        }
        
        .btn-harmonized.btn-clear-selection {
            background: #f3f4f6;
            color: #6b7280;
            border: none;
            width: var(--btn-height);
            min-width: var(--btn-height);
            padding: 0;
        }
        
        .btn-harmonized.btn-clear-selection:hover {
            background: #e5e7eb;
            color: #374151;
        }
        
        .selection-info-harmonized {
            height: var(--btn-height);
            padding: 0 var(--btn-padding-horizontal);
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: var(--btn-border-radius);
            font-size: var(--btn-font-size);
            font-weight: var(--btn-font-weight);
            color: #1e40af;
            display: flex;
            align-items: center;
            gap: var(--btn-gap);
            flex-shrink: 0;
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
        }
        
        /* Dropdown actions */
        .dropdown-action-harmonized {
            position: relative;
            display: inline-block;
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
        
        /* ===== FILTRES DE CATÉGORIES ===== */
        .status-filters-harmonized-twolines {
            display: flex;
            gap: var(--gap-small);
            margin-bottom: var(--gap-medium);
            flex-wrap: wrap;
            width: 100%;
            background: #f8fafc;
            padding: var(--gap-medium);
            border-radius: var(--card-border-radius);
            border: 1px solid #e5e7eb;
        }
        
        /* Le reste des styles reste identique... */
        
        /* RESPONSIVE - Mise à jour pour la bande grise */
        @media (max-width: 1024px) {
            .controls-section-wrapper {
                padding: var(--gap-large);
            }
            
            .controls-bar-harmonized {
                flex-direction: column;
                gap: var(--gap-medium);
                align-items: stretch;
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
        
        @media (max-width: 768px) {
            .emails-page-container {
                padding: 10px;
            }
            
            .emails-main-container {
                padding: 16px;
                border-radius: 12px;
            }
            
            .controls-section-wrapper {
                padding: var(--gap-medium);
            }
        }
    `;
    
    document.head.appendChild(styles);
}

}

// Créer l'instance globale
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v12.1 loaded - Synchronisation fixée avec paramètres');
