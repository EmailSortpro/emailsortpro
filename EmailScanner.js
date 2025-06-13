// EmailScanner.js - Version 8.0 - Synchronisation complètement fixée

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de synchronisation renforcé
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.changeListener = null;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // NOUVEAU: Initialiser avec synchronisation immédiate
        this.initializeWithSync();
        
        console.log('[EmailScanner] ✅ Version 8.0 - Synchronisation complètement fixée');
    }

    // ================================================
    // INITIALISATION AVEC SYNCHRONISATION IMMÉDIATE
    // ================================================
    async initializeWithSync() {
        // 1. Charger les paramètres depuis CategoryManager
        await this.loadSettingsFromCategoryManager();
        
        // 2. S'enregistrer comme listener de changements
        this.registerAsChangeListener();
        
        // 3. Démarrer la surveillance temps réel
        this.startRealTimeSync();
        
        // 4. Setup event listeners
        this.setupEventListeners();
        
        console.log('[EmailScanner] 🔗 Synchronisation initialisée');
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            // S'enregistrer pour recevoir tous les changements en temps réel
            this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                console.log(`[EmailScanner] 📨 Changement reçu de CategoryManager: ${type}`, value);
                this.handleCategoryManagerChange(type, value, fullSettings);
            });
            
            console.log('[EmailScanner] 👂 Enregistré comme listener CategoryManager');
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
        // Vérification périodique pour s'assurer de la synchronisation
        this.syncInterval = setInterval(() => {
            this.checkAndSyncSettings();
        }, 3000);
    }

    async checkAndSyncSettings() {
        if (!window.categoryManager) return;
        
        try {
            const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            const currentManagerSettings = window.categoryManager.getSettings();
            
            // Vérifier si les catégories pré-sélectionnées ont changé
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            if (categoriesChanged) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScanner:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                
                // Forcer la synchronisation
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
                if (this.emails.length > 0) {
                    this.recategorizeEmails();
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
                console.log('[EmailScanner] 📊 Settings:', this.settings);
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
                
            } catch (error) {
                console.error('[EmailScanner] Erreur chargement CategoryManager:', error);
                return this.loadSettingsFromFallback();
            }
        } else {
            console.warn('[EmailScanner] CategoryManager non disponible, utilisation fallback');
            return this.loadSettingsFromFallback();
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
    // MÉTHODES DE MISE À JOUR DIRECTE RENFORCÉES
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 === updateTaskPreselectedCategories ===');
        console.log('[EmailScanner] 📥 Nouvelles catégories reçues:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Mettre à jour dans les settings locaux
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        console.log('[EmailScanner] 📊 Comparaison:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changement détecté, re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        } else if (!hasChanged) {
            console.log('[EmailScanner] ✅ Aucun changement détecté');
        } else {
            console.log('[EmailScanner] 📝 Changement enregistré (pas d\'emails à re-catégoriser)');
        }
        
        return this.taskPreselectedCategories;
    }

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 updateSettings appelé:', newSettings);
        
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...newSettings };
        
        // Cas spécial pour taskPreselectedCategories
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
        
        // Vérifier si re-catégorisation nécessaire
        const criticalChanges = [
            'activeCategories',
            'categoryExclusions',
            'preferences'
        ].some(key => {
            return JSON.stringify(oldSettings[key]) !== JSON.stringify(newSettings[key]);
        });
        
        if (criticalChanges && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changements critiques détectés, re-catégorisation...');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.settings;
    }


    getTaskPreselectedCategories() {
        // Toujours vérifier d'abord auprès de CategoryManager pour avoir les dernières
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            // Mettre à jour localement si différent
            if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== JSON.stringify([...managerCategories].sort())) {
                console.log('[EmailScanner] 🔄 Mise à jour locale des catégories pré-sélectionnées depuis CategoryManager');
                this.taskPreselectedCategories = [...managerCategories];
            }
        }
        
        const categories = [...this.taskPreselectedCategories];
        console.log('[EmailScanner] 📋 getTaskPreselectedCategories appelé:', categories);
        return categories;
    }

    getSettings() {
        return { ...this.settings };
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 === RECHARGEMENT FORCÉ DES PARAMÈTRES ===');
        
        return this.loadSettingsFromCategoryManager().then(() => {
            console.log('[EmailScanner] ✅ Rechargement terminé');
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
            setTimeout(() => {
                this.dispatchEvent('emailScannerSettingsReloaded', {
                    settings: this.settings,
                    taskPreselectedCategories: this.taskPreselectedCategories
                });
            }, 10);
            
            return this.settings;
        });
    }
// EmailScanner.js - Méthode scan() complète corrigée (remplacer vers ligne 470)

