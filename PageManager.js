// EmailScanner.js - Version 5.3 - Réparation synchronisation complète

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // RÉPARATION: Gestion synchronisation renforcée
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.taskPreselectedCategories = [];
        this.syncInProgress = false;
        this.syncCallbacks = new Set();
        
        // Initialiser avec les paramètres du CategoryManager
        this.loadSettingsFromCategoryManager();
        this.setupEventListeners();
        this.startSyncMonitoring();
        
        console.log('[EmailScanner] ✅ Version 5.3 - Réparation synchronisation complète');
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées initialisées:', this.taskPreselectedCategories);
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES - RÉPARÉ ET RENFORCÉ
    // ================================================
    loadSettingsFromCategoryManager() {
        console.log('[EmailScanner] 🔄 === CHARGEMENT PARAMÈTRES ===');
        
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] 📊 Settings:', this.settings);
                console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
            } else if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoriesPage.getTaskPreselectedCategories();
                const scanSettings = window.categoriesPage.getScanSettings();
                this.settings = {
                    taskPreselectedCategories: this.taskPreselectedCategories,
                    scanSettings: scanSettings || this.getDefaultSettings().scanSettings
                };
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoriesPage');
                console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
            } else {
                // Fallback localStorage avec validation
                try {
                    const saved = localStorage.getItem('categorySettings');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        this.settings = { ...this.getDefaultSettings(), ...parsed };
                        this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                        
                        console.log('[EmailScanner] ✅ Paramètres chargés depuis localStorage');
                        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                    } else {
                        throw new Error('Aucun paramètre sauvegardé');
                    }
                } catch (storageError) {
                    console.warn('[EmailScanner] ⚠️ Fallback vers paramètres par défaut:', storageError.message);
                    this.settings = this.getDefaultSettings();
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                }
            }
            
            // Validation des paramètres chargés
            this.validateLoadedSettings();
            
            this.lastSettingsSync = Date.now();
            console.log('[EmailScanner] ✅ === PARAMÈTRES CHARGÉS AVEC SUCCÈS ===');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur critique chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            console.log('[EmailScanner] 🔄 Utilisation paramètres par défaut suite à l\'erreur');
        }
    }

    validateLoadedSettings() {
        // S'assurer que taskPreselectedCategories est un array valide
        if (!Array.isArray(this.taskPreselectedCategories)) {
            console.warn('[EmailScanner] ⚠️ taskPreselectedCategories n\'est pas un array, correction...');
            this.taskPreselectedCategories = this.getDefaultSettings().taskPreselectedCategories;
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        }
        
        // Vérifier que les catégories existent
        if (window.categoryManager) {
            const availableCategories = Object.keys(window.categoryManager.getCategories());
            const validCategories = this.taskPreselectedCategories.filter(cat => 
                availableCategories.includes(cat)
            );
            
            if (validCategories.length !== this.taskPreselectedCategories.length) {
                console.warn('[EmailScanner] ⚠️ Certaines catégories pré-sélectionnées n\'existent plus, nettoyage...');
                this.taskPreselectedCategories = validCategories;
                this.settings.taskPreselectedCategories = validCategories;
            }
        }
        
        console.log('[EmailScanner] ✅ Paramètres validés');
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

    // ================================================
    // SURVEILLANCE DE SYNCHRONISATION - AMÉLIORÉE
    // ================================================
    startSyncMonitoring() {
        // Arrêter l'ancien interval s'il existe
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Vérifier la synchronisation toutes les 3 secondes
        this.syncInterval = setInterval(() => {
            this.checkSettingsSync();
        }, 3000);
        
        console.log('[EmailScanner] 🔄 Monitoring de synchronisation démarré');
    }

    checkSettingsSync() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 2000) return; // Éviter les vérifications trop fréquentes
        
        this.lastSettingsSync = now;
        
        try {
            // Vérifier si les paramètres ont changé
            const currentSettings = this.getCurrentSettingsFromSource();
            const settingsChanged = this.hasSettingsChanged(currentSettings);
            
            if (settingsChanged) {
                console.log('[EmailScanner] 🔄 Changement de paramètres détecté, synchronisation...');
                this.synchronizeSettings(currentSettings);
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur vérification sync:', error);
        }
    }

    getCurrentSettingsFromSource() {
        // Priorité 1: CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            const settings = window.categoryManager.getSettings();
            console.log('[EmailScanner] 📥 Paramètres récupérés depuis CategoryManager:', settings);
            return settings;
        }
        
        // Priorité 2: CategoriesPage
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            return {
                taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
                scanSettings: window.categoriesPage.getScanSettings(),
                automationSettings: window.categoriesPage.getAutomationSettings()
            };
        }
        
        // Fallback localStorage
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (error) {
            console.error('[EmailScanner] Erreur lecture settings:', error);
            return this.getDefaultSettings();
        }
    }

    hasSettingsChanged(newSettings) {
        // Comparer les paramètres critiques
        const currentTaskPreselected = this.taskPreselectedCategories || [];
        const newTaskPreselected = newSettings.taskPreselectedCategories || [];
        
        const currentStr = JSON.stringify([...currentTaskPreselected].sort());
        const newStr = JSON.stringify([...newTaskPreselected].sort());
        
        if (currentStr !== newStr) {
            console.log('[EmailScanner] 📋 Changement catégories pré-sélectionnées détecté');
            console.log('  - Ancien:', currentTaskPreselected);
            console.log('  - Nouveau:', newTaskPreselected);
            return true;
        }
        
        // Vérifier d'autres paramètres critiques
        const criticalSettings = ['scanSettings', 'preferences'];
        for (const key of criticalSettings) {
            const currentValue = JSON.stringify(this.settings[key] || {});
            const newValue = JSON.stringify(newSettings[key] || {});
            if (currentValue !== newValue) {
                console.log(`[EmailScanner] 🔧 Changement ${key} détecté`);
                return true;
            }
        }
        
        return false;
    }

    synchronizeSettings(newSettings) {
        if (this.syncInProgress) {
            console.log('[EmailScanner] ⏳ Sync déjà en cours, ajout en queue');
            setTimeout(() => this.synchronizeSettings(newSettings), 100);
            return;
        }
        
        this.syncInProgress = true;
        
        console.log('[EmailScanner] 🚀 === SYNCHRONISATION PARAMÈTRES ===');
        
        // Sauvegarder les anciens paramètres pour comparaison
        const oldTaskPreselected = [...(this.taskPreselectedCategories || [])];
        const oldSettings = { ...this.settings };
        
        // Mettre à jour les paramètres
        this.settings = { ...this.settings, ...newSettings };
        this.taskPreselectedCategories = newSettings.taskPreselectedCategories || [];
        
        // Valider les nouveaux paramètres
        this.validateLoadedSettings();
        
        console.log('[EmailScanner] 📊 Paramètres synchronisés:');
        console.log('  - Anciennes catégories pré-sélectionnées:', oldTaskPreselected);
        console.log('  - Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        console.log('  - Anciens settings:', oldSettings);
        console.log('  - Nouveaux settings:', this.settings);
        
        // Si les catégories pré-sélectionnées ont changé et qu'on a des emails
        const categoriesChanged = JSON.stringify(oldTaskPreselected.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        if (categoriesChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Déclenchement re-catégorisation auto');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        // Notifier les callbacks enregistrés
        this.syncCallbacks.forEach(callback => {
            try {
                callback(this.settings, this.taskPreselectedCategories);
            } catch (error) {
                console.warn('[EmailScanner] Erreur callback sync:', error);
            }
        });
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories,
                source: 'EmailScanner'
            });
        }, 10);
        
        this.syncInProgress = false;
        console.log('[EmailScanner] ✅ Synchronisation terminée');
    }

    // ================================================
    // NOUVELLES MÉTHODES DE MISE À JOUR DIRECTE - RENFORCÉES
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 === MISE À JOUR CATÉGORIES PRÉ-SÉLECTIONNÉES ===');
        console.log('[EmailScanner] 📥 Nouvelles catégories reçues:', categories);
        
        if (!Array.isArray(categories)) {
            console.error('[EmailScanner] ❌ Les catégories doivent être un array');
            return false;
        }
        
        const oldCategories = [...(this.taskPreselectedCategories || [])];
        this.taskPreselectedCategories = [...categories];
        
        // Mettre à jour dans les settings généraux
        if (!this.settings) this.settings = this.getDefaultSettings();
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        console.log('[EmailScanner] 📊 Changement catégories:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        // Si on a des emails et que les catégories ont changé, re-catégoriser
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        if (this.emails.length > 0 && hasChanged) {
            console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        // Notifier les callbacks
        this.syncCallbacks.forEach(callback => {
            try {
                callback(this.settings, this.taskPreselectedCategories);
            } catch (error) {
                console.warn('[EmailScanner] Erreur callback updateTaskPreselectedCategories:', error);
            }
        });
        
        console.log('[EmailScanner] ✅ === CATÉGORIES PRÉ-SÉLECTIONNÉES MISES À JOUR ===');
        return true;
    }

    getTaskPreselectedCategories() {
        const categories = [...(this.taskPreselectedCategories || [])];
        console.log('[EmailScanner] 📤 getTaskPreselectedCategories retourne:', categories);
        return categories;
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 === RECHARGEMENT FORCÉ DES PARAMÈTRES ===');
        
        this.syncInProgress = false; // Reset du verrou
        this.loadSettingsFromCategoryManager();
        
        // Notifier le changement
        setTimeout(() => {
            this.dispatchEvent('emailScannerSettingsReloaded', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories,
                source: 'EmailScanner'
            });
        }, 10);
        
        console.log('[EmailScanner] ✅ Rechargement forcé terminé');
    }

    // ================================================
    // SYSTÈME DE CALLBACKS POUR SYNCHRONISATION
    // ================================================
    onSettingsChange(callback) {
        this.syncCallbacks.add(callback);
        console.log('[EmailScanner] 📞 Callback sync enregistré');
        return () => this.syncCallbacks.delete(callback);
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS - AMÉLIORÉE
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return; // Éviter les doublons
        }

        // Handlers pour éviter les fuites mémoire
        this.settingsChangeHandler = (event) => {
            console.log('[EmailScanner] 📨 Événement categorySettingsChanged reçu:', event.detail);
            if (event.detail && event.detail.settings) {
                this.synchronizeSettings(event.detail.settings);
            } else {
                // Fallback: recharger depuis la source
                this.forceSettingsReload();
            }
        };

        this.generalSettingsChangeHandler = (event) => {
            console.log('[EmailScanner] 📨 Événement settingsChanged reçu:', event.detail);
            const { type, value } = event.detail;
            
            switch (type) {
                case 'taskPreselectedCategories':
                    this.updateTaskPreselectedCategories(value);
                    break;
                case 'scanSettings':
                    if (this.settings) {
                        this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                    }
                    break;
                case 'preferences':
                    if (this.settings) {
                        this.settings.preferences = { ...this.settings.preferences, ...value };
                    }
                    break;
                default:
                    // Pour tout autre changement, recharger complètement
                    this.forceSettingsReload();
            }
        };

        // Événement pour synchronisation forcée
        this.forceSyncHandler = (event) => {
            console.log('[EmailScanner] 🚀 Synchronisation forcée demandée');
            this.forceSettingsReload();
            
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        };

        // Écouter les changements de catégories pré-sélectionnées spécifiquement
        this.taskPreselectedChangeHandler = (event) => {
            console.log('[EmailScanner] 📋 Changement catégories pré-sélectionnées reçu:', event.detail);
            if (event.detail && event.detail.newCategories) {
                this.updateTaskPreselectedCategories(event.detail.newCategories);
            }
        };

        // Ajouter les listeners
        window.addEventListener('categorySettingsChanged', this.settingsChangeHandler);
        window.addEventListener('settingsChanged', this.generalSettingsChangeHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        window.addEventListener('taskPreselectedCategoriesChanged', this.taskPreselectedChangeHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés avec synchronisation temps réel');
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN - AVEC SYNCHRONISATION
    // ================================================
    async scan(options = {}) {
        // FORCER la synchronisation avant le scan
        this.forceSettingsReload();
        
        // Merger les options avec les paramètres sauvegardés
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            // NOUVEAU: Inclure les catégories pré-sélectionnées dans les options
            taskPreselectedCategories: [...this.taskPreselectedCategories]
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;

            console.log('[EmailScanner] 🚀 Démarrage du scan avec options synchronisées:', mergedOptions);
            console.log('[EmailScanner] 📋 Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);

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

            console.log('[EmailScanner] 📧 Récupération des emails du dossier:', mergedOptions.folder);

            // Utiliser la bonne méthode du MailService
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
                throw new Error('Aucune méthode de récupération d\'emails disponible dans MailService');
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] Aucun email trouvé dans la période spécifiée');
                return {
                    success: true,
                    total: 0,
                    categorized: 0,
                    breakdown: {},
                    stats: { processed: 0, errors: 0 },
                    emails: [],
                    taskPreselectedCategories: [...this.taskPreselectedCategories]
                };
            }

            // Étape 2: Catégorisation automatique si activée
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation intelligente des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            // Étape 3: Analyse IA si activée
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour la création de tâches...',
                        progress: { current: 0, total: Math.min(this.emails.length, 10) }
                    });
                }

                await this.analyzeForTasks();
            }

            // Étape 4: Calcul des résultats
            const results = this.getDetailedResults();

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            this.logScanResults(results);
            
            // Notifier les autres modules
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories]
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

    // ================================================
    // CATÉGORISATION AVEC PRISE EN COMPTE PRÉ-SÉLECTION - AMÉLIORÉE
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Catégorisation de', total, 'emails avec CategoryManager');
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);

        const categoryStats = {};
        const categories = window.categoryManager.getCategories();
        
        // Initialiser les stats
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        // Analyser chaque email avec traitement par lots pour les performances
        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Utiliser CategoryManager pour analyser
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Enrichir l'email avec les données de catégorisation
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    
                    // NOUVEAU: Marquer si l'email est dans une catégorie pré-sélectionnée
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                    
                    // Ajouter à la catégorie appropriée
                    const categoryId = email.category;
                    if (this.categorizedEmails[categoryId]) {
                        this.categorizedEmails[categoryId].push(email);
                        categoryStats[categoryId]++;
                    } else {
                        // Fallback vers 'other'
                        this.categorizedEmails.other.push(email);
                        categoryStats.other++;
                        console.warn(`[EmailScanner] Catégorie inconnue ${categoryId}, utilisation de 'other'`);
                    }

                    // Log pour les emails pré-sélectionnés
                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné pour tâche automatique:`, {
                            subject: email.subject?.substring(0, 50),
                            category: email.category,
                            confidence: Math.round(email.categoryConfidence * 100) + '%'
                        });
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

            // Mise à jour progression par batch
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Petite pause pour éviter de bloquer l'UI
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Emails pré-sélectionnés pour tâches:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        this.logTopPatterns();
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - FOCUS SUR PRÉ-SÉLECTIONNÉS
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible, skip analyse IA');
            return;
        }

        // Analyser en priorité les emails pré-sélectionnés
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).slice(0, 8); // Limiter à 8 pour les performances
        
        // Compléter avec d'autres emails importants si besoin
        if (preselectedEmails.length < 5) {
            const otherEmails = this.emails.filter(email => 
                !email.isPreselectedForTasks && 
                email.categoryConfidence > 0.8 &&
                this.taskPreselectedCategories.includes(email.category)
            ).slice(0, 5 - preselectedEmails.length);
            
            preselectedEmails.push(...otherEmails);
        }

        console.log(`[EmailScanner] 🤖 Analyse IA de ${preselectedEmails.length} emails prioritaires`);
        console.log(`[EmailScanner] ⭐ Dont ${preselectedEmails.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < preselectedEmails.length; i++) {
            const email = preselectedEmails[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                // Log spécial pour les emails pré-sélectionnés
                if (email.isPreselectedForTasks && email.taskSuggested) {
                    console.log(`[EmailScanner] ⭐🤖 Tâche suggérée pour email pré-sélectionné:`, {
                        subject: email.subject?.substring(0, 40),
                        category: email.category,
                        taskTitle: analysis.mainTask?.title?.substring(0, 40)
                    });
                }
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${preselectedEmails.length}`,
                        progress: { current: i + 1, total: preselectedEmails.length }
                    });
                }
                
                // Petite pause pour éviter de surcharger l'API
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
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
        console.log('[EmailScanner] ⭐ Dont pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // CALCUL DES RÉSULTATS - AVEC DONNÉES PRÉ-SÉLECTION
    // ================================================
    getDetailedResults() {
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

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
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
                ccDetected: this.emails.filter(e => e.isCC).length
            },
            emails: this.emails,
            settings: this.settings
        };
    }

    // ================================================
    // LOGGING ET DEBUG - AVEC INFO PRÉ-SÉLECTION
    // ================================================
    logScanResults(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS FINAUX ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Suggestions de tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScanner] ⭐ Pré-sélectionnés pour tâches: ${results.stats.preselectedForTasks}`);
        console.log(`[EmailScanner] Spam filtré: ${results.stats.spamFiltered}`);
        console.log(`[EmailScanner] CC détectés: ${results.stats.ccDetected}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log(`[EmailScanner] 📋 Catégories pré-sélectionnées: ${results.taskPreselectedCategories.join(', ')}`);
        
        console.log('[EmailScanner] Distribution par catégorie:');
        
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
                const preselectedMark = isPreselected ? ' ⭐' : '';
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}`);
            }
        });
        
        console.log('[EmailScanner] ========================');
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES - AVEC FILTRAGE PRÉ-SÉLECTION
    // ================================================
    getAllEmails() {
        return [...this.emails]; // Retourner une copie pour éviter les modifications
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return [...this.emails];
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    getEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.taskSuggested);
    }

    getPreselectedEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.isPreselectedForTasks && email.taskSuggested);
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    // ================================================
    // RECATÉGORISATION APRÈS CHANGEMENT DE PARAMÈTRES - AMÉLIORÉE
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === RECATÉGORISATION APRÈS CHANGEMENT PARAMÈTRES ===');
        console.log('[EmailScanner] 📋 Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Recatégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }, 10);
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DEPUIS AUTRES MODULES - RENFORCÉES
    // ================================================
    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 === MISE À JOUR SETTINGS ===');
        console.log('[EmailScanner] 📥 Nouveaux settings:', newSettings);
        
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...newSettings };
        
        // Mettre à jour les catégories pré-sélectionnées si présentes
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
        
        console.log('[EmailScanner] 📊 Settings mis à jour:');
        console.log('  - Anciens:', oldSettings);
        console.log('  - Nouveaux:', this.settings);
    }

    applyScanSettings(scanSettings) {
        console.log('[EmailScanner] 📝 Application scan settings:', scanSettings);
        this.settings.scanSettings = { ...this.settings.scanSettings, ...scanSettings };
    }

    updatePreferences(preferences) {
        console.log('[EmailScanner] 📝 Mise à jour préférences:', preferences);
        this.settings.preferences = { ...this.settings.preferences, ...preferences };
    }

    // ================================================
    // STATISTIQUES ET DEBUG
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails)
                .filter(cat => this.categorizedEmails[cat].length > 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: preselectedCount,
            preselectedWithTasksCount: preselectedWithTasks,
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            categoryManagerAvailable: !!window.categoryManager,
            mailServiceAvailable: !!window.mailService,
            aiTaskAnalyzerAvailable: !!window.aiTaskAnalyzer,
            lastSettingsSync: this.lastSettingsSync,
            syncInterval: !!this.syncInterval,
            syncInProgress: this.syncInProgress,
            syncCallbacksCount: this.syncCallbacks.size
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
            console.log(`[EmailScanner] 📤 Événement dispatché: ${eventName}`, detail);
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

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
        
        // Initialiser avec toutes les catégories du CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // S'assurer que 'other' existe
        this.categorizedEmails.other = [];
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée, catégories:', 
            Object.keys(this.categorizedEmails));
    }

    logTopPatterns() {
        const patternFrequency = {};
        
        this.emails.forEach(email => {
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
            console.log('[EmailScanner] 🔍 Top 10 patterns détectés:');
            topPatterns.forEach(([pattern, count]) => {
                console.log(`  - ${pattern}: ${count} fois`);
            });
        }
    }

    // ================================================
    // MÉTHODES HÉRITÉES ET COMPATIBILITÉ
    // ================================================
    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    searchEmails(query) {
        if (!query) return [...this.emails];

        const searchTerm = query.toLowerCase();
        
        return this.emails.filter(email => {
            const subject = (email.subject || '').toLowerCase();
            const body = (email.bodyPreview || '').toLowerCase();
            const from = (email.from?.emailAddress?.address || '').toLowerCase();
            const fromName = (email.from?.emailAddress?.name || '').toLowerCase();
            const category = (email.category || '').toLowerCase();

            return subject.includes(searchTerm) ||
                   body.includes(searchTerm) ||
                   from.includes(searchTerm) ||
                   fromName.includes(searchTerm) ||
                   category.includes(searchTerm);
        });
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION - AVEC ARRÊT MONITORING
    // ================================================
    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage des données...');
        
        // Arrêter le monitoring de synchronisation
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.settingsChangeHandler) {
            window.removeEventListener('categorySettingsChanged', this.settingsChangeHandler);
        }
        if (this.generalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.generalSettingsChangeHandler);
        }
        if (this.forceSyncHandler) {
            window.removeEventListener('forceSynchronization', this.forceSyncHandler);
        }
        if (this.taskPreselectedChangeHandler) {
            window.removeEventListener('taskPreselectedCategoriesChanged', this.taskPreselectedChangeHandler);
        }
        
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        this.syncCallbacks.clear();
        
        // Nettoyer les données
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        
        console.log('[EmailScanner] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScanner] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v5.3 loaded - Réparation synchronisation complète');
