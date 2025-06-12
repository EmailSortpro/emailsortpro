// CategoriesPage.js - Version 8.1 - Fix pré-sélection + création catégories personnalisées

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 8.1 - Fix pré-sélection + création catégories');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI',
            'showCreateCategoryModal', 'createNewCategory', 'editCustomCategory', 'deleteCustomCategory'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // CHARGEMENT ET SAUVEGARDE DES PARAMÈTRES
    // ================================================
    loadSettings() {
        if (window.categoryManager) {
            return window.categoryManager.getSettings();
        }
        
        // Fallback si CategoryManager n'est pas disponible
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings) {
        if (window.categoryManager) {
            window.categoryManager.updateSettings(newSettings);
        } else {
            // Fallback
            try {
                localStorage.setItem('categorySettings', JSON.stringify(newSettings));
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde paramètres:', error);
            }
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS
    // ================================================
    notifySettingsChange(settingType, value) {
        console.log(`[CategoriesPage] Notification changement: ${settingType}`, value);
        
        // Dispatching d'événement global
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { type: settingType, value: value }
        }));
        
        // Notifications spécialisées pour les modules
        this.notifySpecificModules(settingType, value);
    }

    notifySpecificModules(settingType, value) {
        // EmailScanner
        if (window.emailScanner) {
            switch (settingType) {
                case 'scanSettings':
                    if (typeof window.emailScanner.applyScanSettings === 'function') {
                        window.emailScanner.applyScanSettings(value);
                    }
                    break;
                case 'preferences':
                    if (typeof window.emailScanner.updatePreferences === 'function') {
                        window.emailScanner.updatePreferences(value);
                    }
                    break;
            }
        }
        
        // AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            if (settingType === 'taskPreselectedCategories' && 
                typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                window.aiTaskAnalyzer.updatePreselectedCategories(value);
            }
            
            if (settingType === 'automationSettings' && 
                typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                window.aiTaskAnalyzer.updateAutomationSettings(value);
            }
        }
        
        // PageManager - forcer la mise à jour des emails si nécessaire
        if (window.pageManager && 
            (settingType === 'preferences' || settingType === 'activeCategories')) {
            
            // Recatégoriser les emails si nécessaire
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                setTimeout(() => {
                    window.emailScanner.recategorizeEmails();
                }, 100);
            }
        }
    }

    // ================================================
    // RENDU PRINCIPAL DE LA PAGE PARAMÈTRES
    // ================================================
    renderSettings(container) {
        try {
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.debugSettings()" title="Debug">
                                <i class="fas fa-bug"></i> Debug
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.testCategorySelection()" title="Test">
                                <i class="fas fa-vial"></i> Test
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.forceUpdateUI()" title="Refresh">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <!-- Onglets -->
                    <div class="settings-tabs-compact">
                        <button class="tab-button-compact ${this.currentTab === 'general' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('general')">
                            <i class="fas fa-cog"></i> Général
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'automation' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('automation')">
                            <i class="fas fa-magic"></i> Automatisation
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'keywords' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('keywords')">
                            <i class="fas fa-key"></i> Catégories
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div class="tab-content-compact" id="tabContent">
                        ${this.renderTabContent(settings)}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = this.renderErrorState(error);
        }
    }

    renderTabContent(settings) {
        switch (this.currentTab) {
            case 'general':
                return this.renderGeneralTab(settings);
            case 'automation':
                return this.renderAutomationTab(settings);
            case 'keywords':
                return this.renderKeywordsTab(settings);
            default:
                return this.renderGeneralTab(settings);
        }
    }

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue: ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // NAVIGATION ENTRE ONGLETS
    // ================================================
    switchTab(tab) {
        try {
            this.currentTab = tab;
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            
            // Mettre à jour les boutons d'onglet
            document.querySelectorAll('.tab-button-compact').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.tab-button-compact[onclick*="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            // Mettre à jour le contenu
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings);
                
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
        }
    }

    // ================================================
    // ONGLET GÉNÉRAL
    // ================================================
    renderGeneralTab(settings) {
        return `
            <div class="settings-two-columns">
                <div class="settings-column-equal">
                    <!-- Configuration IA -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-robot"></i>
                            <h3>Intelligence Artificielle</h3>
                        </div>
                        <p>Analyse automatique des emails avec Claude AI pour créer des tâches intelligentes</p>
                        <button class="btn-compact btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                            <i class="fas fa-cog"></i> Configurer Claude AI
                        </button>
                    </div>

                    <!-- Paramètres généraux -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-sliders-h"></i>
                            <h3>Préférences générales</h3>
                        </div>
                        <p>Options d'affichage et de comportement de l'application</p>
                        
                        <div class="general-preferences">
                            <label class="checkbox-compact">
                                <input type="checkbox" id="darkMode" 
                                       ${settings.preferences?.darkMode ? 'checked' : ''}>
                                <span>Mode sombre (bientôt disponible)</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="compactView" 
                                       ${settings.preferences?.compactView ? 'checked' : ''}>
                                <span>Vue compacte des emails</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="showNotifications" 
                                       ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                                <span>Notifications activées</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="excludeSpam" 
                                       ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                                <span>Exclure les courriers indésirables</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="detectCC" 
                                       ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                                <span>Détecter les emails en copie (CC)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Sauvegarde -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-sync"></i>
                            <h3>Sauvegarde</h3>
                        </div>
                        <p>Exportez ou importez tous vos paramètres et configurations</p>
                        <div class="button-row">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.exportSettings()">
                                <i class="fas fa-download"></i> Exporter
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importSettings()">
                                <i class="fas fa-upload"></i> Importer
                            </button>
                        </div>
                    </div>
                </div>

                <div class="settings-column-equal">
                    <!-- Paramètres de scan -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-search"></i>
                            <h3>Scan d'emails</h3>
                        </div>
                        <p>Options par défaut pour scanner vos emails et analyser le contenu</p>
                        
                        <div class="scan-settings-compact">
                            <div class="setting-row">
                                <label>Période par défaut</label>
                                <select id="defaultScanPeriod" class="select-compact">
                                    <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                    <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                    <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                    <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                    <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                                </select>
                            </div>
                            
                            <div class="setting-row">
                                <label>Dossier par défaut</label>
                                <select id="defaultFolder" class="select-compact">
                                    <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                    <option value="all" ${settings.scanSettings?.defaultFolder === 'all' ? 'selected' : ''}>Tous les dossiers</option>
                                </select>
                            </div>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="autoAnalyze" 
                                       ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                                <span>Analyse IA automatique après scan</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="autoCategrize" 
                                       ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                                <span>Catégorisation automatique</span>
                            </label>
                        </div>
                    </div>

                    <!-- Exclusions -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-filter"></i>
                            <h3>Exclusions et redirections</h3>
                        </div>
                        <p>Assignez automatiquement des emails à des catégories selon leur provenance</p>
                        
                        ${this.renderOptimizedExclusions(settings)}
                        
                        <div class="exclusions-footer-minimal">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openExclusionsModal()">
                                <i class="fas fa-list"></i> Gérer toutes les exclusions
                            </button>
                            <span class="exclusions-count">
                                ${(settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0)} règles actives
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOptimizedExclusions(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const domains = settings.categoryExclusions?.domains || [];
            const emails = settings.categoryExclusions?.emails || [];
            
            return `
                <div class="exclusions-optimized">
                    <!-- Aperçu rapide -->
                    <div class="exclusions-summary">
                        <div class="summary-item">
                            <span class="summary-icon"><i class="fas fa-globe"></i></span>
                            <span class="summary-text">${domains.length} domaine(s)</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-icon"><i class="fas fa-at"></i></span>
                            <span class="summary-text">${emails.length} email(s)</span>
                        </div>
                    </div>
                    
                    <!-- Ajout rapide -->
                    <div class="quick-add-section">
                        <div class="quick-add-row">
                            <input type="text" 
                                   id="quick-exclusion-input"
                                   placeholder="domaine.com ou email@exemple.com">
                            <select id="quick-exclusion-category" class="select-compact">
                                <option value="">Catégorie...</option>
                                ${Object.entries(categories).map(([id, cat]) => `
                                    <option value="${id}">${cat.icon} ${cat.name}</option>
                                `).join('')}
                            </select>
                            <button class="btn-quick-add" onclick="window.categoriesPage.addQuickExclusion()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Dernières exclusions -->
                    ${this.renderRecentExclusions(domains, emails, categories)}
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderOptimizedExclusions:', error);
            return '<div>Erreur lors du chargement des exclusions</div>';
        }
    }

    renderRecentExclusions(domains, emails, categories) {
        try {
            const allExclusions = [
                ...domains.map(d => ({ ...d, type: 'domain' })),
                ...emails.map(e => ({ ...e, type: 'email' }))
            ].slice(-4);
            
            if (allExclusions.length === 0) {
                return `
                    <div class="no-exclusions-minimal">
                        <i class="fas fa-info-circle"></i>
                        <span>Aucune exclusion configurée</span>
                    </div>
                `;
            }
            
            return `
                <div class="recent-exclusions">
                    <h5>Dernières exclusions</h5>
                    <div class="exclusions-mini-list">
                        ${allExclusions.map(item => {
                            const category = categories[item.category];
                            return `
                                <div class="exclusion-mini-item">
                                    <span class="exclusion-mini-value">
                                        <i class="fas fa-${item.type === 'domain' ? 'globe' : 'at'}"></i>
                                        ${item.value}
                                    </span>
                                    ${category ? `
                                        <span class="category-mini-badge" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </span>
                                    ` : '<span class="no-category-mini">?</span>'}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderRecentExclusions:', error);
            return '<div>Erreur lors du chargement des exclusions récentes</div>';
        }
    }

    // ================================================
    // ONGLET AUTOMATISATION
    // ================================================
    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] Rendu automatisation:');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées:', preselectedCategories);
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                        </div>
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                        
                        <!-- Sélection des catégories -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation" id="categoriesSelectionGrid">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    console.log(`[CategoriesPage] Catégorie ${id} (${category.name}): ${isPreselected ? 'SÉLECTIONNÉE' : 'non sélectionnée'}`);
                                    return `
                                        <label class="category-checkbox-item-enhanced" data-category-id="${id}">
                                            <input type="checkbox" 
                                                   class="category-preselect-checkbox"
                                                   value="${id}"
                                                   data-category-name="${category.name}"
                                                   ${isPreselected ? 'checked' : ''}
                                                   onchange="window.categoriesPage.updateTaskPreselectedCategories()">
                                            <div class="category-checkbox-content-enhanced">
                                                <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                    ${category.icon}
                                                </span>
                                                <span class="cat-name-automation">${category.name}</span>
                                                ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                            </div>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Options d'automatisation -->
                        <div class="automation-options-enhanced">
                            <h4><i class="fas fa-cog"></i> Options d'automatisation</h4>
                            <div class="automation-options-grid">
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoCreateTasks" 
                                           ${settings.automationSettings?.autoCreateTasks ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Création automatique</span>
                                        <span class="checkbox-description">Créer automatiquement les tâches sans confirmation</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="groupTasksByDomain" 
                                           ${settings.automationSettings?.groupTasksByDomain ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Regroupement par domaine</span>
                                        <span class="checkbox-description">Regrouper les tâches par domaine d'expéditeur</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="skipDuplicates" 
                                           ${settings.automationSettings?.skipDuplicates !== false ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Ignorer les doublons</span>
                                        <span class="checkbox-description">Éviter de créer des tâches en double</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoAssignPriority" 
                                           ${settings.automationSettings?.autoAssignPriority ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Priorité automatique</span>
                                        <span class="checkbox-description">Assigner automatiquement la priorité selon l'expéditeur</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Statistiques -->
                        <div class="automation-stats">
                            <h4><i class="fas fa-chart-bar"></i> Statistiques</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-categories">${preselectedCategories.length}</span>
                                    <span class="stat-label">Catégories actives</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-exclusions">${(settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0)}</span>
                                    <span class="stat-label">Règles d'exclusion</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="stat-automation">${Object.values(settings.automationSettings || {}).filter(Boolean).length}</span>
                                    <span class="stat-label">Options activées</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderAutomationTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet automatisation</div>';
        }
    }

    // ================================================
    // ONGLET CATÉGORIES AVEC CRÉATION PERSONNALISÉE
    // ================================================
    renderKeywordsTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = window.categoryManager?.getCustomCategories() || {};
            const activeCategories = settings.activeCategories || Object.keys(categories);
            
            return `
                <div class="keywords-tab-layout">
                    <!-- Header avec bouton de création -->
                    <div class="categories-header">
                        <div class="categories-header-left">
                            <h3><i class="fas fa-tags"></i> Gestion des catégories</h3>
                            <p>Configurez les catégories d'emails et leurs mots-clés pour une meilleure classification</p>
                        </div>
                        <div class="categories-header-right">
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                <i class="fas fa-plus"></i> Nouvelle catégorie
                            </button>
                        </div>
                    </div>

                    <!-- Statistiques rapides -->
                    <div class="categories-stats-bar">
                        <div class="stat-quick">
                            <span class="stat-number">${Object.keys(categories).length}</span>
                            <span class="stat-label">Total</span>
                        </div>
                        <div class="stat-quick">
                            <span class="stat-number">${Object.keys(customCategories).length}</span>
                            <span class="stat-label">Personnalisées</span>
                        </div>
                        <div class="stat-quick">
                            <span class="stat-number">${activeCategories.length}</span>
                            <span class="stat-label">Actives</span>
                        </div>
                    </div>

                    <!-- Grille des catégories -->
                    <div class="categories-grid-minimal">
                        ${Object.entries(categories).map(([id, category]) => {
                            const isActive = activeCategories.includes(id);
                            const keywordCount = this.getTotalKeywordsForCategory(id);
                            const isCustom = category.isCustom || false;
                            
                            return `
                                <div class="category-card-minimal ${isActive ? 'active' : 'inactive'}" data-category="${id}">
                                    <div class="category-content-minimal">
                                        <div class="category-icon-minimal" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </div>
                                        <div class="category-info-minimal">
                                            <h4>
                                                ${category.name}
                                                ${isCustom ? '<span class="custom-indicator">Personnalisée</span>' : ''}
                                            </h4>
                                            <span class="keyword-count-minimal">${keywordCount} mots-clés</span>
                                            ${category.description ? `<span class="category-description">${category.description}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="category-actions-minimal">
                                        <button class="btn-edit-keywords" onclick="window.categoriesPage.openKeywordsModal('${id}')" title="Modifier les mots-clés">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        ${isCustom ? `
                                            <button class="btn-edit-category" onclick="window.categoriesPage.editCustomCategory('${id}')" title="Modifier la catégorie">
                                                <i class="fas fa-cog"></i>
                                            </button>
                                            <button class="btn-delete-category" onclick="window.categoriesPage.deleteCustomCategory('${id}')" title="Supprimer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                        <label class="toggle-minimal" title="${isActive ? 'Désactiver' : 'Activer'}">
                                            <input type="checkbox" 
                                                   ${isActive ? 'checked' : ''}
                                                   onchange="window.categoriesPage.toggleCategory('${id}', this.checked)">
                                            <span class="toggle-slider-minimal"></span>
                                        </label>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Actions globales -->
                    <div class="global-actions-bar">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.openAllKeywordsModal()">
                            <i class="fas fa-list"></i> Voir tous les mots-clés
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openExclusionsModal()">
                            <i class="fas fa-ban"></i> Exclusions globales
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.testCategorization()">
                            <i class="fas fa-vial"></i> Tester la catégorisation
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    // ================================================
    // MODAL DE CRÉATION DE CATÉGORIE PERSONNALISÉE
    // ================================================
    showCreateCategoryModal() {
        const modalId = 'createCategoryModal';
        
        // Supprimer les modales existantes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Créer une nouvelle catégorie</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal('${modalId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <form id="createCategoryForm" onsubmit="window.categoriesPage.createNewCategory(event)">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="categoryName">Nom de la catégorie *</label>
                                    <input type="text" id="categoryName" required placeholder="Ex: Support Client" maxlength="50">
                                </div>
                                
                                <div class="form-group">
                                    <label for="categoryIcon">Icône</label>
                                    <div class="icon-selector">
                                        <input type="text" id="categoryIcon" value="📂" maxlength="2">
                                        <div class="icon-suggestions">
                                            ${['📂', '💼', '🔧', '📞', '💰', '📊', '🎯', '🚀', '⚡', '🔔', '📧', '🏷️'].map(icon => 
                                                `<button type="button" class="icon-option" onclick="document.getElementById('categoryIcon').value='${icon}'">${icon}</button>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="categoryColor">Couleur</label>
                                    <div class="color-selector">
                                        <input type="color" id="categoryColor" value="#6366f1">
                                        <div class="color-presets">
                                            ${['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'].map(color => 
                                                `<button type="button" class="color-preset" style="background: ${color}" onclick="document.getElementById('categoryColor').value='${color}'"></button>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="categoryDescription">Description (optionnelle)</label>
                                    <textarea id="categoryDescription" placeholder="Description de cette catégorie" rows="2" maxlength="200"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="categoryPriority">Priorité</label>
                                    <select id="categoryPriority">
                                        <option value="10">Très basse (10)</option>
                                        <option value="30" selected>Normale (30)</option>
                                        <option value="50">Haute (50)</option>
                                        <option value="70">Très haute (70)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="keywords-section">
                                <h4><i class="fas fa-key"></i> Mots-clés de détection</h4>
                                <p class="keywords-help">Ajoutez des mots-clés pour que cette catégorie soit automatiquement détectée dans les emails</p>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés absolus (détection garantie)</label>
                                    <textarea id="absoluteKeywords" placeholder="urgent, action required, immediate attention" rows="2"></textarea>
                                    <small>Séparez par des virgules. Ces mots garantissent la catégorisation.</small>
                                </div>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés forts (score élevé)</label>
                                    <textarea id="strongKeywords" placeholder="important, priority, asap" rows="2"></textarea>
                                    <small>Mots-clés avec un poids important dans la détection.</small>
                                </div>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés faibles (indices)</label>
                                    <textarea id="weakKeywords" placeholder="help, support, question" rows="2"></textarea>
                                    <small>Mots-clés qui donnent des indices mais ne garantissent pas la catégorisation.</small>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal('${modalId}')">
                            Annuler
                        </button>
                        <button type="submit" form="createCategoryForm" class="btn-compact btn-primary">
                            <i class="fas fa-check"></i> Créer la catégorie
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Focus sur le champ nom
        setTimeout(() => {
            document.getElementById('categoryName')?.focus();
        }, 100);
    }

    createNewCategory(event) {
        event.preventDefault();
        
        try {
            const name = document.getElementById('categoryName').value.trim();
            const icon = document.getElementById('categoryIcon').value.trim() || '📂';
            const color = document.getElementById('categoryColor').value;
            const description = document.getElementById('categoryDescription').value.trim();
            const priority = parseInt(document.getElementById('categoryPriority').value);
            
            // Récupérer les mots-clés
            const absoluteKeywords = document.getElementById('absoluteKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            const strongKeywords = document.getElementById('strongKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            const weakKeywords = document.getElementById('weakKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            
            if (!name) {
                window.uiManager?.showToast('Le nom est requis', 'warning');
                return;
            }
            
            const categoryData = {
                name,
                icon,
                color,
                description,
                priority,
                keywords: {
                    absolute: absoluteKeywords,
                    strong: strongKeywords,
                    weak: weakKeywords,
                    exclusions: []
                }
            };
            
            if (window.categoryManager) {
                const newCategory = window.categoryManager.createCustomCategory(categoryData);
                
                window.uiManager?.showToast(`Catégorie "${name}" créée avec succès`, 'success');
                this.closeModal('createCategoryModal');
                this.refreshCurrentTab();
                
                console.log('[CategoriesPage] Nouvelle catégorie créée:', newCategory);
            } else {
                throw new Error('CategoryManager non disponible');
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur création catégorie:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    editCustomCategory(categoryId) {
        if (!window.categoryManager) {
            window.uiManager?.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        const category = window.categoryManager.getCategory(categoryId);
        if (!category || !category.isCustom) {
            window.uiManager?.showToast('Catégorie personnalisée non trouvée', 'error');
            return;
        }
        
        const keywords = window.categoryManager.getCategoryKeywords(categoryId);
        const modalId = 'editCategoryModal';
        
        // Supprimer les modales existantes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Modifier la catégorie "${category.name}"</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal('${modalId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <form id="editCategoryForm" onsubmit="window.categoriesPage.updateCustomCategory(event, '${categoryId}')">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="editCategoryName">Nom de la catégorie *</label>
                                    <input type="text" id="editCategoryName" required value="${category.name}" maxlength="50">
                                </div>
                                
                                <div class="form-group">
                                    <label for="editCategoryIcon">Icône</label>
                                    <div class="icon-selector">
                                        <input type="text" id="editCategoryIcon" value="${category.icon}" maxlength="2">
                                        <div class="icon-suggestions">
                                            ${['📂', '💼', '🔧', '📞', '💰', '📊', '🎯', '🚀', '⚡', '🔔', '📧', '🏷️'].map(icon => 
                                                `<button type="button" class="icon-option" onclick="document.getElementById('editCategoryIcon').value='${icon}'">${icon}</button>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editCategoryColor">Couleur</label>
                                    <div class="color-selector">
                                        <input type="color" id="editCategoryColor" value="${category.color}">
                                        <div class="color-presets">
                                            ${['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'].map(color => 
                                                `<button type="button" class="color-preset" style="background: ${color}" onclick="document.getElementById('editCategoryColor').value='${color}'"></button>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="editCategoryDescription">Description (optionnelle)</label>
                                    <textarea id="editCategoryDescription" rows="2" maxlength="200">${category.description || ''}</textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editCategoryPriority">Priorité</label>
                                    <select id="editCategoryPriority">
                                        <option value="10" ${category.priority === 10 ? 'selected' : ''}>Très basse (10)</option>
                                        <option value="30" ${category.priority === 30 ? 'selected' : ''}>Normale (30)</option>
                                        <option value="50" ${category.priority === 50 ? 'selected' : ''}>Haute (50)</option>
                                        <option value="70" ${category.priority === 70 ? 'selected' : ''}>Très haute (70)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="keywords-section">
                                <h4><i class="fas fa-key"></i> Mots-clés de détection</h4>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés absolus</label>
                                    <textarea id="editAbsoluteKeywords" rows="2">${keywords.absolute?.join(', ') || ''}</textarea>
                                </div>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés forts</label>
                                    <textarea id="editStrongKeywords" rows="2">${keywords.strong?.join(', ') || ''}</textarea>
                                </div>
                                
                                <div class="keywords-input-group">
                                    <label>Mots-clés faibles</label>
                                    <textarea id="editWeakKeywords" rows="2">${keywords.weak?.join(', ') || ''}</textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal('${modalId}')">
                            Annuler
                        </button>
                        <button type="submit" form="editCategoryForm" class="btn-compact btn-primary">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    updateCustomCategory(event, categoryId) {
        event.preventDefault();
        
        try {
            const name = document.getElementById('editCategoryName').value.trim();
            const icon = document.getElementById('editCategoryIcon').value.trim() || '📂';
            const color = document.getElementById('editCategoryColor').value;
            const description = document.getElementById('editCategoryDescription').value.trim();
            const priority = parseInt(document.getElementById('editCategoryPriority').value);
            
            // Récupérer les mots-clés
            const absoluteKeywords = document.getElementById('editAbsoluteKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            const strongKeywords = document.getElementById('editStrongKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            const weakKeywords = document.getElementById('editWeakKeywords').value
                .split(',').map(k => k.trim()).filter(k => k.length > 0);
            
            if (!name) {
                window.uiManager?.showToast('Le nom est requis', 'warning');
                return;
            }
            
            const updates = {
                name,
                icon,
                color,
                description,
                priority
            };
            
            const keywords = {
                absolute: absoluteKeywords,
                strong: strongKeywords,
                weak: weakKeywords,
                exclusions: []
            };
            
            if (window.categoryManager) {
                window.categoryManager.updateCustomCategory(categoryId, updates);
                window.categoryManager.updateCategoryKeywords(categoryId, keywords);
                
                window.uiManager?.showToast(`Catégorie "${name}" mise à jour`, 'success');
                this.closeModal('editCategoryModal');
                this.refreshCurrentTab();
                
                console.log('[CategoriesPage] Catégorie mise à jour:', categoryId);
            } else {
                throw new Error('CategoryManager non disponible');
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur mise à jour catégorie:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    deleteCustomCategory(categoryId) {
        if (!window.categoryManager) {
            window.uiManager?.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        const category = window.categoryManager.getCategory(categoryId);
        if (!category || !category.isCustom) {
            window.uiManager?.showToast('Catégorie personnalisée non trouvée', 'error');
            return;
        }
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible.`)) {
            try {
                window.categoryManager.deleteCustomCategory(categoryId);
                
                window.uiManager?.showToast(`Catégorie "${category.name}" supprimée`, 'success');
                this.refreshCurrentTab();
                
                console.log('[CategoriesPage] Catégorie supprimée:', categoryId);
            } catch (error) {
                console.error('[CategoriesPage] Erreur suppression catégorie:', error);
                window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS CORRIGÉE
    // ================================================
    initializeEventListeners() {
        try {
            // Préférences générales
            const preferences = ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'];
            preferences.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.savePreferences);
                    element.addEventListener('change', this.savePreferences);
                }
            });

            // Paramètres de scan
            const scanSettings = ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'];
            scanSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveScanSettings);
                    element.addEventListener('change', this.saveScanSettings);
                }
            });

            // Paramètres d'automatisation
            const automationSettings = ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'];
            automationSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveAutomationSettings);
                    element.addEventListener('change', this.saveAutomationSettings);
                }
            });

            // CORRECTION: Catégories pré-sélectionnées pour les tâches
            // Utiliser la classe spécifique au lieu du sélecteur générique
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            console.log(`[CategoriesPage] Initialisation ${categoryCheckboxes.length} checkboxes de pré-sélection`);
            
            categoryCheckboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] Checkbox ${index}: value=${checkbox.value}, checked=${checkbox.checked}`);
                
                // Retirer l'ancien listener s'il existe
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                
                // Ajouter le nouveau listener
                checkbox.addEventListener('change', this.updateTaskPreselectedCategories);
            });

            // Ajout rapide d'exclusions
            const quickInput = document.getElementById('quick-exclusion-input');
            if (quickInput) {
                quickInput.removeEventListener('keypress', this.handleQuickExclusionKeypress);
                quickInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addQuickExclusion();
                    }
                });
            }

            console.log('[CategoriesPage] Événements initialisés avec correction des checkboxes');
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    // ================================================
    // MÉTHODES DE SAUVEGARDE
    // ================================================
    savePreferences() {
        try {
            const settings = this.loadSettings();
            
            const preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            settings.preferences = preferences;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] Préférences sauvegardées:', preferences);
            this.notifySettingsChange('preferences', preferences);
            
            window.uiManager?.showToast('Préférences sauvegardées', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            const settings = this.loadSettings();
            
            const scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            settings.scanSettings = scanSettings;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] Paramètres de scan sauvegardés:', scanSettings);
            this.notifySettingsChange('scanSettings', scanSettings);
            
            window.uiManager?.showToast('Paramètres de scan sauvegardés', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            const settings = this.loadSettings();
            
            const automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            settings.automationSettings = automationSettings;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] Paramètres automatisation sauvegardés:', automationSettings);
            this.notifySettingsChange('automationSettings', automationSettings);
            
            window.uiManager?.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            this.updateAutomationStats();
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] === DÉBUT updateTaskPreselectedCategories ===');
            
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            console.log(`[CategoriesPage] Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
            
            const selectedCategories = [];
            checkboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] Checkbox ${index}:`);
                console.log(`  - Value: "${checkbox.value}"`);
                console.log(`  - Checked: ${checkbox.checked}`);
                console.log(`  - Data name: "${checkbox.dataset.categoryName}"`);
                
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            console.log('[CategoriesPage] Nouvelles catégories sélectionnées:', selectedCategories);
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            window.uiManager?.showToast(`${selectedCategories.length} catégorie(s) sélectionnée(s) pour les tâches`, 'success');
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] === FIN updateTaskPreselectedCategories ===');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            window.uiManager?.showToast('Erreur de mise à jour', 'error');
        }
    }

    addQuickExclusion() {
        try {
            const input = document.getElementById('quick-exclusion-input');
            const categorySelect = document.getElementById('quick-exclusion-category');
            
            if (!input?.value.trim() || !categorySelect?.value) {
                window.uiManager?.showToast('Veuillez remplir tous les champs', 'warning');
                return;
            }
            
            const value = input.value.trim().toLowerCase();
            const isEmail = value.includes('@');
            const type = isEmail ? 'emails' : 'domains';
            
            const cleanValue = isEmail ? 
                value :
                value.replace(/^https?:\/\//, '').replace(/\/$/, '');
            
            const settings = this.loadSettings();
            if (!settings.categoryExclusions) {
                settings.categoryExclusions = { domains: [], emails: [] };
            }
            if (!settings.categoryExclusions[type]) {
                settings.categoryExclusions[type] = [];
            }
            
            if (settings.categoryExclusions[type].some(item => item.value === cleanValue)) {
                window.uiManager?.showToast('Cette exclusion existe déjà', 'warning');
                return;
            }
            
            settings.categoryExclusions[type].push({
                value: cleanValue,
                category: categorySelect.value
            });
            
            this.saveSettings(settings);
            
            input.value = '';
            categorySelect.value = '';
            
            this.refreshCurrentTab();
            window.uiManager?.showToast('Exclusion ajoutée', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur addQuickExclusion:', error);
            window.uiManager?.showToast('Erreur lors de l\'ajout', 'error');
        }
    }

    toggleCategory(categoryId, isActive) {
        try {
            const settings = this.loadSettings();
            
            if (!settings.activeCategories) {
                const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
                settings.activeCategories = allCategories;
            }
            
            if (isActive) {
                if (!settings.activeCategories.includes(categoryId)) {
                    settings.activeCategories.push(categoryId);
                }
            } else {
                settings.activeCategories = settings.activeCategories.filter(id => id !== categoryId);
            }
            
            this.saveSettings(settings);
            this.notifySettingsChange('activeCategories', settings.activeCategories);
            
            console.log(`[CategoriesPage] Catégorie ${categoryId} ${isActive ? 'activée' : 'désactivée'}`);
            window.uiManager?.showToast(`Catégorie ${isActive ? 'activée' : 'désactivée'}`, 'success', 2000);
        } catch (error) {
            console.error('[CategoriesPage] Erreur toggleCategory:', error);
            window.uiManager?.showToast('Erreur de modification', 'error');
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    updateAutomationStats() {
        try {
            const settings = this.loadSettings();
            const statCategories = document.getElementById('stat-categories');
            const statExclusions = document.getElementById('stat-exclusions');
            const statAutomation = document.getElementById('stat-automation');
            
            if (statCategories) {
                statCategories.textContent = settings.taskPreselectedCategories?.length || 0;
            }
            if (statExclusions) {
                statExclusions.textContent = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
            }
            if (statAutomation) {
                statAutomation.textContent = Object.values(settings.automationSettings || {}).filter(Boolean).length;
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateAutomationStats:', error);
        }
    }

    refreshCurrentTab() {
        try {
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings);
                
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
        }
    }

    getTotalKeywordsForCategory(categoryId) {
        try {
            if (!window.categoryManager || !window.categoryManager.weightedKeywords) {
                return 0;
            }
            
            const keywords = window.categoryManager.weightedKeywords[categoryId] || {};
            let count = 0;
            if (keywords.absolute) count += keywords.absolute.length;
            if (keywords.strong) count += keywords.strong.length;
            if (keywords.weak) count += keywords.weak.length;
            return count;
        } catch (error) {
            console.error('[CategoriesPage] Erreur getTotalKeywordsForCategory:', error);
            return 0;
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    debugSettings() {
        const settings = this.loadSettings();
        console.log('\n=== DEBUG SETTINGS ===');
        console.log('Settings complets:', settings);
        console.log('CategoryManager settings:', window.categoryManager?.getSettings());
        console.log('EmailScanner settings:', window.emailScanner?.settings);
        console.log('========================\n');
        return settings;
    }
    
    testCategorySelection() {
        console.log('\n=== TEST CATEGORY SELECTION ===');
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        console.log(`Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}:`);
            console.log(`  - Value: ${checkbox.value}`);
            console.log(`  - Checked: ${checkbox.checked}`);
            console.log(`  - Data name: ${checkbox.dataset.categoryName}`);
        });
        
        const categories = window.categoryManager?.getCategories() || {};
        console.log('Catégories disponibles:', Object.keys(categories));
        
        const settings = this.loadSettings();
        console.log('Catégories pré-sélectionnées dans les settings:', settings.taskPreselectedCategories);
        console.log('================================\n');
        
        return { checkboxes: checkboxes.length, categories: Object.keys(categories) };
    }

    testCategorization() {
        if (!window.categoryManager) {
            window.uiManager?.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        // Test avec le nouveau pattern intégré
        const testResults = [
            window.categoryManager.testEmail('Newsletter hebdomadaire - Vous ne souhaitez plus recevoir nos communications ? Paramétrez vos choix ici', 'marketing_news'),
            window.categoryManager.testEmail('Action requise: Veuillez confirmer votre commande', 'tasks'),
            window.categoryManager.testEmail('Réunion équipe demain à 14h', 'meetings'),
            window.categoryManager.testEmail('Facture #2024-001 en pièce jointe', 'finance')
        ];
        
        window.uiManager?.showToast('Tests de catégorisation terminés - voir console', 'info');
        return testResults;
    }
    
    forceUpdateUI() {
        console.log('[CategoriesPage] Force update UI...');
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 100);
    }

    // ================================================
    // MÉTHODES MODALES (simplifiées)
    // ================================================
    openKeywordsModal(categoryId) {
        console.log('[CategoriesPage] Ouverture modal mots-clés pour:', categoryId);
        window.uiManager?.showToast('Modal mots-clés (à implémenter)', 'info');
    }

    openAllKeywordsModal() {
        console.log('[CategoriesPage] Ouverture modal tous mots-clés');
        window.uiManager?.showToast('Modal tous mots-clés (à implémenter)', 'info');
    }

    openExclusionsModal() {
        console.log('[CategoriesPage] Ouverture modal exclusions');
        window.uiManager?.showToast('Modal exclusions (à implémenter)', 'info');
    }

    // ================================================
    // IMPORT/EXPORT
    // ================================================
    exportSettings() {
        try {
            const settings = this.loadSettings();
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = window.categoryManager?.getCustomCategories() || {};
            const weightedKeywords = window.categoryManager?.weightedKeywords || {};
            
            const exportData = {
                version: '8.1',
                exportDate: new Date().toISOString(),
                settings: settings,
                categories: categories,
                customCategories: customCategories,
                weightedKeywords: weightedKeywords
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.uiManager?.showToast('Paramètres exportés', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur exportSettings:', error);
            window.uiManager?.showToast('Erreur d\'export', 'error');
        }
    }

    async importSettings() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    if (data.settings) {
                        this.saveSettings(data.settings);
                    }
                    
                    if (data.customCategories && window.categoryManager) {
                        // Importer les catégories personnalisées
                        Object.entries(data.customCategories).forEach(([id, category]) => {
                            try {
                                window.categoryManager.createCustomCategory(category);
                            } catch (error) {
                                console.warn('Erreur import catégorie:', id, error);
                            }
                        });
                    }
                    
                    if (data.weightedKeywords && window.categoryManager) {
                        window.categoryManager.weightedKeywords = data.weightedKeywords;
                    }
                    
                    window.uiManager?.showToast('Paramètres importés', 'success');
                    this.refreshCurrentTab();
                    
                } catch (error) {
                    console.error('Import error:', error);
                    window.uiManager?.showToast('Erreur d\'importation', 'error');
                }
            };
            
            input.click();
        } catch (error) {
            console.error('[CategoriesPage] Erreur importSettings:', error);
            window.uiManager?.showToast('Erreur d\'import', 'error');
        }
    }

    // ================================================
    // MÉTHODES PUBLIQUES POUR INTÉGRATION
    // ================================================
    getScanSettings() {
        return this.loadSettings().scanSettings || this.getDefaultSettings().scanSettings;
    }
    
    getAutomationSettings() {
        return this.loadSettings().automationSettings || this.getDefaultSettings().automationSettings;
    }
    
    getTaskPreselectedCategories() {
        return this.loadSettings().taskPreselectedCategories || [];
    }
    
    shouldExcludeSpam() {
        return this.loadSettings().preferences?.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        return this.loadSettings().preferences?.detectCC !== false;
    }

    hideExplanationMessage() {
        localStorage.setItem('hideEmailExplanation', 'true');
        if (window.pageManager) {
            window.pageManager.hideExplanation = true;
            window.pageManager.refreshEmailsView?.();
        }
    }

    // ================================================
    // STYLES CSS ÉTENDUS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Variables CSS */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-padding: 20px;
                --card-border-radius: 12px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.1);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            /* Page Settings Compacte */
            .settings-page-compact {
                padding: 20px;
                max-width: 1600px;
                margin: 0 auto;
                height: calc(100vh - 140px);
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .page-header-compact {
                margin-bottom: 20px;
            }
            
            .page-header-compact h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }

            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                gap: 4px;
                background: #f3f4f6;
                padding: 4px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            
            .tab-button-compact {
                flex: 1;
                padding: 10px 16px;
                background: transparent;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                color: #6b7280;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            .tab-button-compact:hover {
                background: rgba(255, 255, 255, 0.5);
                color: #374151;
            }
            
            .tab-button-compact.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
            }
            
            .tab-content-compact {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
            }

            /* Layout à deux colonnes */
            .settings-two-columns {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                height: 100%;
            }
            
            .settings-column-equal {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            /* Cards Settings */
            .settings-card-compact {
                background: white;
                border-radius: var(--card-border-radius);
                padding: var(--card-padding);
                box-shadow: var(--shadow-base);
                display: flex;
                flex-direction: column;
            }
            
            .settings-card-compact.full-width {
                width: 100%;
            }
            
            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .card-header-compact i {
                font-size: 20px;
                color: #667eea;
            }
            
            .card-header-compact h3 {
                margin: 0;
                font-size: 18px;
                color: #1f2937;
            }
            
            .settings-card-compact p {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
            }

            /* Buttons */
            .btn-compact {
                height: var(--btn-height);
                padding: 0 var(--btn-padding-horizontal);
                border: none;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: inline-flex;
                align-items: center;
                gap: var(--btn-gap);
                text-decoration: none;
                white-space: nowrap;
                box-sizing: border-box;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
            }
            
            .btn-primary:hover {
                background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
                color: #1f2937;
                transform: translateY(-1px);
            }
            
            .button-row {
                display: flex;
                gap: var(--gap-small);
            }

            /* Préférences générales */
            .general-preferences {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 12px;
            }
            
            .checkbox-compact {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                font-size: 14px;
                color: #4b5563;
                padding: 8px 0;
                transition: all var(--transition-speed) ease;
            }
            
            .checkbox-compact:hover {
                color: #1f2937;
            }
            
            .checkbox-compact input {
                width: 18px;
                height: 18px;
                cursor: pointer;
                border-radius: 4px;
            }

            /* Scan Settings */
            .scan-settings-compact {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .setting-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .setting-row label {
                font-size: 14px;
                color: #374151;
                font-weight: 500;
                min-width: 70px;
            }
            
            .select-compact {
                flex: 1;
                height: var(--btn-height);
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
            }
            
            .select-compact:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Layout automatisation */
            .automation-focused-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .task-automation-section {
                margin: 20px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
            }
            
            .task-automation-section h4 {
                margin: 0 0 16px 0;
                font-size: 15px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 12px;
                max-height: 300px;
                overflow-y: auto;
                padding: 4px;
            }
            
            .category-checkbox-item-enhanced {
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 14px;
                border-radius: 10px;
                border: 2px solid #e5e7eb;
                transition: all var(--transition-speed) ease;
                background: white;
                position: relative;
            }
            
            .category-checkbox-item-enhanced:hover {
                border-color: #667eea;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"] {
                position: absolute;
                width: 20px;
                height: 20px;
                margin: 0;
                cursor: pointer;
                opacity: 0;
                z-index: 2;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"]:checked + .category-checkbox-content-enhanced {
                background: #667eea10;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"]:checked + .category-checkbox-content-enhanced::before {
                content: '✓';
                background: #667eea;
                color: white;
            }
            
            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
                padding-left: 32px;
                position: relative;
                border-radius: 8px;
                transition: all var(--transition-speed) ease;
            }
            
            .category-checkbox-content-enhanced::before {
                content: '';
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                background: white;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            
            .cat-icon-automation {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .cat-name-automation {
                font-size: 15px;
                color: #374151;
                font-weight: 600;
                line-height: 1.2;
            }

            .custom-badge {
                background: #10b981;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                margin-left: 8px;
                font-weight: 600;
            }

            /* Options d'automatisation */
            .automation-options-enhanced {
                margin: 20px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
            }
            
            .automation-options-enhanced h4 {
                margin: 0 0 16px 0;
                font-size: 15px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
            }
            
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                cursor: pointer;
                padding: 16px;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                transition: all var(--transition-speed) ease;
                position: relative;
            }
            
            .checkbox-enhanced:hover {
                border-color: #667eea;
                box-shadow: var(--shadow-hover);
            }
            
            .checkbox-enhanced input[type="checkbox"] {
                position: absolute;
                width: 18px;
                height: 18px;
                margin: 0;
                cursor: pointer;
                opacity: 0;
                z-index: 2;
            }
            
            .checkbox-enhanced input[type="checkbox"]:checked + .checkbox-content::before {
                content: '✓';
                background: #10b981;
                color: white;
            }
            
            .checkbox-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;
                padding-left: 28px;
                position: relative;
            }
            
            .checkbox-content::before {
                content: '';
                position: absolute;
                left: 0;
                top: 2px;
                width: 18px;
                height: 18px;
                border: 2px solid #d1d5db;
                border-radius: 4px;
                background: white;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            
            .checkbox-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                line-height: 1.2;
            }
            
            .checkbox-description {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.3;
            }

            /* Statistiques */
            .automation-stats {
                margin: 20px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
            }
            
            .automation-stats h4 {
                margin: 0 0 16px 0;
                font-size: 15px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }
            
            .stat-item {
                background: white;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e5e7eb;
                transition: all var(--transition-speed) ease;
            }
            
            .stat-item:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
            }

            /* Keywords Tab Layout */
            .keywords-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .categories-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 20px;
                margin-bottom: 16px;
            }

            .categories-header-left h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .categories-header-left p {
                margin: 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
            }

            .categories-stats-bar {
                display: flex;
                gap: 24px;
                background: white;
                padding: 16px 20px;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                box-shadow: var(--shadow-base);
            }

            .stat-quick {
                text-align: center;
            }

            .stat-quick .stat-number {
                display: block;
                font-size: 20px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 4px;
            }

            .stat-quick .stat-label {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
            }

            /* Categories Grid */
            .categories-grid-minimal {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .category-card-minimal {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all var(--transition-speed) ease;
                box-shadow: var(--shadow-base);
            }
            
            .category-card-minimal:hover {
                border-color: #d1d5db;
                box-shadow: var(--shadow-hover);
                transform: translateY(-1px);
            }
            
            .category-card-minimal.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }
            
            .category-content-minimal {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .category-icon-minimal {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .category-info-minimal {
                flex: 1;
                min-width: 0;
            }

            .category-info-minimal h4 {
                margin: 0 0 4px 0;
                font-size: 15px;
                color: #1f2937;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .custom-indicator {
                background: #10b981;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .keyword-count-minimal {
                font-size: 12px;
                color: #6b7280;
                display: block;
                margin-bottom: 2px;
            }

            .category-description {
                font-size: 11px;
                color: #9ca3af;
                font-style: italic;
                display: block;
            }
            
            .category-actions-minimal {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .btn-edit-keywords,
            .btn-edit-category,
            .btn-delete-category {
                width: 32px;
                height: 32px;
                border: none;
                background: #f3f4f6;
                color: #6b7280;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: 13px;
            }
            
            .btn-edit-keywords:hover {
                background: #667eea;
                color: white;
            }

            .btn-edit-category:hover {
                background: #10b981;
                color: white;
            }

            .btn-delete-category:hover {
                background: #ef4444;
                color: white;
            }

            /* Toggle */
            .toggle-minimal {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 22px;
            }
            
            .toggle-minimal input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider-minimal {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e0;
                transition: .3s;
                border-radius: 22px;
            }
            
            .toggle-slider-minimal:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-slider-minimal {
                background-color: #10b981;
            }
            
            input:checked + .toggle-slider-minimal:before {
                transform: translateX(18px);
            }

            /* Global Actions Bar */
            .global-actions-bar {
                display: flex;
                gap: 12px;
                justify-content: center;
                padding: 16px 0;
                border-top: 1px solid #e5e7eb;
                margin-top: auto;
            }

            /* Modal Styles */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(4px);
            }

            .modal-container-large {
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
            }

            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-speed) ease;
            }

            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 24px;
                border-top: 1px solid #e5e7eb;
            }

            /* Form Styles */
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 24px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-group.full-width {
                grid-column: 1 / -1;
            }

            .form-group label {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s;
                font-family: inherit;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Icon Selector */
            .icon-selector {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .icon-selector input {
                width: 60px;
                text-align: center;
                font-size: 18px;
            }

            .icon-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }

            .icon-option {
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: 16px;
            }

            .icon-option:hover {
                background: #667eea;
                color: white;
                transform: translateY(-1px);
            }

            /* Color Selector */
            .color-selector {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .color-selector input[type="color"] {
                width: 60px;
                height: 44px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }

            .color-presets {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .color-preset {
                width: 24px;
                height: 24px;
                border: 2px solid #e5e7eb;
                border-radius: 50%;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
            }

            .color-preset:hover {
                transform: scale(1.1);
                border-color: #667eea;
            }

            /* Keywords Section */
            .keywords-section {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }

            .keywords-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .keywords-help {
                margin: 0 0 20px 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
            }

            .keywords-input-group {
                margin-bottom: 16px;
            }

            .keywords-input-group label {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 4px;
                display: block;
            }

            .keywords-input-group textarea {
                width: 100%;
                resize: vertical;
                font-family: inherit;
            }

            .keywords-input-group small {
                font-size: 12px;
                color: #6b7280;
                margin-top: 4px;
                display: block;
            }

            /* Exclusions */
            .exclusions-optimized {
                margin-top: 16px;
            }
            
            .exclusions-summary {
                display: flex;
                gap: 16px;
                margin-bottom: 16px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .summary-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #374151;
            }
            
            .summary-icon {
                width: 24px;
                height: 24px;
                background: #667eea20;
                color: #667eea;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .quick-add-section {
                margin-bottom: 16px;
            }
            
            .quick-add-row {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .quick-add-row input {
                flex: 1;
                height: var(--btn-height);
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                transition: all var(--transition-speed) ease;
            }
            
            .quick-add-row input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .btn-quick-add {
                height: var(--btn-height);
                width: var(--btn-height);
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-quick-add:hover {
                background: #5a67d8;
                transform: translateY(-1px);
            }
            
            .exclusions-footer-minimal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
            }
            
            .exclusions-count {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .no-exclusions-minimal {
                text-align: center;
                padding: 20px;
                color: #9ca3af;
                font-style: italic;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .recent-exclusions h5 {
                margin: 0 0 12px 0;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .exclusions-mini-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .exclusion-mini-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 10px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 12px;
                transition: all var(--transition-speed) ease;
            }
            
            .exclusion-mini-item:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-base);
            }
            
            .exclusion-mini-value {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #374151;
                font-weight: 500;
            }
            
            .category-mini-badge {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
            }
            
            .no-category-mini {
                width: 20px;
                height: 20px;
                background: #f3f4f6;
                color: #9ca3af;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
            }

            /* Error Display */
            .error-display {
                background: #fee2e2;
                border: 1px solid #fca5a5;
                border-radius: 12px;
                color: #991b1b;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .settings-two-columns {
                    grid-template-columns: 1fr;
                }
                
                .categories-selection-grid-automation {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                }
                
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(3, 1fr);
                }

                .categories-grid-minimal {
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                }

                .form-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .settings-page-compact {
                    padding: 12px;
                }
                
                .settings-tabs-compact {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .tab-button-compact {
                    width: 100%;
                }
                
                .categories-grid-minimal {
                    grid-template-columns: 1fr;
                }
                
                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }
                
                .quick-add-row {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .quick-add-row input,
                .quick-add-row select {
                    width: 100%;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }

                .categories-header {
                    flex-direction: column;
                    gap: 16px;
                }

                .categories-stats-bar {
                    justify-content: space-around;
                }

                .modal-container-large {
                    max-width: 95vw;
                    margin: 10px;
                }

                .form-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
try {
    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager
    if (window.pageManager && window.pageManager.pages) {
        // Supprimer l'ancienne page categories/keywords
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        // Page Paramètres unifiée
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v8.1 intégrée au PageManager');
    } else {
        console.warn('⚠️ PageManager non prêt, retry...');
        setTimeout(() => {
            if (window.pageManager && window.pageManager.pages) {
                delete window.pageManager.pages.categories;
                delete window.pageManager.pages.keywords;
                
                window.pageManager.pages.settings = (container) => {
                    try {
                        window.categoriesPage.renderSettings(container);
                    } catch (error) {
                        console.error('[PageManager] Erreur rendu paramètres (delayed):', error);
                        container.innerHTML = window.categoriesPage.renderErrorState(error);
                    }
                };
                
                console.log('✅ CategoriesPage v8.1 intégrée au PageManager (delayed)');
            }
        }, 1000);
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
    
    // Fallback
    window.categoriesPage = {
        renderSettings: (container) => {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                    <h2>Erreur critique</h2>
                    <p>Impossible de charger le module des paramètres: ${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Recharger la page
                    </button>
                </div>
            `;
        },
        getScanSettings: () => ({ defaultPeriod: 7, defaultFolder: 'inbox', autoAnalyze: true, autoCategrize: true }),
        getAutomationSettings: () => ({ autoCreateTasks: false, groupTasksByDomain: false, skipDuplicates: true, autoAssignPriority: false }),
        getTaskPreselectedCategories: () => [],
        shouldExcludeSpam: () => true,
        shouldDetectCC: () => true
    };
}

console.log('✅ CategoriesPage v8.1 loaded - Fix pré-sélection + création catégories personnalisées');
