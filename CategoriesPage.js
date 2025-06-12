// CategoryManager.js - Version 17.1 - Patterns étendus et catégories personnalisées

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {}; // Nouvelles catégories personnalisées
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        
        console.log('[CategoryManager] ✅ Version 17.1 - Patterns étendus et catégories personnalisées');
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            // Intégrer les catégories personnalisées dans les catégories principales
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30 // Priorité moyenne par défaut
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
            isCustom: true
        };

        // Ajouter aux catégories personnalisées
        this.customCategories[id] = category;
        
        // Ajouter aux catégories principales
        this.categories[id] = category;
        
        // Initialiser les mots-clés vides
        this.weightedKeywords[id] = {
            absolute: categoryData.keywords?.absolute || [],
            strong: categoryData.keywords?.strong || [],
            weak: categoryData.keywords?.weak || [],
            exclusions: categoryData.keywords?.exclusions || []
        };

        this.saveCustomCategories();
        
        // Notifier les autres modules
        window.dispatchEvent(new CustomEvent('categoryCreated', {
            detail: { categoryId: id, category: category }
        }));

        console.log('[CategoryManager] Catégorie personnalisée créée:', category);
        return category;
    }

    updateCustomCategory(categoryId, updates) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        this.customCategories[categoryId] = {
            ...this.customCategories[categoryId],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Mettre à jour aussi dans les catégories principales
        this.categories[categoryId] = {
            ...this.categories[categoryId],
            ...updates
        };

        this.saveCustomCategories();
        
        // Notifier les autres modules
        window.dispatchEvent(new CustomEvent('categoryUpdated', {
            detail: { categoryId, category: this.categories[categoryId] }
        }));

        console.log('[CategoryManager] Catégorie personnalisée mise à jour:', categoryId);
        return this.categories[categoryId];
    }

    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        // Supprimer des catégories personnalisées
        delete this.customCategories[categoryId];
        
        // Supprimer des catégories principales
        delete this.categories[categoryId];
        
        // Supprimer les mots-clés
        delete this.weightedKeywords[categoryId];

        this.saveCustomCategories();
        
        // Notifier les autres modules
        window.dispatchEvent(new CustomEvent('categoryDeleted', {
            detail: { categoryId }
        }));

        console.log('[CategoryManager] Catégorie personnalisée supprimée:', categoryId);
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
    // GESTION DES PARAMÈTRES CENTRALISÉE
    // ================================================

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
            
            // Notifier les autres modules
            window.dispatchEvent(new CustomEvent('categorySettingsChanged', {
                detail: { settings: this.settings }
            }));
            
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
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'], // CORRECTION: Par défaut
            categoryExclusions: { domains: [], emails: [] },
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
        const settings = this.settings;
        const preselected = settings.taskPreselectedCategories;
        
        // CORRECTION: S'assurer qu'il y a toujours des catégories par défaut
        if (!preselected || preselected.length === 0) {
            const defaultCategories = ['tasks', 'commercial', 'finance', 'meetings'];
            console.log('[CategoryManager] 🔧 Aucune catégorie pré-sélectionnée, application des défauts:', defaultCategories);
            
            // Mettre à jour les paramètres
            this.updateSettings({ taskPreselectedCategories: defaultCategories });
            return defaultCategories;
        }
        
        console.log('[CategoryManager] ✅ Catégories pré-sélectionnées:', preselected);
        return preselected;
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
        window.addEventListener('settingsChanged', (event) => {
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
        });
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS (détecté en premier)
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
                description: 'Tâches à faire et demandes d\'action',
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
        
        this.isInitialized = true;
    }

    // ================================================
    // SYSTÈME DE DÉTECTION AVEC MOTS-CLÉS ÉTENDUS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - PRIORITÉ MAXIMALE - PATTERNS ÉTENDUS
            marketing_news: {
                absolute: [
                    // DÉSINSCRIPTION - CRITÈRE CLÉ
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    
                    // NOUVEAU PATTERN INTÉGRÉ
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'si vous ne souhaitez plus', 'ne plus recevoir de communications',
                    'communications de notre part', 'de notre part',
                    
                    // NEWSLETTERS EXPLICITES
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous est envoyé', 'vous recevez cet email',
                    'abonnement newsletter', 'inscription newsletter',
                    
                    // MARKETING CLAIR
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'offre spéciale', 'réduction', '% de réduction',
                    '% off', 'promo code', 'code promo',
                    'flash sale', 'vente flash', 'black friday',
                    'discount', 'remise', 'prix réduit',
                    'exclusive offer', 'offre exclusive',
                    'limited time', 'temps limité',
                    
                    // E-COMMERCE
                    'shop now', 'acheter maintenant', 'buy now',
                    'add to cart', 'ajouter au panier',
                    'new collection', 'nouvelle collection',
                    
                    // CAMPAGNES MARKETING
                    'campagne marketing', 'marketing campaign',
                    'envoi marketing', 'communication marketing'
                ],
                
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'abonné', 'subscriber', 'désinscription',
                    'exclusive', 'special', 'limited', 'new',
                    'collection', 'shop', 'store', 'communications',
                    'préférences', 'souhaitez', 'paramétrez'
                ],
                
                weak: ['update', 'discover', 'new', 'choix'],
                exclusions: []
            },

            // SÉCURITÉ - PATTERNS STRICTS
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'quelqu\'un s\'est connecté', 'connexion à votre compte',
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

            // TÂCHES - PATTERNS STRICTS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'merci de faire', 'pouvez-vous faire', 'pourriez-vous faire',
                    'action à mener', 'à faire', 'à traiter',
                    'confirmation requise', 'approval needed'
                ],
                
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'deadline', 'échéance'
                ],
                
                weak: ['demande', 'besoin', 'attente'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // RÉUNIONS - PATTERNS STRICTS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'conference call', 'rendez-vous', 'rdv'
                ],
                
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment'
                ],
                
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'promotion']
            },

            // COMMERCIAL - PATTERNS STRICTS
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'proposition commerciale', 'business proposal',
                    'opportunité commerciale', 'nouveau client'
                ],
                
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal'
                ],
                
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // FINANCE - PATTERNS STRICTS
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'impôts', 'taxes', 'fiscal',
                    'comptabilité', 'accounting', 'bilan'
                ],
                
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'paiement', 'payment'
                ],
                
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing']
            },

            // RELANCES - PATTERNS STRICTS
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'suite à notre', 'faisant suite'
                ],
                
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu'
                ],
                
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'marketing']
            },

            // SUPPORT - PATTERNS STRICTS
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'ticket de support', 'help desk'
                ],
                
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket'
                ],
                
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },

            // PROJETS
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'kick off'
                ],
                
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum'
                ],
                
                weak: ['development', 'phase'],
                exclusions: ['newsletter', 'marketing']
            },

            // RH
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'recrutement', 'recruitment'
                ],
                
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources'
                ],
                
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'marketing']
            },

            // INTERNE
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

            // NOTIFICATIONS
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

            // CC - détection spéciale
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

        // Ajouter les mots-clés des catégories personnalisées s'ils existent
        Object.keys(this.customCategories).forEach(categoryId => {
            if (!this.weightedKeywords[categoryId]) {
                this.weightedKeywords[categoryId] = {
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
        
        // Filtrer les courriers indésirables si activé
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérification CC en priorité si activé
        if (this.shouldDetectCC() && this.isInCC(email)) {
            // Vérifier si ce n'est pas du marketing malgré le CC
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
        
        // Analyse normale
        const allResults = this.analyzeAllCategories(content);
        return this.selectByPriorityWithThreshold(allResults);
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            // Ignorer les catégories inactives (sauf marketing_news et cc qui ont priorité)
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

    // ================================================
    // SÉLECTION PAR PRIORITÉ AVEC SEUIL
    // ================================================
    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Trier par priorité puis par score
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

    // ================================================
    // CALCUL DU SCORE
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Vérifier les exclusions d'abord
        if (keywords.exclusions) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    if (categoryId === 'marketing_news') {
                        totalScore -= 20; // Réduction pour marketing
                    } else {
                        totalScore -= 100; // Forte réduction pour autres
                    }
                }
            }
        }
        
        // Mots absolus (100 points)
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Mots forts (30 points)
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        // Mots faibles (10 points) - seulement si pas de mots absolus
        if (keywords.weak && !hasAbsolute) {
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 10;
                    matches.push({ keyword, type: 'weak', score: 10 });
                }
            }
        }
        
        // Bonus de domaine
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
        
        // Sujet (répété pour augmenter le poids)
        if (email.subject) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(5);
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
        }
        if (email.from?.emailAddress?.name) {
            allText += email.from.emailAddress.name + ' ';
        }
        
        // Destinataires
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
        
        // CC
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
        
        // Corps
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

    // ================================================
    // DÉTECTION SPAM ET CC
    // ================================================
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
    
    // ================================================
    // TEST
    // ================================================
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

    // ================================================
    // MÉTHODES POUR GESTION DES MOTS-CLÉS
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
            this.customCategories[categoryId].keywords = keywords;
            this.saveCustomCategories();
        }

        console.log(`[CategoryManager] Mots-clés mis à jour pour ${categoryId}`);
        
        // Notifier les autres modules
        window.dispatchEvent(new CustomEvent('keywordsUpdated', {
            detail: { categoryId, keywords }
        }));
    }

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    getAllKeywords() {
        return { ...this.weightedKeywords };
    }
}

// Créer l'instance globale
window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v17.1 loaded - Patterns étendus et catégories personnalisées');
