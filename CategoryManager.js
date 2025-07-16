// CategoryManager.js - Version 26.0 - Détection newsletter ultra-renforcée
// Mots-clés densifiés et patterns optimisés

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
            notification: null
        };
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.compilePatterns();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 26.0 - Détection ultra-renforcée');
    }

    // ================================================
    // COMPILATION DES PATTERNS
    // ================================================
    compilePatterns() {
        // Pattern de désabonnement ULTRA-LARGE
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
            'vous\\s*(?:pouvez|souhaitez).*(?:d[eé]sabonner|ne\\s*plus)|' +
            'si\\s*vous.*(?:souhaitez|voulez).*(?:ne\\s*plus|arr[eê]ter)|' +
            'pour\\s*(?:ne\\s*plus|arr[eê]ter|cesser).*recevoir|' +
            'no\\s*longer\\s*(?:wish|want).*receive|stop\\s*receiving|' +
            'r[eé]silier|annuler.*(?:inscription|abonnement)|cancel.*subscription',
            'i'
        );
        
        // Pattern newsletter/marketing
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
            'monthly|mensuel|daily|quotidien|p[eé]riodique|r[eé]gulier',
            'i'
        );
        
        // Pattern marketing agressif
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
            'freebet|bonus.*(?:sport|pari|casino)|mission|d[eé]fi|challenge',
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
            'r[eé]ponse\\s*automatique|auto\\s*reply|out\\s*of\\s*office',
            'i'
        );
    }

    // ================================================
    // ANALYSE D'EMAIL PRINCIPALE - REFAITE
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
        
        // Analyse multi-passes
        const newsletterScore = this.detectNewsletter(content);
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
    // DÉTECTION NEWSLETTER ULTRA-AGRESSIVE
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
            if (textLower.match(/<a[^>]*>[^<]*(?:d[eé]sabonner|unsubscribe|cliquez\\s*ici)[^<]*<\/a>/i)) {
                score += 100;
                patterns.push({ type: 'critical', keyword: 'unsubscribe_link', score: 100 });
            }
        }
        
        // Patterns spécifiques EDF et conseillers
        if (textLower.match(/votre conseiller|espace client|decouvrez.*avantages|suivre.*conso|telecharger.*appli/i)) {
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
        
        // 2. PATTERNS D'EXCLUSION POUR CANDIDATURES
        const isCandidature = textLower.match(/votre candidature|your application|suite favorable|pas retenue|thank you for your.*application/i);
        const isFromRecruiter = fromEmail.match(/recrutement|recruiting|recruitment|talent|rh|hr|candidat/i) || 
                                content.fromName?.toLowerCase().match(/recrutement|recruiting|talent/i);
        
        if (isCandidature && !this.compiledPatterns.unsubscribe.test(textLower)) {
            // C'est une vraie notification de candidature, pas une newsletter
            score -= 500;
            patterns.push({ type: 'exclusion', keyword: 'genuine_application_response', score: -500 });
            return {
                isDefiniteNewsletter: false,
                score: 0,
                confidence: 0,
                patterns: patterns
            };
        }
        
        // 3. DOMAINES TYPIQUES
        const domain = content.domain?.toLowerCase() || '';
        
        // Domaines newsletter évidents
        if (domain.match(/news|newsletter|mail|marketing|campaign|notification|info|contact|noreply|no-reply/i)) {
            score += 100;
            patterns.push({ type: 'domain', keyword: `newsletter_domain_${domain}`, score: 100 });
        }
        
        // Domaines d'entreprises avec newsletters (comme relation-client-edf.fr)
        if (domain.match(/relation-client|customer-service|client-info|info-client/i)) {
            score += 150;
            patterns.push({ type: 'domain', keyword: 'customer_communication_domain', score: 150 });
        }
        
        // Sous-domaines marketing
        if (domain.includes('.') && domain.match(/^(news|newsletter|email|mail|marketing|info|contact)\./i)) {
            score += 150;
            patterns.push({ type: 'domain', keyword: 'marketing_subdomain', score: 150 });
            isDefiniteNewsletter = true;
        }
        
        // 4. EXPÉDITEUR
        
        // Emails typiques newsletter
        if (fromEmail.match(/newsletter|news|marketing|info|contact|noreply|notification|alert|update|promo|conseiller|relation-client/i)) {
            score += 100;
            patterns.push({ type: 'sender', keyword: 'newsletter_sender', score: 100 });
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
        
        // Patterns de paris/jeux
        if (textLower.match(/pari|bet|mise|freebet|bonus|mission|jackpot|casino|jouer|gagner/i)) {
            score += 150;
            patterns.push({ type: 'content', keyword: 'gambling_content', score: 150 });
            isDefiniteNewsletter = true;
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
        if (score >= 400 || (score >= 300 && domain.includes('newsletter'))) {
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
    // MOTS-CLÉS DENSIFIÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Hyper-dense
            marketing_news: {
                absolute: [
                    'newsletter', 'unsubscribe', 'se desabonner', 'se desinscrire',
                    'cliquez ici', 'click here', 'ne plus recevoir', 'stop email',
                    'manage preferences', 'gerer preferences', 'email preferences',
                    'vous recevez ce', 'you received this', 'bulk email',
                    'desabonnement', 'choisir quels emails', 'pour vous desabonner',
                    'espace client', 'votre conseiller', 'decouvrez avantages'
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
                    'telecharger', 'adopter', 'rendez-vous', 'prochain'
                ],
                weak: [
                    'profitez', 'beneficiez', 'advantage', 'opportunite',
                    'inscrivez', 'subscribe', 'membre', 'member', 'club',
                    'actualite', 'article', 'blog', 'contenu', 'content',
                    'conseil', 'astuce', 'solution', 'service'
                ],
                exclusions: [] // Aucune exclusion pour cette catégorie
            },

            // FINANCE - Dense et précis
            finance: {
                absolute: [
                    'facture', 'invoice', 'paiement', 'payment', 'virement',
                    'remboursement', 'refund', 'releve bancaire', 'bank statement',
                    'devis', 'quote', 'commande numero', 'order number',
                    'montant du', 'montant total', 'total amount', 'a payer',
                    'reglement facture', 'payer facture', 'facture a regler'
                ],
                strong: [
                    'montant', 'amount', 'euro', 'dollar', 'prix', 'price',
                    'cout', 'cost', 'tva', 'tax', 'ht', 'ttc', 'total',
                    'echeance', 'due date', 'date limite', 'deadline',
                    'bancaire', 'bank', 'compte', 'account', 'carte',
                    'tresorerie', 'treasury', 'comptabilite', 'accounting',
                    'budget', 'depense', 'expense', 'frais', 'fees',
                    'iban', 'virement', 'prelevement', 'cheque'
                ],
                weak: [
                    'reference', 'numero', 'document', 'piece jointe',
                    'valider', 'validation', 'approuver', 'approval'
                ],
                exclusions: ['newsletter', 'promotion', 'offre speciale', 'decouvrez', 'conseiller', 'espace client']
            },

            // SECURITY - Haute priorité
            security: {
                absolute: [
                    'alerte securite', 'security alert', 'connexion suspecte',
                    'suspicious login', 'mot de passe', 'password', 'code verification',
                    'verification code', '2fa', 'two factor', 'authentification',
                    'compte bloque', 'account locked', 'activite inhabituelle'
                ],
                strong: [
                    'securite', 'security', 'verification', 'verify', 'confirmer',
                    'identite', 'identity', 'acces', 'access', 'autorisation',
                    'suspicieux', 'suspicious', 'inhabituel', 'unusual',
                    'bloquer', 'block', 'verrouiller', 'lock', 'proteger',
                    'risque', 'risk', 'menace', 'threat', 'fraude', 'fraud'
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

            // MEETINGS - Réunions
            meetings: {
                absolute: [
                    'reunion', 'meeting', 'rendez-vous', 'appointment',
                    'invitation reunion', 'meeting invitation', 'conference',
                    'call', 'visio', 'teams', 'zoom', 'meet', 'webex'
                ],
                strong: [
                    'calendrier', 'calendar', 'agenda', 'planning', 'schedule',
                    'date', 'heure', 'time', 'horaire', 'disponible',
                    'available', 'disponibilite', 'availability', 'confirmer',
                    'confirm', 'reporter', 'postpone', 'reschedule', 'annuler'
                ],
                weak: [
                    'rencontre', 'voir', 'discuter', 'talk', 'echanger'
                ],
                exclusions: ['webinar marketing', 'conference commerciale', 'candidature', 'application']
            },

            // COMMERCIAL - B2B
            commercial: {
                absolute: [
                    'opportunite', 'opportunity', 'proposition commerciale',
                    'business proposal', 'contrat', 'contract', 'partenariat',
                    'partnership', 'appel offre', 'tender', 'rfp', 'devis'
                ],
                strong: [
                    'commercial', 'business', 'affaire', 'deal', 'vente',
                    'sale', 'client', 'customer', 'prospect', 'lead',
                    'marche', 'market', 'strategie', 'strategy', 'croissance',
                    'growth', 'developpement', 'development', 'roi', 'investissement'
                ],
                weak: [
                    'interessant', 'potentiel', 'envisager', 'consider'
                ],
                exclusions: ['newsletter', 'promotion personnelle', 'candidature', 'votre candidature', 'suite favorable']
            },

            // NOTIFICATIONS - Automatiques
            notifications: {
                absolute: [
                    'no reply', 'noreply', 'ne pas repondre', 'do not reply',
                    'notification automatique', 'automated notification',
                    'message automatique', 'automated message',
                    'candidature retenue', 'candidature pas retenue',
                    'thank you for your application', 'merci pour votre candidature',
                    'nous avons recu votre candidature', 'received your application',
                    'suite favorable', 'pas de suite favorable'
                ],
                strong: [
                    'notification', 'alert', 'alerte', 'avis', 'notice',
                    'statut', 'status', 'confirmation', 'confirme',
                    'automatique', 'automated', 'systeme', 'system',
                    'candidature', 'application', 'postulation',
                    'reponse automatique', 'automated response',
                    'accusé reception', 'acknowledgment'
                ],
                weak: [
                    'information', 'update', 'mise a jour', 'changement',
                    'merci', 'thank you', 'cordialement', 'regards'
                ],
                exclusions: ['action requise', 'urgent', 'newsletter', 'rendez-vous', 'reunion']
            },

            // HR - Ressources humaines
            hr: {
                absolute: [
                    'ressources humaines', 'human resources', 'contrat travail',
                    'employment contract', 'bulletin paie', 'payslip',
                    'conge', 'leave', 'entretien annuel', 'annual review'
                ],
                strong: [
                    'salaire', 'salary', 'remuneration', 'prime', 'bonus',
                    'employe', 'employee', 'poste', 'position', 'carriere',
                    'career', 'formation', 'training', 'recrutement',
                    'candidat', 'candidate', 'entretien', 'interview'
                ],
                weak: [
                    'equipe', 'team', 'entreprise', 'company', 'bureau'
                ],
                exclusions: []
            },

            // PROJECT - Gestion de projet
            project: {
                absolute: [
                    'projet', 'project', 'milestone', 'jalon', 'livrable',
                    'deliverable', 'sprint', 'roadmap', 'gantt', 'kick off'
                ],
                strong: [
                    'avancement', 'progress', 'planning', 'timeline', 'equipe',
                    'team', 'tache', 'task', 'risque', 'risk', 'budget',
                    'validation', 'review', 'suivi', 'tracking', 'kpi'
                ],
                weak: [
                    'document', 'fichier', 'rapport', 'update'
                ],
                exclusions: ['newsletter projet', 'candidature', 'votre candidature', 'suite favorable']
            },

            // SUPPORT - Technique
            support: {
                absolute: [
                    'ticket', 'incident', 'demande support', 'support request',
                    'probleme technique', 'technical issue', 'bug', 'erreur',
                    'panne', 'helpdesk', 'service desk'
                ],
                strong: [
                    'support', 'assistance', 'aide', 'help', 'technique',
                    'technical', 'probleme', 'problem', 'solution', 'resolu',
                    'resolved', 'maintenance', 'depannage', 'diagnostic'
                ],
                weak: [
                    'question', 'demande', 'besoin', 'fonctionnement'
                ],
                exclusions: ['support commercial', 'newsletter']
            },

            // INTERNAL - Communications internes
            internal: {
                absolute: [
                    'communication interne', 'internal communication',
                    'note service', 'memo', 'tout le personnel', 'all staff',
                    'annonce entreprise', 'company announcement'
                ],
                strong: [
                    'interne', 'internal', 'entreprise', 'company', 'personnel',
                    'staff', 'employes', 'direction', 'management', 'politique',
                    'policy', 'procedure', 'changement organisationnel'
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

        console.log('[CategoryManager] ✅ Mots-clés densifiés chargés');
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
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            version: '26.0',
            categoriesCount: Object.keys(this.categories).length,
            customCategoriesCount: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            taskPreselectedCategories: this.settings.taskPreselectedCategories,
            cacheSize: {
                normalizedText: this._normalizedTextCache.size,
                analysis: this._analysisCache.size
            },
            syncQueue: this.syncQueue.length,
            lastSync: new Date(this.lastSyncTimestamp).toISOString()
        };
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
    console.group('🧪 TEST CategoryManager v26.0');
    
    const tests = [
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
        { 
            subject: "Sahar : un nouveau poste correspond à votre profil",
            body: "Strategic Project Manager (F/H) - CDI - Paris... Se désabonner | Supprimer mes données",
            from: "no-reply@sahar.teamtailor-mail.com",
            expected: "marketing_news"
        },
        { 
            subject: "[GitHub] A third-party OAuth application has been added to your account",
            body: "A third-party OAuth application (MongoDB Atlas) with read:user and user:email scopes was recently authorized",
            from: "noreply@github.com",
            expected: "notifications"
        },
        { subject: "Nouvelle facture #12345 à payer avant le 31", expected: "finance" },
        { subject: "Action urgente requise: valider le document", expected: "tasks" },
        { subject: "Invitation réunion Teams demain 14h", expected: "meetings" },
        { subject: "Alerte sécurité: Nouvelle connexion détectée", expected: "security" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body || '', test.from || 'test@example.com', test.expected);
    });
    
    console.log('\n📊 Debug Info:', window.categoryManager.getDebugInfo());
    
    console.groupEnd();
    
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v26.0 loaded - Détection newsletter ultra-renforcée');
