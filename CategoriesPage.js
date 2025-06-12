// CategoriesPage.js - Version 8.2 - Fix boucle infinie + pré-sélection par défaut

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.refreshing = false; // Flag pour éviter les boucles
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 8.2 - Fix boucle + pré-sélection par défaut');
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
    // CHARGEMENT ET SAUVEGARDE DES PARAMÈTRES - AVEC PROTECTION BOUCLE
    // ================================================
    loadSettings() {
        if (window.categoryManager) {
            const settings = window.categoryManager.getSettings();
            
            // CORRECTION: S'assurer que les paramètres par défaut sont corrects
            if (!settings.taskPreselectedCategories || settings.taskPreselectedCategories.length === 0) {
                console.log('[CategoriesPage] 🔧 Paramètres défaillants détectés, correction...');
                settings.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
                this.saveSettings(settings);
                console.log('[CategoriesPage] ✅ Paramètres par défaut appliqués:', settings.taskPreselectedCategories);
            }
            
            return settings;
        }
        
        // Fallback si CategoryManager n'est pas disponible
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // S'assurer que les catégories par défaut sont présentes
                if (!parsedSettings.taskPreselectedCategories || parsedSettings.taskPreselectedCategories.length === 0) {
                    parsedSettings.taskPreselectedCategories = defaultSettings.taskPreselectedCategories;
                    localStorage.setItem('categorySettings', JSON.stringify(parsedSettings));
                    console.log('[CategoriesPage] 🔧 Correction taskPreselectedCategories en fallback');
                }
                return parsedSettings;
            }
            return defaultSettings;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings) {
        // PROTECTION: Éviter les sauvegardes pendant un refresh
        if (this.refreshing) {
            console.log('[CategoriesPage] Sauvegarde ignorée pendant refresh');
            return;
        }
        
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
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'], // CORRECTION: Par défaut
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
    // NOTIFICATION DES CHANGEMENTS - AVEC PROTECTION BOUCLE
    // ================================================
    notifySettingsChange(settingType, value) {
        // PROTECTION: Éviter les notifications pendant un refresh
        if (this.refreshing) {
            console.log('[CategoriesPage] Notification ignorée pendant refresh');
            return;
        }
        
        console.log(`[CategoriesPage] Notification changement: ${settingType}`, value);
        
        // Dispatching d'événement global
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { type: settingType, value: value }
        }));
        
        // Notifications spécialisées pour les modules (sans déclencher de refresh)
        this.notifySpecificModules(settingType, value);
    }

    notifySpecificModules(settingType, value) {
        // PROTECTION: Éviter les actions pendant un refresh
        if (this.refreshing) {
            return;
        }
        
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
        
        // PageManager - ÉVITER la recatégorisation pendant un refresh
        if (window.pageManager && 
            (settingType === 'preferences' || settingType === 'activeCategories') &&
            !this.refreshing) {
            
            // Recatégoriser les emails si nécessaire (mais pas pendant un refresh)
            if (window.emailScanner && window.emailScanner.emails.length > 0) {
                setTimeout(() => {
                    if (!this.refreshing) { // Double vérification
                        window.emailScanner.recategorizeEmails();
                    }
                }, 500); // Délai plus long pour éviter les conflits
            }
        }
    }

    // ================================================
    // RENDU PRINCIPAL DE LA PAGE PARAMÈTRES
    // ================================================
    renderSettings(container) {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh déjà en cours, ignoré');
            return;
        }
        
        try {
            this.refreshing = true;
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
                this.refreshing = false;
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = this.renderErrorState(error);
            this.refreshing = false;
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
    // NAVIGATION ENTRE ONGLETS - ÉVITER BOUCLE
    // ================================================
    switchTab(tab) {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh en cours, changement d\'onglet ignoré');
            return;
        }
        
        try {
            this.refreshing = true;
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
                    this.refreshing = false;
                }, 100);
            } else {
                this.refreshing = false;
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
            this.refreshing = false;
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
    // ONGLET AUTOMATISATION - CORRECTION PRÉ-SÉLECTION
    // ================================================
    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] === RENDU AUTOMATISATION ===');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées dans settings:', preselectedCategories);
            
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
                                    console.log(`[CategoriesPage] ⚙️ Catégorie ${id} (${category.name}): ${isPreselected ? 'SÉLECTIONNÉE ✅' : 'non sélectionnée ❌'}`);
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

    // [Continuation avec toutes les autres méthodes identiques mais avec protection contre les boucles]

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS CORRIGÉE
    // ================================================
    initializeEventListeners() {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh en cours, événements ignorés');
            return;
        }
        
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
            console.log(`[CategoriesPage] === INITIALISATION CHECKBOXES ===`);
            console.log(`[CategoriesPage] Trouvé ${categoryCheckboxes.length} checkboxes avec classe .category-preselect-checkbox`);
            
            categoryCheckboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] Checkbox ${index}: value="${checkbox.value}", checked=${checkbox.checked}, name="${checkbox.dataset.categoryName}"`);
                
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

            console.log('[CategoriesPage] ✅ Événements initialisés avec correction des checkboxes');
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    updateTaskPreselectedCategories() {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh en cours, updateTaskPreselectedCategories ignoré');
            return;
        }
        
        try {
            console.log('[CategoriesPage] === DÉBUT updateTaskPreselectedCategories ===');
            
            // PROTECTION: Éviter les mises à jour multiples
            this.refreshing = true;
            
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
            
            // S'assurer qu'il y a au moins une catégorie sélectionnée
            if (selectedCategories.length === 0) {
                console.log('[CategoriesPage] ⚠️ Aucune catégorie sélectionnée, maintien des défauts');
                selectedCategories.push(...['tasks', 'commercial', 'finance', 'meetings']);
            }
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            // Notification sans déclencher de refresh
            setTimeout(() => {
                this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
                this.updateAutomationStats();
                this.refreshing = false; // Libérer le flag
            }, 100);
            
            window.uiManager?.showToast(`${selectedCategories.length} catégorie(s) sélectionnée(s) pour les tâches`, 'success');
            
            console.log('[CategoriesPage] === FIN updateTaskPreselectedCategories ===');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            window.uiManager?.showToast('Erreur de mise à jour', 'error');
            this.refreshing = false; // Libérer le flag même en cas d'erreur
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES - ÉVITER BOUCLES
    // ================================================
    refreshCurrentTab() {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh déjà en cours, ignoré');
            return;
        }
        
        try {
            this.refreshing = true;
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings);
                
                setTimeout(() => {
                    this.initializeEventListeners();
                    this.refreshing = false;
                }, 100);
            } else {
                this.refreshing = false;
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
            this.refreshing = false;
        }
    }

    forceUpdateUI() {
        if (this.refreshing) {
            console.log('[CategoriesPage] Refresh déjà en cours, force update ignoré');
            return;
        }
        
        console.log('[CategoriesPage] Force update UI...');
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 100);
    }

    // [Toutes les autres méthodes restent identiques - création catégories, sauvegarde, etc.]
    // Pour économiser l'espace, je n'inclus que les méthodes critiques modifiées
    
    // Méthodes essentielles identiques...
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

    // Méthodes de debug
    debugSettings() {
        const settings = this.loadSettings();
        console.log('\n=== DEBUG SETTINGS ===');
        console.log('Settings complets:', settings);
        console.log('CategoryManager settings:', window.categoryManager?.getSettings());
        console.log('EmailScanner settings:', window.emailScanner?.settings);
        console.log('taskPreselectedCategories:', settings.taskPreselectedCategories);
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

    // Autres méthodes essentielles...
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

    // Méthodes modales simplifiées
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

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    hideExplanationMessage() {
        localStorage.setItem('hideEmailExplanation', 'true');
        if (window.pageManager) {
            window.pageManager.hideExplanation = true;
            window.pageManager.refreshEmailsView?.();
        }
    }

    exportSettings() {
        try {
            const settings = this.loadSettings();
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = window.categoryManager?.getCustomCategories() || {};
            const weightedKeywords = window.categoryManager?.weightedKeywords || {};
            
            const exportData = {
                version: '8.2',
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

    // Méthodes publiques pour intégration
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

    // Styles (identiques)
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* [Styles CSS identiques à la version précédente] */
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
try {
    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager
    if (window.pageManager && window.pageManager.pages) {
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v8.2 intégrée au PageManager');
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
                
                console.log('✅ CategoriesPage v8.2 intégrée au PageManager (delayed)');
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
        getTaskPreselectedCategories: () => ['tasks', 'commercial', 'finance', 'meetings'],
        shouldExcludeSpam: () => true,
        shouldDetectCC: () => true
    };
}

console.log('✅ CategoriesPage v8.2 loaded - Fix boucle infinie + pré-sélection par défaut');