async scan(options = {}) {
    // ÉTAPE 1: Synchronisation forcée AVANT tout
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
    
    // Recharger depuis CategoriesPage si disponible
    if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
        const pageCategories = window.categoriesPage.getTaskPreselectedCategories();
        // Vérifier la cohérence
        if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== JSON.stringify([...pageCategories].sort())) {
            console.warn('[EmailScanner] ⚠️ Incohérence détectée entre CategoryManager et CategoriesPage');
            console.log('  - CategoryManager:', this.taskPreselectedCategories);
            console.log('  - CategoriesPage:', pageCategories);
            // Prioriser CategoryManager
        }
    }
    
    // Si des catégories sont passées dans les options, les utiliser en priorité
    if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
        console.log('[EmailScanner] 📋 Utilisation des catégories depuis options:', options.taskPreselectedCategories);
        this.taskPreselectedCategories = [...options.taskPreselectedCategories];
    }
    
    const scanSettings = this.settings.scanSettings || {};
    const mergedOptions = {
        days: options.days || scanSettings.defaultPeriod || 7,
        folder: options.folder || scanSettings.defaultFolder || 'inbox',
        onProgress: options.onProgress || null,
        includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
        maxEmails: options.maxEmails || 1000,
        autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
        autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
        taskPreselectedCategories: [...this.taskPreselectedCategories] // Toujours passer une copie
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
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);
        
        // Afficher les noms des catégories pour plus de clarté
        if (window.categoryManager && this.taskPreselectedCategories.length > 0) {
            const categoryNames = this.taskPreselectedCategories.map(catId => {
                const cat = window.categoryManager.getCategory(catId);
                return cat ? `${cat.icon} ${cat.name}` : catId;
            });
            console.log('[EmailScanner] 📌 Noms des catégories pré-sélectionnées:', categoryNames);
        }
        
        console.log('[EmailScanner] 🎯 Catégories actives:', window.categoryManager?.getActiveCategories());

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
                progress: { current: 0, total: 100 }
            });
        }

        console.log('[EmailScanner] 📧 Récupération des emails du dossier:', mergedOptions.folder);

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
                stats: { 
                    processed: 0, 
                    errors: 0,
                    preselectedForTasks: 0,
                    highConfidence: 0,
                    absoluteMatches: 0
                },
                emails: [],
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                scanMetrics: this.scanMetrics
            };
        }

        // IMPORTANT: Stocker les catégories pré-sélectionnées dans les métriques
        this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

        if (mergedOptions.autoCategrize) {
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Catégorisation intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
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
                    progress: { current: 0, total: Math.min(this.emails.length, 10) }
                });
            }

            await this.analyzeForTasks();
        }

        const results = this.getDetailedResults();

        // Vérification finale de cohérence
        console.log('[EmailScanner] 🔍 === VÉRIFICATION FINALE ===');
        console.log('[EmailScanner] 📊 Résultats scan:', {
            total: results.total,
            categorized: results.categorized,
            preselectedForTasks: results.stats.preselectedForTasks,
            taskPreselectedCategories: results.taskPreselectedCategories
        });

        if (this.scanProgress) {
            this.scanProgress({
                phase: 'complete',
                message: 'Scan terminé avec succès !',
                results
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
                scanMetrics: this.scanMetrics
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
// EmailScanner.js - Méthode categorizeEmails() complète corrigée (remplacer vers ligne 710)

async categorizeEmails(overridePreselectedCategories = null) {
    const total = this.emails.length;
    let processed = 0;
    let errors = 0;

    // Utiliser les catégories passées en paramètre ou celles de l'instance
    const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
    
    console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION ===');
    console.log('[EmailScanner] 📊 Total emails:', total);
    console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées pour cette catégorisation:', taskPreselectedCategories);
    
    // Vérifier que les catégories existent
    if (window.categoryManager && taskPreselectedCategories.length > 0) {
        const validCategories = [];
        const invalidCategories = [];
        
        taskPreselectedCategories.forEach(catId => {
            const category = window.categoryManager.getCategory(catId);
            if (category) {
                validCategories.push({ id: catId, name: category.name, icon: category.icon });
            } else {
                invalidCategories.push(catId);
            }
        });
        
        console.log('[EmailScanner] ✅ Catégories valides:', validCategories);
        if (invalidCategories.length > 0) {
            console.warn('[EmailScanner] ⚠️ Catégories invalides:', invalidCategories);
        }
    }
    
    console.log('[EmailScanner] 🎯 Catégories actives:', window.categoryManager?.getActiveCategories());

    const categoryStats = {};
    const keywordStats = {};
    const categories = window.categoryManager?.getCategories() || {};
    
    // Initialiser les statistiques
    Object.keys(categories).forEach(catId => {
        categoryStats[catId] = 0;
        keywordStats[catId] = {
            absoluteMatches: 0,
            strongMatches: 0,
            weakMatches: 0,
            exclusionMatches: 0
        };
    });
    categoryStats.other = 0;
    categoryStats.excluded = 0;
    categoryStats.spam = 0;

    // Stats spécifiques pour les catégories pré-sélectionnées
    const preselectedStats = {};
    taskPreselectedCategories.forEach(catId => {
        preselectedStats[catId] = 0;
    });

    const batchSize = 50;
    for (let i = 0; i < this.emails.length; i += batchSize) {
        const batch = this.emails.slice(i, i + batchSize);
        
        for (const email of batch) {
            try {
                // Analyser avec CategoryManager
                const analysis = window.categoryManager.analyzeEmail(email);
                
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
                email.isSpam = analysis.isSpam || false;
                email.isCC = analysis.isCC || false;
                email.isExcluded = analysis.isExcluded || false;
                
                // IMPORTANT: Marquer EXPLICITEMENT si l'email est dans une catégorie pré-sélectionnée
                email.isPreselectedForTasks = taskPreselectedCategories.includes(email.category);
                
                // Log détaillé pour TOUS les emails des catégories pré-sélectionnées
                if (email.isPreselectedForTasks) {
                    const category = window.categoryManager?.getCategory(email.category);
                    console.log(`[EmailScanner] ⭐ Email pré-sélectionné détecté:`, {
                        subject: email.subject?.substring(0, 50),
                        category: email.category,
                        categoryName: category?.name || email.category,
                        categoryIcon: category?.icon || '📂',
                        confidence: Math.round(email.categoryConfidence * 100) + '%',
                        score: email.categoryScore,
                        keywordMatches: email.matchedPatterns?.length || 0,
                        hasAbsolute: email.hasAbsolute
                    });
                    
                    preselectedStats[email.category] = (preselectedStats[email.category] || 0) + 1;
                }
                
                // Analyser les patterns pour stats
                if (email.matchedPatterns && email.matchedPatterns.length > 0) {
                    email.matchedPatterns.forEach(pattern => {
                        if (keywordStats[email.category]) {
                            switch (pattern.type) {
                                case 'absolute':
                                    keywordStats[email.category].absoluteMatches++;
                                    break;
                                case 'strong':
                                    keywordStats[email.category].strongMatches++;
                                    break;
                                case 'weak':
                                    keywordStats[email.category].weakMatches++;
                                    break;
                                case 'exclusion':
                                    keywordStats[email.category].exclusionMatches++;
                                    break;
                            }
                        }
                    });
                }
                
                // Ajouter l'email à la catégorie appropriée
                const categoryId = email.category;
                if (!this.categorizedEmails[categoryId]) {
                    this.categorizedEmails[categoryId] = [];
                }
                
                this.categorizedEmails[categoryId].push(email);
                categoryStats[categoryId] = (categoryStats[categoryId] || 0) + 1;

            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                email.category = 'other';
                email.categoryError = error.message;
                email.isPreselectedForTasks = false;
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.matchedPatterns = [];
                
                if (!this.categorizedEmails.other) {
                    this.categorizedEmails.other = [];
                }
                this.categorizedEmails.other.push(email);
                categoryStats.other = (categoryStats.other || 0) + 1;
                errors++;
            }

            processed++;
        }

        // Mise à jour de la progression
        if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
            const percent = Math.round((processed / total) * 100);
            this.scanProgress({
                phase: 'categorizing',
                message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                progress: { current: processed, total }
            });
        }

        // Pause pour ne pas bloquer l'UI
        if (i < this.emails.length - batchSize) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    // Compter le nombre total d'emails pré-sélectionnés
    const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
    
    // Stocker les métriques
    this.scanMetrics.categorizedCount = processed;
    this.scanMetrics.keywordMatches = keywordStats;
    this.scanMetrics.categoryDistribution = categoryStats;
    this.scanMetrics.preselectedCount = preselectedCount;
    this.scanMetrics.preselectedStats = preselectedStats;
    this.scanMetrics.errors = errors;
    
    console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
    console.log('[EmailScanner] 📊 Distribution par catégorie:', categoryStats);
    console.log('[EmailScanner] ⭐ Total emails pré-sélectionnés:', preselectedCount);
    console.log('[EmailScanner] 📌 Détail par catégorie pré-sélectionnée:', preselectedStats);
    console.log('[EmailScanner] 🔑 Statistiques mots-clés:', keywordStats);
    console.log('[EmailScanner] ⚠️ Erreurs de catégorisation:', errors);
    
    // Afficher les patterns les plus fréquents
    this.logTopPatterns();
    
    // Afficher l'efficacité des mots-clés
    this.logKeywordEffectiveness();
    
    // Vérification finale
    this.verifyPreselectionSync(taskPreselectedCategories);
}
    verifyPreselectionSync() {
        console.log('[EmailScanner] 🔍 === VÉRIFICATION SYNCHRONISATION PRÉ-SÉLECTION ===');
        
        const preselectedEmails = this.emails.filter(e => e.isPreselectedForTasks);
        const preselectedCategories = [...new Set(preselectedEmails.map(e => e.category))];
        
        console.log('[EmailScanner] 📊 Résumé pré-sélection:');
        console.log('  - Catégories configurées:', this.taskPreselectedCategories);
        console.log('  - Catégories détectées:', preselectedCategories);
        console.log('  - Emails pré-sélectionnés:', preselectedEmails.length);
        
        // Vérifier cohérence
        const allPreselectedInConfig = preselectedCategories.every(cat => 
            this.taskPreselectedCategories.includes(cat)
        );
        
        if (!allPreselectedInConfig) {
            console.warn('[EmailScanner] ⚠️ Incohérence détectée dans la pré-sélection');
            console.log('  - Catégories détectées mais non configurées:', 
                preselectedCategories.filter(cat => !this.taskPreselectedCategories.includes(cat))
            );
        } else {
            console.log('[EmailScanner] ✅ Pré-sélection cohérente');
        }
        
        // Log détaillé des emails pré-sélectionnés par catégorie
        this.taskPreselectedCategories.forEach(catId => {
            const emailsInCategory = preselectedEmails.filter(e => e.category === catId);
            if (emailsInCategory.length > 0) {
                console.log(`[EmailScanner] 📋 ${catId}: ${emailsInCategory.length} emails pré-sélectionnés`);
            }
        });
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - PRIORITÉ AUX PRÉ-SÉLECTIONNÉS (inchangé)
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible, skip analyse IA');
            return;
        }

        // PRIORITÉ 1: Emails pré-sélectionnés avec haute confiance
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // PRIORITÉ 2: Autres emails avec très haute confiance
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8 &&
            ['tasks', 'commercial', 'finance', 'meetings'].includes(email.category)
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails prioritaires`);
        console.log(`[EmailScanner] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (email.isPreselectedForTasks && email.taskSuggested) {
                    console.log(`[EmailScanner] ⭐🤖 Tâche suggérée pour email pré-sélectionné:`, {
                        subject: email.subject?.substring(0, 40),
                        category: email.category,
                        taskTitle: analysis.mainTask?.title?.substring(0, 40),
                        keywordMatches: email.matchedPatterns?.length || 0
                    });
                }
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length }
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
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
    // CALCUL DES RÉSULTATS AVEC MÉTRIQUES AVANCÉES (amélioré)
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;
        let totalExcluded = 0;
        let totalSpam = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId === 'spam') {
                totalSpam += emails.length;
            } else if (catId === 'excluded') {
                totalExcluded += emails.length;
            } else if (catId !== 'other') {
                totalCategorized += emails.length;
            }
            
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
        });

        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();
        const scanDuration = this.scanMetrics.startTime ? 
            Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

        // Calculer l'efficacité des mots-clés
        const keywordEffectiveness = this.calculateKeywordEffectiveness();

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
                spamFiltered: totalSpam,
                ccDetected: this.emails.filter(e => e.isCC).length,
                excluded: totalExcluded,
                scanDuration: scanDuration
            },
            keywordStats: this.scanMetrics.keywordMatches,
            keywordEffectiveness: keywordEffectiveness,
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics
        };
    }

    calculateKeywordEffectiveness() {
        const effectiveness = {};
        
        Object.entries(this.scanMetrics.keywordMatches || {}).forEach(([categoryId, matches]) => {
            const total = matches.absoluteMatches + matches.strongMatches + matches.weakMatches;
            const absoluteRatio = total > 0 ? matches.absoluteMatches / total : 0;
            const exclusionImpact = matches.exclusionMatches;
            
            effectiveness[categoryId] = {
                totalMatches: total,
                absoluteRatio: Math.round(absoluteRatio * 100),
                exclusionImpact: exclusionImpact,
                efficiency: total > 0 ? Math.min(100, Math.round((absoluteRatio * 50) + ((total / 10) * 30) + 20)) : 0
            };
        });
        
        return effectiveness;
    }
