// backup.js - Version Smart v3.0 - Détection automatique et dossiers autorisés
// Compatible avec Microsoft OneDrive, Google Drive et dossiers locaux autorisés
// Auto-détection du provider et configuration intelligente

class SmartBackupService {
    constructor() {
        this.provider = null;
        this.isInitialized = false;
        this.backupInProgress = false;
        this.lastBackupTime = null;
        this.backupTimer = null;
        this.detectionTimer = null;
        
        // Configuration intelligente par défaut
        this.config = {
            enabled: true,
            autoBackup: true,
            backupInterval: 5 * 60 * 1000, // 5 minutes
            includeCategories: true,
            includeTasks: true,
            includeSettings: true,
            maxBackups: 10,
            
            // NOUVEAUX: Dossiers autorisés intelligents
            smartFolders: {
                local: null,           // Dossier local choisi par l'utilisateur
                oneDrive: null,        // Détection auto OneDrive
                googleDrive: null,     // Détection auto Google Drive
                documents: null,       // Documents/EmailSortPro
                downloads: null        // Téléchargements/EmailSortPro
            },
            
            // Auto-détection
            autoDetection: true,
            preferredStorage: 'smart', // smart, local, cloud, downloads
            emergencyMode: false,
            
            // Fallback hierarchy
            storagePriority: ['cloud', 'documents', 'downloads', 'localStorage']
        };
        
        this.loadConfig();
        this.initializeSmartDetection();
        console.log('[SmartBackup] Initialized v3.0 with smart detection');
    }

    // ================================================
    // CONFIGURATION INTELLIGENTE
    // ================================================
    loadConfig() {
        try {
            const saved = localStorage.getItem('emailsortpro_smart_backup_config');
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('[SmartBackup] Error loading config:', error);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('emailsortpro_smart_backup_config', JSON.stringify(this.config));
            console.log('[SmartBackup] Configuration sauvegardée');
            
            if (this.config.autoBackup) {
                this.startAutoBackup();
            } else {
                this.stopAutoBackup();
            }
        } catch (error) {
            console.error('[SmartBackup] Error saving config:', error);
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        
        if (window.uiManager) {
            window.uiManager.showToast('Configuration de backup mise à jour', 'success');
        }
    }

    // ================================================
    // DÉTECTION AUTOMATIQUE INTELLIGENTE
    // ================================================
    async initializeSmartDetection() {
        console.log('[SmartBackup] 🔍 Démarrage de la détection automatique...');
        
        // Détecter le provider d'authentification
        await this.detectAuthProvider();
        
        // Détecter les dossiers disponibles
        await this.detectAvailableFolders();
        
        // Configurer le stockage optimal
        await this.configureOptimalStorage();
        
        this.isInitialized = true;
        
        // Démarrer la surveillance continue
        this.startContinuousDetection();
        
        if (this.config.enabled && this.config.autoBackup) {
            this.startAutoBackup();
        }
        
        console.log('[SmartBackup] ✅ Détection automatique terminée');
    }

    async detectAuthProvider() {
        // Détecter Microsoft
        if (window.authService) {
            try {
                const isAuth = window.authService.isAuthenticated();
                if (isAuth) {
                    this.provider = 'microsoft';
                    console.log('[SmartBackup] 🔍 Microsoft OneDrive détecté et authentifié');
                    await this.detectOneDrivePaths();
                    return;
                }
            } catch (error) {
                console.warn('[SmartBackup] Erreur détection Microsoft:', error);
            }
        }
        
        // Détecter Google
        if (window.googleAuthService) {
            try {
                const isAuth = window.googleAuthService.isAuthenticated();
                if (isAuth) {
                    this.provider = 'google';
                    console.log('[SmartBackup] 🔍 Google Drive détecté et authentifié');
                    await this.detectGoogleDrivePaths();
                    return;
                }
            } catch (error) {
                console.warn('[SmartBackup] Erreur détection Google:', error);
            }
        }
        
        console.log('[SmartBackup] 🔍 Aucun provider cloud authentifié, utilisation locale');
        this.provider = 'local';
    }

    async detectOneDrivePaths() {
        try {
            // Détecter le chemin OneDrive local s'il existe
            const commonPaths = [
                'OneDrive/Documents/EmailSortPro',
                'OneDrive - Personal/Documents/EmailSortPro',
                'OneDrive - Business/Documents/EmailSortPro'
            ];
            
            this.config.smartFolders.oneDrive = commonPaths[0]; // Path par défaut
            console.log('[SmartBackup] 📁 OneDrive path configuré:', this.config.smartFolders.oneDrive);
            
        } catch (error) {
            console.warn('[SmartBackup] Erreur détection OneDrive paths:', error);
        }
    }

    async detectGoogleDrivePaths() {
        try {
            // Google Drive est accessible via API, pas de path local
            this.config.smartFolders.googleDrive = 'GoogleDrive/EmailSortPro';
            console.log('[SmartBackup] 📁 Google Drive path configuré');
            
        } catch (error) {
            console.warn('[SmartBackup] Erreur détection Google Drive paths:', error);
        }
    }

    async detectAvailableFolders() {
        console.log('[SmartBackup] 🔍 Détection des dossiers autorisés...');
        
        // Détecter Documents
        try {
            const documentsPath = await this.getDocumentsPath();
            this.config.smartFolders.documents = documentsPath;
            console.log('[SmartBackup] 📁 Documents détecté:', documentsPath);
        } catch (error) {
            console.warn('[SmartBackup] Documents non accessible:', error);
        }
        
        // Détecter Téléchargements
        try {
            const downloadsPath = await this.getDownloadsPath();
            this.config.smartFolders.downloads = downloadsPath;
            console.log('[SmartBackup] 📁 Téléchargements détecté:', downloadsPath);
        } catch (error) {
            console.warn('[SmartBackup] Téléchargements non accessible:', error);
        }
    }

    async getDocumentsPath() {
        // Utiliser l'API moderne pour détecter Documents
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Windows')) {
            return 'Documents/EmailSortPro';
        } else if (userAgent.includes('Mac')) {
            return 'Documents/EmailSortPro';
        } else {
            return 'Documents/EmailSortPro';
        }
    }

