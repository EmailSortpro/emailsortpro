// EmailScanner.js - Version 19.1 - Fusion optimisée avec synchronisation complète
// Compatible Gmail/Outlook avec détection améliorée

(function() {
    'use strict';
    
    // Configuration des logs - Mode production par défaut
    const LOG_CONFIG = {
        enabled: true, // Activé temporairement pour debug Gmail
        levels: {
            error: true,
            warn: true,
            info: true,
            debug: false
        }
    };
    
    // Logger conditionnel
    const log = {
        error: (...args) => LOG_CONFIG.enabled && LOG_CONFIG.levels.error && console.error('[EmailScanner]', ...args),
        warn: (...args) => LOG_CONFIG.enabled && LOG_CONFIG.levels.warn && console.warn('[EmailScanner]', ...args),
        info: (...args) => LOG_CONFIG.enabled && LOG_CONFIG.levels.info && console.log('[EmailScanner]', ...args),
        debug: (...args) => LOG_CONFIG.enabled && LOG_CONFIG.levels.debug && console.log('[EmailScanner]', ...args)
    };

    class EmailScanner {
        constructor() {
            this.emails = [];
            this.categorizedEmails = {};
            this.scanProgress = null;
            this.isScanning = false;
            this.settings = {};
            this.taskPreselectedCategories = [];
            
            // Configuration optimisée
            this.config = {
                batchSize: 50,
                categorizationDelay: 0,
                parallelBatches: 3,
                cacheEnabled: true,
                cacheMaxSize: 1000,
                debugMode: false
            };
            
            // Cache LRU optimisé
            this.categoryCache = new Map();
            this.cacheHitRate = 0;
            
            // Métriques de performance
            this.metrics = {
                startTime: null,
                categorizedCount: 0,
                errors: 0,
                avgCategorizeTime: 0,
                totalTime: 0,
                batchTimes: [],
                keywordMatches: {},
                categoryDistribution: {}
            };
            
            // Système de synchronisation renforcé (depuis v8.0)
            this.lastSettingsSync = 0;
            this.syncInterval = null;
            this.changeListener = null;
            this._lastKnownCategoriesCount = 0;
            
            // État de synchronisation
            this._syncPromise = null;
            this._initialized = false;
            
            // Initialisation asynchrone avec sync
            this.initializeWithSync();
        }

        // ================================================
        // INITIALISATION AVEC SYNCHRONISATION (depuis v8.0)
        // ================================================
        async initializeWithSync() {
            if (this._initialized || this._syncPromise) {
                return this._syncPromise;
            }
            
            this._syncPromise = this._performInitialization();
            return this._syncPromise;
        }
        
        async _performInitialization() {
            try {
                // 1. Charger les paramètres depuis CategoryManager
                await this.loadSettingsFromCategoryManager();
                
                // 2. S'enregistrer comme listener de changements
                this.registerAsChangeListener();
                
                // 3. Démarrer la surveillance temps réel
                this.startRealTimeSync();
                
                // 4. Setup event listeners
                this.setupEventListeners();
                
                this._initialized = true;
                
                log.info(`✅ v19.1 initialized - Tasks: ${this.taskPreselectedCategories.length}`);
                
            } catch (error) {
                log.error('❌ Initialization error:', error);
                this._initialized = false;
                throw error;
            }
        }

        // ================================================
        // SYNCHRONISATION TEMPS RÉEL (depuis v8.0)
        // ================================================
        registerAsChangeListener() {
            if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
                this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                    log.info(`📨 Changement reçu de CategoryManager: ${type}`, value);
                    this.handleCategoryManagerChange(type, value, fullSettings);
                });
                
                log.info('👂 Enregistré comme listener CategoryManager');
            }
        }

        handleCategoryManagerChange(type, value, fullSettings) {
            log.debug(`🔄 Traitement changement: ${type}`);
            
            const needsRecategorization = [
                'taskPreselectedCategories',
                'activeCategories',
                'categoryExclusions',
                'preferences',
                'keywordsUpdated',
                'categoryCreated',
                'categoryUpdated',
                'categoryDeleted'
            ].includes(type);
            
            switch (type) {
                case 'taskPreselectedCategories':
                    this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                    this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                    break;
                    
                case 'activeCategories':
                    this.settings.activeCategories = value;
                    break;
                    
                case 'categoryExclusions':
                    this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                    break;
                    
                case 'scanSettings':
                    this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                    break;
                    
                case 'preferences':
                    this.settings.preferences = { ...this.settings.preferences, ...value };
                    break;
                    
                case 'fullSync':
                case 'fullSettings':
                    this.settings = { ...this.settings, ...fullSettings };
                    this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                    break;
            }
            
            // Invalider le cache si nécessaire
            if (needsRecategorization) {
                this.categoryCache.clear();
                this.cacheHitRate = 0;
            }
            
            // Déclencher la re-catégorisation si nécessaire
            if (needsRecategorization && this.emails.length > 0) {
                log.info('🔄 Déclenchement re-catégorisation automatique');
                clearTimeout(this._recategorizeTimeout);
                this._recategorizeTimeout = setTimeout(() => {
                    this.recategorizeEmails();
                }, 500);
            }
        }

        startRealTimeSync() {
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
                
                // Vérifier si de nouvelles catégories ont été créées
                const allCategories = window.categoryManager.getCategories();
                const customCategories = window.categoryManager.getCustomCategories();
                
                let needsRecategorization = categoriesChanged;
                
                // Vérifier si le nombre de catégories a changé
                if (this._lastKnownCategoriesCount !== Object.keys(allCategories).length) {
                    log.info('🆕 Nouvelles catégories détectées');
                    needsRecategorization = true;
                    this._lastKnownCategoriesCount = Object.keys(allCategories).length;
                }
                
                if (categoriesChanged || needsRecategorization) {
                    log.info('🔄 Désynchronisation détectée, correction...');
                    
                    // Forcer la synchronisation
                    this.taskPreselectedCategories = [...currentManagerCategories];
                    this.settings = { ...this.settings, ...currentManagerSettings };
                    
                    // Re-catégoriser si nécessaire
                    if (this.emails.length > 0 && needsRecategorization) {
                        await this.recategorizeEmails();
                    }
                    
                    log.info('✅ Synchronisation corrigée');
                }
                
            } catch (error) {
                log.error('Erreur vérification sync:', error);
            }
        }

        // ================================================
        // ANALYSE D'EMAIL - DÉLÉGATION COMPLÈTE
        // ================================================
        analyzeEmail(email) {
            if (!email || !window.categoryManager) {
                return this.getDefaultResult();
            }

            const startTime = performance.now();
            
            // Vérifier le cache en premier
            const cacheKey = this.getEmailCacheKey(email);
            if (this.config.cacheEnabled && this.categoryCache.has(cacheKey)) {
                this.cacheHitRate++;
                return this.categoryCache.get(cacheKey);
            }
            
            try {
                // Délégation directe à CategoryManager
                const result = window.categoryManager.analyzeEmail(email);
                
                // Mise en cache avec limite de taille
                if (this.config.cacheEnabled) {
                    this.maintainCacheSize();
                    this.categoryCache.set(cacheKey, result);
                }
                
                this.updateMetrics(startTime);
                
                if (this.config.debugMode && result.category !== 'other') {
                    log.debug(`Email "${email.subject?.substring(0, 50)}..." → ${result.category} (score: ${result.score})`);
                }
                
                return result;
                
            } catch (error) {
                log.error('Analysis error:', error);
                this.metrics.errors++;
                return this.getDefaultResult(error);
            }
        }
        
        getDefaultResult(error = null) {
            return { 
                category: 'other', 
                score: 0, 
                confidence: 0,
                error: error?.message 
            };
        }

        // ================================================
        // SCAN PRINCIPAL OPTIMISÉ (fusion v8.0 + v19.0)
        // ================================================
        async scan(options = {}) {
            // Éviter les scans multiples
            if (this.isScanning) {
                log.warn('⚠️ Scan already in progress');
                return null;
            }

            // Assurer l'initialisation
            if (!this._initialized) {
                await this.initializeWithSync();
            }

            // SYNCHRONISATION PRÉ-SCAN (depuis v8.0)
            log.info('🔄 === SYNCHRONISATION PRÉ-SCAN ===');
            
            if (window.categoryManager) {
                const freshCategories = window.categoryManager.getTaskPreselectedCategories();
                this.taskPreselectedCategories = [...freshCategories];
                const freshSettings = window.categoryManager.getSettings();
                this.settings = { ...this.settings, ...freshSettings };
                
                log.info('✅ Catégories synchronisées:', this.taskPreselectedCategories);
            }

            // Si des catégories sont passées dans les options, les utiliser
            if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
                log.info('📋 Utilisation des catégories depuis options:', options.taskPreselectedCategories);
                this.taskPreselectedCategories = [...options.taskPreselectedCategories];
            }

            const scanOptions = this.prepareScanOptions(options);
            
            try {
                this.isScanning = true;
                this.reset();
                this.scanProgress = scanOptions.onProgress;
                this.metrics.startTime = performance.now();

                log.info(`🚀 Starting scan - ${scanOptions.days} days, max ${scanOptions.maxEmails} emails`);
                log.info('⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

                // Étape 1: Récupération optimisée
                await this.fetchEmailsOptimized(scanOptions);
                
                if (this.emails.length === 0) {
                    return this.buildResults(scanOptions);
                }

                // Stocker les catégories dans les métriques
                this.metrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

                // Étape 2: Catégorisation avec les catégories pré-sélectionnées
                if (scanOptions.autoCategrize) {
                    await this.categorizeEmailsOptimized(this.taskPreselectedCategories);
                }

                // Étape 3: Analyse IA (optionnelle)
                if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                    await this.analyzeForTasksOptimized();
                }

                // Résultats
                const results = this.buildResults(scanOptions);
                
                this.metrics.totalTime = performance.now() - this.metrics.startTime;
                
                log.info(`✅ Scan completed in ${Math.round(this.metrics.totalTime)}ms - ${results.total} emails`);
                log.info(`⭐ Emails pré-sélectionnés: ${results.stats.preselectedForTasks}`);

                // Notification de progression finale
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'complete',
                        message: 'Scan terminé !',
                        results
                    });
                }

                // Event dispatch
                this.dispatchEventThrottled('scanCompleted', {
                    results,
                    emails: this.emails,
                    metrics: this.getMetricsSummary(),
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks
                });

                return results;

            } catch (error) {
                log.error('❌ Scan error:', error);
                this.metrics.errors++;
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'error',
                        message: error.message,
                        error
                    });
                }
                
                throw error;
                
            } finally {
                this.isScanning = false;
            }
        }

        // ================================================
        // RÉCUPÉRATION OPTIMISÉE DES EMAILS
        // ================================================
        async fetchEmailsOptimized(options) {
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails...',
                    progress: { current: 0, total: 100 }
                });
            }

            try {
                if (!window.mailService) {
                    throw new Error('MailService not available');
                }

                if (!window.mailService.isInitialized()) {
                    await window.mailService.initialize();
                }

                // Déterminer le provider actuel
                const provider = options.provider || window.mailService.getCurrentProvider() || 'microsoft';
                log.info(`📧 Provider détecté: ${provider}`);

                // Options adaptées selon le provider
                const fetchOptions = {
                    maxResults: options.maxEmails === -1 ? (provider === 'gmail' ? 500 : 1000) : options.maxEmails,
                    days: options.days === -1 ? 365 : options.days,
                    includeSpam: options.includeSpam
                };

                // Utiliser la bonne méthode selon le provider
                let emails;
                if (provider === 'gmail' || provider === 'google') {
                    // Pour Gmail, utiliser la méthode spécifique si disponible
                    emails = await window.mailService.getMessages(options.folder, fetchOptions);
                } else {
                    // Pour Outlook
                    emails = await window.mailService.getMessages(options.folder, fetchOptions);
                }

                this.emails = emails || [];
                
                log.info(`✅ ${this.emails.length} emails fetched from ${provider}`);

            } catch (error) {
                log.error('❌ Fetch error:', error);
                throw error;
            }
        }

        // ================================================
        // CATÉGORISATION OPTIMISÉE (fusion v8.0 + v19.0)
        // ================================================
        async categorizeEmailsOptimized(overridePreselectedCategories = null) {
            const total = this.emails.length;
            const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
            
            log.info('🏷️ === DÉBUT CATÉGORISATION ===');
            log.info(`📊 Total emails: ${total}`);
            log.info('⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

            // Initialiser les stats
            const categoryStats = {};
            const preselectedStats = {};

            // Initialiser TOUTES les catégories
            if (window.categoryManager) {
                const allCategories = window.categoryManager.getCategories();
                const customCategories = window.categoryManager.getCustomCategories();
                
                // Catégories standard
                Object.keys(allCategories).forEach(catId => {
                    categoryStats[catId] = 0;
                });
                
                // Catégories personnalisées
                Object.keys(customCategories).forEach(catId => {
                    categoryStats[catId] = 0;
                });
            }

            // Catégories spéciales
            ['other', 'excluded', 'spam', 'personal'].forEach(specialCat => {
                categoryStats[specialCat] = 0;
            });

            // Initialiser les stats de pré-sélection
            taskPreselectedCategories.forEach(catId => {
                preselectedStats[catId] = 0;
            });

            let processed = 0;
            let errors = 0;
            
            // Division en batches
            const batches = this.createBatches(this.emails, this.config.batchSize);
            
            // Traitement parallèle des batches
            const parallelLimit = this.config.parallelBatches;
            
            for (let i = 0; i < batches.length; i += parallelLimit) {
                const batchGroup = batches.slice(i, Math.min(i + parallelLimit, batches.length));
                
                // Traiter les batches en parallèle
                await Promise.all(batchGroup.map(async (batch) => {
                    for (const email of batch) {
                        try {
                            const analysis = this.analyzeEmail(email);
                            
                            // S'assurer qu'on a toujours une catégorie valide
                            const finalCategory = analysis.category || 'other';
                            
                            // Attribution optimisée des résultats
                            Object.assign(email, {
                                category: finalCategory,
                                categoryScore: analysis.score || 0,
                                categoryConfidence: analysis.confidence || 0,
                                matchedPatterns: analysis.matchedPatterns || [],
                                hasAbsolute: analysis.hasAbsolute || false,
                                isSpam: analysis.isSpam || false,
                                isCC: analysis.isCC || false,
                                isExcluded: analysis.isExcluded || false,
                                isPersonal: analysis.isPersonal || false,
                                isPreselectedForTasks: taskPreselectedCategories.includes(finalCategory)
                            });
                            
                            // Log pour debug Gmail
                            if (finalCategory === 'other' && this.config.debugMode) {
                                log.debug(`📌 Email "other":`, {
                                    subject: email.subject?.substring(0, 50),
                                    from: email.from?.emailAddress?.address,
                                    reason: analysis.reason || 'unknown',
                                    score: email.categoryScore
                                });
                            }
                            
                            // Log pour les catégories personnalisées pré-sélectionnées
                            if (email.isPreselectedForTasks) {
                                const categoryInfo = window.categoryManager?.getCategory(finalCategory);
                                log.debug(`⭐ Email pré-sélectionné:`, {
                                    subject: email.subject?.substring(0, 50),
                                    category: finalCategory,
                                    categoryName: categoryInfo?.name || finalCategory
                                });
                                
                                preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                            }
                            
                            // Ajout optimisé aux catégories
                            this.addToCategory(email, finalCategory);
                            categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;
                            this.metrics.categorizedCount++;
                            
                        } catch (error) {
                            log.error('Categorization error:', error);
                            this.metrics.errors++;
                            errors++;
                            
                            // Fallback rapide
                            email.category = 'other';
                            email.categoryError = error.message;
                            email.isPreselectedForTasks = false;
                            this.addToCategory(email, 'other');
                            categoryStats.other = (categoryStats.other || 0) + 1;
                        }
                    }
                    
                    processed += batch.length;
                    
                    // Mise à jour de progression throttlée
                    if (this.scanProgress && (processed % 100 === 0 || processed === total)) {
                        const percent = Math.round((processed / total) * 100);
                        this.scanProgress({
                            phase: 'categorizing',
                            message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                            progress: { current: processed, total }
                        });
                    }
                }));
            }

            // Sauvegarder les stats
            const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
            
            this.metrics.categoryDistribution = categoryStats;
            this.metrics.preselectedCount = preselectedCount;
            this.metrics.preselectedStats = preselectedStats;
            this.metrics.errors = errors;
            
            log.info('✅ === CATÉGORISATION TERMINÉE ===');
            log.info('📊 Distribution:', categoryStats);
            log.info('⭐ Total pré-sélectionnés:', preselectedCount);
            
            if (preselectedCount > 0) {
                log.info('📋 Détail pré-sélection:', preselectedStats);
            }
            
            // Vérification d'intégrité
            this.verifyCategorizationIntegrity(taskPreselectedCategories);
        }

        verifyCategorizationIntegrity(expectedPreselectedCategories) {
            log.debug('🔍 === VÉRIFICATION INTÉGRITÉ ===');
            
            // 1. Vérifier que tous les emails ont une catégorie
            const uncategorized = this.emails.filter(e => !e.category);
            if (uncategorized.length > 0) {
                log.error('❌ Emails sans catégorie:', uncategorized.length);
            }
            
            // 2. Vérifier la cohérence des flags de pré-sélection
            const preselectedByFlag = this.emails.filter(e => e.isPreselectedForTasks);
            const preselectedByCategory = this.emails.filter(e => 
                expectedPreselectedCategories.includes(e.category)
            );
            
            if (preselectedByFlag.length !== preselectedByCategory.length) {
                log.warn('⚠️ Incohérence pré-sélection:');
                log.warn('  - Par flag:', preselectedByFlag.length);
                log.warn('  - Par catégorie:', preselectedByCategory.length);
                
                // Corriger les incohérences
                let corrected = 0;
                preselectedByCategory.forEach(email => {
                    if (!email.isPreselectedForTasks) {
                        email.isPreselectedForTasks = true;
                        corrected++;
                    }
                });
                
                if (corrected > 0) {
                    log.info(`🔧 ${corrected} flags corrigés`);
                }
            }
            
            log.debug('✅ Vérification terminée');
        }

        createBatches(array, batchSize) {
            const batches = [];
            for (let i = 0; i < array.length; i += batchSize) {
                batches.push(array.slice(i, i + batchSize));
            }
            return batches;
        }

        addToCategory(email, category) {
            if (!this.categorizedEmails[category]) {
                this.categorizedEmails[category] = [];
            }
            this.categorizedEmails[category].push(email);
        }

        // ================================================
        // ANALYSE IA OPTIMISÉE
        // ================================================
        async analyzeForTasksOptimized() {
            if (!window.aiTaskAnalyzer) {
                log.debug('⚠️ AITaskAnalyzer not available');
                return;
            }

            // Sélection intelligente des emails à analyser
            const emailsToAnalyze = this.emails
                .filter(email => 
                    email.isPreselectedForTasks && 
                    email.categoryConfidence > 0.6 &&
                    !email.isSpam &&
                    !email.isExcluded
                )
                .sort((a, b) => b.categoryConfidence - a.categoryConfidence)
                .slice(0, 30);

            if (emailsToAnalyze.length === 0) return;

            log.info(`🤖 AI analysis for ${emailsToAnalyze.length} emails`);

            // Analyse par petits groupes
            const aiGroups = this.createBatches(emailsToAnalyze, 5);
            
            for (const group of aiGroups) {
                await Promise.all(group.map(async email => {
                    try {
                        const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                        email.aiAnalysis = analysis;
                        email.taskSuggested = !!analysis?.mainTask?.title;
                    } catch (error) {
                        email.aiAnalysisError = error.message;
                    }
                }));
                
                // Pause courte entre les groupes
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        // ================================================
        // GESTION DU CACHE
        // ================================================
        getEmailCacheKey(email) {
            return `${email.id}_${email.subject?.substring(0, 30)}`;
        }

        maintainCacheSize() {
            if (this.categoryCache.size > this.config.cacheMaxSize) {
                const toDelete = Math.floor(this.config.cacheMaxSize * 0.2);
                const keys = Array.from(this.categoryCache.keys());
                for (let i = 0; i < toDelete; i++) {
                    this.categoryCache.delete(keys[i]);
                }
            }
        }

        // ================================================
        // CONSTRUCTION DES RÉSULTATS
        // ================================================
        buildResults(options) {
            const breakdown = {};
            let totalCategorized = 0;
            let totalWithHighConfidence = 0;
            let totalWithTasks = 0;
            let totalPreselected = 0;

            // Calcul optimisé des statistiques
            for (const [catId, emails] of Object.entries(this.categorizedEmails)) {
                breakdown[catId] = emails.length;
                
                if (catId !== 'other' && catId !== 'spam' && catId !== 'excluded') {
                    totalCategorized += emails.length;
                }
                
                for (const email of emails) {
                    if (email.categoryConfidence >= 0.8) totalWithHighConfidence++;
                    if (email.taskSuggested) totalWithTasks++;
                    if (email.isPreselectedForTasks) totalPreselected++;
                }
            }

            const scanDuration = this.metrics.totalTime ? 
                Math.round(this.metrics.totalTime / 1000) : 0;

            return {
                success: true,
                total: this.emails.length,
                categorized: totalCategorized,
                breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                stats: {
                    processed: this.emails.length,
                    errors: this.metrics.errors,
                    highConfidence: totalWithHighConfidence,
                    taskSuggestions: totalWithTasks,
                    preselectedForTasks: totalPreselected,
                    scanDuration: scanDuration,
                    cacheHitRate: this.categoryCache.size > 0 ? 
                        Math.round((this.cacheHitRate / (this.cacheHitRate + this.categoryCache.size)) * 100) : 0
                },
                emails: this.emails,
                settings: this.settings,
                provider: options.provider
            };
        }

        getMetricsSummary() {
            return {
                totalTime: Math.round(this.metrics.totalTime),
                categorizedCount: this.metrics.categorizedCount,
                errors: this.metrics.errors,
                avgBatchTime: this.metrics.batchTimes.length > 0 ?
                    Math.round(this.metrics.batchTimes.reduce((a, b) => a + b, 0) / this.metrics.batchTimes.length) : 0,
                cacheHitRate: this.categoryCache.size > 0 ? 
                    Math.round((this.cacheHitRate / (this.cacheHitRate + this.categoryCache.size)) * 100) : 0
            };
        }

        // ================================================
        // RESET OPTIMISÉ
        // ================================================
        reset() {
            log.debug('🔄 Resetting...');
            
            // Réutiliser les structures existantes
            this.emails.length = 0;
            
            // Clear optimisé des catégories
            for (const key in this.categorizedEmails) {
                this.categorizedEmails[key].length = 0;
            }
            
            // Reset des métriques
            this.metrics = {
                startTime: performance.now(),
                categorizedCount: 0,
                errors: 0,
                avgCategorizeTime: 0,
                totalTime: 0,
                batchTimes: [],
                keywordMatches: {},
                categoryDistribution: {}
            };
            
            this.cacheHitRate = 0;
            
            // Initialiser toutes les catégories
            if (window.categoryManager) {
                const categories = window.categoryManager.getCategories() || {};
                const customCategories = window.categoryManager.getCustomCategories() || {};
                
                // Catégories standard
                for (const catId in categories) {
                    if (!this.categorizedEmails[catId]) {
                        this.categorizedEmails[catId] = [];
                    }
                }
                
                // Catégories personnalisées
                for (const catId in customCategories) {
                    if (!this.categorizedEmails[catId]) {
                        this.categorizedEmails[catId] = [];
                    }
                }
            }
            
            // Catégories spéciales toujours présentes
            ['other', 'spam', 'cc', 'excluded', 'personal'].forEach(catId => {
                if (!this.categorizedEmails[catId]) {
                    this.categorizedEmails[catId] = [];
                }
            });
        }

        // ================================================
        // GESTION DES PARAMÈTRES (fusion v8.0 + v19.0)
        // ================================================
        async loadSettingsFromCategoryManager() {
            if (window.categoryManager?.getSettings) {
                try {
                    this.settings = window.categoryManager.getSettings();
                    this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                    this.lastSettingsSync = Date.now();
                    
                    log.info('✅ Paramètres chargés depuis CategoryManager');
                    log.info('⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                    
                    return true;
                } catch (error) {
                    log.error('❌ CategoryManager load error:', error);
                    return this.loadDefaultSettings();
                }
            } else {
                log.warn('⚠️ CategoryManager not available');
                return this.loadDefaultSettings();
            }
        }

        loadDefaultSettings() {
            this.settings = {
                scanSettings: {
                    defaultPeriod: 7,
                    defaultFolder: 'inbox',
                    autoAnalyze: true,
                    autoCategrize: true,
                    maxEmails: 500
                },
                taskPreselectedCategories: [],
                preferences: {
                    excludeSpam: true,
                    detectCC: true,
                    showNotifications: true
                }
            };
            this.taskPreselectedCategories = [];
            return true;
        }

        prepareScanOptions(options) {
            const scanSettings = this.settings.scanSettings || {};
            
            return {
                days: options.days ?? scanSettings.defaultPeriod ?? 7,
                folder: options.folder || scanSettings.defaultFolder || 'inbox',
                onProgress: options.onProgress || null,
                maxEmails: options.maxEmails ?? scanSettings.maxEmails ?? 500,
                autoAnalyze: options.autoAnalyze ?? scanSettings.autoAnalyze ?? true,
                autoCategrize: options.autoCategrize ?? scanSettings.autoCategrize ?? true,
                taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
                includeSpam: options.includeSpam ?? !this.settings.preferences?.excludeSpam,
                provider: options.provider || 'microsoft'
            };
        }

        updateSettings(newSettings) {
            log.info('📝 updateSettings appelé:', newSettings);
            this.settings = { ...this.settings, ...newSettings };
            
            if (newSettings.taskPreselectedCategories) {
                this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
            }
        }

        updateTaskPreselectedCategories(categories) {
            log.info('📋 === updateTaskPreselectedCategories ===');
            log.info('📥 Nouvelles catégories reçues:', categories);
            
            const oldCategories = [...this.taskPreselectedCategories];
            this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
            
            if (!this.settings) this.settings = {};
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
            
            const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
            
            if (hasChanged && this.emails.length > 0) {
                log.info('🔄 Changement détecté, re-catégorisation nécessaire');
                clearTimeout(this._recategorizeTimeout);
                this._recategorizeTimeout = setTimeout(() => {
                    this.recategorizeEmails();
                }, 500);
            }
            
            return this.taskPreselectedCategories;
        }

        getTaskPreselectedCategories() {
            // Toujours vérifier d'abord auprès de CategoryManager
            if (window.categoryManager?.getTaskPreselectedCategories) {
                const managerCategories = window.categoryManager.getTaskPreselectedCategories();
                
                // Mise à jour locale si différent
                if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== JSON.stringify([...managerCategories].sort())) {
                    this.taskPreselectedCategories = [...managerCategories];
                }
                
                return [...managerCategories];
            }
            
            return [...this.taskPreselectedCategories];
        }

        // ================================================
        // RECATÉGORISATION OPTIMISÉE
        // ================================================
        async recategorizeEmails() {
            if (this.emails.length === 0) {
                log.debug('⚠️ No emails to recategorize');
                return;
            }

            log.info('🔄 === DÉBUT RE-CATÉGORISATION ===');
            
            // Vider le cache pour forcer la recatégorisation
            this.categoryCache.clear();
            this.cacheHitRate = 0;
            
            // Recharger les paramètres
            await this.loadSettingsFromCategoryManager();
            
            // Réinitialiser les catégories
            for (const key in this.categorizedEmails) {
                this.categorizedEmails[key].length = 0;
            }
            
            // Reset des métriques
            this.metrics = {
                startTime: performance.now(),
                categorizedCount: 0,
                errors: 0,
                avgCategorizeTime: 0,
                totalTime: 0,
                batchTimes: [],
                keywordMatches: {},
                categoryDistribution: {}
            };

            // Recatégoriser
            await this.categorizeEmailsOptimized();
            
            this.metrics.totalTime = performance.now() - this.metrics.startTime;
            
            log.info('✅ Re-catégorisation terminée');
            
            // Notifier
            this.dispatchEventThrottled('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getCategoryBreakdown(),
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }

        // ================================================
        // MÉTHODES D'ACCÈS
        // ================================================
        getAllEmails() {
            return this.emails; // Pas de copie si pas nécessaire
        }

        getEmailsByCategory(categoryId) {
            if (categoryId === 'all') {
                return this.emails;
            }
            return this.categorizedEmails[categoryId] || [];
        }

        getPreselectedEmails() {
            return this.emails.filter(email => email.isPreselectedForTasks);
        }

        getEmailById(emailId) {
            for (const email of this.emails) {
                if (email.id === emailId) return email;
            }
            return null;
        }

        getCategoryBreakdown() {
            const breakdown = {};
            for (const [catId, emails] of Object.entries(this.categorizedEmails)) {
                if (emails.length > 0) {
                    breakdown[catId] = emails.length;
                }
            }
            return breakdown;
        }

        // ================================================
        // EVENT MANAGEMENT
        // ================================================
        setupEventListeners() {
            if (this.eventListenersSetup) {
                return;
            }

            // Écouter les changements de mots-clés
            this.keywordsUpdateHandler = (event) => {
                log.info('🔑 Mots-clés mis à jour pour catégorie:', event.detail.categoryId);
                if (this.emails.length > 0) {
                    clearTimeout(this._keywordsTimeout);
                    this._keywordsTimeout = setTimeout(() => {
                        this.recategorizeEmails();
                    }, 300);
                }
            };

            window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
            
            this.eventListenersSetup = true;
            log.info('✅ Event listeners configured');
        }

        dispatchEventThrottled(eventName, detail) {
            requestAnimationFrame(() => {
                try {
                    window.dispatchEvent(new CustomEvent(eventName, { 
                        detail: {
                            ...detail,
                            source: 'EmailScanner',
                            timestamp: Date.now()
                        }
                    }));
                } catch (error) {
                    log.error(`❌ Event dispatch error ${eventName}:`, error);
                }
            });
        }

        // Utilitaire throttle
        throttle(func, delay) {
            let lastCall = 0;
            return function(...args) {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    return func.apply(this, args);
                }
            };
        }

        // ================================================
        // MÉTHODES UTILITAIRES
        // ================================================
        updateMetrics(startTime) {
            const categorizeTime = performance.now() - startTime;
            
            const count = this.metrics.categorizedCount || 1;
            this.metrics.avgCategorizeTime = 
                (this.metrics.avgCategorizeTime * (count - 1) + categorizeTime) / count;
        }

        // ================================================
        // DEBUG ET MONITORING
        // ================================================
        getDebugInfo() {
            return {
                isScanning: this.isScanning,
                initialized: this._initialized,
                totalEmails: this.emails.length,
                categorizedCount: this.metrics.categorizedCount,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                settings: this.settings,
                metrics: this.getMetricsSummary(),
                config: this.config,
                cacheSize: this.categoryCache.size,
                changeListener: !!this.changeListener,
                syncStatus: {
                    lastSync: this.lastSettingsSync,
                    categoriesInSync: this.verifyCategoriesSync()
                },
                version: '19.1'
            };
        }

        verifyCategoriesSync() {
            if (!window.categoryManager) return false;
            
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            return JSON.stringify([...this.taskPreselectedCategories].sort()) === 
                   JSON.stringify([...managerCategories].sort());
        }

        setDebugMode(enabled) {
            LOG_CONFIG.enabled = enabled;
            this.config.debugMode = enabled;
            if (enabled) {
                LOG_CONFIG.levels = { error: true, warn: true, info: true, debug: true };
            } else {
                LOG_CONFIG.levels = { error: true, warn: true, info: false, debug: false };
            }
        }

        enableLogs() {
            this.setDebugMode(true);
        }

        disableLogs() {
            this.setDebugMode(false);
        }

        clearCache() {
            this.categoryCache.clear();
            this.cacheHitRate = 0;
            log.debug('🧹 Category cache cleared');
        }

        exportStats() {
            return {
                totalEmails: this.emails.length,
                categoryBreakdown: this.getCategoryBreakdown(),
                performance: this.getMetricsSummary(),
                cacheEfficiency: {
                    size: this.categoryCache.size,
                    hitRate: this.categoryCache.size > 0 ? 
                        Math.round((this.cacheHitRate / (this.cacheHitRate + this.categoryCache.size)) * 100) : 0
                },
                highConfidence: this.emails.filter(e => e.categoryConfidence >= 0.8).length,
                preselectedForTasks: this.emails.filter(e => e.isPreselectedForTasks).length,
                errors: this.metrics.errors
            };
        }

        // ================================================
        // CLEANUP
        // ================================================
        destroy() {
            // Cleanup event listeners et intervals
            if (this.changeListener && typeof this.changeListener === 'function') {
                this.changeListener();
            }
            
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
            
            if (this._eventHandlers) {
                window.removeEventListener('categorySettingsChanged', this._eventHandlers.categorySettingsChanged);
                window.removeEventListener('settingsChanged', this._eventHandlers.settingsChanged);
            }
            
            if (this.keywordsUpdateHandler) {
                window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
            }
            
            // Clear timeouts
            clearTimeout(this._recategorizeTimeout);
            clearTimeout(this._keywordsTimeout);
            
            // Clear data
            this.emails = [];
            this.categorizedEmails = {};
            this.categoryCache.clear();
            
            // Reset state
            this._initialized = false;
            this._syncPromise = null;
            
            log.info('Instance destroyed');
        }
    }

    // ================================================
    // CRÉATION DE L'INSTANCE GLOBALE
    // ================================================
    
    // Cleanup ancienne instance
    if (window.emailScanner) {
        try {
            window.emailScanner.destroy?.();
        } catch (e) {
            // Ignorer les erreurs de cleanup
        }
    }

    // Créer nouvelle instance
    window.emailScanner = new EmailScanner();
    
    // Export de la classe pour tests
    window.EmailScanner = EmailScanner;
    
    // Log minimal une seule fois
    console.log('✅ EmailScanner v19.1 loaded - Fusion optimisée avec synchronisation complète');

})();
