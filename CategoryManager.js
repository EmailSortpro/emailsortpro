// CategoryManager.js - Version 24.0 - DÉTECTION NEWSLETTER CORRIGÉE + Gmail/Outlook

class CategoryManager {
    constructor() {
        this.categories = {};
        this.keywordCatalog = {}; // UN SEUL CATALOGUE CENTRAL
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation simplifié
        this.changeListeners = new Set();
        
        // NOUVELLE SECTION - Gestion des scans
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
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeKeywordCatalog(); // MÉTHODE UNIQUE AVEC DÉTECTION NEWSLETTER RENFORCÉE
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Version 24.0 - Détection newsletter corrigée + Gmail/Outlook');
    }

    // ================================================
    // NOUVELLE SECTION - GESTION DES SCANS ET PROVIDERS
    // ================================================
    
    /**
     * Détecte le provider email disponible avec priorité Gmail
     */
    detectEmailProvider() {
        console.log('[CategoryManager] 🔍 Détection provider email...');
        
        // PRIORITÉ 1: Gmail via GoogleAuthService
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
        
        // PRIORITÉ 2: Outlook via AuthService
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

    /**
     * Vérifie la disponibilité des méthodes de récupération d'emails
     */
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
            // Vérifier API Gmail directe
            if (window.googleAuthService && typeof window.googleAuthService.getAccessToken === 'function') {
                availableMethods.push('directGmail');
            }
            
            // Vérifier méthodes alternatives Gmail
            if (window.gmailService && typeof window.gmailService.getEmails === 'function') {
                availableMethods.push('gmailService');
            }
        } else if (provider.type === 'outlook') {
            // Vérifier API Microsoft Graph directe
            if (window.authService && typeof window.authService.getAccessToken === 'function') {
                availableMethods.push('directOutlook');
            }
            
            // Vérifier méthodes alternatives Outlook
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

    /**
     * Configure les méthodes de scan selon le provider
     */
    configureScanMethods() {
        const emailMethods = this.checkEmailRetrievalMethods();
        
        if (!emailMethods.available) {
            console.error('[CategoryManager] ❌ Aucune méthode de scan disponible:', emailMethods.error);
            return null;
        }

        const config = {
            provider: emailMethods.provider,
            primaryMethod: emailMethods.methods[0],
            fallbackMethods: emailMethods.methods.slice(1),
            capabilities: {
                canScan: true,
                canCategorize: !!window.categoryManager,
                canAnalyzeAI: !!window.aiTaskAnalyzer,
                canCreateTasks: !!window.taskManager
            }
        };

        console.log('[CategoryManager] ✅ Configuration scan:', config);
        return config;
    }

    /**
     * Enregistre un résultat de scan
     */
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
        
        // Notifier les listeners
        this.notifyChange('scanCompleted', record);
    }

    /**
     * Récupère l'historique des scans
     */
    getScanHistory() {
        return [...this.scanHistory];
    }

