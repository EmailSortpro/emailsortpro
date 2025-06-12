// CategoriesPage.js - Version 8.1 - GESTION COMPLÈTE DES MOTS-CLÉS PAR CATÉGORIE - CORRIGÉ

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.debugMode = false;
        
        // NOUVEAU : État pour la gestion des mots-clés
        this.editingCategory = null;
        this.keywordSearchTerm = '';
        this.selectedKeywordType = 'all';
        
        this.bindMethods();
        
        console.log('[CategoriesPage] Version 8.1 - Gestion complète des mots-clés par catégorie - CORRIGÉ');
    }

    // =====================================
    // BINDING DES MÉTHODES
    // =====================================
    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal',
            // NOUVEAUX : Gestion des mots-clés
            'openCategoryKeywordsModal', 'addKeywordToCategory', 'removeKeywordFromCategory',
            'editKeywordInCategory', 'moveKeywordType', 'searchKeywords', 'filterKeywordsByType',
            'saveCategoryKeywords', 'resetCategoryKeywords', 'importKeywordsFromFile',
            // MÉTHODES MANQUANTES AJOUTÉES
            'initializeDefaultSettings', 'loadSettings', 'saveSettings', 'notifySettingsChange',
            'initializeEventListeners', 'refreshCurrentTab', 'renderGeneralTab', 'renderAutomationTab',
            'renderOptimizedExclusions', 'updateAutomationStats', 'renderErrorState',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // =====================================
    // MÉTHODES MANQUANTES AJOUTÉES - CORRECTIF PRINCIPAL
    // =====================================
    
    initializeDefaultSettings() {
        const settings = this.loadSettings();
        let hasChanges = false;
        
        // Si pas de catégories pré-sélectionnées, sélectionner les plus importantes
        if (!settings.taskPreselectedCategories || settings.taskPreselectedCategories.length === 0) {
            settings.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
            hasChanges = true;
            console.log('[CategoriesPage] Catégories par défaut définies:', settings.taskPreselectedCategories);
        }
        
        // Si pas de catégories actives, toutes sont actives par défaut
        if (!settings.activeCategories) {
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            settings.activeCategories = allCategories;
            hasChanges = true;
            console.log('[CategoriesPage] Catégories actives par défaut définies:', settings.activeCategories);
        }
        
        if (hasChanges) {
            this.saveSettings(settings);
            console.log('[CategoriesPage] Paramètres par défaut sauvegardés');
        }
        
        return settings;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : {
                activeCategories: null,
                excludedDomains: [],
                excludedKeywords: [],
                taskPreselectedCategories: [],
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
        } catch (error) {
            console.error('[CategoriesPage] Erreur loadSettings:', error);
            return {};
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
            console.log('[CategoriesPage] Paramètres sauvegardés:', settings);
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveSettings:', error);
        }
    }

    notifySettingsChange(settingType, value) {
        try {
            console.log(`[CategoriesPage] Notification changement: ${settingType} =`, value);
            
            if (window.emailScanner) {
                if (settingType === 'scanSettings') {
                    if (typeof window.emailScanner.updateScanSettings === 'function') {
                        window.emailScanner.updateScanSettings(value);
                        console.log('  - EmailScanner notifié (updateScanSettings)');
                    }
                }
                
                if (settingType === 'taskPreselectedCategories') {
                    if (typeof window.emailScanner.updatePreselectedCategories === 'function') {
                        window.emailScanner.updatePreselectedCategories(value);
                        console.log('  - EmailScanner notifié (updatePreselectedCategories)');
                    }
                }

                if (settingType === 'preferences') {
                    if (typeof window.emailScanner.updateUserPreferences === 'function') {
                        window.emailScanner.updateUserPreferences(value);
                        console.log('  - EmailScanner notifié (updateUserPreferences)');
                    }
                }
            }
            
            if (window.categoryManager) {
                if (settingType === 'preferences') {
                    if (value.excludeSpam !== undefined && typeof window.categoryManager.setSpamExclusion === 'function') {
                        window.categoryManager.setSpamExclusion(value.excludeSpam);
                        console.log('  - CategoryManager notifié (setSpamExclusion)');
                    }
                    if (value.detectCC !== undefined && typeof window.categoryManager.setCCDetection === 'function') {
                        window.categoryManager.setCCDetection(value.detectCC);
                        console.log('  - CategoryManager notifié (setCCDetection)');
                    }
                }
                
                if (settingType === 'activeCategories' && typeof window.categoryManager.setActiveCategories === 'function') {
                    window.categoryManager.setActiveCategories(value);
                    console.log('  - CategoryManager notifié (setActiveCategories)');
                }
            }
            
            window.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: { type: settingType, value: value }
            }));
            console.log('  - Event global dispatché: settingsChanged');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur notification:', error);
        }
    }

    // =====================================
    // PAGE PARAMÈTRES AVEC ONGLETS
    // =====================================
    renderSettings(container) {
        try {
            let settings = this.initializeDefaultSettings();
            
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
                        ${this.currentTab === 'general' ? this.renderGeneralTab(settings) : 
                          this.currentTab === 'automation' ? this.renderAutomationTab(settings) :
                          this.renderKeywordsTab(settings)}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
            setTimeout(() => {
                this.initializeEventListeners();
                this.setDebugMode(true);
                
                setTimeout(() => {
                    console.log('[CategoriesPage] Vérification post-initialisation...');
                    this.testCategorySelection();
                }, 500);
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur lors du rendu:', error);
            container.innerHTML = this.renderErrorState(error);
        }
    }

    // =====================================
    // INITIALISATION ET ÉVÉNEMENTS
    // =====================================
    initializeEventListeners() {
        try {
            // Préférences générales
            const preferences = ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'];
            preferences.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.savePreferences);
                    element.addEventListener('change', this.savePreferences);
                    
                    if (this.debugMode) {
                        console.log(`[CategoriesPage] Event listener ajouté pour ${id}, valeur: ${element.checked}`);
                    }
                }
            });

            // Paramètres de scan
            const scanSettings = ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'];
            scanSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveScanSettings);
                    element.addEventListener('change', this.saveScanSettings);
                    
                    if (this.debugMode) {
                        const value = element.type === 'checkbox' ? element.checked : element.value;
                        console.log(`[CategoriesPage] Event listener ajouté pour ${id}, valeur: ${value}`);
                    }
                }
            });

            // Paramètres d'automatisation
            const automationSettings = ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'];
            automationSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('change', this.saveAutomationSettings);
                    element.addEventListener('change', this.saveAutomationSettings);
                    
                    if (this.debugMode) {
                        console.log(`[CategoriesPage] Event listener ajouté pour ${id}, valeur: ${element.checked}`);
                    }
                }
            });

            // Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.addEventListener('change', (e) => {
                    console.log(`[CategoriesPage] Catégorie ${e.target.value} ${e.target.checked ? 'sélectionnée' : 'désélectionnée'}`);
                    this.updateTaskPreselectedCategories();
                });
            });

            // Catégories actives/inactives
            const categoryToggles = document.querySelectorAll('.toggle-enhanced input');
            categoryToggles.forEach(toggle => {
                const categoryCard = toggle.closest('[data-category]');
                const categoryId = categoryCard?.dataset.category;
                if (categoryId) {
                    toggle.removeEventListener('change', this.handleToggleCategory);
                    toggle.addEventListener('change', (e) => {
                        console.log(`[CategoriesPage] Toggle catégorie ${categoryId}: ${e.target.checked}`);
                        this.toggleCategory(categoryId, e.target.checked);
                    });
                }
            });

            console.log('[CategoriesPage] Événements initialisés avec succès');
        } catch (error) {
            console.error('[CategoriesPage] Erreur lors de l\'initialisation des événements:', error);
        }
    }

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
                tabContent.innerHTML = tab === 'general' ? 
                    this.renderGeneralTab(settings) : 
                    tab === 'automation' ? 
                    this.renderAutomationTab(settings) :
                    this.renderKeywordsTab(settings);
                
                // Réinitialiser les événements pour le nouveau contenu
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur lors du changement d\'onglet:', error);
        }
    }

    // =====================================
    // ONGLETS GÉNÉRAUX ET AUTOMATISATION
    // =====================================
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

    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] DEBUG - Rendu automatisation:');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées:', preselectedCategories);
            console.log('  - Settings complets:', settings);
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                        </div>
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                        
                        <!-- Sélection des catégories MISE EN ÉVIDENCE -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation-enhanced">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    console.log(`  - ${id} (${category.name}): ${isPreselected ? 'SELECTED' : 'not selected'}`);
                                    return `
                                        <div class="category-checkbox-card-enhanced ${isPreselected ? 'selected-highlighted' : ''}" data-category-id="${id}">
                                            <label class="category-checkbox-item-enhanced">
                                                <input type="checkbox" 
                                                       value="${id}"
                                                       data-category-name="${category.name}"
                                                       ${isPreselected ? 'checked' : ''}
                                                       onchange="console.log('Checkbox ${id} changed to:', this.checked); window.categoriesPage.updateTaskPreselectedCategories();">
                                                <div class="category-checkbox-content-enhanced">
                                                    <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                        ${category.icon}
                                                    </span>
                                                    <div class="category-info-automation">
                                                        <span class="cat-name-automation">${category.name}</span>
                                                        <span class="cat-description-automation">${category.description || 'Catégorie automatique'}</span>
                                                    </div>
                                                    ${isPreselected ? '<div class="selected-indicator"><i class="fas fa-check-circle"></i></div>' : ''}
                                                </div>
                                            </label>
                                        </div>
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
                                    <span class="stat-number">${preselectedCategories.length}</span>
                                    <span class="stat-label">Catégories actives</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${(settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0)}</span>
                                    <span class="stat-label">Règles d'exclusion</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${Object.values(settings.automationSettings || {}).filter(Boolean).length}</span>
                                    <span class="stat-label">Options activées</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur dans renderAutomationTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet automatisation</div>';
        }
    }

    // =====================================
    // MÉTHODES DE SAUVEGARDE
    // =====================================
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
            
            console.log('[CategoriesPage] Paramètres d\'automatisation sauvegardés:', automationSettings);
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
            console.log('[CategoriesPage] DEBUG updateTaskPreselectedCategories() appelée');
            
            const settings = this.loadSettings();
            console.log('  - Settings actuels:', settings.taskPreselectedCategories);
            
            const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            console.log(`  - ${checkboxes.length} checkboxes trouvées`);
            
            const selectedCategories = [];
            checkboxes.forEach((checkbox, index) => {
                console.log(`  - Checkbox ${index}: value="${checkbox.value}", checked=${checkbox.checked}, name="${checkbox.dataset.categoryName}"`);
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            console.log('  - Nouvelles catégories sélectionnées:', selectedCategories);
            
            // NOUVEAU: Mise à jour visuelle immédiate des cartes
            checkboxes.forEach(checkbox => {
                const card = checkbox.closest('.category-checkbox-card-enhanced');
                if (card) {
                    if (checkbox.checked) {
                        card.classList.add('selected-highlighted');
                        // Ajouter l'indicateur de sélection s'il n'existe pas
                        if (!card.querySelector('.selected-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'selected-indicator';
                            indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                            card.querySelector('.category-checkbox-content-enhanced').appendChild(indicator);
                        }
                    } else {
                        card.classList.remove('selected-highlighted');
                        // Retirer l'indicateur de sélection
                        const indicator = card.querySelector('.selected-indicator');
                        if (indicator) {
                            indicator.remove();
                        }
                    }
                }
            });
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            console.log('  - Paramètres sauvegardés:', settings.taskPreselectedCategories);
            
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            window.uiManager?.showToast(`${selectedCategories.length} catégorie(s) sélectionnée(s)`, 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            window.uiManager?.showToast('Erreur de mise à jour', 'error');
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    refreshCurrentTab() {
        try {
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            
            if (tabContent) {
                tabContent.innerHTML = this.currentTab === 'general' ? 
                    this.renderGeneralTab(settings) : 
                    this.currentTab === 'automation' ? 
                    this.renderAutomationTab(settings) :
                    this.renderKeywordsTab(settings);
                
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
        }
    }

    renderOptimizedExclusions(settings) {
        return `
            <div class="exclusions-preview">
                <div class="exclusion-item">
                    <span>📧 Emails :</span>
                    <span>${settings.categoryExclusions?.emails?.length || 0} règles</span>
                </div>
                <div class="exclusion-item">
                    <span>🌐 Domaines :</span>
                    <span>${settings.categoryExclusions?.domains?.length || 0} règles</span>
                </div>
            </div>
        `;
    }

    updateAutomationStats() {
        // Mettre à jour les statistiques si l'onglet automatisation est visible
        try {
            const statItems = document.querySelectorAll('.automation-stats .stat-number');
            if (statItems.length > 0) {
                const settings = this.loadSettings();
                const preselectedCount = settings.taskPreselectedCategories?.length || 0;
                const exclusionsCount = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
                const optionsCount = Object.values(settings.automationSettings || {}).filter(Boolean).length;
                
                if (statItems[0]) statItems[0].textContent = preselectedCount;
                if (statItems[1]) statItems[1].textContent = exclusionsCount;
                if (statItems[2]) statItems[2].textContent = optionsCount;
            }
        } catch (error) {
            console.warn('[CategoriesPage] Erreur updateAutomationStats:', error);
        }
    }

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue lors du chargement de l'interface des paramètres.</p>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // =====================================
    // MÉTHODES DE DEBUG ET TEST
    // =====================================
    debugSettings() {
        console.group('[CategoriesPage] 🐛 DEBUG SETTINGS');
        
        const settings = this.loadSettings();
        console.log('Settings:', settings);
        console.log('Current tab:', this.currentTab);
        console.log('Initialized:', this.isInitialized);
        
        if (window.categoryManager) {
            console.log('CategoryManager categories:', window.categoryManager.getCategories());
        }
        
        if (window.emailScanner) {
            console.log('EmailScanner debug:', window.emailScanner.getDebugInfo?.() || 'No debug info');
        }
        
        console.groupEnd();
    }

    testCategorySelection() {
        console.log('[CategoriesPage] 🧪 Test de sélection des catégories');
        
        const settings = this.loadSettings();
        console.log('Catégories pré-sélectionnées:', settings.taskPreselectedCategories);
        
        const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
        console.log(`${checkboxes.length} checkboxes trouvées`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}: ${checkbox.value} = ${checkbox.checked}`);
        });
    }

    forceUpdateUI() {
        console.log('[CategoriesPage] 🔄 Force update UI');
        this.refreshCurrentTab();
    }

    // =====================================
    // MÉTHODES PUBLIQUES
    // =====================================
    getScanSettings() {
        const settings = this.loadSettings();
        return settings.scanSettings || {
            defaultPeriod: 7,
            defaultFolder: 'inbox',
            autoAnalyze: true,
            autoCategrize: true
        };
    }
    
    getAutomationSettings() {
        const settings = this.loadSettings();
        return settings.automationSettings || {
            autoCreateTasks: false,
            groupTasksByDomain: false,
            skipDuplicates: true,
            autoAssignPriority: false
        };
    }
    
    getTaskPreselectedCategories() {
        try {
            const settings = this.loadSettings();
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[CategoriesPage] Erreur getTaskPreselectedCategories:', error);
            return [];
        }
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoriesPage] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    // =====================================
    // ONGLET CATÉGORIES AVEC GESTION MOTS-CLÉS COMPLÈTE
    // =====================================
    renderKeywordsTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            return `
                <div class="categories-keywords-manager">
                    <!-- Header avec actions globales -->
                    <div class="keywords-header">
                        <div class="keywords-header-info">
                            <h3><i class="fas fa-tags"></i> Gestion des catégories et mots-clés</h3>
                            <p>Configurez les mots-clés pour améliorer la précision de la catégorisation automatique.</p>
                        </div>
                        <div class="keywords-header-actions">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openAllKeywordsModal()">
                                <i class="fas fa-list"></i> Tous les mots-clés
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importKeywordsFromFile()">
                                <i class="fas fa-upload"></i> Importer
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.exportKeywordsToFile()">
                                <i class="fas fa-download"></i> Exporter
                            </button>
                        </div>
                    </div>

                    <!-- Grille des catégories avec mots-clés -->
                    <div class="categories-grid-enhanced">
                        ${Object.entries(categories).map(([id, category]) => {
                            const isActive = settings.activeCategories ? settings.activeCategories.includes(id) : true;
                            const keywords = this.getKeywordsFromWeightedSystem(id);
                            const keywordCount = this.getTotalKeywordsForCategory(keywords);
                            const isPreselected = (settings.taskPreselectedCategories || []).includes(id);
                            
                            return `
                                <div class="category-card-enhanced ${isActive ? 'active' : 'inactive'} ${isPreselected ? 'preselected' : ''}" 
                                     data-category="${id}">
                                    
                                    <!-- Header de la catégorie -->
                                    <div class="category-header-enhanced">
                                        <div class="category-icon-enhanced" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </div>
                                        <div class="category-info-enhanced">
                                            <h4>${category.name}</h4>
                                            <div class="category-stats">
                                                <span class="keyword-count">${keywordCount} mots-clés</span>
                                                ${isPreselected ? '<span class="preselected-badge-small">🎯 Auto</span>' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Aperçu des mots-clés -->
                                    <div class="keywords-preview">
                                        ${this.renderKeywordsPreview(keywords, id)}
                                    </div>

                                    <!-- Actions de la catégorie -->
                                    <div class="category-actions-enhanced">
                                        <button class="btn-edit-keywords-enhanced" 
                                                onclick="window.categoriesPage.openCategoryKeywordsModal('${id}')" 
                                                title="Gérer les mots-clés">
                                            <i class="fas fa-edit"></i>
                                            <span>Gérer</span>
                                        </button>
                                        
                                        <label class="toggle-enhanced" title="${isActive ? 'Désactiver' : 'Activer'}">
                                            <input type="checkbox" ${isActive ? 'checked' : ''}>
                                            <span class="toggle-slider-enhanced"></span>
                                        </label>
                                    </div>

                                    <!-- Indicateur de priorité -->
                                    <div class="priority-indicator" style="background: ${category.color}"></div>
                                    
                                    <!-- Indicateur pré-sélection -->
                                    ${isPreselected ? '<div class="preselected-indicator-small"><i class="fas fa-star"></i></div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Actions globales -->
                    <div class="global-actions-enhanced">
                        <div class="actions-left">
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.optimizeAllKeywords()">
                                <i class="fas fa-magic"></i> Optimiser tout
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.resetAllKeywords()">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                        </div>
                        
                        <div class="actions-right">
                            <div class="keywords-stats">
                                <span class="stat-item">
                                    <i class="fas fa-tags"></i>
                                    ${Object.keys(categories).length} catégories
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-key"></i>
                                    ${this.calculateTotalKeywords()} mots-clés
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-bullseye"></i>
                                    ${(settings.taskPreselectedCategories || []).length} pré-sélectionnées
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur dans renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES POUR MOTS-CLÉS (STUBS)
    // =====================================
    getKeywordsFromWeightedSystem(categoryId) {
        try {
            if (!window.categoryManager || !window.categoryManager.weightedKeywords) {
                return { absolute: [], strong: [], weak: [], exclusions: [] };
            }
            
            const keywords = window.categoryManager.weightedKeywords[categoryId] || {};
            return {
                absolute: keywords.absolute || [],
                strong: keywords.strong || [],
                weak: keywords.weak || [],
                exclusions: keywords.exclusions || []
            };
        } catch (error) {
            console.error('[CategoriesPage] Erreur getKeywordsFromWeightedSystem:', error);
            return { absolute: [], strong: [], weak: [], exclusions: [] };
        }
    }

    getTotalKeywordsForCategory(keywords) {
        try {
            let count = 0;
            if (keywords.absolute) count += keywords.absolute.length;
            if (keywords.strong) count += keywords.strong.length;
            if (keywords.weak) count += keywords.weak.length;
            if (keywords.exclusions) count += keywords.exclusions.length;
            return count;
        } catch (error) {
            console.error('[CategoriesPage] Erreur getTotalKeywordsForCategory:', error);
            return 0;
        }
    }

    calculateTotalKeywords() {
        try {
            let total = 0;
            if (window.categoryManager && window.categoryManager.weightedKeywords) {
                Object.values(window.categoryManager.weightedKeywords).forEach(category => {
                    if (category.absolute) total += category.absolute.length;
                    if (category.strong) total += category.strong.length;
                    if (category.weak) total += category.weak.length;
                    if (category.exclusions) total += category.exclusions.length;
                });
            }
            return total;
        } catch (error) {
            console.error('[CategoriesPage] Erreur calculateTotalKeywords:', error);
            return 0;
        }
    }

    renderKeywordsPreview(keywords, categoryId) {
        const preview = [];
        
        // Mots absolus (priorité)
        if (keywords.absolute && keywords.absolute.length > 0) {
            preview.push(`
                <div class="keyword-type-preview absolute">
                    <span class="type-label">Absolus:</span>
                    <div class="keywords-list-preview">
                        ${keywords.absolute.slice(0, 3).map(k => `<span class="keyword-chip absolute">${k}</span>`).join('')}
                        ${keywords.absolute.length > 3 ? `<span class="more-count">+${keywords.absolute.length - 3}</span>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Mots forts
        if (keywords.strong && keywords.strong.length > 0) {
            preview.push(`
                <div class="keyword-type-preview strong">
                    <span class="type-label">Forts:</span>
                    <div class="keywords-list-preview">
                        ${keywords.strong.slice(0, 2).map(k => `<span class="keyword-chip strong">${k}</span>`).join('')}
                        ${keywords.strong.length > 2 ? `<span class="more-count">+${keywords.strong.length - 2}</span>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Mots faibles
        if (keywords.weak && keywords.weak.length > 0) {
            preview.push(`
                <div class="keyword-type-preview weak">
                    <span class="type-label">Faibles:</span>
                    <div class="keywords-list-preview">
                        ${keywords.weak.slice(0, 2).map(k => `<span class="keyword-chip weak">${k}</span>`).join('')}
                        ${keywords.weak.length > 2 ? `<span class="more-count">+${keywords.weak.length - 2}</span>` : ''}
                    </div>
                </div>
            `);
        }
        
        if (preview.length === 0) {
            return `
                <div class="no-keywords-preview">
                    <i class="fas fa-plus-circle"></i>
                    <span>Aucun mot-clé configuré</span>
                </div>
            `;
        }
        
        return preview.join('');
    }

    // STUBS pour les méthodes de gestion des mots-clés
    openCategoryKeywordsModal(categoryId) { console.log('openCategoryKeywordsModal:', categoryId); }
    openAllKeywordsModal() { console.log('openAllKeywordsModal'); }
    importKeywordsFromFile() { console.log('importKeywordsFromFile'); }
    exportKeywordsToFile() { console.log('exportKeywordsToFile'); }
    optimizeAllKeywords() { console.log('optimizeAllKeywords'); }
    resetAllKeywords() { console.log('resetAllKeywords'); }
    closeModal(modalId) { 
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    // STUBS pour méthodes manquantes
    addQuickExclusion() { console.log('addQuickExclusion'); }
    toggleCategory(categoryId, isActive) { console.log('toggleCategory:', categoryId, isActive); }
    openKeywordsModal() { console.log('openKeywordsModal'); }
    openExclusionsModal() { console.log('openExclusionsModal'); }
    exportSettings() { console.log('exportSettings'); }
    importSettings() { console.log('importSettings'); }

    // =====================================
    // STYLES AJOUTÉS POUR LA GESTION DES MOTS-CLÉS ET MISE EN ÉVIDENCE
    // =====================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles de base pour la page des paramètres */
            .settings-page-compact {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .page-header-compact {
                margin-bottom: 30px;
            }
            
            .page-header-compact h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 10px 0;
            }
            
            .settings-tabs-compact {
                display: flex;
                gap: 4px;
                margin-bottom: 30px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .tab-button-compact {
                padding: 12px 20px;
                border: none;
                background: none;
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border-radius: 8px 8px 0 0;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tab-button-compact:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .tab-button-compact.active {
                background: #3b82f6;
                color: white;
                font-weight: 600;
            }
            
            .tab-content-compact {
                min-height: 400px;
            }
            
            .settings-two-columns {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            .settings-column-equal {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .settings-card-compact {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .card-header-compact i {
                color: #3b82f6;
                font-size: 20px;
            }
            
            .card-header-compact h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .btn-compact {
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .checkbox-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
                cursor: pointer;
            }
            
            .checkbox-compact input {
                margin: 0;
            }
            
            /* MISE EN ÉVIDENCE DES CATÉGORIES PRÉ-SÉLECTIONNÉES */
            .automation-focused-layout {
                max-width: 100%;
            }
            
            .full-width {
                grid-column: 1 / -1;
            }
            
            .categories-selection-grid-automation-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
                margin: 20px 0;
            }
            
            .category-checkbox-card-enhanced {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 0;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .category-checkbox-card-enhanced:hover {
                border-color: #c7d2fe;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
                transform: translateY(-2px);
            }
            
            /* CATÉGORIE SÉLECTIONNÉE - MISE EN ÉVIDENCE FORTE */
            .category-checkbox-card-enhanced.selected-highlighted {
                border-color: #4f46e5;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                box-shadow: 0 8px 25px rgba(79, 70, 229, 0.2);
                transform: translateY(-3px);
            }
            
            .category-checkbox-card-enhanced.selected-highlighted::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #4f46e5, #7c3aed);
            }
            
            .category-checkbox-item-enhanced {
                display: block;
                margin: 0;
                cursor: pointer;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"] {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px;
                position: relative;
            }
            
            .cat-icon-automation {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
                transition: all 0.3s ease;
            }
            
            .category-checkbox-card-enhanced.selected-highlighted .cat-icon-automation {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            }
            
            .category-info-automation {
                flex: 1;
                min-width: 0;
            }
            
            .cat-name-automation {
                display: block;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .category-checkbox-card-enhanced.selected-highlighted .cat-name-automation {
                color: #4f46e5;
            }
            
            .cat-description-automation {
                display: block;
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* INDICATEUR DE SÉLECTION */
            .selected-indicator {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 28px;
                height: 28px;
                background: #10b981;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                animation: selectedPulse 0.5s ease-out;
            }
            
            @keyframes selectedPulse {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Options d'automatisation */
            .automation-options-enhanced {
                margin: 30px 0;
            }
            
            .automation-options-enhanced h4 {
                margin: 0 0 20px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }
            
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .checkbox-enhanced:hover {
                border-color: #c7d2fe;
                background: #f8fafc;
            }
            
            .checkbox-enhanced input[type="checkbox"] {
                margin: 0;
                margin-top: 2px;
            }
            
            .checkbox-content {
                flex: 1;
            }
            
            .checkbox-title {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .checkbox-description {
                display: block;
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* Statistiques */
            .automation-stats {
                margin-top: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .automation-stats h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 16px;
            }
            
            .stat-item {
                text-align: center;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 4px;
            }
            
            .stat-label {
                display: block;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            /* Styles pour les paramètres de scan */
            .scan-settings-compact {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }
            
            .setting-row label {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
            }
            
            .select-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                cursor: pointer;
                min-width: 120px;
            }
            
            .general-preferences {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .button-row {
                display: flex;
                gap: 8px;
            }
            
            /* Exclusions */
            .exclusions-preview {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
            }
            
            .exclusion-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                font-size: 14px;
            }
            
            .exclusion-item:not(:last-child) {
                border-bottom: 1px solid #e5e7eb;
            }
            
            .exclusions-footer-minimal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
            }
            
            .exclusions-count {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            /* Gestion des catégories et mots-clés */
            .categories-keywords-manager {
                padding: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .keywords-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .keywords-header-info h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .keywords-header-info p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            .keywords-header-actions {
                display: flex;
                gap: 8px;
            }
            
            /* Grille des catégories améliorée */
            .categories-grid-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 16px;
                margin-bottom: 20px;
                flex: 1;
                overflow-y: auto;
            }
            
            .category-card-enhanced {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                position: relative;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                min-height: 200px;
            }
            
            .category-card-enhanced:hover {
                border-color: #d1d5db;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transform: translateY(-1px);
            }
            
            .category-card-enhanced.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }
            
            .category-card-enhanced.preselected {
                border-color: #f59e0b;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
            }
            
            .category-header-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .category-icon-enhanced {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .category-info-enhanced h4 {
                margin: 0;
                font-size: 16px;
                color: #1f2937;
                font-weight: 700;
            }
            
            .category-stats {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 4px;
            }
            
            .keyword-count {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .preselected-badge-small {
                background: #f59e0b;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }
            
            /* Aperçu des mots-clés */
            .keywords-preview {
                flex: 1;
                margin-bottom: 12px;
                overflow: hidden;
            }
            
            .keyword-type-preview {
                margin-bottom: 8px;
            }
            
            .type-label {
                font-size: 11px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
                display: block;
            }
            
            .keywords-list-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                align-items: center;
            }
            
            .keyword-chip {
                background: #f3f4f6;
                color: #374151;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .keyword-chip.absolute {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fcd34d;
            }
            
            .keyword-chip.strong {
                background: #dbeafe;
                color: #1e40af;
                border: 1px solid #93c5fd;
            }
            
            .keyword-chip.weak {
                background: #f3f4f6;
                color: #6b7280;
                border: 1px solid #d1d5db;
            }
            
            .more-count {
                background: #6b7280;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }
            
            .no-keywords-preview {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 8px;
                padding: 20px;
                color: #9ca3af;
                font-style: italic;
                text-align: center;
            }
            
            .no-keywords-preview i {
                font-size: 24px;
                color: #d1d5db;
            }
            
            /* Actions des catégories */
            .category-actions-enhanced {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: auto;
            }
            
            .btn-edit-keywords-enhanced {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .btn-edit-keywords-enhanced:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }
            
            /* Toggle amélioré */
            .toggle-enhanced {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
            }
            
            .toggle-enhanced input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider-enhanced {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e0;
                transition: .3s;
                border-radius: 24px;
            }
            
            .toggle-slider-enhanced:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            input:checked + .toggle-slider-enhanced {
                background-color: #10b981;
            }
            
            input:checked + .toggle-slider-enhanced:before {
                transform: translateX(20px);
            }
            
            /* Indicateurs */
            .priority-indicator {
                position: absolute;
                top: 0;
                right: 0;
                width: 4px;
                height: 100%;
                border-top-right-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            
            .preselected-indicator-small {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #f59e0b;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 700;
            }
            
            /* Actions globales */
            .global-actions-enhanced {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                margin-top: auto;
            }
            
            .actions-left {
                display: flex;
                gap: 8px;
            }
            
            .keywords-stats {
                display: flex;
                gap: 16px;
                align-items: center;
            }
            
            .keywords-stats .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .keywords-stats .stat-item i {
                color: #9ca3af;
                font-size: 12px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-two-columns {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .categories-selection-grid-automation-enhanced {
                    grid-template-columns: 1fr;
                }
                
                .categories-grid-enhanced {
                    grid-template-columns: 1fr;
                }
                
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[CategoriesPage] ✅ Styles complets ajoutés avec mise en évidence des catégories');
    }
}

// Create global instance avec protection d'erreur
try {
    window.categoriesPage = new CategoriesPage();

    // Export for PageManager integration
    if (window.pageManager && window.pageManager.pages) {
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur lors du rendu des paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        setTimeout(() => {
            const categoriesNavButton = document.querySelector('.nav-item[data-page="categories"]');
            if (categoriesNavButton) {
                categoriesNavButton.style.display = 'none';
            }
        }, 100);
        
        console.log('✅ CategoriesPage v8.1 loaded - Gestion complète avec mise en évidence des catégories sélectionnées');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique lors de l\'initialisation:', error);
}
