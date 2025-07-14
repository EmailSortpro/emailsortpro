// EmailScanner.js - Version 18.0 - Scanner simplifié utilisant CategoryManager
// Aucun mot-clé dans ce fichier - Délégation complète à CategoryManager

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v18.0 - Pure CategoryManager delegation...');

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Configuration
        this.config = {
            batchSize: 100,
            categorizationDelay: 0,
            debugMode: false
        };
        
        // Métriques
        this.metrics = {
            startTime: null,
            categorizedCount: 0,
            errors: 0,
            avgCategorizeTime: 0
        };
        
        console.log('[EmailScanner] ✅ Version 18.0 initialized - Pure delegation to CategoryManager');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initializing...');
        
        try {
            await this.loadSettingsFromCategoryManager();
            this.registerAsChangeListener();
            this.setupEventListeners();
            
            console.log('[EmailScanner] ✅ Initialization complete');
            console.log('[EmailScanner] ⭐ Task categories:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Initialization error:', error);
        }
    }

    // ================================================
    // ANALYSE D'EMAIL - DÉLÉGATION COMPLÈTE
    // ================================================
    analyzeEmail(email) {
        if (!email || !window.categoryManager) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        const startTime = performance.now();
        
        try {
            // Déléguer complètement l'analyse à CategoryManager
            const result = window.categoryManager.analyzeEmail(email);
            
            // CategoryManager gère déjà spam, CC, et toutes les catégories
            // On retourne simplement le résultat
            
            this.updateMetrics(startTime);
            
            if (this.config.debugMode && result.category !== 'other') {
                console.log(`[EmailScanner] Email "${email.subject?.substring(0, 50)}..." → ${result.category} (score: ${result.score})`);
            }
            
            return result;
            
        } catch (error) {
            console.error('[EmailScanner] Analysis error:', error);
            this.metrics.errors++;
            return { category: 'other', score: 0, confidence: 0, error: error.message };
        }
    }

    // ================================================
    // SCAN PRINCIPAL
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === STARTING SCAN v18.0 ===');
        
        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan already in progress');
            return null;
        }

        const scanOptions = this.prepareScanOptions(options);
        console.log('[EmailScanner] 📊 Scan options:', scanOptions);

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = scanOptions.onProgress;
            this.metrics.startTime = Date.now();

            // Étape 1: Récupération des emails
            await this.fetchEmails(scanOptions);
            
            if (this.emails.length === 0) {
                return this.buildResults(scanOptions);
            }

            // Étape 2: Catégorisation via CategoryManager
            if (scanOptions.autoCategrize) {
                await this.categorizeEmails();
            }

            // Étape 3: Analyse IA (optionnelle)
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeForTasks();
            }

            // Résultats
            const results = this.buildResults(scanOptions);
            
            const scanTime = Date.now() - this.metrics.startTime;
            console.log(`[EmailScanner] 🎉 === SCAN COMPLETED in ${scanTime}ms ===`);
            console.log('[EmailScanner] 📊 Results:', {
                total: results.total,
                categorized: results.categorized,
                preselected: results.stats.preselectedForTasks,
                breakdown: results.breakdown
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé !',
                    results
                });
            }

            // Notifier
            this.dispatchEvent('scanCompleted', {
                results,
                emails: this.emails,
                metrics: this.metrics
            });

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Scan error:', error);
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
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        console.log(`[EmailScanner] 🏷️ === CATEGORIZING ${total} EMAILS ===`);
        console.log('[EmailScanner] ⭐ Preselected categories:', this.taskPreselectedCategories);

        let processed = 0;
        const batchSize = this.config.batchSize;
        
        // Traiter par batches
        for (let i = 0; i < total; i += batchSize) {
            const batch = this.emails.slice(i, Math.min(i + batchSize, total));
            
            batch.forEach(email => {
                try {
                    // Utiliser CategoryManager pour l'analyse
                    const analysis = this.analyzeEmail(email);
                    
                    // Assigner les résultats
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    
                    // Vérifier si pré-sélectionné pour tâches
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(analysis.category);
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[analysis.category]) {
                        this.categorizedEmails[analysis.category] = [];
                    }
                    this.categorizedEmails[analysis.category].push(email);
                    
                    processed++;
                    this.metrics.categorizedCount++;
                    
                } catch (error) {
                    console.error('[EmailScanner] Categorization error:', error);
                    this.metrics.errors++;
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                    
                    processed++;
                }
            });
            
            // Mise à jour du progrès
            if (this.scanProgress) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                    progress: { current: processed, total }
                });
            }
            
            // Micro-pause entre batches si configuré
            if (this.config.categorizationDelay > 0 && i + batchSize < total) {
                await new Promise(resolve => setTimeout(resolve, this.config.categorizationDelay));
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        
        // Log distribution
        console.log('[EmailScanner] 📊 Category distribution:');
        Object.entries(this.categorizedEmails).forEach(([cat, emails]) => {
            if (emails.length > 0) {
                console.log(`  - ${cat}: ${emails.length} emails`);
            }
        });
    }

    // ================================================
    // ANALYSE IA DES TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer not available');
            return;
        }

        const emailsToAnalyze = this.emails
            .filter(email => email.isPreselectedForTasks && email.categoryConfidence > 0.6)
            .sort((a, b) => b.categoryConfidence - a.categoryConfidence)
            .slice(0, 50);

        console.log(`[EmailScanner] 🤖 AI analysis for ${emailsToAnalyze.length} emails`);

        for (const email of emailsToAnalyze) {
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
            } catch (error) {
                console.error('[EmailScanner] AI analysis error:', error);
                email.aiAnalysisError = error.message;
            }
        }
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

    prepareScanOptions(options) {
        const scanSettings = this.settings.scanSettings || {};
        
        return {
            days: options.days ?? scanSettings.defaultPeriod ?? 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails ?? scanSettings.maxEmails ?? 1000,
            autoAnalyze: options.autoAnalyze ?? scanSettings.autoAnalyze ?? true,
            autoCategrize: options.autoCategrize ?? scanSettings.autoCategrize ?? true,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam ?? !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails(options) {
        console.log('[EmailScanner] 📬 Fetching emails...');
        
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

            const emails = await window.mailService.getMessages(options.folder, {
                maxResults: options.maxEmails,
                days: options.days,
                includeSpam: options.includeSpam
            });

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails fetched`);

        } catch (error) {
            console.error('[EmailScanner] ❌ Fetch error:', error);
            throw error;
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

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other' && catId !== 'spam' && catId !== 'excluded') {
                totalCategorized += emails.length;
            }
            
            emails.forEach(email => {
                if (email.categoryConfidence >= 0.8) {
                    totalWithHighConfidence++;
                }
                if (email.taskSuggested) {
                    totalWithTasks++;
                }
                if (email.isPreselectedForTasks) {
                    totalPreselected++;
                }
            });
        });

        const scanDuration = this.metrics.startTime ? 
            Math.round((Date.now() - this.metrics.startTime) / 1000) : 0;

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
                scanDuration: scanDuration
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.metrics,
            provider: options.provider
        };
    }

    // ================================================
    // RESET ET NETTOYAGE
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Resetting...');
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.metrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            errors: 0,
            avgCategorizeTime: 0
        };
        
        // Initialiser toutes les catégories possibles
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories() || {};
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // Catégories spéciales toujours présentes
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
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                
                console.log('[EmailScanner] ✅ Settings loaded from CategoryManager');
                console.log('[EmailScanner] ⭐ Task categories:', this.taskPreselectedCategories);
                
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ CategoryManager load error:', error);
                return this.loadDefaultSettings();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager not available');
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
                maxEmails: 1000
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

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Updating settings:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Updating task categories:', categories);
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        if (this.emails.length > 0) {
            let updated = 0;
            this.emails.forEach(email => {
                const wasPreselected = email.isPreselectedForTasks;
                email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                if (wasPreselected !== email.isPreselectedForTasks) {
                    updated++;
                }
            });
            
            if (updated > 0) {
                console.log(`[EmailScanner] ✅ ${updated} emails updated for task preselection`);
            }
        }
    }

    // ================================================
    // RECATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ No emails to recategorize');
            return;
        }

        console.log('[EmailScanner] 🔄 === RECATEGORIZING EMAILS ===');
        
        // Recharger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // Réinitialiser les catégories
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });
        
        this.metrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            errors: 0,
            avgCategorizeTime: 0
        };

        // Recatégoriser
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Recategorization complete');
        
        // Notifier
        this.dispatchEvent('emailsRecategorized', {
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

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getCategoryBreakdown() {
        const breakdown = {};
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
        });
        return breakdown;
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((type, data) => {
                console.log(`[EmailScanner] 📨 CategoryManager change: ${type}`);
                this.handleCategoryManagerChange(type, data);
            });
            
            console.log('[EmailScanner] 👂 CategoryManager listener registered');
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
            console.log('[EmailScanner] 🔄 Auto-recategorization triggered');
            clearTimeout(this._recategorizeTimeout);
            this._recategorizeTimeout = setTimeout(() => {
                this.recategorizeEmails();
            }, 500);
        }
    }

    setupEventListeners() {
        // Écouter les changements de CategoryManager
        window.addEventListener('categorySettingsChanged', (event) => {
            if (event.detail?.source !== 'EmailScanner') {
                const { type, value } = event.detail;
                if (type === 'taskPreselectedCategories') {
                    this.updateTaskPreselectedCategories(value);
                }
            }
        });
        
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.type === 'taskPreselectedCategories') {
                this.updateTaskPreselectedCategories(event.detail.value);
            }
        });
        
        console.log('[EmailScanner] ✅ Event listeners configured');
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
            console.error(`[EmailScanner] ❌ Event dispatch error ${eventName}:`, error);
        }
    }

    // ================================================
    // DEBUG ET EXPORT
    // ================================================
    getDebugInfo() {
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: this.metrics.categorizedCount,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings,
            metrics: {
                ...this.metrics,
                avgCategorizeTimeMs: this.metrics.avgCategorizeTime.toFixed(2)
            },
            config: this.config,
            version: '18.0'
        };
    }

    setDebugMode(enabled) {
        this.config.debugMode = enabled;
        console.log(`[EmailScanner] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    exportStats() {
        const stats = {
            totalEmails: this.emails.length,
            categoryBreakdown: this.getCategoryBreakdown(),
            highConfidence: this.emails.filter(e => e.categoryConfidence >= 0.8).length,
            lowConfidence: this.emails.filter(e => e.categoryConfidence < 0.6 && e.category !== 'other').length,
            preselectedForTasks: this.emails.filter(e => e.isPreselectedForTasks).length,
            ccEmails: this.emails.filter(e => e.isCC).length,
            spamEmails: this.emails.filter(e => e.isSpam).length,
            excludedEmails: this.emails.filter(e => e.isExcluded).length
        };
        
        console.log('[EmailScanner] 📊 Export Stats:', stats);
        return stats;
    }

    destroy() {
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
        }
        
        clearTimeout(this._recategorizeTimeout);
        
        this.emails = [];
        this.categorizedEmails = {};
        
        console.log('[EmailScanner] Instance destroyed');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Cleaning up old instance...');
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v18.0 loaded - Pure CategoryManager delegation');
console.log('🎯 No keywords in scanner - Complete delegation to CategoryManager');
console.log('📧 Simplified architecture for better maintainability');
console.log('🔍 Focus on email management, not categorization logic');
