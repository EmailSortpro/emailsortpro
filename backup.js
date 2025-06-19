// backup.js - Version PROFESSIONNELLE avec stockage persistant
// Stratégie: Cache + IndexedDB + Dossier Documents dédié (PAS Téléchargements)

(function() {
    'use strict';

    class ProfessionalBackupService {
        constructor() {
            this.provider = null;
            this.isInitialized = false;
            this.backupInProgress = false;
            this.lastBackupTime = null;
            this.documentsHandle = null;
            this.documentsAccessGranted = false;
            this.timers = {
                auto: null,
                daily: null,
                queue: null
            };
            
            // Configuration PROFESSIONNELLE
            this.config = {
                enabled: true,
                mode: 'professional-persistent',
                intervals: {
                    auto: 300000,             // 5 minutes
                    cloud: 1800000,           // 30 minutes
                    daily: 86400000,          // 24 heures
                    onChange: 30000,          // 30 secondes après changement
                    documentsRetry: 30000     // Retry Documents toutes les 30 sec
                },
                maxBackups: {
                    cache: 10,
                    indexedDB: 20,
                    documents: 30             // Plus de backups dans Documents
                },
                
                // STRATÉGIE PROFESSIONNELLE
                cacheFirst: true,
                indexedDBSecond: true,
                documentsThird: true,         // Documents comme stockage principal
                noDownloads: true,            // AUCUN téléchargement automatique
                createAppFolder: true,        // Créer dossier application dédié
                
                // Contrôle intelligent
                multiLayerBackup: true,
                instantBackup: true,
                backgroundSync: true,
                silentMode: true
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.lastChangeTime = 0;
            this.documentsRetryTimer = null;
            this.appFolderPath = null;
            
            this.init();
        }

        // ================================================
        // INITIALISATION PROFESSIONNELLE
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation PROFESSIONNELLE...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                await this.initializeCacheStorage();
                await this.initializeIndexedDB();
                
                // Stratégie Documents INTELLIGENTE
                await this.setupProfessionalDocumentsStorage();
                
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service PROFESSIONNEL prêt`);
                console.log(`[Backup] 📦 Cache: ${!!this.cacheStorage} | 🗄️ IndexedDB: ${!!this.indexedDB}`);
                console.log(`[Backup] 📁 Documents: ${this.documentsAccessGranted ? '✅ Configuré' : '⚙️ À configurer'}`);
                console.log(`[Backup] 🚫 Téléchargements automatiques: DÉSACTIVÉS`);
                
                setTimeout(() => this.integrateToSettingsPage(), 2000);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToIndexedDB();
            }
        }

        // ================================================
        // STOCKAGE DOCUMENTS PROFESSIONNEL
        // ================================================
        async setupProfessionalDocumentsStorage() {
            console.log('[Backup] 📁 Configuration stockage Documents professionnel...');
            
            try {
                // 1. Essayer de restaurer un accès précédent
                const savedHandle = await this.loadSavedDocumentsHandle();
                if (savedHandle && await this.testDocumentsHandle(savedHandle)) {
                    this.documentsHandle = savedHandle;
                    this.documentsAccessGranted = true;
                    console.log('[Backup] ✅ Accès Documents restauré');
                    return;
                }
                
                // 2. Proposer une configuration guidée (non intrusive)
                this.scheduleDocumentsSetupGuide();
                
            } catch (error) {
                console.log('[Backup] 📝 Documents en attente de configuration');
                this.scheduleDocumentsSetupGuide();
            }
        }

        scheduleDocumentsSetupGuide() {
            // Guide de configuration différé et optionnel
            setTimeout(() => {
                if (!this.documentsAccessGranted && this.shouldPromptForDocuments()) {
                    this.showDocumentsSetupGuide();
                }
            }, 10000); // Attendre 10 secondes avant de proposer
        }

        shouldPromptForDocuments() {
            // Ne proposer que si l'utilisateur utilise déjà l'app
            const lastPrompt = localStorage.getItem('emailsortpro_last_documents_prompt');
            const now = Date.now();
            
            // Proposer max 1 fois par semaine
            if (lastPrompt && (now - parseInt(lastPrompt)) < 7 * 24 * 60 * 60 * 1000) {
                return false;
            }
            
            // Proposer seulement si l'utilisateur a des données
            const hasData = localStorage.getItem('emailsortpro_settings') || 
                           (window.taskManager && window.taskManager.getAllTasks().length > 0);
            
            return !!hasData;
        }

        showDocumentsSetupGuide() {
            // Notification discrète pour proposer la configuration
            const notification = document.createElement('div');
            notification.className = 'professional-backup-prompt';
            notification.innerHTML = `
                <div class="backup-prompt-content">
                    <div class="prompt-icon">
                        <i class="fas fa-shield-check"></i>
                    </div>
                    <div class="prompt-text">
                        <h4>Sécuriser vos données EmailSortPro</h4>
                        <p>Configurer un dossier de sauvegarde permanent dans vos Documents</p>
                    </div>
                    <div class="prompt-actions">
                        <button class="btn-setup-docs">Configurer</button>
                        <button class="btn-later">Plus tard</button>
                        <button class="btn-never">Jamais</button>
                    </div>
                </div>
            `;

            // Styles pour une notification professionnelle
            const style = document.createElement('style');
            style.textContent = `
                .professional-backup-prompt {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border: 1px solid #e0e6ed;
                    border-left: 4px solid #0066cc;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 16px;
                    max-width: 350px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                }
                
                .backup-prompt-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .prompt-icon {
                    color: #0066cc;
                    font-size: 24px;
                    margin-top: 4px;
                }
                
                .prompt-text h4 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #2d3748;
                }
                
                .prompt-text p {
                    margin: 0 0 12px 0;
                    font-size: 13px;
                    color: #718096;
                    line-height: 1.4;
                }
                
                .prompt-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .prompt-actions button {
                    padding: 6px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-setup-docs {
                    background: #0066cc;
                    color: white;
                    border-color: #0066cc;
                }
                
                .btn-setup-docs:hover {
                    background: #0052a3;
                }
                
                .btn-later, .btn-never {
                    background: white;
                    color: #718096;
                }
                
                .btn-later:hover, .btn-never:hover {
                    background: #f7fafc;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(notification);

            // Event listeners
            notification.querySelector('.btn-setup-docs').addEventListener('click', () => {
                this.startManualDocumentsSetup();
                notification.remove();
            });

            notification.querySelector('.btn-later').addEventListener('click', () => {
                localStorage.setItem('emailsortpro_last_documents_prompt', Date.now().toString());
                notification.remove();
            });

            notification.querySelector('.btn-never').addEventListener('click', () => {
                localStorage.setItem('emailsortpro_documents_never', 'true');
                this.config.tryDocuments = false;
                this.saveConfig();
                notification.remove();
            });

            // Auto-fermeture après 15 secondes
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 15000);
        }

        async startManualDocumentsSetup() {
            try {
                if (!window.showDirectoryPicker) {
                    this.showNotification('Votre navigateur ne supporte pas l\'accès aux fichiers', 'warning');
                    return false;
                }

                // Proposer de créer un dossier EmailSortPro dans Documents
                const parentHandle = await window.showDirectoryPicker({
                    mode: 'readwrite',
                    startIn: 'documents',
                    id: 'emailsortpro-professional-setup'
                });

                // Créer ou accéder au dossier EmailSortPro
                let appFolderHandle;
                try {
                    appFolderHandle = await parentHandle.getDirectoryHandle('EmailSortPro');
                    console.log('[Backup] ✅ Dossier EmailSortPro trouvé');
                } catch {
                    appFolderHandle = await parentHandle.getDirectoryHandle('EmailSortPro', { create: true });
                    console.log('[Backup] ✅ Dossier EmailSortPro créé');
                }

                // Créer sous-dossier pour les backups
                let backupFolderHandle;
                try {
                    backupFolderHandle = await appFolderHandle.getDirectoryHandle('Backups');
                } catch {
                    backupFolderHandle = await appFolderHandle.getDirectoryHandle('Backups', { create: true });
                }

                // Tester l'accès en écriture
                await this.testWriteAccess(backupFolderHandle);

                // Sauvegarder les handles
                this.documentsHandle = backupFolderHandle;
                this.documentsAccessGranted = true;
                await this.saveDocumentsHandle(backupFolderHandle);

                // Créer un fichier README pour expliquer
                await this.createReadmeFile(backupFolderHandle);

                this.showNotification('✅ Dossier de sauvegarde configuré avec succès!', 'success');
                console.log('[Backup] ✅ Stockage Documents configuré professionnellement');

                // Faire un backup immédiat pour tester
                await this.performBackup('setup-test');

                return true;

            } catch (error) {
                if (error.name === 'AbortError') {
                    this.showNotification('Configuration annulée', 'info');
                } else {
                    console.error('[Backup] Erreur configuration Documents:', error);
                    this.showNotification('Erreur lors de la configuration', 'error');
                }
                return false;
            }
        }

        async createReadmeFile(folderHandle) {
            try {
                const readmeContent = `# EmailSortPro - Dossier de Sauvegarde

Ce dossier contient les sauvegardes automatiques de vos données EmailSortPro.

## Contenu
- Fichiers de sauvegarde au format JSON
- Historique de vos catégories et tâches
- Paramètres et préférences

## Informations importantes
- ⚠️ NE PAS SUPPRIMER ce dossier - vos données seraient perdues
- 🔄 Les sauvegardes sont créées automatiquement
- 💾 Les anciens fichiers sont nettoyés automatiquement (garde les 30 derniers)
- 🔒 Vos données restent privées sur votre ordinateur

## Restauration
En cas de problème, utilisez l'option "Restaurer" dans EmailSortPro
ou contactez le support avec l'un de ces fichiers.

---
Généré automatiquement par EmailSortPro
Date: ${new Date().toLocaleString('fr-FR')}
`;

                const readmeHandle = await folderHandle.getFileHandle('README.txt', { create: true });
                const writable = await readmeHandle.createWritable();
                await writable.write(readmeContent);
                await writable.close();

            } catch (error) {
                console.warn('[Backup] Impossible de créer README:', error);
            }
        }

        // ================================================
        // BACKUP PROFESSIONNEL (SANS TÉLÉCHARGEMENTS)
        // ================================================
        async performBackup(type) {
            if (!this.config.enabled || this.backupInProgress) {
                return false;
            }

            this.backupInProgress = true;

            try {
                const data = this.collectData(type);
                if (!data || !data.data) return false;

                const dataString = JSON.stringify(data, null, 2);
                let successCount = 0;

                // STRATÉGIE PROFESSIONNELLE : 3 couches sans téléchargements

                // 1. Cache Storage (rapidité)
                if (this.cacheStorage) {
                    try {
                        await this.backupToCache(dataString, data.timestamp);
                        successCount++;
                        console.log('[Backup] ✅ Cache Storage');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ Cache Error:', error);
                    }
                }

                // 2. IndexedDB (persistance navigateur)
                if (this.indexedDB) {
                    try {
                        await this.backupToIndexedDB(data);
                        successCount++;
                        console.log('[Backup] ✅ IndexedDB');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ IndexedDB Error:', error);
                    }
                }

                // 3. Documents (stockage permanent)
                if (this.documentsAccessGranted) {
                    try {
                        await this.backupToDocuments(dataString, data.timestamp);
                        successCount++;
                        console.log('[Backup] ✅ Documents');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ Documents Error:', error);
                        // Si erreur Documents, on perd l'accès
                        this.documentsAccessGranted = false;
                        this.scheduleDocumentsSetupGuide();
                    }
                }

                // 4. localStorage (fallback minimum)
                try {
                    await this.backupToLocalStorage(data);
                    successCount++;
                    console.log('[Backup] ✅ localStorage');
                } catch (error) {
                    console.warn('[Backup] ⚠️ localStorage Error:', error);
                }

                const success = successCount > 0;

                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();

                    if (type === 'manual' || type === 'setup-test') {
                        console.log(`[Backup] 🎯 Succès professionnel: ${successCount} emplacements`);
                    }
                }

                return success;

            } catch (error) {
                console.error('[Backup] Erreur backup:', error);
                return false;
            } finally {
                this.backupInProgress = false;
            }
        }

        async backupToDocuments(dataString, timestamp) {
            if (!this.documentsHandle) {
                throw new Error('Documents handle not available');
            }

            // Format professionnel pour les noms de fichiers
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
            const fileName = `EmailSortPro-${dateStr}_${timeStr}.json`;

            try {
                // Créer le fichier de backup
                const fileHandle = await this.documentsHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();

                // Maintenir un fichier "Latest" pour accès rapide
                try {
                    const latestHandle = await this.documentsHandle.getFileHandle('EmailSortPro-Latest.json', { create: true });
                    const latestWritable = await latestHandle.createWritable();
                    await latestWritable.write(dataString);
                    await latestWritable.close();
                } catch (error) {
                    console.warn('[Backup] Impossible de créer Latest:', error);
                }

                // Nettoyage intelligent des anciens backups
                await this.cleanupDocumentsBackups();

                console.log(`[Backup] 📁 Fichier créé: ${fileName}`);

            } catch (error) {
                console.error('[Backup] Erreur écriture Documents:', error);
                throw error;
            }
        }

        async cleanupDocumentsBackups() {
            try {
                const files = [];
                
                // Lister tous les fichiers de backup
                for await (const [name, handle] of this.documentsHandle.entries()) {
                    if (name.startsWith('EmailSortPro-') && 
                        name.endsWith('.json') && 
                        name !== 'EmailSortPro-Latest.json' &&
                        name !== 'README.txt') {
                        files.push(name);
                    }
                }

                // Trier par date (plus récents d'abord)
                files.sort().reverse();

                // Garder seulement les N plus récents
                if (files.length > this.config.maxBackups.documents) {
                    const toDelete = files.slice(this.config.maxBackups.documents);
                    
                    for (const fileName of toDelete) {
                        try {
                            await this.documentsHandle.removeEntry(fileName);
                            console.log(`[Backup] 🗑️ Ancien backup supprimé: ${fileName}`);
                        } catch (error) {
                            console.warn(`[Backup] Impossible de supprimer ${fileName}:`, error);
                        }
                    }
                }

            } catch (error) {
                console.warn('[Backup] Erreur nettoyage Documents:', error);
            }
        }

        // ================================================
        // INTERFACE UTILISATEUR PROFESSIONNELLE
        // ================================================
        integrateToSettingsPage() {
            const settingsContainer = document.querySelector('#settings-page, .settings-container, .page-content[data-page="settings"], .settings-section');

            if (!settingsContainer) {
                console.log('[Backup] Page paramètres non trouvée');
                return;
            }

            if (settingsContainer.querySelector('#professional-backup-section')) {
                return;
            }

            const backupSection = this.createProfessionalBackupSection();
            settingsContainer.appendChild(backupSection);

            console.log('[Backup] ✅ Section backup professionnelle ajoutée');
        }

        createProfessionalBackupSection() {
            const section = document.createElement('div');
            section.id = 'professional-backup-section';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3 class="settings-section-title">
                    <i class="fas fa-shield-check"></i> Sauvegarde Professionnelle
                </h3>
                <div class="settings-content">
                    <div class="setting-item">
                        <div class="professional-backup-status">
                            <div class="status-indicator ${this.isFullyConfigured() ? 'active' : 'warning'}">
                                <i class="fas fa-${this.isFullyConfigured() ? 'check-circle' : 'exclamation-triangle'}"></i>
                            </div>
                            <div class="status-info">
                                <h4>🏢 Sauvegarde professionnelle ${this.isFullyConfigured() ? 'configurée' : 'partielle'}</h4>
                                <p>Stockage sécurisé sans téléchargements automatiques</p>
                                <small>Couches actives: ${this.getActiveLayers()} | Dernière : ${this.getLastBackupTime()}</small>
                            </div>
                        </div>
                    </div>

                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="backup-enabled" ${this.config.enabled ? 'checked' : ''}>
                            Activer les sauvegardes automatiques
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="storage-layers">
                            <h5>📊 Couches de stockage :</h5>
                            <div class="layers-professional">
                                <div class="layer ${this.cacheStorage ? 'active' : 'inactive'}">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <div class="layer-info">
                                        <span>Cache Rapide</span>
                                        <small>${this.cacheStorage ? '✅ Actif' : '❌ Indisponible'}</small>
                                    </div>
                                </div>
                                <div class="layer ${this.indexedDB ? 'active' : 'inactive'}">
                                    <i class="fas fa-database"></i>
                                    <div class="layer-info">
                                        <span>Base Navigateur</span>
                                        <small>${this.indexedDB ? '✅ Actif' : '❌ Indisponible'}</small>
                                    </div>
                                </div>
                                <div class="layer ${this.documentsAccessGranted ? 'active' : 'warning'}">
                                    <i class="fas fa-folder-open"></i>
                                    <div class="layer-info">
                                        <span>Documents Permanents</span>
                                        <small>${this.documentsAccessGranted ? '✅ Configuré' : '⚙️ À configurer'}</small>
                                    </div>
                                </div>
                                <div class="layer active">
                                    <i class="fas fa-memory"></i>
                                    <div class="layer-info">
                                        <span>Stockage Local</span>
                                        <small>✅ Toujours actif</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${!this.documentsAccessGranted ? `
                    <div class="setting-item highlight">
                        <div class="professional-recommendation">
                            <i class="fas fa-lightbulb"></i>
                            <div>
                                <h5>Recommandation professionnelle</h5>
                                <p>Configurez un dossier de sauvegarde permanent dans vos Documents pour une sécurité maximale</p>
                            </div>
                        </div>
                        <button id="setup-documents-btn" class="btn btn-primary">
                            <i class="fas fa-folder-plus"></i> Configurer dossier de sauvegarde
                        </button>
                    </div>
                    ` : `
                    <div class="setting-item success">
                        <div class="professional-success">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <h5>Configuration optimale ✅</h5>
                                <p>Vos données sont sauvegardées de manière professionnelle</p>
                            </div>
                        </div>
                    </div>
                    `}

                    <div class="setting-item">
                        <button id="manual-backup-btn" class="btn btn-secondary">
                            <i class="fas fa-save"></i> Créer une sauvegarde maintenant
                        </button>
                    </div>

                    <div class="setting-item">
                        <details>
                            <summary>📋 Informations détaillées</summary>
                            <div class="backup-details-pro">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Mode :</strong>
                                        <span>${this.config.mode}</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Fréquence :</strong>
                                        <span>Toutes les 5 minutes + changements</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Téléchargements :</strong>
                                        <span>🚫 Désactivés (stockage permanent)</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Sécurité :</strong>
                                        <span>Redondance ${this.getStorageLayersCount()} couches</span>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <style>
                .professional-backup-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 8px;
                    border-left: 4px solid #0066cc;
                }

                .status-indicator {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .status-indicator.active {
                    background: #10b981;
                    color: white;
                }

                .status-indicator.warning {
                    background: #f59e0b;
                    color: white;
                }

                .layers-professional {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }

                .layers-professional .layer {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                }

                .layers-professional .layer.active {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .layers-professional .layer.warning {
                    border-color: #f59e0b;
                    background: #fffbeb;
                }

                .layer-info span {
                    font-weight: 500;
                    display: block;
                }

                .layer-info small {
                    color: #6b7280;
                    font-size: 12px;
                }

                .professional-recommendation,
                .professional-success {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .professional-recommendation {
                    color: #0066cc;
                }

                .professional-success {
                    color: #10b981;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                    background: #f8fafc;
                    border-radius: 4px;
                }
                </style>
            `;

            this.attachProfessionalEvents(section);
            return section;
        }

        attachProfessionalEvents(section) {
            // Toggle activation
            const enabledCheckbox = section.querySelector('#backup-enabled');
            enabledCheckbox?.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enable();
                } else {
                    this.disable();
                }
                this.updateUI();
            });

            // Setup Documents
            const setupBtn = section.querySelector('#setup-documents-btn');
            setupBtn?.addEventListener('click', async () => {
                setupBtn.disabled = true;
                setupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';

                const success = await this.startManualDocumentsSetup();

                setupBtn.disabled = false;
                if (success) {
                    // Recharger la section pour refléter les changements
                    section.replaceWith(this.createProfessionalBackupSection());
                } else {
                    setupBtn.innerHTML = '<i class="fas fa-folder-plus"></i> Configurer dossier de sauvegarde';
                }
            });

            // Backup manuel
            const manualBtn = section.querySelector('#manual-backup-btn');
            manualBtn?.addEventListener('click', async () => {
                manualBtn.disabled = true;
                manualBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';

                await this.manualBackup();

                manualBtn.disabled = false;
                manualBtn.innerHTML = '<i class="fas fa-save"></i> Créer une sauvegarde maintenant';
                this.updateUI();
            });
        }

        updateUI() {
            const section = document.querySelector('#professional-backup-section');
            if (section) {
                section.replaceWith(this.createProfessionalBackupSection());
            }
        }

        // ================================================
        // MÉTHODES D'ÉTAT
        // ================================================
        isFullyConfigured() {
            return this.cacheStorage && 
                   this.indexedDB && 
                   this.documentsAccessGranted && 
                   this.config.enabled;
        }

        getStorageLayersCount() {
            let count = 1; // localStorage toujours présent
            if (this.cacheStorage) count++;
            if (this.indexedDB) count++;
            if (this.documentsAccessGranted) count++;
            return count;
        }

        getActiveLayers() {
            const layers = [];
            if (this.cacheStorage) layers.push('Cache');
            if (this.indexedDB) layers.push('IndexedDB');
            if (this.documentsAccessGranted) layers.push('Documents');
            layers.push('localStorage');
            return layers.join(' + ');
        }

        // ================================================
        // MÉTHODES HÉRITÉES (adaptées)
        // ================================================
        async initializeCacheStorage() {
            try {
                if ('caches' in window) {
                    this.cacheStorage = await caches.open('emailsortpro-backups-v1');
                    console.log('[Backup] ✅ Cache Storage initialisé');
                    return true;
                }
                
                if ('indexedDB' in window) {
                    await this.initializeIndexedDB();
                    console.log('[Backup] ✅ IndexedDB initialisé comme fallback');
                    return true;
                }
                
                throw new Error('Aucun stockage avancé disponible');
                
            } catch (error) {
                console.warn('[Backup] ⚠️ Fallback localStorage:', error);
                this.config.mode = 'localStorage-only';
                return false;
            }
        }

        async initializeIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('EmailSortProBackups', 1);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.indexedDB = request.result;
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('backups')) {
                        const store = db.createObjectStore('backups', { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
            });
        }

        async saveDocumentsHandle(handle) {
            try {
                if (this.indexedDB) {
                    const transaction = this.indexedDB.transaction(['backups'], 'readwrite');
                    const store = transaction.objectStore('backups');
                    await store.put({
                        id: 'documents-handle',
                        handle: handle,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.warn('[Backup] Impossible de sauvegarder handle:', error);
            }
        }

        async loadSavedDocumentsHandle() {
            try {
                if (this.indexedDB) {
                    const transaction = this.indexedDB.transaction(['backups'], 'readonly');
                    const store = transaction.objectStore('backups');
                    const result = await store.get('documents-handle');
                    return result?.handle;
                }
            } catch (error) {
                return null;
            }
        }

        async testDocumentsHandle(handle) {
            try {
                const testFile = await handle.getFileHandle('.test', { create: true });
                const writable = await testFile.createWritable();
                await writable.write('test');
                await writable.close();
                await handle.removeEntry('.test');
                return true;
            } catch (error) {
                return false;
            }
        }

        async testWriteAccess(directoryHandle) {
            const testFileName = '.emailsortpro-test-' + Date.now();
            
            try {
                const testFileHandle = await directoryHandle.getFileHandle(testFileName, { create: true });
                const writable = await testFileHandle.createWritable();
                await writable.write('Test EmailSortPro - ' + new Date().toISOString());
                await writable.close();
                await directoryHandle.removeEntry(testFileName);
                return true;
            } catch (error) {
                throw new Error('Test écriture échoué');
            }
        }

        // ================================================
        // AUTRES MÉTHODES ESSENTIELLES
        // ================================================
        startDataWatching() {
            console.log('[Backup] 👁️ Surveillance des données...');
            
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
            const objectsToWatch = ['categoryManager', 'taskManager'];
            
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
                    // Ignore
                }
            }, 60000);
        }

        listenToAppEvents() {
            const eventsToWatch = [
                'categoryCreated', 'categoryUpdated', 'categoryDeleted',
                'taskCreated', 'taskUpdated', 'taskCompleted', 'taskDeleted'
            ];
            
            eventsToWatch.forEach(eventName => {
                document.addEventListener(eventName, () => {
                    this.onDataChange('event', eventName);
                });
            });
        }

        onDataChange(source, key) {
            if (this.shouldIgnoreChange(key)) return;
            
            const now = Date.now();
            if (now - this.lastChangeTime < 30000) return;
            this.lastChangeTime = now;
            
            this.scheduleChangeBackup();
        }

        shouldIgnoreChange(key) {
            if (typeof key !== 'string') return false;
            
            const ignored = [
                'emailsortpro_backup_', 'temp_', 'cache_', 'session_',
                'lastActivity', 'currentView', 'scrollPosition',
                'msal.', 'server-telemetry', 'emailsortpro_last_documents_prompt',
                'emailsortpro_documents_never'
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

        queueBackup(type, priority = 50) {
            const backup = {
                id: this.generateId(),
                type,
                priority,
                timestamp: Date.now()
            };
            
            this.backupQueue.push(backup);
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
                    await this.sleep(300);
                }
            } catch (error) {
                console.error('[Backup] Erreur queue:', error);
            } finally {
                this.isProcessingQueue = false;
            }
        }

        async executeBackup(backup) {
            try {
                const success = await this.performBackup(backup.type);
                
                if (success && backup.type === 'manual') {
                    this.showNotification('Sauvegarde créée avec succès!', 'success');
                }
                
            } catch (error) {
                console.error(`[Backup] Erreur ${backup.type}:`, error);
            }
        }

        async backupToCache(dataString, timestamp) {
            const cacheKey = `backup-${timestamp.replace(/[:.]/g, '-')}`;
            const response = new Response(dataString, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            await this.cacheStorage.put(cacheKey, response);
            await this.cleanupCache();
        }

        async cleanupCache() {
            try {
                const keys = await this.cacheStorage.keys();
                const backupKeys = keys
                    .map(req => req.url.split('/').pop())
                    .filter(key => key.startsWith('backup-'))
                    .sort()
                    .reverse();
                
                if (backupKeys.length > this.config.maxBackups.cache) {
                    const toDelete = backupKeys.slice(this.config.maxBackups.cache);
                    for (const key of toDelete) {
                        await this.cacheStorage.delete(key);
                    }
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage cache:', error);
            }
        }

        async backupToIndexedDB(data) {
            const transaction = this.indexedDB.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            
            const backupData = {
                id: `backup-${Date.now()}`,
                data: data,
                timestamp: Date.now()
            };
            
            await store.put(backupData);
            
            const index = store.index('timestamp');
            const allKeys = await index.getAllKeys();
            if (allKeys.length > this.config.maxBackups.cache) {
                const sorted = allKeys.sort().reverse();
                const toDelete = sorted.slice(this.config.maxBackups.cache);
                for (const key of toDelete) {
                    await store.delete(key);
                }
            }
        }

        async backupToLocalStorage(data) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const key = `emailsortpro_backup_${timestamp}`;
                
                localStorage.setItem(key, JSON.stringify(data));
                localStorage.setItem('emailsortpro_backup_latest', JSON.stringify(data));
                
                this.cleanupLocalBackups();
                return true;
                
            } catch (error) {
                console.error('[Backup] Erreur localStorage:', error);
                return false;
            }
        }

        cleanupLocalBackups() {
            try {
                const keys = Object.keys(localStorage)
                    .filter(key => key.startsWith('emailsortpro_backup_'))
                    .sort()
                    .reverse();
                
                if (keys.length > this.config.maxBackups.local || 5) {
                    const toDelete = keys.slice(this.config.maxBackups.local || 5);
                    toDelete.forEach(key => localStorage.removeItem(key));
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage local:', error);
            }
        }

        collectData(type) {
            const data = {
                version: '7.0-professional',
                timestamp: new Date().toISOString(),
                backupType: type,
                mode: this.config.mode,
                storageStrategy: {
                    cache: !!this.cacheStorage,
                    indexedDB: !!this.indexedDB,
                    documents: this.documentsAccessGranted,
                    localStorage: true,
                    autoDownloads: false
                },
                metadata: {
                    backupId: this.generateId(),
                    trigger: type,
                    size: 0,
                    user: this.getCurrentUser(),
                    professional: true
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
                
            } catch (error) {
                console.error('[Backup] Erreur collecte:', error);
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

        async detectProvider() {
            this.provider = 'local';
            console.log('[Backup] Provider: local (stockage professionnel)');
        }

        loadConfig() {
            try {
                const saved = localStorage.getItem('emailsortpro_professional_backup_config');
                if (saved) {
                    Object.assign(this.config, JSON.parse(saved));
                }
            } catch (error) {
                console.warn('[Backup] Configuration par défaut utilisée');
            }
        }

        saveConfig() {
            try {
                localStorage.setItem('emailsortpro_professional_backup_config', JSON.stringify(this.config));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        startAutoTimers() {
            console.log('[Backup] ⏰ Timers automatiques...');
            
            if (!this.timers) {
                this.timers = {
                    auto: null,
                    daily: null,
                    queue: null
                };
            }
            
            this.timers.auto = setInterval(() => {
                this.queueBackup('auto', 40);
            }, this.config.intervals.auto);
            
            this.scheduleDailyBackup();
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
        }

        async createInitialBackup() {
            try {
                await this.performBackup('initial');
                localStorage.setItem('emailsortpro_backup_initialized', new Date().toISOString());
            } catch (error) {
                console.error('[Backup] Erreur backup initial:', error);
            }
        }

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

        getLastBackupTime() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        showNotification(message, type = 'info') {
            console.log(`[Backup] ${type.toUpperCase()}: ${message}`);
            
            if (window.uiManager && window.uiManager.showToast) {
                window.uiManager.showToast(message, type, 3000);
            }
        }

        fallbackToIndexedDB() {
            console.log('[Backup] 🔧 Mode de secours - IndexedDB + localStorage');
            this.provider = 'local';
            this.config.mode = 'indexedDB-localStorage';
            this.isInitialized = true;
            this.startAutoTimers();
        }

        // ================================================
        // API PUBLIQUE
        // ================================================
        async manualBackup() {
            this.queueBackup('manual', 100);
            await this.processQueue();
        }

        getStatus() {
            return {
                enabled: this.config.enabled,
                initialized: this.isInitialized,
                mode: this.config.mode,
                storage: {
                    cache: !!this.cacheStorage,
                    indexedDB: !!this.indexedDB,
                    documents: this.documentsAccessGranted,
                    localStorage: true,
                    autoDownloads: false
                },
                lastBackup: this.getLastBackupTime(),
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue,
                professional: true,
                fullyConfigured: this.isFullyConfigured()
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
        }

        disable() {
            this.config.enabled = false;
            this.saveConfig();
            this.stopTimers();
        }

        stopTimers() {
            if (this.timers) {
                Object.values(this.timers).forEach(timer => {
                    if (timer) clearInterval(timer);
                });
            }
            
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            
            if (this.documentsRetryTimer) {
                clearInterval(this.documentsRetryTimer);
            }
        }
    }

    // ================================================
    // INITIALISATION GLOBALE
    // ================================================
    
    window.backupService = new ProfessionalBackupService();
    
    // API globale
    window.triggerBackup = () => window.backupService?.manualBackup();
    window.getBackupStatus = () => window.backupService?.getStatus() || { available: false };
    window.enableBackup = () => window.backupService?.enable();
    window.disableBackup = () => window.backupService?.disable();
    
    // Events
    window.addEventListener('beforeunload', () => {
        if (window.backupService) {
            window.backupService.queueBackup('beforeClose', 90);
        }
    });
    
    console.log('✅ BackupService PROFESSIONNEL chargé');
    console.log('🏢 Mode professionnel : Cache + IndexedDB + Documents permanents');
    console.log('📁 AUCUN téléchargement automatique - Stockage permanent uniquement');
    console.log('⚡ Backup intelligent : toutes les 5 minutes + changements');
    console.log('🔒 Redondance multi-couches avec dossier permanent');
    console.log('🎯 Configuration guidée pour dossier Documents');

})();
