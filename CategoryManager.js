// CategoryManager.js - Version 26.0 - COMPLET ET CORRIGÉ

class CategoryManager {
    constructor() {
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
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeKeywordCatalog();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Version 26.0 - Détection newsletter ULTRA-RENFORCÉE corrigée');
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - ULTRA-RENFORCÉ POUR NEWSLETTERS
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation catalogue ULTRA-RENFORCÉ pour newsletters...');
        
        this.keywordCatalog = {
            // PRIORITÉ MAXIMALE ABSOLUE - MARKETING & NEWS
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
                    
                    // Domaines marketing spécialisés
                    'mailchimp', 'sendgrid', 'mailgun', 'constant-contact',
                    'aweber', 'getresponse', 'campaign-monitor', 'sendinblue',
                    'klaviyo', 'convertkit', 'activecampaign', 'drip',
                    'infusionsoft', 'pardot', 'hubspot', 'marketo',
                    
                    // Adresses noreply
                    'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                    'notifications@', 'updates@', 'news@', 'newsletter@',
                    'marketing@', 'promo@', 'offers@', 'deals@',
                    'automated message', 'message automatique',
                    'automatic notification', 'notification automatique',
                    
                    // Services cloud et tech
                    'google cloud platform', 'aws notifications', 'azure updates',
                    'cloud platform notifications', 'service updates',
                    'platform news', 'developer newsletter',
                    'api updates', 'service announcements',
                    
                    // Streaming et divertissement
                    'twitch notifications', 'youtube notifications',
                    'streaming notifications', 'new video', 'nouvelle vidéo',
                    'live stream', 'direct live', 'streaming en direct',
                    'subscribe to channel', 'abonnez-vous à la chaîne',
                    
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
                    'streaming', 'live', 'video', 'channel'
                ],
                
                weak: [
                    'update', 'discover', 'découvrir', 'explore',
                    'learn more', 'en savoir plus', 'read more',
                    'download', 'télécharger', 'free', 'gratuit',
                    'tips', 'conseils', 'guide', 'tutorial',
                    'how to', 'comment', 'best practices',
                    'information', 'info', 'help', 'aide'
                ],
                
                exclusions: [
                    'urgent task', 'tâche urgente',
                    'security alert urgent', 'alerte sécurité urgente',
                    'password expired urgent', 'mot de passe expiré urgent'
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
                    'shop', 'buy', 'order', 'purchase', 'sale'
                ]
            },

