// backup.js - Version TOTALEMENT TRANSPARENTE - ZÉRO FICHIER VISIBLE
// Stockage invisible : Cache + IndexedDB + OPFS (Origin Private File System)

(function() {
    'use strict';

    class InvisibleBackupService {
        constructor() {
            this.provider = null;
            this.isInitialized = false;
            this.backupInProgress = false;
            this.lastBackupTime = null;
            this.opfsRoot = null;
            this.opfsAccessGranted = false;
            this.timers = {
                auto: null,
                daily: null,
                queue: null
            };
            
            // Configuration TOTALEMENT INVISIBLE
            this.config = {
                enabled: true,
                mode: 'invisible-transparent',
                intervals: {
                    auto: 300000,             // 5 minutes
                    daily: 86400000,          // 24 heures
                    onChange: 30000,          // 30 secondes après changement
                },
                maxBackups: {
                    cache: 15,                // Backups cache
                    indexedDB: 25,            // Backups IndexedDB
                    opfs: 50                  // Backups OPFS (invisible)
                },
                
                // STRATÉGIE TOTALEMENT INVISIBLE
                cacheFirst: true,             // Cache priorité
                indexedDBSecond: true,        // IndexedDB en second
                opfsThird: true,              // OPFS invisible en troisième
                NO_DOWNLOADS: true,           // AUCUN téléchargement JAMAIS
                NO_USER_FILES: true,          // AUCUN fichier visible utilisateur
                NO_DOCUMENTS_ACCESS: true,    // Pas d'accès Documents
                
                // Contrôle total transparent
                multiLayerBackup: true,
                instantBackup: true,
                backgroundSync: true,
                silentMode: true,
                invisible: true
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.lastChangeTime = 0;
            
            this.init();
        }

        // ================================================
        // INITIALISATION TOTALEMENT INVISIBLE
        // ================================================
        async init() {
            console.log('[Backup] 🔒 Initialisation INVISIBLE...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                await this.initializeCacheStorage();
                await this.initializeIndexedDB();
                await this.initializeOPFS(); // Stockage invisible
                
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service INVISIBLE prêt`);
                console.log(`[Backup] 📦 Cache: ${!!this.cacheStorage} | 🗄️ IndexedDB: ${!!this.indexedDB} | 👻 OPFS: ${this.opfsAccessGranted}`);
                console.log(`[Backup] 🚫 AUCUN fichier visible - Stockage 100% transparent`);
                
                setTimeout(() => this.integrateToSettingsPage(), 2000);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToIndexedDB();
            }
        }

        // ================================================
        // ORIGIN PRIVATE FILE SYSTEM (INVISIBLE)
        // ================================================
        async initializeOPFS() {
            try {
                if ('navigator' in window && 'storage' in navigator && 'getDirectory' in navigator.storage) {
                    this.opfsRoot = await navigator.storage.getDirectory();
                    
                    // Créer dossier de backup invisible
                    const backupDir = await this.opfsRoot.getDirectoryHandle('emailsortpro-backups', { create: true });
                    this.opfsBackupDir = backupDir;
                    this.opfsAccessGranted = true;
                    
                    console.log('[Backup] ✅ OPFS initialisé (stockage invisible)');
                    return true;
                }
                
                console.log('[Backup] ⚠️ OPFS non disponible, utilisation des autres couches');
                return false;
                
            } catch (error) {
                console.warn('[Backup] ⚠️ OPFS non accessible:', error);
                return false;
            }
        }

        // ================================================
        // BACKUP TOTALEMENT INVISIBLE
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

                // STRATÉGIE 100% INVISIBLE : Aucun fichier visible

                // 1. Cache Storage (ultra rapide, invisible)
                if (this.cacheStorage) {
                    try {
                        await this.backupToCache(dataString, data.timestamp);
                        successCount++;
                        if (type === 'manual') console.log('[Backup] ✅ Cache Storage');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ Cache Error:', error);
                    }
                }

                // 2. IndexedDB (persistant, invisible)
                if (this.indexedDB) {
                    try {
                        await this.backupToIndexedDB(data);
                        successCount++;
                        if (type === 'manual') console.log('[Backup] ✅ IndexedDB');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ IndexedDB Error:', error);
                    }
                }

                // 3. OPFS (Origin Private File System - totalement invisible)
                if (this.opfsAccessGranted) {
                    try {
                        await this.backupToOPFS(dataString, data.timestamp);
                        successCount++;
                        if (type === 'manual') console.log('[Backup] ✅ OPFS Invisible');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ OPFS Error:', error);
                    }
                }

                // 4. localStorage (fallback minimal, invisible)
                try {
                    await this.backupToLocalStorage(data);
                    successCount++;
                    if (type === 'manual') console.log('[Backup] ✅ localStorage');
                } catch (error) {
                    console.warn('[Backup] ⚠️ localStorage Error:', error);
                }

                // AUCUN téléchargement, AUCUN fichier visible, AUCUNE interaction

                const success = successCount > 0;

                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();

                    if (type === 'manual') {
                        console.log(`[Backup] 🎯 Succès invisible: ${successCount} couches`);
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

        // ================================================
        // BACKUP VERS OPFS (TOTALEMENT INVISIBLE)
        // ================================================
        async backupToOPFS(dataString, timestamp) {
            if (!this.opfsBackupDir) {
                throw new Error('OPFS not available');
            }

            // Format timestamp pour nom de fichier
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `backup-${dateStr}_${timeStr}.json`;

            try {
                // Créer le fichier de backup invisible
                const fileHandle = await this.opfsBackupDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();

                // Maintenir un fichier "latest" invisible
                try {
                    const latestHandle = await this.opfsBackupDir.getFileHandle('latest.json', { create: true });
                    const latestWritable = await latestHandle.createWritable();
                    await latestWritable.write(dataString);
                    await latestWritable.close();
                } catch (error) {
                    // Ignore
                }

                // Nettoyage automatique des anciens backups
                await this.cleanupOPFSBackups();

            } catch (error) {
                console.error('[Backup] Erreur OPFS:', error);
                throw error;
            }
        }

        async cleanupOPFSBackups() {
            try {
                const files = [];
                
                // Lister tous les fichiers de backup
                for await (const [name, handle] of this.opfsBackupDir.entries()) {
                    if (name.startsWith('backup-') && name.endsWith('.json')) {
                        files.push(name);
                    }
                }

                // Trier par date (plus récents d'abord)
                files.sort().reverse();

                // Garder seulement les N plus récents
                if (files.length > this.config.maxBackups.opfs) {
                    const toDelete = files.slice(this.config.maxBackups.opfs);
                    
                    for (const fileName of toDelete) {
                        try {
                            await this.opfsBackupDir.removeEntry(fileName);
                        } catch (error) {
                            // Ignore
                        }
                    }
                }

            } catch (error) {
                // Ignore cleanup errors
            }
        }

        // ================================================
        // INTERFACE UTILISATEUR SIMPLIFIÉE
        // ================================================
        integrateToSettingsPage() {
            const settingsContainer = document.querySelector('#settings-page, .settings-container, .page-content[data-page="settings"], .settings-section');

            if (!settingsContainer) {
                console.log('[Backup] Page paramètres non trouvée');
                return;
            }

            if (settingsContainer.querySelector('#invisible-backup-section')) {
                return;
            }

            const backupSection = this.createInvisibleBackupSection();
            settingsContainer.appendChild(backupSection);

            console.log('[Backup] ✅ Section backup invisible ajoutée');
        }

        createInvisibleBackupSection() {
            const section = document.createElement('div');
            section.id = 'invisible-backup-section';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3 class="settings-section-title">
                    <i class="fas fa-shield-check"></i> Sauvegarde Automatique
                </h3>
                <div class="settings-content">
                    <div class="setting-item">
                        <div class="invisible-backup-status">
                            <div class="status-indicator active">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="status-info">
                                <h4>🔒 Sauvegarde invisible active</h4>
                                <p>Vos données sont sauvegardées automatiquement de manière transparente</p>
                                <small>Stockage sécurisé dans le navigateur | Dernière : ${this.getLastBackupTime()}</small>
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
                        <div class="storage-layers-invisible">
                            <h5>🔒 Couches de stockage invisibles :</h5>
                            <div class="layers-invisible">
                                <div class="layer ${this.cacheStorage ? 'active' : 'inactive'}">
                                    <i class="fas fa-bolt"></i>
                                    <div class="layer-info">
                                        <span>Cache Rapide</span>
                                        <small>${this.cacheStorage ? '✅ Actif' : '❌ Indisponible'}</small>
                                    </div>
                                </div>
                                <div class="layer ${this.indexedDB ? 'active' : 'inactive'}">
                                    <i class="fas fa-database"></i>
                                    <div class="layer-info">
                                        <span>Base Persistante</span>
                                        <small>${this.indexedDB ? '✅ Actif' : '❌ Indisponible'}</small>
                                    </div>
                                </div>
                                <div class="layer ${this.opfsAccessGranted ? 'active' : 'inactive'}">
                                    <i class="fas fa-eye-slash"></i>
                                    <div class="layer-info">
                                        <span>Stockage Invisible</span>
                                        <small>${this.opfsAccessGranted ? '✅ OPFS Actif' : '❌ Non disponible'}</small>
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

                    <div class="setting-item success">
                        <div class="invisible-guarantee">
                            <i class="fas fa-user-secret"></i>
                            <div>
                                <h5>🔒 Garantie transparence totale</h5>
                                <p>• Aucun fichier visible sur votre ordinateur<br>
                                • Aucun téléchargement automatique<br>
                                • Stockage sécurisé uniquement dans le navigateur<br>
                                • Sauvegardes automatiques invisibles</p>
                            </div>
                        </div>
                    </div>

                    <div class="setting-item">
                        <button id="manual-backup-btn" class="btn btn-primary">
                            <i class="fas fa-save"></i> Forcer une sauvegarde maintenant
                        </button>
                    </div>

                    <div class="setting-item">
                        <details>
                            <summary>📊 Informations techniques</summary>
                            <div class="backup-details-invisible">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Mode :</strong>
                                        <span>Invisible & Transparent</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Fréquence :</strong>
                                        <span>Toutes les 5 minutes + changements</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Fichiers visibles :</strong>
                                        <span>🚫 Aucun (100% invisible)</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Téléchargements :</strong>
                                        <span>🚫 Jamais</span>
                                    </div>
                                    <div class="detail-item">
                                        <strong>Couches actives :</strong>
                                        <span>${this.getStorageLayersCount()}/4</span>
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
                .invisible-backup-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border-radius: 8px;
                    border-left: 4px solid #0369a1;
                }

                .status-indicator {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    background: #10b981;
                    color: white;
                }

                .layers-invisible {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }

                .layers-invisible .layer {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                }

                .layers-invisible .layer.active {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .layers-invisible .layer.inactive {
                    border-color: #fbbf24;
                    background: #fffbeb;
                }

                .layer-info span {
                    font-weight: 500;
                    display: block;
                    font-size: 14px;
                }

                .layer-info small {
                    color: #6b7280;
                    font-size: 12px;
                }

                .invisible-guarantee {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    color: #059669;
                }

                .invisible-guarantee i {
                    font-size: 20px;
                    margin-top: 2px;
                }

                .invisible-guarantee h5 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                }

                .invisible-guarantee p {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
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
                    font-size: 13px;
                }

                .setting-item.success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 6px;
                    padding: 12px;
                }
                </style>
            `;

            this.attachInvisibleEvents(section);
            return section;
        }

        attachInvisibleEvents(section) {
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

            // Backup manuel
            const manualBtn = section.querySelector('#manual-backup-btn');
            manualBtn?.addEventListener('click', async () => {
                manualBtn.disabled = true;
                manualBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';

                await this.manualBackup();

                manualBtn.disabled = false;
                manualBtn.innerHTML = '<i class="fas fa-save"></i> Forcer une sauvegarde maintenant';
                this.updateUI();
            });
        }

        updateUI() {
            const section = document.querySelector('#invisible-backup-section');
            if (section) {
                section.replaceWith(this.createInvisibleBackupSection());
            }
        }

        // ================================================
        // MÉTHODES D'ÉTAT
        // ================================================
        getStorageLayersCount() {
            let count = 1; // localStorage toujours présent
            if (this.cacheStorage) count++;
            if (this.indexedDB) count++;
            if (this.opfsAccessGranted) count++;
            return count;
        }

        getActiveLayers() {
            const layers = [];
            if (this.cacheStorage) layers.push('Cache');
            if (this.indexedDB) layers.push('IndexedDB');
            if (this.opfsAccessGranted) layers.push('OPFS');
            layers.push('localStorage');
            return layers.join(' + ');
        }

        // ================================================
        // MÉTHODES STANDARDS ADAPTÉES
        // ================================================
        async initializeCacheStorage() {
            try {
                if ('caches' in window) {
                    this.cacheStorage = await caches.open('emailsortpro-invisible-v1');
                    console.log('[Backup] ✅ Cache Storage invisible initialisé');
                    return true;
                }
                
                return false;
                
            } catch (error) {
                console.warn('[Backup] ⚠️ Cache non disponible:', error);
                return false;
            }
        }

        async initializeIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('EmailSortProInvisible', 1);
                
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

        async backupToCache(dataString, timestamp) {
            const cacheKey = `invisible-backup-${timestamp.replace(/[:.]/g, '-')}`;
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
                    .filter(key => key.startsWith('invisible-backup-'))
                    .sort()
                    .reverse();
                
                if (backupKeys.length > this.config.maxBackups.cache) {
                    const toDelete = backupKeys.slice(this.config.maxBackups.cache);
                    for (const key of toDelete) {
                        await this.cacheStorage.delete(key);
                    }
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        async backupToIndexedDB(data) {
            const transaction = this.indexedDB.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            
            const backupData = {
                id: `invisible-backup-${Date.now()}`,
                data: data,
                timestamp: Date.now()
            };
            
            await store.put(backupData);
            
            const index = store.index('timestamp');
            const allKeys = await index.getAllKeys();
            if (allKeys.length > this.config.maxBackups.indexedDB) {
                const sorted = allKeys.sort().reverse();
                const toDelete = sorted.slice(this.config.maxBackups.indexedDB);
                for (const key of toDelete) {
                    await store.delete(key);
                }
            }
        }

        async backupToLocalStorage(data) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const key = `emailsortpro_invisible_backup_${timestamp}`;
                
                localStorage.setItem(key, JSON.stringify(data));
                localStorage.setItem('emailsortpro_invisible_backup_latest', JSON.stringify(data));
                
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
                    .filter(key => key.startsWith('emailsortpro_invisible_backup_'))
                    .sort()
                    .reverse();
                
                if (keys.length > 5) {
                    const toDelete = keys.slice(5);
                    toDelete.forEach(key => localStorage.removeItem(key));
                }
            } catch (error) {
                // Ignore
            }
        }

        // ================================================
        // SURVEILLANCE DES DONNÉES
        // ================================================
        startDataWatching() {
            console.log('[Backup] 👁️ Surveillance invisible des données...');
            
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
                'emailsortpro_invisible_backup_', 'temp_', 'cache_', 'session_',
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
                    this.showNotification('Sauvegarde invisible créée avec succès!', 'success');
                }
                
            } catch (error) {
                console.error(`[Backup] Erreur ${backup.type}:`, error);
            }
        }

        collectData(type) {
            const data = {
                version: '8.0-invisible',
                timestamp: new Date().toISOString(),
                backupType: type,
                mode: this.config.mode,
                storageStrategy: {
                    cache: !!this.cacheStorage,
                    indexedDB: !!this.indexedDB,
                    opfs: this.opfsAccessGranted,
                    localStorage: true,
                    invisible: true,
                    noDownloads: true,
                    noUserFiles: true
                },
                metadata: {
                    backupId: this.generateId(),
                    trigger: type,
                    size: 0,
                    user: this.getCurrentUser(),
                    invisible: true
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
            this.provider = 'invisible';
            console.log('[Backup] Provider: invisible (100% transparent)');
        }

        loadConfig() {
            try {
                const saved = localStorage.getItem('emailsortpro_invisible_backup_config');
                if (saved) {
                    Object.assign(this.config, JSON.parse(saved));
                }
            } catch (error) {
                console.warn('[Backup] Configuration par défaut utilisée');
            }
        }

        saveConfig() {
            try {
                localStorage.setItem('emailsortpro_invisible_backup_config', JSON.stringify(this.config));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        startAutoTimers() {
            console.log('[Backup] ⏰ Timers invisibles...');
            
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
                localStorage.setItem('emailsortpro_invisible_backup_initialized', new Date().toISOString());
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
                localStorage.setItem('emailsortpro_invisible_backup_last', this.lastBackupTime.toISOString());
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde timestamp');
            }
        }

        getLastBackupTime() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_invisible_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_invisible_backup_last')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        showNotification(message, type = 'info') {
            console.log(`[Backup] ${type.toUpperCase()}: ${message}`);
            
            if (window.uiManager && window.uiManager.showToast) {
                window.uiManager.showToast(message, type, 3000);
            }
        }

        fallbackToIndexedDB() {
            console.log('[Backup] 🔧 Mode de secours invisible - IndexedDB + localStorage');
            this.provider = 'invisible';
            this.config.mode = 'invisible-fallback';
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
                    opfs: this.opfsAccessGranted,
                    localStorage: true,
                    invisible: true,
                    noDownloads: true,
                    noUserFiles: true
                },
                lastBackup: this.getLastBackupTime(),
                queueSize: this.backupQueue.length,
                processing: this.isProcessingQueue,
                invisible: true,
                transparent: true
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
        }
    }

    // ================================================
    // INITIALISATION GLOBALE INVISIBLE
    // ================================================
    
    // S'assurer qu'aucun ancien service n'est actif
    if (window.backupService) {
        try {
            window.backupService.stopTimers();
            window.backupService = null;
        } catch (error) {
            // Ignore
        }
    }
    
    window.backupService = new InvisibleBackupService();
    
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
    
    console.log('✅ BackupService INVISIBLE chargé');
    console.log('🔒 Mode totalement transparent : Cache + IndexedDB + OPFS');
    console.log('👻 AUCUN fichier visible JAMAIS - 100% invisible');
    console.log('🚫 AUCUN téléchargement JAMAIS - GARANTIE TOTALE');
    console.log('⚡ Backup transparent : toutes les 5 minutes');
    console.log('🎯 Stockage sécurisé uniquement dans le navigateur');

})();
