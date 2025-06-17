// EmailScanner.js - Version 9.0 - ULTRA OPTIMISÉ PERFORMANCE 🚀

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // NOUVEAU: Cache et optimisation
        this.processingCache = new Map();
        this.batchProcessor = new BatchProcessor();
        this.performanceMonitor = new PerformanceMonitor();
        
        // NOUVEAU: Système de synchronisation ultra-optimisé
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.changeListener = null;
        
        // NOUVEAU: Optimisations de traitement
        this.maxConcurrentProcessing = 10; // Limite la charge CPU
        this.batchSize = 25; // Réduit de 50 à 25 pour plus de responsivité
        this.processingQueue = [];
        this.isProcessingQueue = false;
        
        // Métriques de performance avancées
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            batchCount: 0,
            avgBatchTime: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        this.initializeWithOptimizedSync();
        
        console.log('[EmailScanner] ✅ Version 9.0 - ULTRA OPTIMISÉ PERFORMANCE');
    }

    // ================================================
    // CLASSE BATCH PROCESSOR OPTIMISÉE
    // ================================================
    
}

class BatchProcessor {
    constructor(maxConcurrency = 10) {
        this.maxConcurrency = maxConcurrency;
        this.activePromises = new Set();
        this.queue = [];
        this.isProcessing = false;
    }

    async processBatch(items, processor, batchSize = 25) {
        const results = [];
        const batches = this.createBatches(items, batchSize);
        
        for (const batch of batches) {
            const batchResults = await this.processConcurrentBatch(batch, processor);
            results.push(...batchResults);
            
            // Pause micro pour éviter le blocage
            await this.microPause();
        }
        
        return results;
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    async processConcurrentBatch(batch, processor) {
        const semaphore = new Semaphore(this.maxConcurrency);
        
        const promises = batch.map(async (item, index) => {
            await semaphore.acquire();
            try {
                return await processor(item, index);
            } finally {
                semaphore.release();
            }
        });
        
        return await Promise.all(promises);
    }

    async microPause() {
        return new Promise(resolve => setTimeout(resolve, 1));
    }
}

class Semaphore {
    constructor(count) {
        this.count = count;
        this.waiting = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
            return;
        }
        
        return new Promise(resolve => {
            this.waiting.push(resolve);
        });
    }

    release() {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            resolve();
        } else {
            this.count++;
        }
    }
}

class PerformanceMonitor {
    constructor() {
        this.measurements = new Map();
        this.trends = new Map();
    }

    startMeasurement(key) {
        this.measurements.set(key, performance.now());
    }

    endMeasurement(key) {
        const start = this.measurements.get(key);
        if (!start) return 0;
        
        const duration = performance.now() - start;
        this.measurements.delete(key);
        
        // Maintenir les tendances
        if (!this.trends.has(key)) {
            this.trends.set(key, []);
        }
        
        const trend = this.trends.get(key);
        trend.push(duration);
        
        // Garder seulement les 10 dernières mesures
        if (trend.length > 10) {
            trend.shift();
        }
        
        return duration;
    }

    getAverageTime(key) {
        const trend = this.trends.get(key);
        if (!trend || trend.length === 0) return 0;
        
        return trend.reduce((sum, time) => sum + time, 0) / trend.length;
    }

    getStats() {
        const stats = {};
        for (const [key, trend] of this.trends) {
            stats[key] = {
                count: trend.length,
                average: this.getAverageTime(key),
                last: trend[trend.length - 1] || 0
            };
        }
        return stats;
    }
}

// Continuer avec EmailScanner...
EmailScanner.prototype.initializeWithOptimizedSync = async function() {
    // 1. Charger les paramètres de manière optimisée
    await this.loadSettingsFromCategoryManagerOptimized();
    
    // 2. S'enregistrer comme listener de changements (moins fréquent)
    this.registerAsOptimizedChangeListener();
    
    // 3. Démarrer la surveillance temps réel optimisée
    this.startOptimizedRealTimeSync();
    
    // 4. Setup event listeners optimisés
    this.setupOptimizedEventListeners();
    
    console.log('[EmailScanner] 🔗 Synchronisation ultra-optimisée initialisée');
    console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
};

EmailScanner.prototype.registerAsOptimizedChangeListener = function() {
    if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
        // Debounced change handler pour éviter les appels excessifs
        this.changeListener = window.categoryManager.addChangeListener(
            this.debounce((type, value, fullSettings) => {
                console.log(`[EmailScanner] 📨 Changement reçu (debounced): ${type}`, value);
                this.handleCategoryManagerChangeOptimized(type, value, fullSettings);
            }, 500) // 500ms de debounce
        );
        
        console.log('[EmailScanner] 👂 Listener optimisé enregistré');
    }
};

EmailScanner.prototype.debounce = function(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

EmailScanner.prototype.handleCategoryManagerChangeOptimized = function(type, value, fullSettings) {
    console.log(`[EmailScanner] 🔄 Traitement changement optimisé: ${type}`);
    
    const needsRecategorization = [
        'taskPreselectedCategories',
        'activeCategories'
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
            
        case 'fullSync':
        case 'fullSettings':
            console.log('[EmailScanner] 🔄 Synchronisation complète optimisée');
            this.settings = { ...this.settings, ...fullSettings };
            this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
            break;
    }
    
    // Re-catégorisation optimisée avec délai et batch
    if (needsRecategorization && this.emails.length > 0) {
        console.log('[EmailScanner] 🔄 Déclenchement re-catégorisation optimisée');
        this.debounce(() => {
            this.recategorizeEmailsOptimized();
        }, 300)(); // 300ms de délai
    }
    
    // Notification optimisée
    setTimeout(() => {
        this.dispatchEvent('emailScannerSynced', {
            type,
            value,
            settings: this.settings,
            taskPreselectedCategories: this.taskPreselectedCategories
        });
    }, 10);
};

EmailScanner.prototype.startOptimizedRealTimeSync = function() {
    // Vérification moins fréquente pour réduire la charge
    if (this.syncInterval) {
        clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
        this.checkAndSyncSettingsOptimized();
    }, 15000); // 15 secondes au lieu de 10
};

