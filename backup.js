// backup.js - Version AUTOMATIQUE SANS interactions utilisateur
// Backup silencieux en arrière-plan avec téléchargements automatiques

(function() {
    'use strict';

    class AutoBackupService {
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
            
            // Configuration ENTIÈREMENT AUTOMATIQUE
            this.config = {
                enabled: true,
                mode: 'auto-download',     // Mode téléchargement automatique
                intervals: {
                    auto: 600000,          // 10 minutes
                    cloud: 3600000,        // 1 heure  
                    daily: 86400000,       // 24 heures
                    onChange: 60000        // 1 minute après changement
                },
                maxBackups: {
                    local: 3,              // Garder seulement 3 backups locaux
                    downloads: 10          // Télécharger max 10 par jour
                },
                silentMode: true,
                autoDownload: true,        // Téléchargement automatique activé
                downloadCount: 0,          // Compteur quotidien
                lastDownloadDate: null
            };
            
            this.backupQueue = [];
            this.isProcessingQueue = false;
            this.changeTimeout = null;
            this.lastChangeTime = 0;
            
            this.init();
        }

        // ================================================
        // INITIALISATION AUTOMATIQUE
        // ================================================
        async init() {
            console.log('[Backup] 🚀 Initialisation automatique sans interactions...');
            
            try {
                this.loadConfig();
                await this.detectProvider();
                this.startDataWatching();
                await this.createInitialBackup();
                this.startAutoTimers();
                
                this.isInitialized = true;
                console.log(`[Backup] ✅ Service automatique prêt - Mode: ${this.config.mode}`);
                
                // Intégration UI optionnelle
                setTimeout(() => this.integrateToSettingsPage(), 2000);
                
            } catch (error) {
                console.error('[Backup] ❌ Erreur initialisation:', error);
                this.fallbackToLocal();
            }
        }

        // ================================================
        // INTÉGRATION UI SIMPLE
        // ================================================
        integrateToSettingsPage() {
            const settingsContainer = document.querySelector('#settings-page, .settings-container, .page-content[data-page="settings"], .settings-section');
            
            if (!settingsContainer) {
                console.log('[Backup] Page paramètres non trouvée - Service automatique actif');
                return;
            }

            if (settingsContainer.querySelector('#backup-settings-section')) {
                return; // Déjà présent
            }

            const backupSection = this.createSimpleBackupSection();
            settingsContainer.appendChild(backupSection);
            
            console.log('[Backup] ✅ Section backup automatique ajoutée');
        }

        createSimpleBackupSection() {
            const section = document.createElement('div');
            section.id = 'backup-settings-section';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3 class="settings-section-title">
                    <i class="fas fa-shield-check"></i> Sauvegarde automatique
                </h3>
                <div class="settings-content">
                    <div class="setting-item">
                        <div class="backup-status-auto">
                            <div class="status-indicator active">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="status-info">
                                <h4>✅ Sauvegarde automatique activée</h4>
                                <p>Téléchargements automatiques toutes les 10 minutes + à chaque changement</p>
                                <small>Dernière sauvegarde : ${this.getLastBackupTime()}</small>
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
                        <button id="manual-backup-btn" class="btn btn-primary">
                            <i class="fas fa-download"></i> Télécharger une sauvegarde maintenant
                        </button>
                    </div>
                    
                    <div class="setting-item">
                        <details>
                            <summary>Informations détaillées</summary>
                            <div class="backup-details">
                                <p><strong>Mode :</strong> Téléchargement automatique</p>
                                <p><strong>Fréquence :</strong> Toutes les 10 minutes + à chaque modification</p>
                                <p><strong>Téléchargements aujourd'hui :</strong> ${this.getTodayDownloadCount()}</p>
                                <p><strong>Stockage :</strong> Dossier Téléchargements de votre navigateur</p>
                                <p><strong>Format :</strong> EmailSortPro-Backup-YYYY-MM-DD_HH-mm-ss.json</p>
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

            // Backup manuel
            const manualBtn = section.querySelector('#manual-backup-btn');
            manualBtn?.addEventListener('click', async () => {
                manualBtn.disabled = true;
                manualBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Téléchargement...';
                
                await this.manualBackup();
                
                manualBtn.disabled = false;
                manualBtn.innerHTML = '<i class="fas fa-download"></i> Télécharger une sauvegarde maintenant';
                this.updateBackupUI();
            });
        }

        updateBackupUI() {
            const section = document.querySelector('#backup-settings-section');
            if (!section) return;

            const statusInfo = section.querySelector('.status-info small');
            if (statusInfo) {
                statusInfo.textContent = `Dernière sauvegarde : ${this.getLastBackupTime()}`;
            }
        }

        getLastBackupTime() {
            const lastBackup = this.lastBackupTime || 
                (localStorage.getItem('emailsortpro_backup_last') ? 
                 new Date(localStorage.getItem('emailsortpro_backup_last')) : null);
            
            return lastBackup ? lastBackup.toLocaleString('fr-FR') : 'Jamais';
        }

        getTodayDownloadCount() {
            const today = new Date().toDateString();
            if (this.config.lastDownloadDate !== today) {
                this.config.downloadCount = 0;
                this.config.lastDownloadDate = today;
                this.saveConfig();
            }
            return this.config.downloadCount;
        }

        // ================================================
        // TÉLÉCHARGEMENT AUTOMATIQUE
        // ================================================
        async downloadBackup(data, timestamp, type = 'auto') {
            try {
                // Vérifier les limites quotidiennes
                const todayCount = this.getTodayDownloadCount();
                if (type === 'auto' && todayCount >= this.config.maxBackups.downloads) {
                    console.log('[Backup] Limite quotidienne de téléchargements atteinte');
                    return false;
                }

                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                
                const date = new Date(timestamp);
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
                
                a.href = url;
                a.download = `EmailSortPro-Backup-${dateStr}_${timeStr}.json`;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Incrémenter le compteur
                this.config.downloadCount++;
                this.saveConfig();
                
                console.log(`[Backup] 📥 Téléchargement automatique: ${a.download}`);
                return true;
                
            } catch (error) {
                console.error('[Backup] Erreur téléchargement:', error);
                return false;
            }
        }

        // ================================================
        // SURVEILLANCE DES DONNÉES (OPTIMISÉE)
        // ================================================
        startDataWatching() {
            console.log('[Backup] 👁️ Surveillance automatique des données...');
            
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
            
            // Vérification moins fréquente
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
            }, 60000); // Toutes les minutes
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
            
            // Anti-spam plus strict
            const now = Date.now();
            if (now - this.lastChangeTime < 30000) { // 30 secondes minimum
                return;
            }
            this.lastChangeTime = now;
            
            // Log très occasionnel
            if (Math.random() < 0.05) { // 5% seulement
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
        // SYSTÈME DE QUEUE SIMPLIFIÉ
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
                    await this.sleep(500);
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
                    this.showNotification('Sauvegarde téléchargée avec succès!', 'success');
                }
                
            } catch (error) {
                console.error(`[Backup] Erreur ${backup.type}:`, error);
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
                
                // Mode automatique : téléchargement OU localStorage
                if (this.config.mode === 'auto-download') {
                    success = await this.downloadBackup(dataString, data.timestamp, type);
                    
                    // Si téléchargement échoue, fallback localStorage
                    if (!success) {
                        success = await this.backupToLocal(data);
                    }
                } else {
                    // Fallback localStorage uniquement
                    success = await this.backupToLocal(data);
                }
                
                // Cloud backup si disponible et pas auto
                if (this.isCloudReady() && type !== 'auto' && type !== 'onChange') {
                    await this.backupToCloud(data);
                }
                
                if (success) {
                    this.lastBackupTime = new Date();
                    this.saveLastBackupTime();
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
        // COLLECTE DES DONNÉES
        // ================================================
        collectData(type) {
            const data = {
                version: '5.0-auto',
                timestamp: new Date().toISOString(),
                backupType: type,
                mode: this.config.mode,
                metadata: {
                    backupId: this.generateId(),
                    trigger: type,
                    size: 0,
                    user: this.getCurrentUser(),
                    downloadCount: this.getTodayDownloadCount()
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
                }
            } catch (error) {
                console.warn('[Backup] Erreur nettoyage:', error);
            }
        }

        // ================================================
        // MÉTHODES DE BASE
        // ================================================
        loadConfig() {
            try {
                const saved = localStorage.getItem('emailsortpro_auto_backup_config');
                if (saved) {
                    Object.assign(this.config, JSON.parse(saved));
                }
            } catch (error) {
                console.warn('[Backup] Configuration par défaut utilisée');
            }
        }

        saveConfig() {
            try {
                localStorage.setItem('emailsortpro_auto_backup_config', JSON.stringify(this.config));
            } catch (error) {
                console.warn('[Backup] Erreur sauvegarde config');
            }
        }

        async detectProvider() {
            if (this.isOneDriveReady()) {
                this.provider = 'onedrive';
            } else if (this.isGoogleDriveReady()) {
                this.provider = 'googledrive';
            } else {
                this.provider = 'local';
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

        isCloudReady() {
            return (this.provider === 'onedrive' && this.isOneDriveReady()) ||
                   (this.provider === 'googledrive' && this.isGoogleDriveReady());
        }

        startAutoTimers() {
            console.log('[Backup] ⏰ Timers automatiques démarrés...');
            
            // Backup automatique toutes les 10 minutes
            this.timers.auto = setInterval(() => {
                this.queueBackup('auto', 40);
            }, this.config.intervals.auto);
            
            // Backup cloud toutes les heures si disponible
            if (this.provider !== 'local') {
                this.timers.cloud = setInterval(() => {
                    if (this.isCloudReady()) {
                        this.queueBackup('cloud', 60);
                    }
                }, this.config.intervals.cloud);
            }
            
            // Backup quotidien
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

        async backupToCloud(data) {
            // Implementation basique cloud
            return false;
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
            this.config.mode = 'localStorage';
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
                provider: this.provider,
                lastBackup: this.getLastBackupTime(),
                downloadCount: this.getTodayDownloadCount(),
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
    
    window.backupService = new AutoBackupService();
    
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
    
    console.log('✅ BackupService AUTOMATIQUE chargé');
    console.log('📥 Téléchargements automatiques activés');
    console.log('🔇 Mode silencieux - aucune interaction requise');
    console.log('⏰ Backups toutes les 10 minutes + à chaque changement');

})();
