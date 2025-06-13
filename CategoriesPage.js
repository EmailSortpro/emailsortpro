// CategoriesPage.js - Version 8.5 - Complète avec toutes les méthodes

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // Gestion de synchronisation renforcée
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 8.5 - Complète avec toutes les méthodes');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
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
        console.log('[CategoriesPage] 💾 === DÉBUT SAUVEGARDE SETTINGS ===');
        console.log('[CategoriesPage] 📥 Nouveaux settings à sauvegarder:', newSettings);
        
        if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
            console.log('[CategoriesPage] 🎯 Sauvegarde via CategoryManager');
            window.categoryManager.updateSettings(newSettings);
        } else {
            console.log('[CategoriesPage] 🔄 Fallback sauvegarde localStorage');
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
        
        console.log('[CategoriesPage] ✅ === FIN SAUVEGARDE SETTINGS ===');
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
    // SYNCHRONISATION FORCÉE
    // ================================================
    forceSynchronization() {
        if (this.syncInProgress) {
            console.log('[CategoriesPage] 🔄 Synchronisation déjà en cours, ajout à la queue');
            this.pendingSync = true;
            return;
        }
        
        this.syncInProgress = true;
        console.log('[CategoriesPage] 🚀 === DÉBUT SYNCHRONISATION FORCÉE ===');
        
        try {
            const currentSettings = this.loadSettings();
            console.log('[CategoriesPage] 📊 Settings actuels:', currentSettings);
            
            this.syncAllModules(currentSettings);
            
            setTimeout(() => {
                this.dispatchEvent('forceSynchronization', {
                    settings: currentSettings,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                });
            }, 10);
            
            console.log('[CategoriesPage] ✅ Synchronisation forcée terminée');
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur synchronisation forcée:', error);
        } finally {
            this.syncInProgress = false;
            
            if (this.pendingSync) {
                this.pendingSync = false;
                setTimeout(() => {
                    this.forceSynchronization();
                }, 100);
            }
        }
    }

    syncAllModules(settings) {
        console.log('[CategoriesPage] 🔄 Synchronisation de tous les modules...');
        
        if (window.emailScanner) {
            console.log('[CategoriesPage] 📧 Synchronisation EmailScanner');
            
            if (typeof window.emailScanner.updateSettings === 'function') {
                window.emailScanner.updateSettings(settings);
            }
            
            if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                window.emailScanner.updateTaskPreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.emailScanner.forceSettingsReload === 'function') {
                window.emailScanner.forceSettingsReload();
            }
        }
        
        if (window.aiTaskAnalyzer) {
            console.log('[CategoriesPage] 🤖 Synchronisation AITaskAnalyzer');
            
            if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                window.aiTaskAnalyzer.updatePreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                window.aiTaskAnalyzer.updateAutomationSettings(settings.automationSettings || {});
            }
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS
    // ================================================
    notifySettingsChange(settingType, value) {
        const now = Date.now();
        
        const notificationKey = `${settingType}_${JSON.stringify(value)}`;
        if (this.lastNotification === notificationKey && (now - this.lastNotificationTime) < 1000) {
            console.log(`[CategoriesPage] 🔄 Notification ignorée (trop récente): ${settingType}`);
            return;
        }
        
        this.lastNotification = notificationKey;
        this.lastNotificationTime = now;
        
        console.log(`[CategoriesPage] 📢 === NOTIFICATION CHANGEMENT ===`);
        console.log(`[CategoriesPage] 🎯 Type: ${settingType}`);
        console.log(`[CategoriesPage] 📊 Valeur:`, value);
        
        setTimeout(() => {
            this.dispatchEvent('settingsChanged', {
                type: settingType, 
                value: value,
                source: 'CategoriesPage',
                timestamp: now
            });
        }, 10);
        
        this.notifySpecificModules(settingType, value);
        
        setTimeout(() => {
            this.forceSynchronization();
        }, 100);
    }

    notifySpecificModules(settingType, value) {
        console.log(`[CategoriesPage] 🎯 Notification spécialisée pour: ${settingType}`);
        
        if (window.emailScanner) {
            switch (settingType) {
                case 'taskPreselectedCategories':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - catégories pré-sélectionnées');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    break;
                case 'scanSettings':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - scan settings');
                    if (typeof window.emailScanner.applyScanSettings === 'function') {
                        window.emailScanner.applyScanSettings(value);
                    }
                    break;
                case 'preferences':
                    console.log('[CategoriesPage] 📧 Mise à jour EmailScanner - préférences');
                    if (typeof window.emailScanner.updatePreferences === 'function') {
                        window.emailScanner.updatePreferences(value);
                    }
                    break;
            }
        }
        
        if (window.aiTaskAnalyzer) {
            if (settingType === 'taskPreselectedCategories') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - catégories pré-sélectionnées');
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
            
            if (settingType === 'automationSettings') {
                console.log('[CategoriesPage] 🤖 Mise à jour AITaskAnalyzer - automation settings');
                if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                    window.aiTaskAnalyzer.updateAutomationSettings(value);
                }
            }
        }
        
        console.log('[CategoriesPage] ✅ Notifications spécialisées envoyées');
    }

    // ================================================
    // MISE À JOUR DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    updateTaskPreselectedCategories() {
        try {
            console.log('[CategoriesPage] 🎯 === DÉBUT updateTaskPreselectedCategories ===');
            
            const settings = this.loadSettings();
            const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
            
            console.log(`[CategoriesPage] 🔍 Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
            
            const selectedCategories = [];
            const selectionDetails = [];
            
            checkboxes.forEach((checkbox, index) => {
                const details = {
                    index: index,
                    value: checkbox.value,
                    checked: checkbox.checked,
                    name: checkbox.dataset.categoryName,
                    element: checkbox
                };
                
                selectionDetails.push(details);
                
                console.log(`[CategoriesPage] 📋 Checkbox ${index}:`);
                console.log(`  - Value: "${checkbox.value}"`);
                console.log(`  - Checked: ${checkbox.checked}`);
                console.log(`  - Data name: "${checkbox.dataset.categoryName}"`);
                
                if (checkbox.checked && checkbox.value) {
                    selectedCategories.push(checkbox.value);
                    console.log(`  - ✅ AJOUTÉ à la sélection: ${checkbox.value}`);
                } else {
                    console.log(`  - ❌ PAS sélectionné`);
                }
            });
            
            console.log('[CategoriesPage] 🎯 Nouvelles catégories sélectionnées:', selectedCategories);
            console.log('[CategoriesPage] 📊 Anciennes catégories:', settings.taskPreselectedCategories);
            
            const oldCategories = settings.taskPreselectedCategories || [];
            const hasChanged = JSON.stringify([...selectedCategories].sort()) !== JSON.stringify([...oldCategories].sort());
            
            if (!hasChanged) {
                console.log('[CategoriesPage] 🔄 Aucun changement détecté, skip mise à jour');
                return;
            }
            
            console.log('[CategoriesPage] 📝 Changement détecté, mise à jour en cours...');
            
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] 💾 Paramètres sauvegardés avec nouvelles catégories');
            
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            this.updateSelectionIndicators(selectedCategories);
            
            const categoryNames = selectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? category.name : catId;
            });
            
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s): ${categoryNames.join(', ')}`, 'success', 4000);
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] 🎯 === FIN updateTaskPreselectedCategories ===');
            
            setTimeout(() => {
                this.verifySynchronization(selectedCategories);
            }, 1000);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur updateTaskPreselectedCategories:', error);
            this.showToast('Erreur de mise à jour des catégories', 'error');
        }
    }

    // ================================================
    // VÉRIFICATION DE SYNCHRONISATION
    // ================================================
    verifySynchronization(expectedCategories) {
        console.log('[CategoriesPage] 🔍 Vérification de synchronisation...');
        
        try {
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            console.log('[CategoriesPage] 📊 État de synchronisation:');
            console.log('  - Attendu:', expectedCategories);
            console.log('  - EmailScanner:', emailScannerCategories, emailScannerSync ? '✅' : '❌');
            console.log('  - CategoryManager:', categoryManagerCategories, categoryManagerSync ? '✅' : '❌');
            
            if (!emailScannerSync || !categoryManagerSync) {
                console.log('[CategoriesPage] ⚠️ Désynchronisation détectée, re-synchronisation...');
                this.forceSynchronization();
                
                this.showSyncStatus(false);
                
                setTimeout(() => {
                    this.verifySynchronization(expectedCategories);
                }, 2000);
            } else {
                console.log('[CategoriesPage] ✅ Synchronisation confirmée');
                this.showSyncStatus(true);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur vérification synchronisation:', error);
        }
    }

    // ================================================
    // INDICATEURS VISUELS DE SYNCHRONISATION
    // ================================================
    updateSelectionIndicators(selectedCategories) {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        checkboxes.forEach(checkbox => {
            const container = checkbox.closest('.category-checkbox-item-enhanced');
            const existingIndicator = container?.querySelector('.selected-indicator');
            
            if (checkbox.checked && selectedCategories.includes(checkbox.value)) {
                if (!existingIndicator) {
                    const indicator = document.createElement('span');
                    indicator.className = 'selected-indicator';
                    indicator.textContent = '✓ Sélectionné';
                    
                    const content = container.querySelector('.category-checkbox-content-enhanced');
                    if (content) {
                        content.appendChild(indicator);
                    }
                }
            } else {
                if (existingIndicator) {
                    existingIndicator.remove();
                }
            }
        });
        
        console.log('[CategoriesPage] ✅ Indicateurs de sélection mis à jour');
    }

    showSyncStatus(isSync) {
        let indicator = document.getElementById('sync-status-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sync-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(indicator);
        }
        
        if (isSync) {
            indicator.style.background = '#d1fae5';
            indicator.style.color = '#065f46';
            indicator.style.border = '1px solid #10b981';
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Synchronisé';
            
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 3000);
        } else {
            indicator.style.background = '#fef3c7';
            indicator.style.color = '#92400e';
            indicator.style.border = '1px solid #f59e0b';
            indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Synchronisation...';
        }
    }

    // ================================================
    // MÉTHODES DE SAUVEGARDE
    // ================================================
    savePreferences() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE PRÉFÉRENCES ===');
            
            const settings = this.loadSettings();
            
            const preferences = {
                darkMode: document.getElementById('darkMode')?.checked || false,
                compactView: document.getElementById('compactView')?.checked || false,
                showNotifications: document.getElementById('showNotifications')?.checked !== false,
                excludeSpam: document.getElementById('excludeSpam')?.checked !== false,
                detectCC: document.getElementById('detectCC')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouvelles préférences:', preferences);
            
            settings.preferences = preferences;
            this.saveSettings(settings);
            
            this.notifySettingsChange('preferences', preferences);
            this.showToast('Préférences sauvegardées', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur savePreferences:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveScanSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE SCAN SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const scanSettings = {
                defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
                defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
                autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
                autoCategrize: document.getElementById('autoCategrize')?.checked !== false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux scan settings:', scanSettings);
            
            settings.scanSettings = scanSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('scanSettings', scanSettings);
            this.showToast('Paramètres de scan sauvegardés', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveScanSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    saveAutomationSettings() {
        try {
            console.log('[CategoriesPage] 💾 === SAUVEGARDE AUTOMATION SETTINGS ===');
            
            const settings = this.loadSettings();
            
            const automationSettings = {
                autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
                groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
                skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
                autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
            };
            
            console.log('[CategoriesPage] 📊 Nouveaux automation settings:', automationSettings);
            
            settings.automationSettings = automationSettings;
            this.saveSettings(settings);
            
            this.notifySettingsChange('automationSettings', automationSettings);
            this.showToast('Paramètres d\'automatisation sauvegardés', 'success');
            this.updateAutomationStats();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur saveAutomationSettings:', error);
            this.showToast('Erreur de sauvegarde', 'error');
        }
    }

    // ================================================
    // RENDU PRINCIPAL DE LA PAGE PARAMÈTRES
    // ================================================
    renderSettings(container) {
        if (!container) {
            console.error('[CategoriesPage] Container manquant');
            return;
        }

        try {
            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            const syncStatus = this.checkSyncStatus(settings);
            
            container.innerHTML = `
                <div class="settings-page-compact">
                    <div class="page-header-compact">
                        <h1>Paramètres</h1>
                        ${this.renderModuleStatusBar(moduleStatus)}
                        ${this.renderSyncStatusBar(syncStatus)}
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.debugSettings()" title="Debug">
                                <i class="fas fa-bug"></i> Debug
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.testCategorySelection()" title="Test">
                                <i class="fas fa-vial"></i> Test
                            </button>
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.forceSynchronization()" title="Forcer Sync">
                                <i class="fas fa-sync"></i> Synchroniser
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.forceUpdateUI()" title="Refresh">
                                <i class="fas fa-redo"></i> Refresh
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
                        ${this.renderTabContent(settings, moduleStatus)}
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

    // ================================================
    // RENDU DU CONTENU DES ONGLETS
    // ================================================
    renderTabContent(settings, moduleStatus) {
        switch (this.currentTab) {
            case 'general':
                return this.renderGeneralTab(settings, moduleStatus);
            case 'automation':
                return this.renderAutomationTab(settings, moduleStatus);
            case 'keywords':
                return this.renderKeywordsTab(settings, moduleStatus);
            default:
                return this.renderGeneralTab(settings, moduleStatus);
        }
    }

    // ================================================
    // ONGLET GÉNÉRAL
    // ================================================
    renderGeneralTab(settings, moduleStatus) {
        return `
            <div class="settings-grid-compact">
                <!-- Carte Préférences -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-cog"></i>
                        <h3>Préférences générales</h3>
                    </div>
                    
                    <div class="settings-form-compact">
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="darkMode" ${settings.preferences?.darkMode ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Mode sombre</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="compactView" ${settings.preferences?.compactView ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Vue compacte</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="showNotifications" ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Notifications</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="excludeSpam" ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Exclure les spams</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="detectCC" ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Détecter les emails en CC</span>
                        </label>
                    </div>
                </div>

                <!-- Carte Paramètres de scan -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-search"></i>
                        <h3>Paramètres de scan</h3>
                    </div>
                    
                    <div class="settings-form-compact">
                        <div class="form-group-compact">
                            <label>Période par défaut (jours)</label>
                            <select id="defaultScanPeriod" class="form-select-compact">
                                <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                            </select>
                        </div>
                        
                        <div class="form-group-compact">
                            <label>Dossier par défaut</label>
                            <select id="defaultFolder" class="form-select-compact">
                                <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                <option value="all" ${settings.scanSettings?.defaultFolder === 'all' ? 'selected' : ''}>Tous les dossiers</option>
                            </select>
                        </div>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="autoAnalyze" ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Analyse IA automatique</span>
                        </label>
                        
                        <label class="toggle-setting-compact">
                            <input type="checkbox" id="autoCategrize" ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                            <span class="toggle-slider-compact"></span>
                            <span class="toggle-label-compact">Catégorisation automatique</span>
                        </label>
                    </div>
                </div>

                <!-- Carte Import/Export -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-file-import"></i>
                        <h3>Import/Export</h3>
                    </div>
                    
                    <div class="import-export-section">
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.exportSettings()">
                            <i class="fas fa-download"></i> Exporter paramètres
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importSettings()">
                            <i class="fas fa-upload"></i> Importer paramètres
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ONGLET AUTOMATISATION
    // ================================================
    renderAutomationTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const preselectedCategories = settings.taskPreselectedCategories || [];
            
            console.log('[CategoriesPage] 🎯 Rendu automatisation:');
            console.log('  - Catégories disponibles:', Object.keys(categories));
            console.log('  - Catégories pré-sélectionnées:', preselectedCategories);
            
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
                        <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                        
                        <!-- Indicateur de synchronisation temps réel -->
                        <div id="automation-sync-indicator" class="automation-sync-indicator">
                            ${this.renderAutomationSyncIndicator(preselectedCategories)}
                        </div>
                        
                        <!-- Sélection des catégories -->
                        <div class="task-automation-section">
                            <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées</h4>
                            <div class="categories-selection-grid-automation" id="categoriesSelectionGrid">
                                ${Object.entries(categories).map(([id, category]) => {
                                    const isPreselected = preselectedCategories.includes(id);
                                    console.log(`[CategoriesPage] 📋 Catégorie ${id} (${category.name}): ${isPreselected ? 'SÉLECTIONNÉE' : 'non sélectionnée'}`);
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
                                           ${moduleStatus.aiTaskAnalyzer ? '' : 'disabled'}>
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
                        
                        <!-- Statistiques avec état synchronisation -->
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
                                <div class="stat-item sync-stat">
                                    <span class="stat-number" id="stat-sync">${this.checkSyncStatus(settings).isSync ? '✅' : '⚠️'}</span>
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
    renderKeywordsTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = window.categoryManager?.getCustomCategories() || {};
            
            return `
                <div class="keywords-tab-layout">
                    <!-- Actions principales -->
                    <div class="keywords-actions-bar">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Nouvelle catégorie
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openAllKeywordsModal()">
                            <i class="fas fa-list"></i> Voir tous les mots-clés
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openExclusionsModal()">
                            <i class="fas fa-ban"></i> Gérer les exclusions
                        </button>
                    </div>
                    
                    <!-- Grille des catégories -->
                    <div class="categories-grid-enhanced">
                        ${Object.entries(categories).map(([id, category]) => {
                            const isCustom = category.isCustom || customCategories[id];
                            const keywords = window.categoryManager?.getCategoryKeywords(id) || { absolute: [], strong: [], weak: [] };
                            const totalKeywords = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + (keywords.weak?.length || 0);
                            
                            return `
                                <div class="category-card-enhanced" data-category-id="${id}">
                                    <div class="category-card-header">
                                        <div class="category-icon-large" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </div>
                                        <div class="category-info">
                                            <h3>${category.name}</h3>
                                            ${isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                        </div>
                                    </div>
                                    
                                    <p class="category-description">${category.description || 'Aucune description'}</p>
                                    
                                    <div class="keywords-summary">
                                        <div class="keyword-count">
                                            <i class="fas fa-key"></i>
                                            <span>${totalKeywords} mot${totalKeywords > 1 ? 's' : ''}-clé${totalKeywords > 1 ? 's' : ''}</span>
                                        </div>
                                        ${keywords.absolute?.length > 0 ? `<span class="keyword-badge absolute">${keywords.absolute.length} absolus</span>` : ''}
                                        ${keywords.strong?.length > 0 ? `<span class="keyword-badge strong">${keywords.strong.length} forts</span>` : ''}
                                        ${keywords.weak?.length > 0 ? `<span class="keyword-badge weak">${keywords.weak.length} faibles</span>` : ''}
                                    </div>
                                    
                                    <div class="category-actions">
                                        <button class="btn-compact btn-secondary btn-sm" onclick="window.categoriesPage.openKeywordsModal('${id}')">
                                            <i class="fas fa-edit"></i> Mots-clés
                                        </button>
                                        ${isCustom ? `
                                            <button class="btn-compact btn-secondary btn-sm" onclick="window.categoriesPage.editCustomCategory('${id}')">
                                                <i class="fas fa-cog"></i> Modifier
                                            </button>
                                            <button class="btn-compact btn-danger btn-sm" onclick="window.categoriesPage.deleteCustomCategory('${id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- Section d'exclusion rapide -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-ban"></i>
                            <h3>Exclusion rapide</h3>
                        </div>
                        <div class="quick-exclusion-section">
                            <input type="text" 
                                   id="quick-exclusion-input" 
                                   class="form-input-compact" 
                                   placeholder="Domaine ou email à exclure (ex: newsletter.com)">
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.addQuickExclusion()">
                                <i class="fas fa-plus"></i> Ajouter
                            </button>
                        </div>
                        
                        ${settings.categoryExclusions?.domains?.length > 0 || settings.categoryExclusions?.emails?.length > 0 ? `
                            <div class="exclusions-list">
                                <h4>Exclusions actives</h4>
                                ${settings.categoryExclusions.domains.map(domain => `
                                    <span class="exclusion-badge">
                                        <i class="fas fa-globe"></i> ${domain}
                                        <button onclick="window.categoriesPage.removeExclusion('domain', '${domain}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                                ${settings.categoryExclusions.emails.map(email => `
                                    <span class="exclusion-badge">
                                        <i class="fas fa-envelope"></i> ${email}
                                        <button onclick="window.categoriesPage.removeExclusion('email', '${email}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    // ================================================
    // INDICATEURS DE STATUT
    // ================================================
    checkSyncStatus(settings) {
        try {
            const expectedCategories = settings.taskPreselectedCategories || [];
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            return {
                isSync: emailScannerSync && categoryManagerSync,
                emailScannerSync,
                categoryManagerSync,
                expectedCategories,
                emailScannerCategories,
                categoryManagerCategories
            };
        } catch (error) {
            console.error('[CategoriesPage] Erreur check sync status:', error);
            return {
                isSync: false,
                emailScannerSync: false,
                categoryManagerSync: false,
                expectedCategories: [],
                emailScannerCategories: [],
                categoryManagerCategories: []
            };
        }
    }

    renderSyncStatusBar(syncStatus) {
        const statusColor = syncStatus.isSync ? '#10b981' : '#f59e0b';
        const statusIcon = syncStatus.isSync ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const statusText = syncStatus.isSync ? 
            `Synchronisé - ${syncStatus.expectedCategories.length} catégorie(s) pré-sélectionnée(s)` :
            'Désynchronisation détectée';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i> 
                État synchronisation: ${statusText}
                ${!syncStatus.isSync ? `
                    <button onclick="window.categoriesPage.forceSynchronization()" 
                            style="margin-left: 12px; padding: 2px 8px; background: ${statusColor}; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                        Corriger
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAutomationSyncIndicator(preselectedCategories) {
        const syncStatus = this.checkSyncStatus({ taskPreselectedCategories: preselectedCategories });
        
        if (syncStatus.isSync) {
            return `
                <div class="sync-indicator sync-ok">
                    <i class="fas fa-check-circle"></i>
                    <span>Synchronisation OK - ${preselectedCategories.length} catégorie(s) active(s)</span>
                </div>
            `;
        } else {
            return `
                <div class="sync-indicator sync-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Désynchronisation détectée - Correction automatique en cours</span>
                    <button class="btn-fix-sync-small" onclick="window.categoriesPage.forceSynchronization()">
                        <i class="fas fa-sync"></i> Corriger
                    </button>
                </div>
            `;
        }
    }

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS
    // ================================================
    initializeEventListeners() {
        if (this.eventListenersSetup) {
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

            // Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            console.log(`[CategoriesPage] 🎯 Initialisation de ${categoryCheckboxes.length} checkboxes`);
            
            categoryCheckboxes.forEach((checkbox, index) => {
                console.log(`[CategoriesPage] 📋 Setup checkbox ${index}: value=${checkbox.value}, checked=${checkbox.checked}, name=${checkbox.dataset.categoryName}`);
                
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('click', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('input', this.updateTaskPreselectedCategories);
                
                const handlerChange = (event) => {
                    console.log(`[CategoriesPage] 🔔 CHANGE détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    this.updateTaskPreselectedCategories();
                };
                
                const handlerClick = (event) => {
                    console.log(`[CategoriesPage] 🔔 CLICK détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    setTimeout(() => {
                        this.updateTaskPreselectedCategories();
                    }, 10);
                };
                
                checkbox.addEventListener('change', handlerChange);
                checkbox.addEventListener('click', handlerClick);
                
                checkbox._changeHandler = handlerChange;
                checkbox._clickHandler = handlerClick;
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

            this.eventListenersSetup = true;
            console.log('[CategoriesPage] ✅ Événements initialisés');
            
            setTimeout(() => {
                this.verifyCheckboxState();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    // ================================================
    // VÉRIFICATION DE L'ÉTAT DES CHECKBOXES
    // ================================================
    verifyCheckboxState() {
        console.log('[CategoriesPage] 🔍 Vérification état des checkboxes...');
        
        const settings = this.loadSettings();
        const expectedSelected = settings.taskPreselectedCategories || [];
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        
        let mismatches = 0;
        
        checkboxes.forEach((checkbox, index) => {
            const shouldBeChecked = expectedSelected.includes(checkbox.value);
            const isChecked = checkbox.checked;
            
            if (shouldBeChecked !== isChecked) {
                console.log(`[CategoriesPage] ⚠️ Mismatch checkbox ${index}: value=${checkbox.value}, shouldBe=${shouldBeChecked}, is=${isChecked}`);
                checkbox.checked = shouldBeChecked;
                mismatches++;
            }
        });
        
        if (mismatches > 0) {
            console.log(`[CategoriesPage] 🔧 ${mismatches} checkboxes corrigées`);
            this.updateSelectionIndicators(expectedSelected);
        } else {
            console.log('[CategoriesPage] ✅ Tous les checkboxes sont dans le bon état');
        }
    }

    // ================================================
    // NAVIGATION ENTRE ONGLETS
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
            
            document.querySelectorAll('.tab-button-compact').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.tab-button-compact[onclick*="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
            
            setTimeout(() => {
                this.initializeEventListeners();
                
                if (tab === 'automation') {
                    setTimeout(() => {
                        const currentCategories = settings.taskPreselectedCategories || [];
                        this.verifySynchronization(currentCategories);
                    }, 200);
                }
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur changement onglet:', error);
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
            const statSync = document.getElementById('stat-sync');
            
            if (statCategories) {
                statCategories.textContent = settings.taskPreselectedCategories?.length || 0;
            }
            if (statExclusions) {
                statExclusions.textContent = (settings.categoryExclusions?.domains?.length || 0) + (settings.categoryExclusions?.emails?.length || 0);
            }
            if (statAutomation) {
                statAutomation.textContent = Object.values(settings.automationSettings || {}).filter(Boolean).length;
            }
            if (statSync) {
                const syncStatus = this.checkSyncStatus(settings);
                statSync.textContent = syncStatus.isSync ? '✅' : '⚠️';
            }
            
            const syncIndicator = document.getElementById('automation-sync-indicator');
            if (syncIndicator) {
                syncIndicator.innerHTML = this.renderAutomationSyncIndicator(settings.taskPreselectedCategories || []);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur updateAutomationStats:', error);
        }
    }

    refreshCurrentTab() {
        try {
            const tabContent = document.getElementById('tabContent');
            const settings = this.loadSettings();
            const moduleStatus = this.checkModuleAvailability();
            
            if (tabContent) {
                tabContent.innerHTML = this.renderTabContent(settings, moduleStatus);
                
                this.eventListenersSetup = false;
                setTimeout(() => {
                    this.initializeEventListeners();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur refreshCurrentTab:', error);
        }
    }

    // ================================================
    // MÉTHODES DE GESTION DES CATÉGORIES
    // ================================================
    showCreateCategoryModal() {
        // Implémenter l'affichage du modal de création
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    editCustomCategory(categoryId) {
        // Implémenter l'édition
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    deleteCustomCategory(categoryId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie personnalisée ?')) {
            try {
                window.categoryManager?.deleteCustomCategory(categoryId);
                this.refreshCurrentTab();
                this.showToast('Catégorie supprimée', 'success');
            } catch (error) {
                console.error('[CategoriesPage] Erreur suppression catégorie:', error);
                this.showToast('Erreur lors de la suppression', 'error');
            }
        }
    }

    openKeywordsModal(categoryId) {
        // Implémenter l'ouverture du modal de mots-clés
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    openAllKeywordsModal() {
        // Implémenter l'affichage de tous les mots-clés
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    openExclusionsModal() {
        // Implémenter la gestion des exclusions
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    addQuickExclusion() {
        const input = document.getElementById('quick-exclusion-input');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const settings = this.loadSettings();
        
        if (!settings.categoryExclusions) {
            settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        if (value.includes('@')) {
            if (!settings.categoryExclusions.emails.includes(value)) {
                settings.categoryExclusions.emails.push(value);
            }
        } else {
            if (!settings.categoryExclusions.domains.includes(value)) {
                settings.categoryExclusions.domains.push(value);
            }
        }
        
        this.saveSettings(settings);
        input.value = '';
        
        this.refreshCurrentTab();
        this.showToast('Exclusion ajoutée', 'success');
    }

    removeExclusion(type, value) {
        const settings = this.loadSettings();
        
        if (type === 'domain') {
            settings.categoryExclusions.domains = settings.categoryExclusions.domains.filter(d => d !== value);
        } else {
            settings.categoryExclusions.emails = settings.categoryExclusions.emails.filter(e => e !== value);
        }
        
        this.saveSettings(settings);
        this.refreshCurrentTab();
        this.showToast('Exclusion supprimée', 'success');
    }

    exportSettings() {
        try {
            const settings = this.loadSettings();
            const data = JSON.stringify(settings, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `email-manager-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('Paramètres exportés', 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const settings = JSON.parse(text);
                
                if (confirm('Voulez-vous remplacer tous vos paramètres actuels ?')) {
                    this.saveSettings(settings);
                    this.refreshCurrentTab();
                    this.showToast('Paramètres importés avec succès', 'success');
                }
            } catch (error) {
                console.error('[CategoriesPage] Erreur import:', error);
                this.showToast('Erreur lors de l\'import', 'error');
            }
        };
        
        input.click();
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    debugSettings() {
        const settings = this.loadSettings();
        const moduleStatus = this.checkModuleAvailability();
        const syncStatus = this.checkSyncStatus(settings);
        
        console.log('\n=== DEBUG SETTINGS COMPLET ===');
        console.log('Settings complets:', settings);
        console.log('Status des modules:', moduleStatus);
        console.log('Status synchronisation:', syncStatus);
        console.log('CategoryManager settings:', window.categoryManager?.getSettings());
        console.log('EmailScanner settings:', window.emailScanner?.settings);
        console.log('EmailScanner taskPreselectedCategories:', window.emailScanner?.getTaskPreselectedCategories());
        console.log('Task preselected categories (CategoriesPage):', settings.taskPreselectedCategories);
        console.log('Checkboxes actuelles:');
        
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach((cb, i) => {
            console.log(`  ${i}: value=${cb.value}, checked=${cb.checked}, name=${cb.dataset.categoryName}`);
        });
        
        console.log('État de synchronisation détaillé:');
        console.log('  - isSync:', syncStatus.isSync);
        console.log('  - emailScannerSync:', syncStatus.emailScannerSync);
        console.log('  - categoryManagerSync:', syncStatus.categoryManagerSync);
        console.log('  - expectedCategories:', syncStatus.expectedCategories);
        console.log('  - emailScannerCategories:', syncStatus.emailScannerCategories);
        console.log('  - categoryManagerCategories:', syncStatus.categoryManagerCategories);
        
        console.log('========================\n');
        
        this.showToast('Voir la console pour les détails de debug', 'info');
        return { settings, moduleStatus, syncStatus };
    }
    
    testCategorySelection() {
        console.log('\n=== TEST CATEGORY SELECTION COMPLET ===');
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        console.log(`Trouvé ${checkboxes.length} checkboxes avec classe .category-preselect-checkbox`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`Checkbox ${index}:`);
            console.log(`  - Value: ${checkbox.value}`);
            console.log(`  - Checked: ${checkbox.checked}`);
            console.log(`  - Data name: ${checkbox.dataset.categoryName}`);
            console.log(`  - Has change handler: ${!!checkbox._changeHandler}`);
            console.log(`  - Has click handler: ${!!checkbox._clickHandler}`);
        });
        
        const categories = window.categoryManager?.getCategories() || {};
        console.log('Catégories disponibles:', Object.keys(categories));
        
        const settings = this.loadSettings();
        console.log('Catégories pré-sélectionnées dans les settings:', settings.taskPreselectedCategories);
        
        const syncStatus = this.checkSyncStatus(settings);
        console.log('État de synchronisation:', syncStatus);
        console.log('================================\n');
        
        this.showToast('Test terminé - voir console', 'info');
        return { checkboxes: checkboxes.length, categories: Object.keys(categories), syncStatus };
    }
    
    forceUpdateUI() {
        console.log('[CategoriesPage] 🔄 Force update UI avec synchronisation...');
        
        this.forceSynchronization();
        
        this.eventListenersSetup = false;
        setTimeout(() => {
            this.refreshCurrentTab();
        }, 200);
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
        const settings = this.loadSettings();
        const categories = settings.taskPreselectedCategories || [];
        console.log('[CategoriesPage] 📊 getTaskPreselectedCategories appelé:', categories);
        return categories;
    }
    
    shouldExcludeSpam() {
        return this.loadSettings().preferences?.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        return this.loadSettings().preferences?.detectCC !== false;
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles de base */
            .settings-page-compact {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .page-header-compact {
                margin-bottom: 25px;
            }
            
            .page-header-compact h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            /* Boutons compacts */
            .btn-compact {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                border: 1px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-compact.btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            
            .btn-compact.btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
            }
            
            .btn-compact.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
            }
            
            .btn-compact.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #d1d5db;
            }
            
            .btn-compact.btn-danger {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }
            
            .btn-compact.btn-danger:hover {
                background: #fca5a5;
                color: #991b1b;
            }
            
            .btn-compact.btn-sm {
                padding: 4px 8px;
                font-size: 11px;
            }
            
            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 0;
            }
            
            .tab-button-compact {
                padding: 12px 20px;
                background: transparent;
                border: none;
                color: #6b7280;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tab-button-compact:hover {
                color: #374151;
            }
            
            .tab-button-compact.active {
                color: #3b82f6;
            }
            
            .tab-button-compact.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 2px;
                background: #3b82f6;
            }
            
            /* Contenu des onglets */
            .tab-content-compact {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Grilles et cartes */
            .settings-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
            }
            
            .settings-card-compact {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .settings-card-compact.full-width {
                grid-column: 1 / -1;
            }
            
            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
            }
            
            .card-header-compact i {
                font-size: 20px;
                color: #3b82f6;
            }
            
            .card-header-compact h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                flex: 1;
            }
            
            /* Formulaires */
            .settings-form-compact {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .form-group-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group-compact label {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            
            .form-input-compact,
            .form-select-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .form-input-compact:focus,
            .form-select-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* Toggle switches */
            .toggle-setting-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
            }
            
            .toggle-setting-compact input[type="checkbox"] {
                position: absolute;
                opacity: 0;
            }
            
            .toggle-slider-compact {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
                background: #e5e7eb;
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            
            .toggle-slider-compact::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .toggle-setting-compact input:checked + .toggle-slider-compact {
                background: #3b82f6;
            }
            
            .toggle-setting-compact input:checked + .toggle-slider-compact::after {
                transform: translateX(20px);
            }
            
            .toggle-label-compact {
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }
            
            /* Indicateurs de statut */
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

            .status-badge.status-error {
                background: #fee2e2;
                color: #991b1b;
            }
            
            /* Indicateurs de synchronisation */
            .automation-sync-indicator {
                margin: 16px 0;
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .sync-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
            }
            
            .sync-indicator.sync-ok {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #10b981;
            }
            
            .sync-indicator.sync-warning {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #f59e0b;
            }
            
            .btn-fix-sync-small {
                background: rgba(0, 0, 0, 0.1);
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: auto;
                transition: all 0.2s ease;
            }
            
            .btn-fix-sync-small:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: translateY(-1px);
            }
            
            /* Stat de synchronisation */
            .stat-item.sync-stat {
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .stat-item.sync-stat:hover {
                border-color: #3b82f6;
            }
            
            /* Animation pour les indicateurs sélectionnés */
            .selected-indicator {
                background: #667eea !important;
                color: white !important;
                border-color: #e9d5ff !important;
                animation: pulseSelection 2s infinite;
                font-size: 10px !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                margin-left: 8px !important;
                font-weight: 600 !important;
            }
            
            @keyframes pulseSelection {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
            
            /* Amélioration des checkboxes */
            .category-checkbox-item-enhanced {
                position: relative;
                transition: all 0.3s ease;
                cursor: pointer;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: white;
            }
            
            .category-checkbox-item-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-color: #3b82f6;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"] {
                position: absolute;
                opacity: 0;
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"]:checked + .category-checkbox-content-enhanced {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            
            .category-checkbox-content-enhanced {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .cat-icon-automation {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .cat-name-automation {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }
            
            .custom-badge {
                background: #f3e8ff;
                color: #7c3aed;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            /* Grille de sélection des catégories */
            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 16px;
            }
            
            /* Options d'automatisation */
            .automation-options-enhanced {
                margin-top: 32px;
            }
            
            .automation-options-enhanced h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }
            
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .checkbox-enhanced:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
            }
            
            .checkbox-enhanced input[type="checkbox"] {
                margin-top: 2px;
                cursor: pointer;
            }
            
            .checkbox-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .checkbox-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .checkbox-description {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* Statistiques */
            .automation-stats {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            .automation-stats h4 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
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
                padding: 16px;
                background: #f9fafb;
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
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            /* Onglet Catégories */
            .keywords-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .keywords-actions-bar {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .categories-grid-enhanced {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .category-card-enhanced {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.2s ease;
            }
            
            .category-card-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            
            .category-card-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .category-icon-large {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .category-info {
                flex: 1;
            }
            
            .category-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }
            
            .category-description {
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 16px;
                line-height: 1.5;
            }
            
            .keywords-summary {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .keyword-count {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #374151;
                font-weight: 500;
            }
            
            .keyword-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .keyword-badge.absolute {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .keyword-badge.strong {
                background: #fef3c7;
                color: #d97706;
            }
            
            .keyword-badge.weak {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .category-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            /* Exclusions */
            .quick-exclusion-section {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .quick-exclusion-section input {
                flex: 1;
            }
            
            .exclusions-list {
                margin-top: 16px;
            }
            
            .exclusions-list h4 {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .exclusion-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                margin: 4px;
            }
            
            .exclusion-badge button {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 0;
                font-size: 10px;
            }
            
            .exclusion-badge button:hover {
                color: #991b1b;
            }
            
            /* Import/Export */
            .import-export-section {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-grid-compact {
                    grid-template-columns: 1fr;
                }
                
                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }
                
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .categories-grid-enhanced {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
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

    checkModuleAvailability() {
        return {
            categoryManager: !!window.categoryManager,
            emailScanner: !!window.emailScanner,
            aiTaskAnalyzer: !!window.aiTaskAnalyzer,
            mailService: !!window.mailService,
            uiManager: !!window.uiManager
        };
    }

    renderModuleStatusBar(status) {
        const totalModules = Object.keys(status).length;
        const availableModules = Object.values(status).filter(Boolean).length;
        const statusColor = availableModules === totalModules ? '#10b981' : 
                           availableModules > totalModules / 2 ? '#f59e0b' : '#ef4444';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas fa-plug"></i> 
                Modules disponibles: ${availableModules}/${totalModules}
                ${availableModules < totalModules ? ' - Certaines fonctionnalités peuvent être limitées' : ' - Tous les modules chargés'}
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
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        checkboxes.forEach(checkbox => {
            if (checkbox._changeHandler) {
                checkbox.removeEventListener('change', checkbox._changeHandler);
            }
            if (checkbox._clickHandler) {
                checkbox.removeEventListener('click', checkbox._clickHandler);
            }
        });
        
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        console.log('[CategoriesPage] Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        console.log('[CategoriesPage] Instance détruite');
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
        
        console.log('✅ CategoriesPage v8.5 intégrée au PageManager');
    }
} catch (error) {
    console.error('[CategoriesPage] Erreur critique initialisation:', error);
}

console.log('✅ CategoriesPage v8.5 loaded - Complète avec toutes les méthodes');
