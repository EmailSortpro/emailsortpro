// CategoryManager.js - Version 21.0 - Refonte complète avec catégories densifiées
// Chaque mot-clé n'apparaît que dans une seule catégorie pour éviter les conflits

class CategoryManager {
    constructor() {
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
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 21.0 - Catégories densifiées et uniques');
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES DENSIFIÉES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWSLETTERS
            marketing_news: {
                name: 'Marketing & Newsletters',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et communications marketing',
                priority: 100,
                isCustom: false
            },
            
            // PRIORITÉ ÉLEVÉE - EMAILS EN COPIE
            cc: {
                name: 'En Copie (CC)',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie pour information',
                priority: 90,
                isCustom: false
            },
            
            // PRIORITÉ HAUTE - SÉCURITÉ
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#dc2626',
                description: 'Alertes de sécurité, authentification et accès',
                priority: 85,
                isCustom: false
            },
            
            // PRIORITÉ HAUTE - ACTIONS REQUISES
            tasks: {
                name: 'Actions & Tâches',
                icon: '✅',
                color: '#ef4444',
                description: 'Actions à effectuer, tâches et demandes urgentes',
                priority: 80,
                isCustom: false
            },
            
            // PRIORITÉ HAUTE - FINANCE
            finance: {
                name: 'Finance & Comptabilité',
                icon: '💰',
                color: '#f59e0b',
                description: 'Factures, paiements, comptabilité et transactions',
                priority: 75,
                isCustom: false
            },
            
