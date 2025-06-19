// backup.js - Service de Backup Automatique et Transparent
// Version 4.0 - Backup entièrement automatique sans intervention utilisateur
// Compatible avec Microsoft OneDrive, Google Drive et stockage local

(function() {
    'use strict';

    // ================================================
    // SERVICE DE BACKUP AUTOMATIQUE
    // ================================================
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
            
            // Configuration automatique
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
                silentMode: true,       // Pas de notifications sauf erreurs
                autoDetect: true        // Détection automatique du provider
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            
            this.init();
        }

        // ================================================
        // INITIALISATION AUTOMATIQUE
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation du service automatique...');
            
            try {
                // Charger la configuration
                this.loadConfig();
                
                // Détecter le provider automatiquement
                await this.detectProvider();
                
                // Démarrer la surveillance des données
                this.startDataWatching();
                
                // Créer le premier backup
                await this.createInitialBackup();
                
                // Démarrer les timers automatiques
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service prêt - Provider: ${this.provider}`);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

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
                localStorage.setItem('emailsortpro_backup_config', JSON.stringify(this.config));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        // ================================================
        // DÉTECTION AUTOMATIQUE DU PROVIDER
        // ================================================
        async detectProvider() {
            console.log('[Backup] 🔍 Détection automatique du provider...');
            
            // Vérifier OneDrive
            if (this.isOneDriveReady()) {
                this.provider = 'onedrive';
                console.log('[Backup] ☁️ OneDrive détecté');
                return;
            }
            
            // Vérifier Google Drive
            if (this.isGoogleDriveReady()) {
                this.provider = 'googledrive';
                console.log('[Backup] ☁️ Google Drive détecté');
                return;
            }
            
            // Mode local
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
            
            // Intercepter les modifications localStorage
            this.interceptLocalStorage();
            
            // Surveiller les objets globaux
            this.watchGlobalObjects();
            
            // Écouter les événements d'application
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
            // Surveiller les managers principaux
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
            // Filtrer les changements non importants
            if (this.shouldIgnoreChange(key)) return;
            
            console.log(`[Backup] 📝 Changement: ${source}.${key}`);
            
            // Programmer un backup après un délai
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
            // Annuler le timer précédent
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            
            // Programmer un nouveau backup
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
                    
                    // Pause entre backups
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
            
            // Timer principal (localStorage)
            this.timers.auto = setInterval(() => {
                this.queueBackup('auto', 40);
            }, this.config.intervals.auto);
            
            // Timer cloud
            if (this.provider !== 'local') {
                this.timers.cloud = setInterval(() => {
                    if (this.isCloudReady()) {
                        this.queueBackup('cloud', 60);
                    }
                }, this.config.intervals.cloud);
            }
            
            // Timer quotidien
            this.scheduleDailyBackup();
            
            console.log('[Backup] ⏰ Timers actifs');
        }

        scheduleDailyBackup() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0); // 2h du matin
            
            const timeUntil = tomorrow.getTime() - now.getTime();
            
            setTimeout(() => {
                this.queueBackup('daily', 70);
                
                // Répéter tous les jours
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
                // Backup local immédiat
                await this.performBackup('initial');
                
                // Backup cloud si disponible
                if (this.isCloudReady()) {
                    await this.performBackup('initialCloud');
                }
                
                console.log('[Backup] ✅ Backup initial créé');
                
                // Marquer l'initialisation
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
                
                // Backup selon le provider et le type
                if (type.includes('Cloud') || (this.isCloudReady() && type !== 'auto')) {
                    success = await this.backupToCloud(data);
                }
                
                // Toujours sauvegarder en local aussi
                if (type !== 'cloudOnly') {
                    const localSuccess = await this.backupToLocal(data);
                    success = success || localSuccess;
                }
                
                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();
                    
                    // Notification silencieuse sauf erreurs
                    if (type === 'manual' && !this.config.silentMode) {
                        this.showNotification(true);
                    }
                }
                
                return success;
                
            } catch (error) {
                console.error('[Backup] Erreur backup:', error);
                
                if (type === 'manual') {
                    this.showNotification(false, error.message);
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
                type,
                provider: this.provider,
                id: this.generateId(),
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
                
                // Métadonnées
                data.metadata = {
                    size: JSON.stringify(data).length,
                    user: this.getCurrentUser(),
                    app: this.getAppInfo()
                };
                
                console.log(`[Backup] 📊 Données collectées: ${data.metadata.size} bytes`);
                
            } catch (error) {
                console.error('[Backup] Erreur collecte:', error);
                data.error = error.message;
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

        getAppInfo() {
            try {
                return {
                    version: window.AppConfig?.version || '4.0.0',
                    view: window.location.hash || '#dashboard'
                };
            } catch {
                return { version: '4.0.0' };
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
        // STOCKAGE CLOUD
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
                
                // Assurer le dossier
                await this.ensureOneDriveFolder(token);
                
                // Upload
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
                
                // Latest aussi
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

        showNotification(success, message = '') {
            if (this.config.silentMode && success) return;
            
            if (window.uiManager && window.uiManager.showToast) {
                if (success) {
                    window.uiManager.showToast('✅ Backup réussi', 'success', 2000);
                } else {
                    window.uiManager.showToast(`❌ Erreur backup: ${message}`, 'error', 5000);
                }
            }
        }

        fallbackToLocal() {
            console.log('[Backup] 🔧 Mode de secours - Local uniquement');
            this.provider = 'local';
            this.isInitialized = true;
            this.startAutoTimers();
            this.queueBackup('fallback');
        }

        // ================================================
        // API PUBLIQUE
        // ================================================
        async manualBackup() {
            console.log('[Backup] 🔄 Backup manuel');
            this.queueBackup('manual', 100);
            await this.processQueue();
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
                lastBackup: lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais',
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue,
                mode: 'Automatique'
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
    
    // Créer le service global
    window.backupService = new BackupService();
    
    // Fonctions globales
    window.triggerBackup = () => window.backupService?.manualBackup();
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
    
    console.log('✅ BackupService chargé - Mode automatique transparent');
    console.log('🔄 Backup automatique: Local (30s) + Cloud (10min) + Quotidien (2h)');
    console.log('👁️ Surveillance temps réel des données activée');

})();
