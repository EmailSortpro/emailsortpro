// CategoriesPage.js - Version 7.2 - CORRIGÉ avec synchronisation complète

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
    }

    // =====================================
    // PAGE PARAMÈTRES AVEC ONGLETS
    // =====================================
    renderSettings(container) {
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
    }

    switchTab(tab) {
        this.currentTab = tab;
        const tabContent = document.getElementById('tabContent');
        const settings = this.loadSettings();
        
        // Mettre à jour les boutons d'onglet
        document.querySelectorAll('.tab-button-compact').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-button-compact[onclick*="${tab}"]`).classList.add('active');
        
        // Mettre à jour le contenu
        if (tabContent) {
            tabContent.innerHTML = tab === 'general' ? 
                this.renderGeneralTab(settings) : 
                tab === 'automation' ? 
                this.renderAutomationTab(settings) :
                this.renderKeywordsTab(settings);
        }
    }

    // =====================================
    // ONGLET GÉNÉRAL - OPTIMISÉ
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

                    <!-- Paramètres généraux de l'application -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-sliders-h"></i>
                            <h3>Préférences générales</h3>
                        </div>
                        <p>Options d'affichage et de comportement de l'application</p>
                        
                        <div class="general-preferences">
                            <label class="checkbox-compact">
                                <input type="checkbox" id="darkMode" 
                                       ${settings.preferences?.darkMode ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span>Mode sombre (bientôt disponible)</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="compactView" 
                                       ${settings.preferences?.compactView ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span>Vue compacte des emails</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="showNotifications" 
                                       ${settings.preferences?.showNotifications !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.savePreferences()">
                                <span>Notifications activées</span>
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
                                <select id="defaultScanPeriod" class="select-compact" onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="1" ${settings.scanSettings?.defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                    <option value="3" ${settings.scanSettings?.defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                    <option value="7" ${settings.scanSettings?.defaultPeriod === 7 ? 'selected' : ''}>7 jours</option>
                                    <option value="15" ${settings.scanSettings?.defaultPeriod === 15 ? 'selected' : ''}>15 jours</option>
                                    <option value="30" ${settings.scanSettings?.defaultPeriod === 30 ? 'selected' : ''}>30 jours</option>
                                </select>
                            </div>
                            
                            <div class="setting-row">
                                <label>Dossier par défaut</label>
                                <select id="defaultFolder" class="select-compact" onchange="window.categoriesPage.saveScanSettings()">
                                    <option value="inbox" ${settings.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                    <option value="all" ${settings.scanSettings?.defaultFolder === 'all' ? 'selected' : ''}>Tous les dossiers</option>
                                </select>
                            </div>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="autoAnalyze" 
                                       ${settings.scanSettings?.autoAnalyze !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span>Analyse IA automatique après scan</span>
                            </label>
                            
                            <label class="checkbox-compact">
                                <input type="checkbox" id="autoCategrize" 
                                       ${settings.scanSettings?.autoCategrize !== false ? 'checked' : ''}
                                       onchange="window.categoriesPage.saveScanSettings()">
                                <span>Catégorisation automatique</span>
                            </label>
                        </div>
                    </div>

                    <!-- Exclusions et redirections optimisées -->
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

    // =====================================
    // ONGLET AUTOMATISATION - CONCENTRÉ SUR LES TÂCHES
    // =====================================
    renderAutomationTab(settings) {
        const categories = window.categoryManager?.getCategories() || {};
        
        return `
            <div class="automation-focused-layout">
                <!-- Conversion automatique en tâches - Section principale -->
                <div class="settings-card-compact full-width">
                    <div class="card-header-compact">
                        <i class="fas fa-check-square"></i>
                        <h3>Conversion automatique en tâches</h3>
                    </div>
                    <p>Sélectionnez les catégories d'emails qui seront automatiquement proposées pour la création de tâches et configurez le comportement de l'automatisation.</p>
                    
                    <!-- Sélection des catégories -->
                    <div class="task-automation-section">
                        <h4><i class="fas fa-tags"></i> Catégories pré-sélectionnées pour le scan</h4>
                        <div class="categories-selection-grid-automation">
                            ${Object.entries(categories).map(([id, category]) => {
                                const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
                                return `
                                    <label class="category-checkbox-item-enhanced">
                                        <input type="checkbox" 
                                               value="${id}"
                                               ${isPreselected ? 'checked' : ''}
                                               onchange="window.categoriesPage.updateTaskPreselectedCategories()">
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
                    
                    <!-- Statistiques et aperçu -->
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
    }

    // =====================================
    // GESTION DES PARAMÈTRES - CORRIGÉ AVEC SYNCHRONISATION
    // =====================================
    updateTaskPreselectedCategories() {
        const settings = this.loadSettings();
        const checkboxes = document.querySelectorAll('.category-checkbox-item-enhanced input[type="checkbox"]');
        
        settings.taskPreselectedCategories = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                settings.taskPreselectedCategories.push(checkbox.value);
            }
        });
        
        this.saveSettings(settings);
        
        // IMPORTANT: Notifier les autres modules du changement
        this.notifySettingsChanged(settings);
        
        window.uiManager?.showToast('Catégories pré-sélectionnées mises à jour', 'success');
    }

    saveAutomationSettings() {
        const settings = this.loadSettings();
        
        settings.automationSettings = {
            autoCreateTasks: document.getElementById('autoCreateTasks')?.checked || false,
            groupTasksByDomain: document.getElementById('groupTasksByDomain')?.checked || false,
            skipDuplicates: document.getElementById('skipDuplicates')?.checked !== false,
            autoAssignPriority: document.getElementById('autoAssignPriority')?.checked || false
        };
        
        this.saveSettings(settings);
        this.notifySettingsChanged(settings);
        window.uiManager?.showToast('Paramètres d\'automatisation sauvegardés', 'success');
    }

    saveScanSettings() {
        const settings = this.loadSettings();
        
        settings.scanSettings = {
            defaultPeriod: parseInt(document.getElementById('defaultScanPeriod')?.value || 7),
            defaultFolder: document.getElementById('defaultFolder')?.value || 'inbox',
            autoAnalyze: document.getElementById('autoAnalyze')?.checked !== false,
            autoCategrize: document.getElementById('autoCategrize')?.checked !== false
        };
        
        this.saveSettings(settings);
        this.notifySettingsChanged(settings);
        window.uiManager?.showToast('Paramètres de scan sauvegardés', 'success');
    }

    savePreferences() {
        const settings = this.loadSettings();
        
        settings.preferences = {
            darkMode: document.getElementById('darkMode')?.checked || false,
            compactView: document.getElementById('compactView')?.checked || false,
            showNotifications: document.getElementById('showNotifications')?.checked !== false
        };
        
        this.saveSettings(settings);
        this.notifySettingsChanged(settings);
        window.uiManager?.showToast('Préférences sauvegardées', 'success');
    }

    // =====================================
    // NOTIFICATION DE CHANGEMENTS - NOUVELLE FONCTION CLÉ
    // =====================================
    notifySettingsChanged(settings) {
        console.log('[CategoriesPage] Broadcasting settings change...');
        
        // Notifier tous les modules intéressés
        if (window.minimalScanModule) {
            window.minimalScanModule.onSettingsChanged(settings);
        }
        
        if (window.emailScanner) {
            window.emailScanner.onSettingsChanged(settings);
        }
        
        if (window.pageManager) {
            window.pageManager.onSettingsChanged(settings);
        }
        
        // Émettre un événement global
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { settings }
        }));
    }

    // =====================================
    // MÉTHODES PUBLIQUES POUR ACCÈS AUX PARAMÈTRES
    // =====================================
    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

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

    // =====================================
    // GESTION DES PARAMÈTRES
    // =====================================
    loadSettings() {
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
                showNotifications: true
            }
        };
    }

    saveSettings(settings) {
        localStorage.setItem('categorySettings', JSON.stringify(settings));
        console.log('[CategoriesPage] Settings saved:', Object.keys(settings));
    }

    // =====================================
    // RESTE DU CODE INCHANGÉ
    // =====================================
    renderOptimizedExclusions(settings) {
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
                               placeholder="domaine.com ou email@exemple.com"
                               onkeypress="if(event.key === 'Enter') window.categoriesPage.addQuickExclusion()">
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
    }

    renderRecentExclusions(domains, emails, categories) {
        const allExclusions = [
            ...domains.map(d => ({ ...d, type: 'domain' })),
            ...emails.map(e => ({ ...e, type: 'email' }))
        ].slice(-4); // 4 dernières
        
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
    }

    renderKeywordsTab(settings) {
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
            </div>
        `;
    }

    // Méthodes utilitaires inchangées
    getKeywordsFromWeightedSystem(categoryId) {
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
    }

    getTotalKeywordsForCategory(keywords) {
        let count = 0;
        if (keywords.absolute) count += keywords.absolute.length;
        if (keywords.strong) count += keywords.strong.length;
        if (keywords.weak) count += keywords.weak.length;
        return count;
    }

    // Styles inchangés - même CSS que dans le code original
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
            
            /* Onglets avec 3 boutons */
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
            
            /* Préférences générales */
            .general-preferences {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 12px;
            }
            
            .general-preferences .checkbox-compact {
                padding: 6px 0;
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
            
            /* Automation Layout */
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
            
            .task-automation-section h4 i {
                color: #667eea;
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
            
            .category-checkbox-item-enhanced:hover .category-checkbox-content-enhanced::before {
                border-color: #667eea;
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
            
            .automation-options-enhanced h4 i {
                color: #667eea;
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
            
            .checkbox-enhanced:hover .checkbox-content::before {
                border-color: #667eea;
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
            
            .automation-stats h4 i {
                color: #667eea;
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
                
                .categories-selection-grid-automation {
                    grid-template-columns: 1fr;
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

// Create global instance
window.categoriesPage = new CategoriesPage();

// Export for PageManager integration
if (window.pageManager && window.pageManager.pages) {
    // Supprimer l'ancienne page categories
    delete window.pageManager.pages.categories;
    delete window.pageManager.pages.keywords;
    
    // Page Paramètres avec onglets
    window.pageManager.pages.settings = (container) => {
        window.categoriesPage.renderSettings(container);
    };
    
    console.log('✅ CategoriesPage v7.2 loaded - CORRIGÉ avec synchronisation complète');
} else {
    console.warn('⚠️ PageManager not ready, retrying...');
    setTimeout(() => {
        if (window.pageManager && window.pageManager.pages) {
            delete window.pageManager.pages.categories;
            delete window.pageManager.pages.keywords;
            
            window.pageManager.pages.settings = (container) => {
                window.categoriesPage.renderSettings(container);
            };
            
            console.log('✅ CategoriesPage v7.2 loaded - CORRIGÉ avec synchronisation complète (delayed)');
        }
    }, 1000);
}
