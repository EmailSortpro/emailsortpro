// CategoryManager.js - Version 27.0 Enhanced - Détection améliorée avec patterns d'applications
// Mots-clés enrichis et patterns d'applications métier intégrés

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Cache pour optimisation
        this._normalizedTextCache = new Map();
        this._analysisCache = new Map();
        
        // Patterns compilés pour performance
        this.compiledPatterns = {
            unsubscribe: null,
            newsletter: null,
            marketing: null,
            commercial: null,
            notification: null,
            calendly: null,
            applications: {}
        };
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.compilePatterns();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 27.0 Enhanced - Détection améliorée avec patterns d\'applications');
    }

    // ================================================
    // COMPILATION DES PATTERNS
    // ================================================
    compilePatterns() {
        // Pattern de désabonnement ENRICHI
        this.compiledPatterns.unsubscribe = new RegExp(
            'unsubscribe|se\\s*d[eé]sabonner|d[eé]sabonner|d[eé]sinscrire|se\\s*d[eé]sinscrire|' +
            'd[eé]sactiv(?:er|ation)|opt\\s*out|opt-out|stop\\s*email|arr[eê]ter|' +
            'ne\\s*plus\\s*recevoir|plus\\s*recevoir|cesser|stopper|' +
            'g[eé]rer.*(?:pr[eé]f[eé]rences|abonnements?|notifications?)|' +
            'manage.*(?:preferences|subscriptions?|notifications?|email)|' +
            'email\\s*(?:preferences|settings|options)|notification\\s*(?:settings|preferences)|' +
            'update\\s*(?:preferences|email|notification)|modifier.*(?:pr[eé]f[eé]rences|abonnement)|' +
            'cliqu(?:e|ez)\\s*ici|click\\s*here|remove|retirer|supprimer.*email|' +
            'change\\s*email\\s*frequency|fr[eé]quence.*email|manage\\s*(?:email|notification)|' +
            'email\\s*notifications?|manage\\s*notifications?|' +
            'update\\s*your\\s*email\\s*preference|mettre\\s*[àa]\\s*jour.*pr[eé]f[eé]rences|' +
            'email\\s*preference|pr[eé]f[eé]rence.*email|communication\\s*preference|' +
            'vous\\s*(?:pouvez|souhaitez).*(?:d[eé]sabonner|ne\\s*plus)|' +
            'si\\s*vous.*(?:souhaitez|voulez).*(?:ne\\s*plus|arr[eê]ter)|' +
            'pour\\s*(?:ne\\s*plus|arr[eê]ter|cesser).*recevoir|' +
            'no\\s*longer\\s*(?:wish|want).*receive|stop\\s*receiving|' +
            'r[eé]silier|annuler.*(?:inscription|abonnement)|cancel.*subscription|' +
            'privacy\\s*statement|terms\\s*&\\s*conditions|contact\\s*us',
            'i'
        );
        
        // Pattern newsletter/marketing ENRICHI
        this.compiledPatterns.newsletter = new RegExp(
            'newsletter|bulletin|infolettre|info\\s*lettre|news\\s*letter|' +
            'mailing\\s*list|liste\\s*(?:de\\s*)?diffusion|liste\\s*d\'envoi|' +
            'campagne|campaign|marketing\\s*email|email\\s*marketing|' +
            'commercial\\s*email|email\\s*commercial|promotional|promotionnel|' +
            'publicit[eé]|advertis(?:ing|ement)|spam|bulk\\s*email|' +
            'mass\\s*email|broadcast|diffusion\\s*de\\s*masse|envoi\\s*group[eé]|' +
            'communication\\s*commerciale|message\\s*commercial|' +
            'offre.*(?:sp[eé]ciale|exclusive|limit[eé]e|promotionnelle)|' +
            'special.*(?:offer|deal|promotion)|exclusive.*(?:offer|deal)|' +
            'limited.*(?:time|offer)|temps\\s*limit[eé]|dur[eé]e\\s*limit[eé]e|' +
            'promo(?:tion)?|solde|sale|discount|r[eé]duction|remise|rabais|' +
            'bon\\s*(?:plan|de\\s*r[eé]duction)|coupon|code\\s*promo|' +
            'd[eé]couvr(?:ez|ir)|discover|nouveau.*(?:produit|service|offre)|' +
            'new.*(?:product|service|offer|arrival)|arriv[eé]e|nouveaut[eé]|' +
            'profitez|b[eé]n[eé]ficiez|take\\s*advantage|don\'t\\s*miss|' +
            'ne\\s*(?:ratez|manquez)\\s*pas|derni[eè]re\\s*chance|last\\s*chance|' +
            'aujourd\'hui\\s*seulement|today\\s*only|maintenant|now|' +
            'alert.*(?:job|emploi|opportunit[eé])|job.*(?:alert|notification)|' +
            'match.*(?:profil|search|criteria)|correspond.*(?:profil|recherche)|' +
            'r[eé]cap|recap|summary|sommaire|digest|weekly|hebdomadaire|' +
            'monthly|mensuel|daily|quotidien|p[eé]riodique|r[eé]gulier|' +
            'community.*support|support.*community|all\\s*rights\\s*reserved|' +
            'trademark|registered.*trade.*mark|confidential.*intended.*solely|' +
            'this\\s*email.*files.*transmitted|cannot\\s*accept\\s*liability|' +
            'l\'app\\s*pour\\s*tous|tous\\s*pour\\s*l\'app|satisfaction\\s*survey|' +
            'enqu[eê]te.*satisfaction|votre\\s*avis.*compte|give\\s*us.*feedback',
            'i'
        );
        
        // Pattern marketing agressif ENRICHI
        this.compiledPatterns.marketing = new RegExp(
            'gratuit|free|offert|cadeau|gift|bonus|extra|suppl[eé]mentaire|' +
            'gagnez|win|gagner|winner|gagnant|prix|price|reward|r[eé]compense|' +
            'cliquez\\s*(?:ici|maintenant)|click\\s*(?:here|now)|agir\\s*(?:vite|maintenant)|' +
            'act\\s*(?:fast|now)|urgent|urgence|hurry|d[eé]p[eê]chez|vite|rapide|' +
            'limit[eé]|limited|stock\\s*limit[eé]|quantit[eé]\\s*limit[eé]e|' +
            'encore\\s*\\d+|only\\s*\\d+|seulement\\s*\\d+|plus\\s*que\\s*\\d+|' +
            'inscription|register|sign\\s*up|inscrivez|souscr(?:ire|iption)|' +
            'abonnez|subscribe|membre|member|club|vip|premium|' +
            'parrain|referral|invit(?:er|ation)|recommand|' +
            'cashback|remboursement|money\\s*back|garantie|guarantee|' +
            'essai|trial|test|d[eé]mo|demonstration|[eé]chantillon|sample|' +
            'pari|bet|mise|jouer|play|casino|jackpot|' +
            'freebet|bonus.*(?:sport|pari|casino)|mission|d[eé]fi|challenge|' +
            'freebets|paris\\s*gagnants|encha[îi]ne.*paris|everest|kaizen',
            'i'
        );
        
        // Pattern commercial B2B
        this.compiledPatterns.commercial = new RegExp(
            'partenariat|partnership|collaboration|opportunit[eé]|opportunity|' +
            'business|affaire|deal|contrat|contract|accord|agreement|' +
            'proposition|proposal|offre\\s*commerciale|commercial\\s*offer|' +
            'devis|quote|estimation|tarif|pricing|budget|' +
            'n[eé]gociation|negotiation|discussion\\s*commerciale|' +
            'rendez-vous\\s*commercial|meeting\\s*commercial|' +
            'pr[eé]sentation|presentation|d[eé]monstration|demo|' +
            'solution|service|produit|product|prestation|' +
            'consultant|expertise|conseil|advisory|accompagnement|' +
            'strat[eé]gie|strategy|croissance|growth|d[eé]veloppement|' +
            'roi|retour\\s*sur\\s*investissement|return\\s*on\\s*investment|' +
            'lead|prospect|client\\s*potentiel|pipeline|',
            'i'
        );
        
        // Pattern notifications système
        this.compiledPatterns.notification = new RegExp(
            'noreply|no-reply|donotreply|do-not-reply|nepasrepondre|' +
            'notification|alert|alerte|avis|notice|message\\s*automatique|' +
            'automated\\s*(?:message|email)|syst[eè]me|system|' +
            'confirmation|confirm[eé]|validation|valid[eé]|' +
            'statut|status|[eé]tat|state|mise\\s*[aà]\\s*jour|update|' +
            'changement|change|modification|modifi[eé]|' +
            'information|info|communication|annonce|announcement|' +
            'rappel|reminder|relance|follow\\s*up|' +
            'r[eé]ponse\\s*automatique|auto\\s*reply|out\\s*of\\s*office|' +
            'candidature|application|postulation|thank\\s*you\\s*for\\s*your\\s*application|' +
            'nous\\s*avons\\s*re[cç]u\\s*votre|received\\s*your\\s*application|' +
            'suite\\s*favorable|pas\\s*de\\s*suite|regret.*pas.*retenue|' +
            'oauth.*application.*added|third-party.*application.*authorized|' +
            'security.*notification|s[eé]curit[eé].*notification',
            'i'
        );
        
        // Pattern Calendly
        this.compiledPatterns.calendly = new RegExp(
            'calendly|schedule\\s*with.*calendly|book\\s*time.*calendly|' +
            'calendly\\.com|calendar\\s*scheduling|booking\\s*confirmed|' +
            'meeting\\s*scheduled.*calendly|appointment\\s*booked.*calendly',
            'i'
        );
        
        // Patterns d'applications par catégorie
        this.compileApplicationPatterns();
    }

    // ================================================
    // COMPILATION DES PATTERNS D'APPLICATIONS
    // ================================================
    compileApplicationPatterns() {
        // Patterns pour la catégorie project (dev + gestion de projet)
        this.compiledPatterns.applications.project = new RegExp(
            // GitHub/GitLab
            'github|gitlab|pull\\s*request|merge\\s*request|issue|commit|' +
            'repository|branch|fork|release|workflow|pipeline|ci\\/cd|' +
            // Jira/Asana/Trello
            'jira|asana|trello|monday\\.com|clickup|' +
            'ticket|sprint|backlog|story\\s*point|epic|subtask|' +
            'board|card|kanban|scrum|agile|' +
            // Jenkins/Docker
            'jenkins|docker|kubernetes|k8s|container|deployment|' +
            'build\\s*(?:failed|success)|artifact|' +
            // IDE
            'jetbrains|intellij|webstorm|pycharm|vscode|' +
            // Notion/Linear
            'notion|linear|basecamp|airtable',
            'i'
        );
        
        // Patterns pour meetings/calendrier
        this.compiledPatterns.applications.meetings = new RegExp(
            // Calendrier
            'calendly|doodle|google\\s*calendar|outlook\\s*calendar|' +
            'meeting\\s*(?:request|invitation|scheduled)|rendez-vous|' +
            'conf[eé]rence|webinar|s[eé]minaire|' +
            // Visioconférence
            'zoom|teams\\s*meeting|google\\s*meet|webex|gotomeeting|' +
            'whereby|jitsi|bigbluebutton|starleaf|' +
            // Actions calendrier
            'accepted|declined|tentative|recurring|reschedule|' +
            'join\\s*(?:meeting|call)|lien\\s*de\\s*connexion|' +
            'salle\\s*de\\s*r[eé]union|meeting\\s*room',
            'i'
        );
        
        // Patterns pour commercial/CRM
        this.compiledPatterns.applications.commercial = new RegExp(
            // CRM
            'salesforce|hubspot|pipedrive|dynamics\\s*365|zoho\\s*crm|' +
            'lead|opportunity|account|deal|pipeline|forecast|' +
            'quote|devis|proposal|contrat|contract|' +
            // Marketing automation
            'marketo|pardot|eloqua|activecampaign|' +
            'campaign|sequence|nurturing|scoring|' +
            // Sales
            'close\\.io|outreach|salesloft|gong|chorus',
            'i'
        );
        
        // Patterns pour finance
        this.compiledPatterns.applications.finance = new RegExp(
            // ERP/Comptabilité
            'sap|oracle|quickbooks|sage|cegid|ebp|' +
            'facture|invoice|bon\\s*de\\s*commande|purchase\\s*order|' +
            'paiement|payment|virement|transfer|' +
            // Paiement
            'stripe|paypal|square|mollie|adyen|' +
            'transaction|refund|remboursement|receipt|' +
            // Expense
            'expensify|concur|rydoo|spendesk|' +
            'note\\s*de\\s*frais|expense\\s*report',
            'i'
        );
        
        // Patterns pour HR/Recrutement
        this.compiledPatterns.applications.hr = new RegExp(
            // SIRH
            'workday|bamboohr|successfactors|adp|payfit|lucca|' +
            'paie|payroll|payslip|bulletin|' +
            // Recrutement
            'welcomekit|welcome\\s*to\\s*the\\s*jungle|indeed|linkedin\\s*recruiter|' +
            'candidature|application|entretien|interview|' +
            'cv|resume|lettre\\s*de\\s*motivation|cover\\s*letter|' +
            // ATS
            'greenhouse|lever|workable|recruitee|teamtailor|' +
            'talent\\s*acquisition|hiring|onboarding',
            'i'
        );
        
        // Patterns pour support
        this.compiledPatterns.applications.support = new RegExp(
            // Ticketing
            'zendesk|freshdesk|servicenow|intercom|helpscout|' +
            'ticket|incident|request|case|escalation|' +
            'resolved|pending|priority|sla|' +
            // Help desk
            'helpdesk|service\\s*desk|support\\s*request|' +
            'bug|issue|problem|troubleshooting|' +
            // Chat support
            'drift|crisp|tawk|livechat|olark',
            'i'
        );
        
        // Patterns pour internal/communication
        this.compiledPatterns.applications.internal = new RegExp(
            // Chat/Messaging
            'slack|teams|discord|mattermost|rocket\\.chat|' +
            'channel|direct\\s*message|thread|mention|' +
            // Intranet/Wiki
            'confluence|sharepoint|notion|wiki|' +
            'announcement|annonce|all\\s*hands|town\\s*hall|' +
            // Collaboration
            'miro|mural|figma|invision|zeplin|' +
            'workspace|collaboration|brainstorm',
            'i'
        );
        
        // Patterns pour notifications (enrichi avec apps)
        this.compiledPatterns.applications.notifications = new RegExp(
            // OAuth/Security
            'github.*oauth|gitlab.*authorized|bitbucket.*access|' +
            'application.*authorized|third-party.*access|api.*token|' +
            // Monitoring
            'datadog|new\\s*relic|sentry|pagerduty|opsgenie|' +
            'alert|monitoring|uptime|downtime|incident|' +
            // Automation
            'zapier|ifttt|make\\.com|integromat|n8n|' +
            'workflow|automation|trigger|webhook',
            'i'
        );
        
        // Patterns pour security
        this.compiledPatterns.applications.security = new RegExp(
            // Auth/SSO
            'auth0|okta|onelogin|ping\\s*identity|' +
            'single\\s*sign-on|sso|saml|oauth|' +
            // Password managers
            '1password|lastpass|dashlane|bitwarden|keeper|' +
            'vault|password|secret\\s*key|' +
            // MFA
            'duo\\s*security|authy|google\\s*authenticator|' +
            'two-factor|2fa|mfa|verification\\s*code',
            'i'
        );
        
        // Patterns pour marketing_news (enrichi)
        this.compiledPatterns.applications.marketing_news = new RegExp(
            // Email marketing
            'mailchimp|sendinblue|brevo|mailjet|sendgrid|' +
            'constant\\s*contact|campaign\\s*monitor|klaviyo|' +
            // Newsletter platforms
            'substack|convertkit|getresponse|aweber|' +
            'newsletter|mailing\\s*list|broadcast|' +
            // Marketing automation
            'hubspot|marketo|pardot|eloqua|autopilot|' +
            'drip|nurture|automation|workflow',
            'i'
        );
    }

    // ================================================
    // ANALYSE D'EMAIL PRINCIPALE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0, matchedPatterns: [] };
        
        // Vérifier le cache
        const cacheKey = this.generateCacheKey(email);
        if (this._analysisCache.has(cacheKey)) {
            return this._analysisCache.get(cacheKey);
        }
        
        // Extraire le contenu complet
        const content = this.extractCompleteContent(email);
        
        // Vérifier d'abord Calendly
        if (this.isCalendlyEmail(content)) {
            const result = {
                category: 'meetings',
                score: 300,
                confidence: 0.95,
                matchedPatterns: [{ type: 'calendly', keyword: 'calendly_detected', score: 300 }],
                hasAbsolute: true
            };
            this._analysisCache.set(cacheKey, result);
            return result;
        }
        
        // Analyse multi-passes
        const newsletterScore = this.detectNewsletter(content);
        const applicationScore = this.detectApplicationPatterns(content);
        const categoryScores = this.analyzeCategoryScores(content);
        
        // Si c'est une newsletter évidente, forcer la catégorie
        if (newsletterScore.isDefiniteNewsletter) {
            const result = {
                category: 'marketing_news',
                score: newsletterScore.score,
                confidence: newsletterScore.confidence,
                matchedPatterns: newsletterScore.patterns,
                hasAbsolute: true
            };
            this._analysisCache.set(cacheKey, result);
            return result;
        }
        
        // Fusionner les scores
        for (const [category, appScore] of Object.entries(applicationScore)) {
            if (categoryScores[category]) {
                categoryScores[category].score += appScore.score;
                categoryScores[category].matchedPatterns.push(...appScore.patterns);
                categoryScores[category].confidence = Math.max(
                    categoryScores[category].confidence,
                    appScore.confidence
                );
                if (appScore.hasAbsolute) {
                    categoryScores[category].hasAbsolute = true;
                }
            }
        }
        
        // Ajouter le score newsletter aux résultats
        categoryScores.marketing_news.score += newsletterScore.score;
        categoryScores.marketing_news.confidence = Math.max(
            categoryScores.marketing_news.confidence,
            newsletterScore.confidence
        );
        categoryScores.marketing_news.matchedPatterns.push(...newsletterScore.patterns);
        
        // Sélectionner la meilleure catégorie
        const bestResult = this.selectBestCategory(categoryScores);
        
        // Mettre en cache
        this._analysisCache.set(cacheKey, bestResult);
        
        // Nettoyer le cache si trop grand
        if (this._analysisCache.size > 1000) {
            const firstKey = this._analysisCache.keys().next().value;
            this._analysisCache.delete(firstKey);
        }
        
        return bestResult;
    }

    // ================================================
    // DÉTECTION DES PATTERNS D'APPLICATIONS
    // ================================================
    detectApplicationPatterns(content) {
        const results = {};
        const textLower = content.fullText.toLowerCase();
        const domain = content.domain;
        const fromEmail = content.fromEmail;
        
        // Vérifier chaque catégorie d'application
        for (const [category, pattern] of Object.entries(this.compiledPatterns.applications)) {
            if (pattern.test(textLower)) {
                let score = 100;
                const patterns = [];
                
                // Bonus pour domaine spécifique
                if (this.isApplicationDomain(domain, category)) {
                    score += 150;
                    patterns.push({ type: 'app_domain', keyword: domain, score: 150 });
                }
                
                // Bonus pour expéditeur spécifique
                if (this.isApplicationSender(fromEmail, category)) {
                    score += 100;
                    patterns.push({ type: 'app_sender', keyword: fromEmail, score: 100 });
                }
                
                patterns.push({ type: 'app_pattern', keyword: `${category}_app`, score: 100 });
                
                results[category] = {
                    score: score,
                    patterns: patterns,
                    confidence: score >= 200 ? 0.9 : 0.7,
                    hasAbsolute: score >= 250
                };
            }
        }
        
        return results;
    }

    // ================================================
    // VÉRIFICATION DES DOMAINES D'APPLICATIONS
    // ================================================
    isApplicationDomain(domain, category) {
        const appDomains = {
            project: [
                'github.com', 'gitlab.com', 'bitbucket.org', 'atlassian.com', 
                'atlassian.net', 'jira.com', 'asana.com', 'trello.com', 
                'monday.com', 'clickup.com', 'notion.so', 'linear.app'
            ],
            meetings: [
                'calendly.com', 'doodle.com', 'zoom.us', 'zoom.com',
                'teams.microsoft.com', 'meet.google.com', 'webex.com'
            ],
            commercial: [
                'salesforce.com', 'force.com', 'hubspot.com', 'pipedrive.com',
                'dynamics.com', 'zoho.com', 'marketo.com'
            ],
            finance: [
                'stripe.com', 'paypal.com', 'quickbooks.com', 'intuit.com',
                'sage.com', 'sap.com', 'oracle.com'
            ],
            hr: [
                'workday.com', 'bamboohr.com', 'welcomekit.co', 'indeed.com',
                'linkedin.com', 'greenhouse.io', 'lever.co', 'workable.com'
            ],
            support: [
                'zendesk.com', 'freshdesk.com', 'servicenow.com', 'intercom.io',
                'helpscout.com'
            ],
            internal: [
                'slack.com', 'teams.microsoft.com', 'discord.com', 'notion.so',
                'confluence.atlassian.com', 'sharepoint.com'
            ],
            notifications: [
                'github.com', 'gitlab.com', 'datadog.com', 'newrelic.com',
                'sentry.io', 'pagerduty.com', 'zapier.com'
            ],
            security: [
                'auth0.com', 'okta.com', '1password.com', 'lastpass.com',
                'duo.com', 'authy.com'
            ],
            marketing_news: [
                'mailchimp.com', 'sendinblue.com', 'brevo.com', 'mailjet.com',
                'constantcontact.com', 'substack.com', 'convertkit.com'
            ]
        };
        
        const domains = appDomains[category] || [];
        return domains.some(d => domain.includes(d));
    }

    // ================================================
    // VÉRIFICATION DES EXPÉDITEURS D'APPLICATIONS
    // ================================================
    isApplicationSender(fromEmail, category) {
        const appSenders = {
            project: [
                'noreply@github.com', 'gitlab@', 'jira@', 'notifications@asana.com',
                'noreply@trello.com', 'noreply@monday.com'
            ],
            meetings: [
                'notifications@calendly.com', 'no-reply@zoom.us', 'noreply@doodle.com',
                'calendar-notification@google.com'
            ],
            commercial: [
                'noreply@salesforce.com', 'noreply@hubspot.com', 'noreply@pipedrive.com'
            ],
            finance: [
                'noreply@stripe.com', 'receipts@stripe.com', 'noreply@intuit.com',
                'noreply@paypal.com'
            ],
            hr: [
                'noreply@workday.com', 'welcomekit.co', 'indeedapply@indeed.com',
                'jobs-noreply@linkedin.com'
            ],
            support: [
                'noreply@zendesk.com', 'support@', 'helpdesk@'
            ],
            internal: [
                'noreply@slack.com', 'noreply@teams.microsoft.com'
            ],
            notifications: [
                'noreply@github.com', 'notifications@', 'alerts@', 'monitoring@'
            ],
            security: [
                'no-reply@auth0.com', 'noreply@okta.com', 'noreply@1password.com'
            ],
            marketing_news: [
                'noreply@mailchimp.com', 'newsletter@', 'marketing@', 'news@'
            ]
        };
        
        const senders = appSenders[category] || [];
        return senders.some(s => fromEmail.includes(s));
    }

    // ================================================
    // DÉTECTION CALENDLY
    // ================================================
    isCalendlyEmail(content) {
        const textLower = content.fullText.toLowerCase();
        
        // Vérifier uniquement le pattern Calendly dans le contenu
        return this.compiledPatterns.calendly.test(textLower);
    }

    // ================================================
    // DÉTECTION NEWSLETTER AMÉLIORÉE
    // ================================================
    detectNewsletter(content) {
        let score = 0;
        const patterns = [];
        let isDefiniteNewsletter = false;
        
        const textLower = content.fullText.toLowerCase();
        const subjectLower = content.subject.toLowerCase();
        const fromEmail = content.fromEmail?.toLowerCase() || '';
        
        // 1. PATTERNS CRITIQUES - Score très élevé
        
        // Désabonnement (CRITIQUE)
        if (this.compiledPatterns.unsubscribe.test(textLower)) {
            score += 300;
            patterns.push({ type: 'critical', keyword: 'unsubscribe_detected', score: 300 });
            
            // Bonus si dans un lien
            if (textLower.match(/<a[^>]*>[^<]*(?:d[eé]sabonner|unsubscribe|cliquez\\s*ici|update.*email.*preference)[^<]*<\/a>/i)) {
                score += 100;
                patterns.push({ type: 'critical', keyword: 'unsubscribe_link', score: 100 });
            }
        }
        
        // Patterns spécifiques Sony et autres entreprises
        if (textLower.match(/privacy\\s*statement|terms\\s*&\\s*conditions|all\\s*rights\\s*reserved|trademark|registered.*trade.*mark/i)) {
            score += 150;
            patterns.push({ type: 'strong', keyword: 'corporate_footer', score: 150 });
        }
        
        // Email confidentiality notice (typique des newsletters)
        if (textLower.match(/this\\s*email.*confidential.*intended\\s*solely|cannot\\s*accept\\s*liability/i)) {
            score += 100;
            patterns.push({ type: 'strong', keyword: 'confidentiality_notice', score: 100 });
        }
        
        // Patterns spécifiques EDF et conseillers
        if (textLower.match(/votre conseiller|espace client|decouvrez.*avantages|suivre.*conso|telecharger.*appli|l\'app\\s*pour\\s*tous/i)) {
            score += 150;
            patterns.push({ type: 'strong', keyword: 'customer_portal_promo', score: 150 });
        }
        
        // Newsletter explicite
        if (this.compiledPatterns.newsletter.test(textLower)) {
            score += 200;
            patterns.push({ type: 'strong', keyword: 'newsletter_pattern', score: 200 });
        }
        
        // Marketing agressif
        if (this.compiledPatterns.marketing.test(textLower)) {
            score += 150;
            patterns.push({ type: 'strong', keyword: 'marketing_pattern', score: 150 });
        }
        
        // Applications marketing détectées
        if (this.compiledPatterns.applications.marketing_news && 
            this.compiledPatterns.applications.marketing_news.test(textLower)) {
            score += 100;
            patterns.push({ type: 'app', keyword: 'marketing_app_detected', score: 100 });
        }
        
        // 2. PATTERNS D'EXCLUSION POUR CANDIDATURES ET MEETINGS LÉGITIMES
        const isCandidature = textLower.match(/votre candidature|your application|suite favorable|pas retenue|thank you for your.*application|suite de votre candidature|update about your application|nous vous remercions.*candidature|decided to move forward|regret to inform/i);
        const isFromRecruiter = fromEmail.match(/recrutement|recruiting|recruitment|talent|rh|hr|candidat/i) || 
                                content.fromName?.toLowerCase().match(/recrutement|recruiting|talent/i) ||
                                textLower.match(/charge.*recrutement|recruitment team|equipe.*recrutement/i);
        
        // Exclure les vraies candidatures
        if (isCandidature && !this.compiledPatterns.unsubscribe.test(textLower)) {
            score -= 500;
            patterns.push({ type: 'exclusion', keyword: 'genuine_application_response', score: -500 });
            return {
                isDefiniteNewsletter: false,
                score: 0,
                confidence: 0,
                patterns: patterns
            };
        }
        
        // Exclure les vraies réunions (non Calendly, non marketing)
        const isLegitMeeting = textLower.match(/invitation.*r[eé]union|meeting.*invitation|conf[eé]rence.*call|visio.*conf[eé]rence/i) &&
                               !this.compiledPatterns.unsubscribe.test(textLower) &&
                               !this.compiledPatterns.marketing.test(textLower) &&
                               !textLower.match(/webinar|s[eé]minaire\\s*web|pr[eé]sentation\\s*commerciale/i);
        
        if (isLegitMeeting) {
            score -= 300;
            patterns.push({ type: 'exclusion', keyword: 'legitimate_meeting', score: -300 });
        }
        
        // 3. DOMAINES TYPIQUES
        const domain = content.domain?.toLowerCase() || '';
        
        // Pattern de domaine newsletter (basé sur mots-clés, pas sur liste)
        if (domain.match(/news|newsletter|mail|marketing|campaign|notification|info|contact|noreply|no-reply/i)) {
            score += 100;
            patterns.push({ type: 'domain', keyword: `newsletter_domain_pattern`, score: 100 });
        }
        
        // Domaines d'entreprises avec newsletters
        if (domain.match(/relation-client|customer-service|client-info|info-client|satisfaction|review|feedback/i)) {
            score += 150;
            patterns.push({ type: 'domain', keyword: 'customer_communication_domain', score: 150 });
        }
        
        // Sous-domaines marketing
        if (domain.includes('.') && domain.match(/^(news|newsletter|email|mail|marketing|info|contact|satisfaction|review)\./i)) {
            score += 150;
            patterns.push({ type: 'domain', keyword: 'marketing_subdomain', score: 150 });
            isDefiniteNewsletter = true;
        }
        
        // Vérifier si c'est un domaine d'application marketing
        if (this.isApplicationDomain(domain, 'marketing_news')) {
            score += 200;
            patterns.push({ type: 'app_domain', keyword: 'marketing_platform_domain', score: 200 });
            isDefiniteNewsletter = true;
        }
        
        // 4. EXPÉDITEUR
        
        // Emails typiques newsletter (basé sur patterns)
        if (fromEmail.match(/newsletter|news|marketing|info|contact|noreply|notification|alert|update|promo|conseiller|relation-client|satisfaction|no-reply/i)) {
            score += 100;
            patterns.push({ type: 'sender', keyword: 'newsletter_sender_pattern', score: 100 });
        }
        
        // Vérifier si c'est un expéditeur d'application marketing
        if (this.isApplicationSender(fromEmail, 'marketing_news')) {
            score += 150;
            patterns.push({ type: 'app_sender', keyword: 'marketing_platform_sender', score: 150 });
        }
        
        // 5. CONTENU SPÉCIFIQUE
        
        // Emojis dans le sujet (fort indicateur)
        if (subjectLower.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
            score += 50;
            patterns.push({ type: 'content', keyword: 'emoji_subject', score: 50 });
        }
        
        // Patterns de récap/résumé
        if (textLower.match(/r[eé]cap|recap|sommaire|summary|digest|votre.*(?:semaine|mois)|your.*(?:week|month)/i)) {
            score += 100;
            patterns.push({ type: 'content', keyword: 'recap_pattern', score: 100 });
        }
        
        // Patterns d'alerte job
        if (textLower.match(/nouveau.*poste|new.*job|correspond.*profil|match.*profile|opportunit[eé].*emploi/i)) {
            score += 100;
            patterns.push({ type: 'content', keyword: 'job_alert', score: 100 });
        }
        
        // Patterns de paris/jeux (Winamax, etc.)
        if (textLower.match(/pari|bet|mise|freebet|bonus|mission|jackpot|casino|jouer|gagner|kaizen|everest/i)) {
            score += 200;
            patterns.push({ type: 'content', keyword: 'gambling_content', score: 200 });
            isDefiniteNewsletter = true;
        }
        
        // Patterns de satisfaction/feedback
        if (textLower.match(/satisfaction|votre\\s*avis|enqu[eê]te|survey|feedback|[eé]valuation|notez|rate\\s*us/i)) {
            score += 100;
            patterns.push({ type: 'content', keyword: 'satisfaction_survey', score: 100 });
        }
        
        // 6. EXCLUSIONS RÉDUITES
        
        // Vérifier si c'est vraiment transactionnel/sécurité
        const isTransactional = textLower.match(/facture.*payer|invoice.*payment|paiement.*effectuer|virement.*effectue|securit[eé]|authentification|verification.*compte/i);
        const hasCriticalInfo = textLower.match(/mot\\s*de\\s*passe|password|code.*s[eé]curit[eé]|pin|confidentiel/i);
        
        if (isTransactional && hasCriticalInfo && !this.compiledPatterns.unsubscribe.test(textLower)) {
            score -= 200;
            patterns.push({ type: 'exclusion', keyword: 'security_transaction', score: -200 });
            isDefiniteNewsletter = false;
        }
        
        // 7. CALCUL FINAL
        
        // Si patterns newsletter très forts, forcer la détection
        if (score >= 400 || (score >= 300 && domain.match(/newsletter|marketing|news/i))) {
            isDefiniteNewsletter = true;
        }
        
        // Calculer la confiance
        let confidence = 0;
        if (isDefiniteNewsletter) {
            confidence = 0.95;
        } else if (score >= 300) {
            confidence = 0.85;
        } else if (score >= 200) {
            confidence = 0.75;
        } else if (score >= 150) {
            confidence = 0.65;
        } else if (score >= 100) {
            confidence = 0.55;
        } else {
            confidence = Math.max(0, score / 400);
        }
        
        return {
            isDefiniteNewsletter,
            score: Math.max(0, score),
            confidence,
            patterns
        };
    }

    // ================================================
    // ANALYSE PAR CATÉGORIE
    // ================================================
    analyzeCategoryScores(content) {
        const results = {};
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            const score = this.calculateCategoryScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                matchedPatterns: score.matches,
                confidence: this.calculateConfidence(score),
                hasAbsolute: score.hasAbsolute,
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        // Boost spécial pour les notifications de candidature
        const textLower = content.fullText.toLowerCase();
        if (textLower.match(/suite de votre candidature|update about your application|charge.*recrutement|recruitment team|oauth.*application.*added|candidature bien recue|nous avons bien recu votre candidature|indeed apply|welcomekit|equipe rh|thanks for applying|application.*submitted successfully|workable|workablemail|copy of your application/i)) {
            if (results.notifications) {
                results.notifications.score += 250;
                results.notifications.matchedPatterns.push({ 
                    type: 'boost', 
                    keyword: 'special_notification_boost', 
                    score: 250 
                });
                results.notifications.confidence = Math.min(0.95, results.notifications.confidence + 0.3);
            }
        }
        
        // Boost pour détection d'applications HR dans notifications
        if (this.compiledPatterns.applications.hr && 
            this.compiledPatterns.applications.hr.test(textLower) &&
            textLower.match(/candidature|application|thank.*you.*for.*applying/i)) {
            if (results.notifications) {
                results.notifications.score += 100;
                results.notifications.matchedPatterns.push({ 
                    type: 'app_boost', 
                    keyword: 'hr_platform_detected', 
                    score: 100 
                });
            }
        }
        
        // Pénalité pour les emails marketing déguisés en autre chose
        if (textLower.match(/your tv upgrade is calling|bravia|made for movies|made for sports|made for gaming|best for design|bigger bolder|lineup is here/i)) {
            if (results.meetings) {
                results.meetings.score -= 300;
                results.meetings.matchedPatterns.push({ 
                    type: 'penalty', 
                    keyword: 'marketing_content_detected', 
                    score: -300 
                });
            }
            if (results.marketing_news) {
                results.marketing_news.score += 200;
                results.marketing_news.confidence = Math.min(0.95, results.marketing_news.confidence + 0.2);
            }
        }
        
        return results;
    }

    // ================================================
    // CALCUL DU SCORE PAR CATÉGORIE
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.normalizedText;
        
        // Bonus contextuels
        if (content.hasAttachments) {
            if (['finance', 'project', 'commercial', 'hr'].includes(categoryId)) {
                totalScore += 20;
                matches.push({ type: 'context', keyword: 'has_attachment', score: 20 });
            }
        }
        
        if (content.importance === 'high') {
            if (['tasks', 'security', 'finance', 'meetings'].includes(categoryId)) {
                totalScore += 30;
                matches.push({ type: 'context', keyword: 'high_importance', score: 30 });
            }
        }
        
        // Analyser les mots-clés
        if (keywords.absolute?.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 150;
                    hasAbsolute = true;
                    matches.push({ type: 'absolute', keyword, score: 150 });
                    
                    if (this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 50;
                        matches.push({ type: 'subject_bonus', keyword, score: 50 });
                    }
                }
            }
        }
        
        if (keywords.strong?.length > 0) {
            for (const keyword of keywords.strong) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 50;
                    matches.push({ type: 'strong', keyword, score: 50 });
                    
                    if (this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 25;
                        matches.push({ type: 'subject_bonus', keyword, score: 25 });
                    }
                }
            }
        }
        
        if (keywords.weak?.length > 0) {
            for (const keyword of keywords.weak) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 20;
                    matches.push({ type: 'weak', keyword, score: 20 });
                }
            }
        }
        
        // Appliquer les exclusions
        if (keywords.exclusions?.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findKeywordInText(text, exclusion)) {
                    const penalty = categoryId === 'marketing_news' ? -20 : -50;
                    totalScore += penalty;
                    matches.push({ type: 'exclusion', keyword: exclusion, score: penalty });
                }
            }
        }
        
        return {
            total: Math.max(0, totalScore),
            hasAbsolute,
            matches
        };
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
                description: 'Newsletters, actualités et communications marketing',
                priority: 100, // Priorité maximale
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures, paiements et documents financiers',
                priority: 95,
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
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches et actions à effectuer',
                priority: 85,
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et planification de réunions',
                priority: 80,
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités commerciales et partenariats',
                priority: 75,
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques et alertes système',
                priority: 70,
                isCustom: false
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion et suivi de projets',
                priority: 65,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et administration',
                priority: 60,
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Support technique et assistance',
                priority: 55,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Communications internes d\'entreprise',
                priority: 50,
                isCustom: false
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 45,
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 40,
                isCustom: false
            },
            
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
    // MOTS-CLÉS ENRICHIS AVEC APPLICATIONS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Hyper-dense avec nouveaux patterns
            marketing_news: {
                absolute: [
                    'newsletter', 'unsubscribe', 'se desabonner', 'se desinscrire',
                    'cliquez ici', 'click here', 'ne plus recevoir', 'stop email',
                    'manage preferences', 'gerer preferences', 'email preferences',
                    'vous recevez ce', 'you received this', 'bulk email',
                    'desabonnement', 'choisir quels emails', 'pour vous desabonner',
                    'espace client', 'votre conseiller', 'decouvrez avantages',
                    'update your email preference', 'update your e-mail preferences',
                    'mettre a jour preferences email', 'privacy statement', 
                    'terms & conditions', 'terms and conditions', 'contact us',
                    'all rights reserved', 'registered trade mark', 'trademark',
                    'your tv upgrade is calling', 'upgrade to the best',
                    'made for movies', 'made for sports', 'made for gaming',
                    'best for design', 'discover more', 'store online',
                    // Apps marketing
                    'mailchimp', 'sendinblue', 'brevo', 'constant contact'
                ],
                strong: [
                    'marketing', 'promotion', 'offre', 'promo', 'solde', 'sale',
                    'reduction', 'discount', 'gratuit', 'free', 'bonus',
                    'decouvrez', 'discover', 'nouveau', 'new', 'exclusive',
                    'limite', 'limited', 'special', 'alert', 'notification',
                    'recap', 'summary', 'digest', 'update', 'news', 'info',
                    'hebdomadaire', 'weekly', 'mensuel', 'monthly', 'daily',
                    'correspond profil', 'match profile', 'job alert',
                    'freebet', 'pari', 'bet', 'mission', 'challenge',
                    'avantages', 'suivre conso', 'economie', 'appli',
                    'telecharger', 'adopter', 'rendez-vous', 'prochain',
                    'satisfaction', 'votre avis', 'enquete', 'survey', 'feedback',
                    'app pour tous', 'tous pour app', 'community support',
                    'this email and any files', 'confidential and intended',
                    'cannot accept liability', 'bmail', 'view online', 
                    'all products', 'lineup is here', 'calling', 'finest', 
                    'bigger bolder', 'thrill home', 'tell us what you love', 
                    'we have the best', 'broadcast', 'campaign'
                ],
                weak: [
                    'profitez', 'beneficiez', 'advantage', 'opportunite',
                    'inscrivez', 'subscribe', 'membre', 'member', 'club',
                    'actualite', 'article', 'blog', 'contenu', 'content',
                    'conseil', 'astuce', 'solution', 'service', 'communication'
                ],
                exclusions: [] // Aucune exclusion pour cette catégorie
            },

            // FINANCE - Dense et précis avec apps
            finance: {
                absolute: [
                    'facture', 'invoice', 'paiement', 'payment', 'virement',
                    'remboursement', 'refund', 'releve bancaire', 'bank statement',
                    'devis', 'quote', 'commande numero', 'order number',
                    'montant du', 'montant total', 'total amount', 'a payer',
                    'reglement facture', 'payer facture', 'facture a regler',
                    // Apps finance
                    'stripe', 'paypal', 'quickbooks', 'sage', 'cegid'
                ],
                strong: [
                    'montant', 'amount', 'euro', 'dollar', 'prix', 'price',
                    'cout', 'cost', 'tva', 'tax', 'ht', 'ttc', 'total',
                    'echeance', 'due date', 'date limite', 'deadline',
                    'bancaire', 'bank', 'compte', 'account', 'carte',
                    'tresorerie', 'treasury', 'comptabilite', 'accounting',
                    'budget', 'depense', 'expense', 'frais', 'fees',
                    'iban', 'virement', 'prelevement', 'cheque',
                    'transaction', 'receipt', 'recu', 'sap', 'oracle'
                ],
                weak: [
                    'reference', 'numero', 'document', 'piece jointe',
                    'valider', 'validation', 'approuver', 'approval'
                ],
                exclusions: ['newsletter', 'promotion', 'offre speciale', 'decouvrez', 'conseiller', 'espace client']
            },

            // SECURITY - Haute priorité avec apps
            security: {
                absolute: [
                    'alerte securite', 'security alert', 'connexion suspecte',
                    'suspicious login', 'mot de passe', 'password', 'code verification',
                    'verification code', '2fa', 'two factor', 'authentification',
                    'compte bloque', 'account locked', 'activite inhabituelle',
                    // Apps security
                    'auth0', 'okta', '1password', 'lastpass', 'duo security'
                ],
                strong: [
                    'securite', 'security', 'verification', 'verify', 'confirmer',
                    'identite', 'identity', 'acces', 'access', 'autorisation',
                    'suspicieux', 'suspicious', 'inhabituel', 'unusual',
                    'bloquer', 'block', 'verrouiller', 'lock', 'proteger',
                    'risque', 'risk', 'menace', 'threat', 'fraude', 'fraud',
                    'mfa', 'sso', 'single sign-on', 'vault', 'secret key'
                ],
                weak: [
                    'compte', 'account', 'connexion', 'login', 'session',
                    'utilisateur', 'user', 'profil', 'profile'
                ],
                exclusions: ['newsletter', 'promotion']
            },

            // TASKS - Actions requises
            tasks: {
                absolute: [
                    'action requise', 'action required', 'urgent', 'asap',
                    'avant le', 'before', 'deadline', 'date limite',
                    'merci de', 'please', 'veuillez', 'priere de',
                    'a faire', 'to do', 'completer', 'complete'
                ],
                strong: [
                    'urgent', 'urgence', 'priorite', 'priority', 'important',
                    'critique', 'critical', 'imperatif', 'mandatory',
                    'action', 'tache', 'task', 'demande', 'request',
                    'attente', 'waiting', 'pending', 'retard', 'delay',
                    'rappel', 'reminder', 'relance', 'follow up'
                ],
                weak: [
                    'faire', 'do', 'realiser', 'execute', 'traiter',
                    'terminer', 'finish', 'achever', 'finir'
                ],
                exclusions: ['newsletter', 'offre']
            },

            // MEETINGS - Réunions avec apps
            meetings: {
                absolute: [
                    'reunion', 'meeting', 'rendez-vous', 'appointment',
                    'invitation reunion', 'meeting invitation', 'conference',
                    'call', 'visio', 'teams', 'zoom', 'meet', 'webex',
                    'salle de reunion', 'meeting room', 'ordre du jour',
                    'rejoindre reunion', 'join meeting', 'lien de connexion',
                    // Apps meetings
                    'calendly', 'doodle', 'google calendar', 'outlook calendar'
                ],
                strong: [
                    'calendrier', 'calendar', 'agenda', 'planning', 'schedule',
                    'date', 'heure', 'time', 'horaire', 'disponible',
                    'available', 'disponibilite', 'availability', 'confirmer',
                    'confirm', 'reporter', 'postpone', 'reschedule', 'annuler',
                    'participants', 'attendees', 'invites', 'organizer',
                    'accepted', 'declined', 'tentative', 'recurring'
                ],
                weak: [
                    'rencontre', 'voir', 'discuter', 'talk', 'echanger'
                ],
                exclusions: [
                    'webinar marketing', 'conference commerciale', 
                    'candidature', 'application', 'suite de votre candidature',
                    'update about your application', 'recruitment', 'recrutement',
                    'charge de recrutement', 'regret to inform',
                    'unsubscribe', 'newsletter', 'promotion'
                ]
            },

            // COMMERCIAL - B2B avec CRM
            commercial: {
                absolute: [
                    'opportunite', 'opportunity', 'proposition commerciale',
                    'business proposal', 'contrat', 'contract', 'partenariat',
                    'partnership', 'appel offre', 'tender', 'rfp', 'devis',
                    // Apps CRM
                    'salesforce', 'hubspot', 'pipedrive', 'dynamics 365'
                ],
                strong: [
                    'commercial', 'business', 'affaire', 'deal', 'vente',
                    'sale', 'client', 'customer', 'prospect', 'lead',
                    'marche', 'market', 'strategie', 'strategy', 'croissance',
                    'growth', 'developpement', 'development', 'roi', 'investissement',
                    'pipeline', 'forecast', 'crm', 'zoho'
                ],
                weak: [
                    'interessant', 'potentiel', 'envisager', 'consider'
                ],
                exclusions: ['newsletter', 'promotion personnelle', 'candidature', 'votre candidature', 'suite favorable']
            },

            // NOTIFICATIONS - Automatiques avec apps
            notifications: {
                absolute: [
                    'no reply', 'noreply', 'ne pas repondre', 'do not reply',
                    'notification automatique', 'automated notification',
                    'message automatique', 'automated message',
                    'candidature retenue', 'candidature pas retenue',
                    'candidature bien recue', 'candidature recue', 'bien recu votre candidature',
                    'thank you for your application', 'merci pour votre candidature',
                    'nous avons bien recu votre candidature', 'nous avons recu votre candidature', 
                    'received your application', 'application received',
                    'suite favorable', 'pas de suite favorable', 'pas retenue pour cette fois',
                    'suite de votre candidature', 'update about your application',
                    'nous vous remercions de nous avoir fait parvenir',
                    'decided to move forward', 'regret to inform',
                    'malheureusement pas en mesure', 'after thorough consideration',
                    'oauth application has been added', 'third-party application',
                    'application has been authorized', 'security notification',
                    'etudions avec attention', 'revenons vers vous dans les plus brefs delais',
                    'sans retour de notre part', 'veuillez considerer',
                    'conserver votre cv', 'cvtheque', 'candidature envoyee',
                    'indeed apply', 'welcomekit', 'candidats.welcomekit',
                    // Apps monitoring/automation
                    'datadog', 'new relic', 'sentry', 'pagerduty', 'zapier'
                ],
                strong: [
                    'notification', 'alert', 'alerte', 'avis', 'notice',
                    'statut', 'status', 'confirmation', 'confirme',
                    'automatique', 'automated', 'systeme', 'system',
                    'candidature', 'application', 'postulation',
                    'reponse automatique', 'automated response',
                    'accusé reception', 'acknowledgment',
                    'recruitment team', 'equipe recrutement', 'equipe rh',
                    'charge recrutement', 'recruiter', 'recruteur',
                    'ressources humaines', 'human resources', 'rh de',
                    'talent acquisition', 'donner suite', 'giving update',
                    'github', 'oauth', 'authorized', 'scopes',
                    'employeur peut vous contacter', 'prochaines etapes',
                    'email automatique', 'ne pas repondre',
                    'monitoring', 'webhook', 'trigger', 'workflow'
                ],
                weak: [
                    'information', 'update', 'mise a jour', 'changement',
                    'merci', 'thank you', 'cordialement', 'regards',
                    'remercions', 'appreciate', 'consideration',
                    'bonne chance', 'good luck'
                ],
                exclusions: ['action requise', 'urgent', 'newsletter', 'rendez-vous', 'reunion', 'meeting invitation']
            },

            // HR - Ressources humaines avec ATS
            hr: {
                absolute: [
                    'ressources humaines', 'human resources', 'contrat travail',
                    'employment contract', 'bulletin paie', 'payslip',
                    'conge', 'leave', 'entretien annuel', 'annual review',
                    // Apps HR
                    'workday', 'bamboohr', 'successfactors', 'adp', 'payfit'
                ],
                strong: [
                    'salaire', 'salary', 'remuneration', 'prime', 'bonus',
                    'employe', 'employee', 'poste', 'position', 'carriere',
                    'career', 'formation', 'training', 'recrutement',
                    'candidat', 'candidate', 'entretien', 'interview',
                    'onboarding', 'offboarding', 'talent', 'hiring',
                    'greenhouse', 'lever', 'workable', 'recruitee'
                ],
                weak: [
                    'equipe', 'team', 'entreprise', 'company', 'bureau'
                ],
                exclusions: []
            },

            // PROJECT - Gestion de projet avec outils
            project: {
                absolute: [
                    'projet', 'project', 'milestone', 'jalon', 'livrable',
                    'deliverable', 'sprint', 'roadmap', 'gantt', 'kick off',
                    // Apps project
                    'jira', 'github', 'gitlab', 'asana', 'trello'
                ],
                strong: [
                    'avancement', 'progress', 'planning', 'timeline', 'equipe',
                    'team', 'tache', 'task', 'risque', 'risk', 'budget',
                    'validation', 'review', 'suivi', 'tracking', 'kpi',
                    'pull request', 'merge request', 'commit', 'issue',
                    'ticket', 'board', 'kanban', 'scrum', 'agile',
                    'monday', 'clickup', 'notion', 'linear', 'basecamp'
                ],
                weak: [
                    'document', 'fichier', 'rapport', 'update'
                ],
                exclusions: [
                    'newsletter projet', 'candidature', 'votre candidature', 
                    'suite favorable', 'application', 'applying', 'thanks for applying',
                    'application submitted', 'workable', 'workablemail',
                    'copy of your application', 'withdraw this application'
                ]
            },

            // SUPPORT - Technique avec ticketing
            support: {
                absolute: [
                    'ticket', 'incident', 'demande support', 'support request',
                    'probleme technique', 'technical issue', 'bug', 'erreur',
                    'panne', 'helpdesk', 'service desk',
                    // Apps support
                    'zendesk', 'freshdesk', 'servicenow', 'intercom'
                ],
                strong: [
                    'support', 'assistance', 'aide', 'help', 'technique',
                    'technical', 'probleme', 'problem', 'solution', 'resolu',
                    'resolved', 'maintenance', 'depannage', 'diagnostic',
                    'escalation', 'priority', 'sla', 'pending',
                    'helpscout', 'drift', 'crisp', 'livechat'
                ],
                weak: [
                    'question', 'demande', 'besoin', 'fonctionnement'
                ],
                exclusions: ['support commercial', 'newsletter']
            },

            // INTERNAL - Communications internes avec outils
            internal: {
                absolute: [
                    'communication interne', 'internal communication',
                    'note service', 'memo', 'tout le personnel', 'all staff',
                    'annonce entreprise', 'company announcement',
                    // Apps internal
                    'slack', 'teams', 'discord', 'mattermost'
                ],
                strong: [
                    'interne', 'internal', 'entreprise', 'company', 'personnel',
                    'staff', 'employes', 'direction', 'management', 'politique',
                    'policy', 'procedure', 'changement organisationnel',
                    'channel', 'thread', 'mention', 'workspace',
                    'confluence', 'sharepoint', 'wiki', 'intranet',
                    'miro', 'mural', 'figma', 'collaboration'
                ],
                weak: [
                    'information', 'annonce', 'nouvelle', 'communication'
                ],
                exclusions: ['externe', 'client', 'newsletter']
            },

            // REMINDERS - Relances
            reminders: {
                absolute: [
                    'rappel', 'reminder', 'relance', 'follow up', 'suite a',
                    'following', 'comme convenu', 'as agreed', 'point suivi'
                ],
                strong: [
                    'rappeler', 'remind', 'relancer', 'suivre', 'attente',
                    'waiting', 'pending', 'retour', 'feedback', 'precedent',
                    'previous', 'encore', 'still', 'toujours'
                ],
                weak: [
                    'point', 'suivi', 'suite', 'message', 'mail'
                ],
                exclusions: ['premiere fois', 'initial', 'nouveau']
            },

            // CC - En copie
            cc: {
                absolute: [
                    'pour information', 'for information', 'fyi', 'en copie',
                    'in copy', 'cc', 'copie pour information'
                ],
                strong: [
                    'information', 'copie', 'copy', 'cci', 'bcc', 'connaissance'
                ],
                weak: [
                    'transmettre', 'forward', 'partager', 'share'
                ],
                exclusions: ['action', 'urgent', 'faire', 'repondre']
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés enrichis avec patterns d\'applications chargés');
    }

    // ================================================
    // EXTRACTION DU CONTENU
    // ================================================
    extractCompleteContent(email) {
        let fullText = '';
        let subject = email.subject || '';
        let bodyText = '';
        
        // Priorité au fullTextContent
        if (email.fullTextContent) {
            fullText = email.fullTextContent;
        } else {
            // Construire manuellement
            if (subject) {
                fullText += subject + ' ' + subject + ' ' + subject + '\n\n';
            }
            
            if (email.from?.emailAddress) {
                const fromEmail = email.from.emailAddress.address || '';
                const fromName = email.from.emailAddress.name || '';
                fullText += `De: ${fromName} <${fromEmail}>\n`;
                
                if (fromEmail.includes('@')) {
                    const domain = fromEmail.split('@')[1];
                    fullText += `Domaine: ${domain}\n`;
                }
            }
            
            if (email.body?.content) {
                bodyText = email.body.content;
                fullText += '\n' + bodyText + '\n';
            } else if (email.bodyHtml) {
                bodyText = email.bodyHtml;
                fullText += '\n' + bodyText + '\n';
            } else if (email.bodyText) {
                bodyText = email.bodyText;
                fullText += '\n' + bodyText + '\n';
            } else if (email.bodyPreview) {
                bodyText = email.bodyPreview;
                fullText += '\n' + bodyText + '\n';
            }
            
            if (email.gmailMetadata?.snippet) {
                fullText += '\n' + email.gmailMetadata.snippet;
            }
        }
        
        const fromEmail = email.from?.emailAddress?.address || '';
        const fromName = email.from?.emailAddress?.name || '';
        const domain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : '';
        
        return {
            fullText,
            normalizedText: this.normalizeText(fullText),
            subject,
            bodyText,
            domain,
            fromEmail,
            fromName,
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            provider: email.provider || email.providerType || 'unknown',
            isReply: this.isReplyOrForward(subject),
            labels: email.labelIds || email.labels || []
        };
    }

    // ================================================
    // NORMALISATION DU TEXTE
    // ================================================
    normalizeText(text) {
        if (!text) return '';
        
        if (this._normalizedTextCache.has(text)) {
            return this._normalizedTextCache.get(text);
        }
        
        let normalized = text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/[''`]/g, "'")
            .replace(/[-–—_]/g, ' ')
            .replace(/[\r\n]+/g, ' ')
            .replace(/[,;:!?()[\]{}«»""]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        this._normalizedTextCache.set(text, normalized);
        
        if (this._normalizedTextCache.size > 500) {
            const firstKey = this._normalizedTextCache.keys().next().value;
            this._normalizedTextCache.delete(firstKey);
        }
        
        return normalized;
    }

    // ================================================
    // RECHERCHE DE MOTS-CLÉS
    // ================================================
    findKeywordInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = this.normalizeText(keyword);
        
        if (text.includes(normalizedKeyword)) {
            return true;
        }
        
        const wordBoundaryPattern = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        return wordBoundaryPattern.test(text);
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const validResults = Object.values(results)
            .filter(r => r.category !== 'other' && r.score >= MIN_SCORE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false
            };
        }
        
        validResults.sort((a, b) => {
            if (a.hasAbsolute && !b.hasAbsolute) return -1;
            if (!a.hasAbsolute && b.hasAbsolute) return 1;
            if (a.score !== b.score) return b.score - a.score;
            return b.priority - a.priority;
        });
        
        const best = validResults[0];
        
        if (best.confidence < MIN_CONFIDENCE_THRESHOLD && !best.hasAbsolute) {
            return {
                category: 'other',
                score: best.score,
                confidence: best.confidence,
                matchedPatterns: best.matchedPatterns || [],
                hasAbsolute: false
            };
        }
        
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matchedPatterns || [],
            hasAbsolute: best.hasAbsolute
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 300) return 0.90;
        if (score.total >= 200) return 0.85;
        if (score.total >= 150) return 0.80;
        if (score.total >= 100) return 0.75;
        if (score.total >= 75) return 0.70;
        if (score.total >= 50) return 0.65;
        if (score.total >= 30) return 0.60;
        return 0.50;
    }

    isReplyOrForward(subject) {
        if (!subject) return false;
        return /^(re:|fwd:|fw:|tr:|ref:|re :|fwd :|fw :|tr :|ref :)/i.test(subject);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\                    'malheureusement pas en mesure', 'after thorough consideration',
                    'oauth application has been added', 'third-party application',');
    }

    generateCacheKey(email) {
        return `${email.id || ''}_${email.subject || ''}_${email.from?.emailAddress?.address || ''}`;
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
        }
        return this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
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
                detectCC: true,
                showNotifications: true
            }
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getCategories() {
        return { ...this.categories };
    }

    getCategory(categoryId) {
        return this.categories[categoryId] || null;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    updateTaskPreselectedCategories(categories) {
        this.settings.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        this.saveSettings();
        this.notifyChanges('taskPreselectedCategories', this.settings.taskPreselectedCategories);
        return this.settings.taskPreselectedCategories;
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.notifyChanges('settings', this.settings);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                this.customCategories = JSON.parse(saved);
                
                Object.entries(this.customCategories).forEach(([id, category]) => {
                    this.categories[id] = {
                        ...category,
                        isCustom: true,
                        priority: category.priority || 30
                    };
                    
                    if (category.keywords) {
                        this.weightedKeywords[id] = category.keywords;
                    }
                });
                
                console.log(`[CategoryManager] ${Object.keys(this.customCategories).length} catégories personnalisées chargées`);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
        }
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION
    // ================================================
    notifyChanges(type, value) {
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification listener:', error);
            }
        });
        
        window.dispatchEvent(new CustomEvent('categoryManagerChanged', {
            detail: { type, value, settings: this.settings }
        }));
    }

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => this.changeListeners.delete(callback);
    }

    // ================================================
    // SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        setInterval(() => {
            if (this.syncQueue.length > 0 && !this.syncInProgress) {
                this.processSyncQueue();
            }
        }, 2000);
    }

    processSyncQueue() {
        this.syncInProgress = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const change = this.syncQueue.shift();
                this.applyChange(change);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur traitement sync queue:', error);
        } finally {
            this.syncInProgress = false;
            this.lastSyncTimestamp = Date.now();
        }
    }

    applyChange(change) {
        const { type, value } = change;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = [...value];
                break;
            case 'settings':
                this.settings = { ...this.settings, ...value };
                break;
        }
        
        this.saveSettings();
        this.notifyChanges(type, value);
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.source !== 'CategoryManager') {
                this.syncQueue.push({
                    type: event.detail.type,
                    value: event.detail.value
                });
            }
        });
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    testEmail(subject, body = '', from = 'test@example.com', expectedCategory = null) {
        const testEmail = {
            subject,
            body: { content: body },
            from: { emailAddress: { address: from } },
            fullTextContent: subject + '\n' + body
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log(`📧 Test: "${subject}"`);
        console.log(`   From: ${from}`);
        console.log(`   Catégorie: ${result.category} (Score: ${result.score}, Confiance: ${Math.round(result.confidence * 100)}%)`);
        console.log(`   Matches:`, result.matchedPatterns);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`   ❌ ERREUR: Attendu "${expectedCategory}"`);
        } else if (expectedCategory) {
            console.log(`   ✅ Catégorie correcte`);
        }
        
        return result;
    }

    getDebugInfo() {
        return {
            version: '27.0 Enhanced',
            categoriesCount: Object.keys(this.categories).length,
            customCategoriesCount: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            taskPreselectedCategories: this.settings.taskPreselectedCategories,
            categoryExclusions: this.settings.categoryExclusions,
            applicationPatterns: Object.keys(this.compiledPatterns.applications).length,
            cacheSize: {
                normalizedText: this._normalizedTextCache.size,
                analysis: this._analysisCache.size
            },
            syncQueue: this.syncQueue.length,
            lastSync: new Date(this.lastSyncTimestamp).toISOString()
        };
    }

    getApplicationsList() {
        const apps = [];
        const appDomains = {
            project: ['GitHub', 'GitLab', 'Jira', 'Asana', 'Trello', 'Monday.com', 'ClickUp', 'Notion', 'Linear'],
            meetings: ['Calendly', 'Doodle', 'Zoom', 'Teams', 'Google Meet', 'Webex'],
            commercial: ['Salesforce', 'HubSpot', 'Pipedrive', 'Dynamics 365', 'Zoho CRM'],
            finance: ['Stripe', 'PayPal', 'QuickBooks', 'Sage', 'SAP', 'Oracle'],
            hr: ['Workday', 'BambooHR', 'Indeed', 'LinkedIn Recruiter', 'Greenhouse', 'Lever'],
            support: ['Zendesk', 'Freshdesk', 'ServiceNow', 'Intercom', 'HelpScout'],
            internal: ['Slack', 'Teams', 'Discord', 'Confluence', 'SharePoint', 'Miro'],
            notifications: ['GitHub OAuth', 'DataDog', 'Sentry', 'PagerDuty', 'Zapier'],
            security: ['Auth0', 'Okta', '1Password', 'LastPass', 'Duo Security'],
            marketing_news: ['MailChimp', 'SendinBlue', 'Brevo', 'Constant Contact', 'HubSpot']
        };
        
        for (const [category, appList] of Object.entries(appDomains)) {
            appList.forEach(app => {
                apps.push({ category, application: app });
            });
        }
        
        return apps;
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this._normalizedTextCache.clear();
        this._analysisCache.clear();
        this.syncQueue = [];
        this.changeListeners.clear();
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
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();
window.CategoryManager = CategoryManager;

// Fonctions de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v27.0 Enhanced');
    
    const tests = [
        // Tests newsletters
        { 
            subject: "⛰️ Mission Kaizen : à chacun son Everest ! 🎾", 
            body: "Enchaîne les paris gagnants... 100 000 € de Freebets... Si vous souhaitez ne plus recevoir notre newsletter, cliquez ici.", 
            from: "newsletter@winamax.fr",
            expected: "marketing_news" 
        },
        { 
            subject: "Désactivation de votre alerte", 
            body: "Nous avons remarqué que vous n'utilisez plus votre alerte... Pour ne plus recevoir d'e-mail de ce type de notre part, cliquez ici", 
            from: "contact@jinka.fr",
            expected: "marketing_news" 
        },
        // Tests applications
        {
            subject: "Your pull request has been merged",
            body: "The pull request #123 has been successfully merged into main branch",
            from: "noreply@github.com",
            expected: "project"
        },
        {
            subject: "[Jira] Sprint 23 completed",
            body: "Sprint 23 has been completed with 15 story points delivered",
            from: "jira@company.atlassian.net",
            expected: "project"
        },
        {
            subject: "New Salesforce opportunity assigned",
            body: "A new opportunity has been assigned to you in Salesforce",
            from: "noreply@salesforce.com",
            expected: "commercial"
        },
        // Tests notifications
        {
            subject: "Thanks for applying to Booksy",
            body: "Your application for the Customer Support Outbound Specialist job was submitted successfully. Here's a copy of your application data for safekeeping... Powered by Workable",
            from: "noreply@candidates.workablemail.com",
            expected: "notifications"
        },
        {
            subject: "[GitHub] A third-party OAuth application has been added to your account",
            body: "A third-party OAuth application (MongoDB Atlas) with read:user and user:email scopes was recently authorized",
            from: "noreply@github.com",
            expected: "notifications"
        },
        // Tests meetings
        {
            subject: "Meeting scheduled via Calendly",
            body: "Your meeting has been confirmed via Calendly for tomorrow at 2pm",
            from: "notifications@calendly.com",
            expected: "meetings"
        },
        // Tests autres catégories
        { subject: "Nouvelle facture #12345 à payer avant le 31", expected: "finance" },
        { subject: "Action urgente requise: valider le document", expected: "tasks" },
        { subject: "Alerte sécurité: Nouvelle connexion détectée", expected: "security" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body || '', test.from || 'test@example.com', test.expected);
    });
    
    console.log('\n📊 Debug Info:', window.categoryManager.getDebugInfo());
    console.log('\n📱 Applications supportées:', window.categoryManager.getApplicationsList());
    
    console.groupEnd();
    
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v27.0 Enhanced loaded - Détection par applications métier intégrée');
