// EmailScanner.js - Version 7.0 - Intégration complète avec les mots-clés

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // Gestion de la synchronisation temps réel
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.taskPreselectedCategories = [];
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // Initialiser avec les paramètres du CategoryManager
        this.loadSettingsFromCategoryManager();
        this.setupEventListeners();
        this.startSyncMonitoring();
        
        console.log('[EmailScanner] ✅ Version 7.0 - Intégration complète avec les mots-clés');
    }

    // ================================================
    // SURVEILLANCE DE SYNCHRONISATION
    // ================================================
    startSyncMonitoring() {
        // Vérifier la synchronisation toutes les 3 secondes
        this.syncInterval = setInterval(() => {
            this.checkSettingsSync();
        }, 3000);
    }

    checkSettingsSync() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 2000) return;
        
        this.lastSettingsSync = now;
        
        try {
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
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            return window.categoryManager.getSettings();
        }
        
        try {
            return JSON.parse(localStorage.getItem('categorySettings') || '{}');
        } catch (error) {
            console.error('[EmailScanner] Erreur lecture settings:', error);
            return this.getDefaultSettings();
        }
    }

    hasSettingsChanged(newSettings) {
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
        
        const criticalSettings = ['scanSettings', 'preferences', 'categoryExclusions', 'activeCategories'];
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
        console.log('[EmailScanner] 🚀 === SYNCHRONISATION PARAMÈTRES ===');
        
        const oldTaskPreselected = [...(this.taskPreselectedCategories || [])];
        
        this.settings = { ...this.settings, ...newSettings };
        this.taskPreselectedCategories = newSettings.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 📊 Paramètres synchronisés:');
        console.log('  - Anciennes catégories pré-sélectionnées:', oldTaskPreselected);
        console.log('  - Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        if (JSON.stringify(oldTaskPreselected.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort())) {
            if (this.emails.length > 0) {
                console.log('[EmailScanner] 🔄 Déclenchement re-catégorisation auto');
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        }
        
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
        
        console.log('[EmailScanner] ✅ Synchronisation terminée');
    }

    // ================================================
    // SYNCHRONISATION AVEC CATEGORYMANAGER
    // ================================================
    loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            console.log('[EmailScanner] Paramètres chargés depuis CategoryManager:', this.settings);
            console.log('[EmailScanner] Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        } else {
            console.warn('[EmailScanner] CategoryManager non disponible, utilisation paramètres par défaut');
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
        }
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DIRECTE
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...(this.taskPreselectedCategories || [])];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        console.log('[EmailScanner] 📊 Changement catégories:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        if (this.emails.length > 0 && JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort())) {
            console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    getTaskPreselectedCategories() {
        return [...(this.taskPreselectedCategories || [])];
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 Rechargement forcé des paramètres');
        this.loadSettingsFromCategoryManager();
        
        setTimeout(() => {
            this.dispatchEvent('emailScannerSettingsReloaded', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        this.settingsChangeHandler = (event) => {
            console.log('[EmailScanner] 📨 Événement categorySettingsChanged reçu:', event.detail);
            if (event.detail && event.detail.settings) {
                this.synchronizeSettings(event.detail.settings);
            } else {
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
                case 'categoryExclusions':
                    if (this.settings) {
                        this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                    }
                    break;
                case 'activeCategories':
                    if (this.settings) {
                        this.settings.activeCategories = value;
                        // Recatégoriser si nécessaire
                        if (this.emails.length > 0) {
                            setTimeout(() => {
                                this.recategorizeEmails();
                            }, 100);
                        }
                    }
                    break;
                default:
                    this.forceSettingsReload();
            }
        };

        this.forceSyncHandler = (event) => {
            console.log('[EmailScanner] 🚀 Synchronisation forcée demandée');
            this.forceSettingsReload();
            
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        };

        // Écouter les changements de mots-clés
        this.keywordsUpdateHandler = (event) => {
            console.log('[EmailScanner] 🔑 Mots-clés mis à jour pour catégorie:', event.detail.categoryId);
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        };

        window.addEventListener('categorySettingsChanged', this.settingsChangeHandler);
        window.addEventListener('settingsChanged', this.generalSettingsChangeHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] Event listeners configurés avec synchronisation temps réel');
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN
    // ================================================
    async scan(options = {}) {
        // Forcer la synchronisation avant le scan
        this.forceSettingsReload();
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize
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

            console.log('[EmailScanner] 🚀 Démarrage du scan avec options synchronisées:', mergedOptions);
            console.log('[EmailScanner] 📋 Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);
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
                    stats: { processed: 0, errors: 0 },
                    emails: [],
                    taskPreselectedCategories: this.taskPreselectedCategories,
                    scanMetrics: this.scanMetrics
                };
            }

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

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            this.logScanResults(results);
            
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: this.taskPreselectedCategories,
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

    // ================================================
    // CATÉGORISATION AVEC PRÉ-SÉLECTION AMÉLIORÉE
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Catégorisation de', total, 'emails avec CategoryManager');
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);
        console.log('[EmailScanner] 🎯 Catégories actives:', window.categoryManager.getActiveCategories());

        const categoryStats = {};
        const keywordStats = {};
        const categories = window.categoryManager.getCategories();
        
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

        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    
                    // IMPORTANT: Marquer si l'email est dans une catégorie pré-sélectionnée
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                    
                    // Analyser les patterns de mots-clés pour les statistiques
                    if (email.matchedPatterns) {
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
                    
                    const categoryId = email.category;
                    if (!this.categorizedEmails[categoryId]) {
                        this.categorizedEmails[categoryId] = [];
                    }
                    
                    this.categorizedEmails[categoryId].push(email);
                    categoryStats[categoryId] = (categoryStats[categoryId] || 0) + 1;

                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné pour tâche:`, {
                            subject: email.subject?.substring(0, 50),
                            category: email.category,
                            confidence: Math.round(email.categoryConfidence * 100) + '%',
                            keywordMatches: email.matchedPatterns?.length || 0
                        });
                    }

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
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
        
        // Stocker les métriques
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.keywordMatches = keywordStats;
        this.scanMetrics.categoryDistribution = categoryStats;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Emails pré-sélectionnés pour tâches:', preselectedCount);
        console.log('[EmailScanner] 🔑 Statistiques mots-clés:', keywordStats);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        this.logTopPatterns();
        this.logKeywordEffectiveness();
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - PRIORITÉ AUX PRÉ-SÉLECTIONNÉS
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
    // CALCUL DES RÉSULTATS AVEC MÉTRIQUES AVANCÉES
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

    // ================================================
    // LOGGING ET DEBUG AMÉLIORÉ
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
        console.log(`[EmailScanner] Exclus: ${results.stats.excluded}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log(`[EmailScanner] Durée du scan: ${results.stats.scanDuration}s`);
        console.log(`[EmailScanner] 📋 Catégories pré-sélectionnées: ${results.taskPreselectedCategories.join(', ')}`);
        
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
                const preselectedMark = isPreselected ? ' ⭐' : '';
                const effectiveness = results.keywordEffectiveness[cat];
                const efficiencyMark = effectiveness ? ` (${effectiveness.efficiency}% eff.)` : '';
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}${efficiencyMark}`);
            }
        });
        
        console.log('[EmailScanner] ========================');
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
                console.log(`  ${category?.icon || '📂'} ${category?.name || categoryId}:`);
                console.log(`    - Matches totaux: ${stats.totalMatches}`);
                console.log(`    - Ratio absolus: ${stats.absoluteRatio}%`);
                console.log(`    - Exclusions: ${stats.exclusionImpact}`);
                console.log(`    - Efficacité: ${stats.efficiency}%`);
            }
        });
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
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
    // RECATÉGORISATION APRÈS CHANGEMENT
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 Recatégorisation après changement de paramètres...');
        console.log('[EmailScanner] 📋 Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        console.log('[EmailScanner] 🎯 Catégories actives:', window.categoryManager?.getActiveCategories());
        
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
        
        console.log('[EmailScanner] ✅ Recatégorisation terminée');
        
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

    // ================================================
    // MÉTHODES DE MISE À JOUR DEPUIS AUTRES MODULES
    // ================================================
    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Mise à jour settings:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        // Mettre à jour les catégories pré-sélectionnées si présentes
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
        
        // Déclencher recatégorisation si catégories actives changées
        if (newSettings.activeCategories && this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    }

    applyScanSettings(scanSettings) {
        console.log('[EmailScanner] 📝 Application scan settings:', scanSettings);
        this.settings.scanSettings = { ...this.settings.scanSettings, ...scanSettings };
    }

    updatePreferences(preferences) {
        console.log('[EmailScanner] 📝 Mise à jour préférences:', preferences);
        this.settings.preferences = { ...this.settings.preferences, ...preferences };
        
        // Si le filtrage spam change, recatégoriser
        if (preferences.excludeSpam !== undefined && this.emails.length > 0) {
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    }

    // ================================================
    // ANALYSE ET TESTING DES MOTS-CLÉS
    // ================================================
    testCategoryKeywords(categoryId, testTexts = []) {
        if (!window.categoryManager) {
            console.error('[EmailScanner] CategoryManager non disponible');
            return null;
        }

        const defaultTests = [
            "Urgent: Action requise pour votre commande",
            "Newsletter hebdomadaire - se désinscrire",
            "Nouvelle connexion détectée sur votre compte",
            "Facture #12345 en pièce jointe",
            "Réunion équipe prévue demain 14h"
        ];

        const textsToTest = testTexts.length > 0 ? testTexts : defaultTests;
        const results = [];

        console.log(`[EmailScanner] 🧪 Test des mots-clés pour catégorie: ${categoryId}`);
        
        textsToTest.forEach((text, index) => {
            const testEmail = {
                subject: text,
                body: { content: text },
                bodyPreview: text,
                from: { emailAddress: { address: 'test@example.com' } },
                toRecipients: [{ emailAddress: { address: 'user@example.com' } }]
            };

            const analysis = window.categoryManager.analyzeEmail(testEmail);
            const isCorrectCategory = analysis.category === categoryId;
            
            results.push({
                text: text,
                detectedCategory: analysis.category,
                expectedCategory: categoryId,
                correct: isCorrectCategory,
                score: analysis.score,
                confidence: analysis.confidence,
                patterns: analysis.matchedPatterns
            });

            console.log(`  Test ${index + 1}: "${text}"`);
            console.log(`    Détecté: ${analysis.category} (${isCorrectCategory ? '✅' : '❌'})`);
            console.log(`    Score: ${analysis.score}, Confiance: ${Math.round(analysis.confidence * 100)}%`);
        });

        const accuracy = Math.round((results.filter(r => r.correct).length / results.length) * 100);
        console.log(`[EmailScanner] 📊 Précision pour ${categoryId}: ${accuracy}%`);

        return {
            categoryId,
            accuracy,
            results,
            totalTests: results.length,
            correctPredictions: results.filter(r => r.correct).length
        };
    }

    analyzeKeywordPerformance() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email pour analyser les performances des mots-clés');
            return null;
        }

        const performance = {};
        const categories = window.categoryManager?.getCategories() || {};

        Object.keys(categories).forEach(categoryId => {
            const categoryEmails = this.getEmailsByCategory(categoryId);
            const keywordStats = this.getCategoryKeywordStats(categoryId);
            
            performance[categoryId] = {
                name: categories[categoryId].name,
                totalEmails: categoryEmails.length,
                keywordCoverage: categoryEmails.length > 0 ? 
                    Math.round((keywordStats.withKeywords / categoryEmails.length) * 100) : 0,
                avgConfidence: keywordStats.avgConfidence,
                avgScore: keywordStats.avgScore,
                keywordDistribution: {
                    absolute: keywordStats.absoluteMatches,
                    strong: keywordStats.strongMatches,
                    weak: keywordStats.weakMatches,
                    exclusions: keywordStats.exclusions
                },
                effectiveness: this.scanMetrics.keywordMatches[categoryId] || {}
            };
        });

        console.log('[EmailScanner] 📈 Performance des mots-clés par catégorie:');
        Object.entries(performance).forEach(([categoryId, stats]) => {
            if (stats.totalEmails > 0) {
                console.log(`  ${categories[categoryId]?.icon || '📂'} ${stats.name}:`);
                console.log(`    - Emails: ${stats.totalEmails}`);
                console.log(`    - Couverture mots-clés: ${stats.keywordCoverage}%`);
                console.log(`    - Confiance moyenne: ${stats.avgConfidence}`);
                console.log(`    - Répartition: A=${stats.keywordDistribution.absolute}, F=${stats.keywordDistribution.strong}, W=${stats.keywordDistribution.weak}`);
            }
        });

        return performance;
    }

    // ================================================
    // STATISTIQUES AVEC PRÉ-SÉLECTION
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
            keywordEffectiveness: keywordEffectiveness
        };
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

    // ================================================
    // EXPORT AVEC DONNÉES PRÉ-SÉLECTION ET MOTS-CLÉS
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
    // ACTIONS BATCH
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
    // NETTOYAGE ET DESTRUCTION
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
        if (this.keywordsUpdateHandler) {
            window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
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
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[EmailScanner] Erreur dispatch ${eventName}:`, error);
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
    // MÉTHODES UTILITAIRES INTERNES
    // ================================================
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

    // ================================================
    // MÉTHODES DE TEST AMÉLIORÉES
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
}

// Créer l'instance globale avec nettoyage préalable
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

// Méthodes utilitaires globales pour le debug amélioré
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v7.0');
    
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
    console.log('Performance Keywords:', window.emailScanner.analyzeKeywordPerformance());
    
    console.groupEnd();
    return { success: true, testsRun: testEmails.length };
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories v7.0');
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
    console.log('Top senders:', window.emailScanner.getTopSenders(5));
    console.log('Keyword effectiveness:', window.emailScanner.calculateKeywordEffectiveness());
    console.log('Scan metrics:', window.emailScanner.scanMetrics);
    console.groupEnd();
};

window.testCategoryKeywords = function(categoryId) {
    return window.emailScanner.testCategoryKeywords(categoryId);
};

console.log('✅ EmailScanner v7.0 loaded - Intégration complète avec les mots-clés');
