// CategoriesPage.js - Version 8.5 - Réparation complète renderGeneralTab et synchronisation

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // NOUVEAU: Gestion de synchronisation renforcée
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 8.5 - Réparation complète renderGeneralTab et synchronisation');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
            'showCreateCategoryModal', 'createNewCategory', 'editCustomCategory', 'deleteCustomCategory',
            'renderGeneralTab', 'renderAutomationTab', 'renderKeywordsTab', 'renderTabContent'
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
        
        // NOUVEAU: Forcer la synchronisation après sauvegarde
        setTimeout(() => {
            this.forceSynchronization();
        }, 50);
        
        console.log('[CategoriesPage] ✅ === FIN SAUVEGARDE SETTINGS ===');
    }

    // ================================================
    // SYNCHRONISATION FORCÉE - NOUVELLE MÉTHODE
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
            // Pas besoin d'appel direct pour éviter les boucles
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS - OPTIMISÉE
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
        
        // NOUVEAU: Notifications spécialisées pour les modules avec vérification
        this.notifySpecificModules(settingType, value);
        
        // NOUVEAU: Forcer la synchronisation après notification
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
        
        // PageManager - synchronisation forcée pour les emails
        if (window.pageManager && settingType === 'taskPreselectedCategories') {
            console.log('[CategoriesPage] 📄 Notification PageManager - mise à jour emails');
            setTimeout(() => {
                if (window.pageManager.currentPage === 'emails') {
                    window.pageManager.refreshEmailsView?.();
                }
            }, 200);
        }
        
        console.log('[CategoriesPage] ✅ Notifications spécialisées envoyées');
    }

    // ================================================
    // MISE À JOUR DES CATÉGORIES PRÉ-SÉLECTIONNÉES - ULTRA RENFORCÉE
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
            
            // NOUVEAU: Notification immédiate et forcée
            this.notifySettingsChange('taskPreselectedCategories', selectedCategories);
            
            // NOUVEAU: Mise à jour immédiate de l'interface
            this.updateSelectionIndicators(selectedCategories);
            
            // NOUVEAU: Toast avec détails
            const categoryNames = selectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? category.name : catId;
            });
            
            this.showToast(`✅ ${selectedCategories.length} catégorie(s) pré-sélectionnée(s): ${categoryNames.join(', ')}`, 'success', 4000);
            this.updateAutomationStats();
            
            console.log('[CategoriesPage] 🎯 === FIN updateTaskPreselectedCategories ===');
            
            // NOUVEAU: Vérification de synchronisation après 1 seconde
            setTimeout(() => {
                this.verifySynchronization(selectedCategories);
            }, 1000);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur updateTaskPreselectedCategories:', error);
            this.showToast('Erreur de mise à jour des catégories', 'error');
        }
    }

    // ================================================
    // VÉRIFICATION DE SYNCHRONISATION - NOUVELLE
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
    // INDICATEURS VISUELS DE SYNCHRONISATION - NOUVEAUX
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
    // MÉTHODES DE SAUVEGARDE - AVEC SYNCHRONISATION FORCÉE
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
    // RENDU PRINCIPAL DE LA PAGE PARAMÈTRES - AVEC INDICATEURS
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
            
            // NOUVEAU: Vérifier l'état de synchronisation
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
    // RENDU DES ONGLETS - RÉPARÉ
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
    // ONGLET GÉNÉRAL - RÉPARÉ
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

                    <!-- Paramètres de filtrage -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-filter"></i>
                            <h3>Filtrage des emails</h3>
                        </div>
                        <div class="settings-grid-compact">
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="excludeSpam" 
                                       ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Exclure les spams</span>
                                    <span class="switch-description-compact">Ignorer les emails indésirables</span>
                                </div>
                            </label>
                            
                            <label class="switch-container-compact">
                                <input type="checkbox" 
                                       id="detectCC" 
                                       ${settings.preferences?.detectCC !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span class="switch-slider-compact"></span>
                                <div class="switch-labels-compact">
                                    <span class="switch-title-compact">Détecter les CC</span>
                                    <span class="switch-description-compact">Identifier les emails en copie</span>
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
    // ONGLET AUTOMATISATION - AVEC INDICATEURS TEMPS RÉEL
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
                                           ${moduleStatus.aiTaskAnalyzer ? '' : 'disabled'}
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
    // ONGLET CATÉGORIES/MOTS-CLÉS - SIMPLIFIÉ
    // ================================================
    renderKeywordsTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            return `
                <div class="keywords-tab-layout">
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-tags"></i>
                            <h3>Gestion des catégories</h3>
                        </div>
                        <p>Les catégories sont gérées automatiquement par le système. Voici un aperçu des catégories disponibles :</p>
                        
                        <div class="categories-overview-grid">
                            ${Object.entries(categories).map(([id, category]) => `
                                <div class="category-overview-card">
                                    <div class="category-overview-icon" style="background: ${category.color}20; color: ${category.color}">
                                        ${category.icon}
                                    </div>
                                    <div class="category-overview-content">
                                        <h5>${category.name}</h5>
                                        <p>${category.description || 'Catégorie système'}</p>
                                        ${category.isCustom ? '<span class="custom-badge-small">Personnalisée</span>' : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="keywords-actions">
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openAllKeywordsModal()">
                                <i class="fas fa-eye"></i>
                                Voir tous les mots-clés
                            </button>
                            <button class="btn-compact btn-secondary" onclick="window.categoriesPage.debugSettings()">
                                <i class="fas fa-info-circle"></i>
                                Informations système
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    // ================================================
    // NOUVEAUX INDICATEURS DE STATUT
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

    // ================================================
    // INITIALISATION DES ÉVÉNEMENTS - ULTRA RENFORCÉE
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

            // ULTRA RENFORCEMENT: Catégories pré-sélectionnées pour les tâches
            const categoryCheckboxes = document.querySelectorAll('.category-preselect-checkbox');
            console.log(`[CategoriesPage] 🎯 Initialisation ULTRA RENFORCÉE de ${categoryCheckboxes.length} checkboxes`);
            
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
            console.log('[CategoriesPage] ✅ Événements initialisés avec ULTRA RENFORCEMENT des checkboxes');
            
            // NOUVEAU: Vérifier immédiatement l'état des checkboxes
            setTimeout(() => {
                this.verifyCheckboxState();
            }, 100);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur initialisation événements:', error);
        }
    }

    // ================================================
    // VÉRIFICATION DE L'ÉTAT DES CHECKBOXES - NOUVELLE
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
    // NAVIGATION ENTRE ONGLETS - AVEC VÉRIFICATION
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
    // MÉTHODES UTILITAIRES AMÉLIORÉES
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
    // MÉTHODES DE DEBUG - ENRICHIES
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
    // MÉTHODES DE MODALES - SIMPLIFIÉES
    // ================================================
    openKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.showToast(`Mots-clés pour la catégorie "${category.name}" - gérés automatiquement`, 'info');
    }

    openAllKeywordsModal() {
        const categories = window.categoryManager?.getCategories() || {};
        let modalContent = '<h3>Aperçu des catégories et mots-clés</h3>';
        
        Object.entries(categories).forEach(([id, category]) => {
            modalContent += `
                <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h4 style="margin: 0 0 5px 0; color: ${category.color};">${category.icon} ${category.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${category.description || 'Catégorie système'}</p>
                </div>
            `;
        });
        
        this.showModal('Catégories disponibles', modalContent);
    }

    openExclusionsModal() {
        this.showToast('Exclusions gérées automatiquement par le système', 'info');
    }

    showCreateCategoryModal() {
        this.showToast('Création de catégories personnalisées bientôt disponible', 'info');
    }

    createNewCategory() {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    editCustomCategory(categoryId) {
        this.showToast('Édition de catégories bientôt disponible', 'info');
    }

    deleteCustomCategory(categoryId) {
        this.showToast('Suppression de catégories bientôt disponible', 'info');
    }

    addQuickExclusion() {
        this.showToast('Ajout d\'exclusions bientôt disponible', 'info');
    }

    toggleCategory(categoryId) {
        this.showToast('Gestion des catégories via l\'onglet Automatisation', 'info');
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
        document.body.style.overflow = 'auto';
    }

    hideExplanationMessage() {
        this.showToast('Message d\'explication masqué', 'info');
    }

    // ================================================
    // IMPORT/EXPORT SIMPLIFIÉ
    // ================================================
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
    // UTILITAIRES
    // ================================================
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
            // Fallback simple
            console.log(`[Toast ${type.toUpperCase()}] ${message}`);
        }
    }

    showModal(title, content) {
        const modalHtml = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #1f2937;">${title}</h3>
                        <button onclick="window.categoriesPage.closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">×</button>
                    </div>
                    <div>${content}</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    // ================================================
    // STYLES CSS AVEC INDICATEURS DE SYNCHRONISATION
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Styles principaux pour CategoriesPage */
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

            /* Onglets */
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

            /* Cartes de paramètres */
            .settings-card-compact {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .settings-card-compact.full-width {
                width: 100%;
            }

            .card-header-compact {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f3f4f6;
            }

            .card-header-compact i {
                color: #3b82f6;
                font-size: 18px;
            }

            .card-header-compact h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }

            /* Grilles et formulaires */
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

            .form-select-compact:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Switches */
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

            /* Boutons */
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

            .btn-compact.btn-secondary {
                background: white;
                color: #374151;
                border-color: #d1d5db;
            }

            .btn-compact.btn-secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }

            /* Actions rapides */
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

            .btn-quick-action-compact i {
                font-size: 18px;
            }

            .btn-quick-action-compact span {
                font-size: 12px;
                font-weight: 600;
            }

            /* Automatisation */
            .automation-focused-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .task-automation-section {
                margin: 20px 0;
            }

            .task-automation-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
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

            .category-checkbox-item-enhanced input[type="checkbox"] {
                margin-right: 12px;
                width: 18px;
                height: 18px;
                cursor: pointer;
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

            /* Options d'automatisation */
            .automation-options-enhanced {
                margin: 20px 0;
            }

            .automation-options-enhanced h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
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

            .checkbox-enhanced input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
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

            /* Statistiques */
            .automation-stats {
                margin: 20px 0;
            }

            .automation-stats h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
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

            .stat-item.sync-stat {
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }

            .stat-item.sync-stat:hover {
                border-color: #3b82f6;
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

            /* Badges de statut */
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

            /* Catégories overview */
            .categories-overview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 12px;
                margin: 16px 0;
            }

            .category-overview-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .category-overview-card:hover {
                background: #f0f9ff;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .category-overview-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .category-overview-content {
                flex: 1;
            }

            .category-overview-content h5 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .category-overview-content p {
                margin: 0;
                font-size: 12px;
                color: #6b7280;
            }

            .custom-badge-small {
                background: #f59e0b;
                color: white;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
                margin-top: 4px;
                display: inline-block;
            }

            .keywords-actions {
                margin-top: 16px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            /* Layouts */
            .general-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .keywords-tab-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .settings-page-compact {
                    padding: 12px;
                }

                .form-row-compact {
                    grid-template-columns: 1fr;
                }

                .automation-options-grid,
                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }

                .quick-actions-grid-compact {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // NETTOYAGE AMÉLIORÉ
    // ================================================
    cleanup() {
        // Nettoyer les handlers spéciaux des checkboxes
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
        
        console.log('[CategoriesPage] Nettoyage amélioré effectué');
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

console.log('✅ CategoriesPage v8.5 loaded - Réparation complète renderGeneralTab et synchronisation');
