// backup.js - Version avec déclenchement utilisateur pour le dossier
// Cette version demande l'accès au dossier sur action utilisateur

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
            
            // Configuration avec setup utilisateur
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
                silentMode: false,      // Notifications activées
                autoDetect: true,
                
                // Configuration dossier physique
                physicalBackupEnabled: false,
                documentsSetupNeeded: true,
                showSetupPrompt: true
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.documentsHandle = null;
            this.setupPromptShown = false;
            
            this.init();
        }

        // ================================================
        // INITIALISATION AVEC PROMPT UTILISATEUR
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation du service avec setup utilisateur...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                // Programmer le prompt de setup après un délai
                this.scheduleSetupPrompt();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service prêt - Provider: ${this.provider}`);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

        scheduleSetupPrompt() {
            if (this.config.documentsSetupNeeded && this.config.showSetupPrompt) {
                setTimeout(() => {
                    this.showSetupPrompt();
                }, 3000); // Attendre 3 secondes après le chargement
            }
        }

        showSetupPrompt() {
            if (this.setupPromptShown || this.config.physicalBackupEnabled) {
                return;
            }
            
            this.setupPromptShown = true;
            
            const setupNeeded = !window.showDirectoryPicker ? 
                'Votre navigateur ne supporte pas les dossiers physiques.' :
                'Voulez-vous configurer un dossier physique pour vos backups ?';
            
            if (window.showDirectoryPicker) {
                this.showNotification(
                    '📁 Configuration de backup recommandée !\n\n' + 
                    'Cliquez sur "Configurer Backup" dans les Paramètres\n' +
                    'pour sauvegarder dans Documents/EmailSortPro',
                    'info',
                    8000
                );
                
                // Ajouter un bouton dans l'interface si possible
                this.addSetupButton();
            } else {
                this.showNotification(
                    '💾 Backup actif dans le navigateur.\n' +
                    'Les données sont sauvegardées automatiquement.',
                    'info',
                    5000
                );
            }
        }

        addSetupButton() {
            // Ajouter un bouton flottant pour la configuration
            if (document.getElementById('backup-setup-button')) return;
            
            const button = document.createElement('button');
            button.id = 'backup-setup-button';
            button.innerHTML = '📁 Configurer Backup';
            button.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 12px 20px;
                background: linear-gradient(135deg, #6366F1, #EC4899);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                transition: all 0.3s;
                animation: pulse 2s infinite;
            `;
            
            // Animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                #backup-setup-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }
            `;
            document.head.appendChild(style);
            
            button.onclick = () => {
                this.setupPhysicalBackup();
                button.remove();
            };
            
            document.body.appendChild(button);
            
            // Retirer automatiquement après 30 secondes
            setTimeout(() => {
                if (button.parentNode) {
                    button.remove();
                }
            }, 30000);
        }

        // ================================================
        // SETUP MANUEL DU DOSSIER PHYSIQUE
        // ================================================
        async setupPhysicalBackup() {
            console.log('[Backup] 🔧 Setup manuel du backup physique...');
            
            if (!window.showDirectoryPicker) {
                this.showNotification(
                    '❌ Votre navigateur ne supporte pas cette fonctionnalité.\n' +
                    'Utilisez Chrome ou Edge pour accéder aux dossiers.',
                    'error'
                );
                return false;
            }
            
            try {
                this.showNotification('📁 Sélectionnez le dossier Documents...', 'info');
                
                // Demander l'accès avec action utilisateur
                await this.requestDocumentsAccess();
                
                if (this.documentsHandle) {
                    this.config.physicalBackupEnabled = true;
                    this.config.documentsSetupNeeded = false;
                    this.config.showSetupPrompt = false;
                    this.saveConfig();
                    
                    // Test immédiat
                    await this.testBackupAccess();
                    
                    // Backup immédiat dans le nouveau dossier
                    await this.performBackup('setup');
                    
                    this.showNotification(
                        '✅ Dossier Documents/EmailSortPro configuré !\n' +
                        'Les backups sont maintenant sauvegardés physiquement.',
                        'success',
                        5000
                    );
                    
                    return true;
                } else {
                    throw new Error('Aucun dossier sélectionné');
                }
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur setup:', error);
                
                if (error.name === 'AbortError') {
                    this.showNotification('Configuration annulée.', 'info');
                } else {
                    this.showNotification(
                        '❌ Erreur lors de la configuration du dossier.\n' +
                        'Les backups continuent dans le navigateur.',
                        'error'
                    );
                }
                
                return false;
            }
        }

        async requestDocumentsAccess() {
            console.log('[Backup] 🔓 Demande d\'accès au dossier Documents...');
            
            const pickerOptions = {
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-backup-v4'
            };
            
            try {
                // Sélectionner le dossier parent
                const parentHandle = await window.showDirectoryPicker(pickerOptions);
                console.log('[Backup] 📂 Dossier parent:', parentHandle.name);
                
                // Créer ou accéder au dossier EmailSortPro
                let emailSortProHandle;
                try {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro');
                    console.log('[Backup] 📁 Dossier EmailSortPro trouvé');
                } catch (notFoundError) {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro', {
                        create: true
                    });
                    console.log('[Backup] 📁 Dossier EmailSortPro créé');
                }
                
                // Test d'écriture
                await this.testWriteAccess(emailSortProHandle);
                
                // Sauvegarder
                this.documentsHandle = emailSortProHandle;
                this.config.folderPath = `${parentHandle.name}/EmailSortPro`;
                
                console.log('[Backup] ✅ Accès configuré:', this.config.folderPath);
                return true;
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur accès:', error);
                throw error;
            }
        }

        async testWriteAccess(directoryHandle) {
            const testFileName = '.emailsortpro-test-' + Date.now();
            
            try {
                const testFileHandle = await directoryHandle.getFileHandle(testFileName, {
                    create: true
                });
                
                const writable = await testFileHandle.createWritable();
                await writable.write('Test EmailSortPro - ' + new Date().toISOString());
                await writable.close();
                
                await directoryHandle.removeEntry(testFileName);
                console.log('[Backup] ✅ Test écriture réussi');
                return true;
                
            } catch (error) {
                console.error('[Backup] ❌ Test écriture échoué:', error);
                throw new Error('Impossible d\'écrire dans ce dossier');
            }
        }

        async testBackupAccess() {
            try {
                const testData = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    test: true,
                    message: 'Test de configuration du backup'
                }, null, 2);
                
                await this.storeInPhysicalFolder(testData, new Date().toISOString(), 'test');
                console.log('[Backup] ✅ Test backup réussi');
                
            } catch (error) {
                console.error('[Backup] ❌ Test backup échoué:', error);
                throw error;
            }
        }

        // ================================================
        // STOCKAGE PHYSIQUE
        // ================================================
        async storeInPhysicalFolder(data, timestamp, type = 'backup') {
            if (!this.documentsHandle) {
                throw new Error('Aucun dossier configuré');
            }
            
            try {
                const date = new Date(timestamp);
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
                
                const fileName = type === 'test' ? 
                    `EmailSortPro-Test-${timeStr}.json` :
                    `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
                
                const fileHandle = await this.documentsHandle.getFileHandle(fileName, {
                    create: true
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(data);
                await writable.close();
                
                console.log(`[Backup] 💾 Fichier créé: ${fileName}`);
                
                // Créer aussi un fichier "latest"
                if (type === 'backup') {
                    await this.createLatestFile(data);
                }
                
                return fileName;
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur stockage:', error);
                throw error;
            }
        }

        async createLatestFile(data) {
            try {
                const latestHandle = await this.documentsHandle.getFileHandle('EmailSortPro-Latest.json', {
                    create: true
                });
                
                const writable = await latestHandle.createWritable();
                await writable.write(data);
                await writable.close();
                
            } catch (error) {
                console.warn('[Backup] ⚠️ Erreur Latest:', error);
            }
        }

        // ================================================
        // MÉTHODES DE BASE
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
                    // Ignore errors
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
                    if (['setup', 'manual'].includes(backup.type)) {
                        const location = this.config.physicalBackupEnabled ? 
                            this.config.folderPath : 'navigateur';
                        this.showNotification(`💾 Backup créé dans ${location}`, 'success');
                    }
                } else {
                    console.warn(`[Backup] ⚠️ ${backup.type} échoué`);
                }
                
            } catch (error) {
                console.error(`[Backup] ❌ Erreur ${backup.type}:`, error);
            }
        }

        // ================================================
        // TIMERS ET BACKUP INITIAL
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
                
                // Priorité au dossier physique si configuré
                if (this.config.physicalBackupEnabled && this.documentsHandle) {
                    try {
                        const dataString = JSON.stringify(data, null, 2);
                        await this.storeInPhysicalFolder(dataString, data.timestamp, 'backup');
                        success = true;
                        console.log('[Backup] ✅ Backup physique créé');
                    } catch (physicalError) {
                        console.warn('[Backup] ⚠️ Erreur backup physique:', physicalError);
                        success = await this.backupToLocal(data);
                    }
                } else {
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
                folderPath: this.config.folderPath || 'localStorage',
                metadata: {
                    backupId: this.generateId(),
                    trigger: type,
                    size: 0,
                    user: this.getCurrentUser()
                },
                data: {}
            };
            
            try {
                if (window.categoryManager) {
                    data.data.categories = this.collectCategories();
                }
                
                if (window.taskManager) {
                    data.data.tasks = this.collectTasks();
                }
                
                data.data.settings = this.collectSettings();
                data.data.preferences = this.collectPreferences();
                
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
        // STOCKAGE LOCAL
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
        // STOCKAGE CLOUD (simplifié)
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
                
                console.log('[Backup] ✅ OneDrive backup créé');
                return true;
                
            } catch (error) {
                console.error('[Backup] OneDrive error:', error);
                return false;
            }
        }

        async backupToGoogleDrive(data) {
            // Implementation similaire...
            return false;
        }

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
                // Notification native du navigateur en fallback
                if (type === 'error' || message.includes('✅') || message.includes('📁')) {
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

        async setupFolder() {
            return await this.setupPhysicalBackup();
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
                folderPath: this.config.folderPath || 'localStorage',
                lastBackup: lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais',
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue,
                setupNeeded: this.config.documentsSetupNeeded,
                mode: this.config.physicalBackupEnabled ? 
                    `Physique (${this.config.folderPath})` : 
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
    window.setupBackupFolder = () => window.backupService?.setupFolder();
    window.getBackupStatus = () => window.backupService?.getStatus() || { available: false };
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
    
    console.log('✅ BackupService avec setup utilisateur chargé');
    console.log('🔄 Backup automatique actif');
    console.log('📁 Configuration dossier physique disponible via action utilisateur');
    console.log('👁️ Surveillance temps réel des données activée');

})();