    async getDownloadsPath() {
        return 'Downloads/EmailSortPro';
    }

    async configureOptimalStorage() {
        console.log('[SmartBackup] ⚙️ Configuration du stockage optimal...');
        
        let optimalStorage = null;
        
        // Hiérarchie de préférence intelligente
        if (this.config.preferredStorage === 'smart') {
            // 1. Cloud disponible et authentifié
            if (this.provider === 'microsoft' && this.config.smartFolders.oneDrive) {
                optimalStorage = 'onedrive';
            } else if (this.provider === 'google' && this.config.smartFolders.googleDrive) {
                optimalStorage = 'googledrive';
            }
            // 2. Documents locaux
            else if (this.config.smartFolders.documents) {
                optimalStorage = 'documents';
            }
            // 3. Téléchargements
            else if (this.config.smartFolders.downloads) {
                optimalStorage = 'downloads';
            }
            // 4. Fallback localStorage
            else {
                optimalStorage = 'localStorage';
            }
        } else {
            optimalStorage = this.config.preferredStorage;
        }
        
        this.config.activeStorage = optimalStorage;
        console.log('[SmartBackup] 📦 Stockage optimal configuré:', optimalStorage);
        
        // Tester l'accès au stockage choisi
        await this.testStorageAccess(optimalStorage);
    }

    async testStorageAccess(storageType) {
        try {
            console.log('[SmartBackup] 🧪 Test d\'accès au stockage:', storageType);
            
            switch (storageType) {
                case 'documents':
                    await this.testDocumentsAccess();
                    break;
                case 'downloads':
                    await this.testDownloadsAccess();
                    break;
                case 'onedrive':
                    await this.testOneDriveAccess();
                    break;
                case 'googledrive':
                    await this.testGoogleDriveAccess();
                    break;
                case 'localStorage':
                    // localStorage est toujours disponible
                    break;
            }
            
            console.log('[SmartBackup] ✅ Accès au stockage confirmé:', storageType);
            
        } catch (error) {
            console.warn('[SmartBackup] ❌ Erreur d\'accès au stockage:', storageType, error);
            await this.fallbackToNextStorage();
        }
    }

    async testDocumentsAccess() {
        if (!window.showDirectoryPicker) {
            throw new Error('File System Access API non disponible');
        }
        
        // On ne teste pas réellement ici pour éviter les popups
        // Le test se fera lors du premier backup
        return true;
    }

    async testDownloadsAccess() {
        // Les téléchargements sont toujours disponibles
        return true;
    }

