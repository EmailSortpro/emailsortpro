// CategoryManager.js - Version 21.0 - RÉÉCRITURE COMPLÈTE avec chargement garanti

console.log('[CategoryManager] 🚀 === RÉÉCRITURE COMPLÈTE v21.0 ===');

class CategoryManager {
    constructor() {
        // État d'initialisation
        this.isInitialized = false;
        this.initializationPromise = null;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        
        // Données principales
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = null;
        
        // Système de synchronisation
        this.changeListeners = new Set();
        this.syncQueue = [];
        this.syncInProgress = false;
        this.lastSyncTimestamp = 0;
        
        // Métriques et cache
        this._validCategoriesCache = null;
        this._validCategoriesCacheTime = 0;
        this._emptyCategoriesSet = new Set();
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        // Provider compatibility
        this.providerCompatibility = {
            google: true,
            microsoft: true
        };
        
        console.log('[CategoryManager] ✅ Instance créée, début initialisation...');
        
        // Démarrer l'initialisation immédiatement
        this.startInitialization();
    }

    // ================================================
    // SYSTÈME D'INITIALISATION ROBUSTE
    // ================================================
    
    startInitialization() {
        console.log('[CategoryManager] 🔄 Démarrage initialisation...');
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }
    
    async performInitialization() {
        while (this.initializationAttempts < this.maxInitializationAttempts && !this.isInitialized) {
            this.initializationAttempts++;
            console.log(`[CategoryManager] 🔄 Tentative d'initialisation ${this.initializationAttempts}/${this.maxInitializationAttempts}`);
            
            try {
                // Étape 1: Initialiser les catégories de base
                console.log('[CategoryManager] 📂 Initialisation catégories de base...');
                this.initializeCategories();
                
                // Étape 2: Initialiser les mots-clés
                console.log('[CategoryManager] 🔤 Initialisation mots-clés...');
                this.initializeWeightedDetection();
                
                // Étape 3: Charger les paramètres
                console.log('[CategoryManager] ⚙️ Chargement paramètres...');
                this.loadSettings();
                
                // Étape 4: Charger les catégories personnalisées
                console.log('[CategoryManager] 🎨 Chargement catégories personnalisées...');
                this.loadCustomCategories();
                
                // Étape 5: Démarrer la synchronisation
                console.log('[CategoryManager] 🔗 Démarrage synchronisation...');
                this.startAutoSync();
                
                // Étape 6: Setup des listeners
                console.log('[CategoryManager] 👂 Configuration listeners...');
                this.setupEventListeners();
                
                this.isInitialized = true;
                this.lastSyncTimestamp = Date.now();
                
                console.log('[CategoryManager] ✅ Initialisation terminée avec succès!');
                console.log('[CategoryManager] 📊 Stats:', this.getCategoryStats());
                
                // Dispatch event d'initialisation
                setTimeout(() => {
                    this.dispatchEvent('categoryManagerReady', {
                        categories: Object.keys(this.categories),
                        customCategories: Object.keys(this.customCategories),
                        settings: this.settings
                    });
                }, 100);
                
                return true;
                
            } catch (error) {
                console.error(`[CategoryManager] ❌ Tentative ${this.initializationAttempts} échouée:`, error);
                
                if (this.initializationAttempts < this.maxInitializationAttempts) {
                    console.log('[CategoryManager] ⏳ Retry dans 1 seconde...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.error('[CategoryManager] 💥 Échec total d\'initialisation');
                    this.initializeMinimalFallback();
                    break;
                }
            }
        }
        
        return this.isInitialized;
    }
    
    initializeMinimalFallback() {
        console.log('[CategoryManager] 🆘 Initialisation minimale de secours...');
        
        try {
            // Catégories de base minimales
            this.categories = {
                tasks: {
                    name: 'Actions Requises',
                    icon: '✅',
                    color: '#ef4444',
                    description: 'Tâches à faire',
                    priority: 50,
                    isCustom: false
                },
                marketing_news: {
                    name: 'Marketing & News',
                    icon: '📰',
                    color: '#8b5cf6',
                    description: 'Newsletters',
                    priority: 100,
                    isCustom: false
                },
                other: {
                    name: 'Non classé',
                    icon: '❓',
                    color: '#64748b',
                    description: 'Emails non classés',
                    priority: 10,
                    isCustom: false
                }
            };
            
            // Mots-clés minimaux
            this.weightedKeywords = {
                tasks: {
                    absolute: ['action required', 'action requise', 'urgent'],
                    strong: ['urgent', 'asap', 'task', 'tâche'],
                    weak: ['demande', 'request'],
                    exclusions: []
                },
                marketing_news: {
                    absolute: ['unsubscribe', 'désinscrire', 'newsletter'],
                    strong: ['promo', 'offer', 'notification'],
                    weak: ['update', 'news'],
                    exclusions: []
                }
            };
            
            // Settings par défaut
            this.settings = this.getDefaultSettings();
            
            // Pas de catégories personnalisées
            this.customCategories = {};
            
            this.isInitialized = true;
            console.log('[CategoryManager] ✅ Mode minimal activé');
            
        } catch (error) {
            console.error('[CategoryManager] 💥 Échec initialisation minimale:', error);
            this.isInitialized = false;
        }
    }
    
