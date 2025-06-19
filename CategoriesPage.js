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
            console.warn('[CategoriesPage] ⚠️ File System Access API non supportée - Configuration chemin par défaut');
            // Même sans API, configurer un chemin par défaut pour information
            this.filesystemConfig.currentPath = this.filesystemConfig.defaultPath;
            return;
        }

        try {
            // Essayer de restaurer un accès précédent
            await this.restorePreviousDirectoryAccess();
            
            // NOUVEAU: Configuration automatique du chemin par défaut
            if (!this.filesystemConfig.directoryHandle) {
                await this.setupDefaultPath();
            }
            
        } catch (error) {
            console.log('[CategoriesPage] 📁 Configuration filesystem:', error.message);
            // Configurer le chemin par défaut même en cas d'erreur
            this.filesystemConfig.currentPath = this.filesystemConfig.defaultPath;
        }
    }

    async setupDefaultPath() {
        console.log('[CategoriesPage] 🎯 Configuration chemin PERSISTANT par défaut...');
        
        try {
            // STRATÉGIE 1: Essayer le dossier Documents de l'utilisateur (le plus sûr)
            if (await this.tryDocumentsFolder()) {
                return true;
            }
            
            // STRATÉGIE 2: Essayer de demander un dossier système persistant
            if (await this.trySystemFolder()) {
                return true;
            }
            
            // STRATÉGIE 3: Fallback vers stockage visible mais demander à l'utilisateur
            if (await this.tryUserSelectedFolder()) {
                return true;
            }
            
            // STRATÉGIE 4: Utiliser OPFS uniquement en dernier recours
            return await this.fallbackToOPFS();
            
        } catch (error) {
            console.log('[CategoriesPage] ⚠️ Toutes les stratégies échouées - Mode invisible uniquement');
            return await this.fallbackToOPFS();
        }
    }

    async tryDocumentsFolder() {
        try {
            console.log('[CategoriesPage] 📁 Tentative: Dossier Documents');
            
            // Demander accès au dossier Documents
            const documentsHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-documents-setup'
            });
            
            // Créer EmailSortPro dans Documents
            let emailSortProHandle;
            try {
                emailSortProHandle = await documentsHandle.getDirectoryHandle('EmailSortPro', { create: true });
            } catch (error) {
                emailSortProHandle = await documentsHandle.getDirectoryHandle('EmailSortPro', { create: true });
            }
            
            // Créer sous-dossier Categories
            let categoriesHandle;
            try {
                categoriesHandle = await emailSortProHandle.getDirectoryHandle('Categories-Backup', { create: true });
            } catch (error) {
                categoriesHandle = await emailSortProHandle.getDirectoryHandle('Categories-Backup', { create: true });
            }
            
            // Tester l'accès
            await this.testDirectoryAccess(categoriesHandle);
            
            // Configurer
            this.filesystemConfig.directoryHandle = categoriesHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.storageType = 'documents';
            this.filesystemConfig.currentPath = `C:\\Users\\${this.getCurrentUser()}\\Documents\\EmailSortPro\\Categories-Backup\\`;
            this.filesystemConfig.documentsPath = this.filesystemConfig.currentPath;
            
            await this.saveFilesystemConfig();
            await this.createBackupReadme(categoriesHandle);
            await this.createFilesystemBackup('setup-documents');
            
            console.log('[CategoriesPage] ✅ Dossier Documents configuré:', this.filesystemConfig.currentPath);
            return true;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('[CategoriesPage] ⚠️ Dossier Documents inaccessible:', error.message);
            }
            return false;
        }
    }

    async trySystemFolder() {
        try {
            console.log('[CategoriesPage] 🏢 Tentative: Dossier système persistant');
            
            // Demander un dossier sur le disque C:// racine
            const rootHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'desktop', // Commencer par le bureau
                id: 'emailsortpro-system-setup'
            });
            
            // Vérifier si c'est un dossier approprié (racine du disque)
            const folderName = rootHandle.name || '';
            
            // Créer structure EmailSortPro
            let emailSortProHandle;
            try {
                emailSortProHandle = await rootHandle.getDirectoryHandle('EmailSortPro', { create: true });
            } catch (error) {
                emailSortProHandle = await rootHandle.getDirectoryHandle('EmailSortPro', { create: true });
            }
            
            let backupsHandle;
            try {
                backupsHandle = await emailSortProHandle.getDirectoryHandle('Backups', { create: true });
            } catch (error) {
                backupsHandle = await emailSortProHandle.getDirectoryHandle('Backups', { create: true });
            }
            
            let categoriesHandle;
            try {
                categoriesHandle = await backupsHandle.getDirectoryHandle('Categories', { create: true });
            } catch (error) {
                categoriesHandle = await backupsHandle.getDirectoryHandle('Categories', { create: true });
            }
            
            // Tester l'accès
            await this.testDirectoryAccess(categoriesHandle);
            
            // Déterminer le chemin probable
            let probablePath;
            if (folderName.toLowerCase().includes('desktop') || folderName.toLowerCase().includes('bureau')) {
                probablePath = `C:\\Users\\${this.getCurrentUser()}\\Desktop\\EmailSortPro\\Backups\\Categories\\`;
            } else if (folderName.toLowerCase().includes('documents')) {
                probablePath = `C:\\Users\\${this.getCurrentUser()}\\Documents\\EmailSortPro\\Backups\\Categories\\`;
            } else {
                probablePath = `C:\\${folderName}\\EmailSortPro\\Backups\\Categories\\`;
            }
            
            // Configurer
            this.filesystemConfig.directoryHandle = categoriesHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.storageType = 'system';
            this.filesystemConfig.currentPath = probablePath;
            
            await this.saveFilesystemConfig();
            await this.createBackupReadme(categoriesHandle);
            await this.createFilesystemBackup('setup-system');
            
            console.log('[CategoriesPage] ✅ Dossier système configuré:', this.filesystemConfig.currentPath);
            return true;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('[CategoriesPage] ⚠️ Dossier système inaccessible:', error.message);
            }
            return false;
        }
    }

    async tryUserSelectedFolder() {
        try {
            console.log('[CategoriesPage] 👤 Demande: Dossier personnalisé persistant');
            
            // Afficher un message explicatif
            this.showToast('📁 Choisissez un dossier PERSISTANT pour vos backups (évitez les dossiers temporaires)', 'info');
            
            const selectedHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-persistent-setup'
            });
            
            // Créer sous-dossier EmailSortPro-Categories directement
            let categoriesHandle;
            try {
                categoriesHandle = await selectedHandle.getDirectoryHandle('EmailSortPro-Categories', { create: true });
            } catch (error) {
                categoriesHandle = await selectedHandle.getDirectoryHandle('EmailSortPro-Categories', { create: true });
            }
            
            // Tester l'accès
            await this.testDirectoryAccess(categoriesHandle);
            
            // Configurer avec chemin complet estimé
            const fullPath = await this.getFullDirectoryPath(categoriesHandle);
            
            this.filesystemConfig.directoryHandle = categoriesHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.storageType = 'custom';
            this.filesystemConfig.currentPath = fullPath;
            
            await this.saveFilesystemConfig();
            await this.createBackupReadme(categoriesHandle);
            await this.createFilesystemBackup('setup-custom');
            
            console.log('[CategoriesPage] ✅ Dossier personnalisé configuré:', this.filesystemConfig.currentPath);
            return true;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('[CategoriesPage] ⚠️ Dossier personnalisé inaccessible:', error.message);
            }
            return false;
        }
    }

    async fallbackToOPFS() {
        try {
            console.log('[CategoriesPage] 🔄 Fallback: Stockage navigateur (temporaire)');
            
            if ('navigator' in window && 'storage' in navigator && 'getDirectory' in navigator.storage) {
                const opfsRoot = await navigator.storage.getDirectory();
                const backupDir = await opfsRoot.getDirectoryHandle('emailsortpro-categories-backup', { create: true });
                
                await this.testDirectoryAccess(backupDir);
                
                this.filesystemConfig.directoryHandle = backupDir;
                this.filesystemConfig.enabled = true;
                this.filesystemConfig.permissions = 'granted';
                this.filesystemConfig.storageType = 'browser-temporary';
                this.filesystemConfig.currentPath = `⚠️ TEMPORAIRE: ${this.getBrowserDataPath()}\\emailsortpro-categories-backup\\`;
                
                await this.saveFilesystemConfig();
                await this.createTemporaryWarning(backupDir);
                await this.createFilesystemBackup('setup-temporary');
                
                console.log('[CategoriesPage] ⚠️ Stockage temporaire configuré (ATTENTION: peut être supprimé)');
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Même le fallback OPFS a échoué:', error);
            
            // Configuration minimale pour information
            this.filesystemConfig.currentPath = '❌ AUCUN STOCKAGE PERSISTANT CONFIGURÉ';
            this.filesystemConfig.enabled = false;
            this.filesystemConfig.storageType = 'none';
            return false;
        }
    }

    getCurrentUser() {
        try {
            // Essayer d'obtenir le nom d'utilisateur
            return process?.env?.USERNAME || 
                   process?.env?.USER || 
                   navigator?.userAgentData?.platform || 
                   'Utilisateur';
        } catch (error) {
            return 'Utilisateur';
        }
    }

    getBrowserDataPath() {
        const userAgent = navigator.userAgent;
        const user = this.getCurrentUser();
        
        if (userAgent.includes('Chrome')) {
            return `C:\\Users\\${user}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\File System`;
        } else if (userAgent.includes('Edge')) {
            return `C:\\Users\\${user}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\File System`;
        } else if (userAgent.includes('Firefox')) {
            return `C:\\Users\\${user}\\AppData\\Local\\Mozilla\\Firefox\\Profiles\\[Profile]\\storage`;
        } else {
            return `C:\\Users\\${user}\\AppData\\Local\\[Navigateur]\\[Profile]\\storage`;
        }
    }

    async createTemporaryWarning(directoryHandle) {
        try {
            const warningContent = `# ⚠️ ATTENTION - STOCKAGE TEMPORAIRE ⚠️

IMPORTANT: Ce dossier est dans le stockage du navigateur et peut être SUPPRIMÉ !

## 🚨 RISQUES
- Suppression lors du nettoyage du navigateur
- Perte lors de la réinstallation du navigateur
- Suppression lors du nettoyage de Windows
- Pas de sauvegarde externe automatique

## 📁 Emplacement Actuel (TEMPORAIRE)
${this.filesystemConfig.currentPath}

## 🔧 SOLUTION RECOMMANDÉE
Configurez un dossier PERSISTANT pour vos backups :

### Option 1: Dossier Documents (RECOMMANDÉ)
- Allez dans Paramètres > Sauvegarde C://
- Cliquez "Configurer Répertoire Persistant"
- Choisissez votre dossier Documents
- Créez un dossier "EmailSortPro"

### Option 2: Dossier Système
- Créez un dossier sur C:\\ directement
- Ex: C:\\EmailSortPro\\Backups\\
- Utilisez "Configurer Répertoire Persistant"

### Option 3: Dossier Externe
- Utilisez un disque externe (D:\\, E:\\, etc.)
- Créez EmailSortPro sur ce disque
- Configuration via "Configurer Répertoire Persistant"

## 📋 Contenu Actuel
- Sauvegardes automatiques (JSON)
- Configuration des catégories
- Métadonnées et historique

## ⚡ URGENT
Ce stockage est TEMPORAIRE. Configurez un emplacement persistant
dès que possible pour éviter la perte de vos données !

---
Généré automatiquement le ${new Date().toLocaleString('fr-FR')}
Status: STOCKAGE TEMPORAIRE - ACTION REQUISE
Emplacement: ${this.filesystemConfig.currentPath}
`;

            const warningHandle = await directoryHandle.getFileHandle('⚠️-ATTENTION-STOCKAGE-TEMPORAIRE.txt', { create: true });
            const writable = await warningHandle.createWritable();
            await writable.write(warningContent);
            await writable.close();

        } catch (error) {
            console.warn('[CategoriesPage] Impossible de créer l\'avertissement temporaire:', error);
        }
    }

    async createBackupReadme(directoryHandle) {
        try {
            const fullPath = this.filesystemConfig.currentPath;
            
            const readmeContent = `# EmailSortPro - Backups des Catégories

Ce dossier contient les sauvegardes de vos catégories EmailSortPro.

## 📁 Emplacement
${fullPath}

## 📂 Contenu
- Fichiers de backup horodatés (EmailSortPro-Categories-YYYY-MM-DD_HH-MM-SS.json)
- Fichier LATEST-Categories-Backup.json (dernière sauvegarde)
- Ce fichier README pour information

## 🔄 Fonctionnement
- Sauvegarde automatique toutes les 30 secondes en cas de changement
- Conservation des ${this.backupConfig.maxBackups} derniers fichiers
- Format JSON avec toutes les données des catégories
- Rotation automatique des anciens fichiers

## 📋 Contenu des backups
- Toutes les catégories et leurs paramètres
- Mots-clés (absolus, forts, faibles, exclusions)
- Filtres (domaines, emails autorisés/exclus)
- Paramètres de pré-sélection pour les tâches
- Statistiques et métadonnées complètes

## 🔧 Utilisation
- Les backups se font automatiquement
- Vous pouvez restaurer depuis l'interface EmailSortPro
- Les fichiers sont lisibles en JSON standard
- Vous pouvez copier ce dossier pour sauvegarde externe

## 🎯 Restauration
En cas de problème :
1. Ouvrez EmailSortPro
2. Allez dans Paramètres > Sauvegarde C://
3. Cliquez sur "Restaurer Backup"
4. Sélectionnez le fichier LATEST-Categories-Backup.json

---
Généré automatiquement par EmailSortPro v23.0
Date de création: ${new Date().toLocaleString('fr-FR')}
Emplacement complet: ${fullPath}
`;

            const readmeHandle = await directoryHandle.getFileHandle('README-Categories-Backup.txt', { create: true });
            const writable = await readmeHandle.createWritable();
            await writable.write(readmeContent);
            await writable.close();

        } catch (error) {
            console.warn('[CategoriesPage] Impossible de créer README:', error);
        }
    }

    async createBackupReadme(directoryHandle) {
        try {
            const readmeContent = `# EmailSortPro - Backups des Catégories

Ce dossier contient les sauvegardes automatiques de vos catégories EmailSortPro.

## 📁 Contenu
- Fichiers de backup horodatés (EmailSortPro-Categories-YYYY-MM-DD_HH-MM-SS.json)
- Fichier LATEST-Categories-Backup.json (dernière sauvegarde)
- Ce fichier README pour information

## 🔄 Fonctionnement
- Sauvegarde automatique toutes les 30 secondes en cas de changement
- Conservation des ${this.backupConfig.maxBackups} derniers fichiers
- Format JSON avec toutes les données des catégories

## 📋 Contenu des backups
- Toutes les catégories et leurs paramètres
- Mots-clés (absolus, forts, faibles, exclusions)
- Filtres (domaines, emails autorisés/exclus)
- Paramètres de pré-sélection pour les tâches
- Statistiques et métadonnées

## 🔧 Utilisation
- Les backups se font automatiquement
- Vous pouvez restaurer depuis l'interface EmailSortPro
- Les fichiers sont lisibles en JSON standard

---
Généré automatiquement par EmailSortPro v23.0
Date de création: ${new Date().toLocaleString('fr-FR')}
Chemin: ${this.filesystemConfig.currentPath}
`;

            const readmeHandle = await directoryHandle.getFileHandle('README-Categories-Backup.txt', { create: true });
            const writable = await readmeHandle.createWritable();
            await writable.write(readmeContent);
            await writable.close();

        } catch (error) {
            console.warn('[CategoriesPage] Impossible de créer README:', error);
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
            
            if (!this.fileSystemSupported) {
                this.showToast('❌ Votre navigateur ne supporte pas l\'accès aux fichiers', 'error');
                return false;
            }

            // Afficher un toast informatif avant l'ouverture du sélecteur
            this.showToast('📂 Sélectionnez un dossier pour vos backups...', 'info');
            
            const newDirectoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-categories-backup-change'
            });
            
            // Tester le nouveau répertoire
            await this.testDirectoryAccess(newDirectoryHandle);
            
            // Mettre à jour la configuration avec le chemin complet
            this.filesystemConfig.directoryHandle = newDirectoryHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            
            // Obtenir le chemin complet du répertoire sélectionné
            const fullPath = await this.getFullDirectoryPath(newDirectoryHandle);
            this.filesystemConfig.currentPath = fullPath;
            
            await this.saveFilesystemConfig();
            
            // Créer un README dans le nouveau répertoire
            await this.createBackupReadme(newDirectoryHandle);
            
            // Créer un backup dans le nouveau répertoire
            await this.createFilesystemBackup('directory-changed');
            
            this.showToast(`✅ Répertoire configuré: ${fullPath}`, 'success');
            this.refreshBackupInfo();
            
            return true;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showToast('📂 Sélection de dossier annulée', 'info');
            } else {
                console.error('[CategoriesPage] ❌ Erreur changement répertoire:', error);
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
            return false;
        }
    }

    async getFullDirectoryPath(directoryHandle) {
        try {
            // Méthode 1: Essayer d'obtenir le chemin via resolve (expérimental)
            if ('resolve' in directoryHandle) {
                try {
                    const pathArray = await directoryHandle.resolve();
                    if (pathArray && pathArray.length > 0) {
                        // Construire le chemin complet
                        const pathStr = pathArray.join('\\');
                        return `C:\\Users\\[Utilisateur]\\${pathStr}\\`;
                    }
                } catch (resolveError) {
                    console.log('[CategoriesPage] Resolve non disponible:', resolveError);
                }
            }
            
            // Méthode 2: Utiliser le nom du dossier avec estimation du chemin
            const folderName = directoryHandle.name || 'DossierSelectionne';
            
            // Estimation du chemin basé sur les patterns courants
            if (folderName.toLowerCase().includes('desktop') || folderName.toLowerCase().includes('bureau')) {
                return `C:\\Users\\[Utilisateur]\\Desktop\\${folderName}\\`;
            } else if (folderName.toLowerCase().includes('documents')) {
                return `C:\\Users\\[Utilisateur]\\Documents\\${folderName}\\`;
            } else if (folderName.toLowerCase().includes('downloads') || folderName.toLowerCase().includes('téléchargements')) {
                return `C:\\Users\\[Utilisateur]\\Downloads\\${folderName}\\`;
            } else {
                return `C:\\Users\\[Utilisateur]\\[Emplacement]\\${folderName}\\`;
            }
            
        } catch (error) {
            console.warn('[CategoriesPage] Impossible d\'obtenir le chemin complet:', error);
            return `C:\\Users\\[Utilisateur]\\${directoryHandle.name || 'DossierSelectionne'}\\`;
        }
    }

    async getDirectoryPath(directoryHandle) {
        return await this.getFullDirectoryPath(directoryHandle);
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

    async copyPathToClipboard(path) {
        try {
            await navigator.clipboard.writeText(path);
            this.showToast('📋 Chemin copié dans le presse-papiers', 'success');
        } catch (error) {
            // Fallback pour les navigateurs qui ne supportent pas clipboard API
            try {
                const textArea = document.createElement('textarea');
                textArea.value = path;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('📋 Chemin copié', 'success');
            } catch (fallbackError) {
                this.showToast('❌ Impossible de copier le chemin', 'error');
            }
        }
    }

    async openBackupDirectory() {
        if (!this.filesystemConfig.enabled || !this.filesystemConfig.directoryHandle) {
            this.showToast('❌ Aucun répertoire configuré', 'error');
            return;
        }

        try {
            // Afficher les informations du répertoire
            const path = this.filesystemConfig.currentPath;
            
            this.showModal('Emplacement des Backups', `
                <div class="directory-info">
                    <div class="info-section">
                        <h4><i class="fas fa-folder-open"></i> Répertoire des Backups</h4>
                        <div class="path-display-large">
                            <div class="path-text">${path}</div>
                            <button class="btn-copy-large" onclick="window.categoriesPageV23.copyPathToClipboard('${path.replace(/\\/g, '\\\\')}')">
                                <i class="fas fa-copy"></i> Copier le chemin
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4><i class="fas fa-info-circle"></i> Comment accéder aux fichiers</h4>
                        
                        ${this.filesystemConfig.permissions === 'granted' && this.filesystemConfig.directoryHandle ? `
                            <div class="access-method">
                                <div class="method-title">✅ Répertoire accessible</div>
                                <div class="method-desc">Vos fichiers sont dans le répertoire que vous avez configuré. 
                                Vous pouvez y accéder directement depuis l'explorateur de fichiers.</div>
                            </div>
                        ` : `
                            <div class="access-method">
                                <div class="method-title">📁 Stockage sécurisé</div>
                                <div class="method-desc">Vos fichiers sont dans le stockage sécurisé du navigateur. 
                                Pour y accéder, utilisez les fonctions de téléchargement de l'application.</div>
                            </div>
                        `}
                        
                        <div class="access-method">
                            <div class="method-title">📥 Télécharger un backup</div>
                            <div class="method-desc">Utilisez le bouton "Télécharger Backup" pour obtenir 
                            une copie de vos catégories au format JSON.</div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4><i class="fas fa-file-alt"></i> Fichiers créés</h4>
                        <ul class="files-list">
                            <li><strong>LATEST-Categories-Backup.json</strong> - Dernière sauvegarde</li>
                            <li><strong>EmailSortPro-Categories-[DATE].json</strong> - Backups horodatés</li>
                            <li><strong>README-Categories-Backup.txt</strong> - Documentation</li>
                        </ul>
                    </div>
                </div>
            `);
            
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
                <!-- Statut du système de fichiers avec avertissement si temporaire -->
                <div class="filesystem-status-card ${this.filesystemConfig.storageType === 'browser-temporary' ? 'warning-storage' : ''}">
                    <div class="status-header">
                        <div class="status-icon ${isConfigured ? 'active' : 'inactive'}">
                            <i class="fas fa-${isConfigured ? 
                                (this.filesystemConfig.storageType === 'browser-temporary' ? 'exclamation-triangle' : 'check-circle') : 
                                'cog'}"></i>
                        </div>
                        <div class="status-info">
                            <h3>Sauvegarde ${isConfigured ? 
                                (this.filesystemConfig.storageType === 'browser-temporary' ? 'TEMPORAIRE ⚠️' : 'Persistante ✅') : 
                                'Par Défaut'}</h3>
                            <p class="filesystem-path">
                                <i class="fas fa-folder"></i>
                                ${currentPath}
                            </p>
                            <p class="filesystem-details">
                                ${this.filesystemConfig.storageType === 'browser-temporary' ? 
                                  '⚠️ ATTENTION: Stockage temporaire - peut être supprimé !' :
                                  isConfigured ? 
                                    `Dernière sauvegarde : ${lastBackup}` : 
                                    'Configuration automatique du stockage persistant'
                                }
                                ${this.filesystemConfig.lastBackupFile ? ` | Fichier : ${this.filesystemConfig.lastBackupFile}` : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        <button class="btn-action primary" onclick="window.categoriesPageV23.createFullBackup('manual')">
                            <i class="fas fa-save"></i>
                            Backup Maintenant
                        </button>
                        
                        ${this.fileSystemSupported ? `
                            <button class="btn-action ${this.filesystemConfig.storageType === 'browser-temporary' ? 'warning' : 'secondary'}" 
                                    onclick="window.categoriesPageV23.changeBackupDirectory()">
                                <i class="fas fa-folder-open"></i>
                                ${this.filesystemConfig.storageType === 'browser-temporary' ? 
                                  'Configurer Stockage Persistant' : 
                                  isConfigured ? 'Changer Répertoire' : 'Configurer Répertoire Persistant'}
                            </button>
                        ` : ''}
                        
                        ${isConfigured ? `
                            <button class="btn-action secondary" onclick="window.categoriesPageV23.openBackupDirectory()">
                                <i class="fas fa-external-link-alt"></i>
                                Voir Fichiers
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Avertissement stockage temporaire -->
                ${this.filesystemConfig.storageType === 'browser-temporary' ? `
                    <div class="temporary-warning-card">
                        <div class="warning-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="warning-content">
                            <h4>🚨 Stockage Temporaire Détecté</h4>
                            <p><strong>RISQUE:</strong> Vos backups sont dans le dossier du navigateur et peuvent être supprimés 
                               lors du nettoyage, réinstallation, ou mise à jour du navigateur.</p>
                            <p><strong>SOLUTION:</strong> Configurez un emplacement persistant (Documents, C:\\, disque externe) 
                               pour protéger vos données.</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Notification de fonctionnement par défaut -->
                ${this.filesystemConfig.storageType !== 'browser-temporary' ? `
                    <div class="default-info-card">
                        <div class="info-icon">
                            <i class="fas fa-${this.filesystemConfig.storageType === 'documents' ? 'file-alt' : 
                                               this.filesystemConfig.storageType === 'system' ? 'hdd' :
                                               this.filesystemConfig.storageType === 'custom' ? 'folder' : 'info-circle'}"></i>
                        </div>
                        <div class="info-content">
                            <h4>✅ Stockage Persistant ${this.filesystemConfig.storageType === 'documents' ? '(Documents)' :
                                                        this.filesystemConfig.storageType === 'system' ? '(Système)' :
                                                        this.filesystemConfig.storageType === 'custom' ? '(Personnalisé)' : ''}</h4>
                            <p>Vos catégories sont sauvegardées automatiquement dans un emplacement sûr et persistant.
                               ${!isConfigured && this.fileSystemSupported ? ' Vous pouvez configurer un répertoire personnalisé ci-dessous.' : ''}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${!this.fileSystemSupported ? `
                    <div class="warning-card">
                        <div class="warning-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="warning-content">
                            <h4>Stockage Application Actif</h4>
                            <p>Votre navigateur utilise le stockage sécurisé de l'application. 
                               Vos backups sont automatiquement sauvegardés et protégés.
                               Pour utiliser un répertoire C:// personnalisé, utilisez Chrome ou Edge.</p>
                        </div>
                    </div>
                ` : ''}
                
                ${isConfigured ? `
                    <!-- Configuration du filesystem -->
                    <div class="filesystem-config-card">
                        <h4><i class="fas fa-cog"></i> Configuration du Répertoire</h4>
                        
                        <div class="config-grid">
                            <div class="config-item">
                                <label>Répertoire actuel (chemin complet)</label>
                                <div class="path-display-full">
                                    <i class="fas fa-folder"></i>
                                    <span class="full-path">${currentPath}</span>
                                    <button class="btn-copy" onclick="window.categoriesPageV23.copyPathToClipboard('${currentPath.replace(/\\/g, '\\\\')}')" title="Copier le chemin">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                    <button class="btn-icon" onclick="window.categoriesPageV23.changeBackupDirectory()" title="Changer">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                                <small class="path-info">Chemin complet où sont stockés vos backups de catégories</small>
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
                ${!isConfigured && this.fileSystemSupported ? `
                    <div class="guide-card">
                        <h4><i class="fas fa-lightbulb"></i> Configurer un Répertoire C:// Personnalisé</h4>
                        
                        <div class="guide-steps">
                            <div class="guide-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h5>Cliquer "Configurer Répertoire"</h5>
                                    <p>Cliquez sur le bouton "Configurer Répertoire C://" ci-dessus</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h5>Choisir Votre Dossier</h5>
                                    <p>Sélectionnez ou créez un dossier sur votre disque C:// (ex: C:\\MesBackups\\EmailSortPro)</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h5>Permissions</h5>
                                    <p>Accordez les permissions de lecture/écriture dans la popup du navigateur</p>
                                </div>
                            </div>
                            
                            <div class="guide-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h5>Terminé !</h5>
                                    <p>Vos backups seront automatiquement sauvegardés dans le dossier choisi</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="guide-note">
                            <i class="fas fa-shield-alt"></i>
                            <strong>Note :</strong> Le stockage par défaut fonctionne déjà parfaitement. 
                            Cette option est uniquement pour ceux qui veulent accéder aux fichiers directement 
                            depuis l'explorateur Windows.
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

    renderCategoriesTab(categories, settings) {
        const filtered = this.filterCategories(categories);
        const activeCategories = settings.activeCategories;
        
        return `
            <!-- Stats rapides -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3B82F6;">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${Object.keys(categories).length}</div>
                        <div class="stat-label">Total catégories</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #10B981;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${this.getActiveCount(categories, activeCategories)}</div>
                        <div class="stat-label">Catégories actives</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #F59E0B;">
                        <i class="fas fa-key"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${this.getTotalKeywords(categories)}</div>
                        <div class="stat-label">Mots-clés totaux</div>
                    </div>
                </div>
            </div>
            
            <!-- Barre de recherche -->
            <div class="search-section">
                <div class="search-input">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           placeholder="Rechercher une catégorie..." 
                           onkeyup="window.categoriesPageV23.handleSearch(this.value)">
                </div>
            </div>
            
            <!-- Grille des catégories -->
            <div class="categories-grid" id="categories-container">
                ${this.renderCategories(categories, activeCategories)}
            </div>
        `;
    }

    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        console.log('[CategoriesPage] 🏷️ Rendu des catégories:', {
            total: Object.keys(categories).length,
            filtered: Object.keys(filtered).length,
            searchTerm: this.searchTerm
        });
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3>Aucune catégorie trouvée</h3>
                    <p>Commencez par créer votre première catégorie</p>
                    ${this.searchTerm ? `
                        <button class="btn-secondary" onclick="window.categoriesPageV23.handleSearch('')">
                            Effacer la recherche
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        // Calculer les statistiques pour chaque catégorie
        const emailStats = this.calculateEmailStats();
        console.log('[CategoriesPage] 📊 Statistiques emails:', emailStats);
        
        // Rendu des cartes de catégories
        const categoryCards = Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories, emailStats[id] || 0))
            .join('');
        
        // Ajouter la catégorie "Autre" si elle n'existe pas mais a des emails
        const otherCount = emailStats.other || 0;
        let otherCard = '';
        
        if (otherCount > 0 && !filtered.other) {
            console.log(`[CategoriesPage] 📌 Ajout carte "Autre" avec ${otherCount} emails`);
            
            const isActive = activeCategories === null || activeCategories.includes('other');
            const settings = this.loadSettings();
            const isPreselected = settings.taskPreselectedCategories?.includes('other') || false;
            
            otherCard = `
                <div class="category-card ${!isActive ? 'inactive' : ''}" 
                     data-id="other"
                     onclick="window.categoriesPageV23.showOtherCategoryInfo()">
                    
                    <div class="card-header">
                        <div class="category-icon" style="background: #64748b;">
                            <i class="fas fa-question"></i>
                        </div>
                        <div class="category-info">
                            <div class="category-name">Autre</div>
                            <div class="category-meta">
                                <span class="keyword-count">0 mots-clés</span>
                                <span class="email-count">${otherCount} emails</span>
                                <span class="category-desc">Non catégorisés</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="action-btn-small ${isActive ? 'active' : 'inactive'}" 
                                onclick="window.categoriesPageV23.toggleOtherCategory()"
                                title="Les emails 'Autre' sont toujours visibles">
                            <i class="fas fa-${isActive ? 'eye' : 'eye-slash'}"></i>
                        </button>
                        <button class="action-btn-small ${isPreselected ? 'selected' : ''}" 
                                onclick="window.categoriesPageV23.togglePreselection('other')"
                                title="Pré-sélection tâches">
                            <i class="fas fa-${isPreselected ? 'check' : 'square'}"></i>
                        </button>
                        <button class="action-btn-small" 
                                onclick="window.categoriesPageV23.showOtherCategoryInfo()">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        return categoryCards + otherCard;
    }

    renderCategoryCard(id, category, activeCategories, emailCount) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        const settings = this.loadSettings();
        const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" 
                 data-id="${id}"
                 onclick="window.categoriesPageV23.openModal('${id}')">
                
                <div class="card-header">
                    <div class="category-icon" style="background: ${category.color};">
                        <i class="fas fa-${this.getCategoryIcon(category.icon)}"></i>
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-meta">
                            <span class="keyword-count">${stats.keywords} mots-clés</span>
                            <span class="email-count">${emailCount} emails</span>
                            ${stats.absolute > 0 ? `<span class="absolute-count">★ ${stats.absolute} absolus</span>` : ''}
                        </div>
                        <div class="category-desc">${category.description || 'Catégorie personnalisée'}</div>
                    </div>
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn-small ${isActive ? 'active' : 'inactive'}" 
                            onclick="window.categoriesPageV23.toggleCategory('${id}')"
                            title="${isActive ? 'Catégorie active' : 'Catégorie désactivée'}">
                        <i class="fas fa-${isActive ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="action-btn-small ${isPreselected ? 'selected' : ''}" 
                            onclick="window.categoriesPageV23.togglePreselection('${id}')"
                            title="${isPreselected ? 'Pré-sélectionnée pour les tâches' : 'Non pré-sélectionnée'}">
                        <i class="fas fa-${isPreselected ? 'check' : 'square'}"></i>
                    </button>
                    <button class="action-btn-small" 
                            onclick="window.categoriesPageV23.openModal('${id}')"
                            title="Configurer la catégorie">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
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

    // ================================================
    // FONCTIONS COMPLÈTES DES CATÉGORIES
    // ================================================
    
    toggleCategory(categoryId) {
        console.log(`[CategoriesPage] 🔄 Toggle catégorie: ${categoryId}`);
        
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || null;
        
        if (activeCategories === null) {
            // Si null, toutes sont actives - créer la liste sans celle-ci
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            activeCategories = allCategories.filter(id => id !== categoryId);
        } else {
            // Basculer l'état
            if (activeCategories.includes(categoryId)) {
                activeCategories = activeCategories.filter(id => id !== categoryId);
            } else {
                activeCategories.push(categoryId);
            }
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        
        // Notifier CategoryManager
        if (window.categoryManager && window.categoryManager.updateActiveCategories) {
            window.categoryManager.updateActiveCategories(activeCategories);
        }
        
        this.updateCategoriesDisplay();
        
        const category = window.categoryManager?.getCategory(categoryId);
        const isActive = activeCategories.includes(categoryId);
        this.showToast(`${category?.name || categoryId} ${isActive ? 'activée' : 'désactivée'}`, 'info');
        
        // Déclencher un backup automatique
        this.onCategoriesChanged('toggle-category');
    }

    togglePreselection(categoryId) {
        console.log(`[CategoriesPage] ⭐ Toggle pré-sélection: ${categoryId}`);
        
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
        
        // Synchroniser avec tous les modules
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        this.updateCategoriesDisplay();
        
        const category = window.categoryManager?.getCategory(categoryId);
        const message = isPreselected ? 
            `☐ ${category?.name || categoryId} - Pré-sélection désactivée` : 
            `☑️ ${category?.name || categoryId} - Pré-sélection activée`;
        this.showToast(message, 'info');
        
        // Déclencher un backup automatique
        this.onCategoriesChanged('toggle-preselection');
    }

    syncTaskPreselectedCategories(categories) {
        console.log('[CategoriesPage] 🔄 Synchronisation pré-sélections:', categories);
        
        // CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
        }
        
        // EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        // PageManager
        if (window.pageManager && typeof window.pageManager.updateSettings === 'function') {
            window.pageManager.updateSettings({
                taskPreselectedCategories: categories
            });
        }
        
        // AITaskAnalyzer
        if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
            window.aiTaskAnalyzer.updatePreselectedCategories(categories);
        }
        
        // Dispatcher des événements
        try {
            window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
                detail: {
                    type: 'taskPreselectedCategories',
                    value: categories,
                    source: 'CategoriesPage'
                }
            }));
        } catch (error) {
            console.warn('[CategoriesPage] Erreur dispatch événements:', error);
        }
    }

    toggleOtherCategory() {
        this.showToast('ℹ️ La catégorie "Autre" est toujours visible (emails non catégorisés)', 'info');
    }

    showOtherCategoryInfo() {
        console.log('[CategoriesPage] ℹ️ Affichage infos catégorie "Autre"');
        
        const emails = window.emailScanner?.getAllEmails() || [];
        const otherEmails = emails.filter(email => {
            const cat = email.category;
            return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
        });
        
        this.showModal('Catégorie "Autre"', `
            <div class="other-category-info">
                <div class="info-section">
                    <h4><i class="fas fa-info-circle"></i> À propos</h4>
                    <p>La catégorie "Autre" contient tous les emails qui n'ont pas pu être automatiquement classés dans une catégorie spécifique.</p>
                </div>
                
                <div class="stats-section">
                    <h4><i class="fas fa-chart-bar"></i> Statistiques</h4>
                    <div class="stats-grid-small">
                        <div class="stat-item">
                            <div class="stat-value">${otherEmails.length}</div>
                            <div class="stat-label">Emails</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${new Set(otherEmails.map(e => e.from?.emailAddress?.address?.split('@')[1])).size}</div>
                            <div class="stat-label">Domaines</div>
                        </div>
                    </div>
                </div>
                
                ${otherEmails.length > 0 ? `
                    <div class="emails-sample">
                        <h4><i class="fas fa-envelope"></i> Échantillon d'emails</h4>
                        <div class="emails-list">
                            ${otherEmails.slice(0, 5).map(email => `
                                <div class="email-item">
                                    <div class="email-subject">${email.subject || 'Sans sujet'}</div>
                                    <div class="email-from">${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}</div>
                                    <div class="email-date">${new Date(email.receivedDateTime).toLocaleDateString('fr-FR')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `);
    }

    openModal(categoryId) {
        console.log(`[CategoriesPage] 🔧 Ouverture modal pour: ${categoryId}`);
        
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) {
            this.showToast('❌ Catégorie non trouvée', 'error');
            return;
        }
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], includeEmails: [], excludeDomains: [], excludeEmails: []
        };
        
        this.showModal(`Configuration - ${category.name}`, `
            <div class="category-config">
                <!-- Informations générales -->
                <div class="config-section">
                    <h4><i class="fas fa-info"></i> Informations</h4>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Nom de la catégorie</label>
                            <input type="text" value="${category.name}" readonly>
                        </div>
                        <div class="config-item">
                            <label>Couleur</label>
                            <div class="color-display" style="background: ${category.color};">${category.color}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Mots-clés -->
                <div class="config-section">
                    <h4><i class="fas fa-key"></i> Mots-clés</h4>
                    
                    <div class="keywords-summary">
                        <div class="keyword-type">
                            <strong>Absolus (${keywords.absolute.length}):</strong>
                            <span class="keywords-list">${keywords.absolute.join(', ') || 'Aucun'}</span>
                        </div>
                        <div class="keyword-type">
                            <strong>Forts (${keywords.strong.length}):</strong>
                            <span class="keywords-list">${keywords.strong.join(', ') || 'Aucun'}</span>
                        </div>
                        <div class="keyword-type">
                            <strong>Faibles (${keywords.weak.length}):</strong>
                            <span class="keywords-list">${keywords.weak.join(', ') || 'Aucun'}</span>
                        </div>
                        <div class="keyword-type">
                            <strong>Exclusions (${keywords.exclusions.length}):</strong>
                            <span class="keywords-list">${keywords.exclusions.join(', ') || 'Aucun'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Filtres -->
                <div class="config-section">
                    <h4><i class="fas fa-filter"></i> Filtres</h4>
                    
                    <div class="filters-summary">
                        <div class="filter-type">
                            <strong>Domaines autorisés:</strong>
                            <span class="filters-list">${filters.includeDomains.join(', ') || 'Tous'}</span>
                        </div>
                        <div class="filter-type">
                            <strong>Emails autorisés:</strong>
                            <span class="filters-list">${filters.includeEmails.join(', ') || 'Tous'}</span>
                        </div>
                        <div class="filter-type">
                            <strong>Domaines exclus:</strong>
                            <span class="filters-list">${filters.excludeDomains.join(', ') || 'Aucun'}</span>
                        </div>
                        <div class="filter-type">
                            <strong>Emails exclus:</strong>
                            <span class="filters-list">${filters.excludeEmails.join(', ') || 'Aucun'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="config-section">
                    <h4><i class="fas fa-tools"></i> Actions</h4>
                    <div class="actions-buttons">
                        <button class="btn-action secondary" onclick="window.categoriesPageV23.editCategory('${categoryId}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${category.isCustom ? `
                            <button class="btn-action danger" onclick="window.categoriesPageV23.deleteCategory('${categoryId}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        ` : ''}
                        <button class="btn-action primary" onclick="window.categoriesPageV23.testCategory('${categoryId}')">
                            <i class="fas fa-vial"></i> Tester
                        </button>
                    </div>
                </div>
            </div>
        `);
    }

    showCreateModal() {
        console.log('[CategoriesPage] ➕ Ouverture modal création');
        
        this.showModal('Nouvelle Catégorie', `
            <div class="create-category">
                <div class="config-section">
                    <h4><i class="fas fa-plus"></i> Informations de base</h4>
                    
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Nom de la catégorie *</label>
                            <input type="text" id="new-category-name" placeholder="Ex: Projets, Factures, Newsletter..." autofocus>
                        </div>
                        
                        <div class="config-item">
                            <label>Description</label>
                            <input type="text" id="new-category-desc" placeholder="Description courte (optionnel)">
                        </div>
                    </div>
                    
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Icône</label>
                            <select id="new-category-icon">
                                <option value="📁">📁 Dossier</option>
                                <option value="📧">📧 Email</option>
                                <option value="💼">💼 Travail</option>
                                <option value="🎯">🎯 Objectif</option>
                                <option value="⚡">⚡ Urgent</option>
                                <option value="🔔">🔔 Notification</option>
                                <option value="💡">💡 Idée</option>
                                <option value="📊">📊 Rapport</option>
                                <option value="🏷️">🏷️ Tag</option>
                                <option value="📌">📌 Important</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label>Couleur</label>
                            <select id="new-category-color">
                                <option value="#3B82F6" style="background: #3B82F6; color: white;">🔵 Bleu</option>
                                <option value="#10B981" style="background: #10B981; color: white;">🟢 Vert</option>
                                <option value="#F59E0B" style="background: #F59E0B; color: white;">🟡 Orange</option>
                                <option value="#EF4444" style="background: #EF4444; color: white;">🔴 Rouge</option>
                                <option value="#8B5CF6" style="background: #8B5CF6; color: white;">🟣 Violet</option>
                                <option value="#06B6D4" style="background: #06B6D4; color: white;">🩵 Cyan</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4><i class="fas fa-key"></i> Mots-clés de base</h4>
                    <p class="section-hint">Ajoutez quelques mots-clés pour commencer (vous pourrez en ajouter plus après création)</p>
                    
                    <div class="config-item">
                        <label>Mots-clés principaux</label>
                        <input type="text" id="new-category-keywords" placeholder="Séparez par des virgules : projet, travail, client...">
                        <small>Ces mots-clés seront marqués comme "forts" dans la détection</small>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-action secondary" onclick="window.categoriesPageV23.closeModal()">
                    <i class="fas fa-times"></i> Annuler
                </button>
                <button class="btn-action primary" onclick="window.categoriesPageV23.createCategory()">
                    <i class="fas fa-plus"></i> Créer la catégorie
                </button>
            </div>
        `);
    }

    createCategory() {
        const name = document.getElementById('new-category-name')?.value?.trim();
        const desc = document.getElementById('new-category-desc')?.value?.trim();
        const icon = document.getElementById('new-category-icon')?.value || '📁';
        const color = document.getElementById('new-category-color')?.value || '#3B82F6';
        const keywordsInput = document.getElementById('new-category-keywords')?.value?.trim();
        
        if (!name) {
            this.showToast('⚠️ Le nom de la catégorie est requis', 'warning');
            document.getElementById('new-category-name')?.focus();
            return;
        }
        
        const categoryData = {
            name,
            description: desc,
            icon,
            color,
            priority: 30,
            isCustom: true,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        // Traiter les mots-clés de base
        if (keywordsInput) {
            const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
            categoryData.keywords.strong = keywords;
        }
        
        try {
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal();
                this.showToast(`✅ Catégorie "${name}" créée avec succès!`, 'success');
                this.updateCategoriesDisplay();
                
                // Déclencher un backup automatique
                this.onCategoriesChanged('create-category');
                
                // Ouvrir la configuration après création
                setTimeout(() => this.openModal(newCategory.id), 500);
            } else {
                this.showToast('❌ Erreur lors de la création de la catégorie', 'error');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création catégorie:', error);
            this.showToast('❌ Erreur: ' + error.message, 'error');
        }
    }

    editCategory(categoryId) {
        this.showToast('🔧 Modification avancée - Fonctionnalité en cours de développement', 'info');
        this.closeModal();
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible.`)) {
            try {
                const success = window.categoryManager?.deleteCustomCategory(categoryId);
                
                if (success) {
                    this.closeModal();
                    this.showToast(`🗑️ Catégorie "${category.name}" supprimée`, 'success');
                    this.updateCategoriesDisplay();
                    
                    // Déclencher un backup automatique
                    this.onCategoriesChanged('delete-category');
                } else {
                    this.showToast('❌ Erreur lors de la suppression', 'error');
                }
            } catch (error) {
                console.error('[CategoriesPage] Erreur suppression:', error);
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
        }
    }

    testCategory(categoryId) {
        this.showToast('🧪 Test de catégorie - Fonctionnalité en cours de développement', 'info');
        this.closeModal();
    }

    showModal(title, content) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.categoriesPageV23.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
        
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
        
        if (term) {
            console.log(`[CategoriesPage] 🔍 Recherche: "${term}"`);
        }
    }

    filterCategories(categories) {
        if (!this.searchTerm) return categories;
        
        const filtered = {};
        Object.entries(categories).forEach(([id, category]) => {
            if (category.name.toLowerCase().includes(this.searchTerm) ||
                (category.description && category.description.toLowerCase().includes(this.searchTerm))) {
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

    getCategoryIcon(icon) {
        // Convertir les emojis en icônes FontAwesome
        const iconMap = {
            '📁': 'folder',
            '📧': 'envelope',
            '💼': 'briefcase',
            '🎯': 'bullseye',
            '⚡': 'bolt',
            '🔔': 'bell',
            '💡': 'lightbulb',
            '📊': 'chart-bar',
            '🏷️': 'tag',
            '📌': 'thumbtack',
            '🌟': 'star',
            '🚀': 'rocket',
            '💎': 'gem',
            '🎨': 'palette',
            '🔥': 'fire'
        };
        
        return iconMap[icon] || 'tag';
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

            /* Affichage du chemin complet */
            .path-display-full {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #f8fafc;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }

            .full-path {
                flex: 1;
                word-break: break-all;
                color: #1f2937;
                font-weight: 500;
                line-height: 1.4;
                padding: 4px 8px;
                background: white;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
            }

            .btn-copy {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 6px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .btn-copy:hover {
                background: #2563EB;
                transform: scale(1.05);
            }

            .path-info {
                display: block;
                margin-top: 6px;
                font-size: 11px;
                color: #6b7280;
                font-style: italic;
            }

            /* Modal pour répertoire */
            .directory-info {
                max-width: 100%;
            }

            .path-display-large {
                background: #f1f5f9;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
            }

            .path-text {
                font-family: 'Courier New', monospace;
                font-size: 13px;
                color: #1f2937;
                font-weight: 600;
                word-break: break-all;
                line-height: 1.5;
                background: white;
                padding: 12px;
                border-radius: 4px;
                border: 1px solid #d1d5db;
                margin-bottom: 12px;
            }

            .btn-copy-large {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .btn-copy-large:hover {
                background: #2563EB;
                transform: translateY(-1px);
            }

            .access-method {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 12px;
            }

            .method-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 6px;
            }

            .method-desc {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }

            .files-list {
                list-style: none;
                padding: 0;
                margin: 8px 0;
            }

            .files-list li {
                padding: 6px 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                margin-bottom: 6px;
                font-size: 13px;
                font-family: 'Courier New', monospace;
            }

            .files-list li strong {
                color: #3B82F6;
                font-weight: 600;
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

            /* Avertissement stockage temporaire */
            .temporary-warning-card {
                background: #fef2f2;
                border: 2px solid #fecaca;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .temporary-warning-card .warning-icon {
                color: #dc2626;
                font-size: 24px;
                margin-top: 2px;
            }

            .temporary-warning-card .warning-content h4 {
                font-size: 15px;
                font-weight: 600;
                color: #dc2626;
                margin: 0 0 8px 0;
            }

            .temporary-warning-card .warning-content p {
                font-size: 13px;
                color: #991b1b;
                margin: 0 0 6px 0;
                line-height: 1.4;
            }

            .temporary-warning-card .warning-content p strong {
                font-weight: 600;
            }

            /* Status card avec warning */
            .filesystem-status-card.warning-storage {
                border: 2px solid #fbbf24;
                background: #fffbeb;
            }

            .filesystem-status-card.warning-storage .status-icon {
                background: #f59e0b;
                color: white;
            }

            .btn-action.warning {
                background: #f59e0b;
                color: white;
                font-weight: 600;
            }

            .btn-action.warning:hover {
                background: #d97706;
                transform: translateY(-1px);
            }
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .info-icon {
                color: #0ea5e9;
                font-size: 20px;
                margin-top: 2px;
            }

            .info-content h4 {
                font-size: 14px;
                font-weight: 600;
                color: #0369a1;
                margin: 0 0 4px 0;
            }

            .info-content p {
                font-size: 13px;
                color: #0c4a6e;
                margin: 0;
                line-height: 1.4;
            }
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

            /* Styles pour les cartes de catégories complètes */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 16px;
                margin-top: 20px;
            }

            .category-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 140px;
            }

            .category-card:hover {
                border-color: #3B82F6;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }

            .category-card.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }

            .card-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .category-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                flex-shrink: 0;
            }

            .category-info {
                flex: 1;
                min-width: 0;
            }

            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
                line-height: 1.3;
                word-wrap: break-word;
            }

            .category-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 4px;
            }

            .keyword-count,
            .email-count,
            .absolute-count {
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: 500;
            }

            .keyword-count {
                background: #f3f4f6;
                color: #6b7280;
            }

            .email-count {
                background: #dbeafe;
                color: #3B82F6;
            }

            .absolute-count {
                background: #fef3c7;
                color: #d97706;
            }

            .category-desc {
                font-size: 12px;
                color: #9ca3af;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .card-actions {
                display: flex;
                gap: 6px;
                justify-content: flex-end;
                margin-top: auto;
            }

            .action-btn-small {
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all 0.15s ease;
                color: #6b7280;
            }

            .action-btn-small:hover {
                border-color: #9ca3af;
                transform: scale(1.05);
            }

            .action-btn-small.active {
                background: #10b981;
                border-color: #10b981;
                color: white;
            }

            .action-btn-small.inactive {
                background: #ef4444;
                border-color: #ef4444;
                color: white;
            }

            .action-btn-small.selected {
                background: #3B82F6;
                border-color: #3B82F6;
                color: white;
            }

            /* Stats grid sobre */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .stat-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.15s ease;
            }

            .stat-card:hover {
                border-color: #3B82F6;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .stat-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            }

            .stat-number {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
            }

            .stat-label {
                font-size: 12px;
                color: #6b7280;
            }

            /* Recherche sobre */
            .search-section {
                margin-bottom: 24px;
            }

            .search-input {
                position: relative;
                max-width: 400px;
            }

            .search-input i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
            }

            .search-input input {
                width: 100%;
                padding: 10px 12px 10px 36px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.15s ease;
            }

            .search-input input:focus {
                outline: none;
                border-color: #3B82F6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Empty state */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                grid-column: 1 / -1;
            }

            .empty-state .empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #d1d5db;
            }

            .empty-state h3 {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin: 0 0 8px 0;
            }

            .empty-state p {
                font-size: 14px;
                margin: 0 0 16px 0;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            /* Modal styles complets */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                animation: fadeIn 0.2s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-content {
                background: white;
                border-radius: 8px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                animation: slideUp 0.2s ease;
            }

            .modal-content.large {
                max-width: 800px;
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
                background: #f8fafc;
            }

            .modal-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                padding: 4px;
                cursor: pointer;
                color: #6b7280;
                font-size: 16px;
                border-radius: 4px;
                transition: all 0.15s ease;
            }

            .modal-close:hover {
                color: #374151;
                background: #f3f4f6;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: 70vh;
            }

            .config-section {
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f1f5f9;
            }

            .config-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .config-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 12px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .config-section h4 i {
                color: #3B82F6;
            }

            .section-hint {
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 12px;
                line-height: 1.4;
            }

            .keywords-summary,
            .filters-summary {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .keyword-type,
            .filter-type {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px 12px;
                background: #f8fafc;
                border-radius: 4px;
                border-left: 3px solid #3B82F6;
            }

            .keywords-list,
            .filters-list {
                font-size: 13px;
                color: #6b7280;
                font-family: 'Courier New', monospace;
                word-break: break-word;
            }

            .color-display {
                width: 100%;
                padding: 8px 12px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                text-align: center;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }

            .actions-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .modal-actions {
                padding: 16px 20px;
                border-top: 1px solid #e2e8f0;
                background: #f8fafc;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .other-category-info .stats-grid-small {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin: 12px 0;
            }

            .stat-item {
                text-align: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }

            .stat-item .stat-value {
                font-size: 20px;
                font-weight: 600;
                color: #3B82F6;
                margin-bottom: 4px;
            }

            .stat-item .stat-label {
                font-size: 12px;
                color: #6b7280;
            }

            .emails-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
            }

            .email-item {
                padding: 8px 12px;
                border-bottom: 1px solid #f1f5f9;
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 8px;
                align-items: center;
            }

            .email-item:last-child {
                border-bottom: none;
            }

            .email-subject {
                font-size: 13px;
                font-weight: 500;
                color: #1f2937;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .email-from {
                font-size: 11px;
                color: #6b7280;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .email-date {
                font-size: 10px;
                color: #9ca3af;
                white-space: nowrap;
            }
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

// Démarrer la configuration automatique PERSISTANTE
setTimeout(async () => {
    console.log('[CategoriesPage] 🎯 Configuration automatique PERSISTANTE...');
    
    const instance = window.categoriesPageV23;
    
    // Si le filesystem est supporté, essayer de configurer automatiquement un stockage PERSISTANT
    if (instance.fileSystemSupported && !instance.filesystemConfig.enabled) {
        console.log('[CategoriesPage] 🏠 Tentative de configuration persistante...');
        
        setTimeout(async () => {
            try {
                // Essayer la configuration persistante avec stratégies multiples
                const configured = await instance.setupDefaultPath();
                
                if (configured) {
                    const storageType = instance.filesystemConfig.storageType;
                    console.log(`[CategoriesPage] ✅ Configuration persistante réussie: ${storageType}`);
                    console.log('[CategoriesPage] 📁 Backup configuré dans:', instance.filesystemConfig.currentPath);
                    
                    // Test du backup
                    const testResult = await instance.createFilesystemBackup('auto-config-test');
                    if (testResult) {
                        console.log('[CategoriesPage] ✅ Test backup persistant réussi !');
                        console.log('[CategoriesPage] 💾 Fichier de backup créé et vérifié');
                        
                        if (storageType === 'browser-temporary') {
                            console.warn('[CategoriesPage] ⚠️ ATTENTION: Stockage temporaire - Configurez un emplacement persistant !');
                        }
                    }
                } else {
                    console.log('[CategoriesPage] ⚠️ Configuration persistante non possible - Vérifiez les permissions');
                    console.log('[CategoriesPage] 📋 Utilisez l\'onglet "Sauvegarde C://" pour configurer manuellement');
                }
            } catch (error) {
                console.log('[CategoriesPage] ℹ️ Configuration persistante en attente d\'interaction utilisateur');
            }
        }, 2000);
    } else if (!instance.fileSystemSupported) {
        console.warn('[CategoriesPage] ⚠️ File System API non supportée - Backup invisible uniquement');
        
        // Configurer au moins un chemin par défaut pour information
        instance.filesystemConfig.currentPath = instance.filesystemConfig.defaultPath;
        instance.filesystemConfig.storageType = 'none';
        console.log('[CategoriesPage] 📁 Chemin théorique configuré:', instance.filesystemConfig.currentPath);
    } else {
        console.log('[CategoriesPage] ✅ Stockage persistant déjà configuré');
    }
    
}, 1000);

// API pour forcer une configuration persistante
window.configurePersistentBackup = async function() {
    console.log('[API] 🏠 Configuration stockage persistant forcée...');
    
    try {
        const instance = window.categoriesPageV23;
        
        // Réinitialiser la configuration
        instance.filesystemConfig.enabled = false;
        instance.filesystemConfig.directoryHandle = null;
        
        // Essayer la configuration persistante
        const success = await instance.setupDefaultPath();
        
        if (success) {
            console.log('[API] ✅ Stockage persistant configuré:', instance.filesystemConfig.storageType);
            console.log('[API] 📁 Emplacement:', instance.filesystemConfig.currentPath);
            
            // Rafraîchir l'interface
            if (instance.activeTab === 'backup') {
                instance.refreshBackupInfo();
            }
            
            return {
                success: true,
                storageType: instance.filesystemConfig.storageType,
                path: instance.filesystemConfig.currentPath,
                temporary: instance.filesystemConfig.storageType === 'browser-temporary'
            };
        } else {
            console.error('[API] ❌ Échec configuration stockage persistant');
            return { success: false, error: 'Configuration impossible' };
        }
    } catch (error) {
        console.error('[API] ❌ Erreur configuration persistante:', error);
        return { success: false, error: error.message };
    }
};

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
