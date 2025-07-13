// CategoryManager.js - Version 23.0 - Fusion optimisée
// Structure v22.0 + Mots-clés complets v20.0 + Compatibilité EmailScanner

console.log('[CategoryManager] 🚀 Chargement v23.0 - Version fusionnée...');

class CategoryManager {
    constructor() {
        // État principal
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Cache pour optimisation
        this._categoriesCache = null;
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        // Initialisation
        this.initializeCategories();
        this.initializeWeightedDetection();
        this.loadCustomCategories();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 23.0 initialisée avec succès');
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // Marketing & Newsletters - Priorité maximale
            marketing_news: {
                name: 'Marketing & Newsletters',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et communications marketing',
                priority: 100,
                isCustom: false
            },
            
            // En Copie - Priorité élevée
            cc: {
                name: 'En Copie (CC)',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie pour information',
                priority: 90,
                isCustom: false
            },
            
            // Sécurité - Priorité haute
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#dc2626',
                description: 'Alertes de sécurité, authentification et accès',
                priority: 85,
                isCustom: false
            },
            
            // Actions & Tâches - Priorité haute
            tasks: {
                name: 'Actions & Tâches',
                icon: '✅',
                color: '#ef4444',
                description: 'Actions à effectuer, tâches et demandes urgentes',
                priority: 80,
                isCustom: false
            },
            
            // Finance - Priorité haute
            finance: {
                name: 'Finance & Comptabilité',
                icon: '💰',
                color: '#f59e0b',
                description: 'Factures, paiements, comptabilité et transactions',
                priority: 75,
                isCustom: false
            },
            
            // Réunions - Priorité haute
            meetings: {
                name: 'Réunions & Rendez-vous',
                icon: '📅',
                color: '#3b82f6',
                description: 'Invitations, planification et confirmations de réunions',
                priority: 70,
                isCustom: false
            },
            
            // Ressources Humaines - Priorité normale haute
            hr: {
                name: 'Ressources Humaines',
                icon: '👥',
                color: '#10b981',
                description: 'Recrutement, paie, congés et gestion du personnel',
                priority: 65,
                isCustom: false
            },
            
            // Projets - Priorité normale
            project: {
                name: 'Gestion de Projet',
                icon: '📊',
                color: '#06b6d4',
                description: 'Suivi de projets, jalons et livrables',
                priority: 60,
                isCustom: false
            },
            
            // Commercial - Priorité normale
            commercial: {
                name: 'Commercial & Ventes',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités commerciales, devis et contrats clients',
                priority: 55,
                isCustom: false
            },
            
            // Support - Priorité normale
            support: {
                name: 'Support & Assistance',
                icon: '🛠️',
                color: '#ea580c',
                description: 'Tickets de support, assistance technique et SAV',
                priority: 50,
                isCustom: false
            },
            
            // Logistique - Priorité normale
            logistics: {
                name: 'Logistique & Livraisons',
                icon: '📦',
                color: '#84cc16',
                description: 'Expéditions, livraisons et suivi de commandes',
                priority: 45,
                isCustom: false
            },
            