    async ensureInitialized() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initializationPromise) {
            await this.initializationPromise;
            return this.isInitialized;
        }
        
        return await this.startInitialization();
    }

    // ================================================
    // GESTION DES PARAMÈTRES CENTRALISÉE
    // ================================================
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.settings = { ...defaultSettings, ...parsedSettings };
                console.log('[CategoryManager] ✅ Settings chargés depuis localStorage');
            } else {
                this.settings = defaultSettings;
                console.log('[CategoryManager] 📝 Utilisation settings par défaut');
            }
            
            // Valider et nettoyer les settings
            this.validateAndCleanSettings();
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
        }
    }
    
    validateAndCleanSettings() {
        // S'assurer que taskPreselectedCategories est un tableau
        if (!Array.isArray(this.settings.taskPreselectedCategories)) {
            this.settings.taskPreselectedCategories = [];
        }
        
        // S'assurer que les objets nécessaires existent
        if (!this.settings.categoryExclusions) {
            this.settings.categoryExclusions = { domains: [], emails: [] };
        }
        
        if (!this.settings.scanSettings) {
            this.settings.scanSettings = {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            };
        }
        
        if (!this.settings.preferences) {
            this.settings.preferences = {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            };
        }
        
        if (!this.settings.automationSettings) {
            this.settings.automationSettings = {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            };
        }
        
        console.log('[CategoryManager] ✅ Settings validés et nettoyés');
    }
    
    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [], // VIDE par défaut
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
    
    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // API PUBLIQUE POUR LES AUTRES MODULES
    // ================================================
    
    getSettings() {
        if (!this.settings) {
            console.warn('[CategoryManager] ⚠️ Settings pas encore chargés, utilisation défaut');
            return this.getDefaultSettings();
        }
        return JSON.parse(JSON.stringify(this.settings));
    }
    
    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000; // 10 secondes
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            return [...this._taskCategoriesCache];
        }
        
        const categories = this.settings?.taskPreselectedCategories || [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        return [...categories];
    }
    
    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
        this.invalidateTaskCategoriesCache();
        
        if (!this.settings) {
            this.settings = this.getDefaultSettings();
        }
        
        this.settings.taskPreselectedCategories = normalizedCategories;
        this.saveSettingsToStorage();
        
        if (notifyModules) {
            this.notifySpecificModules('taskPreselectedCategories', normalizedCategories);
            this.notifyAllModules('taskPreselectedCategories', normalizedCategories);
        }
        
        return normalizedCategories;
    }
    
    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        console.log('[CategoryManager] 🔄 Cache des catégories tâches invalidé');
    }
    
    getActiveCategories() {
        if (!this.settings || !this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }
    
    getCategories() {
        return this.categories;
    }
    
    getCategory(categoryId) {
        // Catégories spéciales
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
    
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            preselectedCategories: this.settings?.taskPreselectedCategories?.length || 0,
            totalKeywords: 0,
            isInitialized: this.isInitialized,
            initializationAttempts: this.initializationAttempts,
            provider: this.getCurrentProvider()
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.totalKeywords += keywords.absolute.length;
            if (keywords.strong) stats.totalKeywords += keywords.strong.length;
            if (keywords.weak) stats.totalKeywords += keywords.weak.length;
        }
        
        return stats;
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION SIMPLIFIÉ
    // ================================================
    
    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        // EmailScanner
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    break;
            }
        }
        
        // ScanModule
        if (window.minimalScanModule || window.scanStartModule) {
            const scanner = window.minimalScanModule || window.scanStartModule;
            if (typeof scanner.updateSettings === 'function') {
                scanner.updateSettings({ [type]: value });
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
    
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES DE BASE
    // ================================================
    
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
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
        
        console.log('[CategoryManager] ✅ Catégories de base initialisées:', Object.keys(this.categories).length);
    }

    initializeWeightedDetection() {
        this.weightedKeywords = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                absolute: [
                    'se désinscrire', 'désinscrire', 'désabonner', 'unsubscribe', 
                    'opt out', 'newsletter', 'mailing list', 'email preferences'
                ],
                strong: ['promo', 'offer', 'deal', 'special', 'exclusive'],
                weak: ['update', 'news', 'discover'],
                exclusions: []
            },

            security: {
                absolute: [
                    'security alert', 'alerte de sécurité', 'login alert', 
                    'verification code', 'two-factor', 'suspicious activity'
                ],
                strong: ['security', 'vérification', 'password', 'authentification'],
                weak: ['account', 'access'],
                exclusions: ['newsletter', 'promotion']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent', 
                    'task assigned', 'deadline', 'approval needed'
                ],
                strong: ['urgent', 'asap', 'priority', 'task', 'action'],
                weak: ['request', 'demande', 'need'],
                exclusions: ['newsletter', 'marketing']
            },

            meetings: {
                absolute: [
                    'meeting request', 'demande de réunion', 'calendar invitation',
                    'google meet', 'teams meeting', 'zoom meeting'
                ],
                strong: ['meeting', 'réunion', 'calendar', 'appointment'],
                weak: ['agenda', 'schedule'],
                exclusions: ['newsletter', 'promotion']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'contrat', 
                    'purchase order', 'offre commerciale'
                ],
                strong: ['commercial', 'business', 'client', 'opportunity'],
                weak: ['négociation', 'discussion'],
                exclusions: ['newsletter', 'marketing']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'virement', 
                    'bank statement', 'order confirmation'
                ],
                strong: ['montant', 'total', 'prix', 'commande'],
                weak: ['euro', 'dollar', 'transaction'],
                exclusions: ['newsletter', 'promotion']
            },

            project: {
                absolute: [
                    'project update', 'milestone', 'sprint', 
                    'deliverable', 'kickoff'
                ],
                strong: ['projet', 'project', 'development'],
                weak: ['phase', 'planning'],
                exclusions: ['newsletter', 'marketing']
            },

            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'circling back'
                ],
                strong: ['reminder', 'rappel', 'follow'],
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'promotion']
            },

            support: {
                absolute: [
                    'ticket #', 'support ticket', 'case number',
                    'issue resolved', 'help desk'
                ],
                strong: ['support', 'assistance', 'ticket', 'incident'],
                weak: ['help', 'question'],
                exclusions: ['newsletter', 'marketing']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'performance review', 'job offer'
                ],
                strong: ['rh', 'hr', 'salary', 'employment'],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'family', 'personal']
            },

            internal: {
                absolute: [
                    'all staff', 'company announcement', 'memo interne',
                    'note de service', 'internal communication'
                ],
                strong: ['internal', 'company wide', 'announcement'],
                weak: ['information', 'update'],
                exclusions: ['newsletter', 'external', 'client']
            },

            notifications: {
                absolute: [
                    'do not reply', 'noreply@', 'automated message',
                    'system notification', 'no-reply@'
                ],
                strong: ['automated', 'notification', 'system'],
                weak: ['alert', 'info'],
                exclusions: ['newsletter', 'urgent']
            },

            cc: {
                absolute: [
                    'for your information', 'fyi', 'courtesy copy',
                    'en copie', 'pour info'
                ],
                strong: ['information', 'copy'],
                weak: ['cc:', 'info'],
                exclusions: ['urgent', 'action required']
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES
    // ================================================
    
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                // Ajouter à la liste principale
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                // Charger les mots-clés
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
                
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" chargée`);
            });
            
            console.log('[CategoryManager] 📊 Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }
    
    getCustomCategories() {
        return { ...this.customCategories };
    }

    // ================================================
    // ANALYSE EMAIL BASIQUE
    // ================================================
    
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Extraction basique du contenu
        const content = this.extractBasicContent(email);
        
        // Test simple sur les catégories principales
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            const score = this.calculateBasicScore(content, keywords);
            
            if (score.total >= 100 && score.hasAbsolute) {
                return {
                    category: categoryId,
                    score: score.total,
                    confidence: 0.9,
                    matchedPatterns: score.matches,
                    hasAbsolute: true
                };
            }
        }
        
        return { category: 'other', score: 0, confidence: 0 };
    }
    
    extractBasicContent(email) {
        let text = '';
        
        if (email.subject) text += (email.subject + ' ').repeat(3);
        if (email.from?.emailAddress?.address) text += email.from.emailAddress.address + ' ';
        if (email.bodyPreview) text += email.bodyPreview + ' ';
        
        return {
            text: text.toLowerCase(),
            subject: (email.subject || '').toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address)
        };
    }
    
    calculateBasicScore(content, keywords) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Test des mots-clés absolus
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (content.text.includes(keyword.toLowerCase())) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong && !hasAbsolute) {
            for (const keyword of keywords.strong) {
                if (content.text.includes(keyword.toLowerCase())) {
                    totalScore += 40;
                    matches.push({ keyword, type: 'strong', score: 40 });
                }
            }
        }
        
        return { total: totalScore, hasAbsolute, matches };
    }
    
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    
    startAutoSync() {
        // Synchronisation périodique simple
        setInterval(() => {
            if (this.syncQueue.length > 0) {
                this.processSettingsChanges();
            }
        }, 5000);
    }
    
    processSettingsChanges() {
        if (this.syncInProgress || this.syncQueue.length === 0) return;
        
        this.syncInProgress = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const change = this.syncQueue.shift();
                this.applySettingChange(change);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur sync queue:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    applySettingChange(change) {
        const { type, value, notifyModules } = change;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    getCurrentProvider() {
        if (window.googleAuthService && window.googleAuthService.isAuthenticated?.()) {
            return 'google';
        }
        if (window.authService && window.authService.isAuthenticated?.()) {
            return 'microsoft';
        }
        return 'unknown';
    }
    
    setupEventListeners() {
        // Setup minimal des listeners
        console.log('[CategoryManager] 👂 Event listeners configurés');
    }
    
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'CategoryManager',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            initializationAttempts: this.initializationAttempts,
            totalCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            taskPreselectedCategories: this.getTaskPreselectedCategories(),
            settings: this.settings,
            currentProvider: this.getCurrentProvider(),
            version: '21.0'
        };
    }
    
    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v21.0');
        
        const debugInfo = this.getDebugInfo();
        console.log('État:', debugInfo);
        
        console.log('Catégories disponibles:', Object.keys(this.categories));
        console.log('Catégories personnalisées:', Object.keys(this.customCategories));
        console.log('Mots-clés configurés:', Object.keys(this.weightedKeywords));
        
        console.groupEnd();
        return debugInfo;
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    
    cleanup() {
        this.syncQueue = [];
        this.changeListeners.clear();
        this.syncInProgress = false;
        console.log('[CategoryManager] 🧹 Nettoyage effectué');
    }
    
    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = null;
        this.isInitialized = false;
        console.log('[CategoryManager] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE GARANTIE
// ================================================

console.log('[CategoryManager] 🔄 === INITIALISATION GLOBALE ===');

// Nettoyer l'ancienne instance
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
    delete window.categoryManager;
}

// Créer la nouvelle instance
console.log('[CategoryManager] 🆕 Création nouvelle instance v21.0...');
window.categoryManager = new CategoryManager();

// Attendre l'initialisation et notifier
window.categoryManager.ensureInitialized().then((success) => {
    if (success) {
        console.log('[CategoryManager] ✅ === INITIALISATION RÉUSSIE ===');
        console.log('[CategoryManager] 📊 Stats finales:', window.categoryManager.getCategoryStats());
        
        // Dispatch event global pour signaler la disponibilité
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('categoryManagerReady', {
                detail: {
                    success: true,
                    manager: window.categoryManager,
                    stats: window.categoryManager.getCategoryStats()
                }
            }));
        }, 100);
        
    } else {
        console.error('[CategoryManager] ❌ === INITIALISATION ÉCHOUÉE ===');
    }
});

// Méthodes globales de test
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v21.0');
    
    if (!window.categoryManager) {
        console.error('❌ CategoryManager non disponible');
        console.groupEnd();
        return { success: false };
    }
    
    const debugInfo = window.categoryManager.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    // Test basique
    const testEmail = {
        subject: 'Action requise: Confirmer votre commande',
        from: { emailAddress: { address: 'test@example.com' } },
        bodyPreview: 'Veuillez confirmer votre commande'
    };
    
    const result = window.categoryManager.analyzeEmail(testEmail);
    console.log('Test analyse email:', result);
    
    console.groupEnd();
    return { success: true, debugInfo, testResult: result };
};

window.debugCategoryManager = function() {
    if (window.categoryManager) {
        return window.categoryManager.runDiagnostics();
    }
    console.error('❌ CategoryManager non disponible');
    return null;
};

console.log('✅ CategoryManager v21.0 loaded - Réécriture complète avec chargement garanti');
