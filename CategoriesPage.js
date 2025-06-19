// backup.js - Version avec création FORCÉE du dossier Documents/EmailSortPro
// Cette version force automatiquement la création du dossier physique

(function() {
    'use strict';

    class BackupService {
        constructor() {
            this.provider = null;
            this.isInitialized = false;
            this.backupInProgress = false;
            this.lastBackupTime = null;
            this.timers = {
                auto: null,
                daily: null,
                cloud: null,
                queue: null
            };
            
            // Configuration avec DOSSIER FORCÉ
            this.config = {
                enabled: true,
                intervals: {
                    auto: 30000,        // 30 secondes
                    cloud: 600000,      // 10 minutes  
                    daily: 86400000,    // 24 heures
                    onChange: 5000      // 5 secondes après changement
                },
                maxBackups: {
                    local: 10,
                    cloud: 50
                },
                silentMode: false,      // ACTIVER les notifications pour debug
                autoDetect: true,
                
                // NOUVEAU: Forcer le dossier physique
                forcePhysicalFolder: true,
                defaultFolderPath: this.getDefaultDocumentsPath(),
                physicalBackupEnabled: true
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.documentsHandle = null;
            
            this.init();
        }

        // ================================================
        // CHEMIN PAR DÉFAUT DOCUMENTS
        // ================================================
        getDefaultDocumentsPath() {
            const isWindows = navigator.platform.toLowerCase().includes('win');
            const isMac = navigator.platform.toLowerCase().includes('mac');
            
            if (isWindows) {
                return 'Documents\\EmailSortPro';
            } else if (isMac) {
                return 'Documents/EmailSortPro';
            } else {
                return 'Documents/EmailSortPro';
            }
        }

        // ================================================
        // INITIALISATION AVEC DOSSIER FORCÉ
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation avec création FORCÉE du dossier...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                
                // FORCER la création du dossier Documents/EmailSortPro
                await this.forceCreateDocumentsFolder();
                
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service prêt avec dossier physique - Provider: ${this.provider}`);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

        // ================================================
        // CRÉATION FORCÉE DU DOSSIER DOCUMENTS
        // ================================================
        async forceCreateDocumentsFolder() {
            console.log('[Backup] 📁 Création FORCÉE du dossier Documents/EmailSortPro...');
            
            if (!window.showDirectoryPicker) {
                console.warn('[Backup] ⚠️ File System Access API non supportée, fallback localStorage');
                this.config.physicalBackupEnabled = false;
                return;
            }
            
            try {
                // Demander l'accès IMMÉDIATEMENT au démarrage
                await this.requestDocumentsAccess();
                
                if (this.documentsHandle) {
                    console.log('[Backup] ✅ Dossier Documents/EmailSortPro créé et configuré!');
                    this.config.physicalBackupEnabled = true;
                    
                    // Notification de succès
                    this.showNotification(
                        '📁 Dossier EmailSortPro créé dans Documents !\nLes backups seront automatiquement sauvegardés.', 
                        'success', 
                        5000
                    );
                    
                    // Test immédiat
                    await this.testFolderAccess();
                    
                } else {
                    throw new Error('Impossible d\'obtenir l\'accès au dossier');
                }
                
            } catch (error) {
                console.warn('[Backup] ⚠️ Création dossier échouée:', error);
                
                if (error.name === 'AbortError') {
                    // L'utilisateur a annulé - proposer une seconde chance
                    this.scheduleRetryFolderCreation();
                } else {
                    this.config.physicalBackupEnabled = false;
                    this.showNotification(
                        '⚠️ Impossible de créer le dossier physique.\nUtilisation du stockage navigateur.', 
                        'warning'
                    );
                }
            }
        }

        async requestDocumentsAccess() {
            console.log('[Backup] 🔓 Demande d\'accès au dossier Documents...');
            
            // Options pour sélectionner Documents par défaut
            const pickerOptions = {
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-backup-folder-v4'
            };
            
            try {
                // Sélectionner le dossier parent (Documents)
                const parentHandle = await window.showDirectoryPicker(pickerOptions);
                console.log('[Backup] 📂 Dossier parent sélectionné:', parentHandle.name);
                
                // Créer ou accéder au dossier EmailSortPro
                let emailSortProHandle;
                try {
                    // Essayer d'accéder au dossier existant
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro');
                    console.log('[Backup] 📁 Dossier EmailSortPro trouvé!');
                } catch (notFoundError) {
                    // Créer le dossier s'il n'existe pas
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro', {
                        create: true
                    });
                    console.log('[Backup] 📁 Dossier EmailSortPro créé!');
                }
                
                // Tester l'accès en écriture
                await this.testWriteAccess(emailSortProHandle);
                
                // Sauvegarder le handle
                this.documentsHandle = emailSortProHandle;
                
                // Sauvegarder le chemin
                this.config.actualFolderPath = `${parentHandle.name}/EmailSortPro`;
                this.saveConfig();
                
                console.log('[Backup] ✅ Accès Documents configuré:', this.config.actualFolderPath);
                return true;
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur accès Documents:', error);
                throw error;
            }
        }

        async testWriteAccess(directoryHandle) {
            const testFileName = '.emailsortpro-test-' + Date.now();
            
            try {
                // Créer un fichier de test
                const testFileHandle = await directoryHandle.getFileHandle(testFileName, {
                    create: true
                });
                
                // Écrire du contenu
                const writable = await testFileHandle.createWritable();
                await writable.write('Test d\'accès EmailSortPro - ' + new Date().toISOString());
                await writable.close();
                
                console.log('[Backup] ✅ Test écriture réussi');
                
                // Nettoyer le fichier de test
                await directoryHandle.removeEntry(testFileName);
                
                return true;
                
            } catch (error) {
                console.error('[Backup] ❌ Test écriture échoué:', error);
                throw new Error('Impossible d\'écrire dans ce dossier');
            }
        }

        async testFolderAccess() {
            try {
                console.log('[Backup] 🧪 Test d\'accès au dossier...');
                
                const testData = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    test: true,
                    message: 'Test de fonctionnement du backup automatique'
                }, null, 2);
                
                await this.storeInPhysicalFolder(testData, new Date().toISOString(), 'test');
                
                console.log('[Backup] ✅ Test réussi - Dossier fonctionnel!');
                this.showNotification('✅ Test réussi - Backup automatique opérationnel!', 'success');
                
            } catch (error) {
                console.error('[Backup] ❌ Test d\'accès échoué:', error);
                this.config.physicalBackupEnabled = false;
            }
        }

        scheduleRetryFolderCreation() {
            console.log('[Backup] ⏳ Programmation d\'une nouvelle tentative...');
            
            this.showNotification(
                '📁 Configuration du dossier de backup sera reproposée dans 30 secondes...', 
                'info'
            );
            
            setTimeout(async () => {
                try {
                    await this.forceCreateDocumentsFolder();
                } catch (error) {
                    console.log('[Backup] Seconde tentative échouée, utilisation localStorage');
                    this.config.physicalBackupEnabled = false;
                }
            }, 30000);
        }

        // ================================================
        // STOCKAGE PHYSIQUE
        // ================================================
        async storeInPhysicalFolder(data, timestamp, type = 'backup') {
            if (!this.documentsHandle) {
                throw new Error('Aucun accès au dossier Documents');
            }
            
            try {
                // Nom du fichier avec horodatage
                const date = new Date(timestamp);
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
                const fileName = type === 'test' ? 
                    `EmailSortPro-Test-${timeStr}.json` :
                    `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
                
                // Créer le fichier
                const fileHandle = await this.documentsHandle.getFileHandle(fileName, {
                    create: true
                });
                
                // Écrire les données
                const writable = await fileHandle.createWritable();
                await writable.write(data);
                await writable.close();
                
                console.log(`[Backup] 💾 Fichier créé: ${fileName}`);
                
                // Aussi créer un fichier "latest"
                if (type === 'backup') {
                    await this.createLatestBackup(data);
                }
                
                return fileName;
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur stockage physique:', error);
                throw error;
            }
        }

        async createLatestBackup(data) {
            try {
                const latestHandle = await this.documentsHandle.getFileHandle('EmailSortPro-Latest.json', {
                    create: true
                });
                
                const writable = await latestHandle.createWritable();
                await writable.write(data);
                await writable.close();
                
                console.log('[Backup] 💾 Fichier "Latest" mis à jour');
                
            } catch (error) {
                console.warn('[Backup] ⚠️ Erreur création Latest:', error);
            }
        }

        // ================================================
        // MÉTHODES DE BASE (adaptées)
        // ================================================
        loadConfig() {
            try {
                const saved = localStorage.getItem('emailsortpro_backup_config');
                if (saved) {
                    Object.assign(this.config, JSON.parse(saved));
                }
            } catch (error) {
                console.warn('[Backup] Configuration par défaut utilisée');
            }
        }

        saveConfig() {
            try {
                // Ne pas sauvegarder le handle (non sérialisable)
                const configToSave = { ...this.config };
                delete configToSave.documentsHandle;
                
                localStorage.setItem('emailsortpro_backup_config', JSON.stringify(configToSave));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        async detectProvider() {
            console.log('[Backup] 🔍 Détection automatique du provider...');
            
            if (this.isOneDriveReady()) {
                this.provider = 'onedrive';
                console.log('[Backup] ☁️ OneDrive détecté');
                return;
            }
            
            if (this.isGoogleDriveReady()) {
                this.provider = 'googledrive';
                console.log('[Backup] ☁️ Google Drive détecté');
                return;
            }
            
            this.provider = 'local';
            console.log('[Backup] 💾 Mode local activé');
        }

        isOneDriveReady() {
            return window.authService && 
                   typeof window.authService.isAuthenticated === 'function' &&
                   window.authService.isAuthenticated() &&
                   typeof window.authService.getAccessToken === 'function';
        }

        isGoogleDriveReady() {
            return window.googleAuthService && 
                   typeof window.googleAuthService.isAuthenticated === 'function' &&
                   window.googleAuthService.isAuthenticated() &&
                   typeof window.googleAuthService.getAccessToken === 'function';
        }

        // ================================================
        // SURVEILLANCE DES DONNÉES
        // ================================================
        startDataWatching() {
            console.log('[Backup] 👁️ Démarrage surveillance des données...');
            
            this.interceptLocalStorage();
            this.watchGlobalObjects();
            this.listenToAppEvents();
        }

        interceptLocalStorage() {
            const original = {
                setItem: localStorage.setItem,
                removeItem: localStorage.removeItem,
                clear: localStorage.clear
            };
            
            localStorage.setItem = (key, value) => {
                original.setItem.call(localStorage, key, value);
                this.onDataChange('localStorage', key);
            };
            
            localStorage.removeItem = (key) => {
                original.removeItem.call(localStorage, key);
                this.onDataChange('localStorage', key);
            };
            
            localStorage.clear = () => {
                original.clear.call(localStorage);
                this.onDataChange('localStorage', 'clear');
            };
        }

        watchGlobalObjects() {
            const objectsToWatch = [
                'categoryManager',
                'taskManager', 
                'emailManager',
                'settingsManager'
            ];
            
            objectsToWatch.forEach(name => {
                if (window[name]) {
                    this.watchObject(window[name], name);
                }
            });
        }

        watchObject(obj, name) {
            if (!obj || typeof obj !== 'object') return;
            
            let lastSnapshot = JSON.stringify(obj);
            
            setInterval(() => {
                try {
                    const currentSnapshot = JSON.stringify(obj);
                    if (currentSnapshot !== lastSnapshot) {
                        this.onDataChange('object', name);
                        lastSnapshot = currentSnapshot;
                    }
                } catch (error) {
                    // Ignore errors in object watching
                }
            }, 5000);
        }

        listenToAppEvents() {
            const eventsToWatch = [
                'categoryCreated', 'categoryUpdated', 'categoryDeleted',
                'taskCreated', 'taskUpdated', 'taskCompleted', 'taskDeleted',
                'settingsChanged', 'userPreferencesChanged'
            ];
            
            eventsToWatch.forEach(eventName => {
                document.addEventListener(eventName, () => {
                    this.onDataChange('event', eventName);
                });
            });
        }

        onDataChange(source, key) {
            if (this.shouldIgnoreChange(key)) return;
            
            console.log(`[Backup] 📝 Changement: ${source}.${key}`);
            this.scheduleChangeBackup();
        }

        shouldIgnoreChange(key) {
            if (typeof key !== 'string') return false;
            
            const ignored = [
                'emailsortpro_backup_',
                'temp_', 'cache_', 'session_',
                'lastActivity', 'currentView', 'scrollPosition'
            ];
            
            return ignored.some(prefix => key.startsWith(prefix));
        }

        scheduleChangeBackup() {
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            
            this.changeTimeout = setTimeout(() => {
                this.queueBackup('onChange');
            }, this.config.intervals.onChange);
        }

        // ================================================
        // SYSTÈME DE QUEUE
        // ================================================
        queueBackup(type, priority = 50) {
            const backup = {
                id: this.generateId(),
                type,
                priority,
                timestamp: Date.now()
            };
            
            this.backupQueue.push(backup);
            this.backupQueue.sort((a, b) => b.priority - a.priority);
            
            this.processQueue();
        }

        async processQueue() {
            if (this.isProcessingQueue || this.backupQueue.length === 0) {
                return;
            }
            
            this.isProcessingQueue = true;
            
            try {
                while (this.backupQueue.length > 0) {
                    const backup = this.backupQueue.shift();
                    await this.executeBackup(backup);
                    await this.sleep(100);
                }
            } catch (error) {
                console.error('[Backup] Erreur traitement queue:', error);
            } finally {
                this.isProcessingQueue = false;
            }
        }

        async executeBackup(backup) {
            try {
                console.log(`[Backup] 🔄 Exécution: ${backup.type}`);
                
                const success = await this.performBackup(backup.type);
                
                if (success) {
                    console.log(`[Backup] ✅ ${backup.type} réussi`);
                    
                    // Notification pour les backups importants
                    if (['initial', 'manual', 'daily'].includes(backup.type)) {
                        const location = this.config.physicalBackupEnabled ? 
                            'Documents/EmailSortPro' : 'navigateur';
                        this.showNotification(`💾 Backup ${backup.type} créé dans ${location}`, 'success');
                    }
                } else {
                    console.warn(`[Backup] ⚠️ ${backup.type} échoué`);
                }
                
            } catch (error) {
                console.error(`[Backup] ❌ Erreur ${backup.type}:`, error);
            }
        }

        // ================================================
        // TIMERS AUTOMATIQUES
        // ================================================
        startAutoTimers() {
            console.log('[Backup] ⏰ Démarrage des timers automatiques...');
            
            this.timers.auto = setInterval(() => {
                this.queueBackup('auto', 40);
            }, this.config.intervals.auto);
            
            if (this.provider !== 'local') {
                this.timers.cloud = setInterval(() => {
                    if (this.isCloudReady()) {
                        this.queueBackup('cloud', 60);
                    }
                }, this.config.intervals.cloud);
            }
            
            this.scheduleDailyBackup();
            
            console.log('[Backup] ⏰ Timers actifs');
        }

        scheduleDailyBackup() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);
            
            const timeUntil = tomorrow.getTime() - now.getTime();
            
            setTimeout(() => {
                this.queueBackup('daily', 70);
                
                this.timers.daily = setInterval(() => {
                    this.queueBackup('daily', 70);
                }, this.config.intervals.daily);
                
            }, timeUntil);
            
            console.log(`[Backup] ⏰ Prochain backup quotidien: ${tomorrow.toLocaleString('fr-FR')}`);
        }

        isCloudReady() {
            return (this.provider === 'onedrive' && this.isOneDriveReady()) ||
                   (this.provider === 'googledrive' && this.isGoogleDriveReady());
        }

        // ================================================
        // CRÉATION DU BACKUP INITIAL
        // ================================================
        async createInitialBackup() {
            console.log('[Backup] 💾 Création du backup initial...');
            
            try {
                await this.performBackup('initial');
                
                if (this.isCloudReady()) {
                    await this.performBackup('initialCloud');
                }
                
                console.log('[Backup] ✅ Backup initial créé');
                localStorage.setItem('emailsortpro_backup_initialized', new Date().toISOString());
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur backup initial:', error);
            }
        }

        // ================================================
        // EXÉCUTION DES BACKUPS
        // ================================================
        async performBackup(type) {
            if (!this.config.enabled || this.backupInProgress) {
                return false;
            }
            
            this.backupInProgress = true;
            
            try {
                const data = this.collectData(type);
                
                if (!data || !data.data) {
                    return false;
                }
                
                let success = false;
                
                // PRIORITÉ AU DOSSIER PHYSIQUE
                if (this.config.physicalBackupEnabled && this.documentsHandle) {
                    try {
                        const dataString = JSON.stringify(data, null, 2);
                        await this.storeInPhysicalFolder(dataString, data.timestamp, 'backup');
                        success = true;
                        console.log('[Backup] ✅ Backup physique créé');
                    } catch (physicalError) {
                        console.warn('[Backup] ⚠️ Erreur backup physique:', physicalError);
                        // Fallback vers localStorage
                        success = await this.backupToLocal(data);
                    }
                } else {
                    // Backup localStorage standard
                    success = await this.backupToLocal(data);
                }
                
                // Backup cloud si disponible
                if (type.includes('Cloud') || (this.isCloudReady() && type !== 'auto')) {
                    const cloudSuccess = await this.backupToCloud(data);
                    success = success || cloudSuccess;
                }
                
                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();
                    
                    if (type === 'manual') {
                        const location = this.config.physicalBackupEnabled ? 
                            this.config.actualFolderPath || 'Documents/EmailSortPro' : 
                            'navigateur';
                        this.showNotification(`✅ Backup créé dans ${location}`, 'success');
                    }
                }
                
                return success;
                
            } catch (error) {
                console.error('[Backup] Erreur backup:', error);
                
                if (type === 'manual') {
                    this.showNotification(`❌ Erreur backup: ${error.message}`, 'error');
                }
                
                return false;
                
            } finally {
                this.backupInProgress = false;
            }
        }

        // ================================================
        // COLLECTE DES DONNÉES
        // ================================================
        collectData(type) {
            const data = {
                version: '4.0',
                timestamp: new Date().toISOString(),
                backupType: type,
                provider: this.provider,
                physicalBackup: this.config.physicalBackupEnabled,
                folderPath: this.config.actualFolderPath || 'localStorage',
                metadata: {
                    backupId: this.generateId(),
                    trigger: type,
                    size: 0,
                    user: this.getCurrentUser()
                },
                data: {}
            };
            
            try {
                // Catégories
                if (window.categoryManager) {
                    data.data.categories = this.collectCategories();
                }
                
                // Tâches
                if (window.taskManager) {
                    data.data.tasks = this.collectTasks();
                }
                
                // Paramètres
                data.data.settings = this.collectSettings();
                
                // Préférences
                data.data.preferences = this.collectPreferences();
                
                // Calculer la taille
                data.metadata.size = JSON.stringify(data).length;
                
                console.log(`[Backup] 📊 Données collectées: ${data.metadata.size} bytes`);
                
            } catch (error) {
                console.error('[Backup] Erreur collecte données:', error);
                data.data.error = error.message;
            }
            
            return data;
        }

        collectCategories() {
            try {
                const categories = {};
                
                if (typeof window.categoryManager.getCategories === 'function') {
                    categories.all = window.categoryManager.getCategories();
                }
                
                if (typeof window.categoryManager.getCustomCategories === 'function') {
                    categories.custom = window.categoryManager.getCustomCategories();
                }
                
                if (typeof window.categoryManager.getAllKeywords === 'function') {
                    categories.keywords = window.categoryManager.getAllKeywords();
                }
                
                return categories;
            } catch (error) {
                return { error: error.message };
            }
        }

        collectTasks() {
            try {
                const tasks = {};
                
                if (typeof window.taskManager.getAllTasks === 'function') {
                    const allTasks = window.taskManager.getAllTasks();
                    tasks.all = allTasks;
                    tasks.count = allTasks.length;
                    tasks.completed = allTasks.filter(t => t.status === 'completed').length;
                }
                
                return tasks;
            } catch (error) {
                return { error: error.message };
            }
        }

        collectSettings() {
            const settings = {};
            
            const settingsKeys = [
                'emailsortpro_settings',
                'emailsortpro_preferences', 
                'categorySettings',
                'taskSettings'
            ];
            
            settingsKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        settings[key] = JSON.parse(value);
                    } catch {
                        settings[key] = value;
                    }
                }
            });
            
            return settings;
        }

        collectPreferences() {
            const preferences = {};
            
            const prefKeys = ['theme', 'language', 'notifications', 'autoSort'];
            
            prefKeys.forEach(key => {
                const fullKey = `emailsortpro_pref_${key}`;
                const value = localStorage.getItem(fullKey);
                if (value) {
                    try {
                        preferences[key] = JSON.parse(value);
                    } catch {
                        preferences[key] = value;
                    }
                }
            });
            
            return preferences;
        }

        getCurrentUser() {
            try {
                return window.app?.user?.email || 
                       window.currentUserInfo?.email || 
                       localStorage.getItem('currentUserEmail') || 
                       'unknown';
            } catch {
                return 'unknown';
            }
        }

        // ================================================
        // STOCKAGE LOCAL (fallback)
        // ================================================
        async backupToLocal(data) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const key = `emailsortpro_backup_${timestamp}`;
                
                localStorage.setItem(key, JSON.stringify(data));
                localStorage.setItem('emailsortpro_backup_latest', JSON.stringify(data));
                
                this.cleanupLocalBackups();
                
                console.log('[Backup] ✅ Backup local créé');
                return true;
                
            } catch (error) {
                console.error('[Backup] Erreur backup local:', error);
                return false;
            }
        }

        cleanupLocalBackups() {
            try {
                const keys = Object.keys(localStorage)
                    .filter(key => key.startsWith('emailsortpro_backup_'))
                    .sort()
                    .reverse();
                
                if (keys.length > this.config.maxBackups.local) {
                    const toDelete = keys.slice(this.config.maxBackups.local);
                    toDelete.forEach(key => localStorage.removeItem(key));
                    console.log(`[Backup] 🧹 ${toDelete.length} anciens backups supprimés`);
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage:', error);
            }
        }

        // ================================================
        // STOCKAGE CLOUD (inchangé)
        // ================================================
        async backupToCloud(data) {
            try {
                if (this.provider === 'onedrive') {
                    return await this.backupToOneDrive(data);
                } else if (this.provider === 'googledrive') {
                    return await this.backupToGoogleDrive(data);
                }
                return false;
            } catch (error) {
                console.error('[Backup] Erreur backup cloud:', error);
                return false;
            }
        }

        async backupToOneDrive(data) {
            try {
                const token = await window.authService.getAccessToken();
                if (!token) throw new Error('Token OneDrive indisponible');
                
                const content = JSON.stringify(data, null, 2);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const fileName = `EmailSortPro-${timestamp}.json`;
                
                await this.ensureOneDriveFolder(token);
                
                const url = `https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/${fileName}:/content`;
                
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: content
                });
                
                if (!response.ok) {
                    throw new Error(`OneDrive: ${response.statusText}`);
                }
                
                const latestUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/backup-latest.json:/content`;
                await fetch(latestUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: content
                });
                
                console.log('[Backup] ✅ OneDrive backup créé');
                return true;
                
            } catch (error) {
                console.error('[Backup] OneDrive error:', error);
                return false;
            }
        }

        async backupToGoogleDrive(data) {
            try {
                const token = await window.googleAuthService.getAccessToken();
                if (!token) throw new Error('Token Google Drive indisponible');
                
                const content = JSON.stringify(data, null, 2);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const fileName = `EmailSortPro-${timestamp}.json`;
                
                const folderId = await this.ensureGoogleDriveFolder(token);
                
                const metadata = {
                    name: fileName,
                    parents: [folderId],
                    mimeType: 'application/json'
                };
                
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', new Blob([content], { type: 'application/json' }));
                
                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form
                });
                
                if (!response.ok) {
                    throw new Error(`Google Drive: ${response.statusText}`);
                }
                
                console.log('[Backup] ✅ Google Drive backup créé');
                return true;
                
            } catch (error) {
                console.error('[Backup] Google Drive error:', error);
                return false;
            }
        }

        // ================================================
        // GESTION DES DOSSIERS CLOUD
        // ================================================
        async ensureOneDriveFolder(token) {
            try {
                const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 404) {
                    await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/Documents:/children', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: 'EmailSortPro',
                            folder: {},
                            '@microsoft.graph.conflictBehavior': 'replace'
                        })
                    });
                }
                
                return true;
            } catch (error) {
                console.error('[Backup] OneDrive folder error:', error);
                return false;
            }
        }

        async ensureGoogleDriveFolder(token) {
            try {
                const searchResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q=name='EmailSortPro' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                const searchData = await searchResponse.json();
                
                if (searchData.files && searchData.files.length > 0) {
                    return searchData.files[0].id;
                }
                
                const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'EmailSortPro',
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                });
                
                const createData = await createResponse.json();
                return createData.id;
                
            } catch (error) {
                console.error('[Backup] Google Drive folder error:', error);
                throw error;
            }
        }

        // ================================================
        // UTILITAIRES
        // ================================================
        generateId() {
            return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        saveLastBackupTime() {
            try {
                localStorage.setItem('emailsortpro_backup_last', this.lastBackupTime.toISOString());
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde timestamp');
            }
        }

        showNotification(message, type = 'info', duration = 3000) {
            console.log(`[Backup] ${type.toUpperCase()}: ${message}`);
            
            if (window.uiManager && window.uiManager.showToast) {
                window.uiManager.showToast(message, type, duration);
            } else {
                // Fallback avec alert pour les messages importants
                if (type === 'error' || message.includes('créé')) {
                    alert(message);
                }
            }
        }

        fallbackToLocal() {
            console.log('[Backup] 🔧 Mode de secours - localStorage uniquement');
            this.provider = 'local';
            this.config.physicalBackupEnabled = false;
            this.isInitialized = true;
            this.startAutoTimers();
            this.queueBackup('fallback');
        }

        // ================================================
        // API PUBLIQUE
        // ================================================
        async manualBackup() {
            console.log('[Backup] 🔄 Backup manuel déclenché');
            this.queueBackup('manual', 100);
            await this.processQueue();
        }

        async setupPhysicalFolder() {
            console.log('[Backup] 🔧 Configuration manuelle du dossier physique...');
            try {
                await this.forceCreateDocumentsFolder();
                return true;
            } catch (error) {
                console.error('[Backup] Erreur setup manuel:', error);
                return false;
            }
        }

        getStatus() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return {
                enabled: this.config.enabled,
                initialized: this.isInitialized,
                provider: this.provider,
                cloudReady: this.isCloudReady(),
                physicalBackupEnabled: this.config.physicalBackupEnabled,
                folderPath: this.config.actualFolderPath || 'localStorage',
                lastBackup: lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais',
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue,
                mode: this.config.physicalBackupEnabled ? 
                    `Physique (${this.config.actualFolderPath})` : 
                    'Navigateur (localStorage)'
            };
        }

        enable() {
            this.config.enabled = true;
            this.saveConfig();
            if (!this.isInitialized) {
                this.init();
            } else {
                this.startAutoTimers();
            }
            console.log('[Backup] ✅ Service activé');
        }

        disable() {
            this.config.enabled = false;
            this.saveConfig();
            this.stopTimers();
            console.log('[Backup] ⏸️ Service désactivé');
        }

        stopTimers() {
            Object.values(this.timers).forEach(timer => {
                if (timer) clearInterval(timer);
            });
            
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
        }
    }

    // ================================================
    // INITIALISATION GLOBALE
    // ================================================
    
    window.backupService = new BackupService();
    
    // Fonctions globales
    window.triggerBackup = () => window.backupService?.manualBackup();
    window.getBackupStatus = () => window.backupService?.getStatus() || { available: false };
    window.setupBackupFolder = () => window.backupService?.setupPhysicalFolder();
    window.enableBackup = () => window.backupService?.enable();
    window.disableBackup = () => window.backupService?.disable();
    
    // Gérer les changements d'authentification
    window.addEventListener('authStateChanged', () => {
        if (window.backupService) {
            setTimeout(() => {
                window.backupService.detectProvider();
            }, 1000);
        }
    });
    
    // Backup avant fermeture
    window.addEventListener('beforeunload', () => {
        if (window.backupService) {
            window.backupService.queueBackup('beforeClose', 90);
        }
    });
    
    console.log('✅ BackupService avec DOSSIER FORCÉ chargé');
    console.log('📁 Création automatique du dossier Documents/EmailSortPro au démarrage');
    console.log('🔄 Backup automatique: Physique prioritaire + Cloud + localStorage fallback');
    console.log('👁️ Surveillance temps réel des données activée');

})();
