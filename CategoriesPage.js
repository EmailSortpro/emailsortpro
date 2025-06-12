// CategoriesPage.js - Gestion avec synchronisation complète
// Version 7.3 - CORRECTION TOTALE DES FONCTIONS DYNAMIQUES - SANS ERREUR

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        
        // Bind toutes les méthodes pour éviter les problèmes de contexte
        this.bindMethods();
        
        console.log('[CategoriesPage] Version 7.3 - Synchronisation complète initialisée');
    }

    // =====================================
    // BINDING DES MÉTHODES
    // =====================================
    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // =====================================
    // PAGE PARAMÈTRES AVEC ONGLETS
    // =====================================
    renderSettings(container) {
        try {
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
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
            
            // Initialiser les événements après le rendu
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur lors du rendu:', error);
            container.innerHTML = `
                <div class="error-display" style="padding: 20px; text-align: center;">
                    <h2>Erreur de chargement des paramètres</h2>
                    <p>Une erreur est survenue lors du chargement de l'interface des paramètres.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Recharger la page
                    </button>
                </div>
            `;
        }
    }

    // =====================================
    // INITIALISATION DES ÉVÉNEMENTS
    // =====================================
    initializeEventListeners() {
        try {
            // Préférences générales
            const preferences = ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'];
            preferences.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', () => this.savePreferences());
                }
            });

            // Paramètres de scan
            const scanSettings = ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'];
            scanSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', () => this.saveScanSettings());
                }
            });

            // Paramètres d'automatisation
            const automationSettings = ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'];
            automationSettings.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', () => this.saveAutomationSettings());
                }
            });

            // Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateTaskPreselectedCategories());
            });

            // Catégories actives/inactives
            const categoryToggles = document.querySelectorAll('.toggle-minimal input');
            categoryToggles.forEach(toggle => {
                const categoryId = toggle.closest('[data-category]')?.dataset.category;
                if (categoryId) {
                    toggle.addEventListener('change', (e) => this.toggleCategory(categoryId, e.target.checked));
                }
            });

            // Ajout rapide d'exclusions
            const quickInput = document.getElementById('quick-exclusion-input');
            if (quickInput) {
                quickInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addQuickExclusion();
                    }
                });
            }

            console.log('[CategoriesPage] Événements initialisés');
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
    // ONGLET GÉNÉRAL
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
            console.error('[CategoriesPage] Erreur dans renderOptimizedExclusions:', error);
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
                        ${allExclusions.map((item, index) => {
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
            console.error('[CategoriesPage] Erreur dans renderRecentExclusions:', error);
            return '<div>Erreur lors du chargement des exclusions récentes</div>';
        }
    }

    // =====================================
    // ONGLET AUTOMATISATION
    // =====================================
    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
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
                            <div class="categories-selection-grid-automation">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
                                    return `
                                        <label class="category-checkbox-item-enhanced">
                                            <input type="checkbox" 
                                                   value="${id}"
                                                   ${isPreselected ? 'checked' : ''}>
                                            <div class="category-checkbox-content-enhanced">
                                                <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                    ${category.icon}
                                                </span>
                                                <span class="cat-name-automation">${category.name}</span>
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
                                    <span class="stat-number">${settings.taskPreselectedCategories?.length || 0}</span>
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
    // ONGLET CATÉGORIES
    // =====================================
    renderKeywordsTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            return `
                <div class="categories-grid-minimal">
                    ${Object.entries(categories).map(([id, category]) => {
                        const isActive = settings.activeCategories ? settings.activeCategories.includes(id) : true;
                        const keywords = this.getKeywordsFromWeightedSystem(id);
                        const keywordCount = this.getTotalKeywordsForCategory(keywords);
                        
                        return `
                            <div class="category-card-minimal ${isActive ? 'active' : 'inactive'}" data-category="${id}">
                                <div class="category-content-minimal">
                                    <div class="category-icon-minimal" style="background: ${category.color}20; color: ${category.color}">
                                        ${category.icon}
                                    </div>
                                    <div class="category-info-minimal">
                                        <h4>${category.name}</h4>
                                        <span class="keyword-count-minimal">${keywordCount} mots-clés</span>
                                    </div>
                                </div>
                                <div class="category-actions-minimal">
                                    <button class="btn-edit-keywords" onclick="window.categoriesPage.openKeywordsModal('${id}')" title="Modifier les mots-clés">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <label class="toggle-minimal" title="${isActive ? 'Désactiver' : 'Activer'}">
                                        <input type="checkbox" 
                                               ${isActive ? 'checked' : ''}>
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
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur dans renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    // =====================================
    // MÉTHODES DE SAUVEGARDE
    // =====================================
    savePreferences() {
        try {
            const settings = this.loadSettings();
            
            settings.preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            this.saveSettings(settings);
            window.uiManager?.showToast('Préférences sauvegardées', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            const settings = this.loadSettings();
            
            settings.scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            this.saveSettings(settings);
            window.uiManager?.showToast('Paramètres de scan sauvegardés', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            const settings = this.loadSettings();
            
            settings.automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            this.saveSettings(settings);
            window.uiManager?.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            
            this.updateAutomationStats();
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    updateTaskPreselectedCategories() {
        try {
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            
            settings.taskPreselectedCategories = [];
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    settings.taskPreselectedCategories.push(checkbox.value);
                }
            });
            
            this.saveSettings(settings);
            window.uiManager?.showToast('Catégories pré-sélectionnées mises à jour', 'success');
            
            this.updateAutomationStats();
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            window.uiManager?.showToast('Erreur de mise à jour', 'error');
        }
    }

    updateAutomationStats() {
        try {
            const settings = this.loadSettings();
            const statsNumbers = document.querySelectorAll('.stat-number');
            
            if (statsNumbers.length >= 3) {
                statsNumbers[0].textContent = settings.taskPreselectedCategories?.length || 0;
                statsNumbers[1].textContent = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
                statsNumbers[2].textContent = Object.values(settings.automationSettings || {}).filter(Boolean).length;
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateAutomationStats:', error);
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
            window.uiManager?.showToast(`Catégorie ${isActive ? 'activée' : 'désactivée'}`, 'success', 2000);
        } catch (error) {
            console.error('[CategoriesPage] Erreur toggleCategory:', error);
            window.uiManager?.showToast('Erreur de modification', 'error');
        }
    }

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

    // =====================================
    // MÉTHODES MODALES
    // =====================================
    openKeywordsModal(categoryId) {
        try {
            const category = window.categoryManager?.getCategory(categoryId);
            if (!category) return;
            
            const keywords = this.getKeywordsFromWeightedSystem(categoryId);
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'keywordsModal';
            modal.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="modal-title-group">
                            <span class="modal-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal('keywordsModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <p>Gestion des mots-clés pour la catégorie ${category.name}</p>
                        <p>Total: ${this.getTotalKeywordsForCategory(keywords)} mots-clés</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.closeModal('keywordsModal')">
                            Fermer
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);
        } catch (error) {
            console.error('[CategoriesPage] Erreur openKeywordsModal:', error);
        }
    }

    openAllKeywordsModal() {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'allKeywordsModal';
            modal.innerHTML = `
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-key"></i> Tous les mots-clés</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal('allKeywordsModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <p>Affichage de tous les mots-clés du système</p>
                        <p>Total: ${this.calculateTotalKeywords()} mots-clés</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.closeModal('allKeywordsModal')">
                            Fermer
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);
        } catch (error) {
            console.error('[CategoriesPage] Erreur openAllKeywordsModal:', error);
        }
    }

    openExclusionsModal() {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'exclusionsModal';
            modal.innerHTML = `
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-filter"></i> Exclusions et redirections</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal('exclusionsModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <p>Gestion des exclusions et redirections d'emails</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.closeModal('exclusionsModal')">
                            Fermer
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);
        } catch (error) {
            console.error('[CategoriesPage] Erreur openExclusionsModal:', error);
        }
    }

    closeModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
                setTimeout(() => modal.remove(), 300);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur closeModal:', error);
        }
    }

    // =====================================
    // MÉTHODES D'IMPORT/EXPORT
    // =====================================
    exportSettings() {
        try {
            const settings = this.loadSettings();
            const weightedKeywords = window.categoryManager?.weightedKeywords || {};
            const categories = window.categoryManager?.getCategories() || {};
            
            const exportData = {
                version: '7.3',
                exportDate: new Date().toISOString(),
                settings: settings,
                categories: categories,
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

    // =====================================
    // MÉTHODES UTILITAIRES
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
                });
            }
            return total;
        } catch (error) {
            console.error('[CategoriesPage] Erreur calculateTotalKeywords:', error);
            return 0;
        }
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
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveSettings:', error);
        }
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

    // =====================================
    // STYLES CSS
    // =====================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
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
                transition: all 0.2s ease;
                font-size: 14px;
                font-weight: 600;
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
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
            }
            
            .checkbox-compact input {
                width: 18px;
                height: 18px;
                cursor: pointer;
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
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                cursor: pointer;
            }
            
            .select-compact:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            /* Buttons */
            .btn-compact {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-primary {
                background: #667eea;
                color: white;
            }
            
            .btn-primary:hover {
                background: #5a67d8;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .button-row {
                display: flex;
                gap: 8px;
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
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .btn-quick-add {
                padding: 8px 12px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-quick-add:hover {
                background: #5a67d8;
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
                transition: all 0.2s ease;
                background: white;
                position: relative;
            }
            
            .category-checkbox-item-enhanced:hover {
                border-color: #667eea;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
                transition: all 0.2s ease;
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
                transition: all 0.2s ease;
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
                transition: all 0.2s ease;
                position: relative;
            }
            
            .checkbox-enhanced:hover {
                border-color: #667eea;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
                transition: all 0.2s ease;
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
            
            /* Categories Grid */
            .categories-grid-minimal {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .category-card-minimal {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all 0.2s ease;
            }
            
            .category-card-minimal:hover {
                border-color: #d1d5db;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .category-card-minimal.inactive {
                opacity: 0.6;
            }
            
            .category-content-minimal {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-icon-minimal {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .category-info-minimal h4 {
                margin: 0;
                font-size: 15px;
                color: #1f2937;
                font-weight: 600;
            }
            
            .keyword-count-minimal {
                font-size: 12px;
                color: #6b7280;
            }
            
            .category-actions-minimal {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-edit-keywords {
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
                transition: all 0.2s ease;
            }
            
            .btn-edit-keywords:hover {
                background: #667eea;
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
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 20px;
            }
            
            .modal-overlay.show {
                opacity: 1;
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            
            .modal-container.modal-large {
                max-width: 900px;
            }
            
            .modal-overlay.show .modal-container {
                transform: scale(1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-title-group {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-icon {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: #1f2937;
            }
            
            .modal-close {
                background: none;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px 24px;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
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
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance avec protection d'erreur
try {
    window.categoriesPage = new CategoriesPage();

    // Export for PageManager integration
    if (window.pageManager && window.pageManager.pages) {
        // Supprimer l'ancienne page categories
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        // Page Paramètres avec onglets
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur lors du rendu des paramètres:', error);
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                        <h2>Erreur de chargement</h2>
                        <p>Une erreur est survenue lors du chargement des paramètres.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Recharger la page
                        </button>
                    </div>
                `;
            }
        };
        
        // Supprimer le bouton de navigation Catégories
        setTimeout(() => {
            const categoriesNavButton = document.querySelector('.nav-item[data-page="categories"]');
            if (categoriesNavButton) {
                categoriesNavButton.style.display = 'none';
            }
        }, 100);
        
        console.log('✅ CategoriesPage v7.3 loaded - Version sans erreur avec gestion d\'erreurs complète');
    } else {
        console.warn('⚠️ PageManager not ready, retrying...');
        setTimeout(() => {
            if (window.pageManager && window.pageManager.pages) {
                delete window.pageManager.pages.categories;
                delete window.pageManager.pages.keywords;
                
                window.pageManager.pages.settings = (container) => {
                    try {
                        window.categoriesPage.renderSettings(container);
                    } catch (error) {
                        console.error('[PageManager] Erreur lors du rendu des paramètres (delayed):', error);
                        container.innerHTML = `
                            <div style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                                <h2>Erreur de chargement</h2>
                                <p>Une erreur est survenue lors du chargement des paramètres.</p>
                                <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                    Recharger la page
                                </button>
                            </div>
                        `;
                    }
                };
                
                const categoriesNavButton = document.querySelector('.nav-item[data-page="categories"]');
                if (categoriesNavButton) {
                    categoriesNavButton.style.display = 'none';
                }
                
                console.log('✅ CategoriesPage v7.3 loaded - Version sans erreur avec gestion d\'erreurs complète (delayed)');
            }
        }, 1000);
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique lors de l\'initialisation:', error);
    
    // Fallback en cas d'erreur critique
    window.categoriesPage = {
        renderSettings: (container) => {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                    <h2>Erreur critique</h2>
                    <p>Impossible de charger le module des paramètres.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Recharger la page
                    </button>
                </div>
            `;
        }
    };
}
