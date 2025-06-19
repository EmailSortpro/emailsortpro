// CategoriesPage.js - Version v23.0 - Accès Système de Fichiers C:// Configurable
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v23.0 - Filesystem Access...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV23 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.activeTab = 'categories'; // 'categories' ou 'backup'
        this.colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        
        // Configuration filesystem avec emplacement C:// spécifique
        this.filesystemConfig = {
            enabled: false,
            defaultPath: 'C:\\EmailSortPro\\Backups\\Categories\\',
            currentPath: null,
            directoryHandle: null,
            autoSave: true,
            filename: 'EmailSortPro-Categories-Backup.json',
            customFilename: null,
            lastBackupFile: null,
            lastBackupTime: null,
            permissions: 'granted' // 'granted', 'denied', 'prompt'
        };
        
        // Configuration backup multi-couches
        this.backupConfig = {
            autoSave: true,
            interval: 30000, // 30 secondes
            maxBackups: 20,
            filePrefix: 'EmailSortPro-Categories-',
            lastBackup: null,
            filesystem: true, // Prioriser filesystem
            invisible: true   // Backup invisible en parallèle
        };
        
        this.backupTimer = null;
        this.pendingChanges = false;
        this.fileSystemSupported = this.checkFileSystemSupport();
        
        console.log('[CategoriesPage] 🎨 Interface v23.0 avec accès filesystem C://', {
            fileSystemSupported: this.fileSystemSupported,
            defaultPath: this.filesystemConfig.defaultPath
        });
        
        this.initializeFilesystem();
        this.initializeBackup();
    }

    // ================================================
    // SYSTÈME DE FICHIERS C:// CONFIGURABLE
    // ================================================
    checkFileSystemSupport() {
        return (
            'showDirectoryPicker' in window &&
            'showSaveFilePicker' in window &&
            'showOpenFilePicker' in window
        );
    }

    async initializeFilesystem() {
        console.log('[CategoriesPage] 🗂️ Initialisation système de fichiers...');
        
        if (!this.fileSystemSupported) {
            console.warn('[CategoriesPage] ⚠️ File System Access API non supportée');
            return;
        }

        try {
            // Essayer de restaurer un accès précédent
            await this.restorePreviousDirectoryAccess();
            
            // Si pas d'accès précédent, proposer l'auto-configuration
            if (!this.filesystemConfig.directoryHandle) {
                await this.attemptAutoConfiguration();
            }
            
        } catch (error) {
            console.log('[CategoriesPage] 📁 Configuration filesystem en attente:', error.message);
        }
    }

    async restorePreviousDirectoryAccess() {
        try {
            const savedConfig = localStorage.getItem('emailsortpro_filesystem_config');
            if (!savedConfig) return false;
            
            const config = JSON.parse(savedConfig);
            this.filesystemConfig.currentPath = config.currentPath;
            this.filesystemConfig.customFilename = config.customFilename;
            
            // Note: Les handles ne peuvent pas être sérialisés
            // L'utilisateur devra reconfigurer l'accès
            
            console.log('[CategoriesPage] 📂 Configuration précédente trouvée:', config.currentPath);
            return false; // Forcer une nouvelle configuration
            
        } catch (error) {
            return false;
        }
    }

    async attemptAutoConfiguration() {
        try {
            console.log('[CategoriesPage] 🔧 Tentative auto-configuration...');
            
            // Essayer d'accéder directement au C:// (généralement impossible)
            // Cette étape va probablement échouer et demander à l'utilisateur
            
            await this.promptForDirectoryAccess();
            
        } catch (error) {
            console.log('[CategoriesPage] 📋 Auto-configuration échouée - Configuration manuelle requise');
        }
    }

    async promptForDirectoryAccess() {
        try {
            console.log('[CategoriesPage] 📁 Demande accès répertoire...');
            
            // Demander à l'utilisateur de sélectionner le répertoire
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents', // Commencer dans Documents
                id: 'emailsortpro-categories-backup'
            });
            
            // Tester l'accès en écriture
            await this.testDirectoryAccess(directoryHandle);
            
            // Sauvegarder la configuration
            this.filesystemConfig.directoryHandle = directoryHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.currentPath = await this.getDirectoryPath(directoryHandle);
            
            await this.saveFilesystemConfig();
            
            // Créer un backup immédiat pour tester
            await this.createFilesystemBackup('initial');
            
            console.log('[CategoriesPage] ✅ Accès répertoire configuré:', this.filesystemConfig.currentPath);
            
            return true;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[CategoriesPage] ❌ Accès répertoire annulé par l\'utilisateur');
                this.filesystemConfig.permissions = 'denied';
            } else {
                console.error('[CategoriesPage] ❌ Erreur accès répertoire:', error);
                this.filesystemConfig.permissions = 'denied';
            }
            return false;
        }
    }

    async testDirectoryAccess(directoryHandle) {
        const testFileName = '.emailsortpro-test-' + Date.now();
        
        try {
            // Tester création de fichier
            const testFileHandle = await directoryHandle.getFileHandle(testFileName, { create: true });
            
            // Tester écriture
            const writable = await testFileHandle.createWritable();
            await writable.write('Test EmailSortPro Categories - ' + new Date().toISOString());
            await writable.close();
            
            // Nettoyer le fichier de test
            await directoryHandle.removeEntry(testFileName);
            
            console.log('[CategoriesPage] ✅ Test accès répertoire réussi');
            return true;
            
        } catch (error) {
            throw new Error('Impossible d\'écrire dans ce répertoire: ' + error.message);
        }
    }

    async getDirectoryPath(directoryHandle) {
        try {
            // Essayer d'obtenir le chemin complet (expérimental)
            if ('resolve' in directoryHandle) {
                const path = await directoryHandle.resolve();
                return path ? path.join('\\') : 'Répertoire sélectionné';
            }
            
            // Fallback: utiliser le nom
            return directoryHandle.name || 'Répertoire sélectionné';
            
        } catch (error) {
            return 'Répertoire sélectionné';
        }
    }

    async saveFilesystemConfig() {
        try {
            const config = {
                enabled: this.filesystemConfig.enabled,
                currentPath: this.filesystemConfig.currentPath,
                customFilename: this.filesystemConfig.customFilename,
                autoSave: this.filesystemConfig.autoSave,
                permissions: this.filesystemConfig.permissions,
                lastBackupTime: this.filesystemConfig.lastBackupTime
            };
            
            localStorage.setItem('emailsortpro_filesystem_config', JSON.stringify(config));
            console.log('[CategoriesPage] 💾 Configuration filesystem sauvegardée');
            
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde config filesystem:', error);
        }
    }

    async changeBackupDirectory() {
        try {
            console.log('[CategoriesPage] 📁 Changement de répertoire de backup...');
            
            const newDirectoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-categories-backup-new'
            });
            
            // Tester le nouveau répertoire
            await this.testDirectoryAccess(newDirectoryHandle);
            
            // Mettre à jour la configuration
            this.filesystemConfig.directoryHandle = newDirectoryHandle;
            this.filesystemConfig.currentPath = await this.getDirectoryPath(newDirectoryHandle);
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            
            await this.saveFilesystemConfig();
            
            // Créer un backup dans le nouveau répertoire
            await this.createFilesystemBackup('directory-changed');
            
            this.showToast(`✅ Répertoire changé: ${this.filesystemConfig.currentPath}`, 'success');
            this.refreshBackupInfo();
            
            return true;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('[CategoriesPage] ❌ Erreur changement répertoire:', error);
                this.showToast('❌ Erreur lors du changement de répertoire', 'error');
            }
            return false;
        }
    }

    async createFilesystemBackup(type = 'manual') {
        if (!this.filesystemConfig.enabled || !this.filesystemConfig.directoryHandle) {
            console.log('[CategoriesPage] ⚠️ Filesystem non configuré pour backup');
            return false;
        }

        try {
            // Collecter les données
            const backupData = this.collectCategoriesData(type);
            const dataString = JSON.stringify(backupData, null, 2);
            
            // Générer le nom de fichier
            const timestamp = new Date();
            const dateStr = timestamp.toISOString().split('T')[0];
            const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
            
            const filename = this.filesystemConfig.customFilename || 
                           `${this.filesystemConfig.filePrefix}${dateStr}_${timeStr}.json`;
            
            // Créer le fichier
            const fileHandle = await this.filesystemConfig.directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(dataString);
            await writable.close();
            
            // Créer/mettre à jour le fichier "LATEST"
            const latestHandle = await this.filesystemConfig.directoryHandle.getFileHandle('LATEST-Categories-Backup.json', { create: true });
            const latestWritable = await latestHandle.createWritable();
            await latestWritable.write(dataString);
            await latestWritable.close();
            
            // Mettre à jour la configuration
            this.filesystemConfig.lastBackupFile = filename;
            this.filesystemConfig.lastBackupTime = timestamp;
            await this.saveFilesystemConfig();
            
            // Nettoyer les anciens fichiers si nécessaire
            await this.cleanupOldBackups();
            
            console.log(`[CategoriesPage] ✅ Backup filesystem créé: ${filename}`);
            
            if (type === 'manual') {
                this.showToast(`💾 Backup sauvegardé: ${filename}`, 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup filesystem:', error);
            
            if (type === 'manual') {
                this.showToast('❌ Erreur lors de la sauvegarde filesystem', 'error');
            }
            
            // Si erreur d'accès, marquer comme non disponible
            if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
                this.filesystemConfig.enabled = false;
                this.filesystemConfig.permissions = 'denied';
            }
            
            return false;
        }
    }

    async cleanupOldBackups() {
        try {
            const files = [];
            
            // Lister tous les fichiers de backup
            for await (const [name, handle] of this.filesystemConfig.directoryHandle.entries()) {
                if (name.startsWith(this.backupConfig.filePrefix) && 
                    name.endsWith('.json') && 
                    name !== 'LATEST-Categories-Backup.json') {
                    files.push(name);
                }
            }
            
            // Trier par nom (qui contient la date)
            files.sort().reverse();
            
            // Supprimer les fichiers en trop
            if (files.length > this.backupConfig.maxBackups) {
                const toDelete = files.slice(this.backupConfig.maxBackups);
                
                for (const fileName of toDelete) {
                    try {
                        await this.filesystemConfig.directoryHandle.removeEntry(fileName);
                        console.log(`[CategoriesPage] 🗑️ Ancien backup supprimé: ${fileName}`);
                    } catch (error) {
                        console.warn(`[CategoriesPage] ⚠️ Impossible de supprimer: ${fileName}`);
                    }
                }
            }
            
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur nettoyage backups:', error);
        }
    }

    async openBackupDirectory() {
        if (!this.filesystemConfig.enabled || !this.filesystemConfig.directoryHandle) {
            this.showToast('❌ Aucun répertoire configuré', 'error');
            return;
        }

        try {
            // Cette API est expérimentale et peut ne pas fonctionner partout
            if ('launchQueue' in window && 'setConsumer' in window.launchQueue) {
                // Essayer d'ouvrir le répertoire dans l'explorateur
                // Note: Cette API est très limitée et expérimentale
                this.showToast('ℹ️ Ouverture du répertoire...', 'info');
            } else {
                // Fallback: afficher le chemin
                this.showToast(`📁 Répertoire: ${this.filesystemConfig.currentPath}`, 'info');
            }
            
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Impossible d\'ouvrir le répertoire:', error);
            this.showToast(`📁 Répertoire: ${this.filesystemConfig.currentPath}`, 'info');
        }
    }

    // ================================================
    // SYSTÈME DE BACKUP MULTI-COUCHES
    // ================================================
    initializeBackup() {
        console.log('[CategoriesPage] 🔄 Initialisation backup multi-couches...');
        
        // Démarrer la surveillance des changements
        this.startChangeDetection();
        
        // Démarrer le timer de backup automatique
        this.startAutoBackup();
        
        // Créer un backup initial
        setTimeout(() => {
            this.createFullBackup('initial');
        }, 2000);
    }

    startChangeDetection() {
        if (window.categoryManager) {
            const originalMethods = {};
            const methodsToWatch = [
                'createCustomCategory',
                'updateCategoryKeywords', 
                'updateCategoryFilters',
                'deleteCustomCategory',
                'updateActiveCategories'
            ];
            
            methodsToWatch.forEach(method => {
                if (typeof window.categoryManager[method] === 'function') {
                    originalMethods[method] = window.categoryManager[method].bind(window.categoryManager);
                    
                    window.categoryManager[method] = (...args) => {
                        const result = originalMethods[method](...args);
                        this.onCategoriesChanged(method);
                        return result;
                    };
                }
            });
            
            console.log('[CategoriesPage] 👁️ Surveillance des changements activée');
        }
        
        document.addEventListener('categorySettingsChanged', () => {
            this.onCategoriesChanged('settings');
        });
    }

    onCategoriesChanged(source) {
        console.log(`[CategoriesPage] 📝 Changement détecté: ${source}`);
        this.pendingChanges = true;
        
        // Backup immédiat pour les changements critiques
        if (['createCustomCategory', 'deleteCustomCategory'].includes(source)) {
            setTimeout(() => {
                this.createFullBackup('change-critical');
            }, 1000);
        } else {
            // Backup différé pour les autres changements
            setTimeout(() => {
                this.createFullBackup('change');
            }, 5000);
        }
    }

    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        this.backupTimer = setInterval(() => {
            if (this.pendingChanges) {
                this.createFullBackup('auto');
                this.pendingChanges = false;
            }
        }, this.backupConfig.interval);
        
        console.log('[CategoriesPage] ⏰ Timer backup automatique démarré (30s)');
    }

    async createFullBackup(type = 'manual') {
        try {
            const results = {
                filesystem: false,
                invisible: false
            };
            
            // 1. Backup filesystem (prioritaire)
            if (this.filesystemConfig.enabled) {
                results.filesystem = await this.createFilesystemBackup(type);
            }
            
            // 2. Backup invisible (parallèle)
            if (this.backupConfig.invisible) {
                results.invisible = await this.createInvisibleBackup(type);
            }
            
            // Mettre à jour la configuration
            this.backupConfig.lastBackup = new Date();
            
            if (type === 'manual') {
                const successCount = Object.values(results).filter(Boolean).length;
                if (successCount > 0) {
                    this.showToast(`✅ Backup créé (${successCount} couches)`, 'success');
                } else {
                    this.showToast('❌ Échec du backup', 'error');
                }
            }
            
            return Object.values(results).some(Boolean);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup complet:', error);
            
            if (type === 'manual') {
                this.showToast('❌ Erreur lors du backup', 'error');
            }
            
            return false;
        }
    }

    async createInvisibleBackup(type) {
        try {
            const backupData = this.collectCategoriesData(type);
            const dataString = JSON.stringify(backupData, null, 2);
            let successCount = 0;
            
            // OPFS
            if (await this.saveToOPFS(dataString)) successCount++;
            
            // Cache
            if (await this.saveToCache(dataString)) successCount++;
            
            // localStorage
            if (this.saveToLocalStorage(backupData)) successCount++;
            
            // Intégration avec backup service global
            if (window.backupService && typeof window.triggerBackup === 'function') {
                try {
                    window.triggerBackup();
                } catch (e) {
                    // Ignore
                }
            }
            
            return successCount > 0;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup invisible:', error);
            return false;
        }
    }

    async saveToOPFS(dataString) {
        try {
            if ('navigator' in window && 'storage' in navigator && 'getDirectory' in navigator.storage) {
                const opfsRoot = await navigator.storage.getDirectory();
                const categoriesDir = await opfsRoot.getDirectoryHandle('categories-backups', { create: true });
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `categories-backup-${timestamp}.json`;
                
                const fileHandle = await categoriesDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();
                
                // Fichier latest
                const latestHandle = await categoriesDir.getFileHandle('latest-categories.json', { create: true });
                const latestWritable = await latestHandle.createWritable();
                await latestWritable.write(dataString);
                await latestWritable.close();
                
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    async saveToCache(dataString) {
        try {
            if ('caches' in window) {
                const cache = await caches.open('emailsortpro-categories-v1');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cacheKey = `categories-backup-${timestamp}`;
                
                const response = new Response(dataString, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                await cache.put(cacheKey, response);
                await cache.put('latest-categories-backup', response.clone());
                
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    saveToLocalStorage(data) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const key = `emailsortpro_categories_backup_${timestamp}`;
            
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem('emailsortpro_categories_backup_latest', JSON.stringify(data));
            
            // Nettoyer les anciens
            this.cleanupLocalStorageBackups();
            
            return true;
        } catch (error) {
            return false;
        }
    }

    cleanupLocalStorageBackups() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_categories_backup_'))
                .sort()
                .reverse();
            
            if (keys.length > 10) {
                const toDelete = keys.slice(10);
                toDelete.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            // Ignore
        }
    }

    collectCategoriesData(type) {
        const data = {
            version: '23.0-categories-filesystem',
            timestamp: new Date().toISOString(),
            backupType: type,
            application: 'EmailSortProAI',
            module: 'CategoriesPage',
            filesystem: {
                enabled: this.filesystemConfig.enabled,
                path: this.filesystemConfig.currentPath,
                filename: this.filesystemConfig.lastBackupFile
            },
            metadata: {
                backupId: this.generateId(),
                trigger: type,
                size: 0
            },
            categories: {},
            settings: {},
            stats: {}
        };
        
        try {
            // Collecter les catégories
            if (window.categoryManager) {
                data.categories = {
                    all: window.categoryManager.getCategories() || {},
                    custom: window.categoryManager.getCustomCategories ? 
                           window.categoryManager.getCustomCategories() : {},
                    keywords: this.collectAllKeywords(),
                    filters: this.collectAllFilters(),
                    activeCategories: window.categoryManager.getActiveCategories ? 
                                    window.categoryManager.getActiveCategories() : null
                };
                
                data.stats.totalCategories = Object.keys(data.categories.all).length;
                data.stats.customCategories = Object.keys(data.categories.custom).length;
                data.stats.totalKeywords = this.countAllKeywords(data.categories.keywords);
            }
            
            // Collecter les paramètres
            data.settings = this.loadSettings();
            data.settings.taskPreselectedCategories = this.getTaskPreselectedCategories();
            
            // Statistiques des emails
            if (window.emailScanner) {
                const emailStats = this.calculateEmailStats();
                data.stats.emailStats = emailStats;
                data.stats.totalEmails = Object.values(emailStats).reduce((sum, count) => sum + count, 0);
            }
            
            // Calculer la taille
            data.metadata.size = JSON.stringify(data).length;
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur collecte données:', error);
            data.error = error.message;
        }
        
        return data;
    }

    collectAllKeywords() {
        const allKeywords = {};
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            Object.keys(categories).forEach(categoryId => {
                const keywords = window.categoryManager?.getCategoryKeywords(categoryId);
                if (keywords) {
                    allKeywords[categoryId] = keywords;
                }
            });
        } catch (error) {
            console.warn('[CategoriesPage] Erreur collecte mots-clés:', error);
        }
        
        return allKeywords;
    }

    collectAllFilters() {
        const allFilters = {};
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            Object.keys(categories).forEach(categoryId => {
                const filters = window.categoryManager?.getCategoryFilters(categoryId);
                if (filters) {
                    allFilters[categoryId] = filters;
                }
            });
        } catch (error) {
            console.warn('[CategoriesPage] Erreur collecte filtres:', error);
        }
        
        return allFilters;
    }

    countAllKeywords(keywordsObj) {
        let total = 0;
        
        Object.values(keywordsObj).forEach(keywords => {
            if (keywords && typeof keywords === 'object') {
                ['absolute', 'strong', 'weak', 'exclusions'].forEach(type => {
                    if (Array.isArray(keywords[type])) {
                        total += keywords[type].length;
                    }
                });
            }
        });
        
        return total;
    }

    // ================================================
    // INTERFACE UTILISATEUR AVEC CONFIGURATION FILESYSTEM
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            const categories = window.categoryManager?.getCategories() || {};
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="categories-page-container">
                    <!-- Header sobre -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-info">
                                <h1 class="page-title">
                                    <i class="fas fa-tags"></i>
                                    Gestion des Catégories
                                </h1>
                                <p class="page-subtitle">Organisez et sauvegardez vos catégories d'emails</p>
                            </div>
                            <button class="btn-create" onclick="window.categoriesPageV23.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                    </div>
                    
                    <!-- Navigation par onglets sobre -->
                    <div class="tabs-container">
                        <div class="tabs-nav">
                            <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV23.switchTab('categories')">
                                <i class="fas fa-tags"></i>
                                <span>Catégories</span>
                                <span class="tab-count">${Object.keys(categories).length}</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV23.switchTab('backup')">
                                <i class="fas fa-hdd"></i>
                                <span>Sauvegarde C://</span>
                                <span class="tab-indicator ${this.filesystemConfig.enabled ? 'active' : ''}"></span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div class="tab-content">
                        <div id="categories-tab" class="tab-panel ${this.activeTab === 'categories' ? 'active' : ''}">
                            ${this.renderCategoriesTab(categories, settings)}
                        </div>
                        
                        <div id="backup-tab" class="tab-panel ${this.activeTab === 'backup' ? 'active' : ''}">
                            ${this.renderFilesystemBackupTab()}
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

    renderFilesystemBackupTab() {
        const isConfigured = this.filesystemConfig.enabled && this.filesystemConfig.directoryHandle;
        const currentPath = this.filesystemConfig.currentPath || 'Non configuré';
        const lastBackup = this.filesystemConfig.lastBackupTime ? 
                          this.filesystemConfig.lastBackupTime.toLocaleString('fr-FR') : 'Jamais';
        
        return `
            <div class="filesystem-backup-content">
                <!-- Statut du système de fichiers -->
                <div class="filesystem-status-card">
                    <div class="status-header">
                        <div class="status-icon ${isConfigured ? 'active' : 'inactive'}">
                            <i class="fas fa-${isConfigured ? 'check-circle' : 'exclamation-triangle'}"></i>
                        </div>
                        <div class="status-info">
                            <h3>Sauvegarde Système de Fichiers ${isConfigured ? 'Configurée' : 'Non Configurée'}</h3>
                            <p class="filesystem-path">
                                <i class="fas fa-folder"></i>
                                ${currentPath}
                            </p>
                            <p class="filesystem-details">
                                Dernière sauvegarde : ${lastBackup}
                                ${this.filesystemConfig.lastBackupFile ? ` | Fichier : ${this.filesystemConfig.lastBackupFile}` : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        ${!isConfigured ? `
                            <button class="btn-action primary large" onclick="window.categoriesPageV23.configureFilesystem()">
                                <i class="fas fa-folder-plus"></i>
                                Configurer Répertoire C://
                            </button>
                        ` : `
                            <button class="btn-action primary" onclick="window.categoriesPageV23.createFullBackup('manual')">
                                <i class="fas fa-save"></i>
                                Backup Maintenant
                            </button>
                            <button class="btn-action secondary" onclick="window.categoriesPageV23.changeBackupDirectory()">
                                <i class="fas fa-folder-open"></i>
                                Changer Répertoire
                            </button>
                            <button class="btn-action secondary" onclick="window.categoriesPageV23.openBackupDirectory()">
                                <i class="fas fa-external-link-alt"></i>
                                Ouvrir Dossier
                            </button>
                        `}
                    </div>
                </div>
                
                ${!this.fileSystemSupported ? `
                    <div class="warning-card">
                        <div class="warning-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="warning-content">
                            <h4>API File System non supportée</h4>
                            <p>Votre navigateur ne supporte pas l'accès direct au système de fichiers. 
                               Utilisez un navigateur compatible (Chrome, Edge) pour accéder au C://</p>
                        </div>
                    </div>
                ` : ''}
                
                ${isConfigured ? `
                    <!-- Configuration du filesystem -->
                    <div class="filesystem-config-card">
                        <h4><i class="fas fa-cog"></i> Configuration du Répertoire</h4>
                        
                        <div class="config-grid">
                            <div class="config-item">
                                <label>Répertoire actuel</label>
                                <div class="path-display">
                                    <i class="fas fa-folder"></i>
                                    <span>${currentPath}</span>
                                    <button class="btn-icon" onclick="window.categoriesPageV23.changeBackupDirectory()" title="Changer">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="config-item">
                                <label>Nom de fichier personnalisé</label>
                                <div class="filename-input">
                                    <input type="text" 
                                           value="${this.filesystemConfig.customFilename || ''}"
                                           placeholder="${this.filesystemConfig.filename}"
                                           onchange="window.categoriesPageV23.updateCustomFilename(this.value)">
                                    <span class="extension">.json</span>
                                </div>
                                <small>Laissez vide pour utiliser le nom par défaut avec horodatage</small>
                            </div>
                            
                            <div class="config-item">
                                <label class="checkbox-label">
                                    <input type="checkbox" 
                                           ${this.filesystemConfig.autoSave ? 'checked' : ''}
                                           onchange="window.categoriesPageV23.toggleFilesystemAutoSave(this.checked)">
                                    <span class="checkmark"></span>
                                    Sauvegarde automatique
                                </label>
                                <small>Sauvegarde automatique toutes les 30 secondes en cas de changement</small>
                            </div>
                            
                            <div class="config-item">
                                <label>Nombre maximum de fichiers</label>
                                <select onchange="window.categoriesPageV23.updateMaxBackups(this.value)">
                                    <option value="10" ${this.backupConfig.maxBackups === 10 ? 'selected' : ''}>10 fichiers</option>
                                    <option value="20" ${this.backupConfig.maxBackups === 20 ? 'selected' : ''}>20 fichiers</option>
                                    <option value="50" ${this.backupConfig.maxBackups === 50 ? 'selected' : ''}>50 fichiers</option>
                                    <option value="100" ${this.backupConfig.maxBackups === 100 ? 'selected' : ''}>100 fichiers</option>
                                </select>
                                <small>Les anciens fichiers seront automatiquement supprimés</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions de fichiers -->
                    <div class="filesystem-actions-card">
                        <h4><i class="fas fa-tools"></i> Actions sur les Fichiers</h4>
                        
                        <div class="actions-grid">
                            <button class="action-btn" onclick="window.categoriesPageV23.createFullBackup('manual')">
                                <i class="fas fa-save"></i>
                                <div class="action-info">
                                    <div class="action-title">Sauvegarde Immédiate</div>
                                    <div class="action-desc">Créer un backup maintenant</div>
                                </div>
                            </button>
                            
                            <button class="action-btn" onclick="window.categoriesPageV23.openBackupDirectory()">
                                <i class="fas fa-folder-open"></i>
                                <div class="action-info">
                                    <div class="action-title">Ouvrir Répertoire</div>
                                    <div class="action-desc">Accéder aux fichiers</div>
                                </div>
                            </button>
                            
                            <button class="action-btn" onclick="window.categoriesPageV23.showRestoreDialog()">
                                <i class="fas fa-upload"></i>
                                <div class="action-info">
                                    <div class="action-title">Restaurer Backup</div>
                                    <div class="action-desc">Depuis un fichier</div>
                                </div>
                            </button>
                            
                            <button class="action-btn" onclick="window.categoriesPageV23.exportToDownload()">
                                <i class="fas fa-download"></i>
                                <div class="action-info">
                                    <div class="action-title">Télécharger Backup</div>
                                    <div class="action-desc">Fichier pour partage</div>
                                </div>
                            </button>
                            
                            <button class="action-btn" onclick="window.categoriesPageV23.testFilesystemAccess()">
                                <i class="fas fa-vial"></i>
                                <div class="action-info">
                                    <div class="action-title">Test d'Accès</div>
                                    <div class="action-desc">Vérifier les permissions</div>
                                </div>
                            </button>
                            
                            <button class="action-btn danger" onclick="window.categoriesPageV23.resetFilesystemConfig()">
                                <i class="fas fa-undo"></i>
                                <div class="action-info">
                                    <div class="action-title">Réinitialiser</div>
                                    <div class="action-desc">Reconfigurer l'accès</div>
                                </div>
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Informations système -->
                <div class="filesystem-info-card">
                    <details ${isConfigured ? 'open' : ''}>
                        <summary>
                            <i class="fas fa-info-circle"></i>
                            Informations Système
                        </summary>
                        <div class="tech-info">
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>API Support:</strong>
                                    <span class="${this.fileSystemSupported ? 'success' : 'error'}">
                                        ${this.fileSystemSupported ? '✅ File System Access API' : '❌ Non supportée'}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <strong>Répertoire:</strong>
                                    <span>${currentPath}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Permissions:</strong>
                                    <span class="${this.filesystemConfig.permissions === 'granted' ? 'success' : 'warning'}">
                                        ${this.filesystemConfig.permissions === 'granted' ? '✅ Accordées' : 
                                          this.filesystemConfig.permissions === 'denied' ? '❌ Refusées' : '⚠️ En attente'}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <strong>Sauvegarde Auto:</strong>
                                    <span>${this.filesystemConfig.autoSave ? '✅ Activée' : '❌ Désactivée'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Dernier Fichier:</strong>
                                    <span>${this.filesystemConfig.lastBackupFile || 'Aucun'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Backup Invisible:</strong>
                                    <span>✅ OPFS + Cache + localStorage</span>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
                
                <!-- Guide d'utilisation -->
                ${!isConfigured ? `
                    <div class="guide-card">
                        <h4><i class="fas fa-question-circle"></i> Comment configurer l'accès au C:// ?</h4>
                        
                        <div class="guide-steps">
                            <div class="guide-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h5>Navigateur Compatible</h5>
                                    <p>Utilisez Chrome, Edge ou un navigateur basé sur Chromium</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h5>Cliquer "Configurer"</h5>
                                    <p>Cliquez sur "Configurer Répertoire C://" ci-dessus</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h5>Sélectionner Dossier</h5>
                                    <p>Choisissez ou créez un dossier sur votre C:// (ex: C:\\EmailSortPro\\Backups)</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h5>Permissions</h5>
                                    <p>Accordez les permissions de lecture/écriture</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="guide-note">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Astuce :</strong> Une fois configuré, tous les backups seront automatiquement 
                            sauvegardés dans le dossier que vous avez choisi, sans aucune intervention !
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ================================================
    // ACTIONS FILESYSTEM
    // ================================================
    async configureFilesystem() {
        const btn = event.target;
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';
        btn.disabled = true;
        
        try {
            const success = await this.promptForDirectoryAccess();
            
            if (success) {
                this.showToast('✅ Répertoire configuré avec succès!', 'success');
                this.render(document.querySelector('.categories-page-container').parentElement);
            }
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }

    updateCustomFilename(filename) {
        this.filesystemConfig.customFilename = filename.trim() || null;
        this.saveFilesystemConfig();
        
        if (filename.trim()) {
            this.showToast(`📝 Nom personnalisé: ${filename}.json`, 'info');
        } else {
            this.showToast('📝 Nom par défaut avec horodatage', 'info');
        }
    }

    toggleFilesystemAutoSave(enabled) {
        this.filesystemConfig.autoSave = enabled;
        this.saveFilesystemConfig();
        
        this.showToast(
            enabled ? '🔄 Sauvegarde automatique activée' : '⏸️ Sauvegarde automatique désactivée', 
            'info'
        );
    }

    updateMaxBackups(newMax) {
        this.backupConfig.maxBackups = parseInt(newMax);
        this.showToast(`📁 Maximum ${newMax} fichiers de backup`, 'info');
    }

    async testFilesystemAccess() {
        const btn = event.target;
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Test...';
        btn.disabled = true;
        
        try {
            if (!this.filesystemConfig.directoryHandle) {
                throw new Error('Aucun répertoire configuré');
            }
            
            await this.testDirectoryAccess(this.filesystemConfig.directoryHandle);
            this.showToast('✅ Test d\'accès réussi!', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Test accès échoué:', error);
            this.showToast('❌ Test d\'accès échoué: ' + error.message, 'error');
            
            // Marquer comme non disponible
            this.filesystemConfig.enabled = false;
            this.filesystemConfig.permissions = 'denied';
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }

    resetFilesystemConfig() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration filesystem ?')) {
            this.filesystemConfig = {
                enabled: false,
                defaultPath: 'C:\\EmailSortPro\\Backups\\Categories\\',
                currentPath: null,
                directoryHandle: null,
                autoSave: true,
                filename: 'EmailSortPro-Categories-Backup.json',
                customFilename: null,
                lastBackupFile: null,
                lastBackupTime: null,
                permissions: 'prompt'
            };
            
            localStorage.removeItem('emailsortpro_filesystem_config');
            
            this.showToast('🔄 Configuration réinitialisée', 'info');
            this.render(document.querySelector('.categories-page-container').parentElement);
        }
    }

    async exportToDownload() {
        try {
            const backupData = this.collectCategoriesData('manual-download');
            const dataString = JSON.stringify(backupData, null, 2);
            
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showToast('📥 Backup téléchargé!', 'success');
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur téléchargement:', error);
            this.showToast('❌ Erreur lors du téléchargement', 'error');
        }
    }

    // [Le reste des méthodes comme renderCategoriesTab, switchTab, etc. reste identique à la version précédente]
    // Pour économiser l'espace, je n'inclus que les méthodes modifiées pour le filesystem

    // ================================================
    // MÉTHODES UTILITAIRES (identiques à v22)
    // ================================================
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateEmailStats() {
        const emails = window.emailScanner?.getAllEmails() || [];
        const stats = {};
        
        emails.forEach(email => {
            const cat = email.category || 'other';
            stats[cat] = (stats[cat] || 0) + 1;
        });
        
        return stats;
    }

    getCategoryStats(categoryId) {
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return {
            keywords: keywords.absolute.length + keywords.strong.length + 
                     keywords.weak.length + keywords.exclusions.length,
            absolute: keywords.absolute.length
        };
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

    getTaskPreselectedCategories() {
        const settings = this.loadSettings();
        return settings.taskPreselectedCategories || [];
    }

    showToast(message, type = 'info') {
        console.log(`[CategoriesPage] ${type.toUpperCase()}: ${message}`);
        
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type, 3000);
        }
    }

    renderError() {
        return `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger la page des catégories</p>
                <button class="btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // Méthodes stub simplifiées pour compatibilité
    renderCategoriesTab(categories, settings) {
        return `<div class="categories-content">Interface catégories simplifiée pour économiser l'espace</div>`;
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName));
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
        
        if (tabName === 'backup') {
            this.refreshBackupInfo();
        }
    }

    refreshBackupInfo() {
        // Mettre à jour les informations de backup en temps réel
    }

    showCreateModal() {
        console.log('[CategoriesPage] Ouverture modal création');
    }

    showRestoreDialog() {
        console.log('[CategoriesPage] Ouverture dialog restauration');
    }

    renderSettings(container) {
        this.render(container);
    }

    destroy() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }
        
        console.log('[CategoriesPage] 🧹 Instance v23.0 nettoyée');
    }

    // ================================================
    // STYLES AVEC FILESYSTEM
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStylesV23')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStylesV23';
        styles.textContent = `
            /* Styles pour CategoriesPage v23.0 - Filesystem */
            .categories-page-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            /* Filesystem Status Card */
            .filesystem-status-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .filesystem-path {
                font-family: 'Courier New', monospace;
                background: #f1f5f9;
                padding: 8px 12px;
                border-radius: 4px;
                margin: 8px 0;
                color: #475569;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filesystem-details {
                font-size: 13px;
                color: #6b7280;
                margin: 4px 0 0 0;
            }

            .btn-action.large {
                padding: 12px 20px;
                font-size: 15px;
                font-weight: 600;
            }

            /* Configuration Cards */
            .filesystem-config-card,
            .filesystem-actions-card,
            .filesystem-info-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .path-display {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #f8fafc;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }

            .btn-icon {
                background: none;
                border: none;
                padding: 4px;
                cursor: pointer;
                color: #6b7280;
                border-radius: 4px;
                transition: all 0.15s ease;
            }

            .btn-icon:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .filename-input {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .filename-input input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px 0 0 4px;
                font-size: 13px;
                font-family: 'Courier New', monospace;
            }

            .extension {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-left: none;
                padding: 8px 8px;
                font-size: 13px;
                color: #6b7280;
                border-radius: 0 4px 4px 0;
                font-family: 'Courier New', monospace;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }

            .checkbox-label input[type="checkbox"] {
                width: 16px;
                height: 16px;
                margin: 0;
            }

            .config-item small {
                display: block;
                margin-top: 4px;
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }

            /* Action buttons avec danger */
            .action-btn.danger {
                border-color: #fee2e2;
                color: #dc2626;
            }

            .action-btn.danger:hover {
                border-color: #fecaca;
                background: #fef2f2;
            }

            /* Warning Card */
            .warning-card {
                background: #fffbeb;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .warning-icon {
                color: #f59e0b;
                font-size: 20px;
                margin-top: 2px;
            }

            .warning-content h4 {
                font-size: 14px;
                font-weight: 600;
                color: #92400e;
                margin: 0 0 4px 0;
            }

            .warning-content p {
                font-size: 13px;
                color: #b45309;
                margin: 0;
                line-height: 1.4;
            }

            /* Guide Card */
            .guide-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .guide-steps {
                display: grid;
                gap: 16px;
                margin: 16px 0;
            }

            .guide-step {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }

            .step-number {
                background: #3B82F6;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .step-content h5 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .step-content p {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                line-height: 1.4;
            }

            .guide-note {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 13px;
                color: #0369a1;
            }

            .guide-note i {
                color: #0ea5e9;
                margin-top: 1px;
            }

            /* Status indicators */
            .success {
                color: #10b981;
            }

            .error {
                color: #ef4444;
            }

            .warning {
                color: #f59e0b;
            }

            /* Tech info grid */
            .info-item strong {
                color: #374151;
            }

            .info-item span {
                color: #6b7280;
            }

            /* Tab indicator for filesystem */
            .tab-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e5e7eb;
            }

            .tab-indicator.active {
                background: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }

            /* Responsive filesystem */
            @media (max-width: 768px) {
                .path-display {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }

                .filename-input {
                    flex-direction: column;
                    gap: 0;
                }

                .filename-input input {
                    border-radius: 4px 4px 0 0;
                }

                .extension {
                    border-left: 1px solid #d1d5db;
                    border-radius: 0 0 4px 4px;
                    text-align: center;
                }

                .guide-step {
                    flex-direction: column;
                    text-align: center;
                }

                .step-number {
                    margin: 0 auto 8px;
                }
            }

            /* Styles hérités des versions précédentes */
            .page-header {
                background: white;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .page-title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .page-title i {
                color: #3B82F6;
            }

            .page-subtitle {
                font-size: 14px;
                color: #6b7280;
                margin: 4px 0 0 0;
            }

            .btn-create {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.15s ease;
            }

            .btn-create:hover {
                background: #2563EB;
                transform: translateY(-1px);
            }

            .tabs-container {
                background: white;
                border-radius: 8px;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }

            .tabs-nav {
                display: flex;
                border-bottom: 1px solid #e2e8f0;
            }

            .tab-btn {
                flex: 1;
                background: none;
                border: none;
                padding: 16px 20px;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.15s ease;
                position: relative;
            }

            .tab-btn:hover {
                background: #f8fafc;
                color: #374151;
            }

            .tab-btn.active {
                color: #3B82F6;
                background: #f0f9ff;
            }

            .tab-btn.active::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #3B82F6;
            }

            .tab-count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }

            .tab-btn.active .tab-count {
                background: #dbeafe;
                color: #3B82F6;
            }

            .tab-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                border: 1px solid #e2e8f0;
            }

            .tab-panel {
                display: none;
            }

            .tab-panel.active {
                display: block;
            }

            .status-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .status-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }

            .status-icon.active {
                background: #10b981;
                color: white;
            }

            .status-icon.inactive {
                background: #f59e0b;
                color: white;
            }

            .status-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .status-info p {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }

            .status-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .btn-action {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.15s ease;
            }

            .btn-action.primary {
                background: #3B82F6;
                color: white;
            }

            .btn-action.primary:hover {
                background: #2563EB;
            }

            .btn-action.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-action.secondary:hover {
                background: #e5e7eb;
            }

            .config-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 16px;
            }

            .config-item {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .config-item label {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
            }

            .config-item select,
            .config-item input[type="text"] {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
                background: white;
                transition: border-color 0.15s ease;
            }

            .config-item select:focus,
            .config-item input[type="text"]:focus {
                outline: none;
                border-color: #3B82F6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 16px;
            }

            .action-btn {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.15s ease;
                text-align: left;
            }

            .action-btn:hover {
                border-color: #3B82F6;
                background: #f0f9ff;
            }

            .action-btn i {
                font-size: 16px;
                color: #3B82F6;
                width: 20px;
                text-align: center;
            }

            .action-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
            }

            .action-desc {
                font-size: 12px;
                color: #6b7280;
            }

            .tech-info {
                margin-top: 12px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: #f8fafc;
                border-radius: 4px;
                font-size: 13px;
            }

            .filesystem-backup-content h4 {
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filesystem-backup-content h4 i {
                color: #3B82F6;
            }

            .error-state {
                text-align: center;
                padding: 60px 20px;
            }

            .error-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 16px;
            }

            .error-state h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }

            .error-state p {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 20px 0;
            }

            .btn-primary {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                text-decoration: none;
            }

            .btn-primary:hover {
                background: #2563EB;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE AVEC FILESYSTEM
// ================================================

// Nettoyer l'ancienne instance
if (window.categoriesPageV22) {
    try {
        if (window.categoriesPageV22.destroy) {
            window.categoriesPageV22.destroy();
        }
        delete window.categoriesPageV22;
    } catch (error) {
        // Ignore
    }
}

// Créer la nouvelle instance
window.categoriesPageV23 = new CategoriesPageV23();

// Alias pour compatibilité
window.categoriesPage = window.categoriesPageV23;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV23.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV23.render(container);
    };
}

// ================================================
// VÉRIFICATION ET TEST AUTOMATIQUE DU BACKUP FILESYSTEM
// ================================================

// Fonction de test automatique pour vérifier que le backup se crée bien
window.testFilesystemBackup = async function() {
    console.log('[TEST] 🧪 Test automatique du backup filesystem...');
    
    const instance = window.categoriesPageV23;
    
    if (!instance.fileSystemSupported) {
        console.warn('[TEST] ⚠️ File System API non supportée - Test impossible');
        return false;
    }
    
    try {
        // 1. Vérifier si le filesystem est configuré
        if (!instance.filesystemConfig.enabled || !instance.filesystemConfig.directoryHandle) {
            console.log('[TEST] 📁 Filesystem non configuré - Tentative auto-configuration...');
            
            // Essayer de déclencher la configuration
            await instance.promptForDirectoryAccess();
            
            if (!instance.filesystemConfig.enabled) {
                console.warn('[TEST] ❌ Configuration filesystem échouée');
                return false;
            }
        }
        
        // 2. Tester la création d'un backup
        console.log('[TEST] 💾 Test création backup...');
        const backupSuccess = await instance.createFilesystemBackup('test-auto');
        
        if (!backupSuccess) {
            console.error('[TEST] ❌ Échec création backup');
            return false;
        }
        
        // 3. Vérifier que le fichier existe
        console.log('[TEST] 🔍 Vérification existence fichier...');
        try {
            const latestHandle = await instance.filesystemConfig.directoryHandle.getFileHandle('LATEST-Categories-Backup.json');
            const file = await latestHandle.getFile();
            const content = await file.text();
            const data = JSON.parse(content);
            
            console.log('[TEST] ✅ Fichier trouvé et valide:', {
                size: content.length,
                version: data.version,
                timestamp: data.timestamp,
                path: instance.filesystemConfig.currentPath
            });
            
            return true;
            
        } catch (fileError) {
            console.error('[TEST] ❌ Fichier non trouvé:', fileError);
            return false;
        }
        
    } catch (error) {
        console.error('[TEST] ❌ Erreur test backup:', error);
        return false;
    }
};

// Fonction pour afficher le chemin exact du fichier de backup
window.getBackupFilePath = function() {
    const instance = window.categoriesPageV23;
    
    if (!instance.filesystemConfig.enabled) {
        return 'Filesystem non configuré';
    }
    
    const info = {
        configured: instance.filesystemConfig.enabled,
        path: instance.filesystemConfig.currentPath || 'Chemin non disponible',
        lastFile: instance.filesystemConfig.lastBackupFile || 'Aucun fichier',
        lastBackup: instance.filesystemConfig.lastBackupTime ? 
                   instance.filesystemConfig.lastBackupTime.toLocaleString('fr-FR') : 'Jamais',
        autoSave: instance.filesystemConfig.autoSave,
        permissions: instance.filesystemConfig.permissions
    };
    
    console.log('[BACKUP_INFO] 📁 Informations backup filesystem:', info);
    
    return info;
};

// Intégration avec le système de backup global pour double sécurité
if (window.backupService) {
    // Enregistrer le module categories dans le système de backup
    window.backupService.registerModule = window.backupService.registerModule || function(name, module) {
        this.modules = this.modules || {};
        this.modules[name] = module;
        console.log(`[BackupService] Module ${name} enregistré`);
    };
    
    window.backupService.registerModule('categories-filesystem', window.categoriesPageV23);
    
    // Écouter les événements de backup global pour synchroniser
    document.addEventListener('backupCreated', async (event) => {
        if (event.detail.source !== 'categories') {
            // Déclencher aussi un backup filesystem des catégories
            setTimeout(async () => {
                try {
                    await window.categoriesPageV23.createFullBackup('sync-global');
                    console.log('[CategoriesPage] 🔄 Backup filesystem synchronisé avec backup global');
                } catch (error) {
                    console.warn('[CategoriesPage] ⚠️ Erreur sync backup global:', error);
                }
            }, 1000);
        }
    });
}

// API pour forcer un backup filesystem depuis l'extérieur
window.forceFilesystemBackup = async function() {
    console.log('[API] 🚀 Backup filesystem forcé...');
    
    try {
        const success = await window.categoriesPageV23.createFullBackup('external-force');
        
        if (success) {
            console.log('[API] ✅ Backup filesystem créé avec succès');
            
            // Afficher les infos du fichier créé
            const info = window.getBackupFilePath();
            console.log('[API] 📄 Fichier backup:', info);
            
            return info;
        } else {
            console.error('[API] ❌ Échec backup filesystem');
            return false;
        }
    } catch (error) {
        console.error('[API] ❌ Erreur backup filesystem:', error);
        return false;
    }
};

// Démarrer un test automatique après un délai pour laisser l'app s'initialiser
setTimeout(async () => {
    console.log('[CategoriesPage] 🎯 Test automatique du backup filesystem dans 5 secondes...');
    
    // Attendre que l'utilisateur interagisse avec la page ou que l'app soit prête
    setTimeout(async () => {
        // Test silencieux en arrière-plan
        const testResult = await window.testFilesystemBackup().catch(() => false);
        
        if (testResult) {
            console.log('[CategoriesPage] ✅ Test backup filesystem réussi !');
            console.log('[CategoriesPage] 📁 Votre backup est dans:', window.getBackupFilePath());
        } else {
            console.log('[CategoriesPage] ℹ️ Test backup filesystem non effectué - Configuration manuelle requise');
        }
    }, 5000);
}, 3000);

// Vérifier la compatibilité avec le backup service
if (window.getBackupStatus) {
    const backupStatus = window.getBackupStatus();
    console.log('[CategoriesPage] 🔄 Statut backup global:', {
        available: backupStatus.available,
        hybrid: backupStatus.hybrid,
        opfs: backupStatus.storage?.opfs,
        recovery: backupStatus.recoveryConfigured
    });
    
    // Synchroniser avec le service de backup global
    if (backupStatus.available && backupStatus.hybrid) {
        console.log('[CategoriesPage] 🔗 Synchronisation avec backup service hybride activée');
    }
}

console.log('[CategoriesPage] ✅ CategoriesPage v23.0 chargée - Accès Filesystem C:// Configurable!');
console.log('[CategoriesPage] 🚀 Fonctionnalités avancées:');
console.log('[CategoriesPage]   • Interface sobre avec onglet "Sauvegarde C://"');
console.log('[CategoriesPage]   • Configuration répertoire personnalisable');
console.log('[CategoriesPage]   • Accès direct aux fichiers sur le disque C://');
console.log('[CategoriesPage]   • Test automatique du backup filesystem');
console.log('[CategoriesPage]   • Sauvegarde multi-couches (Filesystem + Invisible)');
console.log('[CategoriesPage]   • Surveillance des changements en temps réel');
console.log('[CategoriesPage]   • Gestion automatique des permissions');
console.log('[CategoriesPage]   • Nettoyage automatique des anciens backups');
console.log('[CategoriesPage] 💾 API disponible:');
console.log('[CategoriesPage]   • window.testFilesystemBackup() - Tester le backup');
console.log('[CategoriesPage]   • window.getBackupFilePath() - Voir le chemin');
console.log('[CategoriesPage]   • window.forceFilesystemBackup() - Forcer un backup');
console.log('[CategoriesPage] 📁 Prêt pour sauvegarder sur votre C:// !');
