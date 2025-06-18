// CategoryManager.js - Version 26.0 - CORRECTION TOTALE CATÉGORISATION 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Cache optimisé
        this.analysisCache = new Map();
        this.cacheMaxSize = 1000; // Réduit pour économiser mémoire
        this.cacheTTL = 300000;
        this.cacheStats = { hits: 0, misses: 0 };
        
        // Synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 26.0 - Correction TOTALE catégorisation');
    }

    // ================================================
    // EXTRACTION DE CONTENU OPTIMISÉE
    // ================================================
    extractCompleteContent(email) {
        const parts = [];
        
        // Sujet avec pondération équilibrée
        if (email.subject?.trim()) {
            parts.push(email.subject.trim());
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address);
        }
        
        if (email.from?.emailAddress?.name) {
            parts.push(email.from.emailAddress.name);
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            parts.push(email.bodyPreview);
        }
        
        if (email.body?.content) {
            const cleanContent = this.fastHtmlClean(email.body.content);
            parts.push(cleanContent);
        }
        
        const rawText = parts.join(' ');
        const normalizedText = this.fastNormalize(rawText);
        
        return {
            text: normalizedText,
            subject: this.fastNormalize(email.subject || ''),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            senderName: this.fastNormalize(email.from?.emailAddress?.name || ''),
            senderEmail: email.from?.emailAddress?.address?.toLowerCase() || '',
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: normalizedText.length,
            rawSubject: email.subject || '',
            rawSenderName: email.from?.emailAddress?.name || ''
        };
    }

    fastNormalize(text) {
        if (!text) return '';
        return text.toLowerCase()
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s@.-]/g, ' ')
            .trim();
    }

    fastHtmlClean(html) {
        if (!html) return '';
        return html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/p>/gi, ' ')
            .replace(/<\/div>/gi, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        const parts = email.split('@');
        return parts[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // ANALYSE EMAIL CORRIGÉE - ÉQUILIBRÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Cache check
        const cached = this.getCachedAnalysis(email);
        if (cached) {
            this.cacheStats.hits++;
            return cached;
        }
        
        this.cacheStats.misses++;
        
        // Vérifications rapides
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            const result = { category: 'spam', score: 0, confidence: 0, isSpam: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        const content = this.extractCompleteContent(email);
        
        if (this.isGloballyExcluded(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Détection personnelle
        if (this.isPersonalEmail(content)) {
            const result = {
                category: this.categories.personal ? 'personal' : 'excluded',
                score: 100,
                confidence: 0.95,
                isPersonal: true
            };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Analyse CC
        const ccResult = this.analyzeCC(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // ANALYSE PRINCIPALE ÉQUILIBRÉE
        const result = this.analyzeAllCategoriesBalanced(content, email);
        
        this.setCachedAnalysis(email, result);
        return result;
    }

    // ================================================
    // ANALYSE ÉQUILIBRÉE TOUTES CATÉGORIES
    // ================================================
    analyzeAllCategoriesBalanced(content, email) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Analyser TOUTES les catégories sans favoritisme
        for (const categoryId of activeCategories) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScoreEquilibrated(content, keywords, categoryId);
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categories[categoryId]?.priority || 50
                };
            }
        }
        
        return this.selectBestCategoryStrict(results);
    }

    // ================================================
    // CALCUL DE SCORE ÉQUILIBRÉ - ANTI-NEWSLETTER BIAS
    // ================================================
    calculateScoreEquilibrated(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Bonus de base équilibré
        const categoryBonus = this.getCategoryBonusEquilibrated(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // PÉNALITÉ FORTE pour newsletter si pas de mots-clés spécifiques
        if (categoryId === 'marketing_news') {
            // Vérifier si c'est VRAIMENT du marketing
            const marketingIndicators = [
                'unsubscribe', 'désabonner', 'newsletter', 'mailing list',
                'email preferences', 'promotional', 'marketing email'
            ];
            
            const hasRealMarketingKeywords = marketingIndicators.some(indicator => 
                text.includes(indicator.toLowerCase())
            );
            
            if (!hasRealMarketingKeywords) {
                totalScore -= 100; // Pénalité sévère
                matches.push({ keyword: 'not_real_marketing', type: 'penalty', score: -100 });
            }
        }
        
        // Pénalité pour contenu personnel dans catégories pro
        if (this.hasPersonalContent(text) && this.isProfessionalCategory(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_penalty', type: 'penalty', score: -50 });
        }
        
        // Test exclusions
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.fastTextSearch(text, exclusion)) {
                    totalScore -= 60;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -60 });
                }
            }
        }
        
        // Test mots-clés absolus avec scores normalisés
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.fastTextSearch(text, keyword)) {
                    const absoluteScore = 100; // Score uniforme pour tous
                    totalScore += absoluteScore;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: absoluteScore });
                    
                    // Bonus sujet modéré
                    if (this.fastTextSearch(content.subject, keyword)) {
                        totalScore += 30;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: 30 });
                    }
                }
            }
        }
        
        // Test mots-clés forts
        if (keywords.strong?.length) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 40; // Score uniforme
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    if (strongMatches >= 3) break;
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
            }
        }
        
        // Test mots-clés faibles (très limité)
        if (!hasAbsolute && totalScore < 100 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 5)) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                    
                    if (weakMatches >= 3) break;
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
    // BONUS CATÉGORIE ÉQUILIBRÉS
    // ================================================
    getCategoryBonusEquilibrated(categoryId) {
        const bonuses = {
            'security': 25,      // Priorité élevée
            'finance': 22,       // Important
            'tasks': 28,         // Priorité max
            'meetings': 20,      // Important
            'commercial': 18,    // Modéré
            'project': 20,       // Important
            'hr': 18,           // Modéré
            'support': 16,       // Modéré
            'reminders': 15,     // Modéré
            'internal': 14,      // Modéré
            'notifications': 10, // Bas
            'marketing_news': 5, // TRÈS BAS pour éviter domination
            'cc': 12            // Modéré
        };
        return bonuses[categoryId] || 0;
    }

    // ================================================
    // SÉLECTION STRICTE DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategoryStrict(results) {
        // SEUILS TRÈS STRICTS pour éviter newsletter dominance
        const MIN_SCORE_THRESHOLD = 60; // Augmenté significativement
        const MIN_CONFIDENCE_THRESHOLD = 0.65; // Augmenté
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'below_threshold'
            };
        }
        
        // Tri priorité > score
        validResults.sort((a, b) => {
            // Priorité des mots absolus
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            
            // Priorité catégorie
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            
            // Score en dernier
            return b.score - a.score;
        });
        
        const best = validResults[0];
        
        // VÉRIFICATION SPÉCIALE ANTI-NEWSLETTER
        if (best.category === 'marketing_news') {
            // Si newsletter, vérifier qu'elle a vraiment des mots-clés marketing
            const hasRealMarketingWords = best.matches.some(match => 
                match.type === 'absolute' && [
                    'unsubscribe', 'désabonner', 'newsletter', 'mailing list',
                    'email preferences', 'promotional email'
                ].includes(match.keyword.toLowerCase())
            );
            
            if (!hasRealMarketingWords || best.score < 80) {
                // Chercher une alternative
                const alternatives = validResults.filter(r => 
                    r.category !== 'marketing_news' && r.score >= 40
                );
                
                if (alternatives.length > 0) {
                    const alt = alternatives[0];
                    return {
                        category: alt.category,
                        score: alt.score,
                        confidence: alt.confidence,
                        matchedPatterns: alt.matches,
                        hasAbsolute: alt.hasAbsolute,
                        reason: 'marketing_rejected'
                    };
                }
                
                // Si pas d'alternative, marquer comme 'other'
                return {
                    category: 'other',
                    score: 0,
                    confidence: 0,
                    matchedPatterns: [],
                    hasAbsolute: false,
                    reason: 'weak_marketing'
                };
            }
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
    // MOTS-CLÉS TRÈS SPÉCIFIQUES
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    // TRÈS SPÉCIFIQUES seulement
                    'unsubscribe', 'se désabonner', 'désabonner',
                    'opt-out', 'opt out', 'se désinscrire',
                    'email preferences', 'préférences email',
                    'mailing list', 'liste de diffusion',
                    'newsletter', 'infolettre',
                    'promotional email', 'email promotionnel',
                    'marketing email', 'this email was sent to',
                    'you are receiving this because'
                ],
                strong: [
                    'promotion', 'offre spéciale', 'soldes',
                    'exclusive offer', 'limited time'
                ],
                weak: ['discover', 'nouveau', 'new'],
                exclusions: [
                    'facture', 'invoice', 'commande', 'order', 
                    'paiement', 'payment', 'urgent', 'action required',
                    'meeting', 'réunion', 'ticket', 'support'
                ]
            },

            security: {
                absolute: [
                    'security alert', 'alerte sécurité', 'alerte de sécurité',
                    'login alert', 'nouvelle connexion', 'new sign-in',
                    'verification code', 'code de vérification',
                    'two-factor', '2fa', 'authentification à deux facteurs',
                    'password reset', 'réinitialisation mot de passe',
                    'suspicious activity', 'activité suspecte',
                    'unauthorized access', 'accès non autorisé',
                    'security breach', 'violation de sécurité'
                ],
                strong: [
                    'sécurité', 'security', 'authentification', 'authentication',
                    'password', 'mot de passe', 'verify', 'vérification'
                ],
                weak: ['compte', 'account', 'login', 'connexion'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'facture n°', 'invoice number',
                    'payment due', 'paiement dû', 'payment required',
                    'remboursement', 'refund', 'order confirmation',
                    'confirmation de commande', 'receipt',
                    'transaction completed', 'bank statement',
                    'billing statement', 'relevé bancaire'
                ],
                strong: [
                    'montant', 'amount', 'total', 'commande', 'order',
                    'achat', 'purchase', 'billing', 'facturation'
                ],
                weak: ['euro', 'dollar', 'price', 'prix'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'urgent action', 'urgence', 'urgent',
                    'deadline approaching', 'échéance proche',
                    'please complete', 'veuillez compléter',
                    'approval needed', 'approbation requise',
                    'response required', 'réponse requise',
                    'task assigned', 'tâche assignée'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'deadline'
                ],
                weak: ['important', 'nécessaire', 'required'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            meetings: {
                absolute: [
                    'meeting request', 'demande de réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'calendar invitation', 'invitation calendrier',
                    'rendez-vous confirmé', 'appointment confirmed'
                ],
                strong: [
                    'meeting', 'réunion', 'appointment', 'rendez-vous',
                    'conference', 'conférence', 'agenda'
                ],
                weak: ['schedule', 'planifier', 'disponible'],
                exclusions: ['newsletter', 'promotion']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'quote request',
                    'proposition commerciale', 'business proposal',
                    'contract signed', 'contrat signé',
                    'sales opportunity', 'opportunité commerciale'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'commercial',
                    'business', 'vente', 'sales', 'deal'
                ],
                weak: ['opportunity', 'projet', 'discussion'],
                exclusions: ['newsletter', 'marketing']
            },

            project: {
                absolute: [
                    'project update', 'mise à jour projet',
                    'milestone reached', 'milestone atteint',
                    'sprint completed', 'sprint terminé',
                    'deliverable ready', 'livrable prêt'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'deliverable', 'livrable', 'roadmap'
                ],
                weak: ['development', 'phase', 'étape'],
                exclusions: ['newsletter', 'personnel']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'pay slip',
                    'contrat de travail', 'employment contract',
                    'congés approuvés', 'leave approved',
                    'performance review', 'entretien annuel'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary', 'pay',
                    'ressources humaines', 'employee'
                ],
                weak: ['staff', 'personnel', 'équipe'],
                exclusions: ['newsletter', 'externe']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'case #',
                    'support ticket', 'ticket resolved',
                    'incident closed', 'problem solved'
                ],
                strong: [
                    'support', 'assistance', 'ticket', 'incident',
                    'help', 'aide', 'problem'
                ],
                weak: ['question', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },

            reminders: {
                absolute: [
                    'reminder', 'rappel', 'follow-up',
                    'gentle reminder', 'rappel amical',
                    'pending response', 'réponse en attente'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'pending',
                    'waiting', 'en attente'
                ],
                weak: ['suite', 'encore'],
                exclusions: ['newsletter', 'marketing']
            },

            internal: {
                absolute: [
                    'company announcement', 'annonce entreprise',
                    'internal memo', 'note de service',
                    'all employees', 'tout le personnel'
                ],
                strong: [
                    'internal', 'interne', 'company', 'entreprise',
                    'announcement', 'annonce'
                ],
                weak: ['information', 'update'],
                exclusions: ['externe', 'client', 'newsletter']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply',
                    'automated message', 'message automatique',
                    'system notification', 'auto-generated'
                ],
                strong: [
                    'automated', 'automatique', 'notification',
                    'system', 'système'
                ],
                weak: ['info', 'update'],
                exclusions: ['urgent', 'action required']
            },

            cc: {
                absolute: [
                    'for your information', 'pour information',
                    'fyi', 'en copie', 'courtesy copy'
                ],
                strong: ['information', 'copie', 'fyi'],
                weak: ['info'],
                exclusions: ['urgent', 'action', 'facture']
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés spécifiques initialisés');
    }

    // ================================================
    // RECHERCHE TEXTE OPTIMISÉE
    // ================================================
    fastTextSearch(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        const normalizedText = text.toLowerCase();
        
        // Recherche exacte d'abord
        if (normalizedText.includes(normalizedKeyword)) {
            // Vérifier les word boundaries pour les mots courts
            if (normalizedKeyword.length <= 4) {
                const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`);
                return regex.test(normalizedText);
            }
            return true;
        }
        
        return false;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ================================================
    // DÉTECTIONS SPÉCIALISÉES
    // ================================================
    hasPersonalContent(text) {
        const personalKeywords = ['papa', 'maman', 'bises', 'bisous', 'famille', 'chéri', 'chérie'];
        return personalKeywords.some(keyword => text.includes(keyword));
    }

    isProfessionalCategory(categoryId) {
        return ['internal', 'hr', 'meetings', 'commercial', 'project', 'tasks'].includes(categoryId);
    }

    isPersonalEmail(content) {
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille', 'chéri', 'chérie'];
        const text = content.text;
        
        let personalScore = 0;
        for (const indicator of personalIndicators) {
            if (text.includes(indicator)) {
                personalScore += 15;
            }
        }
        
        return personalScore >= 30;
    }

    analyzeCC(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (isInCC && !isMainRecipient) {
            // Vérifier si c'est vraiment du marketing
            if (this.isObviousMarketing(content)) {
                return {
                    category: 'marketing_news',
                    score: 90,
                    confidence: 0.85,
                    isCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                isCC: true
            };
        }
        
        return null;
    }

    isObviousMarketing(content) {
        const strongMarketingKeywords = [
            'unsubscribe', 'désabonner', 'newsletter', 'mailing list',
            'email preferences', 'promotional email', 'marketing email',
            'opt-out', 'this email was sent to'
        ];
        
        let marketingScore = 0;
        for (const keyword of strongMarketingKeywords) {
            if (content.text.includes(keyword.toLowerCase())) {
                marketingScore += 25;
            }
        }
        
        return marketingScore >= 50; // Seuil élevé
    }

    isMainRecipient(email) {
        return email.toRecipients && Array.isArray(email.toRecipients) && email.toRecipients.length > 0;
    }

    isInCC(email) {
        return email.ccRecipients && Array.isArray(email.ccRecipients) && email.ccRecipients.length > 0;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 25) return 0.50;
        return 0.40;
    }

    isSpamEmail(email) {
        if (email.parentFolderId?.toLowerCase().includes('junk')) return true;
        if (email.categories?.some(cat => cat.toLowerCase().includes('spam'))) return true;
        return false;
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains?.length) {
            return exclusions.domains.some(domain => content.domain.includes(domain.toLowerCase()));
        }
        return false;
    }

    // ================================================
    // CACHE OPTIMISÉ
    // ================================================
    createCacheKey(email) {
        const key = `${email.from?.emailAddress?.address || ''}|${(email.subject || '').substring(0, 20)}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getCachedAnalysis(email) {
        const key = this.createCacheKey(email);
        const cached = this.analysisCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            return cached.result;
        }
        
        return null;
    }

    setCachedAnalysis(email, result) {
        const key = this.createCacheKey(email);
        
        if (this.analysisCache.size >= this.cacheMaxSize) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
        
        this.analysisCache.set(key, {
            result: {
                category: result.category,
                score: result.score,
                confidence: result.confidence,
                hasAbsolute: result.hasAbsolute
            },
            timestamp: Date.now()
        });
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
