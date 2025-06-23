// EmailScanner.js - Version 10.0 - Complètement corrigé et optimisé

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null; // 'microsoft' ou 'google'
        this.isInitialized = false;
        this.initPromise = null;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            provider: null
        };
        
        // Système de listeners
        this.changeListeners = [];
        this.eventListenersSetup = false;
        
        console.log('[EmailScanner] 🚀 Initialisation version 10.0...');
        this.init();
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        try {
            console.log('[EmailScanner] 📋 Initialisation...');
            
            // Attendre CategoryManager
            await this.waitForCategoryManager();
            
            // Charger les paramètres
            await this.loadSettings();
            
            // Setup des listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[EmailScanner] ✅ Initialisation terminée');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur initialisation:', error);
            // Continuer avec paramètres par défaut
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            this.isInitialized = true;
        }
    }

    async waitForCategoryManager() {
        console.log('[EmailScanner] ⏳ Attente CategoryManager...');
        
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!window.categoryManager?.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
            
            if (attempts % 20 === 0) {
                console.log(`[EmailScanner] Attente CategoryManager... (${attempts}/${maxAttempts})`);
            }
        }
        
        if (!window.categoryManager?.isInitialized) {
            throw new Error('CategoryManager non disponible après timeout');
        }
        
        console.log('[EmailScanner] ✅ CategoryManager disponible');
    }

    // ================================================
    // DÉTECTION PROVIDER UNIFIÉ
    // ================================================
    detectProvider() {
        if (window.authService?.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            return 'microsoft';
        } else if (window.googleAuthService?.isAuthenticated()) {
            this.currentProvider = 'google';
            return 'google';
        }
        this.currentProvider = null;
        return null;
    }

    getProviderInfo() {
        const provider = this.detectProvider();
        
        if (provider === 'microsoft') {
            return {
                name: 'Microsoft Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4'
            };
        } else if (provider === 'google') {
            return {
                name: 'Google Gmail',
                icon: 'fab fa-google',
                color: '#ea4335'
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-question-circle',
            color: '#6b7280'
        };
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    async loadSettings() {
        try {
            if (window.categoryManager?.getSettings) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
            } else {
                // Fallback localStorage
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    this.settings = JSON.parse(saved);
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                } else {
                    this.settings = this.getDefaultSettings();
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                }
                console.log('[EmailScanner] 📦 Paramètres chargés depuis localStorage');
            }
            
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[EmailScanner] Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
        }
    }

    getDefaultSettings() {
        return {
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
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

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changement détecté, re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Mise à jour paramètres:', newSettings);
        
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
        
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
        if (window.categoryManager?.getTaskPreselectedCategories) {
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            
            // Synchroniser si différent
            if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                JSON.stringify([...managerCategories].sort())) {
                this.taskPreselectedCategories = [...managerCategories];
            }
            
            return [...managerCategories];
        }
        
        return [...this.taskPreselectedCategories];
    }

    getSettings() {
        return { ...this.settings };
    }

    // ================================================
    // SCAN UNIFIÉ OUTLOOK/GMAIL
    // ================================================
    async scan(options = {}) {
        if (!window.categoryManager?.isInitialized) {
            throw new Error('CategoryManager requis pour la catégorisation');
        }
        
        const provider = this.detectProvider();
        if (!provider) {
            throw new Error('Aucun provider d\'authentification disponible');
        }
        
        console.log(`[EmailScanner] 🚀 Démarrage scan (${provider})`);
        
        // Synchronisation pré-scan
        const freshCategories = window.categoryManager.getTaskPreselectedCategories();
        this.taskPreselectedCategories = [...freshCategories];
        const freshSettings = window.categoryManager.getSettings();
        this.settings = { ...this.settings, ...freshSettings };
        
        console.log('[EmailScanner] ✅ Synchronisation pré-scan terminée');
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = options.onProgress;
            this.scanMetrics.startTime = Date.now();
            this.scanMetrics.provider = provider;
            
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
                provider: provider
            };

            console.log('[EmailScanner] 📊 Options scan:', mergedOptions);

            // Vérifier MailService
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - mergedOptions.days);

            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération emails ${provider} (${mergedOptions.days} jours)...`,
                    progress: { current: 0, total: 100 },
                    provider: provider
                });
            }

            console.log(`[EmailScanner] 📧 Récupération emails ${provider}...`);

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
                throw new Error(`Aucune méthode de récupération d'emails disponible pour ${provider}`);
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés (${provider})`);

            if (this.emails.length === 0) {
                console.warn(`[EmailScanner] Aucun email trouvé (${provider})`);
                return this.getEmptyResults(provider);
            }

            this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation emails ${provider}...`,
                        progress: { current: 0, total: this.emails.length },
                        provider: provider
                    });
                }

                await this.categorizeEmails();
            }

            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA (${provider})...`,
                        progress: { current: 0, total: Math.min(this.emails.length, 10) },
                        provider: provider
                    });
                }

                await this.analyzeForTasks();
            }

            const results = this.getDetailedResults();

            console.log('[EmailScanner] 📊 Résultats scan:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks,
                provider: provider
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: `Scan ${provider} terminé !`,
                    results,
                    provider: provider
                });
            }

            this.logScanResults(results);
            
            // Dispatcher événement
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks,
                    scanMetrics: this.scanMetrics,
                    provider: provider
                });
            }, 10);

            return results;

        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur scan ${provider}:`, error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur ${provider}: ${error.message}`,
                    error,
                    provider: provider
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    getEmptyResults(provider) {
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
            provider: provider
        };
    }

    // ================================================
    // CATÉGORISATION
    // ================================================
    async categorizeEmails() {
        if (!window.categoryManager?.isInitialized) {
            throw new Error('CategoryManager non disponible pour catégorisation');
        }
        
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;
        const provider = this.detectProvider();
        
        console.log(`[EmailScanner] 🏷️ Début catégorisation (${total} emails, ${provider})`);
        
        const categoryStats = {};
        const keywordStats = {};
        const categories = window.categoryManager.getCategories() || {};
        
        // Initialiser les stats
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
            keywordStats[catId] = {
                absoluteMatches: 0,
                strongMatches: 0,
                weakMatches: 0,
                exclusionMatches: 0
            };
        });
        
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
        this.taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    const finalCategory = analysis.category || 'other';
                    
                    // Enrichir l'email avec les données d'analyse
                    email.category = finalCategory;
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    email.provider = provider;
                    
                    // Marquer si pré-sélectionné pour tâches
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(finalCategory);
                    
                    if (email.isPreselectedForTasks) {
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Traiter les patterns matchés
                    if (email.matchedPatterns?.length > 0) {
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
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    this.categorizedEmails[finalCategory].push(email);
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error(`[EmailScanner] Erreur catégorisation email:`, error);
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    email.categoryScore = 0;
                    email.categoryConfidence = 0;
                    email.matchedPatterns = [];
                    email.provider = provider;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                    categoryStats.other = (categoryStats.other || 0) + 1;
                    errors++;
                }

                processed++;
            }

            // Mise à jour progression
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation ${provider}: ${processed}/${total} (${percent}%)`,
                    progress: { current: processed, total },
                    provider: provider
                });
            }

            // Micro-pause
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        // Sauvegarder métriques
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.keywordMatches = keywordStats;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        
        console.log(`[EmailScanner] ✅ Catégorisation terminée (${provider})`);
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        if (!window.categoryManager?.isInitialized) {
            console.error('[EmailScanner] CategoryManager non disponible pour recatégorisation');
            return;
        }

        const provider = this.detectProvider();
        console.log(`[EmailScanner] 🔄 Début re-catégorisation (${provider})`);
        
        // Réinitialiser
        this.scanMetrics.startTime = Date.now();
        this.scanMetrics.categorizedCount = 0;
        this.scanMetrics.keywordMatches = {};
        this.scanMetrics.categoryDistribution = {};
        this.scanMetrics.provider = provider;
        
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Dispatcher événement
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                keywordStats: this.scanMetrics.keywordMatches,
                provider: provider
            });
        }, 10);
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible');
            return;
        }

        const provider = this.detectProvider();
        
        // Prioriser les emails pré-sélectionnés
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8 &&
            ['tasks', 'commercial', 'finance', 'meetings'].includes(email.category)
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA (${emailsToAnalyze.length} emails, ${provider})`);
        console.log(`[EmailScanner] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA ${provider}: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length },
                        provider: provider
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`[EmailScanner] Erreur analyse IA (${provider}):`, error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

        console.log(`[EmailScanner] ✅ Analyse IA terminée (${provider})`);
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
        console.log('[EmailScanner] ⭐ Dont pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // RÉSULTATS ET MÉTRIQUES
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
        const provider = this.detectProvider();

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

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            provider: provider,
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
                provider: provider
            },
            keywordStats: this.scanMetrics.keywordMatches,
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics
        };
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

    // ================================================
    // ACCÈS AUX DONNÉES
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

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    // ================================================
    // ACTIONS BATCH
    // ================================================
    async performBatchAction(emailIds, action) {
        const provider = this.detectProvider();
        console.log(`[EmailScanner] 🔄 Action ${action} sur ${emailIds.length} emails (${provider})`);

        if (!window.mailService) {
            console.error('MailService non disponible');
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
                        const promises = emailIds.map(id => 
                            window.mailService.moveToFolder(id, 'junkemail')
                        );
                        await Promise.allSettled(promises);
                    }
                    break;

                default:
                    console.warn(`Action inconnue: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails ${provider}`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] Erreur action batch (${provider}):`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    // ================================================
    // EXPORT
    // ================================================
    exportToJSON() {
        const provider = this.detectProvider();
        const providerInfo = this.getProviderInfo();
        
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            provider: provider,
            providerInfo: providerInfo,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: this.getDetailedResults().stats,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            version: '10.0',
            categories: {},
            emails: []
        };

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
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId)
            };
        });

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
            provider: email.provider || provider,
            patterns: email.matchedPatterns?.map(p => ({
                type: p.type,
                keyword: p.keyword,
                score: p.score
            }))
        }));

        return JSON.stringify(data, null, 2);
    }

    exportToCSV() {
        const provider = this.detectProvider();
        
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Pré-sélectionné', 'Provider']
        ];

        this.emails.forEach(email => {
            const categoryInfo = window.categoryManager?.getCategory(email.category) || 
                { name: email.category || 'other' };
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo.name,
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.provider || provider
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        return '\ufeff' + csv;
    }

    exportResults(format = 'csv') {
        const provider = this.detectProvider();
        console.log(`[EmailScanner] 📤 Export résultats ${format} (${provider})`);
        
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
                filename = `email_scan_${provider}_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else {
                content = this.exportToJSON();
                filename = `email_scan_${provider}_${new Date().toISOString().split('T')[0]}.json`;
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
                window.uiManager.showToast(`Export ${provider} terminé`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] Erreur export (${provider}):`, error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    reset() {
        const provider = this.detectProvider();
        console.log(`[EmailScanner] 🔄 Réinitialisation (${provider})`);
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            provider: provider
        };
        
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        ['other', 'excluded', 'spam', 'personal'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
        
        console.log(`[EmailScanner] ✅ Réinitialisation terminée (${provider})`);
    }

    logScanResults(results) {
        const provider = this.detectProvider();
        
        console.log(`[EmailScanner] 📊 === RÉSULTATS SCAN ${provider.toUpperCase()} ===`);
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] ⭐ PRÉ-SÉLECTIONNÉS: ${results.stats.preselectedForTasks}`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Suggestions tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScanner] Durée: ${results.stats.scanDuration}s`);
        console.log(`[EmailScanner] Provider: ${provider}`);
        
        console.log(`[EmailScanner] Distribution par catégorie:`);
        Object.entries(results.breakdown).forEach(([catId, count]) => {
            if (count > 0) {
                const categoryInfo = window.categoryManager?.getCategory(catId) || { name: catId, icon: '📂' };
                const percentage = Math.round((count / results.total) * 100);
                const isPreselected = this.taskPreselectedCategories.includes(catId);
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} (${percentage}%)${isPreselected ? ' ⭐' : ''}`);
            }
        });
        
        console.log('[EmailScanner] ===============================');
    }

    // ================================================
    // ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter les changements de CategoryManager
        if (window.categoryManager?.addChangeListener) {
            this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                this.handleCategoryManagerChange(type, value, fullSettings);
            });
        }

        // Écouter les événements globaux
        this.keywordsUpdateHandler = (event) => {
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        };

        window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés');
    }

    handleCategoryManagerChange(type, value, fullSettings) {
        console.log(`[EmailScanner] 📨 Changement CategoryManager: ${type}`);
        
        const needsRecategorization = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'preferences'
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
                
            case 'preferences':
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
                
            case 'fullSync':
            case 'fullSettings':
                this.settings = { ...this.settings, ...fullSettings };
                this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                break;
        }
        
        if (needsRecategorization && this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
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
    // DEBUG ET DIAGNOSTIC
    // ================================================
    getDebugInfo() {
        const provider = this.detectProvider();
        const providerInfo = this.getProviderInfo();
        
        return {
            isInitialized: this.isInitialized,
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails)
                .filter(cat => this.categorizedEmails[cat].length > 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            categoryManagerAvailable: !!window.categoryManager,
            categoryManagerReady: window.categoryManager?.isInitialized || false,
            mailServiceAvailable: !!window.mailService,
            aiTaskAnalyzerAvailable: !!window.aiTaskAnalyzer,
            scanMetrics: this.scanMetrics,
            changeListener: !!this.changeListener,
            currentProvider: provider,
            providerInfo: providerInfo,
            version: '10.0'
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        const provider = this.detectProvider();
        console.log(`[EmailScanner] 🧹 Nettoyage (${provider})`);
        
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
            this.changeListener = null;
        }
        
        if (this.keywordsUpdateHandler) {
            window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        }
        
        this.eventListenersSetup = false;
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        this.currentProvider = null;
        
        console.log(`[EmailScanner] ✅ Nettoyage terminé (${provider})`);
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.isInitialized = false;
        console.log('[EmailScanner] 💥 Instance détruite');
    }
}