            // PRIORITÉ HAUTE - RÉUNIONS
            meetings: {
                name: 'Réunions & Rendez-vous',
                icon: '📅',
                color: '#3b82f6',
                description: 'Invitations, planification et confirmations de réunions',
                priority: 70,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - RH
            hr: {
                name: 'Ressources Humaines',
                icon: '👥',
                color: '#10b981',
                description: 'Recrutement, paie, congés et gestion du personnel',
                priority: 65,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - PROJETS
            project: {
                name: 'Gestion de Projet',
                icon: '📊',
                color: '#06b6d4',
                description: 'Suivi de projets, jalons et livrables',
                priority: 60,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - COMMERCIAL
            commercial: {
                name: 'Commercial & Ventes',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités commerciales, devis et contrats',
                priority: 55,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - SUPPORT
            support: {
                name: 'Support & Assistance',
                icon: '🛠️',
                color: '#ea580c',
                description: 'Tickets de support, assistance technique et SAV',
                priority: 50,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - LOGISTIQUE
            logistics: {
                name: 'Logistique & Livraisons',
                icon: '📦',
                color: '#84cc16',
                description: 'Expéditions, livraisons et suivi de commandes',
                priority: 45,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - COMMUNICATION INTERNE
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes et communications d\'entreprise',
                priority: 40,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE - JURIDIQUE
            legal: {
                name: 'Juridique & Conformité',
                icon: '⚖️',
                color: '#7c3aed',
                description: 'Documents légaux, contrats et conformité',
                priority: 35,
                isCustom: false
            },
            
            // PRIORITÉ BASSE - NOTIFICATIONS
            notifications: {
                name: 'Notifications Système',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques et alertes système',
                priority: 30,
                isCustom: false
            },
            
            // PRIORITÉ BASSE - RELANCES
            reminders: {
                name: 'Rappels & Relances',
                icon: '🔄',
                color: '#22c55e',
                description: 'Rappels, suivis et relances diverses',
                priority: 25,
                isCustom: false
            },
            
            // PRIORITÉ MINIMALE - AUTRES
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
    // MOTS-CLÉS DENSIFIÉS ET UNIQUES PAR CATÉGORIE
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWSLETTERS
            marketing_news: {
                absolute: [
                    // Désabonnement FR
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'me désabonner', 'me desabonner', 'désabonnement', 'desabonnement',
                    'ne plus recevoir', 'arrêter les emails', 'stop emails',
                    'cesser de recevoir', 'retirer de la liste',
                    
                    // Désabonnement EN
                    'unsubscribe', 'opt out', 'opt-out', 'remove from list',
                    'stop receiving', 'email preferences', 'mailing preferences',
                    'manage subscriptions', 'update preferences',
                    
                    // Formules newsletter FR
                    'newsletter', 'lettre d\'information', 'bulletin d\'information',
                    'infolettre', 'e-bulletin', 'bulletin électronique',
                    'abonnement newsletter', 'liste de diffusion',
                    
                    // Formules newsletter EN
                    'mailing list', 'email campaign', 'bulk email',
                    'mass mailing', 'email blast', 'marketing email',
                    
                    // Promotions FR
                    'offre promotionnelle', 'promotion exclusive', 'vente flash',
                    'vente privée', 'soldes privées', 'réduction exclusive',
                    'code promo', 'bon de réduction', 'coupon de réduction',
                    
                    // Promotions EN
                    'special offer', 'limited time offer', 'exclusive deal',
                    'flash sale', 'private sale', 'discount code',
                    'promo code', 'coupon code', 'voucher code'
                ],
                strong: [
                    // Marketing FR
                    'promotion', 'promo', 'soldes', 'réduction', 'remise',
                    'offre spéciale', 'bon plan', 'économisez', 'profitez',
                    'découvrez', 'nouveauté', 'exclusif', 'limité',
                    
                    // Marketing EN
                    'sale', 'discount', 'offer', 'deal', 'save',
                    'special', 'exclusive', 'limited', 'new arrival',
                    'discover', 'shop now', 'buy now', 'order now',
                    
                    // Communication marketing
                    'campagne', 'campaign', 'publicité', 'advertising',
                    'annonce', 'announcement', 'lancement', 'launch'
                ],
                weak: [
                    'news', 'actualité', 'update', 'mise à jour',
                    'information', 'nouveautés', 'what\'s new',
                    'cette semaine', 'this week', 'ce mois-ci'
                ],
                exclusions: [
                    'facture', 'invoice', 'paiement', 'payment',
                    'sécurité', 'security', 'urgent', 'action requise'
                ]
            },

            // SÉCURITÉ
            security: {
                absolute: [
                    // Alertes connexion FR
                    'nouvelle connexion détectée', 'connexion inhabituelle',
                    'activité suspecte détectée', 'tentative de connexion',
                    'alerte de sécurité', 'alerte connexion',
                    'connexion depuis un nouvel appareil',
                    
                    // Alertes connexion EN
                    'new sign-in detected', 'unusual sign-in activity',
                    'suspicious activity detected', 'login attempt',
                    'security alert', 'new device login',
                    'unrecognized device', 'unknown location login',
                    
                    // Authentification FR
                    'code de vérification', 'code de sécurité',
                    'code d\'authentification', 'double authentification',
                    'authentification à deux facteurs', 'code 2fa',
                    'validation en deux étapes',
                    
                    // Authentification EN
                    'verification code', 'security code', 'authentication code',
                    'two-factor authentication', '2fa code', 'otp code',
                    'one-time password', 'multi-factor authentication',
                    
                    // Mots de passe FR
                    'réinitialisation du mot de passe', 'changer votre mot de passe',
                    'mot de passe expiré', 'nouveau mot de passe requis',
                    'réinitialiser le mot de passe',
                    
                    // Mots de passe EN
                    'password reset', 'reset your password', 'password expired',
                    'change your password', 'password recovery',
                    'forgot password', 'password change required'
                ],
                strong: [
                    // Sécurité FR
                    'sécurité', 'sécurisé', 'authentification', 'vérification',
                    'protéger', 'protection', 'verrouiller', 'verrouillage',
                    'accès', 'autorisation', 'habilitation',
                    
                    // Sécurité EN
                    'security', 'secure', 'authentication', 'verification',
                    'protect', 'protection', 'lock', 'locked',
                    'access', 'authorization', 'permission',
                    
                    // Comptes
                    'compte', 'account', 'profil', 'profile',
                    'identifiant', 'credential', 'token'
                ],
                weak: [
                    'connexion', 'login', 'sign in', 'connecter',
                    'session', 'utilisateur', 'user', 'membre'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'soldes', 'marketing',
                    'publicité', 'offre', 'réduction'
                ]
            },

            // TÂCHES ET ACTIONS
            tasks: {
                absolute: [
                    // Actions requises FR
                    'action requise', 'action nécessaire', 'action urgente',
                    'intervention requise', 'validation requise',
                    'approbation requise', 'signature requise',
                    'merci de valider', 'merci de confirmer',
                    'merci de compléter', 'veuillez compléter',
                    'veuillez valider', 'veuillez approuver',
                    
                    // Actions requises EN
                    'action required', 'action needed', 'urgent action',
                    'approval required', 'approval needed', 'signature required',
                    'please complete', 'please approve', 'please validate',
                    'please confirm', 'needs your attention',
                    'requires your action', 'waiting for approval',
                    
                    // Tâches FR
                    'tâche assignée', 'nouvelle tâche', 'tâche en attente',
                    'tâche à effectuer', 'mission confiée', 'travail à faire',
                    'deadline', 'date limite', 'échéance proche',
                    
                    // Tâches EN
                    'task assigned', 'new task', 'pending task',
                    'to-do item', 'work item', 'assignment',
                    'due date', 'due by', 'deadline approaching',
                    
                    // Demandes FR
                    'demande de validation', 'demande d\'approbation',
                    'demande de signature', 'demande de révision',
                    'demande de correction', 'demande de modification',
                    
                    // Demandes EN
                    'validation request', 'approval request',
                    'signature request', 'review request',
                    'correction request', 'modification request'
                ],
                strong: [
                    // Urgence FR
                    'urgent', 'urgence', 'prioritaire', 'priorité',
                    'critique', 'important', 'impératif', 'immédiat',
                    'asap', 'au plus vite', 'rapidement', 'vite',
                    
                    // Urgence EN
                    'priority', 'critical', 'immediate', 'quickly',
                    'time-sensitive', 'expedite', 'rush',
                    
                    // Actions FR
                    'faire', 'effectuer', 'réaliser', 'accomplir',
                    'exécuter', 'traiter', 'gérer', 'finaliser',
                    
                    // Actions EN
                    'complete', 'perform', 'execute', 'handle',
                    'process', 'finalize', 'accomplish'
                ],
                weak: [
                    'demande', 'request', 'besoin', 'need',
                    'attente', 'waiting', 'pending', 'queue'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'information',
                    'pour info', 'fyi', 'copie'
                ]
            },

            // FINANCE ET COMPTABILITÉ
            finance: {
                absolute: [
                    // Factures FR
                    'facture n°', 'facture numéro', 'facture ref',
                    'facture pro forma', 'facture d\'avoir',
                    'facture acquittée', 'facture impayée',
                    'rappel de facture', 'relance facture',
                    
                    // Factures EN
                    'invoice number', 'invoice #', 'invoice ref',
                    'pro forma invoice', 'credit note', 'debit note',
                    'paid invoice', 'unpaid invoice', 'overdue invoice',
                    'invoice reminder', 'payment reminder',
                    
                    // Paiements FR
                    'paiement effectué', 'paiement reçu', 'paiement en attente',
                    'virement effectué', 'virement reçu', 'prélèvement',
                    'ordre de virement', 'confirmation de paiement',
                    
                    // Paiements EN
                    'payment received', 'payment made', 'payment pending',
                    'transfer completed', 'wire transfer', 'bank transfer',
                    'payment confirmation', 'transaction completed',
                    
                    // Documents comptables FR
                    'relevé bancaire', 'relevé de compte', 'extrait de compte',
                    'bilan comptable', 'compte de résultat', 'liasse fiscale',
                    'déclaration tva', 'déclaration fiscale',
                    
                    // Documents comptables EN
                    'bank statement', 'account statement', 'financial statement',
                    'balance sheet', 'income statement', 'tax return',
                    'vat return', 'tax declaration'
                ],
                strong: [
                    // Finance FR
                    'facture', 'paiement', 'virement', 'transaction',
                    'comptabilité', 'comptable', 'trésorerie', 'budget',
                    'dépense', 'recette', 'créance', 'dette',
                    
                    // Finance EN
                    'invoice', 'payment', 'transfer', 'transaction',
                    'accounting', 'treasury', 'budget', 'expense',
                    'revenue', 'receivable', 'payable', 'billing',
                    
                    // Montants
                    'montant', 'amount', 'total', 'solde',
                    'balance', 'échéance', 'due', 'ttc', 'ht'
                ],
                weak: [
                    'euro', 'dollar', 'devise', 'currency',
                    'prix', 'price', 'coût', 'cost', 'tarif'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'réduction',
                    'soldes', 'offre commerciale'
                ]
            },

            // RÉUNIONS ET RENDEZ-VOUS
            meetings: {
                absolute: [
                    // Invitations FR
                    'invitation à une réunion', 'invitation réunion',
                    'nouvelle réunion planifiée', 'réunion programmée',
                    'convocation à une réunion', 'invitation teams',
                    'invitation zoom', 'invitation google meet',
                    
                    // Invitations EN
                    'meeting invitation', 'meeting request',
                    'calendar invitation', 'teams meeting',
                    'zoom meeting', 'google meet invitation',
                    'webex meeting', 'skype meeting',
                    
                    // Planification FR
                    'planifier une réunion', 'organiser une réunion',
                    'proposer un créneau', 'disponibilités pour',
                    'confirmer votre présence', 'confirmer la réunion',
                    
                    // Planification EN
                    'schedule a meeting', 'book a meeting',
                    'propose a time', 'availability for',
                    'confirm attendance', 'meeting confirmation',
                    'rsvp required', 'please confirm',
                    
                    // Modifications FR
                    'réunion annulée', 'réunion reportée',
                    'changement d\'horaire', 'nouvelle date',
                    'mise à jour de la réunion',
                    
                    // Modifications EN
                    'meeting cancelled', 'meeting postponed',
                    'meeting rescheduled', 'time changed',
                    'new meeting time', 'updated invitation'
                ],
                strong: [
                    // Réunions FR
                    'réunion', 'rendez-vous', 'rdv', 'entretien',
                    'conférence', 'visio', 'visioconférence',
                    'call', 'conf call', 'standup', 'point',
                    
                    // Réunions EN
                    'meeting', 'appointment', 'conference',
                    'video call', 'conference call', 'webinar',
                    'workshop', 'séminaire', 'formation',
                    
                    // Planning
                    'agenda', 'calendar', 'calendrier', 'planning',
                    'schedule', 'horaire', 'créneau', 'slot'
                ],
                weak: [
                    'date', 'heure', 'time', 'durée',
                    'duration', 'salle', 'room', 'lieu'
                ],
                exclusions: [
                    'newsletter', 'facture', 'paiement',
                    'promotion', 'publicité'
                ]
            },

            // RESSOURCES HUMAINES
            hr: {
                absolute: [
                    // Recrutement FR
                    'votre candidature', 'notre candidature',
                    'candidature spontanée', 'candidature retenue',
                    'candidature non retenue', 'suite favorable',
                    'suite défavorable', 'regret de vous informer',
                    'service recrutement', 'équipe recrutement',
                    'processus de recrutement', 'offre d\'emploi',
                    'poste à pourvoir', 'rejoindre notre équipe',
                    
                    // Recrutement EN
                    'your application', 'job application',
                    'application status', 'recruitment process',
                    'hiring process', 'job opening', 'job offer',
                    'position available', 'join our team',
                    'recruitment team', 'hr department',
                    
                    // Paie FR
                    'bulletin de paie', 'bulletin de salaire',
                    'fiche de paie', 'virement salaire',
                    'solde de tout compte', 'prime versée',
                    'augmentation de salaire', 'révision salariale',
                    
                    // Paie EN
                    'payslip', 'salary slip', 'pay stub',
                    'salary payment', 'wage slip', 'bonus payment',
                    'salary increase', 'pay raise', 'compensation',
                    
                    // Congés FR
                    'demande de congés', 'validation congés',
                    'congés validés', 'congés refusés',
                    'solde de congés', 'planning des congés',
                    'arrêt maladie', 'arrêt de travail',
                    
                    // Congés EN
                    'leave request', 'vacation request',
                    'time off request', 'pto request',
                    'sick leave', 'medical leave',
                    'leave balance', 'holiday planning'
                ],
                strong: [
                    // RH FR
                    'ressources humaines', 'rh', 'drh',
                    'candidature', 'candidat', 'recrutement',
                    'embauche', 'entretien', 'salaire',
                    'paie', 'congés', 'formation', 'carrière',
                    
                    // RH EN
                    'human resources', 'hr', 'recruitment',
                    'hiring', 'interview', 'salary', 'wages',
                    'payroll', 'vacation', 'training', 'career',
                    'onboarding', 'offboarding', 'benefits'
                ],
                weak: [
                    'équipe', 'team', 'collaborateur', 'employee',
                    'personnel', 'staff', 'poste', 'position'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing',
                    'facture', 'commande client'
                ]
            },

            // GESTION DE PROJET
            project: {
                absolute: [
                    // Suivi projet FR
                    'avancement du projet', 'état du projet',
                    'rapport d\'avancement', 'point projet',
                    'réunion de projet', 'comité de pilotage',
                    'livrable du projet', 'milestone atteint',
                    'jalon du projet', 'planning projet',
                    
                    // Suivi projet EN
                    'project status', 'project update',
                    'progress report', 'project meeting',
                    'steering committee', 'project deliverable',
                    'milestone reached', 'project timeline',
                    'gantt chart', 'project planning',
                    
                    // Outils projet FR
                    'ticket jira', 'issue github', 'merge request',
                    'pull request', 'commit', 'déploiement',
                    'mise en production', 'release note',
                    
                    // Outils projet EN
                    'jira ticket', 'github issue', 'gitlab merge',
                    'code review', 'deployment', 'production release',
                    'sprint planning', 'sprint review', 'retrospective',
                    
                    // Documents projet FR
                    'cahier des charges', 'spécifications',
                    'documentation technique', 'manuel utilisateur',
                    'compte-rendu de réunion', 'pv de réunion',
                    
                    // Documents projet EN
                    'requirements document', 'specifications',
                    'technical documentation', 'user manual',
                    'meeting minutes', 'project charter'
                ],
                strong: [
                    // Projet FR
                    'projet', 'programme', 'chantier', 'mission',
                    'livrable', 'jalon', 'milestone', 'phase',
                    'étape', 'sprint', 'itération', 'release',
                    
                    // Projet EN
                    'project', 'program', 'deliverable', 'phase',
                    'stage', 'sprint', 'iteration', 'backlog',
                    'roadmap', 'timeline', 'deadline', 'planning',
                    
                    // Méthodologie
                    'agile', 'scrum', 'kanban', 'waterfall',
                    'lean', 'devops', 'ci/cd'
                ],
                weak: [
                    'développement', 'development', 'task',
                    'ticket', 'issue', 'bug', 'feature'
                ],
                exclusions: [
                    'facture', 'paiement', 'newsletter',
                    'candidature', 'congés'
                ]
            },

            // COMMERCIAL ET VENTES
            commercial: {
                absolute: [
                    // Opportunités FR
                    'opportunité commerciale', 'nouvelle opportunité',
                    'prospect qualifié', 'lead qualifié',
                    'demande de devis', 'demande de proposition',
                    'appel d\'offres', 'réponse à appel d\'offres',
                    'proposition commerciale', 'offre commerciale',
                    
                    // Opportunités EN
                    'business opportunity', 'sales opportunity',
                    'qualified lead', 'qualified prospect',
                    'quote request', 'rfp', 'rfq',
                    'request for proposal', 'request for quotation',
                    'business proposal', 'commercial offer',
                    
                    // Contrats FR
                    'contrat commercial', 'contrat de vente',
                    'contrat de prestation', 'contrat cadre',
                    'bon de commande', 'commande confirmée',
                    'signature du contrat', 'renouvellement contrat',
                    
                    // Contrats EN
                    'sales contract', 'service contract',
                    'master agreement', 'purchase order',
                    'order confirmation', 'contract signature',
                    'contract renewal', 'sla agreement',
                    
                    // Négociation FR
                    'négociation commerciale', 'conditions commerciales',
                    'remise commerciale', 'offre tarifaire',
                    'grille tarifaire', 'conditions de vente',
                    
                    // Négociation EN
                    'business negotiation', 'commercial terms',
                    'pricing proposal', 'rate card',
                    'terms and conditions', 'sales terms'
                ],
                strong: [
                    // Commercial FR
                    'commercial', 'vente', 'client', 'prospect',
                    'devis', 'contrat', 'commande', 'offre',
                    'négociation', 'deal', 'closing', 'signature',
                    
                    // Commercial EN
                    'sales', 'customer', 'client', 'prospect',
                    'quote', 'contract', 'order', 'proposal',
                    'negotiation', 'deal', 'opportunity', 'lead',
                    
                    // Termes commerciaux
                    'chiffre d\'affaires', 'revenue', 'marge',
                    'margin', 'commission', 'objectif', 'target'
                ],
                weak: [
                    'marché', 'market', 'business', 'affaire',
                    'partenariat', 'partnership', 'accord'
                ],
                exclusions: [
                    'candidature', 'recrutement', 'rh',
                    'bulletin de paie', 'congés', 'formation',
                    'newsletter', 'marketing', 'teamtailor',
                    'workday', 'bamboohr', 'resources humaines'
                ]
            },

            // SUPPORT ET ASSISTANCE
            support: {
                absolute: [
                    // Tickets FR
                    'ticket de support', 'ticket n°', 'ticket #',
                    'numéro de ticket', 'référence ticket',
                    'nouveau ticket', 'ticket résolu', 'ticket fermé',
                    'escalade de ticket', 'priorité du ticket',
                    
                    // Tickets EN
                    'support ticket', 'ticket number', 'ticket id',
                    'case number', 'case #', 'incident number',
                    'ticket resolved', 'ticket closed', 'ticket escalated',
                    'ticket priority', 'sla breach',
                    
                    // Assistance FR
                    'demande d\'assistance', 'demande de support',
                    'assistance technique', 'support technique',
                    'centre d\'aide', 'service client',
                    'sav', 'service après-vente',
                    
                    // Assistance EN
                    'support request', 'help request',
                    'technical support', 'customer support',
                    'help desk', 'service desk', 'it support',
                    'customer service', 'helpdesk ticket',
                    
                    // Résolution FR
                    'problème résolu', 'incident résolu',
                    'solution apportée', 'résolution du problème',
                    'correctif appliqué', 'patch déployé',
                    
                    // Résolution EN
                    'issue resolved', 'problem solved',
                    'incident resolved', 'solution provided',
                    'fix applied', 'patch deployed',
                    'workaround provided', 'resolution'
                ],
                strong: [
                    // Support FR
                    'support', 'assistance', 'aide', 'dépannage',
                    'incident', 'problème', 'panne', 'bug',
                    'dysfonctionnement', 'erreur', 'défaut',
                    
                    // Support EN
                    'support', 'help', 'assistance', 'troubleshooting',
                    'incident', 'issue', 'problem', 'bug',
                    'error', 'failure', 'malfunction', 'defect',
                    
                    // Processus
                    'ticket', 'escalade', 'escalation', 'priorité',
                    'priority', 'sla', 'résolution', 'resolution'
                ],
                weak: [
                    'question', 'demande', 'request', 'besoin',
                    'help', 'aide', 'info', 'information'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing',
                    'facture', 'commande', 'livraison'
                ]
            },

            // LOGISTIQUE ET LIVRAISONS
            logistics: {
                absolute: [
                    // Expédition FR
                    'commande expédiée', 'colis expédié',
                    'envoi effectué', 'numéro de suivi',
                    'tracking number', 'bordereau d\'expédition',
                    'bon de livraison', 'avis d\'expédition',
                    
                    // Expédition EN
                    'order shipped', 'package shipped',
                    'shipment confirmation', 'tracking number',
                    'shipping notice', 'dispatch note',
                    'delivery note', 'waybill',
                    
                    // Livraison FR
                    'livraison prévue', 'date de livraison',
                    'livraison effectuée', 'colis livré',
                    'livraison reportée', 'retard de livraison',
                    'échec de livraison', 'colis en transit',
                    
                    // Livraison EN
                    'delivery scheduled', 'delivery date',
                    'delivered successfully', 'package delivered',
                    'delivery delayed', 'delivery failed',
                    'in transit', 'out for delivery',
                    
                    // Transporteurs FR
                    'chronopost', 'colissimo', 'dhl express',
                    'ups', 'fedex', 'tnt', 'dpd', 'gls',
                    'relais colis', 'point relais',
                    
                    // Stock FR
                    'rupture de stock', 'stock disponible',
                    'réapprovisionnement', 'inventaire',
                    'mouvement de stock', 'entrée en stock'
                ],
                strong: [
                    // Logistique FR
                    'livraison', 'expédition', 'colis', 'commande',
                    'transport', 'transporteur', 'logistique',
                    'stock', 'entrepôt', 'magasin', 'dépôt',
                    
                    // Logistique EN
                    'delivery', 'shipping', 'package', 'parcel',
                    'shipment', 'transport', 'logistics',
                    'warehouse', 'inventory', 'stock', 'supply',
                    
                    // Termes
                    'tracking', 'suivi', 'délai', 'deadline',
                    'ean', 'sku', 'référence', 'quantité'
                ],
                weak: [
                    'envoi', 'send', 'reception', 'receive',
                    'retour', 'return', 'échange', 'exchange'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing',
                    'facture', 'devis', 'contrat'
                ]
            },

            // COMMUNICATION INTERNE
            internal: {
                absolute: [
                    // Annonces FR
                    'à tous les collaborateurs', 'à tout le personnel',
                    'à toute l\'équipe', 'communication interne',
                    'note de service', 'note d\'information',
                    'annonce importante', 'message de la direction',
                    'communiqué interne', 'information du personnel',
                    
                    // Annonces EN
                    'to all employees', 'to all staff',
                    'all hands', 'company announcement',
                    'internal memo', 'staff notice',
                    'important announcement', 'management message',
                    'internal communication', 'company-wide',
                    
                    // Événements internes FR
                    'événement d\'entreprise', 'soirée d\'entreprise',
                    'team building', 'séminaire d\'entreprise',
                    'pot de départ', 'pot d\'arrivée',
                    'anniversaire entreprise', 'fête de fin d\'année',
                    
                    // Événements internes EN
                    'company event', 'corporate event',
                    'team building', 'company seminar',
                    'farewell party', 'welcome party',
                    'company anniversary', 'holiday party',
                    
                    // Organisation FR
                    'nouvel arrivant', 'nouveau collaborateur',
                    'départ de', 'réorganisation', 'changement d\'équipe',
                    'nouvelle organisation', 'organigramme',
                    
                    // Organisation EN
                    'new joiner', 'new employee', 'new hire',
                    'departure of', 'reorganization', 'team change',
                    'organizational change', 'org chart'
                ],
                strong: [
                    // Interne FR
                    'interne', 'entreprise', 'société', 'groupe',
                    'collaborateur', 'équipe', 'service', 'département',
                    'direction', 'management', 'collègue',
                    
                    // Interne EN
                    'internal', 'company', 'corporate', 'organization',
                    'employee', 'staff', 'team', 'department',
                    'management', 'leadership', 'colleague',
                    
                    // Communication
                    'annonce', 'announcement', 'communication',
                    'information', 'message', 'note', 'mémo'
                ],
                weak: [
                    'info', 'update', 'nouvelle', 'news',
                    'changement', 'change', 'évolution'
                ],
                exclusions: [
                    'client', 'customer', 'externe', 'external',
                    'newsletter', 'marketing', 'commercial'
                ]
            },

            // JURIDIQUE ET CONFORMITÉ
            legal: {
                absolute: [
                    // Documents juridiques FR
                    'contrat juridique', 'avenant au contrat',
                    'conditions générales', 'cgv', 'cgu',
                    'mentions légales', 'clause de confidentialité',
                    'accord de confidentialité', 'nda',
                    'procès-verbal', 'acte juridique',
                    
                    // Documents juridiques EN
                    'legal contract', 'contract amendment',
                    'terms and conditions', 'terms of service',
                    'privacy policy', 'confidentiality agreement',
                    'non-disclosure agreement', 'legal notice',
                    'legal document', 'binding agreement',
                    
                    // Conformité FR
                    'mise en conformité', 'audit de conformité',
                    'rgpd', 'protection des données',
                    'conformité réglementaire', 'obligations légales',
                    'déclaration cnil', 'dpo',
                    
                    // Conformité EN
                    'compliance audit', 'regulatory compliance',
                    'gdpr', 'data protection', 'privacy compliance',
                    'legal obligations', 'regulatory requirements',
                    'data privacy officer', 'compliance officer',
                    
                    // Litiges FR
                    'mise en demeure', 'contentieux', 'litige',
                    'procédure judiciaire', 'assignation',
                    'médiation', 'arbitrage', 'conciliation',
                    
                    // Litiges EN
                    'legal notice', 'litigation', 'dispute',
                    'legal proceedings', 'court summons',
                    'mediation', 'arbitration', 'settlement'
                ],
                strong: [
                    // Juridique FR
                    'juridique', 'légal', 'réglementaire', 'conformité',
                    'contrat', 'clause', 'article', 'paragraphe',
                    'loi', 'règlement', 'directive', 'norme',
                    
                    // Juridique EN
                    'legal', 'regulatory', 'compliance', 'contract',
                    'clause', 'article', 'paragraph', 'law',
                    'regulation', 'directive', 'standard', 'policy',
                    
                    // Termes
                    'avocat', 'lawyer', 'juriste', 'counsel',
                    'signature', 'paraphe', 'visa', 'accord'
                ],
                weak: [
                    'document', 'dossier', 'file', 'accord',
                    'agreement', 'termes', 'terms'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing',
                    'facture', 'commande', 'livraison'
                ]
            },

            // NOTIFICATIONS SYSTÈME
            notifications: {
                absolute: [
                    // Automatique FR
                    'message automatique', 'notification automatique',
                    'email automatique', 'réponse automatique',
                    'ne pas répondre', 'no-reply', 'noreply',
                    'donotreply', 'ceci est un message automatique',
                    'message système', 'notification système',
                    
                    // Automatique EN
                    'automated message', 'automatic notification',
                    'system notification', 'auto-generated',
                    'do not reply', 'automated email',
                    'system message', 'automatic reply',
                    
                    // Alertes système FR
                    'alerte système', 'maintenance prévue',
                    'interruption de service', 'mise à jour système',
                    'sauvegarde automatique', 'rapport automatique',
                    'export automatique', 'synchronisation',
                    
                    // Alertes système EN
                    'system alert', 'scheduled maintenance',
                    'service interruption', 'system update',
                    'automatic backup', 'automated report',
                    'automatic export', 'sync completed',
                    
                    // Confirmations FR
                    'confirmation automatique', 'accusé de réception',
                    'email de confirmation', 'inscription confirmée',
                    'compte créé', 'abonnement confirmé',
                    
                    // Confirmations EN
                    'automatic confirmation', 'acknowledgment',
                    'confirmation email', 'registration confirmed',
                    'account created', 'subscription confirmed'
                ],
                strong: [
                    // Système FR
                    'système', 'automatique', 'automatisé', 'robot',
                    'serveur', 'application', 'plateforme', 'service',
                    'notification', 'alerte', 'message', 'avis',
                    
                    // Système EN
                    'system', 'automatic', 'automated', 'bot',
                    'server', 'application', 'platform', 'service',
                    'notification', 'alert', 'message', 'notice',
                    
                    // Technique
                    'api', 'webhook', 'cron', 'batch',
                    'scheduled', 'triggered', 'event'
                ],
                weak: [
                    'info', 'information', 'update', 'statut',
                    'status', 'confirmé', 'confirmed'
                ],
                exclusions: [
                    'urgent', 'action requise', 'important',
                    'réponse attendue', 'merci de'
                ]
            },

            // RAPPELS ET RELANCES
            reminders: {
                absolute: [
                    // Rappels FR
                    'rappel:', 'rappel amical', 'petit rappel',
                    'rappel de relance', 'dernier rappel',
                    'rappel urgent', 'rappel - ', '[rappel]',
                    'ceci est un rappel', 'message de rappel',
                    
                    // Rappels EN
                    'reminder:', 'friendly reminder', 'gentle reminder',
                    'quick reminder', 'final reminder', 'last reminder',
                    'urgent reminder', 'reminder -', '[reminder]',
                    'this is a reminder', 'reminder message',
                    
                    // Relances FR
                    'relance:', 'première relance', 'deuxième relance',
                    'dernière relance', 'relance amiable',
                    'je me permets de relancer', 'suite à mon précédent',
                    'sans réponse de votre part', 'resté sans réponse',
                    
                    // Relances EN
                    'follow up:', 'follow-up:', 'following up',
                    'first follow up', 'second follow up',
                    'final follow up', 'circling back',
                    'as per my previous', 'haven\'t heard back',
                    
                    // Formules FR
                    'comme convenu', 'suite à notre échange',
                    'suite à notre conversation', 'pour faire suite',
                    'en attente de votre retour', 'dans l\'attente',
                    
                    // Formules EN
                    'as discussed', 'as agreed', 'as mentioned',
                    'per our conversation', 'following our call',
                    'awaiting your response', 'pending your reply'
                ],
                strong: [
                    // Relance FR
                    'relance', 'rappel', 'suite', 'retour',
                    'réponse', 'feedback', 'attente', 'urgent',
                    'précédent', 'dernier', 'final',
                    
                    // Relance EN
                    'follow', 'reminder', 'response', 'reply',
                    'feedback', 'waiting', 'pending', 'previous',
                    'last', 'final', 'chase', 'nudge'
                ],
                weak: [
                    'encore', 'still', 'toujours', 'always',
                    'déjà', 'already', 'bientôt', 'soon'
                ],
                exclusions: [
                    'première fois', 'first time', 'nouveau',
                    'initial', 'introduction', 'présentation'
                ]
            },

            // COPIE (CC)
            cc: {
                absolute: [
                    // CC FR
                    'pour information', 'pour info', 'fyi',
                    'en copie pour information', 'copie pour info',
                    'mis en copie', 'cc pour info', 'cc:',
                    'pour votre information', 'à titre informatif',
                    
                    // CC EN
                    'for your information', 'for info only',
                    'cc\'d for visibility', 'copied for info',
                    'cc:', 'carbon copy', 'courtesy copy',
                    'for reference', 'for your records',
                    
                    // Formules FR
                    'je vous mets en copie', 'mis en copie de',
                    'en copie de ce mail', 'pour suivi',
                    'pour archive', 'pour connaissance',
                    
                    // Formules EN
                    'copying you', 'cc\'ing you', 'looping you in',
                    'keeping you informed', 'for awareness',
                    'for visibility', 'keeping you posted'
                ],
                strong: [
                    // Info FR
                    'information', 'copie', 'connaissance', 'suivi',
                    'visibilité', 'transparence', 'partage',
                    
                    // Info EN
                    'information', 'copy', 'awareness', 'visibility',
                    'transparency', 'sharing', 'reference'
                ],
                weak: [
                    'info', 'cc', 'copie', 'copy'
                ],
                exclusions: [
                    'action requise', 'urgent', 'réponse attendue',
                    'merci de', 'veuillez', 'important'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        // Synchronisation automatique toutes les 2 secondes
        setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
        // Synchronisation immédiate lors des changements
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        // Écouter les changements dans localStorage
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
        
        // Appliquer le changement dans les settings locaux
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
        
        // Sauvegarder immédiatement
        this.saveSettingsToStorage();
        
        // Notifier les modules si demandé
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
                    console.log('[CategoryManager] → EmailScanner: taskPreselectedCategories');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    // Forcer la re-catégorisation
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
                    
                case 'categoryExclusions':
                case 'preferences':
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ [type]: value });
                    }
                    break;
            }
        }
        
        // AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            if (type === 'taskPreselectedCategories') {
                console.log('[CategoryManager] → AITaskAnalyzer: taskPreselectedCategories');
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
            if (type === 'automationSettings') {
                console.log('[CategoryManager] → AITaskAnalyzer: automationSettings');
                if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                    window.aiTaskAnalyzer.updateAutomationSettings(value);
                }
            }
        }
        
        // StartScan/MinimalScanModule
        if (window.minimalScanModule || window.scanStartModule || window.unifiedScanModule) {
            const scanner = window.unifiedScanModule || window.minimalScanModule || window.scanStartModule;
            if (type === 'taskPreselectedCategories' || type === 'scanSettings') {
                console.log('[CategoryManager] → ScanModule:', type);
                if (typeof scanner.updateSettings === 'function') {
                    scanner.updateSettings({ [type]: value });
                }
            }
        }
        
        // PageManager
        if (window.pageManager) {
            console.log('[CategoryManager] → PageManager:', type);
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
            }
        }
    }

    notifyAllModules(type, value) {
        // Dispatch événements globaux
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
        
        // Notifier les listeners enregistrés
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
    }

    // ================================================
    // API PUBLIQUE POUR CHANGEMENTS DE PARAMÈTRES
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
        // Ajouter à la queue de synchronisation
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        // Traitement immédiat si pas en cours
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Invalider le cache
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

    updateCategoryExclusions(exclusions, notifyModules = true) {
        console.log('[CategoryManager] 🚫 updateCategoryExclusions:', exclusions);
        
        this.syncQueue.push({
            type: 'categoryExclusions',
            value: exclusions,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updatePreferences(preferences, notifyModules = true) {
        console.log('[CategoryManager] ⚙️ updatePreferences:', preferences);
        
        this.syncQueue.push({
            type: 'preferences',
            value: preferences,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateScanSettings(scanSettings, notifyModules = true) {
        console.log('[CategoryManager] 🔍 updateScanSettings:', scanSettings);
        
        this.syncQueue.push({
            type: 'scanSettings',
            value: scanSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateAutomationSettings(automationSettings, notifyModules = true) {
        console.log('[CategoryManager] 🤖 updateAutomationSettings:', automationSettings);
        
        this.syncQueue.push({
            type: 'automationSettings',
            value: automationSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
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

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.settings = this.loadSettings();
        
        // Détecter les changements et notifier
        const changes = this.detectSettingsChanges(oldSettings, this.settings);
        changes.forEach(change => {
            this.notifySpecificModules(change.type, change.value);
        });
    }

    detectSettingsChanges(oldSettings, newSettings) {
        const changes = [];
        
        const criticalFields = [
            'taskPreselectedCategories',
            'activeCategories', 
            'categoryExclusions',
            'scanSettings',
            'automationSettings',
            'preferences'
        ];
        
        criticalFields.forEach(field => {
            const oldValue = JSON.stringify(oldSettings[field] || {});
            const newValue = JSON.stringify(newSettings[field] || {});
            
            if (oldValue !== newValue) {
                changes.push({
                    type: field,
                    value: newSettings[field],
                    oldValue: oldSettings[field]
                });
            }
        });
        
        return changes;
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

    // ================================================
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES
    // ================================================
    getSettings() {
        // Toujours retourner une copie fraîche
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        // Vérifier le cache avec une durée de vie de 10 secondes
        const now = Date.now();
        const CACHE_DURATION = 10000; // 10 secondes
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            // Retourner depuis le cache sans logger
            return [...this._taskCategoriesCache];
        }
        
        // Récupérer les catégories fraîches
        const categories = this.settings.taskPreselectedCategories || [];
        
        // Mettre à jour le cache
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        // Log seulement si changement ou première fois
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
        // Si activeCategories est null, toutes les catégories sont actives
        if (!this.settings.activeCategories) {
            // Retourner TOUTES les catégories (standard + personnalisées)
            const allCategories = Object.keys(this.categories);
            console.log('[CategoryManager] Toutes catégories actives:', allCategories);
            return allCategories;
        }
        
        // Sinon retourner seulement les catégories marquées comme actives
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

    // ================================================
    // SYSTÈME D'ÉCOUTE POUR AUTRES MODULES
    // ================================================
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        // Retourner une fonction pour supprimer le listener
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                // Ajouter la catégorie
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                // IMPORTANT: Charger les mots-clés sauvegardés
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    // Initialiser avec des tableaux vides
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
                console.log(`  - Keywords object:`, this.weightedKeywords[id]);
                
                if (totalKeywords === 0) {
                    console.warn(`  ⚠️ AUCUN MOT-CLÉ - La catégorie ne pourra pas détecter d'emails!`);
                }
                
                // S'assurer que la catégorie est active
                if (this.settings.activeCategories === null) {
                    // Si null, toutes sont actives par défaut
                    console.log(`  ✅ Catégorie active par défaut`);
                } else if (Array.isArray(this.settings.activeCategories)) {
                    if (!this.settings.activeCategories.includes(id)) {
                        console.log(`  ➕ Ajout aux catégories actives`);
                        this.settings.activeCategories.push(id);
                        this.saveSettingsToStorage();
                    }
                }
            });
            
            console.log('[CategoryManager] 📊 Résumé:');
            console.log('  - Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
            console.log('  - Total catégories:', Object.keys(this.categories).length);
            
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
        this.weightedKeywords[id] = {
            absolute: category.keywords.absolute || [],
            strong: category.keywords.strong || [],
            weak: category.keywords.weak || [],
            exclusions: category.keywords.exclusions || []
        };

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
        
        // Mettre à jour les mots-clés si fournis
        if (updates.keywords) {
            this.weightedKeywords[categoryId] = {
                absolute: updates.keywords.absolute || [],
                strong: updates.keywords.strong || [],
                weak: updates.keywords.weak || [],
                exclusions: updates.keywords.exclusions || []
            };
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
            const newPreselected = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.updateTaskPreselectedCategories(newPreselected);
        }

        // Retirer des catégories actives si présente
        if (this.settings.activeCategories?.includes(categoryId)) {
            const newActive = this.settings.activeCategories.filter(id => id !== categoryId);
            this.updateActiveCategories(newActive);
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

        console.log(`[CategoryManager] Mise à jour mots-clés pour ${categoryId}:`, keywords);

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
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) {
            return {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            };
        }
        
        return {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || [],
            exclusions: keywords.exclusions || []
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
            this.weightedKeywords[categoryId][type] = this.weightedKeywords[categoryId][type].filter(k => k !== normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    getAllKeywords() {
        return { ...this.weightedKeywords };
    }

    // ================================================
    // ANALYSE ET CATÉGORISATION D'EMAILS
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérifier les exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // Détecter les emails familiaux/personnels AVANT tout
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
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC, vérifier d'abord si c'est du marketing
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
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
            
            const allResults = this.analyzeAllCategories(content);
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
                    isCC: true
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
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
        // CORRECTION CRITIQUE: Si aucune catégorie trouvée, retourner explicitement 'other'
        if (!selectedResult || selectedResult.category === 'other' || selectedResult.score === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched'
            };
        }
        
        return selectedResult;
    }

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
        
        // Compter les indicateurs personnels
        let personalScore = 0;
        personalIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        });
        
        // Réduire le score si des indicateurs professionnels sont présents
        let professionalScore = 0;
        professionalCounterIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                professionalScore += 10;
            }
        });
        
        // Email personnel si score personnel > 20 ET score professionnel < 10
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

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // IMPORTANT: Toujours inclure TOUTES les catégories personnalisées
        const customCategoryIds = Object.keys(this.customCategories);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🎯 Analyse avec:');
            console.log('  - Catégories actives:', activeCategories);
            console.log('  - Catégories personnalisées:', customCategoryIds);
        }
        
        // Analyser toutes les catégories (standard + personnalisées)
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.weightedKeywords),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            // Vérifier si la catégorie est active OU personnalisée OU spéciale
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['marketing_news', 'cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            // Vérifier que la catégorie existe
            if (!this.categories[categoryId]) {
                console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} non trouvée`);
                continue;
            }
            
            // Obtenir les mots-clés (depuis weightedKeywords ou catégorie personnalisée)
            let keywords = this.weightedKeywords[categoryId];
            
            // Pour les catégories personnalisées, charger depuis customCategories si nécessaire
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                    // S'assurer que les mots-clés sont dans weightedKeywords
                    this.weightedKeywords[categoryId] = keywords;
                }
            }
            
            // Vérifier si la catégorie a des mots-clés
            if (!keywords || this.isEmptyKeywords(keywords)) {
                if (isCustom) {
                    console.warn(`[CategoryManager] ⚠️ Catégorie personnalisée ${categoryId} (${this.categories[categoryId]?.name}) sans mots-clés`);
                }
                continue;
            }
            
            // Calculer le score
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
            
            if (this.debugMode && score.total > 0) {
                console.log(`[CategoryManager] 📊 ${categoryId}: ${score.total}pts (${score.matches.length} matches)`);
            }
        }
        
        return results;
    }

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    selectByPriorityWithThreshold(results) {
        // SEUILS AJUSTÉS pour avoir des emails "other"
        const MIN_SCORE_THRESHOLD = 30; // Augmenté pour être plus sélectif
        const MIN_CONFIDENCE_THRESHOLD = 0.5; // Augmenté pour plus de précision
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Si un a un match absolu et pas l'autre, privilégier celui avec absolu
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Priorité d'abord
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Puis score
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📊 Scores par catégorie:');
            sortedResults.forEach(r => {
                console.log(`  - ${r.category}: ${r.score}pts (priority: ${r.priority}, confidence: ${r.confidence}, hasAbsolute: ${r.hasAbsolute})`);
            });
        }
        
        const bestResult = sortedResults[0];
        
        if (bestResult) {
            console.log(`[CategoryManager] ✅ Catégorie sélectionnée: ${bestResult.category} (${bestResult.score}pts, ${Math.round(bestResult.confidence * 100)}%)`);
            return {
                category: bestResult.category,
                score: bestResult.score,
                confidence: bestResult.confidence,
                matchedPatterns: bestResult.matches,
                hasAbsolute: bestResult.hasAbsolute
            };
        }
        
        // CORRECTION CRITIQUE: Si aucun résultat au-dessus du seuil, vérifier si fallback possible
        const allSorted = Object.values(results)
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score);
        
        // NOUVEAU: Fallback plus strict - seulement si score >= 20 ET confiance >= 0.4
        if (allSorted.length > 0 && allSorted[0].score >= 20 && allSorted[0].confidence >= 0.4) {
            const fallback = allSorted[0];
            console.log(`[CategoryManager] 📌 Utilisation fallback: ${fallback.category} (${fallback.score}pts, ${Math.round(fallback.confidence * 100)}%)`);
            return {
                category: fallback.category,
                score: fallback.score,
                confidence: fallback.confidence,
                matchedPatterns: fallback.matches,
                hasAbsolute: fallback.hasAbsolute
            };
        }
        
        // CORRECTION FINALE: Retourner explicitement "other" si rien ne correspond
        console.log('[CategoryManager] 📌 Aucune catégorie correspondante, classification "other"');
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false,
            reason: 'below_threshold'
        };
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // NOUVEAU: Pénalité forte pour les catégories professionnelles si email personnel détecté
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille'];
        const hasPersonalContent = personalIndicators.some(indicator => text.includes(indicator));
        
        if (hasPersonalContent && ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
            totalScore -= 50; // Forte pénalité
            matches.push({ keyword: 'personal_content_penalty', type: 'penalty', score: -50 });
        }
        
        // Bonus de base pour certaines catégories souvent mal détectées
        const categoryBonus = {
            'project': 10,
            'cc': 5,
            'security': 10,
            'hr': 10,
            'tasks': 15,
            'finance': 10,
            'marketing_news': 5 // Petit bonus pour marketing
        };
        
        if (categoryBonus[categoryId]) {
            totalScore += categoryBonus[categoryId];
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus[categoryId] });
        }
        
        // Bonus spécial pour détection de plateformes RH
        if (categoryId === 'hr' && content.domain) {
            const hrPlatforms = ['teamtailor', 'workday', 'bamboohr', 'welcometothejungle', 'indeed', 'linkedin'];
            hrPlatforms.forEach(platform => {
                if (content.domain.includes(platform)) {
                    totalScore += 60;
                    matches.push({ keyword: `${platform}_domain`, type: 'domain_bonus', score: 60 });
                    hasAbsolute = true;
                }
            });
        }
        
        // Test des exclusions en premier
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    let penalty = 50;
                    
                    // Pénalité plus forte pour contenu personnel dans catégories professionnelles
                    if (personalIndicators.includes(exclusion) && 
                        ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
                        penalty = 100;
                    }
                    
                    totalScore -= penalty;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -penalty });
                }
            }
        }
        
        // Test des mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus supplémentaire si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 40;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            // Bonus si plusieurs mots-clés forts matchent
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong_matches', type: 'bonus', score: 30 });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
            
            // Bonus si beaucoup de mots faibles matchent
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        // Appliquer bonus de domaine
        this.applyEnhancedDomainBonus(content, categoryId, matches, totalScore);
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    applyEnhancedDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security', 'auth', '2fa', 'verification'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe', 'invoice', 'billing'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing', 'sendinblue', 'mailjet'],
            notifications: ['noreply', 'notification', 'donotreply', 'automated', 'system'],
            project: ['github', 'gitlab', 'jira', 'asana', 'trello', 'confluence', 'bitbucket'],
            hr: ['workday', 'bamboohr', 'adp', 'payroll', 'hr', 'recruiting', 'teamtailor', 'welcometothejungle'],
            meetings: ['zoom', 'teams', 'meet', 'webex', 'gotomeeting', 'calendar'],
            support: ['zendesk', 'freshdesk', 'helpdesk', 'support', 'ticket'],
            logistics: ['ups', 'fedex', 'dhl', 'chronopost', 'colissimo', 'dpd', 'gls']
        };
        
        if (domainBonuses[categoryId] && content.domain) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = 40; // Bonus uniforme plus élevé
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
        
        // IMPORTANT: Traiter le sujet avec un poids très élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            // Répéter le sujet 10 fois pour lui donner beaucoup plus de poids
            allText += (email.subject + ' ').repeat(10);
        } else {
            // Si pas de sujet, ajouter un marqueur pour la détection
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        // Extraire l'expéditeur
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(3);
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(3);
        }
        
        // Extraire les destinataires (important pour détecter si on est en copie)
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
        
        // Extraire les CC
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
        
        // Extraire le contenu du corps
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
            
            // Extraire les mots importants du corps (en majuscules)
            const importantWords = cleanedBody.match(/\b[A-Z]{2,}\b/g);
            if (importantWords) {
                allText += importantWords.join(' ') + ' ';
            }
        }
        
        // Analyser le contexte de l'email pour détecter des patterns
        const contextClues = this.extractContextClues(email);
        allText += contextClues + ' ';
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            rawSubject: email.subject || ''
        };
    }

    extractContextClues(email) {
        let clues = '';
        
        // Détecter les patterns de réponse/transfert
        const subject = email.subject || '';
        if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
            clues += ' conversation reply response ';
        }
        
        // Détecter les mentions de documents
        const body = email.body?.content || email.bodyPreview || '';
        if (body.match(/ci-joint|attached|attachment|pièce jointe|document/i)) {
            clues += ' document attachment piece jointe ';
        }
        
        // Détecter les formules de politesse familiales
        if (body.match(/\b(papa|maman|bises|bisous)\b/i)) {
            clues += ' famille family personal personnel ';
        }
        
        // Détecter les mentions commerciales
        if (body.match(/\b(commande|order|facture|invoice|livraison|delivery|n°|numéro)\b/i)) {
            clues += ' commerce order commande achat vente ';
        }
        
        // Détecter les patterns RH/recrutement
        if (body.match(/\b(candidature|recrutement|recruiting|cv|profil|poste)\b/i)) {
            clues += ' hr recrutement candidature recruitment ';
        }
        
        return clues;
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
        
        // Normalisation complète pour gérer tous les cas
        const normalizedText = text.toLowerCase()
            .normalize('NFD') // Décomposer les caractères accentués
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[éèêëÉÈÊË]/gi, 'e')
            .replace(/[àâäÀÂÄ]/gi, 'a')
            .replace(/[ùûüÙÛÜ]/gi, 'u')
            .replace(/[çÇ]/gi, 'c')
            .replace(/[îïÎÏ]/gi, 'i')
            .replace(/[ôöÔÖ]/gi, 'o')
            .replace(/['']/g, "'") // Normaliser les apostrophes
            .replace(/[-_]/g, ' ') // Remplacer tirets et underscores par espaces
            .replace(/\s+/g, ' ') // Normaliser les espaces multiples
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
        
        // Recherche avec word boundaries pour éviter les faux positifs
        // Par exemple, ne pas matcher "commande" dans "commander"
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        
        return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\    getTaskPreselectedCategories() {
        // Vérifier le cache avec une durée de vie de');
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
        // Si pas de CC, ce n'est pas un email en CC
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé');
            return false;
        }
        
        // Vérifier si l'utilisateur est dans TO
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        // Vérifier si l'utilisateur est dans CC
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        // IMPORTANT: On est en CC seulement si on est dans CC ET PAS dans TO
        const result = isInCCList && !isInToList;
        
        if (result) {
            console.log('[CategoryManager] 📋 Email en CC détecté (pas destinataire principal):', {
                subject: email.subject?.substring(0, 50),
                inTo: isInToList,
                inCC: isInCCList
            });
        }
        
        return result;
    }

    getCurrentUserEmail() {
        try {
            // Essayer plusieurs sources
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            // Essayer depuis le token MSAL
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
            // Essayer depuis AuthService
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

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        // Vérifier les domaines exclus
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Vérifier les emails exclus
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
    }

    // ================================================
    // GESTION DES FILTRES PAR CATÉGORIE
    // ================================================
    getCategoryFilters(categoryId) {
        if (!this.categories[categoryId]) {
            return {
                includeDomains: [],
                excludeDomains: [],
                includeEmails: [],
                excludeEmails: []
            };
        }
        
        // Charger depuis le stockage ou utiliser les valeurs par défaut
        const filters = this.categoryFilters?.[categoryId] || this.categories[categoryId].filters || {
            includeDomains: [],
            excludeDomains: [],
            includeEmails: [],
            excludeEmails: []
        };
        
        return {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
    }

    updateCategoryFilters(categoryId, filters) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        console.log(`[CategoryManager] Mise à jour filtres pour ${categoryId}:`, filters);
        
        // Initialiser si nécessaire
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        // Si c'est une catégorie personnalisée, sauvegarder
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].filters = this.categoryFilters[categoryId];
            this.saveCustomCategories();
        } else {
            // Pour les catégories standard, sauvegarder dans localStorage séparément
            this.saveCategoryFilters();
        }
        
        console.log(`[CategoryManager] Filtres mis à jour pour ${categoryId}`);
        
        // Notifier les changements
        setTimeout(() => {
            this.dispatchEvent('categoryFiltersUpdated', { 
                categoryId, 
                filters: this.categoryFilters[categoryId] 
            });
        }, 10);
    }

    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters || {}));
            console.log('[CategoryManager] Filtres de catégories sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde filtres:', error);
        }
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

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
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
            preselectedCategories: this.settings.taskPreselectedCategories?.length || 0,
            totalKeywords: 0,
            absoluteKeywords: 0,
            strongKeywords: 0,
            weakKeywords: 0,
            exclusionKeywords: 0
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.absoluteKeywords += keywords.absolute.length;
            if (keywords.strong) stats.strongKeywords += keywords.strong.length;
            if (keywords.weak) stats.weakKeywords += keywords.weak.length;
            if (keywords.exclusions) stats.exclusionKeywords += keywords.exclusions.length;
        }
        
        stats.totalKeywords = stats.absoluteKeywords + stats.strongKeywords + stats.weakKeywords + stats.exclusionKeywords;
        return stats;
    }

    // ================================================
    // MÉTHODES DE TEST ET DEBUG
    // ================================================
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }
    
    testEmail(subject, body = '', from = 'test@example.com', expectedCategory = null) {
        const testEmail = {
            subject: subject,
            body: { content: body },
            bodyPreview: body.substring(0, 100),
            from: { emailAddress: { address: from } },
            toRecipients: [{ emailAddress: { address: 'user@example.com' } }],
            receivedDateTime: new Date().toISOString()
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log('\n[CategoryManager] TEST RESULT:');
        console.log(`Subject: "${subject}"`);
        console.log(`From: ${from}`);
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

    testKeywords(categoryId, testText) {
        const keywords = this.getCategoryKeywords(categoryId);
        if (!keywords) {
            console.error(`[CategoryManager] Catégorie ${categoryId} non trouvée`);
            return null;
        }

        const content = {
            text: testText.toLowerCase(),
            subject: testText.toLowerCase(),
            domain: 'test.com'
        };

        const result = this.calculateScore(content, keywords, categoryId);
        
        console.log(`\n[CategoryManager] TEST KEYWORDS - ${categoryId}:`);
        console.log(`Text: "${testText}"`);
        console.log(`Score: ${result.total}pts`);
        console.log(`Has Absolute: ${result.hasAbsolute}`);
        console.log(`Matches:`, result.matches);
        console.log(`Confidence: ${Math.round(this.calculateConfidence(result) * 100)}%`);
        
        return result;
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC COMPLET CategoryManager');
        
        // 1. Vérifier les catégories
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        
        // Vérifier les catégories personnalisées
        customCategories.forEach(catId => {
            const cat = this.categories[catId];
            const keywords = this.weightedKeywords[catId];
            const isActive = activeCategories.includes(catId);
            const keywordCount = this.getTotalKeywordsCount(catId);
            
            console.log(`\n${cat.icon} ${cat.name} (${catId}):`);
            console.log('  - Active:', isActive ? '✅' : '❌');
            console.log('  - Priorité:', cat.priority);
            console.log('  - Mots-clés:', keywordCount);
            
            if (keywordCount === 0) {
                console.warn('  ⚠️ AUCUN MOT-CLÉ DÉFINI!');
            }
        });
        console.groupEnd();
        
        // 2. Vérifier l'efficacité des catégories
        console.group('📊 Efficacité des catégories');
        Object.entries(this.weightedKeywords).forEach(([catId, keywords]) => {
            const totalKeywords = this.getTotalKeywordsCount(catId);
            const absoluteCount = keywords.absolute?.length || 0;
            const efficiency = totalKeywords > 0 ? Math.round((absoluteCount / totalKeywords) * 100) : 0;
            
            if (efficiency < 30 && totalKeywords > 0) {
                const cat = this.categories[catId];
                console.warn(`⚠️ ${cat.icon} ${cat.name}: ${efficiency}% d'efficacité (${absoluteCount} absolus sur ${totalKeywords} total)`);
            }
        });
        console.groupEnd();
        
        // 3. Vérifier la synchronisation
        console.group('🔄 État de synchronisation');
        console.log('Queue de sync:', this.syncQueue.length);
        console.log('Sync en cours:', this.syncInProgress);
        console.log('Dernière sync:', new Date(this.lastSyncTimestamp).toLocaleTimeString());
        console.log('Listeners actifs:', this.changeListeners.size);
        console.groupEnd();
        
        // 4. Recommandations
        console.group('💡 Recommandations');
        
        // Catégories sans mots-clés
        const emptyCats = allCategories.filter(catId => this.getTotalKeywordsCount(catId) === 0);
        if (emptyCats.length > 0) {
            console.warn('Catégories sans mots-clés:', emptyCats);
        }
        
        // Catégories peu efficaces
        const inefficientCats = Object.entries(this.weightedKeywords)
            .filter(([catId, keywords]) => {
                const total = this.getTotalKeywordsCount(catId);
                const absolute = keywords.absolute?.length || 0;
                return total > 0 && (absolute / total) < 0.3;
            })
            .map(([catId]) => this.categories[catId]?.name || catId);
        
        if (inefficientCats.length > 0) {
            console.warn('Catégories peu efficaces (< 30% mots absolus):', inefficientCats);
            console.log('→ Ajoutez plus de mots-clés absolus pour améliorer la détection');
        }
        
        console.groupEnd();
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            emptyCategoriesCount: emptyCats.length,
            inefficientCategoriesCount: inefficientCats.length
        };
    }

    exportKeywords() {
        const data = {
            exportDate: new Date().toISOString(),
            categories: {},
            customCategories: this.customCategories
        };

        Object.entries(this.categories).forEach(([id, category]) => {
            data.categories[id] = {
                name: category.name,
                description: category.description,
                keywords: this.getCategoryKeywords(id)
            };
        });

        return JSON.stringify(data, null, 2);
    }

    importKeywords(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.categories) {
                Object.entries(data.categories).forEach(([categoryId, categoryData]) => {
                    if (this.categories[categoryId] && categoryData.keywords) {
                        this.updateCategoryKeywords(categoryId, categoryData.keywords);
                    }
                });
            }

            if (data.customCategories) {
                Object.entries(data.customCategories).forEach(([categoryId, categoryData]) => {
                    if (!this.customCategories[categoryId]) {
                        this.createCustomCategory(categoryData);
                    }
                });
            }

            console.log('[CategoryManager] Mots-clés importés avec succès');
            return true;
            
        } catch (error) {
            console.error('[CategoryManager] Erreur import mots-clés:', error);
            return false;
        }
    }

    // ================================================
    // LISTENER POUR ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter seulement les événements externes (pas les nôtres)
        this.externalSettingsChangeHandler = (event) => {
            // Ignorer nos propres événements
            if (event.detail?.source === 'CategoryManager') {
                return;
            }
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
            // Appliquer sans notifier (pour éviter les boucles)
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

    // ================================================
    // MÉTHODES DE VALIDATION
    // ================================================
    validateKeywords(keywords) {
        const errors = [];
        const types = ['absolute', 'strong', 'weak', 'exclusions'];
        
        types.forEach(type => {
            if (keywords[type] && !Array.isArray(keywords[type])) {
                errors.push(`${type} doit être un tableau`);
            }
            
            if (keywords[type]) {
                keywords[type].forEach((keyword, index) => {
                    if (typeof keyword !== 'string') {
                        errors.push(`${type}[${index}] doit être une chaîne`);
                    }
                    if (keyword.length < 2) {
                        errors.push(`${type}[${index}] trop court (min 2 caractères)`);
                    }
                    if (keyword.length > 100) {
                        errors.push(`${type}[${index}] trop long (max 100 caractères)`);
                    }
                });
            }
        });
        
        return errors;
    }

    sanitizeKeywords(keywords) {
        const sanitized = {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
        
        Object.keys(sanitized).forEach(type => {
            if (keywords[type] && Array.isArray(keywords[type])) {
                sanitized[type] = keywords[type]
                    .filter(k => typeof k === 'string' && k.trim().length >= 2)
                    .map(k => k.trim().toLowerCase())
                    .filter((k, index, arr) => arr.indexOf(k) === index); // Dédoublonner
            }
        });
        
        return sanitized;
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE
    // ================================================
    cleanupOrphanedKeywords() {
        const validCategoryIds = Object.keys(this.categories);
        const orphanedIds = Object.keys(this.weightedKeywords)
            .filter(id => !validCategoryIds.includes(id));
        
        orphanedIds.forEach(id => {
            console.log(`[CategoryManager] Suppression mots-clés orphelins pour: ${id}`);
            delete this.weightedKeywords[id];
        });
        
        return orphanedIds.length;
    }

    rebuildKeywordsIndex() {
        console.log('[CategoryManager] Reconstruction de l\'index des mots-clés...');
        
        // Réinitialiser avec les mots-clés par défaut
        this.initializeWeightedDetection();
        
        // Recharger les catégories personnalisées
        Object.entries(this.customCategories).forEach(([id, category]) => {
            if (category.keywords) {
                this.weightedKeywords[id] = this.sanitizeKeywords(category.keywords);
            }
        });
        
        console.log('[CategoryManager] Index des mots-clés reconstruit');
    }

    // ================================================
    // MÉTHODES DE DEBUG AMÉLIORÉES
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            syncInProgress: this.syncInProgress,
            syncQueueLength: this.syncQueue.length,
            lastSyncTimestamp: this.lastSyncTimestamp,
            changeListenersCount: this.changeListeners.size,
            eventListenersSetup: this.eventListenersSetup,
            settings: this.settings,
            taskPreselectedCategories: this.getTaskPreselectedCategories(),
            activeCategories: this.getActiveCategories(),
            totalCategories: Object.keys(this.categories).length,
            customCategoriesCount: Object.keys(this.customCategories).length
        };
    }

    // Force la synchronisation immédiate de tous les modules
    forceSyncAllModules() {
        console.log('[CategoryManager] 🚀 === SYNCHRONISATION FORCÉE TOUS MODULES ===');
        
        const criticalSettings = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'scanSettings',
            'automationSettings',
            'preferences'
        ];
        
        criticalSettings.forEach(settingType => {
            const value = this.settings[settingType];
            if (value !== undefined) {
                console.log(`[CategoryManager] 🔄 Force sync: ${settingType}`, value);
                this.notifySpecificModules(settingType, value);
            }
        });
        
        // Notification générale finale
        this.notifyAllModules('fullSync', this.settings);
        
        console.log('[CategoryManager] ✅ Synchronisation forcée terminée');
    }

    // Test complet de synchronisation
    testSynchronization() {
        console.group('🧪 TEST SYNCHRONISATION CategoryManager');
        
        const debugInfo = this.getDebugInfo();
        console.log('Debug Info:', debugInfo);
        
        // Test modification taskPreselectedCategories
        const originalCategories = [...this.getTaskPreselectedCategories()];
        const testCategories = ['tasks', 'commercial'];
        
        console.log('Test: Modification taskPreselectedCategories');
        console.log('Avant:', originalCategories);
        
        this.updateTaskPreselectedCategories(testCategories);
        
        setTimeout(() => {
            const newCategories = this.getTaskPreselectedCategories();
            console.log('Après:', newCategories);
            
            // Vérifier EmailScanner
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            console.log('EmailScanner a:', emailScannerCategories);
            
            const isSync = JSON.stringify(newCategories.sort()) === JSON.stringify(emailScannerCategories.sort());
            console.log('Synchronisation:', isSync ? '✅ OK' : '❌ ÉCHEC');
            
            // Remettre les valeurs originales
            this.updateTaskPreselectedCategories(originalCategories);
            
            console.groupEnd();
        }, 500);
        
        return true;
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        // Arrêter tous les intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        // Vider les queues et listeners
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

    // ================================================
    // MÉTHODES UTILITAIRES FINALES
    // ================================================
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
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v21.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales améliorées
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v21.0');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" },
        { subject: "Groupe Léon Grosse : votre candidature", expected: "hr" },
        { subject: "Livraison de votre commande #123456", expected: "logistics" },
        { subject: "Ticket de support #789 - Résolu", expected: "support" },
        { subject: "Rappel: Document en attente de signature", expected: "reminders" },
        { subject: "Communication interne: Nouvelle organisation", expected: "internal" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.log('Debug Info:', window.categoryManager.getDebugInfo());
    
    // Test synchronisation
    window.categoryManager.testSynchronization();
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v21.0');
    const allKeywords = window.categoryManager.getAllKeywords();
    
    Object.entries(allKeywords).forEach(([categoryId, keywords]) => {
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.length} mots`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.length} mots`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.length} mots`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.length} mots`);
        }
    });
    
    console.groupEnd();
};

