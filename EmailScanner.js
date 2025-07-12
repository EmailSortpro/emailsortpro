// EmailScanner.js - Version 12.0 - Scanner unifié Gmail/Microsoft optimisé

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        this.startScanSynced = false;
        
        // Système de synchronisation
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.changeListener = null;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            preselectedCount: 0,
            newsletterCount: 0,
            gmailSpecificCount: 0,
            outlookSpecificCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 12.0 - Scanner unifié Gmail/Microsoft');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION AVEC SYNCHRONISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initialisation avec synchronisation...');
        
        await this.loadSettingsFromCategoryManager();
        this.registerAsChangeListener();
        this.startRealTimeSync();
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Initialisation terminée');
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                console.log(`[EmailScanner] 📨 Changement CategoryManager: ${type}`, value);
                this.handleCategoryManagerChange(type, value, fullSettings);
            });
            
            console.log('[EmailScanner] 👂 Listener CategoryManager enregistré');
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
                console.log('[EmailScanner] 📋 Catégories pré-sélectionnées mises à jour:', value);
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                break;
                
            case 'activeCategories':
                console.log('[EmailScanner] 🏷️ Catégories actives mises à jour:', value);
                this.settings.activeCategories = value;
                break;
                
            case 'categoryExclusions':
                console.log('[EmailScanner] 🚫 Exclusions mises à jour:', value);
                this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                break;
                
            case 'scanSettings':
                console.log('[EmailScanner] 🔍 Paramètres scan mis à jour:', value);
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
                
            case 'preferences':
                console.log('[EmailScanner] ⚙️ Préférences mises à jour:', value);
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
                
            case 'fullSync':
            case 'fullSettings':
                console.log('[EmailScanner] 🔄 Synchronisation complète');
                this.settings = { ...this.settings, ...fullSettings };
                this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                break;
        }
        
        // Re-catégoriser si nécessaire
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation automatique déclenchée');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                type,
                value,
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories,
                emailCount: this.emails.length
            });
        }, 10);
    }

    startRealTimeSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.checkAndSyncSettings();
        }, 5000);
    }

    async checkAndSyncSettings() {
        if (!window.categoryManager) return;
        
        try {
            const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            const currentManagerSettings = window.categoryManager.getSettings();
            
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            if (categoriesChanged) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                if (this.emails.length > 0) {
                    console.log('[EmailScanner] 🔄 Re-catégorisation après synchronisation');
                    await this.recategorizeEmails();
                }
                
                console.log('[EmailScanner] ✅ Synchronisation corrigée');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur vérification sync:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
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
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
                return this.loadSettingsFromFallback();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible, utilisation fallback');
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
            console.error('[EmailScanner] ❌ Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            },
            activeCategories: null,
            categoryExclusions: {
                domains: [],
                emails: []
            }
        };
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE MULTI-PROVIDER
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v12.0 ===');
        
        // Synchronisation pré-scan
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        }
        
        // Détection automatique du provider si non spécifié
        if (!options.provider) {
            options.provider = await this.detectCurrentProvider();
        }
        
        // Préparer les options
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || -1,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            provider: options.provider
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScanner] 📊 Options de scan:', mergedOptions);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            console.log('[EmailScanner] 📧 Provider:', mergedOptions.provider);

            // Vérifier les services
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            // Étape 1: Récupérer les emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails ${mergedOptions.provider}...`,
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération des emails via MailService...');
            const emails = await this.fetchEmailsFromMailService(mergedOptions);
            
            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] ⚠️ Aucun email trouvé');
                return this.buildEmptyResults(mergedOptions);
            }

            // Étape 2: Catégoriser les emails
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation des emails ${mergedOptions.provider}...`,
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails(mergedOptions.provider);
            }

            // Étape 3: Analyser pour les tâches (optionnel)
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour les tâches...',
                        progress: { current: 0, total: 10 }
                    });
                }

                await this.analyzeForTasks();
            }

            // Marquer comme synchronisé avec StartScan
            this.startScanSynced = true;

            // Construire les résultats
            const results = this.getDetailedResults(mergedOptions);

            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks,
                newsletters: results.stats.newsletterCount,
                gmailDetected: results.stats.gmailSpecificCount,
                outlookDetected: results.stats.outlookSpecificCount
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            // Notifier les autres modules
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks,
                    scanMetrics: this.scanMetrics,
                    provider: mergedOptions.provider
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
    // DÉTECTION DU PROVIDER
    // ================================================
    async detectCurrentProvider() {
        console.log('[EmailScanner] 🔍 Détection automatique du provider...');
        
        // Vérifier Gmail
        if (window.googleAuthService?.isAuthenticated) {
            try {
                const isGmailAuth = await window.googleAuthService.isAuthenticated();
                if (isGmailAuth) {
                    console.log('[EmailScanner] ✅ Gmail détecté');
                    return 'gmail';
                }
            } catch (e) {
                console.log('[EmailScanner] Gmail non disponible');
            }
        }
        
        // Vérifier Outlook/Microsoft
        if (window.authService?.isAuthenticated) {
            try {
                if (window.authService.isAuthenticated()) {
                    console.log('[EmailScanner] ✅ Microsoft/Outlook détecté');
                    return 'microsoft';
                }
            } catch (e) {
                console.log('[EmailScanner] Microsoft non disponible');
            }
        }
        
        // Vérifier via MailService
        if (window.mailService?.getCurrentProvider) {
            const provider = window.mailService.getCurrentProvider();
            if (provider === 'google' || provider === 'gmail') {
                return 'gmail';
            } else if (provider === 'microsoft' || provider === 'outlook') {
                return 'microsoft';
            }
        }
        
        // Par défaut, Microsoft
        console.log('[EmailScanner] ⚠️ Provider non détecté, utilisation Microsoft par défaut');
        return 'microsoft';
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS MULTI-PROVIDER
    // ================================================
    async fetchEmailsFromMailService(options) {
        console.log('[EmailScanner] 📬 Récupération des emails via MailService...');
        
        try {
            // Initialiser MailService si nécessaire
            if (!window.mailService.isInitialized()) {
                console.log('[EmailScanner] 🔧 Initialisation MailService...');
                await window.mailService.initialize();
            }

            // Configurer le provider
            const currentProvider = window.mailService.getCurrentProvider();
            const targetProvider = options.provider === 'gmail' ? 'google' : options.provider;
            
            if (currentProvider !== targetProvider) {
                console.log(`[EmailScanner] 🔄 Changement provider: ${currentProvider} → ${targetProvider}`);
                await window.mailService.setProvider(targetProvider);
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            if (options.days === -1) {
                // Tous les emails - remonter à 2 ans
                startDate.setFullYear(endDate.getFullYear() - 2);
            } else {
                startDate.setDate(endDate.getDate() - options.days);
            }

            // Construire le filtre selon le provider
            const filter = this.buildProviderFilter(startDate, endDate, options.provider);

            // Options spécifiques au provider
            const fetchOptions = {
                filter: filter
            };

            if (options.provider === 'gmail' || options.provider === 'google') {
                // Gmail utilise maxResults
                fetchOptions.maxResults = options.maxEmails === -1 ? 1000 : options.maxEmails;
            } else {
                // Microsoft utilise top
                fetchOptions.top = options.maxEmails === -1 ? 999 : options.maxEmails;
            }

            // Récupérer les emails
            const emails = await window.mailService.getMessages(options.folder, fetchOptions);

            // Marquer le provider sur chaque email
            emails.forEach(email => {
                email.provider = options.provider;
                
                // Normaliser la structure pour Gmail
                if (options.provider === 'gmail' || options.provider === 'google') {
                    this.normalizeGmailEmail(email);
                }
            });

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés depuis ${options.provider}`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    buildProviderFilter(startDate, endDate, provider) {
        if (provider === 'microsoft' || provider === 'outlook') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else if (provider === 'gmail' || provider === 'google') {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
        
        // Fallback
        return '';
    }

    normalizeGmailEmail(email) {
        // Normaliser la structure Gmail vers le format Microsoft pour compatibilité
        
        // From
        if (email.payload?.headers) {
            const fromHeader = email.payload.headers.find(h => h.name === 'From');
            if (fromHeader) {
                const matches = fromHeader.value.match(/^(.*?)\s*<(.+?)>$/);
                if (matches) {
                    email.from = {
                        emailAddress: {
                            name: matches[1].replace(/"/g, '').trim(),
                            address: matches[2]
                        }
                    };
                } else {
                    email.from = {
                        emailAddress: {
                            address: fromHeader.value
                        }
                    };
                }
            }
        }
        
        // Subject
        if (!email.subject && email.payload?.headers) {
            const subjectHeader = email.payload.headers.find(h => h.name === 'Subject');
            if (subjectHeader) {
                email.subject = subjectHeader.value;
            }
        }
        
        // Body
        if (!email.body && email.payload?.body?.data) {
            email.body = {
                content: atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
            };
        } else if (!email.body && email.payload?.parts) {
            // Chercher la partie text/html ou text/plain
            const htmlPart = email.payload.parts.find(p => p.mimeType === 'text/html');
            const textPart = email.payload.parts.find(p => p.mimeType === 'text/plain');
            
            if (htmlPart?.body?.data) {
                email.body = {
                    content: atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                };
            } else if (textPart?.body?.data) {
                email.bodyPreview = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/')).substring(0, 255);
            }
        }
        
        // Date
        if (!email.receivedDateTime && email.internalDate) {
            email.receivedDateTime = new Date(parseInt(email.internalDate)).toISOString();
        }
        
        // Attachments
        if (email.payload?.parts) {
            email.hasAttachments = email.payload.parts.some(p => p.filename && p.filename.length > 0);
        }
        
        // Headers pour analyse
        if (email.payload?.headers) {
            email.internetMessageHeaders = email.payload.headers;
        }
    }

    // ================================================
    // CATÉGORISATION MULTI-PROVIDER
    // ================================================
    async categorizeEmails(provider = 'microsoft', overridePreselectedCategories = null) {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;
        let newsletterCount = 0;
        let gmailSpecificCount = 0;
        let outlookSpecificCount = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] 📧 Provider:', provider);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        const categoryStats = {};
        const preselectedStats = {};
        
        // Initialiser les statistiques
        taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // S'assurer que le provider est défini
                    if (!email.provider) {
                        email.provider = provider;
                    }
                    
                    // Analyser l'email
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Appliquer les résultats
                    const finalCategory = analysis.category || 'other';
                    email.category = finalCategory;
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    
                    // Détection spécifique au provider
                    email.gmailDetected = analysis.gmailDetected || (provider === 'gmail' || provider === 'google');
                    email.hasUnsubscribeLink = analysis.hasUnsubscribeLink || false;
                    
                    // Compter les spécificités
                    if (finalCategory === 'marketing_news') {
                        newsletterCount++;
                    }
                    
                    if (email.gmailDetected) {
                        gmailSpecificCount++;
                    } else if (provider === 'microsoft' || provider === 'outlook') {
                        outlookSpecificCount++;
                    }
                    
                    // Marquer comme pré-sélectionné pour les tâches
                    email.isPreselectedForTasks = taskPreselectedCategories.includes(finalCategory);
                    
                    if (email.isPreselectedForTasks) {
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    this.categorizedEmails[finalCategory].push(email);
                    
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
                    // Valeurs par défaut
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

            // Mettre à jour le progrès
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Pause courte pour éviter le blocage
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        this.scanMetrics.newsletterCount = newsletterCount;
        this.scanMetrics.gmailSpecificCount = gmailSpecificCount;
        this.scanMetrics.outlookSpecificCount = outlookSpecificCount;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] 📰 Newsletters détectées:', newsletterCount);
        console.log('[EmailScanner] 📧 Emails Gmail:', gmailSpecificCount);
        console.log('[EmailScanner] 📧 Emails Outlook:', outlookSpecificCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        // Log des pré-sélectionnés par catégorie
        Object.entries(preselectedStats).forEach(([catId, count]) => {
            if (count > 0) {
                console.log(`[EmailScanner] ⭐ ${catId}: ${count} emails pré-sélectionnés`);
            }
        });
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer non disponible');
            return;
        }

        // Priorité aux emails pré-sélectionnés
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Autres emails avec haute confiance (exclure les newsletters)
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8 &&
            email.category !== 'marketing_news'
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);
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
                        message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length }
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
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
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
    buildEmptyResults(options) {
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
                taskSuggestions: 0,
                newsletterCount: 0,
                gmailSpecificCount: 0,
                outlookSpecificCount: 0
            },
            emails: [],
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    getDetailedResults(options = {}) {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;
        let totalSpam = 0;
        let totalExcluded = 0;

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
                if (email.taskSuggested) {
                    totalWithTasks++;
                }
                if (email.isPreselectedForTasks) {
                    totalPreselected++;
                }
            });
        });

        const scanDuration = this.scanMetrics.startTime ? 
            Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

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
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                spamFiltered: totalSpam,
                excluded: totalExcluded,
                scanDuration: scanDuration,
                newsletterCount: this.scanMetrics.newsletterCount,
                gmailSpecificCount: this.scanMetrics.gmailSpecificCount,
                outlookSpecificCount: this.scanMetrics.outlookSpecificCount
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            provider: options.provider,
            startScanSynced: this.startScanSynced
        };
    }

    // ================================================
    // RE-CATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Réinitialiser les métriques
        this.scanMetrics.startTime = Date.now();
        this.scanMetrics.categorizedCount = 0;
        this.scanMetrics.categoryDistribution = {};
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Déterminer le provider depuis les emails existants
        const provider = this.emails[0]?.provider || 'microsoft';

        // Recatégoriser tous les emails
        await this.categorizeEmails(provider);
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                scanMetrics: this.scanMetrics
            });
        }, 10);
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
    getAllEmails() {
        return [...this.emails];
    }

    getEmails() {
        return this.getAllEmails();
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

    getNewsletterEmails() {
        return this.emails.filter(email => email.category === 'marketing_news');
    }

    getGmailEmails() {
        return this.emails.filter(email => email.gmailDetected || email.provider === 'gmail' || email.provider === 'google');
    }

    getOutlookEmails() {
        return this.emails.filter(email => email.provider === 'microsoft' || email.provider === 'outlook');
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
    // MÉTHODES DE MISE À JOUR
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changement détecté, re-catégorisation...');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Mise à jour des paramètres:', newSettings);
        
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
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 secondes
        
        if (this._categoriesCache && 
            this._categoriesCacheTime && 
            (now - this._categoriesCacheTime) < CACHE_DURATION) {
            return [...this._categoriesCache];
        }
        
        // Synchroniser avec CategoryManager
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            
            this._categoriesCache = [...managerCategories];
            this._categoriesCacheTime = now;
            
            // Mettre à jour locale si différent
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            preselectedCount: 0,
            newsletterCount: 0,
            gmailSpecificCount: 0,
            outlookSpecificCount: 0
        };
        
        // Initialiser avec toutes les catégories
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // Catégories spéciales
        ['other', 'excluded', 'spam', 'personal'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
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
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter les événements externes
        this.keywordsUpdateHandler = (event) => {
            console.log('[EmailScanner] 🔑 Mots-clés mis à jour:', event.detail.categoryId);
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        };

        this.forceSyncHandler = (event) => {
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

        window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés');
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

    // ================================================
    // MÉTHODES D'EXPORT
    // ================================================
    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: this.getDetailedResults().stats,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            categories: {},
            emails: []
        };

        // Ajouter le résumé par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            const preselectedInCategory = emails.filter(e => e.isPreselectedForTasks).length;
            const newslettersInCategory = emails.filter(e => e.category === 'marketing_news').length;
            const gmailInCategory = emails.filter(e => e.gmailDetected).length;
            const outlookInCategory = emails.filter(e => e.provider === 'microsoft' || e.provider === 'outlook').length;
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                preselectedCount: preselectedInCategory,
                newsletterCount: newslettersInCategory,
                gmailCount: gmailInCategory,
                outlookCount: outlookInCategory,
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId)
            };
        });

        // Ajouter les détails des emails
        data.emails = this.emails.map(email => ({
            id: email.id,
            date: email.receivedDateTime,
            provider: email.provider,
            from: {
                name: email.from?.emailAddress?.name,
                email: email.from?.emailAddress?.address
            },
            subject: email.subject,
            category: email.category,
            confidence: email.categoryConfidence,
            score: email.categoryScore,
            taskSuggested: email.taskSuggested,
            isPreselectedForTasks: email.isPreselectedForTasks,
            isSpam: email.isSpam,
            isExcluded: email.isExcluded,
            isNewsletter: email.category === 'marketing_news',
            gmailDetected: email.gmailDetected,
            hasUnsubscribeLink: email.hasUnsubscribeLink,
            patterns: email.matchedPatterns?.map(p => ({
                type: p.type,
                keyword: p.keyword,
                score: p.score
            })),
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
            ['Date', 'Provider', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Tâche Suggérée', 'Pré-sélectionné', 'Newsletter', 'Gmail', 'Spam', 'Exclus']
        ];

        this.emails.forEach(email => {
            const categoryInfo = window.categoryManager?.getCategory(email.category) || 
                { name: email.category || 'other' };
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.provider || 'unknown',
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo.name,
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                email.taskSuggested ? 'Oui' : 'Non',
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.category === 'marketing_news' ? 'Oui' : 'Non',
                email.gmailDetected ? 'Oui' : 'Non',
                email.isSpam ? 'Oui' : 'Non',
                email.isExcluded ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

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
                window.uiManager.showToast(`${this.emails.length} emails exportés`, 'success');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        const newsletterCount = this.emails.filter(e => e.category === 'marketing_news').length;
        const gmailCount = this.emails.filter(e => e.gmailDetected || e.provider === 'gmail').length;
        const outlookCount = this.emails.filter(e => e.provider === 'microsoft' || e.provider === 'outlook').length;
        
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
            newsletterCount: newsletterCount,
            gmailCount: gmailCount,
            outlookCount: outlookCount,
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            categoryManagerAvailable: !!window.categoryManager,
            mailServiceAvailable: !!window.mailService,
            aiTaskAnalyzerAvailable: !!window.aiTaskAnalyzer,
            lastSettingsSync: this.lastSettingsSync,
            syncInterval: !!this.syncInterval,
            scanMetrics: this.scanMetrics,
            startScanSynced: this.startScanSynced,
            changeListener: !!this.changeListener,
            version: '12.0'
        };
    }

    testCategorization(emailSample) {
        console.log('[EmailScanner] 🧪 === TEST CATEGORISATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScanner] ❌ CategoryManager non disponible');
            return null;
        }
        
        const result = window.categoryManager.analyzeEmail(emailSample);
        const isPreselected = this.taskPreselectedCategories.includes(result.category);
        
        console.log('Email:', emailSample.subject);
        console.log('Provider:', emailSample.provider || 'non spécifié');
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns:', result.matchedPatterns);
        console.log('Pré-sélectionné:', isPreselected ? '⭐ OUI' : '❌ NON');
        console.log('Gmail détecté:', result.gmailDetected ? '✅ OUI' : '❌ NON');
        console.log('============================');
        
        return { ...result, isPreselectedForTasks: isPreselected };
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
        
        // Nettoyer le listener CategoryManager
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
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
        this.scanMetrics = { 
            startTime: null, 
            categorizedCount: 0, 
            keywordMatches: {}, 
            categoryDistribution: {},
            preselectedCount: 0,
            newsletterCount: 0,
            gmailSpecificCount: 0,
            outlookSpecificCount: 0
        };
        
        console.log('[EmailScanner] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.isScanning = false;
        this.startScanSynced = false;
        console.log('[EmailScanner] ❌ Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance v12.0...');
window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v12.0 loaded - Scanner unifié Gmail/Microsoft!');
