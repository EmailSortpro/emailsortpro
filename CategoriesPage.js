// CategoriesPage.js - Version 8.1 - CORRIGÉE COMPLÈTEMENT

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.debugMode = false;
        this.editingCategory = null;
        this.keywordSearchTerm = '';
        this.selectedKeywordType = 'all';
        
        this.bindMethods();
        console.log('[CategoriesPage] Version 8.1 - Gestion complète des mots-clés par catégorie - CORRIGÉE');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal',
            'openCategoryKeywordsModal', 'addKeywordToCategory', 'removeKeywordFromCategory',
            'editKeywordInCategory', 'renderSettings', 'initializeDefaultSettings',
            'loadSettings', 'saveSettings', 'notifySettingsChange', 'initializeEventListeners',
            'refreshCurrentTab', 'renderGeneralTab', 'renderAutomationTab', 'renderKeywordsTab',
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
    // INITIALISATION
    // =====================================
    initializeDefaultSettings() {
        const settings = this.loadSettings();
        let hasChanges = false;
        
        if (!settings.taskPreselectedCategories || settings.taskPreselectedCategories.length === 0) {
            settings.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
            hasChanges = true;
        }
        
        if (!settings.activeCategories) {
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            settings.activeCategories = allCategories;
            hasChanges = true;
        }
        
        if (hasChanges) {
            this.saveSettings(settings);
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
                categoryExclusions: { domains: [], emails: [] },
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
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: { domains: [], emails: [] },
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

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
            console.log('[CategoriesPage] Paramètres sauvegardés');
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveSettings:', error);
        }
    }

    notifySettingsChange(settingType, value) {
        try {
            window.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: { type: settingType, value: value }
            }));
        } catch (error) {
            console.error('[CategoriesPage] Erreur notification:', error);
        }
    }

    // =====================================
    // RENDU PRINCIPAL
    // =====================================
    renderSettings(container) {
        try {
            let settings = this.initializeDefaultSettings();
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                    </div>

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

                    <div class="tab-content-compact" id="tabContent">
                        ${this.renderCurrentTab(settings)}
                    </div>
                </div>
            `;
            
            this.addStyles();
            setTimeout(() => this.initializeEventListeners(), 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = this.renderErrorState(error);
        }
    }

    renderCurrentTab(settings) {
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

    // =====================================
    // ONGLETS
    // =====================================
    renderGeneralTab(settings) {
        return `
            <div class="settings-two-columns">
                <div class="settings-column-equal">
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-robot"></i>
                            <h3>Intelligence Artificielle</h3>
                        </div>
                        <p>Analyse automatique des emails avec Claude AI</p>
                        <button class="btn-compact btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                            <i class="fas fa-cog"></i> Configurer Claude AI
                        </button>
                    </div>

                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-sliders-h"></i>
                            <h3>Préférences générales</h3>
                        </div>
                        
                        <div class="general-preferences">
                            <label class="checkbox-compact">
                                <input type="checkbox" id="darkMode" ${settings.preferences?.darkMode ? 'checked' : ''}>
                                <span>Mode sombre</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="compactView" ${settings.preferences?.compactView ? 'checked' : ''}>
                                <span>Vue compacte</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="showNotifications" ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                                <span>Notifications</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="excludeSpam" ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                                <span>Exclure spam</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="detectCC" ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                                <span>Détecter CC</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-column-equal">
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-search"></i>
                            <h3>Scan d'emails</h3>
                        </div>
                        
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
                                <input type="checkbox" id="autoAnalyze" ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                                <span>Analyse IA automatique</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="autoCategrize" ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                                <span>Catégorisation automatique</span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-filter"></i>
                            <h3>Exclusions</h3>
                        </div>
                        ${this.renderOptimizedExclusions(settings)}
                    </div>
                </div>
            </div>
        `;
    }

    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            return `
                <div class="automation-focused-layout">
                    <div class="settings-card-compact full-width">
                        <div class="card-header-compact">
                            <i class="fas fa-check-square"></i>
                            <h3>Conversion automatique en tâches</h3>
                        </div>
                        
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation-enhanced">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    return `
                                        <div class="category-checkbox-card-enhanced ${isPreselected ? 'selected-highlighted' : ''}">
                                            <label class="category-checkbox-item-enhanced">
                                                <input type="checkbox" 
                                                       value="${id}"
                                                       ${isPreselected ? 'checked' : ''}>
                                                <div class="category-checkbox-content-enhanced">
                                                    <span class="cat-icon-automation" style="background: ${category.color}20; color: ${category.color}">
                                                        ${category.icon}
                                                    </span>
                                                    <div class="category-info-automation">
                                                        <span class="cat-name-automation">${category.name}</span>
                                                        <span class="cat-description-automation">${category.description || ''}</span>
                                                    </div>
                                                    ${isPreselected ? '<div class="selected-indicator"><i class="fas fa-check-circle"></i></div>' : ''}
                                                </div>
                                            </label>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <div class="automation-options-enhanced">
                            <h4><i class="fas fa-cog"></i> Options d'automatisation</h4>
                            <div class="automation-options-grid">
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoCreateTasks" ${settings.automationSettings?.autoCreateTasks ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Création automatique</span>
                                        <span class="checkbox-description">Créer automatiquement les tâches</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="groupTasksByDomain" ${settings.automationSettings?.groupTasksByDomain ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Regroupement par domaine</span>
                                        <span class="checkbox-description">Regrouper par expéditeur</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="skipDuplicates" ${settings.automationSettings?.skipDuplicates !== false ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Ignorer les doublons</span>
                                        <span class="checkbox-description">Éviter les doublons</span>
                                    </div>
                                </label>
                                
                                <label class="checkbox-enhanced">
                                    <input type="checkbox" id="autoAssignPriority" ${settings.automationSettings?.autoAssignPriority ? 'checked' : ''}>
                                    <div class="checkbox-content">
                                        <span class="checkbox-title">Priorité automatique</span>
                                        <span class="checkbox-description">Assigner la priorité</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderAutomationTab:', error);
            return '<div>Erreur lors du chargement</div>';
        }
    }

    renderKeywordsTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            return `
                <div class="categories-keywords-manager">
                    <div class="keywords-header">
                        <div class="keywords-header-info">
                            <h3><i class="fas fa-tags"></i> Gestion des catégories</h3>
                            <p>Configurez les catégories et leurs mots-clés</p>
                        </div>
                        <div class="keywords-header-actions">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openAllKeywordsModal()">
                                <i class="fas fa-list"></i> Tous les mots-clés
                            </button>
                        </div>
                    </div>

                    <div class="categories-grid-enhanced">
                        ${Object.entries(categories).map(([id, category]) => {
                            const isActive = settings.activeCategories ? settings.activeCategories.includes(id) : true;
                            const isPreselected = (settings.taskPreselectedCategories || []).includes(id);
                            
                            return `
                                <div class="category-card-enhanced ${isActive ? 'active' : 'inactive'} ${isPreselected ? 'preselected' : ''}" 
                                     data-category="${id}">
                                    
                                    <div class="category-header-enhanced">
                                        <div class="category-icon-enhanced" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </div>
                                        <div class="category-info-enhanced">
                                            <h4>${category.name}</h4>
                                            <div class="category-stats">
                                                <span class="keyword-count">0 mots-clés</span>
                                                ${isPreselected ? '<span class="preselected-badge-small">🎯 Auto</span>' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="keywords-preview">
                                        <div class="no-keywords-preview">
                                            <i class="fas fa-plus-circle"></i>
                                            <span>Aucun mot-clé configuré</span>
                                        </div>
                                    </div>

                                    <div class="category-actions-enhanced">
                                        <button class="btn-edit-keywords-enhanced" 
                                                onclick="window.categoriesPage.openCategoryKeywordsModal('${id}')">
                                            <i class="fas fa-edit"></i>
                                            <span>Gérer</span>
                                        </button>
                                        
                                        <label class="toggle-enhanced">
                                            <input type="checkbox" ${isActive ? 'checked' : ''}>
                                            <span class="toggle-slider-enhanced"></span>
                                        </label>
                                    </div>

                                    <div class="priority-indicator" style="background: ${category.color}"></div>
                                    ${isPreselected ? '<div class="preselected-indicator-small"><i class="fas fa-star"></i></div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement</div>';
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

    renderErrorState(error) {
        return `
            <div class="error-display" style="padding: 20px; text-align: center;">
                <h2>Erreur de chargement</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px;">
                    Recharger
                </button>
            </div>
        `;
    }

    // =====================================
    // ÉVÉNEMENTS
    // =====================================
    initializeEventListeners() {
        try {
            // Préférences générales
            ['darkMode', 'compactView', 'showNotifications', 'excludeSpam', 'detectCC'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', this.savePreferences);
                }
            });

            // Paramètres de scan
            ['defaultScanPeriod', 'defaultFolder', 'autoAnalyze', 'autoCategrize'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', this.saveScanSettings);
                }
            });

            // Automatisation
            ['autoCreateTasks', 'groupTasksByDomain', 'skipDuplicates', 'autoAssignPriority'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', this.saveAutomationSettings);
                }
            });

            // Catégories pré-sélectionnées
            const categoryCheckboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', this.updateTaskPreselectedCategories);
            });

            console.log('[CategoriesPage] Événements initialisés');
        } catch (error) {
            console.error('[CategoriesPage] Erreur événements:', error);
        }
    }

    switchTab(tab) {
        try {
            this.currentTab = tab;
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            
            document.querySelectorAll('.tab-button-compact').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.tab-button-compact[onclick*="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            if (tabContent) {
                tabContent.innerHTML = this.renderCurrentTab(settings);
                setTimeout(() => this.initializeEventListeners(), 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur switchTab:', error);
        }
    }

    // =====================================
    // SAUVEGARDE
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
            this.notifySettingsChange('preferences', settings.preferences);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Préférences sauvegardées', 'success');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
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
            this.notifySettingsChange('scanSettings', settings.scanSettings);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Paramètres de scan sauvegardés', 'success');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
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
            this.notifySettingsChange('automationSettings', settings.automationSettings);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
        }
    }

    updateTaskPreselectedCategories() {
        try {
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            
            const selectedCategories = [];
            checkboxes.forEach(checkbox => {
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            // Mise à jour visuelle
            checkboxes.forEach(checkbox => {
                const card = checkbox.closest('.category-checkbox-card-enhanced');
                if (card) {
                    if (checkbox.checked) {
                        card.classList.add('selected-highlighted');
                        if (!card.querySelector('.selected-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'selected-indicator';
                            indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                            card.querySelector('.category-checkbox-content-enhanced').appendChild(indicator);
                        }
                    } else {
                        card.classList.remove('selected-highlighted');
                        const indicator = card.querySelector('.selected-indicator');
                        if (indicator) indicator.remove();
                    }
                }
            });
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`${selectedCategories.length} catégorie(s) sélectionnée(s)`, 'success');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    refreshCurrentTab() {
        const tabContent = document.getElementById('tabContent');
        if (tabContent) {
            const settings = this.loadSettings();
            tabContent.innerHTML = this.renderCurrentTab(settings);
            setTimeout(() => this.initializeEventListeners(), 100);
        }
    }

    updateAutomationStats() {
        // Mise à jour des statistiques si nécessaire
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
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

    // =====================================
    // MÉTHODES STUB (à implémenter)
    // =====================================
    addQuickExclusion() { console.log('addQuickExclusion - à implémenter'); }
    toggleCategory(categoryId, isActive) { console.log('toggleCategory:', categoryId, isActive); }
    openKeywordsModal() { console.log('openKeywordsModal - à implémenter'); }
    openAllKeywordsModal() { console.log('openAllKeywordsModal - à implémenter'); }
    openExclusionsModal() { console.log('openExclusionsModal - à implémenter'); }
    exportSettings() { console.log('exportSettings - à implémenter'); }
    importSettings() { console.log('importSettings - à implémenter'); }
    openCategoryKeywordsModal(categoryId) { console.log('openCategoryKeywordsModal:', categoryId); }
    addKeywordToCategory(categoryId) { console.log('addKeywordToCategory:', categoryId); }
    removeKeywordFromCategory(categoryId, type, index) { console.log('removeKeywordFromCategory:', categoryId, type, index); }
    editKeywordInCategory(categoryId, type, index) { console.log('editKeywordInCategory:', categoryId, type, index); }
    closeModal(modalId) { 
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    // =====================================
    // DEBUG
    // =====================================
    debugSettings() {
        console.log('[CategoriesPage] Debug Settings:', this.loadSettings());
    }

    testCategorySelection() {
        console.log('[CategoriesPage] Test Category Selection');
        const settings = this.loadSettings();
        console.log('Categories:', settings.taskPreselectedCategories);
    }

    forceUpdateUI() {
        console.log('[CategoriesPage] Force Update UI');
        this.refreshCurrentTab();
    }

    // =====================================
    // STYLES
    // =====================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            .settings-page-compact {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .page-header-compact h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 30px 0;
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
            
            .general-preferences {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
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
            
            .automation-focused-layout {
                max-width: 100%;
            }
            
            .full-width {
                grid-column: 1 / -1;
            }
            
            .task-automation-section {
                margin: 20px 0;
            }
            
            .task-automation-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .categories-selection-grid-automation-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
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
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
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
            
            .keywords-preview {
                flex: 1;
                margin-bottom: 12px;
                overflow: hidden;
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
            }
        `;
        
        document.head.appendChild(styles);
        console.log('[CategoriesPage] Styles ajoutés');
    }
}

// Créer l'instance globale
try {
    window.categoriesPage = new CategoriesPage();

    // Intégration avec PageManager
    if (window.pageManager && window.pageManager.pages) {
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur rendu paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState(error);
            }
        };
        
        console.log('✅ CategoriesPage v8.1 loaded - Gestion complète corrigée');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
}
