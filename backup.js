// backup.js - Version CACHE PRIORITAIRE + tentative forcée Documents
// Stockage automatique dans cache avec tentative intelligente Documents

(function() {
    'use strict';

    class CacheBackupService {
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
                cloud: null,
                queue: null
            };
            
            // Configuration ULTRA AUTOMATIQUE
            this.config = {
                enabled: true,
                mode: 'ultra-auto',           // Mode ultra automatique
                intervals: {
                    auto: 120000,             // 2 minutes (plus fréquent)
                    cloud: 1800000,           // 30 minutes
                    daily: 86400000,          // 24 heures
                    onChange: 15000,          // 15 secondes après changement
                    documentsRetry: 10000     // Essai Documents toutes les 10 sec
                },
                maxBackups: {
                    cache: 15,                // Plus de backups cache
                    indexedDB: 20,            // Plus de backups IndexedDB
                    local: 8,
                    documents: 30
                },
                silentMode: true,
                
                // Stratégie ULTRA aggressive
                cacheFirst: true,             // Cache priorité absolue
                indexedDBSecond: true,        // IndexedDB en second
                tryDocuments: false,          // Désactiver tentatives Documents par défaut
                documentsAutoSetup: false,    // Pas de setup automatique
                lastDocumentsAttempt: 0,
                
                // NOUVEAU: Backup multi-couches
                multiLayerBackup: true,       // Backup dans plusieurs endroits
                instantBackup: true,          // Backup instantané
                backgroundSync: true          // Sync en arrière-plan
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.lastChangeTime = 0;
            this.documentsRetryTimer = null;
            
            this.init();
        }

        // ================================================
        // INITIALISATION ULTRA AUTOMATIQUE
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation ULTRA AUTOMATIQUE...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                await this.initializeCacheStorage();
                await this.initializeIndexedDB(); // Force IndexedDB
                
                // PAS de tentative Documents par défaut - trop intrusif
                if (this.config.tryDocuments) {
                    this.attemptDocumentsAccess();
                }
                
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service ULTRA AUTO prêt - Mode: ${this.config.mode}`);
                console.log(`[Backup] 📦 Cache: ${!!this.cacheStorage} | 🗄️ IndexedDB: ${!!this.indexedDB} | 📁 Documents: Optionnel`);
                
                // Interface optionnelle
                setTimeout(() => this.integrateToSettingsPage(), 2000);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

        // ================================================
        // INITIALISATION DU CACHE STORAGE
        // ================================================
        async initializeCacheStorage() {
            try {
                // Vérifier la disponibilité de CacheStorage
                if ('caches' in window) {
                    this.cacheStorage = await caches.open('emailsortpro-backups-v1');
                    console.log('[Backup] ✅ Cache Storage initialisé');
                    return true;
                }
                
                // Fallback IndexedDB
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

        // ================================================
        // TENTATIVE DOCUMENTS (NON-BLOQUANTE)
        // ================================================
        async attemptDocumentsAccess() {
            if (!this.config.tryDocuments) return;
            
            console.log('[Backup] 🔍 Tentative d\'accès Documents en arrière-plan...');
            
            try {
                // Vérifier si on a déjà un handle sauvegardé
                const savedHandle = await this.loadSavedDocumentsHandle();
                if (savedHandle) {
                    if (await this.testDocumentsHandle(savedHandle)) {
                        this.documentsHandle = savedHandle;
                        this.documentsAccessGranted = true;
                        console.log('[Backup] ✅ Handle Documents restauré avec succès');
                        return;
                    }
                }
                
                // Programmer une tentative de setup plus tard
                this.scheduleDocumentsSetup();
                
            } catch (error) {
                console.log('[Backup] 📝 Documents pas encore disponible:', error.message);
                this.scheduleDocumentsSetup();
            }
        }

        scheduleDocumentsSetup() {
            // Essayer de configurer Documents toutes les 30 secondes
            if (this.documentsRetryTimer) {
                clearInterval(this.documentsRetryTimer);
            }
            
            this.documentsRetryTimer = setInterval(async () => {
                if (this.documentsAccessGranted) {
                    clearInterval(this.documentsRetryTimer);
                    return;
                }
                
                const now = Date.now();
                if (now - this.config.lastDocumentsAttempt > 30000) {
                    this.config.lastDocumentsAttempt = now;
                    await this.silentDocumentsSetup();
                }
            }, 30000);
        }

        async silentDocumentsSetup() {
            try {
                // Cette méthode essaie de façon silencieuse
                // Elle ne fonctionne que si l'utilisateur a déjà donné permission
                if (!window.showDirectoryPicker) return false;
                
                // Essayer avec les options les plus permissives
                const handle = await this.tryGetDocumentsHandle();
                if (handle) {
                    this.documentsHandle = handle;
                    this.documentsAccessGranted = true;
                    await this.saveDocumentsHandle(handle);
                    console.log('[Backup] ✅ Accès Documents obtenu silencieusement');
                    return true;
                }
                
            } catch (error) {
                // Échec silencieux - normal
                return false;
            }
        }

        async tryGetDocumentsHandle() {
            // Cette méthode est tentative - elle échoue silencieusement
            const options = {
                mode: 'readwrite',
                startIn: 'documents',
                id: 'emailsortpro-auto-backup'
            };
            
            try {
                // ATTENTION: Cette ligne va échouer si pas de geste utilisateur
                // Mais on essaie quand même au cas où le navigateur l'autorise
                const parentHandle = await window.showDirectoryPicker(options);
                
                let emailSortProHandle;
                try {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro');
                } catch {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro', { create: true });
                }
                
                await this.testWriteAccess(emailSortProHandle);
                return emailSortProHandle;
                
            } catch (error) {
                // Échec attendu - on continue avec le cache
                return null;
            }
        }

        async saveDocumentsHandle(handle) {
            try {
                // Sauvegarder le handle pour la prochaine fois
                // Note: Les handles peuvent être persistés dans IndexedDB
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
                // Tester si le handle est encore valide
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
        // INTERFACE UTILISATEUR SIMPLE
        // ================================================
        integrateToSettingsPage() {
            const settingsContainer = document.querySelector('#settings-page, .settings-container, .page-content[data-page="settings"], .settings-section');
            
            if (!settingsContainer) {
                console.log('[Backup] Page paramètres non trouvée - Service cache actif');
                return;
            }

            if (settingsContainer.querySelector('#backup-settings-section')) {
                return;
            }

            const backupSection = this.createCacheBackupSection();
            settingsContainer.appendChild(backupSection);
            
            console.log('[Backup] ✅ Section backup cache ajoutée');
        }

        createCacheBackupSection() {
            const section = document.createElement('div');
            section.id = 'backup-settings-section';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3 class="settings-section-title">
                    <i class="fas fa-shield-check"></i> Sauvegarde automatique ULTRA
                </h3>
                <div class="settings-content">
                    <div class="setting-item">
                        <div class="backup-status-ultra">
                            <div class="status-indicator active">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <div class="status-info">
                                <h4>🚀 Sauvegarde ULTRA automatique activée</h4>
                                <p>Multi-couches : Cache + IndexedDB + localStorage en parallèle</p>
                                <small>Backups toutes les 2 minutes + à chaque modification | Dernière : ${this.getLastBackupTime()}</small>
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
                        <div class="backup-layers">
                            <h5>📊 Couches de sauvegarde actives :</h5>
                            <div class="layers-grid">
                                <div class="layer ${this.cacheStorage ? 'active' : 'inactive'}">
                                    <i class="fas fa-database"></i>
                                    <span>Cache Storage</span>
                                    <small>${this.cacheStorage ? '✅ Actif' : '❌ Indisponible'}</small>
                                </div>
                                <div class="layer ${this.indexedDB ? 'active' : 'inactive'}">
                                    <i class="fas fa-archive"></i>
                                    <span>IndexedDB</span>
                                    <small>${this.indexedDB ? '✅ Actif' : '❌ Indisponible'}</small>
                                </div>
                                <div class="layer active">
                                    <i class="fas fa-memory"></i>
                                    <span>localStorage</span>
                                    <small>✅ Toujours actif</small>
                                </div>
                                <div class="layer active">
                                    <i class="fas fa-download"></i>
                                    <span>Dossier local</span>
                                    <small>✅ Téléchargement forcé</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <button id="setup-documents-btn" class="btn btn-secondary" ${this.documentsAccessGranted ? 'disabled' : ''}>
                            <i class="fas fa-folder-plus"></i> ${this.documentsAccessGranted ? 'Documents configuré ✅' : 'Ajouter couche Documents (optionnel)'}
                        </button>
                        <p class="setting-description">
                            Couche supplémentaire : fichiers physiques dans Documents/EmailSortPro
                        </p>
                    </div>
                    
                    <div class="setting-item">
                        <button id="manual-backup-btn" class="btn btn-primary">
                            <i class="fas fa-save"></i> Forcer une sauvegarde maintenant
                        </button>
                    </div>
                    
                    <div class="setting-item">
                        <details>
                            <summary>🔬 Diagnostic détaillé</summary>
                            <div class="backup-details">
                                <p><strong>Mode :</strong> ${this.config.mode} (ultra automatique)</p>
                                <p><strong>Fréquence :</strong> Toutes les 2 minutes + changements</p>
                                <p><strong>Couches actives :</strong> ${this.getActiveLayers()}</p>
                                <p><strong>Cache Storage :</strong> ${this.cacheStorage ? '✅ Opérationnel' : '❌ Indisponible'}</p>
                                <p><strong>IndexedDB :</strong> ${this.indexedDB ? '✅ Opérationnel' : '❌ Indisponible'}</p>
                                <p><strong>localStorage :</strong> ✅ Toujours disponible</p>
                                <p><strong>Documents :</strong> ${this.documentsAccessGranted ? '✅ Configuré' : '⚙️ Non configuré (optionnel)'}</p>
                                <p><strong>Sécurité :</strong> Redondance triple garantie</p>
                            </div>
                        </details>
                    </div>
                </div>
            `;

            this.attachBackupEvents(section);
            return section;
        }

        attachBackupEvents(section) {
            // Toggle activation
            const enabledCheckbox = section.querySelector('#backup-enabled');
            enabledCheckbox?.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enable();
                } else {
                    this.disable();
                }
                this.updateBackupUI();
            });

            // Setup Documents (avec geste utilisateur)
            const setupBtn = section.querySelector('#setup-documents-btn');
            setupBtn?.addEventListener('click', async () => {
                if (this.documentsAccessGranted) return;
                
                setupBtn.disabled = true;
                setupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuration...';
                
                await this.manualDocumentsSetup();
                
                setupBtn.disabled = false;
                setupBtn.innerHTML = `<i class="fas fa-folder"></i> ${this.documentsAccessGranted ? 'Documents configuré ✅' : 'Configurer dossier Documents'}`;
                this.updateBackupUI();
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

        async manualDocumentsSetup() {
            try {
                if (!window.showDirectoryPicker) {
                    this.showNotification('Navigateur non compatible avec l\'accès Documents', 'warning');
                    return false;
                }
                
                // Ici on a un geste utilisateur, donc ça peut marcher
                const parentHandle = await window.showDirectoryPicker({
                    mode: 'readwrite',
                    startIn: 'documents',
                    id: 'emailsortpro-manual-setup'
                });
                
                let emailSortProHandle;
                try {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro');
                } catch {
                    emailSortProHandle = await parentHandle.getDirectoryHandle('EmailSortPro', { create: true });
                }
                
                await this.testWriteAccess(emailSortProHandle);
                
                this.documentsHandle = emailSortProHandle;
                this.documentsAccessGranted = true;
                await this.saveDocumentsHandle(emailSortProHandle);
                
                this.showNotification('✅ Dossier Documents configuré avec succès!', 'success');
                
                // Arrêter les tentatives automatiques
                if (this.documentsRetryTimer) {
                    clearInterval(this.documentsRetryTimer);
                }
                
                return true;
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    this.showNotification('Configuration annulée', 'info');
                } else {
                    this.showNotification('Erreur configuration Documents', 'error');
                }
                return false;
            }
        }

        getActiveLayers() {
            const layers = [];
            if (this.cacheStorage) layers.push('Cache');
            if (this.indexedDB) layers.push('IndexedDB');
            layers.push('localStorage');
            if (this.documentsAccessGranted) layers.push('Documents');
            return layers.join(' + ');
        }

        getLastBackupTime() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        // ================================================
        // SURVEILLANCE DES DONNÉES
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

        // ================================================
        // EXÉCUTION ULTRA AUTOMATIQUE (MULTI-COUCHES)
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
                
                // STRATÉGIE MULTI-COUCHES : Backup dans TOUT ce qui est disponible
                
                // 1. Cache Storage (ultra priorité)
                if (this.cacheStorage) {
                    try {
                        await this.backupToCache(dataString, data.timestamp);
                        successCount++;
                        console.log('[Backup] ✅ Cache Storage');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ Cache Error:', error);
                    }
                }
                
                // 2. IndexedDB (toujours en parallèle)
                if (this.indexedDB) {
                    try {
                        await this.backupToIndexedDB(data);
                        successCount++;
                        console.log('[Backup] ✅ IndexedDB');
                    } catch (error) {
                        console.warn('[Backup] ⚠️ IndexedDB Error:', error);
                    }
                }
                
                // 3. localStorage (toujours en parallèle)
                try {
                    await this.backupToLocalStorage(data);
                    successCount++;
                    console.log('[Backup] ✅ localStorage');
                } catch (error) {
                    console.warn('[Backup] ⚠️ localStorage Error:', error);
                }
                
                // 4. Dossier local FORCÉ (téléchargement automatique)
                try {
                    await this.backupToLocalFolder(dataString, data.timestamp);
                    successCount++;
                    console.log('[Backup] ✅ Dossier local forcé');
                } catch (error) {
                    console.warn('[Backup] ⚠️ Dossier local Error:', error);
                }
                
                // Note: Cloud désactivé pour éviter les erreurs
                
                const success = successCount > 0;
                
                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();
                    
                    // Log du succès seulement si manuel ou occasionnel
                    if (type === 'manual' || Math.random() < 0.1) {
                        console.log(`[Backup] 🎯 Succès multi-couches: ${successCount} emplacements`);
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
        // MÉTHODES DE STOCKAGE
        // ================================================
        async backupToCache(dataString, timestamp) {
            const cacheKey = `backup-${timestamp.replace(/[:.]/g, '-')}`;
            const response = new Response(dataString, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            await this.cacheStorage.put(cacheKey, response);
            
            // Conserver seulement les derniers backups
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
            
            // Nettoyage
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

        async backupToDocuments(dataString, timestamp) {
            const date = new Date(timestamp);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
            
            const fileHandle = await this.documentsHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(dataString);
            await writable.close();
            
            // Créer fichier "latest"
            try {
                const latestHandle = await this.documentsHandle.getFileHandle('EmailSortPro-Latest.json', { create: true });
                const latestWritable = await latestHandle.createWritable();
                await latestWritable.write(dataString);
                await latestWritable.close();
            } catch (error) {
                // Ignore
            }
        }

        // ================================================
        // NOUVEAU: BACKUP DOSSIER LOCAL FORCÉ
        // ================================================
        async backupToLocalFolder(dataString, timestamp) {
            try {
                // Créer un blob avec les données
                const blob = new Blob([dataString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Générer nom de fichier avec timestamp
                const date = new Date(timestamp);
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
                const fileName = `EmailSortPro-Auto-${dateStr}_${timeStr}.json`;
                
                // Créer un lien de téléchargement automatique
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';
                
                // Force le téléchargement vers le dossier par défaut
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Nettoyer l'URL
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                
                console.log(`[Backup] 📁 Fichier forcé: ${fileName}`);
                return true;
                
            } catch (error) {
                console.error('[Backup] Erreur dossier local forcé:', error);
                return false;
            }
        }

        // ================================================
        // BACKUP LOCALSTORAGE (maintenu séparément)
        // ================================================
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

        // ================================================
        // COLLECTE DES DONNÉES
        // ================================================
        collectData(type) {
            const data = {
                version: '6.0-cache',
                timestamp: new Date().toISOString(),
                backupType: type,
                mode: this.config.mode,
                storageStrategy: {
                    cache: !!this.cacheStorage,
                    indexedDB: !!this.indexedDB,
                    documents: this.documentsAccessGranted,
                    localStorage: true
                },
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

        cleanupLocalBackups() {
            try {
                const keys = Object.keys(localStorage)
                    .filter(key => key.startsWith('emailsortpro_backup_'))
                    .sort()
                    .reverse();
                
                if (keys.length > this.config.maxBackups.local) {
                    const toDelete = keys.slice(this.config.maxBackups.local);
                    toDelete.forEach(key => localStorage.removeItem(key));
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage local:', error);
            }
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
        // MÉTHODES CLOUD (simplifiées pour éviter erreurs)
        // ================================================
        isCloudReady() {
            return false; // Désactivé pour éviter les erreurs
        }

        async detectProvider() {
            this.provider = 'local';
            console.log('[Backup] Provider: local (cloud désactivé)');
        }

        isOneDriveReady() {
            return false;
        }

        isGoogleDriveReady() {
            return false;
        }

        // ================================================
        // MÉTHODES DE BASE
        // ================================================
        loadConfig() {
            try {
                const saved = localStorage.getItem('emailsortpro_cache_backup_config');
                if (saved) {
                    Object.assign(this.config, JSON.parse(saved));
                }
            } catch (error) {
                console.warn('[Backup] Configuration par défaut utilisée');
            }
        }

        saveConfig() {
            try {
                localStorage.setItem('emailsortpro_cache_backup_config', JSON.stringify(this.config));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        isOneDriveReady() {
            return window.authService && 
                   typeof window.authService.isAuthenticated === 'function' &&
                   window.authService.isAuthenticated();
        }

        isGoogleDriveReady() {
            return window.googleAuthService && 
                   typeof window.googleAuthService.isAuthenticated === 'function' &&
                   window.googleAuthService.isAuthenticated();
        }

        startAutoTimers() {
            console.log('[Backup] ⏰ Timers automatiques...');
            
            // S'assurer que timers existe
            if (!this.timers) {
                this.timers = {
                    auto: null,
                    daily: null,
                    cloud: null,
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

        showNotification(message, type = 'info') {
            console.log(`[Backup] ${type.toUpperCase()}: ${message}`);
            
            if (window.uiManager && window.uiManager.showToast) {
                window.uiManager.showToast(message, type, 3000);
            }
        }

        fallbackToLocal() {
            console.log('[Backup] 🔧 Mode de secours - localStorage uniquement');
            this.provider = 'local';
            this.config.mode = 'localStorage-only';
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
                    localStorage: true
                },
                lastBackup: this.getLastBackupTime(),
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
    
    window.backupService = new CacheBackupService();
    
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
    
    console.log('✅ BackupService ULTRA AUTOMATIQUE chargé');
    console.log('🚀 Mode QUAD-couches : Cache + IndexedDB + localStorage + Dossier local FORCÉ');
    console.log('📁 DOSSIER LOCAL: Téléchargement automatique dans Téléchargements');
    console.log('⚡ Backup ultra-fréquent : toutes les 2 minutes');
    console.log('🔒 Quadruple redondance garantie');
    console.log('🎯 Fichiers créés automatiquement à chaque backup!');

})();
