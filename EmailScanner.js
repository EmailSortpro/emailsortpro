// EmailScanner.js - Version 6.0 - Synchronisation parfaite réparée

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Système de synchronisation robuste
        this.eventListenersSetup = false;
        this.lastSettingsSync = 0;
        this.syncInProgress = false;
        this.syncMonitorInterval = null;
        this.pendingSync = false;
        
        // Statistiques et cache
        this.scanStats = {};
        this.lastScanResults = null;
        
        console.log('[EmailScanner] ✅ Version 6.0 - Synchronisation parfaite réparée');
        
        // Initialisation complète
        this.initializeScanner();
    }

    // ================================================
    // INITIALISATION COMPLÈTE - NOUVELLE
    // ================================================
    initializeScanner() {
        console.log('[EmailScanner] 🚀 === INITIALISATION COMPLÈTE ===');
        
        try {
            // 1. Charger les paramètres initiaux
            this.loadInitialSettings();
            
            // 2. Configurer les événements
            this.setupEventListeners();
            
            // 3. Démarrer la surveillance
            this.startSyncMonitoring();
            
            // 4. Initialiser les catégories
            this.initializeCategorizedEmails();
            
            console.log('[EmailScanner] ✅ Initialisation terminée');
            console.log('[EmailScanner] 📊 Paramètres:', this.settings);
            console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur initialisation:', error);
            this.loadDefaultSettings();
        }
    }

    loadInitialSettings() {
        console.log('[EmailScanner] 📥 === CHARGEMENT PARAMÈTRES INITIAUX ===');
        
        // Priorité 1: CategoryManager
        if (this.loadFromCategoryManager()) {
            console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
            return;
        }
        
        // Priorité 2: CategoriesPage
        if (this.loadFromCategoriesPage()) {
            console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoriesPage');
            return;
        }
        
        // Fallback: localStorage
        if (this.loadFromLocalStorage()) {
            console.log('[EmailScanner] ✅ Paramètres chargés depuis localStorage');
            return;
        }
        
        // Défaut
        this.loadDefaultSettings();
        console.log('[EmailScanner] ✅ Paramètres par défaut chargés');
    }

    loadFromCategoryManager() {
        if (!window.categoryManager || typeof window.categoryManager.getSettings !== 'function') {
            return false;
        }
        
        try {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
            this.lastSettingsSync = Date.now();
            return true;
        } catch (error) {
            console.warn('[EmailScanner] ⚠️ Erreur CategoryManager:', error);
            return false;
        }
    }

    loadFromCategoriesPage() {
        if (!window.categoriesPage) {
            return false;
        }
        
        try {
            this.settings = this.getDefaultSettings();
            
            if (typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoriesPage.getTaskPreselectedCategories();
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
            }
            
            if (typeof window.categoriesPage.getScanSettings === 'function') {
                this.settings.scanSettings = window.categoriesPage.getScanSettings();
            }
            
            this.lastSettingsSync = Date.now();
            return true;
        } catch (error) {
            console.warn('[EmailScanner] ⚠️ Erreur CategoriesPage:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (!saved) return false;
            
            const parsed = JSON.parse(saved);
            this.settings = { ...this.getDefaultSettings(), ...parsed };
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            this.lastSettingsSync = Date.now();
            return true;
        } catch (error) {
            console.warn('[EmailScanner] ⚠️ Erreur localStorage:', error);
            return false;
        }
    }

    loadDefaultSettings() {
        this.settings = this.getDefaultSettings();
        this.taskPreselectedCategories = this.settings.taskPreselectedCategories;
        this.lastSettingsSync = Date.now();
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    initializeCategorizedEmails() {
        this.categorizedEmails = {};
        
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        this.categorizedEmails.other = [];
        console.log('[EmailScanner] ✅ Catégories initialisées:', Object.keys(this.categorizedEmails));
    }

    // ================================================
    // SYSTÈME D'ÉVÉNEMENTS - ROBUSTE
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;

        console.log('[EmailScanner] 🔧 Configuration event listeners...');

        // Handler pour changements de paramètres CategoryManager
        this.categorySettingsHandler = (event) => {
            console.log('[EmailScanner] 📨 categorySettingsChanged reçu:', event.detail);
            this.handleCategorySettingsChanged(event.detail);
        };

        // Handler pour changements génériques
        this.genericSettingsHandler = (event) => {
            console.log('[EmailScanner] 📨 settingsChanged reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        };

        // Handler pour synchronisation forcée
        this.forceSyncHandler = (event) => {
            console.log('[EmailScanner] 🚀 forceSynchronization reçu:', event.detail);
            this.handleForcedSync(event.detail);
        };

        // Handler pour changement spécifique des catégories tâches
        this.taskCategoriesHandler = (event) => {
            console.log('[EmailScanner] 📋 taskPreselectedCategoriesChanged reçu:', event.detail);
            this.handleTaskCategoriesChanged(event.detail);
        };

        // Handler pour recatégorisation
        this.recategorizeHandler = (event) => {
            console.log('[EmailScanner] 🔄 emailsRecategorized reçu:', event.detail);
            this.handleRecategorizeRequest(event.detail);
        };

        // Ajouter les listeners
        window.addEventListener('categorySettingsChanged', this.categorySettingsHandler);
        window.addEventListener('settingsChanged', this.genericSettingsHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        window.addEventListener('taskPreselectedCategoriesChanged', this.taskCategoriesHandler);
        window.addEventListener('emailsRecategorized', this.recategorizeHandler);

        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés');
    }

    handleCategorySettingsChanged(settingsData) {
        console.log('[EmailScanner] 🔧 === TRAITEMENT CHANGEMENT CATEGORY SETTINGS ===');
        
        if (settingsData.settings) {
            this.synchronizeSettings(settingsData.settings);
        }
        
        if (settingsData.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(settingsData.taskPreselectedCategories);
        }
        
        this.triggerRecategorization();
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[EmailScanner] 🔧 === TRAITEMENT CHANGEMENT GÉNÉRIQUE ===');
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.updateTaskPreselectedCategories(value);
                this.triggerRecategorization();
                break;
            case 'scanSettings':
                this.updateScanSettings(value);
                break;
            case 'preferences':
                this.updatePreferences(value);
                this.triggerRecategorization();
                break;
            case 'automationSettings':
                this.updateAutomationSettings(value);
                break;
            default:
                this.forceSettingsReload();
                this.triggerRecategorization();
        }
    }

    handleForcedSync(syncData) {
        console.log('[EmailScanner] 🚀 === SYNCHRONISATION FORCÉE ===');
        this.forceSettingsReload();
        this.triggerRecategorization();
    }

    handleTaskCategoriesChanged(changeData) {
        console.log('[EmailScanner] 📋 === CHANGEMENT CATÉGORIES TÂCHES ===');
        
        if (changeData.newCategories) {
            this.updateTaskPreselectedCategories(changeData.newCategories);
            this.triggerRecategorization();
        }
    }

    handleRecategorizeRequest(requestData) {
        console.log('[EmailScanner] 🔄 === DEMANDE RECATÉGORISATION ===');
        
        if (this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    }

    // ================================================
    // SURVEILLANCE SYNCHRONISATION - ROBUSTE
    // ================================================
    startSyncMonitoring() {
        if (this.syncMonitorInterval) {
            clearInterval(this.syncMonitorInterval);
        }
        
        this.syncMonitorInterval = setInterval(() => {
            this.checkSyncStatus();
        }, 3000); // Vérifier toutes les 3 secondes
        
        console.log('[EmailScanner] 🔍 Surveillance synchronisation démarrée');
    }

    checkSyncStatus() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 2000) return; // Éviter vérifications trop fréquentes
        
        if (this.syncInProgress) return;
        
        try {
            const currentSettings = this.getCurrentSettingsFromSources();
            const hasChanged = this.hasSettingsChanged(currentSettings);
            
            if (hasChanged) {
                console.log('[EmailScanner] 🔄 Changements détectés, synchronisation...');
                this.synchronizeFromSources(currentSettings);
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur vérification sync:', error);
        }
    }

    getCurrentSettingsFromSources() {
        // Essayer CategoryManager en premier
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                return {
                    settings: window.categoryManager.getSettings(),
                    taskPreselectedCategories: window.categoryManager.getTaskPreselectedCategories() || []
                };
            } catch (error) {
                console.warn('[EmailScanner] Erreur lecture CategoryManager:', error);
            }
        }
        
        // Puis CategoriesPage
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            try {
                return {
                    taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
                    settings: {
                        taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
                        scanSettings: window.categoriesPage.getScanSettings?.() || this.settings.scanSettings
                    }
                };
            } catch (error) {
                console.warn('[EmailScanner] Erreur lecture CategoriesPage:', error);
            }
        }
        
        // Fallback localStorage
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    settings: parsed,
                    taskPreselectedCategories: parsed.taskPreselectedCategories || []
                };
            }
        } catch (error) {
            console.warn('[EmailScanner] Erreur lecture localStorage:', error);
        }
        
        return {
            settings: this.settings,
            taskPreselectedCategories: this.taskPreselectedCategories
        };
    }

    hasSettingsChanged(newData) {
        const currentTaskStr = JSON.stringify([...this.taskPreselectedCategories].sort());
        const newTaskStr = JSON.stringify([...newData.taskPreselectedCategories].sort());
        
        if (currentTaskStr !== newTaskStr) {
            console.log('[EmailScanner] 📋 Changement catégories détecté');
            console.log('  - Actuelles:', this.taskPreselectedCategories);
            console.log('  - Nouvelles:', newData.taskPreselectedCategories);
            return true;
        }
        
        // Vérifier d'autres paramètres critiques
        if (newData.settings) {
            const criticalKeys = ['scanSettings', 'preferences', 'automationSettings'];
            for (const key of criticalKeys) {
                const currentValue = JSON.stringify(this.settings[key] || {});
                const newValue = JSON.stringify(newData.settings[key] || {});
                if (currentValue !== newValue) {
                    console.log(`[EmailScanner] 🔧 Changement ${key} détecté`);
                    return true;
                }
            }
        }
        
        return false;
    }

    synchronizeFromSources(newData) {
        if (this.syncInProgress) {
            this.pendingSync = true;
            return;
        }
        
        this.syncInProgress = true;
        console.log('[EmailScanner] 🚀 === SYNCHRONISATION DEPUIS SOURCES ===');
        
        try {
            if (newData.settings) {
                this.synchronizeSettings(newData.settings);
            }
            
            if (newData.taskPreselectedCategories) {
                this.updateTaskPreselectedCategories(newData.taskPreselectedCategories);
            }
            
            this.lastSettingsSync = Date.now();
            
            // Recatégoriser si nécessaire
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.triggerRecategorization();
                }, 100);
            }
            
            console.log('[EmailScanner] ✅ Synchronisation terminée');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur synchronisation:', error);
        } finally {
            this.syncInProgress = false;
            
            // Traiter la synchronisation en attente
            if (this.pendingSync) {
                this.pendingSync = false;
                setTimeout(() => {
                    this.checkSyncStatus();
                }, 500);
            }
        }
    }

    // ================================================
    // MISE À JOUR DES PARAMÈTRES - ROBUSTE
    // ================================================
    synchronizeSettings(newSettings) {
        console.log('[EmailScanner] 📝 Synchronisation settings:', newSettings);
        
        const oldTaskCategories = [...this.taskPreselectedCategories];
        
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        console.log('[EmailScanner] 📊 Settings synchronisés:');
        console.log('  - Anciennes catégories:', oldTaskCategories);
        console.log('  - Nouvelles catégories:', this.taskPreselectedCategories);
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 === MISE À JOUR CATÉGORIES TÂCHES ===');
        console.log('[EmailScanner] 📥 Nouvelles catégories:', categories);
        console.log('[EmailScanner] 📊 Anciennes catégories:', this.taskPreselectedCategories);
        
        if (!Array.isArray(categories)) {
            console.error('[EmailScanner] ❌ categories doit être un array');
            return false;
        }
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = [...categories];
        
        // Mettre à jour dans les settings
        this.settings.taskPreselectedCategories = [...this.taskPreselectedCategories];
        
        console.log('[EmailScanner] 📊 Catégories mises à jour:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        // Marquer tous les emails existants pour les catégories pré-sélectionnées
        this.updateEmailPreselectionFlags();
        
        this.lastSettingsSync = Date.now();
        return true;
    }

    updateScanSettings(scanSettings) {
        console.log('[EmailScanner] 📊 Mise à jour scan settings:', scanSettings);
        this.settings.scanSettings = { ...this.settings.scanSettings, ...scanSettings };
        this.lastSettingsSync = Date.now();
    }

    updatePreferences(preferences) {
        console.log('[EmailScanner] ⚙️ Mise à jour préférences:', preferences);
        this.settings.preferences = { ...this.settings.preferences, ...preferences };
        this.lastSettingsSync = Date.now();
    }

    updateAutomationSettings(automationSettings) {
        console.log('[EmailScanner] 🤖 Mise à jour automation settings:', automationSettings);
        this.settings.automationSettings = { ...this.settings.automationSettings, ...automationSettings };
        this.lastSettingsSync = Date.now();
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 === RECHARGEMENT FORCÉ PARAMÈTRES ===');
        
        this.syncInProgress = false;
        this.pendingSync = false;
        this.loadInitialSettings();
        
        console.log('[EmailScanner] ✅ Rechargement forcé terminé');
    }

    // ================================================
    // GESTION FLAGS PRÉ-SÉLECTION - NOUVELLE
    // ================================================
    updateEmailPreselectionFlags() {
        console.log('[EmailScanner] ⭐ === MISE À JOUR FLAGS PRÉ-SÉLECTION ===');
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        let updatedCount = 0;
        
        this.emails.forEach(email => {
            const wasPreselected = email.isPreselectedForTasks || false;
            const isNowPreselected = email.category && this.taskPreselectedCategories.includes(email.category);
            
            if (wasPreselected !== isNowPreselected) {
                email.isPreselectedForTasks = isNowPreselected;
                updatedCount++;
                
                console.log(`[EmailScanner] ⭐ Email ${isNowPreselected ? 'marqué' : 'démarqué'} pour pré-sélection:`, {
                    subject: email.subject?.substring(0, 50),
                    category: email.category,
                    isPreselected: isNowPreselected
                });
            }
        });
        
        console.log(`[EmailScanner] ✅ ${updatedCount} emails mis à jour pour pré-sélection`);
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailPreselectionUpdated', {
                emails: this.emails,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                source: 'EmailScanner'
            });
        }, 10);
    }

    triggerRecategorization() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ℹ️ Aucun email à recatégoriser');
            return;
        }
        
        console.log('[EmailScanner] 🔄 Déclenchement recatégorisation...');
        
        setTimeout(() => {
            this.recategorizeEmails();
        }, 100);
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN - AMÉLIORÉE
    // ================================================
    async scan(options = {}) {
        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        console.log('[EmailScanner] 🚀 === DÉMARRAGE SCAN V6.0 ===');
        
        // FORCER la synchronisation avant le scan
        this.forceSettingsReload();
        
        // Merger les options avec les paramètres
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            automationSettings: options.automationSettings || this.settings.automationSettings || {}
        };

        console.log('[EmailScanner] 📊 Options de scan avec synchronisation complète:', mergedOptions);
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées actives:', this.taskPreselectedCategories);

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;

            // Vérifier les services requis
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - mergedOptions.days);

            // Étape 1: Récupération des emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails des ${mergedOptions.days} derniers jours...`,
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération emails du dossier:', mergedOptions.folder);

            let emails;
            if (typeof window.mailService.getEmailsFromFolder === 'function') {
                emails = await window.mailService.getEmailsFromFolder(mergedOptions.folder, {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    top: mergedOptions.maxEmails
                });
            } else if (typeof window.mailService.getEmails === 'function') {
                emails = await window.mailService.getEmails({
                    folder: mergedOptions.folder,
                    days: mergedOptions.days,
                    maxEmails: mergedOptions.maxEmails
                });
            } else {
                throw new Error('Aucune méthode de récupération d\'emails disponible');
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] Aucun email trouvé');
                return this.buildEmptyResults(mergedOptions);
            }

            // Étape 2: Catégorisation avec pré-sélection
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation intelligente avec pré-sélection...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmailsWithPreselection();
            }

            // Étape 3: Analyse IA pour les emails pré-sélectionnés
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA prioritaire des emails pré-sélectionnés...',
                        progress: { current: 0, total: Math.min(this.emails.length, 10) }
                    });
                }

                await this.analyzePreselectedEmails();
            }

            // Étape 4: Calcul des résultats enrichis
            const results = this.getEnrichedResults(mergedOptions);

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec synchronisation parfaite !',
                    results
                });
            }

            this.logEnrichedResults(results);
            this.lastScanResults = results;
            
            // Notifier les autres modules
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedEmails: this.emails.filter(e => e.isPreselectedForTasks)
                });
            }, 10);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur: ${error.message}`,
                    error
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    buildEmptyResults(options) {
        return {
            success: true,
            total: 0,
            categorized: 0,
            breakdown: {},
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: { 
                processed: 0, 
                errors: 0,
                preselectedForTasks: 0,
                taskSuggestions: 0,
                averageConfidence: 0,
                averageScore: 0
            },
            emails: [],
            scanOptions: options,
            settings: this.settings
        };
    }

    // ================================================
    // CATÉGORISATION AVEC PRÉ-SÉLECTION - NOUVELLE
    // ================================================
    async categorizeEmailsWithPreselection() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ === CATÉGORISATION AVEC PRÉ-SÉLECTION ===');
        console.log('[EmailScanner] 📧 Total emails:', total);
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);

        const categoryStats = {};
        const categories = window.categoryManager.getCategories();
        
        // Initialiser les stats
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        let preselectedCount = 0;

        // Analyser par lots pour les performances
        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Catégorisation avec CategoryManager
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Enrichir l'email
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    
                    // NOUVEAU: Marquer automatiquement pour pré-sélection
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                    
                    if (email.isPreselectedForTasks) {
                        preselectedCount++;
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné automatiquement:`, {
                            subject: email.subject?.substring(0, 50),
                            category: email.category,
                            confidence: Math.round(email.categoryConfidence * 100) + '%',
                            hasAbsolute: email.hasAbsolute
                        });
                    }
                    
                    // Ajouter à la catégorie appropriée
                    const categoryId = email.category;
                    if (this.categorizedEmails[categoryId]) {
                        this.categorizedEmails[categoryId].push(email);
                        categoryStats[categoryId]++;
                    } else {
                        this.categorizedEmails.other.push(email);
                        categoryStats.other++;
                        console.warn(`[EmailScanner] Catégorie inconnue ${categoryId}, utilisation 'other'`);
                    }

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    errors++;
                }

                processed++;
            }

            // Mise à jour progression
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%) • ${preselectedCount} pré-sélectionnés`,
                    progress: { current: processed, total }
                });
            }

            // Pause pour l'UI
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        console.log('[EmailScanner] ✅ Catégorisation terminée avec pré-sélection');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Emails pré-sélectionnés pour tâches:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        this.logTopPreselectedPatterns();
    }

    logTopPreselectedPatterns() {
        console.log('[EmailScanner] 🔍 === PATTERNS DES EMAILS PRÉ-SÉLECTIONNÉS ===');
        
        const preselectedEmails = this.emails.filter(e => e.isPreselectedForTasks);
        const patternFrequency = {};
        
        preselectedEmails.forEach(email => {
            if (email.matchedPatterns && email.matchedPatterns.length > 0) {
                email.matchedPatterns.forEach(pattern => {
                    const key = `${pattern.type}:${pattern.keyword}`;
                    patternFrequency[key] = (patternFrequency[key] || 0) + 1;
                });
            }
        });
        
        const topPatterns = Object.entries(patternFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        if (topPatterns.length > 0) {
            console.log('[EmailScanner] 🔍 Top patterns emails pré-sélectionnés:');
            topPatterns.forEach(([pattern, count]) => {
                console.log(`  ⭐ ${pattern}: ${count} fois`);
            });
        }
    }

    // ================================================
    // ANALYSE IA POUR EMAILS PRÉ-SÉLECTIONNÉS - AMÉLIORÉE
    // ================================================
    async analyzePreselectedEmails() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible, skip analyse IA');
            return;
        }

        // Prioriser les emails pré-sélectionnés avec haute confiance
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).slice(0, 8);
        
        console.log(`[EmailScanner] 🤖 === ANALYSE IA EMAILS PRÉ-SÉLECTIONNÉS ===`);
        console.log(`[EmailScanner] 🎯 ${preselectedEmails.length} emails prioritaires à analyser`);

        for (let i = 0; i < preselectedEmails.length; i++) {
            const email = preselectedEmails[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                console.log(`[EmailScanner] ⭐🤖 Analyse IA email pré-sélectionné:`, {
                    subject: email.subject?.substring(0, 40),
                    category: email.category,
                    taskSuggested: email.taskSuggested,
                    taskTitle: analysis?.mainTask?.title?.substring(0, 40)
                });
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${preselectedEmails.length} emails pré-sélectionnés`,
                        progress: { current: i + 1, total: preselectedEmails.length }
                    });
                }
                
                // Pause pour éviter surcharge API
                if (i < preselectedEmails.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées total:', totalSuggested);
        console.log('[EmailScanner] ⭐ Tâches suggérées pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // RECATÉGORISATION - AMÉLIORÉE
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        if (this.isScanning) {
            console.log('[EmailScanner] Scan en cours, recatégorisation reportée');
            return;
        }

        console.log('[EmailScanner] 🔄 === RECATÉGORISATION AVEC PRÉ-SÉLECTION ===');
        console.log('[EmailScanner] 📧 Emails à traiter:', this.emails.length);
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser avec les nouveaux paramètres
        await this.categorizeEmailsWithPreselection();
        
        console.log('[EmailScanner] ✅ Recatégorisation terminée');
        
        // Notifier les modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getEnrichedResults({}).breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                source: 'EmailScanner'
            });
        }, 10);
    }

    // ================================================
    // RÉSULTATS ENRICHIS - NOUVEAU
    // ================================================
    getEnrichedResults(scanOptions = {}) {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;

        // Compter par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other') {
                totalCategorized += emails.length;
                
                emails.forEach(email => {
                    if (email.categoryConfidence >= 0.8) {
                        totalWithHighConfidence++;
                    }
                    if (email.hasAbsolute) {
                        totalWithAbsolute++;
                    }
                    if (email.taskSuggested) {
                        totalWithTasks++;
                    }
                    if (email.isPreselectedForTasks) {
                        totalPreselected++;
                    }
                });
            }
        });

        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();
        const preselectedCategories = [...this.taskPreselectedCategories];

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: preselectedCategories,
            scanOptions: scanOptions,
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                absoluteMatches: totalWithAbsolute,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat] > 0).length,
                spamFiltered: this.emails.filter(e => e.isSpam).length,
                ccDetected: this.emails.filter(e => e.isCC).length,
                preselectedCategories: preselectedCategories.length,
                preselectedPercentage: this.emails.length > 0 ? Math.round((totalPreselected / this.emails.length) * 100) : 0
            },
            emails: this.emails,
            settings: this.settings,
            timestamp: Date.now()
        };
    }

    logEnrichedResults(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS ENRICHIS FINAUX ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] ⭐ PRÉ-SÉLECTIONNÉS POUR TÂCHES: ${results.stats.preselectedForTasks} (${results.stats.preselectedPercentage}%)`);
        console.log(`[EmailScanner] Suggestions de tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] 📋 Catégories pré-sélectionnées actives: ${results.taskPreselectedCategories.join(', ')}`);
        
        console.log('[EmailScanner] Distribution par catégorie avec pré-sélection:');
        
        const categories = window.categoryManager?.getCategories() || {};
        const categoryOrder = Object.keys(categories).sort((a, b) => {
            return (categories[b].priority || 50) - (categories[a].priority || 50);
        });
        categoryOrder.push('other');
        
        categoryOrder.forEach(cat => {
            if (results.breakdown[cat] !== undefined && results.breakdown[cat] > 0) {
                const count = results.breakdown[cat];
                const percentage = Math.round((count / results.total) * 100);
                const categoryInfo = categories[cat] || { name: 'Autre', icon: '📌' };
                const isPreselected = this.taskPreselectedCategories.includes(cat);
                const preselectedMark = isPreselected ? ' ⭐ PRÉ-SÉLECTIONNÉE' : '';
                
                const emailsInCategory = this.emails.filter(e => e.category === cat);
                const preselectedInCategory = emailsInCategory.filter(e => e.isPreselectedForTasks).length;
                
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}${preselectedInCategory > 0 ? ` • ${preselectedInCategory} pré-sélectionnés` : ''}`);
            }
        });
        
        console.log('[EmailScanner] ================================');
    }

    // ================================================
    // MÉTHODES D'ACCÈS - ENRICHIES
    // ================================================
    getAllEmails() {
        return [...this.emails];
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return [...this.emails];
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    getPreselectedEmails() {
        const preselected = this.emails.filter(email => email.isPreselectedForTasks);
        console.log(`[EmailScanner] 📋 getPreselectedEmails retourne ${preselected.length} emails`);
        return preselected;
    }

    getEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.taskSuggested);
    }

    getPreselectedEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.isPreselectedForTasks && email.taskSuggested);
    }

    getTaskPreselectedCategories() {
        console.log('[EmailScanner] 📋 getTaskPreselectedCategories retourne:', this.taskPreselectedCategories);
        return [...this.taskPreselectedCategories];
    }

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    // ================================================
    // MÉTHODES UTILITAIRES - AMÉLIORÉES
    // ================================================
    calculateAverageConfidence() {
        if (this.emails.length === 0) return 0;
        
        const totalConfidence = this.emails.reduce((sum, email) => {
            return sum + (email.categoryConfidence || 0);
        }, 0);
        
        return Math.round((totalConfidence / this.emails.length) * 100) / 100;
    }

    calculateAverageScore() {
        if (this.emails.length === 0) return 0;
        
        const totalScore = this.emails.reduce((sum, email) => {
            return sum + (email.categoryScore || 0);
        }, 0);
        
        return Math.round(totalScore / this.emails.length);
    }

    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        this.emails = [];
        this.categorizedEmails = {};
        
        // Réinitialiser avec les catégories du CategoryManager
        this.initializeCategorizedEmails();
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
            console.log(`[EmailScanner] 📤 Événement dispatché: ${eventName}`, detail);
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // MÉTHODES DEBUG - ENRICHIES
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        
        return {
            version: '6.0',
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: preselectedCount,
            preselectedWithTasksCount: preselectedWithTasks,
            categorizedCount: Object.values(this.categorizedEmails).reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails).filter(cat => this.categorizedEmails[cat].length > 0),
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            lastSettingsSync: this.lastSettingsSync,
            syncInProgress: this.syncInProgress,
            pendingSync: this.pendingSync,
            eventListenersSetup: this.eventListenersSetup,
            syncMonitorInterval: !!this.syncMonitorInterval,
            lastScanResults: this.lastScanResults ? {
                total: this.lastScanResults.total,
                preselectedForTasks: this.lastScanResults.stats?.preselectedForTasks,
                timestamp: this.lastScanResults.timestamp
            } : null
        };
    }

    validateSynchronization() {
        console.log('[EmailScanner] 🔍 === VALIDATION SYNCHRONISATION ===');
        
        const issues = [];
        
        // Vérifier la cohérence des catégories pré-sélectionnées
        const settingsCategories = this.settings.taskPreselectedCategories || [];
        const localCategories = this.taskPreselectedCategories || [];
        
        if (JSON.stringify(settingsCategories.sort()) !== JSON.stringify(localCategories.sort())) {
            issues.push('Désynchronisation entre settings.taskPreselectedCategories et taskPreselectedCategories local');
        }
        
        // Vérifier la cohérence avec CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const categoryManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            if (JSON.stringify(categoryManagerCategories.sort()) !== JSON.stringify(localCategories.sort())) {
                issues.push('Désynchronisation avec CategoryManager');
            }
        }
        
        // Vérifier la cohérence des flags emails
        const preselectedEmails = this.emails.filter(e => e.isPreselectedForTasks);
        const shouldBePreselected = this.emails.filter(e => e.category && this.taskPreselectedCategories.includes(e.category));
        
        if (preselectedEmails.length !== shouldBePreselected.length) {
            issues.push(`Incohérence flags pré-sélection: ${preselectedEmails.length} marqués vs ${shouldBePreselected.length} attendus`);
        }
        
        console.log('[EmailScanner] 🔍 Validation synchronisation:');
        if (issues.length === 0) {
            console.log('  ✅ Synchronisation OK');
        } else {
            console.log('  ❌ Problèmes détectés:');
            issues.forEach(issue => console.log(`    - ${issue}`));
        }
        
        return { valid: issues.length === 0, issues };
    }

    // ================================================
    // NETTOYAGE - AMÉLIORÉ
    // ================================================
    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage...');
        
        // Arrêter la surveillance
        if (this.syncMonitorInterval) {
            clearInterval(this.syncMonitorInterval);
            this.syncMonitorInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.eventListenersSetup) {
            if (this.categorySettingsHandler) {
                window.removeEventListener('categorySettingsChanged', this.categorySettingsHandler);
            }
            if (this.genericSettingsHandler) {
                window.removeEventListener('settingsChanged', this.genericSettingsHandler);
            }
            if (this.forceSyncHandler) {
                window.removeEventListener('forceSynchronization', this.forceSyncHandler);
            }
            if (this.taskCategoriesHandler) {
                window.removeEventListener('taskPreselectedCategoriesChanged', this.taskCategoriesHandler);
            }
            if (this.recategorizeHandler) {
                window.removeEventListener('emailsRecategorized', this.recategorizeHandler);
            }
            this.eventListenersSetup = false;
        }
        
        // Nettoyer les données
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        this.syncInProgress = false;
        this.pendingSync = false;
        
        console.log('[EmailScanner] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.lastScanResults = null;
        console.log('[EmailScanner] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

// ===== MÉTHODES DEBUG GLOBALES =====
window.testEmailScannerSync = function() {
    console.group('🧪 TEST EmailScanner Synchronisation');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    const validation = window.emailScanner.validateSynchronization();
    console.log('Validation:', validation);
    
    console.groupEnd();
    return { debugInfo, validation };
};

window.forceEmailScannerSync = function() {
    console.log('[EmailScanner] 🔄 Force synchronisation...');
    window.emailScanner.forceSettingsReload();
    window.emailScanner.updateEmailPreselectionFlags();
    return window.emailScanner.getDebugInfo();
};

window.compareEmailScannerSync = function() {
    console.group('🔍 COMPARAISON SYNCHRONISATION EmailScanner');
    
    const emailScannerCategories = window.emailScanner.getTaskPreselectedCategories();
    const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories();
    const categoriesPageCategories = window.categoriesPage?.getTaskPreselectedCategories?.();
    
    console.log('📧 EmailScanner:', emailScannerCategories);
    console.log('🏷️ CategoryManager:', categoryManagerCategories);
    console.log('⚙️ CategoriesPage:', categoriesPageCategories);
    
    const emailStr = JSON.stringify([...emailScannerCategories].sort());
    const categoryStr = JSON.stringify([...(categoryManagerCategories || [])].sort());
    const pageStr = JSON.stringify([...(categoriesPageCategories || [])].sort());
    
    console.log('🔍 Synchronisation:');
    console.log('  - EmailScanner vs CategoryManager:', emailStr === categoryStr ? '✅ SYNC' : '❌ DESYNC');
    console.log('  - EmailScanner vs CategoriesPage:', emailStr === pageStr ? '✅ SYNC' : '❌ DESYNC');
    
    console.groupEnd();
    
    return {
        emailScanner: emailScannerCategories,
        categoryManager: categoryManagerCategories,
        categoriesPage: categoriesPageCategories,
        isSync: emailStr === categoryStr && emailStr === pageStr
    };
};

console.log('✅ EmailScanner v6.0 loaded - Synchronisation parfaite réparée!');
