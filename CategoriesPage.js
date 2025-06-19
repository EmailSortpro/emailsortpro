// CategoriesPage.js - Version v24.1 - Correction User Gesture pour File Picker
console.log('[CategoriesPage] 🚀 Loading CategoriesPage.js v24.1 - User Gesture Fixed...');

// Nettoyer toute instance précédente
if (window.categoriesPage) {
    console.log('[CategoriesPage] 🧹 Nettoyage instance précédente...');
    delete window.categoriesPage;
}

class CategoriesPageV24 {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.activeTab = 'categories';
        this.creationInProgress = false;
        this.colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        
        // Configuration filesystem simplifiée
        this.filesystemConfig = {
            enabled: false,
            defaultPath: 'C:\\Users\\[Utilisateur]\\Documents\\EmailSortPro\\Categories\\',
            currentPath: null,
            directoryHandle: null,
            autoSave: true,
            permissions: 'prompt',
            filename: 'EmailSortPro-Categories.json'
        };
        
        this.backupConfig = {
            autoSave: true,
            interval: 30000,
            maxBackups: 10
        };
        
        this.backupTimer = null;
        this.pendingChanges = false;
        this.fileSystemSupported = this.checkFileSystemSupport();
        
        console.log('[CategoriesPage] 🎯 Interface v24.1 - User Gesture Fixed');
        
