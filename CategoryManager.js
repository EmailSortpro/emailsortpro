// CategoryManager.js - Version 24.0 - ULTRA-RAPIDE avec toutes catégories fonctionnelles 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // CACHE HAUTE PERFORMANCE
        this.analysisCache = new Map();
        this.cacheMaxSize = 10000;
        this.cacheTTL = 300000; // 5 minutes
        this.cacheStats = { hits: 0, misses: 0 };
        
        // REGEX PRE-COMPILÉES POUR VITESSE MAXIMALE
        this.compiledPatterns = new Map();
        this.textNormalizer = this.createTextNormalizer();
        
        // Système de synchronisation optimisé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 24.0 - ULTRA-RAPIDE avec toutes catégories');
    }

    // ================================================
    // EXTRACTION DE CONTENU ULTRA-OPTIMISÉE
    // ================================================
    extractCompleteContent(email) {
        const parts = [];
        
        // Sujet avec pondération élevée
        if (email.subject?.trim()) {
            parts.push(email.subject.repeat(3));
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address.repeat(2));
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

    // ================================================
    // MÉTHODES DE NORMALISATION ULTRA-RAPIDES
    // ================================================
    createTextNormalizer() {
        return {
            spaces: /\s+/g,
            html: /<[^>]+>/g,
            punctuation: /[^\w\s\-\%àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/g
        };
    }

    fastNormalize(text) {
        if (!text) return '';
        
        return text.toLowerCase()
            .replace(this.textNormalizer.html, ' ')
            .replace(this.textNormalizer.spaces, ' ')
            .trim();
    }

    fastHtmlClean(html) {
        if (!html) return '';
        
        // Nettoyage ultra-rapide
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
    // ANALYSE EMAIL ULTRA-OPTIMISÉE - TOUTES CATÉGORIES
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Vérifier le cache en premier
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
        
        // Extraction de contenu RAPIDE
        const content = this.extractCompleteContent(email);
        
        // Vérifications d'exclusion
        if (this.isGloballyExcluded(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Détection personnelle AVANT tout
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
        
        // Analyse CC rapide
        const ccResult = this.analyzeCC(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // Analyse des catégories OPTIMISÉE
        const result = this.analyzeAllCategoriesOptimized(content, email);
        
        // Cache du résultat
        this.setCachedAnalysis(email, result);
        return result;
    }

    // ================================================
    // ANALYSE TOUTES CATÉGORIES ULTRA-OPTIMISÉE
    // ================================================
    analyzeAllCategoriesOptimized(content, email) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // IMPORTANT: Analyser TOUTES les catégories sans arrêt anticipé
        for (const categoryId of activeCategories) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScoreOptimized(content, keywords, categoryId);
            
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
        
        return this.selectBestCategoryOptimized(results);
    }

    // ================================================
    // CALCUL DE SCORE ULTRA-OPTIMISÉ
    // ================================================
    calculateScoreOptimized(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Bonus de catégorie
        const categoryBonus = this.getCategoryBonus(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // Pénalité pour contenu personnel dans catégories pro
        if (this.hasPersonalContent(text) && this.isProfessionalCategory(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_penalty', type: 'penalty', score: -50 });
        }
        
        // Test exclusions (arrêt rapide)
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.fastTextSearch(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Test mots-clés absolus (priorité maximale)
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus sujet
                    if (this.fastTextSearch(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Test mots-clés forts
        if (keywords.strong?.length) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 40;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    if (strongMatches >= 3) break; // Limite pour performance
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
            }
        }
        
        // Test mots-clés faibles (limité pour performance)
        if (!hasAbsolute && totalScore < 100 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 10)) { // Limite à 10
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                    
                    if (weakMatches >= 5) break; // Limite pour performance
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
    // RECHERCHE TEXTE ULTRA-RAPIDE
    // ================================================
    fastTextSearch(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        
        // Recherche directe la plus rapide
        if (text.includes(normalizedKeyword)) return true;
        
        // Recherche avec word boundaries pour les mots courts
        if (normalizedKeyword.length <= 3) {
            const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            return regex.test(text);
        }
        
        return false;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ================================================
    // SÉLECTION OPTIMISÉE DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategoryOptimized(results) {
        const MIN_SCORE_THRESHOLD = 25;
        const MIN_CONFIDENCE_THRESHOLD = 0.4;
        
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
        
        // Tri optimisé
        validResults.sort((a, b) => {
            // Priorité absolue
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            // Puis priorité catégorie
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            // Puis score
            return b.score - a.score;
        });
        
        const best = validResults[0];
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES RAPIDES
    // ================================================
    getCategoryBonus(categoryId) {
        const bonuses = {
            'security': 15,
            'finance': 15,
            'tasks': 20,
            'meetings': 15,
            'commercial': 15,
            'project': 15,
            'hr': 15,
            'marketing_news': 10,
            'reminders': 10,
            'support': 10,
            'internal': 10,
            'notifications': 5,
            'cc': 5
        };
        return bonuses[categoryId] || 0;
    }

    hasPersonalContent(text) {
        const personalKeywords = ['papa', 'maman', 'bises', 'bisous', 'famille'];
        return personalKeywords.some(keyword => text.includes(keyword));
    }

    isProfessionalCategory(categoryId) {
        return ['internal', 'hr', 'meetings', 'commercial', 'project'].includes(categoryId);
    }

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    // ================================================
    // DÉTECTIONS SPÉCIALISÉES RAPIDES
    // ================================================
    isPersonalEmail(content) {
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille', 'chéri', 'chérie'];
        const text = content.text;
        
        let personalScore = 0;
        for (const indicator of personalIndicators) {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        }
        
        return personalScore >= 20;
    }

    analyzeCC(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (isInCC && !isMainRecipient) {
            // Vérifier d'abord si c'est du marketing
            if (this.isObviousMarketing(content)) {
                return {
                    category: 'marketing_news',
                    score: 100,
                    confidence: 0.90,
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
        const marketingKeywords = [
            'unsubscribe', 'désabonner', 'newsletter', 'promotion', 
            'marketing', 'mailing', 'campaign', 'offer', 'offre'
        ];
        
        return marketingKeywords.some(keyword => content.text.includes(keyword));
    }

    isMainRecipient(email) {
        return email.toRecipients && Array.isArray(email.toRecipients) && email.toRecipients.length > 0;
    }

    isInCC(email) {
        return email.ccRecipients && Array.isArray(email.ccRecipients) && email.ccRecipients.length > 0;
    }

    // ================================================
    // CACHE HAUTE PERFORMANCE
    // ================================================
    createCacheKey(email) {
        const key = `${email.from?.emailAddress?.address || ''}|${email.subject || ''}|${(email.bodyPreview || '').substring(0, 50)}`;
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
            result: { ...result },
            timestamp: Date.now()
        });
    }

    // ================================================
    // VÉRIFICATIONS RAPIDES
    // ================================================
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
    // INITIALISATION DES CATÉGORIES OPTIMISÉE
    // ================================================
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
                priority: 80,
                isCustom: false
            },
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 70,
                isCustom: false
            },
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 60,
                isCustom: false
            },
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 55,
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
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 45,
                isCustom: false
            },
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 40,
                isCustom: false
            },
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 35,
                isCustom: false
            },
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 30,
                isCustom: false
            },
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 25,
                isCustom: false
            },
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 20,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // MOTS-CLÉS OPTIMISÉS PAR CATÉGORIE
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'unsubscribe', 'désabonner', 'opt out', 'opt-out',
                    'newsletter', 'mailing list', 'email preferences',
                    'gérer vos préférences', 'ne plus recevoir',
                    'this email was sent to', 'promotional email',
                    'marketing email', 'campaign'
                ],
                strong: [
                    'promo', 'promotion', 'deal', 'offer', 'sale', 'discount',
                    'réduction', 'soldes', 'boutique', 'shopping',
                    'exclusive', 'limited', 'special'
                ],
                weak: ['update', 'news', 'discover', 'new'],
                exclusions: []
            },

            security: {
                absolute: [
                    'security alert', 'alerte sécurité', 'login alert',
                    'nouvelle connexion', 'new sign-in', 'verification code',
                    'code de vérification', 'two-factor', '2fa',
                    'password reset', 'suspicious activity',
                    'activité suspecte'
                ],
                strong: [
                    'sécurité', 'security', 'authentification', 'password',
                    'mot de passe', 'verify', 'vérification'
                ],
                weak: ['compte', 'account', 'login'],
                exclusions: ['newsletter', 'promotion']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'remboursement', 'refund',
                    'order confirmation', 'confirmation commande',
                    'n°commande', 'order number', 'livraison'
                ],
                strong: [
                    'montant', 'amount', 'total', 'commande', 'order',
                    'achat', 'purchase', 'prix', 'price',
                    'livraison', 'delivery', 'shipping'
                ],
                weak: ['euro', 'dollar', 'transaction'],
                exclusions: ['newsletter', 'promotion']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent',
                    'deadline', 'échéance', 'to do', 'task assigned',
                    'please complete', 'veuillez compléter',
                    'validation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'task',
                    'tâche', 'demande', 'request'
                ],
                weak: ['besoin', 'need', 'waiting', 'attente'],
                exclusions: ['newsletter', 'marketing', 'famille']
            },

            meetings: {
                absolute: [
                    'meeting request', 'demande de réunion',
                    'invitation réunion', 'teams meeting',
                    'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'conference'
                ],
                weak: ['agenda', 'disponible', 'available'],
                exclusions: ['newsletter', 'promotion']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'offre commerciale',
                    'opportunity', 'opportunité'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'commercial',
                    'business', 'vente', 'sales', 'deal'
                ],
                weak: ['négociation', 'discussion', 'projet'],
                exclusions: ['newsletter', 'marketing']
            },

            project: {
                absolute: [
                    'project update', 'mise à jour projet',
                    'milestone', 'sprint', 'livrable',
                    'gantt', 'roadmap', 'kickoff'
                ],
                strong: [
                    'projet', 'project', 'développement', 'development',
                    'agile', 'scrum', 'milestone'
                ],
                weak: ['phase', 'étape', 'planning'],
                exclusions: ['newsletter', 'famille']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'performance review',
                    'entretien annuel', 'human resources'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary', 'ressources humaines',
                    'contrat', 'emploi', 'job'
                ],
                weak: ['employee', 'staff', 'personnel'],
                exclusions: ['newsletter', 'famille', 'personnel']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'case #',
                    'support ticket', 'incident', 'helpdesk'
                ],
                strong: [
                    'support', 'assistance', 'help', 'ticket',
                    'problème', 'problem', 'issue'
                ],
                weak: ['question', 'aide'],
                exclusions: ['newsletter', 'promotion']
            },

            reminders: {
                absolute: [
                    'reminder', 'rappel', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'pending'
                ],
                weak: ['encore', 'still', 'previous'],
                exclusions: ['newsletter', 'marketing']
            },

            internal: {
                absolute: [
                    'all staff', 'tout le personnel',
                    'company announcement', 'annonce interne',
                    'memo interne', 'note de service'
                ],
                strong: [
                    'internal', 'interne', 'company', 'entreprise',
                    'annonce', 'announcement'
                ],
                weak: ['information', 'update'],
                exclusions: ['newsletter', 'externe', 'client']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply',
                    'automated message', 'notification automatique'
                ],
                strong: [
                    'automated', 'automatique', 'notification',
                    'alert', 'system'
                ],
                weak: ['info', 'update'],
                exclusions: ['urgent', 'action required']
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information',
                    'fyi', 'en copie', 'cc:'
                ],
                strong: ['information', 'copie', 'copy'],
                weak: ['info'],
                exclusions: ['urgent', 'action required']
            }
        };

        console.log('[CategoryManager] Mots-clés optimisés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // MÉTHODES D'ACCÈS RAPIDES
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
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

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
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

    // ================================================
    // SYSTÈME DE SYNCHRONISATION SIMPLIFIÉ
    // ================================================
    startOptimizedSync() {
        setInterval(() => {
            this.processSettingsChanges();
        }, 5000);
        
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
        console.log(`[CategoryManager] 📢 Notification: ${type}`);
        
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
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
            }
        }
        
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

    // ================================================
    // API PUBLIQUE POUR MISE À JOUR
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings:', newSettings);
        
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
                console.log('[CategoryManager] ✅ Settings chargés');
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 📝 Settings par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement:', error);
            return this.getDefaultSettings();
        }
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

    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde:', error);
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

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
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
                console.log(`[CategoryManager] ✅ Catégorie "${category.name}": ${totalKeywords} mots-clés`);
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories:', error);
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

        console.log('[CategoryManager] Catégorie créée:', category);
        return category;
    }

    updateCategoryKeywords(categoryId, keywords) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

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

        console.log(`[CategoryManager] Mots-clés mis à jour: ${categoryId}`);
        
        setTimeout(() => {
            this.dispatchEvent('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
        }, 10);
    }

    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie non trouvée');
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

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde:', error);
        }
    }

    getCustomCategories() {
        return { ...this.customCategories };
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
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

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

    // ================================================
    // MÉTHODES DE DEBUG
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
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    getPerformanceStats() {
        return {
            cache: {
                size: this.analysisCache.size,
                hits: this.cacheStats.hits,
                misses: this.cacheStats.misses,
                hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
            },
            compiledPatterns: this.compiledPatterns.size,
            cacheMaxSize: this.cacheMaxSize
        };
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
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

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this.analysisCache.clear();
        this.compiledPatterns.clear();
        
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

// ================================================
// INITIALISATION GLOBALE ULTRA-RAPIDE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création instance ultra-rapide v24.0...');
window.categoryManager = new CategoryManager();

// ================================================
// MÉTHODES DE TEST GLOBALES
// ================================================
window.testCategoryManagerUltraFast = function() {
    console.group('🧪 TEST CategoryManager ULTRA-RAPIDE v24.0');
    
    const tests = [
        { subject: "Newsletter Marketing - Cliquez pour vous désabonner", expected: "marketing_news" },
        { subject: "Action requise: Validation de votre document", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte Microsoft", expected: "security" },
        { subject: "Facture #12345 - Paiement requis sous 7 jours", expected: "finance" },
        { subject: "Invitation Teams - Réunion équipe demain 14h", expected: "meetings" },
        { subject: "Proposition commerciale - Nouveau projet", expected: "commercial" },
        { subject: "Update projet Alpha - Sprint 3 terminé", expected: "project" },
        { subject: "Bulletin de paie - Décembre 2024", expected: "hr" },
        { subject: "Ticket #789 - Problème résolu", expected: "support" },
        { subject: "Rappel: Réponse attendue pour le contrat", expected: "reminders" },
        { subject: "Annonce interne: Nouvelle politique RH", expected: "internal" },
        { subject: "Notification automatique - Ne pas répondre", expected: "notifications" },
        { subject: "Email sans catégorie évidente", expected: "other" }
    ];
    
    const startTime = performance.now();
    
    tests.forEach((test, index) => {
        const result = window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
        
        if (result.category === test.expected) {
            console.log(`✅ Test ${index + 1}: ${test.expected} - OK`);
        } else {
            console.log(`❌ Test ${index + 1}: Expected ${test.expected}, got ${result.category}`);
        }
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`\n⚡ Performance: ${tests.length} tests en ${duration.toFixed(2)}ms`);
    console.log(`📊 Moyenne: ${(duration / tests.length).toFixed(2)}ms par email`);
    
    const stats = window.categoryManager.getPerformanceStats();
    console.log('📈 Stats cache:', stats.cache);
    
    console.groupEnd();
    
    return { 
        success: true, 
        testsRun: tests.length, 
        duration: duration,
        averagePerEmail: duration / tests.length,
        cacheStats: stats.cache
    };
};

window.benchmarkCategoryManager = function(emailCount = 1000) {
    console.log(`🚀 BENCHMARK CategoryManager - ${emailCount} emails`);
    
    const emails = [];
    const subjects = [
        "Newsletter hebdomadaire - Désabonnez-vous",
        "Action requise: Confirmer votre compte",
        "Nouvelle connexion détectée",
        "Facture en attente de paiement",
        "Réunion prévue demain",
        "Proposition commerciale",
        "Update projet important",
        "Bulletin de paie disponible",
        "Ticket support résolu",
        "Rappel important",
        "Annonce interne",
        "Notification système",
        "Email personnel de papa"
    ];
    
    // Générer des emails de test
    for (let i = 0; i < emailCount; i++) {
        emails.push({
            subject: subjects[i % subjects.length] + ` #${i}`,
            body: { content: `Contenu email ${i}` },
            bodyPreview: `Aperçu ${i}`,
            from: { emailAddress: { address: `sender${i}@test.com` } },
            toRecipients: [{ emailAddress: { address: 'user@example.com' } }],
            receivedDateTime: new Date().toISOString()
        });
    }
    
    const startTime = performance.now();
    
    const results = emails.map(email => window.categoryManager.analyzeEmail(email));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const categoryStats = {};
    results.forEach(result => {
        categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
    });
    
    console.log(`✅ ${emailCount} emails analysés en ${duration.toFixed(2)}ms`);
    console.log(`⚡ Performance: ${(emailCount / (duration / 1000)).toFixed(0)} emails/seconde`);
    console.log(`📊 Moyenne: ${(duration / emailCount).toFixed(2)}ms par email`);
    console.log('📈 Répartition:', categoryStats);
    
    const perfStats = window.categoryManager.getPerformanceStats();
    console.log('🎯 Cache hit rate:', perfStats.cache.hitRate.toFixed(1) + '%');
    
    return {
        emailCount,
        duration,
        emailsPerSecond: emailCount / (duration / 1000),
        averagePerEmail: duration / emailCount,
        categoryStats,
        cacheHitRate: perfStats.cache.hitRate
    };
};

console.log('✅ CategoryManager ULTRA-RAPIDE v24.0 loaded!');
console.log('🧪 Fonctions de test disponibles:');
console.log('   - testCategoryManagerUltraFast() : Tests de toutes les catégories');
console.log('   - benchmarkCategoryManager(1000) : Benchmark de performance');
