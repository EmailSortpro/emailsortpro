// backup.js - Version CORRIGÉE avec vrai stockage physique et réduction des logs
// Cette version force vraiment la création de fichiers et réduit le spam

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
            
            // Configuration avec backup physique par défaut et intervals plus longs
            this.config = {
                enabled: true,
                intervals: {
                    auto: 300000,       // 5 minutes (au lieu de 30 sec)
                    cloud: 1800000,     // 30 minutes  
                    daily: 86400000,    // 24 heures
                    onChange: 30000     // 30 secondes après changement (au lieu de 5)
                },
                maxBackups: {
                    local: 5,           // Réduire le nombre de backups
                    cloud: 20
                },
                silentMode: true,
                autoDetect: true,
                
                // Configuration pour forcer les fichiers physiques
                physicalBackupEnabled: true,    // ACTIVÉ par défaut
                documentsSetupNeeded: false,     // Pas de setup nécessaire
                showSetupPrompt: true           // Montrer le prompt de configuration
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.documentsHandle = null;
            this.lastChangeTime = 0;
            
            this.init();
        }

        // ================================================
        // INITIALISATION AVEC SETUP PHYSIQUE FORCÉ
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation avec stockage physique forcé...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                
                // FORCER l'setup du stockage physique immédiatement
                await this.autoSetupPhysicalStorage();
                
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service prêt - Provider: ${this.provider}, Stockage: ${this.getStorageLocation()}`);
                
                // Intégration à la page paramètres
                this.integrateToSettingsPage();
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

        // ================================================
        // NOUVEAU: AUTO-SETUP DU STOCKAGE PHYSIQUE
        // ================================================
        async autoSetupPhysicalStorage() {
            console.log('[Backup] 🔧 Configuration automatique du stockage physique...');
            
            // Vérifier si File System Access API est disponible
            if (!window.showDirectoryPicker) {
                console.log('[Backup] ❌ File System Access API non disponible - Mode téléchargement activé');
                this.config.physicalBackupEnabled = true;
                this.config.storage = 'download';
                this.saveConfig();
                return false;
            }
            
            // Vérifier si on a déjà un handle
            if (this.documentsHandle) {
                console.log('[Backup] ✅ Dossier physique déjà configuré');
                return true;
            }
            
            // Essayer de configurer automatiquement après un délai
            setTimeout(() => {
                this.promptForPhysicalSetup();
            }, 3000);
            
            return true;
        }

        async promptForPhysicalSetup() {
            if (this.documentsHandle) return; // Déjà configuré
            
            const userChoice = confirm(
                '📁 Configuration du stockage de sauvegarde\n\n' +
                '✅ AVANTAGES du stockage physique :\n' +
                '• Sauvegardes permanentes sur votre disque\n' +
                '• Accessible même hors ligne\n' +
                '• Sauvegarde automatique dans un dossier\n\n' +
                '📂 DOSSIERS RECOMMANDÉS :\n' +
                '• Documents (recommandé)\n' +
                '• Bureau\n' +
                '• Téléchargements\n\n' +
                'Voulez-vous configurer un dossier maintenant ?\n' +
                '(Cliquez Annuler pour utiliser les téléchargements automatiques)'
            );
            
            if (userChoice) {
                await this.setupPhysicalBackup();
            } else {
                // Activer le mode téléchargement
                this.config.storage = 'download';
                this.config.physicalBackupEnabled = true;
                this.saveConfig();
                this.showNotification('📥 Mode téléchargement automatique activé', 'info');
                console.log('[Backup] Mode téléchargement automatique activé');
            }
        }

        getStorageLocation() {
            if (this.documentsHandle) {
                return `Dossier: ${this.config.folderPath || 'Dossier sélectionné'}`;
            } else if (this.config.storage === 'download') {
                return 'Téléchargements automatiques';
            } else {
                return 'Navigateur (localStorage)';
            }
        }

        // ================================================
        // INTÉGRATION À LA PAGE PARAMÈTRES
        // ================================================
        integrateToSettingsPage() {
            setTimeout(() => {
                this.addBackupSectionToSettings();
            }, 2000);
        }

        addBackupSectionToSettings() {
            const settingsContainer = document.querySelector('#settings-page, .settings-container, .page-content[data-page="settings"], .settings-section');
            
            if (!settingsContainer) {
                console.log('[Backup] Page paramètres non trouvée');
                return;
            }

            if (settingsContainer.querySelector('#backup-settings-section')) {
                console.log('[Backup] Section backup déjà présente');
                return;
            }

            const backupSection = this.createBackupSettingsSection();
            settingsContainer.appendChild(backupSection);
            
            console.log('[Backup] ✅ Section backup ajoutée à la page paramètres');
        }

        createBackupSettingsSection() {
            const section = document.createElement('div');
            section.id = 'backup-settings-section';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3 class="settings-section-title">
                    <i class="fas fa-save"></i> Sauvegarde automatique
                </h3>
                <div class="settings-content">
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="backup-enabled" ${this.config.enabled ? 'checked' : ''}>
                            Activer la sauvegarde automatique
                        </label>
                        <p class="setting-description">
                            Sauvegarde automatique de vos catégories, tâches et paramètres
                        </p>
                    </div>
                    
                    <div class="setting-item">
                        <label>Mode de sauvegarde actuel :</label>
                        <div id="backup-mode-info" class="backup-status">
                            ${this.getBackupModeDisplay()}
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <button id="setup-folder-btn" class="btn btn-secondary">
                            <i class="fas fa-folder"></i> ${this.documentsHandle ? 'Changer de dossier' : 'Configurer dossier physique'}
                        </button>
                        <p class="setting-description">
                            Sauvegarder dans un dossier de votre choix (Documents, Bureau, etc.)
                        </p>
                    </div>
                    
                    <div class="setting-item">
                        <button id="download-mode-btn" class="btn btn-info">
                            <i class="fas fa-download"></i> Mode téléchargement automatique
                        </button>
                        <p class="setting-description">
                            Les sauvegardes seront téléchargées automatiquement
                        </p>
                    </div>
                    
                    <div class="setting-item">
                        <button id="manual-backup-btn" class="btn btn-primary">
                            <i class="fas fa-save"></i> Créer une sauvegarde maintenant
                        </button>
                        <span id="backup-status" class="backup-status-text">
                            Dernière sauvegarde : ${this.getLastBackupTime()}
                        </span>
                    </div>
                    
                    <div class="setting-item">
                        <details>
                            <summary>Informations détaillées</summary>
                            <div id="backup-info-content">
                                ${this.getDetailedInfo()}
                            </div>
                        </details>
                    </div>
                </div>
            `;

            this.attachBackupEvents(section);
            return section;
        }

        attachBackupEvents(section) {
            // Activation/désactivation
            const enabledCheckbox = section.querySelector('#backup-enabled');
            enabledCheckbox?.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enable();
                } else {
                    this.disable();
                }
                this.updateBackupUI();
            });

            // Configuration du dossier
            const setupBtn = section.querySelector('#setup-folder-btn');
            setupBtn?.addEventListener('click', async () => {
                setupBtn.disabled = true;
                setupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';
                
                await this.setupPhysicalBackup();
                
                setupBtn.disabled = false;
                setupBtn.innerHTML = `<i class="fas fa-folder"></i> ${this.documentsHandle ? 'Changer de dossier' : 'Configurer dossier physique'}`;
                this.updateBackupUI();
            });

            // Mode téléchargement
            const downloadBtn = section.querySelector('#download-mode-btn');
            downloadBtn?.addEventListener('click', () => {
                this.config.storage = 'download';
                this.config.physicalBackupEnabled = true;
                this.saveConfig();
                this.updateBackupUI();
                this.showNotification('📥 Mode téléchargement automatique activé!', 'success');
            });

            // Backup manuel
            const manualBtn = section.querySelector('#manual-backup-btn');
            manualBtn?.addEventListener('click', async () => {
                manualBtn.disabled = true;
                manualBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
                
                await this.manualBackup();
                
                manualBtn.disabled = false;
                manualBtn.innerHTML = '<i class="fas fa-save"></i> Créer une sauvegarde maintenant';
                this.updateBackupUI();
            });
        }

        updateBackupUI() {
            const section = document.querySelector('#backup-settings-section');
            if (!section) return;

            const modeInfo = section.querySelector('#backup-mode-info');
            if (modeInfo) {
                modeInfo.innerHTML = this.getBackupModeDisplay();
            }

            const statusText = section.querySelector('#backup-status');
            if (statusText) {
                statusText.textContent = `Dernière sauvegarde : ${this.getLastBackupTime()}`;
            }

            const detailsContent = section.querySelector('#backup-info-content');
            if (detailsContent) {
                detailsContent.innerHTML = this.getDetailedInfo();
            }
        }

        getBackupModeDisplay() {
            if (this.documentsHandle) {
                return `<span class="status-active"><i class="fas fa-folder"></i> Dossier physique: ${this.config.folderPath || 'Dossier sélectionné'}</span>`;
            } else if (this.config.storage === 'download') {
                return `<span class="status-download"><i class="fas fa-download"></i> Téléchargement automatique</span>`;
            } else {
                return `<span class="status-browser"><i class="fas fa-browser"></i> Navigateur (localStorage)</span>`;
            }
        }

        getLastBackupTime() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        getDetailedInfo() {
            const status = this.getStatus();
            return `
                <div class="backup-details">
                    <p><strong>Stockage:</strong> ${this.getStorageLocation()}</p>
                    <p><strong>Provider:</strong> ${status.provider}</p>
                    <p><strong>Files en attente:</strong> ${status.queueSize}</p>
                    <p><strong>En cours:</strong> ${status.processing ? 'Oui' : 'Non'}</p>
                    <p><strong>Fréquence:</strong> Toutes les 5 minutes + à chaque changement</p>
                </div>
            `;
        }

        // ================================================
        // SETUP PHYSIQUE AMÉLIORÉ
        // ================================================
        async setupPhysicalBackup() {
            console.log('[Backup] 🔧 Setup du backup physique...');
            
            if (!window.showDirectoryPicker) {
                this.showNotification(
                    'Votre navigateur ne supporte pas cette fonctionnalité.\nPassage en mode téléchargement automatique.',
                    'warning'
                );
                this.config.storage = 'download';
                this.config.physicalBackupEnabled = true;
                this.saveConfig();
                return false;
            }
            
            try {
                const success = await this.requestDocumentsAccess();
                
                if (success && this.documentsHandle) {
                    this.config.physicalBackupEnabled = true;
                    this.config.storage = 'folder';
                    this.saveConfig();
                    
                    // Test immédiat
                    await this.testBackupAccess();
                    
                    // Backup immédiat
                    await this.performBackup('setup');
                    
                    this.showNotification(
                        `Dossier configuré avec succès!\nEmplacement: ${this.config.folderPath}`,
                        'success'
                    );
                    
                    return true;
                } else {
                    throw new Error('Configuration annulée');
                }
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur setup:', error);
                
                if (error.name === 'AbortError') {
                    this.showNotification('Configuration annulée', 'info');
                } else {
                    this.showNotification(
                        'Erreur lors de la configuration.\nPassage en mode téléchargement automatique.',
                        'warning'
                    );
                    this.config.storage = 'download';
                    this.config.physicalBackupEnabled = true;
                    this.saveConfig();
                }
                
                return false;
            }
        }

        async requestDocumentsAccess() {
            console.log('[Backup] 🔓 Demande d\'accès au dossier...');
            
            const pickerOptions = {
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-backup-v5'
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
                
                if (this.documentsHandle) {
                    await this.storeInPhysicalFolder(testData, new Date().toISOString(), 'test');
                } else {
                    this.downloadBackup(testData, new Date().toISOString());
                }
                
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
                console.error('[Backup] ❌ Erreur stockage physique:', error);
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

        downloadBackup(data, timestamp) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            
            a.href = url;
            a.download = `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`[Backup] 📥 Fichier téléchargé: ${a.download}`);
        }

        // ================================================
        // SURVEILLANCE DES DONNÉES (RÉDUITE)
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
            }, 30000); // Réduire la fréquence de vérification
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
            
            // Réduire les logs de changement
            const now = Date.now();
            if (now - this.lastChangeTime < 10000) { // Moins de 10 secondes
                return; // Ignorer les changements trop rapprochés
            }
            this.lastChangeTime = now;
            
            // Log moins verbose
            if (Math.random() < 0.1) { // Seulement 10% des changements loggés
                console.log(`[Backup] 📝 Changement détecté: ${source}.${key}`);
            }
            
            this.scheduleChangeBackup();
        }

        shouldIgnoreChange(key) {
            if (typeof key !== 'string') return false;
            
            const ignored = [
                'emailsortpro_backup_',
                'temp_', 'cache_', 'session_',
                'lastActivity', 'currentView', 'scrollPosition',
                'msal.', 'server-telemetry'
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
                    await this.sleep(200);
                }
            } catch (error) {
                console.error('[Backup] Erreur traitement queue:', error);
            } finally {
                this.isProcessingQueue = false;
            }
        }

        async executeBackup(backup) {
            try {
                // Log moins verbose
                if (backup.type === 'manual' || Math.random() < 0.2) {
                    console.log(`[Backup] 🔄 Exécution: ${backup.type}`);
                }
                
                const success = await this.performBackup(backup.type);
                
                if (success) {
                    // Log de succès seulement pour les backups manuels ou 20% des automatiques
                    if (backup.type === 'manual' || Math.random() < 0.2) {
                        console.log(`[Backup] ✅ ${backup.type} réussi`);
                    }
                    
                    // Mise à jour UI si visible
                    this.updateBackupUI();
                    
                    // Notification pour les backups manuels uniquement
                    if (backup.type === 'manual') {
                        this.showNotification(`Sauvegarde créée dans ${this.getStorageLocation()}`, 'success');
                    }
                } else {
                    console.warn(`[Backup] ⚠️ ${backup.type} échoué`);
                }
                
            } catch (error) {
                console.error(`[Backup] ❌ Erreur ${backup.type}:`, error);
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
                
                const dataString = JSON.stringify(data, null, 2);
                let success = false;
                
                // Priorité au stockage configuré
                if (this.config.storage === 'folder' && this.documentsHandle) {
                    try {
                        await this.storeInPhysicalFolder(dataString, data.timestamp, 'backup');
                        success = true;
                    } catch (error) {
                        console.warn('[Backup] ⚠️ Erreur backup physique, fallback download:', error);
                        this.downloadBackup(dataString, data.timestamp);
                        success = true;
                    }
                } else if (this.config.storage === 'download') {
                    this.downloadBackup(dataString, data.timestamp);
                    success = true;
                } else {
                    // Fallback localStorage
                    success = await this.backupToLocal(data);
                }
                
                // Backup cloud si disponible (et pas pour les changements automatiques)
                if (this.isCloudReady() && type !== 'auto' && type !== 'onChange') {
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
                    this.showNotification(`Erreur backup: ${error.message}`, 'error');
                }
                
                return false;
                
            } finally {
                this.backupInProgress = false;
            }
        }

        // ================================================
        // MÉTHODES DE BASE (inchangées)
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

        isCloudReady() {
            return (this.provider === 'onedrive' && this.isOneDriveReady()) ||
                   (this.provider === 'googledrive' && this.isGoogleDriveReady());
        }

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

        collectData(type) {
            const data = {
                version: '4.1',
                timestamp: new Date().toISOString(),
                backupType: type,
                provider: this.provider,
                storage: this.config.storage,
                storageLocation: this.getStorageLocation(),
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
                
                // Log taille seulement occasionnellement
                if (type === 'manual' || Math.random() < 0.1) {
                    console.log(`[Backup] 📊 Données collectées: ${data.metadata.size} bytes`);
                }
                
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

        async backupToLocal(data) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const key = `emailsortpro_backup_${timestamp}`;
                
                localStorage.setItem(key, JSON.stringify(data));
                localStorage.setItem('emailsortpro_backup_latest', JSON.stringify(data));
                
                this.cleanupLocalBackups();
                
                // Log moins verbose
                if (Math.random() < 0.3) {
                    console.log('[Backup] ✅ Backup local créé');
                }
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
                    
                    // Log nettoyage seulement occasionnellement
                    if (Math.random() < 0.5) {
                        console.log(`[Backup] 🧹 ${toDelete.length} anciens backups supprimés`);
                    }
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage:', error);
            }
        }

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

        showNotification(message, type = 'info', duration = 4000) {
            // Log toujours
            console.log(`[Backup] ${type.toUpperCase()}: ${message}`);
            
            if (window.uiManager && window.uiManager.showToast) {
                window.uiManager.showToast(message, type, duration);
            } else if (type === 'error' || type === 'success') {
                // Notification minimale pour les messages importants
                alert(message);
            }
        }

        fallbackToLocal() {
            console.log('[Backup] 🔧 Mode de secours - localStorage uniquement');
            this.provider = 'local';
            this.config.physicalBackupEnabled = false;
            this.config.storage = 'localStorage';
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

        getStatus() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return {
                enabled: this.config.enabled,
                initialized: this.isInitialized,
                provider: this.provider,
                storage: this.config.storage,
                storageLocation: this.getStorageLocation(),
                cloudReady: this.isCloudReady(),
                physicalBackupEnabled: this.config.physicalBackupEnabled,
                lastBackup: lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais',
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue
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
    window.setupBackupFolder = () => window.backupService?.setupPhysicalBackup();
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
    
    console.log('✅ BackupService CORRIGÉ chargé');
    console.log('🔄 Backup automatique avec stockage physique forcé');
    console.log('📁 Configuration automatique du dossier ou téléchargements');
    console.log('🔇 Logs réduits pour éviter le spam');

})();