EmailScanner.prototype.checkAndSyncSettingsOptimized = async function() {
    if (!window.categoryManager) return;
    
    try {
        const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
        const currentManagerSettings = window.categoryManager.getSettings();
        
        // Vérification optimisée avec hash pour éviter JSON.stringify coûteux
        const categoriesChanged = this.hashArray(this.taskPreselectedCategories) !== 
                                this.hashArray(currentManagerCategories);
        
        const allCategories = window.categoryManager.getCategories();
        const customCategories = window.categoryManager.getCustomCategories();
        
        let needsRecategorization = categoriesChanged;
        
        if (this._lastKnownCategoriesCount !== Object.keys(allCategories).length) {
            console.log('[EmailScanner] 🆕 Nouvelles catégories détectées');
            needsRecategorization = true;
            this._lastKnownCategoriesCount = Object.keys(allCategories).length;
        }
        
        if (categoriesChanged || needsRecategorization) {
            console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction optimisée...');
            
            // Forcer la synchronisation
            this.taskPreselectedCategories = [...currentManagerCategories];
            this.settings = { ...this.settings, ...currentManagerSettings };
            
            // Re-catégorisation optimisée si nécessaire
            if (this.emails.length > 0 && needsRecategorization) {
                console.log('[EmailScanner] 🔄 Re-catégorisation optimisée nécessaire');
                await this.recategorizeEmailsOptimized();
            }
            
            console.log('[EmailScanner] ✅ Synchronisation optimisée corrigée');
        }
        
    } catch (error) {
        console.error('[EmailScanner] Erreur vérification sync optimisée:', error);
    }
};

EmailScanner.prototype.hashArray = function(arr) {
    if (!Array.isArray(arr)) return 0;
    return arr.sort().join('|').split('').reduce((hash, char) => {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        return hash & hash;
    }, 0);
};

