// CategoryManager.js - Version 25.0 - Détection newsletters complètement refaite
// Priorité absolue aux patterns de désabonnement et indicateurs newsletter

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation amélioré
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Cache pour optimisation
        this._normalizedTextCache = new Map();
        this._analysisCache = new Map();
        
        // Patterns de newsletters compilés pour performance
        this.newsletterPatterns = {
            unsubscribe: null,
            frequency: null,
            newsletter: null,
            marketing: null
        };
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.compileNewsletterPatterns();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 25.0 - Détection newsletters complètement refaite');
    }

    // ================================================
    // COMPILATION DES PATTERNS NEWSLETTER
    // ================================================
    compileNewsletterPatterns() {
        // Pattern de désabonnement très large
        this.newsletterPatterns.unsubscribe = new RegExp(
            'unsubscribe|se\\s*d[eé]sinscrire|d[eé]sinscrire|d[eé]sabonner|' +
            'opt\\s*out|opt-out|stop\\s*email|arr[eê]ter|ne\\s*plus\\s*recevoir|' +
            'g[eé]rer.*pr[eé]f[eé]rences|manage.*preferences|email\\s*preferences|' +
            'notification\\s*settings|update\\s*preferences|modifier.*pr[eé]f[eé]rences|' +
            'cliqu(?:e|ez)\\s*ici|click\\s*here|remove|retirer|supprimer.*email|' +
            'change\\s*email\\s*frequency|fr[eé]quence.*email|manage\\s*email|' +
            'email\\s*notifications|manage\\s*notifications',
            'i'
        );
        
        // Pattern de fréquence d'envoi
        this.newsletterPatterns.frequency = new RegExp(
            'receive\\s*these\\s*notifications|recevoir\\s*ces\\s*notifications|' +
            'email\\s*frequency|fr[eé]quence.*email|never|weekly|daily|monthly|' +
            'jamais|hebdomadaire|quotidien|mensuel|tous\\s*les|every|chaque',
            'i'
        );
        
        // Pattern d'indicateurs newsletter
        this.newsletterPatterns.newsletter = new RegExp(
            'newsletter|bulletin|infolettre|mailing\\s*list|liste\\s*de\\s*diffusion|' +
            'you\\s*received\\s*this\\s*email\\s*because|vous\\s*recevez\\s*ce.*email|' +
            'email\\s*marketing|campaign|notification|view.*online|voir.*en\\s*ligne|' +
            'trouble\\s*viewing|difficult[eé]s.*visualiser|si\\s*ce\\s*message|' +
            'if\\s*you\\s*can.*t\\s*see|recap|r[eé]cap|summary|sommaire|digest|' +
            'match(?:es|ing).*your.*(?:search|preferences)|correspond.*vos.*(?:crit[eè]res|pr[eé]f[eé]rences)',
            'i'
        );
        
        // Pattern marketing général
        this.newsletterPatterns.marketing = new RegExp(
            'offre\\s*sp[eé]ciale|special\\s*offer|promotion|promo|soldes|sale|' +
            'r[eé]duction|discount|nouveau\\s*produit|new\\s*product|lancement|' +
            'd[eé]couvr(?:ez|ir)|discover|exclusive|exclusif|limit[eé]|gratuit|free',
            'i'
        );
    }

    // ================================================
    // MÉTHODE D'ANALYSE PRINCIPALE - REFAITE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Vérifier le cache d'analyse
        const cacheKey = this.generateCacheKey(email);
        if (this._analysisCache.has(cacheKey)) {
            return this._analysisCache.get(cacheKey);
        }
        
        // Extraire TOUT le contenu disponible
        const content = this.extractCompleteContent(email);
        
        // PRIORITÉ 1: Détecter d'abord si c'est une newsletter
        const newsletterCheck = this.checkIfNewsletter(content);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📄 Analyse email:', {
                subject: email.subject?.substring(0, 50) + '...',
                from: email.from?.emailAddress?.address,
                isNewsletter: newsletterCheck.isNewsletter,
                newsletterScore: newsletterCheck.score,
                patterns: newsletterCheck.patterns
            });
        }
        
        // Si c'est clairement une newsletter, retourner directement
        if (newsletterCheck.isNewsletter && newsletterCheck.confidence >= 0.8) {
            const result = {
                category: 'marketing_news',
                score: newsletterCheck.score,
                confidence: newsletterCheck.confidence,
                matchedPatterns: newsletterCheck.patterns,
                hasAbsolute: true
            };
            
            this._analysisCache.set(cacheKey, result);
            return result;
        }
        
        // Sinon, analyser toutes les catégories
        const results = this.analyzeAllCategories(content);
        
        // Si newsletter a un bon score, augmenter ses chances
        if (results.marketing_news && newsletterCheck.score > 50) {
            results.marketing_news.score += newsletterCheck.score;
            results.marketing_news.confidence = Math.max(
                results.marketing_news.confidence,
                newsletterCheck.confidence
            );
            results.marketing_news.matchedPatterns.push(...newsletterCheck.patterns);
        }
        
        // Sélectionner la meilleure catégorie
        const bestResult = this.selectBestCategory(results);
        
        // Mettre en cache le résultat
        this._analysisCache.set(cacheKey, bestResult);
        
        // Nettoyer le cache si trop grand
        if (this._analysisCache.size > 1000) {
            const firstKey = this._analysisCache.keys().next().value;
            this._analysisCache.delete(firstKey);
        }
        
        return bestResult;
    }

    // ================================================
    // DÉTECTION SPÉCIFIQUE NEWSLETTER - NOUVELLE
    // ================================================
    checkIfNewsletter(content) {
        let score = 0;
        const patterns = [];
        let hasStrongIndicator = false;
        
        // Convertir tout en minuscules pour la recherche
        const fullTextLower = content.fullText.toLowerCase();
        const subjectLower = content.subject.toLowerCase();
        
        // 1. PATTERN CRITIQUE: Désabonnement (très fort indicateur)
        if (this.newsletterPatterns.unsubscribe.test(fullTextLower)) {
            score += 200;
            hasStrongIndicator = true;
            patterns.push({ type: 'critical', keyword: 'unsubscribe_pattern', score: 200 });
            
            // Bonus si dans un lien
            if (fullTextLower.match(/href[^>]*(?:unsubscribe|desinscrire|opt-out)/i)) {
                score += 50;
                patterns.push({ type: 'link', keyword: 'unsubscribe_link', score: 50 });
            }
        }
        
        // 2. PATTERN FORT: Gestion de fréquence
        if (this.newsletterPatterns.frequency.test(fullTextLower)) {
            score += 150;
            hasStrongIndicator = true;
            patterns.push({ type: 'strong', keyword: 'frequency_management', score: 150 });
        }
        
        // 3. PATTERN FORT: Indicateurs newsletter
        if (this.newsletterPatterns.newsletter.test(fullTextLower)) {
            score += 100;
            patterns.push({ type: 'strong', keyword: 'newsletter_indicator', score: 100 });
        }
        
        // 4. Domaine expéditeur typique
        if (content.domain) {
            const newsletterDomains = /news|newsletter|mail|email|marketing|campaign|mailchimp|sendgrid|mailgun|noreply|no-reply|notification|info|contact|hello|team/i;
            if (newsletterDomains.test(content.domain)) {
                score += 75;
                patterns.push({ type: 'domain', keyword: `newsletter_domain_${content.domain}`, score: 75 });
            }
        }
        
        // 5. Adresse expéditeur typique
        const fromEmail = content.fromEmail?.toLowerCase() || '';
        if (fromEmail.match(/^(no-?reply|noreply|newsletter|news|info|hello|contact|notification|team|support|marketing)@/i)) {
            score += 50;
            patterns.push({ type: 'sender', keyword: 'newsletter_sender', score: 50 });
        }
        
        // 6. Contenu marketing
        if (this.newsletterPatterns.marketing.test(fullTextLower)) {
            score += 30;
            patterns.push({ type: 'content', keyword: 'marketing_content', score: 30 });
        }
        
        // 7. Labels Gmail spécifiques
        if (content.labels && content.labels.length > 0) {
            if (content.labels.includes('CATEGORY_PROMOTIONS') || 
                content.labels.includes('CATEGORY_SOCIAL') ||
                content.labels.includes('CATEGORY_UPDATES')) {
                score += 100;
                hasStrongIndicator = true;
                patterns.push({ type: 'gmail_label', keyword: 'promotional_category', score: 100 });
            }
        }
        
        // 8. Patterns spécifiques détectés dans les exemples
        // Welcome to the Jungle
        if (fullTextLower.includes('matching your search') || 
            fullTextLower.includes('jobs matching') ||
            fullTextLower.includes('new match')) {
            score += 50;
            patterns.push({ type: 'specific', keyword: 'job_alerts', score: 50 });
        }
        
        // Fitness Park et autres récaps
        if (subjectLower.includes('recap') || subjectLower.includes('récap') ||
            fullTextLower.includes('ton récap') || fullTextLower.includes('votre récap')) {
            score += 50;
            patterns.push({ type: 'specific', keyword: 'recap_email', score: 50 });
        }
        
        // Calculer la confiance
        let confidence = 0;
        if (hasStrongIndicator) {
            confidence = Math.min(0.95, 0.5 + (score / 400));
        } else if (score >= 200) {
            confidence = 0.85;
        } else if (score >= 150) {
            confidence = 0.75;
        } else if (score >= 100) {
            confidence = 0.65;
        } else if (score >= 50) {
            confidence = 0.55;
        } else {
            confidence = score / 200;
        }
        
        return {
            isNewsletter: score >= 100 || hasStrongIndicator,
            score: score,
            confidence: confidence,
            patterns: patterns
        };
    }

    // ================================================
    // EXTRACTION COMPLÈTE DU CONTENU - AMÉLIORÉE
    // ================================================
    extractCompleteContent(email) {
        // Construire le texte complet pour l'analyse
        let fullText = '';
        let subject = email.subject || '';
        let bodyText = '';
        let hasUnsubscribeLinks = false;
        let hasNewsletterIndicators = false;
        
        // 1. PRIORITÉ ABSOLUE : Utiliser fullTextContent si disponible
        if (email.fullTextContent && email.fullTextContent.trim()) {
            fullText = email.fullTextContent;
        } else {
            // 2. FALLBACK : Construire le contenu manuellement
            
            // Sujet (très important, répété pour augmenter le poids)
            if (subject) {
                fullText += subject + ' ' + subject + ' ' + subject + '\n\n';
            }
            
            // Expéditeur
            if (email.from?.emailAddress) {
                const fromEmail = email.from.emailAddress.address || '';
                const fromName = email.from.emailAddress.name || '';
                fullText += `De: ${fromName} <${fromEmail}>\n`;
                
                // Ajouter le domaine de l'expéditeur
                if (fromEmail.includes('@')) {
                    const domain = fromEmail.split('@')[1];
                    fullText += `Domaine: ${domain}\n`;
                }
            }
            
            // Corps du message
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
            
            // Snippet Gmail
            if (email.gmailMetadata?.snippet && !fullText.includes(email.gmailMetadata.snippet)) {
                fullText += '\n' + email.gmailMetadata.snippet;
            }
        }
        
        // Extraire les informations importantes
        const fromEmail = email.from?.emailAddress?.address || '';
        const domain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : '';
        
        // Normaliser le texte pour l'analyse
        const normalizedText = this.normalizeText(fullText);
        
        return {
            fullText: fullText,
            normalizedText: normalizedText,
            subject: subject,
            bodyText: bodyText,
            domain: domain,
            fromEmail: fromEmail,
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            provider: email.provider || email.providerType || 'unknown',
            isReply: this.isReplyOrForward(subject),
            hasFullTextContent: !!email.fullTextContent,
            labels: email.labelIds || email.labels || []
        };
    }

    // ================================================
    // CALCUL DU SCORE PAR CATÉGORIE - AMÉLIORÉ
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.normalizedText;
        
        // Pour marketing_news, utiliser d'abord la détection spécialisée
        if (categoryId === 'marketing_news') {
            const newsletterCheck = this.checkIfNewsletter(content);
            if (newsletterCheck.isNewsletter) {
                totalScore = newsletterCheck.score;
                matches.push(...newsletterCheck.patterns);
                hasAbsolute = newsletterCheck.confidence >= 0.8;
            }
        }
        
        // Bonus de base selon le type d'email
        if (content.isReply) {
            if (['meetings', 'tasks', 'reminders'].includes(categoryId)) {
                totalScore += 10;
                matches.push({ type: 'context', keyword: 'reply_email', score: 10 });
            }
        }
        
        if (content.hasAttachments) {
            if (['finance', 'project', 'commercial'].includes(categoryId)) {
                totalScore += 15;
                matches.push({ type: 'context', keyword: 'has_attachment', score: 15 });
            }
        }
        
        if (content.importance === 'high') {
            if (['tasks', 'security', 'finance'].includes(categoryId)) {
                totalScore += 20;
                matches.push({ type: 'context', keyword: 'high_importance', score: 20 });
            }
        }
        
        // Analyser les mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ type: 'absolute', keyword: keyword, score: 100 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 50;
                        matches.push({ type: 'subject_bonus', keyword: keyword, score: 50 });
                    }
                }
            }
        }
        
        // Analyser les mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongCount = 0;
            for (const keyword of keywords.strong) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 40;
                    strongCount++;
                    matches.push({ type: 'strong', keyword: keyword, score: 40 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 20;
                        matches.push({ type: 'subject_bonus', keyword: keyword, score: 20 });
                    }
                }
            }
            
            // Bonus pour correspondances multiples
            if (strongCount >= 3) {
                totalScore += 30;
                matches.push({ type: 'multiple_strong', keyword: `${strongCount} strong matches`, score: 30 });
            }
        }
        
        // Analyser les mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakCount = 0;
            for (const keyword of keywords.weak) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 15;
                    weakCount++;
                    matches.push({ type: 'weak', keyword: keyword, score: 15 });
                }
            }
            
            // Bonus pour correspondances multiples
            if (weakCount >= 4) {
                totalScore += 20;
                matches.push({ type: 'multiple_weak', keyword: `${weakCount} weak matches`, score: 20 });
            }
        }
        
        // Appliquer les exclusions (très réduites pour marketing_news)
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findKeywordInText(text, exclusion)) {
                    // Pénalité très réduite pour marketing_news si indicateurs newsletter présents
                    const penalty = (categoryId === 'marketing_news' && totalScore > 150) ? -10 : -50;
                    totalScore += penalty;
                    matches.push({ type: 'exclusion', keyword: exclusion, score: penalty });
                }
            }
        }
        
        return {
            total: Math.max(0, totalScore),
            hasAbsolute: hasAbsolute,
            matches: matches
        };
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // Catégories principales
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, actualités et communications marketing',
                priority: 95, // Priorité très élevée
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
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures, paiements et documents financiers',
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
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion et suivi de projets',
                priority: 70,
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Support technique et assistance',
                priority: 60,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et administration',
                priority: 65,
                isCustom: false
            },
            
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
                priority: 100,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Communications internes d\'entreprise',
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
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 40,
                isCustom: false
            },
            
            // Catégorie spéciale pour les non-classés
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
    // INITIALISATION DES MOTS-CLÉS - SIMPLIFIÉE
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Détection principale via checkIfNewsletter()
            marketing_news: {
                absolute: [
                    // Les patterns critiques sont gérés dans checkIfNewsletter()
                    // On garde juste quelques mots-clés de backup
                    'newsletter', 'unsubscribe', 'se desinscrire'
                ],
                strong: [
                    'marketing', 'promotion', 'offre', 'solde'
                ],
                weak: [
                    'decouvrir', 'nouveau', 'actualite', 'info'
                ],
                exclusions: []  // Pas d'exclusions pour cette catégorie
            },

            // NOTIFICATIONS - Emails automatiques
            notifications: {
                absolute: [
                    'ne pas repondre', 'ne pas répondre', 'do not reply',
                    'no reply', 'noreply', 'donotreply', 'no-reply',
                    'message automatique', 'automated message', 'automatic email',
                    'notification automatique', 'system notification',
                    'ceci est un message automatique', 'this is an automated'
                ],
                strong: [
                    'notification', 'alerte', 'alert', 'avis', 'notice',
                    'statut', 'status', 'etat', 'état', 'state',
                    'confirmation', 'confirme', 'confirmé', 'confirmed',
                    'recu', 'reçu', 'received', 'traite', 'traité', 'processed',
                    'automatique', 'automatic', 'automated', 'systeme', 'système'
                ],
                weak: [
                    'information', 'message', 'update', 'mise a jour',
                    'changement', 'modification', 'evolution', 'évolution'
                ],
                exclusions: []
            },

            // HR - Ressources humaines (sans exclusion unsubscribe)
            hr: {
                absolute: [
                    'ressources humaines', 'human resources', 'rh', 'hr',
                    'contrat travail', 'contrat de travail', 'employment contract',
                    'bulletin paie', 'bulletin de paie', 'fiche paie', 'payslip',
                    'conge', 'congé', 'conges', 'congés', 'leave', 'vacation',
                    'entretien annuel', 'evaluation', 'évaluation', 'review',
                    'formation', 'training', 'stage', 'onboarding',
                    'recrutement', 'recruitment', 'embauche', 'hiring'
                ],
                strong: [
                    'salaire', 'salary', 'remuneration', 'rémunération',
                    'prime', 'bonus', 'avantage', 'benefit',
                    'employe', 'employé', 'employee', 'salarie', 'salarié',
                    'poste', 'position', 'fonction', 'role', 'job',
                    'carriere', 'carrière', 'career', 'evolution',
                    'competence', 'compétence', 'skill', 'qualification',
                    'candidat', 'candidate', 'talent', 'profil',
                    // Patterns job boards
                    'job match', 'emploi correspondant', 'offre emploi', 'job offer',
                    'opportunité', 'opportunity'
                ],
                weak: [
                    'equipe', 'équipe', 'team', 'personnel', 'staff',
                    'entreprise', 'company', 'societe', 'société',
                    'remote', 'télétravail', 'bureau', 'office'
                ],
                exclusions: []  // Pas d'exclusion pour permettre les job boards avec unsubscribe
            },

            // FINANCE - Termes financiers universels
            finance: {
                absolute: [
                    'facture', 'invoice', 'bill',
                    'paiement', 'payment', 'reglement', 'règlement',
                    'virement', 'transfer', 'wire transfer',
                    'remboursement', 'refund', 'credit', 'crédit',
                    'releve', 'relevé', 'statement', 'compte rendu',
                    'declaration', 'déclaration', 'declaration fiscale',
                    'commande numero', 'commande numéro', 'order number',
                    'numero commande', 'numéro commande', 'commande n',
                    'bon de commande', 'purchase order',
                    'devis', 'quote', 'quotation', 'estimation'
                ],
                strong: [
                    'montant', 'amount', 'somme', 'total',
                    'prix', 'price', 'cout', 'coût', 'cost',
                    'euro', 'euros', 'dollar', 'dollars',
                    'tva', 'taxe', 'tax', 'ht', 'ttc',
                    'echeance', 'échéance', 'due date', 'date limite',
                    'bancaire', 'bank', 'banque', 'compte',
                    'tresorerie', 'trésorerie', 'treasury', 'finance',
                    'comptabilite', 'comptabilité', 'accounting',
                    'budget', 'depense', 'dépense', 'expense'
                ],
                weak: [
                    'reference', 'référence', 'ref', 'numero', 'numéro',
                    'document', 'piece', 'pièce', 'justificatif',
                    'valider', 'validation', 'approuver', 'approval'
                ],
                exclusions: []
            },

            // TASKS - Actions requises universelles
            tasks: {
                absolute: [
                    'action requise', 'action required', 'action necessaire', 'action nécessaire',
                    'a faire', 'à faire', 'to do', 'todo',
                    'urgent', 'urgence', 'urgent action', 'tres urgent', 'très urgent',
                    'asap', 'des que possible', 'dès que possible', 'immediately',
                    'deadline', 'date limite', 'echeance', 'échéance',
                    'avant le', 'before', 'au plus tard',
                    'merci de', 'veuillez', 'please', 'priere de', 'prière de',
                    'completer', 'compléter', 'complete', 'remplir', 'fill',
                    'valider', 'validate', 'approuver', 'approve',
                    'corriger', 'correction', 'modifier', 'modification'
                ],
                strong: [
                    'urgent', 'urgence', 'priority', 'priorite', 'priorité',
                    'important', 'critique', 'critical', 'imperatif', 'impératif',
                    'action', 'tache', 'tâche', 'task', 'mission',
                    'demande', 'request', 'besoin', 'need', 'require',
                    'attente', 'waiting', 'en cours', 'pending',
                    'retard', 'delay', 'late', 'overdue',
                    'rappel', 'reminder', 'relance', 'follow up',
                    'reponse', 'réponse', 'response', 'retour', 'feedback'
                ],
                weak: [
                    'faire', 'do', 'realiser', 'réaliser', 'executer', 'exécuter',
                    'terminer', 'finir', 'complete', 'achever',
                    'traiter', 'process', 'gerer', 'gérer', 'handle'
                ],
                exclusions: []
            },

            // MEETINGS - Réunions tous contextes
            meetings: {
                absolute: [
                    'reunion', 'réunion', 'meeting', 'rendez vous', 'rendez-vous',
                    'invitation reunion', 'invitation réunion', 'meeting invitation',
                    'conference', 'conférence', 'call', 'appel', 'visio',
                    'teams', 'zoom', 'meet', 'skype', 'webex',
                    'salle de reunion', 'salle de réunion', 'meeting room',
                    'ordre du jour', 'agenda', 'planning',
                    'participer', 'join', 'rejoindre', 'assister'
                ],
                strong: [
                    'calendrier', 'calendar', 'agenda', 'planning', 'schedule',
                    'date', 'heure', 'hour', 'time', 'horaire',
                    'disponible', 'available', 'disponibilite', 'disponibilité',
                    'confirmer', 'confirm', 'confirmation', 'presence', 'présence',
                    'reporter', 'postpone', 'decaler', 'décaler', 'reschedule',
                    'annuler', 'cancel', 'annulation', 'cancellation',
                    'point', 'sujet', 'topic', 'discussion', 'debat', 'débat'
                ],
                weak: [
                    'rencontre', 'meet', 'voir', 'discuss', 'discuter',
                    'echanger', 'échanger', 'talk', 'parler', 'partager'
                ],
                exclusions: []
            },

            // COMMERCIAL - Opportunités business
            commercial: {
                absolute: [
                    'opportunite', 'opportunité', 'opportunity', 'occasion',
                    'proposition', 'proposal', 'offre commerciale',
                    'contrat', 'contract', 'accord', 'agreement',
                    'partenariat', 'partnership', 'collaboration',
                    'prospect', 'lead', 'client potentiel',
                    'negociation', 'négociation', 'negotiation',
                    'appel offre', 'appel d\'offre', 'tender', 'rfp'
                ],
                strong: [
                    'commercial', 'business', 'affaire', 'deal',
                    'vente', 'sale', 'achat', 'purchase', 'acquisition',
                    'client', 'customer', 'prospect', 'lead',
                    'marche', 'marché', 'market', 'secteur', 'industrie',
                    'strategie', 'stratégie', 'strategy', 'plan',
                    'objectif', 'target', 'but', 'goal',
                    'croissance', 'growth', 'developpement', 'développement',
                    'investissement', 'investment', 'roi', 'retour'
                ],
                weak: [
                    'interessant', 'intéressant', 'interesting', 'potentiel',
                    'possible', 'envisager', 'consider', 'etudier', 'étudier'
                ],
                exclusions: [
                    'facture', 'invoice', 'paiement'
                ]
            },

            // PROJECT - Gestion de projet
            project: {
                absolute: [
                    'projet', 'project', 'programme', 'program',
                    'milestone', 'jalon', 'etape', 'étape', 'phase',
                    'livrable', 'deliverable', 'rendu', 'resultat', 'résultat',
                    'sprint', 'iteration', 'itération', 'cycle',
                    'gantt', 'planning projet', 'roadmap', 'feuille de route',
                    'kick off', 'kickoff', 'lancement', 'demarrage', 'démarrage',
                    'retrospective', 'rétrospective', 'retro', 'bilan'
                ],
                strong: [
                    'avancement', 'progress', 'progression', 'statut', 'status',
                    'planning', 'plan', 'calendrier', 'timeline',
                    'equipe', 'équipe', 'team', 'ressource', 'resource',
                    'tache', 'tâche', 'task', 'activite', 'activité',
                    'risque', 'risk', 'issue', 'probleme', 'problème',
                    'budget', 'cout', 'coût', 'cost', 'delai', 'délai',
                    'validation', 'revue', 'review', 'point', 'suivi',
                    'performance', 'kpi', 'indicateur', 'métrique'
                ],
                weak: [
                    'document', 'fichier', 'file', 'dossier', 'rapport',
                    'mise a jour', 'update', 'evolution', 'changement'
                ],
                exclusions: []
            },

            // SUPPORT - Support technique
            support: {
                absolute: [
                    'ticket', 'incident', 'demande support', 'support request',
                    'probleme technique', 'problème technique', 'technical issue',
                    'bug', 'erreur', 'error', 'panne', 'dysfonctionnement',
                    'assistance', 'help desk', 'helpdesk', 'service desk',
                    'resolution', 'résolution', 'resolved', 'resolu', 'résolu',
                    'escalade', 'escalation', 'priorite', 'priorité'
                ],
                strong: [
                    'support', 'assistance', 'aide', 'help',
                    'technique', 'technical', 'informatique', 'it',
                    'probleme', 'problème', 'problem', 'issue',
                    'solution', 'resolution', 'résolution', 'fix',
                    'maintenance', 'depannage', 'dépannage', 'repair',
                    'diagnostic', 'analyse', 'investigation',
                    'utilisateur', 'user', 'client', 'demandeur'
                ],
                weak: [
                    'question', 'demande', 'request', 'besoin',
                    'fonctionnement', 'marche pas', 'not working'
                ],
                exclusions: []
            },

            // SECURITY - Sécurité informatique
            security: {
                absolute: [
                    'alerte securite', 'alerte sécurité', 'security alert',
                    'connexion suspecte', 'suspicious login', 'activite suspecte',
                    'mot de passe', 'password', 'mdp', 'code verification',
                    'authentification', 'authentication', '2fa', 'two factor',
                    'compte bloque', 'compte bloqué', 'account locked',
                    'tentative connexion', 'login attempt', 'acces refuse',
                    'violation securite', 'security breach', 'intrusion'
                ],
                strong: [
                    'securite', 'sécurité', 'security', 'protection',
                    'verification', 'vérification', 'verify', 'confirmer',
                    'identite', 'identité', 'identity', 'authentifier',
                    'acces', 'accès', 'access', 'autorisation',
                    'suspicieux', 'suspicious', 'inhabituel', 'unusual',
                    'bloquer', 'block', 'verrouiller', 'lock',
                    'risque', 'risk', 'menace', 'threat', 'danger'
                ],
                weak: [
                    'compte', 'account', 'profil', 'profile',
                    'connexion', 'login', 'session', 'utilisateur'
                ],
                exclusions: []
            },

            // INTERNAL - Communications internes
            internal: {
                absolute: [
                    'communication interne', 'internal communication',
                    'note service', 'note de service', 'memo',
                    'tout le personnel', 'all staff', 'tous les employes',
                    'annonce entreprise', 'company announcement',
                    'information generale', 'information générale',
                    'a tous', 'à tous', 'to all', 'pour tous'
                ],
                strong: [
                    'interne', 'internal', 'entreprise', 'company',
                    'organisation', 'organization', 'societe', 'société',
                    'personnel', 'staff', 'employes', 'employés',
                    'direction', 'management', 'comite', 'comité',
                    'politique', 'policy', 'procedure', 'procédure',
                    'changement', 'change', 'evolution', 'évolution'
                ],
                weak: [
                    'information', 'annonce', 'announcement', 'nouvelle',
                    'mise a jour', 'update', 'communication'
                ],
                exclusions: [
                    'client', 'customer', 'externe', 'external'
                ]
            },

            // REMINDERS - Relances et suivis
            reminders: {
                absolute: [
                    'rappel', 'reminder', 'relance', 'follow up',
                    'suite a', 'suite à', 'following', 'concernant',
                    'comme convenu', 'as agreed', 'as discussed',
                    'je reviens vers', 'i follow up', 'circling back',
                    'point suivi', 'point de suivi', 'status update'
                ],
                strong: [
                    'rappeler', 'remind', 'relancer', 'suivre',
                    'attente', 'waiting', 'pending', 'en cours',
                    'retour', 'feedback', 'reponse', 'réponse',
                    'precedent', 'précédent', 'previous', 'dernier',
                    'encore', 'still', 'toujours', 'always'
                ],
                weak: [
                    'point', 'suivi', 'follow', 'suite',
                    'message', 'mail', 'email', 'courrier'
                ],
                exclusions: [
                    'premiere', 'première', 'first', 'nouveau',
                    'initial', 'introduction'
                ]
            },

            // CC - Emails en copie
            cc: {
                absolute: [
                    'pour information', 'for information', 'fyi',
                    'en copie', 'in copy', 'cc pour info',
                    'copie pour information', 'courtesy copy'
                ],
                strong: [
                    'information', 'info', 'copie', 'copy',
                    'cc', 'cci', 'bcc', 'connaissance'
                ],
                weak: [
                    'transmettre', 'forward', 'partager', 'share'
                ],
                exclusions: [
                    'action', 'urgent', 'faire', 'repondre',
                    'valider', 'approuver'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés optimisés pour détection newsletters');
    }

    // ================================================
    // NORMALISATION DU TEXTE - AMÉLIORÉE
    // ================================================
    normalizeText(text) {
        if (!text) return '';
        
        // Vérifier le cache
        if (this._normalizedTextCache.has(text)) {
            return this._normalizedTextCache.get(text);
        }
        
        // Normaliser complètement
        let normalized = text.toLowerCase()
            // Normaliser les caractères Unicode
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            // Remplacer les accents
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            // Remplacer les apostrophes
            .replace(/[''`]/g, "'")
            // Remplacer les tirets par des espaces
            .replace(/[-–—_]/g, ' ')
            // Remplacer les retours à la ligne par des espaces
            .replace(/[\r\n]+/g, ' ')
            // Supprimer la ponctuation sauf les points (pour les URLs)
            .replace(/[,;:!?()[\]{}«»""]/g, ' ')
            // Normaliser les espaces multiples
            .replace(/\s+/g, ' ')
            .trim();
        
        // Mettre en cache
        this._normalizedTextCache.set(text, normalized);
        
        // Nettoyer le cache si trop grand
        if (this._normalizedTextCache.size > 500) {
            const firstKey = this._normalizedTextCache.keys().next().value;
            this._normalizedTextCache.delete(firstKey);
        }
        
        return normalized;
    }

    // ================================================
    // RECHERCHE DE MOTS-CLÉS AMÉLIORÉE
    // ================================================
    findKeywordInText(text, keyword) {
        if (!text || !keyword) return false;
        
        // Normaliser le mot-clé aussi
        const normalizedKeyword = this.normalizeText(keyword);
        
        // Recherche simple
        if (text.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec limites de mots
        const wordBoundaryPattern = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        return wordBoundaryPattern.test(text);
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE - AMÉLIORÉE
    // ================================================
    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 25;
        const MIN_CONFIDENCE_THRESHOLD = 0.4;  // Réduit pour permettre plus de flexibilité
        
        // Filtrer les résultats valides
        const validResults = Object.values(results)
            .filter(r => r.category !== 'other' && r.score >= MIN_SCORE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched'
            };
        }
        
        // Trier par priorité et score
        validResults.sort((a, b) => {
            // Priorité aux matches absolus
            if (a.hasAbsolute && !b.hasAbsolute) return -1;
            if (!a.hasAbsolute && b.hasAbsolute) return 1;
            
            // Puis par score
            if (a.score !== b.score) return b.score - a.score;
            
            // Puis par priorité de catégorie
            return b.priority - a.priority;
        });
        
        const best = validResults[0];
        
        // Pour marketing_news, être plus permissif
        if (best.category === 'marketing_news' && best.score >= MIN_SCORE_THRESHOLD) {
            return {
                category: best.category,
                score: best.score,
                confidence: Math.max(best.confidence, 0.6),
                matchedPatterns: best.matches,
                hasAbsolute: best.hasAbsolute
            };
        }
        
        if (best.confidence < MIN_CONFIDENCE_THRESHOLD && !best.hasAbsolute) {
            return {
                category: 'other',
                score: best.score,
                confidence: best.confidence,
                matchedPatterns: best.matches,
                hasAbsolute: false,
                reason: 'low_confidence'
            };
        }
        
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Analyser chaque catégorie
        for (const categoryId of activeCategories) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords) continue;
            
            const score = this.calculateCategoryScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                hasAbsolute: score.hasAbsolute,
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        // Toujours inclure "other" comme option
        results.other = {
            category: 'other',
            score: 0,
            matches: [],
            confidence: 0,
            hasAbsolute: false,
            priority: 0
        };
        
        return results;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 70) return 0.75;
        if (score.total >= 50) return 0.70;
        if (score.total >= 30) return 0.60;
        return 0.50;
    }

    isReplyOrForward(subject) {
        if (!subject) return false;
        const patterns = /^(re:|fwd:|fw:|tr:|ref:|re :|fwd :|fw :|tr :|ref :)/i;
        return patterns.test(subject);
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
                
                // Ajouter les catégories personnalisées
                Object.entries(this.customCategories).forEach(([id, category]) => {
                    this.categories[id] = {
                        ...category,
                        isCustom: true,
                        priority: category.priority || 30
                    };
                    
                    // Ajouter les mots-clés personnalisés
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
        // Notifier les listeners
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification listener:', error);
            }
        });
        
        // Dispatch event
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
        // Vérifier les changements toutes les 2 secondes
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
        if (this.eventListenersSetup) return;
        
        // Écouter les changements externes
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.source !== 'CategoryManager') {
                this.syncQueue.push({
                    type: event.detail.type,
                    value: event.detail.value
                });
            }
        });
        
        this.eventListenersSetup = true;
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    testEmail(subject, body = '', from = 'test@example.com', expectedCategory = null) {
        const testEmail = {
            subject: subject,
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

    getCategoryStats() {
        const stats = {};
        Object.keys(this.categories).forEach(catId => {
            const keywords = this.weightedKeywords[catId];
            stats[catId] = {
                name: this.categories[catId].name,
                absolute: keywords?.absolute?.length || 0,
                strong: keywords?.strong?.length || 0,
                weak: keywords?.weak?.length || 0,
                exclusions: keywords?.exclusions?.length || 0,
                total: (keywords?.absolute?.length || 0) + 
                       (keywords?.strong?.length || 0) + 
                       (keywords?.weak?.length || 0)
            };
        });
        return stats;
    }

    getDebugInfo() {
        return {
            version: '25.0',
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

// Attendre que le DOM soit chargé si nécessaire
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[CategoryManager] DOM chargé, module prêt');
    });
}

// Exposer globalement pour éviter les problèmes de timing
window.CategoryManager = CategoryManager;

// Fonctions de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v25.0');
    
    const tests = [
        { 
            subject: "New match: Associate Customer Success Manager at Hostaway", 
            body: "There are new jobs matching your search preferences! You received this email because you subscribed. Unsubscribe from these notifications.", 
            expected: "marketing_news" 
        },
        { 
            subject: "Ton récap' du mois 📝", 
            body: "Hello! Voici ton récap du mois. Si tu ne souhaites plus recevoir les informations de notre part, clique-ici.", 
            expected: "marketing_news" 
        },
        { subject: "Nouvelle facture #12345 à payer avant le 31", expected: "finance" },
        { subject: "Action urgente requise: valider le document", expected: "tasks" },
        { subject: "Invitation réunion Teams demain 14h", expected: "meetings" },
        { subject: "Newsletter hebdomadaire - Se désinscrire", expected: "marketing_news" },
        { subject: "Alerte sécurité: Nouvelle connexion détectée", expected: "security" },
        { subject: "Votre candidature chez ABC Corp", expected: "notifications" },
        { subject: "Opportunité de partenariat avec votre entreprise", expected: "commercial" },
        { subject: "Rappel: Suite à notre échange de la semaine dernière", expected: "reminders" },
        { subject: "Ticket #45678 - Problème résolu", expected: "support" },
        { subject: "Note de service: Changement d'horaires", expected: "internal" },
        { subject: "Bulletin de paie Janvier 2024", expected: "hr" },
        { subject: "Avancement projet Alpha - Sprint 3", expected: "project" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body || '', test.expected);
    });
    
    console.log('\n📊 Statistiques des mots-clés:');
    console.table(window.categoryManager.getCategoryStats());
    
    console.log('\n🔍 Debug Info:', window.categoryManager.getDebugInfo());
    
    console.groupEnd();
    
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v25.0 loaded - Détection newsletters complètement refaite');
