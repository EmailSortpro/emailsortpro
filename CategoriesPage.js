// CategoriesPage.js - Version 22.2 - AFFICHAGE RÉPARÉ
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v22.2 - AFFICHAGE RÉPARÉ...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV22 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.currentTab = 'categories'; // categories | settings
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        
        // Configuration du backup - ACTIVÉ PAR DÉFAUT
        this.backupConfig = this.loadBackupConfig();
        this.initializeBackupSystem();
        
        console.log('[CategoriesPage] 🎨 Interface optimisée v22.2 initialisée avec système de backup');
    }

    // ================================================
    // RENDU PRINCIPAL AVEC ONGLETS
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            container.innerHTML = `
                <div class="categories-modern-v22">
                    <!-- Header avec onglets -->
                    <div class="header-modern-v22">
                        <div class="header-content-v22">
                            <h1>Paramètres <span class="emoji">⚙️</span></h1>
                            <p class="subtitle">Gérez vos catégories et sauvegardes</p>
                        </div>
                        
                        <!-- Onglets principaux -->
                        <div class="main-tabs">
                            <button class="main-tab ${this.currentTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchMainTab('categories')">
                                <i class="fas fa-tags"></i>
                                <span>Catégories</span>
                            </button>
                            <button class="main-tab ${this.currentTab === 'settings' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV22.switchMainTab('settings')">
                                <i class="fas fa-cog"></i>
                                <span>Paramètres</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div class="tab-content-wrapper">
                        <!-- Onglet Catégories -->
                        <div class="tab-content ${this.currentTab === 'categories' ? 'active' : ''}" id="categories-tab">
                            ${this.renderCategoriesTab()}
                        </div>
                        
                        <!-- Onglet Paramètres -->
                        <div class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}" id="settings-tab">
                            ${this.renderSettingsTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // RENDU ONGLET CATÉGORIES
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        return `
            <div class="categories-section">
                <!-- Stats colorées -->
                <div class="stats-bar-v22">
                    <div class="stat-card-v22" style="--accent: #FF6B6B">
                        <div class="stat-value">${Object.keys(categories).length}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-card-v22" style="--accent: #4ECDC4">
                        <div class="stat-value">${this.getActiveCount(categories, settings.activeCategories)}</div>
                        <div class="stat-label">Actives</div>
                    </div>
                    <div class="stat-card-v22" style="--accent: #45B7D1">
                        <div class="stat-value">${this.getTotalKeywords(categories)}</div>
                        <div class="stat-label">Mots-clés</div>
                    </div>
                    <div class="search-modern-v22">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               placeholder="Rechercher une catégorie..." 
                               onkeyup="window.categoriesPageV22.handleSearch(this.value)">
                    </div>
                </div>
                
                <!-- Actions rapides -->
                <div class="quick-actions">
                    <button class="btn-create-v22" onclick="window.categoriesPageV22.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Nouvelle Catégorie</span>
                    </button>
                    
                    <button class="btn-action-v22 export" onclick="window.categoriesPageV22.exportCategories()">
                        <i class="fas fa-download"></i>
                        <span>Exporter</span>
                    </button>
                    
                    <button class="btn-action-v22 import" onclick="window.categoriesPageV22.importCategories()">
                        <i class="fas fa-upload"></i>
                        <span>Importer</span>
                    </button>
                </div>
                
                <!-- Grille de catégories -->
                <div class="categories-grid-v22" id="categories-container">
                    ${this.renderCategories(categories, settings.activeCategories)}
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU ONGLET PARAMÈTRES/BACKUP
    // ================================================
    renderSettingsTab() {
        const backupStats = this.getBackupStats();
        const config = this.backupConfig;
        
        return `
            <div class="settings-section">
                <!-- Section Backup -->
                <div class="backup-section">
                    <div class="section-header">
                        <h2><i class="fas fa-shield-alt"></i> Système de Sauvegarde</h2>
                        <p>Protégez vos données avec des sauvegardes automatiques</p>
                    </div>
                    
                    <!-- Status du backup -->
                    <div class="backup-status">
                        ${config.emergencyMode ? `
                            <div class="status-card emergency">
                                <div class="status-indicator">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="status-info">
                                    <h3>Mode Sauvegarde d'Urgence</h3>
                                    <p>Le dossier principal n'est plus accessible. Sauvegardes temporaires activées.</p>
                                </div>
                                <div class="status-toggle">
                                    <button class="btn-fix-emergency" onclick="window.categoriesPageV22.fixEmergencyMode()">
                                        <i class="fas fa-tools"></i>
                                        Réparer
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="status-card ${config.enabled ? 'enabled' : 'disabled'}">
                                <div class="status-indicator">
                                    <i class="fas fa-${config.enabled ? 'shield-check' : 'shield-times'}"></i>
                                </div>
                                <div class="status-info">
                                    <h3>Sauvegarde ${config.enabled ? 'Activée' : 'Désactivée'}</h3>
                                    <p>${config.enabled ? 'Dernière sauvegarde: ' + (backupStats.lastBackup || 'Jamais') : 'Activez pour protéger vos données'}</p>
                                </div>
                                <div class="status-toggle">
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${config.enabled ? 'checked' : ''} 
                                               onchange="window.categoriesPageV22.toggleBackup(this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <!-- Configuration du backup -->
                    <div class="backup-config">
                        <div class="config-grid">
                            <!-- Fréquence -->
                            <div class="config-item">
                                <label>
                                    <i class="fas fa-clock"></i>
                                    Fréquence de sauvegarde
                                </label>
                                <select id="backup-frequency" onchange="window.categoriesPageV22.updateBackupConfig('frequency', this.value)">
                                    <option value="manual" ${config.frequency === 'manual' ? 'selected' : ''}>Manuel uniquement</option>
                                    <option value="daily" ${config.frequency === 'daily' ? 'selected' : ''}>Quotidienne (recommandé)</option>
                                    <option value="weekly" ${config.frequency === 'weekly' ? 'selected' : ''}>Hebdomadaire</option>
                                    <option value="monthly" ${config.frequency === 'monthly' ? 'selected' : ''}>Mensuelle</option>
                                </select>
                            </div>
                            
                            <!-- Stockage -->
                            <div class="config-item">
                                <label>
                                    <i class="fas fa-database"></i>
                                    Emplacement de stockage
                                </label>
                                <select id="backup-storage" onchange="window.categoriesPageV22.updateBackupStorageConfig(this.value)">
                                    <option value="localStorage" ${config.storage === 'localStorage' ? 'selected' : ''}>Navigateur (localStorage)</option>
                                    <option value="indexedDB" ${config.storage === 'indexedDB' ? 'selected' : ''}>Base de données locale</option>
                                    <option value="download" ${config.storage === 'download' ? 'selected' : ''}>Téléchargement automatique</option>
                                    <option value="custom-folder" ${config.storage === 'custom-folder' ? 'selected' : ''}>Dossier personnalisé ${config.emergencyMode ? '(⚠️ Mode urgence)' : ''}</option>
                                </select>
                                
                                <!-- Zone d'aide dynamique -->
                                <div class="storage-help" id="storage-help-container">
                                    ${this.renderStorageHelp(config.storage)}
                                </div>
                            </div>
                            
                            <!-- Rétention -->
                            <div class="config-item">
                                <label>
                                    <i class="fas fa-history"></i>
                                    Nombre de sauvegardes à conserver
                                </label>
                                <select id="backup-retention" onchange="window.categoriesPageV22.updateBackupConfig('retention', parseInt(this.value))">
                                    <option value="5" ${config.retention === 5 ? 'selected' : ''}>5 sauvegardes</option>
                                    <option value="10" ${config.retention === 10 ? 'selected' : ''}>10 sauvegardes</option>
                                    <option value="20" ${config.retention === 20 ? 'selected' : ''}>20 sauvegardes</option>
                                    <option value="50" ${config.retention === 50 ? 'selected' : ''}>50 sauvegardes</option>
                                </select>
                            </div>
                            
                            <!-- Compression -->
                            <div class="config-item">
                                <label>
                                    <i class="fas fa-compress"></i>
                                    Compression des données
                                </label>
                                <label class="toggle-switch">
                                    <input type="checkbox" ${config.compression ? 'checked' : ''} 
                                           onchange="window.categoriesPageV22.updateBackupConfig('compression', this.checked)">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions de backup -->
                    <div class="backup-actions">
                        <button class="btn-backup primary" onclick="window.categoriesPageV22.createBackup()">
                            <i class="fas fa-save"></i>
                            Créer une sauvegarde maintenant
                        </button>
                        
                        <button class="btn-backup secondary" onclick="window.categoriesPageV22.showBackupHistory()">
                            <i class="fas fa-history"></i>
                            Historique des sauvegardes
                        </button>
                        
                        <button class="btn-backup info" onclick="window.categoriesPageV22.exportBackup()">
                            <i class="fas fa-download"></i>
                            Télécharger sauvegarde
                        </button>
                        
                        <button class="btn-backup warning" onclick="window.categoriesPageV22.importBackup()">
                            <i class="fas fa-upload"></i>
                            Restaurer sauvegarde
                        </button>
                    </div>
                    
                    <!-- Statistiques -->
                    <div class="backup-stats">
                        <h3><i class="fas fa-chart-bar"></i> Statistiques</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${backupStats.totalBackups}</span>
                                <span class="stat-label">Sauvegardes totales</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${backupStats.totalSize}</span>
                                <span class="stat-label">Taille totale</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${backupStats.categoriesCount}</span>
                                <span class="stat-label">Catégories</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${backupStats.tasksCount}</span>
                                <span class="stat-label">Tâches</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Section Paramètres Généraux -->
                <div class="general-settings">
                    <div class="section-header">
                        <h2><i class="fas fa-sliders-h"></i> Paramètres Généraux</h2>
                        <p>Configuration générale de l'application</p>
                    </div>
                    
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label>
                                <i class="fas fa-palette"></i>
                                Thème de l'interface
                            </label>
                            <select id="app-theme">
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                                <option value="auto">Automatique</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label>
                                <i class="fas fa-language"></i>
                                Langue
                            </label>
                            <select id="app-language">
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label>
                                <i class="fas fa-bell"></i>
                                Notifications
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU DE L'AIDE STOCKAGE
    // ================================================
    renderStorageHelp(storageType) {
        let helpText = '';
        let customFolderSection = '';
        
        switch (storageType) {
            case 'localStorage':
                helpText = '💾 Stocké dans votre navigateur. Rapide mais limité à cet appareil.';
                break;
            case 'indexedDB':
                helpText = '🗃️ Base de données locale plus robuste.';
                break;
            case 'download':
                helpText = '📥 Fichiers téléchargés automatiquement.';
                break;
            case 'custom-folder':
                helpText = '📁 Choisissez un dossier spécifique sur votre disque dur.';
                customFolderSection = this.renderCustomFolderSection();
                break;
            default:
                helpText = '💾 Sélectionnez un emplacement';
        }
        
        return `
            <small class="storage-help-text">
                ${helpText}
            </small>
            ${customFolderSection}
        `;
    }

    // ================================================
    // SECTION DOSSIER PERSONNALISÉ
    // ================================================
    renderCustomFolderSection() {
        const config = this.backupConfig;
        
        return `
            <div class="custom-folder-config" id="custom-folder-section">
                <div class="folder-selector">
                    <input type="text" 
                           id="custom-folder-path" 
                           placeholder="Configuration automatique en cours..." 
                           value="${config.customFolderPath || (config.needsFolderCreation ? 'Configuration par défaut: ' + config.customFolderPath : '')}" 
                           readonly>
                    <button class="btn-select-folder" onclick="window.categoriesPageV22.selectCustomFolder()">
                        <i class="fas fa-folder-open"></i>
                        ${config.customFolderPath ? 'Changer' : 'Configurer'}
                    </button>
                </div>
                
                <div class="folder-info">
                    <small>
                        <i class="fas fa-info-circle"></i>
                        ${config.needsFolderCreation ? 
                            'Dossier par défaut configuré - cliquez "Configurer" pour finaliser' :
                            'Un sous-dossier "EmailSortPro" sera créé automatiquement pour organiser vos sauvegardes'
                        }
                    </small>
                </div>
                
                <div class="folder-recommendations">
                    ${config.needsFolderCreation ? `
                        <div class="recommendation-item good">
                            <i class="fas fa-star"></i>
                            <span><strong>Configuration par défaut :</strong> ${config.customFolderPath}</span>
                        </div>
                        <div class="recommendation-item info">
                            <i class="fas fa-lightbulb"></i>
                            <span><strong>Alternative :</strong> Choisissez Documents, Google Drive, ou OneDrive si vous préférez</span>
                        </div>
                    ` : `
                        <div class="recommendation-item good">
                            <i class="fas fa-check-circle"></i>
                            <span><strong>Dossiers sûrs :</strong> Documents, Téléchargements, Bureau, Google Drive, OneDrive, Dropbox</span>
                        </div>
                        <div class="recommendation-item info">
                            <i class="fas fa-folder-plus"></i>
                            <span><strong>Organisation :</strong> Structure finale → VotreDossier/EmailSortPro/sauvegardes.json</span>
                        </div>
                    `}
                </div>
                
                ${!window.showDirectoryPicker ? `
                    <div class="folder-warning">
                        <small>
                            <i class="fas fa-exclamation-triangle"></i>
                            Cette fonctionnalité nécessite Chrome ou Edge pour fonctionner
                        </small>
                    </div>
                ` : ''}
                
                ${config.customFolderPath && !config.needsFolderCreation ? `
                    <div class="folder-actions">
                        <button class="btn-test-folder" onclick="window.categoriesPageV22.createTestBackup()">
                            <i class="fas fa-vial"></i>
                            Tester le dossier
                        </button>
                        <button class="btn-clear-folder" onclick="window.categoriesPageV22.clearCustomFolder()">
                            <i class="fas fa-times"></i>
                            Réinitialiser
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchMainTab(tabName) {
        this.currentTab = tabName;
        
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTabButton = document.querySelector(`.main-tab[onclick*="${tabName}"]`);
        if (activeTabButton) {
            activeTabButton.classList.add('active');
        }
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTabContent = document.getElementById(`${tabName}-tab`);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }
    }

    // ================================================
    // SYSTÈME DE BACKUP - CONFIGURATION
    // ================================================
    loadBackupConfig() {
        try {
            const saved = localStorage.getItem('emailsortpro_backup_config');
            const defaultConfig = {
                enabled: true,
                frequency: 'daily',
                storage: 'custom-folder',
                retention: 10,
                compression: true,
                lastBackup: null,
                nextBackup: null,
                customFolderPath: null,
                customFolderHandle: null,
                autoSetupDone: false,
                emergencyMode: false
            };
            
            const config = saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
            
            // Auto-setup du dossier Program Files à la première utilisation
            if (!config.autoSetupDone && !config.customFolderPath) {
                this.setupDefaultProgramFilesFolder(config);
            }
            
            return config;
        } catch (error) {
            console.error('[Backup] Erreur chargement config:', error);
            const defaultConfig = {
                enabled: true,
                frequency: 'daily',
                storage: 'custom-folder',
                retention: 10,
                compression: true,
                lastBackup: null,
                nextBackup: null,
                customFolderPath: null,
                customFolderHandle: null,
                autoSetupDone: false,
                emergencyMode: false
            };
            
            this.setupDefaultProgramFilesFolder(defaultConfig);
            return defaultConfig;
        }
    }

    setupDefaultProgramFilesFolder(config) {
        try {
            const isWindows = navigator.platform.toLowerCase().includes('win');
            
            if (isWindows) {
                const is64Bit = navigator.userAgent.includes('WOW64') || 
                               navigator.userAgent.includes('Win64') || 
                               navigator.platform === 'Win64';
                
                const programFilesPath = is64Bit ? 
                    'C:\\Program Files\\EmailSortPro' : 
                    'C:\\Program Files (x86)\\EmailSortPro';
                
                config.customFolderPath = programFilesPath;
                config.autoSetupDone = true;
                config.needsFolderCreation = true;
                
            } else {
                const isMac = navigator.platform.toLowerCase().includes('mac');
                const defaultPath = isMac ? 
                    '/Applications/EmailSortPro' : 
                    '~/EmailSortPro';
                
                config.customFolderPath = defaultPath;
                config.autoSetupDone = true;
                config.needsFolderCreation = true;
            }
            
            localStorage.setItem('emailsortpro_backup_config', JSON.stringify(config));
            
        } catch (error) {
            console.error('[Backup] Erreur setup automatique:', error);
        }
    }

    saveBackupConfig() {
        try {
            const configToSave = { ...this.backupConfig };
            delete configToSave.customFolderHandle;
            
            localStorage.setItem('emailsortpro_backup_config', JSON.stringify(configToSave));
            console.log('[Backup] Configuration sauvegardée');
        } catch (error) {
            console.error('[Backup] Erreur sauvegarde config:', error);
        }
    }

    updateBackupConfig(key, value) {
        this.backupConfig[key] = value;
        this.saveBackupConfig();
        
        if (key === 'frequency' && this.backupConfig.enabled) {
            this.calculateNextBackup();
        }
        
        this.showToast(`Configuration mise à jour: ${key}`, 'success');
    }

    updateBackupStorageConfig(storageType) {
        this.backupConfig.storage = storageType;
        this.saveBackupConfig();
        this.refreshStorageHelp(storageType);
        this.showToast(`Stockage mis à jour: ${storageType}`, 'success');
    }

    refreshStorageHelp(storageType) {
        const helpContainer = document.getElementById('storage-help-container');
        if (helpContainer) {
            helpContainer.innerHTML = this.renderStorageHelp(storageType);
        }
    }

    toggleBackup(enabled) {
        this.backupConfig.enabled = enabled;
        
        if (enabled) {
            this.calculateNextBackup();
            this.showToast('Sauvegarde automatique activée', 'success');
        } else {
            this.backupConfig.nextBackup = null;
            this.showToast('Sauvegarde automatique désactivée', 'info');
        }
        
        this.saveBackupConfig();
        this.refreshSettingsTab();
    }

    calculateNextBackup() {
        if (!this.backupConfig.enabled || this.backupConfig.frequency === 'manual') {
            this.backupConfig.nextBackup = null;
            return;
        }
        
        const now = new Date();
        let nextBackup = new Date(now);
        
        switch (this.backupConfig.frequency) {
            case 'daily':
                nextBackup.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                nextBackup.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                nextBackup.setMonth(now.getMonth() + 1);
                break;
        }
        
        this.backupConfig.nextBackup = nextBackup.toISOString();
        this.saveBackupConfig();
    }

    // ================================================
    // SÉLECTION DE DOSSIER
    // ================================================
    async selectCustomFolder() {
        try {
            if (!window.showDirectoryPicker) {
                this.showToast('❌ Cette fonctionnalité nécessite un navigateur moderne (Chrome/Edge)', 'error');
                return;
            }
            
            if (this.backupConfig.needsFolderCreation && this.backupConfig.customFolderPath) {
                const shouldUseProgramFiles = confirm(
                    `📁 Configuration du dossier de sauvegarde\n\n` +
                    `Le dossier par défaut est configuré sur :\n` +
                    `${this.backupConfig.customFolderPath}\n\n` +
                    `• Cliquez "OK" pour utiliser ce dossier par défaut\n` +
                    `• Cliquez "Annuler" pour choisir un autre emplacement\n\n` +
                    `Note : Le dossier sera créé automatiquement s'il n'existe pas.`
                );
                
                if (shouldUseProgramFiles) {
                    return await this.setupProgramFilesWithAPI();
                }
            }
            
            return await this.selectCustomFolderManual();
            
        } catch (error) {
            console.error('[Backup] Erreur sélection dossier:', error);
            this.handleFolderSelectionError(error);
        }
    }

    async setupProgramFilesWithAPI() {
        try {
            this.showToast('🔧 Configuration du dossier Program Files...', 'info');
            
            const pickerOptions = {
                mode: 'readwrite',
                startIn: 'desktop',
                id: 'emailsortpro-programfiles-setup'
            };
            
            const programFilesHandle = await window.showDirectoryPicker(pickerOptions);
            
            let emailSortProFolder;
            try {
                emailSortProFolder = await programFilesHandle.getDirectoryHandle('EmailSortPro', {
                    create: true
                });
                
                this.showToast('✅ Dossier EmailSortPro créé dans Program Files', 'success');
                
            } catch (createError) {
                if (createError.name === 'NotAllowedError') {
                    this.showToast('❌ Permission refusée pour Program Files. Choisissez un autre dossier.', 'warning');
                    return await this.selectCustomFolderManual();
                }
                throw createError;
            }
            
            await this.testFolderWriteAccess(emailSortProFolder);
            
            this.backupConfig.customFolderHandle = emailSortProFolder;
            this.backupConfig.customFolderPath = `${programFilesHandle.name}/EmailSortPro`;
            this.backupConfig.needsFolderCreation = false;
            this.saveBackupConfig();
            
            const pathInput = document.getElementById('custom-folder-path');
            if (pathInput) {
                pathInput.value = this.backupConfig.customFolderPath;
            }
            
            this.showToast(`✅ Dossier configuré: ${this.backupConfig.customFolderPath}`, 'success');
            
        } catch (error) {
            console.error('[Backup] Erreur setup Program Files:', error);
            
            if (error.name === 'AbortError') {
                const tryManual = confirm('Sélection annulée.\n\nVoulez-vous choisir un autre dossier manuellement ?');
                if (tryManual) {
                    return await this.selectCustomFolderManual();
                }
            } else {
                this.handleFolderSelectionError(error);
            }
        }
    }

    async selectCustomFolderManual() {
        const hasShownWarning = localStorage.getItem('emailsortpro_folder_warning_shown');
        
        if (!hasShownWarning) {
            const userConfirmed = confirm(
                '📁 Sélection du dossier de sauvegarde\n\n' +
                '✅ DOSSIERS SÛRS :\n' +
                '• Documents, Téléchargements, Bureau\n' +
                '• Google Drive, OneDrive, Dropbox\n\n' +
                '💡 Un sous-dossier "EmailSortPro" sera créé automatiquement\n\n' +
                'Continuer ?'
            );
            
            if (!userConfirmed) return;
            localStorage.setItem('emailsortpro_folder_warning_shown', 'true');
        }
        
        const pickerOptions = {
            mode: 'readwrite',
            startIn: 'documents',
            id: 'emailsortpro-backup-folder'
        };
        
        const parentDirectoryHandle = await window.showDirectoryPicker(pickerOptions);
        
        let emailSortProFolder;
        try {
            emailSortProFolder = await parentDirectoryHandle.getDirectoryHandle('EmailSortPro');
        } catch (error) {
            emailSortProFolder = await parentDirectoryHandle.getDirectoryHandle('EmailSortPro', {
                create: true
            });
            this.showToast('📁 Dossier "EmailSortPro" créé dans ' + parentDirectoryHandle.name, 'info');
        }
        
        await this.testFolderWriteAccess(emailSortProFolder);
        
        this.backupConfig.customFolderHandle = emailSortProFolder;
        this.backupConfig.customFolderPath = `${parentDirectoryHandle.name}/EmailSortPro`;
        this.backupConfig.needsFolderCreation = false;
        this.saveBackupConfig();
        
        const pathInput = document.getElementById('custom-folder-path');
        if (pathInput) {
            pathInput.value = this.backupConfig.customFolderPath;
        }
        
        this.showToast(`✅ Dossier configuré: ${this.backupConfig.customFolderPath}`, 'success');
    }

    handleFolderSelectionError(error) {
        if (error.name === 'AbortError') {
            console.log('[Backup] Sélection annulée');
        } else if (error.name === 'SecurityError') {
            this.showToast('❌ Accès refusé. Le dossier est protégé.', 'error');
        } else if (error.name === 'NotAllowedError') {
            this.showToast('❌ Permission refusée. Choisissez un dossier personnel.', 'error');
        } else {
            this.showToast('❌ Erreur lors de la sélection du dossier.', 'error');
        }
    }

    async testFolderWriteAccess(directoryHandle) {
        const testFileName = '.emailsortpro-test-access';
        
        try {
            const testFileHandle = await directoryHandle.getFileHandle(testFileName, {
                create: true
            });
            
            const writable = await testFileHandle.createWritable();
            await writable.write('test-access-' + Date.now());
            await writable.close();
            
            await directoryHandle.removeEntry(testFileName);
            return true;
            
        } catch (error) {
            throw new Error('Impossible d\'écrire dans ce dossier');
        }
    }

    // ================================================
    // CRÉATION DE SAUVEGARDE
    // ================================================
    async createBackup() {
        try {
            this.showToast('Création de la sauvegarde en cours...', 'info');
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '22.2',
                data: {
                    categories: this.getCategoriesToBackup(),
                    tasks: this.getTasksToBackup(),
                    settings: this.getSettingsToBackup()
                }
            };
            
            let dataToStore = JSON.stringify(backupData, null, 2);
            if (this.backupConfig.compression) {
                dataToStore = this.compressData(dataToStore);
            }
            
            await this.storeBackup(dataToStore, backupData.timestamp);
            
            this.backupConfig.lastBackup = backupData.timestamp;
            this.calculateNextBackup();
            this.saveBackupConfig();
            
            this.cleanupOldBackups();
            this.showToast('✅ Sauvegarde créée avec succès!', 'success');
            
        } catch (error) {
            console.error('[Backup] Erreur création:', error);
            this.showToast('❌ Erreur lors de la création de la sauvegarde', 'error');
        }
    }

    async storeBackup(data, timestamp) {
        const backupKey = `emailsortpro_backup_${timestamp.replace(/[:.]/g, '-')}`;
        
        switch (this.backupConfig.storage) {
            case 'localStorage':
                localStorage.setItem(backupKey, data);
                break;
            case 'download':
                this.downloadBackup(data, timestamp);
                break;
            case 'custom-folder':
                await this.storeInCustomFolder(data, timestamp);
                break;
        }
    }

    async storeInCustomFolder(data, timestamp) {
        try {
            if (!this.backupConfig.customFolderHandle) {
                throw new Error('Aucun dossier sélectionné');
            }
            
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
            
            const fileHandle = await this.backupConfig.customFolderHandle.getFileHandle(fileName, {
                create: true
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(data);
            await writable.close();
            
            this.showToast(`💾 Sauvegarde créée: ${fileName}`, 'success');
            
        } catch (error) {
            console.error('[Backup] Erreur stockage:', error);
            
            if (error.name === 'InvalidStateError') {
                this.backupConfig.emergencyMode = true;
                this.saveBackupConfig();
                await this.createEmergencyBackup(data, timestamp);
                this.refreshSettingsTab();
            } else {
                this.showToast('❌ Erreur lors de la sauvegarde', 'error');
            }
        }
    }

    async createEmergencyBackup(data, timestamp) {
        try {
            const emergencyKey = `emailsortpro_emergency_backup_${timestamp.replace(/[:.]/g, '-')}`;
            localStorage.setItem(emergencyKey, data);
            this.downloadBackup(data, timestamp);
            
            this.showToast('🚨 Sauvegarde d\'urgence créée!', 'warning');
            
            setTimeout(() => {
                if (confirm('Le dossier de sauvegarde n\'est plus accessible.\nVoulez-vous reconfigurer un nouveau dossier ?')) {
                    this.selectCustomFolder();
                }
            }, 2000);
            
        } catch (error) {
            console.error('[Backup] Erreur sauvegarde d\'urgence:', error);
            this.showToast('❌ Erreur critique de sauvegarde!', 'error');
        }
    }

    downloadBackup(data, timestamp) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `emailsortpro-backup-${timestamp.split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    fixEmergencyMode() {
        if (confirm('Désactiver le mode urgence et reconfigurer un nouveau dossier ?')) {
            this.backupConfig.emergencyMode = false;
            this.backupConfig.customFolderHandle = null;
            this.backupConfig.customFolderPath = null;
            this.backupConfig.needsFolderCreation = true;
            
            this.setupDefaultProgramFilesFolder(this.backupConfig);
            this.saveBackupConfig();
            this.refreshSettingsTab();
            
            this.showToast('🔧 Mode urgence désactivé', 'success');
            
            setTimeout(() => {
                if (confirm('Configurer un nouveau dossier maintenant ?')) {
                    this.selectCustomFolder();
                }
            }, 1500);
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getCategoriesToBackup() {
        const categories = window.categoryManager?.getCategories() || {};
        const result = {};
        
        Object.entries(categories).forEach(([id, category]) => {
            result[id] = {
                ...category,
                keywords: window.categoryManager?.getCategoryKeywords?.(id) || {}
            };
        });
        
        return result;
    }

    getTasksToBackup() {
        if (!window.taskManager?.getAllTasks) return [];
        try {
            return window.taskManager.getAllTasks();
        } catch (error) {
            return [];
        }
    }

    getTasksCount() {
        try {
            return window.taskManager?.getAllTasks?.()?.length || 0;
        } catch {
            return 0;
        }
    }

    getSettingsToBackup() {
        return {
            categorySettings: this.loadSettings(),
            backupConfig: this.backupConfig,
            appVersion: '22.2'
        };
    }

    compressData(data) {
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            return data;
        }
    }

    cleanupOldBackups() {
        const maxBackups = this.backupConfig.retention;
        
        if (this.backupConfig.storage === 'localStorage') {
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_backup_'))
                .sort()
                .reverse();
            
            if (backupKeys.length > maxBackups) {
                const toDelete = backupKeys.slice(maxBackups);
                toDelete.forEach(key => localStorage.removeItem(key));
            }
        }
    }

    getBackupStats() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('emailsortpro_backup_'));
        
        let totalSize = 0;
        backupKeys.forEach(key => {
            totalSize += (localStorage.getItem(key) || '').length;
        });
        
        return {
            totalBackups: backupKeys.length,
            totalSize: this.formatBytes(totalSize),
            categoriesCount: Object.keys(window.categoryManager?.getCategories() || {}).length,
            tasksCount: this.getTasksCount(),
            lastBackup: this.backupConfig.lastBackup ? 
                new Date(this.backupConfig.lastBackup).toLocaleString('fr-FR') : 
                'Jamais'
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    initializeBackupSystem() {
        this.scheduleAutomaticBackups();
    }

    scheduleAutomaticBackups() {
        if (!this.backupConfig.enabled || this.backupConfig.frequency === 'manual') {
            return;
        }
        
        if (this.backupConfig.nextBackup) {
            const nextBackup = new Date(this.backupConfig.nextBackup);
            const now = new Date();
            
            if (now >= nextBackup) {
                this.createBackup();
            }
        }
        
        setTimeout(() => {
            this.scheduleAutomaticBackups();
        }, 60000);
    }

    refreshSettingsTab() {
        const settingsTab = document.getElementById('settings-tab');
        if (settingsTab && this.currentTab === 'settings') {
            settingsTab.innerHTML = this.renderSettingsTab();
        }
    }

    // ================================================
    // MÉTHODES CATÉGORIES
    // ================================================
    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state-v22">
                    <div class="empty-icon">🔍</div>
                    <p>Aucune catégorie trouvée</p>
                </div>
            `;
        }
        
        return Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories))
            .join('');
    }

    renderCategoryCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        const settings = this.loadSettings();
        const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
        
        return `
            <div class="category-card-v22 ${!isActive ? 'inactive' : ''}" 
                 data-id="${id}"
                 style="--cat-color: ${category.color}"
                 onclick="window.categoriesPageV22.openModal('${id}')">
                
                <div class="card-header-v22">
                    <div class="cat-emoji">${category.icon}</div>
                    <div class="cat-info">
                        <div class="cat-name">${category.name}</div>
                        <div class="cat-meta">
                            <span class="meta-count">${stats.keywords} mots-clés</span>
                            ${stats.absolute > 0 ? `<span class="meta-star">★ ${stats.absolute}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="card-actions-v22" onclick="event.stopPropagation()">
                    <button class="btn-minimal ${isActive ? 'on' : 'off'}" 
                            onclick="window.categoriesPageV22.toggleCategory('${id}')">
                        ${isActive ? 'ON' : 'OFF'}
                    </button>
                    <button class="btn-minimal task ${isPreselected ? 'selected' : ''}" 
                            onclick="window.categoriesPageV22.togglePreselection('${id}')">
                        <i class="fas fa-${isPreselected ? 'check-square' : 'square'}"></i>
                    </button>
                    <button class="btn-minimal config" 
                            onclick="window.categoriesPageV22.openModal('${id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
    }

    filterCategories(categories) {
        if (!this.searchTerm) return categories;
        
        const filtered = {};
        Object.entries(categories).forEach(([id, category]) => {
            if (category.name.toLowerCase().includes(this.searchTerm)) {
                filtered[id] = category;
            }
        });
        return filtered;
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
    }

    updateCategoriesDisplay() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    getCategoryStats(categoryId) {
        const keywords = window.categoryManager?.getCategoryKeywords?.(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return {
            keywords: keywords.absolute.length + keywords.strong.length + 
                     keywords.weak.length + keywords.exclusions.length,
            absolute: keywords.absolute.length
        };
    }

    getActiveCount(categories, activeCategories) {
        if (!activeCategories) return Object.keys(categories).length;
        return activeCategories.filter(id => categories[id]).length;
    }

    getTotalKeywords(categories) {
        let total = 0;
        Object.keys(categories).forEach(id => {
            const stats = this.getCategoryStats(id);
            total += stats.keywords;
        });
        return total;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        } catch (error) {
            return { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde:', error);
        }
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || null;
        
        if (activeCategories === null) {
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            activeCategories = allCategories.filter(id => id !== categoryId);
        } else {
            if (activeCategories.includes(categoryId)) {
                activeCategories = activeCategories.filter(id => id !== categoryId);
            } else {
                activeCategories.push(categoryId);
            }
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        this.updateCategoriesDisplay();
        this.showToast('État de la catégorie mis à jour');
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        const isPreselected = taskPreselectedCategories.includes(categoryId);
        
        if (isPreselected) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
        }
        
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        this.updateCategoriesDisplay();
        
        const category = window.categoryManager?.getCategory(categoryId);
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message);
    }

    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

    // ================================================
    // MODALS
    // ================================================
    openModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) {
            this.showToast('❌ Catégorie introuvable', 'error');
            return;
        }
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="keywords-grid">
                            ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute, '#FF6B6B', 'fa-star')}
                            ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong, '#FECA57', 'fa-bolt')}
                            ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak, '#54A0FF', 'fa-feather')}
                            ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions, '#A29BFE', 'fa-ban')}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPageV22.save()">
                            <i class="fas fa-check"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    renderKeywordBox(type, title, keywords, color, icon) {
        return `
            <div class="keyword-box">
                <div class="box-header">
                    <h4><i class="fas ${icon}"></i> ${title}</h4>
                    <span class="box-count" style="background: ${color}20; color: ${color}">${keywords.length}</span>
                </div>
                <div class="input-modern">
                    <input type="text" id="${type}-input" placeholder="Ajouter un mot-clé..." 
                           onkeypress="if(event.key === 'Enter') window.categoriesPageV22.addKeyword('${type}', '${color}')">
                    <button style="background: ${color}" onclick="window.categoriesPageV22.addKeyword('${type}', '${color}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tags" id="${type}-items">
                    ${keywords.map(k => `
                        <span class="tag" style="background: ${color}15; color: ${color}">
                            ${k}
                            <button onclick="window.categoriesPageV22.removeItem('${type}', '${k}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    addKeyword(type, color) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-items`);
        
        if (!container) return;
        
        container.insertAdjacentHTML('beforeend', `
            <span class="tag" style="background: ${color}15; color: ${color}">
                ${value}
                <button onclick="window.categoriesPageV22.removeItem('${type}', '${value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    removeItem(type, value) {
        const container = document.getElementById(`${type}-items`);
        if (!container) return;
        
        const tags = container.querySelectorAll('.tag');
        tags.forEach(tag => {
            const text = tag.textContent.trim().replace(/×$/, '').trim();
            if (text === value || text.includes(value)) {
                tag.remove();
            }
        });
    }

    save() {
        if (!this.editingCategoryId) return;
        
        try {
            const getItems = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return [];
                return Array.from(container.querySelectorAll('.tag')).map(tag => {
                    const text = tag.textContent.trim();
                    return text.replace(/×$/, '').replace(/^[^\s]+\s/, '').trim();
                });
            };
            
            const keywords = {
                absolute: getItems('absolute-items'),
                strong: getItems('strong-items'),
                weak: getItems('weak-items'),
                exclusions: getItems('exclusions-items')
            };
            
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            
            this.closeModal();
            this.showToast('💾 Modifications enregistrées!');
            this.updateCategoriesDisplay();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            this.showToast('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `<div class="toast-content">${message}</div>`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderError() {
        return `
            <div class="error-state">
                <div class="error-icon">😵</div>
                <h3>Oups! Une erreur est survenue</h3>
                <button class="btn-modern primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesModernStylesV22')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesModernStylesV22';
        styles.textContent = `
            /* Variables globales V22 */
            .categories-modern-v22 {
                --primary: #6366F1;
                --secondary: #EC4899;
                --success: #10B981;
                --warning: #F59E0B;
                --danger: #EF4444;
                --bg: #F9FAFB;
                --surface: #FFFFFF;
                --text: #111827;
                --text-secondary: #6B7280;
                --border: #E5E7EB;
                --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                
                padding: 24px;
                min-height: 100vh;
                background: var(--bg);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                color: var(--text);
            }
            
            /* Header avec onglets */
            .header-modern-v22 {
                margin-bottom: 32px;
                background: var(--surface);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: var(--shadow);
                border: 1px solid var(--border);
            }
            
            .header-content-v22 {
                padding: 32px 32px 0 32px;
            }
            
            .header-content-v22 h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--text);
            }
            
            .subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 0 0 24px 0;
            }
            
            /* Onglets principaux */
            .main-tabs {
                display: flex;
                background: #F8FAFC;
                border-top: 1px solid var(--border);
            }
            
            .main-tab {
                flex: 1;
                padding: 16px 24px;
                border: none;
                background: transparent;
                color: var(--text-secondary);
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .main-tab:hover {
                background: #F1F5F9;
                color: var(--text);
            }
            
            .main-tab.active {
                background: var(--surface);
                color: var(--primary);
                border-bottom: 3px solid var(--primary);
            }
            
            .main-tab i {
                font-size: 16px;
            }
            
            /* Contenu des onglets */
            .tab-content-wrapper {
                margin-top: 24px;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            /* Section Catégories */
            .categories-section {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* Stats bar V22 */
            .stats-bar-v22 {
                display: grid;
                grid-template-columns: repeat(3, 120px) 1fr;
                gap: 16px;
                margin-bottom: 24px;
                padding: 0 8px;
            }
            
            .stat-card-v22 {
                background: var(--surface);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                border: 1px solid var(--border);
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card-v22::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--accent);
                opacity: 0.8;
            }
            
            .stat-card-v22:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--accent);
            }
            
            .stat-label {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 4px;
            }
            
            /* Recherche V22 */
            .search-modern-v22 {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-modern-v22 i {
                position: absolute;
                left: 16px;
                color: var(--text-secondary);
                pointer-events: none;
            }
            
            .search-modern-v22 input {
                width: 100%;
                padding: 14px 16px 14px 44px;
                border: 1px solid var(--border);
                border-radius: 12px;
                font-size: 15px;
                background: var(--surface);
                transition: all 0.3s;
            }
            
            .search-modern-v22 input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            /* Actions rapides */
            .quick-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
                padding: 0 8px;
            }
            
            .btn-create-v22 {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            
            .btn-create-v22:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }
            
            .btn-action-v22 {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                background: var(--surface);
                color: var(--text);
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-action-v22:hover {
                border-color: var(--primary);
                color: var(--primary);
                transform: translateY(-1px);
            }
            
            /* Grille catégories V22 */
            .categories-grid-v22 {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
                padding: 8px;
            }
            
            .category-card-v22 {
                background: var(--surface);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid var(--border);
                transition: all 0.3s;
                cursor: pointer;
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 16px;
                min-height: 140px;
            }
            
            .category-card-v22:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                border-color: var(--cat-color);
            }
            
            .category-card-v22.inactive {
                opacity: 0.6;
                background: #F5F5F5;
            }
            
            .card-header-v22 {
                display: flex;
                align-items: flex-start;
                gap: 16px;
            }
            
            .cat-emoji {
                font-size: 32px;
                width: 60px;
                height: 60px;
                background: var(--cat-color)15;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .cat-info {
                flex: 1;
                min-width: 0;
            }
            
            .cat-name {
                font-size: 18px;
                font-weight: 600;
                color: var(--text);
                line-height: 1.3;
                margin-bottom: 6px;
            }
            
            .cat-meta {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .meta-count {
                font-size: 13px;
                color: var(--text-secondary);
            }
            
            .meta-star {
                font-size: 13px;
                color: #F59E0B;
                font-weight: 600;
            }
            
            .card-actions-v22 {
                display: flex;
                gap: 8px;
                margin-top: auto;
            }
            
            .btn-minimal {
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid #E5E7EB;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .btn-minimal:hover {
                transform: scale(1.05);
            }
            
            .btn-minimal.on {
                background: #10B981;
                color: white;
                border-color: #10B981;
            }
            
            .btn-minimal.off {
                background: #EF4444;
                color: white;
                border-color: #EF4444;
            }
            
            .btn-minimal.task {
                color: #9CA3AF;
            }
            
            .btn-minimal.task.selected {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            
            .btn-minimal.config {
                color: #6B7280;
            }
            
            /* Section Paramètres */
            .settings-section {
                max-width: 1000px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: 32px;
            }
            
            .section-header {
                margin-bottom: 24px;
            }
            
            .section-header h2 {
                font-size: 24px;
                font-weight: 600;
                color: var(--text);
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .section-header p {
                font-size: 15px;
                color: var(--text-secondary);
                margin: 0;
            }
            
            /* Section Backup */
            .backup-section {
                background: var(--surface);
                border-radius: 16px;
                padding: 32px;
                border: 1px solid var(--border);
                box-shadow: var(--shadow);
            }
            
            .backup-status {
                margin-bottom: 32px;
            }
            
            .status-card {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 24px;
                border-radius: 12px;
                border: 2px solid;
                transition: all 0.3s;
            }
            
            .status-card.enabled {
                background: #F0FDF4;
                border-color: #10B981;
            }
            
            .status-card.disabled {
                background: #FEF2F2;
                border-color: #EF4444;
            }
            
            .status-card.emergency {
                background: #FEF3C7;
                border-color: #F59E0B;
                animation: pulse-warning 2s infinite;
            }
            
            @keyframes pulse-warning {
                0%, 100% { border-color: #F59E0B; }
                50% { border-color: #EF4444; }
            }
            
            .status-indicator {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
            }
            
            .status-card.enabled .status-indicator {
                background: #10B981;
            }
            
            .status-card.disabled .status-indicator {
                background: #EF4444;
            }
            
            .status-card.emergency .status-indicator {
                background: #F59E0B;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .status-info {
                flex: 1;
            }
            
            .status-info h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 6px 0;
                color: var(--text);
            }
            
            .status-info p {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0;
            }
            
            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 34px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-slider {
                background-color: var(--primary);
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }
            
            .btn-fix-emergency {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: #EF4444;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-fix-emergency:hover {
                background: #DC2626;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            /* Configuration du backup */
            .backup-config {
                margin-bottom: 32px;
            }
            
            .config-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            
            .config-item {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .config-item label {
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .config-item select {
                padding: 12px 16px;
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 14px;
                background: var(--surface);
                transition: all 0.3s;
            }
            
            .config-item select:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .storage-help {
                margin-top: 8px;
            }
            
            .storage-help-text {
                display: block;
                font-size: 12px;
                color: var(--text-secondary);
                font-style: italic;
                padding: 6px 10px;
                background: #F8FAFC;
                border-radius: 6px;
                border-left: 3px solid var(--primary);
            }
            
            /* Configuration dossier personnalisé */
            .custom-folder-config {
                margin-top: 16px;
                padding: 16px;
                background: #F8FAFC;
                border: 1px solid var(--border);
                border-radius: 8px;
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .folder-selector {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .folder-selector input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: white;
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .btn-select-folder {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
            }
            
            .btn-select-folder:hover {
                background: #5558E3;
                transform: translateY(-1px);
            }
            
            .folder-info {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            .folder-info small {
                font-size: 12px;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .folder-info i {
                color: var(--primary);
            }
            
            .folder-recommendations {
                margin: 12px 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .recommendation-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
            }
            
            .recommendation-item.good {
                background: #F0FDF4;
                border: 1px solid #10B981;
                color: #065F46;
            }
            
            .recommendation-item.good i {
                color: #10B981;
            }
            
            .recommendation-item.good i.fa-star {
                color: #F59E0B;
            }
            
            .recommendation-item.info {
                background: #EBF8FF;
                border: 1px solid #3B82F6;
                color: #1E3A8A;
            }
            
            .recommendation-item.info i {
                color: #3B82F6;
            }
            
            .folder-warning {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 6px;
                margin-top: 8px;
            }
            
            .folder-warning small {
                font-size: 12px;
                color: #92400E;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .folder-warning i {
                color: #F59E0B;
            }
            
            .folder-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .btn-test-folder {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #06B6D4;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-test-folder:hover {
                background: #0891B2;
                transform: translateY(-1px);
            }
            
            .btn-clear-folder {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #EF4444;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-clear-folder:hover {
                background: #DC2626;
                transform: translateY(-1px);
            }
            
            /* Actions de backup */
            .backup-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 32px;
            }
            
            .btn-backup {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 14px 20px;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-backup.primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-backup.primary:hover {
                background: #5558E3;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            
            .btn-backup.secondary {
                background: var(--surface);
                color: var(--text);
                border: 1px solid var(--border);
            }
            
            .btn-backup.secondary:hover {
                border-color: var(--primary);
                color: var(--primary);
            }
            
            .btn-backup.info {
                background: #06B6D4;
                color: white;
            }
            
            .btn-backup.info:hover {
                background: #0891B2;
                transform: translateY(-2px);
            }
            
            .btn-backup.warning {
                background: var(--warning);
                color: white;
            }
            
            .btn-backup.warning:hover {
                background: #D97706;
                transform: translateY(-2px);
            }
            
            /* Statistiques */
            .backup-stats h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--text);
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }
            
            .stat-item {
                text-align: center;
                padding: 16px;
                background: #F8FAFC;
                border-radius: 8px;
                border: 1px solid var(--border);
            }
            
            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            /* Paramètres généraux */
            .general-settings {
                background: var(--surface);
                border-radius: 16px;
                padding: 32px;
                border: 1px solid var(--border);
                box-shadow: var(--shadow);
            }
            
            .settings-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }
            
            .setting-item {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .setting-item label {
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .setting-item select {
                padding: 12px 16px;
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 14px;
                background: var(--surface);
                transition: all 0.3s;
            }
            
            .setting-item select:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            /* États vides */
            .empty-state-v22 {
                text-align: center;
                padding: 80px 20px;
                grid-column: 1 / -1;
            }
            
            .empty-icon {
                font-size: 64px;
                margin-bottom: 16px;
                display: block;
            }
            
            .empty-state-v22 p {
                font-size: 18px;
                color: var(--text-secondary);
                margin: 0 0 20px 0;
            }
            
            /* Modal moderne */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-modern {
                background: #FFFFFF;
                border-radius: 24px;
                width: 100%;
                max-width: 900px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s;
                border: 2px solid var(--border);
                overflow: hidden;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                padding: 28px;
                border-bottom: 2px solid #D1D5DB;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #FFFFFF;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-icon {
                font-size: 32px;
            }
            
            .modal-header h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }
            
            .btn-close {
                width: 40px;
                height: 40px;
                border: none;
                background: var(--bg);
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .btn-close:hover {
                background: var(--danger)10;
                color: var(--danger);
            }
            
            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
                background: #F8FAFC;
            }
            
            .modal-footer {
                padding: 24px 28px;
                border-top: 2px solid #D1D5DB;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #FFFFFF;
            }
            
            /* Keywords grid */
            .keywords-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            
            .keyword-box {
                background: #FFFFFF;
                border: 2px solid var(--border);
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .keyword-box:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            
            .box-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .box-header h4 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .box-count {
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .input-modern {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .input-modern input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid var(--border);
                border-radius: 10px;
                font-size: 15px;
                transition: all 0.3s;
            }
            
            .input-modern input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .input-modern button {
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 10px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .input-modern button:hover {
                transform: scale(1.1);
            }
            
            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 40px;
                background: #FAFBFC;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid #E5E7EB;
            }
            
            .tag {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.3s;
            }
            
            .tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.6;
                transition: opacity 0.3s;
                font-size: 10px;
            }
            
            .tag button:hover {
                opacity: 1;
            }
            
            /* Boutons modernes */
            .btn-modern {
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-modern.primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-modern.primary:hover {
                background: #5558E3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            
            .btn-modern.secondary {
                background: var(--bg);
                color: var(--text-secondary);
                border: 2px solid var(--border);
            }
            
            .btn-modern.secondary:hover {
                background: var(--surface);
                border-color: var(--text-secondary);
            }
            
            /* Toast moderne */
            .toast-modern {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--text);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                transition: transform 0.3s;
                z-index: 2000;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .toast-modern.show {
                transform: translateX(-50%) translateY(0);
            }
            
            .toast-modern.success {
                background: var(--success);
            }
            
            .toast-modern.warning {
                background: var(--warning);
            }
            
            .toast-modern.error {
                background: var(--danger);
            }
            
            .toast-modern.info {
                background: #06B6D4;
            }
            
            /* Responsive */
            @media (max-width: 1024px) {
                .stats-bar-v22 {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .search-modern-v22 {
                    grid-column: 1 / -1;
                    margin-top: 16px;
                }
                
                .config-grid {
                    grid-template-columns: 1fr;
                }
                
                .backup-actions {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .settings-grid {
                    grid-template-columns: 1fr;
                }
                
                .keywords-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .categories-modern-v22 {
                    padding: 16px;
                }
                
                .header-content-v22 {
                    padding: 24px 24px 0 24px;
                }
                
                .header-content-v22 h1 {
                    font-size: 24px;
                }
                
                .main-tabs {
                    flex-direction: column;
                }
                
                .main-tab {
                    padding: 12px 16px;
                    font-size: 14px;
                }
                
                .categories-grid-v22 {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                
                .quick-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .backup-section,
                .general-settings {
                    padding: 24px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE V22.2
// ================================================

// Créer l'instance avec un nom unique
window.categoriesPageV22 = new CategoriesPageV22();

// Créer un alias pour maintenir la compatibilité
window.categoriesPage = window.categoriesPageV22;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV22.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV22.render(container);
    };
}

// Assurer la compatibilité
if (!window.categoriesPage.getTaskPreselectedCategories) {
    window.categoriesPage.getTaskPreselectedCategories = function() {
        return window.categoriesPageV22.getTaskPreselectedCategories?.() || [];
    };
}

console.log('[CategoriesPage] ✅ CategoriesPage v22.2 chargée - Affichage réparé et système de récupération automatique actif!');
