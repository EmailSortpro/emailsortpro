// CategoryManager.js - Version 22.2 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = true; // Activé pour debug newsletter
        this.eventListenersSetup = false;
        
        // Système de cache haute performance
        this.analysisCache = new Map();
        this.cacheMaxSize = 1000;
        this.cacheTTL = 300000; // 5 minutes
        this.cacheStats = { hits: 0, misses: 0 };
        
        // Optimisation regex pré-compilées
        this.compiledPatterns = new Map();
        this.textNormalizer = this.createTextNormalizer();
        
        // Système de synchronisation optimisé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Batch processing
        this.pendingAnalysis = [];
        this.batchSize = 50;
        this.batchTimeout = null;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 22.2 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE');
    }

    // SETTINGS ET CONFIGURATION
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                const mergedSettings = { ...defaultSettings, ...parsedSettings };
                console.log('[CategoryManager] ✅ Settings chargés depuis localStorage');
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 📝 Utilisation settings par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
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

    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                priority: 50,
                isCustom: false
            },
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 50,
                isCustom: false
            },
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 50,
                isCustom: false
            },
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 50,
                isCustom: false
            },
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 50,
                isCustom: false
            },
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 50,
                isCustom: false
            },
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 50,
                isCustom: false
            },
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 50,
                isCustom: false
            },
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 50,
                isCustom: false
            },
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 50,
                isCustom: false
            },
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 50,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    // Mots-clés absolus en français et anglais
                    'unsubscribe', 'se désinscrire', 'se desinscrire', 'opt out', 'newsletter',
                    'disable these notifications', 'email preferences', 'manage preferences',
                    'preference center', 'centre de préférences', 'gerer mes preferences',
                    'stop receiving', 'arreter de recevoir', 'click here to unsubscribe',
                    'cliquez ici pour vous désinscrire', 'update subscription'
                ],
                strong: [
                    // Marques de mode et commerce
                    'tommy hilfiger', 'tommy', 'hilfiger', 'calvin klein', 'calvin', 'klein',
                    'cerruti', 'camberabero', 'big moustache', 'moustache',
                    
                    // Mots promotionnels français
                    'promo', 'promotion', 'promotions', 'soldes', 'réduction', 'reduction',
                    'remise', 'offre spéciale', 'offre speciale', 'bon plan', 'bons plans',
                    'vente privée', 'vente privee', 'ventes privees', 'jusqu à', 'jusqua',
                    
                    // Mots promotionnels anglais
                    'sale', 'sales', 'offer', 'offers', 'deal', 'deals', 'discount', 'discounts',
                    'special offer', 'limited time', 'exclusive', 'save up to', 'up to',
                    'off', 'percent off', 'buy now', 'shop now', 'order now',
                    
                    // Marketing/Newsletter
                    'marketing', 'campaign', 'campaigns', 'newsletter', 'newsletters',
                    'email marketing', 'promotional', 'advertising'
                ],
                weak: [
                    // Termes généraux commerce
                    'shop', 'store', 'boutique', 'collection', 'collections',
                    'new arrivals', 'nouveautés', 'nouveautes', 'latest', 'dernier',
                    'discover', 'découvrir', 'decouvrir', 'explore', 'explorer',
                    'fashion', 'mode', 'style', 'trends', 'tendances',
                    'brand', 'marque', 'luxury', 'luxe', 'premium',
                    
                    // Termes mise à jour
                    'update', 'updates', 'mise à jour', 'news', 'nouvelles',
                    'information', 'info', 'announcement', 'annonce'
                ],
                exclusions: [
                    // Exclusions pour éviter les faux positifs
                    'facture', 'invoice', 'commande', 'order', 'livraison', 'delivery',
                    'suivi', 'tracking', 'expedition', 'shipping'
                ]
            },
            security: {
                absolute: [
                    'alerte de connexion', 'login alert', 'new sign-in', 'nouvelle connexion',
                    'code de vérification', 'verification code', 'two-factor', 'authentification',
                    'password reset', 'réinitialisation mot de passe', 'security alert',
                    'alerte sécurité', 'alerte securite', 'suspicious activity'
                ],
                strong: ['sécurité', 'security', 'authentification', 'authentication'],
                weak: ['compte', 'account'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent', 'urgence',
                    'deadline', 'échéance', 'echeance', 'update request', 'correction requise',
                    'immediate attention', 'attention immédiate', 'attention immediate'
                ],
                strong: ['urgent', 'priority', 'priorité', 'priorite', 'complete', 'action', 'task', 'tâche', 'tache'],
                weak: ['demande', 'request', 'need', 'besoin'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            meetings: {
                absolute: [
                    'meeting request', 'demande de réunion', 'demande de reunion', 'réunion', 'reunion',
                    'teams meeting', 'zoom meeting', 'rendez-vous', 'rendez vous', 'appointment'
                ],
                strong: ['meeting', 'schedule', 'planning', 'calendar', 'calendrier', 'conference'],
                weak: ['agenda', 'available', 'disponible'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition', 'contrat', 'contract',
                    'purchase order', 'bon de commande', 'opportunity', 'opportunité', 'opportunite'
                ],
                strong: ['client', 'customer', 'commercial', 'business', 'deal', 'affaire'],
                weak: ['offre', 'négociation', 'negociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement', 'virement', 'transfer',
                    'commande n°', 'commande no', 'order number', 'confirmation commande',
                    'order confirmation', 'receipt', 'reçu', 'recu'
                ],
                strong: ['montant', 'amount', 'total', 'fiscal', 'bancaire', 'bank', 'commande', 'order'],
                weak: ['euro', 'eur', 'dollar', 'usd', 'prix', 'price'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            project: {
                absolute: [
                    'projet', 'project', 'project update', 'mise à jour projet', 'milestone',
                    'sprint', 'document corrigé', 'document corrige', 'version corrigée', 'version corrigee'
                ],
                strong: ['projet', 'project', 'development', 'développement', 'developpement', 'document'],
                weak: ['development', 'phase', 'planning'],
                exclusions: ['newsletter', 'promotion']
            },
            reminders: {
                absolute: [
                    'reminder', 'rappel', 'follow up', 'suivi', 'relance',
                    'gentle reminder', 'rappel amical', 'comme convenu', 'as agreed'
                ],
                strong: ['reminder', 'rappel', 'follow', 'suivi', 'relance'],
                weak: ['discussed', 'discuté', 'discute', 'encore', 'again'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            support: {
                absolute: [
                    'ticket #', 'ticket n°', 'ticket no', 'case number', 'incident #',
                    'support ticket', 'ticket support', 'problème résolu', 'probleme resolu'
                ],
                strong: ['support', 'assistance', 'help desk', 'ticket', 'helpdesk'],
                weak: ['help', 'aide', 'issue', 'problème', 'probleme'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            hr: {
                absolute: [
                    'bulletin de paie', 'bulletin de salaire', 'payslip', 'salary slip',
                    'contrat de travail', 'employment contract', 'congés', 'conges', 'vacation',
                    'performance review', 'évaluation', 'evaluation', 'offre d\'emploi', 'job offer'
                ],
                strong: ['rh', 'hr', 'human resources', 'ressources humaines', 'salaire', 'salary', 'emploi', 'employment'],
                weak: ['employee', 'employé', 'employe', 'staff', 'personnel'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'company announcement', 'annonce entreprise',
                    'memo interne', 'internal memo', 'communication interne', 'internal communication',
                    'note de service', 'company wide', 'à toute l\'équipe', 'to all team'
                ],
                strong: ['internal', 'interne', 'company wide', 'annonce', 'announcement', 'memo'],
                weak: ['announcement', 'information', 'company', 'entreprise'],
                exclusions: ['newsletter', 'marketing', 'external', 'externe']
            },
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'ne pas repondre', 'noreply@', 'no-reply@',
                    'automated message', 'message automatique', 'system notification',
                    'notification système', 'notification systeme', 'auto-generated'
                ],
                strong: ['automated', 'automatique', 'automatic', 'system', 'système', 'systeme', 'notification'],
                weak: ['notification', 'alert', 'alerte'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi', 'pour info',
                    'en copie', 'in copy', 'courtesy copy', 'copie de courtoisie'
                ],
                strong: ['information', 'copie', 'copy', 'courtoisie', 'courtesy'],
                weak: ['fyi', 'info'],
                exclusions: ['commande', 'facture', 'urgent', 'order', 'invoice']
            }
        };

        console.log('[CategoryManager] 🔑 Mots-clés initialisés avec détection newsletter renforcée');
    }

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
    }

    loadCategoryFilters() {
        try {
            const saved = localStorage.getItem('categoryFilters');
            this.categoryFilters = saved ? JSON.parse(saved) : {};
            console.log('[CategoryManager] Filtres de catégories chargés');
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement filtres:', error);
            this.categoryFilters = {};
        }
    }

    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    this.weightedKeywords[id] = {
                        absolute: [],
                        strong: [],
                        weak: [],
                        exclusions: []
                    };
                }
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}): ${totalKeywords} mots-clés`);
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    // ================================================
    // EVENT LISTENERS ET SYNCHRONISATION  
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') return;
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
            this.syncQueue.push({
                type,
                value,
                notifyModules: false,
                timestamp: Date.now()
            });
            
            if (!this.syncInProgress) {
                this.processSettingsChanges();
            }
        };

        window.addEventListener('settingsChanged', this.externalSettingsChangeHandler);
        this.eventListenersSetup = true;
        
        console.log('[CategoryManager] Event listeners configurés');
    }

    startOptimizedSync() {
        setInterval(() => {
            this.processSettingsChanges();
        }, 5000);
        
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
                this.invalidateCache();
                this.notifyAllModules('storageChange');
            }
        });
    }

    processSettingsChanges() {
        if (this.syncInProgress || this.syncQueue.length === 0) return;
        
        this.syncInProgress = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const change = this.syncQueue.shift();
                this.applySettingChange(change);
            }
            
            this.lastSyncTimestamp = Date.now();
            
        } catch (error) {
            console.error('[CategoryManager] Erreur sync queue:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    applySettingChange(change) {
        const { type, value, notifyModules } = change;
        
        console.log(`[CategoryManager] 📝 Application changement: ${type}`, value);
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = [...value];
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
            case 'automationSettings':
                this.settings.automationSettings = { ...this.settings.automationSettings, ...value };
                break;
            case 'preferences':
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
            default:
                this.settings = { ...this.settings, ...value };
        }
        
        this.saveSettingsToStorage();
        
        if (notifyModules !== false) {
            this.notifySpecificModules(type, value);
            this.notifyAllModules(type, value);
        }
    }

    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    console.log('[CategoryManager] → EmailScanner: taskPreselectedCategories');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            console.log('[CategoryManager] → EmailScanner: Déclenchement re-catégorisation');
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'activeCategories':
                    console.log('[CategoryManager] → EmailScanner: activeCategories');
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ activeCategories: value });
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
            }
        }
        
        if (window.aiTaskAnalyzer) {
            if (type === 'taskPreselectedCategories') {
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
        }
        
        if (window.pageManager) {
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
            }
        }
    }

    notifyAllModules(type, value) {
        setTimeout(() => {
            this.dispatchEvent('categorySettingsChanged', { 
                settings: this.settings,
                type,
                value,
                timestamp: Date.now()
            });
            
            this.dispatchEvent('settingsChanged', { 
                type, 
                value,
                source: 'CategoryManager',
                timestamp: Date.now()
            });
        }, 10);
        
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
        this.invalidateTaskCategoriesCache();
        
        this.syncQueue.push({
            type: 'taskPreselectedCategories',
            value: normalizedCategories,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
        
        return normalizedCategories;
    }

    updateActiveCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 🏷️ updateActiveCategories:', categories);
        
        this.syncQueue.push({
            type: 'activeCategories',
            value: categories,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateCategoryKeywords(categoryId, keywords) {
        console.log(`[CategoryManager] 🔑 Mise à jour mots-clés pour ${categoryId}:`, keywords);
        
        if (this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = {
                absolute: [...(keywords.absolute || [])],
                strong: [...(keywords.strong || [])],
                weak: [...(keywords.weak || [])],
                exclusions: [...(keywords.exclusions || [])]
            };
            
            if (this.customCategories[categoryId]) {
                this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
                this.saveCustomCategories();
            }
            
            this.invalidateCache();
            
            console.log('[CategoryManager] ✅ Mots-clés mis à jour');
        }
    }

    updateCategoryFilters(categoryId, filters) {
        console.log(`[CategoryManager] 🔍 Mise à jour filtres pour ${categoryId}:`, filters);
        
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: [...(filters.includeDomains || [])],
            includeEmails: [...(filters.includeEmails || [])],
            excludeDomains: [...(filters.excludeDomains || [])],
            excludeEmails: [...(filters.excludeEmails || [])]
        };
        
        this.saveCategoryFilters();
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Filtres mis à jour');
    }

    // ================================================
    // GETTERS
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000;
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            return [...this._taskCategoriesCache];
        }
        
        const categories = this.settings.taskPreselectedCategories || [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        if (!this._lastLoggedTaskCategories || 
            JSON.stringify(this._lastLoggedTaskCategories) !== JSON.stringify(categories)) {
            console.log('[CategoryManager] 📋 Catégories tâches mises à jour:', categories);
            this._lastLoggedTaskCategories = [...categories];
        }
        
        return [...categories];
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            // Éviter la boucle infinie - logguer qu'une fois
            if (!this._loggedAllCategories) {
                console.log('[CategoryManager] 🔧 Toutes catégories actives par défaut:', allCategories);
                this._loggedAllCategories = true;
            }
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }

    getScanSettings() {
        return { ...this.settings.scanSettings };
    }

    getAutomationSettings() {
        return { ...this.settings.automationSettings };
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    getCategories() {
        return this.categories;
    }

    getCustomCategories() {
        return this.customCategories;
    }
    
    getCategory(categoryId) {
        if (categoryId === 'all') {
            return { id: 'all', name: 'Tous', icon: '📧', color: '#1e293b' };
        }
        if (categoryId === 'other') {
            return { id: 'other', name: 'Non classé', icon: '❓', color: '#64748b' };
        }
        if (categoryId === 'spam') {
            return { id: 'spam', name: 'Spam', icon: '🚫', color: '#dc2626' };
        }
        if (categoryId === 'excluded') {
            return { id: 'excluded', name: 'Exclu', icon: '🚫', color: '#6b7280' };
        }
        return this.categories[categoryId] || null;
    }

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    getCategoryFilters(categoryId) {
        return this.categoryFilters?.[categoryId] || {
            includeDomains: [],
            includeEmails: [],
            excludeDomains: [],
            excludeEmails: []
        };
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    createCustomCategory(categoryData) {
        console.log('[CategoryManager] 🆕 Création catégorie personnalisée:', categoryData);
        
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newCategory = {
            ...categoryData,
            id,
            isCustom: true,
            priority: categoryData.priority || 30,
            keywords: categoryData.keywords || {
                absolute: [],
                strong: [],
                weak: [],
    // EXTRACTION DE CONTENU - MÉTHODE PRINCIPALE
    // ================================================
    extractCompleteContent(email) {
        const parts = [];
        
        // Sujet avec pondération maximale pour newsletters
        if (email.subject?.trim()) {
            parts.push(email.subject.repeat(5)); // Augmenté de 3 à 5
        }
        
        // Expéditeur avec pondération élevée
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address.repeat(3)); // Augmenté de 2 à 3
        }
        
        // Nom de l'expéditeur si disponible
        if (email.from?.emailAddress?.name) {
            parts.push(email.from.emailAddress.name.repeat(2));
        }
        
        // Aperçu du corps
        if (email.bodyPreview) {
            parts.push(email.bodyPreview.repeat(2)); // Ajout répétition
        }
        
        // Corps de l'email si disponible
        if (email.body?.content) {
            // Extraire le texte du HTML
            const textContent = email.body.content.replace(/<[^>]*>/g, ' ').substring(0, 500);
            parts.push(textContent);
        }
        
        // Destinataires
        const recipients = [];
        if (email.toRecipients?.length) {
            recipients.push(...email.toRecipients.slice(0, 3).map(r => r.emailAddress?.address).filter(Boolean));
        }
        if (email.ccRecipients?.length) {
            recipients.push(...email.ccRecipients.slice(0, 2).map(r => r.emailAddress?.address).filter(Boolean));
        }
        parts.push(recipients.join(' '));
        
        const rawText = parts.join(' ');
        const normalizedText = this.normalizeTextFast(rawText);
        
        return {
            text: normalizedText,
            subject: this.normalizeTextFast(email.subject || ''),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            senderName: this.normalizeTextFast(email.from?.emailAddress?.name || ''),
            senderEmail: email.from?.emailAddress?.address?.toLowerCase() || '',
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: normalizedText.length,
            rawSubject: email.subject || '',
            rawSenderName: email.from?.emailAddress?.name || ''
        };
    }

    // Alias pour compatibilité
    extractCompleteContentOptimized(email) {
        return this.extractCompleteContent(email);
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        const parts = email.split('@');
        return parts[1]?.toLowerCase() || 'unknown';
    }

    // Alias pour compatibilité
    extractDomainFast(email) {
        return this.extractDomain(email);
    }

    // ================================================
    // CACHE SYSTÈME
    // ================================================
    createCacheKey(email) {
        const content = this.extractCompleteContent(email);
        const key = `${email.from?.emailAddress?.address || ''}|${email.subject || ''}|${content.text.substring(0, 100)}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getCachedAnalysis(email) {
        const key = this.createCacheKey(email);
        const cached = this.analysisCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            this.cacheStats.hits++;
            return cached.result;
        }
        
        this.cacheStats.misses++;
        return null;
    }

    setCachedAnalysis(email, result) {
        const key = this.createCacheKey(email);
        
        if (this.analysisCache.size >= this.cacheMaxSize) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
        
        this.analysisCache.set(key, {
            result: { ...result },
            timestamp: Date.now()
        });
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
    }

    // ================================================
    // NORMALISATION ET PATTERNS
    // ================================================
    createTextNormalizer() {
        return {
            accents: /[àâäéèêëîïôöùûüç]/gi,
            accentMap: {
                'à': 'a', 'â': 'a', 'ä': 'a',
                'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
                'î': 'i', 'ï': 'i',
                'ô': 'o', 'ö': 'o',
                'ù': 'u', 'û': 'u', 'ü': 'u',
                'ç': 'c'
            },
            spaces: /\s+/g,
            punctuation: /[^\w\s\-\%]/g, // Garde les % et - pour les promotions
            html: /<[^>]+>/g
        };
    }

    normalizeTextFast(text) {
        if (!text) return '';
        
        return text.toLowerCase()
            .replace(this.textNormalizer.accents, (match) => this.textNormalizer.accentMap[match] || match)
            .replace(this.textNormalizer.punctuation, ' ')
            .replace(this.textNormalizer.spaces, ' ')
            .trim();
    }

    getCompiledPattern(keyword) {
        if (!this.compiledPatterns.has(keyword)) {
            // Pattern plus flexible pour newsletters
            const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.compiledPatterns.set(keyword, new RegExp(`${escaped}`, 'i')); // Suppression des \b pour plus de flexibilité
        }
        return this.compiledPatterns.get(keyword);
    }

    // ================================================
    // ANALYSE EMAIL - DÉTECTION NEWSLETTER RENFORCÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Pré-détection newsletter ultra-agressive
        const isNewsletterCandidate = this.isNewsletterCandidate(email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.group(`[CategoryManager] 🔍 NEWSLETTER CANDIDAT: ${email.subject?.substring(0, 50)}`);
            console.log('📧 Email complet:', {
                subject: email.subject,
                sender: email.from?.emailAddress?.address,
                senderName: email.from?.emailAddress?.name,
                bodyPreview: email.bodyPreview?.substring(0, 100)
            });
        }
        
        // Vérifier le cache
        const cached = this.getCachedAnalysis(email);
        if (cached) {
            if (this.debugMode && isNewsletterCandidate) {
                console.log('✅ Résultat depuis cache:', cached);
                console.groupEnd();
            }
            return cached;
        }
        
        // Vérifications rapides
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            const result = { category: 'spam', score: 0, confidence: 0, isSpam: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Extraction de contenu
        const content = this.extractCompleteContent(email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.log('📄 Contenu extrait:', {
                text: content.text.substring(0, 200),
                subject: content.subject,
                domain: content.domain,
                senderName: content.senderName,
                senderEmail: content.senderEmail
            });
        }
        
        // Vérifications d'exclusion
        if (this.isGloballyExcluded(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Détection personnelle
        if (this.isPersonalEmail(content)) {
            const result = {
                category: this.categories.personal ? 'personal' : 'excluded',
                score: 100,
                confidence: 0.95,
                isPersonal: true
            };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Analyse CC
        const ccResult = this.analyzeCC(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // Analyse des catégories avec priorité newsletter
        const result = this.analyzeAllCategories(content, email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.log('🏆 Résultat final:', result);
            console.groupEnd();
        }
        
        // Cache du résultat
        this.setCachedAnalysis(email, result);
        return result;
    }

    // Nouvelle méthode de pré-détection newsletter
    isNewsletterCandidate(email) {
        const subject = email.subject?.toLowerCase() || '';
        const sender = email.from?.emailAddress?.address?.toLowerCase() || '';
        const senderName = email.from?.emailAddress?.name?.toLowerCase() || '';
        
        // Patterns évidents de newsletter
        const obviousPatterns = [
            // Marques de mode/commerce
            'tommy', 'hilfiger', 'calvin', 'klein', 'cerruti', 'camberabero', 'moustache',
            // Mots promotionnels
            'promo', 'sale', 'soldes', 'offer', 'deal', 'discount', 'reduction',
            // Symboles promotionnels
            '%', 'off', 'jusqu', 'up to', 'save',
            // Termes newsletter
            'newsletter', 'unsubscribe', 'marketing', 'campaign'
        ];
        
        // Patterns d'expéditeur newsletter
        const senderPatterns = [
            'noreply', 'no-reply', 'newsletter', 'marketing', 'promo', 'shop', 'store',
            'info@', 'contact@', 'hello@', 'news@'
        ];
        
        return obviousPatterns.some(pattern => 
            subject.includes(pattern) || senderName.includes(pattern)
        ) || senderPatterns.some(pattern => sender.includes(pattern));
    }

    // Alias pour compatibilité
    analyzeEmailOptimized(email) {
        return this.analyzeEmail(email);
    }

    // ================================================
    // VÉRIFICATIONS
    // ================================================
    isSpamEmail(email) {
        if (email.parentFolderId?.toLowerCase().includes('junk')) return true;
        if (email.categories?.some(cat => cat.toLowerCase().includes('spam'))) return true;
        return false;
    }

    isSpamEmailFast(email) {
        return this.isSpamEmail(email);
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains?.length) {
            return exclusions.domains.some(domain => content.domain.includes(domain.toLowerCase()));
        }
        return false;
    }

    isGloballyExcludedFast(content, email) {
        return this.isGloballyExcluded(content, email);
    }

    isPersonalEmail(content) {
        const personalPatterns = ['papa', 'maman', 'bises', 'famille'];
        return personalPatterns.some(pattern => content.text.includes(pattern));
    }

    isPersonalEmailFast(content) {
        return this.isPersonalEmail(content);
    }

    isMainRecipient(email) {
        return email.toRecipients?.length > 0;
    }

    isMainRecipientFast(email) {
        return this.isMainRecipient(email);
    }

    isInCC(email) {
        return email.ccRecipients?.length > 0;
    }

    isInCCFast(email) {
        return this.isInCC(email);
    }

    analyzeCC(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (isInCC && !isMainRecipient) {
            if (content.text.includes('unsubscribe') || content.text.includes('newsletter')) {
                return {
                    category: 'marketing_news',
                    score: 100,
                    confidence: 0.90,
                    isCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                isCC: true
            };
        }
        
        return null;
    }

    analyzeCCOptimized(email, content) {
        return this.analyzeCC(email, content);
    }

    // ================================================
    // ANALYSE DES CATÉGORIES - PRIORITÉ NEWSLETTER
    // ================================================
    analyzeAllCategories(content, email = null) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🔍 Analyse avec catégories actives:', activeCategories);
        }
        
        // Forcer l'analyse de marketing_news en premier si c'est un candidat newsletter
        const isNewsletterCandidate = email ? this.isNewsletterCandidate(email) : false;
        
        let categoriesByPriority;
        if (isNewsletterCandidate) {
            // Mettre marketing_news en premier
            categoriesByPriority = activeCategories
                .filter(catId => catId === 'marketing_news')
                .concat(activeCategories.filter(catId => catId !== 'marketing_news'))
                .map(catId => ({ id: catId, priority: catId === 'marketing_news' ? 1000 : (this.categories[catId]?.priority || 50) }));
        } else {
            categoriesByPriority = activeCategories
                .map(catId => ({ id: catId, priority: this.categories[catId]?.priority || 50 }))
                .sort((a, b) => b.priority - a.priority);
        }
        
        for (const { id: categoryId } of categoriesByPriority) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) {
                if (this.debugMode) {
                    console.log(`[CategoryManager] ⚠️ Catégorie ${categoryId}: pas de mots-clés`);
                }
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId, email);
            
            if (this.debugMode && (score.total > 0 || categoryId === 'marketing_news')) {
                console.log(`[CategoryManager] 📊 ${categoryId}: score=${score.total}, matches:`, score.matches);
            }
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categories[categoryId]?.priority || 50
                };
                
                // Si c'est une newsletter avec un score élevé, arrêt anticipé
                if (categoryId === 'marketing_news' && score.total >= 100) {
                    if (this.debugMode) {
                        console.log(`[CategoryManager] 🎯 Newsletter détectée, arrêt anticipé (score: ${score.total})`);
                    }
                    break;
                }
                
                if (score.hasAbsolute && score.total >= 150) {
                    if (this.debugMode) {
                        console.log(`[CategoryManager] 🎯 Arrêt anticipé pour ${categoryId} (score absolu élevé)`);
                    }
                    break;
                }
            }
        }
        
        const finalResult = this.selectByPriorityWithThreshold(results);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🏆 Résultat final sélectionné:', finalResult);
        }
        
        return finalResult;
    }

    analyzeAllCategoriesOptimized(content, email = null) {
        return this.analyzeAllCategories(content, email);
    }

    calculateScore(content, keywords, categoryId, email = null) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        if (this.debugMode && categoryId === 'marketing_news') {
            console.log(`[CategoryManager] 🔍 Calcul score pour ${categoryId}:`);
            console.log('- Texte à analyser:', text.substring(0, 300) + '...');
            console.log('- Sujet:', content.rawSubject);
            console.log('- Expéditeur:', content.senderEmail);
            console.log('- Nom expéditeur:', content.rawSenderName);
            console.log('- Mots-clés absolus:', keywords.absolute);
            console.log('- Mots-clés forts:', keywords.strong);
        }
        
        const categoryBonus = this.getCategoryBonus(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // Bonus spécial pour newsletter si candidat évident
        if (categoryId === 'marketing_news' && email && this.isNewsletterCandidate(email)) {
            totalScore += 25;
            matches.push({ keyword: 'newsletter_candidate', type: 'bonus', score: 25 });
            if (this.debugMode) {
                console.log(`[CategoryManager] 🎁 Bonus candidat newsletter: +25`);
            }
        }
        
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                    if (this.debugMode && categoryId === 'marketing_news') {
                        console.log(`[CategoryManager] ❌ Exclusion trouvée: ${exclusion}`);
                    }
                }
            }
        }
        
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    if (this.debugMode && categoryId === 'marketing_news') {
                        console.log(`[CategoryManager] ✅ Mot-clé absolu trouvé: ${keyword}`);
                    }
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: 50 });
                        if (this.debugMode && categoryId === 'marketing_news') {
                            console.log(`[CategoryManager] 🎯 Bonus sujet pour: ${keyword}`);
                        }
                    }
                }
            }
        }
        
        if (!hasAbsolute || totalScore < 150) {
            if (keywords.strong?.length) {
                let strongMatches = 0;
                for (const keyword of keywords.strong) {
                    if (this.findInText(text, keyword)) {
                        const baseScore = categoryId === 'marketing_news' ? 50 : 40; // Bonus pour newsletter
                        totalScore += baseScore;
                        strongMatches++;
                        matches.push({ keyword, type: 'strong', score: baseScore });
                        
                        if (this.debugMode && categoryId === 'marketing_news') {
                            console.log(`[CategoryManager] 💪 Mot-clé fort trouvé: ${keyword} (+${baseScore})`);
                        }
                        
                        if (strongMatches >= 3) break;
                    }
                }
                
                if (strongMatches >= 2) {
                    const bonusScore = categoryId === 'marketing_news' ? 40 : 30;
                    totalScore += bonusScore;
                    matches.push({ keyword: 'multiple_strong', type: 'bonus', score: bonusScore });
                    if (this.debugMode && categoryId === 'marketing_news') {
                        console.log(`[CategoryManager] 🔥 Bonus multiples mots forts: +${bonusScore}`);
                    }
                }
            }
        }
        
        if (totalScore < 150 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 8)) { // Plus de mots faibles pour newsletter
                if (this.findInText(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 20 : 15; // Bonus pour newsletter
                    totalScore += baseScore;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: baseScore });
                    
                    if (this.debugMode && categoryId === 'marketing_news') {
                        console.log(`[CategoryManager] 🔸 Mot-clé faible trouvé: ${keyword} (+${baseScore})`);
                    }
                }
            }
        }
        
        const finalScore = Math.max(0, totalScore);
        
        if (this.debugMode && categoryId === 'marketing_news') {
            console.log(`[CategoryManager] 📊 Score final pour ${categoryId}: ${finalScore} (hasAbsolute: ${hasAbsolute})`);
            console.log(`[CategoryManager] 📋 Détail des matches:`, matches);
        }
        
        return { 
            total: finalScore, 
            hasAbsolute, 
            matches 
        };
    }

    calculateScoreOptimized(content, keywords, categoryId, email = null) {
        return this.calculateScore(content, keywords, categoryId, email);
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        const normalizedText = text.toLowerCase();
        
        // Recherche simple ET flexible
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec espaces pour éviter les faux positifs
        if (normalizedText.includes(` ${normalizedKeyword} `) || 
            normalizedText.includes(`${normalizedKeyword} `) ||
            normalizedText.includes(` ${normalizedKeyword}`)) {
            return true;
        }
        
        // Fallback avec regex si nécessaire
        try {
            const pattern = this.getCompiledPattern(keyword);
            return pattern.test(text);
        } catch (error) {
            console.warn('[CategoryManager] Erreur regex pour:', keyword, error);
            return normalizedText.includes(normalizedKeyword);
        }
    }

    findInTextOptimized(text, keyword) {
        return this.findInText(text, keyword);
    }

    getCategoryBonus(categoryId) {
        const bonuses = {
            'tasks': 15,
            'security': 10,
            'finance': 10,
            'marketing_news': 10, // Augmenté de 5 à 10
            'project': 10,
            'hr': 10
        };
        return bonuses[categoryId] || 0;
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 25; // Abaissé de 30 à 25 pour newsletter
        const MIN_CONFIDENCE_THRESHOLD = 0.4; // Abaissé de 0.5 à 0.4
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'below_threshold'
            };
        }
        
        validResults.sort((a, b) => {
            // Priorité absolue pour marketing_news si score > 50
            if (a.category === 'marketing_news' && a.score >= 50) {
                return -1;
            }
            if (b.category === 'marketing_news' && b.score >= 50) {
                return 1;
            }
            
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return b.score - a.score;
        });
        
        const best = validResults[0];
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    selectByPriorityWithThresholdOptimized(results) {
        return this.selectByPriorityWithThreshold(results);
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 25) return 0.50; // Nouveau seuil pour newsletter
        return 0.40;
    }

    // ================================================
    // BATCH PROCESSING
    // ================================================
    async analyzeEmailsBatch(emails) {
        console.log(`[CategoryManager] 📦 Batch analysis: ${emails.length} emails`);
        
        const batchResults = [];
        const batchSize = this.batchSize;
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchPromises = batch.map(email => this.analyzeEmail(email));
            
            const results = await Promise.all(batchPromises);
            batchResults.push(...results);
            
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        console.log(`[CategoryManager] ✅ Batch completed: ${batchResults.length} analyses`);
        return batchResults;
    }

    // ================================================
