// CategoriesPage.js - Version 8.5 - Fix complet synchronisation + méthodes manquantes

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
        this.syncCheckInterval = null;
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        // Démarrer la synchronisation continue
        this.startSyncMonitoring();
        
        console.log('[CategoriesPage] ✅ Version 8.5 - Fix complet synchronisation + méthodes manquantes');
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
    // SURVEILLANCE CONTINUE DE LA SYNCHRONISATION - NOUVEAU
    // ================================================
    startSyncMonitoring() {
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
        }
        
        // Vérifier la synchronisation toutes les 2 secondes
        this.syncCheckInterval = setInterval(() => {
            this.checkAndFixSyncIssues();
        }, 2000);
        
        console.log('[CategoriesPage] 🔄 Surveillance synchronisation démarrée');
    }

    checkAndFixSyncIssues() {
        if (this.syncInProgress) return;
        
        try {
            const currentSettings = this.loadSettings();
            const expectedCategories = currentSettings.taskPreselectedCategories || [];
            
            // Vérifier si l'interface est désynchronisée
            if (this.isUIOutOfSync(expectedCategories)) {
                console.log('[CategoriesPage] ⚠️ Désynchronisation détectée, correction automatique...');
                this.fixUISync(expectedCategories);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur vérification sync:', error);
        }
    }

    isUIOutOfSync(expectedCategories) {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        if (checkboxes.length === 0) return false;
        
        let mismatches = 0;
        checkboxes.forEach(checkbox => {
            const shouldBeChecked = expectedCategories.includes(checkbox.value);
            const isChecked = checkbox.checked;
            
            if (shouldBeChecked !== isChecked) {
                mismatches++;
            }
        });
        
        return mismatches > 0;
    }

    fixUISync(expectedCategories) {
        const checkboxes = document.querySelectorAll('.category-preselect-checkbox');
        let fixed = 0;
        
        checkboxes.forEach(checkbox => {
            const shouldBeChecked = expectedCategories.includes(checkbox.value);
            if (checkbox.checked !== shouldBeChecked) {
                checkbox.checked = shouldBeChecked;
                fixed++;
            }
        });
        
        if (fixed > 0) {
            console.log(`[CategoriesPage] 🔧 ${fixed} checkboxes corrigées automatiquement`);
            this.updateSelectionIndicators(expectedCategories);
            this.updateAutomationStats();
            
            // Notifier l'utilisateur subtilement
            this.showSyncNotification('Interface synchronisée automatiquement', 'info');
        }
    }

    showSyncNotification(message, type = 'info') {
        // Notification discrète en haut à droite
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'info' ? '#3b82f6' : '#10b981'};
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            z-index: 100000;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `<i class="fas fa-sync"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
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
            
            // 3. Corriger l'interface utilisateur
            this.fixUISync(currentSettings.taskPreselectedCategories || []);
            
            // 4. Dispatcher l'événement de synchronisation globale
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
        
        // Synchroniser le scanner minimal
        if (window.minimalScanModule) {
            console.log('[CategoriesPage] 📱 Synchronisation MinimalScanModule');
            
            if (typeof window.minimalScanModule.updateSettings === 'function') {
                window.minimalScanModule.updateSettings(settings);
            }
        }
        
        console.log('[CategoriesPage] ✅ Synchronisation modules terminée');
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
    // MÉTHODES DE RENDU MANQUANTES - AJOUTÉES
    // ================================================
    renderGeneralTab(settings, moduleStatus) {
        return `
            <div class="general-settings-layout">
                <!-- Préférences générales -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-cog"></i>
                        <h3>Préférences générales</h3>
                    </div>
                    
                    <div class="preferences-grid">
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="darkMode" ${settings.preferences?.darkMode ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Mode sombre</span>
                                <span class="checkbox-description">Interface sombre pour moins de fatigue visuelle</span>
                            </div>
                        </label>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="compactView" ${settings.preferences?.compactView ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Vue compacte</span>
                                <span class="checkbox-description">Affichage plus dense des emails</span>
                            </div>
                        </label>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="showNotifications" ${settings.preferences?.showNotifications !== false ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Notifications</span>
                                <span class="checkbox-description">Afficher les notifications du système</span>
                            </div>
                        </label>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="excludeSpam" ${settings.preferences?.excludeSpam !== false ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Exclure les spams</span>
                                <span class="checkbox-description">Ignorer les emails indésirables lors du scan</span>
                            </div>
                        </label>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="detectCC" ${settings.preferences?.detectCC !== false ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Détecter les CC</span>
                                <span class="checkbox-description">Identifier les emails en copie</span>
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
                    
                    <div class="scan-settings-grid">
                        <div class="setting-item">
                            <label for="defaultScanPeriod">Période par défaut (jours)</label>
                            <select id="defaultScanPeriod">
                                <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label for="defaultFolder">Dossier par défaut</label>
                            <select id="defaultFolder">
                                <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                <option value="sent" ${settings.scanSettings?.defaultFolder === 'sent' ? 'selected' : ''}>Éléments envoyés</option>
                                <option value="archive" ${settings.scanSettings?.defaultFolder === 'archive' ? 'selected' : ''}>Archive</option>
                            </select>
                        </div>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="autoAnalyze" ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Analyse automatique</span>
                                <span class="checkbox-description">Analyser automatiquement avec l'IA</span>
                            </div>
                        </label>
                        
                        <label class="checkbox-enhanced">
                            <input type="checkbox" id="autoCategrize" ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}>
                            <div class="checkbox-content">
                                <span class="checkbox-title">Catégorisation automatique</span>
                                <span class="checkbox-description">Classer automatiquement les emails</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Exclusions rapides -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-ban"></i>
                        <h3>Exclusions rapides</h3>
                    </div>
                    
                    <div class="quick-exclusions">
                        <div class="exclusion-input-group">
                            <input type="text" id="quick-exclusion-input" placeholder="Domaine ou email à exclure">
                            <button onclick="window.categoriesPage.addQuickExclusion()" class="btn-add-exclusion">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <div class="current-exclusions">
                            ${this.renderCurrentExclusions(settings)}
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
        
        return `
            <div class="keywords-layout">
                <!-- Gestion des catégories -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-tags"></i>
                        <h3>Gestion des catégories</h3>
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Nouvelle catégorie
                        </button>
                    </div>
                    
                    <div class="categories-management-grid">
                        ${Object.entries(categories).map(([id, category]) => `
                            <div class="category-management-card">
                                <div class="category-header">
                                    <span class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                                        ${category.icon}
                                    </span>
                                    <div class="category-info">
                                        <span class="category-name">${category.name}</span>
                                        ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
                                    </div>
                                </div>
                                
                                <div class="category-actions">
                                    <button class="btn-icon" onclick="window.categoriesPage.openKeywordsModal('${id}')" title="Mots-clés">
                                        <i class="fas fa-key"></i>
                                    </button>
                                    ${category.isCustom ? `
                                        <button class="btn-icon" onclick="window.categoriesPage.editCustomCategory('${id}')" title="Modifier">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon danger" onclick="window.categoriesPage.deleteCustomCategory('${id}')" title="Supprimer">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Exclusions -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-ban"></i>
                        <h3>Exclusions globales</h3>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.openExclusionsModal()">
                            <i class="fas fa-cog"></i> Gérer
                        </button>
                    </div>
                    
                    <div class="exclusions-summary">
                        <div class="exclusion-stat">
                            <span class="stat-number">${settings.categoryExclusions?.domains?.length || 0}</span>
                            <span class="stat-label">Domaines exclus</span>
                        </div>
                        <div class="exclusion-stat">
                            <span class="stat-number">${settings.categoryExclusions?.emails?.length || 0}</span>
                            <span class="stat-label">Emails exclus</span>
                        </div>
                    </div>
                </div>

                <!-- Actions globales -->
                <div class="settings-card-compact">
                    <div class="card-header-compact">
                        <i class="fas fa-tools"></i>
                        <h3>Actions globales</h3>
                    </div>
                    
                    <div class="global-actions">
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.exportSettings()">
                            <i class="fas fa-download"></i> Exporter paramètres
                        </button>
                        <button class="btn-compact btn-secondary" onclick="window.categoriesPage.importSettings()">
                            <i class="fas fa-upload"></i> Importer paramètres
                        </button>
                        <button class="btn-compact btn-warning" onclick="window.categoriesPage.resetAllCategories()">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

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
    // MÉTHODES AUXILIAIRES MANQUANTES
    // ================================================
    renderCurrentExclusions(settings) {
        const exclusions = settings.categoryExclusions || { domains: [], emails: [] };
        const allExclusions = [...(exclusions.domains || []), ...(exclusions.emails || [])];
        
        if (allExclusions.length === 0) {
            return '<div class="no-exclusions">Aucune exclusion configurée</div>';
        }
        
        return allExclusions.slice(0, 5).map(exclusion => `
            <span class="exclusion-tag">
                ${exclusion}
                <button onclick="window.categoriesPage.removeExclusion('${exclusion}')" class="remove-exclusion">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('') + (allExclusions.length > 5 ? `<span class="more-exclusions">+${allExclusions.length - 5} autres</span>` : '');
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

    // ================================================
    // MÉTHODES DE SAUVEGARDE SPÉCIALISÉES
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
    // MISE À JOUR DES INDICATEURS
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

    // ================================================
    // MÉTHODES D'ÉVÉNEMENTS
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
        
        console.log('[CategoriesPage] ✅ Notifications spécialisées envoyées');
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
    // RENDU PRINCIPAL + AUTRES MÉTHODES
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
    // MÉTHODES UTILITAIRES ET HELPERS
    // ================================================
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
    // MÉTHODES D'ACTIONS
    // ================================================
    addQuickExclusion() {
        const input = document.getElementById('quick-exclusion-input');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim();
        const settings = this.loadSettings();
        
        if (!settings.categoryExclusions) {
            settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        // Déterminer si c'est un domaine ou un email
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
        this.showToast(`Exclusion ajoutée: ${value}`, 'success');
        
        // Rafraîchir l'affichage
        this.refreshCurrentTab();
    }

    removeExclusion(exclusion) {
        const settings = this.loadSettings();
        
        if (settings.categoryExclusions) {
            settings.categoryExclusions.domains = settings.categoryExclusions.domains?.filter(d => d !== exclusion) || [];
            settings.categoryExclusions.emails = settings.categoryExclusions.emails?.filter(e => e !== exclusion) || [];
        }
        
        this.saveSettings(settings);
        this.showToast(`Exclusion supprimée: ${exclusion}`, 'success');
        
        // Rafraîchir l'affichage
        this.refreshCurrentTab();
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

    // ================================================
    // GESTION DES MODALES (STUBS)
    // ================================================
    openKeywordsModal(categoryId) {
        this.showToast(`Gestion des mots-clés pour ${categoryId} - À implémenter`, 'info');
    }

    openAllKeywordsModal() {
        this.showToast('Gestion globale des mots-clés - À implémenter', 'info');
    }

    openExclusionsModal() {
        this.showToast('Gestion des exclusions - À implémenter', 'info');
    }

    showCreateCategoryModal() {
        this.showToast('Création de catégorie personnalisée - À implémenter', 'info');
    }

    createNewCategory() {
        this.showToast('Création de nouvelle catégorie - À implémenter', 'info');
    }

    editCustomCategory(categoryId) {
        this.showToast(`Modification catégorie ${categoryId} - À implémenter`, 'info');
    }

    deleteCustomCategory(categoryId) {
        if (confirm(`Supprimer la catégorie ${categoryId} ?`)) {
            this.showToast(`Catégorie ${categoryId} supprimée - À implémenter`, 'info');
        }
    }

    exportSettings() {
        const settings = this.loadSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `email-scanner-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
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
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.saveSettings(settings);
                    this.showToast('Paramètres importés avec succès', 'success');
                    this.forceUpdateUI();
                } catch (error) {
                    this.showToast('Erreur lors de l\'import: fichier invalide', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    resetAllCategories() {
        if (confirm('Réinitialiser tous les paramètres ? Cette action est irréversible.')) {
            const defaultSettings = this.getDefaultSettings();
            this.saveSettings(defaultSettings);
            this.showToast('Paramètres réinitialisés', 'success');
            this.forceUpdateUI();
        }
    }

    closeModal() {
        // Fermer toutes les modales ouvertes
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
        document.body.style.overflow = 'auto';
    }

    hideExplanationMessage() {
        // Pour compatibilité
        this.showToast('Message d\'explication masqué', 'info');
    }

    toggleCategory(categoryId) {
        // Pour compatibilité
        this.showToast(`Basculement catégorie ${categoryId}`, 'info');
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            /* Page de paramètres compacte */
            .settings-page-compact {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            .page-header-compact {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            }

            .page-header-compact h1 {
                margin: 0 0 16px 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }

            /* Onglets */
            .settings-tabs-compact {
                display: flex;
                background: white;
                border-radius: 12px;
                padding: 6px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                gap: 4px;
            }

            .tab-button-compact {
                flex: 1;
                padding: 12px 16px;
                border: none;
                background: transparent;
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

            /* Contenu des onglets */
            .tab-content-compact {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                min-height: 400px;
            }

            /* Cartes de paramètres */
            .settings-card-compact {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                margin-bottom: 20px;
                overflow: hidden;
            }

            .settings-card-compact.full-width {
                width: 100%;
            }

            .card-header-compact {
                background: white;
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
                color: #374151;
            }

            .card-header-compact h3 {
                margin: 0;
                flex: 1;
                font-size: 16px;
            }

            /* Grilles de paramètres */
            .preferences-grid,
            .scan-settings-grid,
            .automation-options-grid {
                padding: 20px;
                display: grid;
                gap: 16px;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            }

            .setting-item {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .setting-item label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }

            .setting-item select,
            .setting-item input[type="text"],
            .setting-item input[type="number"] {
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .setting-item select:focus,
            .setting-item input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Checkboxes améliorées */
            .checkbox-enhanced {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .checkbox-enhanced:hover {
                border-color: #3b82f6;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .checkbox-enhanced input[type="checkbox"] {
                margin: 0;
                width: 18px;
                height: 18px;
                accent-color: #3b82f6;
            }

            .checkbox-content {
                flex: 1;
            }

            .checkbox-title {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                display: block;
                margin-bottom: 4px;
            }

            .checkbox-description {
                color: #6b7280;
                font-size: 12px;
                line-height: 1.4;
            }

            /* Section d'automatisation */
            .automation-focused-layout {
                max-width: 100%;
            }

            .task-automation-section {
                padding: 20px;
                margin-bottom: 20px;
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
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 12px;
            }

            .category-checkbox-item-enhanced {
                display: flex;
                align-items: center;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .category-checkbox-item-enhanced:hover {
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .category-checkbox-item-enhanced input[type="checkbox"] {
                margin: 0 12px 0 0;
                width: 18px;
                height: 18px;
                accent-color: #3b82f6;
            }

            .category-checkbox-content-enhanced {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .cat-icon-automation {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }

            .cat-name-automation {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                flex: 1;
            }

            .custom-badge,
            .selected-indicator {
                background: #10b981;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                white-space: nowrap;
            }

            .selected-indicator {
                background: #8b5cf6;
                animation: pulseSelection 2s infinite;
            }

            @keyframes pulseSelection {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }

            /* Automatisation options */
            .automation-options-enhanced {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
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

            /* Statistiques */
            .automation-stats {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                background: #f8fafc;
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
                gap: 16px;
            }

            .stat-item {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                transition: all 0.2s ease;
            }

            .stat-item:hover {
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }

            /* Indicateurs de synchronisation */
            .automation-sync-indicator {
                margin: 16px 20px;
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

            /* Exclusions rapides */
            .quick-exclusions {
                padding: 20px;
            }

            .exclusion-input-group {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }

            .exclusion-input-group input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }

            .btn-add-exclusion {
                padding: 10px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .btn-add-exclusion:hover {
                background: #2563eb;
            }

            .current-exclusions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .exclusion-tag {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 12px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .remove-exclusion {
                background: none;
                border: none;
                color: #ef4444;
                cursor: pointer;
                padding: 0;
                font-size: 10px;
            }

            .no-exclusions {
                color: #6b7280;
                font-style: italic;
                font-size: 14px;
            }

            .more-exclusions {
                background: #e5e7eb;
                color: #6b7280;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 500;
            }

            /* Boutons compacts */
            .btn-compact {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #374151;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .btn-compact:hover {
                border-color: #9ca3af;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .btn-compact.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-compact.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            .btn-compact.btn-secondary {
                background: #6b7280;
                color: white;
                border-color: #6b7280;
            }

            .btn-compact.btn-secondary:hover {
                background: #4b5563;
                border-color: #4b5563;
            }

            .btn-compact.btn-warning {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-compact.btn-warning:hover {
                background: #d97706;
                border-color: #d97706;
            }

            /* Gestion des catégories */
            .categories-management-grid {
                padding: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
            }

            .category-management-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                transition: all 0.2s ease;
            }

            .category-management-card:hover {
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .category-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }

            .category-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }

            .category-info {
                flex: 1;
            }

            .category-name {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                display: block;
            }

            .category-actions {
                display: flex;
                gap: 8px;
            }

            .btn-icon {
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
            }

            .btn-icon:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }

            .btn-icon.danger {
                color: #ef4444;
            }

            .btn-icon.danger:hover {
                border-color: #ef4444;
                background: #fef2f2;
            }

            /* Exclusions summary */
            .exclusions-summary {
                padding: 20px;
                display: flex;
                gap: 20px;
            }

            .exclusion-stat {
                text-align: center;
            }

            .exclusion-stat .stat-number {
                display: block;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .exclusion-stat .stat-label {
                font-size: 12px;
                color: #6b7280;
            }

            /* Actions globales */
            .global-actions {
                padding: 20px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            /* Status badges */
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

            /* Responsive */
            @media (max-width: 768px) {
                .settings-page-compact {
                    padding: 16px;
                }

                .tab-content-compact {
                    padding: 16px;
                }

                .preferences-grid,
                .scan-settings-grid,
                .automation-options-grid {
                    grid-template-columns: 1fr;
                }

                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
                }

                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .settings-tabs-compact {
                    flex-direction: column;
                    gap: 2px;
                }

                .tab-button-compact {
                    justify-content: flex-start;
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
            // Fallback simple
            console.log(`[Toast ${type.toUpperCase()}] ${message}`);
            
            // Toast visuel simple
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                z-index: 100000;
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, duration);
        }
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        // Arrêter la surveillance de synchronisation
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
            this.syncCheckInterval = null;
        }
        
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
        
        console.log('[CategoriesPage] Nettoyage complet effectué');
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

console.log('✅ CategoriesPage v8.5 loaded - Fix complet synchronisation + méthodes manquantes');
