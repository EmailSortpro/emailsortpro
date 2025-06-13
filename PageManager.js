// CategoriesPage.js - Version 8.6 - Réparé avec méthodes manquantes

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
        
        console.log('[CategoriesPage] ✅ Version 8.6 - Réparé avec méthodes manquantes');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
            'showCreateCategoryModal', 'createNewCategory', 'editCustomCategory', 'deleteCustomCategory',
            'deleteExclusion', 'searchKeywords', 'clearSearch', 'addKeyword', 'deleteKeyword',
            'saveKeyword', 'editKeyword', 'cancelEdit', 'refreshCurrentTab',
            'renderTabContent', 'renderGeneralTab', 'renderAutomationTab', 'renderKeywordsTab'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // CHARGEMENT ET SAUVEGARDE DES PARAMÈTRES - SYNCHRONISÉ
    // ================================================
    loadSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            const settings = window.categoryManager.getSettings();
            console.log('[CategoriesPage] 📊 Settings chargés depuis CategoryManager:', settings);
            return settings;
        }
        
        // Fallback si CategoryManager n'est pas disponible
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

    saveSettings(newSettings) {
        console.log('[CategoriesPage] 💾 === DÉBUT SAUVEGARDE SETTINGS ===');
        console.log('[CategoriesPage] 📥 Nouveaux settings à sauvegarder:', newSettings);
        
        if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
            console.log('[CategoriesPage] 🎯 Sauvegarde via CategoryManager');
            window.categoryManager.updateSettings(newSettings);
        } else {
            console.log('[CategoriesPage] 🔄 Fallback sauvegarde localStorage');
            // Fallback
            try {
                localStorage.setItem('categorySettings', JSON.stringify(newSettings));
                
                // Dispatch manual event si CategoryManager n'est pas disponible
                setTimeout(() => {
                    this.dispatchEvent('categorySettingsChanged', { settings: newSettings });
                }, 10);
            } catch (error) {
                console.error('[CategoriesPage] Erreur sauvegarde paramètres:', error);
            }
        }
        
        // Forcer la synchronisation après sauvegarde
        setTimeout(() => {
            this.forceSynchronization();
        }, 50);
        
        console.log('[CategoriesPage] ✅ === FIN SAUVEGARDE SETTINGS ===');
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
            // 1. Charger les paramètres actuels
            const currentSettings = this.loadSettings();
            console.log('[CategoriesPage] 📊 Settings actuels:', currentSettings);
            
            // 2. Forcer la synchronisation de tous les modules
            this.syncAllModules(currentSettings);
            
            // 3. Dispatcher l'événement de synchronisation globale
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
            
            // Traiter la synchronisation en attente
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
        
        // Synchroniser EmailScanner
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
        
        // Synchroniser AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            console.log('[CategoriesPage] 🤖 Synchronisation AITaskAnalyzer');
            
            if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                window.aiTaskAnalyzer.updatePreselectedCategories(settings.taskPreselectedCategories || []);
            }
            
            if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                window.aiTaskAnalyzer.updateAutomationSettings(settings.automationSettings || {});
            }
        }
        
        // Synchroniser PageManager
        if (window.pageManager) {
            console.log('[CategoriesPage] 📄 Notification PageManager');
            // Le PageManager sera notifié via l'événement forceSynchronization
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS
    // ================================================
    notifySettingsChange(settingType, value) {
        const now = Date.now();
        
        // Éviter les notifications en boucle (max 1 par seconde par type)
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
        
        // Dispatching d'événement global avec délai pour éviter les conflits
        setTimeout(() => {
            this.dispatchEvent('settingsChanged', {
                type: settingType, 
                value: value,
                source: 'CategoriesPage',
                timestamp: now
            });
        }, 10);
        
        // Notifications spécialisées pour les modules avec vérification
        this.notifySpecificModules(settingType, value);
        
        // Forcer la synchronisation après notification
        setTimeout(() => {
            this.forceSynchronization();
        }, 100);
    }

    notifySpecificModules(settingType, value) {
        console.log(`[CategoriesPage] 🎯 Notification spécialisée pour: ${settingType}`);
        
        // EmailScanner
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
        
        // AITaskAnalyzer
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
            
            // Vérifier si il y a vraiment un changement
            const oldCategories = settings.taskPreselectedCategories || [];
            const hasChanged = JSON.stringify([...selectedCategories].sort()) !== JSON.stringify([...oldCategories].sort());
            
            if (!hasChanged) {
                console.log('[CategoriesPage] 🔄 Aucun changement détecté, skip mise à jour');
                return;
            }
            
            console.log('[CategoriesPage] 📝 Changement détecté, mise à jour en cours...');
            
            // Mettre à jour les settings
            settings.taskPreselectedCategories = selectedCategories;
            this.saveSettings(settings);
            
            console.log('[CategoriesPage] 💾 Paramètres sauvegardés avec nouvelles catégories');
            
            // Notification immédiate et forcée
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            // Mise à jour immédiate de l'interface
            this.updateSelectionIndicators(selectedCategories);
            
            // Toast avec détails
            const categoryNames = selectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? category.name : catId;
            });
            
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s): ${categoryNames.join(', ')}`, 'success', 4000);
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] 🎯 === FIN updateTaskPreselectedCategories ===');
            
            // Vérification de synchronisation après 1 seconde
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
            // Vérifier EmailScanner
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            const emailScannerSync = JSON.stringify([...emailScannerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            // Vérifier CategoryManager
            const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
            const categoryManagerSync = JSON.stringify([...categoryManagerCategories].sort()) === JSON.stringify([...expectedCategories].sort());
            
            console.log('[CategoriesPage] 📊 État de synchronisation:');
            console.log('  - Attendu:', expectedCategories);
            console.log('  - EmailScanner:', emailScannerCategories, emailScannerSync ? '✅' : '❌');
            console.log('  - CategoryManager:', categoryManagerCategories, categoryManagerSync ? '✅' : '❌');
            
            if (!emailScannerSync || !categoryManagerSync) {
                console.log('[CategoriesPage] ⚠️ Désynchronisation détectée, re-synchronisation...');
                this.forceSynchronization();
                
                // Montrer un indicateur visuel
                this.showSyncStatus(false);
                
                // Re-vérifier après 2 secondes
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
        // Mettre à jour les badges "Sélectionné" en temps réel
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
        // Créer ou mettre à jour l'indicateur de synchronisation
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
            
            // Masquer après 3 secondes
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
            // Vérifier la disponibilité des modules
            const moduleStatus = this.checkModuleAvailability();
            const settings = this.loadSettings();
            
            // Vérifier l'état de synchronisation
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
    // MÉTHODES DE RENDU DES ONGLETS
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

    renderGeneralTab(settings, moduleStatus) {
        return `
            <div class="settings-grid-compact">
                <!-- Préférences d'affichage -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-desktop"></i>
                        <h3>Affichage</h3>
                    </div>
                    <div class="settings-form-compact">
                        <label class="setting-item-compact">
                            <input type="checkbox" id="darkMode" 
                                   ${settings.preferences?.darkMode ? 'checked' : ''}>
                            <span>Mode sombre</span>
                        </label>
                        <label class="setting-item-compact">
                            <input type="checkbox" id="compactView" 
                                   ${settings.preferences?.compactView ? 'checked' : ''}>
                            <span>Vue compacte</span>
                        </label>
                        <label class="setting-item-compact">
                            <input type="checkbox" id="showNotifications" 
                                   ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                            <span>Afficher les notifications</span>
                        </label>
                    </div>
                </div>

                <!-- Paramètres de scan -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-search"></i>
                        <h3>Scanner</h3>
                    </div>
                    <div class="settings-form-compact">
                        <div class="setting-group-compact">
                            <label for="defaultScanPeriod">Période par défaut</label>
                            <select id="defaultScanPeriod" class="select-compact">
                                <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                            </select>
                        </div>
                        <div class="setting-group-compact">
                            <label for="defaultFolder">Dossier par défaut</label>
                            <select id="defaultFolder" class="select-compact">
                                <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                <option value="archive" ${settings.scanSettings?.defaultFolder === 'archive' ? 'selected' : ''}>Archives</option>
                                <option value="sentitems" ${settings.scanSettings?.defaultFolder === 'sentitems' ? 'selected' : ''}>Éléments envoyés</option>
                            </select>
                        </div>
                        <label class="setting-item-compact">
                            <input type="checkbox" id="autoAnalyze" 
                                   ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                            <span>Analyse IA automatique</span>
                        </label>
                        <label class="setting-item-compact">
                            <input type="checkbox" id="autoCategrize" 
                                   ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                            <span>Catégorisation automatique</span>
                        </label>
                    </div>
                </div>

                <!-- Filtres -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-filter"></i>
                        <h3>Filtres</h3>
                    </div>
                    <div class="settings-form-compact">
                        <label class="setting-item-compact">
                            <input type="checkbox" id="excludeSpam" 
                                   ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                            <span>Exclure le spam</span>
                        </label>
                        <label class="setting-item-compact">
                            <input type="checkbox" id="detectCC" 
                                   ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                            <span>Détecter les CC/CCI</span>
                        </label>
                    </div>
                </div>

                <!-- Import/Export -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-file-export"></i>
                        <h3>Données</h3>
                    </div>
                    <div class="settings-form-compact">
                        <div class="button-group-compact">
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.exportSettings()">
                                <i class="fas fa-download"></i> Exporter
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importSettings()">
                                <i class="fas fa-upload"></i> Importer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

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

    renderKeywordsTab(settings, moduleStatus) {
        const categories = window.categoryManager?.getCategories() || {};
        const exclusions = settings.categoryExclusions || { domains: [], emails: [] };
        
        return `
            <div class="keywords-tab-layout">
                <!-- Barre de recherche -->
                <div class="search-bar-compact">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           id="keyword-search" 
                           placeholder="Rechercher dans les mots-clés..." 
                           value="${this.searchTerm}"
                           onkeyup="window.categoriesPage.searchKeywords(this.value)">
                    ${this.searchTerm ? 
                        `<button class="clear-search" onclick="window.categoriesPage.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>` : ''
                    }
                </div>

                <!-- Section des exclusions -->
                <div class="settings-card-compact full-width">
                    <div class="card-header-compact">
                        <i class="fas fa-ban"></i>
                        <h3>Exclusions rapides</h3>
                    </div>
                    <p>Ajoutez des domaines ou emails à exclure de la catégorisation automatique.</p>
                    
                    <div class="quick-exclusion-form">
                        <input type="text" 
                               id="quick-exclusion-input" 
                               placeholder="exemple.com ou email@exemple.com"
                               class="input-compact">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.addQuickExclusion()">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                    
                    <div class="exclusions-list">
                        ${exclusions.domains.length > 0 || exclusions.emails.length > 0 ? `
                            <h4>Exclusions actives</h4>
                            <div class="exclusion-items">
                                ${exclusions.domains.map(domain => `
                                    <span class="exclusion-item">
                                        <i class="fas fa-globe"></i> ${domain}
                                        <button onclick="window.categoriesPage.deleteExclusion('domains', '${domain}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                                ${exclusions.emails.map(email => `
                                    <span class="exclusion-item">
                                        <i class="fas fa-envelope"></i> ${email}
                                        <button onclick="window.categoriesPage.deleteExclusion('emails', '${email}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        ` : '<p class="empty-message">Aucune exclusion configurée</p>'}
                    </div>
                </div>

                <!-- Gestion des catégories -->
                <div class="settings-card-compact full-width">
                    <div class="card-header-compact">
                        <i class="fas fa-tags"></i>
                        <h3>Gestion des catégories</h3>
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Nouvelle catégorie
                        </button>
                    </div>
                    
                    <div class="categories-manager-grid">
                        ${Object.entries(categories).map(([id, category]) => {
                            const keywordCount = Object.values(category.patterns || {}).flat().length;
                            return `
                                <div class="category-manager-card ${!settings.activeCategories || settings.activeCategories.includes(id) ? 'active' : 'inactive'}">
                                    <div class="category-header">
                                        <span class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                                            ${category.icon}
                                        </span>
                                        <h4>${category.name}</h4>
                                        ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                    </div>
                                    
                                    <div class="category-stats">
                                        <span><i class="fas fa-key"></i> ${keywordCount} mots-clés</span>
                                        <span><i class="fas fa-sort-amount-up"></i> Priorité: ${category.priority || 50}</span>
                                    </div>
                                    
                                    <div class="category-actions">
                                        <button class="btn-compact btn-secondary" 
                                                onclick="window.categoriesPage.openKeywordsModal('${id}')">
                                            <i class="fas fa-edit"></i> Mots-clés
                                        </button>
                                        ${category.isCustom ? `
                                            <button class="btn-compact btn-secondary" 
                                                    onclick="window.categoriesPage.editCustomCategory('${id}')">
                                                <i class="fas fa-cog"></i> Modifier
                                            </button>
                                            <button class="btn-compact btn-danger" 
                                                    onclick="window.categoriesPage.deleteCustomCategory('${id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                        <button class="btn-compact ${!settings.activeCategories || settings.activeCategories.includes(id) ? 'btn-success' : 'btn-secondary'}" 
                                                onclick="window.categoriesPage.toggleCategory('${id}')">
                                            <i class="fas ${!settings.activeCategories || settings.activeCategories.includes(id) ? 'fa-check' : 'fa-times'}"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.openAllKeywordsModal()">
                            <i class="fas fa-list"></i> Voir tous les mots-clés
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openExclusionsModal()">
                            <i class="fas fa-shield-alt"></i> Gérer les exclusions
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES DE VÉRIFICATION
    // ================================================
    checkModuleAvailability() {
        return {
            categoryManager: !!window.categoryManager,
            emailScanner: !!window.emailScanner,
            aiTaskAnalyzer: !!window.aiTaskAnalyzer,
            pageManager: !!window.pageManager
        };
    }

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

    renderModuleStatusBar(moduleStatus) {
        const allGood = Object.values(moduleStatus).every(status => status);
        const statusColor = allGood ? '#10b981' : '#f59e0b';
        const statusIcon = allGood ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const statusText = allGood ? 'Tous les modules sont opérationnels' : 'Certains modules sont indisponibles';
        
        return `
            <div style="background: ${statusColor}20; border: 1px solid ${statusColor}; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: ${statusColor};">
                <i class="fas ${statusIcon}"></i> 
                ${statusText}
                <button onclick="window.categoriesPage.debugSettings()" 
                        style="margin-left: 12px; padding: 2px 8px; background: ${statusColor}; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                    Détails
                </button>
            </div>
        `;
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

    renderErrorState(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement des paramètres</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.categoriesPage.forceUpdateUI()">
                    Réessayer
                </button>
                <button class="btn btn-secondary" onclick="window.location.reload()">
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // GESTION DES EXCLUSIONS
    // ================================================
    addQuickExclusion() {
        const input = document.getElementById('quick-exclusion-input');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const settings = this.loadSettings();
        
        if (!settings.categoryExclusions) {
            settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        // Déterminer si c'est un email ou un domaine
        if (value.includes('@')) {
            if (!settings.categoryExclusions.emails.includes(value)) {
                settings.categoryExclusions.emails.push(value);
                this.showToast(`Email ${value} ajouté aux exclusions`, 'success');
            }
        } else {
            if (!settings.categoryExclusions.domains.includes(value)) {
                settings.categoryExclusions.domains.push(value);
                this.showToast(`Domaine ${value} ajouté aux exclusions`, 'success');
            }
        }
        
        this.saveSettings(settings);
        input.value = '';
        this.refreshCurrentTab();
    }

    deleteExclusion(type, value) {
        const settings = this.loadSettings();
        
        if (settings.categoryExclusions && settings.categoryExclusions[type]) {
            const index = settings.categoryExclusions[type].indexOf(value);
            if (index > -1) {
                settings.categoryExclusions[type].splice(index, 1);
                this.saveSettings(settings);
                this.showToast('Exclusion supprimée', 'success');
                this.refreshCurrentTab();
            }
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        
        if (!settings.activeCategories) {
            // Si pas défini, toutes les catégories sont actives par défaut
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            settings.activeCategories = allCategories.filter(id => id !== categoryId);
        } else {
            const index = settings.activeCategories.indexOf(categoryId);
            if (index > -1) {
                settings.activeCategories.splice(index, 1);
            } else {
                settings.activeCategories.push(categoryId);
            }
        }
        
        this.saveSettings(settings);
        this.notifySettingsChange('activeCategories', settings.activeCategories);
        this.showToast('Catégorie mise à jour', 'success');
        this.refreshCurrentTab();
    }

    // ================================================
    // MODALES
    // ================================================
    openKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-compact">
                <div class="modal-header">
                    <h3>
                        <span style="background: ${category.color}20; color: ${category.color}; padding: 4px 8px; border-radius: 6px;">
                            ${category.icon} ${category.name}
                        </span>
                    </h3>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="keywords-editor">
                        ${Object.entries(category.patterns || {}).map(([type, keywords]) => `
                            <div class="keyword-group">
                                <h4>${this.getPatternTypeLabel(type)}</h4>
                                <div class="keywords-list">
                                    ${keywords.map((keyword, index) => `
                                        <div class="keyword-item ${this.editingKeyword === `${categoryId}-${type}-${index}` ? 'editing' : ''}">
                                            ${this.editingKeyword === `${categoryId}-${type}-${index}` ? `
                                                <input type="text" 
                                                       id="edit-keyword-input"
                                                       value="${keyword}" 
                                                       onkeypress="if(event.key === 'Enter') window.categoriesPage.saveKeyword('${categoryId}', '${type}', ${index})"
                                                       autofocus>
                                                <button class="btn-icon save" onclick="window.categoriesPage.saveKeyword('${categoryId}', '${type}', ${index})">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                                <button class="btn-icon cancel" onclick="window.categoriesPage.cancelEdit()">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            ` : `
                                                <span>${keyword}</span>
                                                <div class="keyword-actions">
                                                    <button class="btn-icon edit" onclick="window.categoriesPage.editKeyword('${categoryId}', '${type}', ${index})">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn-icon delete" onclick="window.categoriesPage.deleteKeyword('${categoryId}', '${type}', ${index})">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            `}
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-keyword-form">
                                    <input type="text" 
                                           placeholder="Nouveau mot-clé ${type}"
                                           id="new-keyword-${type}"
                                           onkeypress="if(event.key === 'Enter') window.categoriesPage.addKeyword('${categoryId}', '${type}')">
                                    <button class="btn-compact btn-primary" onclick="window.categoriesPage.addKeyword('${categoryId}', '${type}')">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    openAllKeywordsModal() {
        const categories = window.categoryManager?.getCategories() || {};
        const allKeywords = [];
        
        Object.entries(categories).forEach(([catId, category]) => {
            Object.entries(category.patterns || {}).forEach(([type, keywords]) => {
                keywords.forEach(keyword => {
                    allKeywords.push({
                        categoryId: catId,
                        categoryName: category.name,
                        categoryIcon: category.icon,
                        categoryColor: category.color,
                        type: type,
                        keyword: keyword
                    });
                });
            });
        });
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-large">
                <div class="modal-header">
                    <h3>Tous les mots-clés (${allKeywords.length})</h3>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="all-keywords-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Catégorie</th>
                                    <th>Type</th>
                                    <th>Mot-clé</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allKeywords.map(item => `
                                    <tr>
                                        <td>
                                            <span style="background: ${item.categoryColor}20; color: ${item.categoryColor}; padding: 4px 8px; border-radius: 6px;">
                                                ${item.categoryIcon} ${item.categoryName}
                                            </span>
                                        </td>
                                        <td>${this.getPatternTypeLabel(item.type)}</td>
                                        <td>${item.keyword}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    openExclusionsModal() {
        const settings = this.loadSettings();
        const exclusions = settings.categoryExclusions || { domains: [], emails: [] };
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-compact">
                <div class="modal-header">
                    <h3>Gestion des exclusions</h3>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="exclusions-manager">
                        <div class="exclusion-section">
                            <h4><i class="fas fa-globe"></i> Domaines exclus</h4>
                            <div class="exclusion-list-modal">
                                ${exclusions.domains.length > 0 ? 
                                    exclusions.domains.map(domain => `
                                        <div class="exclusion-item-modal">
                                            <span>${domain}</span>
                                            <button onclick="window.categoriesPage.deleteExclusion('domains', '${domain}'); window.categoriesPage.closeModal(); window.categoriesPage.openExclusionsModal();">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('') : 
                                    '<p class="empty-message">Aucun domaine exclu</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="exclusion-section">
                            <h4><i class="fas fa-envelope"></i> Emails exclus</h4>
                            <div class="exclusion-list-modal">
                                ${exclusions.emails.length > 0 ? 
                                    exclusions.emails.map(email => `
                                        <div class="exclusion-item-modal">
                                            <span>${email}</span>
                                            <button onclick="window.categoriesPage.deleteExclusion('emails', '${email}'); window.categoriesPage.closeModal(); window.categoriesPage.openExclusionsModal();">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('') : 
                                    '<p class="empty-message">Aucun email exclu</p>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        this.editingKeyword = null;
    }

    // ================================================
    // GESTION DES MOTS-CLÉS
    // ================================================
    addKeyword(categoryId, type) {
        const input = document.getElementById(`new-keyword-${type}`);
        if (!input || !input.value.trim()) return;
        
        const keyword = input.value.trim();
        
        if (window.categoryManager) {
            window.categoryManager.addKeyword(categoryId, type, keyword);
            this.showToast('Mot-clé ajouté', 'success');
            this.closeModal();
            this.openKeywordsModal(categoryId);
        }
    }

    deleteKeyword(categoryId, type, index) {
        if (confirm('Supprimer ce mot-clé ?')) {
            if (window.categoryManager) {
                window.categoryManager.removeKeyword(categoryId, type, index);
                this.showToast('Mot-clé supprimé', 'success');
                this.closeModal();
                this.openKeywordsModal(categoryId);
            }
        }
    }

    editKeyword(categoryId, type, index) {
        this.editingKeyword = `${categoryId}-${type}-${index}`;
        this.closeModal();
        this.openKeywordsModal(categoryId);
    }

    saveKeyword(categoryId, type, index) {
        const input = document.getElementById('edit-keyword-input');
        if (!input || !input.value.trim()) return;
        
        const newKeyword = input.value.trim();
        
        if (window.categoryManager) {
            window.categoryManager.updateKeyword(categoryId, type, index, newKeyword);
            this.showToast('Mot-clé mis à jour', 'success');
            this.editingKeyword = null;
            this.closeModal();
            this.openKeywordsModal(categoryId);
        }
    }

    cancelEdit() {
        this.editingKeyword = null;
        const categoryId = this.editingKeyword?.split('-')[0];
        if (categoryId) {
            this.closeModal();
            this.openKeywordsModal(categoryId);
        }
    }

    searchKeywords(value) {
        this.searchTerm = value || '';
        this.refreshCurrentTab();
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('keyword-search');
        if (searchInput) {
            searchInput.value = '';
        }
        this.refreshCurrentTab();
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    showCreateCategoryModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-compact">
                <div class="modal-header">
                    <h3>Nouvelle catégorie personnalisée</h3>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nom de la catégorie</label>
                        <input type="text" id="new-category-name" class="input-compact" placeholder="Ex: Important">
                    </div>
                    <div class="form-group">
                        <label>Icône</label>
                        <input type="text" id="new-category-icon" class="input-compact" placeholder="Ex: ⭐" value="📂">
                    </div>
                    <div class="form-group">
                        <label>Couleur</label>
                        <input type="color" id="new-category-color" class="input-compact" value="#667eea">
                    </div>
                    <div class="form-group">
                        <label>Priorité (1-100)</label>
                        <input type="number" id="new-category-priority" class="input-compact" value="50" min="1" max="100">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.createNewCategory()">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    createNewCategory() {
        const name = document.getElementById('new-category-name')?.value.trim();
        const icon = document.getElementById('new-category-icon')?.value.trim() || '📂';
        const color = document.getElementById('new-category-color')?.value || '#667eea';
        const priority = parseInt(document.getElementById('new-category-priority')?.value || '50');
        
        if (!name) {
            this.showToast('Le nom est requis', 'error');
            return;
        }
        
        if (window.categoryManager) {
            const id = name.toLowerCase().replace(/\s+/g, '_');
            const success = window.categoryManager.addCustomCategory({
                id,
                name,
                icon,
                color,
                priority,
                isCustom: true,
                patterns: {
                    subject: [],
                    body: [],
                    sender: [],
                    absolute: []
                }
            });
            
            if (success) {
                this.showToast(`Catégorie "${name}" créée`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
            } else {
                this.showToast('Erreur lors de la création', 'error');
            }
        }
    }

    editCustomCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-compact">
                <div class="modal-header">
                    <h3>Modifier la catégorie</h3>
                    <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nom de la catégorie</label>
                        <input type="text" id="edit-category-name" class="input-compact" value="${category.name}">
                    </div>
                    <div class="form-group">
                        <label>Icône</label>
                        <input type="text" id="edit-category-icon" class="input-compact" value="${category.icon}">
                    </div>
                    <div class="form-group">
                        <label>Couleur</label>
                        <input type="color" id="edit-category-color" class="input-compact" value="${category.color}">
                    </div>
                    <div class="form-group">
                        <label>Priorité (1-100)</label>
                        <input type="number" id="edit-category-priority" class="input-compact" value="${category.priority || 50}" min="1" max="100">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.updateCustomCategory('${categoryId}')">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateCustomCategory(categoryId) {
        const name = document.getElementById('edit-category-name')?.value.trim();
        const icon = document.getElementById('edit-category-icon')?.value.trim();
        const color = document.getElementById('edit-category-color')?.value;
        const priority = parseInt(document.getElementById('edit-category-priority')?.value || '50');
        
        if (!name) {
            this.showToast('Le nom est requis', 'error');
            return;
        }
        
        if (window.categoryManager) {
            const success = window.categoryManager.updateCustomCategory(categoryId, {
                name,
                icon,
                color,
                priority
            });
            
            if (success) {
                this.showToast('Catégorie mise à jour', 'success');
                this.closeModal();
                this.refreshCurrentTab();
            } else {
                this.showToast('Erreur lors de la mise à jour', 'error');
            }
        }
    }

    deleteCustomCategory(categoryId) {
        if (confirm('Supprimer cette catégorie personnalisée ? Cette action est irréversible.')) {
            if (window.categoryManager) {
                const success = window.categoryManager.deleteCustomCategory(categoryId);
                
                if (success) {
                    this.showToast('Catégorie supprimée', 'success');
                    this.refreshCurrentTab();
                } else {
                    this.showToast('Erreur lors de la suppression', 'error');
                }
            }
        }
    }

    // ================================================
    // IMPORT/EXPORT
    // ================================================
    exportSettings() {
        const settings = this.loadSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `email-organizer-settings_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Paramètres exportés', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
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

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS
    // ================================================
    initializeEventListeners() {
        if (this.eventListenersSetup) {
            return; // Éviter les doublons
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
                
                // Retirer TOUS les anciens listeners
                checkbox.removeEventListener('change', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('click', this.updateTaskPreselectedCategories);
                checkbox.removeEventListener('input', this.updateTaskPreselectedCategories);
                
                // Ajouter MULTIPLES listeners pour s'assurer de capturer l'événement
                const handlerChange = (event) => {
                    console.log(`[CategoriesPage] 🔔 CHANGE détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    this.updateTaskPreselectedCategories();
                };
                
                const handlerClick = (event) => {
                    console.log(`[CategoriesPage] 🔔 CLICK détecté sur checkbox: ${event.target.value}, checked: ${event.target.checked}`);
                    // Petit délai pour que le checked soit mis à jour
                    setTimeout(() => {
                        this.updateTaskPreselectedCategories();
                    }, 10);
                };
                
                checkbox.addEventListener('change', handlerChange);
                checkbox.addEventListener('click', handlerClick);
                
                // Stocker les handlers pour le nettoyage
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
            
            // Vérifier immédiatement l'état des checkboxes
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
                
                // Si on va sur l'onglet automatisation, vérifier immédiatement la synchronisation
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
            
            // Mettre à jour l'indicateur de synchronisation
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
                
                // Réinitialiser les event listeners
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
        
        // Forcer la synchronisation avant la mise à jour
        this.forceSynchronization();
        
        this.eventListenersSetup = false; // Forcer la réinitialisation
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

    hideExplanationMessage() {
        // Méthode vide pour compatibilité
    }

    getPatternTypeLabel(type) {
        const labels = {
            subject: 'Sujet',
            body: 'Corps',
            sender: 'Expéditeur',
            absolute: 'Absolu'
        };
        return labels[type] || type;
    }

    // ================================================
    // MÉTHODES UTILITAIRES POUR TOAST ET ÉVÉNEMENTS
    // ================================================
    showToast(message, type = 'info', duration = 3000) {
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            window.uiManager.showToast(message, type, duration);
        } else {
            // Fallback basique si UIManager n'est pas disponible
            console.log(`[Toast ${type}] ${message}`);
        }
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoriesPage] Erreur dispatch ${eventName}:`, error);
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
            /* Page Settings Compacte */
            .settings-page-compact {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 12px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .page-header-compact {
                margin-bottom: 16px;
            }
            
            .page-header-compact h1 {
                font-size: 24px;
                margin-bottom: 8px;
                color: #1f2937;
            }
            
            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 16px;
            }
            
            .tab-button-compact {
                padding: 10px 16px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                display: flex;
                align-items: center;
                gap: 6px;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
            }
            
            .tab-button-compact:hover {
                color: #374151;
            }
            
            .tab-button-compact.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
            }
            
            /* Grille de paramètres */
            .settings-grid-compact {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }
            
            .settings-card-compact {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .settings-card-compact.full-width {
                grid-column: 1 / -1;
            }
            
            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .card-header-compact h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
                flex: 1;
            }
            
            .card-header-compact i {
                color: #6b7280;
            }
            
            /* Formulaires */
            .settings-form-compact {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .setting-item-compact {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 4px 0;
            }
            
            .setting-item-compact input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .setting-group-compact {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .setting-group-compact label {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
            }
            
            .select-compact,
            .input-compact {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                color: #374151;
                transition: border-color 0.2s ease;
            }
            
            .select-compact:focus,
            .input-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* Boutons */
            .btn-compact {
                padding: 8px 14px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .btn-compact:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
                border: 1px solid #e5e7eb;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-success {
                background: #10b981;
                color: white;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .button-group-compact {
                display: flex;
                gap: 8px;
            }
            
            /* Automatisation */
            .automation-focused-layout {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .task-automation-section {
                margin-top: 20px;
            }
            
            .task-automation-section h4 {
                margin-bottom: 12px;
                color: #374151;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .categories-selection-grid-automation {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 10px;
                margin-top: 12px;
            }
            
            .category-checkbox-item-enhanced {
                display: block;
                cursor: pointer;
                position: relative;
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
                gap: 8px;
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                transition: all 0.2s ease;
                min-height: 44px;
            }
            
            .category-checkbox-item-enhanced:hover .category-checkbox-content-enhanced {
                border-color: #3b82f6;
                background: #f0f9ff;
            }
            
            .category-checkbox-item-enhanced input:checked + .category-checkbox-content-enhanced {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            
            .cat-icon-automation {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .cat-name-automation {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
                flex: 1;
            }
            
            .custom-badge {
                background: #fbbf24;
                color: #78350f;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            /* Options d'automatisation */
            .automation-options-enhanced {
                margin-top: 24px;
            }
            
            .automation-options-enhanced h4 {
                margin-bottom: 12px;
                color: #374151;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-options-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }
            
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .checkbox-enhanced:hover {
                background: #f9fafb;
                border-color: #3b82f6;
            }
            
            .checkbox-enhanced input[type="checkbox"] {
                margin-top: 2px;
                cursor: pointer;
            }
            
            .checkbox-content {
                flex: 1;
            }
            
            .checkbox-title {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                display: block;
                margin-bottom: 2px;
            }
            
            .checkbox-description {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* Statistiques */
            .automation-stats {
                margin-top: 24px;
            }
            
            .automation-stats h4 {
                margin-bottom: 12px;
                color: #374151;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }
            
            .stat-item {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: 700;
                color: #3b82f6;
                display: block;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6b7280;
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
            }
            
            .category-checkbox-item-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .category-checkbox-item-enhanced input[type="checkbox"]:checked + .category-checkbox-content-enhanced {
                background: #667eea15 !important;
                border-color: #667eea !important;
                transform: scale(1.02);
            }
            
            /* Gestion des mots-clés */
            .keywords-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .search-bar-compact {
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }
            
            .search-bar-compact i {
                color: #6b7280;
            }
            
            .search-bar-compact input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 14px;
                padding: 4px;
            }
            
            .clear-search {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
            }
            
            .quick-exclusion-form {
                display: flex;
                gap: 8px;
                margin: 16px 0;
            }
            
            .quick-exclusion-form input {
                flex: 1;
            }
            
            .exclusions-list {
                margin-top: 16px;
            }
            
            .exclusion-items {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            
            .exclusion-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 6px;
                font-size: 13px;
                color: #78350f;
            }
            
            .exclusion-item button {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 0;
                font-size: 12px;
            }
            
            .empty-message {
                color: #9ca3af;
                font-style: italic;
                font-size: 13px;
            }
            
            .categories-manager-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 12px;
                margin-top: 16px;
            }
            
            .category-manager-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            
            .category-manager-card.inactive {
                opacity: 0.6;
            }
            
            .category-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .category-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .category-header h4 {
                margin: 0;
                font-size: 15px;
                flex: 1;
            }
            
            .category-stats {
                display: flex;
                gap: 12px;
                margin-bottom: 12px;
                font-size: 12px;
                color: #6b7280;
            }
            
            .category-actions {
                display: flex;
                gap: 6px;
            }
            
            /* Modales */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .modal-content-compact {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 600px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            .modal-content-large {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 900px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
            }
            
            .keywords-editor {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .keyword-group h4 {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .keywords-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 12px;
            }
            
            .keyword-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 13px;
                transition: all 0.2s ease;
            }
            
            .keyword-item:hover {
                background: #f3f4f6;
            }
            
            .keyword-item.editing {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            
            .keyword-actions {
                display: flex;
                gap: 4px;
            }
            
            .btn-icon {
                background: none;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .btn-icon:hover {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .btn-icon.edit {
                color: #3b82f6;
            }
            
            .btn-icon.delete {
                color: #ef4444;
            }
            
            .btn-icon.save {
                color: #10b981;
            }
            
            .btn-icon.cancel {
                color: #6b7280;
            }
            
            .add-keyword-form {
                display: flex;
                gap: 8px;
            }
            
            .add-keyword-form input {
                flex: 1;
                font-size: 13px;
            }
            
            .all-keywords-table {
                overflow-x: auto;
            }
            
            .all-keywords-table table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            
            .all-keywords-table th {
                text-align: left;
                padding: 8px 12px;
                border-bottom: 2px solid #e5e7eb;
                font-weight: 600;
                color: #374151;
                background: #f9fafb;
            }
            
            .all-keywords-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .all-keywords-table tr:hover {
                background: #f9fafb;
            }
            
            .exclusions-manager {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .exclusion-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .exclusion-list-modal {
                display: flex;
                flex-direction: column;
                gap: 4px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .exclusion-item-modal {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 6px;
                font-size: 13px;
                color: #78350f;
            }
            
            .exclusion-item-modal button {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 4px;
                font-size: 12px;
            }
            
            /* Statut badges */
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
            
            /* Empty state */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                background: #f9fafb;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }
            
            .empty-state-icon {
                font-size: 48px;
                color: #9ca3af;
                margin-bottom: 16px;
            }
            
            .empty-state-title {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .empty-state-text {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 24px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .empty-state .btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                margin: 0 4px;
                transition: all 0.2s ease;
            }
            
            .empty-state .btn.btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .empty-state .btn.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
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
                
                .categories-manager-grid {
                    grid-template-columns: 1fr;
                }
                
                .exclusions-manager {
                    grid-template-columns: 1fr;
                }
            }
        `;