window.testCategorySync = function() {
    return window.categoryManager.testSynchronization();
};

window.forceCategorySync = function() {
    window.categoryManager.forceSyncAllModules();
    return { success: true, message: 'Synchronisation forcée effectuée' };
};

// Test spécifique pour l'email problématique
window.testLeonGrosseEmail = function() {
    console.group('🧪 TEST Email Léon Grosse');
    
    const result = window.categoryManager.testEmail(
        "Groupe Léon Grosse : votre candidature",
        "Bonjour, Nous vous remercions vivement pour l'intérêt que vous portez à notre Groupe. Nous avons attentivement étudié votre candidature, et nous sommes au regret de ne pas pouvoir y apporter une suite favorable. Service recrutement",
        "eloise.hoffmann@leongrosse.teamtailor-mail.com",
        "hr"
    );
    
    // Analyser en détail pourquoi il est catégorisé
    console.log('\n📊 Analyse détaillée:');
    const content = {
        text: "groupe léon grosse votre candidature nous vous remercions vivement intérêt notre groupe candidature regret suite favorable service recrutement teamtailor",
        subject: "groupe léon grosse : votre candidature",
        domain: "leongrosse.teamtailor-mail.com"
    };
    
    // Tester chaque catégorie
    ['hr', 'commercial', 'internal', 'other'].forEach(catId => {
        const keywords = window.categoryManager.getCategoryKeywords(catId);
        const score = window.categoryManager.calculateScore(content, keywords, catId);
        console.log(`\n${catId}: ${score.total}pts`);
        if (score.matches.length > 0) {
            console.log('Matches:', score.matches);
        }
    });
    
    console.groupEnd();
    return result;
};

console.log('✅ CategoryManager v21.0 loaded - Catégories densifiées et uniques');
console.log('💡 Testez avec: testLeonGrosseEmail() pour vérifier la catégorisation HR');
