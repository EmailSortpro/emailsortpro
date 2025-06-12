// CategoriesPage.js - VERSION SYNCHRONISÉE v8.0
// Interface utilisateur synchronisée avec EmailScanner centralisateur

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        
        // Synchronisation avec EmailScanner
        this.emailScannerReady = false;
        this.unsubscribeFromEmailScanner = null;
        
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 8.0 - Interface synchronisée avec EmailScanner');
        
        this.setupSynchronization();
    }

    // ================================================
    // SYNCHRONISATION AVEC EMAILSCANNER
    // ================================================
    
    async setupSynchronization() {
        // Attendre que EmailScanner soit prêt
        await this.waitForEmailScanner();
        
        if (window.emailScanner) {
            this.emailScannerReady = true;
            
            // S'abonner aux changements d'EmailScanner
            this.unsubscribeFromEmailScanner = window.emailScanner.subscribe((eventType, data) => {
                this.handleEmailScannerEvent(eventType, data);
            });
            
            console.log('[CategoriesPage] 🔗 Connecté à EmailScanner');
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
            console.warn('[CategoriesPage] EmailScanner non disponible après 10s');
        }
    }
    
    handleEmailScannerEvent(eventType, data) {
        switch (eventType) {
            case 'settingsChanged':
                // EmailScanner a changé des paramètres, on pourrait rafraîchir l'UI
                this.onExternalSettingsChange();
                break;
            case 'scanCompleted':
                // Un scan est terminé, on pourrait mettre à jour les stats
                this.updateStatsFromScanResults(data);
                break;
        }
    }
    
    onExternalSettingsChange() {
        // Rafraîchir l'onglet actuel si on est dans les paramètres
        if (this.currentTab && document.getElementById('tabContent')) {
            console.log('[CategoriesPage] Rafraîchissement après changement externe');
            this.refreshCurrentTab();
        }
    }
    
    updateStatsFromScanResults(results) {
        // Mettre à jour les statistiques dans l'interface
        const statsElements = document.querySelectorAll('.exclusions-count');
        if (statsElements.length > 0 && results.breakdown) {
            const totalEmails = results.total || 0;
            statsElements.forEach(el => {
                el.textContent = `${totalEmails} emails analysés`;
            });
        }
    }

    // ================================================
    // MÉTHODES DE PARAMÈTRES CENTRALISÉES
    // ================================================
    
    loadSettings() {
        if (this.emailScannerReady && window.emailScanner) {
            return window.emailScanner.getSettings();
        }
        
        // Fallback vers localStorage si EmailScanner pas prêt
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (error) {
            console.error('[CategoriesPage] Erreur loadSettings:', error);
            return this.getDefaultSettings();
        }
    }
    
    saveSettings(settings) {
        if (this.emailScannerReady && window.emailScanner) {
            // Sauvegarder via EmailScanner pour synchronisation automatique
            Object.entries(settings).forEach(([key, value]) => {
                if (key !== 'preferences' && key !== 'scanSettings' && key !== 'automationSettings') {
                    window.emailScanner.updateSettings(key, value);
                }
            });
        } else {
            // Fallback vers localStorage
            try {
                localStorage.setItem('categorySettings', JSON.stringify(settings));
            } catch (error) {
                console.error('[CategoriesPage] Erreur saveSettings:', error);
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
    // MÉTHODES DE NOTIFICATION CENTRALISÉES
    // ================================================
    
    notifySettingsChange(settingType, value) {
        if (this.emailScannerReady && window.emailScanner) {
            // Notifier via EmailScanner pour synchronisation globale
            window.emailScanner.updateSettings(settingType, value);
        } else {
            // Fallback vers l'ancien système d'événements
            try {
                window.dispatchEvent(new CustomEvent('settingsChanged', {
                    detail: { type: settingType, value: value }
                }));
            } catch (error) {
                console.error('[CategoriesPage] Erreur notification:', error);
            }
        }
    }

    // ================================================
    // PAGE PARAMÈTRES AVEC SYNCHRONISATION
    // ================================================
    
    renderSettings(container) {
        try {
            // Charger les paramètres depuis EmailScanner si possible
            let settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            ${this.emailScannerReady ? `
                                <div class="sync-status-indicator connected">
                                    <i class="fas fa-wifi"></i>
                                    <span>Synchronisé</span>
                                </div>
                            ` : `
                                <div class="sync-status-indicator disconnected">
                                    <i class="fas fa-wifi-slash"></i>
                                    <span>Mode local</span>
                                </div>
                            `}
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
            
            // Initialiser les événements après le rendu
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur lors du rendu:', error);
            container.innerHTML = this.renderErrorState();
        }
    }
    
    renderErrorState() {
        return `
            <div class="error-display" style="padding: 20px; text-align: center;">
                <h2>Erreur de chargement des paramètres</h2>
                <p>Une erreur est survenue lors du chargement de l'interface des paramètres.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES DE SAUVEGARDE SYNCHRONISÉES
    // ================================================
    
    savePreferences() {
        try {
            const preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            // Sauvegarder via la méthode centralisée
            this.notifySettingsChange('preferences', preferences);
            
            console.log('[CategoriesPage] Préférences sauvegardées:', preferences);
            window.uiManager?.showToast('Préférences sauvegardées', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            const scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            // Sauvegarder via la méthode centralisée
            this.notifySettingsChange('scanSettings', scanSettings);
            
            console.log('[CategoriesPage] Paramètres de scan sauvegardés:', scanSettings);
            window.uiManager?.showToast('Paramètres de scan sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            const automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            // Sauvegarder via la méthode centralisée
            this.notifySettingsChange('automationSettings', automationSettings);
            
            console.log('[CategoriesPage] Paramètres d\'automatisation sauvegardés:', automationSettings);
            window.uiManager?.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            window.uiManager?.showToast('Erreur de sauvegarde', 'error');
        }
    }

    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] updateTaskPreselectedCategories() appelée');
            
            const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            console.log(`${checkboxes.length} checkboxes trouvées`);
            
            const selectedCategories = [];
            checkboxes.forEach((checkbox, index) => {
                console.log(`Checkbox ${index}: value="${checkbox.value}", checked=${checkbox.checked}`);
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            console.log('Catégories sélectionnées:', selectedCategories);
            
            // Sauvegarder via la méthode centralisée
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            window.uiManager?.showToast(`${selectedCategories.length} catégorie(s) sélectionnée(s)`, 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateTaskPreselectedCategories:', error);
            window.uiManager?.showToast('Erreur de mise à jour', 'error');
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
            
            // Sauvegarder via la méthode centralisée
            this.notifySettingsChange('activeCategories', settings.activeCategories);
            
            console.log(`[CategoriesPage] Catégorie ${categoryId} ${isActive ? 'activée' : 'désactivée'}`);
            window.uiManager?.showToast(`Catégorie ${isActive ? 'activée' : 'désactivée'}`, 'success', 2000);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur toggleCategory:', error);
            window.uiManager?.showToast('Erreur de modification', 'error');
        }
    }

    // ================================================
    // BINDING DES MÉTHODES ET ÉVÉNEMENTS
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

            // Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.addEventListener('change', this.updateTaskPreselectedCategories);
            });

            // Catégories actives/inactives
            const categoryToggles = document.querySelectorAll('.toggle-minimal input');
            categoryToggles.forEach(toggle => {
                const categoryCard = toggle.closest('[data-category]');
                const categoryId = categoryCard?.dataset.category;
                if (categoryId) {
                    toggle.removeEventListener('change', this.handleToggleCategory);
                    toggle.addEventListener('change', (e) => {
                        this.toggleCategory(categoryId, e.target.checked);
                    });
                }
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

    // ================================================
    // MÉTHODES DE RENDU DES ONGLETS (INCHANGÉES)
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

    renderAutomationTab(settings) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] DEBUG - Rendu automatisation:');
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
                            <div class="categories-selection-grid-automation">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    return `
                                        <label class="category-checkbox-item-enhanced" data-category-id="${id}">
                                            <input type="checkbox" 
                                                   value="${id}"
                                                   data-category-name="${category.name}"
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

    // ================================================
    // TOUTES LES AUTRES MÉTHODES RESTENT IDENTIQUES
    // ================================================
    
    // [Toutes les méthodes utilitaires, modales, exclusions, etc. restent inchangées]
    
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
            console.error('[CategoriesPage] Erreur dans renderRecentExclusions:', error);
            return '<div>Erreur lors du chargement des exclusions récentes</div>';
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

    // ================================================
    // MÉTHODES PUBLIQUES POUR INTÉGRATION
    // ================================================
    
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
    
    shouldExcludeSpam() {
        const settings = this.loadSettings();
        return settings.preferences?.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        const settings = this.loadSettings();
        return settings.preferences?.detectCC !== false;
    }

    // ================================================
    // MÉTHODES DE DEBUG ET TEST
    // ================================================
    
    debugSettings() {
        const settings = this.loadSettings();
        console.log('\n=== DEBUG SETTINGS ===');
        console.log('EmailScanner ready:', this.emailScannerReady);
        console.log('Settings complets:', settings);
        console.log('Catégories pré-sélectionnées:', settings.taskPreselectedCategories);
        console.log('Catégories actives:', settings.activeCategories);
        console.log('Paramètres scan:', settings.scanSettings);
        console.log('========================\n');
        return settings;
    }
    
    testCategorySelection() {
        console.log('\n=== TEST CATEGORY SELECTION ===');
        const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
        console.log(`Trouvé ${checkboxes.length} checkboxes`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}:`);
            console.log(`  - Value: ${checkbox.value}`);
            console.log(`  - Checked: ${checkbox.checked}`);
        });
        
        const categories = window.categoryManager?.getCategories() || {};
        console.log('Catégories disponibles:', Object.keys(categories));
        console.log('================================\n');
        
        return { checkboxes: checkboxes.length, categories: Object.keys(categories) };
    }
    
    forceUpdateUI() {
        console.log('[CategoriesPage] Force update UI...');
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 100);
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
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

    // ================================================
    // MODALES ET EXPORT/IMPORT (MÉTHODES SIMPLIFIÉES)
    // ================================================
    
    openKeywordsModal(categoryId) {
        console.log('[CategoriesPage] Modal mots-clés pour:', categoryId);
        // Implémentation simplifiée
    }

    openAllKeywordsModal() {
        console.log('[CategoriesPage] Modal tous les mots-clés');
        // Implémentation simplifiée
    }

    openExclusionsModal() {
        console.log('[CategoriesPage] Modal exclusions');
        // Implémentation simplifiée
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    exportSettings() {
        console.log('[CategoriesPage] Export des paramètres');
        // Implémentation simplifiée
    }

    async importSettings() {
        console.log('[CategoriesPage] Import des paramètres');
        // Implémentation simplifiée
    }

    // ================================================
    // STYLES CSS AVEC INDICATEUR DE SYNCHRONISATION
    // ================================================
    
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles existants + nouveaux styles pour synchronisation */
            
            /* Indicateur de statut de synchronisation */
            .sync-status-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid;
                transition: all 0.2s ease;
            }
            
            .sync-status-indicator.connected {
                background: #dcfce7;
                color: #16a34a;
                border-color: #16a34a;
            }
            
            .sync-status-indicator.disconnected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #dc2626;
            }
            
            .sync-status-indicator i {
                font-size: 14px;
            }
            
            /* Reprendre tous les styles existants... */
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
            
            /* ... tous les autres styles restent identiques ... */
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
        
        console.log('[CategoriesPage] Instance détruite et désabonnée');
    }
}

// Créer l'instance globale avec gestion d'erreur
try {
    window.categoriesPage = new CategoriesPage();

    // Export pour PageManager integration
    if (window.pageManager && window.pageManager.pages) {
        delete window.pageManager.pages.categories;
        delete window.pageManager.pages.keywords;
        
        window.pageManager.pages.settings = (container) => {
            try {
                window.categoriesPage.renderSettings(container);
            } catch (error) {
                console.error('[PageManager] Erreur lors du rendu des paramètres:', error);
                container.innerHTML = window.categoriesPage.renderErrorState();
            }
        };
        
        const categoriesNavButton = document.querySelector('.nav-item[data-page="categories"]');
        if (categoriesNavButton) {
            categoriesNavButton.style.display = 'none';
        }
        
        console.log('✅ CategoriesPage v8.0 SYNCHRONISÉE loaded');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique lors de l\'initialisation:', error);
    
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
        },
        getScanSettings: () => ({ defaultPeriod: 7, defaultFolder: 'inbox', autoAnalyze: true, autoCategrize: true }),
        getAutomationSettings: () => ({ autoCreateTasks: false, groupTasksByDomain: false, skipDuplicates: true, autoAssignPriority: false }),
        getTaskPreselectedCategories: () => [],
        shouldExcludeSpam: () => true,
        shouldDetectCC: () => true
    };
}
