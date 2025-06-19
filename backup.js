// backup.js - Service de sauvegarde unifié complet pour EmailSortPro
// Compatible avec Microsoft OneDrive et Google Drive Documents
// Sauvegarde automatique des tâches et catégories paramétrées

class BackupService {
    constructor() {
        this.provider = null;
        this.isInitialized = false;
        this.backupInProgress = false;
        this.lastBackupTime = null;
        this.backupTimer = null;
        
        // Configuration par défaut
        this.config = {
            enabled: true,
            autoBackup: true,
            backupInterval: 5 * 60 * 1000, // 5 minutes
            includeCategories: true,
            includeTasks: true,
            includeSettings: true,
            maxBackups: 10,
            folderPath: 'Documents/EmailSortPro/Backups'
        };
        
        this.loadConfig();
        console.log('[BackupService] Initialized with config:', this.config);
    }

    // =====================================
    // CONFIGURATION
    // =====================================
    loadConfig() {
        try {
            const saved = localStorage.getItem('emailsortpro_backup_config');
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('[BackupService] Error loading config:', error);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('emailsortpro_backup_config', JSON.stringify(this.config));
            console.log('[BackupService] Config saved');
            
            if (this.config.autoBackup) {
                this.startAutoBackup();
            } else {
                this.stopAutoBackup();
            }
        } catch (error) {
            console.error('[BackupService] Error saving config:', error);
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        
        if (window.uiManager) {
            window.uiManager.showToast('Configuration de backup mise à jour', 'success');
        }
    }

    // =====================================
    // INITIALISATION
    // =====================================
    async initialize() {
        if (this.isInitialized) {
            console.log('[BackupService] Already initialized');
            return;
        }

        try {
            // Déterminer le provider actif
            if (window.app && window.app.activeProvider) {
                this.provider = window.app.activeProvider;
            } else {
                if (window.authService && window.authService.isAuthenticated()) {
                    this.provider = 'microsoft';
                } else if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                    this.provider = 'google';
                }
            }

            if (!this.provider) {
                console.warn('[BackupService] No active provider detected');
                return;
            }

            console.log('[BackupService] Initializing with provider:', this.provider);
            
            this.isInitialized = true;
            
            if (this.config.enabled && this.config.autoBackup) {
                this.startAutoBackup();
            }
            
            await this.checkAndRestoreIfNeeded();
            
            console.log('[BackupService] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[BackupService] Initialization error:', error);
            this.isInitialized = false;
        }
    }

    // =====================================
    // BACKUP AUTOMATIQUE
    // =====================================
    startAutoBackup() {
        this.stopAutoBackup();
        
        if (!this.config.enabled || !this.config.autoBackup) {
            console.log('[BackupService] Auto backup disabled');
            return;
        }
        
        console.log('[BackupService] Starting auto backup, interval:', this.config.backupInterval);
        
        this.backupTimer = setInterval(() => {
            this.performBackup('auto');
        }, this.config.backupInterval);
    }

    stopAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
            console.log('[BackupService] Auto backup stopped');
        }
    }

    // =====================================
    // COLLECTE DES DONNÉES COMPLÈTE
    // =====================================
    collectBackupData() {
        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            provider: this.provider,
            app: {
                name: 'EmailSortPro',
                version: window.AppConfig?.app?.version || '3.0.0'
            },
            data: {}
        };
        
        // Collecter les catégories avec leurs mots-clés
        if (this.config.includeCategories && window.categoryManager) {
            try {
                const categories = window.categoryManager.getCategories();
                const customCategories = window.categoryManager.getCustomCategories();
                const allKeywords = window.categoryManager.getAllKeywords();
                
                data.data.categories = {
                    all: categories,
                    custom: customCategories,
                    keywords: allKeywords,
                    count: Object.keys(categories).length,
                    customCount: Object.keys(customCategories).length
                };
                
                console.log(`[BackupService] Collected ${data.data.categories.count} categories (${data.data.categories.customCount} custom)`);
            } catch (error) {
                console.error('[BackupService] Error collecting categories:', error);
                data.data.categories = { error: error.message };
            }
        }
        
        // Collecter les tâches complètes
        if (this.config.includeTasks && window.taskManager) {
            try {
                const tasks = window.taskManager.getAllTasks();
                const stats = window.taskManager.getStats();
                
                data.data.tasks = {
                    all: tasks,
                    stats: stats,
                    count: tasks.length,
                    completed: tasks.filter(t => t.completed).length,
                    pending: tasks.filter(t => !t.completed).length,
                    byCategory: this.groupTasksByCategory(tasks)
                };
                
                console.log(`[BackupService] Collected ${data.data.tasks.count} tasks`);
            } catch (error) {
                console.error('[BackupService] Error collecting tasks:', error);
                data.data.tasks = { error: error.message };
            }
        }
        
        // Collecter les paramètres
        if (this.config.includeSettings) {
            try {
                const categorySettings = this.loadCategorySettings();
                const taskSettings = this.loadTaskSettings();
                const appSettings = this.loadAppSettings();
                
                data.data.settings = {
                    categories: categorySettings,
                    tasks: taskSettings,
                    app: appSettings,
                    backup: this.config
                };
                
                console.log('[BackupService] Collected application settings');
            } catch (error) {
                console.error('[BackupService] Error collecting settings:', error);
                data.data.settings = { error: error.message };
            }
        }
        
        // Métadonnées du backup
        data.metadata = {
            totalSize: JSON.stringify(data).length,
            backupId: this.generateBackupId(),
            user: window.app?.user?.email || 'unknown',
            dataIntegrity: this.calculateDataChecksum(data),
            backupType: 'complete'
        };
        
        return data;
    }

    groupTasksByCategory(tasks) {
        const grouped = {};
        
        tasks.forEach(task => {
            const category = task.category || 'uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(task);
        });
        
        return grouped;
    }

    loadCategorySettings() {
        try {
            const categorySettings = localStorage.getItem('categorySettings');
            return categorySettings ? JSON.parse(categorySettings) : {};
        } catch (error) {
            console.warn('[BackupService] Error loading category settings:', error);
            return {};
        }
    }

    loadTaskSettings() {
        try {
            const taskSettings = localStorage.getItem('taskSettings');
            return taskSettings ? JSON.parse(taskSettings) : {};
        } catch (error) {
            console.warn('[BackupService] Error loading task settings:', error);
            return {};
        }
    }

    loadAppSettings() {
        try {
            const settings = {};
            
            const keys = [
                'emailsortpro_client_id',
                'currentUserInfo',
                'app_preferences',
                'ui_settings'
            ];
            
            keys.forEach(key => {
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
        } catch (error) {
            console.warn('[BackupService] Error loading app settings:', error);
            return {};
        }
    }

    calculateDataChecksum(data) {
        const str = JSON.stringify(data.data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    // =====================================
    // BACKUP PRINCIPAL
    // =====================================
    async performBackup(trigger = 'manual') {
        if (!this.isInitialized || !this.config.enabled) {
            console.log('[BackupService] Backup skipped - not initialized or disabled');
            return false;
        }

        if (this.backupInProgress) {
            console.log('[BackupService] Backup already in progress');
            return false;
        }

        try {
            this.backupInProgress = true;
            console.log(`[BackupService] Starting ${trigger} backup...`);
            
            const backupData = this.collectBackupData();
            
            if (!backupData || !backupData.data) {
                console.log('[BackupService] No data to backup');
                return false;
            }
            
            let success = false;
            if (this.provider === 'microsoft') {
                success = await this.backupToOneDrive(backupData);
            } else if (this.provider === 'google') {
                success = await this.backupToGoogleDrive(backupData);
            }
            
            if (success) {
                this.lastBackupTime = new Date();
                localStorage.setItem('emailsortpro_last_backup', this.lastBackupTime.toISOString());
                
                if (trigger === 'manual' && window.uiManager) {
                    window.uiManager.showToast('✅ Backup complet réussi dans Documents', 'success');
                }
                
                console.log('[BackupService] ✅ Backup successful');
            }
            
            return success;
            
        } catch (error) {
            console.error('[BackupService] Backup error:', error);
            
            if (trigger === 'manual' && window.uiManager) {
                window.uiManager.showToast('❌ Erreur de backup: ' + error.message, 'error');
            }
            
            return false;
            
        } finally {
            this.backupInProgress = false;
        }
    }

    // =====================================
    // RESTAURATION COMPLÈTE
    // =====================================
    async checkAndRestoreIfNeeded() {
        try {
            const hasLocalTasks = window.taskManager && window.taskManager.getAllTasks().length > 0;
            const hasLocalCategories = window.categoryManager && Object.keys(window.categoryManager.getCustomCategories()).length > 0;
            
            if (hasLocalTasks || hasLocalCategories) {
                console.log('[BackupService] Local data exists, no restoration needed');
                return;
            }
            
            console.log('[BackupService] No local data found, checking for cloud backup...');
            
            const restored = await this.restoreFromBackup('latest');
            
            if (restored && window.uiManager) {
                window.uiManager.showToast('✅ Données restaurées depuis le backup cloud', 'success');
            }
            
        } catch (error) {
            console.error('[BackupService] Error checking/restoring backup:', error);
        }
    }

    async restoreFromBackup(backupId = 'latest') {
        if (!this.isInitialized) {
            console.warn('[BackupService] Cannot restore - not initialized');
            return false;
        }
        
        try {
            console.log('[BackupService] Starting restoration...');
            
            let backupData = null;
            
            if (this.provider === 'microsoft') {
                backupData = await this.loadFromOneDrive(backupId);
            } else if (this.provider === 'google') {
                backupData = await this.loadFromGoogleDrive(backupId);
            }
            
            if (!backupData) {
                console.log('[BackupService] No backup found');
                return false;
            }
            
            if (!backupData.version || !backupData.data) {
                throw new Error('Invalid backup format');
            }
            
            if (backupData.metadata && backupData.metadata.dataIntegrity) {
                const currentChecksum = this.calculateDataChecksum(backupData);
                if (currentChecksum !== backupData.metadata.dataIntegrity) {
                    console.warn('[BackupService] Backup integrity check failed, but continuing...');
                }
            }
            
            console.log('[BackupService] Backup loaded:', {
                timestamp: backupData.timestamp,
                categories: backupData.data.categories?.count || 0,
                tasks: backupData.data.tasks?.count || 0,
                version: backupData.version
            });
            
            if (backupData.data.categories && window.categoryManager) {
                await this.restoreCategories(backupData.data.categories);
            }
            
            if (backupData.data.tasks && window.taskManager) {
                await this.restoreTasks(backupData.data.tasks);
            }
            
            if (backupData.data.settings) {
                await this.restoreSettings(backupData.data.settings);
            }
            
            this.refreshUI();
            
            console.log('[BackupService] ✅ Restoration complete');
            return true;
            
        } catch (error) {
            console.error('[BackupService] Restoration error:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast('❌ Erreur de restauration: ' + error.message, 'error');
            }
            
            return false;
        }
    }

    async restoreCategories(categoriesData) {
        try {
            if (categoriesData.custom) {
                Object.entries(categoriesData.custom).forEach(([id, category]) => {
                    try {
                        window.categoryManager.createCustomCategory(category);
                    } catch (error) {
                        console.warn(`[BackupService] Error restoring category ${id}:`, error);
                    }
                });
                
                console.log(`[BackupService] Restored ${Object.keys(categoriesData.custom).length} custom categories`);
            }
            
            if (categoriesData.keywords) {
                Object.entries(categoriesData.keywords).forEach(([categoryId, keywords]) => {
                    try {
                        window.categoryManager.updateCategoryKeywords(categoryId, keywords);
                    } catch (error) {
                        console.warn(`[BackupService] Error restoring keywords for ${categoryId}:`, error);
                    }
                });
                
                console.log(`[BackupService] Restored keywords for ${Object.keys(categoriesData.keywords).length} categories`);
            }
        } catch (error) {
            console.error('[BackupService] Error restoring categories:', error);
        }
    }

    async restoreTasks(tasksData) {
        try {
            if (tasksData.all && Array.isArray(tasksData.all)) {
                if (window.taskManager.clearAllTasks) {
                    window.taskManager.clearAllTasks();
                }
                
                let restoredCount = 0;
                tasksData.all.forEach(task => {
                    try {
                        window.taskManager.createTask(task);
                        restoredCount++;
                    } catch (error) {
                        console.warn(`[BackupService] Error restoring task ${task.id}:`, error);
                    }
                });
                
                console.log(`[BackupService] Restored ${restoredCount}/${tasksData.all.length} tasks`);
            }
        } catch (error) {
            console.error('[BackupService] Error restoring tasks:', error);
        }
    }

    async restoreSettings(settingsData) {
        try {
            if (settingsData.categories) {
                localStorage.setItem('categorySettings', JSON.stringify(settingsData.categories));
                
                if (window.categoryManager && window.categoryManager.reloadSettingsFromStorage) {
                    window.categoryManager.reloadSettingsFromStorage();
                }
            }
            
            if (settingsData.tasks) {
                localStorage.setItem('taskSettings', JSON.stringify(settingsData.tasks));
            }
            
            if (settingsData.app) {
                const safeKeys = ['app_preferences', 'ui_settings'];
                Object.entries(settingsData.app).forEach(([key, value]) => {
                    if (safeKeys.includes(key)) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });
            }
            
            console.log('[BackupService] Settings restored');
        } catch (error) {
            console.error('[BackupService] Error restoring settings:', error);
        }
    }

    refreshUI() {
        try {
            if (window.pageManager) {
                const currentPage = window.pageManager.currentPage;
                
                if (currentPage === 'tasks' || currentPage === 'categories' || currentPage === 'dashboard') {
                    window.pageManager.refreshCurrentPage();
                }
            }
            
            if (window.dashboardModule && window.dashboardModule.refresh) {
                window.dashboardModule.refresh();
            }
            
            window.dispatchEvent(new CustomEvent('dataRestored', {
                detail: {
                    timestamp: new Date().toISOString(),
                    source: 'BackupService'
                }
            }));
            
        } catch (error) {
            console.error('[BackupService] Error refreshing UI:', error);
        }
    }

    // =====================================
    // BACKUP MICROSOFT ONEDRIVE
    // =====================================
    async backupToOneDrive(data) {
        try {
            const token = await window.authService.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }
            
            const content = JSON.stringify(data, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `backup_${timestamp}.json`;
            const latestFileName = 'backup_latest.json';
            
            const folderPath = '/drive/root:/Documents/EmailSortPro/Backups';
            
            await this.ensureOneDriveFolder(token);
            
            const uploadUrl = `https://graph.microsoft.com/v1.0/me${folderPath}/${fileName}:/content`;
            
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: blob
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OneDrive upload failed: ${error}`);
            }
            
            const latestUrl = `https://graph.microsoft.com/v1.0/me${folderPath}/${latestFileName}:/content`;
            
            await fetch(latestUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: blob
            });
            
            console.log('[BackupService] ✅ OneDrive backup successful:', fileName);
            
            await this.cleanupOldBackups(token, 'onedrive');
            
            return true;
            
        } catch (error) {
            console.error('[BackupService] OneDrive backup error:', error);
            throw error;
        }
    }

    async ensureOneDriveFolder(token) {
        try {
            const createFolder = async (path, name) => {
                const response = await fetch(`https://graph.microsoft.com/v1.0/me${path}/children`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        folder: {},
                        '@microsoft.graph.conflictBehavior': 'replace'
                    })
                });
                
                if (!response.ok && response.status !== 409) {
                    throw new Error(`Failed to create folder: ${name}`);
                }
            };
            
            await createFolder('/drive/root:/Documents', 'EmailSortPro');
            await createFolder('/drive/root:/Documents/EmailSortPro', 'Backups');
            
            console.log('[BackupService] ✅ OneDrive folder structure ready');
            
        } catch (error) {
            console.error('[BackupService] Error creating OneDrive folders:', error);
            throw error;
        }
    }

    // =====================================
    // BACKUP GOOGLE DRIVE
    // =====================================
    async backupToGoogleDrive(data) {
        try {
            const token = await window.googleAuthService.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }
            
            const content = JSON.stringify(data, null, 2);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `backup_${timestamp}.json`;
            const latestFileName = 'backup_latest.json';
            
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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Google Drive upload failed: ${error}`);
            }
            
            await this.updateGoogleDriveLatest(token, folderId, content);
            
            console.log('[BackupService] ✅ Google Drive backup successful:', fileName);
            
            await this.cleanupOldBackups(token, 'googledrive');
            
            return true;
            
        } catch (error) {
            console.error('[BackupService] Google Drive backup error:', error);
            throw error;
        }
    }

    async ensureGoogleDriveFolder(token) {
        try {
            let documentsId = null;
            const searchDocs = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='Documents' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (searchDocs.ok) {
                const docsData = await searchDocs.json();
                if (docsData.files && docsData.files.length > 0) {
                    documentsId = docsData.files[0].id;
                }
            }
            
            const parentId = documentsId || 'root';
            
            let emailSortProId = null;
            const searchESP = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='EmailSortPro' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (searchESP.ok) {
                const espData = await searchESP.json();
                if (espData.files && espData.files.length > 0) {
                    emailSortProId = espData.files[0].id;
                }
            }
            
            if (!emailSortProId) {
                const createESP = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'EmailSortPro',
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [parentId]
                    })
                });
                
                if (createESP.ok) {
                    const espData = await createESP.json();
                    emailSortProId = espData.id;
                }
            }
            
            let backupsId = null;
            const searchBackups = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='Backups' and '${emailSortProId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (searchBackups.ok) {
                const backupsData = await searchBackups.json();
                if (backupsData.files && backupsData.files.length > 0) {
                    backupsId = backupsData.files[0].id;
                }
            }
            
            if (!backupsId) {
                const createBackups = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Backups',
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [emailSortProId]
                    })
                });
                
                if (createBackups.ok) {
                    const backupsData = await createBackups.json();
                    backupsId = backupsData.id;
                }
            }
            
            console.log('[BackupService] ✅ Google Drive folder structure ready');
            return backupsId;
            
        } catch (error) {
            console.error('[BackupService] Error creating Google Drive folders:', error);
            throw error;
        }
    }

    // =====================================
    // CHARGEMENT DES BACKUPS
    // =====================================
    async loadFromOneDrive(backupId) {
        try {
            const token = await window.authService.getAccessToken();
            if (!token) return null;
            
            const fileName = backupId === 'latest' ? 'backup_latest.json' : backupId;
            const url = `https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/Backups/${fileName}:/content`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('[BackupService] No backup found in OneDrive');
                    return null;
                }
                throw new Error(`Failed to load backup: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[BackupService] OneDrive load error:', error);
            return null;
        }
    }

    async loadFromGoogleDrive(backupId) {
        try {
            const token = await window.googleAuthService.getAccessToken();
            if (!token) return null;
            
            const folderId = await this.ensureGoogleDriveFolder(token);
            const fileName = backupId === 'latest' ? 'backup_latest.json' : backupId;
            
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (!searchResponse.ok) {
                throw new Error('Failed to search for backup');
            }
            
            const searchData = await searchResponse.json();
            if (!searchData.files || searchData.files.length === 0) {
                console.log('[BackupService] No backup found in Google Drive');
                return null;
            }
            
            const fileId = searchData.files[0].id;
            
            const contentResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (!contentResponse.ok) {
                throw new Error('Failed to download backup');
            }
            
            const data = await contentResponse.json();
            return data;
            
        } catch (error) {
            console.error('[BackupService] Google Drive load error:', error);
            return null;
        }
    }

    // =====================================
    // NETTOYAGE DES ANCIENS BACKUPS
    // =====================================
    async cleanupOldBackups(token, provider) {
        try {
            if (provider === 'onedrive') {
                const url = 'https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/Backups:/children';
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const backupFiles = data.value
                        .filter(f => f.name.startsWith('backup_') && f.name !== 'backup_latest.json')
                        .sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime));
                    
                    if (backupFiles.length > this.config.maxBackups) {
                        const toDelete = backupFiles.slice(this.config.maxBackups);
                        
                        for (const file of toDelete) {
                            await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${file.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            console.log('[BackupService] Deleted old backup:', file.name);
                        }
                    }
                }
            } else if (provider === 'googledrive') {
                const folderId = await this.ensureGoogleDriveFolder(token);
                
                const response = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and name contains 'backup_' and name != 'backup_latest.json' and trashed=false&orderBy=createdTime desc`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const backupFiles = data.files || [];
                    
                    if (backupFiles.length > this.config.maxBackups) {
                        const toDelete = backupFiles.slice(this.config.maxBackups);
                        
                        for (const file of toDelete) {
                            await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            console.log('[BackupService] Deleted old backup:', file.name);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('[BackupService] Error cleaning up old backups:', error);
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES
    // =====================================
    async updateGoogleDriveLatest(token, folderId, content) {
        try {
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='backup_latest.json' and '${folderId}' in parents and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                if (searchData.files && searchData.files.length > 0) {
                    const fileId = searchData.files[0].id;
                    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: content
                    });
                } else {
                    const metadata = {
                        name: 'backup_latest.json',
                        parents: [folderId],
                        mimeType: 'application/json'
                    };
                    
                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', new Blob([content], { type: 'application/json' }));
                    
                    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: form
                    });
                }
            }
        } catch (error) {
            console.warn('[BackupService] Error updating latest backup:', error);
        }
    }

    generateBackupId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getLastBackupTime() {
        if (this.lastBackupTime) {
            return this.lastBackupTime;
        }
        
        const saved = localStorage.getItem('emailsortpro_last_backup');
        if (saved) {
            return new Date(saved);
        }
        
        return null;
    }

    formatLastBackupTime() {
        const lastBackup = this.getLastBackupTime();
        if (!lastBackup) return 'Jamais';
        
        const now = new Date();
        const diff = now - lastBackup;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} minutes`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} heures`;
        return lastBackup.toLocaleDateString('fr-FR');
    }

    // =====================================
    // API PUBLIQUE
    // =====================================
    
    async backup() {
        return this.performBackup('manual');
    }
    
    async restore(backupId = 'latest') {
        return this.restoreFromBackup(backupId);
    }
    
    async listBackups() {
        return [];
    }
    
    getStatus() {
        return {
            enabled: this.config.enabled,
            autoBackup: this.config.autoBackup,
            interval: this.config.backupInterval,
            lastBackup: this.formatLastBackupTime(),
            provider: this.provider,
            isInitialized: this.isInitialized,
            backupInProgress: this.backupInProgress,
            hasLocalData: this.hasLocalData()
        };
    }

    hasLocalData() {
        const hasTasksData = window.taskManager && window.taskManager.getAllTasks().length > 0;
        const hasCategoriesData = window.categoryManager && Object.keys(window.categoryManager.getCustomCategories()).length > 0;
        return hasTasksData || hasCategoriesData;
    }
}

// =====================================
// INTERFACE UTILISATEUR INTÉGRÉE
// =====================================

// Fonctions globales pour l'interface
window.triggerBackupFromUI = async function() {
    const button = document.getElementById('manual-backup-btn');
    if (!button) return;
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
    
    try {
        const success = await window.backupService.backup();
        
        if (success) {
            button.innerHTML = '<i class="fas fa-check"></i> Terminé !';
            button.classList.add('success');
            window.updateBackupStatusDisplay();
        } else {
            button.innerHTML = '<i class="fas fa-times"></i> Échec';
            button.classList.add('error');
        }
        
    } catch (error) {
        console.error('Backup UI error:', error);
        button.innerHTML = '<i class="fas fa-times"></i> Erreur';
        button.classList.add('error');
    }
    
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sauvegarder';
        button.classList.remove('success', 'error');
    }, 3000);
};

window.triggerRestoreFromUI = async function() {
    const button = document.getElementById('manual-restore-btn');
    if (!button) return;
    
    const confirmed = confirm(
        '⚠️ ATTENTION ⚠️\n\n' +
        'Cette action va remplacer toutes vos données actuelles\n' +
        '(tâches et catégories) par celles du dernier backup cloud.\n\n' +
        'Êtes-vous absolument sûr de vouloir continuer ?'
    );
    
    if (!confirmed) return;
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restauration...';
    
    try {
        const success = await window.backupService.restore();
        
        if (success) {
            button.innerHTML = '<i class="fas fa-check"></i> Terminé !';
            button.classList.add('success');
            window.updateBackupStatusDisplay();
            
            setTimeout(() => {
                const shouldReload = confirm(
                    '✅ Restauration terminée avec succès !\n\n' +
                    'Voulez-vous recharger la page pour vous assurer\n' +
                    'que toutes les données sont correctement affichées ?'
                );
                
                if (shouldReload) {
                    window.location.reload();
                }
            }, 2000);
            
        } else {
            button.innerHTML = '<i class="fas fa-info-circle"></i> Aucun backup';
            button.classList.add('warning');
        }
        
    } catch (error) {
        console.error('Restore UI error:', error);
        button.innerHTML = '<i class="fas fa-times"></i> Erreur';
        button.classList.add('error');
    }
    
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Restaurer';
        button.classList.remove('success', 'error', 'warning');
    }, 3000);
};

window.updateBackupStatusDisplay = function() {
    const statusElement = document.getElementById('backup-status-display');
    if (!statusElement || !window.backupService) return;
    
    try {
        const status = window.backupService.getStatus();
        
        statusElement.innerHTML = `
            <div class="status-grid">
                <div class="status-item">
                    <span class="label">Statut:</span>
                    <span class="value ${status.enabled ? 'enabled' : 'disabled'}">
                        <i class="fas fa-${status.enabled ? 'check-circle' : 'times-circle'}"></i>
                        ${status.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                </div>
                
                <div class="status-item">
                    <span class="label">Dernier backup:</span>
                    <span class="value">${status.lastBackup}</span>
                </div>
                
                <div class="status-item">
                    <span class="label">Provider:</span>
                    <span class="value">
                        <i class="fab fa-${status.provider === 'microsoft' ? 'microsoft' : 'google'}"></i>
                        ${status.provider === 'microsoft' ? 'OneDrive' : status.provider === 'google' ? 'Google Drive' : 'Aucun'}
                    </span>
                </div>
                
                <div class="status-item">
                    <span class="label">Données locales:</span>
                    <span class="value ${status.hasLocalData ? 'has-data' : 'no-data'}">
                        <i class="fas fa-${status.hasLocalData ? 'database' : 'question-circle'}"></i>
                        ${status.hasLocalData ? 'Présentes' : 'Absentes'}
                    </span>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error updating backup status display:', error);
        statusElement.innerHTML = `
            <span class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                Erreur de statut
            </span>
        `;
    }
};

// =====================================
// STYLES CSS INTÉGRÉS
// =====================================
const backupStyles = document.createElement('style');
backupStyles.textContent = `
.backup-controls {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e2e8f0;
}

.backup-status-info h4 {
    margin: 0 0 15px 0;
    color: #334155;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-display {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.status-item .label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
}

.status-item .value {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
}

.value.enabled { color: #10b981; }
.value.disabled { color: #ef4444; }
.value.has-data { color: #3b82f6; }
.value.no-data { color: #f59e0b; }

.backup-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.backup-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 120px;
    justify-content: center;
}

.backup-btn.primary {
    background: #3b82f6;
    color: white;
}

.backup-btn.primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.backup-btn.secondary {
    background: #10b981;
    color: white;
}

.backup-btn.secondary:hover {
    background: #059669;
    transform: translateY(-1px);
}

.backup-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
}

.backup-btn.success {
    background: #10b981 !important;
}

.backup-btn.error {
    background: #ef4444 !important;
}

.backup-btn.warning {
    background: #f59e0b !important;
}

@media (max-width: 768px) {
    .backup-actions {
        flex-direction: column;
    }
    
    .backup-btn {
        min-width: auto;
        width: 100%;
    }
    
    .status-grid {
        grid-template-columns: 1fr;
    }
}
`;

document.head.appendChild(backupStyles);

// =====================================
// INITIALISATION GLOBALE
// =====================================

// Créer l'instance globale
window.backupService = new BackupService();

// Fonctions globales pour l'accès depuis l'interface
window.triggerBackup = () => window.backupService?.backup();
window.triggerRestore = () => window.backupService?.restore();
window.getBackupStatus = () => window.backupService?.getStatus() || { available: false };

// Initialiser automatiquement quand l'app est prête
document.addEventListener('DOMContentLoaded', () => {
    const checkAndInit = () => {
        if (window.app && (window.app.isAuthenticated || window.app.activeProvider)) {
            window.backupService.initialize().then(() => {
                console.log('[BackupService] ✅ Auto-initialized after authentication');
                setTimeout(() => {
                    if (window.updateBackupStatusDisplay) {
                        window.updateBackupStatusDisplay();
                    }
                }, 1000);
            });
        } else {
            setTimeout(checkAndInit, 1000);
        }
    };
    
    setTimeout(checkAndInit, 2000);
});

console.log('✅ BackupService Unified - Complete backup solution with UI for EmailSortPro');
