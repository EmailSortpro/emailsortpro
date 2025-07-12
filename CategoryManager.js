// CategoryManager.js - Version 21.0 - Détection Gmail Optimisée

class CategoryManager {
    constructor() {
        this.categories = {}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v21.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v21.0 - Gmail Optimisé');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Unsubscribe from our mailing list", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte Google", expected: "security" },
        { subject: "Invitation Google Meet demain à 14h", expected: "meetings" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v21.0 loaded - Détection Gmail Optimisée!');;
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
        
        // Cache pour optimisation Gmail
        this._gmailPatternsCache = new Map();
        this._domainWhitelist = new Set();
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.initializeGmailPatterns();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 21.0 - Détection Gmail Optimisée');
    }

    // ================================================
    // NOUVEAU : PATTERNS GMAIL SPÉCIFIQUES
    // ================================================
    initializeGmailPatterns() {
        // Domaines de confiance (non-marketing)
        this._domainWhitelist = new Set([
            'github.com',
            'gitlab.com',
            'bitbucket.org',
            'jira.atlassian.com',
            'trello.com',
            'asana.com',
            'notion.so',
            'linear.app',
            'slack.com',
            'discord.com',
            'zoom.us',
            'meet.google.com',
            'calendar.google.com',
            'drive.google.com',
            'docs.google.com',
            'dropbox.com',
            'box.com',
            'salesforce.com',
            'hubspot.com',
            'zendesk.com',
            'intercom.io',
            'stripe.com',
            'paypal.com',
            'wise.com',
            'revolut.com'
        ]);

        // Patterns spécifiques Gmail pour détecter les newsletters
        this._gmailPatternsCache.set('newsletter_headers', [
            'list-unsubscribe',
            'list-id',
            'list-post',
            'list-help',
            'list-subscribe',
            'precedence: bulk',
            'precedence: list',
            'x-campaign',
            'x-mailchimp',
            'x-sendgrid',
            'x-mailjet'
        ]);

        // Patterns de liens de désabonnement Gmail
        this._gmailPatternsCache.set('unsubscribe_links', [
            'unsubscribe',
            'désabonner',
            'desabonner',
            'opt-out',
            'opt out',
            'email preferences',
            'notification settings',
            'manage subscriptions',
            'gérer les abonnements',
            'update preferences',
            'stop receiving',
            'ne plus recevoir',
            'remove from list',
            'retirer de la liste'
        ]);

        console.log('[CategoryManager] 📧 Patterns Gmail initialisés');
    }

    // ================================================
    // ANALYSE EMAIL AMÉLIORÉE POUR GMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Vérification spam
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        // Extraction du contenu complet avec headers Gmail
        const content = this.extractCompleteContent(email);
        
        // Vérification des exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // NOUVEAU : Détection spécifique Gmail pour marketing/newsletters
        const gmailMarketingCheck = this.checkGmailMarketingPatterns(email, content);
        if (gmailMarketingCheck.isMarketing) {
            return {
                category: 'marketing_news',
                score: gmailMarketingCheck.score,
                confidence: gmailMarketingCheck.confidence,
                matchedPatterns: gmailMarketingCheck.patterns,
                hasAbsolute: true,
                gmailDetected: true
            };
        }
        
        // Détection emails personnels
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
        
        // Détection CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            // Vérifier d'abord si c'est du marketing même en CC
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
            
            // Sinon catégorie CC
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                isCC: true
            };
        }
        
        // Analyse normale des catégories
        const allResults = this.analyzeAllCategories(content, email);
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
    // NOUVEAU : DÉTECTION GMAIL MARKETING
    // ================================================
    checkGmailMarketingPatterns(email, content) {
        let score = 0;
        const patterns = [];
        
        // 1. Vérifier les headers Gmail (si disponibles)
        if (email.internetMessageHeaders) {
            const headers = email.internetMessageHeaders;
            const marketingHeaders = this._gmailPatternsCache.get('newsletter_headers');
            
            for (const header of headers) {
                const headerName = header.name?.toLowerCase() || '';
                const headerValue = header.value?.toLowerCase() || '';
                
                if (marketingHeaders.some(mh => headerName.includes(mh) || headerValue.includes(mh))) {
                    score += 50;
                    patterns.push({ 
                        keyword: `header:${headerName}`, 
                        type: 'gmail_header', 
                        score: 50 
                    });
                }
            }
        }
        
        // 2. Vérifier le domaine expéditeur
        const senderDomain = this.extractDomain(email.from?.emailAddress?.address);
        if (!this._domainWhitelist.has(senderDomain)) {
            // Domaine non whitelisté, vérifier les patterns marketing
            const marketingDomains = ['newsletter', 'marketing', 'campaign', 'promo', 'deals', 'offers', 'shop'];
            if (marketingDomains.some(md => senderDomain.includes(md))) {
                score += 40;
                patterns.push({ 
                    keyword: `marketing_domain:${senderDomain}`, 
                    type: 'domain', 
                    score: 40 
                });
            }
        }
        
        // 3. Analyser le contenu HTML pour les liens de désabonnement
        if (email.body?.content || email.bodyHtml) {
            const htmlContent = email.body?.content || email.bodyHtml || '';
            const unsubLinks = this._gmailPatternsCache.get('unsubscribe_links');
            
            // Recherche dans les liens <a href>
            const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
            let match;
            
            while ((match = linkRegex.exec(htmlContent)) !== null) {
                const href = match[1].toLowerCase();
                const linkText = match[2].toLowerCase();
                
                for (const pattern of unsubLinks) {
                    if (href.includes(pattern) || linkText.includes(pattern)) {
                        score += 100; // Score élevé pour lien de désabonnement
                        patterns.push({ 
                            keyword: `unsubscribe_link:${pattern}`, 
                            type: 'gmail_unsubscribe', 
                            score: 100 
                        });
                        break;
                    }
                }
            }
            
            // Recherche dans le texte simple aussi
            const textToCheck = content.text.toLowerCase();
            for (const pattern of unsubLinks) {
                if (textToCheck.includes(pattern) && !patterns.some(p => p.keyword.includes(pattern))) {
                    score += 80;
                    patterns.push({ 
                        keyword: `unsubscribe_text:${pattern}`, 
                        type: 'gmail_text', 
                        score: 80 
                    });
                }
            }
        }
        
        // 4. Patterns Gmail spécifiques dans le contenu
        const gmailMarketingPatterns = [
            'this email was sent to you because',
            'you are receiving this email because',
            'you received this message because',
            'why am i receiving this',
            'update your email preferences',
            'manage your email preferences',
            'view in browser',
            'voir dans le navigateur',
            'if you no longer wish',
            'to stop receiving these emails',
            'click here to unsubscribe',
            'cliquez ici pour vous désabonner',
            'update subscription',
            'email sent by',
            'powered by mailchimp',
            'sent via',
            '© 2024',
            '© 2025',
            'all rights reserved',
            'tous droits réservés'
        ];
        
        const lowerContent = content.text.toLowerCase();
        for (const pattern of gmailMarketingPatterns) {
            if (lowerContent.includes(pattern)) {
                score += 30;
                patterns.push({ 
                    keyword: pattern, 
                    type: 'gmail_pattern', 
                    score: 30 
                });
            }
        }
        
        // 5. Vérifier les images tracking (pixel espion)
        if (email.body?.content || email.bodyHtml) {
            const trackingPixelRegex = /<img[^>]*(?:width=["']?1["']?|height=["']?1["']?)[^>]*>/gi;
            if (trackingPixelRegex.test(email.body?.content || email.bodyHtml || '')) {
                score += 50;
                patterns.push({ 
                    keyword: 'tracking_pixel', 
                    type: 'gmail_tracking', 
                    score: 50 
                });
            }
        }
        
        // Décision finale
        const isMarketing = score >= 100;
        const confidence = Math.min(0.95, score / 200);
        
        return {
            isMarketing,
            score,
            confidence,
            patterns
        };
    }

    // ================================================
    // EXTRACTION DE CONTENU AMÉLIORÉE
    // ================================================
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        let hasUnsubscribeButton = false;
        
        // Traiter le sujet avec poids élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(10);
        } else {
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
        
        // Extraire les destinataires
        if (email.toRecipients && Array.isArray(email.toRecipients)) {
            email.toRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
            });
        }
        
        // Extraire les CC
        if (email.ccRecipients && Array.isArray(email.ccRecipients)) {
            email.ccRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
            });
        }
        
        // Extraire le contenu du corps
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        
        // NOUVEAU : Extraction améliorée pour Gmail
        if (email.body?.content || email.bodyHtml) {
            const htmlContent = email.body?.content || email.bodyHtml || '';
            const cleanedBody = this.cleanHtml(htmlContent);
            allText += cleanedBody + ' ';
            
            // Détecter bouton de désabonnement dans le HTML
            hasUnsubscribeButton = this.detectUnsubscribeButton(htmlContent);
            
            // Extraire les textes de liens importants
            const linkTexts = this.extractLinkTexts(htmlContent);
            allText += linkTexts.join(' ') + ' ';
        }
        
        // Analyser le contexte Gmail
        const contextClues = this.extractGmailContextClues(email);
        allText += contextClues + ' ';
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            rawSubject: email.subject || '',
            hasUnsubscribeButton: hasUnsubscribeButton,
            isGmail: true
        };
    }

    // ================================================
    // NOUVEAU : DÉTECTION BOUTON DÉSABONNEMENT
    // ================================================
    detectUnsubscribeButton(htmlContent) {
        if (!htmlContent) return false;
        
        const buttonPatterns = [
            /<a[^>]*class=["'][^"']*button[^"']*["'][^>]*>.*?(unsubscribe|désabonner|desabonner|opt.?out)/i,
            /<button[^>]*>.*?(unsubscribe|désabonner|desabonner|opt.?out)/i,
            /<a[^>]*style=["'][^"']*background[^"']*["'][^>]*>.*?(unsubscribe|désabonner|desabonner)/i,
            /<div[^>]*role=["']button["'][^>]*>.*?(unsubscribe|désabonner|desabonner)/i
        ];
        
        return buttonPatterns.some(pattern => pattern.test(htmlContent));
    }

    // ================================================
    // NOUVEAU : EXTRACTION TEXTES DE LIENS
    // ================================================
    extractLinkTexts(htmlContent) {
        const linkTexts = [];
        const linkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
        let match;
        
        while ((match = linkRegex.exec(htmlContent)) !== null) {
            const text = match[1].trim();
            if (text && text.length > 2 && text.length < 100) {
                linkTexts.push(text);
            }
        }
        
        return linkTexts;
    }

    // ================================================
    // NOUVEAU : INDICES CONTEXTUELS GMAIL
    // ================================================
    extractGmailContextClues(email) {
        let clues = '';
        
        // Labels Gmail
        if (email.categories && Array.isArray(email.categories)) {
            clues += email.categories.join(' ') + ' ';
            
            // Gmail marque souvent les promotions
            if (email.categories.includes('promotions') || email.categories.includes('Promotions')) {
                clues += ' gmail_promotions marketing newsletter ';
            }
        }
        
        // Importance Gmail
        if (email.importance === 'low') {
            clues += ' low_importance bulk_email ';
        }
        
        // Patterns de réponse/transfert
        const subject = email.subject || '';
        if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
            clues += ' conversation reply response ';
        }
        
        // Gmail spécifique
        clues += ' gmail google_mail ';
        
        return clues;
    }

    // ================================================
    // MOTS-CLÉS AMÉLIORÉS POUR GMAIL
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Optimisé pour Gmail
            marketing_news: {
                absolute: [
                    // Français
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'désabonner', 'desabonner', 'me désabonner', 'me desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'gérer les préférences', 'gerer vos preferences', 'gerer mes preferences',
                    'ne plus recevoir', 'arrêter de recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'mettre à jour vos préférences', 'mettre a jour vos preferences',
                    
                    // Anglais
                    'unsubscribe', 'opt out', 'opt-out', 'optout',
                    'email preferences', 'notification preferences',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    'stop receiving', 'remove from list',
                    'manage subscriptions', 'subscription center',
                    'mailing preferences', 'contact preferences',
                    
                    // Patterns spécifiques newsletters
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'you received this message because', 'why am i receiving',
                    'sent to you because', 'email sent by',
                    
                    // Patterns commerciaux
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    'exclusive deal', 'offre exclusive', 'vente flash',
                    
                    // Patterns techniques
                    'powered by', 'sent via', 'email marketing',
                    'bulk email', 'mass email', 'campaign email',
                    'marketing email', 'promotional email',
                    
                    // Footers typiques
                    '© 20', 'all rights reserved', 'tous droits réservés',
                    'copyright', 'privacy policy', 'politique de confidentialité',
                    'terms of service', 'conditions d\'utilisation'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'abonnement', 'souscription', 'inscription',
                    'weekly', 'hebdomadaire', 'mensuel', 'monthly',
                    'digest', 'recap', 'summary', 'bulletin'
                ],
                weak: [
                    'update', 'discover', 'new', 'nouveauté', 'découvrir',
                    'learn', 'tips', 'news', 'actualité', 'info'
                ],
                exclusions: []
            },

            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'compte google', 'google account', 'gmail security'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'google', 'gmail', 'compte'
                ],
                weak: ['compte', 'account', 'accès', 'access'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable', 'à faire',
                    'urgence', 'urgent', 'très urgent', 'asap',
                    'complete by', 'à compléter avant', 'due by',
                    'response needed', 'réponse attendue', 'réponse requise',
                    'waiting for', 'en attente de', 'pending action'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'task', 'tâche', 'todo', 'à faire',
                    'deadline', 'échéance', 'due', 'livrable'
                ],
                weak: ['demande', 'besoin', 'attente', 'request', 'need'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe']
            },

            meetings: {
                absolute: [
                    'google meet', 'meet.google.com', 'calendar.google.com',
                    'invitation google agenda', 'google calendar',
                    'demande de réunion', 'meeting request',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'join meeting', 'rejoindre la réunion',
                    'meeting link', 'lien de réunion'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'agenda', 'google',
                    'conférence', 'conference', 'call', 'visio'
                ],
                weak: ['présentation', 'disponible', 'available'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead',
                    'nouveau client', 'new customer', 'prospect'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'proposal'
                ],
                weak: ['offre', 'discussion', 'projet'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'ventes en ligne', 'shopping']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'google pay', 'google payment', 'gmail payment',
                    'transaction google', 'achat google play',
                    'relevé', 'statement', 'reçu', 'receipt'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'paiement', 'payment', 'google', 'transaction',
                    'prix', 'price', 'coût', 'cost'
                ],
                weak: ['euro', 'dollar', 'commande'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'soldes']
            },

            project: {
                absolute: [
                    'github', 'gitlab', 'pull request', 'merge request',
                    'issue', 'commit', 'branch', 'repository',
                    'projet', 'project update', 'milestone',
                    'sprint', 'jira', 'trello', 'asana'
                ],
                strong: [
                    'projet', 'project', 'development', 'code',
                    'github', 'git', 'développement', 'feature'
                ],
                weak: ['update', 'change', 'modification'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'case #',
                    'google support', 'gmail support', 'help request',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support'
                ],
                strong: [
                    'support', 'assistance', 'help', 'aide',
                    'ticket', 'incident', 'problème', 'issue'
                ],
                weak: ['help', 'question', 'demande'],
                exclusions: ['newsletter', 'marketing']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'no-reply@', 'donotreply@',
                    'google notification', 'gmail notification'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique', 'alert'
                ],
                weak: ['notification', 'alert', 'info'],
                exclusions: ['urgent', 'action required']
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés Gmail optimisés initialisés');
    }

    // ================================================
    // MÉTHODES UTILITAIRES OPTIMISÉES
    // ================================================
    cleanHtml(html) {
        if (!html) return '';
        
        // Préserver le texte des liens avant de nettoyer
        let cleanedHtml = html;
        
        // Remplacer les liens par leur texte + URL
        cleanedHtml = cleanedHtml.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, (match, url, text) => {
            return ` ${text} [${url}] `;
        });
        
        // Nettoyer le reste du HTML
        return cleanedHtml
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getCurrentUserEmail() {
        try {
            // Priorité aux infos Gmail
            const gmailInfo = sessionStorage.getItem('gmailUserInfo');
            if (gmailInfo) {
                const parsed = JSON.parse(gmailInfo);
                return parsed.email || parsed.userPrincipalName;
            }
            
            // Fallback sur les autres sources
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            // Via GoogleAuthService
            if (window.googleAuthService?.getCurrentUser) {
                const user = window.googleAuthService.getCurrentUser();
                if (user) {
                    return user.email || user.userPrincipalName;
                }
            }
            
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur:', e);
        }
        return null;
    }

    // ================================================
    // RESTE DU CODE INCHANGÉ (méthodes de base)
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

    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        // EmailScanner
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
                    break;
            }
        }
        
        // Autres modules...
        if (window.pageManager) {
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
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

    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

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
            activeCategories: null,
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

    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

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

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
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

    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
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
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
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

    // Autres méthodes existantes...
    
    analyzeAllCategories(content, email) {
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

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
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

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Pénalité pour contenu personnel
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille'];
        const hasPersonalContent = personalIndicators.some(indicator => text.includes(indicator));
        
        if (hasPersonalContent && ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_content_penalty', type: 'penalty', score: -50 });
        }
        
        // Test des exclusions
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
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
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
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
        
        return false;
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
            console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé');
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
        
        const result = isInCCList && !isInToList;
        
        if (result) {
            console.log('[CategoryManager] 📋 Email en CC détecté');
        }
        
        return result;
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

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

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
            isCustom: true,
            keywords: categoryData.keywords || { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
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

        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            keywords: updates.keywords || this.customCategories[categoryId].keywords,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
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

        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            const newPreselected = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.updateTaskPreselectedCategories(newPreselected);
        }

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
        
        console.log('[CategoryManager] Event listeners configurés');
    }

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
    }

    getCategoryFilters(categoryId) {
        if (!this.categories[categoryId]) {
            return {
                includeDomains: [],
                excludeDomains: [],
                includeEmails: [],
                excludeEmails: []
            };
        }
        
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
        
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].filters = this.categoryFilters[categoryId];
            this.saveCustomCategories();
        } else {
            this.saveCategoryFilters();
        }
        
        console.log(`[CategoryManager] Filtres mis à jour pour ${categoryId}`);
        
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