// ================================================
// SCAN ULTRA-OPTIMISÉ
// ================================================
EmailScanner.prototype.scan = async function(options = {}) {
    // ÉTAPE 1: Synchronisation forcée PRÉ-SCAN (optimisée)
    console.log('[EmailScanner] 🔄 === SYNCHRONISATION PRÉ-SCAN OPTIMISÉE ===');
    
    this.performanceMonitor.startMeasurement('total_scan');
    
    // Sync rapide depuis CategoryManager
    if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
        const freshCategories = window.categoryManager.getTaskPreselectedCategories();
        this.taskPreselectedCategories = [...freshCategories];
        console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        
        const freshSettings = window.categoryManager.getSettings();
        this.settings = { ...this.settings, ...freshSettings };
    }
    
    // Options avec optimisations
    if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
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
        taskPreselectedCategories: [...this.taskPreselectedCategories]
    };

    if (this.isScanning) {
        console.warn('[EmailScanner] Scan déjà en cours');
        return null;
    }

    try {
        this.isScanning = true;
        this.resetOptimized();
        this.scanProgress = mergedOptions.onProgress;
        this.scanMetrics.startTime = Date.now();

        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN ULTRA-OPTIMISÉ ===');
        console.log('[EmailScanner] 📊 Options:', mergedOptions);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

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
                message: `Récupération optimisée des emails...`,
                progress: { current: 0, total: 100 }
            });
        }

        // ÉTAPE 2: Récupération d'emails optimisée
        this.performanceMonitor.startMeasurement('email_fetch');
        
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
        const fetchTime = this.performanceMonitor.endMeasurement('email_fetch');
        console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés en ${fetchTime.toFixed(2)}ms`);

        if (this.emails.length === 0) {
            return this.buildEmptyResults();
        }

        // ÉTAPE 3: Catégorisation ultra-optimisée
        this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

        if (mergedOptions.autoCategrize) {
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Catégorisation ultra-rapide...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmailsUltraOptimized(this.taskPreselectedCategories);
        }

        // ÉTAPE 4: Analyse IA optimisée (réduite)
        if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'analyzing',
                    message: 'Analyse IA prioritaire...',
                    progress: { current: 0, total: 5 } // Réduit à 5 max
                });
            }

            await this.analyzeForTasksOptimized();
        }

        const results = this.getDetailedResultsOptimized();
        const totalTime = this.performanceMonitor.endMeasurement('total_scan');

        console.log(`[EmailScanner] 🎯 SCAN ULTRA-OPTIMISÉ TERMINÉ en ${totalTime.toFixed(2)}ms`);
        console.log(`[EmailScanner] 📊 Performance: ${(this.emails.length / (totalTime / 1000)).toFixed(0)} emails/sec`);

        if (this.scanProgress) {
            this.scanProgress({
                phase: 'complete',
                message: `Scan ultra-rapide terminé ! (${totalTime.toFixed(0)}ms)`,
                results
            });
        }

        this.logOptimizedScanResults(results);
        
        setTimeout(() => {
            this.dispatchEvent('scanCompleted', {
                results,
                emails: this.emails,
                breakdown: results.breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: results.stats.preselectedForTasks,
                scanMetrics: this.scanMetrics,
                performanceStats: this.performanceMonitor.getStats()
            });
        }, 10);

        return results;

    } catch (error) {
        console.error('[EmailScanner] ❌ Erreur de scan optimisé:', error);
        
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
};

// ================================================
// CATÉGORISATION ULTRA-OPTIMISÉE
// ================================================
EmailScanner.prototype.categorizeEmailsUltraOptimized = async function(overridePreselectedCategories = null) {
    const total = this.emails.length;
    const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
    
    console.log('[EmailScanner] 🏷️ === CATÉGORISATION ULTRA-OPTIMISÉE ===');
    console.log('[EmailScanner] 📊 Total emails:', total);
    console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

    this.performanceMonitor.startMeasurement('categorization');

    // Initialisation des stats optimisée
    const categoryStats = this.initializeCategoryStats();
    const preselectedStats = {};
    taskPreselectedCategories.forEach(catId => {
        preselectedStats[catId] = 0;
    });

    // Traitement par batch ultra-optimisé
    const results = await this.batchProcessor.processBatch(
        this.emails,
        async (email, index) => {
            try {
                // Utilisation du CategoryManager optimisé
                const analysis = window.categoryManager.analyzeEmailOptimized ? 
                    window.categoryManager.analyzeEmailOptimized(email) :
                    window.categoryManager.analyzeEmail(email);
                
                const finalCategory = analysis.category || 'other';
                
                // Attribution optimisée des propriétés
                Object.assign(email, {
                    category: finalCategory,
                    categoryScore: analysis.score || 0,
                    categoryConfidence: analysis.confidence || 0,
                    matchedPatterns: analysis.matchedPatterns || [],
                    hasAbsolute: analysis.hasAbsolute || false,
                    isSpam: analysis.isSpam || false,
                    isCC: analysis.isCC || false,
                    isExcluded: analysis.isExcluded || false,
                    isPreselectedForTasks: taskPreselectedCategories.includes(finalCategory)
                });

                // Stats rapides
                categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;
                
                if (email.isPreselectedForTasks) {
                    preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                }

                // Ajout à la catégorie
                if (!this.categorizedEmails[finalCategory]) {
                    this.categorizedEmails[finalCategory] = [];
                }
                this.categorizedEmails[finalCategory].push(email);

                // Progress callback optimisé (moins fréquent)
                if (index % 50 === 0 && this.scanProgress) {
                    const percent = Math.round((index / total) * 100);
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation rapide: ${index}/${total} (${percent}%)`,
                        progress: { current: index, total }
                    });
                }

                return { success: true, category: finalCategory };

            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                
                // Fallback optimisé
                Object.assign(email, {
                    category: 'other',
                    categoryError: error.message,
                    isPreselectedForTasks: false,
                    categoryScore: 0,
                    categoryConfidence: 0,
                    matchedPatterns: []
                });
                
                if (!this.categorizedEmails.other) {
                    this.categorizedEmails.other = [];
                }
                this.categorizedEmails.other.push(email);
                categoryStats.other = (categoryStats.other || 0) + 1;

                return { success: false, error: error.message };
            }
        },
        this.batchSize
    );

    const categorizationTime = this.performanceMonitor.endMeasurement('categorization');
    const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
    const errors = results.filter(r => !r.success).length;
    
    // Mise à jour des métriques
    this.scanMetrics.categorizedCount = total;
    this.scanMetrics.categoryDistribution = categoryStats;
    this.scanMetrics.preselectedCount = preselectedCount;
    this.scanMetrics.preselectedStats = preselectedStats;
    this.scanMetrics.errors = errors;
    this.scanMetrics.batchCount = Math.ceil(total / this.batchSize);
    this.scanMetrics.avgBatchTime = categorizationTime / this.scanMetrics.batchCount;
    
    console.log('[EmailScanner] ✅ === CATÉGORISATION ULTRA-OPTIMISÉE TERMINÉE ===');
    console.log(`[EmailScanner] ⚡ Performance: ${categorizationTime.toFixed(2)}ms pour ${total} emails`);
    console.log(`[EmailScanner] 📊 Distribution:`, categoryStats);
    console.log(`[EmailScanner] ⭐ Total pré-sélectionnés: ${preselectedCount}`);
    console.log(`[EmailScanner] ⚠️ Erreurs: ${errors}`);
    
    this.logOptimizedKeywordEffectiveness();
    this.verifyPreselectionSyncOptimized(taskPreselectedCategories);
};

EmailScanner.prototype.initializeCategoryStats = function() {
    const categoryStats = {};
    const categories = window.categoryManager?.getCategories() || {};
    const customCategories = window.categoryManager?.getCustomCategories() || {};
    
    // Initialisation rapide
    Object.keys(categories).forEach(catId => {
        categoryStats[catId] = 0;
    });
    
    Object.keys(customCategories).forEach(catId => {
        if (!categoryStats[catId]) {
            categoryStats[catId] = 0;
        }
    });
    
    // Catégories spéciales
    ['other', 'excluded', 'spam', 'personal'].forEach(specialCat => {
        if (!categoryStats[specialCat]) {
            categoryStats[specialCat] = 0;
        }
    });
    
    return categoryStats;
};

