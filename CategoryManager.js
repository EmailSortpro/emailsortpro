// CategoryManager.js - Version 21.0 - Optimisation Gmail et Recrutement renforcé

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
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        
        // Démarrer la synchronisation automatique
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 21.0 - Optimisation Gmail et Recrutement');
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
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

    // ================================================
    // MÉTHODES DE NOTIFICATION
    // ================================================
    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        // EmailScanner - PRIORITÉ ABSOLUE
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'activeCategories':
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
    // API PUBLIQUE POUR CHANGEMENTS
    // ================================================
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

    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
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
    // MÉTHODES PUBLIQUES
    // ================================================
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

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        console.log('[CategoryManager] 🔄 Cache des catégories tâches invalidé');
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            return allCategories;
        }
        return [...this.settings.activeCategories];
    }

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
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
                name: 'RH & Recrutement',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et recrutement',
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
    // MOTS-CLÉS OPTIMISÉS POUR GMAIL ET RECRUTEMENT
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                absolute: [
                    // Désabonnement - patterns Gmail spécifiques
                    'unsubscribe', 'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'manage preferences', 'gérer vos préférences', 'email preferences',
                    'update your preferences', 'communication preferences',
                    'stop receiving', 'ne plus recevoir', 'arrêter les emails',
                    'mailing list', 'liste de diffusion',
                    // Gmail specific
                    'manage your subscription', 'update subscription',
                    'email settings', 'notification settings',
                    'marketing emails', 'promotional emails',
                    'this email was sent to', 'you are receiving this',
                    'click here to unsubscribe', 'unsubscribe from this list',
                    // Promotions
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'exclusive deal', 'flash sale', 'black friday',
                    'cyber monday', 'réduction', 'discount'
                ],
                strong: [
                    'newsletter', 'campaign', 'marketing', 'promotional',
                    'deal', 'offer', 'sale', 'discount', 'coupon',
                    'exclusive', 'special', 'limited', 'new arrival',
                    'boutique', 'shopping', 'shop now', 'buy now',
                    'free shipping', 'livraison gratuite'
                ],
                weak: ['update', 'news', 'nouveauté', 'discover', 'announcement'],
                exclusions: []
            },

            security: {
                absolute: [
                    // Gmail security patterns
                    'security alert', 'alerte de sécurité', 'suspicious activity',
                    'new sign-in', 'nouvelle connexion', 'sign-in attempt',
                    'verification code', 'code de vérification', 'verify your identity',
                    'two-factor authentication', '2fa', 'two-step verification',
                    'password reset', 'reset your password', 'change password',
                    'account recovery', 'recover your account',
                    // Gmail specific
                    'google security', 'critical security alert',
                    'someone has your password', 'review recent activity',
                    'secure your account', 'unusual activity'
                ],
                strong: [
                    'security', 'sécurité', 'authentication', 'verify',
                    'password', 'mot de passe', 'login', 'sign in',
                    'account', 'compte', 'suspicious', 'alert'
                ],
                weak: ['access', 'activity', 'review', 'check'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'complete by',
                    'deadline', 'due date', 'échéance', 'due by',
                    'urgent action', 'urgent request', 'asap',
                    'needs your attention', 'requires your attention',
                    'pending approval', 'awaiting approval', 'please review',
                    'please respond', 'response required', 'reply by',
                    // Gmail task patterns
                    'to-do', 'todo', 'task assigned', 'assigned to you',
                    'complete this', 'finish this', 'submit by'
                ],
                strong: [
                    'urgent', 'priority', 'important', 'critical',
                    'complete', 'finish', 'submit', 'review',
                    'approve', 'deadline', 'overdue', 'pending',
                    'action', 'task', 'assignment', 'deliverable'
                ],
                weak: ['request', 'need', 'waiting', 'follow up'],
                exclusions: ['newsletter', 'marketing', 'unsubscribe']
            },

            meetings: {
                absolute: [
                    // Google Calendar patterns
                    'invitation:', 'calendar invitation', 'meeting invitation',
                    'you have been invited', 'invites you to',
                    'google meet', 'join with google meet', 'meet.google.com',
                    'zoom meeting', 'teams meeting', 'webex meeting',
                    'schedule a meeting', 'book a meeting', 'meeting request',
                    'proposed time', 'suggested times', 'when2meet',
                    // French patterns
                    'invitation à', 'réunion prévue', 'rendez-vous'
                ],
                strong: [
                    'meeting', 'réunion', 'calendar', 'agenda',
                    'appointment', 'rendez-vous', 'schedule',
                    'conference', 'call', 'video call', 'standup'
                ],
                weak: ['time', 'date', 'available', 'slot'],
                exclusions: ['newsletter', 'marketing']
            },

            commercial: {
                absolute: [
                    'quotation', 'devis', 'proposal', 'proposition commerciale',
                    'contract', 'contrat', 'purchase order', 'bon de commande',
                    'opportunity', 'opportunité', 'lead', 'prospect',
                    'deal closed', 'deal won', 'new customer',
                    'rfp', 'rfq', 'tender', 'appel d\'offres'
                ],
                strong: [
                    'client', 'customer', 'business', 'commercial',
                    'sales', 'vente', 'deal', 'opportunity',
                    'quote', 'pricing', 'negotiation', 'close'
                ],
                weak: ['offer', 'discussion', 'partnership', 'collaboration'],
                exclusions: ['job', 'career', 'recruitment', 'cv', 'resume']
            },

            finance: {
                absolute: [
                    'invoice', 'facture', 'payment due', 'payment reminder',
                    'bank statement', 'relevé bancaire', 'transaction',
                    'payment received', 'payment confirmation',
                    'wire transfer', 'virement', 'refund', 'remboursement',
                    // E-commerce patterns Gmail
                    'order confirmation', 'order #', 'order number',
                    'your order', 'commande n°', 'shipping confirmation',
                    'tracking number', 'delivered', 'out for delivery'
                ],
                strong: [
                    'payment', 'paiement', 'invoice', 'bill',
                    'amount', 'montant', 'total', 'balance',
                    'transaction', 'bank', 'financial', 'receipt'
                ],
                weak: ['euro', 'dollar', 'price', 'cost'],
                exclusions: ['newsletter', 'marketing', 'job offer']
            },

            project: {
                absolute: [
                    'project update', 'projet update', 'milestone',
                    'sprint planning', 'sprint review', 'retrospective',
                    'jira', 'asana', 'trello', 'monday.com',
                    'gantt', 'roadmap', 'timeline', 'deliverable',
                    'project status', 'status report', 'progress report',
                    // Dev patterns
                    'pull request', 'merge request', 'code review',
                    'github', 'gitlab', 'bitbucket'
                ],
                strong: [
                    'project', 'projet', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'development',
                    'release', 'deployment', 'feature', 'task'
                ],
                weak: ['update', 'progress', 'status', 'report'],
                exclusions: ['job', 'career', 'hiring']
            },

            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'friendly reminder',
                    'follow up', 'following up', 'just following up',
                    'gentle reminder', 'quick reminder', 'fyi',
                    'as discussed', 'comme convenu', 'as per our',
                    'haven\'t heard back', 'waiting for your',
                    'any update on', 'circling back'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'ping',
                    'nudge', 'chase', 'pending', 'waiting',
                    'overdue', 'outstanding', 'awaiting'
                ],
                weak: ['previous', 'earlier', 'last', 'encore'],
                exclusions: ['newsletter', 'marketing', 'automated']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'case #', 'case number',
                    'support ticket', 'support request', 'incident',
                    'zendesk', 'freshdesk', 'intercom', 'helpdesk',
                    'issue resolved', 'ticket closed', 'ticket updated',
                    'customer support', 'technical support'
                ],
                strong: [
                    'support', 'ticket', 'issue', 'problem',
                    'bug', 'error', 'help', 'assistance',
                    'troubleshooting', 'resolution', 'solved'
                ],
                weak: ['question', 'help', 'assist', 'contact'],
                exclusions: ['job support', 'career support']
            },

            hr: {
                absolute: [
                    // RH classique
                    'bulletin de paie', 'payslip', 'salary slip',
                    'congés', 'leave request', 'time off request',
                    'expense report', 'note de frais',
                    'performance review', 'entretien annuel',
                    'employee handbook', 'manuel employé',
                    // RECRUTEMENT RENFORCÉ
                    'job offer', 'offre d\'emploi', 'job posting',
                    'we are hiring', 'nous recrutons', 'join our team',
                    'career opportunity', 'opportunité de carrière',
                    'position available', 'poste à pourvoir',
                    'job application', 'candidature', 'your application',
                    'interview invitation', 'entretien', 'phone screening',
                    'recruitment', 'recrutement', 'talent acquisition',
                    'cv received', 'resume received', 'application received',
                    'next steps', 'prochaines étapes', 'hiring process',
                    'job description', 'fiche de poste',
                    // Plateformes de recrutement
                    'linkedin job', 'indeed', 'welcome to the jungle',
                    'glassdoor', 'angellist', 'hired', 'triplebyte'
                ],
                strong: [
                    'hr', 'rh', 'human resources', 'recruitment',
                    'hiring', 'job', 'career', 'emploi', 'poste',
                    'interview', 'entretien', 'candidate', 'candidat',
                    'application', 'apply', 'cv', 'resume',
                    'salary', 'benefits', 'onboarding', 'offboarding'
                ],
                weak: ['team', 'culture', 'people', 'talent'],
                exclusions: ['newsletter', 'marketing', 'unsubscribe', 'update your preferences']
            },

            internal: {
                absolute: [
                    'all staff', 'all hands', 'company announcement',
                    'team announcement', 'important announcement',
                    'memo', 'internal memo', 'company update',
                    'org change', 'organizational change',
                    'new hire', 'welcome aboard', 'farewell'
                ],
                strong: [
                    'internal', 'company', 'organization', 'team',
                    'staff', 'employee', 'announcement', 'update',
                    'culture', 'values', 'townhall', 'all-hands'
                ],
                weak: ['info', 'news', 'update', 'change'],
                exclusions: ['external', 'client', 'customer', 'marketing']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'no-reply@', 'donotreply@', 'automated message',
                    'system notification', 'automatic notification',
                    'this is an automated', 'ceci est un message automatique'
                ],
                strong: [
                    'automated', 'automatic', 'system', 'notification',
                    'alert', 'bot', 'auto-generated', 'triggered'
                ],
                weak: ['notification', 'info', 'update'],
                exclusions: ['urgent', 'action required', 'please reply']
            },

            cc: {
                absolute: [
                    'fyi', 'for your information', 'pour information',
                    'cc:', 'cc\'d', 'copied', 'in copy',
                    'keeping you in the loop', 'pour info',
                    'just so you know', 'heads up'
                ],
                strong: ['information', 'awareness', 'loop', 'cc'],
                weak: ['fyi', 'info', 'update'],
                exclusions: ['action required', 'please respond', 'urgent']
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés Gmail et Recrutement optimisés');
    }

    // ================================================
    // ANALYSE EMAIL OPTIMISÉE POUR GMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Détection Gmail spécifique
        const isGmail = this.isGmailEmail(email);
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email, isGmail);
        
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        if (this.isPersonalEmail(content, email)) {
            if (this.categories.personal || this.customCategories.personal) {
                return {
                    category: 'personal',
                    score: 100,
                    confidence: 0.95,
                    matchedPatterns: [{ keyword: 'personal_email_detected', type: 'absolute', score: 100 }],
                    hasAbsolute: true,
                    isPersonal: true
                };
            } else {
                return { category: 'excluded', score: 0, confidence: 0, isExcluded: true, reason: 'personal' };
            }
        }
        
        // Détection spéciale Gmail pour désabonnement
        if (isGmail && this.hasGmailUnsubscribeLink(email, content)) {
            return {
                category: 'marketing_news',
                score: 150,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'gmail_unsubscribe_detected', type: 'absolute', score: 150 }],
                hasAbsolute: true,
                gmailDetected: true,
                hasUnsubscribeLink: true
            };
        }
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            const marketingCheck = this.analyzeCategory(content, this.weightedKeywords.marketing_news);
            if (marketingCheck.score >= 80) {
                return {
                    category: 'marketing_news',
                    score: marketingCheck.total,
                    confidence: this.calculateConfidence(marketingCheck),
                    matchedPatterns: marketingCheck.matches,
                    hasAbsolute: marketingCheck.hasAbsolute,
                    originallyCC: true,
                    gmailDetected: isGmail
                };
            }
            
            const allResults = this.analyzeAllCategories(content, isGmail);
            const bestNonCC = Object.values(allResults)
                .filter(r => r.category !== 'cc')
                .sort((a, b) => b.score - a.score)[0];
            
            if (bestNonCC && bestNonCC.score >= 100 && bestNonCC.hasAbsolute) {
                return {
                    category: bestNonCC.category,
                    score: bestNonCC.score,
                    confidence: bestNonCC.confidence,
                    matchedPatterns: bestNonCC.matches,
                    hasAbsolute: bestNonCC.hasAbsolute,
                    isCC: true,
                    gmailDetected: isGmail
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                isCC: true,
                gmailDetected: isGmail
            };
        }
        
        const allResults = this.analyzeAllCategories(content, isGmail);
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
        if (!selectedResult || selectedResult.category === 'other' || selectedResult.score === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched',
                gmailDetected: isGmail
            };
        }
        
        return { ...selectedResult, gmailDetected: isGmail };
    }

    // ================================================
    // DÉTECTION SPÉCIFIQUE GMAIL
    // ================================================
    isGmailEmail(email) {
        // Vérifier le provider
        if (email.provider === 'gmail' || email.provider === 'google') {
            return true;
        }
        
        // Vérifier les headers Gmail
        if (email.internetMessageHeaders) {
            const hasGmailHeader = email.internetMessageHeaders.some(header => 
                header.name.toLowerCase().includes('x-google') ||
                header.name.toLowerCase().includes('x-gm-')
            );
            if (hasGmailHeader) return true;
        }
        
        // Vérifier le domaine expéditeur
        const fromDomain = this.extractDomain(email.from?.emailAddress?.address);
        if (fromDomain === 'gmail.com' || fromDomain === 'googlemail.com') {
            return true;
        }
        
        return false;
    }

    hasGmailUnsubscribeLink(email, content) {
        // Headers List-Unsubscribe Gmail
        if (email.internetMessageHeaders) {
            const unsubHeader = email.internetMessageHeaders.find(h => 
                h.name.toLowerCase() === 'list-unsubscribe'
            );
            if (unsubHeader) return true;
        }
        
        // Patterns spécifiques Gmail dans le contenu
        const gmailUnsubPatterns = [
            'unsubscribe from this list',
            'manage your subscription',
            'update your email preferences',
            'email settings',
            'communication preferences',
            'stop receiving these emails',
            'opt out of future emails'
        ];
        
        const textLower = content.text.toLowerCase();
        return gmailUnsubPatterns.some(pattern => textLower.includes(pattern));
    }

    // ================================================
    // EXTRACTION CONTENU OPTIMISÉE
    // ================================================
    extractCompleteContent(email, isGmail = false) {
        let allText = '';
        let subject = '';
        
        // Traitement du sujet avec poids élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(isGmail ? 15 : 10);
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(3);
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(3);
        }
        
        // Labels Gmail
        if (isGmail && email.labelIds) {
            email.labelIds.forEach(label => {
                allText += label + ' ';
            });
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
            
            // Extraction spécifique Gmail
            if (isGmail) {
                // Extraire les liens
                const links = email.body.content.match(/href="([^"]+)"/g);
                if (links) {
                    links.forEach(link => {
                        if (link.includes('unsubscribe') || link.includes('preferences')) {
                            allText += ' unsubscribe_link_detected ';
                        }
                    });
                }
            }
        }
        
        // Snippet Gmail
        if (email.snippet) {
            allText += email.snippet + ' ';
        }
        
        // Headers Gmail importants
        if (isGmail && email.payload?.headers) {
            const importantHeaders = ['Subject', 'From', 'List-Id', 'List-Unsubscribe'];
            email.payload.headers.forEach(header => {
                if (importantHeaders.includes(header.name)) {
                    allText += header.value + ' ';
                }
            });
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            rawSubject: email.subject || '',
            isGmail: isGmail
        };
    }

    // ================================================
    // CALCUL DES SCORES OPTIMISÉ
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Bonus Gmail pour certaines catégories
        if (content.isGmail) {
            const gmailBonusCategories = {
                'marketing_news': 20,
                'security': 15,
                'meetings': 10,
                'hr': 15
            };
            
            if (gmailBonusCategories[categoryId]) {
                totalScore += gmailBonusCategories[categoryId];
                matches.push({ 
                    keyword: 'gmail_bonus', 
                    type: 'bonus', 
                    score: gmailBonusCategories[categoryId] 
                });
            }
        }
        
        // Traiter les exclusions
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
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
        
        // Mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 40;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong_matches', type: 'bonus', score: 30 });
            }
        }
        
        // Mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
            
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        // Bonus de domaine
        this.applyDomainBonus(content, categoryId, matches, totalScore);
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    applyDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['google.com', 'accounts.google.com', 'security.google.com'],
            finance: ['paypal.com', 'stripe.com', 'amazon.com', 'shopify.com'],
            marketing_news: ['mailchimp.com', 'sendinblue.com', 'getresponse.com'],
            meetings: ['calendar.google.com', 'zoom.us', 'teams.microsoft.com'],
            hr: ['linkedin.com', 'indeed.com', 'glassdoor.com', 'workday.com'],
            project: ['github.com', 'gitlab.com', 'jira.atlassian.com', 'asana.com']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = 40;
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
    isPersonalEmail(content, email) {
        const personalIndicators = [
            'papa', 'maman', 'mamie', 'papy', 'papi',
            'chéri', 'chérie', 'mon amour', 'ma chérie',
            'bises', 'bisous', 'gros bisous', 'je t\'embrasse',
            'famille', 'familial', 'personnel', 'personal'
        ];
        
        const professionalCounterIndicators = [
            'ressources humaines', 'human resources', 'rh',
            'contrat', 'contract', 'entreprise', 'company',
            'professionnel', 'professional', 'business'
        ];
        
        const text = content.text.toLowerCase();
        
        let personalScore = 0;
        personalIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        });
        
        let professionalScore = 0;
        professionalCounterIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                professionalScore += 10;
            }
        });
        
        return personalScore > 20 && professionalScore < 10;
    }

    isMainRecipient(email) {
        if (!email.toRecipients || !Array.isArray(email.toRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.toRecipients.length > 0;
        }
        
        return email.toRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            return false;
        }
        
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        return isInCCList && !isInToList;
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
            if (window.authService && typeof window.authService.getCurrentUser === 'function') {
                const user = window.authService.getCurrentUser();
                if (user) {
                    return user.email || user.userPrincipalName || user.username;
                }
            }
            
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur:', e);
        }
        return null;
    }

    analyzeAllCategories(content, isGmail = false) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        const customCategoryIds = Object.keys(this.customCategories);
        
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.weightedKeywords),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['marketing_news', 'cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            if (!this.categories[categoryId]) {
                console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} non trouvée`);
                continue;
            }
            
            let keywords = this.weightedKeywords[categoryId];
            
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                    this.weightedKeywords[categoryId] = keywords;
                }
            }
            
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categories[categoryId]?.priority || 50,
                isCustom: isCustom
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
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                return b.score - a.score;
            });
        
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
            hasAbsolute: false,
            reason: 'below_threshold'
        };
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[éèêëÉÈÊË]/gi, 'e')
            .replace(/[àâäÀÂÄ]/gi, 'a')
            .replace(/[ùûüÙÛÜ]/gi, 'u')
            .replace(/[çÇ]/gi, 'c')
            .replace(/[îïÎÏ]/gi, 'i')
            .replace(/[ôöÔÖ]/gi, 'o')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const normalizedKeyword = keyword.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[éèêëÉÈÊË]/gi, 'e')
            .replace(/[àâäÀÂÄ]/gi, 'a')
            .replace(/[ùûüÙÛÜ]/gi, 'u')
            .replace(/[çÇ]/gi, 'c')
            .replace(/[îïÎÏ]/gi, 'i')
            .replace(/[ôöÔÖ]/gi, 'o')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        
        return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        
        // Gmail spam labels
        if (email.labelIds && Array.isArray(email.labelIds)) {
            const hasSpamLabel = email.labelIds.some(label => 
                label.toLowerCase().includes('spam') ||
                label.toLowerCase().includes('junk')
            );
            if (hasSpamLabel) return true;
        }
        
        return false;
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
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

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    // ================================================
    // MÉTHODES PUBLIQUES RESTANTES
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
        if (categoryId === 'excluded') {
            return { id: 'excluded', name: 'Exclu', icon: '🚫', color: '#6b7280' };
        }
        return this.categories[categoryId] || null;
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
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
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}):`);
                console.log(`  - Priorité: ${category.priority || 30}`);
                console.log(`  - Mots-clés: ${totalKeywords}`);
                
                if (totalKeywords === 0) {
                    console.warn(`  ⚠️ AUCUN MOT-CLÉ - La catégorie ne pourra pas détecter d'emails!`);
                }
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
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

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') {
                return;
            }
            
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
        
        console.log('[CategoryManager] Event listeners configurés (anti-boucle)');
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

    cleanup() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        this.syncQueue = [];
        this.changeListeners.clear();
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        
        console.log('[CategoryManager] 🧹 Nettoyage effectué');
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

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v21.0...');
window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v21.0 loaded - Optimisation Gmail et Recrutement!');
