// EmailScanner.js - Version 8.2 - CORRECTION CHARGEMENT ET SYNCHRONISATION

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // Système de synchronisation renforcé
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.changeListener = null;
        
        // Support provider unifié
        this.currentProvider = null;
        this.providerMetrics = {
            microsoft: { scansCount: 0, lastScan: null },
            google: { scansCount: 0, lastScan: null }
        };
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // CORRECTION: Initialisation progressive et sécurisée
        this.isInitialized = false;
        this.initializationPromise = null;
        
        console.log('[EmailScanner] ✅ Version 8.2 - Initialisation progressive');
        
        // Démarrer l'initialisation de façon non-bloquante
        this.safeInitialize();
    }

    // ================================================
    // INITIALISATION PROGRESSIVE ET SÉCURISÉE
    // ================================================
    async safeInitialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }

    async performInitialization() {
        try {
            console.log('[EmailScanner] 🚀 Début initialisation...');
            
            // Étape 1: Charger les paramètres (avec retry)
            let settingsLoaded = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await this.loadSettingsFromCategoryManager();
                    settingsLoaded = true;
                    break;
                } catch (error) {
                    console.warn(`[EmailScanner] Tentative ${i + 1} chargement settings échouée:`, error);
                    if (i < 2) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!settingsLoaded) {
                console.warn('[EmailScanner] ⚠️ Chargement settings échoué, utilisation fallback');
                this.loadSettingsFromFallback();
            }
            
            // Étape 2: S'enregistrer comme listener (si possible)
            this.registerAsChangeListener();
            
            // Étape 3: Démarrer la surveillance (si possible)
            this.startRealTimeSync();
            
            // Étape 4: Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[EmailScanner] ✅ Initialisation terminée');
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
            // Dispatch event pour signaler que EmailScanner est prêt
            setTimeout(() => {
                this.dispatchEvent('emailScannerReady', {
                    taskPreselectedCategories: this.taskPreselectedCategories,
                    settings: this.settings
                });
            }, 100);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur initialisation:', error);
            this.isInitialized = false;
        }
    }

    async ensureInitialized() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initializationPromise) {
            await this.initializationPromise;
            return this.isInitialized;
        }
        
        await this.safeInitialize();
        return this.isInitialized;
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            try {
                // S'enregistrer pour recevoir tous les changements en temps réel
                this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                    console.log(`[EmailScanner] 📨 Changement reçu de CategoryManager: ${type}`, value);
                    this.handleCategoryManagerChange(type, value, fullSettings);
                });
                
                console.log('[EmailScanner] 👂 Enregistré comme listener CategoryManager');
            } catch (error) {
                console.warn('[EmailScanner] ⚠️ Erreur enregistrement listener:', error);
            }
        } else {
            console.log('[EmailScanner] ⏳ CategoryManager non disponible pour listener');
        }
    }

    handleCategoryManagerChange(type, value, fullSettings) {
        console.log(`[EmailScanner] 🔄 Traitement changement: ${type}`);
        
        const needsRecategorization = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'preferences'
        ].includes(type);
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', value);
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                break;
                
            case 'activeCategories':
                console.log('[EmailScanner] 🏷️ Mise à jour catégories actives:', value);
                this.settings.activeCategories = value;
                break;
                
            case 'categoryExclusions':
                console.log('[EmailScanner] 🚫 Mise à jour exclusions:', value);
                this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                break;
                
            case 'scanSettings':
                console.log('[EmailScanner] 🔍 Mise à jour scan settings:', value);
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
                
            case 'automationSettings':
                console.log('[EmailScanner] 🤖 Mise à jour automation settings:', value);
                this.settings.automationSettings = { ...this.settings.automationSettings, ...value };
                break;
                
            case 'preferences':
                console.log('[EmailScanner] ⚙️ Mise à jour préférences:', value);
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
                
            case 'fullSync':
            case 'fullSettings':
                console.log('[EmailScanner] 🔄 Synchronisation complète');
                this.settings = { ...this.settings, ...fullSettings };
                this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                break;
        }
        
        // Déclencher la re-catégorisation si nécessaire
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Déclenchement re-catégorisation automatique');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        // Notifier les autres modules du changement
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                type,
                value,
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
    }

    startRealTimeSync() {
        // CORRECTION: Vérification plus robuste
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            if (this.isInitialized) {
                this.checkAndSyncSettings();
            }
        }, 15000); // Réduire la fréquence à 15 secondes
    }

    async checkAndSyncSettings() {
        if (!window.categoryManager || !this.isInitialized) return;
        
        try {
            const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            const currentManagerSettings = window.categoryManager.getSettings();
            
            // Vérifier si les catégories pré-sélectionnées ont changé
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            // Vérifier aussi si de nouvelles catégories ont été créées
            const allCategories = window.categoryManager.getCategories();
            const customCategories = window.categoryManager.getCustomCategories();
            
            let needsRecategorization = categoriesChanged;
            
            // Vérifier si le nombre de catégories a changé
            if (this._lastKnownCategoriesCount !== Object.keys(allCategories).length) {
                console.log('[EmailScanner] 🆕 Nouvelles catégories détectées');
                needsRecategorization = true;
                this._lastKnownCategoriesCount = Object.keys(allCategories).length;
            }
            
            if (categoriesChanged || needsRecategorization) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScanner:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                
                // Forcer la synchronisation
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
                if (this.emails.length > 0 && needsRecategorization) {
                    console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire suite aux changements');
                    await this.recategorizeEmails();
                }
                
                console.log('[EmailScanner] ✅ Synchronisation corrigée');
            }
            
        } catch (error) {
            console.error('[EmailScanner] Erreur vérification sync:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES RENFORCÉ
    // ================================================
    async loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
                
            } catch (error) {
                console.error('[EmailScanner] Erreur chargement CategoryManager:', error);
                throw error;
            }
        } else {
            throw new Error('CategoryManager non disponible');
        }
    }

    loadSettingsFromFallback() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📝 Utilisation paramètres par défaut');
            }
            
            this.lastSettingsSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('[EmailScanner] Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    // ================================================
    // DÉTECTION PROVIDER
    // ================================================
    detectAuthenticatedProvider() {
        console.log('[EmailScanner] 🔍 Détection du provider authentifié...');
        
        // Vérifier Microsoft
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            try {
                if (window.authService.isAuthenticated()) {
                    console.log('[EmailScanner] ✅ Provider détecté: Microsoft');
                    return 'microsoft';
                }
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur vérification Microsoft:', error);
            }
        }
        
        // Vérifier Google
        if (window.googleAuthService && typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                if (window.googleAuthService.isAuthenticated()) {
                    console.log('[EmailScanner] ✅ Provider détecté: Google');
                    return 'google';
                }
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur vérification Google:', error);
            }
        }
        
        console.log('[EmailScanner] ❌ Aucun provider authentifié détecté');
        return null;
    }

    async ensureMailServiceInitialized() {
        console.log('[EmailScanner] 🔧 Vérification MailService...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }
        
        // Vérifier que MailService est initialisé avec le bon provider
        const provider = this.detectAuthenticatedProvider();
        if (!provider) {
            throw new Error('Aucun provider d\'authentification disponible');
        }
        
        // Forcer l'initialisation si nécessaire
        if (!window.mailService.isInitialized || window.mailService.provider !== provider) {
            console.log(`[EmailScanner] 🔄 Réinitialisation MailService pour provider: ${provider}`);
            
            try {
                window.mailService.reset();
                await window.mailService.initialize();
                
                console.log('[EmailScanner] ✅ MailService initialisé avec:', window.mailService.provider);
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur initialisation MailService:', error);
                throw new Error(`Erreur initialisation MailService: ${error.message}`);
            }
        }
        
        this.currentProvider = provider;
        console.log('[EmailScanner] ✅ Provider configuré:', this.currentProvider);
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE
    // ================================================
    async scan(options = {}) {
        // CORRECTION: S'assurer que EmailScanner est initialisé
        await this.ensureInitialized();
        
        if (!this.isInitialized) {
            throw new Error('EmailScanner non initialisé');
        }
        
        // Synchronisation forcée AVANT tout
        console.log('[EmailScanner] 🔄 === SYNCHRONISATION PRÉ-SCAN ===');
        
        // Forcer le rechargement depuis CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées depuis CategoryManager:', this.taskPreselectedCategories);
            
            // Vérifier aussi les settings complets
            const freshSettings = window.categoryManager.getSettings();
            this.settings = { ...this.settings, ...freshSettings };
        }
        
        // Si des catégories sont passées dans les options, les utiliser en priorité
        if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
            console.log('[EmailScanner] 📋 Utilisation des catégories depuis options:', options.taskPreselectedCategories);
            this.taskPreselectedCategories = [...options.taskPreselectedCategories];
        }
        
        // Détection et configuration du provider
        console.log('[EmailScanner] 📡 === DÉTECTION PROVIDER ===');
        await this.ensureMailServiceInitialized();
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            provider: this.currentProvider
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN ===');
            console.log('[EmailScanner] 📊 Options complètes:', mergedOptions);
            console.log('[EmailScanner] 📧 Provider:', this.currentProvider);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);

            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - mergedOptions.days);

            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails des ${mergedOptions.days} derniers jours...`,
                    progress: { current: 0, total: 100 },
                    provider: this.currentProvider
                });
            }

            console.log(`[EmailScanner] 📧 Récupération des emails ${this.currentProvider} du dossier:`, mergedOptions.folder);

            // Récupération des emails selon le provider
            let emails;
            try {
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
                    throw new Error('Aucune méthode de récupération d\'emails disponible dans MailService');
                }
            } catch (emailError) {
                console.error('[EmailScanner] ❌ Erreur récupération emails:', emailError);
                throw new Error(`Erreur récupération emails ${this.currentProvider}: ${emailError.message}`);
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails ${this.currentProvider} récupérés`);
            
            // Mettre à jour les métriques du provider
            this.providerMetrics[this.currentProvider].scansCount++;
            this.providerMetrics[this.currentProvider].lastScan = new Date().toISOString();

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] Aucun email trouvé dans la période spécifiée');
                return {
                    success: true,
                    total: 0,
                    categorized: 0,
                    breakdown: {},
                    stats: { 
                        processed: 0, 
                        errors: 0,
                        preselectedForTasks: 0,
                        highConfidence: 0,
                        absoluteMatches: 0
                    },
                    emails: [],
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    scanMetrics: this.scanMetrics,
                    provider: this.currentProvider
                };
            }

            // Stocker les catégories pré-sélectionnées dans les métriques
            this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];
            this.scanMetrics.provider = this.currentProvider;

            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation intelligente des emails ${this.currentProvider}...`,
                        progress: { current: 0, total: this.emails.length },
                        provider: this.currentProvider
                    });
                }

                // Passer les catégories pré-sélectionnées à la catégorisation
                await this.categorizeEmails(this.taskPreselectedCategories);
            }

            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour la création de tâches...',
                        progress: { current: 0, total: Math.min(this.emails.length, 10) },
                        provider: this.currentProvider
                    });
                }

                await this.analyzeForTasks();
            }

            const results = this.getDetailedResults();

            console.log('[EmailScanner] 🔍 === VÉRIFICATION FINALE ===');
            console.log('[EmailScanner] 📊 Résultats scan:', {
                provider: this.currentProvider,
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks,
                taskPreselectedCategories: results.taskPreselectedCategories
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: `Scan ${this.currentProvider} terminé avec succès !`,
                    results,
                    provider: this.currentProvider
                });
            }

            this.logScanResults(results);
            
            // Dispatch avec toutes les infos nécessaires
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks,
                    scanMetrics: this.scanMetrics,
                    provider: this.currentProvider
                });
            }, 10);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur ${this.currentProvider}: ${error.message}`,
                    error,
                    provider: this.currentProvider
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getAllEmails() {
        return [...this.emails];
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    updateTaskPreselectedCategories(categories) {
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées mises à jour:', this.taskPreselectedCategories);
    }

    // Placeholder pour d'autres méthodes nécessaires
    async categorizeEmails(preselectedCategories) {
        console.log('[EmailScanner] 🏷️ Catégorisation des emails...');
        // Implementation de catégorisation ici
    }

    async recategorizeEmails() {
        console.log('[EmailScanner] 🔄 Re-catégorisation des emails...');
        if (this.emails.length > 0) {
            await this.categorizeEmails(this.taskPreselectedCategories);
        }
    }

    async analyzeForTasks() {
        console.log('[EmailScanner] 🤖 Analyse pour tâches...');
        // Implementation analyse IA ici
    }

    getDetailedResults() {
        return {
            success: true,
            total: this.emails.length,
            categorized: this.emails.length,
            breakdown: {},
            stats: {
                processed: this.emails.length,
                errors: 0,
                preselectedForTasks: 0,
                highConfidence: 0,
                absoluteMatches: 0
            },
            emails: this.emails,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics,
            provider: this.currentProvider
        };
    }

    logScanResults(results) {
        console.log('[EmailScanner] 📊 Résultats détaillés:', results);
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [],
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

    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            provider: this.currentProvider
        };
    }

    setupEventListeners() {
        if (this.eventListenersSetup) return;
        
        // Setup des listeners d'événements
        this.eventListenersSetup = true;
        console.log('[EmailScanner] 👂 Event listeners configurés');
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'EmailScanner',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[EmailScanner] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            currentProvider: this.currentProvider,
            providerMetrics: this.providerMetrics,
            changeListener: !!this.changeListener,
            syncInterval: !!this.syncInterval,
            lastSettingsSync: this.lastSettingsSync,
            scanMetrics: this.scanMetrics,
            version: '8.2'
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage...');
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.changeListener) {
            // Essayer de se désinscrire du CategoryManager
            if (window.categoryManager && typeof window.categoryManager.removeChangeListener === 'function') {
                window.categoryManager.removeChangeListener(this.changeListener);
            }
            this.changeListener = null;
        }
        
        this.isInitialized = false;
        this.isScanning = false;
    }

    destroy() {
        this.cleanup();
        this.emails = [];
        this.categorizedEmails = {};
        this.settings = {};
        console.log('[EmailScanner] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================

// Nettoyer l'ancienne instance
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
    delete window.emailScanner;
}

// Créer la nouvelle instance
window.emailScanner = new EmailScanner();

// Méthodes globales de test et debug
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v8.2');
    
    const scanner = window.emailScanner;
    if (!scanner) {
        console.error('❌ EmailScanner non disponible');
        console.groupEnd();
        return;
    }
    
    const debugInfo = scanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    console.log('Initialisé:', debugInfo.isInitialized);
    console.log('Provider:', debugInfo.currentProvider);
    console.log('Catégories pré-sélectionnées:', debugInfo.taskPreselectedCategories);
    
    console.groupEnd();
    return debugInfo;
};

window.forceEmailScannerInit = async function() {
    if (window.emailScanner) {
        await window.emailScanner.safeInitialize();
        return { success: true, initialized: window.emailScanner.isInitialized };
    }
    return { success: false, message: 'EmailScanner non disponible' };
};

console.log('✅ EmailScanner v8.2 loaded - Correction chargement et synchronisation');