// ================================================
// ANALYSE IA OPTIMISÉE (RÉDUITE)
// ================================================
EmailScanner.prototype.analyzeForTasksOptimized = async function() {
    if (!window.aiTaskAnalyzer) {
        console.log('[EmailScanner] AITaskAnalyzer non disponible, skip analyse IA');
        return;
    }

    this.performanceMonitor.startMeasurement('ai_analysis');

    // PRIORITÉ 1: Top 3 emails pré-sélectionnés seulement
    const preselectedEmails = this.emails
        .filter(email => email.isPreselectedForTasks && email.categoryConfidence > 0.7)
        .sort((a, b) => b.categoryConfidence - a.categoryConfidence)
        .slice(0, 3); // RÉDUIT à 3 maximum
    
    // PRIORITÉ 2: 2 emails max avec très haute confiance
    const additionalEmails = this.emails
        .filter(email => !email.isPreselectedForTasks && 
                email.categoryConfidence > 0.9 &&
                ['tasks', 'commercial'].includes(email.category))
        .slice(0, 2); // RÉDUIT à 2 maximum
    
    const emailsToAnalyze = [...preselectedEmails, ...additionalEmails];

    console.log(`[EmailScanner] 🤖 Analyse IA optimisée de ${emailsToAnalyze.length} emails prioritaires`);

    let analyzed = 0;
    for (const email of emailsToAnalyze) {
        try {
            const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            email.aiAnalysis = analysis;
            email.taskSuggested = analysis?.mainTask?.title ? true : false;
            
            analyzed++;
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'analyzing',
                    message: `Analyse IA rapide: ${analyzed}/${emailsToAnalyze.length}`,
                    progress: { current: analyzed, total: emailsToAnalyze.length }
                });
            }
            
            // Pause micro réduite
            if (analyzed < emailsToAnalyze.length) {
                await new Promise(resolve => setTimeout(resolve, 50)); // 50ms au lieu de 100ms
            }
            
        } catch (error) {
            console.error('[EmailScanner] Erreur analyse IA optimisée:', error);
            email.aiAnalysisError = error.message;
        }
    }

    const aiTime = this.performanceMonitor.endMeasurement('ai_analysis');
    const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
    const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

    console.log(`[EmailScanner] ✅ Analyse IA optimisée terminée en ${aiTime.toFixed(2)}ms`);
    console.log(`[EmailScanner] 📊 Tâches suggérées: ${totalSuggested} (${preselectedSuggested} pré-sélectionnées)`);
};

// ================================================
// RE-CATÉGORISATION OPTIMISÉE
// ================================================
EmailScanner.prototype.recategorizeEmailsOptimized = async function() {
    if (this.emails.length === 0) {
        console.log('[EmailScanner] Aucun email à recatégoriser');
        return;
    }

    console.log('[EmailScanner] 🔄 === RE-CATÉGORISATION OPTIMISÉE ===');
    console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
    
    this.performanceMonitor.startMeasurement('recategorization');
    
    // Réinitialisation rapide
    this.scanMetrics.startTime = Date.now();
    this.scanMetrics.categorizedCount = 0;
    this.scanMetrics.keywordMatches = {};
    this.scanMetrics.categoryDistribution = {};
    
    // Vider seulement les références, pas recréer les objets
    Object.keys(this.categorizedEmails).forEach(cat => {
        this.categorizedEmails[cat].length = 0; // Plus rapide que = []
    });

    // Re-catégorisation batch
    await this.categorizeEmailsUltraOptimized();
    
    const recatTime = this.performanceMonitor.endMeasurement('recategorization');
    console.log(`[EmailScanner] ✅ Re-catégorisation optimisée terminée en ${recatTime.toFixed(2)}ms`);
    
    // Notification optimisée
    setTimeout(() => {
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResultsOptimized().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            performanceStats: this.performanceMonitor.getStats()
        });
    }, 10);
};

// ================================================
// RÉSULTATS OPTIMISÉS
// ================================================
EmailScanner.prototype.getDetailedResultsOptimized = function() {
    const breakdown = {};
    let totalCategorized = 0;
    let totalWithHighConfidence = 0;
    let totalWithAbsolute = 0;
    let totalWithTasks = 0;
    let totalPreselected = 0;
    let totalExcluded = 0;
    let totalSpam = 0;

    // Calcul optimisé en une seule passe
    Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
        breakdown[catId] = emails.length;
        
        if (catId === 'spam') {
            totalSpam += emails.length;
        } else if (catId === 'excluded') {
            totalExcluded += emails.length;
        } else if (catId !== 'other') {
            totalCategorized += emails.length;
        }
        
        // Calculs en batch pour performance
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            if (email.categoryConfidence >= 0.8) totalWithHighConfidence++;
            if (email.hasAbsolute) totalWithAbsolute++;
            if (email.taskSuggested) totalWithTasks++;
            if (email.isPreselectedForTasks) totalPreselected++;
        }
    });

    const avgConfidence = this.calculateAverageConfidenceOptimized();
    const avgScore = this.calculateAverageScoreOptimized();
    const scanDuration = this.scanMetrics.startTime ? 
        Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

    const keywordEffectiveness = this.calculateKeywordEffectivenessOptimized();

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
            scanDuration: scanDuration,
            emailsPerSecond: Math.round(this.emails.length / Math.max(scanDuration, 1))
        },
        keywordStats: this.scanMetrics.keywordMatches,
        keywordEffectiveness: keywordEffectiveness,
        emails: this.emails,
        settings: this.settings,
        scanMetrics: this.scanMetrics,
        performanceStats: this.performanceMonitor.getStats()
    };
};

EmailScanner.prototype.calculateAverageConfidenceOptimized = function() {
    if (this.emails.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < this.emails.length; i++) {
        sum += (this.emails[i].categoryConfidence || 0);
    }
    
    return Math.round((sum / this.emails.length) * 100) / 100;
};

EmailScanner.prototype.calculateAverageScoreOptimized = function() {
    if (this.emails.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < this.emails.length; i++) {
        sum += (this.emails[i].categoryScore || 0);
    }
    
    return Math.round(sum / this.emails.length);
};

EmailScanner.prototype.calculateKeywordEffectivenessOptimized = function() {
    // Version simplifiée pour performance
    const effectiveness = {};
    
    Object.entries(this.scanMetrics.keywordMatches || {}).forEach(([categoryId, matches]) => {
        const total = (matches.absoluteMatches || 0) + (matches.strongMatches || 0) + (matches.weakMatches || 0);
        const absoluteRatio = total > 0 ? (matches.absoluteMatches || 0) / total : 0;
        
        effectiveness[categoryId] = {
            totalMatches: total,
            absoluteRatio: Math.round(absoluteRatio * 100),
            efficiency: total > 0 ? Math.min(100, Math.round((absoluteRatio * 60) + 40)) : 0
        };
    });
    
    return effectiveness;
};

