// backup.js - Service de sauvegarde automatique dans Documents pour EmailSortPro
// Compatible avec Microsoft OneDrive et Google Drive Documents

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
            backupInterval: 5 * 60 * 1000, // 5 minutes par défaut
            includeCategories: true,
            includeTasks: true,
            maxBackups: 10, // Garder les 10 derniers backups
            folderPath: 'Documents/EmailSortPro/Backups'
        };
        
        // Charger la configuration sauvegardée
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
            
            // Redémarrer le timer si nécessaire
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
        
        // Notifier l'UI
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
                // Détecter le provider depuis les services d'auth
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
            
            // Démarrer le backup automatique si activé
            if (this.config.enabled && this.config.autoBackup) {
                this.startAutoBackup();
            }
            
            // Vérifier si besoin de restauration au démarrage
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
            
            // Collecter les données
            const backupData = this.collectBackupData();
            
            if (!backupData) {
                console.log('[BackupService] No data to backup');
                return false;
            }
            
            // Sauvegarder selon le provider
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
                    window.uiManager.showToast('✅ Backup réussi dans Documents', 'success');
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
    // COLLECTE DES DONNÉES
    // =====================================
    collectBackupData() {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            provider: this.provider,
            app: {
                name: 'EmailSortPro',
                version: window.AppConfig?.app?.version || '3.0.0'
            },
            data: {}
        };
        
        // Collecter les catégories
        if (this.config.includeCategories && window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            const customCategories = window.categoryManager.getCustomCategories();
            
            data.data.categories = {
                all: categories,
                custom: customCategories,
                count: Object.keys(categories).length
            };
            
            console.log(`[BackupService] Collected ${data.data.categories.count} categories`);
        }
        
        // Collecter les tâches
        if (this.config.includeTasks && window.taskManager) {
            const tasks = window.taskManager.getAllTasks();
            
            data.data.tasks = {
                all: tasks,
                count: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                pending: tasks.filter(t => !t.completed).length
            };
            
            console.log(`[BackupService] Collected ${data.data.tasks.count} tasks`);
        }
        
        // Ajouter des métadonnées
        data.metadata = {
            totalSize: JSON.stringify(data).length,
            backupId: this.generateBackupId(),
            user: window.app?.user?.email || 'unknown'
        };
        
        return data;
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
            
            // Créer le contenu du fichier
            const content = JSON.stringify(data, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            
            // Créer le chemin et nom de fichier
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `backup_${timestamp}.json`;
            const latestFileName = 'backup_latest.json';
            
            // Chemins OneDrive
            const folderPath = '/drive/root:/Documents/EmailSortPro/Backups';
            
            // Créer le dossier si nécessaire
            await this.ensureOneDriveFolder(token);
            
            // Sauvegarder le fichier horodaté
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
            
            // Sauvegarder aussi comme backup_latest.json
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
            
            // Nettoyer les anciens backups
            await this.cleanupOldBackups(token, 'onedrive');
            
            return true;
            
        } catch (error) {
            console.error('[BackupService] OneDrive backup error:', error);
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
            
            // Créer le contenu du fichier
            const content = JSON.stringify(data, null, 2);
            
            // Créer le chemin et nom de fichier
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `backup_${timestamp}.json`;
            const latestFileName = 'backup_latest.json';
            
            // Obtenir ou créer le dossier
            const folderId = await this.ensureGoogleDriveFolder(token);
            
            // Créer les métadonnées du fichier
            const metadata = {
                name: fileName,
                parents: [folderId],
                mimeType: 'application/json'
            };
            
            // Créer le fichier
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
            
            // Créer ou mettre à jour backup_latest.json
            await this.updateGoogleDriveLatest(token, folderId, content);
            
            console.log('[BackupService] ✅ Google Drive backup successful:', fileName);
            
            // Nettoyer les anciens backups
            await this.cleanupOldBackups(token, 'googledrive');
            
            return true;
            
        } catch (error) {
            console.error('[BackupService] Google Drive backup error:', error);
            throw error;
        }
    }

    // =====================================
    // GESTION DES DOSSIERS
    // =====================================
    async ensureOneDriveFolder(token) {
        try {
            // Créer le dossier EmailSortPro
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
                
                if (!response.ok && response.status !== 409) { // 409 = already exists
                    throw new Error(`Failed to create folder: ${name}`);
                }
            };
            
            // Créer la structure de dossiers
            await createFolder('/drive/root:/Documents', 'EmailSortPro');
            await createFolder('/drive/root:/Documents/EmailSortPro', 'Backups');
            
            console.log('[BackupService] ✅ OneDrive folder structure ready');
            
        } catch (error) {
            console.error('[BackupService] Error creating OneDrive folders:', error);
            throw error;
        }
    }

    async ensureGoogleDriveFolder(token) {
        try {
            // Rechercher le dossier Documents
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
            
            // Si pas de dossier Documents, utiliser la racine
            const parentId = documentsId || 'root';
            
            // Rechercher ou créer EmailSortPro
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
                // Créer EmailSortPro
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
            
            // Rechercher ou créer Backups
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
                // Créer Backups
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
    // RESTAURATION
    // =====================================
    async checkAndRestoreIfNeeded() {
        try {
            // Vérifier si les données locales existent
            const hasLocalTasks = window.taskManager && window.taskManager.getAllTasks().length > 0;
            const hasLocalCategories = window.categoryManager && Object.keys(window.categoryManager.getCustomCategories()).length > 0;
            
            if (hasLocalTasks || hasLocalCategories) {
                console.log('[BackupService] Local data exists, no restoration needed');
                return;
            }
            
            console.log('[BackupService] No local data found, checking for cloud backup...');
            
            // Essayer de restaurer depuis le cloud
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
            
            // Charger le backup selon le provider
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
            
            // Valider les données
            if (!backupData.version || !backupData.data) {
                throw new Error('Invalid backup format');
            }
            
            console.log('[BackupService] Backup loaded:', {
                timestamp: backupData.timestamp,
                categories: backupData.data.categories?.count || 0,
                tasks: backupData.data.tasks?.count || 0
            });
            
            // Restaurer les catégories
            if (backupData.data.categories && window.categoryManager) {
                const customCategories = backupData.data.categories.custom || {};
                
                Object.entries(customCategories).forEach(([id, category]) => {
                    window.categoryManager.createCustomCategory(category);
                });
                
                console.log(`[BackupService] Restored ${Object.keys(customCategories).length} custom categories`);
            }
            
            // Restaurer les tâches
            if (backupData.data.tasks && window.taskManager) {
                const tasks = backupData.data.tasks.all || [];
                
                // Vider les tâches existantes
                window.taskManager.clearAllTasks();
                
                // Restaurer chaque tâche
                tasks.forEach(task => {
                    window.taskManager.createTask(task);
                });
                
                console.log(`[BackupService] Restored ${tasks.length} tasks`);
            }
            
            // Mettre à jour l'UI si nécessaire
            if (window.pageManager) {
                const currentPage = window.pageManager.currentPage;
                if (currentPage === 'tasks' || currentPage === 'categories') {
                    window.pageManager.refreshCurrentPage();
                }
            }
            
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
            
            // Rechercher le fichier
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
            
            // Télécharger le contenu
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
                // Lister les fichiers de backup
                const url = 'https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/Backups:/children';
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const backupFiles = data.value
                        .filter(f => f.name.startsWith('backup_') && f.name !== 'backup_latest.json')
                        .sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime));
                    
                    // Supprimer les anciens backups
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
                
                // Lister les fichiers de backup
                const response = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and name contains 'backup_' and name != 'backup_latest.json' and trashed=false&orderBy=createdTime desc`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const backupFiles = data.files || [];
                    
                    // Supprimer les anciens backups
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
            // Rechercher backup_latest.json existant
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='backup_latest.json' and '${folderId}' in parents and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                if (searchData.files && searchData.files.length > 0) {
                    // Mettre à jour le fichier existant
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
                    // Créer un nouveau fichier
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
    
    // Pour déclencher un backup manuel
    async backup() {
        return this.performBackup('manual');
    }
    
    // Pour restaurer depuis un backup
    async restore(backupId = 'latest') {
        return this.restoreFromBackup(backupId);
    }
    
    // Pour obtenir la liste des backups disponibles
    async listBackups() {
        // À implémenter si besoin
        return [];
    }
    
    // Pour obtenir le statut
    getStatus() {
        return {
            enabled: this.config.enabled,
            autoBackup: this.config.autoBackup,
            interval: this.config.backupInterval,
            lastBackup: this.formatLastBackupTime(),
            provider: this.provider,
            isInitialized: this.isInitialized,
            backupInProgress: this.backupInProgress
        };
    }
}

// Créer l'instance globale
window.backupService = new BackupService();

// Initialiser automatiquement quand l'app est prête
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que l'authentification soit établie
    const checkAndInit = () => {
        if (window.app && (window.app.isAuthenticated || window.app.activeProvider)) {
            window.backupService.initialize().then(() => {
                console.log('[BackupService] ✅ Auto-initialized after authentication');
            });
        } else {
            // Réessayer après un délai
            setTimeout(checkAndInit, 1000);
        }
    };
    
    // Commencer la vérification après 2 secondes
    setTimeout(checkAndInit, 2000);
});

console.log('✅ BackupService loaded - Automatic backup to Documents folder');
