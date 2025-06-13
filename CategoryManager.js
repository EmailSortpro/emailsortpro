// CategoryManager.js - Version 17.0 - Système unifié et synchronisé

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        this.initializeCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        
        console.log('[CategoryManager] ✅ Version 17.0 - Système unifié initialisé');
    }

    // ================================================
    // GESTION DES PARAMÈTRES CENTRALISÉE
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = {
                activeCategories: null, // null = toutes actives par défaut
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
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
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
    // SYSTÈME DE DÉTECTION AVEC MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - PRIORITÉ MAXIMALE
            marketing_news: {
                absolute: [
                    // DÉSINSCRIPTION - CRITÈRE CLÉ
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception',
                    'email preferences', 'préférences email',
                    'ne plus recevoir', 'stop emails',
                    
                    // NEWSLETTERS EXPLICITES
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous est envoyé', 'vous recevez cet email',
                    
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
                    'new collection', 'nouvelle collection'
                ],
                
                strong: [
                    // Français
                    'promo', 'promotion', 'soldes', 'réduction', 'remise',
                    'newsletter', 'mailing', 'campagne', 'marketing',
                    'abonné', 'abonnement', 'désinscription', 'désabonner',
                    'exclusif', 'exclusivité', 'spécial', 'limitée', 'nouveau',
                    'collection', 'boutique', 'magasin', 'acheter',
                    'découvrir', 'explorer', 'parcourir',
                    
                    // Anglais
                    'deal', 'offer', 'sale', 'discount', 'save',
                    'campaign', 'subscriber', 'unsubscribe', 'opt-out',
                    'exclusive', 'special', 'limited', 'new', 'fresh',
                    'shop', 'store', 'buy', 'purchase', 'order',
                    'discover', 'explore', 'browse', 'view'
                ],
                
                weak: [
                    'update', 'news', 'info', 'information',
                    'discover', 'new', 'latest', 'recent'
                ],
                exclusions: []
            },

            // SÉCURITÉ - PATTERNS STRICTS (Français + Anglais)
            security: {
                absolute: [
                    // ALERTES DE CONNEXION (Français)
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'quelqu\'un s\'est connecté', 'connexion à votre compte',
                    'tentative de connexion', 'connexion suspecte', 'connexion inhabituelle',
                    'activité suspecte', 'activité inhabituelle', 'activité de connexion',
                    'connexion détectée', 'accès à votre compte', 'accès détecté',
                    'nouvelle session', 'session ouverte', 'ouverture de session',
                    
                    // ALERTES DE CONNEXION (Anglais)
                    'suspicious activity', 'login alert', 'sign-in alert',
                    'new sign-in', 'sign in detected', 'login detected',
                    'connection detected', 'unusual activity', 'suspicious login',
                    'account accessed', 'new login', 'recent login',
                    'login attempt', 'sign-in attempt', 'access attempt',
                    'session started', 'new session', 'account activity',
                    
                    // CODES ET AUTHENTIFICATION (Français)
                    'code de vérification', 'code de sécurité', 'code d\'authentification',
                    'code d\'accès', 'code temporaire', 'code à usage unique',
                    'double authentification', 'authentification à deux facteurs',
                    'vérification en deux étapes', 'validation en deux étapes',
                    'authentification forte', 'sécurité renforcée',
                    
                    // CODES ET AUTHENTIFICATION (Anglais)
                    'verification code', 'security code', 'authentication code',
                    'two-factor', '2fa', 'two-step verification', 'two-step authentication',
                    'multi-factor authentication', 'mfa', 'one-time password', 'otp',
                    'access code', 'temporary code', 'verification pin',
                    
                    // RÉINITIALISATION (Français)
                    'réinitialisation mot de passe', 'réinitialisation du mot de passe',
                    'changer votre mot de passe', 'modifier votre mot de passe',
                    'nouveau mot de passe', 'mot de passe oublié',
                    'récupération de compte', 'récupération du compte',
                    
                    // RÉINITIALISATION (Anglais)
                    'password reset', 'reset your password', 'change your password',
                    'update your password', 'forgot password', 'forgotten password',
                    'account recovery', 'recover your account', 'password recovery'
                ],
                
                strong: [
                    // Français
                    'sécurité', 'vérification', 'authentification', 'connexion',
                    'mot de passe', 'compte', 'accès', 'session',
                    
                    // Anglais
                    'security', 'verify', 'authentication', 'login',
                    'password', 'account', 'access', 'session'
                ],
                
                weak: [
                    'compte', 'account', 'accès', 'access', 'code'
                ],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            // TÂCHES - PATTERNS STRICTS (Français + Anglais)
            tasks: {
                absolute: [
                    // ACTION REQUISE (Français)
                    'action requise', 'action nécessaire', 'action à mener',
                    'intervention requise', 'intervention nécessaire',
                    'veuillez compléter', 'merci de compléter', 'à compléter',
                    'merci de faire', 'pouvez-vous faire', 'pourriez-vous faire',
                    'demande d\'action', 'nécessite votre action', 'votre action est requise',
                    'en attente de votre action', 'dans l\'attente de votre action',
                    'à faire', 'à traiter', 'à valider', 'validation requise',
                    'confirmation requise', 'approbation requise', 'approbation nécessaire',
                    'répondre avant', 'réponse attendue', 'réponse nécessaire',
                    'merci de répondre', 'veuillez répondre', 'prière de répondre',
                    
                    // ACTION REQUISE (Anglais)
                    'action required', 'action needed', 'action requested',
                    'please complete', 'please review', 'please confirm',
                    'please approve', 'approval needed', 'approval required',
                    'confirmation required', 'confirmation needed', 'please validate',
                    'validation required', 'response needed', 'response required',
                    'please respond', 'reply required', 'reply needed',
                    'waiting for your action', 'awaiting your response',
                    'your attention required', 'requires your attention',
                    'follow up required', 'follow-up needed',
                    
                    // URGENCE ET DEADLINE (Français)
                    'urgence', 'urgent', 'très urgent', 'extrêmement urgent',
                    'priorité', 'prioritaire', 'haute priorité', 'priorité élevée',
                    'échéance', 'date limite', 'deadline', 'avant le',
                    'livrable', 'à livrer', 'livraison attendue',
                    'tâche assignée', 'tâche attribuée', 'assigné à',
                    'doit être fait', 'doit être terminé', 'à terminer',
                    
                    // URGENCE ET DEADLINE (Anglais)
                    'urgent', 'asap', 'as soon as possible', 'immediately',
                    'priority', 'high priority', 'critical', 'important',
                    'deadline', 'due date', 'due by', 'expires',
                    'task assigned', 'assigned to you', 'deliverable',
                    'must be completed', 'needs to be done', 'to do',
                    'time sensitive', 'overdue', 'past due'
                ],
                
                strong: [
                    // Français
                    'urgent', 'priorité', 'compléter', 'action', 'faire',
                    'échéance', 'deadline', 'livrable', 'tâche',
                    
                    // Anglais
                    'urgent', 'asap', 'priority', 'complete', 'action',
                    'deadline', 'task', 'assigned', 'due'
                ],
                
                weak: [
                    'demande', 'request', 'besoin', 'need', 'attente', 'waiting'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // RÉUNIONS - PATTERNS STRICTS (Français + Anglais)
            meetings: {
                absolute: [
                    // DEMANDES DE RÉUNION (Français)
                    'demande de réunion', 'demande de rendez-vous', 'demande de rdv',
                    'invitation à une réunion', 'invitation réunion', 'invitation rdv',
                    'planifier une réunion', 'programmer une réunion', 'organiser une réunion',
                    'réunion prévue', 'réunion programmée', 'réunion planifiée',
                    'rendez-vous prévu', 'rdv prévu', 'entretien prévu',
                    'prise de rendez-vous', 'réserver un créneau', 'créneaux disponibles',
                    'disponibilités pour une réunion', 'proposer un créneau',
                    
                    // DEMANDES DE RÉUNION (Anglais)
                    'meeting request', 'meeting invitation', 'invite to meeting',
                    'schedule a meeting', 'book a meeting', 'arrange a meeting',
                    'plan a meeting', 'organize a meeting', 'set up a meeting',
                    'meeting scheduled', 'meeting planned', 'appointment scheduled',
                    'calendar invitation', 'calendar invite', 'meeting invite',
                    'time slot available', 'availability request', 'when are you available',
                    
                    // PLATEFORMES ET OUTILS (Français)
                    'réunion teams', 'teams meeting', 'réunion zoom', 'zoom meeting',
                    'réunion skype', 'skype meeting', 'google meet', 'réunion google',
                    'visioconférence', 'vidéoconférence', 'conférence téléphonique',
                    'appel vidéo', 'appel audio', 'conference call',
                    'webinar', 'webinaire', 'séminaire en ligne',
                    
                    // PLATEFORMES ET OUTILS (Anglais)
                    'teams meeting', 'zoom meeting', 'google meet', 'skype meeting',
                    'video conference', 'video call', 'conference call',
                    'online meeting', 'virtual meeting', 'webinar',
                    'screen sharing', 'join meeting', 'meeting link'
                ],
                
                strong: [
                    // Français
                    'réunion', 'rendez-vous', 'rdv', 'planifier', 'programmer',
                    'calendrier', 'agenda', 'entretien', 'visio',
                    
                    // Anglais
                    'meeting', 'appointment', 'schedule', 'calendar',
                    'conference', 'call', 'video', 'invite'
                ],
                
                weak: [
                    'présentation', 'agenda', 'planning', 'schedule'
                ],
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
    // TEST AVEC NOUVEAUX PATTERNS MULTILINGUES
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

    // Test des nouveaux patterns multilingues
    testMultilingualPatterns() {
        console.log('\n[CategoryManager] === TEST PATTERNS MULTILINGUES ===');
        
        const tests = [
            // Marketing français
            ['Newsletter - Si vous ne souhaitez plus recevoir de communication de notre part, paramétrez vos choix ici', 'marketing_news'],
            ['Promotion spéciale - Désabonnez-vous facilement', 'marketing_news'],
            ['Offre limitée - Gérer vos préférences de communication', 'marketing_news'],
            
            // Marketing anglais
            ['Weekly Newsletter - Unsubscribe here if you no longer wish to receive', 'marketing_news'],
            ['Special Offer - Update your email preferences', 'marketing_news'],
            ['Flash Sale - Opt out anytime', 'marketing_news'],
            
            // Sécurité français
            ['Alerte de connexion - Nouvelle session détectée', 'security'],
            ['Code de vérification - Authentification à deux facteurs', 'security'],
            ['Réinitialisation de votre mot de passe', 'security'],
            
            // Sécurité anglais
            ['Security Alert - Suspicious login attempt detected', 'security'],
            ['Verification Code - Two-factor authentication', 'security'],
            ['Password Reset - Account Recovery', 'security'],
            
            // Tâches français
            ['Action requise - Validation nécessaire avant le 15/12', 'tasks'],
            ['Urgent - Votre approbation est nécessaire', 'tasks'],
            ['Livrable en attente - Merci de compléter', 'tasks'],
            
            // Tâches anglais
            ['Action Required - Please approve by Friday', 'tasks'],
            ['URGENT - Your response needed ASAP', 'tasks'],
            ['Task Assigned - Deliverable due tomorrow', 'tasks'],
            
            // Réunions français
            ['Demande de réunion - Teams meeting proposé', 'meetings'],
            ['Invitation réunion - Créneaux disponibles', 'meetings'],
            ['RDV programmé - Visioconférence Zoom', 'meetings'],
            
            // Réunions anglais
            ['Meeting Request - Schedule a call this week', 'meetings'],
            ['Calendar Invitation - Google Meet conference', 'meetings'],
            ['Appointment Scheduled - Video call tomorrow', 'meetings']
        ];
        
        let passed = 0;
        let total = tests.length;
        
        tests.forEach(([subject, expected]) => {
            const result = this.testEmail(subject, expected);
            if (result.category === expected) {
                passed++;
            }
        });
        
        console.log(`\n[CategoryManager] RÉSULTATS: ${passed}/${total} tests réussis (${Math.round(passed/total*100)}%)`);
        console.log('===========================================\n');
        
        return { passed, total, percentage: Math.round(passed/total*100) };
    }
}

// Créer l'instance globale
window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v17.0 loaded - Système unifié et synchronisé');
