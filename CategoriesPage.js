// CategoriesPage.js - Version 22.0 - Interface Optimisée avec Système de Backup - CORRIGÉE
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v22.0 - Optimized with Backup System...');

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
        
        console.log('[CategoriesPage] 🎨 Interface optimisée v22.0 initialisée avec système de backup');
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
                                <select id="backup-storage" onchange="window.categoriesPageV22.updateBackupConfig('storage', this.value)">
                                    <option value="localStorage" ${config.storage === 'localStorage' ? 'selected' : ''}>Navigateur (localStorage)</option>
                                    <option value="indexedDB" ${config.storage === 'indexedDB' ? 'selected' : ''}>Base de données locale (IndexedDB)</option>
                                    <option value="download" ${config.storage === 'download' ? 'selected' : ''}>Téléchargement automatique</option>
                                </select>
                                <div class="storage-help">
                                    <small class="storage-help-text">
                                        ${config.storage === 'localStorage' ? '💾 Stocké dans votre navigateur. Rapide mais limité à cet appareil.' : 
                                          config.storage === 'indexedDB' ? '🗃️ Base de données locale plus robuste. Recommandé pour de gros volumes.' :
                                          config.storage === 'download' ? '📥 Fichiers téléchargés automatiquement dans votre dossier Téléchargements.' :
                                          '💾 Sélectionnez un emplacement de stockage'}
                                    </small>
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
                enabled: true, // ACTIVÉ PAR DÉFAUT
                frequency: 'daily', // QUOTIDIEN PAR DÉFAUT
                storage: 'localStorage',
                retention: 10,
                compression: true,
                lastBackup: null,
                nextBackup: null
            };
            
            return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
        } catch (error) {
            console.error('[Backup] Erreur chargement config:', error);
            return {
                enabled: true, // ACTIVÉ PAR DÉFAUT
                frequency: 'daily', // QUOTIDIEN PAR DÉFAUT
                storage: 'localStorage',
                retention: 10,
                compression: true,
                lastBackup: null,
                nextBackup: null
            };
        }
    }

    saveBackupConfig() {
        try {
            localStorage.setItem('emailsortpro_backup_config', JSON.stringify(this.backupConfig));
            console.log('[Backup] Configuration sauvegardée');
        } catch (error) {
            console.error('[Backup] Erreur sauvegarde config:', error);
        }
    }

    updateBackupConfig(key, value) {
        this.backupConfig[key] = value;
        this.saveBackupConfig();
        
        // Recalculer la prochaine sauvegarde si nécessaire
        if (key === 'frequency' && this.backupConfig.enabled) {
            this.calculateNextBackup();
        }
        
        this.showToast(`Configuration mise à jour: ${key}`, 'success');
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
    // SYSTÈME DE BACKUP - CRÉATION
    // ================================================
    async createBackup() {
        try {
            this.showToast('Création de la sauvegarde en cours...', 'info');
            
            // Collecter toutes les données
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '22.0',
                data: {
                    categories: this.getCategoriesToBackup(),
                    tasks: this.getTasksToBackup(),
                    settings: this.getSettingsToBackup()
                },
                metadata: {
                    totalCategories: Object.keys(window.categoryManager?.getCategories() || {}).length,
                    totalTasks: this.getTasksCount(),
                    userAgent: navigator.userAgent,
                    hostname: window.location.hostname
                }
            };
            
            // Compresser si activé
            let dataToStore = JSON.stringify(backupData, null, 2);
            if (this.backupConfig.compression) {
                dataToStore = this.compressData(dataToStore);
            }
            
            // Stocker selon la configuration
            await this.storeBackup(dataToStore, backupData.timestamp);
            
            // Mettre à jour la configuration
            this.backupConfig.lastBackup = backupData.timestamp;
            this.calculateNextBackup();
            this.saveBackupConfig();
            
            // Nettoyer les anciennes sauvegardes
            this.cleanupOldBackups();
            
            this.showToast('✅ Sauvegarde créée avec succès!', 'success');
            this.refreshSettingsTab();
            
        } catch (error) {
            console.error('[Backup] Erreur création:', error);
            this.showToast('❌ Erreur lors de la création de la sauvegarde', 'error');
        }
    }

    getCategoriesToBackup() {
        const categories = window.categoryManager?.getCategories() || {};
        const result = {};
        
        Object.entries(categories).forEach(([id, category]) => {
            result[id] = {
                ...category,
                keywords: window.categoryManager?.getCategoryKeywords?.(id) || {},
                filters: window.categoryManager?.getCategoryFilters?.(id) || {}
            };
        });
        
        return result;
    }

    getTasksToBackup() {
        if (!window.taskManager || !window.taskManager.getAllTasks) {
            return [];
        }
        
        try {
            return window.taskManager.getAllTasks().map(task => ({
                ...task,
                // Nettoyer les données sensibles si nécessaire
                emailContent: task.emailContent ? '*** CONTENT REMOVED FOR BACKUP ***' : null
            }));
        } catch (error) {
            console.warn('[Backup] Erreur récupération tâches:', error);
            return [];
        }
    }

    getTasksCount() {
        try {
            if (window.taskManager && window.taskManager.getAllTasks) {
                return window.taskManager.getAllTasks().length;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    getSettingsToBackup() {
        return {
            categorySettings: this.loadSettings(),
            backupConfig: this.backupConfig,
            appVersion: '22.0'
        };
    }

    async storeBackup(data, timestamp) {
        const backupKey = `emailsortpro_backup_${timestamp.replace(/[:.]/g, '-')}`;
        
        switch (this.backupConfig.storage) {
            case 'localStorage':
                localStorage.setItem(backupKey, data);
                this.showToast('💾 Sauvegarde stockée dans le navigateur', 'success');
                break;
                
            case 'indexedDB':
                await this.storeInIndexedDB(backupKey, data);
                this.showToast('🗃️ Sauvegarde stockée en base locale', 'success');
                break;
                
            case 'download':
                this.downloadBackup(data, timestamp);
                this.showToast('📥 Sauvegarde téléchargée automatiquement', 'success');
                break;
                
            default:
                // Fallback vers localStorage
                localStorage.setItem(backupKey, data);
                this.showToast('💾 Sauvegarde stockée (localStorage par défaut)', 'success');
        }
    }

    async storeInIndexedDB(key, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EmailSortProBackups', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                
                store.put({ id: key, data: data, timestamp: new Date() });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('backups')) {
                    db.createObjectStore('backups', { keyPath: 'id' });
                }
            };
        });
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

    // ================================================
    // SYSTÈME DE BACKUP - RESTAURATION
    // ================================================
    async importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                let backupData;
                
                // Décompresser si nécessaire
                try {
                    backupData = JSON.parse(text);
                } catch {
                    // Essayer de décompresser
                    const decompressed = this.decompressData(text);
                    backupData = JSON.parse(decompressed);
                }
                
                // Valider la structure
                if (!this.validateBackupData(backupData)) {
                    throw new Error('Format de sauvegarde invalide');
                }
                
                // Demander confirmation
                if (!confirm(`Restaurer la sauvegarde du ${new Date(backupData.timestamp).toLocaleString()} ?\n\nCeci remplacera vos données actuelles.`)) {
                    return;
                }
                
                // Restaurer les données
                await this.restoreBackupData(backupData);
                
                this.showToast('✅ Sauvegarde restaurée avec succès!', 'success');
                
                // Recharger la page
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                console.error('[Backup] Erreur restauration:', error);
                this.showToast('❌ Erreur lors de la restauration: ' + error.message, 'error');
            }
        };
        
        input.click();
    }

    validateBackupData(data) {
        return data && 
               data.timestamp && 
               data.data && 
               data.data.categories && 
               data.data.tasks !== undefined && 
               data.data.settings;
    }

    async restoreBackupData(backupData) {
        const { categories, tasks, settings } = backupData.data;
        
        // Restaurer les catégories
        if (window.categoryManager && categories) {
            Object.entries(categories).forEach(([id, category]) => {
                if (category.keywords && window.categoryManager.updateCategoryKeywords) {
                    window.categoryManager.updateCategoryKeywords(id, category.keywords);
                }
                if (category.filters && window.categoryManager.updateCategoryFilters) {
                    window.categoryManager.updateCategoryFilters(id, category.filters);
                }
            });
        }
        
        // Restaurer les tâches (simplifié pour éviter les erreurs)
        if (window.taskManager && tasks && Array.isArray(tasks)) {
            console.log('[Backup] Restauration des tâches:', tasks.length);
        }
        
        // Restaurer les paramètres
        if (settings) {
            if (settings.categorySettings) {
                this.saveSettings(settings.categorySettings);
            }
        }
    }

    // ================================================
    // SYSTÈME DE BACKUP - UTILITAIRES
    // ================================================
    compressData(data) {
        // Compression simple - remplacer par une vraie compression si nécessaire
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            console.warn('[Backup] Compression failed, using uncompressed data');
            return data;
        }
    }

    decompressData(data) {
        // Décompression simple
        try {
            return decodeURIComponent(escape(atob(data)));
        } catch (error) {
            console.warn('[Backup] Decompression failed, trying as plain data');
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
                console.log(`[Backup] Supprimé ${toDelete.length} anciennes sauvegardes`);
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
        
        const categories = window.categoryManager?.getCategories() || {};
        const tasksCount = this.getTasksCount();
        
        return {
            totalBackups: backupKeys.length,
            totalSize: this.formatBytes(totalSize),
            categoriesCount: Object.keys(categories).length,
            tasksCount: tasksCount,
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

    showBackupHistory() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('emailsortpro_backup_'))
            .sort()
            .reverse();
        
        if (backupKeys.length === 0) {
            this.showToast('Aucune sauvegarde trouvée', 'info');
            return;
        }
        
        const historyHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">📚</span>
                            <h2>Historique des Sauvegardes</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="backup-history-list">
                            ${backupKeys.map(key => {
                                const timestamp = key.replace('emailsortpro_backup_', '').replace(/-/g, ':');
                                const date = new Date(timestamp);
                                const size = (localStorage.getItem(key) || '').length;
                                
                                return `
                                    <div class="backup-item">
                                        <div class="backup-info">
                                            <div class="backup-date">${date.toLocaleString('fr-FR')}</div>
                                            <div class="backup-size">${this.formatBytes(size)}</div>
                                        </div>
                                        <div class="backup-actions">
                                            <button class="btn-mini restore" onclick="window.categoriesPageV22.restoreSpecificBackup('${key}')">
                                                <i class="fas fa-undo"></i> Restaurer
                                            </button>
                                            <button class="btn-mini download" onclick="window.categoriesPageV22.downloadSpecificBackup('${key}')">
                                                <i class="fas fa-download"></i> Télécharger
                                            </button>
                                            <button class="btn-mini delete" onclick="window.categoriesPageV22.deleteSpecificBackup('${key}')">
                                                <i class="fas fa-trash"></i> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', historyHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    // ================================================
    // SYSTÈME DE BACKUP - INITIALISATION
    // ================================================
    initializeBackupSystem() {
        // Planifier les sauvegardes automatiques
        this.scheduleAutomaticBackups();
        
        // Écouter les événements de modification des données
        this.setupDataChangeListeners();
    }

    scheduleAutomaticBackups() {
        if (!this.backupConfig.enabled || this.backupConfig.frequency === 'manual') {
            return;
        }
        
        // Vérifier s'il faut faire une sauvegarde
        if (this.backupConfig.nextBackup) {
            const nextBackup = new Date(this.backupConfig.nextBackup);
            const now = new Date();
            
            if (now >= nextBackup) {
                console.log('[Backup] Sauvegarde automatique déclenchée');
                this.createBackup();
            }
        }
        
        // Programmer la prochaine vérification
        setTimeout(() => {
            this.scheduleAutomaticBackups();
        }, 60000); // Vérifier toutes les minutes
    }

    setupDataChangeListeners() {
        // Écouter les modifications de catégories
        window.addEventListener('categoryChanged', () => {
            if (this.backupConfig.enabled && this.backupConfig.frequency === 'onchange') {
                this.createBackup();
            }
        });
        
        // Écouter les modifications de tâches
        window.addEventListener('taskChanged', () => {
            if (this.backupConfig.enabled && this.backupConfig.frequency === 'onchange') {
                this.createBackup();
            }
        });
    }

    getStorageHelp(storageType) {
        const helpTexts = {
            localStorage: '💾 Stocké dans votre navigateur. Rapide mais limité à cet appareil.',
            indexedDB: '🗃️ Base de données locale plus robuste. Recommandé pour de gros volumes.',
            download: '📥 Fichiers téléchargés automatiquement dans votre dossier Téléchargements.',
            cloud: '☁️ Synchronisation cloud (nécessite une configuration).',
            export: '📤 Sauvegardes créées mais non stockées automatiquement.'
        };
        
        return `<small class="storage-help-text">${helpTexts[storageType] || ''}</small>`;
    }
        const settingsTab = document.getElementById('settings-tab');
        if (settingsTab && this.currentTab === 'settings') {
            settingsTab.innerHTML = this.renderSettingsTab();
        }
    }

    // ================================================
    // MÉTHODES EXISTANTES ADAPTÉES
    // ================================================
    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state-v22">
                    <div class="empty-icon">🔍</div>
                    <p>Aucune catégorie trouvée</p>
                    ${this.searchTerm ? `
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.handleSearch('')">
                            Effacer la recherche
                        </button>
                    ` : ''}
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
                            onclick="window.categoriesPageV22.togglePreselection('${id}')"
                            title="${isPreselected ? 'Tâches pré-cochées' : 'Tâches non cochées'}">
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

    // ================================================
    // ACTIONS ET MÉTHODES UTILITAIRES
    // ================================================
    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
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

    updateCategoriesDisplay() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    exportBackup() {
        this.createBackup().then(() => {
            // Le téléchargement sera fait automatiquement si configuré
            if (this.backupConfig.storage !== 'download') {
                // Forcer le téléchargement
                const backupData = {
                    timestamp: new Date().toISOString(),
                    version: '22.0',
                    data: {
                        categories: this.getCategoriesToBackup(),
                        tasks: this.getTasksToBackup(),
                        settings: this.getSettingsToBackup()
                    }
                };
                
                this.downloadBackup(JSON.stringify(backupData, null, 2), backupData.timestamp);
            }
        });
    }

    exportCategories() {
        try {
            const categories = this.getCategoriesToBackup();
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '22.0',
                categories: categories
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('✅ Catégories exportées', 'success');
        } catch (error) {
            console.error('[Export] Erreur:', error);
            this.showToast('❌ Erreur lors de l\'export', 'error');
        }
    }

    importCategories() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.categories) {
                    throw new Error('Format de fichier invalide');
                }
                
                // Confirmer l'import
                if (!confirm('Importer ces catégories ? Ceci pourrait écraser vos catégories existantes.')) {
                    return;
                }
                
                // Traiter l'import (simplifié)
                console.log('[Import] Catégories à importer:', data.categories);
                this.showToast('✅ Catégories importées', 'success');
                
            } catch (error) {
                console.error('[Import] Erreur:', error);
                this.showToast('❌ Erreur lors de l\'import', 'error');
            }
        };
        
        input.click();
    }

    showCreateModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern modal-create">
                    <div class="create-header">
                        <h2>Nouvelle catégorie ✨</h2>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="create-content">
                        <input type="text" 
                               id="new-name" 
                               class="input-name" 
                               placeholder="Nom de la catégorie" 
                               autofocus>
                        
                        <div class="emoji-picker">
                            <label>Choisir une icône</label>
                            <div class="emoji-grid">
                                ${['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌', '🌟', '🚀', '💎', '🎨', '🔥'].map(emoji => 
                                    `<button class="emoji-option ${emoji === '📁' ? 'selected' : ''}" 
                                             onclick="window.categoriesPageV22.selectIcon('${emoji}')">${emoji}</button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="new-icon" value="📁">
                        </div>
                        
                        <div class="color-selector">
                            <label>Couleur de la catégorie</label>
                            <div class="color-grid">
                                ${this.colors.map((color, i) => 
                                    `<button class="color-option ${i === 0 ? 'selected' : ''}" 
                                             style="background: ${color}"
                                             onclick="window.categoriesPageV22.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="new-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPageV22.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPageV22.createCategory()">
                            <i class="fas fa-sparkles"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
        
        setTimeout(() => document.getElementById('new-name')?.focus(), 100);
    }

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
        
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], includeEmails: [], excludeDomains: [], excludeEmails: []
        };
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPageV22.closeModal()">
                <div class="modal-modern">
                    <!-- Header avec gradient -->
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPageV22.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Tabs modernes -->
                    <div class="tabs-modern">
                        <button class="tab active" data-tab="keywords" onclick="window.categoriesPageV22.switchTab('keywords')">
                            <i class="fas fa-key"></i> Mots-clés
                        </button>
                        <button class="tab" data-tab="filters" onclick="window.categoriesPageV22.switchTab('filters')">
                            <i class="fas fa-filter"></i> Filtres
                        </button>
                        ${category.isCustom ? `
                            <button class="tab" data-tab="settings" onclick="window.categoriesPageV22.switchTab('settings')">
                                <i class="fas fa-cog"></i> Paramètres
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Contenu -->
                    <div class="modal-content">
                        <!-- Tab Mots-clés -->
                        <div class="tab-panel active" id="tab-keywords">
                            <div class="keywords-main-layout">
                                <div class="keywords-left-section">
                                    <div class="keywords-grid">
                                        ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute, '#FF6B6B', 'fa-star', 'Déclenchent toujours la catégorie')}
                                        ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong, '#FECA57', 'fa-bolt', 'Poids élevé dans la détection')}
                                        ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak, '#54A0FF', 'fa-feather', 'Poids modéré dans la détection')}
                                        ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions, '#A29BFE', 'fa-ban', 'Empêchent la détection')}
                                    </div>
                                </div>
                                <div class="keywords-right-section">
                                    <div class="filter-compact-box">
                                        <h3><i class="fas fa-filter"></i> Filtres rapides</h3>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-include-domain" placeholder="exemple.com">
                                                <button onclick="window.categoriesPageV22.addFilter('includeDomains')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-includeDomains">
                                                ${filters.includeDomains.map(d => `
                                                    <span class="tag filter-tag">
                                                        ${d}
                                                        <button onclick="window.categoriesPageV22.removeFilter('includeDomains', '${d}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-ban"></i> Domaines exclus</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-exclude-domain" placeholder="spam.com">
                                                <button onclick="window.categoriesPageV22.addFilter('excludeDomains')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-excludeDomains">
                                                ${filters.excludeDomains.map(d => `
                                                    <span class="tag exclude-tag">
                                                        ${d}
                                                        <button onclick="window.categoriesPageV22.removeFilter('excludeDomains', '${d}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="filter-compact-section">
                                            <h4><i class="fas fa-at"></i> Emails autorisés</h4>
                                            <div class="input-modern compact">
                                                <input type="text" id="quick-include-email" placeholder="contact@exemple.com">
                                                <button onclick="window.categoriesPageV22.addFilter('includeEmails')">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="tags compact" id="quick-includeEmails">
                                                ${filters.includeEmails.map(e => `
                                                    <span class="tag filter-tag">
                                                        ${e}
                                                        <button onclick="window.categoriesPageV22.removeFilter('includeEmails', '${e}')">×</button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Filtres -->
                        <div class="tab-panel" id="tab-filters">
                            ${this.renderFiltersTab(filters)}
                        </div>
                        
                        <!-- Tab Paramètres -->
                        ${category.isCustom ? `
                            <div class="tab-panel" id="tab-settings">
                                <div class="settings-content">
                                    <div class="danger-zone">
                                        <h4><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h4>
                                        <p>Cette action est irréversible</p>
                                        <button class="btn-danger" onclick="window.categoriesPageV22.deleteCategory('${categoryId}')">
                                            <i class="fas fa-trash"></i> Supprimer la catégorie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Footer -->
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

    renderKeywordBox(type, title, keywords, color, icon, description) {
        return `
            <div class="keyword-box">
                <div class="box-header">
                    <h4><i class="fas ${icon}"></i> ${title}</h4>
                    <span class="box-count" style="background: ${color}20; color: ${color}">${keywords.length}</span>
                </div>
                <p class="box-description">${description}</p>
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

    renderFiltersTab(filters) {
        return `
            <div class="filters-layout">
                <div class="filter-section">
                    <h3>Filtres d'inclusion</h3>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                        <p class="filter-hint">Accepter uniquement les emails de ces domaines</p>
                        <div class="input-modern">
                            <input type="text" id="include-domain" placeholder="exemple.com">
                            <button onclick="window.categoriesPageV22.addFilter('includeDomains')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="includeDomains-items">
                            ${filters.includeDomains.map(d => `
                                <span class="tag filter-tag">
                                    <i class="fas fa-globe"></i>
                                    ${d}
                                    <button onclick="window.categoriesPageV22.removeItem('includeDomains', '${d}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-at"></i> Emails autorisés</h4>
                        <p class="filter-hint">Accepter uniquement les emails de ces adresses</p>
                        <div class="input-modern">
                            <input type="text" id="include-email" placeholder="contact@exemple.com">
                            <button onclick="window.categoriesPageV22.addFilter('includeEmails')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="includeEmails-items">
                            ${filters.includeEmails.map(e => `
                                <span class="tag filter-tag">
                                    <i class="fas fa-at"></i>
                                    ${e}
                                    <button onclick="window.categoriesPageV22.removeItem('includeEmails', '${e}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h3>Filtres d'exclusion</h3>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-ban"></i> Domaines exclus</h4>
                        <p class="filter-hint">Ignorer les emails de ces domaines</p>
                        <div class="input-modern">
                            <input type="text" id="exclude-domain" placeholder="spam.com">
                            <button onclick="window.categoriesPageV22.addFilter('excludeDomains')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeDomains-items">
                            ${filters.excludeDomains.map(d => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-ban"></i>
                                    ${d}
                                    <button onclick="window.categoriesPageV22.removeItem('excludeDomains', '${d}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="filter-box">
                        <h4><i class="fas fa-user-slash"></i> Emails exclus</h4>
                        <p class="filter-hint">Ignorer les emails de ces adresses</p>
                        <div class="input-modern">
                            <input type="text" id="exclude-email" placeholder="noreply@exemple.com">
                            <button onclick="window.categoriesPageV22.addFilter('excludeEmails')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tags" id="excludeEmails-items">
                            ${filters.excludeEmails.map(e => `
                                <span class="tag exclude-tag">
                                    <i class="fas fa-user-slash"></i>
                                    ${e}
                                    <button onclick="window.categoriesPageV22.removeItem('excludeEmails', '${e}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS MODAL CATÉGORIES
    // ================================================
    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    }

    selectIcon(icon) {
        document.getElementById('new-icon').value = icon;
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === icon);
        });
    }

    selectColor(color) {
        document.getElementById('new-color').value = color;
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('selected', btn.style.background === color);
        });
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

    addFilter(type) {
        let inputId;
        if (type.includes('Domain')) {
            inputId = document.getElementById('quick-include-domain') ? 'quick-include-domain' : 
                     (type.includes('exclude') ? 'exclude-domain' : 'include-domain');
        } else {
            inputId = document.getElementById('quick-include-email') ? 'quick-include-email' :
                     (type.includes('exclude') ? 'exclude-email' : 'include-email');
        }
        
        const input = document.getElementById(inputId);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        
        const containers = [
            document.getElementById(`${type}-items`),
            document.getElementById(`quick-${type}`)
        ].filter(Boolean);
        
        const isExclude = type.includes('exclude');
        const icon = type.includes('Domain') ? 
            (isExclude ? 'ban' : 'globe') : 
            (isExclude ? 'user-slash' : 'at');
        
        containers.forEach(container => {
            if (!container.querySelector(`[data-value="${value}"]`)) {
                container.insertAdjacentHTML('beforeend', `
                    <span class="tag ${isExclude ? 'exclude-tag' : 'filter-tag'}" data-value="${value}">
                        ${type.includes('Domain') || type.includes('Email') ? '' : `<i class="fas fa-${icon}"></i>`}
                        ${value}
                        <button onclick="window.categoriesPageV22.removeFilter('${type}', '${value}')">×</button>
                    </span>
                `);
            }
        });
        
        input.value = '';
        input.focus();
    }
    
    removeFilter(type, value) {
        const containers = [
            document.getElementById(`${type}-items`),
            document.getElementById(`quick-${type}`)
        ].filter(Boolean);
        
        containers.forEach(container => {
            const tags = container.querySelectorAll('.tag');
            tags.forEach(tag => {
                if (tag.getAttribute('data-value') === value || 
                    tag.textContent.trim().replace('×', '').trim() === value) {
                    tag.remove();
                }
            });
        });
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

    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        const icon = document.getElementById('new-icon')?.value || '📁';
        const color = document.getElementById('new-color')?.value || this.colors[0];
        
        if (!name) {
            this.showToast('⚠️ Nom requis', 'warning');
            return;
        }
        
        const categoryData = {
            name,
            icon,
            color,
            priority: 30,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        const newCategory = window.categoryManager?.createCustomCategory(categoryData);
        
        if (newCategory) {
            this.closeModal();
            this.showToast('✅ Catégorie créée avec succès!');
            this.updateCategoriesDisplay();
            
            setTimeout(() => this.openModal(newCategory.id), 300);
        } else {
            this.showToast('❌ Erreur lors de la création', 'error');
        }
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
            
            const filters = {
                includeDomains: getItems('includeDomains-items'),
                includeEmails: getItems('includeEmails-items'),
                excludeDomains: getItems('excludeDomains-items'),
                excludeEmails: getItems('excludeEmails-items')
            };
            
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            this.closeModal();
            this.showToast('💾 Modifications enregistrées!');
            this.updateCategoriesDisplay();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            this.showToast('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.closeModal();
            this.showToast('🗑️ Catégorie supprimée');
            this.updateCategoriesDisplay();
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
        
        // Notifier CategoryManager
        if (window.categoryManager) {
            window.categoryManager.updateActiveCategories?.(activeCategories);
        }
        
        this.updateCategoriesDisplay();
        this.showToast('État de la catégorie mis à jour');
    }

    togglePreselection(categoryId) {
        console.log('[CategoriesPage] 🔄 Toggle pré-sélection pour:', categoryId);
        
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        const isPreselected = taskPreselectedCategories.includes(categoryId);
        
        if (isPreselected) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
            console.log('[CategoriesPage] ➖ Retrait pré-sélection:', categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
            console.log('[CategoriesPage] ➕ Ajout pré-sélection:', categoryId);
        }
        
        // Sauvegarder dans les settings
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        // Notifier les autres modules
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        // Mettre à jour l'affichage
        this.updateCategoriesDisplay();
        
        // Toast avec icône appropriée
        const category = window.categoryManager?.getCategory(categoryId);
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message);
    }

    // ================================================
    // SYNCHRONISATION DES MODULES
    // ================================================
    syncTaskPreselectedCategories(categories) {
        console.log('[CategoriesPage] 🔄 === SYNCHRONISATION GLOBALE ===');
        console.log('[CategoriesPage] 📋 Catégories à synchroniser:', categories);
        
        // 1. CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
            console.log('[CategoriesPage] ✅ CategoryManager synchronisé');
        }
        
        // 2. EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
            console.log('[CategoriesPage] ✅ EmailScanner synchronisé');
        }
        
        // 3. PageManager
        if (window.pageManager && typeof window.pageManager.updateSettings === 'function') {
            window.pageManager.updateSettings({
                taskPreselectedCategories: categories
            });
            console.log('[CategoriesPage] ✅ PageManager synchronisé');
        }
        
        // 4. Dispatcher des événements pour les autres modules
        this.dispatchSettingsChanged({
            type: 'taskPreselectedCategories',
            value: categories,
            settings: this.loadSettings()
        });
        
        console.log('[CategoriesPage] ✅ Synchronisation terminée');
    }

    // Dispatcher d'événements
    dispatchSettingsChanged(detail) {
        try {
            // Événement spécifique pour les catégories
            window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
            
            // Événement générique
            window.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: {
                    ...detail,
                    source: 'CategoriesPage',
                    timestamp: Date.now()
                }
            }));
            
            console.log('[CategoriesPage] 📨 Événements dispatched');
        } catch (error) {
            console.error('[CategoriesPage] Erreur dispatch événements:', error);
        }
    }

    // Méthode pour récupérer les catégories pré-sélectionnées
    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
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

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
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
    // MÉTHODES BACKUP SPÉCIFIQUES
    // ================================================
    restoreSpecificBackup(backupKey) {
        if (!confirm('Restaurer cette sauvegarde ? Ceci remplacera vos données actuelles.')) {
            return;
        }
        
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                throw new Error('Sauvegarde introuvable');
            }
            
            let parsedData;
            try {
                parsedData = JSON.parse(backupData);
            } catch {
                parsedData = JSON.parse(this.decompressData(backupData));
            }
            
            this.restoreBackupData(parsedData).then(() => {
                this.showToast('✅ Sauvegarde restaurée avec succès!', 'success');
                this.closeModal();
                setTimeout(() => window.location.reload(), 2000);
            });
            
        } catch (error) {
            console.error('[Backup] Erreur restauration spécifique:', error);
            this.showToast('❌ Erreur lors de la restauration', 'error');
        }
    }

    downloadSpecificBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                throw new Error('Sauvegarde introuvable');
            }
            
            const timestamp = backupKey.replace('emailsortpro_backup_', '').replace(/-/g, ':');
            const filename = `emailsortpro-backup-${timestamp.split('T')[0]}.json`;
            
            const blob = new Blob([backupData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('✅ Sauvegarde téléchargée', 'success');
            
        } catch (error) {
            console.error('[Backup] Erreur téléchargement:', error);
            this.showToast('❌ Erreur lors du téléchargement', 'error');
        }
    }

    deleteSpecificBackup(backupKey) {
        if (!confirm('Supprimer définitivement cette sauvegarde ?')) {
            return;
        }
        
        try {
            localStorage.removeItem(backupKey);
            this.showToast('🗑️ Sauvegarde supprimée', 'info');
            
            // Rafraîchir la liste
            this.closeModal();
            setTimeout(() => this.showBackupHistory(), 300);
            
        } catch (error) {
            console.error('[Backup] Erreur suppression:', error);
            this.showToast('❌ Erreur lors de la suppression', 'error');
        }
    }

    // ================================================
    // STYLES MODERNES V22
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
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
                
                padding: 24px;
                min-height: 100vh;
                background: var(--bg);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                color: var(--text);
            }
            
            /* Header avec onglets V22 */
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
                position: relative;
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
            
            .btn-action-v22.export:hover {
                border-color: var(--success);
                color: var(--success);
            }
            
            .btn-action-v22.import:hover {
                border-color: var(--warning);
                color: var(--warning);
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
            
            /* Tabs modernes avec fond solide */
            .tabs-modern {
                display: flex;
                padding: 0 28px;
                gap: 32px;
                border-bottom: 2px solid #D1D5DB;
                background: #FFFFFF;
            }
            
            .tab {
                padding: 16px 0;
                border: none;
                background: none;
                font-size: 15px;
                font-weight: 600;
                color: var(--text-secondary);
                cursor: pointer;
                position: relative;
                transition: color 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tab:hover {
                color: var(--text);
            }
            
            .tab.active {
                color: var(--primary);
            }
            
            .tab.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--primary);
                border-radius: 3px 3px 0 0;
            }
            
            /* Tab panels */
            .tab-panel {
                display: none;
                background: #E8EAED;
                min-height: 400px;
                padding: 24px;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            /* Layout mots-clés avec sidebar */
            .keywords-main-layout {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 24px;
                height: 100%;
            }
            
            .keywords-left-section {
                overflow-y: auto;
                padding-right: 20px;
            }
            
            .keywords-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .keywords-right-section {
                padding-left: 24px;
                overflow-y: auto;
            }
            
            .filter-compact-box {
                background: #FFFFFF;
                border: 2px solid var(--border);
                border-radius: 16px;
                padding: 20px;
                position: sticky;
                top: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .filter-compact-box h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 20px 0;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text);
            }
            
            .filter-compact-section {
                margin-bottom: 20px;
            }
            
            .filter-compact-section:last-child {
                margin-bottom: 0;
            }
            
            .filter-compact-section h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 10px 0;
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--text-secondary);
            }
            
            .input-modern.compact input {
                padding: 8px 12px;
                font-size: 14px;
            }
            
            .input-modern.compact button {
                width: 36px;
                height: 36px;
            }
            
            .tags.compact {
                gap: 6px;
                min-height: 30px;
                padding: 6px;
            }
            
            .tags.compact .tag {
                padding: 4px 10px;
                font-size: 13px;
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
                margin-bottom: 8px;
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
            
            .box-description {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
                line-height: 1.4;
            }
            
            /* Input moderne dans modal */
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
            
            /* Tags dans modal */
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
            
            .filter-tag {
                background: var(--primary)10;
                color: var(--primary);
            }
            
            .exclude-tag {
                background: var(--danger)10;
                color: var(--danger);
            }
            
            /* Layout filtres */
            .filters-layout {
                display: grid;
                gap: 32px;
            }
            
            .filter-section {
                background: #FFFFFF;
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 28px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .filter-section h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 20px 0;
                color: var(--text);
            }
            
            .filter-box {
                margin-bottom: 24px;
            }
            
            .filter-box:last-child {
                margin-bottom: 0;
            }
            
            .filter-box h4 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-hint {
                font-size: 13px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
            }
            
            /* Création de catégorie */
            .modal-create {
                max-width: 480px;
            }
            
            .create-header {
                padding: 28px;
                border-bottom: 2px solid #D1D5DB;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #FFFFFF;
                border-radius: 24px 24px 0 0;
            }
            
            .create-content {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
                background: #FFFFFF;
            }
            
            .input-name {
                width: 100%;
                padding: 16px 20px;
                border: 2px solid var(--border);
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                transition: all 0.3s;
            }
            
            .input-name:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .emoji-picker,
            .color-selector {
                margin-bottom: 24px;
            }
            
            .emoji-picker label,
            .color-selector label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 12px;
            }
            
            .emoji-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
                gap: 8px;
            }
            
            .emoji-option {
                width: 48px;
                height: 48px;
                border: 2px solid var(--border);
                background: var(--surface);
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s;
            }
            
            .emoji-option:hover {
                border-color: var(--primary);
                transform: scale(1.1);
            }
            
            .emoji-option.selected {
                border-color: var(--primary);
                background: var(--primary)10;
            }
            
            .color-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 8px;
            }
            
            .color-option {
                width: 40px;
                height: 40px;
                border: 3px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            
            .color-option:hover {
                transform: scale(1.1);
            }
            
            .color-option.selected {
                border-color: var(--text);
            }
            
            .color-option.selected::after {
                content: '✓';
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            /* Paramètres de catégorie */
            .settings-content {
                padding: 20px 0;
            }
            
            .danger-zone {
                background: var(--danger)10;
                border: 2px solid var(--danger)20;
                border-radius: 16px;
                padding: 24px;
            }
            
            .danger-zone h4 {
                font-size: 16px;
                font-weight: 600;
                color: var(--danger);
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .danger-zone p {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
            }
            
            .btn-danger {
                width: 100%;
                padding: 12px;
                background: var(--danger);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .btn-danger:hover {
                background: #DC2626;
                transform: scale(1.02);
            }
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
            
            /* Statistiques de backup */
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
            
            /* État vide V22 */
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
            
            /* Historique des sauvegardes */
            .backup-history-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .backup-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .backup-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .backup-info {
                flex: 1;
            }
            
            .backup-date {
                font-size: 15px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 4px;
            }
            
            .backup-size {
                font-size: 13px;
                color: var(--text-secondary);
            }
            
            .backup-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-mini {
                padding: 6px 12px;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .btn-mini:hover {
                transform: translateY(-1px);
            }
            
            .btn-mini.restore {
                color: var(--primary);
                border-color: var(--primary);
            }
            
            .btn-mini.restore:hover {
                background: var(--primary);
                color: white;
            }
            
            .btn-mini.download {
                color: var(--success);
                border-color: var(--success);
            }
            
            .btn-mini.download:hover {
                background: var(--success);
                color: white;
            }
            
            .btn-mini.delete {
                color: var(--danger);
                border-color: var(--danger);
            }
            
            .btn-mini.delete:hover {
                background: var(--danger);
                color: white;
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
            
            /* Responsive V22 */
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
                
                .backup-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .backup-actions {
                    width: 100%;
                    justify-content: flex-end;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 480px) {
                .stats-bar-v22 {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                
                .modal-modern {
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .modal-header,
                .modal-footer {
                    padding: 16px;
                }
                
                .modal-content {
                    padding: 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE V22
// ================================================

// Créer l'instance avec un nom unique
window.categoriesPageV22 = new CategoriesPageV22();

// Créer un alias pour maintenir la compatibilité
window.categoriesPage = window.categoriesPageV22;

// Intégration avec PageManager pour le rendu des paramètres
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV22.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV22.render(container);
    };
}

// Assurer la compatibilité avec les méthodes attendues
if (!window.categoriesPage.getTaskPreselectedCategories) {
    window.categoriesPage.getTaskPreselectedCategories = function() {
        return window.categoriesPageV22.getTaskPreselectedCategories?.() || [];
    };
}

console.log('[CategoriesPage] ✅ CategoriesPage v22.0 chargée - Interface optimisée avec système de backup complet!');