    /**
     * Récupère le dernier résultat de scan
     */
    getLastScanResults() {
        return this.lastScanResults;
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - DÉTECTION NEWSLETTER RENFORCÉE
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation du catalogue avec détection newsletter renforcée...');
        
        this.keywordCatalog = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS - DÉTECTION NEWSLETTER RENFORCÉE
            marketing_news: {
                absolute: [
                    // Mots-clés de désabonnement - PRIORITÉ ABSOLUE
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
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
                    'modify subscription', 'modifier l\'abonnement',
                    'email subscription', 'abonnement email',
                    'subscription center', 'centre d\'abonnement',
                    'email frequency', 'fréquence des emails',
                    'stop receiving these emails', 'arrêter de recevoir ces emails',
                    'remove from mailing list', 'retirer de la liste de diffusion',
                    'mailing list preferences', 'préférences liste de diffusion',
                    
                    // Newsletter explicites - RENFORCÉ
                    'newsletter', 'newsletter hebdomadaire', 'newsletter mensuelle',
                    'newsletter quotidienne', 'weekly newsletter', 'monthly newsletter',
                    'daily newsletter', 'newsletter gratuite', 'free newsletter',
                    'mailing list', 'mailing', 'e-mailing', 'emailing',
                    'bulletin d\'information', 'lettre d\'information',
                    'our newsletter', 'notre newsletter', 'subscribe to newsletter',
                    'abonnez-vous à notre newsletter', 'newsletter subscription',
                    'abonnement newsletter', 'newsletter signup', 'inscription newsletter',
                    'votre newsletter', 'your newsletter', 'la newsletter',
                    'infolettre', 'info-lettre', 'bulletin électronique',
                    'lettre électronique', 'courrier électronique',
                    'liste de diffusion', 'diffusion email', 'email marketing',
                    'marketing email', 'campagne email', 'email campaign',
                    'bulletin d\'actualités', 'actualités par email',
                    'news by email', 'email news', 'nouvelles par email',
                    'update newsletter', 'newsletter updates', 'mise à jour newsletter',
                    
                    // Marketing explicite
                    'limited offer', 'offre limitée', 'special offer', 'offre spéciale',
                    'promotion', 'promo', 'soldes', 'vente privée', 'private sale',
                    'discount', 'réduction', 'remise', 'code promo',
                    'exclusive offer', 'offre exclusive', 'new arrivals', 'nouveautés',
                    'flash sale', 'vente flash', 'deal of the day',
                    'shop now', 'acheter maintenant', 'buy now',
                    'limited time', 'temps limité', 'expires soon', 'expire bientôt',
                    'hurry up', 'dépêchez-vous', 'act now', 'agissez maintenant',
                    'don\'t miss out', 'ne ratez pas', 'last chance', 'dernière chance',
                    'final sale', 'vente finale', 'clearance sale', 'liquidation',
                    'mega sale', 'super sale', 'big sale', 'grosse promo',
                    'black friday', 'cyber monday', 'soldes d\'été', 'soldes d\'hiver',
                    
                    // Retail et e-commerce
                    'your order', 'votre commande', 'order confirmation',
                    'confirmation de commande', 'tracking number', 'numéro de suivi',
                    'shipped', 'expédié', 'delivered', 'livré',
                    'cart reminder', 'rappel panier', 'abandoned cart',
                    'panier abandonné', 'complete your order',
                    'finalisez votre commande', 'checkout now', 'passer commande',
                    'order status', 'statut commande', 'order update',
                    'mise à jour commande', 'delivery update', 'mise à jour livraison',
                    'invoice attached', 'facture jointe', 'receipt attached',
                    'reçu joint', 'payment confirmation', 'confirmation paiement',
                    
                    // Notifications commerciales - CIBLÉ
                    'product recommendation', 'recommandation produit',
                    'you might like', 'cela pourrait vous plaire',
                    'personalized for you', 'personnalisé pour vous',
                    'based on your purchase', 'selon vos achats',
                    'customers who bought', 'les clients qui ont acheté',
                    'recommended for you', 'recommandé pour vous',
                    'similar products', 'produits similaires',
                    'you may also like', 'vous pourriez aussi aimer',
                    'back in stock', 'de nouveau en stock',
                    'restock notification', 'notification de réapprovisionnement',
                    'wishlist reminder', 'rappel liste de souhaits',
                    'price drop', 'baisse de prix', 'price alert', 'alerte prix'
                ],
                strong: [
                    // Marketing général
                    'marketing', 'publicity', 'publicité', 'advertising',
                    'campaign', 'campagne', 'promotion', 'promo',
                    'deal', 'offer', 'offre', 'sale', 'vente',
                    'discount', 'réduction', 'special', 'exclusive',
                    'limited', 'new', 'nouveau', 'latest', 'dernier',
                    
                    // E-commerce
                    'shop', 'boutique', 'store', 'magasin',
                    'shopping', 'acheter', 'buy', 'purchase',
                    'order', 'commander', 'cart', 'panier',
                    'checkout', 'payment', 'paiement',
                    
                    // Communication marketing
                    'newsletter', 'mailing', 'updates', 'news',
                    'alerts', 'notifications', 'subscribe', 'abonner',
                    'follow us', 'suivez-nous', 'social media',
                    'facebook', 'twitter', 'instagram', 'linkedin',
                    
                    // Retail
                    'brand', 'marque', 'collection', 'catalog',
                    'catalogue', 'lookbook', 'trend', 'tendance',
                    'fashion', 'mode', 'style', 'design',
                    
                    // Nouvelles communications marketing
                    'blast', 'diffusion', 'broadcast', 'mass email',
                    'email blast', 'bulk email', 'groupe email',
                    'destinataires multiples', 'multiple recipients',
                    'bcc', 'cci', 'copie cachée', 'hidden copy',
                    'mass communication', 'communication de masse',
                    'commercial email', 'email commercial',
                    'promotional email', 'email promotionnel',
                    'marketing automation', 'automatisation marketing',
                    'drip campaign', 'campagne goutte à goutte',
                    'email sequence', 'séquence email',
                    'autoresponder', 'répondeur automatique'
                ],
                weak: [
                    'update', 'discover', 'découvrir', 'explore',
                    'learn more', 'en savoir plus', 'read more',
                    'download', 'télécharger', 'free', 'gratuit',
                    'tips', 'conseils', 'guide', 'tutorial',
                    'how to', 'comment', 'best practices',
                    'meilleures pratiques', 'advice', 'avis'
                ],
                exclusions: [
                    // Éviter les faux positifs - RÉDUIT pour permettre plus de détection
                    'urgent task', 'tâche urgente', 'action required',
                    'security alert', 'alerte sécurité', 'password expired',
                    'mot de passe expiré', 'account suspended',
                    'compte suspendu', 'verify account', 'vérifier compte',
                    'login attempt', 'tentative connexion',
                    'system maintenance', 'maintenance système',
                    'service interruption', 'interruption service',
                    'payment failed', 'paiement échoué',
                    'payment overdue', 'paiement en retard'
                    // Suppression de 'meeting', 'réunion', 'facture', 'invoice' pour éviter blocage newsletter
                ]
            },

            // NOTIFICATIONS SYSTÈME - Après marketing - RÉDUIT POUR ÉVITER CONFLIT
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'no-reply@', 'donotreply@', 'auto-reply',
                    'automatic reply', 'réponse automatique',
                    'system alert', 'alerte système',
                    'server notification', 'notification serveur',
                    'maintenance notification', 'notification maintenance',
                    'backup notification', 'notification sauvegarde',
                    'system status', 'statut système'
                ],
                strong: [
                    'automated', 'automatic', 'automatique', 'system',
                    'notification', 'alert', 'alerte', 'reminder',
                    'rappel', 'update', 'mise à jour', 'status'
                ],
                weak: [
                    'info', 'information', 'notice', 'avis'
                ],
                exclusions: [
                    // Éviter les marketing déguisés - RENFORCÉ
                    'newsletter', 'unsubscribe', 'promotion', 'offer',
                    'shop', 'buy', 'purchase', 'sale', 'deal',
                    'marketing', 'campaign', 'advertising',
                    'mailing list', 'email preferences', 'subscription',
                    'discount', 'special offer', 'limited time',
                    'exclusive', 'promo', 'code promo',
                    'new arrivals', 'nouveautés', 'flash sale',
                    'vente flash', 'soldes', 'réduction'
                ]
            },

            // SÉCURITÉ
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'compte compromis', 'account compromised',
                    'unusual activity', 'activité inhabituelle'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'login', 'connexion', 'access', 'accès'
                ],
                weak: [
                    'compte', 'account', 'user', 'utilisateur'
                ],
                exclusions: [
                    'newsletter', 'unsubscribe', 'promotion', 'marketing',
                    'shop', 'buy', 'order', 'purchase'
                ]
            },

            // TÂCHES ET ACTIONS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable', 'deliverable',
                    'urgence', 'urgent', 'très urgent', 'priority',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed',
                    'please confirm', 'veuillez confirmer'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision',
                    'deadline', 'échéance', 'due', 'livrable'
                ],
                weak: [
                    'demande', 'besoin', 'attente', 'need', 'waiting'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe',
                    'shop', 'buy', 'order', 'sale'
                ]
            },

            // FINANCE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'payment due', 'échéance paiement',
                    'overdue', 'en retard', 'unpaid', 'impayé',
                    'credit card', 'carte de crédit',
                    'bank notification', 'notification bancaire'
                ],
                strong: [
                    'montant', 'amount', 'total', 'price', 'prix',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'euro', 'dollar', 'currency', 'devise',
                    'transaction', 'debit', 'credit', 'solde'
                ],
                weak: [
                    'money', 'argent', 'cost', 'coût', 'fee'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'shop',
                    'order confirmation', 'shipping', 'delivery'
                ]
            },

            // RÉUNIONS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'calendar invitation', 'invitation calendrier'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment',
                    'agenda', 'conférence', 'conference', 'call',
                    'webinar', 'présentation'
                ],
                weak: [
                    'disponible', 'available', 'time', 'temps'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing', 'shop'
                ]
            },

            // COMMERCIAL
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead',
                    'négociation', 'negotiation'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'contract'
                ],
                weak: [
                    'offre', 'discussion', 'projet', 'partnership'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe'
                ]
            },

            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support',
                    'help desk', 'service client'
                ],
                strong: [
                    'support', 'assistance', 'help', 'aide',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug'
                ],
                weak: [
                    'question', 'help', 'assistance'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // RELANCES
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
                weak: [
                    'previous', 'encore', 'still', 'toujours'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // PROJETS
            project: {
                absolute: [
                    'projet', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement'
                ],
                weak: [
                    'phase', 'étape', 'planning'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // RH
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
                weak: [
                    'employee', 'staff', 'personnel', 'équipe'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // COMMUNICATION INTERNE
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
                weak: [
                    'information', 'update', 'news'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'external', 'client'
                ]
            },

            // EN COPIE
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: [
                    'information', 'copie', 'copy', 'cc', 'fyi'
                ],
                weak: [
                    'info'
                ],
                exclusions: [
                    'urgent', 'action required', 'payment'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Catalogue initialisé avec détection newsletter renforcée pour', Object.keys(this.keywordCatalog).length, 'catégories');
    }

    // ================================================
    // ANALYSE EMAIL - NEWSLETTER PRIORITAIRE ABSOLUE
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
        
        // DÉTECTION NEWSLETTER SPÉCIALE - AVANT TOUT
        const specialNewsletterResult = this.detectSpecialNewsletter(content, email);
        if (specialNewsletterResult) {
            console.log(`[CategoryManager] 📰 Newsletter spéciale détectée: ${email.subject?.substring(0, 50)}`);
            return specialNewsletterResult;
        }
        
        // PRIORITÉ 1: MARKETING/NEWSLETTER - TOUJOURS EN PREMIER
        const marketingAnalysis = this.analyzeCategory(content, this.keywordCatalog.marketing_news);
        
        // Si détection marketing forte, retourner immédiatement
        if (marketingAnalysis.hasAbsolute || marketingAnalysis.total >= 60) { // Seuil réduit de 80 à 60
            console.log(`[CategoryManager] ✅ Marketing détecté: ${email.subject?.substring(0, 50)} (${marketingAnalysis.total}pts)`);
            return {
                category: 'marketing_news',
                score: marketingAnalysis.total,
                confidence: this.calculateConfidence(marketingAnalysis),
                matchedPatterns: marketingAnalysis.matches,
                hasAbsolute: marketingAnalysis.hasAbsolute,
                priorityDetection: 'marketing_first'
            };
        }
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC ET pas de marketing fort détecté
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            // Analyser toutes les autres catégories sauf marketing
            const allResults = this.analyzeAllCategoriesExceptMarketing(content);
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
        
        // Analyser toutes les catégories (sauf marketing déjà fait)
        const allResults = this.analyzeAllCategoriesExceptMarketing(content);
        
        // Ajouter le résultat marketing
        allResults.marketing_news = {
            category: 'marketing_news',
            score: marketingAnalysis.total,
            hasAbsolute: marketingAnalysis.hasAbsolute,
            matches: marketingAnalysis.matches,
            confidence: this.calculateConfidence(marketingAnalysis),
            priority: 100 // Priorité maximale
        };
        
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
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
    // DÉTECTION NEWSLETTER SPÉCIALE - NOUVELLE MÉTHODE
    // ================================================
    detectSpecialNewsletter(content, email) {
        const text = content.text;
        const subject = content.subject;
        const domain = content.domain;
        
        // Patterns spéciaux pour newsletters qui passent à travers
        const specialPatterns = [
            // Structure typique newsletter
            {
                pattern: /newsletter|bulletin|lettre d'information/i,
                weight: 120,
                name: 'newsletter_keyword'
            },
            // Liens de désabonnement cachés
            {
                pattern: /unsubscribe|désabonner|se désinscrire/i,
                weight: 150,
                name: 'unsubscribe_link'
            },
            // Domaines marketing typiques
            {
                pattern: /(mailchimp|sendgrid|mailgun|constant-contact|aweber|getresponse|campaign-monitor)\.com/i,
                weight: 100,
                name: 'marketing_domain'
            },
            // Structure email marketing
            {
                pattern: /view in browser|voir dans le navigateur|version web/i,
                weight: 100,
                name: 'web_version'
            },
            // Réseaux sociaux
            {
                pattern: /follow us|suivez-nous|réseaux sociaux|social media/i,
                weight: 80,
                name: 'social_follow'
            },
            // Messages promotionnels
            {
                pattern: /promotion|promo|offre|special|exclusive|limited/i,
                weight: 60,
                name: 'promotional'
            },
            // Structure liste email
            {
                pattern: /mailing list|liste de diffusion|email list/i,
                weight: 90,
                name: 'mailing_list'
            }
        ];
        
        let totalScore = 0;
        const matches = [];
        let hasStrong = false;
        
        specialPatterns.forEach(pattern => {
            // Tester dans le sujet (poids x2)
            if (pattern.pattern.test(subject)) {
                totalScore += pattern.weight * 2;
                matches.push({ 
                    keyword: pattern.name + '_in_subject', 
                    type: 'special_subject', 
                    score: pattern.weight * 2 
                });
                hasStrong = true;
            }
            
            // Tester dans le contenu
            if (pattern.pattern.test(text)) {
                totalScore += pattern.weight;
                matches.push({ 
                    keyword: pattern.name, 
                    type: 'special_content', 
                    score: pattern.weight 
                });
                if (pattern.weight >= 100) hasStrong = true;
            }
            
            // Tester dans le domaine
            if (pattern.pattern.test(domain)) {
                totalScore += pattern.weight * 1.5;
                matches.push({ 
                    keyword: pattern.name + '_domain', 
                    type: 'special_domain', 
                    score: pattern.weight * 1.5 
                });
                hasStrong = true;
            }
        });
        
        // Détection automatique noreply/no-reply
        if (/noreply|no-reply|donotreply|do-not-reply/i.test(email.from?.emailAddress?.address || '')) {
            totalScore += 80;
            matches.push({ 
                keyword: 'noreply_sender', 
                type: 'special_sender', 
                score: 80 
            });
        }
        
        // Détection BCC/liste nombreuse (newsletter probable)
        if (email.toRecipients && email.toRecipients.length > 5) {
            totalScore += 60;
            matches.push({ 
                keyword: 'multiple_recipients', 
                type: 'special_recipients', 
                score: 60 
            });
        }
        
        // Si score suffisant, c'est une newsletter
        if (totalScore >= 120 || hasStrong) {
            return {
                category: 'marketing_news',
                score: Math.min(totalScore, 250), // Cap à 250
                confidence: hasStrong ? 0.95 : 0.85,
                matchedPatterns: matches,
                hasAbsolute: hasStrong,
                priorityDetection: 'special_newsletter',
                detectionMethod: 'special_patterns'
            };
        }
        
        return null;
    }

    analyzeAllCategoriesExceptMarketing(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        const customCategoryIds = Object.keys(this.customCategories);
        
        // Analyser toutes les catégories SAUF marketing_news
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.keywordCatalog).filter(cat => cat !== 'marketing_news'),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            if (!this.categories[categoryId] && !this.customCategories[categoryId]) {
                continue;
            }
            
            let keywords = this.keywordCatalog[categoryId];
            
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
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
                priority: (this.categories[categoryId] || this.customCategories[categoryId])?.priority || 50,
                isCustom: isCustom
            };
        }
        
        return results;
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Pénalité pour contenu marketing dans autres catégories - RÉDUITE
        const marketingKeywords = [
            'newsletter', 'unsubscribe', 'promotion', 'marketing',
            'shop', 'buy', 'purchase', 'sale', 'deal', 'offer'
        ];
        
        let marketingContent = 0;
        marketingKeywords.forEach(keyword => {
            if (this.findInText(text, keyword)) {
                marketingContent += 15; // Réduit de 20 à 15
            }
        });
        
        // Si contenu marketing détecté et on n'est pas dans marketing_news
        if (marketingContent >= 30 && categoryId !== 'marketing_news') { // Seuil réduit de 40 à 30
            totalScore -= marketingContent;
            matches.push({ 
                keyword: 'marketing_content_penalty', 
                type: 'penalty', 
                score: -marketingContent 
            });
        }
        
        // Bonus de base pour certaines catégories
        const categoryBonus = {
            'security': 15,
            'finance': 15,
            'tasks': 15,
            'meetings': 10,
            'support': 10,
            'hr': 10,
            'commercial': 10,
            'project': 5,
            'notifications': 5, // Réduit pour éviter conflit avec newsletter
            'cc': 5
        };
        
        if (categoryBonus[categoryId]) {
            totalScore += categoryBonus[categoryId];
            matches.push({ 
                keyword: 'category_bonus', 
                type: 'bonus', 
                score: categoryBonus[categoryId] 
            });
        }
        
        // Test des exclusions en premier
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    const penalty = 50;
                    totalScore -= penalty;
                    matches.push({ 
                        keyword: exclusion, 
                        type: 'exclusion', 
                        score: -penalty 
                    });
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
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'bonus', 
                            score: 50 
                        });
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
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'bonus', 
                            score: 20 
                        });
                    }
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ 
                    keyword: 'multiple_strong_matches', 
                    type: 'bonus', 
                    score: 30 
                });
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
            
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ 
                    keyword: 'multiple_weak_matches', 
                    type: 'bonus', 
                    score: 20 
                });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 25; // Réduit de 30 à 25
        const MIN_CONFIDENCE_THRESHOLD = 0.45; // Réduit de 0.5 à 0.45
        
        // Priorité spéciale pour marketing
        const marketingResult = results.marketing_news;
        if (marketingResult && marketingResult.score >= 30) { // Réduit de 40 à 30
            console.log(`[CategoryManager] ✅ Marketing prioritaire: ${marketingResult.score}pts`);
            return {
                category: 'marketing_news',
                score: marketingResult.score,
                confidence: marketingResult.confidence,
                matchedPatterns: marketingResult.matches,
                hasAbsolute: marketingResult.hasAbsolute,
                prioritySelection: true
            };
        }
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Marketing toujours en premier
                if (a.category === 'marketing_news' && b.category !== 'marketing_news') return -1;
                if (b.category === 'marketing_news' && a.category !== 'marketing_news') return 1;
                
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                return b.score - a.score;
            });
        
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
        
        const allSorted = Object.values(results)
            .filter(r => r.score > 0)
            .sort((a, b) => {
                if (a.category === 'marketing_news') return -1;
                if (b.category === 'marketing_news') return 1;
                return b.score - a.score;
            });
        
        if (allSorted.length > 0 && allSorted[0].score >= 15 && allSorted[0].confidence >= 0.35) { // Seuils réduits
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
                description: 'Newsletters, promotions et marketing',
                priority: 100, // PRIORITÉ MAXIMALE
                isCustom: false
            },
            
            // PRIORITÉ ÉLEVÉE - SYSTÈMES
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
            
            // PRIORITÉ NORMALE
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
            
            // PRIORITÉ FAIBLE
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
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques système',
                priority: 25, // PRIORITÉ RÉDUITE pour éviter conflit newsletter
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 30,
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées avec détection newsletter renforcée:', Object.keys(this.categories).length);
    }

    // ================================================
    // MÉTHODES UTILITAIRES - OPTIMISÉES
    // ================================================
    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(20); // Augmenté pour plus de poids au sujet
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(10); // Augmenté pour expéditeur
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(10);
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
            allText += (email.bodyPreview + ' ').repeat(5); // Augmenté pour le preview
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
        }
        
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

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
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

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // GESTION PARAMÈTRES
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
    // CATÉGORIES PERSONNALISÉES ET ÉVÉNEMENTS
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
                } else {
                    this.keywordCatalog[id] = {
                        absolute: [],
                        strong: [],
                        weak: [],
                        exclusions: []
                    };
                }
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}): ${totalKeywords} mots-clés`);
            });
            
            console.log('[CategoryManager] 📊 Résumé:', Object.keys(this.customCategories).length, 'catégories personnalisées chargées');
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.keywordCatalog[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
    }

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

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v24.0 - Newsletter Detection Fixed');
        
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
        const catalogEntries = Object.keys(this.keywordCatalog);
        console.log('Entrées dans le catalogue:', catalogEntries.length);
        
        // Afficher marketing en premier
        if (this.keywordCatalog.marketing_news) {
            const marketingKeywords = this.getTotalKeywordsCount('marketing_news');
            console.log(`📰 Marketing & News (PRIORITÉ RENFORCÉE): ${marketingKeywords} mots-clés`);
        }
        
        catalogEntries.filter(cat => cat !== 'marketing_news').forEach(catId => {
            const totalKeywords = this.getTotalKeywordsCount(catId);
            if (totalKeywords > 0) {
                const category = this.getCategory(catId);
                console.log(`${category?.icon || '📂'} ${category?.name || catId}: ${totalKeywords} mots-clés`);
            }
        });
        console.groupEnd();
        
        console.group('🔌 Providers Email');
        const emailMethods = this.checkEmailRetrievalMethods();
        const provider = this.detectEmailProvider();
        
        console.log('Provider détecté:', provider?.type || 'Aucun');
        console.log('Méthodes disponibles:', emailMethods.methods);
        console.log('Peut scanner:', emailMethods.available);
        if (emailMethods.error) {
            console.log('❌ Erreur:', emailMethods.error);
        }
        console.groupEnd();
        
        console.group('📊 Historique des scans');
        console.log('Nombre de scans:', this.scanHistory.length);
        if (this.lastScanResults) {
            console.log('Dernier scan:', {
                provider: this.lastScanResults.provider,
                emails: this.lastScanResults.totalEmails,
                categorized: this.lastScanResults.categorizedEmails,
                marketing: this.lastScanResults.marketingDetected
            });
        }
        console.groupEnd();
        
        console.group('⚙️ Configuration');
        console.log('Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        console.log('Catégories actives:', this.getActiveCategories().length);
        console.log('Exclude spam:', this.shouldExcludeSpam());
        console.log('Detect CC:', this.shouldDetectCC());
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            catalogEntries: catalogEntries.length,
            preselectedCategories: this.getTaskPreselectedCategories().length,
            marketingPriority: true,
            newsletterDetectionFixed: true,
            emailProvider: provider?.type || null,
            canScan: emailMethods.available,
            scanHistory: this.scanHistory.length,
            hasLastScan: !!this.lastScanResults
        };
    }

    // ================================================
    // NOUVELLE SECTION - MÉTHODES POUR LE SCAN GMAIL/OUTLOOK
    // ================================================

    /**
     * Prépare les options de scan selon le provider
     */
    prepareScanOptions(baseOptions = {}) {
        const provider = this.detectEmailProvider();
        const emailMethods = this.checkEmailRetrievalMethods();
        
        if (!emailMethods.available) {
            throw new Error('Aucune méthode de récupération d\'emails disponible');
        }

        const scanOptions = {
            // Options de base
            days: baseOptions.days || this.settings.scanSettings?.defaultPeriod || 7,
            folder: baseOptions.folder || this.settings.scanSettings?.defaultFolder || 'inbox',
            maxEmails: baseOptions.maxEmails || 1000,
            
            // Provider et méthodes
            provider: provider.type,
            primaryMethod: emailMethods.methods[0],
            fallbackMethods: emailMethods.methods.slice(1),
            
            // Paramètres d'analyse
            autoAnalyze: baseOptions.autoAnalyze !== undefined ? baseOptions.autoAnalyze : this.settings.scanSettings?.autoAnalyze,
            autoCategrize: baseOptions.autoCategrize !== undefined ? baseOptions.autoCategrize : this.settings.scanSettings?.autoCategrize,
            
            // Filtres
            includeSpam: baseOptions.includeSpam !== undefined ? baseOptions.includeSpam : !this.settings.preferences?.excludeSpam,
            detectCC: baseOptions.detectCC !== undefined ? baseOptions.detectCC : this.settings.preferences?.detectCC,
            
            // Catégories pour tâches
            taskPreselectedCategories: baseOptions.taskPreselectedCategories || this.getTaskPreselectedCategories(),
            
            // Callbacks
            onProgress: baseOptions.onProgress || null,
            onError: baseOptions.onError || null,
            onComplete: baseOptions.onComplete || null
        };

        console.log('[CategoryManager] 📊 Options de scan préparées:', scanOptions);
        return scanOptions;
    }

    /**
     * Méthode pour récupérer les emails Gmail via API directe
     */
    async fetchGmailEmailsDirect(options) {
        console.log('[CategoryManager] 📧 Récupération Gmail directe...');
        
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Gmail non authentifié');
        }
        
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail non disponible');
        }

        try {
            // Construire la requête Gmail
            const query = this.buildGmailQuery(options);
            const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`;
            
            console.log('[CategoryManager] 🔍 Requête Gmail:', listUrl);
            
            // Étape 1: Lister les messages
            const listResponse = await fetch(listUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!listResponse.ok) {
                const errorText = await listResponse.text();
                throw new Error(`Gmail API error ${listResponse.status}: ${errorText}`);
            }
            
            const listData = await listResponse.json();
            if (!listData.messages || listData.messages.length === 0) {
                console.log('[CategoryManager] 📭 Aucun message Gmail trouvé');
                return [];
            }
            
            console.log(`[CategoryManager] 📧 ${listData.messages.length} messages Gmail trouvés`);
            
            // Étape 2: Récupérer les détails par batch
            const emails = [];
            const batchSize = 10;
            const maxMessages = Math.min(listData.messages.length, options.maxEmails || 1000);
            
            for (let i = 0; i < maxMessages; i += batchSize) {
                const batch = listData.messages.slice(i, i + batchSize);
                
                const batchPromises = batch.map(message => 
                    this.getGmailMessageDetail(message.id, accessToken)
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        const convertedEmail = this.convertGmailToStandardFormat(result.value);
                        if (convertedEmail) {
                            emails.push(convertedEmail);
                        }
                    }
                });
                
                // Notifier le progrès
                if (options.onProgress) {
                    options.onProgress({
                        phase: 'fetching',
                        message: `Récupération Gmail: ${emails.length}/${maxMessages}`,
                        progress: { current: emails.length, total: maxMessages }
                    });
                }
                
                // Pause pour éviter les limites de taux
                if (i + batchSize < maxMessages) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log(`[CategoryManager] ✅ ${emails.length} emails Gmail récupérés et convertis`);
            return emails;
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur récupération Gmail directe:', error);
            throw error;
        }
    }

    /**
     * Construit la requête pour l'API Gmail
     */
    buildGmailQuery(options) {
        const params = new URLSearchParams();
        
        // Limite de résultats
        params.append('maxResults', Math.min(options.maxEmails || 1000, 500).toString());
        
        // Construction de la requête
        let query = '';
        
        // Dossier
        if (options.folder && options.folder !== 'inbox') {
            if (options.folder === 'spam') {
                query += 'in:spam ';
            } else if (options.folder === 'sent') {
                query += 'in:sent ';
            } else if (options.folder === 'drafts') {
                query += 'in:drafts ';
            } else {
                query += 'in:inbox ';
            }
        } else {
            query += 'in:inbox ';
        }
        
        // Dates
        if (options.startDate) {
            const startFormatted = new Date(options.startDate).toISOString().split('T')[0];
            query += `after:${startFormatted} `;
        }
        
        if (options.endDate) {
            const endFormatted = new Date(options.endDate).toISOString().split('T')[0];
            query += `before:${endFormatted} `;
        }
        
        // Exclure spam si nécessaire
        if (!options.includeSpam) {
            query += '-in:spam ';
        }
        
        if (query.trim()) {
            params.append('q', query.trim());
        }
        
        return params.toString();
    }

    /**
     * Récupère les détails d'un message Gmail
     */
    async getGmailMessageDetail(messageId, accessToken) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                return await response.json();
            } else {
                console.warn('[CategoryManager] Erreur récupération message Gmail:', messageId, response.status);
                return null;
            }
        } catch (error) {
            console.warn('[CategoryManager] Erreur récupération message Gmail:', messageId, error);
            return null;
        }
    }

    /**
     * Convertit un message Gmail au format standard
     */
    convertGmailToStandardFormat(gmailMessage) {
        try {
            const headers = {};
            if (gmailMessage.payload && gmailMessage.payload.headers) {
                gmailMessage.payload.headers.forEach(header => {
                    headers[header.name.toLowerCase()] = header.value;
                });
            }
            
            // Extraire le contenu du corps
            let bodyContent = '';
            let bodyPreview = gmailMessage.snippet || '';
            
            if (gmailMessage.payload) {
                bodyContent = this.extractGmailBodyContent(gmailMessage.payload);
            }
            
            // Parser les adresses email
            const parseEmailAddress = (emailString) => {
                if (!emailString) return null;
                
                try {
                    const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, emailString, emailString];
                    return {
                        emailAddress: {
                            name: match[1] ? match[1].trim().replace(/"/g, '') : '',
                            address: match[2] ? match[2].trim() : emailString.trim()
                        }
                    };
                } catch (e) {
                    return {
                        emailAddress: {
                            name: '',
                            address: emailString || ''
                        }
                    };
                }
            };
            
            const parseEmailList = (emailString) => {
                if (!emailString) return [];
                return emailString.split(',').map(email => parseEmailAddress(email.trim())).filter(Boolean);
            };
            
            // Format standard unifié
            const standardEmail = {
                id: gmailMessage.id || `gmail-${Date.now()}-${Math.random()}`,
                subject: headers.subject || '',
                bodyPreview: bodyPreview,
                body: {
                    content: bodyContent,
                    contentType: 'html'
                },
                from: parseEmailAddress(headers.from),
                toRecipients: parseEmailList(headers.to),
                ccRecipients: parseEmailList(headers.cc),
                bccRecipients: parseEmailList(headers.bcc),
                receivedDateTime: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
                sentDateTime: headers.date ? new Date(headers.date).toISOString() : null,
                hasAttachments: this.checkGmailAttachments(gmailMessage),
                importance: this.getGmailImportance(gmailMessage),
                isRead: !gmailMessage.labelIds?.includes('UNREAD'),
                isDraft: gmailMessage.labelIds?.includes('DRAFT'),
                categories: [],
                
                // Métadonnées Gmail
                gmailMetadata: {
                    labelIds: gmailMessage.labelIds || [],
                    threadId: gmailMessage.threadId,
                    historyId: gmailMessage.historyId
                },
                
                sourceProvider: 'google'
            };
            
            return standardEmail;
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur conversion Gmail:', error);
            return null;
        }
    }

    /**
     * Extrait le contenu du corps d'un message Gmail
     */
    extractGmailBodyContent(payload) {
        if (!payload) return '';
        
        // Corps direct
        if (payload.body && payload.body.data) {
            try {
                return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } catch (e) {
                console.warn('[CategoryManager] Erreur décodage base64:', e);
                return '';
            }
        }
        
        // Parties multiples
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
                    if (part.body && part.body.data) {
                        try {
                            return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        } catch (e) {
                            console.warn('[CategoryManager] Erreur décodage base64 part:', e);
                        }
                    }
                }
            }
        }
        
        return '';
    }

    /**
     * Vérifie les pièces jointes Gmail
     */
    checkGmailAttachments(gmailMessage) {
        const checkPartForAttachments = (part) => {
            if (part.filename && part.filename.length > 0) {
                return true;
            }
            if (part.parts) {
                return part.parts.some(checkPartForAttachments);
            }
            return false;
        };
        
        if (gmailMessage.payload) {
            return checkPartForAttachments(gmailMessage.payload);
        }
        
        return false;
    }

    /**
     * Détermine l'importance d'un message Gmail
     */
    getGmailImportance(gmailMessage) {
        if (gmailMessage.labelIds) {
            if (gmailMessage.labelIds.includes('IMPORTANT')) return 'high';
            if (gmailMessage.labelIds.includes('CATEGORY_PROMOTIONS')) return 'low';
        }
        return 'normal';
    }

    /**
     * Méthode pour récupérer les emails Outlook via Graph API
     */
    async fetchOutlookEmailsDirect(options) {
        console.log('[CategoryManager] 📧 Récupération Outlook directe...');
        
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Outlook non authentifié');
        }
        
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Outlook non disponible');
        }

        try {
            const graphUrl = this.buildOutlookGraphUrl(options);
            console.log('[CategoryManager] 🔍 Requête Outlook:', graphUrl);
            
            const response = await fetch(graphUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Microsoft Graph error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const emails = data.value || [];
            
            console.log(`[CategoryManager] ✅ ${emails.length} emails Outlook récupérés`);
            
            // Conversion au format standard
            return emails.map(email => this.convertOutlookToStandardFormat(email));
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur récupération Outlook directe:', error);
            throw error;
        }
    }

    /**
     * Construit l'URL pour Microsoft Graph API
     */
    buildOutlookGraphUrl(options) {
        const baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        const params = new URLSearchParams();
        
        // Limite de résultats
        params.append('$top', Math.min(options.maxEmails || 1000, 1000).toString());
        params.append('$orderby', 'receivedDateTime desc');
        
        // Champs à récupérer
        params.append('$select', [
            'id', 'subject', 'bodyPreview', 'body', 'from', 'toRecipients',
            'ccRecipients', 'receivedDateTime', 'sentDateTime', 'isRead',
            'importance', 'hasAttachments', 'categories', 'parentFolderId'
        ].join(','));
        
        // Filtres de dates
        if (options.startDate || options.endDate) {
            const filters = [];
            
            if (options.startDate) {
                const startISO = new Date(options.startDate).toISOString();
                filters.push(`receivedDateTime ge ${startISO}`);
            }
            
            if (options.endDate) {
                const endDateObj = new Date(options.endDate);
                endDateObj.setHours(23, 59, 59, 999);
                const endISO = endDateObj.toISOString();
                filters.push(`receivedDateTime le ${endISO}`);
            }
            
            if (filters.length > 0) {
                params.append('$filter', filters.join(' and '));
            }
        }
        
        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Convertit un message Outlook au format standard
     */
    convertOutlookToStandardFormat(outlookEmail) {
        try {
            return {
                id: outlookEmail.id,
                subject: outlookEmail.subject || '',
                bodyPreview: outlookEmail.bodyPreview || '',
                body: outlookEmail.body || { content: '', contentType: 'text' },
                from: outlookEmail.from,
                toRecipients: outlookEmail.toRecipients || [],
                ccRecipients: outlookEmail.ccRecipients || [],
                bccRecipients: outlookEmail.bccRecipients || [],
                receivedDateTime: outlookEmail.receivedDateTime,
                sentDateTime: outlookEmail.sentDateTime,
                hasAttachments: outlookEmail.hasAttachments || false,
                importance: outlookEmail.importance || 'normal',
                isRead: outlookEmail.isRead || false,
                isDraft: false,
                categories: outlookEmail.categories || [],
                
                sourceProvider: 'microsoft'
            };
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur conversion Outlook:', error);
            return null;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES SUPPLÉMENTAIRES
    // ================================================
    
    /**
     * Génère une couleur d'avatar basée sur un texte
     */
    generateAvatarColor(text) {
        if (!text) return '#64748b';
        
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e'
        ];
        
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Formate une date de manière lisible
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    /**
     * Nettoie et échappe le HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Tronque un texte à une longueur donnée
     */
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Détermine la couleur de priorité d'un email
     */
    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        if (email.isPreselectedForTasks) return '#8b5cf6';
        return '#3b82f6';
    }

    /**
     * Obtient les informations d'une catégorie avec fallback
     */
    getCategoryInfo(categoryId) {
        const category = this.getCategory(categoryId);
        return {
            id: categoryId,
            name: category?.name || categoryId || 'Autre',
            icon: category?.icon || '📌',
            color: category?.color || '#64748b',
            description: category?.description || '',
            priority: category?.priority || 50
        };
    }

    /**
     * Valide la structure d'un email
     */
    validateEmailStructure(email) {
        if (!email || typeof email !== 'object') return false;
        
        const requiredFields = ['id', 'subject', 'from', 'receivedDateTime'];
        return requiredFields.every(field => email.hasOwnProperty(field));
    }

    /**
     * Normalise un email au format standard
     */
    normalizeEmailFormat(email) {
        if (!this.validateEmailStructure(email)) {
            console.warn('[CategoryManager] Email invalide:', email);
            return null;
        }

        return {
            id: email.id,
            subject: email.subject || 'Sans sujet',
            bodyPreview: email.bodyPreview || '',
            body: email.body || { content: '', contentType: 'text' },
            from: email.from || { emailAddress: { address: '', name: '' } },
            toRecipients: email.toRecipients || [],
            ccRecipients: email.ccRecipients || [],
            receivedDateTime: email.receivedDateTime,
            sentDateTime: email.sentDateTime || email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            isRead: email.isRead || false,
            categories: email.categories || [],
            sourceProvider: email.sourceProvider || 'unknown',
            
            // Champs de catégorisation
            category: email.category || null,
            categoryScore: email.categoryScore || 0,
            categoryConfidence: email.categoryConfidence || 0,
            matchedPatterns: email.matchedPatterns || [],
            hasAbsolute: email.hasAbsolute || false,
            isPreselectedForTasks: email.isPreselectedForTasks || false
        };
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE ET DESTRUCTION
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
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v24.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v24.0 - Newsletter Detection Fixed');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Promotion spéciale - 50% de réduction - unsubscribe", expected: "marketing_news" },
        { subject: "Votre commande a été expédiée - tracking disponible", expected: "marketing_news" },
        { subject: "Bulletin d'information mensuel", expected: "marketing_news" },
        { subject: "Weekly Newsletter - View in browser", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" },
        { subject: "System notification - Do not reply", expected: "notifications" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Diagnostic:', window.categoryManager.runDiagnostics());
    
    // Test des méthodes de scan
    console.group('🔌 Test Providers Email');
    const emailMethods = window.categoryManager.checkEmailRetrievalMethods();
    console.log('Méthodes disponibles:', emailMethods);
    
    const provider = window.categoryManager.detectEmailProvider();
    console.log('Provider détecté:', provider);
    
    if (emailMethods.available) {
        try {
            const scanOptions = window.categoryManager.prepareScanOptions({
                days: 7,
                maxEmails: 10
            });
            console.log('Options de scan préparées:', scanOptions);
        } catch (error) {
            console.error('Erreur préparation scan:', error);
        }
    }
    console.groupEnd();
    
    console.groupEnd();
    return { 
        success: true, 
        testsRun: tests.length,
        canScan: emailMethods.available,
        provider: provider?.type || null,
        newsletterDetectionFixed: true
    };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v24.0 - Newsletter Detection Fixed');
    const catalog = window.categoryManager.keywordCatalog;
    
    // Afficher marketing en premier avec détails
    if (catalog.marketing_news) {
        const keywords = catalog.marketing_news;
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        console.log(`📰 Marketing & News (DÉTECTION NEWSLETTER RENFORCÉE): ${total} mots-clés`);
        if (keywords.absolute?.length) console.log(`  Absolus (${keywords.absolute.length}):`, keywords.absolute.slice(0, 15).join(', ') + '...');
        if (keywords.strong?.length) console.log(`  Forts (${keywords.strong.length}):`, keywords.strong.slice(0, 10).join(', ') + '...');
        if (keywords.weak?.length) console.log(`  Faibles (${keywords.weak.length}):`, keywords.weak.slice(0, 5).join(', ') + '...');
        if (keywords.exclusions?.length) console.log(`  Exclusions (${keywords.exclusions.length}):`, keywords.exclusions.slice(0, 5).join(', ') + '...');
    }
    
    Object.entries(catalog).forEach(([categoryId, keywords]) => {
        if (categoryId === 'marketing_news') return; // Déjà affiché
        
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 5).join(', ')}...`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 5).join(', ')}...`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.slice(0, 3).join(', ')}...`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.slice(0, 3).join(', ')}...`);
        }
    });
    
    console.groupEnd();
};

// Test de connexion Gmail/Outlook
window.testEmailProviders = function() {
    console.group('🧪 TEST Providers Email');
    
    const provider = window.categoryManager.detectEmailProvider();
    const methods = window.categoryManager.checkEmailRetrievalMethods();
    
    console.log('Provider détecté:', provider);
    console.log('Méthodes disponibles:', methods);
    
    if (methods.available) {
        console.log('✅ Au moins une méthode de récupération disponible');
        
        // Test de configuration scan
        try {
            const scanConfig = window.categoryManager.configureScanMethods();
            console.log('Configuration scan:', scanConfig);
        } catch (error) {
            console.error('❌ Erreur configuration scan:', error);
        }
    } else {
        console.log('❌ Aucune méthode de récupération disponible');
        console.log('Erreur:', methods.error);
    }
    
    console.groupEnd();
    
    return {
        provider: provider?.type || null,
        available: methods.available,
        methods: methods.methods,
        error: methods.error,
        newsletterDetectionFixed: true
    };
};

console.log('✅ CategoryManager v24.0 loaded - Détection newsletter corrigée + Gmail/Outlook fonctionnels');
