// EmailScanner.js - Version 19.0 - Scanner haute performance avec logs minimaux
// Optimisé pour StartScan avec batching intelligent et cache amélioré

(function() {
    'use strict';
    
    // Configuration des logs - Mode production par défaut
    const LOG_CONFIG = {
        enabled: false, // Désactiver les logs par défaut
        levels: {
            error: true,
            warn: true,
            info: false,
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
                batchSize: 50, // Taille de batch optimale
                categorizationDelay: 0,
                parallelBatches: 3, // Traitement parallèle
                cacheEnabled: true,
                cacheMaxSize: 1000,
                useWebWorker: false, // Future enhancement
                debugMode: false,
                logLevel: 'error'
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
                batchTimes: []
            };
            
            // Pool de résultats pour éviter les allocations
            this.resultPool = [];
            
            // État de synchronisation
            this._syncPromise = null;
            this._initialized = false;
            
            // Initialisation asynchrone
            this.initialize();
        }

        // ================================================
        // INITIALISATION OPTIMISÉE
        // ================================================
        async initialize() {
            if (this._initialized || this._syncPromise) {
                return this._syncPromise;
            }
            
            this._syncPromise = this._performInitialization();
            return this._syncPromise;
        }
        
        async _performInitialization() {
            try {
                await this.loadSettingsFromCategoryManager();
                this.registerAsChangeListener();
                this.setupEventListeners();
                this._initialized = true;
                
                // Log minimal d'initialisation
                if (LOG_CONFIG.enabled) {
                    log.info(`✅ v19.0 initialized - Tasks: ${this.taskPreselectedCategories.length}`);
                }
                
            } catch (error) {
                log.error('❌ Initialization error:', error);
                this._initialized = false;
                throw error;
            }
        }

        // ================================================
        // ANALYSE D'EMAIL OPTIMISÉE
        // ================================================
        analyzeEmail(email) {
            if (!email || !window.categoryManager) {
                return this.getDefaultResult();
            }

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
        // SCAN PRINCIPAL OPTIMISÉ
        // ================================================
        async scan(options = {}) {
            // Éviter les scans multiples
            if (this.isScanning) {
                log.warn('⚠️ Scan already in progress');
                return null;
            }

            // Assurer l'initialisation
            if (!this._initialized) {
                await this.initialize();
            }

            const scanOptions = this.prepareScanOptions(options);
            
            try {
                this.isScanning = true;
                this.reset();
                this.scanProgress = scanOptions.onProgress;
                this.metrics.startTime = performance.now();

                // Log minimal de début
                if (LOG_CONFIG.enabled) {
                    log.info(`🚀 Starting scan - ${scanOptions.days} days, max ${scanOptions.maxEmails} emails`);
                }

                // Étape 1: Récupération optimisée
                await this.fetchEmailsOptimized(scanOptions);
                
                if (this.emails.length === 0) {
                    return this.buildResults(scanOptions);
                }

                // Étape 2: Catégorisation parallèle
                if (scanOptions.autoCategrize) {
                    await this.categorizeEmailsParallel();
                }

                // Étape 3: Analyse IA (optionnelle et optimisée)
                if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                    await this.analyzeForTasksOptimized();
                }

                // Résultats
                const results = this.buildResults(scanOptions);
                
                this.metrics.totalTime = performance.now() - this.metrics.startTime;
                
                // Log minimal de fin
                if (LOG_CONFIG.enabled) {
                    log.info(`✅ Scan completed in ${Math.round(this.metrics.totalTime)}ms - ${results.total} emails`);
                }

                // Notification de progression finale
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'complete',
                        message: 'Scan terminé !',
                        results
                    });
                }

                // Event dispatch optimisé
                this.dispatchEventThrottled('scanCompleted', {
                    results,
                    emails: this.emails,
                    metrics: this.getMetricsSummary()
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

                // Récupération avec options optimisées
                const fetchOptions = {
                    maxResults: options.maxEmails === -1 ? 500 : Math.min(options.maxEmails, 500),
                    days: options.days === -1 ? 365 : options.days,
                    includeSpam: options.includeSpam,
                    fields: ['id', 'subject', 'from', 'to', 'cc', 'receivedDateTime', 'bodyPreview', 'categories', 'body']
                };

                const emails = await window.mailService.getMessages(options.folder, fetchOptions);

                this.emails = emails || [];
                
                log.debug(`✅ ${this.emails.length} emails fetched`);

            } catch (error) {
                log.error('❌ Fetch error:', error);
                throw error;
            }
        }

        // ================================================
        // CATÉGORISATION PARALLÈLE OPTIMISÉE
        // ================================================
        async categorizeEmailsParallel() {
            const total = this.emails.length;
            let processed = 0;
            
            // Division en batches
            const batches = this.createBatches(this.emails, this.config.batchSize);
            
            // Traitement parallèle des batches
            const parallelLimit = this.config.parallelBatches;
            
            for (let i = 0; i < batches.length; i += parallelLimit) {
                const batchGroup = batches.slice(i, Math.min(i + parallelLimit, batches.length));
                const batchStartTime = performance.now();
                
                // Traiter les batches en parallèle
                await Promise.all(batchGroup.map(async (batch, index) => {
                    await this.processBatch(batch);
                    processed += batch.length;
                    
                    // Mise à jour de progression throttlée
                    if (this.scanProgress && (processed % 50 === 0 || processed === total)) {
                        const percent = Math.round((processed / total) * 100);
                        this.scanProgress({
                            phase: 'categorizing',
                            message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                            progress: { current: processed, total }
                        });
                    }
                }));
                
                // Mesure de performance par batch
                const batchTime = performance.now() - batchStartTime;
                this.metrics.batchTimes.push(batchTime);
            }
            
            // Stats finales (sans log sauf si debug)
            if (LOG_CONFIG.levels.debug) {
                const avgBatchTime = this.metrics.batchTimes.reduce((a, b) => a + b, 0) / this.metrics.batchTimes.length;
                log.debug(`✅ Categorization complete - Avg batch time: ${avgBatchTime.toFixed(2)}ms`);
            }
        }

        createBatches(array, batchSize) {
            const batches = [];
            for (let i = 0; i < array.length; i += batchSize) {
                batches.push(array.slice(i, i + batchSize));
            }
            return batches;
        }

        async processBatch(batch) {
            for (const email of batch) {
                try {
                    const analysis = this.analyzeEmail(email);
                    
                    // Attribution optimisée des résultats
                    Object.assign(email, {
                        category: analysis.category,
                        categoryScore: analysis.score,
                        categoryConfidence: analysis.confidence,
                        matchedPatterns: analysis.matchedPatterns || [],
                        hasAbsolute: analysis.hasAbsolute || false,
                        isSpam: analysis.isSpam || false,
                        isCC: analysis.isCC || false,
                        isExcluded: analysis.isExcluded || false,
                        isPreselectedForTasks: this.taskPreselectedCategories.includes(analysis.category)
                    });
                    
                    // Ajout optimisé aux catégories
                    this.addToCategory(email, analysis.category);
                    this.metrics.categorizedCount++;
                    
                } catch (error) {
                    log.error('Categorization error:', error);
                    this.metrics.errors++;
                    
                    // Fallback rapide
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    this.addToCategory(email, 'other');
                }
            }
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
                .slice(0, 30); // Limite raisonnable

            if (emailsToAnalyze.length === 0) return;

            log.debug(`🤖 AI analysis for ${emailsToAnalyze.length} emails`);

            // Analyse par petits groupes pour éviter la surcharge
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
        // GESTION DU CACHE OPTIMISÉE
        // ================================================
        getEmailCacheKey(email) {
            // Clé courte et efficace
            return `${email.id}_${email.subject?.substring(0, 30)}`;
        }

        maintainCacheSize() {
            if (this.categoryCache.size > this.config.cacheMaxSize) {
                // Supprimer les 20% les plus anciens
                const toDelete = Math.floor(this.config.cacheMaxSize * 0.2);
                const keys = Array.from(this.categoryCache.keys());
                for (let i = 0; i < toDelete; i++) {
                    this.categoryCache.delete(keys[i]);
                }
            }
        }

        // ================================================
        // CONSTRUCTION DES RÉSULTATS OPTIMISÉE
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
                
                // Utilisation d'une seule boucle pour toutes les stats
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
                batchTimes: []
            };
            
            this.cacheHitRate = 0;
            
            // Initialiser toutes les catégories
            if (window.categoryManager) {
                const categories = window.categoryManager.getCategories() || {};
                for (const catId in categories) {
                    if (!this.categorizedEmails[catId]) {
                        this.categorizedEmails[catId] = [];
                    }
                }
            }
            
            // Catégories spéciales
            ['other', 'spam', 'cc', 'excluded'].forEach(catId => {
                if (!this.categorizedEmails[catId]) {
                    this.categorizedEmails[catId] = [];
                }
            });
        }

        // ================================================
        // GESTION DES PARAMÈTRES
        // ================================================
        async loadSettingsFromCategoryManager() {
            if (window.categoryManager?.getSettings) {
                try {
                    this.settings = window.categoryManager.getSettings();
                    this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
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
            this.settings = { ...this.settings, ...newSettings };
            
            if (newSettings.taskPreselectedCategories) {
                this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
            }
        }

        updateTaskPreselectedCategories(categories) {
            this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
            
            if (this.emails.length > 0) {
                let updated = 0;
                for (const email of this.emails) {
                    const wasPreselected = email.isPreselectedForTasks;
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                    if (wasPreselected !== email.isPreselectedForTasks) updated++;
                }
                
                if (updated > 0 && LOG_CONFIG.levels.debug) {
                    log.debug(`✅ ${updated} emails updated for task preselection`);
                }
            }
        }

        // ================================================
        // RECATÉGORISATION OPTIMISÉE
        // ================================================
        async recategorizeEmails() {
            if (this.emails.length === 0) {
                log.debug('⚠️ No emails to recategorize');
                return;
            }

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
                batchTimes: []
            };

            // Recatégoriser
            await this.categorizeEmailsParallel();
            
            this.metrics.totalTime = performance.now() - this.metrics.startTime;
            
            // Notifier
            this.dispatchEventThrottled('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getCategoryBreakdown(),
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }

        // ================================================
        // MÉTHODES D'ACCÈS OPTIMISÉES
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
            // Recherche optimisée avec early return
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

        getTaskPreselectedCategories() {
            return [...this.taskPreselectedCategories];
        }

        // ================================================
        // EVENT MANAGEMENT OPTIMISÉ
        // ================================================
        registerAsChangeListener() {
            if (window.categoryManager?.addChangeListener) {
                this.changeListener = window.categoryManager.addChangeListener((type, data) => {
                    this.handleCategoryManagerChange(type, data);
                });
            }
        }

        handleCategoryManagerChange(type, data) {
            const needsRecategorization = [
                'keywordsUpdated',
                'categoryCreated',
                'categoryUpdated',
                'categoryDeleted',
                'settingsChanged',
                'activeCategories'
            ].includes(type);
            
            if (type === 'taskPreselectedCategories') {
                this.updateTaskPreselectedCategories(data);
            }
            
            if (needsRecategorization && this.emails.length > 0) {
                // Debounce recategorization
                clearTimeout(this._recategorizeTimeout);
                this._recategorizeTimeout = setTimeout(() => {
                    this.recategorizeEmails();
                }, 500);
            }
        }

        setupEventListeners() {
            // Throttled event handlers
            const throttledHandlers = {
                categorySettingsChanged: this.throttle((event) => {
                    if (event.detail?.source !== 'EmailScanner') {
                        const { type, value } = event.detail;
                        if (type === 'taskPreselectedCategories') {
                            this.updateTaskPreselectedCategories(value);
                        }
                    }
                }, 100),
                
                settingsChanged: this.throttle((event) => {
                    if (event.detail?.type === 'taskPreselectedCategories') {
                        this.updateTaskPreselectedCategories(event.detail.value);
                    }
                }, 100)
            };
            
            window.addEventListener('categorySettingsChanged', throttledHandlers.categorySettingsChanged);
            window.addEventListener('settingsChanged', throttledHandlers.settingsChanged);
            
            // Store handlers for cleanup
            this._eventHandlers = throttledHandlers;
        }

        dispatchEventThrottled(eventName, detail) {
            // Utiliser requestAnimationFrame pour éviter de bloquer le thread principal
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
                version: '19.0'
            };
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
            // Cleanup event listeners
            if (this.changeListener && typeof this.changeListener === 'function') {
                this.changeListener();
            }
            
            if (this._eventHandlers) {
                window.removeEventListener('categorySettingsChanged', this._eventHandlers.categorySettingsChanged);
                window.removeEventListener('settingsChanged', this._eventHandlers.settingsChanged);
            }
            
            // Clear timeouts
            clearTimeout(this._recategorizeTimeout);
            
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
    console.log('✅ EmailScanner v19.0 loaded - High performance mode');

})();
