// CategoryManager.js - Version 27.0 - DÉTECTION MOTS-CLÉS CORRIGÉE

class CategoryManager {
    constructor() {
        console.log('[CategoryManager] 🚀 Constructor starting v27.0...');
        
        this.categories = {};
        this.keywordCatalog = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation
        this.changeListeners = new Set();
        
        // Gestion des scans
        this.scanHistory = [];
        this.lastScanResults = null;
        this.scanProviders = {
            gmail: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                priority: 1,
                methods: ['mailService', 'directGmail', 'googleAuthService']
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                priority: 2,
                methods: ['mailService', 'directOutlook', 'authService']
            }
        };
        
        // Initialisation synchrone des composants critiques
        try {
            this.initializeCategories();
            this.loadCustomCategories();
            this.initializeKeywordCatalog();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[CategoryManager] ✅ Version 27.0 - Initialized with enhanced keyword detection');
            
            // Notifier que CategoryManager est prêt
            this.notifyReady();
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Initialization error:', error);
            this.isInitialized = false;
        }
    }

    // ================================================
    // NOTIFICATION DE DISPONIBILITÉ
    // ================================================
    notifyReady() {
        console.log('[CategoryManager] 📢 Notifying that CategoryManager is ready');
        
        try {
            window.dispatchEvent(new CustomEvent('categoryManagerReady', {
                detail: {
                    isInitialized: this.isInitialized,
                    categoriesCount: Object.keys(this.categories).length,
                    version: '27.0'
                }
            }));
            console.log('[CategoryManager] ✅ Ready event dispatched');
        } catch (error) {
            console.error('[CategoryManager] Error dispatching ready event:', error);
        }
        
        window.categoryManagerReady = true;
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - DÉTECTION CORPS RENFORCÉE
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation catalogue v27.0 avec détection corps renforcée...');
        
        this.keywordCatalog = {
            // MARKETING & NEWSLETTER - DÉTECTION PARTOUT
            marketing_news: {
                absolute: [
                    // Désabonnement - PRIORITÉ ABSOLUE
                    'se désabonner', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails', 'arrêter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous a été envoyé', 'vous recevez cet email',
                    'click here to unsubscribe', 'cliquez ici pour vous désabonner',
                    'if you no longer wish to receive', 'si vous ne souhaitez plus recevoir',
                    'subscription preferences', 'préférences d\'abonnement',
                    'manage your subscription', 'gérer votre abonnement',
                    
                    // Newsletter explicites
                    'newsletter', 'newsletter hebdomadaire', 'newsletter mensuelle',
                    'newsletter quotidienne', 'weekly newsletter', 'monthly newsletter',
                    'daily newsletter', 'newsletter gratuite', 'free newsletter',
                    'notre newsletter', 'our newsletter', 'la newsletter',
                    'votre newsletter', 'your newsletter', 'this newsletter',
                    
                    // Mailing et diffusion
                    'mailing list', 'mailing', 'e-mailing', 'emailing',
                    'liste de diffusion', 'diffusion email', 'email marketing',
                    'marketing email', 'campagne email', 'email campaign',
                    'mass email', 'email blast', 'bulk email',
                    
                    // Structure newsletter
                    'view in browser', 'voir dans le navigateur', 'version web',
                    'web version', 'version navigateur', 'afficher dans navigateur',
                    'having trouble viewing', 'problème d\'affichage',
                    'si vous ne voyez pas correctement', 'if you cannot see this email',
                    
                    // Domaines marketing spécialisés
                    'mailchimp', 'sendgrid', 'mailgun', 'constant contact',
                    'aweber', 'getresponse', 'campaign monitor', 'sendinblue',
                    'klaviyo', 'convertkit', 'activecampaign', 'drip',
                    'infusionsoft', 'pardot', 'hubspot', 'marketo',
                    'brevo', 'mailjet', 'sendpulse', 'omnisend',
                    
                    // Adresses typiques
                    'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                    'notifications@', 'updates@', 'news@', 'newsletter@',
                    'marketing@', 'promo@', 'offers@', 'deals@',
                    'info@', 'contact@', 'hello@', 'team@',
                    
                    // Services cloud et tech
                    'google cloud platform', 'aws notifications', 'azure updates',
                    'cloud platform notifications', 'service updates',
                    'platform news', 'developer newsletter',
                    'api updates', 'service announcements',
                    'product updates', 'feature announcements',
                    
                    // Réseaux sociaux et streaming
                    'twitch notifications', 'youtube notifications',
                    'streaming notifications', 'new video', 'nouvelle vidéo',
                    'live stream', 'direct live', 'streaming en direct',
                    'subscribe to channel', 'abonnez-vous à la chaîne',
                    'follow us on', 'suivez-nous sur', 'join us on',
                    'connect with us', 'stay connected', 'restez connecté',
                    
                    // E-commerce et promotions
                    'new arrivals', 'nouveautés', 'just arrived', 'vient d\'arriver',
                    'limited time', 'temps limité', 'while supplies last',
                    'jusqu\'à épuisement', 'special offer', 'offre spéciale',
                    'exclusive deal', 'offre exclusive', 'members only',
                    'réservé aux membres', 'early access', 'accès anticipé',
                    
                    // Automatisation
                    'automated message', 'message automatique',
                    'automatic notification', 'notification automatique',
                    'this is an automated', 'ceci est un message automatisé',
                    'do not reply to this email', 'ne pas répondre à cet email',
                    
                    // Encodage défectueux
                    'sÃ©curitÃ©', 'notificatÃ©', 'prÃ©fÃ©rences',
                    'dÃ©sabonner', 'rÃ©ception', 'Ã©quipe',
                    'confidentialitÃ©', 'dÃ©claration'
                ],
                
                strong: [
                    'marketing', 'publicity', 'publicité', 'advertising',
                    'campaign', 'campagne', 'promotion', 'promo',
                    'deal', 'offer', 'offre', 'sale', 'vente',
                    'discount', 'réduction', 'special', 'exclusive',
                    'limited', 'new', 'nouveau', 'latest', 'dernier',
                    'shop', 'boutique', 'store', 'magasin',
                    'shopping', 'acheter', 'buy', 'purchase',
                    'order', 'commander', 'cart', 'panier',
                    'checkout', 'payment', 'paiement',
                    'brand', 'marque', 'collection', 'catalog',
                    'catalogue', 'lookbook', 'trend', 'tendance',
                    'platform', 'service', 'api', 'cloud',
                    'streaming', 'live', 'video', 'channel',
                    'update', 'announcement', 'news', 'actualité',
                    'information', 'communication', 'message',
                    'notification', 'alert', 'reminder'
                ],
                
                weak: [
                    'discover', 'découvrir', 'explore', 'explorer',
                    'learn more', 'en savoir plus', 'read more',
                    'download', 'télécharger', 'free', 'gratuit',
                    'tips', 'conseils', 'guide', 'tutorial',
                    'how to', 'comment', 'best practices',
                    'information', 'info', 'help', 'aide',
                    'click here', 'cliquez ici', 'visit', 'visiter'
                ],
                
                exclusions: [
                    'urgent task', 'tâche urgente',
                    'security alert urgent', 'alerte sécurité urgente',
                    'password expired urgent', 'mot de passe expiré urgent',
                    'payment required', 'paiement requis',
                    'action required by', 'action requise avant'
                ]
            },

            // SÉCURITÉ - DÉTECTION RENFORCÉE
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'compte compromis', 'account compromised',
                    'unusual activity', 'activité inhabituelle',
                    'security breach', 'violation sécurité',
                    'unauthorized access', 'accès non autorisé',
                    'confirm your identity', 'confirmez votre identité',
                    'verify your account', 'vérifier votre compte',
                    'suspicious login attempt', 'tentative connexion suspecte'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'login', 'connexion', 'access', 'accès',
                    'compte', 'account', 'breach', 'violation',
                    'alert', 'alerte', 'warning', 'avertissement',
                    'protect', 'protéger', 'secure', 'sécuriser'
                ],
                weak: [
                    'user', 'utilisateur', 'protection', 'secure',
                    'identity', 'identité', 'privacy', 'confidentialité'
                ],
                exclusions: [
                    'newsletter', 'unsubscribe', 'promotion', 'marketing',
                    'shop', 'buy', 'order', 'purchase', 'sale'
                ]
            },

            // TÂCHES - DÉTECTION ACTIONS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable', 'deliverable',
                    'urgence', 'urgent', 'très urgent', 'priority',
                    'demande update', 'update request', 'mise à jour demandée',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed',
                    'please confirm', 'veuillez confirmer',
                    'complete by', 'à compléter avant', 'finish by',
                    'response required', 'réponse requise', 'awaiting response',
                    'pending action', 'action en attente', 'follow up required'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision',
                    'deadline', 'échéance', 'due', 'livrable',
                    'review', 'réviser', 'check', 'vérifier',
                    'submit', 'soumettre', 'send', 'envoyer'
                ],
                weak: [
                    'demande', 'besoin', 'attente', 'need', 'waiting',
                    'please', 'merci', 'thank you', 'appreciated'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe',
                    'notification automatique', 'automated message'
                ]
            },

            // FINANCE - DÉTECTION COMPLÈTE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'payment due', 'échéance paiement',
                    'overdue', 'en retard', 'unpaid', 'impayé',
                    'credit card', 'carte de crédit',
                    'bank notification', 'notification bancaire',
                    'payment reminder', 'rappel de paiement',
                    'billing', 'facturation', 'charge', 'débit',
                    'payment received', 'paiement reçu',
                    'transaction completed', 'transaction effectuée'
                ],
                strong: [
                    'montant', 'amount', 'total', 'price', 'prix',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'euro', 'dollar', 'currency', 'devise',
                    'transaction', 'debit', 'credit', 'solde',
                    'receipt', 'reçu', 'statement', 'relevé',
                    'expense', 'dépense', 'cost', 'coût'
                ],
                weak: [
                    'money', 'argent', 'cost', 'coût', 'fee',
                    'charge', 'frais', 'tax', 'taxe'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'free trial', 'essai gratuit', 'demo'
                ]
            },

            // RÉUNIONS - DÉTECTION CALENDRIER
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'calendar invitation', 'invitation calendrier',
                    'join the meeting', 'rejoindre la réunion',
                    'meeting link', 'lien de réunion',
                    'conference call', 'conférence téléphonique'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment',
                    'agenda', 'conférence', 'conference', 'call',
                    'webinar', 'présentation', 'session',
                    'invite', 'invitation', 'join', 'rejoindre'
                ],
                weak: [
                    'disponible', 'available', 'time', 'temps',
                    'slot', 'créneau', 'date', 'heure'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing',
                    'webinar replay', 'recorded webinar'
                ]
            },

            // COMMERCIAL - DÉTECTION BUSINESS
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead',
                    'négociation', 'negotiation',
                    'business proposal', 'proposition commerciale',
                    'sales opportunity', 'opportunité de vente'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'contract',
                    'offer', 'offre', 'bid', 'tender',
                    'partnership', 'partenariat', 'collaboration'
                ],
                weak: [
                    'offre', 'discussion', 'projet', 'partnership',
                    'potential', 'potentiel', 'interest', 'intérêt'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'unsubscribe', 'automated'
                ]
            },

            // SUPPORT - DÉTECTION TICKETS
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support',
                    'help desk', 'service client',
                    'ticket created', 'ticket créé',
                    'support request', 'demande d\'assistance'
                ],
                strong: [
                    'support', 'assistance', 'help', 'aide',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug',
                    'resolution', 'résolution', 'solved', 'résolu',
                    'troubleshooting', 'dépannage', 'fix', 'correction'
                ],
                weak: [
                    'question', 'help', 'assistance',
                    'contact', 'service', 'team'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'satisfaction survey', 'enquête satisfaction'
                ]
            },

            // RH - DÉTECTION RESSOURCES HUMAINES
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'ressources humaines', 'human resources',
                    'offre d\'emploi', 'job offer', 'recrutement',
                    'employee handbook', 'manuel employé',
                    'benefits enrollment', 'inscription avantages'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources',
                    'contrat', 'paie', 'congés', 'vacation',
                    'emploi', 'job', 'recruitment', 'hiring',
                    'employee', 'employé', 'benefits', 'avantages'
                ],
                weak: [
                    'employee', 'staff', 'personnel', 'équipe',
                    'team', 'department', 'service'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'job board', 'career site'
                ]
            },

            // RELANCES - DÉTECTION SUIVIS
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed',
                    'friendly reminder', 'petit rappel',
                    'just following up', 'juste un suivi'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending',
                    'awaiting', 'attente', 'response', 'réponse',
                    'update', 'mise à jour', 'status', 'statut'
                ],
                weak: [
                    'previous', 'encore', 'still', 'toujours',
                    'yet', 'pas encore', 'waiting', 'attendre'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'automated reminder', 'rappel automatique'
                ]
            },

            // PROJETS - DÉTECTION GESTION PROJET
            project: {
                absolute: [
                    'projet', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'project deliverable', 'livrable de projet',
                    'sprint planning', 'planification sprint'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement', 'release',
                    'deployment', 'déploiement', 'iteration',
                    'backlog', 'roadmap', 'timeline', 'planning'
                ],
                weak: [
                    'phase', 'étape', 'planning', 'plan',
                    'progress', 'progrès', 'update'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion',
                    'project management tool', 'outil gestion projet'
                ]
            },

            // COMMUNICATION INTERNE
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service',
                    'à tous', 'to all employees',
                    'internal communication', 'message interne',
                    'company-wide', 'à toute l\'entreprise'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff', 'équipe',
                    'annonce', 'announcement', 'memo',
                    'policy', 'politique', 'procedure',
                    'organization', 'organisation'
                ],
                weak: [
                    'information', 'update', 'news',
                    'team', 'company', 'entreprise'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'external', 'client',
                    'public announcement', 'annonce publique'
                ]
            },

            // NOTIFICATIONS SYSTÈME
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'auto-reply', 'automatic reply', 'réponse automatique',
                    'system alert', 'alerte système',
                    'server notification', 'notification serveur',
                    'maintenance notification', 'notification maintenance',
                    'backup notification', 'notification sauvegarde',
                    'system status', 'statut système'
                ],
                strong: [
                    'automated', 'automatic', 'automatique', 'system',
                    'notification', 'alert', 'alerte', 'reminder',
                    'rappel', 'status', 'statut', 'update',
                    'maintenance', 'backup', 'sauvegarde'
                ],
                weak: [
                    'info', 'information', 'notice', 'avis',
                    'message', 'communication'
                ],
                exclusions: [
                    'urgent action required', 'action urgente requise',
                    'payment required', 'paiement requis',
                    'security alert', 'alerte sécurité'
                ]
            },

            // EN COPIE
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information',
                    'shared for visibility', 'partagé pour visibilité'
                ],
                strong: [
                    'information', 'copie', 'copy', 'cc', 'fyi',
                    'visibility', 'visibilité', 'awareness'
                ],
                weak: [
                    'info', 'share', 'partage'
                ],
                exclusions: [
                    'urgent', 'action required', 'payment', 'newsletter',
                    'please respond', 'merci de répondre'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Catalogue v27.0 initialisé avec détection corps renforcée');
    }

    // ================================================
    // ANALYSE EMAIL - DÉTECTION MOTS-CLÉS AMÉLIORÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContentEnhanced(email);
        
        // Vérifier exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // DÉTECTION NEWSLETTER PRIORITAIRE
        const newsletterResult = this.detectNewsletterEnhanced(content, email);
        if (newsletterResult && newsletterResult.score >= 80) {
            console.log(`[CategoryManager] 📰 NEWSLETTER DÉTECTÉE: ${email.subject?.substring(0, 50)} (Score: ${newsletterResult.score})`);
            return newsletterResult;
        }
        
        // Analyser toutes les catégories
        const allResults = this.analyzeAllCategories(content, email);
        
        // Sélectionner la meilleure catégorie
        const selectedResult = this.selectBestCategory(allResults);
        
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

    // ================================================
    // DÉTECTION NEWSLETTER AMÉLIORÉE
    // ================================================
    detectNewsletterEnhanced(content, email) {
        let totalScore = 0;
        const matches = [];
        let hasStrongIndicator = false;
        
        // 1. Analyse des mots-clés dans le corps
        const marketingKeywords = this.keywordCatalog.marketing_news;
        const bodyAnalysis = this.analyzeKeywordsInContent(content.text, marketingKeywords, 'marketing_news');
        
        totalScore += bodyAnalysis.score;
        matches.push(...bodyAnalysis.matches);
        
        if (bodyAnalysis.hasAbsolute) {
            hasStrongIndicator = true;
        }
        
        // 2. Analyse de l'adresse email
        const senderAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const senderName = email.from?.emailAddress?.name?.toLowerCase() || '';
        
        // Patterns d'adresses newsletter
        const newsletterAddressPatterns = [
            'noreply', 'no-reply', 'donotreply', 'do-not-reply',
            'notifications', 'updates', 'news', 'newsletter',
            'marketing', 'promo', 'offers', 'deals',
            'info', 'contact', 'hello', 'team'
        ];
        
        for (const pattern of newsletterAddressPatterns) {
            if (senderAddress.includes(pattern)) {
                totalScore += 50;
                matches.push({ keyword: `sender_${pattern}`, type: 'sender', score: 50 });
                hasStrongIndicator = true;
                break;
            }
        }
        
        // 3. Domaines de services marketing
        const domain = this.extractDomain(senderAddress);
        const marketingDomains = [
            'mailchimp.com', 'sendgrid.net', 'constantcontact.com',
            'aweber.com', 'getresponse.com', 'campaign-monitor.com',
            'sendinblue.com', 'klaviyo.com', 'convertkit.com',
            'brevo.com', 'mailjet.com', 'sendpulse.com'
        ];
        
        if (marketingDomains.some(md => domain.includes(md))) {
            totalScore += 100;
            hasStrongIndicator = true;
            matches.push({ keyword: 'marketing_platform', type: 'domain', score: 100 });
        }
        
        // 4. Structure HTML typique newsletter
        if (content.hasHtml) {
            const htmlPatterns = [
                'unsubscribe', 'désabonner', 'view in browser', 'voir dans le navigateur',
                'email preferences', 'préférences email', 'update your preferences'
            ];
            
            let htmlMatches = 0;
            for (const pattern of htmlPatterns) {
                if (content.text.includes(pattern)) {
                    htmlMatches++;
                    totalScore += 30;
                    matches.push({ keyword: `html_${pattern}`, type: 'structure', score: 30 });
                }
            }
            
            if (htmlMatches >= 2) {
                hasStrongIndicator = true;
            }
        }
        
        // 5. Analyse du sujet
        const subjectAnalysis = this.analyzeKeywordsInContent(
            content.subject,
            marketingKeywords,
            'marketing_news',
            2.0 // Multiplicateur pour le sujet
        );
        
        totalScore += subjectAnalysis.score;
        matches.push(...subjectAnalysis.matches.map(m => ({
            ...m,
            keyword: m.keyword + ' (subject)',
            type: 'subject_' + m.type
        })));
        
        // Décision finale
        if (hasStrongIndicator || totalScore >= 80) {
            const confidence = hasStrongIndicator ? 0.95 : 
                              totalScore >= 150 ? 0.90 : 
                              totalScore >= 100 ? 0.85 : 
                              totalScore >= 80 ? 0.75 : 0.70;
            
            return {
                category: 'marketing_news',
                score: Math.min(totalScore, 300),
                confidence: confidence,
                matchedPatterns: matches,
                hasAbsolute: hasStrongIndicator,
                detectionMethod: 'enhanced_keyword_detection',
                keywordMatches: bodyAnalysis.keywordCount
            };
        }
        
        return null;
    }

    // ================================================
    // ANALYSE DES MOTS-CLÉS DANS LE CONTENU
    // ================================================
    analyzeKeywordsInContent(text, keywords, categoryId, multiplier = 1.0) {
        let score = 0;
        const matches = [];
        let hasAbsolute = false;
        let keywordCount = 0;
        
        if (!text || !keywords) {
            return { score: 0, matches: [], hasAbsolute: false, keywordCount: 0 };
        }
        
        const normalizedText = text.toLowerCase();
        
        // Analyser les mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 100 * multiplier * Math.min(occurrences, 3);
                    score += keywordScore;
                    hasAbsolute = true;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'absolute',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        // Analyser les mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            for (const keyword of keywords.strong) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 40 * multiplier * Math.min(occurrences, 2);
                    score += keywordScore;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'strong',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        // Analyser les mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            for (const keyword of keywords.weak) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 15 * multiplier;
                    score += keywordScore;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'weak',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        // Analyser les exclusions (pénalités)
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findKeywordInText(normalizedText, exclusion)) {
                    const penalty = -30 * multiplier;
                    score += penalty;
                    matches.push({
                        keyword: exclusion,
                        type: 'exclusion',
                        score: penalty,
                        occurrences: 1
                    });
                }
            }
        }
        
        return {
            score: Math.max(0, score),
            matches: matches,
            hasAbsolute: hasAbsolute,
            keywordCount: keywordCount
        };
    }

    // ================================================
    // COMPTAGE DES OCCURRENCES DE MOTS-CLÉS
    // ================================================
    countKeywordOccurrences(text, keyword) {
        if (!text || !keyword) return 0;
        
        const normalizedKeyword = keyword.toLowerCase();
        let count = 0;
        let position = 0;
        
        // Recherche exacte
        while ((position = text.indexOf(normalizedKeyword, position)) !== -1) {
            count++;
            position += normalizedKeyword.length;
        }
        
        // Si pas de correspondance exacte, essayer avec des frontières de mots
        if (count === 0) {
            try {
                const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'gi');
                const matches = text.match(wordBoundaryRegex);
                if (matches) {
                    count = matches.length;
                }
            } catch (e) {
                // Ignorer les erreurs regex
            }
        }
        
        return count;
    }

    // ================================================
    // RECHERCHE DE MOT-CLÉ DANS LE TEXTE
    // ================================================
    findKeywordInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        
        // Recherche directe
        if (text.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec frontières de mots
        try {
            const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            return wordBoundaryRegex.test(text);
        } catch (e) {
            return false;
        }
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content, email) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Analyser chaque catégorie
        for (const categoryId of Object.keys(this.keywordCatalog)) {
            // Vérifier si la catégorie est active
            if (!activeCategories.includes(categoryId) && categoryId !== 'cc') {
                continue;
            }
            
            const keywords = this.keywordCatalog[categoryId];
            if (!keywords) continue;
            
            // Analyser le contenu complet
            const contentAnalysis = this.analyzeKeywordsInContent(
                content.text,
                keywords,
                categoryId
            );
            
            // Analyser le sujet avec bonus
            const subjectAnalysis = this.analyzeKeywordsInContent(
                content.subject,
                keywords,
                categoryId,
                1.5
            );
            
            // Score total
            const totalScore = contentAnalysis.score + subjectAnalysis.score;
            const allMatches = [...contentAnalysis.matches, ...subjectAnalysis.matches];
            const hasAbsolute = contentAnalysis.hasAbsolute || subjectAnalysis.hasAbsolute;
            const totalKeywords = contentAnalysis.keywordCount + subjectAnalysis.keywordCount;
            
            // Bonus pour certaines catégories
            let categoryBonus = 0;
            if (categoryId === 'marketing_news' && totalKeywords > 3) {
                categoryBonus = 50;
            } else if (['security', 'finance', 'tasks'].includes(categoryId) && hasAbsolute) {
                categoryBonus = 30;
            }
            
            const finalScore = totalScore + categoryBonus;
            
            results[categoryId] = {
                category: categoryId,
                score: finalScore,
                confidence: this.calculateConfidence(finalScore, hasAbsolute, totalKeywords),
                matchedPatterns: allMatches,
                hasAbsolute: hasAbsolute,
                keywordCount: totalKeywords,
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        // Gérer la détection CC
        if (this.shouldDetectCC() && this.isInCC(email) && !this.isMainRecipient(email)) {
            results.cc = {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                priority: 30
            };
        }
        
        return results;
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 20;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Filtrer les résultats valides
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Priorité 1: Mots-clés absolus
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Priorité 2: Score
                if (Math.abs(a.score - b.score) > 20) {
                    return b.score - a.score;
                }
                
                // Priorité 3: Priorité de catégorie
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Priorité 4: Nombre de mots-clés
                return (b.keywordCount || 0) - (a.keywordCount || 0);
            });
        
        if (validResults.length === 0) {
            return null;
        }
        
        const bestResult = validResults[0];
        
        console.log(`[CategoryManager] ✅ Catégorie sélectionnée: ${bestResult.category} (Score: ${bestResult.score}, Mots-clés: ${bestResult.keywordCount || 0})`);
        
        return bestResult;
    }

    // ================================================
    // CALCUL DE CONFIDENCE
    // ================================================
    calculateConfidence(score, hasAbsolute, keywordCount = 0) {
        if (hasAbsolute) {
            if (score >= 200) return 0.98;
            if (score >= 150) return 0.95;
            if (score >= 100) return 0.90;
            return 0.85;
        }
        
        // Basé sur le score et le nombre de mots-clés
        if (score >= 150 && keywordCount >= 5) return 0.90;
        if (score >= 100 && keywordCount >= 3) return 0.85;
        if (score >= 80 && keywordCount >= 2) return 0.80;
        if (score >= 60) return 0.75;
        if (score >= 40) return 0.70;
        if (score >= 30) return 0.65;
        if (score >= 20) return 0.60;
        return 0.50;
    }

    // ================================================
    // EXTRACTION DE CONTENU AMÉLIORÉE
    // ================================================
    extractCompleteContentEnhanced(email) {
        let allText = '';
        let subject = '';
        
        // Sujet
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(3); // Réduit de 25 à 3 pour éviter sur-pondération
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            const senderAddress = email.from.emailAddress.address;
            allText += senderAddress + ' ';
            
            const domain = this.extractDomain(senderAddress);
            allText += domain + ' ';
        }
        
        if (email.from?.emailAddress?.name) {
            const senderName = email.from.emailAddress.name;
            allText += senderName + ' ';
        }
        
        // Preview (important pour la détection)
        if (email.bodyPreview) {
            const cleanPreview = this.cleanAndNormalizeText(email.bodyPreview);
            allText += (cleanPreview + ' ').repeat(2);
        }
        
        // Corps principal (le plus important)
        if (email.body?.content) {
            let bodyContent = email.body.content;
            
            if (bodyContent.includes('<')) {
                bodyContent = this.cleanHtmlContent(bodyContent);
            }
            
            const cleanBody = this.cleanAndNormalizeText(bodyContent);
            allText += cleanBody + ' ';
        }
        
        // Métadonnées additionnelles
        if (email.categories && Array.isArray(email.categories)) {
            email.categories.forEach(cat => {
                allText += cat + ' ';
            });
        }
        
        if (email.importance) {
            allText += email.importance + ' ';
        }
        
        if (email.hasAttachments) {
            allText += 'attachment pièce jointe ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            rawSubject: email.subject || '',
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            senderAddress: email.from?.emailAddress?.address?.toLowerCase() || '',
            senderName: email.from?.emailAddress?.name?.toLowerCase() || ''
        };
    }

    // ================================================
    // NETTOYAGE HTML
    // ================================================
    cleanHtmlContent(html) {
        if (!html) return '';
        
        let cleaned = html;
        
        // Extraire le texte des liens
        cleaned = cleaned.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
            return ` ${text} ${href} `;
        });
        
        // Extraire alt text des images
        cleaned = cleaned.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, (match, alt) => {
            return ` ${alt} `;
        });
        
        // Supprimer les balises script et style
        cleaned = cleaned
            .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
            .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        return cleaned;
    }

    // ================================================
    // NETTOYAGE ET NORMALISATION DU TEXTE
    // ================================================
    cleanAndNormalizeText(text) {
        if (!text) return '';
        
        return text
            // Gérer l'encodage défectueux
            .replace(/Ã©/g, 'é')
            .replace(/Ã¨/g, 'è')
            .replace(/Ã /g, 'à')
            .replace(/Ã´/g, 'ô')
            .replace(/Ã§/g, 'ç')
            .replace(/Ã¹/g, 'ù')
            .replace(/Ã¢/g, 'â')
            .replace(/Ãª/g, 'ê')
            .replace(/Ã®/g, 'î')
            .replace(/Ã¯/g, 'ï')
            .replace(/Ã«/g, 'ë')
            // Normaliser
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et marketing',
                priority: 100,
                isCustom: false
            },
            
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
                priority: 90,
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 85,
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 80,
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 70,
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 65,
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 60,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 55,
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
                priority: 45,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 40,
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 30,
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques système',
                priority: 20,
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\                strong: [
                    'montant', 'amount', 'total', 'price', 'prix',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'euro', 'dollar', 'currency',');
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

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
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

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
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

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // DÉTECTION PROVIDERS
    // ================================================
    detectEmailProvider() {
        console.log('[CategoryManager] 🔍 Détection provider email...');
        
        // Gmail via GoogleAuthService
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function' && 
            window.googleAuthService.isAuthenticated()) {
            console.log('[CategoryManager] ✅ Gmail détecté et authentifié');
            return {
                type: 'gmail',
                service: window.googleAuthService,
                ...this.scanProviders.gmail
            };
        }
        
        // Outlook via AuthService
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function' && 
            window.authService.isAuthenticated()) {
            console.log('[CategoryManager] ✅ Outlook détecté et authentifié');
            return {
                type: 'outlook',
                service: window.authService,
                ...this.scanProviders.outlook
            };
        }
        
        console.log('[CategoryManager] ⚠️ Aucun provider email authentifié');
        return null;
    }

    checkEmailRetrievalMethods() {
        const provider = this.detectEmailProvider();
        if (!provider) {
            return {
                available: false,
                provider: null,
                methods: [],
                error: 'Aucun provider authentifié'
            };
        }

        const availableMethods = [];
        
        // Vérifier MailService unifié
        if (window.mailService && typeof window.mailService.getEmailsFromFolder === 'function') {
            availableMethods.push('mailService');
        }
        
        if (provider.type === 'gmail') {
            if (window.googleAuthService && typeof window.googleAuthService.getAccessToken === 'function') {
                availableMethods.push('directGmail');
            }
            if (window.gmailService && typeof window.gmailService.getEmails === 'function') {
                availableMethods.push('gmailService');
            }
        } else if (provider.type === 'outlook') {
            if (window.authService && typeof window.authService.getAccessToken === 'function') {
                availableMethods.push('directOutlook');
            }
            if (window.outlookService && typeof window.outlookService.getEmails === 'function') {
                availableMethods.push('outlookService');
            }
        }

        return {
            available: availableMethods.length > 0,
            provider: provider,
            methods: availableMethods,
            error: availableMethods.length === 0 ? 'Aucune méthode de récupération disponible' : null
        };
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        this.settings.taskPreselectedCategories = normalizedCategories;
        this.saveSettings();
        
        this.notifyChange('taskPreselectedCategories', normalizedCategories);
        
        return normalizedCategories;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = [...Object.keys(this.categories), ...Object.keys(this.customCategories)];
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }

    getCategories() {
        return { ...this.categories, ...this.customCategories };
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
        return this.categories[categoryId] || this.customCategories[categoryId] || null;
    }

    // ================================================
    // GESTION SCAN ET HISTORIQUE
    // ================================================
    recordScanResult(scanResult) {
        const record = {
            timestamp: Date.now(),
            provider: scanResult.provider || 'unknown',
            totalEmails: scanResult.total || 0,
            categorizedEmails: scanResult.categorized || 0,
            preselectedForTasks: scanResult.stats?.preselectedForTasks || 0,
            marketingDetected: scanResult.stats?.marketingDetected || 0,
            scanDuration: scanResult.stats?.scanDuration || 0,
            breakdown: scanResult.breakdown || {},
            taskPreselectedCategories: scanResult.taskPreselectedCategories || []
        };

        this.scanHistory.push(record);
        this.lastScanResults = record;

        // Garder seulement les 10 derniers scans
        if (this.scanHistory.length > 10) {
            this.scanHistory = this.scanHistory.slice(-10);
        }

        console.log('[CategoryManager] 📊 Scan enregistré:', record);
        this.notifyChange('scanCompleted', record);
    }

    getScanHistory() {
        return [...this.scanHistory];
    }

    getLastScanResults() {
        return this.lastScanResults;
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
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                if (category.keywords) {
                    this.keywordCatalog[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                }
                
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" chargée`);
            });
            
            console.log('[CategoryManager] 📊 Total:', Object.keys(this.customCategories).length, 'catégories personnalisées');
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    // ================================================
    // GESTION ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
            }
        });
    }

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.settings = this.loadSettings();
        
        const changes = this.detectSettingsChanges(oldSettings, this.settings);
        changes.forEach(change => {
            this.notifyChange(change.type, change.value);
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

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    notifyChange(type, value) {
        console.log(`[CategoryManager] 📢 Notification changement: ${type}`);
        
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
        
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
    // MÉTHODES DE TEST
    // ================================================
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
        
        console.log('\n[CategoryManager] TEST RESULT v27.0:');
        console.log(`Subject: "${subject}"`);
        console.log(`From: ${from}`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`Keywords matched: ${result.keywordMatches || 0}`);
        console.log(`Detection Method:`, result.detectionMethod || 'standard');
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v27.0');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        console.groupEnd();
        
        console.group('🔍 Catalogue mots-clés');
        Object.entries(this.keywordCatalog).forEach(([catId, keywords]) => {
            const total = (keywords.absolute?.length || 0) + 
                         (keywords.strong?.length || 0) + 
                         (keywords.weak?.length || 0);
            const category = this.getCategory(catId);
            console.log(`${category?.icon || '📂'} ${category?.name || catId}: ${total} mots-clés`);
        });
        console.groupEnd();
        
        console.group('⚙️ Configuration');
        console.log('Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        console.log('Exclude spam:', this.shouldExcludeSpam());
        console.log('Detect CC:', this.shouldDetectCC());
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            version: 'v27.0',
            categoriesCount: allCategories.length,
            customCategoriesCount: customCategories.length,
            keywordDetection: 'enhanced_body_detection'
        };
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        console.log('[CategoryManager] 🧹 Nettoyage...');
        this.changeListeners.clear();
        this.scanHistory = [];
        this.lastScanResults = null;
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.keywordCatalog = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.categoryManager.destroy?.();
    } catch (e) {
        console.warn('[CategoryManager] Erreur nettoyage:', e);
    }
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v27.0...');

try {
    window.categoryManager = new CategoryManager();
    console.log('[CategoryManager] ✅ Instance créée avec succès');
} catch (error) {
    console.error('[CategoryManager] ❌ Erreur création instance:', error);
    
    window.dispatchEvent(new CustomEvent('categoryManagerReady', {
        detail: {
            isInitialized: false,
            error: error.message,
            version: '27.0'
        }
    }));
}

// ================================================
// FONCTIONS DE TEST GLOBALES
// ================================================
window.testCategoryManagerV27 = function() {
    console.group('🧪 TEST CategoryManager v27.0 - Détection mots-clés corps');
    
    const tests = [
        {
            subject: "Confirmation : votre essai de Google Cloud Platform",
            body: "Bienvenue sur Google Cloud ! Cliquez ici pour vous désabonner de notre newsletter. View in browser.",
            from: "CloudPlatform-noreply@google.com",
            expected: "marketing_news"
        },
        {
            subject: "Action requise: mise à jour urgente",
            body: "Merci de compléter cette tâche avant la deadline. C'est urgent et prioritaire.",
            from: "manager@company.com",
            expected: "tasks"
        },
        {
            subject: "Facture #12345",
            body: "Votre facture est disponible. Montant total: 500€. Paiement requis avant le 30/01.",
            from: "billing@company.com",
            expected: "finance"
        },
        {
            subject: "Nouvelle connexion détectée",
            body: "Une activité suspecte a été détectée sur votre compte. Code de vérification: 123456",
            from: "security@bank.com",
            expected: "security"
        }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body, test.from, test.expected);
    });
    
    console.groupEnd();
    
    const diagnostic = window.categoryManager.runDiagnostics();
    return { 
        success: true, 
        testsRun: tests.length,
        diagnostic: diagnostic
    };
};

console.log('✅ CategoryManager v27.0 loaded - Détection mots-clés dans le corps corrigée');
console.log('📧 Utilisez testCategoryManagerV27() pour tester la détection');
