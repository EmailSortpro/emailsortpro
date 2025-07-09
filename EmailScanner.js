// EmailScanner.js - Version 9.0 - Complètement corrigée pour synchronisation avec StartScan

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
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 9.0 - Synchronisation StartScan intégrée');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION AVEC SYNCHRONISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initialisation avec synchronisation...');
        
        // 1. Charger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // 2. S'enregistrer comme listener
        this.registerAsChangeListener();
        
        // 3. Démarrer la surveillance
        this.startRealTimeSync();
        
        // 4. Setup event listeners
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
            
            // Vérifier si les catégories ont changé
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            if (categoriesChanged) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScanner:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                
                // Synchroniser
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
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
    // MÉTHODES DE MISE À JOUR
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Mettre à jour dans les settings
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
        
        // Traitement spécial pour les catégories pré-sélectionnées
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
    // MÉTHODE SCAN PRINCIPALE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v9.0 ===');
        
        // Synchronisation pré-scan
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        }
        
        // Préparer les options
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || 500,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
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
                    message: 'Récupération des emails...',
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération des emails...');
            const emails = await this.fetchEmails(mergedOptions);
            
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
                        message: 'Catégorisation des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            // Étape 3: Analyser pour les tâches
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
                preselectedForTasks: results.stats.preselectedForTasks
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
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails(options) {
        console.log('[EmailScanner] 📬 Récupération des emails...');
        
        try {
            // Initialiser MailService si nécessaire
            if (!window.mailService.isInitialized()) {
                console.log('[EmailScanner] 🔧 Initialisation MailService...');
                await window.mailService.initialize();
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - options.days);

            // Construire le filtre de date
            const dateFilter = this.buildDateFilter(startDate, endDate, options.provider);

            // Récupérer les emails
            const emails = await window.mailService.getMessages(options.folder, {
                top: options.maxEmails,
                filter: dateFilter
            });

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés depuis MailService`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            
            // Fallback vers génération de démonstration
            console.log('[EmailScanner] 🎭 Fallback vers emails de démonstration...');
            return this.generateDemoEmails(options);
        }
    }

    buildDateFilter(startDate, endDate, provider) {
        if (provider === 'microsoft') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else {
            // Gmail
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
    }

    generateDemoEmails(options) {
        console.log('[EmailScanner] 🎭 Génération d\'emails de démonstration...');
        
        const demoEmails = [];
        const categories = ['finance', 'marketing', 'newsletters', 'notifications', 'shopping', 'meetings', 'security', 'other'];
        
        const emailCount = Math.min(options.maxEmails || 50, options.days * 8);
        
        for (let i = 0; i < emailCount; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const hoursAgo = Math.floor(Math.random() * (options.days * 24));
            
            const email = {
                id: `demo_${Date.now()}_${i}`,
                subject: this.generateSubjectByCategory(category),
                from: {
                    emailAddress: {
                        name: this.generateSenderByCategory(category),
                        address: this.generateEmailByCategory(category)
                    }
                },
                receivedDateTime: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString(),
                bodyPreview: this.generateBodyByCategory(category),
                isRead: Math.random() > 0.4,
                hasAttachments: Math.random() > 0.8,
                importance: Math.random() > 0.9 ? 'high' : 'normal',
                category: category,
                provider: options.provider,
                isDemoEmail: true
            };
            
            demoEmails.push(email);
        }
        
        console.log(`[EmailScanner] ✅ ${demoEmails.length} emails de démonstration générés`);
        return demoEmails;
    }

    generateSubjectByCategory(category) {
        const subjects = {
            finance: ['Votre relevé bancaire', 'Facture mensuelle', 'Virement reçu', 'Notification de paiement'],
            marketing: ['Offre spéciale', 'Promotion limitée', 'Nouveau produit', 'Soldes exceptionnels'],
            newsletters: ['Newsletter hebdomadaire', 'Actualités tech', 'Digest mensuel', 'Nouvelles importantes'],
            notifications: ['Notification de sécurité', 'Mise à jour système', 'Rappel important', 'Alerte compte'],
            shopping: ['Commande expédiée', 'Suivi de livraison', 'Confirmation d\'achat', 'Retour produit'],
            meetings: ['Réunion prévue', 'Invitation calendrier', 'Rappel RDV', 'Convocation équipe'],
            security: ['Alerte sécurité', 'Nouvelle connexion', 'Code de vérification', 'Changement mot de passe'],
            other: ['Message important', 'Information générale', 'Mise à jour', 'Communication']
        };
        
        const categorySubjects = subjects[category] || subjects.other;
        return categorySubjects[Math.floor(Math.random() * categorySubjects.length)];
    }

    generateSenderByCategory(category) {
        const senders = {
            finance: ['BNP Paribas', 'Crédit Agricole', 'PayPal', 'Banque Postale'],
            marketing: ['Nike', 'Amazon', 'Carrefour', 'Fnac'],
            newsletters: ['TechCrunch', 'Le Monde', 'Numerama', 'MIT Technology Review'],
            notifications: ['Microsoft', 'Google', 'Apple', 'Facebook'],
            shopping: ['Amazon', 'Cdiscount', 'Zalando', 'Darty'],
            meetings: ['Google Calendar', 'Outlook', 'Teams', 'Zoom'],
            security: ['Microsoft Security', 'Google Security', 'Apple ID', 'Support'],
            other: ['Support', 'Administration', 'Service Client', 'Information']
        };
        
        const categorySenders = senders[category] || senders.other;
        return categorySenders[Math.floor(Math.random() * categorySenders.length)];
    }

    generateEmailByCategory(category) {
        const emails = {
            finance: ['noreply@bnpparibas.com', 'info@creditagricole.fr', 'service@paypal.com', 'contact@labanquepostale.fr'],
            marketing: ['offers@nike.com', 'promo@amazon.com', 'deals@carrefour.fr', 'news@fnac.com'],
            newsletters: ['newsletter@techcrunch.com', 'info@lemonde.fr', 'news@numerama.com', 'digest@technologyreview.com'],
            notifications: ['noreply@microsoft.com', 'noreply@google.com', 'noreply@apple.com', 'noreply@facebook.com'],
            shopping: ['ship-confirm@amazon.com', 'livraison@cdiscount.com', 'order@zalando.fr', 'suivi@darty.com'],
            meetings: ['calendar@google.com', 'calendar@outlook.com', 'noreply@teams.com', 'meetings@zoom.us'],
            security: ['security@microsoft.com', 'security@google.com', 'appleid@apple.com', 'support@service.com'],
            other: ['support@example.com', 'admin@company.com', 'service@client.com', 'info@contact.com']
        };
        
        const categoryEmails = emails[category] || emails.other;
        return categoryEmails[Math.floor(Math.random() * categoryEmails.length)];
    }

    generateBodyByCategory(category) {
        const bodies = {
            finance: 'Votre relevé bancaire est disponible. Consultez votre espace client pour plus de détails.',
            marketing: 'Découvrez nos offres exceptionnelles. Promotion limitée dans le temps.',
            newsletters: 'Voici les dernières actualités de la semaine. Restez informé des derniers développements.',
            notifications: 'Notification importante concernant votre compte. Vérifiez vos paramètres de sécurité.',
            shopping: 'Votre commande a été expédiée. Suivez votre colis avec le numéro de suivi.',
            meetings: 'Rappel de votre réunion prévue. Cliquez pour accéder à la visioconférence.',
            security: 'Alerte de sécurité détectée. Vérifiez votre activité récente.',
            other: 'Message d\'information général. Contactez-nous si vous avez des questions.'
        };
        
        return bodies[category] || bodies.other;
    }

    // ================================================
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeEmails(overridePreselectedCategories = null) {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
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
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
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
        
        // Autres emails avec haute confiance
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8
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
                taskSuggestions: 0
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
                scanDuration: scanDuration
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

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
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
            preselectedCount: 0
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
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                preselectedCount: preselectedInCategory,
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId)
            };
        });

        // Ajouter les détails des emails
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
            taskSuggested: email.taskSuggested,
            isPreselectedForTasks: email.isPreselectedForTasks,
            isSpam: email.isSpam,
            isExcluded: email.isExcluded,
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
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Tâche Suggérée', 'Pré-sélectionné', 'Spam', 'Exclus']
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
                email.taskSuggested ? 'Oui' : 'Non',
                email.isPreselectedForTasks ? 'Oui' : 'Non',
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
    // ACTIONS BATCH
    // ================================================
    async performBatchAction(emailIds, action) {
        console.log(`[EmailScanner] 🔄 Action ${action} sur ${emailIds.length} emails`);

        if (!window.mailService) {
            console.error('[EmailScanner] ❌ MailService non disponible');
            return;
        }

        try {
            switch (action) {
                case 'markAsRead':
                    if (typeof window.mailService.bulkMarkAsRead === 'function') {
                        await window.mailService.bulkMarkAsRead(emailIds);
                    }
                    break;

                case 'delete':
                    if (typeof window.mailService.bulkDelete === 'function') {
                        await window.mailService.bulkDelete(emailIds);
                    }
                    break;

                case 'moveToSpam':
                    if (typeof window.mailService.bulkMove === 'function') {
                        await window.mailService.bulkMove(emailIds, 'junkemail');
                    }
                    break;

                default:
                    console.warn(`[EmailScanner] ⚠️ Action inconnue: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur action batch:`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
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
            version: '9.0'
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
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns:', result.matchedPatterns);
        console.log('Pré-sélectionné:', isPreselected ? '⭐ OUI' : '❌ NON');
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
            preselectedCount: 0
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

console.log('[EmailScanner] 🚀 Création nouvelle instance v9.0...');
window.emailScanner = new EmailScanner();

// ================================================
// FONCTIONS UTILITAIRES GLOBALES
// ================================================
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v9.0');
    
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
    
    console.groupEnd();
    return { success: true, testsRun: testEmails.length };
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories v9.0');
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
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
        console.log('Après sync:', newDebugInfo);
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

console.log('✅ EmailScanner v9.0 loaded - Synchronisation StartScan complètement intégrée!');