// ================================================
// LOGGING OPTIMISÉ
// ================================================
EmailScanner.prototype.logOptimizedScanResults = function(results) {
    console.log('[EmailScanner] 📊 === RÉSULTATS ULTRA-OPTIMISÉS ===');
    console.log(`[EmailScanner] ⚡ Performance: ${results.stats.emailsPerSecond} emails/sec`);
    console.log(`[EmailScanner] 📧 Total: ${results.total} emails en ${results.stats.scanDuration}s`);
    console.log(`[EmailScanner] 🏷️ Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
    console.log(`[EmailScanner] ⭐ PRÉ-SÉLECTIONNÉS: ${results.stats.preselectedForTasks}`);
    console.log(`[EmailScanner] 🤖 Tâches suggérées: ${results.stats.taskSuggestions}`);
    console.log(`[EmailScanner] 🎯 Confiance haute: ${results.stats.highConfidence}`);
    console.log(`[EmailScanner] 📋 Catégories configurées: ${results.taskPreselectedCategories.join(', ')}`);
    
    // Performance stats
    const perfStats = this.performanceMonitor.getStats();
    console.log('[EmailScanner] 🚀 Performance détaillée:');
    Object.entries(perfStats).forEach(([key, stats]) => {
        console.log(`  - ${key}: ${stats.average.toFixed(2)}ms moyenne (${stats.count} mesures)`);
    });
};

EmailScanner.prototype.logOptimizedKeywordEffectiveness = function() {
    // Version allégée du logging pour performance
    const effectiveness = this.calculateKeywordEffectivenessOptimized();
    
    console.log('[EmailScanner] 🎯 Top efficacité mots-clés:');
    Object.entries(effectiveness)
        .filter(([_, stats]) => stats.totalMatches > 0)
        .sort((a, b) => b[1].efficiency - a[1].efficiency)
        .slice(0, 5) // Top 5 seulement
        .forEach(([categoryId, stats]) => {
            const category = window.categoryManager?.getCategory(categoryId);
            const isPreselected = this.taskPreselectedCategories.includes(categoryId);
            console.log(`  ${category?.icon || '📂'} ${category?.name || categoryId}${isPreselected ? ' ⭐' : ''}: ${stats.efficiency}%`);
        });
};

EmailScanner.prototype.verifyPreselectionSyncOptimized = function(expectedCategories) {
    const preselectedEmails = this.emails.filter(e => e.isPreselectedForTasks);
    const preselectedCategories = [...new Set(preselectedEmails.map(e => e.category))];
    
    console.log('[EmailScanner] 🔍 Vérification pré-sélection optimisée:');
    console.log('  - Configurées:', expectedCategories);
    console.log('  - Détectées:', preselectedCategories);
    console.log('  - Emails pré-sélectionnés:', preselectedEmails.length);
    
    const coherent = preselectedCategories.every(cat => expectedCategories.includes(cat));
    console.log('  - Cohérence:', coherent ? '✅ OK' : '⚠️ Incohérence détectée');
};

// ================================================
// MÉTHODES UTILITAIRES OPTIMISÉES
// ================================================
EmailScanner.prototype.resetOptimized = function() {
    console.log('[EmailScanner] 🔄 Réinitialisation optimisée...');
    
    // Reset arrays plus rapide
    this.emails.length = 0;
    
    // Reset métriques
    this.scanMetrics = {
        startTime: Date.now(),
        categorizedCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        batchCount: 0,
        avgBatchTime: 0,
        keywordMatches: {},
        categoryDistribution: {}
    };
    
    // Initialisation optimisée des catégories
    if (window.categoryManager) {
        const categories = window.categoryManager.getCategories();
        const customCategories = window.categoryManager.getCustomCategories();
        
        // Reset rapide avec Object.keys
        Object.keys(categories).forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            } else {
                this.categorizedEmails[catId].length = 0;
            }
        });
        
        Object.keys(customCategories).forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
                console.log(`[EmailScanner] 🆕 Catégorie personnalisée ajoutée: ${customCategories[catId].name} (${catId})`);
            } else {
                this.categorizedEmails[catId].length = 0;
            }
        });
    }
    
    // Reset catégories spéciales
    ['other', 'excluded', 'spam', 'personal'].forEach(catId => {
        if (!this.categorizedEmails[catId]) {
            this.categorizedEmails[catId] = [];
        } else {
            this.categorizedEmails[catId].length = 0;
        }
    });
    
    console.log('[EmailScanner] ✅ Réinitialisation optimisée terminée');
};

EmailScanner.prototype.buildEmptyResults = function() {
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
            absoluteMatches: 0,
            emailsPerSecond: 0
        },
        emails: [],
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        scanMetrics: this.scanMetrics,
        performanceStats: this.performanceMonitor.getStats()
    };
};

// ================================================
// MÉTHODES D'ACCÈS AUX DONNÉES (optimisées)
// ================================================
EmailScanner.prototype.getAllEmails = function() {
    return this.emails; // Pas de copie pour performance
};

EmailScanner.prototype.getEmailsByCategory = function(categoryId) {
    if (categoryId === 'all') {
        return this.emails;
    }
    return this.emails.filter(email => email.category === categoryId);
};

EmailScanner.prototype.getPreselectedEmails = function() {
    return this.emails.filter(email => email.isPreselectedForTasks);
};

EmailScanner.prototype.getEmailsWithTaskSuggestions = function() {
    return this.emails.filter(email => email.taskSuggested);
};

EmailScanner.prototype.getPreselectedEmailsWithTaskSuggestions = function() {
    return this.emails.filter(email => email.isPreselectedForTasks && email.taskSuggested);
};

EmailScanner.prototype.getEmailById = function(emailId) {
    // Optimisé avec for loop au lieu de find
    for (let i = 0; i < this.emails.length; i++) {
        if (this.emails[i].id === emailId) {
            return this.emails[i];
        }
    }
    return null;
};

// ================================================
// MÉTHODES DE MISE À JOUR OPTIMISÉES
// ================================================
EmailScanner.prototype.updateTaskPreselectedCategories = function(categories) {
    console.log('[EmailScanner] 📋 === updateTaskPreselectedCategories OPTIMISÉ ===');
    console.log('[EmailScanner] 📥 Nouvelles catégories reçues:', categories);
    
    const oldCategories = this.taskPreselectedCategories;
    this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
    
    if (!this.settings) this.settings = {};
    this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
    
    // Comparaison rapide avec hash
    const hasChanged = this.hashArray(oldCategories) !== this.hashArray(this.taskPreselectedCategories);
    
    if (hasChanged && this.emails.length > 0) {
        console.log('[EmailScanner] 🔄 Changement détecté, re-catégorisation optimisée');
        // Debounced recategorization
        this.debounce(() => {
            this.recategorizeEmailsOptimized();
        }, 200)();
    } else if (!hasChanged) {
        console.log('[EmailScanner] ✅ Aucun changement détecté');
    }
    
    return this.taskPreselectedCategories;
};

EmailScanner.prototype.updateSettings = function(newSettings) {
    console.log('[EmailScanner] 📝 updateSettings optimisé:', newSettings);
    
    const oldSettings = this.settings;
    this.settings = { ...this.settings, ...newSettings };
    
    if (newSettings.taskPreselectedCategories) {
        this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
    }
    
    // Vérification rapide des changements critiques
    const criticalChanges = ['activeCategories', 'categoryExclusions', 'preferences']
        .some(key => this.hashArray(oldSettings[key]) !== this.hashArray(newSettings[key]));
    
    if (criticalChanges && this.emails.length > 0) {
        console.log('[EmailScanner] 🔄 Changements critiques détectés, re-catégorisation optimisée');
        this.debounce(() => {
            this.recategorizeEmailsOptimized();
        }, 300)();
    }
    
    return this.settings;
};

EmailScanner.prototype.getTaskPreselectedCategories = function() {
    // Cache simple avec validation
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 secondes
    
    if (this._categoriesCache && 
        this._categoriesCacheTime && 
        (now - this._categoriesCacheTime) < CACHE_DURATION) {
        return this._categoriesCache;
    }
    
    // Sync rapide avec CategoryManager
    if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
        const managerCategories = window.categoryManager.getTaskPreselectedCategories();
        
        this._categoriesCache = [...managerCategories];
        this._categoriesCacheTime = now;
        
        // Log optimisé (seulement si changement)
        if (this.hashArray(this.taskPreselectedCategories) !== this.hashArray(managerCategories)) {
            console.log('[EmailScanner] 📋 Catégories tâches synchronisées:', managerCategories);
            this.taskPreselectedCategories = [...managerCategories];
        }
        
        return this._categoriesCache;
    }
    
    return [...this.taskPreselectedCategories];
};

EmailScanner.prototype.invalidateCategoriesCache = function() {
    this._categoriesCache = null;
    this._categoriesCacheTime = 0;
};

EmailScanner.prototype.getSettings = function() {
    return this.settings; // Pas de copie pour performance
};

EmailScanner.prototype.forceSettingsReload = function() {
    console.log('[EmailScanner] 🔄 === RECHARGEMENT FORCÉ OPTIMISÉ ===');
    
    return this.loadSettingsFromCategoryManagerOptimized().then(() => {
        console.log('[EmailScanner] ✅ Rechargement optimisé terminé');
        
        setTimeout(() => {
            this.dispatchEvent('emailScannerSettingsReloaded', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
        
        return this.settings;
    });
};

EmailScanner.prototype.loadSettingsFromCategoryManagerOptimized = async function() {
    if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
        try {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
            
            console.log('[EmailScanner] ✅ Paramètres chargés (optimisé)');
            this.lastSettingsSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('[EmailScanner] Erreur chargement optimisé:', error);
            return this.loadSettingsFromFallback();
        }
    } else {
        console.warn('[EmailScanner] CategoryManager non disponible');
        return this.loadSettingsFromFallback();
    }
};

EmailScanner.prototype.loadSettingsFromFallback = function() {
    try {
        const saved = localStorage.getItem('categorySettings');
        if (saved) {
            this.settings = JSON.parse(saved);
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            console.log('[EmailScanner] 📦 Fallback depuis localStorage');
        } else {
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            console.log('[EmailScanner] 📝 Settings par défaut');
        }
        
        this.lastSettingsSync = Date.now();
        return true;
        
    } catch (error) {
        console.error('[EmailScanner] Erreur fallback:', error);
        this.settings = this.getDefaultSettings();
        this.taskPreselectedCategories = [];
        return false;
    }
};

EmailScanner.prototype.getDefaultSettings = function() {
    return {
        activeCategories: null,
        excludedDomains: [],
        excludedKeywords: [],
        taskPreselectedCategories: [],
        categoryExclusions: { domains: [], emails: [] },
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
};

// ================================================
// MÉTHODES D'ACTIONS BATCH OPTIMISÉES
// ================================================
EmailScanner.prototype.performBatchAction = async function(emailIds, action) {
    console.log(`[EmailScanner] 🔄 Action batch optimisée ${action} sur ${emailIds.length} emails`);

    if (!window.mailService) {
        console.error('[EmailScanner] MailService non disponible');
        return;
    }

    const batchSize = 10; // Traitement par petits lots
    const results = [];

    try {
        for (let i = 0; i < emailIds.length; i += batchSize) {
            const batch = emailIds.slice(i, i + batchSize);
            
            switch (action) {
                case 'markAsRead':
                    if (typeof window.mailService.markAsRead === 'function') {
                        const promises = batch.map(id => window.mailService.markAsRead(id));
                        await Promise.allSettled(promises);
                    }
                    break;

                case 'delete':
                    if (typeof window.mailService.deleteEmails === 'function') {
                        await window.mailService.deleteEmails(batch);
                    }
                    break;

                case 'moveToSpam':
                    if (typeof window.mailService.moveToFolder === 'function') {
                        const promises = batch.map(id => 
                            window.mailService.moveToFolder(id, 'junkemail')
                        );
                        await Promise.allSettled(promises);
                    }
                    break;

                default:
                    console.warn(`[EmailScanner] Action inconnue: ${action}`);
            }
            
            // Pause entre les batches
            if (i + batchSize < emailIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        if (window.uiManager) {
            window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
        }
        
    } catch (error) {
        console.error(`[EmailScanner] Erreur action batch optimisée:`, error);
        if (window.uiManager) {
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
        }
    }
};

// ================================================
// EXPORT OPTIMISÉ
// ================================================
EmailScanner.prototype.exportToJSON = function() {
    console.log('[EmailScanner] 📤 Export JSON optimisé...');
    
    const data = {
        scanDate: new Date().toISOString(),
        totalEmails: this.emails.length,
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        stats: this.getDetailedResultsOptimized().stats,
        settings: this.settings,
        scanMetrics: this.scanMetrics,
        performanceStats: this.performanceMonitor.getStats(),
        categories: {},
        emails: []
    };

    // Export catégories optimisé
    Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
        const categoryInfo = window.categoryManager?.getCategory(catId) || { name: catId, icon: '📂' };
        const preselectedInCategory = emails.filter(e => e.isPreselectedForTasks).length;
        
        data.categories[catId] = {
            name: categoryInfo.name,
            icon: categoryInfo.icon,
            count: emails.length,
            percentage: Math.round((emails.length / this.emails.length) * 100),
            preselectedCount: preselectedInCategory,
            isPreselectedCategory: this.taskPreselectedCategories.includes(catId)
        };
    });

    // Export emails optimisé (propriétés essentielles seulement)
    data.emails = this.emails.map(email => ({
        id: email.id,
        date: email.receivedDateTime,
        from: email.from?.emailAddress?.address,
        subject: email.subject,
        category: email.category,
        confidence: Math.round((email.categoryConfidence || 0) * 100),
        score: email.categoryScore || 0,
        hasAbsolute: email.hasAbsolute || false,
        taskSuggested: email.taskSuggested || false,
        isPreselectedForTasks: email.isPreselectedForTasks || false,
        keywordMatchCount: email.matchedPatterns?.length || 0
    }));

    return JSON.stringify(data, null, 2);
};

EmailScanner.prototype.exportToCSV = function() {
    console.log('[EmailScanner] 📤 Export CSV optimisé...');
    
    const rows = [
        ['Date', 'De', 'Sujet', 'Catégorie', 'Confiance%', 'Score', 'Pré-sélectionné', 'Tâche suggérée']
    ];

    // Export optimisé avec boucle for
    for (let i = 0; i < this.emails.length; i++) {
        const email = this.emails[i];
        const categoryInfo = window.categoryManager?.getCategory(email.category) || { name: email.category || 'other' };
        
        rows.push([
            new Date(email.receivedDateTime).toLocaleDateString('fr-FR'),
            email.from?.emailAddress?.address || '',
            email.subject || 'Sans sujet',
            categoryInfo.name,
            Math.round((email.categoryConfidence || 0) * 100),
            email.categoryScore || 0,
            email.isPreselectedForTasks ? 'Oui' : 'Non',
            email.taskSuggested ? 'Oui' : 'Non'
        ]);
    }

    const csv = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return '\ufeff' + csv; // BOM UTF-8
};

EmailScanner.prototype.exportResults = function(format = 'csv') {
    console.log('[EmailScanner] 📤 Export optimisé des résultats en', format);
    
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
            filename = `email_scan_optimized_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv;charset=utf-8;';
        } else {
            content = this.exportToJSON();
            filename = `email_scan_optimized_${new Date().toISOString().split('T')[0]}.json`;
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
            window.uiManager.showToast(`${this.emails.length} emails exportés (optimisé)`, 'success');
        }
        
    } catch (error) {
        console.error('[EmailScanner] ❌ Erreur export optimisé:', error);
        if (window.uiManager) {
            window.uiManager.showToast('Erreur lors de l\'export', 'error');
        }
    }
};