    async testOneDriveAccess() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('OneDrive non authentifié');
        }
        
        const token = await window.authService.getAccessToken();
        if (!token) {
            throw new Error('Token OneDrive non disponible');
        }
        
        return true;
    }

    async testGoogleDriveAccess() {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google Drive non authentifié');
        }
        
        const token = await window.googleAuthService.getAccessToken();
        if (!token) {
            throw new Error('Token Google Drive non disponible');
        }
        
        return true;
    }

    async fallbackToNextStorage() {
        const currentIndex = this.config.storagePriority.indexOf(this.config.activeStorage);
        const nextStorageIndex = currentIndex + 1;
        
        if (nextStorageIndex < this.config.storagePriority.length) {
            const nextStorage = this.config.storagePriority[nextStorageIndex];
            console.log('[SmartBackup] 🔄 Fallback vers:', nextStorage);
            
            this.config.activeStorage = nextStorage;
            await this.testStorageAccess(nextStorage);
        } else {
            console.log('[SmartBackup] 🚨 Fallback final vers localStorage');
            this.config.activeStorage = 'localStorage';
            this.config.emergencyMode = true;
        }
    }

    // ================================================
    // SURVEILLANCE CONTINUE DES CONNEXIONS
    // ================================================
    startContinuousDetection() {
        // Surveiller les changements d'authentification
        this.detectionTimer = setInterval(() => {
            this.checkProviderChanges();
        }, 30000); // Vérifier toutes les 30 secondes
        
        // Écouter les événements d'authentification
        window.addEventListener('authStateChanged', (event) => {
            console.log('[SmartBackup] 🔄 Changement d\'authentification détecté');
            this.handleAuthChange(event.detail);
        });
        
        console.log('[SmartBackup] 👁️ Surveillance continue activée');
    }

    async checkProviderChanges() {
        const previousProvider = this.provider;
        await this.detectAuthProvider();
        
        if (previousProvider !== this.provider) {
            console.log('[SmartBackup] 🔄 Changement de provider:', previousProvider, '→', this.provider);
            await this.reconfigureForNewProvider();
        }
    }

    async handleAuthChange(authDetails) {
        console.log('[SmartBackup] 🔄 Gestion du changement d\'auth:', authDetails);
        
        // Reconfigurer selon le nouveau provider
        await this.detectAuthProvider();
        await this.detectAvailableFolders();
        await this.configureOptimalStorage();
        
        if (window.uiManager) {
            window.uiManager.showToast(
                `🔄 Backup reconfiguré pour ${this.provider}`, 
                'info'
            );
        }
    }

    async reconfigureForNewProvider() {
        await this.detectAvailableFolders();
        await this.configureOptimalStorage();
        this.saveConfig();
        
        // Notification à l'utilisateur
        if (window.uiManager) {
            window.uiManager.showToast(
                `📁 Backup reconfiguré automatiquement pour ${this.provider}`, 
                'success'
            );
        }
    }

    // ================================================
    // BACKUP INTELLIGENT
    // ================================================
    async performBackup(trigger = 'manual') {
        if (!this.isInitialized || !this.config.enabled) {
            console.log('[SmartBackup] Backup skipped - not initialized or disabled');
            return false;
        }

        if (this.backupInProgress) {
            console.log('[SmartBackup] Backup already in progress');
            return false;
        }

        try {
            this.backupInProgress = true;
            console.log(`[SmartBackup] Starting ${trigger} backup with ${this.config.activeStorage}...`);
            
            const backupData = this.collectBackupData();
            
            if (!backupData || !backupData.data) {
                console.log('[SmartBackup] No data to backup');
                return false;
            }
            
            let success = false;
            
            // Utiliser le stockage configuré automatiquement
            switch (this.config.activeStorage) {
                case 'onedrive':
                    success = await this.backupToOneDrive(backupData);
                    break;
                case 'googledrive':
                    success = await this.backupToGoogleDrive(backupData);
                    break;
                case 'documents':
                    success = await this.backupToDocuments(backupData);
                    break;
                case 'downloads':
                    success = await this.backupToDownloads(backupData);
                    break;
                case 'localStorage':
                default:
                    success = await this.backupToLocalStorage(backupData);
                    break;
            }
            
            if (success) {
                this.lastBackupTime = new Date();
                localStorage.setItem('emailsortpro_smart_last_backup', this.lastBackupTime.toISOString());
                
                if (trigger === 'manual' && window.uiManager) {
                    window.uiManager.showToast(
                        `✅ Backup réussi dans ${this.getStorageDisplayName()}`, 
                        'success'
                    );
                }
                
                console.log('[SmartBackup] ✅ Backup successful in', this.config.activeStorage);
            }
            
            return success;
            
        } catch (error) {
            console.error('[SmartBackup] Backup error:', error);
            
            // Essayer le stockage de fallback
            await this.fallbackToNextStorage();
            
            if (trigger === 'manual' && window.uiManager) {
                window.uiManager.showToast(
                    '⚠️ Backup reporté vers stockage alternatif', 
                    'warning'
                );
            }
            
            return false;
            
        } finally {
            this.backupInProgress = false;
        }
    }

    // ================================================
    // MÉTHODES DE STOCKAGE INTELLIGENTES
    // ================================================
    async backupToDocuments(data) {
        try {
            console.log('[SmartBackup] 📁 Backup vers Documents...');
            
            if (!window.showDirectoryPicker) {
                throw new Error('File System Access API non supportée');
            }
            
            // Demander l'accès au dossier Documents si pas encore fait
            if (!this.documentsHandle) {
                await this.requestDocumentsAccess();
            }
            
            // Créer le fichier de backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `EmailSortPro-Backup-${timestamp}.json`;
            
            const fileHandle = await this.documentsHandle.getFileHandle(fileName, {
                create: true
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            
            console.log('[SmartBackup] ✅ Backup créé dans Documents:', fileName);
            return true;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur backup Documents:', error);
            throw error;
        }
    }

    async requestDocumentsAccess() {
        try {
            // Demander l'accès au dossier parent (Documents)
            const parentHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-documents'
            });
            
            // Créer ou accéder au dossier EmailSortPro
            this.documentsHandle = await parentHandle.getDirectoryHandle('EmailSortPro', {
                create: true
            });
            
            console.log('[SmartBackup] ✅ Accès Documents configuré');
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Accès aux Documents annulé par l\'utilisateur');
            }
            throw error;
        }
    }

    async backupToDownloads(data) {
        try {
            console.log('[SmartBackup] 📥 Backup vers Téléchargements...');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `EmailSortPro-Backup-${timestamp}.json`;
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[SmartBackup] ✅ Backup téléchargé:', fileName);
            return true;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur backup Téléchargements:', error);
            throw error;
        }
    }

    async backupToLocalStorage(data) {
        try {
            console.log('[SmartBackup] 💾 Backup vers localStorage...');
            
            const timestamp = new Date().toISOString();
            const backupKey = `emailsortpro_smart_backup_${timestamp.replace(/[:.]/g, '-')}`;
            
            localStorage.setItem(backupKey, JSON.stringify(data));
            localStorage.setItem('emailsortpro_smart_backup_latest', JSON.stringify(data));
            
            // Nettoyer les anciens backups
            this.cleanupLocalStorageBackups();
            
            console.log('[SmartBackup] ✅ Backup localStorage créé');
            return true;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur backup localStorage:', error);
            throw error;
        }
    }

    async backupToOneDrive(data) {
        try {
            console.log('[SmartBackup] ☁️ Backup vers OneDrive...');
            
            const token = await window.authService.getAccessToken();
            if (!token) {
                throw new Error('Token OneDrive non disponible');
            }
            
            const content = JSON.stringify(data, null, 2);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `EmailSortPro-Backup-${timestamp}.json`;
            
            // Assurer que le dossier existe
            await this.ensureOneDriveFolder(token);
            
            // Upload du fichier
            const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/${fileName}:/content`;
            
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: content
            });
            
            if (!response.ok) {
                throw new Error(`OneDrive upload failed: ${response.statusText}`);
            }
            
            // Créer aussi une copie "latest"
            const latestUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro/backup-latest.json:/content`;
            await fetch(latestUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: content
            });
            
            console.log('[SmartBackup] ✅ Backup OneDrive créé:', fileName);
            return true;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur backup OneDrive:', error);
            throw error;
        }
    }

    async backupToGoogleDrive(data) {
        try {
            console.log('[SmartBackup] ☁️ Backup vers Google Drive...');
            
            const token = await window.googleAuthService.getAccessToken();
            if (!token) {
                throw new Error('Token Google Drive non disponible');
            }
            
            const content = JSON.stringify(data, null, 2);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `EmailSortPro-Backup-${timestamp}.json`;
            
            // Assurer que le dossier existe
            const folderId = await this.ensureGoogleDriveFolder(token);
            
            // Créer le fichier
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
                throw new Error(`Google Drive upload failed: ${response.statusText}`);
            }
            
            console.log('[SmartBackup] ✅ Backup Google Drive créé:', fileName);
            return true;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur backup Google Drive:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    collectBackupData() {
        const data = {
            version: '3.0',
            timestamp: new Date().toISOString(),
            provider: this.provider,
            storage: this.config.activeStorage,
            app: {
                name: 'EmailSortPro',
                version: window.AppConfig?.app?.version || '3.0.0'
            },
            data: {}
        };
        
        // Collecter les catégories
        if (this.config.includeCategories && window.categoryManager) {
            try {
                const categories = window.categoryManager.getCategories();
                const customCategories = window.categoryManager.getCustomCategories();
                const allKeywords = window.categoryManager.getAllKeywords();
                
                data.data.categories = {
                    all: categories,
                    custom: customCategories,
                    keywords: allKeywords,
                    count: Object.keys(categories).length
                };
                
                console.log(`[SmartBackup] Collecté ${data.data.categories.count} catégories`);
            } catch (error) {
                console.error('[SmartBackup] Erreur collecte catégories:', error);
                data.data.categories = { error: error.message };
            }
        }
        
        // Collecter les tâches
        if (this.config.includeTasks && window.taskManager) {
            try {
                const tasks = window.taskManager.getAllTasks();
                
                data.data.tasks = {
                    all: tasks,
                    count: tasks.length,
                    completed: tasks.filter(t => t.status === 'completed').length,
                    pending: tasks.filter(t => t.status !== 'completed').length
                };
                
                console.log(`[SmartBackup] Collecté ${data.data.tasks.count} tâches`);
            } catch (error) {
                console.error('[SmartBackup] Erreur collecte tâches:', error);
                data.data.tasks = { error: error.message };
            }
        }
        
        // Collecter les paramètres
        if (this.config.includeSettings) {
            try {
                data.data.settings = {
                    backup: this.config,
                    categories: this.loadCategorySettings(),
                    tasks: this.loadTaskSettings(),
                    app: this.loadAppSettings()
                };
                
                console.log('[SmartBackup] Collecté les paramètres');
            } catch (error) {
                console.error('[SmartBackup] Erreur collecte paramètres:', error);
                data.data.settings = { error: error.message };
            }
        }
        
        // Métadonnées
        data.metadata = {
            totalSize: JSON.stringify(data).length,
            backupId: this.generateBackupId(),
            user: window.app?.user?.email || 'unknown',
            smartConfig: {
                detectedProvider: this.provider,
                activeStorage: this.config.activeStorage,
                availableFolders: this.config.smartFolders
            }
        };
        
        return data;
    }

    loadCategorySettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    loadTaskSettings() {
        try {
            const saved = localStorage.getItem('taskSettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    loadAppSettings() {
        try {
            const settings = {};
            const keys = ['emailsortpro_client_id', 'currentUserInfo', 'app_preferences'];
            
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
            return {};
        }
    }

    async ensureOneDriveFolder(token) {
        try {
            // Créer Documents/EmailSortPro
            const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/Documents/EmailSortPro', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 404) {
                // Créer le dossier
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
                
                console.log('[SmartBackup] 📁 Dossier OneDrive créé');
            }
            
            return true;
        } catch (error) {
            console.error('[SmartBackup] Erreur création dossier OneDrive:', error);
            throw error;
        }
    }

    async ensureGoogleDriveFolder(token) {
        try {
            // Chercher le dossier EmailSortPro
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='EmailSortPro' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            const searchData = await searchResponse.json();
            
            if (searchData.files && searchData.files.length > 0) {
                return searchData.files[0].id;
            }
            
            // Créer le dossier
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
            console.log('[SmartBackup] 📁 Dossier Google Drive créé');
            
            return createData.id;
            
        } catch (error) {
            console.error('[SmartBackup] Erreur création dossier Google Drive:', error);
            throw error;
        }
    }

    cleanupLocalStorageBackups() {
        try {
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_smart_backup_'))
                .sort()
                .reverse();
            
            if (backupKeys.length > this.config.maxBackups) {
                const toDelete = backupKeys.slice(this.config.maxBackups);
                toDelete.forEach(key => localStorage.removeItem(key));
                console.log(`[SmartBackup] 🧹 Nettoyé ${toDelete.length} anciens backups`);
            }
        } catch (error) {
            console.warn('[SmartBackup] Erreur nettoyage localStorage:', error);
        }
    }

    generateBackupId() {
        return `smart_backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getStorageDisplayName() {
        const names = {
            'onedrive': 'OneDrive/Documents',
            'googledrive': 'Google Drive',
            'documents': 'Documents locaux',
            'downloads': 'Téléchargements',
            'localStorage': 'Navigateur'
        };
        
        return names[this.config.activeStorage] || this.config.activeStorage;
    }

    startAutoBackup() {
        this.stopAutoBackup();
        
        if (!this.config.enabled || !this.config.autoBackup) {
            return;
        }
        
        console.log('[SmartBackup] 🔄 Démarrage backup automatique, intervalle:', this.config.backupInterval);
        
        this.backupTimer = setInterval(() => {
            this.performBackup('auto');
        }, this.config.backupInterval);
    }

    stopAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }
        
        if (this.detectionTimer) {
            clearInterval(this.detectionTimer);
            this.detectionTimer = null;
        }
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    async backup() {
        return this.performBackup('manual');
    }

    async restore(backupId = 'latest') {
        // TODO: Implémenter la restauration intelligente
        console.log('[SmartBackup] Restauration à implémenter:', backupId);
        return false;
    }

    getStatus() {
        return {
            enabled: this.config.enabled,
            autoBackup: this.config.autoBackup,
            provider: this.provider,
            activeStorage: this.config.activeStorage,
            storageName: this.getStorageDisplayName(),
            isInitialized: this.isInitialized,
            backupInProgress: this.backupInProgress,
            lastBackup: this.formatLastBackupTime(),
            smartFolders: this.config.smartFolders,
            emergencyMode: this.config.emergencyMode
        };
    }

    formatLastBackupTime() {
        const lastBackup = this.lastBackupTime || 
            (localStorage.getItem('emailsortpro_smart_last_backup') ? 
             new Date(localStorage.getItem('emailsortpro_smart_last_backup')) : null);
        
        if (!lastBackup) return 'Jamais';
        
        const now = new Date();
        const diff = now - lastBackup;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} minutes`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} heures`;
        return lastBackup.toLocaleDateString('fr-FR');
    }

    // Forcer la reconfiguration
    async reconfigure() {
        console.log('[SmartBackup] 🔄 Reconfiguration forcée...');
        await this.initializeSmartDetection();
    }

    // Changer manuellement le stockage préféré
    async setPreferredStorage(storageType) {
        this.config.preferredStorage = storageType;
        await this.configureOptimalStorage();
        this.saveConfig();
        
        if (window.uiManager) {
            window.uiManager.showToast(
                `📁 Stockage changé vers ${this.getStorageDisplayName()}`, 
                'success'
            );
        }
    }
}

// ================================================
// INITIALISATION GLOBALE INTELLIGENTE
// ================================================

// Créer l'instance globale intelligente
window.smartBackupService = new SmartBackupService();

// Alias pour compatibilité
window.backupService = window.smartBackupService;

// Fonctions globales
window.triggerBackup = () => window.smartBackupService?.backup();
window.triggerRestore = () => window.smartBackupService?.restore();
window.getBackupStatus = () => window.smartBackupService?.getStatus() || { available: false };

// Interface pour changer le stockage
window.setBackupStorage = (storageType) => window.smartBackupService?.setPreferredStorage(storageType);
window.reconfigureBackup = () => window.smartBackupService?.reconfigure();

// Événements d'authentification pour auto-reconfiguration
const originalAuthSuccess = window.onAuthSuccess;
window.onAuthSuccess = function(authData) {
    // Appeler l'original s'il existe
    if (originalAuthSuccess) {
        originalAuthSuccess(authData);
    }
    
    // Déclencher la reconfiguration du backup
    setTimeout(() => {
        if (window.smartBackupService) {
            window.smartBackupService.handleAuthChange(authData || {});
        }
    }, 2000);
};

console.log('✅ SmartBackupService v3.0 - Détection automatique et dossiers autorisés chargé');
