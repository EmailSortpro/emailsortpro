// CategoryManager.js - Version 22.0 - Banque de données simplifiée
// Ce module ne fait que stocker et gérer les catégories et mots-clés
// Pas de priorités, pas d'exclusions - EmailScanner gère toute la logique

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.categoryFilters = {};
        this.changeListeners = new Set();
        
        // Initialisation des données
        this.initializeCategories();
        this.initializeWeightedKeywords();
        this.loadCustomCategories();
        this.loadCategoryFilters();
        
        console.log('[CategoryManager] ✅ Version 22.0 - Banque de données simplifiée');
        console.log('[CategoryManager] 📚 Catégories disponibles:', Object.keys(this.categories).length);
    }

    // ================================================
    // DÉFINITION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                isCustom: false
            },
            
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                isCustom: false
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                isCustom: false
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                isCustom: false
            }
        };
    }

    // ================================================
    // DÉFINITION DES MOTS-CLÉS
    // ================================================
    initializeWeightedKeywords() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'ne souhaites plus recevoir', 'ne souhaite plus recevoir',
                    'recevoir les informations de notre part',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    'clique-ici pour vous désinscrire', 'click here to unsubscribe',
                    'stop receiving emails', 'arrêter les emails',
                    'is live', 'streaming', 'watch now', 'regarder maintenant',
                    'ton récap', 'votre récap', 'récap du mois', 'monthly recap',
                    'résumé du mois', 'monthly summary', 'votre activité',
                    'récap\' du mois', 'recap of the month'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'récap', 'recap', 'summary', 'résumé',
                    'streaming', 'live', 'diffusion'
                ],
                weak: ['update', 'discover', 'new', 'nouveauté', 'découvrir']
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
                weak: ['compte', 'account', 'accès']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed', 'mise a jour requise',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision'
                ],
                weak: ['demande', 'besoin', 'attente', 'request', 'need', 'waiting']
            },

            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion prévue',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'join meeting', 'rejoindre la réunion',
                    'meeting scheduled', 'réunion planifiée'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment', 'agenda',
                    'conférence', 'conference', 'call', 'visio'
                ],
                weak: ['présentation', 'agenda', 'disponible', 'available']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation'
                ],
                weak: ['offre', 'négociation', 'discussion', 'projet']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'n°commande', 'numéro commande', 'order number',
                    'numéro de commande', 'commande n°', 'commande numéro',
                    'livraison commande', 'commande expédiée',
                    'confirmation commande', 'order confirmation',
                    'carte cadeau', 'gift card', 'carte avoir', 'avoir digital',
                    'votre avoir', 'crédit', 'solde disponible',
                    'code d\'utilisation', 'valable jusqu\'au'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'commande', 'order', 'achat', 'vente',
                    'livraison', 'delivery', 'expédition', 'shipping',
                    'prix', 'price', 'coût', 'cost',
                    'avoir', 'crédit', 'remboursement', '€', '

            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement',
                    'document', 'présentation', 'correction'
                ],
                weak: ['development', 'phase', 'étape', 'planning', 'présentation']
            },

            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending'
                ],
                weak: ['previous', 'discussed', 'encore', 'still']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue'
                ],
                weak: ['help', 'aide', 'issue', 'question']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'ressources humaines', 'human resources',
                    'offre d\'emploi', 'job offer', 'recrutement',
                    'poste de', 'nous recrutons', 'candidature pour',
                    'cv', 'curriculum vitae', 'lettre de motivation',
                    'entretien d\'embauche', 'département rh', 'service rh'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources',
                    'contrat', 'paie', 'congés', 'vacation',
                    'emploi', 'job', 'recruitment',
                    'candidature', 'entretien', 'poste'
                ],
                weak: ['employee', 'staff', 'personnel', 'équipe']
            },

            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service',
                    'à tous', 'to all employees'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff', 'équipe',
                    'annonce', 'announcement'
                ],
                weak: ['annonce', 'announcement', 'information', 'update']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'ne_pas_repondre',
                    'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                    'ne_pas_repondre@', 'nepasrepondre@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'notification@', 'notifications@', 'automated@', 'system@',
                    'automatically paused', 'automatiquement mis en pause',
                    'automatic notification', 'notification system',
                    'prise en charge de votre demande', 'demande prise en compte',
                    'bien été prise en compte', 'traiter votre demande'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique', 'alert',
                    'noreply', 'no-reply', 'donotreply',
                    'ne pas répondre', 'prise en compte',
                    'paused', 'inactivity', 'suspended'
                ],
                weak: ['notification', 'alert', 'info', 'status']
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: ['information', 'copie', 'copy', 'cc'],
                weak: ['fyi', 'info']
            }
        };
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
                return { ...defaultSettings, ...parsedSettings };
            }
            
            return defaultSettings;
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
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
                skipDuplicates: true
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

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            this.notifyListeners('settingsChanged', this.settings);
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // API PUBLIQUE - ACCÈS AUX DONNÉES
    // ================================================
    
    // Récupérer toutes les catégories
    getCategories() {
        return { ...this.categories };
    }
    
    // Récupérer une catégorie spécifique
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
    
    // Récupérer tous les mots-clés
    getAllKeywords() {
        return JSON.parse(JSON.stringify(this.weightedKeywords));
    }
    
    // Récupérer les mots-clés d'une catégorie
    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] ? 
            JSON.parse(JSON.stringify(this.weightedKeywords[categoryId])) : 
            { absolute: [], strong: [], weak: [] };
    }
    
    // Récupérer les catégories actives
    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }
    
    // Vérifier si une catégorie est active
    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }
    
    // Récupérer les catégories pré-sélectionnées pour les tâches
    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }
    
    // Récupérer tous les paramètres
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }
    
    // Récupérer les filtres d'une catégorie
    getCategoryFilters(categoryId) {
        return this.categoryFilters[categoryId] || {
            includeDomains: [],
            excludeDomains: [],
            includeEmails: [],
            excludeEmails: []
        };
    }

    // ================================================
    // API PUBLIQUE - MISE À JOUR DES DONNÉES
    // ================================================
    
    // Mettre à jour les paramètres
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
    
    // Mettre à jour les catégories actives
    updateActiveCategories(categories) {
        this.settings.activeCategories = [...categories];
        this.saveSettings();
    }
    
    // Mettre à jour les catégories pré-sélectionnées pour les tâches
    updateTaskPreselectedCategories(categories) {
        this.settings.taskPreselectedCategories = [...categories];
        this.saveSettings();
        return this.settings.taskPreselectedCategories;
    }
    
    // Mettre à jour les mots-clés d'une catégorie
    updateCategoryKeywords(categoryId, keywords) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        // Simplification : pas d'exclusions
        this.weightedKeywords[categoryId] = {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || []
        };
        
        // Si c'est une catégorie personnalisée, sauvegarder
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
            this.saveCustomCategories();
        }
        
        this.notifyListeners('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
    }
    
    // Mettre à jour les filtres d'une catégorie
    updateCategoryFilters(categoryId, filters) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        this.saveCategoryFilters();
        this.notifyListeners('filtersUpdated', { categoryId, filters: this.categoryFilters[categoryId] });
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    
    createCustomCategory(categoryData) {
        const id = this.generateCategoryId(categoryData.name);
        
        const category = {
            id: id,
            name: categoryData.name,
            icon: categoryData.icon || '📂',
            color: categoryData.color || '#6366f1',
            description: categoryData.description || '',
            createdAt: new Date().toISOString(),
            isCustom: true,
            keywords: {
                absolute: categoryData.keywords?.absolute || [],
                strong: categoryData.keywords?.strong || [],
                weak: categoryData.keywords?.weak || []
            }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
        // Initialiser les mots-clés
        this.weightedKeywords[id] = category.keywords;

        this.saveCustomCategories();
        this.notifyListeners('categoryCreated', { categoryId: id, category });
        
        return category;
    }
    
    updateCustomCategory(categoryId, updates) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        if (updates.keywords) {
            this.weightedKeywords[categoryId] = {
                absolute: updates.keywords.absolute || [],
                strong: updates.keywords.strong || [],
                weak: updates.keywords.weak || []
            };
        }

        this.saveCustomCategories();
        this.notifyListeners('categoryUpdated', { categoryId, category: updatedCategory });
        
        return updatedCategory;
    }
    
    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            this.updateTaskPreselectedCategories(
                this.settings.taskPreselectedCategories.filter(id => id !== categoryId)
            );
        }

        // Retirer des catégories actives si présente
        if (this.settings.activeCategories?.includes(categoryId)) {
            this.updateActiveCategories(
                this.settings.activeCategories.filter(id => id !== categoryId)
            );
        }

        delete this.customCategories[categoryId];
        delete this.categories[categoryId];
        delete this.weightedKeywords[categoryId];
        delete this.categoryFilters[categoryId];

        this.saveCustomCategories();
        this.notifyListeners('categoryDeleted', { categoryId });
    }

    // ================================================
    // PERSISTANCE DES DONNÉES
    // ================================================
    
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true
                };
                
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: category.keywords.absolute || [],
                        strong: category.keywords.strong || [],
                        weak: category.keywords.weak || []
                    };
                } else {
                    this.weightedKeywords[id] = {
                        absolute: [],
                        strong: [],
                        weak: []
                    };
                }
            });
            
            console.log('[CategoryManager] Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }
    
    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }
    
    loadCategoryFilters() {
        try {
            const saved = localStorage.getItem('categoryFilters');
            this.categoryFilters = saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement filtres:', error);
            this.categoryFilters = {};
        }
    }
    
    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde filtres:', error);
        }
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION
    // ================================================
    
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => this.changeListeners.delete(callback);
    }
    
    notifyListeners(event, data) {
        this.changeListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification:', error);
            }
        });
        
        // Dispatch événement global
        try {
            window.dispatchEvent(new CustomEvent(event, { 
                detail: { ...data, source: 'CategoryManager' }
            }));
        } catch (error) {
            console.error('[CategoryManager] Erreur dispatch event:', error);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    
    generateCategoryId(name) {
        const base = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = 'custom_' + base;
        let counter = 1;
        
        while (this.categories[id]) {
            id = `custom_${base}_${counter}`;
            counter++;
        }
        
        return id;
    }
    
    // Ajout de mots-clés individuels
    addKeywordToCategory(categoryId, keyword, type = 'strong') {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        if (!['absolute', 'strong', 'weak'].includes(type)) {
            type = 'strong';
        }

        if (!this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = { absolute: [], strong: [], weak: [] };
        }

        const normalizedKeyword = keyword.toLowerCase().trim();
        if (!this.weightedKeywords[categoryId][type].includes(normalizedKeyword)) {
            this.weightedKeywords[categoryId][type].push(normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    removeKeywordFromCategory(categoryId, keyword, type) {
        if (!this.categories[categoryId] || !this.weightedKeywords[categoryId]) {
            return;
        }

        if (this.weightedKeywords[categoryId][type]) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            this.weightedKeywords[categoryId][type] = this.weightedKeywords[categoryId][type]
                .filter(k => k !== normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }
    
    // Statistiques
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            standardCategories: Object.keys(this.categories).filter(id => !this.categories[id].isCustom).length,
            customCategories: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            preselectedCategories: this.settings.taskPreselectedCategories?.length || 0,
            totalKeywords: 0
        };
        
        Object.values(this.weightedKeywords).forEach(keywords => {
            stats.totalKeywords += (keywords.absolute?.length || 0) + 
                                  (keywords.strong?.length || 0) + 
                                  (keywords.weak?.length || 0);
        });
        
        return stats;
    }
    
    // Export/Import des données
    exportData() {
        return {
            version: '22.0',
            exportDate: new Date().toISOString(),
            settings: this.settings,
            customCategories: this.customCategories,
            categoryFilters: this.categoryFilters,
            customKeywords: Object.entries(this.weightedKeywords)
                .filter(([id]) => this.customCategories[id])
                .reduce((acc, [id, keywords]) => {
                    acc[id] = keywords;
                    return acc;
                }, {})
        };
    }
    
    importData(data) {
        try {
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
                this.saveSettings();
            }
            
            if (data.customCategories) {
                Object.entries(data.customCategories).forEach(([id, category]) => {
                    this.customCategories[id] = category;
                    this.categories[id] = { ...category, isCustom: true };
                });
                this.saveCustomCategories();
            }
            
            if (data.customKeywords) {
                Object.entries(data.customKeywords).forEach(([id, keywords]) => {
                    if (this.categories[id]) {
                        this.weightedKeywords[id] = keywords;
                    }
                });
            }
            
            if (data.categoryFilters) {
                this.categoryFilters = data.categoryFilters;
                this.saveCategoryFilters();
            }
            
            console.log('[CategoryManager] Import réussi');
            return true;
        } catch (error) {
            console.error('[CategoryManager] Erreur import:', error);
            return false;
        }
    }
    
    // Nettoyage
    destroy() {
        this.changeListeners.clear();
        console.log('[CategoryManager] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

// Export pour les tests
window.CategoryManager = CategoryManager;

console.log('✅ CategoryManager v22.0 loaded - Banque de données simplifiée');
console.log('📚 Pas de priorités, pas d\'exclusions - EmailScanner gère toute la logique');

                ],
                weak: ['euro', 'dollar', 'prix', 'payment', 'transaction']
            },

            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement',
                    'document', 'présentation', 'correction'
                ],
                weak: ['development', 'phase', 'étape', 'planning', 'présentation']
            },

            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending'
                ],
                weak: ['previous', 'discussed', 'encore', 'still']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue'
                ],
                weak: ['help', 'aide', 'issue', 'question']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'ressources humaines', 'human resources',
                    'offre d\'emploi', 'job offer', 'recrutement'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources',
                    'contrat', 'paie', 'congés', 'vacation',
                    'emploi', 'job', 'recruitment'
                ],
                weak: ['employee', 'staff', 'personnel', 'équipe']
            },

            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service',
                    'à tous', 'to all employees'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff', 'équipe',
                    'annonce', 'announcement'
                ],
                weak: ['annonce', 'announcement', 'information', 'update']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'no-reply@', 'donotreply@'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique', 'alert'
                ],
                weak: ['notification', 'alert', 'info']
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: ['information', 'copie', 'copy', 'cc'],
                weak: ['fyi', 'info']
            }
        };
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
                return { ...defaultSettings, ...parsedSettings };
            }
            
            return defaultSettings;
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
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
                skipDuplicates: true
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

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            this.notifyListeners('settingsChanged', this.settings);
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // API PUBLIQUE - ACCÈS AUX DONNÉES
    // ================================================
    
    // Récupérer toutes les catégories
    getCategories() {
        return { ...this.categories };
    }
    
    // Récupérer une catégorie spécifique
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
    
    // Récupérer tous les mots-clés
    getAllKeywords() {
        return JSON.parse(JSON.stringify(this.weightedKeywords));
    }
    
    // Récupérer les mots-clés d'une catégorie
    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] ? 
            JSON.parse(JSON.stringify(this.weightedKeywords[categoryId])) : 
            { absolute: [], strong: [], weak: [] };
    }
    
    // Récupérer les catégories actives
    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }
    
    // Vérifier si une catégorie est active
    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }
    
    // Récupérer les catégories pré-sélectionnées pour les tâches
    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }
    
    // Récupérer tous les paramètres
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }
    
    // Récupérer les filtres d'une catégorie
    getCategoryFilters(categoryId) {
        return this.categoryFilters[categoryId] || {
            includeDomains: [],
            excludeDomains: [],
            includeEmails: [],
            excludeEmails: []
        };
    }

    // ================================================
    // API PUBLIQUE - MISE À JOUR DES DONNÉES
    // ================================================
    
    // Mettre à jour les paramètres
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
    
    // Mettre à jour les catégories actives
    updateActiveCategories(categories) {
        this.settings.activeCategories = [...categories];
        this.saveSettings();
    }
    
    // Mettre à jour les catégories pré-sélectionnées pour les tâches
    updateTaskPreselectedCategories(categories) {
        this.settings.taskPreselectedCategories = [...categories];
        this.saveSettings();
        return this.settings.taskPreselectedCategories;
    }
    
    // Mettre à jour les mots-clés d'une catégorie
    updateCategoryKeywords(categoryId, keywords) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        // Simplification : pas d'exclusions
        this.weightedKeywords[categoryId] = {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || []
        };
        
        // Si c'est une catégorie personnalisée, sauvegarder
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
            this.saveCustomCategories();
        }
        
        this.notifyListeners('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
    }
    
    // Mettre à jour les filtres d'une catégorie
    updateCategoryFilters(categoryId, filters) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        this.saveCategoryFilters();
        this.notifyListeners('filtersUpdated', { categoryId, filters: this.categoryFilters[categoryId] });
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    
    createCustomCategory(categoryData) {
        const id = this.generateCategoryId(categoryData.name);
        
        const category = {
            id: id,
            name: categoryData.name,
            icon: categoryData.icon || '📂',
            color: categoryData.color || '#6366f1',
            description: categoryData.description || '',
            createdAt: new Date().toISOString(),
            isCustom: true,
            keywords: {
                absolute: categoryData.keywords?.absolute || [],
                strong: categoryData.keywords?.strong || [],
                weak: categoryData.keywords?.weak || []
            }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
        // Initialiser les mots-clés
        this.weightedKeywords[id] = category.keywords;

        this.saveCustomCategories();
        this.notifyListeners('categoryCreated', { categoryId: id, category });
        
        return category;
    }
    
    updateCustomCategory(categoryId, updates) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        if (updates.keywords) {
            this.weightedKeywords[categoryId] = {
                absolute: updates.keywords.absolute || [],
                strong: updates.keywords.strong || [],
                weak: updates.keywords.weak || []
            };
        }

        this.saveCustomCategories();
        this.notifyListeners('categoryUpdated', { categoryId, category: updatedCategory });
        
        return updatedCategory;
    }
    
    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            this.updateTaskPreselectedCategories(
                this.settings.taskPreselectedCategories.filter(id => id !== categoryId)
            );
        }

        // Retirer des catégories actives si présente
        if (this.settings.activeCategories?.includes(categoryId)) {
            this.updateActiveCategories(
                this.settings.activeCategories.filter(id => id !== categoryId)
            );
        }

        delete this.customCategories[categoryId];
        delete this.categories[categoryId];
        delete this.weightedKeywords[categoryId];
        delete this.categoryFilters[categoryId];

        this.saveCustomCategories();
        this.notifyListeners('categoryDeleted', { categoryId });
    }

    // ================================================
    // PERSISTANCE DES DONNÉES
    // ================================================
    
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true
                };
                
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: category.keywords.absolute || [],
                        strong: category.keywords.strong || [],
                        weak: category.keywords.weak || []
                    };
                } else {
                    this.weightedKeywords[id] = {
                        absolute: [],
                        strong: [],
                        weak: []
                    };
                }
            });
            
            console.log('[CategoryManager] Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }
    
    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }
    
    loadCategoryFilters() {
        try {
            const saved = localStorage.getItem('categoryFilters');
            this.categoryFilters = saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement filtres:', error);
            this.categoryFilters = {};
        }
    }
    
    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde filtres:', error);
        }
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION
    // ================================================
    
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => this.changeListeners.delete(callback);
    }
    
    notifyListeners(event, data) {
        this.changeListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification:', error);
            }
        });
        
        // Dispatch événement global
        try {
            window.dispatchEvent(new CustomEvent(event, { 
                detail: { ...data, source: 'CategoryManager' }
            }));
        } catch (error) {
            console.error('[CategoryManager] Erreur dispatch event:', error);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    
    generateCategoryId(name) {
        const base = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = 'custom_' + base;
        let counter = 1;
        
        while (this.categories[id]) {
            id = `custom_${base}_${counter}`;
            counter++;
        }
        
        return id;
    }
    
    // Ajout de mots-clés individuels
    addKeywordToCategory(categoryId, keyword, type = 'strong') {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        if (!['absolute', 'strong', 'weak'].includes(type)) {
            type = 'strong';
        }

        if (!this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = { absolute: [], strong: [], weak: [] };
        }

        const normalizedKeyword = keyword.toLowerCase().trim();
        if (!this.weightedKeywords[categoryId][type].includes(normalizedKeyword)) {
            this.weightedKeywords[categoryId][type].push(normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    removeKeywordFromCategory(categoryId, keyword, type) {
        if (!this.categories[categoryId] || !this.weightedKeywords[categoryId]) {
            return;
        }

        if (this.weightedKeywords[categoryId][type]) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            this.weightedKeywords[categoryId][type] = this.weightedKeywords[categoryId][type]
                .filter(k => k !== normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }
    
    // Statistiques
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            standardCategories: Object.keys(this.categories).filter(id => !this.categories[id].isCustom).length,
            customCategories: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            preselectedCategories: this.settings.taskPreselectedCategories?.length || 0,
            totalKeywords: 0
        };
        
        Object.values(this.weightedKeywords).forEach(keywords => {
            stats.totalKeywords += (keywords.absolute?.length || 0) + 
                                  (keywords.strong?.length || 0) + 
                                  (keywords.weak?.length || 0);
        });
        
        return stats;
    }
    
    // Export/Import des données
    exportData() {
        return {
            version: '22.0',
            exportDate: new Date().toISOString(),
            settings: this.settings,
            customCategories: this.customCategories,
            categoryFilters: this.categoryFilters,
            customKeywords: Object.entries(this.weightedKeywords)
                .filter(([id]) => this.customCategories[id])
                .reduce((acc, [id, keywords]) => {
                    acc[id] = keywords;
                    return acc;
                }, {})
        };
    }
    
    importData(data) {
        try {
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
                this.saveSettings();
            }
            
            if (data.customCategories) {
                Object.entries(data.customCategories).forEach(([id, category]) => {
                    this.customCategories[id] = category;
                    this.categories[id] = { ...category, isCustom: true };
                });
                this.saveCustomCategories();
            }
            
            if (data.customKeywords) {
                Object.entries(data.customKeywords).forEach(([id, keywords]) => {
                    if (this.categories[id]) {
                        this.weightedKeywords[id] = keywords;
                    }
                });
            }
            
            if (data.categoryFilters) {
                this.categoryFilters = data.categoryFilters;
                this.saveCategoryFilters();
            }
            
            console.log('[CategoryManager] Import réussi');
            return true;
        } catch (error) {
            console.error('[CategoryManager] Erreur import:', error);
            return false;
        }
    }
    
    // Nettoyage
    destroy() {
        this.changeListeners.clear();
        console.log('[CategoryManager] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

// Export pour les tests
window.CategoryManager = CategoryManager;

console.log('✅ CategoryManager v22.0 loaded - Banque de données simplifiée');
console.log('📚 Pas de priorités, pas d\'exclusions - EmailScanner gère toute la logique');