// ================================================
// EVENT LISTENERS OPTIMISÉS
// ================================================
EmailScanner.prototype.setupOptimizedEventListeners = function() {
    if (this.eventListenersSetup) return;

    // Event handlers avec debounce
    this.keywordsUpdateHandler = this.debounce((event) => {
        console.log('[EmailScanner] 🔑 Mots-clés mis à jour (debounced)');
        if (this.emails.length > 0) {
            this.recategorizeEmailsOptimized();
        }
    }, 500);

    this.forceSyncHandler = this.debounce((event) => {
        if (event.detail?.source === 'EmailScanner') return;
        
        console.log('[EmailScanner] 🚀 Synchronisation forcée (debounced)');
        this.forceSettingsReload();
        
        if (this.emails.length > 0) {
            this.recategorizeEmailsOptimized();
        }
    }, 300);

    window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
    window.addEventListener('forceSynchronization', this.forceSyncHandler);
    
    this.eventListenersSetup = true;
    console.log('[EmailScanner] ✅ Event listeners optimisés configurés');
};

// ================================================
// DEBUG ET MÉTRIQUES OPTIMISÉS
// ================================================
EmailScanner.prototype.getDebugInfo = function() {
    const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
    const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
    
    return {
        isScanning: this.isScanning,
        totalEmails: this.emails.length,
        categorizedCount: Object.values(this.categorizedEmails).reduce((sum, emails) => sum + emails.length, 0),
        categories: Object.keys(this.categorizedEmails).filter(cat => this.categorizedEmails[cat].length > 0),
        taskPreselectedCategories: [...this.taskPreselectedCategories],
        preselectedEmailsCount: preselectedCount,
        preselectedWithTasksCount: preselectedWithTasks,
        avgConfidence: this.calculateAverageConfidenceOptimized(),
        avgScore: this.calculateAverageScoreOptimized(),
        settings: this.settings,
        hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
        lastSettingsSync: this.lastSettingsSync,
        scanMetrics: this.scanMetrics,
        performanceStats: this.performanceMonitor.getStats(),
        changeListener: !!this.changeListener,
        syncStatus: {
            lastSync: this.lastSettingsSync,
            categoriesInSync: this.verifyCategoriesSync(),
            settingsSource: window.categoryManager ? 'CategoryManager' : 'localStorage'
        }
    };
};