// ================================================
// CRÉATION INSTANCE GLOBALE SÉCURISÉE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance...');
window.emailScanner = new EmailScanner();

// Export de la classe
window.EmailScanner = EmailScanner;

// Méthodes globales de test et debug
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v10.0');
    
    const provider = window.emailScanner.detectProvider();
    const providerInfo = window.emailScanner.getProviderInfo();
    const debugInfo = window.emailScanner.getDebugInfo();
    
    console.log('Provider détecté:', provider);
    console.log('Provider info:', providerInfo);
    console.log('Initialisé:', debugInfo.isInitialized);
    console.log('CategoryManager prêt:', debugInfo.categoryManagerReady);
    
    console.log('Debug Info:', debugInfo);
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    
    console.groupEnd();
    return { 
        success: true, 
        provider, 
        providerInfo,
        debugInfo
    };
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories EmailScanner');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    
    console.log('Provider:', debugInfo.currentProvider);
    console.log('Initialisé:', debugInfo.isInitialized);
    console.log('CategoryManager prêt:', debugInfo.categoryManagerReady);
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
    
    console.groupEnd();
    return debugInfo;
};

window.forceEmailScannerSync = function() {
    if (window.emailScanner.isInitialized && window.categoryManager?.isInitialized) {
        const freshCategories = window.categoryManager.getTaskPreselectedCategories();
        window.emailScanner.updateTaskPreselectedCategories(freshCategories);
        
        if (window.emailScanner.emails.length > 0) {
            window.emailScanner.recategorizeEmails();
        }
        
        return { 
            success: true, 
            message: 'Synchronisation EmailScanner forcée',
            provider: window.emailScanner.detectProvider(),
            categories: freshCategories
        };
    } else {
        return {
            success: false,
            message: 'EmailScanner ou CategoryManager non prêt'
        };
    }
};

console.log('✅ EmailScanner v10.0 loaded - Complètement corrigé et optimisé');