async recategorizeEmails() {
    if (this.emails.length === 0) {
        console.log('[EmailScanner] Aucun email à recatégoriser');
        return;
    }

    console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
    console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);
    
    // IMPORTANT: Forcer le rechargement complet des catégories et mots-clés
    if (window.categoryManager) {
        // Recharger toutes les catégories
        const allCategories = window.categoryManager.getCategories();
        console.log('[EmailScanner] 📂 Catégories disponibles:', Object.keys(allCategories));
        
        // Vérifier les catégories actives
        const activeCategories = window.categoryManager.getActiveCategories();
        console.log('[EmailScanner] 🎯 Catégories actives:', activeCategories);
        
        // Vérifier les mots-clés pour chaque catégorie
        Object.keys(allCategories).forEach(catId => {
            const keywords = window.categoryManager.getCategoryKeywords(catId);
            const totalKeywords = (keywords.absolute?.length || 0) + 
                                 (keywords.strong?.length || 0) + 
                                 (keywords.weak?.length || 0);
            
            if (totalKeywords > 0) {
                console.log(`[EmailScanner] 📋 Catégorie ${catId} (${allCategories[catId].name}): ${totalKeywords} mots-clés`);
            }
        });
        
        // Forcer la resynchronisation des mots-clés custom
        if (window.categoryManager.customCategories) {
            Object.entries(window.categoryManager.customCategories).forEach(([id, cat]) => {
                console.log(`[EmailScanner] 🎨 Catégorie custom ${id}: ${cat.name}`);
                if (cat.keywords) {
                    window.categoryManager.weightedKeywords[id] = cat.keywords;
                }
            });
        }
    }
    
    // Réinitialiser les métriques
    this.scanMetrics.startTime = Date.now();
    this.scanMetrics.categorizedCount = 0;
    this.scanMetrics.keywordMatches = {};
    this.scanMetrics.categoryDistribution = {};
    
    // Vider les catégories actuelles
    this.categorizedEmails = {};
    
    // Initialiser toutes les catégories
    if (window.categoryManager) {
        const categories = window.categoryManager.getCategories();
        Object.keys(categories).forEach(catId => {
            this.categorizedEmails[catId] = [];
        });
    }
    
    // Ajouter les catégories spéciales
    this.categorizedEmails.other = [];
    this.categorizedEmails.excluded = [];
    this.categorizedEmails.spam = [];

    // Recatégoriser tous les emails
    console.log('[EmailScanner] 🔄 Recatégorisation de', this.emails.length, 'emails...');
    await this.categorizeEmails(this.taskPreselectedCategories);
    
    const duration = Math.round((Date.now() - this.scanMetrics.startTime) / 1000);
    console.log(`[EmailScanner] ✅ Re-catégorisation terminée en ${duration}s`);
    
    // Afficher les résultats
    const categorized = Object.values(this.categorizedEmails)
        .filter(emails => emails.length > 0)
        .reduce((acc, emails) => acc + emails.length, 0);
    
    console.log('[EmailScanner] 📊 Résultats recatégorisation:');
    Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
        if (emails.length > 0) {
            const category = window.categoryManager?.getCategory(catId);
            const name = category ? `${category.icon} ${category.name}` : catId;
            const isPreselected = this.taskPreselectedCategories.includes(catId);
            console.log(`  - ${name}: ${emails.length} emails${isPreselected ? ' ⭐' : ''}`);
        }
    });
    
    // Notifier les autres modules
    setTimeout(() => {
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResults().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            categorizedCount: categorized
        });
    }, 10);
}
    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES (inchangées)
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
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    getEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.taskSuggested);
    }

    getPreselectedEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.isPreselectedForTasks && email.taskSuggested);
    }

    getEmailsWithKeywordType(keywordType) {
        return this.emails.filter(email => 
            email.matchedPatterns && 
            email.matchedPatterns.some(pattern => pattern.type === keywordType)
        );
    }

    getCategoryKeywordStats(categoryId) {
        const emails = this.getEmailsByCategory(categoryId);
        const stats = {
            totalEmails: emails.length,
            withKeywords: 0,
            absoluteMatches: 0,
            strongMatches: 0,
            weakMatches: 0,
            exclusions: 0,
            avgConfidence: 0,
            avgScore: 0
        };

        emails.forEach(email => {
            if (email.matchedPatterns && email.matchedPatterns.length > 0) {
                stats.withKeywords++;
                
                email.matchedPatterns.forEach(pattern => {
                    switch (pattern.type) {
                        case 'absolute':
                            stats.absoluteMatches++;
                            break;
                        case 'strong':
                            stats.strongMatches++;
                            break;
                        case 'weak':
                            stats.weakMatches++;
                            break;
                        case 'exclusion':
                            stats.exclusions++;
                            break;
                    }
                });
            }
            
            stats.avgConfidence += email.categoryConfidence || 0;
            stats.avgScore += email.categoryScore || 0;
        });

        if (emails.length > 0) {
            stats.avgConfidence = Math.round((stats.avgConfidence / emails.length) * 100) / 100;
            stats.avgScore = Math.round(stats.avgScore / emails.length);
        }

        return stats;
    }

    // ================================================
    // LOGGING ET DEBUG AMÉLIORÉ (avec pré-sélection)
    // ================================================
    logScanResults(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS FINAUX COMPLETS ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Suggestions de tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScanner] ⭐ PRÉ-SÉLECTIONNÉS POUR TÂCHES: ${results.stats.preselectedForTasks}`);
        console.log(`[EmailScanner] Spam filtré: ${results.stats.spamFiltered}`);
        console.log(`[EmailScanner] CC détectés: ${results.stats.ccDetected}`);
        console.log(`[EmailScanner] Exclus: ${results.stats.excluded}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log(`[EmailScanner] Durée du scan: ${results.stats.scanDuration}s`);
        console.log(`[EmailScanner] 📋 Catégories pré-sélectionnées configurées: ${results.taskPreselectedCategories.join(', ')}`);
        
        console.log('[EmailScanner] Distribution par catégorie:');
        
        const categories = window.categoryManager?.getCategories() || {};
        const categoryOrder = Object.keys(categories).sort((a, b) => {
            return (categories[b].priority || 50) - (categories[a].priority || 50);
        });
        categoryOrder.push('other', 'excluded', 'spam');
        
        categoryOrder.forEach(cat => {
            if (results.breakdown[cat] !== undefined && results.breakdown[cat] > 0) {
                const count = results.breakdown[cat];
                const percentage = Math.round((count / results.total) * 100);
                const categoryInfo = window.categoryManager?.getCategory(cat) || { name: cat, icon: '📌' };
                const isPreselected = this.taskPreselectedCategories.includes(cat);
                const preselectedMark = isPreselected ? ' ⭐ PRÉ-SÉLECTIONNÉ' : '';
                const effectiveness = results.keywordEffectiveness[cat];
                const efficiencyMark = effectiveness ? ` (${effectiveness.efficiency}% eff.)` : '';
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}${efficiencyMark}`);
            }
        });
        
        // Résumé de pré-sélection
        console.log('[EmailScanner] 📋 === RÉSUMÉ PRÉ-SÉLECTION ===');
        console.log(`[EmailScanner] Total pré-sélectionnés: ${results.stats.preselectedForTasks}`);
        this.taskPreselectedCategories.forEach(catId => {
            const categoryEmails = this.emails.filter(e => e.category === catId);
            const preselectedInCategory = categoryEmails.filter(e => e.isPreselectedForTasks);
            const categoryInfo = window.categoryManager?.getCategory(catId) || { name: catId, icon: '📂' };
            console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${preselectedInCategory.length}/${categoryEmails.length} pré-sélectionnés`);
        });
        
        console.log('[EmailScanner] ===============================');
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
            .slice(0, 15);
        
        if (topPatterns.length > 0) {
            console.log('[EmailScanner] 🔍 Top 15 patterns détectés:');
            topPatterns.forEach(([pattern, count]) => {
                console.log(`  - ${pattern}: ${count} fois`);
            });
        }
    }

    logKeywordEffectiveness() {
        const effectiveness = this.calculateKeywordEffectiveness();
        
        console.log('[EmailScanner] 🎯 Efficacité des mots-clés par catégorie:');
        Object.entries(effectiveness).forEach(([categoryId, stats]) => {
            const category = window.categoryManager?.getCategory(categoryId);
            if (stats.totalMatches > 0) {
                const isPreselected = this.taskPreselectedCategories.includes(categoryId);
                const preselectedMark = isPreselected ? ' ⭐' : '';
                console.log(`  ${category?.icon || '📂'} ${category?.name || categoryId}${preselectedMark}:`);
                console.log(`    - Matches totaux: ${stats.totalMatches}`);
                console.log(`    - Ratio absolus: ${stats.absoluteRatio}%`);
                console.log(`    - Exclusions: ${stats.exclusionImpact}`);
                console.log(`    - Efficacité: ${stats.efficiency}%`);
            }
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES (inchangées sauf debug)
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        const keywordEffectiveness = this.calculateKeywordEffectiveness();
        
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
            scanMetrics: this.scanMetrics,
            keywordEffectiveness: keywordEffectiveness,
            // NOUVEAU: Informations de synchronisation
            changeListener: !!this.changeListener,
            syncStatus: {
                lastSync: this.lastSettingsSync,
                categoriesInSync: this.verifyCategoriesSync(),
                settingsSource: window.categoryManager ? 'CategoryManager' : 'localStorage'
            }
        };
    }

    verifyCategoriesSync() {
        if (!window.categoryManager) return false;
        
        const managerCategories = window.categoryManager.getTaskPreselectedCategories();
        return JSON.stringify([...this.taskPreselectedCategories].sort()) === 
               JSON.stringify([...managerCategories].sort());
    }

    // ================================================
    // MÉTHODES UTILITAIRES INTERNES (inchangées)
    // ================================================
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
        
        // Réinitialiser les métriques
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // Initialiser avec toutes les catégories du CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // S'assurer que les catégories spéciales existent
        this.categorizedEmails.other = [];
        this.categorizedEmails.excluded = [];
        this.categorizedEmails.spam = [];
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée, catégories:', 
            Object.keys(this.categorizedEmails));
    }

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
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
            const keywords = email.matchedPatterns ? 
                email.matchedPatterns.map(p => p.keyword).join(' ').toLowerCase() : '';

            return subject.includes(searchTerm) ||
                   body.includes(searchTerm) ||
                   from.includes(searchTerm) ||
                   fromName.includes(searchTerm) ||
                   category.includes(searchTerm) ||
                   keywords.includes(searchTerm);
        });
    }

    filterEmailsByConfidence(minConfidence = 0.7) {
        return this.emails.filter(email => 
            (email.categoryConfidence || 0) >= minConfidence
        );
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
setupEventListeners() {
    if (this.eventListenersSetup) {
        return;
    }

    // Écouter seulement les événements externes spécifiques
    this.keywordsUpdateHandler = (event) => {
        console.log('[EmailScanner] 🔑 Mots-clés mis à jour pour catégorie:', event.detail.categoryId);
        if (this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 200);
        }
    };

    this.forceSyncHandler = (event) => {
        // Ignorer nos propres événements
        if (event.detail?.source === 'EmailScanner') {
            return;
        }
        
        console.log('[EmailScanner] 🚀 Synchronisation forcée demandée');
        this.forceSettingsReload();
        
        if (this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    };
    
    // NOUVEAU: Écouter les mises à jour de catégories
    this.categoriesUpdateHandler = (event) => {
        console.log('[EmailScanner] 📂 Catégories mises à jour:', event.detail);
        
        // Recharger les catégories depuis CategoryManager
        if (window.categoryManager) {
            // Forcer le rechargement complet
            this.loadSettingsFromCategoryManager();
            
            // Si des emails sont déjà chargés, les recatégoriser
            if (this.emails.length > 0) {
                console.log('[EmailScanner] 🔄 Recatégorisation suite à nouvelle catégorie');
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        }
    };

    window.addEventListener('categoriesUpdated', this.categoriesUpdateHandler);
    window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
    window.addEventListener('forceSynchronization', this.forceSyncHandler);
    
    this.eventListenersSetup = true;
    console.log('[EmailScanner] ✅ Event listeners configurés (avec support catégories)');
}

    // ================================================
    // EXPORT AVEC DONNÉES PRÉ-SÉLECTION ET MOTS-CLÉS (inchangé)
    // ================================================
    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: this.getDetailedResults().stats,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            keywordEffectiveness: this.calculateKeywordEffectiveness(),
            categories: {},
            emails: []
        };

        // Ajouter le résumé par catégorie avec stats mots-clés
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            const preselectedInCategory = emails.filter(e => e.isPreselectedForTasks).length;
            const keywordStats = this.getCategoryKeywordStats(catId);
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                preselectedCount: preselectedInCategory,
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId),
                avgScore: emails.length > 0 ? 
                    Math.round(emails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / emails.length) : 0,
                keywordStats: keywordStats,
                effectiveness: this.scanMetrics.keywordMatches[catId] || {}
            };
        });

        // Ajouter les détails des emails avec infos mots-clés
        data.emails = this.emails.map(email => ({
            id: email.id,
            date: email.receivedDateTime,
            from: {
                name: email.from?.emailAddress?.name,
                email: email.from?.emailAddress?.address
            },
            subject: email.subject,
            category: email.category,
            confidence: email.categoryConfidence,
            score: email.categoryScore,
            hasAbsolute: email.hasAbsolute,
            taskSuggested: email.taskSuggested,
            isPreselectedForTasks: email.isPreselectedForTasks,
            isSpam: email.isSpam,
            isCC: email.isCC,
            isExcluded: email.isExcluded,
            patterns: email.matchedPatterns?.map(p => ({
                type: p.type,
                keyword: p.keyword,
                score: p.score
            })),
            keywordMatchCount: email.matchedPatterns?.length || 0,
            aiAnalysis: email.aiAnalysis ? {
                summary: email.aiAnalysis.summary,
                importance: email.aiAnalysis.importance,
                hasTask: !!email.aiAnalysis.mainTask
            } : null
        }));

        return JSON.stringify(data, null, 2);
    }

    exportToCSV() {
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Patterns', 'Mots-clés', 'Absolu', 'Tâche Suggérée', 'Pré-sélectionné', 'Exclus']
        ];

        this.emails.forEach(email => {
            const categoryInfo = window.categoryManager?.getCategory(email.category) || 
                { name: email.category || 'other' };
            
            const keywordTypes = email.matchedPatterns ? 
                email.matchedPatterns.map(p => `${p.type}:${p.keyword}`).join('; ') : '';
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo.name,
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                (email.matchedPatterns || []).length,
                keywordTypes,
                email.hasAbsolute ? 'Oui' : 'Non',
                email.taskSuggested ? 'Oui' : 'Non',
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.isExcluded ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Ajouter BOM pour UTF-8
        return '\ufeff' + csv;
    }

    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Export des résultats en', format);
        
        if (this.emails.length === 0) {
            if (window.uiManager) {
                window.uiManager.showToast('Aucune donnée à exporter', 'warning');
            }
            return;
        }

        try {
            let content, filename, mimeType;

            if (format === 'csv') {
                content = this.exportToCSV();
                filename = `email_scan_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else {
                content = this.exportToJSON();
                filename = `email_scan_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json;charset=utf-8;';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            if (window.uiManager) {
                window.uiManager.showToast(`${this.emails.length} emails exportés avec métriques mots-clés`, 'success');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    // ================================================
    // ACTIONS BATCH (inchangées)
    // ================================================
    async performBatchAction(emailIds, action) {
        console.log(`[EmailScanner] 🔄 Action ${action} sur ${emailIds.length} emails`);

        if (!window.mailService) {
            console.error('[EmailScanner] MailService non disponible');
            return;
        }

        try {
            switch (action) {
                case 'markAsRead':
                    if (typeof window.mailService.markAsRead === 'function') {
                        const promises = emailIds.map(id => window.mailService.markAsRead(id));
                        await Promise.allSettled(promises);
                    }
                    break;

                case 'delete':
                    if (typeof window.mailService.deleteEmails === 'function') {
                        await window.mailService.deleteEmails(emailIds);
                    }
                    break;

                case 'moveToSpam':
                    if (typeof window.mailService.moveToFolder === 'function') {
                        const spamPromises = emailIds.map(id => 
                            window.mailService.moveToFolder(id, 'junkemail')
                        );
                        await Promise.allSettled(spamPromises);
                    }
                    break;

                default:
                    console.warn(`[EmailScanner] Action inconnue: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] Erreur action batch:`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    // ================================================
    // MÉTHODES DE TEST ET DEBUG AMÉLIORÉES
    // ================================================
    testCategorization(emailSample) {
        console.log('[EmailScanner] 🧪 === TEST CATEGORISATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScanner] CategoryManager non disponible');
            return null;
        }
        
        const result = window.categoryManager.analyzeEmail(emailSample);
        const isPreselected = this.taskPreselectedCategories.includes(result.category);
        
        console.log('Email:', emailSample.subject);
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns:', result.matchedPatterns);
        console.log('Match absolu:', result.hasAbsolute ? '✅ OUI' : '❌ NON');
        console.log('Pré-sélectionné pour tâche:', isPreselected ? '⭐ OUI' : '❌ NON');
        console.log('Nb mots-clés détectés:', result.matchedPatterns?.length || 0);
        console.log('============================');
        
        return { ...result, isPreselectedForTasks: isPreselected };
    }

    optimizeMemory() {
        // Garder seulement les propriétés essentielles des emails
        this.emails.forEach(email => {
            delete email.body; // Supprimer le corps complet pour économiser la mémoire
            delete email.aiAnalysisError;
            delete email.categoryError;
            
            // Optimiser les patterns de mots-clés
            if (email.matchedPatterns && email.matchedPatterns.length > 10) {
                email.matchedPatterns = email.matchedPatterns.slice(0, 10);
            }
        });
        
        console.log('[EmailScanner] 🚀 Mémoire optimisée');
    }

    enableDebugMode() {
        this.debugMode = true;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(true);
        }
        console.log('[EmailScanner] 🐛 Mode debug activé');
    }

    disableDebugMode() {
        this.debugMode = false;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(false);
        }
        console.log('[EmailScanner] Mode debug désactivé');
    }

cleanup() {
    console.log('[EmailScanner] 🧹 Nettoyage des données...');
    
    // Arrêter le monitoring de synchronisation
    if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
    }
    
    // Nettoyer le listener CategoryManager
    if (this.changeListener && typeof this.changeListener === 'function') {
        this.changeListener(); // Appeler la fonction de nettoyage retournée par addChangeListener
        this.changeListener = null;
    }
    
    // Nettoyer les event listeners
    if (this.keywordsUpdateHandler) {
        window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
    }
    if (this.forceSyncHandler) {
        window.removeEventListener('forceSynchronization', this.forceSyncHandler);
    }
    // NOUVEAU: Nettoyer le listener de catégories
    if (this.categoriesUpdateHandler) {
        window.removeEventListener('categoriesUpdated', this.categoriesUpdateHandler);
    }
    
    this.eventListenersSetup = false;
    
    // Nettoyer les données
    this.emails = [];
    this.categorizedEmails = {};
    this.taskPreselectedCategories = [];
    this.scanProgress = null;
    this.scanMetrics = { startTime: null, categorizedCount: 0, keywordMatches: {}, categoryDistribution: {} };
    
    console.log('[EmailScanner] ✅ Nettoyage terminé');
}

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScanner] Instance détruite');
    }

    // ================================================
    // MÉTHODES UTILITAIRES AVANCÉES POUR TESTS
    // ================================================
    getCategoryTrends(days = 7) {
        const trends = {};
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        this.emails.forEach(email => {
            const emailDate = new Date(email.receivedDateTime);
            if (emailDate >= cutoffDate) {
                const category = email.category || 'other';
                if (!trends[category]) {
                    trends[category] = { 
                        count: 0, 
                        confidence: 0, 
                        preselectedCount: 0,
                        taskSuggestedCount: 0,
                        keywordMatches: 0,
                        absoluteMatches: 0
                    };
                }
                trends[category].count++;
                trends[category].confidence += (email.categoryConfidence || 0);
                
                if (email.isPreselectedForTasks) {
                    trends[category].preselectedCount++;
                }
                
                if (email.taskSuggested) {
                    trends[category].taskSuggestedCount++;
                }
                
                if (email.matchedPatterns) {
                    trends[category].keywordMatches += email.matchedPatterns.length;
                    trends[category].absoluteMatches += email.matchedPatterns.filter(p => p.type === 'absolute').length;
                }
            }
        });

        // Calculer les moyennes et pourcentages
        Object.keys(trends).forEach(cat => {
            if (trends[cat].count > 0) {
                trends[cat].avgConfidence = Math.round((trends[cat].confidence / trends[cat].count) * 100) / 100;
                trends[cat].preselectedPercentage = Math.round((trends[cat].preselectedCount / trends[cat].count) * 100);
                trends[cat].taskSuggestedPercentage = Math.round((trends[cat].taskSuggestedCount / trends[cat].count) * 100);
                trends[cat].avgKeywordMatches = Math.round(trends[cat].keywordMatches / trends[cat].count);
                trends[cat].isPreselectedCategory = this.taskPreselectedCategories.includes(cat);
            }
        });

        return trends;
    }

    getEmailGroups(categoryId = null, groupBy = 'sender') {
        const emails = categoryId ? 
            this.getEmailsByCategory(categoryId) : 
            this.emails;

        const groups = new Map();

        emails.forEach(email => {
            let key, name;
            
            if (groupBy === 'domain') {
                key = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                name = key;
            } else {
                key = email.from?.emailAddress?.address || 'unknown';
                name = email.from?.emailAddress?.name || key.split('@')[0];
            }

            if (!groups.has(key)) {
                groups.set(key, {
                    sender: key,
                    name: name,
                    emails: [],
                    count: 0,
                    categories: new Set(),
                    latestDate: null,
                    totalScore: 0,
                    avgConfidence: 0,
                    hasTaskSuggestions: false,
                    preselectedCount: 0,
                    keywordMatches: 0
                });
            }

            const group = groups.get(key);
            group.emails.push(email);
            group.count++;
            group.categories.add(email.category);
            group.totalScore += (email.categoryScore || 0);
            group.keywordMatches += (email.matchedPatterns?.length || 0);
            
            if (email.taskSuggested) {
                group.hasTaskSuggestions = true;
            }
            
            if (email.isPreselectedForTasks) {
                group.preselectedCount++;
            }

            const emailDate = new Date(email.receivedDateTime);
            if (!group.latestDate || emailDate > group.latestDate) {
                group.latestDate = emailDate;
            }
        });

        return Array.from(groups.values())
            .map(g => {
                const avgScore = g.count > 0 ? Math.round(g.totalScore / g.count) : 0;
                const avgConfidence = g.count > 0 ? 
                    g.emails.reduce((sum, e) => sum + (e.categoryConfidence || 0), 0) / g.count : 0;
                
                return {
                    ...g,
                    categories: Array.from(g.categories),
                    avgScore,
                    avgConfidence: Math.round(avgConfidence * 100) / 100,
                    preselectedPercentage: g.count > 0 ? Math.round((g.preselectedCount / g.count) * 100) : 0,
                    avgKeywordMatches: g.count > 0 ? Math.round(g.keywordMatches / g.count) : 0
                };
            })
            .sort((a, b) => b.count - a.count);
    }

    getTopSenders(limit = 10) {
        const senderCounts = {};
        
        this.emails.forEach(email => {
            const senderEmail = email.from?.emailAddress?.address;
            if (senderEmail) {
                if (!senderCounts[senderEmail]) {
                    senderCounts[senderEmail] = {
                        email: senderEmail,
                        name: email.from?.emailAddress?.name || senderEmail,
                        count: 0,
                        categories: new Set(),
                        hasTaskSuggestions: false,
                        preselectedCount: 0,
                        keywordMatches: 0
                    };
                }
                senderCounts[senderEmail].count++;
                senderCounts[senderEmail].categories.add(email.category);
                senderCounts[senderEmail].keywordMatches += (email.matchedPatterns?.length || 0);
                
                if (email.taskSuggested) {
                    senderCounts[senderEmail].hasTaskSuggestions = true;
                }
                if (email.isPreselectedForTasks) {
                    senderCounts[senderEmail].preselectedCount++;
                }
            }
        });

        return Object.values(senderCounts)
            .map(sender => ({
                ...sender,
                categories: Array.from(sender.categories),
                preselectedPercentage: sender.count > 0 ? Math.round((sender.preselectedCount / sender.count) * 100) : 0,
                avgKeywordMatches: sender.count > 0 ? Math.round(sender.keywordMatches / sender.count) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE SÉCURISÉE
// ================================================

// Créer l'instance globale avec nettoyage préalable
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance v8.0...');
window.emailScanner = new EmailScanner();

// Méthodes utilitaires globales pour le debug améliorées
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v8.0');
    
    const testEmails = [
        {
            subject: "Newsletter hebdomadaire - Désabonnez-vous ici",
            from: { emailAddress: { address: "newsletter@example.com", name: "Example News" } },
            bodyPreview: "Voici votre newsletter avec un lien pour vous désinscrire",
            receivedDateTime: new Date().toISOString()
        },
        {
            subject: "Action requise: Confirmer votre commande urgent",
            from: { emailAddress: { address: "orders@shop.com", name: "Shop Orders" } },
            bodyPreview: "Veuillez compléter votre commande dans les plus brefs délais",
            receivedDateTime: new Date().toISOString()
        }
    ];
    
    testEmails.forEach(email => {
        window.emailScanner.testCategorization(email);
    });
    
    console.log('Debug Info:', window.emailScanner.getDebugInfo());
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    
    // Test synchronisation
    console.log('Test synchronisation:');
    const managerCategories = window.categoryManager?.getTaskPreselectedCategories() || [];
    const scannerCategories = window.emailScanner.getTaskPreselectedCategories();
    const isSync = JSON.stringify(managerCategories.sort()) === JSON.stringify(scannerCategories.sort());
    console.log('  - CategoryManager:', managerCategories);
    console.log('  - EmailScanner:', scannerCategories);
    console.log('  - Synchronisé:', isSync ? '✅ OUI' : '❌ NON');
    
    console.groupEnd();
    return { success: true, testsRun: testEmails.length, isSync };
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories v8.0');
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
    console.log('Top senders:', window.emailScanner.getTopSenders(5));
    console.log('Keyword effectiveness:', window.emailScanner.calculateKeywordEffectiveness());
    console.log('Scan metrics:', window.emailScanner.scanMetrics);
    console.log('Debug complet:', window.emailScanner.getDebugInfo());
    console.groupEnd();
};

window.testEmailScannerSync = function() {
    console.group('🔄 TEST SYNCHRONISATION EmailScanner');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    // Forcer synchronisation
    window.emailScanner.forceSettingsReload();
    
    setTimeout(() => {
        const newDebugInfo = window.emailScanner.getDebugInfo();
        console.log('Après sync:', newDebugInfo.syncStatus);
        console.groupEnd();
    }, 500);
    
    return debugInfo;
};

window.forceEmailScannerSync = function() {
    window.emailScanner.forceSettingsReload();
    if (window.emailScanner.emails.length > 0) {
        window.emailScanner.recategorizeEmails();
    }
    return { success: true, message: 'Synchronisation EmailScanner forcée' };
};

console.log('✅ EmailScanner v8.0 loaded - Synchronisation complètement fixée');
