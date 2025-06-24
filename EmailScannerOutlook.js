// EmailScannerOutlook.js - Scanner spécifique Outlook avec toutes les fonctionnalités
// Version 1.0 - Reprend la logique complexe actuelle d'EmailScanner

class EmailScannerOutlook {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.provider = 'outlook';
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // Système de synchronisation renforcé
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
        
        // Configuration spécifique Outlook
        this.outlookConfig = {
            maxEmails: Number.MAX_SAFE_INTEGER,
            batchSize: 1000,
            defaultTop: 1000
        };
        
        // Initialiser avec synchronisation immédiate
        this.initializeWithSync();
        
        console.log('[EmailScannerOutlook] ✅ Version 1.0 - Scanner Outlook complet');
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
        
        console.log('[EmailScannerOutlook] 🔗 Synchronisation initialisée');
        console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            // S'enregistrer pour recevoir tous les changements en temps réel
            this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                console.log(`[EmailScannerOutlook] 📨 Changement reçu de CategoryManager: ${type}`, value);
                this.handleCategoryManagerChange(type, value, fullSettings);
            });
            
            console.log('[EmailScannerOutlook] 👂 Enregistré comme listener CategoryManager');
        }
    }

    handleCategoryManagerChange(type, value, fullSettings) {
        console.log(`[EmailScannerOutlook] 🔄 Traitement changement: ${type}`);
        
        const needsRecategorization = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'preferences'
        ].includes(type);
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[EmailScannerOutlook] 📋 Mise à jour catégories pré-sélectionnées:', value);
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                break;
                
            case 'activeCategories':
                console.log('[EmailScannerOutlook] 🏷️ Mise à jour catégories actives:', value);
                this.settings.activeCategories = value;
                break;
                
            case 'categoryExclusions':
                console.log('[EmailScannerOutlook] 🚫 Mise à jour exclusions:', value);
                this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                break;
                
            case 'scanSettings':
                console.log('[EmailScannerOutlook] 🔍 Mise à jour scan settings:', value);
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
                
            case 'automationSettings':
                console.log('[EmailScannerOutlook] 🤖 Mise à jour automation settings:', value);
                this.settings.automationSettings = { ...this.settings.automationSettings, ...value };
                break;
                
            case 'preferences':
                console.log('[EmailScannerOutlook] ⚙️ Mise à jour préférences:', value);
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
                
            case 'fullSync':
            case 'fullSettings':
                console.log('[EmailScannerOutlook] 🔄 Synchronisation complète');
                this.settings = { ...this.settings, ...fullSettings };
                this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                break;
        }
        
        // Déclencher la re-catégorisation si nécessaire
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScannerOutlook] 🔄 Déclenchement re-catégorisation automatique');
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
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.checkAndSyncSettings();
        }, 10000); // Toutes les 10 secondes
    }

    async checkAndSyncSettings() {
        if (!window.categoryManager) return;
        
        try {
            const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            const currentManagerSettings = window.categoryManager.getSettings();
            
            // Vérifier si les catégories pré-sélectionnées ont changé
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            // Vérifier aussi si de nouvelles catégories ont été créées
            const allCategories = window.categoryManager.getCategories();
            const customCategories = window.categoryManager.getCustomCategories();
            
            // Forcer la re-catégorisation si nouvelles catégories détectées
            let needsRecategorization = categoriesChanged;
            
            // Vérifier si le nombre de catégories a changé
            if (this._lastKnownCategoriesCount !== Object.keys(allCategories).length) {
                console.log('[EmailScannerOutlook] 🆕 Nouvelles catégories détectées');
                needsRecategorization = true;
                this._lastKnownCategoriesCount = Object.keys(allCategories).length;
            }
            
            if (categoriesChanged || needsRecategorization) {
                console.log('[EmailScannerOutlook] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScannerOutlook:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                console.log('  - Catégories totales:', Object.keys(allCategories).length);
                console.log('  - Catégories personnalisées:', Object.keys(customCategories).length);
                
                // Forcer la synchronisation
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
                if (this.emails.length > 0 && needsRecategorization) {
                    console.log('[EmailScannerOutlook] 🔄 Re-catégorisation nécessaire suite aux changements');
                    await this.recategorizeEmails();
                }
                
                console.log('[EmailScannerOutlook] ✅ Synchronisation corrigée');
            }
            
        } catch (error) {
            console.error('[EmailScannerOutlook] Erreur vérification sync:', error);
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
                
                console.log('[EmailScannerOutlook] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScannerOutlook] 📊 Settings:', this.settings);
                console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
                
            } catch (error) {
                console.error('[EmailScannerOutlook] Erreur chargement CategoryManager:', error);
                return this.loadSettingsFromFallback();
            }
        } else {
            console.warn('[EmailScannerOutlook] CategoryManager non disponible, utilisation fallback');
            return this.loadSettingsFromFallback();
        }
    }

    loadSettingsFromFallback() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScannerOutlook] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScannerOutlook] 📝 Utilisation paramètres par défaut');
            }
            
            this.lastSettingsSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('[EmailScannerOutlook] Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    // ================================================
    // MÉTHODE PRINCIPALE : SCAN COMPLET AVEC TOUTES LES FONCTIONNALITÉS
    // ================================================
    async scan(options = {}) {
        // ÉTAPE 1: Synchronisation forcée AVANT tout
        console.log('[EmailScannerOutlook] 🔄 === SYNCHRONISATION PRÉ-SCAN ===');
        
        // Forcer le rechargement depuis CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScannerOutlook] ✅ Catégories synchronisées depuis CategoryManager:', this.taskPreselectedCategories);
            
            // Vérifier aussi les settings complets
            const freshSettings = window.categoryManager.getSettings();
            this.settings = { ...this.settings, ...freshSettings };
        }
        
        // Si des catégories sont passées dans les options, les utiliser en priorité
        if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
            console.log('[EmailScannerOutlook] 📋 Utilisation des catégories depuis options:', options.taskPreselectedCategories);
            this.taskPreselectedCategories = [...options.taskPreselectedCategories];
        }
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || this.outlookConfig.defaultTop,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            unlimited: options.unlimited || false
        };

        if (this.isScanning) {
            console.warn('[EmailScannerOutlook] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScannerOutlook] 🚀 === DÉMARRAGE DU SCAN ===');
            console.log('[EmailScannerOutlook] 📊 Options complètes:', mergedOptions);
            console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);
            
            // Afficher les noms des catégories pour plus de clarté
            if (window.categoryManager && this.taskPreselectedCategories.length > 0) {
                const categoryNames = this.taskPreselectedCategories.map(catId => {
                    const cat = window.categoryManager.getCategory(catId);
                    return cat ? `${cat.icon} ${cat.name}` : catId;
                });
                console.log('[EmailScannerOutlook] 📌 Noms des catégories pré-sélectionnées:', categoryNames);
            }
            
            console.log('[EmailScannerOutlook] 🎯 Catégories actives:', window.categoryManager?.getActiveCategories());

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

            console.log('[EmailScannerOutlook] 📧 Récupération des emails du dossier:', mergedOptions.folder);

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
            console.log(`[EmailScannerOutlook] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScannerOutlook] Aucun email trouvé dans la période spécifiée');
                return this.getDetailedResults();
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
            console.log('[EmailScannerOutlook] 🔍 === VÉRIFICATION FINALE ===');
            console.log('[EmailScannerOutlook] 📊 Résultats scan:', {
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
            console.error('[EmailScannerOutlook] ❌ Erreur de scan:', error);
            
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
    // CATÉGORISATION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
    // ================================================
    async categorizeEmails(overridePreselectedCategories = null) {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScannerOutlook] 🏷️ === DÉBUT CATÉGORISATION ===');
        console.log('[EmailScannerOutlook] 📊 Total emails:', total);
        console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        const categoryStats = {};
        const keywordStats = {};
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialiser TOUTES les catégories (standard + personnalisées + spéciales)
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
            keywordStats[catId] = {
                absoluteMatches: 0,
                strongMatches: 0,
                weakMatches: 0,
                exclusionMatches: 0
            };
        });
        
        // Ajouter les catégories personnalisées
        const customCategories = window.categoryManager?.getCustomCategories() || {};
        Object.keys(customCategories).forEach(catId => {
            if (!categoryStats[catId]) {
                categoryStats[catId] = 0;
                keywordStats[catId] = {
                    absoluteMatches: 0,
                    strongMatches: 0,
                    weakMatches: 0,
                    exclusionMatches: 0
                };
            }
        });
        
        // CORRECTION CRITIQUE: Initialiser explicitement les catégories spéciales
        ['other', 'excluded', 'spam', 'personal'].forEach(specialCat => {
            if (!categoryStats[specialCat]) {
                categoryStats[specialCat] = 0;
                keywordStats[specialCat] = {
                    absoluteMatches: 0,
                    strongMatches: 0,
                    weakMatches: 0,
                    exclusionMatches: 0
                };
            }
        });

        const preselectedStats = {};
        taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // CORRECTION: S'assurer qu'on a toujours une catégorie valide
                    const finalCategory = analysis.category || 'other';
                    
                    email.category = finalCategory;
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    
                    // CORRECTION: Marquer explicitement les emails pré-sélectionnés
                    email.isPreselectedForTasks = taskPreselectedCategories.includes(finalCategory);
                    
                    // Log pour la catégorie "other"
                    if (finalCategory === 'other') {
                        console.log(`[EmailScannerOutlook] 📌 Email catégorisé "other":`, {
                            subject: email.subject?.substring(0, 50),
                            from: email.from?.emailAddress?.address,
                            reason: analysis.reason || 'unknown',
                            score: email.categoryScore
                        });
                    }
                    
                    // Log pour les catégories personnalisées ET pré-sélectionnées
                    const categoryInfo = window.categoryManager?.getCategory(finalCategory);
                    if (categoryInfo && categoryInfo.isCustom) {
                        console.log(`[EmailScannerOutlook] 🎨 Email catégorie personnalisée:`, {
                            subject: email.subject?.substring(0, 50),
                            category: finalCategory,
                            categoryName: categoryInfo.name,
                            isPreselected: email.isPreselectedForTasks
                        });
                    }
                    
                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScannerOutlook] ⭐ Email pré-sélectionné:`, {
                            subject: email.subject?.substring(0, 50),
                            category: finalCategory,
                            categoryName: categoryInfo?.name || finalCategory
                        });
                        
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Analyser les patterns
                    if (email.matchedPatterns && email.matchedPatterns.length > 0) {
                        email.matchedPatterns.forEach(pattern => {
                            if (keywordStats[finalCategory]) {
                                switch (pattern.type) {
                                    case 'absolute':
                                        keywordStats[finalCategory].absoluteMatches++;
                                        break;
                                    case 'strong':
                                        keywordStats[finalCategory].strongMatches++;
                                        break;
                                    case 'weak':
                                        keywordStats[finalCategory].weakMatches++;
                                        break;
                                    case 'exclusion':
                                        keywordStats[finalCategory].exclusionMatches++;
                                        break;
                                }
                            }
                        });
                    }
                    
                    // CORRECTION: Ajouter l'email à la bonne catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    
                    this.categorizedEmails[finalCategory].push(email);
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error('[EmailScannerOutlook] ❌ Erreur catégorisation email:', error);
                    
                    // CORRECTION: En cas d'erreur, forcer la catégorie "other"
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

            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.keywordMatches = keywordStats;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        
        console.log('[EmailScannerOutlook] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScannerOutlook] 📊 Distribution:', categoryStats);
        console.log('[EmailScannerOutlook] 📌 Emails "other":', categoryStats.other || 0);
        console.log('[EmailScannerOutlook] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScannerOutlook] ⚠️ Erreurs:', errors);
        
        this.logTopPatterns();
        this.logKeywordEffectiveness();
        this.verifyPreselectionSync(taskPreselectedCategories);
    }

    // ================================================
    // GESTION DES CLICS - LOGIQUE COMPLEXE AVEC DOUBLE-CLIC
    // ================================================
    handleEmailClick(event, emailId) {
        // Empêcher la propagation si c'est un clic sur checkbox
        if (event.target.type === 'checkbox') {
            console.log('[EmailScannerOutlook] Clic checkbox détecté, arrêt propagation');
            return;
        }
        
        // Empêcher la propagation si c'est un clic sur les actions
        if (event.target.closest('.task-actions-harmonized')) {
            console.log('[EmailScannerOutlook] Clic action détecté, arrêt propagation');
            return;
        }
        
        // Empêcher la propagation si c'est un clic dans un groupe header
        if (event.target.closest('.group-header-harmonized')) {
            console.log('[EmailScannerOutlook] Clic dans group header, arrêt propagation');
            return;
        }
        
        // Vérifier si c'est un double-clic pour sélection
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            // Double-clic = toggle sélection
            console.log('[EmailScannerOutlook] Double-clic détecté, toggle sélection');
            event.preventDefault();
            event.stopPropagation();
            window.pageManager?.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        this.lastEmailClick = now;
        
        // Simple clic = ouvrir modal après délai pour permettre double-clic
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                console.log('[EmailScannerOutlook] Simple clic confirmé, ouverture modal');
                window.pageManager?.showEmailModal(emailId);
            }
        }, 250);
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - PRIORITÉ AUX PRÉ-SÉLECTIONNÉS
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScannerOutlook] AITaskAnalyzer non disponible, skip analyse IA');
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

        console.log(`[EmailScannerOutlook] 🤖 Analyse IA de ${emailsToAnalyze.length} emails prioritaires`);
        console.log(`[EmailScannerOutlook] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (email.isPreselectedForTasks && email.taskSuggested) {
                    console.log(`[EmailScannerOutlook] ⭐🤖 Tâche suggérée pour email pré-sélectionné:`, {
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
                console.error('[EmailScannerOutlook] Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

        console.log('[EmailScannerOutlook] ✅ Analyse IA terminée');
        console.log('[EmailScannerOutlook] 📊 Tâches suggérées:', totalSuggested);
        console.log('[EmailScannerOutlook] ⭐ Dont pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // TOUTES LES AUTRES MÉTHODES DE L'EmailScanner ORIGINAL
    // ================================================
    
    // [Inclure ici toutes les autres méthodes de EmailScanner.js comme :]
    // - getDetailedResults()
    // - calculateKeywordEffectiveness()
    // - verifyPreselectionSync()
    // - getAllEmails()
    // - getEmailsByCategory()
    // - getPreselectedEmails()
    // - updateTaskPreselectedCategories()
    // - updateSettings()
    // - getTaskPreselectedCategories()
    // - logScanResults()
    // - logTopPatterns()
    // - logKeywordEffectiveness()
    // - exportToJSON()
    // - exportToCSV()
    // - performBatchAction()
    // etc.

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
            scanMetrics: this.scanMetrics,
            provider: 'outlook'
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

    verifyPreselectionSync() {
        console.log('[EmailScannerOutlook] 🔍 === VÉRIFICATION SYNCHRONISATION PRÉ-SÉLECTION ===');
        
        const preselectedEmails = this.emails.filter(e => e.isPreselectedForTasks);
        const preselectedCategories = [...new Set(preselectedEmails.map(e => e.category))];
        
        console.log('[EmailScannerOutlook] 📊 Résumé pré-sélection:');
        console.log('  - Catégories configurées:', this.taskPreselectedCategories);
        console.log('  - Catégories détectées:', preselectedCategories);
        console.log('  - Emails pré-sélectionnés:', preselectedEmails.length);
        
        // Vérifier cohérence
        const allPreselectedInConfig = preselectedCategories.every(cat => 
            this.taskPreselectedCategories.includes(cat)
        );
        
        if (!allPreselectedInConfig) {
            console.warn('[EmailScannerOutlook] ⚠️ Incohérence détectée dans la pré-sélection');
            console.log('  - Catégories détectées mais non configurées:', 
                preselectedCategories.filter(cat => !this.taskPreselectedCategories.includes(cat))
            );
        } else {
            console.log('[EmailScannerOutlook] ✅ Pré-sélection cohérente');
        }
        
        // Log détaillé des emails pré-sélectionnés par catégorie
        this.taskPreselectedCategories.forEach(catId => {
            const emailsInCategory = preselectedEmails.filter(e => e.category === catId);
            if (emailsInCategory.length > 0) {
                console.log(`[EmailScannerOutlook] 📋 ${catId}: ${emailsInCategory.length} emails pré-sélectionnés`);
            }
        });
    }

    logScanResults(results) {
        console.log('[EmailScannerOutlook] 📊 === RÉSULTATS FINAUX COMPLETS ===');
        console.log(`[EmailScannerOutlook] Total emails: ${results.total}`);
        console.log(`[EmailScannerOutlook] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScannerOutlook] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScannerOutlook] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScannerOutlook] Suggestions de tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScannerOutlook] ⭐ PRÉ-SÉLECTIONNÉS POUR TÂCHES: ${results.stats.preselectedForTasks}`);
        console.log(`[EmailScannerOutlook] Spam filtré: ${results.stats.spamFiltered}`);
        console.log(`[EmailScannerOutlook] CC détectés: ${results.stats.ccDetected}`);
        console.log(`[EmailScannerOutlook] Exclus: ${results.stats.excluded}`);
        console.log(`[EmailScannerOutlook] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScannerOutlook] Score moyen: ${results.stats.averageScore}`);
        console.log(`[EmailScannerOutlook] Durée du scan: ${results.stats.scanDuration}s`);
        console.log(`[EmailScannerOutlook] 📋 Catégories pré-sélectionnées configurées: ${results.taskPreselectedCategories.join(', ')}`);
        
        console.log('[EmailScannerOutlook] Distribution par catégorie:');
        
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
                console.log(`[EmailScannerOutlook]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}${efficiencyMark}`);
            }
        });
        
        // Résumé de pré-sélection
        console.log('[EmailScannerOutlook] 📋 === RÉSUMÉ PRÉ-SÉLECTION ===');
        console.log(`[EmailScannerOutlook] Total pré-sélectionnés: ${results.stats.preselectedForTasks}`);
        this.taskPreselectedCategories.forEach(catId => {
            const categoryEmails = this.emails.filter(e => e.category === catId);
            const preselectedInCategory = categoryEmails.filter(e => e.isPreselectedForTasks);
            const categoryInfo = window.categoryManager?.getCategory(catId) || { name: catId, icon: '📂' };
            console.log(`[EmailScannerOutlook]   ${categoryInfo.icon} ${categoryInfo.name}: ${preselectedInCategory.length}/${categoryEmails.length} pré-sélectionnés`);
        });
        
        console.log('[EmailScannerOutlook] ===============================');
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
            console.log('[EmailScannerOutlook] 🔍 Top 15 patterns détectés:');
            topPatterns.forEach(([pattern, count]) => {
                console.log(`  - ${pattern}: ${count} fois`);
            });
        }
    }

    logKeywordEffectiveness() {
        const effectiveness = this.calculateKeywordEffectiveness();
        
        console.log('[EmailScannerOutlook] 🎯 Efficacité des mots-clés par catégorie:');
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

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScannerOutlook] 📋 === updateTaskPreselectedCategories ===');
        console.log('[EmailScannerOutlook] 📥 Nouvelles catégories reçues:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Mettre à jour dans les settings locaux
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        console.log('[EmailScannerOutlook] 📊 Comparaison:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScannerOutlook] 🔄 Changement détecté, re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        } else if (!hasChanged) {
            console.log('[EmailScannerOutlook] ✅ Aucun changement détecté');
        } else {
            console.log('[EmailScannerOutlook] 📝 Changement enregistré (pas d\'emails à re-catégoriser)');
        }
        
        return this.taskPreselectedCategories;
    }

    updateSettings(newSettings) {
        console.log('[EmailScannerOutlook] 📝 updateSettings appelé:', newSettings);
        
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
            console.log('[EmailScannerOutlook] 🔄 Changements critiques détectés, re-catégorisation...');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.settings;
    }

    getTaskPreselectedCategories() {
        // Cache de 30 secondes pour éviter les appels répétitifs
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 secondes
        
        if (this._categoriesCache && 
            this._categoriesCacheTime && 
            (now - this._categoriesCacheTime) < CACHE_DURATION) {
            return [...this._categoriesCache];
        }
        
        // Toujours vérifier d'abord auprès de CategoryManager pour avoir les dernières
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            
            // Mettre à jour le cache
            this._categoriesCache = [...managerCategories];
            this._categoriesCacheTime = now;
            
            // Log seulement si changement
            if (!this._lastLoggedCategories || 
                JSON.stringify(this._lastLoggedCategories) !== JSON.stringify(managerCategories)) {
                console.log('[EmailScannerOutlook] 📋 Catégories tâches synchronisées:', managerCategories);
                this._lastLoggedCategories = [...managerCategories];
            }
            
            // Mise à jour locale si différent
            if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== JSON.stringify([...managerCategories].sort())) {
                this.taskPreselectedCategories = [...managerCategories];
            }
            
            return [...managerCategories];
        }
        
        return [...this.taskPreselectedCategories];
    }

    getSettings() {
        return { ...this.settings };
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScannerOutlook] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScannerOutlook] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);
        console.log('[EmailScannerOutlook] 🎯 Catégories actives:', window.categoryManager?.getActiveCategories());
        
        // Réinitialiser les métriques
        this.scanMetrics.startTime = Date.now();
        this.scanMetrics.categorizedCount = 0;
        this.scanMetrics.keywordMatches = {};
        this.scanMetrics.categoryDistribution = {};
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
        console.log('[EmailScannerOutlook] ✅ Re-catégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                keywordStats: this.scanMetrics.keywordMatches
            });
        }, 10);
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
        console.log('[EmailScannerOutlook] 🔄 Réinitialisation...');
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // Initialiser avec toutes les catégories du CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            const customCategories = window.categoryManager.getCustomCategories();
            
            // Initialiser toutes les catégories standard
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
            
            // Ajouter les catégories personnalisées
            Object.keys(customCategories).forEach(catId => {
                if (!this.categorizedEmails[catId]) {
                    console.log(`[EmailScannerOutlook] 🆕 Ajout catégorie personnalisée: ${customCategories[catId].name} (${catId})`);
                    this.categorizedEmails[catId] = [];
                }
            });
        }
        
        // S'assurer que les catégories spéciales existent TOUJOURS
        const specialCategories = ['other', 'excluded', 'spam', 'personal'];
        specialCategories.forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
                console.log(`[EmailScannerOutlook] 🔧 Initialisation catégorie spéciale: ${catId}`);
            }
        });
        
        console.log('[EmailScannerOutlook] ✅ Réinitialisation terminée, catégories:', 
            Object.keys(this.categorizedEmails));
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

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
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                preselectedCount: preselectedInCategory,
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId),
                avgScore: emails.length > 0 ? 
                    Math.round(emails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / emails.length) : 0,
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
        console.log('[EmailScannerOutlook] 📤 Export des résultats en', format);
        
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
                filename = `email_scan_outlook_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else {
                content = this.exportToJSON();
                filename = `email_scan_outlook_${new Date().toISOString().split('T')[0]}.json`;
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
            console.error('[EmailScannerOutlook] ❌ Erreur export:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    async performBatchAction(emailIds, action) {
        console.log(`[EmailScannerOutlook] 🔄 Action ${action} sur ${emailIds.length} emails`);

        if (!window.mailService) {
            console.error('[EmailScannerOutlook] MailService non disponible');
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
                    console.warn(`[EmailScannerOutlook] Action inconnue: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScannerOutlook] Erreur action batch:`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    testCategorization(emailSample) {
        console.log('[EmailScannerOutlook] 🧪 === TEST CATEGORISATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScannerOutlook] CategoryManager non disponible');
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
        
        console.log('[EmailScannerOutlook] 🚀 Mémoire optimisée');
    }

    enableDebugMode() {
        this.debugMode = true;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(true);
        }
        console.log('[EmailScannerOutlook] 🐛 Mode debug activé');
    }

    disableDebugMode() {
        this.debugMode = false;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(false);
        }
        console.log('[EmailScannerOutlook] Mode debug désactivé');
    }

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter seulement les événements externes spécifiques
        this.keywordsUpdateHandler = (event) => {
            console.log('[EmailScannerOutlook] 🔑 Mots-clés mis à jour pour catégorie:', event.detail.categoryId);
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        };

        this.forceSyncHandler = (event) => {
            // Ignorer nos propres événements
            if (event.detail?.source === 'EmailScannerOutlook') {
                return;
            }
            
            console.log('[EmailScannerOutlook] 🚀 Synchronisation forcée demandée');
            this.forceSettingsReload();
            
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        };

        window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScannerOutlook] ✅ Event listeners configurés (anti-boucle)');
    }

    forceSettingsReload() {
        console.log('[EmailScannerOutlook] 🔄 === RECHARGEMENT FORCÉ DES PARAMÈTRES ===');
        
        return this.loadSettingsFromCategoryManager().then(() => {
            console.log('[EmailScannerOutlook] ✅ Rechargement terminé');
            console.log('[EmailScannerOutlook] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
            setTimeout(() => {
                this.dispatchEvent('emailScannerSettingsReloaded', {
                    settings: this.settings,
                    taskPreselectedCategories: this.taskPreselectedCategories
                });
            }, 10);
            
            return this.settings;
        });
    }

    cleanup() {
        console.log('[EmailScannerOutlook] 🧹 Nettoyage des données...');
        
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
        this.eventListenersSetup = false;
        
        // Nettoyer les données
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        this.scanMetrics = { startTime: null, categorizedCount: 0, keywordMatches: {}, categoryDistribution: {} };
        
        console.log('[EmailScannerOutlook] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScannerOutlook] Instance détruite');
    }

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

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'EmailScannerOutlook',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[EmailScannerOutlook] Erreur dispatch ${eventName}:`, error);
        }
    }

    setScanLimits(limits) {
        if (limits) {
            this.outlookConfig = { ...this.outlookConfig, ...limits };
            console.log('[EmailScannerOutlook] 🚀 Limites de scan mises à jour:', this.outlookConfig);
        }
    }

    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        const keywordEffectiveness = this.calculateKeywordEffectiveness();
        
        return {
            provider: 'outlook',
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
            outlookConfig: this.outlookConfig,
            // Informations de synchronisation
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
}

// Créer l'instance globale si elle n'existe pas
if (!window.emailScannerOutlook) {
    window.emailScannerOutlook = new EmailScannerOutlook();
    window.EmailScannerOutlook = EmailScannerOutlook;
    console.log('✅ EmailScannerOutlook loaded - Scanner complet pour Outlook avec toutes les fonctionnalités');
}