EmailScanner.prototype.verifyCategoriesSync = function() {
    if (!window.categoryManager) return false;
    
    const managerCategories = window.categoryManager.getTaskPreselectedCategories();
    return this.hashArray(this.taskPreselectedCategories) === this.hashArray(managerCategories);
};

// ================================================
// NETTOYAGE OPTIMISÉ
// ================================================
EmailScanner.prototype.cleanup = function() {
    console.log('[EmailScanner] 🧹 Nettoyage optimisé...');
    
    // Arrêt des timers
    if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
    }
    
    // Nettoyage du listener CategoryManager
    if (this.changeListener && typeof this.changeListener === 'function') {
        this.changeListener();
        this.changeListener = null;
    }
    
    // Nettoyage des event listeners
    if (this.keywordsUpdateHandler) {
        window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
    }
    if (this.forceSyncHandler) {
        window.removeEventListener('forceSynchronization', this.forceSyncHandler);
    }
    this.eventListenersSetup = false;
    
    // Nettoyage des caches
    this.processingCache.clear();
    this.invalidateCategoriesCache();
    
    // Reset des données
    this.emails.length = 0;
    Object.keys(this.categorizedEmails).forEach(cat => {
        this.categorizedEmails[cat].length = 0;
    });
    this.taskPreselectedCategories.length = 0;
    this.scanProgress = null;
    
    // Reset des métriques
    this.scanMetrics = {
        startTime: null,
        categorizedCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        batchCount: 0,
        avgBatchTime: 0,
        keywordMatches: {},
        categoryDistribution: {}
    };
    
    console.log('[EmailScanner] ✅ Nettoyage optimisé terminé');
};