            // Communication Interne - Priorité normale
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes et communications d\'entreprise',
                priority: 40,
                isCustom: false
            },
            
            // Juridique - Priorité normale
            legal: {
                name: 'Juridique & Conformité',
                icon: '⚖️',
                color: '#7c3aed',
                description: 'Documents légaux, contrats et conformité',
                priority: 35,
                isCustom: false
            },
            
            // Notifications - Priorité basse
            notifications: {
                name: 'Notifications Système',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques et alertes système',
                priority: 30,
                isCustom: false
            },
            
            // Rappels - Priorité basse
            reminders: {
                name: 'Rappels & Relances',
                icon: '🔄',
                color: '#22c55e',
                description: 'Rappels, suivis et relances diverses',
                priority: 25,
                isCustom: false
            },
            
            // Non classé - Priorité minimale
            other: {
                name: 'Non classé',
                icon: '❓',
                color: '#64748b',
                description: 'Emails non catégorisés',
                priority: 0,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // INITIALISATION DES MOTS-CLÉS COMPLETS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // Marketing & Newsletters - Mots-clés renforcés pour Twitch
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'stop receiving emails', 'to stop receiving emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
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
                    'watch now', 'shop now', 'buy now', 'acheter maintenant',
                    'is live', 'went live', 'streaming now'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'découvrez', 'discover', 'shop now', 'nouveauté',
                    'streaming', 'live', 'broadcast', 'diffusion'
                ],
                weak: [
                    'update', 'discover', 'new', 'nouveauté', 'découvrir',
                    'news', 'actualité', 'information', 'cette semaine', 'this week'
                ],
                exclusions: [
                    'facture', 'invoice', 'payment', 'urgent', 'action requise',
                    'password reset', 'security alert', 'meeting invite'
                ]
            },

            // Sécurité - Mots-clés renforcés pour GitHub
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'nouvelle connexion détectée', 'new sign-in detected',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'authentification à deux facteurs', 'two-factor authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'your password was reset', 'mot de passe réinitialisé',
                    'security alert', 'alerte de sécurité',
                    'secure your account', 'sécuriser votre compte',
                    'security events', 'événements de sécurité',
                    'unauthorized access', 'accès non autorisé',
                    'recover access', 'récupérer l\'accès'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'compte', 'account', 'accès', 'access', 'protection', 'protect',
                    'secure', 'sécuriser', 'reset', 'réinitialiser'
                ],
                weak: [
                    'connexion', 'login', 'sign in', 'utilisateur', 'user'
                ],
                exclusions: [
                    'newsletter', 'unsubscribe', 'promotion', 'marketing',
                    'meeting', 'invoice', 'project update'
                ]
            },

            // Tâches et Actions - Mots-clés enrichis
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable', 'date limite',
                    'urgence', 'urgent', 'très urgent',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed', 'mise a jour requise',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed',
                    'approval required', 'signature requise'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité', 'prioritaire',
                    'complete', 'compléter', 'action', 'faire', 'effectuer',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire', 'rapidement', 'quickly',
                    'correction', 'corriger', 'modifier', 'révision', 'execute'
                ],
                weak: [
                    'demande', 'besoin', 'attente', 'request', 'need', 'waiting'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe', 
                    'papa', 'maman', 'famille', 'pour info', 'fyi', 'copie'
                ]
            },

            // Finance et Comptabilité - Mots-clés complets
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'facture n°', 'invoice number', 'invoice #',
                    'paiement effectué', 'payment received', 'virement reçu',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement', 'relevé de compte',
                    'déclaration fiscale', 'tax declaration', 'bilan comptable',
                    'n°commande', 'numéro commande', 'order number',
                    'numéro de commande', 'commande n°', 'commande numéro',
                    'livraison commande', 'commande expédiée',
                    'confirmation commande', 'order confirmation'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture', 'invoice',
                    'fiscal', 'bancaire', 'bank', 'finance', 'comptabilité',
                    'commande', 'order', 'achat', 'vente', 'accounting',
                    'livraison', 'delivery', 'expédition', 'shipping',
                    'prix', 'price', 'coût', 'cost', 'échéance', 'due'
                ],
                weak: [
                    'euro', 'dollar', 'prix', 'payment', 'transaction'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'spam', 'promotion', 
                    'soldes', 'ventes en ligne', 'offre commerciale'
                ]
            },

            // Réunions et Rendez-vous - Mots-clés enrichis pour Trustpair
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'invitation à une réunion', 'meeting invitation', 'meeting invite',
                    'nouvelle réunion planifiée', 'schedule a meeting',
                    'planifier une réunion', 'invitation réunion',
                    'invitation teams', 'teams meeting', 'zoom meeting',
                    'google meet', 'rendez-vous', 'appointment', 'rdv',
                    'confirmer votre présence', 'confirm attendance',
                    'réunion annulée', 'meeting cancelled',
                    'first call', 'premier appel', 'entretien téléphonique',
                    'requested to reschedule', 'demande de reprogrammation',
                    'reschedule meeting', 'reprogrammer la réunion'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment', 'agenda',
                    'conférence', 'conference', 'call', 'visioconférence',
                    'video call', 'planning', 'reschedule', 'reprogrammer',
                    'disponibilité', 'availability', 'slot', 'créneau'
                ],
                weak: [
                    'présentation', 'agenda', 'disponible', 'available',
                    'date', 'heure', 'time', 'durée', 'duration',
                    'week', 'semaine', 'thursday', 'jeudi'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing', 'papa', 
                    'maman', 'famille', 'facture', 'password', 'security'
                ]
            },

            // Ressources Humaines - Mots-clés renforcés pour recrutement
            hr: {
                absolute: [
                    'votre candidature', 'your application', 'job application',
                    'processus de recrutement', 'recruitment process',
                    'offre d\'emploi', 'job offer', 'poste à pourvoir',
                    'bulletin de paie', 'payslip', 'fiche de paie',
                    'demande de congés', 'leave request', 'congés validés',
                    'service recrutement', 'recruitment team', 'équipe rh',
                    'contrat de travail', 'onboarding',
                    'entretien annuel', 'performance review',
                    'ressources humaines', 'human resources',
                    'recruiting powered by', 'recrutement via',
                    'customer success manager', 'responsable succès client',
                    'first call', 'premier entretien', 'entretien initial',
                    'other processes', 'autres processus', 'candidatures'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary', 'candidature',
                    'ressources humaines', 'human resources', 'recrutement',
                    'contrat', 'paie', 'congés', 'vacation', 'recruitment',
                    'emploi', 'job', 'recruitment', 'formation', 'entretien', 'interview',
                    'poste', 'position', 'process', 'processus', 'candidate', 'candidat'
                ],
                weak: [
                    'employee', 'staff', 'personnel', 'équipe', 'poste',
                    'team', 'manager', 'responsable'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'famille', 'family', 
                    'personnel', 'personal', 'papa', 'maman',
                    'présentation', 'document', 'correction',
                    'bises', 'bisous', 'familial', 'client', 'vente',
                    'password', 'security', 'invoice'
                ]
            },

            // Gestion de Projet - Mots-clés sans GitHub password
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'avancement du projet', 'project status',
                    'rapport d\'avancement', 'progress report', 'milestone atteint',
                    'sprint', 'livrable projet', 'gantt',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées',
                    'ticket jira', 'jira ticket', 'github issue',
                    'sprint planning', 'release note', 'déploiement',
                    'pull request', 'merge request', 'code review',
                    'feature branch', 'development update'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement', 'deliverable',
                    'document', 'présentation', 'correction', 'release',
                    'deploy', 'deployment', 'feature', 'bug fix'
                ],
                weak: [
                    'development', 'phase', 'étape', 'planning', 
                    'présentation', 'task', 'ticket', 'issue'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'papa', 
                    'maman', 'famille', 'bises', 'facture', 'candidature', 'recrutement',
                    'password reset', 'security', 'account security', 'unauthorized access'
                ]
            },

            // Commercial et Ventes - Mots-clés enrichis
            commercial: {
                absolute: [
                    'opportunité commerciale', 'business opportunity',
                    'demande de devis', 'quote request', 'proposition commerciale',
                    'contrat commercial', 'sales contract', 'bon de commande',
                    'signature du contrat', 'contract signature',
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'purchase order',
                    'offre commerciale', 'opportunity', 'opportunité', 'lead'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'devis',
                    'quote', 'contrat', 'contract', 'offre'
                ],
                weak: [
                    'offre', 'négociation', 'discussion', 'projet', 'marché'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe', 
                    'ventes en ligne', 'candidature', 'recrutement', 'rh', 
                    'paie', 'formation'
                ]
            },

            // Support et Assistance - Mots-clés complets
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'ticket de support', 'support ticket', 'ticket n°',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved', 'ticket résolu', 'ticket closed',
                    'demande d\'assistance', 'support request',
                    'demande de support'
                ],
                strong: [
                    'support', 'assistance', 'help desk', 'ticket',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug', 'résolution'
                ],
                weak: [
                    'help', 'aide', 'issue', 'question', 'information'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'facture', 'commande'
                ]
            },

            // Logistique et Livraisons - Mots-clés étendus
            logistics: {
                absolute: [
                    'commande expédiée', 'order shipped', 'colis expédié',
                    'numéro de suivi', 'tracking number', 'livraison prévue',
                    'delivery scheduled', 'colis livré', 'package delivered'
                ],
                strong: [
                    'livraison', 'delivery', 'expédition', 'shipping',
                    'colis', 'package', 'transport', 'tracking'
                ],
                weak: [
                    'envoi', 'commande', 'retour', 'échange'
                ],
                exclusions: [
                    'newsletter', 'facture', 'devis'
                ]
            },

            // Communication Interne - Mots-clés complets
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'à tous les collaborateurs', 'to all employees',
                    'communication interne', 'internal communication',
                    'company announcement', 'memo interne',
                    'note de service', 'message de la direction', 'management message',
                    'à tous', 'to all employees'
                ],
                strong: [
                    'internal', 'interne', 'company wide', 'entreprise',
                    'personnel', 'staff', 'équipe', 'team',
                    'annonce', 'announcement', 'collaborateur', 'employee'
                ],
                weak: [
                    'annonce', 'announcement', 'information', 'update',
                    'message', 'nouvelle', 'changement'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'external', 'client', 
                    'papa', 'maman', 'famille', 'bises', 'commercial'
                ]
            },

            // Juridique et Conformité - Mots-clés enrichis
            legal: {
                absolute: [
                    'contrat juridique', 'legal contract', 'conditions générales',
                    'accord de confidentialité', 'nda', 'rgpd', 'gdpr',
                    'mise en conformité', 'compliance audit'
                ],
                strong: [
                    'juridique', 'legal', 'conformité', 'compliance',
                    'contrat', 'contract', 'clause', 'réglementaire'
                ],
                weak: [
                    'document', 'accord', 'termes', 'conditions'
                ],
                exclusions: [
                    'newsletter', 'facture', 'livraison'
                ]
            },

            // Notifications Système - Mots-clés corrigés (sans domaines)
            notifications: {
                absolute: [
                    'ceci est un message automatique', 'this is an automated message',
                    'notification système', 'system notification',
                    'alerte système', 'system alert',
                    'message généré automatiquement', 'automatically generated message',
                    'notification automatique du système', 'automated system notification'
                ],
                strong: [
                    'automated message', 'message automatique',
                    'système', 'system', 'automatisé', 'automated',
                    'notification automatique', 'automatic notification'
                ],
                weak: [
                    'notification', 'alert', 'info', 'confirmé', 'update', 'status'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'urgent', 'action required', 'important',
                    'stop receiving', 'unsubscribe', 'click here', 'watch now',
                    'password', 'security', 'meeting', 'invoice', 'facture'
                ]
            },

            // Rappels et Relances - Mots-clés complets
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'rappel amical', 'friendly reminder', 'following up',
                    'gentle reminder', 'relance:', 'follow up:',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed', 'suite à notre échange'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending',
                    'attente', 'waiting', 'précédent', 'previous'
                ],
                weak: [
                    'previous', 'discussed', 'encore', 'still', 'déjà', 'already'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'première fois', 'nouveau', 'initial'
                ]
            },

            // En Copie (CC) - Mots-clés optimisés
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'pour information', 'for your information', 
                    'en copie pour information', 'cc pour info',
                    'mis en copie', 'cc:', 'courtesy copy',
                    'pour info', 'pour votre information', 'en copie', 'in copy'
                ],
                strong: [
                    'information', 'copie', 'copy', 'cc'
                ],
                weak: [
                    'fyi', 'info', 'suivi', 'connaissance'
                ],
                exclusions: [
                    'commande', 'order', 'facture', 'invoice',
                    'urgent', 'action required', 'payment',
                    'action requise', 'merci de'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
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
            preferences: {
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    // ================================================
    // MÉTHODE PRINCIPALE D'ANALYSE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        const content = this.extractEmailContent(email);
        const results = this.analyzeAllCategories(content);
        const bestMatch = this.selectBestCategory(results);

        return bestMatch || { category: 'other', score: 0, confidence: 0 };
    }

    extractEmailContent(email) {
        let allText = '';
        
        // Sujet (important, donc répété pour plus de poids)
        if (email.subject) {
            allText += (email.subject + ' ').repeat(5);
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
        }
        if (email.from?.emailAddress?.name) {
            allText += email.from.emailAddress.name + ' ';
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        if (email.body?.content) {
            allText += this.cleanHtml(email.body.content) + ' ';
        }
        
        // Ajouter les indicateurs spéciaux (compatibilité EmailScanner)
        if (email._unsubscribeIndicator) {
            allText += email._unsubscribeIndicator + ' ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: (email.subject || '').toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address)
        };
    }

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const categoryId of activeCategories) {
            if (!this.weightedKeywords[categoryId]) continue;
            
            const score = this.calculateCategoryScore(content, categoryId);
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                matches: score.matches,
                hasAbsolute: score.hasAbsolute,
                priority: this.categories[categoryId]?.priority || 0
            };
        }
        
        return results;
    }

    calculateCategoryScore(content, categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Test des mots-clés absolus (100 points)
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.containsKeyword(content.text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                }
            }
        }
        
        // Test des mots-clés forts (40 points)
        if (keywords.strong) {
            for (const keyword of keywords.strong) {
                if (this.containsKeyword(content.text, keyword)) {
                    totalScore += 40;
                    matches.push({ keyword, type: 'strong', score: 40 });
                }
            }
        }
        
        // Test des mots-clés faibles (15 points)
        if (keywords.weak) {
            for (const keyword of keywords.weak) {
                if (this.containsKeyword(content.text, keyword)) {
                    totalScore += 15;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
        }
        
        // Test des exclusions (-50 points)
        if (keywords.exclusions) {
            for (const keyword of keywords.exclusions) {
                if (this.containsKeyword(content.text, keyword)) {
                    totalScore -= 50;
                    matches.push({ keyword, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Bonus de domaine pour certaines catégories
        const domainBonuses = {
            hr: ['teamtailor', 'workday', 'welcometothejungle', 'indeed'],
            finance: ['paypal', 'stripe', 'invoice', 'billing'],
            notifications: ['system', 'automated', 'bot']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    totalScore += 50;
                    hasAbsolute = true;
                    matches.push({ keyword: `domain:${domainKeyword}`, type: 'domain', score: 50 });
                    break;
                }
            }
        }
        
        return {
            total: Math.max(0, totalScore),
            hasAbsolute,
            matches
        };
    }

    selectBestCategory(results) {
        const MIN_SCORE = 30;
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE)
            .sort((a, b) => {
                // Priorité aux mots absolus
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Puis par priorité de catégorie
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Enfin par score
                return b.score - a.score;
            });
        
        if (validResults.length > 0) {
            const best = validResults[0];
            return {
                category: best.category,
                score: best.score,
                confidence: this.calculateConfidence(best.score, best.hasAbsolute),
                matchedPatterns: best.matches,
                hasAbsolute: best.hasAbsolute
            };
        }
        
        return null;
    }

    calculateConfidence(score, hasAbsolute) {
        if (hasAbsolute) return 0.95;
        if (score >= 150) return 0.85;
        if (score >= 100) return 0.75;
        if (score >= 60) return 0.65;
        if (score >= 40) return 0.55;
        return 0.45;
    }

    containsKeyword(text, keyword) {
        const normalizedText = this.normalizeText(text);
        const normalizedKeyword = this.normalizeText(keyword);
        return normalizedText.includes(normalizedKeyword);
    }

    normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/ç/g, 'c')
            .trim();
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return '';
        return email.split('@')[1]?.toLowerCase() || '';
    }

    // ================================================
    // MÉTHODES POUR EMAILSCANNER
    // ================================================
    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    updateTaskPreselectedCategories(categories) {
        this.settings.taskPreselectedCategories = [...categories];
        this.saveSettings();
        this.notifyChange('taskPreselectedCategories', categories);
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }

    getCategories() {
        return { ...this.categories };
    }

    getCategory(categoryId) {
        return this.categories[categoryId] || null;
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde:', error);
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.notifyChange('settings', this.settings);
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION
    // ================================================
    notifyChange(type, value) {
        // Notifier EmailScanner directement
        if (window.emailScanner && type === 'taskPreselectedCategories') {
            if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                window.emailScanner.updateTaskPreselectedCategories(value);
            }
        }
        
        // Dispatcher un événement global
        window.dispatchEvent(new CustomEvent('categorySettingsChanged', {
            detail: { type, value, timestamp: Date.now() }
        }));
    }

    // ================================================
    // SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        // Vérifier les changements toutes les 5 secondes
        setInterval(() => {
            this.checkForExternalChanges();
        }, 5000);
    }

    checkForExternalChanges() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                const currentStr = JSON.stringify(this.settings);
                const savedStr = JSON.stringify(savedSettings);
                
                if (currentStr !== savedStr) {
                    this.settings = savedSettings;
                    this.notifyChange('settings', this.settings);
                }
            }
        } catch (error) {
            // Ignorer les erreurs silencieusement
        }
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                this.customCategories = JSON.parse(saved);
                
                // Ajouter les catégories personnalisées
                Object.entries(this.customCategories).forEach(([id, category]) => {
                    this.categories[id] = {
                        ...category,
                        isCustom: true
                    };
                    
                    // Charger les mots-clés si présents
                    if (category.keywords) {
                        this.weightedKeywords[id] = category.keywords;
                    }
                });
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
        }
    }

    createCustomCategory(categoryData) {
        const id = this.generateCategoryId(categoryData.name);
        
        const category = {
            id,
            name: categoryData.name,
            icon: categoryData.icon || '📂',
            color: categoryData.color || '#6366f1',
            description: categoryData.description || '',
            priority: categoryData.priority || 30,
            isCustom: true,
            keywords: categoryData.keywords || {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            }
        };
        
        this.customCategories[id] = category;
        this.categories[id] = category;
        this.weightedKeywords[id] = category.keywords;
        
        this.saveCustomCategories();
        return category;
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    generateCategoryId(name) {
        const base = name.toLowerCase()
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

    // ================================================
    // SETUP EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        // Écouter les changements externes
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.source !== 'CategoryManager') {
                const { type, value } = e.detail;
                if (type === 'taskPreselectedCategories') {
                    this.settings.taskPreselectedCategories = value;
                    this.saveSettings();
                }
            }
        });
    }

    // ================================================
    // MÉTHODES DE TEST
    // ================================================
    testEmail(subject, body = '', from = '') {
        const testEmail = {
            subject,
            body: { content: body },
            bodyPreview: body.substring(0, 100),
            from: { emailAddress: { address: from } }
        };
        
        return this.analyzeEmail(testEmail);
    }

    getCategoryStats() {
        return {
            totalCategories: Object.keys(this.categories).length,
            activeCategories: this.getActiveCategories().length,
            taskPreselectedCategories: this.getTaskPreselectedCategories().length,
            customCategories: Object.keys(this.customCategories).length
        };
    }

    // ================================================
    // MÉTHODES ADDITIONNELLES POUR COMPATIBILITÉ
    // ================================================
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

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

        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
            this.saveCustomCategories();
        }

        this.notifyChange('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v23.0');
        
        const stats = this.getCategoryStats();
        console.log('📊 Statistiques:', stats);
        
        console.log('📂 Catégories actives:', this.getActiveCategories());
        console.log('⭐ Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        
        // Vérifier les mots-clés
        let totalKeywords = 0;
        Object.entries(this.weightedKeywords).forEach(([catId, keywords]) => {
            const count = (keywords.absolute?.length || 0) + 
                         (keywords.strong?.length || 0) + 
                         (keywords.weak?.length || 0);
            totalKeywords += count;
            
            if (count === 0) {
                console.warn(`⚠️ Catégorie ${catId} sans mots-clés!`);
            }
        });
        
        console.log('🔤 Total mots-clés:', totalKeywords);
        console.groupEnd();
        
        return stats;
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager = null;
}

