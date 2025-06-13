// CategoryManager.js - Version 18.0 - Gestion améliorée des catégories

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        
        console.log('[CategoryManager] ✅ Version 18.0 - Gestion améliorée des catégories');
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            // Intégrer les catégories personnalisées
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
            });
            
            console.log('[CategoryManager] Catégories personnalisées chargées:', Object.keys(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    createCustomCategory(categoryData) {
        const id = this.generateCategoryId(categoryData.name);
        
        const category = {
            id: id,
            name: categoryData.name,
            icon: categoryData.icon || '📂',
            color: categoryData.color || '#6366f1',
            description: categoryData.description || '',
            priority: categoryData.priority || 30,
            createdAt: new Date().toISOString(),
            isCustom: true,
            keywords: categoryData.keywords || { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
        // Initialiser les mots-clés
        this.weightedKeywords[id] = category.keywords;

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryCreated', { categoryId: id, category });
        }, 10);

        console.log('[CategoryManager] Catégorie personnalisée créée:', category);
        return category;
    }

    updateCustomCategory(categoryId, updates) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        // Mise à jour avec préservation des mots-clés
        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            keywords: updates.keywords || this.customCategories[categoryId].keywords,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        if (updates.keywords) {
            this.weightedKeywords[categoryId] = updates.keywords;
        }

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryUpdated', { categoryId, category: updatedCategory });
        }, 10);

        console.log('[CategoryManager] Catégorie mise à jour:', categoryId);
        return updatedCategory;
    }

    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            this.settings.taskPreselectedCategories = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.saveSettings();
        }

        delete this.customCategories[categoryId];
        delete this.categories[categoryId];
        delete this.weightedKeywords[categoryId];

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryDeleted', { categoryId });
        }, 10);

        console.log('[CategoryManager] Catégorie supprimée:', categoryId);
    }

    generateCategoryId(name) {
        const base = name.toLowerCase()
            .replace(/[àâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = 'custom_' + base;
        let counter = 1;
        
        while (this.categories[id] || this.customCategories[id]) {
            id = `custom_${base}_${counter}`;
            counter++;
        }
        
        return id;
    }

    getCustomCategories() {
        return { ...this.customCategories };
    }

    // ================================================
    // GESTION DES MOTS-CLÉS PAR CATÉGORIE
    // ================================================
    updateCategoryKeywords(categoryId, keywords) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        this.weightedKeywords[categoryId] = {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || [],
            exclusions: keywords.exclusions || []
        };

        // Si c'est une catégorie personnalisée, sauvegarder
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
            this.saveCustomCategories();
        }

        console.log(`[CategoryManager] Mots-clés mis à jour pour ${categoryId}`);
        
        setTimeout(() => {
            this.dispatchEvent('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
        }, 10);
    }

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    addKeywordToCategory(categoryId, keyword, type = 'strong') {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        if (!this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = { absolute: [], strong: [], weak: [], exclusions: [] };
        }

        if (!this.weightedKeywords[categoryId][type]) {
            this.weightedKeywords[categoryId][type] = [];
        }

        if (!this.weightedKeywords[categoryId][type].includes(keyword)) {
            this.weightedKeywords[categoryId][type].push(keyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    removeKeywordFromCategory(categoryId, keyword, type) {
        if (!this.categories[categoryId] || !this.weightedKeywords[categoryId]) {
            return;
        }

        if (this.weightedKeywords[categoryId][type]) {
            this.weightedKeywords[categoryId][type] = this.weightedKeywords[categoryId][type].filter(k => k !== keyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    getAllKeywords() {
        return { ...this.weightedKeywords };
    }

    // ================================================
    // GESTION DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    toggleTaskPreselectedCategory(categoryId) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        const currentSelected = this.settings.taskPreselectedCategories || [];
        
        if (currentSelected.includes(categoryId)) {
            // Retirer de la sélection
            this.settings.taskPreselectedCategories = currentSelected.filter(id => id !== categoryId);
        } else {
            // Ajouter à la sélection
            this.settings.taskPreselectedCategories = [...currentSelected, categoryId];
        }

        this.saveSettings();
        
        console.log('[CategoryManager] Catégories pré-sélectionnées mises à jour:', this.settings.taskPreselectedCategories);
        
        // Notifier immédiatement
        this.dispatchEvent('taskPreselectedCategoriesChanged', {
            categories: [...this.settings.taskPreselectedCategories],
            action: currentSelected.includes(categoryId) ? 'removed' : 'added',
            categoryId: categoryId
        });

        return this.settings.taskPreselectedCategories;
    }

    isTaskPreselectedCategory(categoryId) {
        return (this.settings.taskPreselectedCategories || []).includes(categoryId);
    }

    // ================================================
    // GESTION DES PARAMÈTRES CENTRALISÉE
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(newSettings = null) {
        try {
            if (newSettings) {
                this.settings = { ...this.settings, ...newSettings };
            }
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            
            setTimeout(() => {
                this.dispatchEvent('categorySettingsChanged', { settings: this.settings });
            }, 10);
            
            console.log('[CategoryManager] Paramètres sauvegardés:', this.settings);
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde paramètres:', error);
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

    // ================================================
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES
    // ================================================
    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.saveSettings(newSettings);
    }

    getScanSettings() {
        return this.settings.scanSettings;
    }

    getAutomationSettings() {
        return this.settings.automationSettings;
    }

    getTaskPreselectedCategories() {
        return this.settings.taskPreselectedCategories || [];
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return this.settings.activeCategories;
    }

    // ================================================
    // LISTENER POUR ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        this.settingsChangeHandler = (event) => {
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement: ${type}`, value);
            
            switch (type) {
                case 'preferences':
                    this.updateSettings({ preferences: { ...this.settings.preferences, ...value } });
                    break;
                case 'scanSettings':
                    this.updateSettings({ scanSettings: { ...this.settings.scanSettings, ...value } });
                    break;
                case 'automationSettings':
                    this.updateSettings({ automationSettings: { ...this.settings.automationSettings, ...value } });
                    break;
                case 'taskPreselectedCategories':
                    this.updateSettings({ taskPreselectedCategories: value });
                    break;
                case 'activeCategories':
                    this.updateSettings({ activeCategories: value });
                    break;
            }
        };

        window.addEventListener('settingsChanged', this.settingsChangeHandler);
        this.eventListenersSetup = true;
        
        console.log('[CategoryManager] Event listeners configurés');
    }

    cleanup() {
        if (this.settingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.settingsChangeHandler);
        }
        this.eventListenersSetup = false;
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
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

    // ================================================
    // SYSTÈME DE DÉTECTION AVEC MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new'
                ],
                weak: ['update', 'discover', 'new'],
                exclusions: []
            },

            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe'
                ],
                weak: ['compte', 'account', 'accès'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire'
                ],
                weak: ['demande', 'besoin', 'attente'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment'
                ],
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'promotion']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal'
                ],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance'
                ],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing']
            },

            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu'
                ],
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'marketing']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket'
                ],
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },

            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum'
                ],
                weak: ['development', 'phase'],
                exclusions: ['newsletter', 'marketing']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources'
                ],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'marketing']
            },

            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff'
                ],
                weak: ['annonce', 'announcement'],
                exclusions: ['newsletter', 'marketing', 'external']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique'
                ],
                weak: ['notification', 'alert'],
                exclusions: ['newsletter', 'marketing']
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy'
                ],
                strong: ['information', 'copie', 'copy'],
                weak: ['fyi', 'info'],
                exclusions: []
            }
        };

        // Ajouter les mots-clés des catégories personnalisées
        Object.keys(this.customCategories).forEach(categoryId => {
            if (!this.weightedKeywords[categoryId]) {
                this.weightedKeywords[categoryId] = this.customCategories[categoryId].keywords || {
                    absolute: [],
                    strong: [],
                    weak: [],
                    exclusions: []
                };
            }
        });
    }

    // ================================================
    // ANALYSE PRINCIPALE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        if (this.shouldDetectCC() && this.isInCC(email)) {
            const marketingCheck = this.analyzeCategory(content, this.weightedKeywords.marketing_news);
            if (marketingCheck.score >= 80) {
                return {
                    category: 'marketing_news',
                    score: marketingCheck.total,
                    confidence: this.calculateConfidence(marketingCheck),
                    matchedPatterns: marketingCheck.matches,
                    hasAbsolute: marketingCheck.hasAbsolute,
                    originallyCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                isCC: true
            };
        }
        
        const allResults = this.analyzeAllCategories(content);
        return this.selectByPriorityWithThreshold(allResults);
    }

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            if (!activeCategories.includes(categoryId) && 
                categoryId !== 'marketing_news' && 
                categoryId !== 'cc') {
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        return results;
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] Scores par catégorie:');
            sortedResults.forEach(r => {
                console.log(`  - ${r.category}: ${r.score}pts (priority: ${r.priority}, confidence: ${r.confidence})`);
            });
        }
        
        const bestResult = sortedResults[0];
        
        if (bestResult) {
            return {
                category: bestResult.category,
                score: bestResult.score,
                confidence: bestResult.confidence,
                matchedPatterns: bestResult.matches,
                hasAbsolute: bestResult.hasAbsolute
            };
        }
        
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false
        };
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        if (keywords.exclusions) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= categoryId === 'marketing_news' ? 20 : 100;
                }
            }
        }
        
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        if (keywords.weak && !hasAbsolute) {
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 10;
                    matches.push({ keyword, type: 'weak', score: 10 });
                }
            }
        }
        
        this.applyDomainBonus(content, categoryId, matches, totalScore);
        
        return { total: Math.max(0, totalScore), hasAbsolute, matches };
    }

    applyDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing'],
            notifications: ['noreply', 'notification', 'donotreply']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = categoryId === 'marketing_news' ? 30 : 50;
                    totalScore += bonus;
                    matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                    break;
                }
            }
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(5);
        }
        
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
        }
        if (email.from?.emailAddress?.name) {
            allText += email.from.emailAddress.name + ' ';
        }
        
        if (email.toRecipients && Array.isArray(email.toRecipients)) {
            email.toRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
                if (recipient.emailAddress?.name) {
                    allText += recipient.emailAddress.name + ' ';
                }
            });
        }
        
        if (email.ccRecipients && Array.isArray(email.ccRecipients)) {
            email.ccRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
                if (recipient.emailAddress?.name) {
                    allText += recipient.emailAddress.name + ' ';
                }
            });
        }
        
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        if (email.body?.content) {
            allText += this.cleanHtml(email.body.content) + ' ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length
        };
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<a[^>]*>(.*?)<\/a>/gi, ' $1 ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
        const normalizedKeyword = keyword.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
        return normalizedText.includes(normalizedKeyword);
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 30) return 0.55;
        return 0.40;
    }

    isSpamEmail(email) {
        if (email.parentFolderId) {
            const folderInfo = email.parentFolderId.toLowerCase();
            if (folderInfo.includes('junk') || 
                folderInfo.includes('spam') || 
                folderInfo.includes('unwanted') ||
                folderInfo.includes('indésirable')) {
                return true;
            }
        }
        
        if (email.categories && Array.isArray(email.categories)) {
            const hasSpamCategory = email.categories.some(cat => 
                cat.toLowerCase().includes('spam') ||
                cat.toLowerCase().includes('junk') ||
                cat.toLowerCase().includes('indésirable')
            );
            if (hasSpamCategory) return true;
        }
        
        return false;
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.ccRecipients.length > 0;
        }
        
        return email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName;
            }
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getCategories() {
        return this.categories;
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
        return this.categories[categoryId] || null;
    }
    
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            preselectedCategories: this.settings.taskPreselectedCategories?.length || 0,
            totalKeywords: 0,
            absoluteKeywords: 0,
            strongKeywords: 0,
            weakKeywords: 0
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.absoluteKeywords += keywords.absolute.length;
            if (keywords.strong) stats.strongKeywords += keywords.strong.length;
            if (keywords.weak) stats.weakKeywords += keywords.weak.length;
        }
        
        stats.totalKeywords = stats.absoluteKeywords + stats.strongKeywords + stats.weakKeywords;
        return stats;
    }
    
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }
    
    testEmail(subject, expectedCategory = null) {
        const testEmail = {
            subject: subject,
            body: { content: 'Test content' },
            from: { emailAddress: { address: 'test@example.com' } },
            toRecipients: [{ emailAddress: { address: 'user@example.com' } }]
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log('\n[CategoryManager] TEST RESULT:');
        console.log(`Subject: "${subject}"`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`Matches:`, result.matchedPatterns);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] Instance détruite');
    }
}

// Créer l'instance globale
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v18.0 loaded - Gestion améliorée des catégories');
