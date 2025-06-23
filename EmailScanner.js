// ================================================
    // MÉTHODES UTILITAIRES ET DEBUG OPTIMISÉES
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
            // NOUVEAU: Informations de provider et synchronisation
            currentProvider: this.currentProvider,
            providerMetrics: this.providerMetrics,
            changeListener: !!this.changeListener,
            syncStatus: {
                lastSync: this.lastSettingsSync,
                categoriesInSync: this.verifyCategoriesSync(),
                settingsSource: window.categoryManager ? 'CategoryManager' : 'localStorage'
            },
            authServices: {
                microsoft: {
                    available: !!window.authService,
                    authenticated: window.authService ? window.authService.isAuthenticated() : false
                },
                google: {
                    available: !!window.googleAuthService,
                    authenticated: window.googleAuthService ? window.googleAuthService.isAuthenticated() : false
                }
            },
            version: '8.1'
        };
    }

    verifyCategoriesSync() {
        if (!window.categoryManager) return false;
        
        const managerCategories = window.categoryManager.getTaskPreselectedCategories();
        return JSON.stringify([...this.taskPreselectedCategories].sort()) === 
               JSON.stringify([...managerCategories].sort());
    }

    // ================================================
    // MÉTHODES UTILITAIRES INTERNES (étendues)
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
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            provider: this.currentProvider // NOUVEAU: Conserver le provider
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
                    console.log(`[EmailScanner] 🆕 Ajout catégorie personnalisée: ${customCategories[catId].name} (${catId})`);
                    this.categorizedEmails[catId] = [];
                }
            });
        }
        
        // CORRECTION CRITIQUE: S'assurer que les catégories spéciales existent TOUJOURS
        const specialCategories = ['other', 'excluded', 'spam', 'personal'];
        specialCategories.forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
                console.log(`[EmailScanner] 🔧 Initialisation catégorie spéciale: ${catId}`);
            }
        });
        
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
            
            // Gérer les différences de format entre providers
            let from = '';
            let fromName = '';
            
            if (this.currentProvider === 'google') {
                // Format Gmail
                from = (email.from || '').toLowerCase();
                fromName = from; // Souvent le même en Gmail
            } else {
                // Format Microsoft Graph
                from = (email.from?.emailAddress?.address || '').toLowerCase();
                fromName = (email.from?.emailAddress?.name || '').toLowerCase();
            }
            
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
        
        return Math.round(totalScore / this.emails.length);// EmailScanner.js - Version 8.1 - Support Gmail unifié avec détection optimisée

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
        
        // NOUVEAU: Support provider unifié
        this.currentProvider = null;
        this.providerMetrics = {
            microsoft: { scansCount: 0, lastScan: null },
            google: { scansCount: 0, lastScan: null }
        };
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // NOUVEAU: Initialiser avec synchronisation immédiate
        this.initializeWithSync();
        
        console.log('[EmailScanner] ✅ Version 8.1 - Support Gmail unifié avec détection optimisée');
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
            
            // NOUVEAU: Vérifier aussi si de nouvelles catégories ont été créées
            const allCategories = window.categoryManager.getCategories();
            const customCategories = window.categoryManager.getCustomCategories();
            
            // Forcer la re-catégorisation si nouvelles catégories détectées
            let needsRecategorization = categoriesChanged;
            
            // Vérifier si le nombre de catégories a changé
            if (this._lastKnownCategoriesCount !== Object.keys(allCategories).length) {
                console.log('[EmailScanner] 🆕 Nouvelles catégories détectées');
                needsRecategorization = true;
                this._lastKnownCategoriesCount = Object.keys(allCategories).length;
            }
            
            if (categoriesChanged || needsRecategorization) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScanner:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                console.log('  - Catégories totales:', Object.keys(allCategories).length);
                console.log('  - Catégories personnalisées:', Object.keys(customCategories).length);
                
                // Forcer la synchronisation
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
                if (this.emails.length > 0 && needsRecategorization) {
                    console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire suite aux changements');
                    await this.recategorizeEmails();
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
    // DÉTECTION ET INITIALISATION PROVIDER UNIFIÉ
    // ================================================
    detectAuthenticatedProvider() {
        console.log('[EmailScanner] 🔍 Détection du provider authentifié...');
        
        // Vérifier Microsoft
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            try {
                if (window.authService.isAuthenticated()) {
                    console.log('[EmailScanner] ✅ Provider détecté: Microsoft');
                    return 'microsoft';
                }
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur vérification Microsoft:', error);
            }
        }
        
        // Vérifier Google
        if (window.googleAuthService && typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                if (window.googleAuthService.isAuthenticated()) {
                    console.log('[EmailScanner] ✅ Provider détecté: Google');
                    return 'google';
                }
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur vérification Google:', error);
            }
        }
        
        console.log('[EmailScanner] ❌ Aucun provider authentifié détecté');
        return null;
    }

    async ensureMailServiceInitialized() {
        console.log('[EmailScanner] 🔧 Vérification MailService...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }
        
        // Vérifier que MailService est initialisé avec le bon provider
        const provider = this.detectAuthenticatedProvider();
        if (!provider) {
            throw new Error('Aucun provider d\'authentification disponible');
        }
        
        // Forcer l'initialisation si nécessaire
        if (!window.mailService.isInitialized || window.mailService.provider !== provider) {
            console.log(`[EmailScanner] 🔄 Réinitialisation MailService pour provider: ${provider}`);
            
            try {
                window.mailService.reset();
                await window.mailService.initialize();
                
                console.log('[EmailScanner] ✅ MailService initialisé avec:', window.mailService.provider);
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur initialisation MailService:', error);
                throw new Error(`Erreur initialisation MailService: ${error.message}`);
            }
        }
        
        this.currentProvider = provider;
        console.log('[EmailScanner] ✅ Provider configuré:', this.currentProvider);
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE AVEC SUPPORT DUAL PROVIDER
    // ================================================
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
        
        // ÉTAPE 2: Détection et configuration du provider
        console.log('[EmailScanner] 📡 === DÉTECTION PROVIDER ===');
        await this.ensureMailServiceInitialized();
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: [...this.taskPreselectedCategories], // Toujours passer une copie
            provider: this.currentProvider // NOUVEAU: Inclure le provider détecté
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
            console.log('[EmailScanner] 📧 Provider:', this.currentProvider);
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
                    progress: { current: 0, total: 100 },
                    provider: this.currentProvider
                });
            }

            console.log(`[EmailScanner] 📧 Récupération des emails ${this.currentProvider} du dossier:`, mergedOptions.folder);

            // ÉTAPE 3: Récupération des emails selon le provider
            let emails;
            try {
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
            } catch (emailError) {
                console.error('[EmailScanner] ❌ Erreur récupération emails:', emailError);
                throw new Error(`Erreur récupération emails ${this.currentProvider}: ${emailError.message}`);
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails ${this.currentProvider} récupérés`);
            
            // Mettre à jour les métriques du provider
            this.providerMetrics[this.currentProvider].scansCount++;
            this.providerMetrics[this.currentProvider].lastScan = new Date().toISOString();

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
                    scanMetrics: this.scanMetrics,
                    provider: this.currentProvider
                };
            }

            // IMPORTANT: Stocker les catégories pré-sélectionnées dans les métriques
            this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];
            this.scanMetrics.provider = this.currentProvider;

            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation intelligente des emails ${this.currentProvider}...`,
                        progress: { current: 0, total: this.emails.length },
                        provider: this.currentProvider
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
                        progress: { current: 0, total: Math.min(this.emails.length, 10) },
                        provider: this.currentProvider
                    });
                }

                await this.analyzeForTasks();
            }

            const results = this.getDetailedResults();

            // Vérification finale de cohérence
            console.log('[EmailScanner] 🔍 === VÉRIFICATION FINALE ===');
            console.log('[EmailScanner] 📊 Résultats scan:', {
                provider: this.currentProvider,
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks,
                taskPreselectedCategories: results.taskPreselectedCategories
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: `Scan ${this.currentProvider} terminé avec succès !`,
                    results,
                    provider: this.currentProvider
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
                    scanMetrics: this.scanMetrics,
                    provider: this.currentProvider
                });
            }, 10);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur ${this.currentProvider}: ${error.message}`,
                    error,
                    provider: this.currentProvider
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }
