// CategoryManager.js - Version 19.0 - Correction complète des erreurs

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation renforcé
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncCallbacks = new Set();
        this.taskPreselectedCategories = [];
        
        console.log('[CategoryManager] ✅ Version 19.0 - Correction complète des erreurs');
        
        // Initialisation complète
        this.initialize();
    }

    // ================================================
    // INITIALISATION COMPLÈTE
    // ================================================
    initialize() {
        try {
            console.log('[CategoryManager] 🚀 Début initialisation...');
            
            this.initializeCategories();
            this.loadCustomCategories();
            this.initializeWeightedDetection();
            this.setupEventListeners();
            this.initializeTaskPreselectedCategories();
            
            this.isInitialized = true;
            console.log('[CategoryManager] ✅ Initialisation terminée');
            console.log('[CategoryManager] 📊 Paramètres:', this.settings);
            console.log('[CategoryManager] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur initialisation:', error);
            this.loadDefaultSettings();
        }
    }

    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90
            },
            
            // PRIORITÉ NORMALE POUR LES AUTRES
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                priority: 50
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 50
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                priority: 50
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 50
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 50
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 50
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 50
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 50
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 50
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 50
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 50
            }
        };
        
        console.log('[CategoryManager] ✅ Catégories initialisées:', Object.keys(this.categories));
    }

    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'newsletter', 'infolettre', 'bulletin', 'actualités', 'news',
                    'promotion', 'offre spéciale', 'soldes', 'réduction', 'promo',
                    'marketing', 'publicité', 'pub', 'annonce'
                ],
                strong: ['promo', 'deal', 'offer', 'sale', 'discount', 'nouveauté', 'lancement'],
                weak: ['update', 'discover', 'new', 'découvrir', 'nouveau'],
                exclusions: ['facture', 'invoice', 'payment', 'paiement', 'urgent']
            },
            
            cc: {
                absolute: [],
                strong: ['cc:', 'copie', 'en copie', 'forwarded', 'transféré', 'fwd:'],
                weak: ['info', 'information', 'fyi', 'pour info'],
                exclusions: []
            },
            
            security: {
                absolute: [
                    'alerte sécurité', 'security alert', 'connexion détectée', 'login detected',
                    'mot de passe', 'password', 'authentification', 'authentication',
                    'code de vérification', 'verification code', '2fa', 'double authentification'
                ],
                strong: ['sécurité', 'security', 'connexion', 'login', 'authentification'],
                weak: ['compte', 'account', 'accès', 'access'],
                exclusions: []
            },
            
            finance: {
                absolute: [
                    'facture', 'invoice', 'paiement', 'payment', 'échéance', 'due date',
                    'montant dû', 'amount due', 'règlement', 'settlement'
                ],
                strong: ['facture', 'invoice', 'paiement', 'payment', 'devis', 'quote'],
                weak: ['€', ', 'euro', 'dollar', 'prix', 'price', 'coût', 'cost'],
                exclusions: ['gratuit', 'free', 'offert']
            },
            
            tasks: {
                absolute: [
                    'action requise', 'action required', 'à faire', 'todo', 'urgent',
                    'deadline', 'échéance', 'priorité', 'priority', 'important'
                ],
                strong: ['urgent', 'important', 'priorité', 'deadline', 'action', 'tâche'],
                weak: ['merci de', 'please', 'pouvez-vous', 'can you', 'demande'],
                exclusions: ['information', 'info', 'fyi']
            },
            
            commercial: {
                absolute: [
                    'devis', 'quote', 'proposition', 'proposal', 'contrat', 'contract',
                    'opportunité', 'opportunity', 'vente', 'sale'
                ],
                strong: ['devis', 'proposition', 'contrat', 'vente', 'commercial'],
                weak: ['client', 'customer', 'prospect', 'offre', 'offer'],
                exclusions: []
            },
            
            meetings: {
                absolute: [
                    'invitation', 'meeting', 'réunion', 'rendez-vous', 'appointment',
                    'calendrier', 'calendar', 'planning'
                ],
                strong: ['réunion', 'meeting', 'rendez-vous', 'invitation', 'calendar'],
                weak: ['planning', 'agenda', 'disponibilité', 'availability'],
                exclusions: []
            },
            
            support: {
                absolute: [
                    'ticket', 'support', 'assistance', 'help', 'aide', 'problème',
                    'problem', 'bug', 'erreur', 'error'
                ],
                strong: ['support', 'assistance', 'ticket', 'help', 'problème'],
                weak: ['question', 'demande', 'request'],
                exclusions: []
            },
            
            reminders: {
                absolute: [
                    'rappel', 'reminder', 'relance', 'follow up', 'n\'oubliez pas',
                    'don\'t forget', 'échéance', 'expiration'
                ],
                strong: ['rappel', 'reminder', 'relance', 'follow', 'échéance'],
                weak: ['bientôt', 'soon', 'prochainement'],
                exclusions: []
            }
        };
        
        console.log('[CategoryManager] ✅ Mots-clés initialisés');
    }

    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                this.customCategories = JSON.parse(saved);
                
                Object.entries(this.customCategories).forEach(([id, category]) => {
                    this.categories[id] = { ...category, isCustom: true };
                    
                    if (category.keywords) {
                        this.weightedKeywords[id] = { ...category.keywords };
                    }
                });
                
                console.log('[CategoryManager] ✅ Catégories personnalisées chargées:', Object.keys(this.customCategories));
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    setupEventListeners() {
        if (this.eventListenersSetup) return;

        try {
            this.settingsChangeHandler = (event) => {
                console.log('[CategoryManager] 📨 Changement paramètres reçu:', event.detail);
                this.handleSettingsChanged(event.detail);
            };

            this.forceSyncHandler = (event) => {
                console.log('[CategoryManager] 🚀 Synchronisation forcée reçue:', event.detail);
                this.handleForcedSync(event.detail);
            };

            window.addEventListener('settingsChanged', this.settingsChangeHandler);
            window.addEventListener('forceSynchronization', this.forceSyncHandler);

            this.eventListenersSetup = true;
            console.log('[CategoryManager] ✅ Event listeners configurés');
            
        } catch (error) {
            console.error('[CategoryManager] Erreur setup event listeners:', error);
        }
    }

    handleSettingsChanged(settingsData) {
        if (settingsData.settings) {
            this.updateSettings(settingsData.settings);
        }
    }

    handleForcedSync(syncData) {
        if (syncData.settings) {
            this.updateSettings(syncData.settings);
        }
        this.forceSynchronization();
    }

    initializeTaskPreselectedCategories() {
        try {
            if (this.settings && Array.isArray(this.settings.taskPreselectedCategories)) {
                this.taskPreselectedCategories = [...this.settings.taskPreselectedCategories];
            } else {
                this.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
                if (!this.settings) this.settings = {};
                this.settings.taskPreselectedCategories = [...this.taskPreselectedCategories];
                this.saveSettings();
            }
            console.log('[CategoryManager] ✅ Catégories pré-sélectionnées initialisées:', this.taskPreselectedCategories);
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur initialisation catégories pré-sélectionnées:', error);
            this.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                const mergedSettings = { ...defaultSettings, ...parsedSettings };
                
                if (!Array.isArray(mergedSettings.taskPreselectedCategories)) {
                    console.warn('[CategoryManager] ⚠️ taskPreselectedCategories invalide, correction');
                    mergedSettings.taskPreselectedCategories = defaultSettings.taskPreselectedCategories;
                }
                
                console.log('[CategoryManager] 📥 Paramètres chargés depuis localStorage');
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 🆕 Utilisation paramètres par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings = null) {
        try {
            if (this.syncInProgress) {
                console.log('[CategoryManager] ⏳ Sync en cours, programmation différée');
                setTimeout(() => this.saveSettings(newSettings), 100);
                return;
            }
            
            this.syncInProgress = true;
            
            if (newSettings) {
                console.log('[CategoryManager] 📝 Mise à jour settings avec:', newSettings);
                this.settings = { ...this.settings, ...newSettings };
                
                if (newSettings.taskPreselectedCategories) {
                    this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
                    console.log('[CategoryManager] 📋 Catégories locales synchronisées:', this.taskPreselectedCategories);
                }
            }
            
            this.validateSettings();
            
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            this.lastSyncTime = Date.now();
            
            console.log('[CategoryManager] 💾 Paramètres sauvegardés:', this.settings);
            
            setTimeout(() => {
                this.dispatchEvent('categorySettingsChanged', {
                    settings: this.settings,
                    source: 'CategoryManager',
                    timestamp: this.lastSyncTime,
                    taskPreselectedCategories: [...this.taskPreselectedCategories]
                });
                
                this.syncCallbacks.forEach(callback => {
                    try {
                        callback(this.settings);
                    } catch (error) {
                        console.warn('[CategoryManager] Erreur callback sync:', error);
                    }
                });
                
                this.syncInProgress = false;
            }, 10);
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
            this.syncInProgress = false;
        }
    }

    validateSettings() {
        if (!this.settings) {
            this.settings = this.getDefaultSettings();
            return;
        }

        if (!Array.isArray(this.settings.taskPreselectedCategories)) {
            this.settings.taskPreselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
        }

        if (!this.settings.scanSettings) {
            this.settings.scanSettings = this.getDefaultSettings().scanSettings;
        }

        if (!this.settings.preferences) {
            this.settings.preferences = this.getDefaultSettings().preferences;
        }

        if (!this.settings.automationSettings) {
            this.settings.automationSettings = this.getDefaultSettings().automationSettings;
        }
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

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        console.log('[CategoryManager] 📝 updateSettings appelé avec:', newSettings);
        
        if (!newSettings || typeof newSettings !== 'object') {
            console.warn('[CategoryManager] ⚠️ Settings invalides fournis');
            return;
        }
        
        this.saveSettings(newSettings);
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
    getCategories() {
        return { ...this.categories };
    }

    getCategory(categoryId) {
        return this.categories[categoryId] || null;
    }

    getTaskPreselectedCategories() {
        console.log('[CategoryManager] 📋 getTaskPreselectedCategories retourne:', this.taskPreselectedCategories);
        return [...this.taskPreselectedCategories];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories appelé avec:', categories);
        
        if (!Array.isArray(categories)) {
            console.warn('[CategoryManager] ⚠️ Categories doit être un array');
            return false;
        }
        
        this.taskPreselectedCategories = [...categories];
        this.settings.taskPreselectedCategories = [...this.taskPreselectedCategories];
        
        this.saveSettings();
        
        console.log('[CategoryManager] ✅ Catégories pré-sélectionnées mises à jour:', this.taskPreselectedCategories);
        return true;
    }

    // ================================================
    // ANALYSE DES EMAILS
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        try {
            const analysis = this.performCategoryAnalysis(email);
            
            return {
                category: analysis.bestCategory || 'other',
                score: analysis.bestScore || 0,
                confidence: this.calculateConfidence(analysis.bestScore),
                matchedPatterns: analysis.matchedPatterns || [],
                hasAbsolute: analysis.hasAbsolute || false,
                isSpam: this.detectSpam(email),
                isCC: this.detectCC(email)
            };
        } catch (error) {
            console.error('[CategoryManager] Erreur analyse email:', error);
            return { category: 'other', score: 0, confidence: 0, error: error.message };
        }
    }

    performCategoryAnalysis(email) {
        const text = this.extractEmailText(email);
        const results = {};
        let bestCategory = null;
        let bestScore = 0;
        let hasAbsolute = false;
        const matchedPatterns = [];

        Object.entries(this.weightedKeywords).forEach(([categoryId, keywords]) => {
            if (!this.categories[categoryId]) return;

            const categoryScore = this.calculateCategoryScore(text, keywords, email);
            results[categoryId] = categoryScore;

            if (categoryScore.hasAbsolute) {
                hasAbsolute = true;
            }

            if (categoryScore.patterns) {
                matchedPatterns.push(...categoryScore.patterns);
            }

            if (categoryScore.totalScore > bestScore) {
                bestScore = categoryScore.totalScore;
                bestCategory = categoryId;
            }
        });

        return {
            results,
            bestCategory,
            bestScore,
            hasAbsolute,
            matchedPatterns
        };
    }

    calculateCategoryScore(text, keywords, email) {
        let totalScore = 0;
        let hasAbsolute = false;
        const patterns = [];

        // Mots-clés absolus (100 points)
        if (keywords.absolute) {
            keywords.absolute.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    totalScore += 100;
                    hasAbsolute = true;
                    patterns.push({ type: 'absolute', keyword, points: 100 });
                }
            });
        }

        // Mots-clés forts (30 points)
        if (keywords.strong) {
            keywords.strong.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    totalScore += 30;
                    patterns.push({ type: 'strong', keyword, points: 30 });
                }
            });
        }

        // Mots-clés faibles (10 points)
        if (keywords.weak) {
            keywords.weak.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    totalScore += 10;
                    patterns.push({ type: 'weak', keyword, points: 10 });
                }
            });
        }

        // Exclusions (score divisé par 2)
        if (keywords.exclusions) {
            keywords.exclusions.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    totalScore = Math.floor(totalScore / 2);
                    patterns.push({ type: 'exclusion', keyword, points: -totalScore });
                }
            });
        }

        return {
            totalScore,
            hasAbsolute,
            patterns
        };
    }

    extractEmailText(email) {
        let text = '';
        
        if (email.subject) {
            text += email.subject.toLowerCase() + ' ';
        }
        
        if (email.bodyPreview) {
            text += email.bodyPreview.toLowerCase() + ' ';
        }
        
        if (email.from?.emailAddress?.address) {
            text += email.from.emailAddress.address.toLowerCase() + ' ';
        }
        
        if (email.from?.emailAddress?.name) {
            text += email.from.emailAddress.name.toLowerCase() + ' ';
        }
        
        return text;
    }

    calculateConfidence(score) {
        if (score >= 100) return 1.0;
        if (score >= 50) return 0.8;
        if (score >= 30) return 0.6;
        if (score >= 10) return 0.4;
        return 0.2;
    }

    detectSpam(email) {
        if (!this.settings.preferences?.excludeSpam) return false;
        
        const spamKeywords = ['spam', 'viagra', 'casino', 'lottery', 'winner', 'congratulations'];
        const text = this.extractEmailText(email);
        
        return spamKeywords.some(keyword => text.includes(keyword));
    }

    detectCC(email) {
        if (!this.settings.preferences?.detectCC) return false;
        
        if (email.ccRecipients && email.ccRecipients.length > 0) return true;
        if (email.bccRecipients && email.bccRecipients.length > 0) return true;
        
        const text = this.extractEmailText(email);
        return text.includes('cc:') || text.includes('copie');
    }

    // ================================================
    // SYNCHRONISATION
    // ================================================
    forceSynchronization() {
        console.log('[CategoryManager] 🚀 Synchronisation forcée');
        
        setTimeout(() => {
            this.dispatchEvent('forceSynchronization', {
                settings: this.settings,
                source: 'CategoryManager',
                timestamp: Date.now()
            });
        }, 10);
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES - CRUD
    // ================================================
    createCustomCategory(categoryData) {
        try {
            const id = this.generateCategoryId(categoryData.name);
            
            if (this.categories[id]) {
                throw new Error('Une catégorie avec ce nom existe déjà');
            }
            
            const category = {
                id,
                name: categoryData.name,
                icon: categoryData.icon,
                color: categoryData.color,
                description: categoryData.description || '',
                priority: categoryData.priority || 50,
                isCustom: true,
                createdAt: new Date().toISOString()
            };
            
            this.customCategories[id] = category;
            this.categories[id] = category;
            
            if (categoryData.keywords) {
                this.weightedKeywords[id] = this.processKeywords(categoryData.keywords);
            }
            
            this.saveCustomCategories();
            
            console.log('[CategoryManager] ✅ Catégorie personnalisée créée:', category);
            return category;
        } catch (error) {
            console.error('[CategoryManager] Erreur création catégorie:', error);
            throw error;
        }
    }

    updateCustomCategory(categoryId, updates) {
        try {
            if (!this.customCategories[categoryId]) {
                throw new Error('Catégorie personnalisée non trouvée');
            }
            
            const updatedCategory = {
                ...this.customCategories[categoryId],
                ...updates,
                id: categoryId,
                isCustom: true,
                updatedAt: new Date().toISOString()
            };
            
            this.customCategories[categoryId] = updatedCategory;
            this.categories[categoryId] = updatedCategory;
            
            if (updates.keywords) {
                this.weightedKeywords[categoryId] = this.processKeywords(updates.keywords);
            }
            
            this.saveCustomCategories();
            
            console.log('[CategoryManager] ✅ Catégorie personnalisée mise à jour:', updatedCategory);
            return true;
        } catch (error) {
            console.error('[CategoryManager] Erreur mise à jour catégorie:', error);
            throw error;
        }
    }

    deleteCustomCategory(categoryId) {
        try {
            if (!this.customCategories[categoryId]) {
                throw new Error('Catégorie personnalisée non trouvée');
            }
            
            const category = this.customCategories[categoryId];
            
            delete this.customCategories[categoryId];
            delete this.categories[categoryId];
            delete this.weightedKeywords[categoryId];
            
            // Retirer des catégories pré-sélectionnées
            if (this.taskPreselectedCategories.includes(categoryId)) {
                this.taskPreselectedCategories = this.taskPreselectedCategories.filter(id => id !== categoryId);
                this.settings.taskPreselectedCategories = [...this.taskPreselectedCategories];
                this.saveSettings();
            }
            
            this.saveCustomCategories();
            
            console.log('[CategoryManager] ✅ Catégorie personnalisée supprimée:', category.name);
            return true;
        } catch (error) {
            console.error('[CategoryManager] Erreur suppression catégorie:', error);
            throw error;
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] ✅ Catégories personnalisées sauvegardées');
            
            this.dispatchEvent('customCategoriesChanged', {
                customCategories: { ...this.customCategories },
                allCategories: { ...this.categories },
                source: 'CategoryManager'
            });
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    generateCategoryId(name) {
        const baseName = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = `custom_${baseName}`;
        let counter = 1;
        
        while (this.categories[id]) {
            id = `custom_${baseName}_${counter}`;
            counter++;
        }
        
        return id;
    }

    processKeywords(rawKeywords) {
        const processed = {};
        
        for (const [type, keywordsList] of Object.entries(rawKeywords)) {
            if (Array.isArray(keywordsList)) {
                processed[type] = keywordsList
                    .map(kw => kw.trim().toLowerCase())
                    .filter(kw => kw.length > 0)
                    .filter((kw, index, arr) => arr.indexOf(kw) === index);
            }
        }
        
        return processed;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    getDebugInfo() {
        return {
            version: '19.0',
            isInitialized: this.isInitialized,
            totalCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSyncTime: this.lastSyncTime,
            syncInProgress: this.syncInProgress,
            eventListenersSetup: this.eventListenersSetup
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        if (this.settingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.settingsChangeHandler);
        }
        if (this.forceSyncHandler) {
            window.removeEventListener('forceSynchronization', this.forceSyncHandler);
        }
        this.eventListenersSetup = false;
        this.syncCallbacks.clear();
        this.syncInProgress = false;
        
        console.log('[CategoryManager] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        this.taskPreselectedCategories = [];
        console.log('[CategoryManager] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v19.0 loaded - Correction complète des erreurs');