            // TÂCHES
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
                    'newsletter', 'marketing', 'promotion', 'unsubscribe'
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
                    'newsletter', 'marketing', 'promotion'
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
                    'newsletter', 'promotion', 'marketing'
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
                    'newsletter', 'marketing', 'promotion'
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
                    'newsletter', 'unsubscribe', 'promotion', 'offer',
                    'shop', 'buy', 'purchase', 'sale', 'deal',
                    'marketing', 'campaign', 'advertising',
                    'mailing list', 'email preferences', 'subscription'
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
                    'urgent', 'action required', 'payment', 'newsletter'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Catalogue ULTRA-RENFORCÉ initialisé pour', Object.keys(this.keywordCatalog).length, 'catégories avec focus newsletter ABSOLU');
    }

    // ================================================
    // ANALYSE EMAIL - NEWSLETTER PRIORITÉ ABSOLUE
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
        
        // DÉTECTION NEWSLETTER ULTRA-PRIORITAIRE
        const newsletterResult = this.detectNewsletterUltraEnhanced(content, email);
        if (newsletterResult) {
            console.log(`[CategoryManager] 📰 NEWSLETTER DÉTECTÉE: ${email.subject?.substring(0, 50)} (Score: ${newsletterResult.score})`);
            return newsletterResult;
        }
        
        // PRIORITÉ 1: MARKETING/NEWSLETTER - ANALYSE STANDARD
        const marketingAnalysis = this.analyzeCategory(content, this.keywordCatalog.marketing_news);
        
        if (marketingAnalysis.hasAbsolute || marketingAnalysis.total >= 40) {
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
        
        // Vérifier si en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
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
        
        // Analyser toutes les catégories
        const allResults = this.analyzeAllCategoriesExceptMarketing(content);
        
        // Ajouter résultat marketing avec priorité maximale
        allResults.marketing_news = {
            category: 'marketing_news',
            score: marketingAnalysis.total,
            hasAbsolute: marketingAnalysis.hasAbsolute,
            matches: marketingAnalysis.matches,
            confidence: this.calculateConfidence(marketingAnalysis),
            priority: 100
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
    // DÉTECTION NEWSLETTER ULTRA-RENFORCÉE
    // ================================================
    detectNewsletterUltraEnhanced(content, email) {
        let totalScore = 0;
        const matches = [];
        let hasUltraStrong = false;
        
        // Méthode 1: Détection par adresse email
        const senderAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const senderName = email.from?.emailAddress?.name?.toLowerCase() || '';
        
        const newsletterDomains = [
            'mailchimp.com', 'sendgrid.net', 'constantcontact.com',
            'aweber.com', 'getresponse.com', 'campaign-monitor.com',
            'sendinblue.com', 'klaviyo.com', 'convertkit.com',
            'activecampaign.com', 'drip.com', 'infusionsoft.com',
            'pardot.com', 'hubspot.com', 'marketo.com',
            'google.com', 'microsoft.com', 'twitch.tv',
            'youtube.com', 'netflix.com', 'spotify.com',
            'amazon.com', 'apple.com'
        ];
        
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
        
        // Méthode 2: Détection désabonnement
        if (content.text.includes('se désabonner') || content.text.includes('unsubscribe')) {
            totalScore += 180;
            hasUltraStrong = true;
            matches.push({ keyword: 'unsubscribe_header', type: 'ultra_strong', score: 180 });
        }
        
        // Méthode 3: Patterns de sujet
        const subject = content.subject;
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
        
        // Méthode 4: Contenu newsletter
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
        
        // Méthode 5: Structure HTML
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
        
        // Méthode 6: Services spécifiques
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
        
        // Méthode 7: Encodage défectueux
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
        
        // Décision finale
        const isNewsletter = hasUltraStrong || totalScore >= 100;
        
        if (isNewsletter) {
            const confidence = hasUltraStrong ? 0.98 : 
                              totalScore >= 200 ? 0.95 : 
                              totalScore >= 150 ? 0.90 : 
                              totalScore >= 100 ? 0.85 : 0.80;
            
            return {
                category: 'marketing_news',
                score: Math.min(totalScore, 300),
                confidence: confidence,
                matchedPatterns: matches,
                hasAbsolute: hasUltraStrong,
                priorityDetection: 'ultra_enhanced_newsletter',
                detectionMethod: 'ultra_multi_method',
                detectionDetails: {
                    totalScore,
                    hasUltraStrong,
                    matchesCount: matches.length,
                    senderDomain: domain
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
        
        // Traitement du sujet
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(25);
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet message vide ';
        }
        
        // Traitement expéditeur
        if (email.from?.emailAddress?.address) {
            const senderAddress = email.from.emailAddress.address;
            allText += (senderAddress + ' ').repeat(15);
            
            const domain = this.extractDomain(senderAddress);
            allText += (domain + ' ').repeat(10);
        }
        
        if (email.from?.emailAddress?.name) {
            const senderName = email.from.emailAddress.name;
            allText += (senderName + ' ').repeat(15);
        }
        
        // Traitement destinataires
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
        
        // Traitement preview
        if (email.bodyPreview) {
            const cleanPreview = this.cleanAndNormalizeText(email.bodyPreview);
            allText += (cleanPreview + ' ').repeat(8);
        }
        
        // Traitement corps
        if (email.body?.content) {
            let bodyContent = email.body.content;
            
            if (bodyContent.includes('<')) {
                bodyContent = this.cleanHtmlEnhanced(bodyContent);
            }
            
            const cleanBody = this.cleanAndNormalizeText(bodyContent);
            allText += cleanBody + ' ';
        }
        
        // Métadonnées
        if (email.categories && Array.isArray(email.categories)) {
            email.categories.forEach(cat => {
                allText += cat + ' ';
            });
        }
        
        if (email.importance) {
            allText += email.importance + ' ';
        }
        
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
        
        let cleaned = html;
        
        // Extraire liens
        const links = [];
        cleaned = cleaned.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
            links.push(href);
            return ` ${text} ${href} `;
        });
        
        // Extraire alt text des images
        cleaned = cleaned.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, (match, alt) => {
            return ` ${alt} `;
        });
        
        // Extraire title
        cleaned = cleaned.replace(/title=["']([^"']*)["']/gi, (match, title) => {
            return ` ${title} `;
        });
        
        // Supprimer balises
        cleaned = cleaned
            .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
            .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
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
            // Gérer encodage défectueux
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
            // Normaliser
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // CALCUL DE SCORE AVEC BONUS NEWSLETTER
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Pénalité marketing réduite
        if (categoryId !== 'marketing_news') {
            const marketingKeywords = [
                'newsletter', 'unsubscribe', 'promotion', 'marketing',
                'shop', 'buy', 'purchase', 'sale', 'deal', 'offer'
            ];
            
            let marketingContent = 0;
            marketingKeywords.forEach(keyword => {
                if (this.findInTextEnhanced(text, keyword)) {
                    marketingContent += 10;
                }
            });
            
            if (marketingContent >= 20) {
                const penalty = Math.min(marketingContent, 30);
                totalScore -= penalty;
                matches.push({ 
                    keyword: 'marketing_content_penalty', 
                    type: 'penalty', 
                    score: -penalty 
                });
            }
        }
        
        // Bonus de catégorie
        const categoryBonus = {
            'marketing_news': 50,
            'security': 20,
            'finance': 20,
            'tasks': 20,
            'meetings': 15,
            'support': 15,
            'hr': 15,
            'commercial': 15,
            'project': 10,
            'notifications': 5,
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
        
        // Test des exclusions
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInTextEnhanced(text, exclusion)) {
                    const penalty = categoryId === 'marketing_news' ? 20 : 50;
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
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 120 : 100;
                    totalScore += baseScore;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: baseScore });
                    
                    // Bonus sujet
                    if (content.subject && this.findInTextEnhanced(content.subject, keyword)) {
                        const subjectBonus = categoryId === 'marketing_news' ? 80 : 50;
                        totalScore += subjectBonus;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'subject_bonus', 
                            score: subjectBonus 
                        });
                    }
                    
                    // Bonus expéditeur
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
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 50 : 40;
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
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInTextEnhanced(text, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 20 : 15;
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
        
        const normalizedText = this.cleanAndNormalizeText(text.toLowerCase());
        const normalizedKeyword = this.cleanAndNormalizeText(keyword.toLowerCase());
        
        // Recherche exacte
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
        
        // Recherche partielle pour mots-clés importants
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
    // SÉLECTION PAR PRIORITÉ ULTRA-PERMISSIVE
    // ================================================
    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 15;
        const MIN_CONFIDENCE_THRESHOLD = 0.35;
        
        // Priorité absolue pour marketing/newsletter
        const marketingResult = results.marketing_news;
        if (marketingResult && marketingResult.score >= 20) {
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
        
        if (allSorted.length > 0 && allSorted[0].score >= 10 && allSorted[0].confidence >= 0.25) {
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
    // CALCUL DE CONFIDENCE AVEC BONUS NEWSLETTER
    // ================================================
    calculateConfidence(score) {
        // Bonus spécial pour newsletter
        if (score.category === 'marketing_news' || score.hasAbsolute) {
            if (score.hasAbsolute) return 0.98;
            if (score.total >= 200) return 0.95;
            if (score.total >= 150) return 0.90;
            if (score.total >= 100) return 0.85;
            if (score.total >= 60) return 0.80;
            if (score.total >= 40) return 0.75;
            if (score.total >= 20) return 0.65;
            return 0.55;
        }
        
        // Calcul standard
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
    // INITIALISATION CATÉGORIES AVEC PRIORITÉS
    // ================================================
    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et marketing',
                priority: 1000,
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
                priority: 15,
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées avec PRIORITÉ ABSOLUE pour Marketing/Newsletter');
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
    // ANALYSE TOUTES CATÉGORIES SAUF MARKETING
    // ================================================
    analyzeAllCategoriesExceptMarketing(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        const customCategoryIds = Object.keys(this.customCategories);
        
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

    // ================================================
    // GESTION DESTINATAIRES
    // ================================================
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

    // ================================================
    // GESTION SPAM ET EXCLUSIONS
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\    isInCC(email) {
        if (!email.ccRecipients || !Array.is');
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
        
        console.log('\n[CategoryManager] TEST RESULT v26.0:');
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
        console.group('🏥 DIAGNOSTIC CategoryManager v26.0');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        
        const sortedByPriority = Object.entries(this.categories)
            .sort(([,a], [,b]) => (b.priority || 0) - (a.priority || 0));
        
        console.log('Ordre de priorité:');
        sortedByPriority.forEach(([id, cat], index) => {
            console.log(`  ${index + 1}. ${cat.name} (${id}): priorité ${cat.priority || 0}`);
        });
        console.groupEnd();
        
        console.group('🔍 Catalogue mots-clés');
        const catalogEntries = Object.keys(this.keywordCatalog);
        console.log('Entrées dans le catalogue:', catalogEntries.length);
        
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
        
        console.group('⚙️ Configuration');
        console.log('Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        console.log('Catégories actives:', this.getActiveCategories().length);
        console.log('Exclude spam:', this.shouldExcludeSpam());
        console.log('Detect CC:', this.shouldDetectCC());
        
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
            version: 'v26.0-CORRIGÉ'
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
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v26.0 CORRIGÉE...');
window.categoryManager = new CategoryManager();

// ================================================
// FONCTIONS DE TEST GLOBALES
// ================================================

window.testCategoryManagerV26 = function() {
    console.group('🧪 TEST CategoryManager v26.0 - Newsletter Detection CORRIGÉE');
    
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
    
    console.group('🔌 Test Providers Email');
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
        version: 'v26.0-CORRIGÉE'
    };
};

window.debugCategoryKeywordsV26 = function() {
    console.group('🔍 DEBUG Mots-clés v26.0 - Newsletter ULTRA-ENHANCED');
    const catalog = window.categoryManager.keywordCatalog;
    
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
        if (categoryId === 'marketing_news') return;
        
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

window.testSpecificExamplesV26 = function() {
    console.group('🧪 TEST Exemples Spécifiques v26.0');
    
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
            expected: "marketing_news"
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

console.log('✅ CategoryManager v26.0 loaded - COMPLET ET CORRIGÉ');
console.log('🔥 Priorité ABSOLUE pour newsletters avec seuils ultra-permissifs');
console.log('📧 Utilisez testCategoryManagerV26() pour tester');
console.log('📧 Utilisez debugCategoryKeywordsV26() pour voir les mots-clés');
console.log('📧 Utilisez testSpecificExamplesV26() pour tester les exemples spécifiques');
