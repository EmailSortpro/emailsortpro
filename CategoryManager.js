// CategoryManager.js - Version 25.0 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE + AFFICHAGE CORRIGÉ

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
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeKeywordCatalog(); // CATALOGUE ULTRA-RENFORCÉ POUR NEWSLETTERS
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Version 25.0 - Détection newsletter ULTRA-RENFORCÉE + Affichage corrigé');
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - ULTRA-RENFORCÉ POUR NEWSLETTERS
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation catalogue ULTRA-RENFORCÉ pour newsletters...');
        
        this.keywordCatalog = {
            // PRIORITÉ MAXIMALE ABSOLUE - MARKETING & NEWS - DÉTECTION ULTRA-RENFORCÉE
            marketing_news: {
                absolute: [
                    // === DÉSABONNEMENT - PRIORITÉ ABSOLUE ===
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
                    
                    // === NEWSLETTER EXPLICITES - ULTRA-RENFORCÉ ===
                    'newsletter', 'newsletter hebdomadaire', 'newsletter mensuelle',
                    'newsletter quotidienne', 'weekly newsletter', 'monthly newsletter',
                    'daily newsletter', 'newsletter gratuite', 'free newsletter',
                    'notre newsletter', 'our newsletter', 'la newsletter',
                    'votre newsletter', 'your newsletter', 'this newsletter',
                    
                    // === MAILING ET DIFFUSION ===
                    'mailing list', 'mailing', 'e-mailing', 'emailing',
                    'liste de diffusion', 'diffusion email', 'email marketing',
                    'marketing email', 'campagne email', 'email campaign',
                    'mass email', 'email blast', 'bulk email',
                    
                    // === BULLETIN D'INFORMATION ===
                    'bulletin d\'information', 'lettre d\'information',
                    'bulletin électronique', 'lettre électronique',
                    'bulletin d\'actualités', 'actualités par email',
                    'infolettre', 'info-lettre', 'courrier électronique',
                    
                    // === STRUCTURE NEWSLETTER ===
                    'view in browser', 'voir dans le navigateur', 'version web',
                    'web version', 'version navigateur', 'afficher dans navigateur',
                    'having trouble viewing', 'problème d\'affichage',
                    
                    // === DOMAINES MARKETING SPÉCIALISÉS ===
                    'mailchimp', 'sendgrid', 'mailgun', 'constant-contact',
                    'aweber', 'getresponse', 'campaign-monitor', 'sendinblue',
                    'klaviyo', 'convertkit', 'activecampaign', 'drip',
                    'infusionsoft', 'pardot', 'hubspot', 'marketo',
                    
                    // === NOREPLY ET AUTOMATIQUE ===
                    'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                    'notifications@', 'updates@', 'news@', 'newsletter@',
                    'marketing@', 'promo@', 'offers@', 'deals@',
                    'automated message', 'message automatique',
                    'automatic notification', 'notification automatique',
                    
                    // === CONTENU PROMOTIONNEL EXPLICITE ===
                    'promotion exclusive', 'exclusive promotion', 'offre exclusive',
                    'exclusive offer', 'limited offer', 'offre limitée',
                    'special offer', 'offre spéciale', 'deal of the day',
                    'affaire du jour', 'flash sale', 'vente flash',
                    'limited time', 'temps limité', 'expires soon', 'expire bientôt',
                    'shop now', 'acheter maintenant', 'buy now', 'achetez maintenant',
                    
                    // === E-COMMERCE ET RETAIL ===
                    'order confirmation', 'confirmation de commande',
                    'shipping confirmation', 'confirmation d\'expédition',
                    'order shipped', 'commande expédiée', 'votre commande',
                    'your order', 'tracking number', 'numéro de suivi',
                    'cart reminder', 'rappel panier', 'abandoned cart',
                    'panier abandonné', 'complete your order',
                    
                    // === SERVICES CLOUD ET TECH - SPÉCIFIQUE ===
                    'google cloud platform', 'aws notifications', 'azure updates',
                    'cloud platform notifications', 'service updates',
                    'platform news', 'developer newsletter',
                    'api updates', 'service announcements',
                    
                    // === STREAMING ET DIVERTISSEMENT ===
                    'twitch notifications', 'youtube notifications',
                    'streaming notifications', 'new video', 'nouvelle vidéo',
                    'live stream', 'direct live', 'streaming en direct',
                    'subscribe to channel', 'abonnez-vous à la chaîne',
                    
                    // === ENCODAGE ET CARACTÈRES SPÉCIAUX - AJOUT CRITICAL ===
                    'sÃ©curitÃ©', 'notificatÃ©', 'prÃ©fÃ©rences',
                    'dÃ©sabonner', 'rÃ©ception', 'Ã©quipe',
                    'confidentialitÃ©', 'dÃ©claration',
                    // Pour gérer les problèmes d'encodage UTF-8
                    'sécurité', 'notification', 'préférences',
                    'désabonner', 'réception', 'équipe',
                    'confidentialité', 'déclaration'
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
                    
                    // Retail
                    'brand', 'marque', 'collection', 'catalog',
                    'catalogue', 'lookbook', 'trend', 'tendance',
                    'fashion', 'mode', 'style', 'design',
                    
                    // Cloud et tech
                    'platform', 'service', 'api', 'cloud',
                    'developer', 'développeur', 'feature',
                    'fonctionnalité', 'release', 'version',
                    
                    // Streaming
                    'streaming', 'live', 'video', 'channel',
                    'chaîne', 'content', 'contenu', 'episode',
                    'épisode', 'show', 'émission'
                ],
                
                weak: [
                    'update', 'discover', 'découvrir', 'explore',
                    'learn more', 'en savoir plus', 'read more',
                    'download', 'télécharger', 'free', 'gratuit',
                    'tips', 'conseils', 'guide', 'tutorial',
                    'how to', 'comment', 'best practices',
                    'meilleures pratiques', 'advice', 'avis',
                    'information', 'info', 'help', 'aide'
                ],
                
                exclusions: [
                    // Éviter les faux positifs - TRÈS RÉDUIT
                    'urgent task', 'tâche urgente',
                    'security alert urgent', 'alerte sécurité urgente',
                    'password expired urgent', 'mot de passe expiré urgent',
                    'account suspended urgent', 'compte suspendu urgent'
                ]
            },

            // SÉCURITÉ - Catégorie très spécifique
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
                    'unauthorized access', 'accès non autorisé'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'login', 'connexion', 'access', 'accès',
                    'compte', 'account', 'breach', 'violation'
                ],
                weak: [
                    'user', 'utilisateur', 'protection', 'secure'
                ],
                exclusions: [
                    'newsletter', 'unsubscribe', 'promotion', 'marketing',
                    'shop', 'buy', 'order', 'purchase', 'sale',
                    'mailing list', 'email preferences'
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
                    'shop', 'buy', 'order', 'sale', 'mailing list'
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
                    'mailing list', 'unsubscribe'
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

            // NOTIFICATIONS SYSTÈME - PRIORITÉ RÉDUITE
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
                    'rappel', 'status', 'statut'
                ],
                weak: [
                    'info', 'information', 'notice', 'avis'
                ],
                exclusions: [
                    // RENFORCÉ pour éviter conflit avec newsletter
                    'newsletter', 'unsubscribe', 'promotion', 'offer',
                    'shop', 'buy', 'purchase', 'sale', 'deal',
                    'marketing', 'campaign', 'advertising',
                    'mailing list', 'email preferences', 'subscription',
                    'discount', 'special offer', 'limited time',
                    'exclusive', 'promo', 'code promo',
                    'new arrivals', 'nouveautés', 'flash sale',
                    'vente flash', 'soldes', 'réduction',
                    'follow us', 'social media', 'facebook',
                    'twitter', 'instagram', 'view in browser'
                ]
            },

            // EN COPIE - PRIORITÉ FAIBLE
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
                    'urgent', 'action required', 'payment', 'newsletter'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Catalogue ULTRA-RENFORCÉ initialisé pour', Object.keys(this.keywordCatalog).length, 'catégories avec focus newsletter ABSOLU');
    }

    // ================================================
    // ANALYSE EMAIL - NEWSLETTER PRIORITÉ ABSOLUE RENFORCÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContentEnhanced(email);
        
        // Vérifier les exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // DÉTECTION NEWSLETTER ULTRA-PRIORITAIRE - PLUSIEURS MÉTHODES
        const newsletterResult = this.detectNewsletterUltraEnhanced(content, email);
        if (newsletterResult) {
            console.log(`[CategoryManager] 📰 NEWSLETTER DÉTECTÉE: ${email.subject?.substring(0, 50)} (Score: ${newsletterResult.score})`);
            return newsletterResult;
        }
        
        // PRIORITÉ 1: MARKETING/NEWSLETTER - ANALYSE STANDARD RENFORCÉE
        const marketingAnalysis = this.analyzeCategory(content, this.keywordCatalog.marketing_news);
        
        // Si détection marketing forte, retourner immédiatement avec seuil RÉDUIT
        if (marketingAnalysis.hasAbsolute || marketingAnalysis.total >= 40) { // Seuil RÉDUIT de 60 à 40
            console.log(`[CategoryManager] ✅ Marketing/Newsletter détecté: ${email.subject?.substring(0, 50)} (${marketingAnalysis.total}pts)`);
            return {
                category: 'marketing_news',
                score: marketingAnalysis.total,
                confidence: this.calculateConfidence(marketingAnalysis),
                matchedPatterns: marketingAnalysis.matches,
                hasAbsolute: marketingAnalysis.hasAbsolute,
                priorityDetection: 'marketing_standard'
            };
        }
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC ET pas de marketing détecté
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
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
        
        // Ajouter le résultat marketing avec priorité maximale
        allResults.marketing_news = {
            category: 'marketing_news',
            score: marketingAnalysis.total,
            hasAbsolute: marketingAnalysis.hasAbsolute,
            matches: marketingAnalysis.matches,
            confidence: this.calculateConfidence(marketingAnalysis),
            priority: 100 // Priorité maximale ABSOLUE
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
    // DÉTECTION NEWSLETTER ULTRA-RENFORCÉE - NOUVELLE MÉTHODE
    // ================================================
    detectNewsletterUltraEnhanced(content, email) {
        let totalScore = 0;
        const matches = [];
        let hasUltraStrong = false;
        
        // === MÉTHODE 1: DÉTECTION PAR ADRESSE EMAIL ===
        const senderAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const senderName = email.from?.emailAddress?.name?.toLowerCase() || '';
        
        // Domaines newsletter absolus
        const newsletterDomains = [
            'mailchimp.com', 'sendgrid.net', 'constantcontact.com',
            'aweber.com', 'getresponse.com', 'campaign-monitor.com',
            'sendinblue.com', 'klaviyo.com', 'convertkit.com',
            'activecampaign.com', 'drip.com', 'infusionsoft.com',
            'pardot.com', 'hubspot.com', 'marketo.com',
            'eloqua.com', 'responsys.com', 'exacttarget.com',
            'silverpop.com', 'mailgun.com', 'postmark.com'
        ];
        
        // Vérification domaine
        const domain = this.extractDomain(senderAddress);
        if (newsletterDomains.some(nd => domain.includes(nd))) {
            totalScore += 200;
            hasUltraStrong = true;
            matches.push({ keyword: 'newsletter_domain', type: 'ultra_strong', score: 200 });
        }
        
        // Adresses noreply
        const noreplyPatterns = [
            'noreply', 'no-reply', 'donotreply', 'do-not-reply',
            'notifications', 'updates', 'news', 'newsletter',
            'marketing', 'promo', 'offers', 'deals'
        ];
        
        if (noreplyPatterns.some(pattern => senderAddress.includes(pattern))) {
            totalScore += 150;
            hasUltraStrong = true;
            matches.push({ keyword: 'noreply_address', type: 'ultra_strong', score: 150 });
        }
        
        // === MÉTHODE 2: HEADER "SE DÉSABONNER" ===
        // Gmail affiche souvent "Se désabonner" dans l'interface à côté de l'adresse
        if (content.text.includes('se désabonner') || content.text.includes('unsubscribe')) {
            totalScore += 180;
            hasUltraStrong = true;
            matches.push({ keyword: 'unsubscribe_header', type: 'ultra_strong', score: 180 });
        }
        
        // === MÉTHODE 3: DÉTECTION PAR SUJET ===
        const subject = content.subject;
        
        // Patterns de sujet newsletter
        const subjectNewsletterPatterns = [
            /newsletter/i, /bulletin/i, /actualités/i, /news/i,
            /updates/i, /mises à jour/i, /informations/i,
            /communication/i, /annonces/i, /nouveautés/i,
            /promotion/i, /offre/i, /special/i, /exclusive/i,
            /limited/i, /flash/i, /deal/i, /sale/i,
            /notification/i, /alert/i, /reminder/i,
            /confirmation/i, /update/i, /weekly/i, /monthly/i,
            /daily/i, /hebdomadaire/i, /mensuel/i, /quotidien/i
        ];
        
        let subjectMatches = 0;
        subjectNewsletterPatterns.forEach(pattern => {
            if (pattern.test(subject)) {
                subjectMatches++;
                totalScore += 60;
                matches.push({ keyword: pattern.source, type: 'subject_strong', score: 60 });
            }
        });
        
        if (subjectMatches >= 2) {
            totalScore += 100;
            hasUltraStrong = true;
            matches.push({ keyword: 'multiple_subject_patterns', type: 'ultra_strong', score: 100 });
        }
        
        // === MÉTHODE 4: CONTENU NEWSLETTER SPÉCIFIQUE ===
        const newsletterContentPatterns = [
            'view in browser', 'voir dans le navigateur',
            'having trouble viewing', 'problème d\'affichage',
            'follow us on', 'suivez-nous sur',
            'you are receiving this', 'vous recevez cet email',
            'mailing list', 'liste de diffusion',
            'email preferences', 'préférences email',
            'manage subscription', 'gérer abonnement'
        ];
        
        let contentMatches = 0;
        newsletterContentPatterns.forEach(pattern => {
            if (content.text.includes(pattern.toLowerCase())) {
                contentMatches++;
                totalScore += 40;
                matches.push({ keyword: pattern, type: 'content_strong', score: 40 });
            }
        });
        
        if (contentMatches >= 3) {
            totalScore += 80;
            hasUltraStrong = true;
            matches.push({ keyword: 'multiple_content_patterns', type: 'ultra_strong', score: 80 });
        }
        
        // === MÉTHODE 5: STRUCTURE HTML NEWSLETTER ===
        if (content.hasHtml) {
            const htmlIndicators = [
                'table', 'style=', 'background-color', 'font-family',
                'text-align', 'border', 'padding', 'margin',
                'href=', 'img src=', 'alt=', 'title='
            ];
            
            let htmlScore = 0;
            htmlIndicators.forEach(indicator => {
                if (content.text.includes(indicator)) {
                    htmlScore += 5;
                }
            });
            
            if (htmlScore >= 20) {
                totalScore += 60;
                matches.push({ keyword: 'html_structure', type: 'structure', score: 60 });
            }
        }
        
        // === MÉTHODE 6: DÉTECTION RÉSEAUX SOCIAUX ===
        const socialPatterns = [
            'facebook.com', 'twitter.com', 'instagram.com',
            'linkedin.com', 'youtube.com', 'tiktok.com',
            'follow us', 'suivez-nous', 'social media',
            'réseaux sociaux'
        ];
        
        let socialMatches = 0;
        socialPatterns.forEach(pattern => {
            if (content.text.includes(pattern.toLowerCase())) {
                socialMatches++;
                totalScore += 25;
            }
        });
        
        if (socialMatches >= 2) {
            totalScore += 50;
            matches.push({ keyword: 'social_media_presence', type: 'strong', score: 50 });
        }
        
        // === MÉTHODE 7: DÉTECTION PROMOTIONNELLE ===
        const promoPatterns = [
            'shop now', 'acheter maintenant', 'buy now',
            'order now', 'commandez maintenant',
            'limited time', 'temps limité',
            'expires soon', 'expire bientôt',
            'special offer', 'offre spéciale',
            'exclusive', 'exclusif', 'deal', 'promotion'
        ];
        
        let promoMatches = 0;
        promoPatterns.forEach(pattern => {
            if (content.text.includes(pattern.toLowerCase())) {
                promoMatches++;
                totalScore += 35;
            }
        });
        
        if (promoMatches >= 2) {
            totalScore += 70;
            matches.push({ keyword: 'promotional_content', type: 'strong', score: 70 });
        }
        
        // === MÉTHODE 8: DÉTECTION RECIPIENTS MULTIPLES ===
        const toCount = email.toRecipients ? email.toRecipients.length : 0;
        const ccCount = email.ccRecipients ? email.ccRecipients.length : 0;
        const totalRecipients = toCount + ccCount;
        
        if (totalRecipients > 5) {
            totalScore += 80;
            matches.push({ keyword: 'multiple_recipients', type: 'recipients', score: 80 });
        } else if (totalRecipients > 1) {
            totalScore += 30;
            matches.push({ keyword: 'some_recipients', type: 'recipients', score: 30 });
        }
        
        // === MÉTHODE 9: SERVICES SPÉCIFIQUES (Google Cloud, Twitch, etc.) ===
        const servicePatterns = [
            { pattern: 'google cloud', weight: 100, type: 'cloud_service' },
            { pattern: 'twitch', weight: 100, type: 'streaming_service' },
            { pattern: 'youtube', weight: 80, type: 'video_service' },
            { pattern: 'netflix', weight: 80, type: 'streaming_service' },
            { pattern: 'spotify', weight: 80, type: 'music_service' },
            { pattern: 'amazon', weight: 90, type: 'ecommerce_service' },
            { pattern: 'microsoft', weight: 90, type: 'tech_service' },
            { pattern: 'apple', weight: 90, type: 'tech_service' }
        ];
        
        servicePatterns.forEach(service => {
            if (content.text.includes(service.pattern.toLowerCase()) || 
                subject.includes(service.pattern.toLowerCase()) ||
                senderAddress.includes(service.pattern.toLowerCase()) ||
                senderName.includes(service.pattern.toLowerCase())) {
                
                totalScore += service.weight;
                matches.push({ 
                    keyword: service.pattern + '_service', 
                    type: service.type, 
                    score: service.weight 
                });
                
                if (service.weight >= 100) {
                    hasUltraStrong = true;
                }
            }
        });
        
        // === MÉTHODE 10: ENCODAGE ET CARACTÈRES SPÉCIAUX ===
        const encodingPatterns = [
            'sÃ©curitÃ©', 'notificatÃ©', 'prÃ©fÃ©rences',
            'dÃ©sabonner', 'rÃ©ception', 'Ã©quipe',
            'confidentialitÃ©', 'dÃ©claration'
        ];
        
        encodingPatterns.forEach(pattern => {
            if (content.text.includes(pattern.toLowerCase())) {
                totalScore += 60;
                matches.push({ keyword: 'encoding_issue', type: 'encoding', score: 60 });
            }
        });
        
        // === DÉCISION FINALE ===
        // Seuils TRÈS PERMISSIFS pour newsletter
        const isNewsletter = hasUltraStrong || totalScore >= 100; // Seuil réduit de 120 à 100
        
        if (isNewsletter) {
            const confidence = hasUltraStrong ? 0.98 : 
                              totalScore >= 200 ? 0.95 : 
                              totalScore >= 150 ? 0.90 : 
                              totalScore >= 100 ? 0.85 : 0.80;
            
            return {
                category: 'marketing_news',
                score: Math.min(totalScore, 300), // Cap à 300
                confidence: confidence,
                matchedPatterns: matches,
                hasAbsolute: hasUltraStrong,
                priorityDetection: 'ultra_enhanced_newsletter',
                detectionMethod: 'ultra_multi_method',
                detectionDetails: {
                    totalScore,
                    hasUltraStrong,
                    matchesCount: matches.length,
                    senderDomain: domain,
                    recipientsCount: totalRecipients
                }
            };
        }
        
        return null;
    }

    // ================================================
    // EXTRACTION CONTENU AMÉLIORÉE
    // ================================================
    extractCompleteContentEnhanced(email) {
        let allText = '';
        let subject = '';
        
        // === TRAITEMENT DU SUJET ===
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            // Répéter le sujet pour lui donner plus de poids dans l'analyse
            allText += (email.subject + ' ').repeat(25); // Augmenté à 25
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet message vide ';
        }
        
        // === TRAITEMENT DE L'EXPÉDITEUR ===
        if (email.from?.emailAddress?.address) {
            const senderAddress = email.from.emailAddress.address;
            allText += (senderAddress + ' ').repeat(15); // Poids important à l'adresse
            
            // Extraire et répéter le domaine
            const domain = this.extractDomain(senderAddress);
            allText += (domain + ' ').repeat(10);
        }
        
        if (email.from?.emailAddress?.name) {
            const senderName = email.from.emailAddress.name;
            allText += (senderName + ' ').repeat(15); // Poids important au nom
        }
        
        // === TRAITEMENT DES DESTINATAIRES ===
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
        
        // === TRAITEMENT DU PREVIEW/RÉSUMÉ ===
        if (email.bodyPreview) {
            // Nettoyer et répéter le preview
            const cleanPreview = this.cleanAndNormalizeText(email.bodyPreview);
            allText += (cleanPreview + ' ').repeat(8); // Augmenté à 8
        }
        
        // === TRAITEMENT DU CORPS DU MESSAGE ===
        if (email.body?.content) {
            let bodyContent = email.body.content;
            
            // Nettoyer le HTML si présent
            if (bodyContent.includes('<')) {
                bodyContent = this.cleanHtmlEnhanced(bodyContent);
            }
            
            // Normaliser et ajouter
            const cleanBody = this.cleanAndNormalizeText(bodyContent);
            allText += cleanBody + ' ';
        }
        
        // === TRAITEMENT DES MÉTADONNÉES ===
        // Ajouter les catégories existantes si présentes
        if (email.categories && Array.isArray(email.categories)) {
            email.categories.forEach(cat => {
                allText += cat + ' ';
            });
        }
        
        // Ajouter l'importance
        if (email.importance) {
            allText += email.importance + ' ';
        }
        
        // Ajouter des indicateurs de pièces jointes
        if (email.hasAttachments) {
            allText += 'attachment pièce jointe fichier joint ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            rawSubject: email.subject || '',
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            senderAddress: email.from?.emailAddress?.address?.toLowerCase() || '',
            senderName: email.from?.emailAddress?.name?.toLowerCase() || '',
            recipientsCount: (email.toRecipients?.length || 0) + (email.ccRecipients?.length || 0),
            hasAttachments: email.hasAttachments || false,
            bodyPreview: email.bodyPreview || ''
        };
    }

    // ================================================
    // NETTOYAGE HTML AMÉLIORÉ
    // ================================================
    cleanHtmlEnhanced(html) {
        if (!html) return '';
        
        // Préserver certains éléments importants pour la détection
        let cleaned = html;
        
        // Extraire les liens (importantes pour newsletters)
        const links = [];
        cleaned = cleaned.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
            links.push(href);
            return ` ${text} ${href} `;
        });
        
        // Extraire les images alt text
        cleaned = cleaned.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, (match, alt) => {
            return ` ${alt} `;
        });
        
        // Extraire le title des liens
        cleaned = cleaned.replace(/title=["']([^"']*)["']/gi, (match, title) => {
            return ` ${title} `;
        });
        
        // Supprimer les balises HTML mais garder le contenu
        cleaned = cleaned
            .replace(/<style[^>]*>.*?<\/style>/gis, ' ') // Supprimer CSS
            .replace(/<script[^>]*>.*?<\/script>/gis, ' ') // Supprimer JS
            .replace(/<[^>]+>/g, ' ') // Supprimer toutes les balises
            .replace(/&[^;]+;/g, ' ') // Supprimer entités HTML
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
        
        // Ajouter les liens extraits
        if (links.length > 0) {
            cleaned += ' ' + links.join(' ');
        }
        
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
            .replace(/Ã¼/g, 'ü')
            .replace(/Ã¶/g, 'ö')
            .replace(/Ã¤/g, 'ä')
            // Normaliser les caractères spéciaux
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            // Nettoyer les espaces et caractères spéciaux
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // ANALYSE CATÉGORIE AVEC SCORING AMÉLIORÉ
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // === PÉNALITÉ MARKETING RÉDUITE ===
        // Réduire la pénalité pour permettre plus de détection newsletter
        if (categoryId !== 'marketing_news') {
            const marketingKeywords = [
                'newsletter', 'unsubscribe', 'promotion', 'marketing',
                'shop', 'buy', 'purchase', 'sale', 'deal', 'offer'
            ];
            
            let marketingContent = 0;
            marketingKeywords.forEach(keyword => {
                if (this.findInTextEnhanced(text, keyword)) {
                    marketingContent += 10; // Réduit de 15 à 10
                }
            });
            
            // Seuil réduit et pénalité réduite
            if (marketingContent >= 20) { // Réduit de 30 à 20
                const penalty = Math.min(marketingContent, 30); // Cap à 30
                totalScore -= penalty;
                matches.push({ 
                    keyword: 'marketing_content_penalty', 
                    type: 'penalty', 
                    score: -penalty 
                });
            }
        }
        
        // === BONUS DE CATÉGORIE ===
        const categoryBonus = {
            'marketing_news': 50, // BONUS SPÉCIAL pour newsletter
            'security': 20,
            'finance': 20,
            'tasks': 20,
            'meetings': 15,
            'support': 15,
            'hr': 15,
            'commercial': 15,
            'project': 10,
            'notifications': 5, // Très réduit
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
        
        // === TEST DES EXCLUSIONS ===
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInTextEnhanced(text, exclusion)) {
                    const penalty = categoryId === 'marketing_news' ? 20 : 50; // Pénalité réduite pour newsletter
                    totalScore -= penalty;
                    matches.push({ 
                        keyword: exclusion, 
                        type: 'exclusion', 
                        score: -penalty 
                    });
                }
            }
        }
        
        // === TEST DES MOTS-CLÉS ABSOLUS ===
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 120 : 100; // Bonus pour newsletter
                    totalScore += baseScore;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: baseScore });
                    
                    // Bonus supplémentaire si dans le sujet (RENFORCÉ)
                    if (content.subject && this.findInTextEnhanced(content.subject, keyword)) {
                        const subjectBonus = categoryId === 'marketing_news' ? 80 : 50; // Bonus renforcé pour newsletter
                        totalScore += subjectBonus;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'subject_bonus', 
                            score: subjectBonus 
                        });
                    }
                    
                    // Bonus si dans l'adresse email
                    if (content.senderAddress && this.findInTextEnhanced(content.senderAddress, keyword)) {
                        const senderBonus = categoryId === 'marketing_news' ? 60 : 30;
                        totalScore += senderBonus;
                        matches.push({ 
                            keyword: keyword + ' (in sender)', 
                            type: 'sender_bonus', 
                            score: senderBonus 
                        });
                    }
                }
            }
        }
        
        // === TEST DES MOTS-CLÉS FORTS ===
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 50 : 40; // Bonus pour newsletter
                    totalScore += baseScore;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: baseScore });
                    
                    if (content.subject && this.findInTextEnhanced(content.subject, keyword)) {
                        const subjectBonus = categoryId === 'marketing_news' ? 30 : 20;
                        totalScore += subjectBonus;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'subject_bonus', 
                            score: subjectBonus 
                        });
                    }
                }
            }
            
            // Bonus pour multiples mots-clés forts
            if (strongMatches >= 2) {
                const multiBonus = categoryId === 'marketing_news' ? 50 : 30;
                totalScore += multiBonus;
                matches.push({ 
                    keyword: 'multiple_strong_matches', 
                    type: 'multi_bonus', 
                    score: multiBonus 
                });
            }
        }
        
        // === TEST DES MOTS-CLÉS FAIBLES ===
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 20 : 15; // Bonus pour newsletter
                    totalScore += baseScore;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: baseScore });
                }
            }
            
            if (weakMatches >= 3) {
                const multiBonus = categoryId === 'marketing_news' ? 30 : 20;
                totalScore += multiBonus;
                matches.push({ 
                    keyword: 'multiple_weak_matches', 
                    type: 'multi_bonus', 
                    score: multiBonus 
                });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // RECHERCHE DANS LE TEXTE AMÉLIORÉE
    // ================================================
    findInTextEnhanced(text, keyword) {
        if (!text || !keyword) return false;
        
        // Normalisation avancée du texte
        const normalizedText = this.cleanAndNormalizeText(text.toLowerCase());
        const normalizedKeyword = this.cleanAndNormalizeText(keyword.toLowerCase());
        
        // Recherche exacte d'abord
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec frontières de mots
        try {
            const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            if (wordBoundaryRegex.test(normalizedText)) {
                return true;
            }
        } catch (e) {
            // Fallback si regex échoue
        }
        
        // Recherche partielle pour certains mots-clés importants
        const partialKeywords = [
            'newsletter', 'unsubscribe', 'désabonner', 'mailing',
            'promotion', 'marketing', 'notification'
        ];
        
        if (partialKeywords.some(pk => normalizedKeyword.includes(pk) || pk.includes(normalizedKeyword))) {
            return normalizedText.includes(normalizedKeyword);
        }
        
        return false;
    }

    // ================================================
    // SÉLECTION PAR PRIORITÉ AVEC SEUILS ULTRA-PERMISSIFS
    // ================================================
    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 15; // Très réduit de 25 à 15
        const MIN_CONFIDENCE_THRESHOLD = 0.35; // Très réduit de 0.45 à 0.35
        
        // PRIORITÉ ABSOLUE pour marketing/newsletter
        const marketingResult = results.marketing_news;
        if (marketingResult && marketingResult.score >= 20) { // Seuil très réduit de 30 à 20
            console.log(`[CategoryManager] ✅ Marketing/Newsletter PRIORITAIRE: ${marketingResult.score}pts`);
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
                // Marketing/Newsletter toujours en premier - ABSOLU
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
        
        // Fallback ultra-permissif
        const allSorted = Object.values(results)
            .filter(r => r.score > 0)
            .sort((a, b) => {
                if (a.category === 'marketing_news') return -1;
                if (b.category === 'marketing_news') return 1;
                return b.score - a.score;
            });
        
        if (allSorted.length > 0 && allSorted[0].score >= 10 && allSorted[0].confidence >= 0.25) { // Seuils ultra-réduits
            const fallback = allSorted[0];
            console.log(`[CategoryManager] 📌 Utilisation fallback ultra-permissif: ${fallback.category} (${fallback.score}pts, ${Math.round(fallback.confidence * 100)}%)`);
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
            reason: 'below_ultra_permissive_threshold'
        };
    }

    // ================================================
    // CONFIDENCE CALCULÉE AVEC BONUS NEWSLETTER
    // ================================================
    calculateConfidence(score) {
        // Bonus spécial pour newsletter
        if (score.category === 'marketing_news' || score.hasAbsolute) {
            if (score.hasAbsolute) return 0.98;
            if (score.total >= 200) return 0.95;
            if (score.total >= 150) return 0.90;
            if (score.total >= 100) return 0.85;
            if (score.total >= 60) return 0.80; // Réduit pour newsletter
            if (score.total >= 40) return 0.75; // Réduit pour newsletter
            if (score.total >= 20) return 0.65; // Réduit pour newsletter
            return 0.55; // Plancher plus élevé pour newsletter
        }
        
        // Calcul standard pour autres catégories
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
    // INITIALISATION DES CATÉGORIES AVEC PRIORITÉS AJUSTÉES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE ABSOLUE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et marketing',
                priority: 1000, // PRIORITÉ MAXIMALE ABSOLUE RENFORCÉE
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
                priority: 15, // PRIORITÉ TRÈS RÉDUITE pour éviter conflit newsletter
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées avec PRIORITÉ ABSOLUE pour Marketing/Newsletter');
    }

    // ================================================
    // GESTION DES PROVIDERS ET SCAN (Conservé des versions précédentes)
    // ================================================
    
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
    // MÉTHODES UTILITAIRES ET SUPPORTS (Conservées des versions précédentes)
    // ================================================
    
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

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
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

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\        // Calcul standard pour autres catégories
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.');
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // GESTION PARAMÈTRES (Conservée des versions précédentes)
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
    // API PUBLIQUE (Conservée des versions précédentes)
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
    // CATÉGORIES PERSONNALISÉES ET ÉVÉNEMENTS (Conservé des versions précédentes)
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
    // MÉTHODES DE TEST (Conservées et améliorées)
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
        
        console.log('\n[CategoryManager] TEST RESULT ULTRA-ENHANCED:');
        console.log(`Subject: "${subject}"`);
        console.log(`From: ${from}`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`Detection Method:`, result.detectionMethod || 'standard');
        console.log(`Matches:`, result.matchedPatterns?.length || 0);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v25.0 - Newsletter Detection ULTRA-ENHANCED');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        
        // Afficher la priorité de chaque catégorie
        const sortedByPriority = Object.entries(this.categories)
            .sort(([,a], [,b]) => (b.priority || 0) - (a.priority || 0));
        
        console.log('Ordre de priorité:');
        sortedByPriority.forEach(([id, cat], index) => {
            console.log(`  ${index + 1}. ${cat.name} (${id}): priorité ${cat.priority || 0}`);
        });
        console.groupEnd();
        
        console.group('🔍 Catalogue mots-clés ULTRA-RENFORCÉ');
        const catalogEntries = Object.keys(this.keywordCatalog);
        console.log('Entrées dans le catalogue:', catalogEntries.length);
        
        // Afficher marketing en premier avec détails complets
        if (this.keywordCatalog.marketing_news) {
            const marketingKeywords = this.keywordCatalog.marketing_news;
            const total = (marketingKeywords.absolute?.length || 0) + 
                         (marketingKeywords.strong?.length || 0) + 
                         (marketingKeywords.weak?.length || 0) + 
                         (marketingKeywords.exclusions?.length || 0);
            
            console.log(`📰 Marketing & News (ULTRA-RENFORCÉ): ${total} mots-clés`);
            console.log(`  - Absolus: ${marketingKeywords.absolute?.length || 0}`);
            console.log(`  - Forts: ${marketingKeywords.strong?.length || 0}`);
            console.log(`  - Faibles: ${marketingKeywords.weak?.length || 0}`);
            console.log(`  - Exclusions: ${marketingKeywords.exclusions?.length || 0}`);
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
        
        console.group('⚙️ Configuration ULTRA-ENHANCED');
        console.log('Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        console.log('Catégories actives:', this.getActiveCategories().length);
        console.log('Exclude spam:', this.shouldExcludeSpam());
        console.log('Detect CC:', this.shouldDetectCC());
        
        // Afficher les seuils configurés
        console.log('Seuils de détection:');
        console.log('  - Score minimum: 15 (ultra-permissif)');
        console.log('  - Confidence minimum: 0.35 (ultra-permissif)');
        console.log('  - Marketing priority score: 20 (très réduit)');
        console.log('  - Fallback score: 10 (ultra-permissif)');
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            catalogEntries: catalogEntries.length,
            preselectedCategories: this.getTaskPreselectedCategories().length,
            marketingPriority: this.categories.marketing_news?.priority || 0,
            newsletterDetectionUltraEnhanced: true,
            emailProvider: provider?.type || null,
            canScan: emailMethods.available,
            scanHistory: this.scanHistory.length,
            hasLastScan: !!this.lastScanResults,
            version: 'v25.0-ULTRA-ENHANCED'
        };
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE ET DESTRUCTION (Conservées)
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

console.log('[CategoryManager] 🚀 Création nouvelle instance v25.0 ULTRA-ENHANCED...');
window.categoryManager = new CategoryManager();

// ================================================
// FONCTIONS DE TEST GLOBALES AMÉLIORÉES
// ================================================

window.testCategoryManagerUltraEnhanced = function() {
    console.group('🧪 TEST CategoryManager v25.0 - Newsletter Detection ULTRA-ENHANCED');
    
    const tests = [
        // Tests Newsletter Ultra-Enhanced
        { subject: "Confirmation : votre essai de Google Cloud Platform", from: "CloudPlatform-noreply@google.com", expected: "marketing_news" },
        { subject: "RMCsport is live: RMC SPORT CLUB EP35 ! MERCATO", from: "no-reply@twitch.tv", expected: "marketing_news" },
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", from: "news@example.com", expected: "marketing_news" },
        { subject: "Twitch Notification - Someone you follow is live", from: "no-reply@twitch.tv", expected: "marketing_news" },
        { subject: "Utilisez le code de sÃ©curitÃ© suivant pour le compte Microsoft", from: "account-security@microsoft.com", expected: "marketing_news" },
        { subject: "Votre commande Amazon a été expédiée", from: "ship-confirm@amazon.com", expected: "marketing_news" },
        { subject: "Spotify Wrapped 2024 - Découvrez vos statistiques", from: "no-reply@spotify.com", expected: "marketing_news" },
        
        // Tests autres catégories
        { subject: "Action requise: Confirmer votre commande urgente", from: "noreply@shop.com", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", from: "security@bank.com", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", from: "billing@company.com", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", from: "team@company.com", expected: "meetings" }
    ];
    
    console.log('=== TESTS DE DÉTECTION NEWSLETTER ULTRA-ENHANCED ===');
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', test.from, test.expected);
    });
    
    console.log('\n=== DIAGNOSTIC COMPLET ===');
    const diagnostic = window.categoryManager.runDiagnostics();
    console.log('Résultat diagnostic:', diagnostic);
    
    // Test des méthodes de scan
    console.group('🔌 Test Providers Email Ultra-Enhanced');
    const emailMethods = window.categoryManager.checkEmailRetrievalMethods();
    console.log('Méthodes disponibles:', emailMethods);
    
    const provider = window.categoryManager.detectEmailProvider();
    console.log('Provider détecté:', provider);
    console.groupEnd();
    
    console.groupEnd();
    return { 
        success: true, 
        testsRun: tests.length,
        canScan: emailMethods.available,
        provider: provider?.type || null,
        newsletterDetectionUltraEnhanced: true,
        version: 'v25.0-ULTRA-ENHANCED'
    };
};

window.debugCategoryKeywordsUltraEnhanced = function() {
    console.group('🔍 DEBUG Mots-clés v25.0 - Newsletter ULTRA-ENHANCED');
    const catalog = window.categoryManager.keywordCatalog;
    
    // Afficher marketing en premier avec tous les détails
    if (catalog.marketing_news) {
        const keywords = catalog.marketing_news;
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        console.log(`📰 Marketing & News (ULTRA-ENHANCED): ${total} mots-clés`);
        
        if (keywords.absolute?.length) {
            console.log(`\n🔥 ABSOLUS (${keywords.absolute.length}):`);
            console.log('  Désabonnement:', keywords.absolute.filter(k => k.includes('désabonner') || k.includes('unsubscribe')).slice(0, 10));
            console.log('  Newsletter:', keywords.absolute.filter(k => k.includes('newsletter') || k.includes('bulletin')).slice(0, 10));
            console.log('  Domaines:', keywords.absolute.filter(k => k.includes('.com') || k.includes('noreply')).slice(0, 10));
            console.log('  Services:', keywords.absolute.filter(k => k.includes('google') || k.includes('twitch') || k.includes('cloud')).slice(0, 10));
        }
        
        if (keywords.strong?.length) {
            console.log(`\n💪 FORTS (${keywords.strong.length}):`, keywords.strong.slice(0, 15).join(', '));
        }
        
        if (keywords.weak?.length) {
            console.log(`\n📝 FAIBLES (${keywords.weak.length}):`, keywords.weak.slice(0, 10).join(', '));
        }
        
        if (keywords.exclusions?.length) {
            console.log(`\n🚫 EXCLUSIONS (${keywords.exclusions.length}):`, keywords.exclusions.join(', '));
        }
    }
    
    console.log('\n=== AUTRES CATÉGORIES ===');
    Object.entries(catalog).forEach(([categoryId, keywords]) => {
        if (categoryId === 'marketing_news') return; // Déjà affiché
        
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`\n${category?.icon || '📂'} ${category?.name || categoryId} (priorité: ${category?.priority || 0}): ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 5).join(', ')}...`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 5).join(', ')}...`);
        }
    });
    
    console.groupEnd();
};

// Test spécialisé pour les exemples fournis
window.testSpecificExamples = function() {
    console.group('🧪 TEST Exemples Spécifiques');
    
    const examples = [
        {
            subject: "Confirmation : votre essai de Google Cloud Platform",
            from: "CloudPlatform-noreply@google.com",
            body: "Bienvenue sur Google Cloud ! Suivez ce tutoriel pour apprendre les bases et découvrez tout ce que vous pouvez faire sur GCP avec nos produits toujours gratuits.",
            expected: "marketing_news"
        },
        {
            subject: "RMCsport is live: RMC SPORT CLUB EP35 ! MERCATO : CROYEZ-VOUS TOUJOURS EN POGBA ?",
            from: "no-reply@twitch.tv",
            body: "newsletter Hey, vivlabinouze! RMCsport is live! You're receiving this email because you're a valued member of the Twitch community. To stop receiving emails about RMCsport, click here",
            expected: "marketing_news"
        },
        {
            subject: "Utilisez le code de sÃ©curitÃ© suivant pour le compte Microsoft",
            from: "account-security@microsoft.com", 
            body: "Code de sÃ©curitÃ©Â : 804472 Si vous ne reconnaissez pas le compte Microsoft, vous pouvez cliquer pour supprimer votre adresse e-mail de ce compte.",
            expected: "marketing_news" // Car contient des éléments marketing/notification
        }
    ];
    
    examples.forEach((example, index) => {
        console.log(`\n--- EXEMPLE ${index + 1} ---`);
        const result = window.categoryManager.testEmail(example.subject, example.body, example.from, example.expected);
        
        if (result.detectionDetails) {
            console.log('Détails de détection:', result.detectionDetails);
        }
    });
    
    console.groupEnd();
};

console.log('✅ CategoryManager v25.0 loaded - Newsletter Detection ULTRA-ENHANCED avec gestion encodage + affichage corrigé');
console.log('🔥 Priorité ABSOLUE pour newsletters avec seuils ultra-permissifs');
console.log('📧 Utilisez testCategoryManagerUltraEnhanced() pour tester');
console.log('📧 Utilisez debugCategoryKeywordsUltraEnhanced() pour voir les mots-clés');
console.log('📧 Utilisez testSpecificExamples() pour tester les exemples spécifiques');
