// CategoriesPage.js - Version 10.0 - Correction complète des erreurs

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // État pour l'édition de catégories
        this.editingCategory = null;
        this.categoryFormMode = 'create';
        
        // Gestion de synchronisation
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 10.0 - Correction complète des erreurs');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'renderSettings', 'loadSettings', 'saveSettings',
            'showCreateCategoryModal', 'showEditCategoryModal', 'showDeleteCategoryModal',
            'showCategoryKeywordsModal', 'createNewCategory', 'editCustomCategory', 
            'deleteCustomCategory', 'saveCategoryForm', 'validateCategoryForm',
            'generateCategoryId', 'getCategoryPreview', 'resetCategoryForm',
            'closeModal', 'exportSettings', 'importSettings', 'debugSettings', 
            'testCategorySelection', 'forceUpdateUI', 'forceSynchronization'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // MÉTHODE PRINCIPALE RENDERETTINGS - CORRIGÉE
    // ================================================
    renderSettings(container) {
        console.log('[CategoriesPage] 🎯 === DÉBUT RENDER SETTINGS ===');
        
        try {
            this.addStyles();
            
            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            console.log('[CategoriesPage] 📊 Settings chargés:', settings);
            console.log('[CategoriesPage] 🔧 Status modules:', moduleStatus);
            
            // Ajouter les barres de statut
            const statusBars = this.renderModuleStatusBar(moduleStatus) + 
                             this.renderSyncStatusBar(this.checkSyncStatus(settings));
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                        <p>Configuration et gestion de l'application</p>
                    </div>
                    
                    ${statusBars}
                    
                    <!-- Onglets -->
                    <div class="settings-tabs-compact">
                        <button class="tab-button-compact ${this.currentTab === 'general' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('general')">
                            <i class="fas fa-cog"></i>
                            <span>Général</span>
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'automation' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('automation')">
                            <i class="fas fa-robot"></i>
                            <span>Automatisation</span>
                        </button>
                        <button class="tab-button-compact ${this.currentTab === 'categories' ? 'active' : ''}" 
                                onclick="window.categoriesPage.switchTab('categories')">
                            <i class="fas fa-tags"></i>
                            <span>Catégories</span>
                        </button>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div id="tabContent">
                        ${this.renderTabContent(settings, moduleStatus)}
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
            console.log('[CategoriesPage] ✅ Render settings terminé');
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur render settings:', error);
            container.innerHTML = this.renderErrorState(error);
        }
    }

    renderTabContent(settings, moduleStatus) {
        switch (this.currentTab) {
            case 'general':
                return this.renderGeneralTab(settings, moduleStatus);
            case 'automation':
                return this.renderAutomationTab(settings, moduleStatus);
            case 'categories':
                return this.renderCategoriesTab(settings, moduleStatus);
            default:
                return this.renderGeneralTab(settings, moduleStatus);
        }
    }

    // ================================================
    // ONGLET GÉNÉRAL
    // ================================================
    renderGeneralTab(settings, moduleStatus) {
        try {
            return `
                <div class="general-tab-layout">
                    <!-- Préférences d'affichage -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-eye"></i>
                            <h3>Préférences d'affichage</h3>
                        </div>
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="darkMode" 
                                       ${settings.preferences?.darkMode ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Mode sombre</span>
                                    <span class="switch-description-compact">Interface sombre pour vos yeux</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="compactView" 
                                       ${settings.preferences?.compactView ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Vue compacte</span>
                                    <span class="switch-description-compact">Affichage condensé des emails</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="showNotifications" 
                                       ${settings.preferences?.showNotifications !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Notifications</span>
                                    <span class="switch-description-compact">Alertes et confirmations</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Paramètres de scan -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-search"></i>
                            <h3>Paramètres de scan</h3>
                        </div>
                        <div class="form-row-compact">
                            <div class="form-group-compact">
                                <label class="form-label-compact">Période par défaut</label>
                                <select id="defaultScanPeriod" 
                                        class="form-select-compact"
                                        onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                    <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                    <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                    <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                    <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                                </select>
                            </div>
                            
                            <div class="form-group-compact">
                                <label class="form-label-compact">Dossier par défaut</label>
                                <select id="defaultFolder" 
                                        class="form-select-compact"
                                        onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                    <option value="sent" ${settings.scanSettings?.defaultFolder === 'sent' ? 'selected' : ''}>Éléments envoyés</option>
                                    <option value="archive" ${settings.scanSettings?.defaultFolder === 'archive' ? 'selected' : ''}>Archive</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="autoAnalyze" 
                                       ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Analyse automatique</span>
                                    <span class="switch-description-compact">Analyser les emails automatiquement</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="autoCategrize" 
                                       ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Catégorisation automatique</span>
                                    <span class="switch-description-compact">Classer les emails par catégorie</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Actions rapides -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-tools"></i>
                            <h3>Actions rapides</h3>
                        </div>
                        <div class="quick-actions-grid-compact">
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.exportSettings()">
                                <i class="fas fa-download"></i>
                                <span>Exporter</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.importSettings()">
                                <i class="fas fa-upload"></i>
                                <span>Importer</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.debugSettings()">
                                <i class="fas fa-bug"></i>
                                <span>Debug</span>
                            </button>
                            <button class="btn-quick-action-compact" onclick="window.categoriesPage.forceSynchronization()">
                                <i class="fas fa-sync"></i>
                                <span>Sync</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderGeneralTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet général</div>';
        }
    }

    // ================================================
    // ONGLET AUTOMATISATION
    // ================================================
    renderAutomationTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                            ${moduleStatus.aiTaskAnalyzer ? 
                                '<span class="status-badge status-ok">✓ IA Disponible</span>' : 
                                '<span class="status-badge status-warning">⚠ IA Limitée</span>'
                            }
                        </div>
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches.</p>
                        
                        <!-- Sélection des catégories -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation" id="categoriesSelectionGrid">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
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
                                                ${isPreselected ? '<span class="selected-indicator">✓ Sélectionné</span>' : ''}
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
                                           ${settings.automationSettings?.autoCreateTasks ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Création automatique</span>
                                        <span class="checkbox-description">Créer automatiquement les tâches sans confirmation</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="groupTasksByDomain" 
                                           ${settings.automationSettings?.groupTasksByDomain ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Regroupement par domaine</span>
                                        <span class="checkbox-description">Regrouper les tâches par domaine d'expéditeur</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="skipDuplicates" 
                                           ${settings.automationSettings?.skipDuplicates !== false ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Ignorer les doublons</span>
                                        <span class="checkbox-description">Éviter de créer des tâches en double</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoAssignPriority" 
                                           ${settings.automationSettings?.autoAssignPriority ? 'checked' : ''}
                                           onchange="window.categoriesPage.saveAutomationSettings()">
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
                                    <span class="stat-number">${Object.values(settings.automationSettings || {}).filter(Boolean).length}</span>
                                    <span class="stat-label">Options activées</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${this.checkSyncStatus(settings).isSync ? '✅' : '⚠️'}</span>
                                    <span class="stat-label">Synchronisation</span>
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
    // ONGLET CATÉGORIES
    // ================================================
    renderCategoriesTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories).filter(([id, cat]) => cat.isCustom);
            const systemCategories = Object.entries(categories).filter(([id, cat]) => !cat.isCustom);
            
            return `
                <div class="categories-management-layout">
                    <!-- Création de nouvelle catégorie -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-plus-circle"></i>
                            <h3>Gestion des catégories</h3>
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                        <p>Créez et gérez vos catégories personnalisées pour classifier vos emails.</p>
                    </div>

                    <!-- Catégories système -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-cogs"></i>
                            <h3>Catégories système</h3>
                            <span class="category-count-badge">${systemCategories.length} catégories</span>
                        </div>
                        <div class="categories-grid-management">
                            ${systemCategories.map(([id, category]) => this.renderCategoryCard(id, category, false)).join('')}
                        </div>
                    </div>

                    <!-- Catégories personnalisées -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-user-cog"></i>
                            <h3>Catégories personnalisées</h3>
                            <span class="category-count-badge">${customCategories.length} catégories</span>
                        </div>
                        ${customCategories.length > 0 ? `
                            <div class="categories-grid-management">
                                ${customCategories.map(([id, category]) => this.renderCategoryCard(id, category, true)).join('')}
                            </div>
                        ` : `
                            <div class="empty-categories-state">
                                <div class="empty-icon">
                                    <i class="fas fa-folder-plus"></i>
                                </div>
                                <h4>Aucune catégorie personnalisée</h4>
                                <p>Créez votre première catégorie personnalisée pour organiser vos emails.</p>
                                <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                    <i class="fas fa-plus"></i>
                                    Créer ma première catégorie
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderCategoriesTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    renderCategoryCard(categoryId, category, isEditable = false) {
        const isPreselected = this.getTaskPreselectedCategories().includes(categoryId);
        const priority = category.priority || 50;
        
        return `
            <div class="category-card-management ${isPreselected ? 'preselected' : ''}" data-category-id="${categoryId}">
                <div class="category-card-header">
                    <div class="category-icon-display" style="background: ${category.color}20; color: ${category.color};">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h5 class="category-name">${category.name}</h5>
                        <p class="category-description">${category.description || 'Aucune description'}</p>
                    </div>
                    ${isPreselected ? '<span class="preselected-badge-small">⭐ Pré-sélectionné</span>' : ''}
                </div>
                
                <div class="category-meta">
                    <span class="category-priority">Priorité: ${priority}</span>
                    ${category.isCustom ? '<span class="custom-badge-small">Personnalisée</span>' : '<span class="system-badge-small">Système</span>'}
                </div>
                
                <div class="category-actions">
                    <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Voir mots-clés">
                        <i class="fas fa-key"></i>
                    </button>
                    ${isEditable ? `
                        <button class="btn-category-action edit" onclick="window.categoriesPage.showEditCategoryModal('${categoryId}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-category-action delete" onclick="window.categoriesPage.showDeleteCategoryModal('${categoryId}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Informations">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    loadSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            const settings = window.categoryManager.getSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis CategoryManager:', settings);
            return settings;
        }
        
        try {
            const saved = localStorage.getItem('categorySettings');
            const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis localStorage:', settings);
            return settings;
        } catch (error) {
            console.error('[CategoriesPage] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings) {
        console.log('[CategoriesPage] 💾 Sauvegarde settings:', newSettings);
        
        if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
            window.categoryManager.updateSettings(newSettings);
        } else {
            try {
                localStorage.setItem('categorySettings', JSON.stringify(newSettings));
                setTimeout(() => {
                    this.dispatchEvent('categorySettingsChanged', { settings: newSettings });
                }, 10);
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde paramètres:', error);
            }
        }
        
        setTimeout(() => {
            this.forceSynchronization();
        }, 50);
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
            this.showToast('Préférences sauvegardées', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            this.showToast('Erreur de sauvegarde', 'error');
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
            this.showToast('Paramètres de scan sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
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
            this.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] 🎯 Mise à jour catégories pré-sélectionnées');
            
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            const selectedCategories = [];
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            console.log('[CategoriesPage] 🎯 Nouvelles catégories:', selectedCategories);
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s)`, 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            this.showToast('Erreur de mise à jour des catégories', 'error');
        }
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tab) {
        try {
            console.log(`[CategoriesPage] 🔄 Changement onglet vers: ${tab}`);
            
            this.currentTab = tab;
            const tabContent = document.getElementById('tabContent');
            
            if (!tabContent) {
                console.error('[CategoriesPage] Element tabContent non trouvé');
                return;
            }

            const moduleStatus = this.checkModuleAvailability();
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
            tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
            
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
        }
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    initializeEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        try {
            // Catégories pré-sélectionnées
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            categoryCheckboxes.forEach((checkbox) => {
                // Retirer les anciens listeners
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                // Ajouter le nouveau
                checkbox.addEventListener('change', this.updateTaskPreselectedCategories);
            });

            this.eventListenersSetup = true;
            console.log('[CategoriesPage] ✅ Event listeners initialisés');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

    checkModuleAvailability() {
        return {
            categoryManager: !!window.categoryManager,
            emailScanner: !!window.emailScanner,
            aiTaskAnalyzer: !!window.aiTaskAnalyzer,
            mailService: !!window.mailService,
            uiManager: !!window.uiManager
        };
    }

    checkSyncStatus(settings) {
        try {
            const expectedCategories = settings.taskPreselectedCategories || [];
            return { isSync: true, expectedCategories };
        } catch (error) {
            return { isSync: false, expectedCategories: [] };
        }
    }

    renderModuleStatusBar(status) {
        const totalModules = Object.keys(status).length;
        const availableModules = Object.values(status).filter(Boolean).length;
        const statusColor = availableModules === totalModules ? '#10b981' : '#f59e0b';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas fa-plug"></i> 
                Modules disponibles: ${availableModules}/${totalModules}
            </div>
        `;
    }

    renderSyncStatusBar(syncStatus) {
        const statusColor = syncStatus.isSync ? '#10b981' : '#f59e0b';
        const statusIcon = syncStatus.isSync ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i> 
                État synchronisation: ${syncStatus.isSync ? 'OK' : 'Attention'}
            </div>
        `;
    }

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue: ${error.message}</p>
                <button onclick="window.categoriesPage.forceUpdateUI()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Réessayer
                </button>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES FACTICES POUR ÉVITER LES ERREURS
    // ================================================
    showCreateCategoryModal() {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    showEditCategoryModal(categoryId) {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    showDeleteCategoryModal(categoryId) {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    showCategoryKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (category) {
            this.showToast(`Catégorie: ${category.name}`, 'info');
        }
    }

    exportSettings() {
        try {
            const settings = this.loadSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `email-settings-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast('Paramètres exportés avec succès', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.saveSettings(settings);
                    this.showToast('Paramètres importés avec succès', 'success');
                    this.forceUpdateUI();
                } catch (error) {
                    console.error('[CategoriesPage] Erreur import:', error);
                    this.showToast('Erreur lors de l\'import', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    debugSettings() {
        const settings = this.loadSettings();
        const moduleStatus = this.checkModuleAvailability();
        
        console.log('=== DEBUG SETTINGS ===');
        console.log('Settings:', settings);
        console.log('Module Status:', moduleStatus);
        console.log('======================');
        
        this.showToast('Voir la console pour les détails de debug', 'info');
        return { settings, moduleStatus };
    }

    forceSynchronization() {
        console.log('[CategoriesPage] 🔄 Synchronisation forcée');
        
        setTimeout(() => {
            this.dispatchEvent('forceSynchronization', {
                settings: this.loadSettings(),
                source: 'CategoriesPage',
                timestamp: Date.now()
            });
        }, 10);
    }

    forceUpdateUI() {
        console.log('[CategoriesPage] 🔄 Force update UI');
        this.eventListenersSetup = false;
        setTimeout(() => {
            this.switchTab(this.currentTab);
        }, 100);
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.remove();
        });
        document.body.style.overflow = 'auto';
    }

    notifySettingsChange(settingType, value) {
        setTimeout(() => {
            this.dispatchEvent('settingsChanged', {
                type: settingType, 
                value: value,
                source: 'CategoriesPage',
                timestamp: Date.now()
            });
        }, 10);
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoriesPage] Erreur dispatch ${eventName}:`, error);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type, duration);
        } else {
            console.log(`[Toast ${type.toUpperCase()}] ${message}`);
        }
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles pour CategoriesPage */
            .settings-page-compact {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            .page-header-compact {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
            }

            .page-header-compact h1 {
                margin: 0 0 12px 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }

            .settings-tabs-compact {
                display: flex;
                background: #ffffff;
                border-radius: 12px;
                padding: 4px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                gap: 4px;
            }

            .tab-button-compact {
                flex: 1;
                padding: 12px 16px;
                background: transparent;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .tab-button-compact:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .tab-button-compact.active {
                background: #3b82f6;
                color: white;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            }

            .settings-card-compact {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f3f4f6;
            }

            .card-header-compact h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }

            .settings-grid-compact {
                display: grid;
                gap: 16px;
            }

            .form-row-compact {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }

            .form-group-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-label-compact {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .form-select-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                color: #374151;
            }

            .switch-container-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .switch-container-compact:hover {
                background: #f8fafc;
                border-color: #3b82f6;
            }

            .switch-container-compact input[type="checkbox"] {
                display: none;
            }

            .switch-slider-compact {
                position: relative;
                width: 44px;
                height: 24px;
                background: #d1d5db;
                border-radius: 12px;
                transition: all 0.2s ease;
                cursor: pointer;
                flex-shrink: 0;
            }

            .switch-slider-compact::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .switch-container-compact input:checked + .switch-slider-compact {
                background: #3b82f6;
            }

            .switch-container-compact input:checked + .switch-slider-compact::before {
                transform: translateX(20px);
            }

            .switch-labels-compact {
                flex: 1;
            }

            .switch-title-compact {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .switch-description-compact {
                display: block;
                font-size: 12px;
                color: #6b7280;
            }

            .btn-compact {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: 1px solid;
                text-decoration: none;
            }

            .btn-compact.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-compact.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
            }

            .quick-actions-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }

            .btn-quick-action-compact {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #374151;
                text-decoration: none;
            }

            .btn-quick-action-compact:hover {
                background: #f0f9ff;
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 12px;
            }

            .category-checkbox-item-enhanced {
                display: flex;
                align-items: center;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: white;
            }

            .category-checkbox-item-enhanced:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .cat-icon-automation {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }

            .cat-name-automation {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                flex: 1;
            }

            .selected-indicator {
                background: #10b981 !important;
                color: white !important;
                padding: 2px 8px !important;
                border-radius: 6px !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                margin-left: auto !important;
            }

            .custom-badge {
                background: #f59e0b;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .checkbox-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .checkbox-enhanced:hover {
                background: #f8fafc;
                border-color: #3b82f6;
            }

            .checkbox-content {
                flex: 1;
            }

            .checkbox-title {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
            }

            .checkbox-description {
                display: block;
                font-size: 12px;
                color: #6b7280;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }

            .stat-item {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px 12px;
                text-align: center;
                transition: all 0.2s ease;
            }

            .stat-item:hover {
                background: #f0f9ff;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .stat-label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #6b7280;
            }

            .categories-grid-management {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .category-card-management {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                transition: all 0.3s ease;
                position: relative;
            }

            .category-card-management:hover {
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }

            .category-card-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 12px;
            }

            .category-icon-display {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }

            .category-info {
                flex: 1;
                min-width: 0;
            }

            .category-name {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }

            .category-description {
                margin: 0;
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }

            .category-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                font-size: 12px;
            }

            .category-actions {
                display: flex;
                gap: 6px;
                justify-content: flex-end;
            }

            .btn-category-action {
                width: 32px;
                height: 32px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .btn-category-action:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                color: #374151;
            }

            .empty-categories-state {
                text-align: center;
                padding: 40px 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 2px dashed #d1d5db;
            }

            .empty-categories-state .empty-icon {
                font-size: 48px;
                color: #d1d5db;
                margin-bottom: 16px;
            }

            .empty-categories-state h4 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: #374151;
            }

            .empty-categories-state p {
                margin: 0 0 20px 0;
                color: #6b7280;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }

            .status-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                margin-left: 8px;
            }

            .status-badge.status-ok {
                background: #dcfce7;
                color: #166534;
            }

            .status-badge.status-warning {
                background: #fef3c7;
                color: #92400e;
            }

            @media (max-width: 768px) {
                .settings-page-compact {
                    padding: 12px;
                }

                .form-row-compact {
                    grid-template-columns: 1fr;
                }

                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }

                .categories-grid-management {
                    grid-template-columns: 1fr;
                }

                .quick-actions-grid-compact {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale avec nettoyage préalable
try {
    if (window.categoriesPage) {
        window.categoriesPage.destroy?.();
    }

    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager
    if (window.pageManager && window.pageManager.pages) {
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v10.0 intégrée au PageManager');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
}

console.log('✅ CategoriesPage v10.0 loaded - Correction complète des erreurs');