// Créer l'instance globale
window.categoryManager = new CategoryManager();

console.log('[CategoryManager] ✅ v23.0 chargé avec succès - Version fusionnée');

// Fonction de test globale
window.testCategoryManager = function() {
    console.group('🧪 Test CategoryManager v23.0');
    
    const tests = [
        { subject: 'Newsletter - Se désinscrire', expected: 'marketing_news' },
        { subject: 'Action requise: Validation urgente', expected: 'tasks' },
        { subject: 'Nouvelle connexion détectée', expected: 'security' },
        { subject: 'Facture n°12345', expected: 'finance' },
        { subject: 'Invitation réunion Teams', expected: 'meetings' },
        { subject: 'Votre candidature chez nous', expected: 'hr' },
        { subject: 'Ticket support #789 résolu', expected: 'support' },
        { subject: 'Commande expédiée - Suivi colis', expected: 'logistics' },
        { subject: 'Document corrigé - Projet Alpha', expected: 'project' },
        { subject: 'Rappel: Suite à notre échange', expected: 'reminders' }
    ];
    
    tests.forEach(test => {
        const result = window.categoryManager.testEmail(test.subject);
        const success = result.category === test.expected ? '✅' : '❌';
        console.log(`${success} ${test.subject} → ${result.category} (attendu: ${test.expected})`);
    });
    
    console.groupEnd();
};