        this.initializeStorage();
    }

    // ================================================
    // STOCKAGE C:// DIRECT SIMPLIFIÉ
    // ================================================
    checkFileSystemSupport() {
        return 'showDirectoryPicker' in window;
    }

    async initializeStorage() {
        console.log('[CategoriesPage] 📁 Initialisation stockage Documents...');
        
        if (!this.fileSystemSupported) {
            console.warn('[CategoriesPage] ⚠️ API non supportée - Configuration basique');
            this.filesystemConfig.currentPath = this.filesystemConfig.defaultPath;
            this.initializeBackup();
            return;
        }

        // Essayer de restaurer l'accès précédent
        await this.restoreDirectoryAccess();
        
        // Vérifier si l'autorisation a déjà été donnée
        const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
        
        if (!this.filesystemConfig.enabled && !authorizationGranted) {
            console.log('[CategoriesPage] 🎯 Première utilisation - Préparation autorisation...');
            this.filesystemConfig.currentPath = 'Autorisation requise pour création automatique';
            
            // Afficher une notification discrète pour configurer le backup
            setTimeout(() => {
                this.showBackupConfigNotification();
            }, 5000); // 5 secondes après le chargement
            
        } else if (!this.filesystemConfig.enabled && authorizationGranted) {
            console.log('[CategoriesPage] ✅ Autorisation précédente trouvée - Configuration disponible');
            this.filesystemConfig.currentPath = 'Prêt pour création automatique';
        }
        
        this.initializeBackup();
    }

    showBackupConfigNotification() {
        // Vérifier si l'utilisateur n'a pas déjà vu cette notification
        const notificationShown = localStorage.getItem('emailsortpro_backup_notification_shown');
        if (notificationShown) return;
        
        // Créer une notification discrète
        const notification = document.createElement('div');
        notification.className = 'backup-config-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="notification-text">
                    <strong>Sauvegarde automatique disponible</strong>
                    <span>Configurez la sauvegarde de vos catégories sur votre ordinateur</span>
                </div>
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="window.categoriesPageV24.handleNotificationConfigure()">
                        <i class="fas fa-cog"></i> Configurer
                    </button>
                    <button class="notification-btn secondary" onclick="window.categoriesPageV24.handleNotificationDismiss()">
                        <i class="fas fa-times"></i> Plus tard
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);
        
        // Auto-dismiss après 10 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                this.handleNotificationDismiss();
            }
        }, 10000);
        
        this.currentNotification = notification;
    }

    handleNotificationConfigure() {
        console.log('[CategoriesPage] 🎯 Configuration via notification...');
        
        // Marquer la notification comme vue
        localStorage.setItem('emailsortpro_backup_notification_shown', 'true');
        
        // Fermer la notification
        if (this.currentNotification) {
            this.currentNotification.classList.add('closing');
            setTimeout(() => {
                if (this.currentNotification && this.currentNotification.parentElement) {
                    this.currentNotification.remove();
                }
                this.currentNotification = null;
            }, 300);
        }
        
        // Déclencher la configuration
        this.configureDirectAccess();
    }

    handleNotificationDismiss() {
        console.log('[CategoriesPage] 📝 Notification rejetée - Sera reproposée plus tard');
        
        // Marquer comme vue pour cette session seulement
        sessionStorage.setItem('emailsortpro_backup_notification_dismissed', 'true');
        
        // Fermer la notification
        if (this.currentNotification) {
            this.currentNotification.classList.add('closing');
            setTimeout(() => {
                if (this.currentNotification && this.currentNotification.parentElement) {
                    this.currentNotification.remove();
                }
                this.currentNotification = null;
            }, 300);
        }
    }

    async showAuthorizationModal() {
        console.log('[CategoriesPage] 🎨 Affichage modal d\'autorisation esthétique...');
        
        // Vérifier si l'autorisation a déjà été donnée
        const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
        if (authorizationGranted) {
            console.log('[CategoriesPage] ✅ Autorisation déjà accordée - Affichage configuration directe');
            this.showDirectCreationModal();
            return;
        }
        
        // Créer le modal d'autorisation esthétique
        const modal = document.createElement('div');
        modal.className = 'authorization-modal-overlay';
        modal.innerHTML = `
            <div class="authorization-modal">
                <div class="auth-modal-header">
                    <div class="auth-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h2>Autorisation de Stockage</h2>
                    <p class="auth-subtitle">EmailSortPro souhaite créer son dossier de sauvegarde</p>
                </div>
                
                <div class="auth-modal-body">
                    <div class="auth-explanation">
                        <div class="auth-feature">
                            <div class="feature-icon">
                                <i class="fas fa-folder-plus"></i>
                            </div>
                            <div class="feature-text">
                                <strong>Création automatique</strong>
                                <span>Un dossier EmailSortPro sera créé dans vos Documents</span>
                            </div>
                        </div>
                        
                        <div class="auth-feature">
                            <div class="feature-icon">
                                <i class="fas fa-save"></i>
                            </div>
                            <div class="feature-text">
                                <strong>Sauvegarde sécurisée</strong>
                                <span>Vos catégories et paramètres seront sauvegardés automatiquement</span>
                            </div>
                        </div>
                        
                        <div class="auth-feature">
                            <div class="feature-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="feature-text">
                                <strong>Confidentialité garantie</strong>
                                <span>Tous vos fichiers restent sur votre ordinateur</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="auth-path-preview">
                        <div class="path-label">Emplacement de création :</div>
                        <div class="path-value">
                            <i class="fas fa-folder"></i>
                            Documents\\EmailSortPro\\Categories\\
                        </div>
                    </div>
                    
                    <div class="auth-promise">
                        <i class="fas fa-check-circle"></i>
                        Cette autorisation ne vous sera demandée qu'une seule fois
                    </div>
                </div>
                
                <div class="auth-modal-actions">
                    <button class="auth-btn secondary" onclick="window.categoriesPageV24.denyAuthorization()">
                        <i class="fas fa-times"></i>
                        Plus tard
                    </button>
                    <button class="auth-btn primary" onclick="window.categoriesPageV24.grantAuthorization()">
                        <i class="fas fa-check"></i>
                        Autoriser la création
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Animation d'apparition
        setTimeout(() => {
            modal.classList.add('visible');
        }, 50);
    }

    async grantAuthorization() {
        console.log('[CategoriesPage] ✅ Autorisation accordée par l\'utilisateur');
        
        try {
            // Marquer l'autorisation comme accordée DÉFINITIVEMENT
            localStorage.setItem('emailsortpro_filesystem_authorized', 'true');
            localStorage.setItem('emailsortpro_authorization_date', new Date().toISOString());
            
            // Fermer le modal avec animation
            if (this.currentModal) {
                this.currentModal.classList.add('closing');
                setTimeout(() => {
                    this.currentModal.remove();
                    this.currentModal = null;
                }, 300);
            }
            
            // Message de confirmation
            this.showToast('✅ Autorisation accordée - Cliquez pour créer maintenant !', 'success');
            
            // Afficher le modal de création directe
            setTimeout(() => {
                this.showDirectCreationModal();
            }, 500);
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur après autorisation:', error);
            this.showToast('❌ Erreur lors de la configuration: ' + error.message, 'error');
        }
    }

    showDirectCreationModal() {
        console.log('[CategoriesPage] 🚀 Affichage modal création directe...');
        
        const modal = document.createElement('div');
        modal.className = 'creation-modal-overlay';
        modal.innerHTML = `
            <div class="creation-modal">
                <div class="creation-header">
                    <div class="creation-icon">
                        <i class="fas fa-magic"></i>
                    </div>
                    <h2>Création Automatique Prête</h2>
                    <p class="creation-subtitle">EmailSortPro va créer son dossier de sauvegarde</p>
                </div>
                
                <div class="creation-body">
                    <div class="creation-info">
                        <div class="info-highlight">
                            ✨ <strong>PRÊT :</strong> Le système va créer automatiquement :<br>
                            <code>Documents\\EmailSortPro\\Categories\\</code>
                        </div>
                        
                        <div class="creation-steps">
                            <div class="step-preview">
                                <i class="fas fa-folder-plus"></i>
                                <span>Sélection automatique du dossier Documents</span>
                            </div>
                            <div class="step-preview">
                                <i class="fas fa-cogs"></i>
                                <span>Création de la structure EmailSortPro</span>
                            </div>
                            <div class="step-preview">
                                <i class="fas fa-check-circle"></i>
                                <span>Configuration automatique terminée</span>
                            </div>
                        </div>
                        
                        <div class="important-note">
                            <i class="fas fa-info-circle"></i>
                            <strong>Important :</strong> Votre navigateur va vous demander d'autoriser l'accès au dossier Documents. Cliquez sur "Autoriser" pour finaliser la configuration.
                        </div>
                    </div>
                </div>
                
                <div class="creation-actions">
                    <button class="creation-btn secondary" onclick="window.categoriesPageV24.closeCreationModal()">
                        <i class="fas fa-clock"></i>
                        Plus tard
                    </button>
                    <button class="creation-btn primary magic-btn" onclick="window.categoriesPageV24.executeDirectCreation()">
                        <i class="fas fa-magic"></i>
                        CRÉER AUTOMATIQUEMENT
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Animation d'apparition
        setTimeout(() => {
            modal.classList.add('visible');
        }, 50);
    }

    closeCreationModal() {
        if (this.currentModal) {
            this.currentModal.classList.add('closing');
            setTimeout(() => {
                this.currentModal.remove();
                this.currentModal = null;
            }, 300);
        }
        
        this.showToast('📁 Création disponible dans les Paramètres', 'info');
        this.refreshInterface();
    }

    async executeDirectCreation() {
        console.log('[CategoriesPage] 🚀 EXÉCUTION: Création directe avec User Gesture...');
        
        try {
            // Fermer le modal immédiatement
            if (this.currentModal) {
                this.currentModal.classList.add('closing');
                setTimeout(() => {
                    this.currentModal.remove();
                    this.currentModal = null;
                }, 300);
            }
            
            // Message informatif
            this.showToast('📁 Sélectionnez le dossier Documents pour la création...', 'info');
            
            // APPEL DIRECT avec User Gesture actif
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-direct-creation'
            });
            
            // Création immédiate
            await this.createCompleteStructure(directoryHandle);
            
            this.showToast('✅ EmailSortPro créé avec succès dans Documents!', 'success');
            this.refreshInterface();
            
            return true;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[CategoriesPage] 📂 Création annulée par l\'utilisateur');
                this.showToast('📁 Création annulée - Disponible dans Paramètres', 'info');
            } else {
                console.error('[CategoriesPage] ❌ Erreur création directe:', error);
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
            
            this.refreshInterface();
            return false;
        }
    }

    denyAuthorization() {
        console.log('[CategoriesPage] ❌ Autorisation refusée par l\'utilisateur');
        
        // Fermer le modal
        if (this.currentModal) {
            this.currentModal.classList.add('closing');
            setTimeout(() => {
                this.currentModal.remove();
                this.currentModal = null;
            }, 300);
        }
        
        // Message informatif
        this.showToast('📁 Vous pourrez autoriser la création depuis les Paramètres', 'info');
        
        // Mettre à jour le statut
        this.filesystemConfig.currentPath = 'Autorisation refusée - Disponible dans Paramètres';
        this.refreshInterface();
    }

    async restoreDirectoryAccess() {
        try {
            const savedConfig = localStorage.getItem('emailsortpro_filesystem_v24');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.filesystemConfig.currentPath = config.currentPath;
                this.filesystemConfig.enabled = config.enabled;
                this.filesystemConfig.permissions = config.permissions;
                console.log('[CategoriesPage] 📂 Configuration restaurée:', config.currentPath);
                
                // Si configuré mais pas de handle, marquer pour re-configuration
                if (config.enabled && !this.filesystemConfig.directoryHandle) {
                    console.log('[CategoriesPage] 🔄 Handle perdu - Re-configuration nécessaire');
                    this.filesystemConfig.enabled = false;
                }
            }
        } catch (error) {
            console.log('[CategoriesPage] ℹ️ Aucune configuration précédente');
        }
    }

    async configureDirectAccess() {
        if (!this.fileSystemSupported) {
            this.showToast('❌ Votre navigateur ne supporte pas l\'accès aux fichiers', 'error');
            return false;
        }

        // Vérifier si l'autorisation a déjà été donnée
        const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
        
        if (!authorizationGranted) {
            // Première fois - Afficher le modal d'autorisation esthétique
            await this.showAuthorizationModal();
            return false;
        } else {
            // Autorisation déjà accordée - Afficher le modal de création directe
            this.showDirectCreationModal();
            return false; // On ne crée pas immédiatement, on attend le clic utilisateur
        }
    }

    async createCompleteStructure(baseDirectoryHandle) {
        console.log('[CategoriesPage] 🔧 Création structure complète...');
        
        try {
            // Étape 1: Créer EmailSortPro dans le dossier sélectionné
            let emailSortProHandle;
            try {
                emailSortProHandle = await baseDirectoryHandle.getDirectoryHandle('EmailSortPro', { create: true });
                console.log('[CategoriesPage] ✅ Dossier EmailSortPro créé/trouvé');
            } catch (error) {
                throw new Error('Impossible de créer le dossier EmailSortPro: ' + error.message);
            }
            
            // Étape 2: Créer Categories dans EmailSortPro
            let categoriesHandle;
            try {
                categoriesHandle = await emailSortProHandle.getDirectoryHandle('Categories', { create: true });
                console.log('[CategoriesPage] ✅ Dossier Categories créé/trouvé');
            } catch (error) {
                throw new Error('Impossible de créer le dossier Categories: ' + error.message);
            }
            
            // Étape 3: Tester l'accès en écriture
            await this.testDirectoryAccess(categoriesHandle);
            console.log('[CategoriesPage] ✅ Test accès écriture réussi');
            
            // Étape 4: Configurer le système
            this.filesystemConfig.directoryHandle = categoriesHandle;
            this.filesystemConfig.enabled = true;
            this.filesystemConfig.permissions = 'granted';
            this.filesystemConfig.currentPath = this.buildFullPath(baseDirectoryHandle, 'EmailSortPro\\Categories\\');
            
            // Étape 5: Sauvegarder la configuration
            await this.saveConfig();
            console.log('[CategoriesPage] ✅ Configuration sauvegardée');
            
            // Étape 6: Créer les fichiers de documentation
            await this.createReadmeFile();
            await this.createSetupInfoFile();
            
            // Étape 7: Créer un backup initial
            await this.createBackup('setup-complete');
            
            console.log('[CategoriesPage] 🎉 Structure complète créée avec succès');
            return true;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur création structure:', error);
            throw error;
        }
    }

    buildFullPath(baseHandle, subPath) {
        const baseName = baseHandle.name || 'DossierSelectionne';
        
        // Déterminer le chemin probable basé sur le nom du dossier
        if (baseName.toLowerCase().includes('documents')) {
            return `C:\\Users\\[Utilisateur]\\Documents\\${subPath}`;
        } else if (baseName.toLowerCase().includes('desktop') || baseName.toLowerCase().includes('bureau')) {
            return `C:\\Users\\[Utilisateur]\\Desktop\\${baseName}\\${subPath}`;
        } else if (baseName === 'C:' || baseName.toLowerCase().includes('disque')) {
            return `C:\\${subPath}`;
        } else {
            return `C:\\Users\\[Utilisateur]\\Documents\\${baseName}\\${subPath}`;
        }
    }

    async createSetupInfoFile() {
        if (!this.filesystemConfig.directoryHandle) return;
        
        try {
            const setupContent = `# EmailSortPro - Configuration Automatique Réussie

## ✅ CONFIGURATION TERMINÉE
Votre dossier de sauvegarde EmailSortPro a été créé automatiquement !

## 📁 EMPLACEMENT CONFIGURÉ
${this.filesystemConfig.currentPath}

## 🎯 STRUCTURE CRÉÉE
- EmailSortPro/
  └── Categories/
      ├── EmailSortPro-Categories.json (fichier principal)
      ├── README-EmailSortPro.txt (documentation)
      └── [fichiers de sauvegarde horodatés]

## 🔄 FONCTIONNEMENT AUTOMATIQUE
✅ Sauvegarde automatique: Toutes les 30 secondes
✅ Backup invisible: localStorage en parallèle
✅ Nettoyage automatique: Conservation des 10 derniers fichiers
✅ Accès direct: Vos fichiers dans l'explorateur Windows

## 📋 PROCHAINES ÉTAPES
1. Vos catégories sont maintenant sauvegardées automatiquement
2. Vous pouvez accéder aux fichiers directement depuis l'explorateur
3. Les backups sont créés à chaque modification
4. Aucune action supplémentaire requise !

## ⚙️ PARAMÈTRES
- Configuration: ${new Date().toLocaleString('fr-FR')}
- Version: EmailSortPro v24.1
- Type: Configuration automatique avec User Gesture
- Statut: ✅ OPÉRATIONNEL

Félicitations ! Votre système de sauvegarde est maintenant actif.
`;

            const setupHandle = await this.filesystemConfig.directoryHandle.getFileHandle('✅-CONFIGURATION-REUSSIE.txt', { create: true });
            const writable = await setupHandle.createWritable();
            await writable.write(setupContent);
            await writable.close();

            console.log('[CategoriesPage] ✅ Fichier info configuration créé');
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Impossible de créer fichier info:', error);
        }
    }

    async testDirectoryAccess(directoryHandle) {
        const testFileName = '.test-emailsortpro-' + Date.now();
        
        try {
            const testFileHandle = await directoryHandle.getFileHandle(testFileName, { create: true });
            const writable = await testFileHandle.createWritable();
            await writable.write('Test EmailSortPro - ' + new Date().toISOString());
            await writable.close();
            await directoryHandle.removeEntry(testFileName);
            
            console.log('[CategoriesPage] ✅ Test accès réussi');
            return true;
        } catch (error) {
            throw new Error('Impossible d\'écrire dans ce dossier: ' + error.message);
        }
    }

    async saveConfig() {
        try {
            const config = {
                enabled: this.filesystemConfig.enabled,
                currentPath: this.filesystemConfig.currentPath,
                permissions: this.filesystemConfig.permissions,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('emailsortpro_filesystem_v24', JSON.stringify(config));
            console.log('[CategoriesPage] 💾 Configuration sauvegardée');
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur sauvegarde config:', error);
        }
    }

    async createReadmeFile() {
        if (!this.filesystemConfig.directoryHandle) return;
        
        try {
            const readmeContent = `# EmailSortPro - Sauvegarde des Catégories

## 📁 Emplacement
${this.filesystemConfig.currentPath}

## 📂 Fichiers
- EmailSortPro-Categories.json : Sauvegarde principale
- EmailSortPro-Categories-[DATE].json : Sauvegardes horodatées

## 🔄 Fonctionnement
- Sauvegarde automatique toutes les 30 secondes
- Conservation des 10 derniers fichiers
- Format JSON lisible

## 📋 Contenu
- Toutes vos catégories personnalisées
- Mots-clés et filtres
- Paramètres et statistiques

---
Généré par EmailSortPro v24.1
Date: ${new Date().toLocaleString('fr-FR')}
`;

            const readmeHandle = await this.filesystemConfig.directoryHandle.getFileHandle('README-EmailSortPro.txt', { create: true });
            const writable = await readmeHandle.createWritable();
            await writable.write(readmeContent);
            await writable.close();

        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Impossible de créer README:', error);
        }
    }

    // ================================================
    // SYSTÈME DE BACKUP SIMPLIFIÉ
    // ================================================
    initializeBackup() {
        console.log('[CategoriesPage] 🔄 Initialisation backup...');
        
        this.startChangeDetection();
        this.startAutoBackup();
        
        // Backup initial
        setTimeout(() => this.createBackup('initial'), 2000);
    }

    startChangeDetection() {
        // Surveiller les changements dans CategoryManager
        if (window.categoryManager) {
            ['createCustomCategory', 'updateCategoryKeywords', 'deleteCustomCategory'].forEach(method => {
                if (typeof window.categoryManager[method] === 'function') {
                    const original = window.categoryManager[method].bind(window.categoryManager);
                    window.categoryManager[method] = (...args) => {
                        const result = original(...args);
                        this.onCategoriesChanged(method);
                        return result;
                    };
                }
            });
        }
        
        document.addEventListener('categorySettingsChanged', () => {
            this.onCategoriesChanged('settings');
        });
        
        console.log('[CategoriesPage] 👁️ Surveillance activée');
    }

    onCategoriesChanged(source) {
        console.log(`[CategoriesPage] 📝 Changement: ${source}`);
        this.pendingChanges = true;
        
        // Backup immédiat pour changements critiques
        if (['createCustomCategory', 'deleteCustomCategory'].includes(source)) {
            setTimeout(() => this.createBackup('critical'), 1000);
        }
    }

    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        this.backupTimer = setInterval(() => {
            if (this.pendingChanges) {
                this.createBackup('auto');
                this.pendingChanges = false;
            }
        }, this.backupConfig.interval);
        
        console.log('[CategoriesPage] ⏰ Timer backup démarré');
    }

    async createBackup(type = 'manual') {
        try {
            const backupData = this.collectData(type);
            const dataString = JSON.stringify(backupData, null, 2);
            
            // Backup filesystem si configuré
            let filesystemSuccess = false;
            if (this.filesystemConfig.enabled && this.filesystemConfig.directoryHandle) {
                filesystemSuccess = await this.saveToFilesystem(dataString, type);
            }
            
            // Backup invisible (localStorage + cache)
            const invisibleSuccess = this.saveToInvisible(backupData);
            
            if (type === 'manual') {
                if (filesystemSuccess || invisibleSuccess) {
                    this.showToast('✅ Backup créé avec succès!', 'success');
                } else {
                    this.showToast('❌ Échec du backup', 'error');
                }
            }
            
            return filesystemSuccess || invisibleSuccess;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup:', error);
            if (type === 'manual') {
                this.showToast('❌ Erreur backup: ' + error.message, 'error');
            }
            return false;
        }
    }

    async saveToFilesystem(dataString, type) {
        try {
            // Fichier principal
            const mainHandle = await this.filesystemConfig.directoryHandle.getFileHandle(this.filesystemConfig.filename, { create: true });
            const mainWritable = await mainHandle.createWritable();
            await mainWritable.write(dataString);
            await mainWritable.close();
            
            // Fichier horodaté si manuel
            if (type === 'manual') {
                const timestamp = new Date().toISOString().split('T')[0];
                const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
                const timestampedFilename = `EmailSortPro-Categories-${timestamp}_${timeStr}.json`;
                
                const timestampedHandle = await this.filesystemConfig.directoryHandle.getFileHandle(timestampedFilename, { create: true });
                const timestampedWritable = await timestampedHandle.createWritable();
                await timestampedWritable.write(dataString);
                await timestampedWritable.close();
            }
            
            console.log(`[CategoriesPage] ✅ Backup filesystem: ${this.filesystemConfig.filename}`);
            return true;
            
        } catch (error) {
            console.error('[CategoriesPage] ❌ Erreur backup filesystem:', error);
            
            // Si erreur d'accès, marquer comme non disponible
            if (error.name === 'NotAllowedError') {
                this.filesystemConfig.enabled = false;
                this.filesystemConfig.permissions = 'denied';
            }
            
            return false;
        }
    }

    saveToInvisible(data) {
        try {
            // localStorage principal
            localStorage.setItem('emailsortpro_categories_backup', JSON.stringify(data));
            
            // localStorage avec timestamp
            const timestamp = Date.now();
            localStorage.setItem(`emailsortpro_categories_${timestamp}`, JSON.stringify(data));
            
            // Nettoyer anciens
            this.cleanupLocalStorage();
            
            console.log('[CategoriesPage] ✅ Backup invisible créé');
            return true;
        } catch (error) {
            console.warn('[CategoriesPage] ⚠️ Erreur backup invisible:', error);
            return false;
        }
    }

    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith('emailsortpro_categories_') && key.includes('_'))
                .sort()
                .reverse();
            
            if (keys.length > 5) {
                keys.slice(5).forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            // Ignore
        }
    }

    collectData(type) {
        const data = {
            version: '24.1-categories-user-gesture-fixed',
            timestamp: new Date().toISOString(),
            type: type,
            filesystem: {
                enabled: this.filesystemConfig.enabled,
                path: this.filesystemConfig.currentPath
            },
            categories: {},
            settings: {}
        };
        
        try {
            if (window.categoryManager) {
                data.categories = {
                    all: window.categoryManager.getCategories() || {},
                    custom: window.categoryManager.getCustomCategories ? 
                           window.categoryManager.getCustomCategories() : {},
                    activeCategories: window.categoryManager.getActiveCategories ? 
                                    window.categoryManager.getActiveCategories() : null
                };
            }
            
            data.settings = this.loadSettings();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur collecte données:', error);
            data.error = error.message;
        }
        
        return data;
    }

    // ================================================
    // INTERFACE UTILISATEUR SIMPLIFIÉE
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] ❌ Container manquant');
            return;
        }

        try {
            const categories = window.categoryManager?.getCategories() || {};
            
            container.innerHTML = `
                <div class="categories-page-container">
                    <!-- Header -->
                    <div class="page-header">
                        <div class="header-content">
                            <div class="header-info">
                                <h1><i class="fas fa-tags"></i> Gestion des Catégories</h1>
                                <p>Organisez vos catégories avec sauvegarde C://</p>
                            </div>
                            <button class="btn-create" onclick="window.categoriesPageV24.showCreateModal()">
                                <i class="fas fa-plus"></i> Nouvelle catégorie
                            </button>
                        </div>
                    </div>
                    
                    <!-- Onglets -->
                    <div class="tabs-container">
                        <div class="tabs-nav">
                            <button class="tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV24.switchTab('categories')">
                                <i class="fas fa-tags"></i> Catégories
                                <span class="count">${Object.keys(categories).length}</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'backup' ? 'active' : ''}" 
                                    onclick="window.categoriesPageV24.switchTab('backup')">
                                <i class="fas fa-hdd"></i> Sauvegarde C://
                                <span class="status ${this.filesystemConfig.enabled ? 'ok' : 'warning'}"></span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Contenu -->
                    <div class="tab-content">
                        <div id="categories-tab" class="tab-panel ${this.activeTab === 'categories' ? 'active' : ''}">
                            ${this.renderCategoriesTab(categories)}
                        </div>
                        
                        <div id="backup-tab" class="tab-panel ${this.activeTab === 'backup' ? 'active' : ''}">
                            ${this.renderBackupTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = '<div class="error">Erreur de chargement</div>';
        }
    }

    renderCategoriesTab(categories) {
        const filtered = this.filterCategories(categories);
        
        return `
            <!-- Recherche -->
            <div class="search-section">
                <div class="search-input">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Rechercher..." 
                           onkeyup="window.categoriesPageV24.handleSearch(this.value)">
                </div>
            </div>
            
            <!-- Grille catégories -->
            <div class="categories-grid" id="categories-container">
                ${this.renderCategories(filtered)}
            </div>
        `;
    }

    renderCategories(categories) {
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie</p>
                </div>
            `;
        }
        
        return Object.entries(categories)
            .map(([id, category]) => this.renderCategoryCard(id, category))
            .join('');
    }

    renderCategoryCard(id, category) {
        return `
            <div class="category-card" onclick="window.categoriesPageV24.openModal('${id}')">
                <div class="card-header">
                    <div class="category-icon" style="background: ${category.color};">
                        <i class="fas fa-tag"></i>
                    </div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-desc">${category.description || 'Catégorie personnalisée'}</div>
                    </div>
                </div>
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="window.categoriesPageV24.openModal('${id}')" 
                            title="Configurer">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderBackupTab() {
        const isConfigured = this.filesystemConfig.enabled;
        const currentPath = this.filesystemConfig.currentPath || 'Non configuré';
        const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
        
        return `
            <div class="backup-content">
                <!-- Status -->
                <div class="status-card ${isConfigured ? 'configured' : (authorizationGranted ? 'ready-to-create' : 'auto-ready')}">
                    <div class="status-header">
                        <div class="status-icon">
                            <i class="fas fa-${isConfigured ? 'check-circle' : (authorizationGranted ? 'play-circle' : 'magic')}"></i>
                        </div>
                        <div class="status-info">
                            <h3>${isConfigured ? 'Sauvegarde Configurée' : (authorizationGranted ? 'Prêt à Créer' : 'Auto-Création Disponible')}</h3>
                            <p class="path"><i class="fas fa-folder"></i> ${currentPath}</p>
                            ${!isConfigured && authorizationGranted ? '<p class="setup-hint">🎯 Cliquez pour créer maintenant votre dossier EmailSortPro!</p>' : ''}
                            ${!isConfigured && !authorizationGranted ? '<p class="setup-hint">✨ Le système créera automatiquement votre dossier après autorisation!</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        <button class="btn-action primary" onclick="window.categoriesPageV24.createBackup('manual')">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                        
                        ${this.fileSystemSupported ? `
                            <button class="btn-action ${isConfigured ? 'secondary' : (authorizationGranted ? 'success pulsing' : 'magic pulsing')}" 
                                    onclick="window.categoriesPageV24.configureDirectAccess()">
                                <i class="fas fa-${isConfigured ? 'folder' : (authorizationGranted ? 'play' : 'magic')}"></i> 
                                ${isConfigured ? 'Reconfigurer' : (authorizationGranted ? 'CRÉER MAINTENANT' : 'CRÉER AUTOMATIQUEMENT')}
                            </button>
                        ` : `
                            <p class="browser-notice">
                                <i class="fas fa-info-circle"></i>
                                Utilisez Chrome ou Edge pour l'accès aux fichiers
                            </p>
                        `}
                    </div>
                </div>
                
                ${isConfigured ? `
                    <!-- Actions -->
                    <div class="actions-card">
                        <h4><i class="fas fa-tools"></i> Actions</h4>
                        <div class="actions-grid">
                            <button class="action-item" onclick="window.categoriesPageV24.createBackup('manual')">
                                <i class="fas fa-save"></i>
                                <div>
                                    <div class="action-title">Backup Immédiat</div>
                                    <div class="action-desc">Créer maintenant</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.showPathInfo()">
                                <i class="fas fa-info"></i>
                                <div>
                                    <div class="action-title">Infos Dossier</div>
                                    <div class="action-desc">Voir emplacement</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.downloadBackup()">
                                <i class="fas fa-download"></i>
                                <div>
                                    <div class="action-title">Télécharger</div>
                                    <div class="action-desc">Fichier de sauvegarde</div>
                                </div>
                            </button>
                            
                            <button class="action-item" onclick="window.categoriesPageV24.testAccess()">
                                <i class="fas fa-vial"></i>
                                <div>
                                    <div class="action-title">Test Accès</div>
                                    <div class="action-desc">Vérifier permissions</div>
                                </div>
                            </button>
                        </div>
                    </div>
                ` : `
                    <!-- Guide -->
                    <div class="guide-card">
                        <h4><i class="fas fa-magic"></i> ${authorizationGranted ? 'Création en 1 Clic' : 'Création Automatique Ultra-Rapide'}</h4>
                        <div class="auto-setup-info">
                            ${authorizationGranted ? `
                                <div class="ready-highlight">
                                    🎯 <strong>PRÊT :</strong> Votre autorisation est enregistrée !<br>
                                    Cliquez maintenant pour créer votre dossier EmailSortPro.
                                </div>
                            ` : `
                                <div class="setup-highlight magic-highlight">
                                    ✨ <strong>AUTOMATIQUE:</strong> EmailSortPro se crée tout seul dans Documents !
                                </div>
                            `}
                            
                            <div class="magic-explanation">
                                <div class="magic-icon">${authorizationGranted ? '🎯' : '✨'}</div>
                                <div class="magic-text">
                                    <strong>${authorizationGranted ? 'Un seul clic suffit !' : 'Plus besoin de suivre d\'étapes !'}</strong><br>
                                    ${authorizationGranted ? 
                                        'Votre autorisation est déjà accordée. Cliquez sur "CRÉER MAINTENANT" et le dossier sera créé instantanément.' :
                                        'Cliquez simplement sur "CRÉER AUTOMATIQUEMENT" et le système fait tout pour vous.'
                                    }
                                </div>
                            </div>
                            
                            <div class="setup-benefits">
                                <h5>⚡ Processus ${authorizationGranted ? 'Immédiat' : 'Ultra-Rapide'}:</h5>
                                <ul>
                                    ${authorizationGranted ? `
                                        <li><strong>Autorisation accordée</strong> → Déjà fait !</li>
                                        <li><strong>1 clic</strong> → Création instantanée</li>
                                        <li><strong>Configuration automatique</strong> → Prêt immédiatement</li>
                                    ` : `
                                        <li><strong>1 clic</strong> → Autorisation unique</li>
                                        <li><strong>Sélection automatique</strong> → Dossier Documents</li>
                                        <li><strong>Création instantanée</strong> → EmailSortPro/Categories/</li>
                                    `}
                                    <li><strong>Backup immédiat</strong> → Première sauvegarde automatique</li>
                                </ul>
                            </div>
                            
                            <div class="path-example ${authorizationGranted ? 'ready-path' : 'magic-path'}">
                                ${authorizationGranted ? '🎯' : '✨'} Résultat: <code>Documents\\EmailSortPro\\Categories\\</code>
                            </div>
                        </div>
                        
                        <p class="note ${authorizationGranted ? 'ready-note' : 'magic-note'}">
                            <i class="fas fa-${authorizationGranted ? 'rocket' : 'magic'}"></i>
                            ${authorizationGranted ? 
                                'Création en 1 clic - Votre autorisation est déjà enregistrée !' :
                                'Le système détecte automatiquement votre dossier Documents et crée tout !'
                            }
                        </p>
                    </div>
                `}
                
                <!-- Info technique -->
                <div class="tech-info">
                    <details>
                        <summary><i class="fas fa-info-circle"></i> Informations Techniques</summary>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Support API:</strong>
                                <span class="${this.fileSystemSupported ? 'ok' : 'error'}">
                                    ${this.fileSystemSupported ? '✅ Supporté' : '❌ Non supporté'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Autorisation:</strong>
                                <span class="${authorizationGranted ? 'ok' : 'warning'}">
                                    ${authorizationGranted ? '✅ Accordée' : '⚠️ En attente'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Permissions:</strong>
                                <span class="${this.filesystemConfig.permissions === 'granted' ? 'ok' : 'warning'}">
                                    ${this.filesystemConfig.permissions === 'granted' ? '✅ Accordées' : 
                                      this.filesystemConfig.permissions === 'denied' ? '❌ Refusées' : '⚠️ En attente'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Auto-sauvegarde:</strong>
                                <span class="ok">✅ Activée (30s)</span>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS UTILISATEUR
    // ================================================
    switchTab(tabName) {
        this.activeTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName));
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

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
        container.innerHTML = this.renderCategories(this.filterCategories(categories));
    }

    showCreateModal() {
        this.showModal('Nouvelle Catégorie', `
            <div class="create-form">
                <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" id="category-name" placeholder="Ex: Projets, Factures..." autofocus>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="category-desc" placeholder="Description (optionnel)">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Couleur</label>
                        <select id="category-color">
                            <option value="#3B82F6">🔵 Bleu</option>
                            <option value="#10B981">🟢 Vert</option>
                            <option value="#F59E0B">🟡 Orange</option>
                            <option value="#EF4444">🔴 Rouge</option>
                            <option value="#8B5CF6">🟣 Violet</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Mots-clés de base</label>
                    <input type="text" id="category-keywords" placeholder="Séparés par des virgules">
                    <small>Ces mots-clés seront utilisés pour la détection automatique</small>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="window.categoriesPageV24.closeModal()">Annuler</button>
                <button class="btn-primary" onclick="window.categoriesPageV24.createCategory()">Créer</button>
            </div>
        `);
    }

    createCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        const desc = document.getElementById('category-desc')?.value?.trim();
        const color = document.getElementById('category-color')?.value || '#3B82F6';
        const keywords = document.getElementById('category-keywords')?.value?.trim();
        
        if (!name) {
            this.showToast('⚠️ Le nom est requis', 'warning');
            return;
        }
        
        const categoryData = {
            name,
            description: desc,
            color,
            priority: 30,
            isCustom: true,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        if (keywords) {
            const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
            categoryData.keywords.strong = keywordList;
        }
        
        try {
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal();
                this.showToast(`✅ Catégorie "${name}" créée!`, 'success');
                this.updateCategoriesDisplay();
                this.onCategoriesChanged('create');
            } else {
                this.showToast('❌ Erreur lors de la création', 'error');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création:', error);
            this.showToast('❌ Erreur: ' + error.message, 'error');
        }
    }

    openModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.showModal(`Configuration - ${category.name}`, `
            <div class="category-config">
                <div class="config-section">
                    <h4>Informations</h4>
                    <div class="info-display">
                        <div class="info-item">
                            <strong>Nom:</strong> ${category.name}
                        </div>
                        <div class="info-item">
                            <strong>Couleur:</strong>
                            <span class="color-box" style="background: ${category.color};"></span>
                            ${category.color}
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Actions</h4>
                    <div class="actions-row">
                        <button class="btn-secondary" onclick="window.categoriesPageV24.editCategory('${categoryId}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${category.isCustom ? `
                            <button class="btn-danger" onclick="window.categoriesPageV24.deleteCategory('${categoryId}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `);
    }

    editCategory(categoryId) {
        this.showToast('🔧 Modification - Fonctionnalité à venir', 'info');
        this.closeModal();
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Supprimer "${category.name}" ?\n\nCette action est irréversible.`)) {
            try {
                const success = window.categoryManager?.deleteCustomCategory(categoryId);
                
                if (success) {
                    this.closeModal();
                    this.showToast(`🗑️ "${category.name}" supprimée`, 'success');
                    this.updateCategoriesDisplay();
                    this.onCategoriesChanged('delete');
                } else {
                    this.showToast('❌ Erreur suppression', 'error');
                }
            } catch (error) {
                this.showToast('❌ Erreur: ' + error.message, 'error');
            }
        }
    }

    async showPathInfo() {
        const path = this.filesystemConfig.currentPath;
        
        this.showModal('Emplacement des Sauvegardes', `
            <div class="path-info">
                <div class="path-display">
                    <i class="fas fa-folder"></i>
                    <span class="path-text">${path}</span>
                    <button class="btn-copy" onclick="window.categoriesPageV24.copyPath('${path.replace(/\\/g, '\\\\')}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                
                <div class="path-details">
                    <h4>Fichiers créés :</h4>
                    <ul>
                        <li><strong>EmailSortPro-Categories.json</strong> - Sauvegarde principale</li>
                        <li><strong>EmailSortPro-Categories-[DATE].json</strong> - Sauvegardes horodatées</li>
                        <li><strong>README-EmailSortPro.txt</strong> - Documentation</li>
                    </ul>
                </div>
            </div>
        `);
    }

    async copyPath(path) {
        try {
            await navigator.clipboard.writeText(path);
            this.showToast('📋 Chemin copié!', 'success');
        } catch (error) {
            this.showToast('❌ Impossible de copier', 'error');
        }
    }

    async downloadBackup() {
        try {
            const data = this.collectData('download');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `EmailSortPro-Categories-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showToast('📥 Backup téléchargé!', 'success');
        } catch (error) {
            this.showToast('❌ Erreur téléchargement', 'error');
        }
    }

    async testAccess() {
        if (!this.filesystemConfig.directoryHandle) {
            this.showToast('❌ Aucun dossier configuré', 'error');
            return;
        }
        
        try {
            await this.testDirectoryAccess(this.filesystemConfig.directoryHandle);
            this.showToast('✅ Test d\'accès réussi!', 'success');
        } catch (error) {
            this.showToast('❌ Test échoué: ' + error.message, 'error');
        }
    }

    refreshInterface() {
        // Recharger l'interface si on est sur l'onglet backup
        if (this.activeTab === 'backup') {
            const container = document.querySelector('.categories-page-container').parentElement;
            if (container) this.render(container);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    showModal(title, content) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.categoriesPageV24.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
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
    }

    showToast(message, type = 'info') {
        console.log(`[CategoriesPage] ${type.toUpperCase()}: ${message}`);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type, 3000);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    destroy() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        console.log('[CategoriesPage] 🧹 Instance détruite');
    }

    // ================================================
    // STYLES COMPACTS AVEC NOUVEAUX ÉLÉMENTS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStylesV24')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStylesV24';
        styles.textContent = `
            .categories-page-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

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

            .header-content h1 {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .header-content p {
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

            .count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }

            .tab-btn.active .count {
                background: #dbeafe;
                color: #3B82F6;
            }

            .status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e5e7eb;
            }

            .status.ok {
                background: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }

            .status.warning {
                background: #f59e0b;
                box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
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

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
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
            }

            .category-card:hover {
                border-color: #3B82F6;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }

            .card-header {
                display: flex;
                align-items: center;
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
            }

            .category-info {
                flex: 1;
            }

            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .category-desc {
                font-size: 12px;
                color: #9ca3af;
            }

            .card-actions {
                display: flex;
                justify-content: flex-end;
            }

            .action-btn {
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

            .action-btn:hover {
                border-color: #9ca3af;
                transform: scale(1.05);
            }

            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                grid-column: 1 / -1;
            }

            .empty-state i {
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

            .backup-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .status-card {
                border-radius: 8px;
                padding: 24px;
                border: 2px solid #e2e8f0;
            }

            .status-card.configured {
                border-color: #10b981;
                background: #f0fdf4;
            }

            .status-card.ready-to-create {
                border-color: #06b6d4;
                background: #f0f9ff;
            }

            .status-card.auto-ready {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #f3e8ff, #faf5ff);
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

            .status-card.configured .status-icon {
                background: #10b981;
                color: white;
            }

            .status-card.ready-to-create .status-icon {
                background: #06b6d4;
                color: white;
            }

            .status-card.auto-ready .status-icon {
                background: #8b5cf6;
                color: white;
            }

            .status-info h3 {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .path {
                font-size: 12px;
                color: #6b7280;
                font-family: monospace;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .setup-hint {
                font-size: 13px;
                color: #6b7280;
                margin: 4px 0 0 0;
                font-style: italic;
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

            .btn-action.success {
                background: #10b981;
                color: white;
            }

            .btn-action.success:hover {
                background: #059669;
            }

            .btn-action.magic {
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                color: white;
                font-weight: 600;
                position: relative;
                overflow: hidden;
            }

            .btn-action.magic::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                transform: rotate(45deg);
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }

            .btn-action.pulsing {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }

            .browser-notice {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .actions-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .actions-card h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .action-item {
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

            .action-item:hover {
                border-color: #3B82F6;
                background: #f0f9ff;
            }

            .action-item i {
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

            .guide-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .guide-card h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .auto-setup-info {
                margin: 16px 0;
            }

            .setup-highlight {
                background: linear-gradient(135deg, #3B82F6, #10B981);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                font-weight: 600;
                text-align: center;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            }

            .magic-highlight {
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-weight: 600;
                text-align: center;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                position: relative;
                overflow: hidden;
            }

            .magic-highlight::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: magicSweep 3s infinite;
            }

            @keyframes magicSweep {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            .ready-highlight {
                background: linear-gradient(135deg, #06b6d4, #10b981);
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-weight: 600;
                text-align: center;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
            }

            .magic-explanation {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 16px;
                background: #faf5ff;
                border: 2px solid #e9d5ff;
                border-radius: 8px;
                margin: 16px 0;
            }

            .magic-icon {
                font-size: 32px;
                flex-shrink: 0;
            }

            .magic-text {
                flex: 1;
                font-size: 14px;
                line-height: 1.5;
                color: #374151;
            }

            .magic-text strong {
                color: #8b5cf6;
            }

            .setup-benefits {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 12px;
                margin-top: 12px;
            }

            .setup-benefits h5 {
                font-size: 13px;
                font-weight: 600;
                color: #166534;
                margin: 0 0 8px 0;
            }

            .setup-benefits ul {
                margin: 0;
                padding-left: 16px;
                color: #166534;
            }

            .path-example {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                padding: 8px 12px;
                margin-top: 12px;
                font-family: monospace;
                font-size: 12px;
                color: #374151;
            }

            .magic-path {
                background: linear-gradient(135deg, #f3e8ff, #faf5ff);
                border: 2px solid #e9d5ff;
                padding: 12px 16px;
                border-radius: 6px;
                margin-top: 12px;
                font-family: monospace;
                font-size: 13px;
                color: #8b5cf6;
                font-weight: 600;
                text-align: center;
            }

            .ready-path {
                background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
                border: 2px solid #bae6fd;
                padding: 12px 16px;
                border-radius: 6px;
                margin-top: 12px;
                font-family: monospace;
                font-size: 13px;
                color: #06b6d4;
                font-weight: 600;
                text-align: center;
            }

            .note {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin: 0;
                font-size: 13px;
                color: #0369a1;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .magic-note {
                background: linear-gradient(135deg, #f0f9ff, #f8fafc);
                border: 1px solid #bae6fd;
                color: #0369a1;
            }

            .magic-note i {
                color: #8b5cf6;
            }

            .ready-note {
                background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
                border: 1px solid #bae6fd;
                color: #0369a1;
            }

            .ready-note i {
                color: #06b6d4;
            }

            .tech-info {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
            }

            .tech-info summary {
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-top: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: #f8fafc;
                border-radius: 4px;
                font-size: 13px;
            }

            .ok { color: #10b981; }
            .error { color: #ef4444; }
            .warning { color: #f59e0b; }

            /* Modaux d'autorisation et de création */
            .authorization-modal-overlay,
            .creation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .authorization-modal-overlay.visible,
            .creation-modal-overlay.visible {
                opacity: 1;
            }

            .authorization-modal-overlay.closing,
            .creation-modal-overlay.closing {
                opacity: 0;
            }

            .authorization-modal,
            .creation-modal {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .authorization-modal-overlay.visible .authorization-modal,
            .creation-modal-overlay.visible .creation-modal {
                transform: scale(1);
            }

            .auth-modal-header,
            .creation-header {
                padding: 24px;
                text-align: center;
                background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                color: white;
            }

            .auth-icon,
            .creation-icon {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 24px;
            }

            .auth-modal-header h2,
            .creation-header h2 {
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 8px 0;
            }

            .auth-subtitle,
            .creation-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin: 0;
            }

            .auth-modal-body,
            .creation-body {
                padding: 24px;
                overflow-y: auto;
                max-height: 60vh;
            }

            .auth-explanation {
                margin-bottom: 20px;
            }

            .auth-feature {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .feature-icon {
                width: 36px;
                height: 36px;
                background: #3B82F6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                flex-shrink: 0;
            }

            .feature-text {
                flex: 1;
            }

            .feature-text strong {
                display: block;
                font-size: 14px;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .feature-text span {
                font-size: 13px;
                color: #6b7280;
            }

            .auth-path-preview {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
            }

            .path-label {
                font-size: 12px;
                color: #374151;
                font-weight: 500;
                margin-bottom: 8px;
            }

            .path-value {
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: monospace;
                font-size: 13px;
                color: #0369a1;
                font-weight: 600;
            }

            .auth-promise {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #166534;
                margin-top: 20px;
            }

            .auth-modal-actions,
            .creation-actions {
                padding: 20px 24px;
                border-top: 1px solid #e2e8f0;
                background: #f8fafc;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .auth-btn,
            .creation-btn {
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.15s ease;
                border: none;
            }

            .auth-btn.secondary,
            .creation-btn.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .auth-btn.secondary:hover,
            .creation-btn.secondary:hover {
                background: #e5e7eb;
            }

            .auth-btn.primary,
            .creation-btn.primary {
                background: #3B82F6;
                color: white;
            }

            .auth-btn.primary:hover,
            .creation-btn.primary:hover {
                background: #2563EB;
            }

            .creation-btn.magic-btn {
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                color: white;
                font-weight: 600;
                position: relative;
                overflow: hidden;
            }

            .creation-btn.magic-btn::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                transform: rotate(45deg);
                animation: shimmer 2s infinite;
            }

            .creation-info {
                text-align: center;
            }

            .info-highlight {
                background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
                border: 2px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #0369a1;
                font-weight: 500;
            }

            .info-highlight code {
                background: rgba(6, 182, 212, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
            }

            .creation-steps {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin: 20px 0;
            }

            .step-preview {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                font-size: 13px;
                color: #374151;
            }

            .step-preview i {
                color: #3B82F6;
                width: 16px;
                text-align: center;
            }

            .important-note {
                background: #fffbeb;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                padding: 16px;
                margin-top: 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }

            .important-note i {
                color: #f59e0b;
                margin-top: 2px;
                flex-shrink: 0;
            }

            /* Modal général */
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
            }

            .modal-content {
                background: white;
                border-radius: 8px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
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

            .modal-actions {
                padding: 16px 20px;
                border-top: 1px solid #e2e8f0;
                background: #f8fafc;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .btn-primary {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .btn-danger {
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }

            .create-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .form-group label {
                font-size: 13px;
                font-weight: 500;
                color: #374151;
            }

            .form-group input,
            .form-group select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
            }

            .form-group small {
                font-size: 11px;
                color: #6b7280;
                margin-top: 2px;
            }

            .category-config {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .config-section {
                padding-bottom: 16px;
                border-bottom: 1px solid #f1f5f9;
            }

            .config-section:last-child {
                border-bottom: none;
            }

            .config-section h4 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 12px 0;
            }

            .info-display {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .color-box {
                width: 16px;
                height: 16px;
                border-radius: 2px;
                border: 1px solid #e5e7eb;
            }

            .actions-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .path-info {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .path-display {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .path-text {
                flex: 1;
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
            }

            .btn-copy {
                background: #3B82F6;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }

            .path-details h4 {
                font-size: 14px;
                margin: 0 0 8px 0;
            }

            .path-details ul {
                margin: 0;
                padding-left: 20px;
            }

            .error {
                text-align: center;
                padding: 40px;
                color: #ef4444;
                font-size: 16px;
            }

            /* Notification de configuration backup */
            .backup-config-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 2px solid #3B82F6;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                max-width: 400px;
                z-index: 2000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }

            .backup-config-notification.visible {
                opacity: 1;
                transform: translateX(0);
            }

            .backup-config-notification.closing {
                opacity: 0;
                transform: translateX(100%);
            }

            .notification-content {
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .notification-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                flex-shrink: 0;
            }

            .notification-text {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .notification-text strong {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }

            .notification-text span {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }

            .notification-actions {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #f1f5f9;
            }

            .notification-btn {
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.15s ease;
                justify-content: center;
            }

            .notification-btn.primary {
                background: #3B82F6;
                color: white;
            }

            .notification-btn.primary:hover {
                background: #2563EB;
            }

            .notification-btn.secondary {
                background: #f3f4f6;
                color: #6b7280;
                border: 1px solid #e5e7eb;
            }

            .notification-btn.secondary:hover {
                background: #e5e7eb;
                color: #374151;
            }

            @media (max-width: 768px) {
                .categories-page-container {
                    padding: 12px;
                }

                .header-content {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .status-actions {
                    flex-direction: column;
                }

                .actions-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================

// Nettoyer l'ancienne instance
if (window.categoriesPageV23) {
    try {
        if (window.categoriesPageV23.destroy) {
            window.categoriesPageV23.destroy();
        }
        delete window.categoriesPageV23;
    } catch (error) {
        // Ignore
    }
}

// Créer la nouvelle instance
window.categoriesPageV24 = new CategoriesPageV24();

// Alias pour compatibilité
window.categoriesPage = window.categoriesPageV24;

// Intégration avec PageManager
if (window.pageManager && window.pageManager.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPageV24.render(container);
    };
    
    window.pageManager.pages.categories = (container) => {
        window.categoriesPageV24.render(container);
    };
}

// API publique pour tests
window.testCategoriesBackup = async function() {
    console.log('[TEST] 🧪 Test backup catégories...');
    
    const instance = window.categoriesPageV24;
    
    try {
        const success = await instance.createBackup('test');
        
        if (success) {
            console.log('[TEST] ✅ Backup test réussi');
            console.log('[TEST] 📁 Configuré:', instance.filesystemConfig.enabled);
            console.log('[TEST] 📂 Chemin:', instance.filesystemConfig.currentPath);
            return { success: true, configured: instance.filesystemConfig.enabled };
        } else {
            console.log('[TEST] ❌ Backup test échoué');
            return { success: false, error: 'Backup failed' };
        }
    } catch (error) {
        console.error('[TEST] ❌ Erreur test:', error);
        return { success: false, error: error.message };
    }
};

window.getCategoriesBackupInfo = function() {
    const instance = window.categoriesPageV24;
    
    return {
        configured: instance.filesystemConfig.enabled,
        path: instance.filesystemConfig.currentPath,
        permissions: instance.filesystemConfig.permissions,
        autoSave: instance.filesystemConfig.autoSave,
        fileSystemSupported: instance.fileSystemSupported,
        authorizationGranted: localStorage.getItem('emailsortpro_filesystem_authorized') === 'true'
    };
};

window.forceConfigureBackup = async function() {
    console.log('[API] 🔧 Configuration forcée backup...');
    
    try {
        const success = await window.categoriesPageV24.configureDirectAccess();
        return { success, info: window.getCategoriesBackupInfo() };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// API pour forcer le déclenchement manuel du modal d'autorisation
window.triggerAuthorizationModal = function() {
    console.log('[API] 🎨 Déclenchement manuel du modal d\'autorisation...');
    
    try {
        if (window.categoriesPageV24 && window.categoriesPageV24.showAuthorizationModal) {
            window.categoriesPageV24.showAuthorizationModal();
            console.log('[API] ✅ Modal d\'autorisation affiché manuellement');
            return { success: true };
        } else {
            console.error('[API] ❌ CategoriesPage non disponible');
            return { success: false, error: 'CategoriesPage not available' };
        }
    } catch (error) {
        console.error('[API] ❌ Erreur déclenchement manuel:', error);
        return { success: false, error: error.message };
    }
};

// API pour vérifier l'état d'autorisation (AMÉLIORÉE AVEC DÉTECTION NAVIGATION PRIVÉE)
window.checkAuthorizationStatus = function() {
    const hasConnected = localStorage.getItem('emailsortpro_has_connected');
    const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
    const authDate = localStorage.getItem('emailsortpro_authorization_date');
    const firstConnectionDate = localStorage.getItem('emailsortpro_first_connection_date');
    
    // Détection rapide de navigation privée
    let isLikelyPrivate = false;
    try {
        // Test rapide localStorage quota
        const testKey = '__private_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        // Si on arrive ici, pas d'erreur visible, mais on peut tester d'autres indices
        isLikelyPrivate = (
            !hasConnected && // Pas de trace de connexion précédente
            navigator.webdriver === undefined && // Pas en mode test
            !window.chrome?.app // Pas d'extension Chrome visible
        );
    } catch (e) {
        isLikelyPrivate = true; // Erreur localStorage = probablement privé
    }
    
    const status = {
        hasConnectedBefore: !!hasConnected,
        authorizationGranted: !!authorizationGranted,
        isFirstTime: !hasConnected && !authorizationGranted,
        isLikelyPrivateBrowsing: isLikelyPrivate,
        shouldShowModal: isLikelyPrivate || (!hasConnected && !authorizationGranted),
        authorizationDate: authDate,
        firstConnectionDate: firstConnectionDate,
        categoriesPageReady: !!(window.categoriesPageV24 && window.categoriesPageV24.showAuthorizationModal)
    };
    
    console.log('[API] 📊 Statut autorisation:', status);
    return status;
};

// API pour forcer le mode "première connexion" (pour tests en navigation privée)
window.forceFirstTimeMode = function() {
    console.log('[API] 🔄 Forçage mode première connexion...');
    
    // Effacer les marqueurs de connexion
    localStorage.removeItem('emailsortpro_has_connected');
    localStorage.removeItem('emailsortpro_filesystem_authorized');
    localStorage.removeItem('emailsortpro_authorization_date');
    localStorage.removeItem('emailsortpro_first_connection_date');
    localStorage.removeItem('emailsortpro_backup_notification_shown');
    
    console.log('[API] ✅ Mode première connexion activé - Rechargez la page');
    
    return {
        success: true,
        message: 'Mode première connexion activé - Rechargez la page pour tester'
    };
};

// API pour déclencher immédiatement l'autorisation (avec override de détection)
window.forceShowAuthModal = function() {
    console.log('[API] 🎨 Forçage immédiat du modal d\'autorisation...');
    
    try {
        if (window.categoriesPageV24 && window.categoriesPageV24.showAuthorizationModal) {
            // Forcer le mode première connexion temporairement
            const originalHasConnected = localStorage.getItem('emailsortpro_has_connected');
            const originalAuth = localStorage.getItem('emailsortpro_filesystem_authorized');
            
            // Temporairement effacer pour forcer l'affichage
            localStorage.removeItem('emailsortpro_has_connected');
            localStorage.removeItem('emailsortpro_filesystem_authorized');
            
            window.categoriesPageV24.showAuthorizationModal();
            
            // Restaurer les valeurs après 1 seconde (si elles existaient)
            setTimeout(() => {
                if (originalHasConnected) localStorage.setItem('emailsortpro_has_connected', originalHasConnected);
                if (originalAuth) localStorage.setItem('emailsortpro_filesystem_authorized', originalAuth);
            }, 1000);
            
            console.log('[API] ✅ Modal d\'autorisation forcé');
            return { success: true };
        } else {
            console.error('[API] ❌ CategoriesPage non disponible');
            return { success: false, error: 'CategoriesPage not available' };
        }
    } catch (error) {
        console.error('[API] ❌ Erreur forçage modal:', error);
        return { success: false, error: error.message };
    }
};

// Script d'intégration pour la première connexion (CORRIGÉ AVEC DÉTECTION NAVIGATION PRIVÉE)
window.setupFirstTimeAuth = function() {
    console.log('[SETUP] 🎯 Configuration autorisation première connexion...');
    
    // Fonction pour détecter la navigation privée
    const detectPrivateBrowsing = () => {
        return new Promise((resolve) => {
            // Méthode 1: Test du quota localStorage (Safari)
            try {
                localStorage.setItem('__private_test__', '1');
                localStorage.removeItem('__private_test__');
                
                // Méthode 2: Test de requestFileSystem (Chrome/Edge)
                if (window.webkitRequestFileSystem) {
                    webkitRequestFileSystem(
                        window.TEMPORARY, 
                        1,
                        () => resolve(false), // Navigation normale
                        () => resolve(true)   // Navigation privée
                    );
                } else if (window.indexedDB) {
                    // Méthode 3: Test IndexedDB (Firefox)
                    const testName = '__private_test_db__';
                    const openReq = indexedDB.open(testName);
                    openReq.onsuccess = () => {
                        indexedDB.deleteDatabase(testName);
                        resolve(false); // Navigation normale
                    };
                    openReq.onerror = () => resolve(true); // Navigation privée
                } else {
                    resolve(false); // Pas de détection possible
                }
            } catch (e) {
                resolve(true); // Probablement navigation privée
            }
        });
    };
    
    // Attendre que l'application soit complètement chargée
    const checkAndSetup = async () => {
        // Détecter la navigation privée
        const isPrivateBrowsing = await detectPrivateBrowsing();
        console.log(`[SETUP] 🔍 Navigation privée détectée: ${isPrivateBrowsing}`);
        
        // Vérifier si c'est vraiment la première connexion
        const hasConnectedBefore = localStorage.getItem('emailsortpro_has_connected');
        const authorizationGranted = localStorage.getItem('emailsortpro_filesystem_authorized');
        
        // En navigation privée, on considère toujours comme première connexion
        // OU si les marqueurs normaux indiquent une première connexion
        const isFirstTime = isPrivateBrowsing || (!hasConnectedBefore && !authorizationGranted);
        
        if (isFirstTime) {
            console.log('[SETUP] 🆕 Première connexion détectée (ou navigation privée) - Déclenchement automatique...');
            
            // Marquer que l'utilisateur s'est connecté (même en navigation privée)
            localStorage.setItem('emailsortpro_has_connected', 'true');
            localStorage.setItem('emailsortpro_first_connection_date', new Date().toISOString());
            
            if (isPrivateBrowsing) {
                console.log('[SETUP] 🔒 Mode navigation privée - Modal automatique');
            }
            
            // DÉCLENCHER automatiquement le modal d'autorisation après un délai
            setTimeout(async () => {
                try {
                    console.log('[SETUP] 🎨 Déclenchement automatique du modal d\'autorisation...');
                    
                    // Vérifier que CategoriesPage est prêt
                    if (window.categoriesPageV24 && window.categoriesPageV24.showAuthorizationModal) {
                        await window.categoriesPageV24.showAuthorizationModal();
                        console.log('[SETUP] ✅ Modal d\'autorisation affiché automatiquement');
                    } else {
                        console.warn('[SETUP] ⚠️ CategoriesPage pas encore prêt - Nouvelle tentative...');
                        
                        // Deuxième tentative après 2 secondes supplémentaires
                        setTimeout(async () => {
                            if (window.categoriesPageV24 && window.categoriesPageV24.showAuthorizationModal) {
                                await window.categoriesPageV24.showAuthorizationModal();
                                console.log('[SETUP] ✅ Modal d\'autorisation affiché (2ème tentative)');
                            } else {
                                console.warn('[SETUP] ⚠️ Impossible d\'afficher le modal - Disponible manuellement');
                            }
                        }, 2000);
                    }
                } catch (error) {
                    console.error('[SETUP] ❌ Erreur déclenchement modal:', error);
                }
            }, 3000); // 3 secondes après l'activation de l'app
            
        } else {
            console.log('[SETUP] ✅ Utilisateur existant en navigation normale - Pas d\'autorisation automatique requise');
        }
    };
    
    // Si l'app est déjà active, vérifier immédiatement
    if (document.body.classList.contains('app-active')) {
        checkAndSetup();
    } else {
        // Sinon, attendre que l'app devienne active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    document.body.classList.contains('app-active')) {
                    observer.disconnect();
                    checkAndSetup();
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
};

// Démarrer le setup automatiquement
setTimeout(() => {
    window.setupFirstTimeAuth();
}, 1000);

console.log('[CategoriesPage] ✅ CategoriesPage v24.1 chargée - NAVIGATION PRIVÉE DÉTECTÉE !');
console.log('[CategoriesPage] 🎯 Fonctionnalités principales:');
console.log('[CategoriesPage]   • 🔧 CORRIGÉ: User Gesture pour File Picker API');
console.log('[CategoriesPage]   • 🔒 NOUVEAU: Détection automatique navigation privée');
console.log('[CategoriesPage]   • 🎨 Modal d\'autorisation esthétique AUTO-DÉCLENCHEMENT');
console.log('[CategoriesPage]   • 🔔 Notification discrète de configuration backup');
console.log('[CategoriesPage]   • 🎯 Modal de création directe après autorisation');
console.log('[CategoriesPage]   • ✨ Autorisation unique - Ne se reproduit jamais');
console.log('[CategoriesPage]   • 📁 Création automatique dans Documents après clic utilisateur');
console.log('[CategoriesPage]   • 🔒 Persistance de l\'autorisation');
console.log('[CategoriesPage]   • 💾 Sauvegarde automatique toutes les 30s');
console.log('[CategoriesPage]   • 📦 Backup invisible en parallèle (localStorage)');
console.log('[CategoriesPage]   • 🧪 API de test et diagnostic complète');
console.log('[CategoriesPage] 📁 API disponible:');
console.log('[CategoriesPage]   • window.testCategoriesBackup() - Tester');
console.log('[CategoriesPage]   • window.getCategoriesBackupInfo() - Infos');
console.log('[CategoriesPage]   • window.forceConfigureBackup() - Configurer');
console.log('[CategoriesPage]   • window.triggerAuthorizationModal() - Déclencher modal');
console.log('[CategoriesPage]   • window.checkAuthorizationStatus() - Vérifier statut (avec détection privée)');
console.log('[CategoriesPage]   • window.forceFirstTimeMode() - Forcer mode première fois');
console.log('[CategoriesPage]   • window.forceShowAuthModal() - Forcer modal (override)');
console.log('[CategoriesPage] ⚡ Auto-déclenchement en navigation privée + API de debug complète !');