EmailScanner.prototype.destroy = function() {
    this.cleanup();
    this.settings = {};
    console.log('[EmailScanner] Instance optimisée détruite');
};

EmailScanner.prototype.dispatchEvent = function(eventName, detail) {
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
};

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE ULTRA-OPTIMISÉE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance v9.0 ULTRA-OPTIMISÉE...');
window.emailScanner = new EmailScanner();

// Tests de performance améliorés
window.testEmailScannerPerformance = function() {
    console.group('🚀 TEST PERFORMANCE EmailScanner v9.0');
    
    const start = performance.now();
    
    // Générer des emails de test plus réalistes
    const testEmails = Array.from({ length: 500 }, (_, i) => ({
        id: `test-${i}`,
        subject: [
            `Facture #${1000 + i}`, 
            `Meeting demain à 14h`,
            `Newsletter hebdomadaire`,
            `Action requise: validation urgente`,
            `Projet XYZ - mise à jour`
        ][i % 5],
        from: { emailAddress: { address: `test${i}@example.com` } },
        bodyPreview: 'Contenu de test avec mots-clés importants',
        receivedDateTime: new Date(Date.now() - i * 3600000).toISOString(),
        toRecipients: [{ emailAddress: { address: 'user@company.com' } }]
    }));
    
    console.log('Test de performance sur 500 emails...');
    
    // Test de catégorisation en batch
    window.emailScanner.emails = testEmails;
    
    const categorizationStart = performance.now();
    window.emailScanner.categorizeEmailsUltraOptimized();
    const categorizationEnd = performance.now();
    
    const end = performance.now();
    const totalDuration = end - start;
    const categorizationDuration = categorizationEnd - categorizationStart;
    
    console.log(`✅ 500 emails traités en ${totalDuration.toFixed(2)}ms`);
    console.log(`📊 Catégorisation: ${categorizationDuration.toFixed(2)}ms`);
    console.log(`📈 Performance: ${(500 / (totalDuration / 1000)).toFixed(0)} emails/sec`);
    console.log(`📈 Estimation 3000 emails: ${(totalDuration * 6).toFixed(2)}ms (~${((totalDuration * 6) / 1000).toFixed(1)}s)`);
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('📋 Catégories détectées:', debugInfo.categories.length);
    console.log('⭐ Emails pré-sélectionnés:', debugInfo.preselectedEmailsCount);
    
    const perfStats = debugInfo.performanceStats;
    console.log('🚀 Stats de performance:', perfStats);
    
    console.groupEnd();
    return { 
        totalDuration, 
        categorizationDuration,
        emailsPerSecond: 500 / (totalDuration / 1000),
        estimatedFor3000: (totalDuration * 6) / 1000
    };
};

window.debugEmailScannerOptimized = function() {
    console.group('📊 DEBUG EmailScanner OPTIMISÉ v9.0');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Infos générales:', {
        totalEmails: debugInfo.totalEmails,
        preselectedCount: debugInfo.preselectedEmailsCount,
        avgConfidence: debugInfo.avgConfidence,
        avgScore: debugInfo.avgScore
    });
    
    console.log('Performance:', debugInfo.performanceStats);
    console.log('Métriques scan:', debugInfo.scanMetrics);
    console.log('Synchronisation:', debugInfo.syncStatus);
    
    console.groupEnd();
    return debugInfo;
};

console.log('✅ EmailScanner v9.0 ULTRA-OPTIMISÉ loaded - Performance maximisée! 🚀');
